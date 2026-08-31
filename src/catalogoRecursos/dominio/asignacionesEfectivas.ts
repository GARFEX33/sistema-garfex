export type AplicabilidadAsignacion = "REQUIRED" | "OPTIONAL" | "CONDITIONAL" | "FORBIDDEN" | "NOT_APPLICABLE";
export type AsignacionEfectiva = {
  id: string; familiaId: string; tipoId?: string; definicionId: string; definicionClave: string; tipoDato?: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
  activo: boolean; aplicabilidad: AplicabilidadAsignacion; participaIdentidad: boolean; orden: number;
};
export type ResolucionAsignaciones = {
  selected: AsignacionEfectiva[]; shadowed: AsignacionEfectiva[]; suppressed: AsignacionEfectiva[];
};
export type OpcionAsignacion = { id: string; definicionId: string; activo: boolean };

/** Assignment selection deliberately precedes active/applicability filtering. */
export function resolverAsignaciones(input: { familia: AsignacionEfectiva[]; tipo: AsignacionEfectiva[]; familiaId: string; tipoId: string; efectivo?: boolean }): ResolucionAsignaciones {
  const byDefinition = new Map<string, AsignacionEfectiva>();
  for (const row of input.familia) if (row.familiaId === input.familiaId && row.tipoId === undefined) byDefinition.set(row.definicionId, row);
  const shadowed: AsignacionEfectiva[] = [];
  for (const row of input.tipo) if (row.familiaId === input.familiaId && row.tipoId === input.tipoId) {
    if (byDefinition.has(row.definicionId)) shadowed.push(byDefinition.get(row.definicionId)!);
    byDefinition.set(row.definicionId, row);
  }
  const selected = [...byDefinition.values()];
  const suppressed = selected.filter(row => !row.activo || input.efectivo === false);
  return { selected: selected.filter(row => !suppressed.includes(row)), shadowed, suppressed };
}

export function ordenAsignaciones(left: AsignacionEfectiva, right: AsignacionEfectiva): number {
  return left.orden - right.orden || compare(left.definicionClave, right.definicionClave) || compare(left.id, right.id);
}

export function proyectarAsignacionesEfectivas<T extends AsignacionEfectiva>(rows: readonly T[], values: ReadonlyMap<string, unknown> = new Map()): Array<T & { value?: unknown }> {
  return rows.filter(row => row.activo && row.aplicabilidad !== "FORBIDDEN" && row.aplicabilidad !== "NOT_APPLICABLE")
    .sort(ordenAsignaciones)
    .map(row => values.has(row.id) ? { ...row, value: values.get(row.id) } : row);
}

export function aplicabilidadBase(value: AplicabilidadAsignacion): "REQUIRED" | "OPTIONAL" | "FORBIDDEN" | "NOT_APPLICABLE" {
  return value === "CONDITIONAL" ? "OPTIONAL" : value;
}

export function validarCompletitudAsignaciones(rows: readonly AsignacionEfectiva[], options: readonly OpcionAsignacion[]): string[] {
  const optionCounts = new Map<string, number>();
  for (const option of options) if (option.activo) optionCounts.set(option.definicionId, (optionCounts.get(option.definicionId) ?? 0) + 1);
  return rows.filter(row => row.activo && row.aplicabilidad !== "FORBIDDEN" && row.aplicabilidad !== "NOT_APPLICABLE")
    .filter(row => (optionCounts.get(row.definicionId) ?? 0) === 0).map(row => row.id);
}

export function proyectarIdentidad<T extends AsignacionEfectiva>(rows: readonly T[], values: ReadonlyMap<string, unknown>): Array<T & { value: unknown }> {
  return proyectarAsignacionesEfectivas(rows, values).filter(row => row.participaIdentidad && values.has(row.id)).map(row => ({ ...row, value: values.get(row.id) }));
}

export function seleccionAsignacion(resolution: ResolucionAsignaciones, id: string): "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE" {
  if (resolution.selected.some(row => row.id === id)) return "SELECTED";
  if (resolution.shadowed.some(row => row.id === id)) return "SHADOWED";
  if (resolution.suppressed.some(row => row.id === id)) return "SUPPRESSED";
  return "NONE";
}

function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
