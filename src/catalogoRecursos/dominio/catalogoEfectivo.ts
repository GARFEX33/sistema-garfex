import { resolverAsignaciones, type AsignacionEfectiva } from "./asignacionesEfectivas";
import { resolverUnidadesEfectivas, type PoliticaUnidadEfectiva } from "./unidadesEfectivas";
import type { CatalogoSnapshot, IdDominio } from "./tipos";

export type RazonEfectividad = "CLASS_INACTIVE" | "FAMILY_INACTIVE" | "TYPE_INACTIVE" | "HIERARCHY_INVALID" | "MISSING_REFERENCE";
export type EffectivePolicy = PoliticaUnidadEfectiva & { principal?: boolean };
export type EffectiveAssignment = AsignacionEfectiva & { definicion?: { id: string; clave: string; tipoDato: AsignacionEfectiva["tipoDato"]; activo: boolean } };
export type EffectiveCatalog = {
  effective: boolean;
  effectiveReasons: RazonEfectividad[];
  policies: EffectivePolicy[];
  assignments: EffectiveAssignment[];
  rules: CatalogoSnapshot["reglas"];
  options: CatalogoSnapshot["opciones"];
  values: Map<string, unknown>;
  shadowed: Array<EffectivePolicy | EffectiveAssignment>;
  suppressed: Array<EffectivePolicy | EffectiveAssignment>;
};

type HierarchyInput = {
  classId?: string;
  familyId?: string;
  typeId?: string;
  familyClassId?: string;
  typeFamilyId?: string;
  classActive?: boolean;
  familyActive?: boolean;
  typeActive?: boolean;
  overrides?: { classActive?: boolean; familyActive?: boolean; typeActive?: boolean };
};

/** The sole hierarchy effectiveness decision used by database adapters. */
export function resolverJerarquiaEfectiva(input: HierarchyInput): { effective: boolean; reasons: RazonEfectividad[] } {
  const classActive = input.overrides?.classActive ?? input.classActive;
  const familyActive = input.overrides?.familyActive ?? input.familyActive;
  const typeActive = input.overrides?.typeActive ?? input.typeActive;
  const reasons: RazonEfectividad[] = [];
  if (input.classId === undefined || input.familyId === undefined || input.typeId === undefined) reasons.push("MISSING_REFERENCE");
  if (input.familyClassId !== undefined && input.classId !== input.familyClassId) reasons.push("HIERARCHY_INVALID");
  if (input.typeFamilyId !== undefined && input.familyId !== input.typeFamilyId) reasons.push("HIERARCHY_INVALID");
  if (classActive !== true) reasons.push("CLASS_INACTIVE");
  if (familyActive !== true) reasons.push("FAMILY_INACTIVE");
  if (typeActive !== true) reasons.push("TYPE_INACTIVE");
  return { effective: reasons.length === 0, reasons: [...new Set(reasons)] };
}

const asString = (value: unknown): string | undefined => value === undefined ? undefined : String(value);

/**
 * Resolve one immutable input snapshot. Selection precedes active filtering so an
 * inactive Type override still suppresses inherited Family configuration.
 */
export function resolverCatalogoEfectivo(snapshot: CatalogoSnapshot, values: ReadonlyMap<string, unknown> = new Map()): EffectiveCatalog {
  const hierarchy = resolverJerarquiaEfectiva({
    classId: snapshot.clase?.id,
    familyId: snapshot.familia?.id,
    typeId: snapshot.tipo?.id,
    familyClassId: snapshot.familia?.claseRecursoId,
    typeFamilyId: snapshot.tipo?.familiaRecursoId,
    classActive: snapshot.clase?.activo,
    familyActive: snapshot.familia?.activo,
    typeActive: snapshot.tipo?.activo,
  });
  const empty = { policies: [], assignments: [], rules: [], options: [], values: new Map(values), shadowed: [], suppressed: [] };
  if (!hierarchy.effective) return { effective: false, effectiveReasons: hierarchy.reasons, ...empty };

  const policyRows = snapshot.politicas.map(row => {
    const candidate = row as typeof row & { principal?: boolean; unidadActiva?: boolean };
    return { ...candidate, id: candidate.id, activo: candidate.activo, principal: candidate.principal ?? false, unidadActiva: candidate.unidadActiva ?? true };
  });
  const unitResolution = resolverUnidadesEfectivas({
    familia: policyRows.filter(row => row.tipoRecursoId === undefined),
    tipo: policyRows.filter(row => row.tipoRecursoId === snapshot.tipo!.id),
    tipoEfectivo: true,
  });

  const attributes = snapshot.atributos.map(row => {
    const candidate = row as typeof row & { familiaId?: string; tipoId?: string; definicionId?: string; definicionClave?: string; orden?: number };
    const definition = row.definicion;
    return {
      ...candidate,
      id: row.id,
      familiaId: candidate.familiaId ?? snapshot.familia!.id,
      tipoId: candidate.tipoId ?? row.tipoRecursoId,
      definicionId: candidate.definicionId ?? row.definicionAtributoId,
      definicionClave: candidate.definicionClave ?? definition?.clave ?? row.definicionAtributoId,
      tipoDato: definition?.tipoDato,
      orden: candidate.orden ?? 0,
    } as EffectiveAssignment;
  });
  const assignmentResolution = resolverAsignaciones({
    familia: attributes.filter(row => row.tipoId === undefined),
    tipo: attributes.filter(row => row.tipoId === snapshot.tipo!.id),
    familiaId: snapshot.familia!.id,
    tipoId: snapshot.tipo!.id,
    efectivo: true,
  });
  const selectedIds = new Set(assignmentResolution.selected.map(row => row.id));
  const assignments: EffectiveAssignment[] = assignmentResolution.selected
    .map(row => (attributes.find(candidate => candidate.id === row.id) ?? row) as EffectiveAssignment)
    .filter(row => row.activo && row.definicion?.activo !== false);
  const effectiveOptions = snapshot.opciones.filter(option => option.activo && assignments.some(row => row.definicionId === option.definicionAtributoId));
  const rules = snapshot.reglas.filter(rule => rule.activo && selectedIds.has(rule.atributoCondicionId) && selectedIds.has(rule.atributoAfectadoId) && (rule.opcionCondicionId === undefined || effectiveOptions.some(option => option.id === rule.opcionCondicionId)));
  const shadowed = [...unitResolution.shadowed, ...assignmentResolution.shadowed] as Array<EffectivePolicy | EffectiveAssignment>;
  const suppressed = [...unitResolution.suppressed, ...assignmentResolution.suppressed] as Array<EffectivePolicy | EffectiveAssignment>;
  return {
    effective: true,
    effectiveReasons: [],
    policies: unitResolution.selected as EffectivePolicy[],
    assignments,
    rules,
    options: effectiveOptions,
    values: new Map(values),
    shadowed,
    suppressed,
  };
}

export const resolverEfectividadCatalogo = resolverCatalogoEfectivo;
export type EffectiveId = IdDominio;
export { asString };
