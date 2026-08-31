import { describe, expect, it } from "vitest";
import { resolverUnidadesEfectivas, type PoliticaUnidadEfectiva } from "./unidadesEfectivas";

const policy = (id: string, unitId: string, activo: boolean, principal = false, tipoRecursoId?: string): PoliticaUnidadEfectiva => ({ id, familiaRecursoId: "f", tipoRecursoId, unidadId: unitId, activo, principal, unidadActiva: true });

describe("precedencia efectiva de unidades", () => {
  it("selecciona por unidad, permite herencia independiente y deja diagnóstico de sombra", () => {
    const result = resolverUnidadesEfectivas({
      familia: [policy("family-1", "u1", true, true), policy("family-2", "u2", true)],
      tipo: [policy("type-1", "u1", true, false, "t")],
      tipoEfectivo: true,
    });
    expect(result.selected.map(row => row.id)).toEqual(["type-1", "family-2"]);
    expect(result.shadowed.map(row => row.id)).toEqual(["family-1"]);
  });

  it("does not inherit when an inactive Type override occupies a Unit", () => {
    const result = resolverUnidadesEfectivas({ familia: [policy("family", "u", true, true)], tipo: [policy("override", "u", false, true, "t")] , tipoEfectivo: true });
    expect(result.selected).toEqual([]);
    expect(result.suppressed.map(row => row.id)).toEqual(["override"]);
  });

  it("counts only usable selected principals", () => {
    expect(resolverUnidadesEfectivas({ familia: [policy("a", "u1", true, true), policy("b", "u2", true, true)], tipo: [], tipoEfectivo: true }).principalCount).toBe(2);
    expect(resolverUnidadesEfectivas({ familia: [policy("a", "u1", true, true)], tipo: [], tipoEfectivo: false }).principalCount).toBe(0);
  });
});
