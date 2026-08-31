import { describe, expect, it } from "vitest";
import { validarAgregado, type AgregadoInput } from "./validacionAgregado";

const base: AgregadoInput = {
  effective: true,
  hierarchy: { typeId: "t", familyId: "f", classId: "c", familyOfTypeId: "f", classOfFamilyId: "c" },
  principalUnits: [{ active: true, unitActive: true }],
  presentationPolicies: [{ active: true, tokenCount: 1 }],
};

describe("validación de agregado", () => {
  it("devuelve VALID para el mínimo completo y NOT_EVALUATED para una rama inerte", () => {
    expect(validarAgregado(base)).toMatchObject({ status: "VALID", violations: [] });
    expect(validarAgregado({ ...base, effective: false })).toMatchObject({ status: "NOT_EVALUATED", violations: [] });
  });

  it("acumula violaciones codificadas sin aceptar unidades o presentación incompletas", () => {
    const result = validarAgregado({ ...base, principalUnits: [], presentationPolicies: [] });
    expect(result.status).toBe("INVALID");
    expect(result.violations.map(violation => violation.code)).toEqual(["PRINCIPAL_UNIT_COUNT", "PRESENTATION_COUNT"]);
  });
});
