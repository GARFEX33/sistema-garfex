import { describe, expect, it } from "vitest";
import {
  evaluarReglasCondicionales,
  detectarConflictosReglas,
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
});
