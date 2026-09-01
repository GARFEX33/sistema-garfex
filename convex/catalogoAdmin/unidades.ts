import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { adminAggregateIncomplete, adminConflict, adminDependencyBlocked, adminDuplicateKey, adminInvalidArgument, adminInvalidReference } from "./lib/errors";
import { applyLifecycleChange, applyRevisionedUpdate, normalizeText } from "./lib/revisions";
import { adminPageValidator, changeResultValidator, createResultValidator, lifecycleFilterValidator } from "./validators";
import { consumeCursor, createCursor, ORDERING_VERSION, validatePageSize } from "./lib/pagination";
import { MAX_AGGREGATE_ROWS } from "./lib/cargarAgregado";
import { politicaSeleccionada, resolverUnidadesEfectivas, type PoliticaUnidadEfectiva } from "../../src/catalogoRecursos/dominio/unidadesEfectivas";

const unidadDetalle = v.object({ id: v.id("unidades"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()), simbolo: v.optional(v.string()), activo: v.boolean(), revision: v.number(), effective: v.boolean() });
const politicaDetalle = v.object({ id: v.id("politicasUnidadRecurso"), familiaRecursoId: v.id("familiasRecurso"), tipoRecursoId: v.optional(v.id("tiposRecurso")), unidadId: v.id("unidades"), principal: v.boolean(), activo: v.boolean(), revision: v.number(), effective: v.boolean(), selected: v.boolean(), shadowed: v.boolean(), selection: v.union(v.literal("SELECTED"), v.literal("SHADOWED"), v.literal("SUPPRESSED"), v.literal("NONE")) });
const unitEntity = (id: Id<"unidades">) => ({ kind: "unidades" as const, id });
const policyEntity = (id: Id<"politicasUnidadRecurso">) => ({ kind: "politicasUnidadRecurso" as const, id });
const context = (mode: "ALL" | "ACTIVE" | "INACTIVE", plan: string, filters: unknown) => ({ mode, plan, filters, order: ORDERING_VERSION });
const key = (value: string, field: string) => { const result = normalizeText(value); if (!result) adminInvalidArgument({ field, reason: "must not be blank" }); return result; };

type Db = Pick<QueryCtx, "db">;
type PolicyDoc = Doc<"politicasUnidadRecurso">;
type UnitDoc = Doc<"unidades">;

type PolicyCandidate = { _id: Id<"politicasUnidadRecurso"> | string; familiaRecursoId: Id<"familiasRecurso">; tipoRecursoId?: Id<"tiposRecurso">; unidadId: Id<"unidades">; principal: boolean; activo: boolean };
async function resolve(ctx: Db, typeId: Id<"tiposRecurso">, candidate?: PolicyCandidate, unitActiveOverride?: Id<"unidades">) {
  const type = await ctx.db.get(typeId); const family = type ? await ctx.db.get(type.familiaRecursoId) : null; const clazz = family ? await ctx.db.get(family.claseRecursoId) : null;
  if (!type || !family || !clazz) return null;
  const familyRows = await ctx.db.query("politicasUnidadRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family._id)).take(MAX_AGGREGATE_ROWS + 1);
  const typeRows = await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const rows = [...familyRows.filter(row => row.tipoRecursoId === undefined), ...typeRows.filter(row => row.familiaRecursoId === family._id)];
  const all = candidate ? [...rows.filter(row => row._id !== candidate._id), candidate] : rows;
  const units = new Map(await Promise.all([...new Set(all.map(row => row.unidadId))].map(async id => [id, id !== unitActiveOverride && Boolean((await ctx.db.get(id))?.activo)] as const)));
  const domain = (row: PolicyCandidate): PoliticaUnidadEfectiva => ({ id: String(row._id), familiaRecursoId: String(row.familiaRecursoId), tipoRecursoId: row.tipoRecursoId === undefined ? undefined : String(row.tipoRecursoId), unidadId: String(row.unidadId), principal: row.principal, activo: row.activo, unidadActiva: units.get(row.unidadId) === true });
  const result = resolverUnidadesEfectivas({ familia: familyRows.filter(row => row.tipoRecursoId === undefined).map(domain), tipo: all.filter(row => row.tipoRecursoId === typeId).map(domain), tipoEfectivo: type.activo && family.activo && clazz.activo });
  return { result, type, family, clazz, rows: all };
}
async function validateTypePolicy(ctx: MutationCtx, typeId: Id<"tiposRecurso">, candidate?: PolicyCandidate) {
  const resolved = await resolve(ctx, typeId, candidate); if (!resolved) return;
  if (!resolved.result.selected.length && !resolved.result.suppressed.length) return;
  if (resolved.type.activo && resolved.family.activo && resolved.clazz.activo) {
    if (resolved.result.principalCount > 1) adminConflict({ entity: { kind: "tiposRecurso", id: typeId }, conflictKind: "multiple-principal-units" });
    if (resolved.result.principalCount !== 1 || resolved.result.inactiveUnitIds.length) adminAggregateIncomplete({ entity: { kind: "tiposRecurso", id: typeId }, violations: [{ code: "PRINCIPAL_UNIT_COUNT", entity: { kind: "tiposRecurso", id: typeId } }, ...(resolved.result.inactiveUnitIds.length ? [{ code: "UNIT_INACTIVE" as const, entity: { kind: "tiposRecurso" as const, id: typeId } }] : [])] });
  }
}
async function validateFamilyPolicies(ctx: MutationCtx, familyId: Id<"familiasRecurso">, candidate?: PolicyCandidate) {
  const types = await ctx.db.query("tiposRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familyId)).take(MAX_AGGREGATE_ROWS + 1);
  for (const type of types) if (type.activo) await validateTypePolicy(ctx, type._id, candidate);
}
function unitItem(row: UnitDoc) { return { id: row._id, clave: row.clave, nombre: row.nombre, descripcion: row.descripcion, simbolo: row.simbolo, activo: row.activo, revision: row.revision, effective: row.activo }; }

export const crearUnidad = mutation({ args: { clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()), simbolo: v.optional(v.string()), activo: v.optional(v.boolean()) }, returns: createResultValidator(unidadDetalle), handler: async (ctx, args) => {
  const clave = key(args.clave, "clave"), nombre = key(args.nombre, "nombre");
  if (await ctx.db.query("unidades").withIndex("porClave", q => q.eq("clave", clave)).first()) adminDuplicateKey({ entityKind: "unidades", key: clave, scope: "global" });
  const id = await ctx.db.insert("unidades", { clave, nombre, descripcion: args.descripcion === undefined ? undefined : normalizeText(args.descripcion), simbolo: args.simbolo === undefined ? undefined : normalizeText(args.simbolo), activo: args.activo ?? false, revision: 1 });
  await ctx.db.patch(id, { adminSortId: id }); return { disposition: "CREATED" as const, item: unitItem((await ctx.db.get(id))!) };
} });
export const actualizarUnidad = mutation({ args: { unidadId: v.id("unidades"), expectedRevision: v.number(), clave: v.optional(v.string()), nombre: v.optional(v.string()), descripcion: v.optional(v.string()), simbolo: v.optional(v.string()) }, returns: changeResultValidator(unidadDetalle), handler: async (ctx, args) => {
  const result = await applyRevisionedUpdate<UnitDoc, typeof args, Record<string, string>>({ load: () => ctx.db.get(args.unidadId), expectedRevision: args.expectedRevision, entity: unitEntity(args.unidadId), immutable: { clave: args.clave }, changes: args, normalize: changes => ({ ...(changes.nombre === undefined ? {} : { nombre: key(changes.nombre, "nombre") }), ...(changes.descripcion === undefined ? {} : { descripcion: normalizeText(changes.descripcion) }), ...(changes.simbolo === undefined ? {} : { simbolo: normalizeText(changes.simbolo) }) }), current: row => ({ ...(args.nombre === undefined ? {} : { nombre: normalizeText(row.nombre) }), ...(args.descripcion === undefined ? {} : { descripcion: normalizeText(row.descripcion ?? "") }), ...(args.simbolo === undefined ? {} : { simbolo: normalizeText(row.simbolo ?? "") }) }), patch: next => ctx.db.patch(next._id, { ...(args.nombre === undefined ? {} : { nombre: next.nombre }), ...(args.descripcion === undefined ? {} : { descripcion: next.descripcion }), ...(args.simbolo === undefined ? {} : { simbolo: next.simbolo }), revision: next.revision }) });
  return { disposition: result.disposition, item: unitItem(result.item) };
} });
export const obtenerUnidad = query({ args: { unidadId: v.id("unidades") }, returns: v.union(unidadDetalle, v.null()), handler: async (ctx, args) => { const row = await ctx.db.get(args.unidadId); return row ? unitItem(row) : null; } });
export const listarUnidades = query({ args: { cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()), modo: v.optional(lifecycleFilterValidator) }, returns: adminPageValidator(unidadDetalle), handler: async (ctx, args) => {
  const mode = args.modo ?? "ALL", plan = mode === "ALL" ? "porClaveYAdminSort" : "porActivoYClaveYAdminSort"; const cursor = await consumeCursor(args.cursor ?? null, context(mode, plan, {}));
  const rows = mode === "ALL" ? ctx.db.query("unidades").withIndex("porClaveYAdminSort").order("asc") : ctx.db.query("unidades").withIndex("porActivoYClaveYAdminSort", q => q.eq("activo", mode === "ACTIVE")).order("asc"); const page = await rows.paginate({ numItems: validatePageSize(args.pageSize), cursor });
  return { items: (page.page as UnitDoc[]).map(unitItem), continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, context(mode, plan, {})), isExhausted: page.isDone };
} });
async function unitBlocker(ctx: MutationCtx, id: Id<"unidades">) {
  const resource = await ctx.db.query("recursos").withIndex("porUnidad", q => q.eq("unidadId", id)).take(MAX_AGGREGATE_ROWS + 1); const activeResource = resource.find(row => row.activo); if (activeResource) return { relationKind: "active-resource", blocker: { kind: "recursos" as const, id: activeResource._id } };
  const definition = await ctx.db.query("definicionesAtributo").withIndex("porUnidad", q => q.eq("unidadId", id)).take(MAX_AGGREGATE_ROWS + 1); if (definition.some(row => row.activo && row.tipoDato === "NUMERO")) { const row = definition.find(row => row.activo && row.tipoDato === "NUMERO")!; return { relationKind: "effective-numeric-definition", blocker: { kind: "definicionesAtributo" as const, id: row._id } }; }
  const policies = await ctx.db.query("politicasUnidadRecurso").withIndex("porUnidad", q => q.eq("unidadId", id)).take(MAX_AGGREGATE_ROWS + 1); const types = new Set<Id<"tiposRecurso">>();
  for (const row of policies) { if (row.tipoRecursoId) types.add(row.tipoRecursoId); else { const familyTypes = await ctx.db.query("tiposRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", row.familiaRecursoId)).take(MAX_AGGREGATE_ROWS + 1); familyTypes.forEach(type => types.add(type._id)); } }
  for (const type of types) { const resolved = await resolve(ctx, type, undefined, id); if (resolved?.type.activo && resolved.family.activo && resolved.clazz.activo && resolved.result.principalCount !== 1) return { relationKind: "effective-principal-unit", blocker: { kind: "tiposRecurso" as const, id: type } }; }
  return null;
}
export const activarUnidad = mutation({ args: { unidadId: v.id("unidades"), expectedRevision: v.number() }, returns: changeResultValidator(unidadDetalle), handler: async (ctx, args) => { const result = await applyLifecycleChange<UnitDoc>({ load: () => ctx.db.get(args.unidadId), expectedRevision: args.expectedRevision, entity: unitEntity(args.unidadId), targetActive: true, patch: next => ctx.db.patch(next._id, { activo: true, revision: next.revision }) }); return { disposition: result.disposition, item: unitItem(result.item) }; } });
export const desactivarUnidad = mutation({ args: { unidadId: v.id("unidades"), expectedRevision: v.number() }, returns: changeResultValidator(unidadDetalle), handler: async (ctx, args) => { const result = await applyLifecycleChange<UnitDoc>({ load: () => ctx.db.get(args.unidadId), expectedRevision: args.expectedRevision, entity: unitEntity(args.unidadId), targetActive: false, validate: async () => { const blocker = await unitBlocker(ctx, args.unidadId); if (blocker) adminDependencyBlocked({ entity: unitEntity(args.unidadId), ...blocker }); }, patch: next => ctx.db.patch(next._id, { activo: false, revision: next.revision }) }); return { disposition: result.disposition, item: unitItem(result.item) }; } });

async function policyItem(ctx: Db, row: PolicyDoc, requestedType?: Id<"tiposRecurso">) {
  const typeId = requestedType ?? row.tipoRecursoId; const resolved = typeId ? await resolve(ctx, typeId) : null; const selection = resolved && resolved.rows.some(candidate => candidate._id === row._id) ? politicaSeleccionada(resolved.result, String(row._id)) : "NONE";
  const unit = await ctx.db.get(row.unidadId); const effective = row.activo && Boolean(unit?.activo) && (resolved ? resolved.type.activo && resolved.family.activo && resolved.clazz.activo : true) && (selection === "SELECTED" || (!typeId && row.tipoRecursoId === undefined));
  return { id: row._id, familiaRecursoId: row.familiaRecursoId, tipoRecursoId: row.tipoRecursoId, unidadId: row.unidadId, principal: row.principal, activo: row.activo, revision: row.revision, effective, selected: selection === "SELECTED", shadowed: selection === "SHADOWED", selection };
}
const policyArgs = { familiaRecursoId: v.id("familiasRecurso"), tipoRecursoId: v.optional(v.id("tiposRecurso")), unidadId: v.id("unidades"), principal: v.boolean(), activo: v.optional(v.boolean()) };
async function references(ctx: MutationCtx, familyId: Id<"familiasRecurso">, typeId: Id<"tiposRecurso"> | undefined, unitId: Id<"unidades">) {
  const family = await ctx.db.get(familyId); if (!family) adminInvalidReference({ entityKind: "politicasUnidadRecurso", field: "familiaRecursoId", reason: "family does not exist" });
  if (typeId !== undefined) { const type = await ctx.db.get(typeId); if (!type || type.familiaRecursoId !== familyId) adminInvalidReference({ entityKind: "politicasUnidadRecurso", field: "tipoRecursoId", reference: { kind: "tiposRecurso", id: typeId }, reason: "type does not belong to family" }); }
  if (!(await ctx.db.get(unitId))) adminInvalidReference({ entityKind: "politicasUnidadRecurso", field: "unidadId", reference: unitEntity(unitId), reason: "unit does not exist" });
}
async function duplicate(ctx: MutationCtx, familyId: Id<"familiasRecurso">, typeId: Id<"tiposRecurso"> | undefined, unitId: Id<"unidades">, except?: Id<"politicasUnidadRecurso">) {
  const rows = await ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYTipoYUnidad", q => q.eq("familiaRecursoId", familyId).eq("tipoRecursoId", typeId).eq("unidadId", unitId)).take(2); if (rows.some(row => row._id !== except)) adminDuplicateKey({ entityKind: "politicasUnidadRecurso", normalizedIdentity: `${familyId}|${typeId ?? "family"}|${unitId}` });
}
export const crearPoliticaUnidad = mutation({ args: policyArgs, returns: createResultValidator(politicaDetalle), handler: async (ctx, args) => {
  await references(ctx, args.familiaRecursoId, args.tipoRecursoId, args.unidadId); await duplicate(ctx, args.familiaRecursoId, args.tipoRecursoId, args.unidadId); const id = await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: args.familiaRecursoId, tipoRecursoId: args.tipoRecursoId, unidadId: args.unidadId, principal: args.principal, activo: args.activo ?? false, revision: 1 }); await ctx.db.patch(id, { adminSortId: id }); const candidate = { _id: id, ...args, activo: args.activo ?? false }; if (candidate.activo && args.tipoRecursoId) await validateTypePolicy(ctx, args.tipoRecursoId, candidate); if (candidate.activo && !args.tipoRecursoId) await validateFamilyPolicies(ctx, args.familiaRecursoId, candidate); return { disposition: "CREATED" as const, item: await policyItem(ctx, (await ctx.db.get(id))!) };
} });
export const obtenerPoliticaUnidad = query({ args: { politicaUnidadId: v.id("politicasUnidadRecurso"), paraTipoRecursoId: v.optional(v.id("tiposRecurso")) }, returns: v.union(politicaDetalle, v.null()), handler: async (ctx, args) => { const row = await ctx.db.get(args.politicaUnidadId); return row ? policyItem(ctx, row, args.paraTipoRecursoId) : null; } });
export const listarPoliticasUnidad = query({ args: { familiaRecursoId: v.optional(v.id("familiasRecurso")), tipoRecursoId: v.optional(v.id("tiposRecurso")), unidadId: v.optional(v.id("unidades")), paraTipoRecursoId: v.optional(v.id("tiposRecurso")), cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()), modo: v.optional(lifecycleFilterValidator) }, returns: adminPageValidator(politicaDetalle), handler: async (ctx, args) => {
  const mode = args.modo ?? "ALL", familyId = args.familiaRecursoId, typeId = args.tipoRecursoId, unitId = args.unidadId, filters = { familiaRecursoId: familyId ?? null, tipoRecursoId: typeId ?? null, unidadId: unitId ?? null, resolutionType: args.paraTipoRecursoId ?? null };
  const plan = mode === "ALL" ? familyId ? "porFamiliaYTipoYUnidadYAdminSort" : typeId ? "porTipoYUnidad" : unitId ? "porUnidad" : "porFamiliaYTipoYUnidadYAdminSort" : familyId ? "porFamiliaYActivoYTipoYUnidadYAdminSort" : typeId ? "porTipoYActivoYFamiliaYUnidadYAdminSort" : unitId ? "porUnidadYActivoYFamiliaYTipoYAdminSort" : "porFamiliaYActivoYTipoYUnidadYAdminSort";
  const cursor = await consumeCursor(args.cursor ?? null, context(mode, plan, filters)); let indexed: any;
  if (mode === "ALL") {
    if (familyId) indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYTipoYUnidadYAdminSort", (q: any) => { const x: any = q.eq("familiaRecursoId", familyId); if (typeId) x.eq("tipoRecursoId", typeId); if (unitId) x.eq("unidadId", unitId); return x; }).order("asc");
    else if (typeId) indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porTipoYUnidad", (q: any) => { const x: any = q.eq("tipoRecursoId", typeId); if (unitId) x.eq("unidadId", unitId); return x; }).order("asc");
    else if (unitId) indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porUnidad", q => q.eq("unidadId", unitId)).order("asc");
    else indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYTipoYUnidadYAdminSort").order("asc");
  } else if (familyId) indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYActivoYTipoYUnidadYAdminSort", (q: any) => { const x: any = q.eq("familiaRecursoId", familyId).eq("activo", mode === "ACTIVE"); if (typeId) x.eq("tipoRecursoId", typeId); if (unitId) x.eq("unidadId", unitId); return x; }).order("asc");
  else if (typeId) indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porTipoYActivoYFamiliaYUnidadYAdminSort", q => q.eq("tipoRecursoId", typeId).eq("activo", mode === "ACTIVE")).order("asc");
  else if (unitId) indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porUnidadYActivoYFamiliaYTipoYAdminSort", q => q.eq("unidadId", unitId).eq("activo", mode === "ACTIVE")).order("asc");
  else indexed = ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYActivoYTipoYUnidadYAdminSort").order("asc");
  const page = await indexed.paginate({ numItems: validatePageSize(args.pageSize), cursor });
  return { items: await Promise.all((page.page as PolicyDoc[]).map(row => policyItem(ctx, row, args.paraTipoRecursoId ?? args.tipoRecursoId))), continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, context(mode, plan, filters)), isExhausted: page.isDone };
} });
async function policyChange(ctx: MutationCtx, row: PolicyDoc, changes: { principal?: boolean; activo?: boolean }) { const candidate = { ...row, ...changes }; if (candidate.tipoRecursoId) await validateTypePolicy(ctx, candidate.tipoRecursoId, candidate); else await validateFamilyPolicies(ctx, candidate.familiaRecursoId, candidate); }
export const actualizarPoliticaUnidad = mutation({ args: { politicaUnidadId: v.id("politicasUnidadRecurso"), expectedRevision: v.number(), familiaRecursoId: v.optional(v.id("familiasRecurso")), tipoRecursoId: v.optional(v.id("tiposRecurso")), unidadId: v.optional(v.id("unidades")), principal: v.optional(v.boolean()) }, returns: changeResultValidator(politicaDetalle), handler: async (ctx, args) => {
  const row = await ctx.db.get(args.politicaUnidadId); if (!row) adminInvalidReference({ entityKind: "politicasUnidadRecurso", field: "politicaUnidadId", reason: "policy does not exist" }); const result = await applyRevisionedUpdate<PolicyDoc, typeof args, { principal?: boolean }>({ load: () => row, expectedRevision: args.expectedRevision, entity: policyEntity(args.politicaUnidadId), immutable: { familiaRecursoId: args.familiaRecursoId, tipoRecursoId: args.tipoRecursoId, unidadId: args.unidadId }, changes: args, normalize: changes => changes.principal === undefined ? {} : { principal: changes.principal }, current: current => args.principal === undefined ? {} : { principal: current.principal }, validate: next => policyChange(ctx, next, { principal: next.principal }), patch: next => ctx.db.patch(next._id, { principal: next.principal, revision: next.revision }) }); return { disposition: result.disposition, item: await policyItem(ctx, result.item) };
} });
async function lifecyclePolicy(ctx: MutationCtx, args: { politicaUnidadId: Id<"politicasUnidadRecurso">; expectedRevision: number }, active: boolean) { const result = await applyLifecycleChange<PolicyDoc>({ load: () => ctx.db.get(args.politicaUnidadId), expectedRevision: args.expectedRevision, entity: policyEntity(args.politicaUnidadId), targetActive: active, validate: next => policyChange(ctx, next, { activo: active }), patch: next => ctx.db.patch(next._id, { activo: next.activo, revision: next.revision }) }); return { disposition: result.disposition, item: await policyItem(ctx, result.item) }; }
export const activarPoliticaUnidad = mutation({ args: { politicaUnidadId: v.id("politicasUnidadRecurso"), expectedRevision: v.number() }, returns: changeResultValidator(politicaDetalle), handler: (ctx, args) => lifecyclePolicy(ctx, args, true) });
export const desactivarPoliticaUnidad = mutation({ args: { politicaUnidadId: v.id("politicasUnidadRecurso"), expectedRevision: v.number() }, returns: changeResultValidator(politicaDetalle), handler: (ctx, args) => lifecyclePolicy(ctx, args, false) });
