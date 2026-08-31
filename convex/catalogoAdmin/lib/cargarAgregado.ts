import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { Doc, Id } from "../../_generated/dataModel";
import { validarAgregado, type AggregateViolation, type ResultadoAgregado } from "../../../src/catalogoRecursos/dominio/validacionAgregado";
import { resolverUnidadesEfectivas, type PoliticaUnidadEfectiva } from "../../../src/catalogoRecursos/dominio/unidadesEfectivas";
import { resolverAsignaciones, validarCompletitudAsignaciones } from "../../../src/catalogoRecursos/dominio/asignacionesEfectivas";
import { validarReglasCondicionales, type ReglaCondicional } from "../../../src/catalogoRecursos/dominio/reglasCondicionales";
import { validarEstructuraPresentacion } from "../../../src/catalogoRecursos/dominio/presentacionCanonica";
import { politicasCompatibilidadEnConflicto } from "../../../src/catalogoRecursos/dominio/compatibilidadOpciones";
import { resolverJerarquiaEfectiva } from "../../../src/catalogoRecursos/dominio/catalogoEfectivo";

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
  const hierarchy = resolverJerarquiaEfectiva({
    classId: String(clase._id), familyId: String(family._id), typeId: String(type._id),
    familyClassId: String(family.claseRecursoId), typeFamilyId: String(type.familiaRecursoId),
    classActive: clase.activo, familyActive: family.activo, typeActive: type.activo,
    overrides: {
      classActive: overrides.classActiveId === clase._id ? true : undefined,
      familyActive: overrides.familyActiveId === family._id ? true : undefined,
      typeActive: overrides.typeActive,
    },
  });
  const effective = hierarchy.effective;
  if (!effective) return { effective: false, status: "NOT_EVALUATED", violations: [] };

  const familyPolicies = await ctx.db.query("politicasUnidadRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family._id)).take(MAX_AGGREGATE_ROWS + 1);
  const typePolicies = await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const presentations = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const attributes = await ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", family._id)).take(MAX_AGGREGATE_ROWS + 1);
  const rules = await ctx.db.query("reglasAtributoRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const bounded = [limitarFilas(familyPolicies), limitarFilas(typePolicies), limitarFilas(presentations), limitarFilas(attributes), limitarFilas(rules)];
  if (bounded.some(result => result.exceeded)) return { effective, status: "INVALID", violations: [limitViolation("aggregate fan-out exceeds the bounded limit")] };
  const definitions = new Map((await Promise.all([...new Set(attributes.map(row => row.definicionAtributoId))].map(async id => [String(id), await ctx.db.get(id)] as const))).filter((entry): entry is [string, NonNullable<typeof entry[1]>] => entry[1] !== null));
  const toAssignment = (row: typeof attributes[number]) => ({ id: String(row._id), familiaId: String(row.familiaRecursoId), tipoId: row.tipoRecursoId === undefined ? undefined : String(row.tipoRecursoId), definicionId: String(row.definicionAtributoId), definicionClave: definitions.get(String(row.definicionAtributoId))?.clave ?? String(row.definicionAtributoId), tipoDato: definitions.get(String(row.definicionAtributoId))?.tipoDato, activo: row.activo, aplicabilidad: row.aplicabilidad, participaIdentidad: row.participaIdentidad, orden: row.orden });
  const selectedAssignments = resolverAsignaciones({ familia: attributes.filter(row => row.tipoRecursoId === undefined).map(toAssignment), tipo: attributes.filter(row => row.tipoRecursoId === typeId).map(toAssignment), familiaId: String(family._id), tipoId: String(typeId) }).selected;
  const options = (await Promise.all([...new Set(selectedAssignments.filter(row => row.tipoDato === "OPCION").map(row => row.definicionId))].map(async id => ctx.db.query("opcionesAtributo").withIndex("porDefinicion", q => q.eq("definicionAtributoId", id as Id<"definicionesAtributo">)).take(MAX_AGGREGATE_ROWS + 1)))).flat().map(row => ({ id: String(row._id), definicionId: String(row.definicionAtributoId), activo: row.activo }));
  const incompleteAssignments = validarCompletitudAsignaciones(selectedAssignments.filter(row => row.tipoDato === "OPCION"), options);
  if (incompleteAssignments.length) return { effective, status: "INVALID", violations: incompleteAssignments.map(id => ({ code: "OPTION_SET_EMPTY" as const, detail: id })) };
  const selectedIds = new Set(selectedAssignments.map(row => row.id));
  const activeOptionIds = new Set(options.filter(option => option.activo).map(option => option.id));
  const compatibilityRows = await ctx.db.query("politicasCompatibilidadOpciones").withIndex("porTipo", q => q.eq("tipoRecursoId", typeId)).take(MAX_AGGREGATE_ROWS + 1);
  const optionById = new Map(options.map(option => [option.id, option]));
  const compatibilityPolicies = [] as Array<{ active: boolean; allowlist: boolean; hasRelation: boolean; valid?: boolean }>;
  for (const policy of compatibilityRows) if (policy.activo) {
    const origin = selectedAssignments.find(row => row.id === String(policy.atributoOrigenId));
    const destination = selectedAssignments.find(row => row.id === String(policy.atributoDestinoId));
    const relations = await ctx.db.query("relacionesOpcionesAtributo").withIndex("porPolitica", q => q.eq("politicaCompatibilidadId", policy._id)).take(MAX_AGGREGATE_ROWS + 1);
    let valid = Boolean(origin && destination && origin.tipoDato === "OPCION" && destination.tipoDato === "OPCION"); let hasRelation = false;
    for (const relation of relations) {
      const source = optionById.get(String(relation.opcionOrigenId)); const target = optionById.get(String(relation.opcionDestinoId));
      if (relation.activo && source?.activo && target?.activo) hasRelation = true;
      if (relation.activo && (!source || !target || source.definicionId !== origin?.definicionId || target.definicionId !== destination?.definicionId)) valid = false;
    }
    if (compatibilityRows.some(other => other.activo && other._id !== policy._id && politicasCompatibilidadEnConflicto(policy, other))) valid = false;
    compatibilityPolicies.push({ active: true, allowlist: policy.modo === "ALLOWLIST", hasRelation, valid });
  }
  const ruleViolations = validarReglasCondicionales(rules.map(row => ({ id: String(row._id), atributoCondicionId: String(row.atributoCondicionId), opcionCondicionId: row.opcionCondicionId === undefined ? undefined : String(row.opcionCondicionId), atributoAfectadoId: String(row.atributoAfectadoId), aplicabilidad: row.aplicabilidad, activo: row.activo } satisfies ReglaCondicional)), selectedIds, activeOptionIds);
  if (ruleViolations.length) return { effective, status: "INVALID", violations: ruleViolations.map(violation => ({ code: violation.code, detail: violation.detail })) };
  const familyRows = familyPolicies.filter(policy => policy.tipoRecursoId === undefined);
  const typeRows = typePolicies;
  if (familyRows.length === 0 && typeRows.length === 0 && presentations.length === 0 && rules.length === 0 && compatibilityPolicies.length === 0) return { effective, status: "NOT_EVALUATED", violations: [] };
  const allPolicies = [...familyRows, ...typeRows];
  const unitActivity = new Map(await Promise.all([...new Set(allPolicies.map(policy => policy.unidadId))].map(async id => [id, Boolean((await ctx.db.get(id))?.activo)] as const)));
  const toDomain = (policy: typeof allPolicies[number]): PoliticaUnidadEfectiva => ({ id: String(policy._id), familiaRecursoId: String(policy.familiaRecursoId), tipoRecursoId: policy.tipoRecursoId === undefined ? undefined : String(policy.tipoRecursoId), unidadId: String(policy.unidadId), activo: policy.activo, principal: policy.principal, unidadActiva: unitActivity.get(policy.unidadId) === true });
  const resolution = resolverUnidadesEfectivas({ familia: familyRows.map(toDomain), tipo: typeRows.map(toDomain), tipoEfectivo: effective });
  const principalUnits = resolution.selected.map(policy => ({ active: policy.activo, principal: policy.principal, unitActive: policy.unidadActiva }));
  const selectedById = new Map(selectedAssignments.map(assignment => [assignment.id, assignment]));
  const presentationPolicies = presentations.map(policy => {
    const violations: AggregateViolation[] = [];
    const structure = validarEstructuraPresentacion({ tokens: policy.tokens as never[], separador: policy.separador });
    if (structure) violations.push({ code: "PRESENTATION_TOKEN_INVALID", detail: structure });
    if (policy.activo) for (const token of policy.tokens) if (token.tipo === "ATTRIBUTE_VALUE") {
      const assignment = selectedById.get(String(token.atributoRecursoId));
      if (!assignment || !assignment.activo || assignment.aplicabilidad === "FORBIDDEN" || assignment.aplicabilidad === "NOT_APPLICABLE" || !definitions.get(assignment.definicionId)?.activo) violations.push({ code: "PRESENTATION_TOKEN_INVALID", detail: "token does not reference an effective value-bearing assignment" });
    }
    return { active: policy.activo, tokenCount: policy.tokens.length, violations };
  });
  const result = validarAgregado({
    effective,
    hierarchy: { typeId: type._id, familyId: family._id, classId: clase._id, familyOfTypeId: type.familiaRecursoId, classOfFamilyId: family.claseRecursoId },
    principalUnits,
    presentationPolicies,
    compatibilityPolicies,
  });
  return { effective, ...result };
}
