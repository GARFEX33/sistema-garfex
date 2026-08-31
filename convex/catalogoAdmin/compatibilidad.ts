import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { adminAggregateIncomplete, adminConflict, adminInvalidArgument, adminInvalidReference } from "./lib/errors";
import { applyLifecycleChange, applyRevisionedUpdate } from "./lib/revisions";
import { adminPageValidator, changeResultValidator, createResultValidator, lifecycleFilterValidator } from "./validators";
import { consumeCursor, createCursor, ORDERING_VERSION, validatePageSize } from "./lib/pagination";
import { MAX_AGGREGATE_ROWS } from "./lib/cargarAgregado";
import { politicasCompatibilidadEnConflicto, identidadSlotCompatibilidad } from "../../src/catalogoRecursos/dominio/compatibilidadOpciones";
import { resolverAsignaciones, type AsignacionEfectiva } from "../../src/catalogoRecursos/dominio/asignacionesEfectivas";

const policyMode = v.union(v.literal("ALLOWLIST"), v.literal("DENYLIST"));
const direction = v.union(v.literal("DIRECTIONAL"), v.literal("SYMMETRIC"));
const listMode = v.union(policyMode, lifecycleFilterValidator);
const detail = v.object({
  id: v.id("politicasCompatibilidadOpciones"), tipoRecursoId: v.id("tiposRecurso"), atributoOrigenId: v.id("atributosRecurso"), atributoDestinoId: v.id("atributosRecurso"),
  modo: policyMode, direccion: direction, activo: v.boolean(), revision: v.number(), effective: v.boolean(), effectiveReasons: v.array(v.string()), normalizedIdentity: v.string(),
});
type Policy = Doc<"politicasCompatibilidadOpciones">;
type Db = Pick<QueryCtx, "db">;
type Assignment = Doc<"atributosRecurso">;
type Slot = Pick<Policy, "atributoOrigenId" | "atributoDestinoId" | "direccion">;
const entity = (id: Id<"politicasCompatibilidadOpciones">) => ({ kind: "politicasCompatibilidadOpciones" as const, id });
const typeEntity = (id: Id<"tiposRecurso">) => ({ kind: "tiposRecurso" as const, id });
const context = (mode: "ALL" | "ACTIVE" | "INACTIVE", filters: unknown) => ({ mode, plan: "porTipoYNormalizadosYDireccionYAdminSort", filters, order: ORDERING_VERSION });

function slot(row: Pick<Policy, "atributoOrigenId" | "atributoDestinoId" | "direccion">): Slot { return row; }
function normalized(row: Slot): { origin: string; destination: string; identity: string } {
  const identity = identidadSlotCompatibilidad(String(row.atributoOrigenId), String(row.atributoDestinoId), row.direccion);
  const [, origin, destination] = identity.split("|");
  return { origin, destination, identity };
}

async function assignments(ctx: Db, typeId: Id<"tiposRecurso">) {
  const type = await ctx.db.get(typeId); const family = type ? await ctx.db.get(type.familiaRecursoId) : null; const clazz = family ? await ctx.db.get(family.claseRecursoId) : null;
  if (!type || !family || !clazz || type.familiaRecursoId !== family._id) adminInvalidReference({ entityKind: "politicasCompatibilidadOpciones", field: "tipoRecursoId", reference: typeEntity(typeId), reason: "type hierarchy does not exist" });
  const rows = await ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family!._id)).take(MAX_AGGREGATE_ROWS + 1);
  const definitions = new Map<string, Doc<"definicionesAtributo">>();
  for (const row of rows) { const definition = await ctx.db.get(row.definicionAtributoId); if (definition) definitions.set(String(definition._id), definition); }
  const domain = (row: Assignment): AsignacionEfectiva => ({ id: String(row._id), familiaId: String(row.familiaRecursoId), tipoId: row.tipoRecursoId === undefined ? undefined : String(row.tipoRecursoId), definicionId: String(row.definicionAtributoId), definicionClave: definitions.get(String(row.definicionAtributoId))?.clave ?? String(row.definicionAtributoId), tipoDato: definitions.get(String(row.definicionAtributoId))?.tipoDato, activo: row.activo, aplicabilidad: row.aplicabilidad, participaIdentidad: row.participaIdentidad, orden: row.orden });
  const resolution = resolverAsignaciones({ familia: rows.filter(row => row.tipoRecursoId === undefined).map(domain), tipo: rows.filter(row => row.tipoRecursoId === typeId).map(domain), familiaId: String(family!._id), tipoId: String(typeId) });
  const chosen = new Map<string, Assignment>();
  for (const row of rows) if (row.tipoRecursoId === undefined) chosen.set(String(row.definicionAtributoId), row);
  for (const row of rows) if (row.tipoRecursoId === typeId) chosen.set(String(row.definicionAtributoId), row);
  return { type: type!, family: family!, clazz: clazz!, definitions, chosen, selected: new Map(resolution.selected.map(row => [row.id, row])) };
}

async function validateEndpoints(ctx: MutationCtx, row: Pick<Policy, "tipoRecursoId" | "atributoOrigenId" | "atributoDestinoId">, effective = false) {
  if (row.atributoOrigenId === row.atributoDestinoId) adminInvalidArgument({ field: "atributoDestinoId", reason: "endpoints must be distinct" });
  const owner = await assignments(ctx, row.tipoRecursoId);
  const origin = [...owner.chosen.values()].find(item => item._id === row.atributoOrigenId); const destination = [...owner.chosen.values()].find(item => item._id === row.atributoDestinoId);
  if (!origin) adminInvalidReference({ entityKind: "politicasCompatibilidadOpciones", field: "atributoOrigenId", reference: { kind: "atributosRecurso", id: row.atributoOrigenId }, reason: "origin assignment is not selected for the type" });
  if (!destination) adminInvalidReference({ entityKind: "politicasCompatibilidadOpciones", field: "atributoDestinoId", reference: { kind: "atributosRecurso", id: row.atributoDestinoId }, reason: "destination assignment is not selected for the type" });
  const originDefinition = owner.definitions.get(String(origin!.definicionAtributoId)); const destinationDefinition = owner.definitions.get(String(destination!.definicionAtributoId));
  if (originDefinition?.tipoDato !== "OPCION") adminInvalidReference({ entityKind: "politicasCompatibilidadOpciones", field: "atributoOrigenId", reference: { kind: "atributosRecurso", id: row.atributoOrigenId }, reason: "endpoint assignment must be OPCION" });
  if (destinationDefinition?.tipoDato !== "OPCION") adminInvalidReference({ entityKind: "politicasCompatibilidadOpciones", field: "atributoDestinoId", reference: { kind: "atributosRecurso", id: row.atributoDestinoId }, reason: "endpoint assignment must be OPCION" });
  if (effective && (!origin!.activo || !destination!.activo || !originDefinition?.activo || !destinationDefinition?.activo || !owner.type.activo || !owner.family.activo || !owner.clazz.activo)) adminInvalidReference({ entityKind: "politicasCompatibilidadOpciones", field: "tipoRecursoId", reference: typeEntity(row.tipoRecursoId), reason: "endpoints must be effective option assignments" });
  if (effective) for (const definition of [originDefinition!, destinationDefinition!]) {
    const options = await ctx.db.query("opcionesAtributo").withIndex("porDefinicion", q => q.eq("definicionAtributoId", definition._id)).take(1);
    if (!options.some(option => option.activo)) adminAggregateIncomplete({ entity: typeEntity(row.tipoRecursoId), violations: [{ code: "OPTION_SET_EMPTY", entity: typeEntity(row.tipoRecursoId) }] });
  }
  return { owner, origin: origin!, destination: destination!, originDefinition: originDefinition!, destinationDefinition: destinationDefinition! };
}

async function relationCount(ctx: Db, row: Policy, endpoints: Awaited<ReturnType<typeof validateEndpoints>>) {
  const relations = await ctx.db.query("relacionesOpcionesAtributo").withIndex("porPolitica", q => q.eq("politicaCompatibilidadId", row._id)).take(MAX_AGGREGATE_ROWS + 1);
  let count = 0;
  for (const relation of relations) {
    const origin = await ctx.db.get(relation.opcionOrigenId); const destination = await ctx.db.get(relation.opcionDestinoId);
    if (relation.activo && origin?.activo && destination?.activo && origin.definicionAtributoId === endpoints.originDefinition._id && destination.definicionAtributoId === endpoints.destinationDefinition._id) count += 1;
  }
  return count;
}

async function validatePolicy(ctx: MutationCtx, row: Policy, ignore?: Id<"politicasCompatibilidadOpciones">) {
  const endpoints = await validateEndpoints(ctx, row, row.activo);
  if (!row.activo) return;
  const policies = await ctx.db.query("politicasCompatibilidadOpciones").withIndex("porTipo", q => q.eq("tipoRecursoId", row.tipoRecursoId)).take(MAX_AGGREGATE_ROWS + 1);
  const conflict = policies.find(candidate => candidate.activo && candidate._id !== ignore && politicasCompatibilidadEnConflicto(slot(candidate), slot(row)));
  if (conflict) adminConflict({ entity: entity(row._id), conflictKind: "compatibility-policy-slot", conflictingEntity: entity(conflict._id), normalizedIdentity: normalized(row).identity });
  if (row.modo === "ALLOWLIST" && (await relationCount(ctx, row, endpoints)) === 0) adminAggregateIncomplete({ entity: entity(row._id), violations: [{ code: "ALLOWLIST_EMPTY", entity: entity(row._id) }] });
}

async function item(ctx: Db, row: Policy) {
  const owner = await assignments(ctx, row.tipoRecursoId); const origin = [...owner.chosen.values()].find(candidate => candidate._id === row.atributoOrigenId); const destination = [...owner.chosen.values()].find(candidate => candidate._id === row.atributoDestinoId);
  const reasons: string[] = [];
  if (!row.activo) reasons.push("INACTIVE");
  else if (!owner.type.activo || !owner.family.activo || !owner.clazz.activo) reasons.push("HIERARCHY_INACTIVE");
  else if (!origin || !destination) reasons.push("ASSIGNMENT_INACTIVE");
  else {
    const originDefinition = owner.definitions.get(String(origin.definicionAtributoId)); const destinationDefinition = owner.definitions.get(String(destination.definicionAtributoId));
    if (!origin.activo || !destination.activo || originDefinition?.tipoDato !== "OPCION" || destinationDefinition?.tipoDato !== "OPCION") reasons.push("ENDPOINT_INACTIVE");
    else if (!originDefinition.activo || !destinationDefinition.activo) reasons.push("DEFINITION_INACTIVE");
  }
  return { id: row._id, tipoRecursoId: row.tipoRecursoId, atributoOrigenId: row.atributoOrigenId, atributoDestinoId: row.atributoDestinoId, modo: row.modo, direccion: row.direccion, activo: row.activo, revision: row.revision, effective: row.activo && reasons.length === 0, effectiveReasons: reasons, normalizedIdentity: normalized(row).identity };
}

const createArgs = { tipoRecursoId: v.id("tiposRecurso"), atributoOrigenId: v.id("atributosRecurso"), atributoDestinoId: v.id("atributosRecurso"), modo: policyMode, direccion: direction, activo: v.optional(v.boolean()) };
export const crearPoliticaCompatibilidad = mutation({ args: createArgs, returns: createResultValidator(detail), handler: async (ctx, args) => {
  const id = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: args.tipoRecursoId, atributoOrigenId: args.atributoOrigenId, atributoDestinoId: args.atributoDestinoId, modo: args.modo, direccion: args.direccion, activo: args.activo ?? false, revision: 1 });
  const row = (await ctx.db.get(id))!; const n = normalized(row); await ctx.db.patch(id, { adminSortId: id, atributoOrigenIdNormalizado: n.origin, atributoDestinoIdNormalizado: n.destination });
  await validatePolicy(ctx, row, id); return { disposition: "CREATED" as const, item: await item(ctx, (await ctx.db.get(id))!) };
} });
export const obtenerPoliticaCompatibilidad = query({ args: { politicaCompatibilidadId: v.id("politicasCompatibilidadOpciones") }, returns: v.union(detail, v.null()), handler: async (ctx, args) => { const row = await ctx.db.get(args.politicaCompatibilidadId); return row ? item(ctx, row) : null; } });

export const listarPoliticasCompatibilidad = query({
  args: { tipoRecursoId: v.optional(v.id("tiposRecurso")), atributoOrigenId: v.optional(v.id("atributosRecurso")), atributoDestinoId: v.optional(v.id("atributosRecurso")), atributoId: v.optional(v.id("atributosRecurso")), modo: v.optional(listMode), modoPolitica: v.optional(policyMode), estado: v.optional(lifecycleFilterValidator), direccion: v.optional(direction), cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()) },
  returns: adminPageValidator(detail), handler: async (ctx, args) => {
    const lifecycle = args.estado ?? (args.modo === "ALL" || args.modo === "ACTIVE" || args.modo === "INACTIVE" ? args.modo : "ALL");
    const policyFilter = args.modoPolitica ?? (args.modo === "ALLOWLIST" || args.modo === "DENYLIST" ? args.modo : undefined);
    const filters = { tipoRecursoId: args.tipoRecursoId ?? null, atributoOrigenId: args.atributoOrigenId ?? null, atributoDestinoId: args.atributoDestinoId ?? null, atributoId: args.atributoId ?? null, modo: policyFilter ?? null, direccion: args.direccion ?? null };
    const cursor = await consumeCursor(args.cursor ?? null, context(lifecycle, filters));
    const page = await ctx.db.query("politicasCompatibilidadOpciones").withIndex("porTipoYNormalizadosYDireccionYAdminSort", q => args.tipoRecursoId === undefined ? q : q.eq("tipoRecursoId", args.tipoRecursoId)).order("asc").paginate({ numItems: validatePageSize(args.pageSize), cursor });
    const rows = (page.page as Policy[]).filter(row => (lifecycle === "ALL" || row.activo === (lifecycle === "ACTIVE")) && (args.atributoOrigenId === undefined || row.atributoOrigenId === args.atributoOrigenId) && (args.atributoDestinoId === undefined || row.atributoDestinoId === args.atributoDestinoId) && (args.atributoId === undefined || row.atributoOrigenId === args.atributoId || row.atributoDestinoId === args.atributoId) && (policyFilter === undefined || row.modo === policyFilter) && (args.direccion === undefined || row.direccion === args.direccion));
    return { items: await Promise.all(rows.map(row => item(ctx, row))), continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, context(lifecycle, filters)), isExhausted: page.isDone };
  },
});

export const actualizarPoliticaCompatibilidad = mutation({
  args: { politicaCompatibilidadId: v.id("politicasCompatibilidadOpciones"), expectedRevision: v.number(), tipoRecursoId: v.optional(v.id("tiposRecurso")), atributoOrigenId: v.optional(v.id("atributosRecurso")), atributoDestinoId: v.optional(v.id("atributosRecurso")), modo: v.optional(policyMode), direccion: v.optional(direction) }, returns: changeResultValidator(detail),
  handler: async (ctx, args) => { const result = await applyRevisionedUpdate<Policy, typeof args, { modo?: Policy["modo"]; direccion?: Policy["direccion"] }>({ load: () => ctx.db.get(args.politicaCompatibilidadId), expectedRevision: args.expectedRevision, entity: entity(args.politicaCompatibilidadId), immutable: { tipoRecursoId: args.tipoRecursoId, atributoOrigenId: args.atributoOrigenId, atributoDestinoId: args.atributoDestinoId }, changes: args, normalize: changes => ({ ...(changes.modo === undefined ? {} : { modo: changes.modo }), ...(changes.direccion === undefined ? {} : { direccion: changes.direccion }) }), current: row => ({ ...(args.modo === undefined ? {} : { modo: row.modo }), ...(args.direccion === undefined ? {} : { direccion: row.direccion }) }), validate: async next => { await validatePolicy(ctx, next, next._id); }, patch: next => { const n = normalized(next); return ctx.db.patch(next._id, { modo: next.modo, direccion: next.direccion, atributoOrigenIdNormalizado: n.origin, atributoDestinoIdNormalizado: n.destination, revision: next.revision }); } }); return { disposition: result.disposition, item: await item(ctx, result.item) }; },
});

async function lifecycle(ctx: MutationCtx, args: { politicaCompatibilidadId: Id<"politicasCompatibilidadOpciones">; expectedRevision: number }, active: boolean) { const result = await applyLifecycleChange<Policy>({ load: () => ctx.db.get(args.politicaCompatibilidadId), expectedRevision: args.expectedRevision, entity: entity(args.politicaCompatibilidadId), targetActive: active, validate: next => validatePolicy(ctx, next), patch: next => { const n = normalized(next); return ctx.db.patch(next._id, { activo: next.activo, atributoOrigenIdNormalizado: n.origin, atributoDestinoIdNormalizado: n.destination, revision: next.revision }); } }); return { disposition: result.disposition, item: await item(ctx, result.item) }; }
export const activarPoliticaCompatibilidad = mutation({ args: { politicaCompatibilidadId: v.id("politicasCompatibilidadOpciones"), expectedRevision: v.number() }, returns: changeResultValidator(detail), handler: (ctx, args) => lifecycle(ctx, args, true) });
export const desactivarPoliticaCompatibilidad = mutation({ args: { politicaCompatibilidadId: v.id("politicasCompatibilidadOpciones"), expectedRevision: v.number() }, returns: changeResultValidator(detail), handler: (ctx, args) => lifecycle(ctx, args, false) });
