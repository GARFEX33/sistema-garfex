import { describe, expect, it } from "vitest";
import { validarAgregado, type AgregadoInput } from "./validacionAgregado";

const base: AgregadoInput = {
  effective: true,
  hierarchy: { typeId: "t", familyId: "f", classId: "c", familyOfTypeId: "f", classOfFamilyId: "c" },
  principalUnits: [{ active: true, unitActive: true }],
  presentationPolicies: [{ active: true, tokenCount: 1 }],
};

const codes = (input: AgregadoInput, purpose?: "ADMINISTRATION" | "RESOURCE") =>
  validarAgregado(input, purpose).violations.map(violation => violation.code);

describe("validación de agregado", () => {
  it("devuelve VALID para el mínimo completo y NOT_EVALUATED para una rama inerte", () => {
    expect(validarAgregado(base)).toMatchObject({ status: "VALID", violations: [] });
    expect(validarAgregado({ ...base, effective: false })).toMatchObject({ status: "NOT_EVALUATED", violations: [] });
  });

  it("conserva la administración por defecto ante unidades o presentación incompletas", () => {
    const result = validarAgregado({ ...base, principalUnits: [], presentationPolicies: [] });
    expect(result.status).toBe("INVALID");
    expect(result.violations.map(violation => violation.code)).toEqual(["PRINCIPAL_UNIT_COUNT", "PRESENTATION_COUNT"]);
  });

  it("acepta Resource sin políticas de Unidad pero conserva la presentación", () => {
    const withoutPolicies = { ...base, principalUnits: [] };
    expect(validarAgregado(withoutPolicies, "RESOURCE")).toMatchObject({ status: "VALID", violations: [] });
    expect(codes({ ...withoutPolicies, presentationPolicies: [] }, "RESOURCE")).toEqual(["PRESENTATION_COUNT"]);
  });

  it("Resource conserva jerarquía, deferred checks y violaciones no-policy", () => {
    expect(codes({ ...base, principalUnits: [], hierarchy: { ...base.hierarchy, familyOfTypeId: "other" } }, "RESOURCE"))
      .toEqual(["HIERARCHY_REFERENCE_INVALID"]);
    expect(validarAgregado({ ...base, principalUnits: [], deferredChecks: [{ status: "NOT_EVALUATED" }] }, "RESOURCE").status)
      .toBe("NOT_EVALUATED");
    expect(codes({
      ...base,
      principalUnits: [],
      deferredChecks: [{ status: "VALID", violations: [{ code: "OPTION_SET_EMPTY" }, { code: "RULE_CONFLICT" }, { code: "CATALOG_LIMIT_EXCEEDED" }] }],
    }, "RESOURCE")).toEqual(["OPTION_SET_EMPTY", "RULE_CONFLICT", "CATALOG_LIMIT_EXCEEDED"]);
    expect(codes({
      ...base,
      principalUnits: [],
      compatibilityPolicies: [{ active: true, allowlist: true, hasRelation: false }],
    }, "RESOURCE")).toEqual(["ALLOWLIST_EMPTY"]);
  });

  it("omite sólo fallas policy-only cuando hay una violación no relacionada", () => {
    const mixed = { ...base, principalUnits: [{ active: true, unitActive: false }], presentationPolicies: [] };
    expect(codes(mixed)).toEqual(["UNIT_INACTIVE", "PRESENTATION_COUNT"]);
    expect(codes(mixed, "RESOURCE")).toEqual(["PRESENTATION_COUNT"]);
  });
});
