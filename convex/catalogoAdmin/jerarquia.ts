import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { adminAggregateIncomplete, adminDependencyBlocked, adminDuplicateKey, adminInvalidArgument, adminInvalidState } from "./lib/errors";
import { applyLifecycleChange, applyRevisionedUpdate, normalizeText } from "./lib/revisions";
import { adminPageValidator, changeResultValidator, createResultValidator, lifecycleFilterValidator } from "./validators";
import type { Violation } from "./validators";
import { consumeCursor, createCursor, ORDERING_VERSION, validatePageSize } from "./lib/pagination";

const claseDetalle = v.object({
  id: v.id("clasesRecurso"),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  activo: v.boolean(),
  revision: v.number(),
  effective: v.boolean(),
  effectiveReasons: v.array(v.string()),
});
const planAll = "porClaveYAdminSort";
const planState = "porActivoYClaveYAdminSort";
const cursorContext = (mode: "ALL" | "ACTIVE" | "INACTIVE", plan: string) => ({ filters: {}, mode, plan, order: ORDERING_VERSION });
type Clase = { _id: Id<"clasesRecurso">; clave: string; nombre: string; descripcion?: string; activo: boolean; revision: number };

function toDetail(row: Clase) {
  return { id: row._id, clave: row.clave, nombre: row.nombre, descripcion: row.descripcion, activo: row.activo, revision: row.revision, effective: row.activo, effectiveReasons: row.activo ? [] : ["INACTIVE"] };
}

const claseEntity = (id: Id<"clasesRecurso">) => ({ kind: "clasesRecurso" as const, id });
const MAX_CLASS_DESCENDANTS = 200;
const identificationArgs = { clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()), activo: v.optional(v.boolean()) };

type ClassDoc = Doc<"clasesRecurso">;

function normalizedKey(key: string): string {
  const value = normalizeText(key);
  if (!value) adminInvalidArgument({ field: "clave", reason: "must not be blank" });
  return value;
}

function normalizedName(name: string): string {
  const value = normalizeText(name);
  if (!value) adminInvalidArgument({ field: "nombre", reason: "must not be blank" });
  return value;
}

function positiveRevision(value: number): boolean { return Number.isInteger(value) && value >= 1; }

async function activeClassDescendantViolations(ctx: MutationCtx, classId: Id<"clasesRecurso">) {
  const families = await ctx.db.query("familiasRecurso").withIndex("porClase", q => q.eq("claseRecursoId", classId)).take(MAX_CLASS_DESCENDANTS + 1);
  if (families.length > MAX_CLASS_DESCENDANTS) adminInvalidState({ entity: claseEntity(classId), field: "descendants", reason: "class activation exceeds the bounded descendant limit" });
  const violations: Violation[] = [];
  let descendants = 0;
  for (const family of families) {
    if (!family.activo) continue;
    descendants += 1;
    if (descendants > MAX_CLASS_DESCENDANTS) adminInvalidState({ entity: claseEntity(classId), field: "descendants", reason: "class activation exceeds the bounded descendant limit" });
    if (!positiveRevision(family.revision)) violations.push({ code: "HIERARCHY_REFERENCE_INVALID", entity: { kind: "familiasRecurso", id: family._id }, detail: "active family has an invalid revision" });
    const types = await ctx.db.query("tiposRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family._id)).take(MAX_CLASS_DESCENDANTS + 1);
    if (types.length > MAX_CLASS_DESCENDANTS) adminInvalidState({ entity: claseEntity(classId), field: "descendants", reason: "class activation exceeds the bounded descendant limit" });
    for (const type of types) {
      if (!type.activo) continue;
      descendants += 1;
      if (descendants > MAX_CLASS_DESCENDANTS) adminInvalidState({ entity: claseEntity(classId), field: "descendants", reason: "class activation exceeds the bounded descendant limit" });
      if (!positiveRevision(type.revision) || type.familiaRecursoId !== family._id)
        violations.push({ code: "HIERARCHY_REFERENCE_INVALID", entity: { kind: "tiposRecurso", id: type._id }, detail: "active type has an invalid hierarchy reference" });
    }
  }
  return violations;
}

async function classDeactivationBlocker(ctx: MutationCtx, classId: Id<"clasesRecurso">) {
  const families = await ctx.db.query("familiasRecurso").withIndex("porClase", q => q.eq("claseRecursoId", classId)).take(MAX_CLASS_DESCENDANTS + 1);
  if (families.length > MAX_CLASS_DESCENDANTS) adminInvalidState({ entity: claseEntity(classId), field: "descendants", reason: "class deactivation exceeds the bounded descendant limit" });
  for (const family of families) {
    if (family.activo) return { relationKind: "active-family", blocker: { kind: "familiasRecurso" as const, id: family._id } };
    const types = await ctx.db.query("tiposRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family._id)).take(MAX_CLASS_DESCENDANTS + 1);
    if (types.length > MAX_CLASS_DESCENDANTS) adminInvalidState({ entity: claseEntity(classId), field: "descendants", reason: "class deactivation exceeds the bounded descendant limit" });
    for (const type of types) {
      if (type.activo) return { relationKind: "active-type", blocker: { kind: "tiposRecurso" as const, id: type._id } };
      const resource = await ctx.db.query("recursos").withIndex("porTipoYActivo", q => q.eq("tipoRecursoId", type._id).eq("activo", true)).take(1);
      if (resource[0]) return { relationKind: "active-resource", blocker: { kind: "recursos" as const, id: resource[0]._id } };
    }
  }
  return null;
}

export const crearClase = mutation({
  args: identificationArgs,
  returns: createResultValidator(claseDetalle),
  handler: async (ctx, args) => {
    const clave = normalizedKey(args.clave);
    const nombre = normalizedName(args.nombre);
    const existing = await ctx.db.query("clasesRecurso").withIndex("porClave", q => q.eq("clave", clave)).first();
    if (existing) adminDuplicateKey({ entityKind: "clasesRecurso", key: clave, scope: "global" });
    const id = await ctx.db.insert("clasesRecurso", { clave, nombre, descripcion: args.descripcion === undefined ? undefined : normalizeText(args.descripcion), activo: args.activo ?? false, revision: 1 });
    await ctx.db.patch(id, { adminSortId: id });
    return { disposition: "CREATED" as const, item: toDetail((await ctx.db.get(id))!) };
  },
});

export const actualizarClase = mutation({
  args: { claseRecursoId: v.id("clasesRecurso"), expectedRevision: v.number(), clave: v.optional(v.string()), nombre: v.optional(v.string()), descripcion: v.optional(v.string()) },
  returns: changeResultValidator(claseDetalle),
  handler: async (ctx, args) => {
    const entity = claseEntity(args.claseRecursoId);
    const result = await applyRevisionedUpdate<ClassDoc, typeof args, Record<string, string>>({
      load: () => ctx.db.get(args.claseRecursoId), expectedRevision: args.expectedRevision, entity,
      immutable: { clave: args.clave }, changes: args,
      normalize: changes => ({ ...(changes.nombre === undefined ? {} : { nombre: normalizedName(changes.nombre) }), ...(changes.descripcion === undefined ? {} : { descripcion: normalizeText(changes.descripcion) }) }),
      current: record => ({ ...(args.nombre === undefined ? {} : { nombre: normalizeText(record.nombre) }), ...(args.descripcion === undefined ? {} : { descripcion: normalizeText(record.descripcion ?? "") }) }),
      patch: next => ctx.db.patch(next._id, { ...(args.nombre === undefined ? {} : { nombre: next.nombre }), ...(args.descripcion === undefined ? {} : { descripcion: next.descripcion }), revision: next.revision }),
    });
    return { disposition: result.disposition, item: toDetail(result.item) };
  },
});

export const activarClase = mutation({
  args: { claseRecursoId: v.id("clasesRecurso"), expectedRevision: v.number() },
  returns: changeResultValidator(claseDetalle),
  handler: async (ctx, args) => {
    const result = await applyLifecycleChange<ClassDoc>({
      load: () => ctx.db.get(args.claseRecursoId), expectedRevision: args.expectedRevision, entity: claseEntity(args.claseRecursoId), targetActive: true,
      validate: async () => { const violations = await activeClassDescendantViolations(ctx, args.claseRecursoId); if (violations.length) adminAggregateIncomplete({ entity: claseEntity(args.claseRecursoId), violations }); },
      patch: next => ctx.db.patch(next._id, { activo: true, revision: next.revision }),
    });
    return { disposition: result.disposition, item: toDetail(result.item) };
  },
});

export const desactivarClase = mutation({
  args: { claseRecursoId: v.id("clasesRecurso"), expectedRevision: v.number() },
  returns: changeResultValidator(claseDetalle),
  handler: async (ctx, args) => {
    const result = await applyLifecycleChange<ClassDoc>({
      load: () => ctx.db.get(args.claseRecursoId), expectedRevision: args.expectedRevision, entity: claseEntity(args.claseRecursoId), targetActive: false,
      validate: async () => { const blocker = await classDeactivationBlocker(ctx, args.claseRecursoId); if (blocker) adminDependencyBlocked({ entity: claseEntity(args.claseRecursoId), ...blocker }); },
      patch: next => ctx.db.patch(next._id, { activo: false, revision: next.revision }),
    });
    return { disposition: result.disposition, item: toDetail(result.item) };
  },
});

export const obtenerClase = query({
  args: { claseRecursoId: v.id("clasesRecurso") },
  returns: v.union(claseDetalle, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.claseRecursoId);
    return row ? toDetail(row) : null;
  },
});

export const listarClases = query({
  args: { cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()), modo: v.optional(lifecycleFilterValidator) },
  returns: adminPageValidator(claseDetalle),
  handler: async (ctx, args) => {
    const mode = args.modo ?? "ALL";
    const pageSize = validatePageSize(args.pageSize);
    const plan = mode === "ALL" ? planAll : planState;
    const nativeCursor = await consumeCursor(args.cursor ?? null, cursorContext(mode, plan));
    const indexed = mode === "ALL"
      ? ctx.db.query("clasesRecurso").withIndex(planAll).order("asc")
      : ctx.db.query("clasesRecurso").withIndex(planState, q => q.eq("activo", mode === "ACTIVE")).order("asc");
    const page = await indexed.paginate({ numItems: pageSize, cursor: nativeCursor });
    return {
      items: (page.page as Clase[]).map(toDetail),
      continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, cursorContext(mode, plan)),
      isExhausted: page.isDone,
    };
  },
});
