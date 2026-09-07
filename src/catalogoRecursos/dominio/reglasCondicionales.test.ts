import { describe, expect, it } from "vitest";
import {
  evaluarReglasCondicionales,
  evaluarReglasCondicionalesSeleccion,
  detectarConflictosReglas,
  detectarConflictosReglasSeleccion,
  proyectarReglasLegado,
  type ReglaCondicional,
} from "./reglasCondicionales";

const rule = (overrides: Partial<ReglaCondicional> = {}): ReglaCondicional => ({
  id: "r", atributoCondicionId: "a", atributoAfectadoId: "b", aplicabilidad: "REQUIRED", activo: true, ...overrides,
});

describe("reglas condicionales", () => {
  it("uses raw presence for false, zero, and empty string and keeps CONDITIONAL optional", () => {
    for (const value of [false, 0, ""]) {
      const result = evaluarReglasCondicionales(
        [rule()], new Map([["a", value]]), new Map([["b", "CONDITIONAL"]]),
      );
      expect(result.get("b")).toBe("REQUIRED");
    }
    expect(evaluarReglasCondicionales([], new Map(), new Map([["b", "CONDITIONAL"]])).get("b")).toBe("OPTIONAL");
  });

  it("is order independent, permits same-result paths, and reports contradictory co-fire", () => {
    const same = [rule({ id: "r2", atributoCondicionId: "c" }), rule({ id: "r1" })];
    const values = new Map<string, unknown>([["a", true], ["c", true]]);
    expect([...evaluarReglasCondicionales(same, values, new Map())]).toEqual([["b", "REQUIRED"]]);
    expect([...evaluarReglasCondicionales([...same].reverse(), values, new Map())]).toEqual([["b", "REQUIRED"]]);
    expect(detectarConflictosReglas([rule(), rule({ id: "x", atributoCondicionId: "c", aplicabilidad: "FORBIDDEN" })])).toHaveLength(1);
    expect(detectarConflictosReglas([rule(), rule({ id: "x", atributoCondicionId: "c" })])).toEqual([]);
  });

  it("does not iterate derived applicability through A-to-B/B-to-A cycles and ignores inactive rules", () => {
    const rules = [rule({ id: "ab", atributoCondicionId: "a", atributoAfectadoId: "b" }), rule({ id: "ba", atributoCondicionId: "b", atributoAfectadoId: "a" }), rule({ id: "off", activo: false, atributoCondicionId: "a", atributoAfectadoId: "c" })];
    const result = evaluarReglasCondicionales(rules, new Map([["a", true]]), new Map([["a", "OPTIONAL"], ["b", "OPTIONAL"], ["c", "OPTIONAL"]]));
    expect(result).toEqual(new Map([["a", "OPTIONAL"], ["b", "REQUIRED"], ["c", "OPTIONAL"]]));
  });

  it("keeps allowed-only rules out of legacy evaluation while selection rules match allowed-value IDs", () => {
    const allowedOnly = rule({ valorPermitidoCondicionId: "value-a" });
    expect(proyectarReglasLegado([allowedOnly])).toEqual([]);
    expect(evaluarReglasCondicionales(proyectarReglasLegado([allowedOnly]), new Map([["a", false]]), new Map([["b", "CONDITIONAL"]])).get("b")).toBe("OPTIONAL");
    expect(evaluarReglasCondicionalesSeleccion([allowedOnly], new Map([["a", "value-a"]]), new Map([["b", "CONDITIONAL"]])).get("b")).toBe("REQUIRED");
    expect(evaluarReglasCondicionalesSeleccion([allowedOnly], new Map([["a", "value-b"]]), new Map([["b", "CONDITIONAL"]])).get("b")).toBe("OPTIONAL");
    expect(detectarConflictosReglasSeleccion([allowedOnly, rule({ id: "other", aplicabilidad: "FORBIDDEN", valorPermitidoCondicionId: "value-b" })])).toEqual([]);
  });

  it("keeps presence-only predicates in both projections and excludes unmapped legacy predicates from selection", () => {
    const presence = rule();
    const legacyOnly = rule({ id: "legacy", opcionCondicionId: "option-a" });
    expect(evaluarReglasCondicionalesSeleccion([presence], new Map([["a", "selected"]]), new Map([["b", "CONDITIONAL"]])).get("b")).toBe("REQUIRED");
    expect(evaluarReglasCondicionalesSeleccion([legacyOnly], new Map([["a", "selected"]]), new Map([["b", "CONDITIONAL"]])).get("b")).toBe("OPTIONAL");
    expect(detectarConflictosReglasSeleccion([rule({ valorPermitidoCondicionId: "value-a" }), rule({ id: "same", aplicabilidad: "FORBIDDEN", valorPermitidoCondicionId: "value-a" })])).toHaveLength(1);
  });
});
