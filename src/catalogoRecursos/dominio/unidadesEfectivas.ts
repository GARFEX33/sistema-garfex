export type PoliticaUnidadEfectiva = { id: string; familiaRecursoId: string; tipoRecursoId?: string; unidadId: string; activo: boolean; principal: boolean; unidadActiva: boolean };
export type ResolucionUnidades = { selected: PoliticaUnidadEfectiva[]; shadowed: PoliticaUnidadEfectiva[]; suppressed: PoliticaUnidadEfectiva[]; principalCount: number; inactiveUnitIds: string[] };

/** Selects Type rows before lifecycle filtering, so an inactive override suppresses inheritance. */
export function resolverUnidadesEfectivas(input: { familia: PoliticaUnidadEfectiva[]; tipo: PoliticaUnidadEfectiva[]; tipoEfectivo: boolean }): ResolucionUnidades {
  const typeByUnit = new Map(input.tipo.map(row => [row.unidadId, row]));
  const selected: PoliticaUnidadEfectiva[] = [], shadowed: PoliticaUnidadEfectiva[] = [], suppressed: PoliticaUnidadEfectiva[] = [];
  for (const family of input.familia.filter(row => row.tipoRecursoId === undefined)) {
    const override = typeByUnit.get(family.unidadId);
    if (override) { shadowed.push(family); continue; }
    if (input.tipoEfectivo && family.activo) selected.push(family); else suppressed.push(family);
  }
  for (const type of input.tipo) {
    if (input.tipoEfectivo && type.activo) selected.push(type); else suppressed.push(type);
  }
  selected.sort((left, right) => left.unidadId < right.unidadId ? -1 : left.unidadId > right.unidadId ? 1 : 0);
  const inactiveUnitIds = selected.filter(row => !row.unidadActiva).map(row => row.unidadId);
  return { selected, shadowed, suppressed, inactiveUnitIds, principalCount: selected.filter(row => row.principal && row.unidadActiva).length };
}

export function politicaSeleccionada(resolution: ResolucionUnidades, id: string): "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE" {
  if (resolution.selected.some(row => row.id === id)) return "SELECTED";
  if (resolution.shadowed.some(row => row.id === id)) return "SHADOWED";
  if (resolution.suppressed.some(row => row.id === id)) return "SUPPRESSED";
  return "NONE";
}
