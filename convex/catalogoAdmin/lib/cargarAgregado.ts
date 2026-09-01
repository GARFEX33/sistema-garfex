import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";
import { validarAgregado, type AggregateViolation, type ResultadoAgregado } from "../../../src/catalogoRecursos/dominio/validacionAgregado";

export const MAX_AGGREGATE_ROWS = 200;
export type BoundedRows<T> = { exceeded: boolean; rows: T[] };
export function limitarFilas<T>(rows: T[], limit = MAX_AGGREGATE_ROWS): BoundedRows<T> {
  return rows.length > limit ? { exceeded: true, rows: [] } : { exceeded: false, rows };
}
export function filtrarFilasEfectivas<T extends { active: boolean }>(rows: T[], effective: boolean): T[] {
  return effective ? rows.filter(row => row.active) : [];
}
export function detectarClavesTipoAmbiguas(rows: readonly { clave: string }[]): string[] {
  const seen = new Set<string>(), duplicates = new Set<string>();
  for (const row of rows) (seen.has(row.clave) ? duplicates : seen).add(row.clave);
  return [...duplicates].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
}

export type DbContext = Pick<QueryCtx, "db">;
type TypeDoc = Doc<"tiposRecurso">;
export type AggregateOverrides = { classActiveId?: Id<"clasesRecurso">; familyActiveId?: Id<"familiasRecurso">; typeActive?: boolean };
export type LoadedAggregate = ResultadoAgregado & { effective: boolean };

const limitViolation = (detail: string): AggregateViolation => ({ code: "CATALOG_LIMIT_EXCEEDED", detail });

export async function cargarAgregado(ctx: DbContext, typeId: Id<"tiposRecurso">, overrides: AggregateOverrides = {}): Promise<LoadedAggregate> {
  const type = await ctx.db.get(typeId);
  const family = type ? await ctx.db.get(type.familiaRecursoId) : null;
  const clase = family ? await ctx.db.get(family.claseRecursoId) : null;
  if (!type || !family || !clase || type.revision < 1 || family.revision < 1 || clase.revision < 1) return { effective: false, status: "INVALID", violations: [{ code: "HIERARCHY_REFERENCE_INVALID" }] };
  const hierarchyValid = type.familiaRecursoId === family._id && family.claseRecursoId === clase._id;
  const typeActive = overrides.typeActive ?? type.activo;
  const familyActive = overrides.familyActiveId === family._id ? true : family.activo;
  const classActive = overrides.classActiveId === clase._id ? true : clase.activo;
  const effective = hierarchyValid && typeActive && familyActive && classActive;
  if (!effective) return { effective: false, status: "NOT_EVALUATED", violations: [] };

  const familyPolicies = await ctx.db.query("politicasUnidadRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family._id)).take(MAX_AGGREGATE_ROWS + 1);
  const typePolicies = await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const presentations = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const bounded = [limitarFilas(familyPolicies), limitarFilas(typePolicies), limitarFilas(presentations)];
  if (bounded.some(result => result.exceeded)) return { effective, status: "INVALID", violations: [limitViolation("aggregate fan-out exceeds the bounded limit")] };
  const policies = [...familyPolicies, ...typePolicies].filter(policy => policy.activo && (policy.tipoRecursoId === undefined || policy.tipoRecursoId === typeId));
  if (policies.length === 0 && presentations.length === 0 && familyPolicies.length === 0 && typePolicies.length === 0) return { effective, status: "NOT_EVALUATED", violations: [] };
  const principalUnits = await Promise.all(policies.map(async policy => ({ active: policy.activo, principal: policy.principal, unitActive: Boolean((await ctx.db.get(policy.unidadId))?.activo) })));
  const result = validarAgregado({
    effective,
    hierarchy: { typeId: type._id, familyId: family._id, classId: clase._id, familyOfTypeId: type.familiaRecursoId, classOfFamilyId: family.claseRecursoId },
    principalUnits,
    presentationPolicies: presentations.map(policy => ({ active: policy.activo, tokenCount: policy.tokens.length })),
  });
  return { effective, ...result };
}
