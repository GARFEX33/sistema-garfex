import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { adminAggregateIncomplete, adminConflict, adminDuplicateKey, adminInvalidReference, adminInvalidState } from "./lib/errors";
import { applyLifecycleChange, applyRevisionedUpdate } from "./lib/revisions";
import { adminPageValidator, changeResultValidator, createResultValidator, lifecycleFilterValidator } from "./validators";
import { consumeCursor, createCursor, ORDERING_VERSION, validatePageSize } from "./lib/pagination";
import { MAX_AGGREGATE_ROWS } from "./lib/cargarAgregado";
import { detectarConflictosReglas, type ReglaCondicional } from "../../src/catalogoRecursos/dominio/reglasCondicionales";

const applicability = v.union(v.literal("REQUIRED"), v.literal("OPTIONAL"), v.literal("FORBIDDEN"), v.literal("NOT_APPLICABLE"), v.literal("CONDITIONAL"));
const detail = v.object({
  id: v.id("reglasAtributoRecurso"), tipoRecursoId: v.id("tiposRecurso"), atributoCondicionId: v.id("atributosRecurso"), opcionCondicionId: v.optional(v.id("opcionesAtributo")), atributoAfectadoId: v.id("atributosRecurso"), aplicabilidad: applicability,
  activo: v.boolean(), revision: v.number(), effective: v.boolean(), effectiveReasons: v.array(v.string()),
});
const entity = (id: Id<"reglasAtributoRecurso">) => ({ kind: "reglasAtributoRecurso" as const, id });
type Rule = Doc<"reglasAtributoRecurso">;
type Db = Pick<QueryCtx, "db">;
const context = (mode: "ALL" | "ACTIVE" | "INACTIVE", filters: unknown) => ({ mode, plan: "porTipoYCondicionYOpcionYAfectadoYAdminSort", filters, order: ORDERING_VERSION });

async function scope(ctx: Db, typeId: Id<"tiposRecurso">) {
  const type = await ctx.db.get(typeId); const family = type ? await ctx.db.get(type.familiaRecursoId) : null;
  if (!type || !family) adminInvalidReference({ entityKind: "reglasAtributoRecurso", field: "tipoRecursoId", reason: "type does not exist" });
  const rows = await ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family!._id)).take(MAX_AGGREGATE_ROWS + 1);
  const byDefinition = new Map<string, typeof rows[number]>();
  for (const row of rows) if (row.tipoRecursoId === undefined) byDefinition.set(String(row.definicionAtributoId), row);
  for (const row of rows) if (row.tipoRecursoId === typeId) byDefinition.set(String(row.definicionAtributoId), row);
  const selected = new Map([...byDefinition.values()].map(row => [String(row._id), row] as const));
  return { type: type!, family: family!, selected };
}

async function validateReferences(ctx: MutationCtx, rule: Pick<Rule, "tipoRecursoId" | "atributoCondicionId" | "opcionCondicionId" | "atributoAfectadoId">, requireActiveOption = false) {
  const owner = await scope(ctx, rule.tipoRecursoId);
  const condition = owner.selected.get(String(rule.atributoCondicionId));
  const affected = owner.selected.get(String(rule.atributoAfectadoId));
  if (!condition) adminInvalidReference({ entityKind: "reglasAtributoRecurso", field: "atributoCondicionId", reference: { kind: "atributosRecurso", id: rule.atributoCondicionId }, reason: "assignment is not selected for the type" });
  if (!affected) adminInvalidReference({ entityKind: "reglasAtributoRecurso", field: "atributoAfectadoId", reference: { kind: "atributosRecurso", id: rule.atributoAfectadoId }, reason: "assignment is not selected for the type" });
  if (rule.atributoCondicionId === rule.atributoAfectadoId) adminInvalidState({ field: "atributoAfectadoId", reason: "a rule cannot target its condition assignment" });
  if (rule.opcionCondicionId !== undefined) {
    const definition = await ctx.db.get(condition!.definicionAtributoId);
    const option = await ctx.db.get(rule.opcionCondicionId);
    if (!definition || definition.tipoDato !== "OPCION" || !option || option.definicionAtributoId !== definition._id)
      adminInvalidReference({ entityKind: "reglasAtributoRecurso", field: "opcionCondicionId", reference: { kind: "opcionesAtributo", id: rule.opcionCondicionId }, reason: "option must belong to an OPCION condition definition" });
    if (requireActiveOption && !option!.activo) adminInvalidReference({ entityKind: "reglasAtributoRecurso", field: "opcionCondicionId", reference: { kind: "opcionesAtributo", id: rule.opcionCondicionId }, reason: "condition option must be active" });
  }
  return owner;
}

function domain(row: Rule): ReglaCondicional { return { id: String(row._id), atributoCondicionId: String(row.atributoCondicionId), opcionCondicionId: row.opcionCondicionId === undefined ? undefined : String(row.opcionCondicionId), atributoAfectadoId: String(row.atributoAfectadoId), aplicabilidad: row.aplicabilidad, activo: row.activo }; }

async function validateSet(ctx: MutationCtx, typeId: Id<"tiposRecurso">, candidate?: Rule) {
  const rows = await ctx.db.query("reglasAtributoRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const all = candidate ? [...rows.filter(row => row._id !== candidate._id), candidate] : rows;
  const conflict = detectarConflictosReglas(all.map(domain)).find(Boolean);
  if (conflict) adminConflict({ entity: candidate ? entity(candidate._id) : { kind: "tiposRecurso", id: typeId }, conflictKind: "conditional-rule-result", conflictingEntity: { kind: "reglasAtributoRecurso", id: (all.find(row => String(row._id) === conflict.secondRuleId) ?? all[0])._id }, normalizedIdentity: conflict.affectedId });
}

async function item(ctx: Db, row: Rule) {
  let effective = false; const reasons: string[] = [];
  const owner = await scope(ctx, row.tipoRecursoId);
  const condition = owner.selected.get(String(row.atributoCondicionId)); const affected = owner.selected.get(String(row.atributoAfectadoId));
  const family = owner.family; const clazz = await ctx.db.get(family.claseRecursoId);
  if (!row.activo) reasons.push("INACTIVE");
  else if (!owner.type.activo || !family.activo || !clazz?.activo) reasons.push("HIERARCHY_INACTIVE");
  else if (!condition || !affected) reasons.push("ASSIGNMENT_INACTIVE");
  else if (!condition.activo || !affected.activo) reasons.push("ASSIGNMENT_INACTIVE");
  else if (!(await ctx.db.get(condition.definicionAtributoId))?.activo || !(await ctx.db.get(affected.definicionAtributoId))?.activo) reasons.push("DEFINITION_INACTIVE");
  else if (row.opcionCondicionId !== undefined && !(await ctx.db.get(row.opcionCondicionId))?.activo) reasons.push("OPTION_INACTIVE");
  else effective = true;
  return { id: row._id, tipoRecursoId: row.tipoRecursoId, atributoCondicionId: row.atributoCondicionId, opcionCondicionId: row.opcionCondicionId, atributoAfectadoId: row.atributoAfectadoId, aplicabilidad: row.aplicabilidad, activo: row.activo, revision: row.revision, effective, effectiveReasons: reasons };
}

async function validateActive(ctx: MutationCtx, row: Rule) { await validateReferences(ctx, row, true); await validateSet(ctx, row.tipoRecursoId, row); }

export const crearReglaAtributo = mutation({
  args: { tipoRecursoId: v.id("tiposRecurso"), atributoCondicionId: v.id("atributosRecurso"), opcionCondicionId: v.optional(v.id("opcionesAtributo")), atributoAfectadoId: v.id("atributosRecurso"), aplicabilidad: applicability, activo: v.optional(v.boolean()) },
  returns: createResultValidator(detail),
  handler: async (ctx, args) => {
    if (args.aplicabilidad === "CONDITIONAL") adminInvalidState({ field: "aplicabilidad", reason: "conditional rules cannot produce CONDITIONAL" });
    await validateReferences(ctx, args);
    const duplicate = await ctx.db.query("reglasAtributoRecurso").withIndex("porTipoYCondicionYOpcionYAfectadoYAdminSort", q => q.eq("tipoRecursoId", args.tipoRecursoId).eq("atributoCondicionId", args.atributoCondicionId).eq("opcionCondicionId", args.opcionCondicionId).eq("atributoAfectadoId", args.atributoAfectadoId)).first();
    if (duplicate) adminDuplicateKey({ entityKind: "reglasAtributoRecurso", normalizedIdentity: `${args.tipoRecursoId}|${args.atributoCondicionId}|${args.opcionCondicionId ?? ""}|${args.atributoAfectadoId}` });
    const id = await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: args.tipoRecursoId, atributoCondicionId: args.atributoCondicionId, opcionCondicionId: args.opcionCondicionId, atributoAfectadoId: args.atributoAfectadoId, aplicabilidad: args.aplicabilidad, activo: args.activo ?? false, revision: 1 });
    await ctx.db.patch(id, { adminSortId: id });
    const row = (await ctx.db.get(id))!;
    if (row.activo) await validateActive(ctx, row);
    return { disposition: "CREATED" as const, item: await item(ctx, row) };
  },
});

export const obtenerReglaAtributo = query({ args: { reglaAtributoRecursoId: v.id("reglasAtributoRecurso") }, returns: v.union(detail, v.null()), handler: async (ctx, args) => { const row = await ctx.db.get(args.reglaAtributoRecursoId); return row ? item(ctx, row) : null; } });

export const listarReglasAtributo = query({
  args: { tipoRecursoId: v.optional(v.id("tiposRecurso")), atributoCondicionId: v.optional(v.id("atributosRecurso")), atributoAfectadoId: v.optional(v.id("atributosRecurso")), opcionCondicionId: v.optional(v.id("opcionesAtributo")), aplicabilidad: v.optional(applicability), cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()), modo: v.optional(lifecycleFilterValidator) },
  returns: adminPageValidator(detail),
  handler: async (ctx, args) => {
    const mode = args.modo ?? "ALL", filters = { tipoRecursoId: args.tipoRecursoId ?? null, atributoCondicionId: args.atributoCondicionId ?? null, atributoAfectadoId: args.atributoAfectadoId ?? null, opcionCondicionId: args.opcionCondicionId ?? null, aplicabilidad: args.aplicabilidad ?? null };
    const cursor = await consumeCursor(args.cursor ?? null, context(mode, filters));
    const page = await ctx.db.query("reglasAtributoRecurso").withIndex("porTipoYCondicionYOpcionYAfectadoYAdminSort", q => args.tipoRecursoId === undefined ? q : q.eq("tipoRecursoId", args.tipoRecursoId)).order("asc").paginate({ numItems: validatePageSize(args.pageSize), cursor });
    const rows = (page.page as Rule[]).filter(row => (mode === "ALL" || row.activo === (mode === "ACTIVE")) && (args.atributoCondicionId === undefined || row.atributoCondicionId === args.atributoCondicionId) && (args.atributoAfectadoId === undefined || row.atributoAfectadoId === args.atributoAfectadoId) && (args.opcionCondicionId === undefined || row.opcionCondicionId === args.opcionCondicionId) && (args.aplicabilidad === undefined || row.aplicabilidad === args.aplicabilidad));
    return { items: await Promise.all(rows.map(row => item(ctx, row))), continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, context(mode, filters)), isExhausted: page.isDone };
  },
});

export const actualizarReglaAtributo = mutation({
  args: { reglaAtributoRecursoId: v.id("reglasAtributoRecurso"), expectedRevision: v.number(), tipoRecursoId: v.optional(v.id("tiposRecurso")), atributoCondicionId: v.optional(v.id("atributosRecurso")), opcionCondicionId: v.optional(v.union(v.id("opcionesAtributo"), v.null())), atributoAfectadoId: v.optional(v.id("atributosRecurso")), aplicabilidad: v.optional(applicability) },
  returns: changeResultValidator(detail),
  handler: async (ctx, args) => { const result = await applyRevisionedUpdate<Rule, typeof args, { aplicabilidad?: Rule["aplicabilidad"] }>({ load: () => ctx.db.get(args.reglaAtributoRecursoId), expectedRevision: args.expectedRevision, entity: entity(args.reglaAtributoRecursoId), immutable: { tipoRecursoId: args.tipoRecursoId, atributoCondicionId: args.atributoCondicionId, opcionCondicionId: args.opcionCondicionId === null ? undefined : args.opcionCondicionId, atributoAfectadoId: args.atributoAfectadoId }, changes: args, normalize: changes => changes.aplicabilidad === undefined ? {} : { aplicabilidad: changes.aplicabilidad }, current: row => args.aplicabilidad === undefined ? {} : { aplicabilidad: row.aplicabilidad }, validate: async next => { if (next.aplicabilidad === "CONDITIONAL") adminInvalidState({ entity: entity(next._id), field: "aplicabilidad", reason: "conditional rules cannot produce CONDITIONAL" }); if (next.activo) await validateActive(ctx, next); }, patch: next => ctx.db.patch(next._id, { aplicabilidad: next.aplicabilidad, revision: next.revision }) }); return { disposition: result.disposition, item: await item(ctx, result.item) }; },
});

export const activarReglaAtributo = mutation({ args: { reglaAtributoRecursoId: v.id("reglasAtributoRecurso"), expectedRevision: v.number() }, returns: changeResultValidator(detail), handler: async (ctx, args) => { const result = await applyLifecycleChange<Rule>({ load: () => ctx.db.get(args.reglaAtributoRecursoId), expectedRevision: args.expectedRevision, entity: entity(args.reglaAtributoRecursoId), targetActive: true, validate: next => validateActive(ctx, next), patch: next => ctx.db.patch(next._id, { activo: true, revision: next.revision }) }); return { disposition: result.disposition, item: await item(ctx, result.item) }; } });
export const desactivarReglaAtributo = mutation({ args: { reglaAtributoRecursoId: v.id("reglasAtributoRecurso"), expectedRevision: v.number() }, returns: changeResultValidator(detail), handler: async (ctx, args) => { const result = await applyLifecycleChange<Rule>({ load: () => ctx.db.get(args.reglaAtributoRecursoId), expectedRevision: args.expectedRevision, entity: entity(args.reglaAtributoRecursoId), targetActive: false, patch: next => ctx.db.patch(next._id, { activo: false, revision: next.revision }) }); return { disposition: result.disposition, item: await item(ctx, result.item) }; } });
