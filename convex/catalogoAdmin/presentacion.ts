import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { adminAggregateIncomplete, adminConflict, adminInvalidReference, adminInvalidState } from "./lib/errors";
import { applyLifecycleChange, applyRevisionedUpdate, normalizeText } from "./lib/revisions";
import { adminPageValidator, changeResultValidator, createResultValidator, lifecycleFilterValidator } from "./validators";
import { consumeCursor, createCursor, ORDERING_VERSION, validatePageSize } from "./lib/pagination";
import { MAX_AGGREGATE_ROWS } from "./lib/cargarAgregado";
import { resolverAsignaciones, type AsignacionEfectiva } from "../../src/catalogoRecursos/dominio/asignacionesEfectivas";
import { normalizarPoliticaPresentacion, validarEstructuraPresentacion, type ErrorEstructuraPresentacion } from "../../src/catalogoRecursos/dominio/presentacionCanonica";

const token = v.union(
  v.object({ tipo: v.literal("TYPE_NAME") }),
  v.object({ tipo: v.literal("ATTRIBUTE_VALUE"), atributoRecursoId: v.id("atributosRecurso") }),
  v.object({ tipo: v.literal("LITERAL"), texto: v.string() }),
);
const detail = v.object({
  id: v.id("politicasPresentacionCanonica"), tipoRecursoId: v.id("tiposRecurso"), tokens: v.array(token), separador: v.string(), activo: v.boolean(), revision: v.number(), effective: v.boolean(), effectiveReasons: v.array(v.string()), activeSlotOccupied: v.boolean(),
});
type Policy = Doc<"politicasPresentacionCanonica">;
type Token = Policy["tokens"][number];
type Db = Pick<QueryCtx, "db">;
type Assignment = Doc<"atributosRecurso">;
const entity = (id: Id<"politicasPresentacionCanonica">) => ({ kind: "politicasPresentacionCanonica" as const, id });
const typeEntity = (id: Id<"tiposRecurso">) => ({ kind: "tiposRecurso" as const, id });
const cursorContext = (mode: "ALL" | "ACTIVE" | "INACTIVE", filters: unknown) => ({ mode, plan: "porTipoYActivoYAdminSort", filters, order: ORDERING_VERSION });

function structureError(error: ErrorEstructuraPresentacion): never {
  throw adminInvalidState({ field: "tokens", reason: `invalid presentation structure: ${error}` });
}

async function owner(ctx: Db, typeId: Id<"tiposRecurso">) {
  const type = await ctx.db.get(typeId);
  const family = type ? await ctx.db.get(type.familiaRecursoId) : null;
  if (!type || !family) adminInvalidReference({ entityKind: "politicasPresentacionCanonica", field: "tipoRecursoId", reference: typeEntity(typeId), reason: "type does not exist" });
  const clazz = await ctx.db.get(family!.claseRecursoId);
  return { type: type!, family: family!, clazz };
}

function assignmentDomain(row: Assignment, definitionKey: string, tipoDato?: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION"): AsignacionEfectiva {
  return { id: String(row._id), familiaId: String(row.familiaRecursoId), tipoId: row.tipoRecursoId === undefined ? undefined : String(row.tipoRecursoId), definicionId: String(row.definicionAtributoId), definicionClave: definitionKey, tipoDato, activo: row.activo, aplicabilidad: row.aplicabilidad, participaIdentidad: row.participaIdentidad, orden: row.orden };
}

async function selectedAssignments(ctx: Db, typeId: Id<"tiposRecurso">) {
  const { type, family } = await owner(ctx, typeId);
  const rows = await ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family._id)).take(MAX_AGGREGATE_ROWS + 1);
  if (rows.length > MAX_AGGREGATE_ROWS) adminInvalidState({ entity: typeEntity(typeId), field: "assignments", reason: "assignment fan-out exceeds the bounded limit" });
  const definitions = new Map<string, Doc<"definicionesAtributo">>();
  for (const row of rows) {
    const definition = await ctx.db.get(row.definicionAtributoId);
    if (definition) definitions.set(String(definition._id), definition);
  }
  const resolution = resolverAsignaciones({
    familia: rows.filter(row => row.tipoRecursoId === undefined).map(row => assignmentDomain(row, definitions.get(String(row.definicionAtributoId))?.clave ?? String(row.definicionAtributoId), definitions.get(String(row.definicionAtributoId))?.tipoDato)),
    tipo: rows.filter(row => row.tipoRecursoId === typeId).map(row => assignmentDomain(row, definitions.get(String(row.definicionAtributoId))?.clave ?? String(row.definicionAtributoId), definitions.get(String(row.definicionAtributoId))?.tipoDato)),
    familiaId: String(family._id), tipoId: String(type._id),
  });
  return { type, family, clazz: (await ctx.db.get(family.claseRecursoId)), resolution, definitions };
}

function normalizedTokens(tokens: readonly Token[]): Token[] {
  return normalizarPoliticaPresentacion({ tipoNombre: "placeholder", tokens: [...tokens] as never[], separador: "-" }).tokens as Token[];
}

async function validateTokens(ctx: MutationCtx, typeId: Id<"tiposRecurso">, tokens: readonly Token[], enforceStructure = false): Promise<Token[]> {
  const normalized = normalizarPoliticaPresentacion({ tipoNombre: "placeholder", tokens: normalizedTokens(tokens) as never[], separador: "-" });
  const structure = validarEstructuraPresentacion(normalized);
  if (structure && (enforceStructure || structure !== "SIN_CONTENIDO_ESTRUCTURAL")) structureError(structure);
  const selected = await selectedAssignments(ctx, typeId);
  const byId = new Map(selected.resolution.selected.map(row => [row.id, row]));
  const result: Token[] = [];
  for (const item of normalized.tokens as Token[]) {
    if (item.tipo !== "ATTRIBUTE_VALUE") { result.push(item); continue; }
    const assignment = byId.get(String(item.atributoRecursoId));
    if (!assignment || !assignment.activo || assignment.aplicabilidad === "FORBIDDEN" || assignment.aplicabilidad === "NOT_APPLICABLE" || !selected.definitions.get(assignment.definicionId)?.activo) {
      adminInvalidReference({ entityKind: "politicasPresentacionCanonica", field: "tokens", reference: { kind: "atributosRecurso", id: item.atributoRecursoId }, reason: "token must reference an active selected value-bearing assignment" });
    }
    result.push(item);
  }
  return result;
}

async function activePolicies(ctx: Db, typeId: Id<"tiposRecurso">, ignore?: Id<"politicasPresentacionCanonica">) {
  const rows = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipoYActivo", q => q.eq("tipoRecursoId", typeId).eq("activo", true)).take(2);
  return rows.filter(row => row._id !== ignore);
}

async function policyItem(ctx: Db, row: Policy) {
  const { type, family, clazz, resolution, definitions } = await selectedAssignments(ctx, row.tipoRecursoId);
  const reasons: string[] = [];
  const structure = validarEstructuraPresentacion({ tokens: row.tokens as never[], separador: row.separador });
  if (!row.activo) reasons.push("INACTIVE");
  else if (!type.activo || !family.activo || !clazz?.activo) reasons.push("HIERARCHY_INACTIVE");
  else if (structure) reasons.push("INVALID_POLICY");
  else {
    const selected = new Map(resolution.selected.map(assignment => [assignment.id, assignment]));
    for (const item of row.tokens) if (item.tipo === "ATTRIBUTE_VALUE") {
      const assignment = selected.get(String(item.atributoRecursoId));
      if (!assignment || !assignment.activo || assignment.aplicabilidad === "FORBIDDEN" || assignment.aplicabilidad === "NOT_APPLICABLE" || !definitions.get(assignment.definicionId)?.activo) { reasons.push("ASSIGNMENT_INACTIVE"); break; }
    }
  }
  const occupied = (await activePolicies(ctx, row.tipoRecursoId, row._id)).length > 0;
  return { id: row._id, tipoRecursoId: row.tipoRecursoId, tokens: row.tokens, separador: row.separador, activo: row.activo, revision: row.revision, effective: row.activo && reasons.length === 0, effectiveReasons: reasons, activeSlotOccupied: occupied };
}

export const crearPoliticaPresentacion = mutation({
  args: { tipoRecursoId: v.id("tiposRecurso"), tokens: v.array(token), separador: v.string(), activo: v.optional(v.boolean()) },
  returns: createResultValidator(detail),
  handler: async (ctx, args) => {
    const normalizedPolicy = normalizarPoliticaPresentacion({ tipoNombre: "placeholder", tokens: args.tokens as never[], separador: args.separador });
    const structure = validarEstructuraPresentacion(normalizedPolicy);
    if (structure && args.activo) structureError(structure);
    const normalizedTokens = await validateTokens(ctx, args.tipoRecursoId, args.tokens, args.activo === true);
    if (args.activo && (await activePolicies(ctx, args.tipoRecursoId)).length) adminConflict({ entity: typeEntity(args.tipoRecursoId), conflictKind: "presentation-active-slot", normalizedIdentity: String(args.tipoRecursoId) });
    const id = await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: args.tipoRecursoId, tokens: normalizedTokens, separador: normalizedPolicy.separador, activo: args.activo ?? false, revision: 1 });
    await ctx.db.patch(id, { adminSortId: id });
    return { disposition: "CREATED" as const, item: await policyItem(ctx, (await ctx.db.get(id))!) };
  },
});

export const obtenerPoliticaPresentacion = query({ args: { politicaPresentacionId: v.id("politicasPresentacionCanonica") }, returns: v.union(detail, v.null()), handler: async (ctx, args) => { const row = await ctx.db.get(args.politicaPresentacionId); return row ? policyItem(ctx, row) : null; } });

export const listarPoliticasPresentacion = query({
  args: { tipoRecursoId: v.optional(v.id("tiposRecurso")), cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()), modo: v.optional(lifecycleFilterValidator) },
  returns: adminPageValidator(detail),
  handler: async (ctx, args) => {
    const mode = args.modo ?? "ALL";
    const filters = { tipoRecursoId: args.tipoRecursoId ?? null };
    const context = cursorContext(mode, filters);
    const cursor = await consumeCursor(args.cursor ?? null, context);
    const page = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipoYActivoYAdminSort", q => args.tipoRecursoId === undefined ? q : q.eq("tipoRecursoId", args.tipoRecursoId)).order("asc").paginate({ numItems: validatePageSize(args.pageSize), cursor });
    const rows = (page.page as Policy[]).filter(row => mode === "ALL" || row.activo === (mode === "ACTIVE"));
    return { items: await Promise.all(rows.map(row => policyItem(ctx, row))), continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, context), isExhausted: page.isDone };
  },
});

export const actualizarPoliticaPresentacion = mutation({
  args: { politicaPresentacionId: v.id("politicasPresentacionCanonica"), expectedRevision: v.number(), tipoRecursoId: v.optional(v.id("tiposRecurso")), tokens: v.optional(v.array(token)), separador: v.optional(v.string()) },
  returns: changeResultValidator(detail),
  handler: async (ctx, args) => {
    const result = await applyRevisionedUpdate<Policy, typeof args, { tokens?: Token[]; separador?: string }>({
      load: () => ctx.db.get(args.politicaPresentacionId), expectedRevision: args.expectedRevision, entity: entity(args.politicaPresentacionId), immutable: { tipoRecursoId: args.tipoRecursoId }, changes: args,
      normalize: changes => ({ ...(changes.tokens === undefined ? {} : { tokens: normalizedTokens(changes.tokens) }), ...(changes.separador === undefined ? {} : { separador: normalizeText(changes.separador) }) }),
      current: row => ({ ...(args.tokens === undefined ? {} : { tokens: normalizedTokens(row.tokens) }), ...(args.separador === undefined ? {} : { separador: normalizeText(row.separador) }) }),
      validate: async next => { const tokens = await validateTokens(ctx, next.tipoRecursoId, next.tokens, next.activo); next.tokens = tokens; if (next.activo && (await activePolicies(ctx, next.tipoRecursoId, next._id)).length) adminConflict({ entity: typeEntity(next.tipoRecursoId), conflictKind: "presentation-active-slot", normalizedIdentity: String(next.tipoRecursoId) }); },
      patch: next => ctx.db.patch(next._id, { tokens: next.tokens, separador: next.separador, revision: next.revision }),
    });
    return { disposition: result.disposition, item: await policyItem(ctx, result.item) };
  },
});

async function validateActivation(ctx: MutationCtx, row: Policy) {
  await validateTokens(ctx, row.tipoRecursoId, row.tokens, true);
  if ((await activePolicies(ctx, row.tipoRecursoId, row._id)).length) adminConflict({ entity: typeEntity(row.tipoRecursoId), conflictKind: "presentation-active-slot", normalizedIdentity: String(row.tipoRecursoId) });
}

export const activarPoliticaPresentacion = mutation({ args: { politicaPresentacionId: v.id("politicasPresentacionCanonica"), expectedRevision: v.number() }, returns: changeResultValidator(detail), handler: async (ctx, args) => { const result = await applyLifecycleChange<Policy>({ load: () => ctx.db.get(args.politicaPresentacionId), expectedRevision: args.expectedRevision, entity: entity(args.politicaPresentacionId), targetActive: true, validate: next => validateActivation(ctx, next), patch: next => ctx.db.patch(next._id, { activo: true, revision: next.revision }) }); return { disposition: result.disposition, item: await policyItem(ctx, result.item) }; } });

export const desactivarPoliticaPresentacion = mutation({ args: { politicaPresentacionId: v.id("politicasPresentacionCanonica"), expectedRevision: v.number() }, returns: changeResultValidator(detail), handler: async (ctx, args) => { const result = await applyLifecycleChange<Policy>({ load: () => ctx.db.get(args.politicaPresentacionId), expectedRevision: args.expectedRevision, entity: entity(args.politicaPresentacionId), targetActive: false, validate: async row => { const { type, family, clazz } = await owner(ctx, row.tipoRecursoId); if (type.activo && family.activo && clazz?.activo && (await activePolicies(ctx, row.tipoRecursoId, row._id)).length === 0) adminAggregateIncomplete({ entity: typeEntity(row.tipoRecursoId), violations: [{ code: "PRESENTATION_COUNT", entity: typeEntity(row.tipoRecursoId), detail: "an effective type requires one active presentation" }] }); }, patch: next => ctx.db.patch(next._id, { activo: false, revision: next.revision }) }); return { disposition: result.disposition, item: await policyItem(ctx, result.item) }; } });
