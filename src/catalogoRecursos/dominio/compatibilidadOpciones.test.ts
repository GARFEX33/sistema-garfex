import { describe, expect, it } from "vitest";
import { evaluarCompatibilidadOpciones, type PoliticaCompatibilidad } from "./compatibilidadOpciones";

const base: PoliticaCompatibilidad = {
  atributoOrigenClave: "A", atributoDestinoClave: "B", modo: "ALLOWLIST", direccion: "DIRECTIONAL",
  pares: [{ origenOpcionClave: "A1", destinoOpcionClave: "B1" }],
};
const evalua = (policies: readonly PoliticaCompatibilidad[], a = "A1", b = "B1") => evaluarCompatibilidadOpciones(policies, "A", a, "B", b);

describe("evaluador de compatibilidad de opciones", () => {
  it("permite sin política y restringe por allowlist", () => {
    expect(evalua([])).toBe(true);
    expect(evalua([base])).toBe(true);
    expect(evalua([base], "A2")).toBe(false);
  });
  it("aplica denylist con precedencia y admite simetría", () => {
    expect(evalua([{ ...base, modo: "DENYLIST" }])).toBe(false);
    expect(evalua([{ ...base, direccion: "SYMMETRIC" }], "B1", "A1")).toBe(true);
    expect(evalua([{ ...base, modo: "DENYLIST", direccion: "SYMMETRIC" }], "B1", "A1")).toBe(false);
  });
  it("evalúa la simetría con el alcance invertido", () => {
    const symmetric: PoliticaCompatibilidad = { ...base, direccion: "SYMMETRIC" };
    expect(evaluarCompatibilidadOpciones([symmetric], "B", "B1", "A", "A1")).toBe(true);
    expect(evaluarCompatibilidadOpciones([symmetric], "B", "B2", "A", "A1")).toBe(false);
  });
  it("mantiene precedencia denylist en ambos órdenes e ignora alcances ajenos", () => {
    const allow = { ...base };
    const deny: PoliticaCompatibilidad = { ...base, modo: "DENYLIST" };
    const unrelated = { ...base, atributoOrigenClave: "X", atributoDestinoClave: "Y" };
    expect(evalua([allow, deny])).toBe(false);
    expect(evalua([deny, allow])).toBe(false);
    expect(evalua([unrelated])).toBe(true);
  });
  it("exige todas las allowlists aplicables", () => {
    expect(evalua([base, { ...base, pares: [{ origenOpcionClave: "A1", destinoOpcionClave: "B2" }] }])).toBe(false);
  });
});
