import { describe, expect, it } from "vitest";
import { evaluarCompatibilidadOpciones, identidadSlotCompatibilidad, normalizarParCompatibilidad, politicasCompatibilidadEnConflicto, type PoliticaCompatibilidad } from "./compatibilidadOpciones";

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
  it("ignora políticas inactivas y mantiene la dirección inversa direccional libre", () => {
    expect(evalua([{ ...base, activo: false } as PoliticaCompatibilidad & { activo: boolean }])).toBe(true);
    expect(evaluarCompatibilidadOpciones([{ ...base, modo: "DENYLIST" }], "B", "B1", "A", "A1")).toBe(true);
  });
  it("normaliza slots simétricos y separa modos", () => {
    expect(identidadSlotCompatibilidad("a", "b", "SYMMETRIC")).toBe("S|a|b");
    expect(identidadSlotCompatibilidad("b", "a", "SYMMETRIC")).toBe("S|a|b");
    expect(identidadSlotCompatibilidad("a", "b", "DIRECTIONAL")).toBe("D|a|b");
    expect(politicasCompatibilidadEnConflicto({ atributoOrigenId: "b", atributoDestinoId: "a", direccion: "DIRECTIONAL" }, { atributoOrigenId: "a", atributoDestinoId: "b", direccion: "DIRECTIONAL" })).toBe(false);
    expect(politicasCompatibilidadEnConflicto({ atributoOrigenId: "a", atributoDestinoId: "b", direccion: "SYMMETRIC" }, { atributoOrigenId: "b", atributoDestinoId: "a", direccion: "DIRECTIONAL" })).toBe(true);
    expect(normalizarParCompatibilidad("b", "B1", "a", "A1", "SYMMETRIC")).toEqual({ origenOpcionId: "a", origenOpcion: "A1", destinoOpcionId: "b", destinoOpcion: "B1" });
  });
});
