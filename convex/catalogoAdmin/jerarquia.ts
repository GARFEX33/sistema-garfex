import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { adminAggregateIncomplete, adminDependencyBlocked, adminDuplicateKey, adminInvalidArgument, adminInvalidReference, adminInvalidState } from "./lib/errors";
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
const familiaDetalle = v.object({
  id: v.id("familiasRecurso"),
  claseRecursoId: v.id("clasesRecurso"),
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
const familyPlanAll = "porClaseYClaveYAdminSort";
const familyPlanState = "porActivoYClaseYClaveYAdminSort";
const cursorContext = (mode: "ALL" | "ACTIVE" | "INACTIVE", plan: string, filters: unknown = {}) => ({ filters, mode, plan, order: ORDERING_VERSION });
type Clase = { _id: Id<"clasesRecurso">; clave: string; nombre: string; descripcion?: string; activo: boolean; revision: number };
type Familia = { _id: Id<"familiasRecurso">; claseRecursoId: Id<"clasesRecurso">; clave: string; nombre: string; descripcion?: string; activo: boolean; revision: number };

function toDetail(row: Clase) {
  return { id: row._id, clave: row.clave, nombre: row.nombre, descripcion: row.descripcion, activo: row.activo, revision: row.revision, effective: row.activo, effectiveReasons: row.activo ? [] : ["INACTIVE"] };
}

function toFamilyDetail(row: Familia, classActive: boolean) {
  const effective = row.activo && classActive;
  return { id: row._id, claseRecursoId: row.claseRecursoId, clave: row.clave, nombre: row.nombre, descripcion: row.descripcion, activo: row.activo, revision: row.revision, effective, effectiveReasons: !row.activo ? ["INACTIVE"] : classActive ? [] : ["CLASS_INACTIVE"] };
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

const familyEntity = (id: Id<"familiasRecurso">) => ({ kind: "familiasRecurso" as const, id });
const familyEntityKind = "familiasRecurso" as const;

async function familyTypes(ctx: MutationCtx, familyId: Id<"familiasRecurso">) {
  const types = await ctx.db.query("tiposRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familyId)).take(MAX_CLASS_DESCENDANTS + 1);
  if (types.length > MAX_CLASS_DESCENDANTS) adminInvalidState({ entity: familyEntity(familyId), field: "descendants", reason: "family operation exceeds the bounded descendant limit" });
  return types;
}

async function activeFamilyTypeViolations(ctx: MutationCtx, familyId: Id<"familiasRecurso">) {
  const family = await ctx.db.get(familyId);
  const owner = family ? await ctx.db.get(family.claseRecursoId) : null;
  if (!family) return [];
  if (!owner) adminInvalidReference({ entityKind: familyEntityKind, field: "claseRecursoId", reference: claseEntity(family.claseRecursoId), reason: "class does not exist" });
  if (!owner!.activo) return [];
  const types = await familyTypes(ctx, familyId);
  return types.filter(type => type.activo && (!positiveRevision(type.revision) || type.familiaRecursoId !== familyId)).map(type => ({ code: "HIERARCHY_REFERENCE_INVALID" as const, entity: { kind: "tiposRecurso" as const, id: type._id }, detail: "active type has an invalid hierarchy reference" }));
}

async function familyDeactivationBlocker(ctx: MutationCtx, familyId: Id<"familiasRecurso">) {
  const family = await ctx.db.get(familyId);
  if (family && !(await ctx.db.get(family.claseRecursoId))) adminInvalidReference({ entityKind: familyEntityKind, field: "claseRecursoId", reference: claseEntity(family.claseRecursoId), reason: "class does not exist" });
  const types = await familyTypes(ctx, familyId);
  for (const type of types) {
    if (type.activo) return { relationKind: "active-type", blocker: { kind: "tiposRecurso" as const, id: type._id } };
    const resources = await ctx.db.query("recursos").withIndex("porTipoYActivo", q => q.eq("tipoRecursoId", type._id).eq("activo", true)).take(1);
    if (resources[0]) return { relationKind: "active-resource", blocker: { kind: "recursos" as const, id: resources[0]._id } };
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

const familyCreateArgs = { claseRecursoId: v.id("clasesRecurso"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()), activo: v.optional(v.boolean()) };

export const crearFamilia = mutation({
  args: familyCreateArgs,
  returns: createResultValidator(familiaDetalle),
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.claseRecursoId);
    if (!owner) adminInvalidReference({ entityKind: familyEntityKind, field: "claseRecursoId", reason: "class does not exist" });
    const clave = normalizedKey(args.clave), nombre = normalizedName(args.nombre);
    const existing = await ctx.db.query("familiasRecurso").withIndex("porClaseYClave", q => q.eq("claseRecursoId", args.claseRecursoId).eq("clave", clave)).first();
    if (existing) adminDuplicateKey({ entityKind: familyEntityKind, key: clave, scope: args.claseRecursoId });
    const id = await ctx.db.insert("familiasRecurso", { claseRecursoId: args.claseRecursoId, clave, nombre, descripcion: args.descripcion === undefined ? undefined : normalizeText(args.descripcion), activo: args.activo ?? false, revision: 1 });
    await ctx.db.patch(id, { adminSortId: id });
    const item = (await ctx.db.get(id))!;
    return { disposition: "CREATED" as const, item: toFamilyDetail(item, owner!.activo) };
  },
});

export const actualizarFamilia = mutation({
  args: { familiaRecursoId: v.id("familiasRecurso"), expectedRevision: v.number(), claseRecursoId: v.optional(v.id("clasesRecurso")), clave: v.optional(v.string()), nombre: v.optional(v.string()), descripcion: v.optional(v.string()) },
  returns: changeResultValidator(familiaDetalle),
  handler: async (ctx, args) => {
    const result = await applyRevisionedUpdate<Familia, typeof args, Record<string, string>>({
      load: () => ctx.db.get(args.familiaRecursoId), expectedRevision: args.expectedRevision, entity: familyEntity(args.familiaRecursoId), immutable: { claseRecursoId: args.claseRecursoId, clave: args.clave }, changes: args,
      normalize: changes => ({ ...(changes.nombre === undefined ? {} : { nombre: normalizedName(changes.nombre) }), ...(changes.descripcion === undefined ? {} : { descripcion: normalizeText(changes.descripcion) }) }),
      current: record => ({ ...(args.nombre === undefined ? {} : { nombre: normalizeText(record.nombre) }), ...(args.descripcion === undefined ? {} : { descripcion: normalizeText(record.descripcion ?? "") }) }),
      patch: next => ctx.db.patch(next._id, { ...(args.nombre === undefined ? {} : { nombre: next.nombre }), ...(args.descripcion === undefined ? {} : { descripcion: next.descripcion }), revision: next.revision }),
    });
    const owner = await ctx.db.get(result.item.claseRecursoId);
    return { disposition: result.disposition, item: toFamilyDetail(result.item, !!owner?.activo) };
  },
});

export const activarFamilia = mutation({
  args: { familiaRecursoId: v.id("familiasRecurso"), expectedRevision: v.number() },
  returns: changeResultValidator(familiaDetalle),
  handler: async (ctx, args) => {
    const result = await applyLifecycleChange<Familia>({
      load: () => ctx.db.get(args.familiaRecursoId), expectedRevision: args.expectedRevision, entity: familyEntity(args.familiaRecursoId), targetActive: true,
      validate: async () => { const violations = await activeFamilyTypeViolations(ctx, args.familiaRecursoId); if (violations.length) adminAggregateIncomplete({ entity: familyEntity(args.familiaRecursoId), violations }); },
      patch: next => ctx.db.patch(next._id, { activo: true, revision: next.revision }),
    });
    const owner = await ctx.db.get(result.item.claseRecursoId);
    return { disposition: result.disposition, item: toFamilyDetail(result.item, !!owner?.activo) };
  },
});

export const desactivarFamilia = mutation({
  args: { familiaRecursoId: v.id("familiasRecurso"), expectedRevision: v.number() },
  returns: changeResultValidator(familiaDetalle),
  handler: async (ctx, args) => {
    const result = await applyLifecycleChange<Familia>({
      load: () => ctx.db.get(args.familiaRecursoId), expectedRevision: args.expectedRevision, entity: familyEntity(args.familiaRecursoId), targetActive: false,
      validate: async () => { const blocker = await familyDeactivationBlocker(ctx, args.familiaRecursoId); if (blocker) adminDependencyBlocked({ entity: familyEntity(args.familiaRecursoId), ...blocker }); },
      patch: next => ctx.db.patch(next._id, { activo: false, revision: next.revision }),
    });
    const owner = await ctx.db.get(result.item.claseRecursoId);
    return { disposition: result.disposition, item: toFamilyDetail(result.item, !!owner?.activo) };
  },
});

export const obtenerFamilia = query({
  args: { familiaRecursoId: v.id("familiasRecurso") },
  returns: v.union(familiaDetalle, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.familiaRecursoId);
    if (!row) return null;
    const owner = await ctx.db.get(row.claseRecursoId);
    return toFamilyDetail(row, !!owner?.activo);
  },
});

export const listarFamilias = query({
  args: { claseRecursoId: v.optional(v.id("clasesRecurso")), cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()), modo: v.optional(lifecycleFilterValidator) },
  returns: adminPageValidator(familiaDetalle),
  handler: async (ctx, args) => {
    const mode = args.modo ?? "ALL", classId = args.claseRecursoId;
    const plan = mode === "ALL" ? familyPlanAll : familyPlanState;
    const filters = { claseRecursoId: classId ?? null };
    const nativeCursor = await consumeCursor(args.cursor ?? null, cursorContext(mode, plan, filters));
    const pageSize = validatePageSize(args.pageSize);
    const indexed = mode === "ALL"
      ? ctx.db.query("familiasRecurso").withIndex(familyPlanAll, q => classId === undefined ? q : q.eq("claseRecursoId", classId)).order("asc")
      : ctx.db.query("familiasRecurso").withIndex(familyPlanState, q => { let x = q.eq("activo", mode === "ACTIVE"); return classId === undefined ? x : x.eq("claseRecursoId", classId); }).order("asc");
    const page = await indexed.paginate({ numItems: pageSize, cursor: nativeCursor });
    const items = await Promise.all((page.page as Familia[]).map(async row => {
      const owner = await ctx.db.get(row.claseRecursoId);
      return toFamilyDetail(row, Boolean(owner?.activo));
    }));
    return { items, continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, cursorContext(mode, plan, filters)), isExhausted: page.isDone };
  },
});
