import { describe, expect, it } from "vitest";
import { resolverCatalogoEfectivo } from "./catalogoEfectivo";
import type { CatalogoSnapshot } from "./tipos";

const snapshot = (overrides: Partial<CatalogoSnapshot> = {}): CatalogoSnapshot => ({
  clase: { id: "c", clave: "C", activo: true },
  familia: { id: "f", clave: "F", activo: true, claseRecursoId: "c" },
  tipo: { id: "t", clave: "T", activo: true, familiaRecursoId: "f" },
  unidad: { id: "u", activo: true },
  politicas: [
    { id: "family-u", familiaRecursoId: "f", unidadId: "u", activo: true },
    { id: "type-u", familiaRecursoId: "f", tipoRecursoId: "t", unidadId: "u", activo: false },
  ],
  atributos: [
    { id: "family-a", familiaId: "f", definicionId: "d", definicionClave: "D", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, definicion: { id: "d", clave: "D", tipoDato: "TEXTO", activo: true } } as never,
    { id: "type-a", familiaId: "f", tipoId: "t", definicionId: "d", definicionClave: "D", activo: false, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 2, definicion: { id: "d", clave: "D", tipoDato: "TEXTO", activo: true } } as never,
  ],
  reglas: [], opciones: [],
  ...overrides,
});

describe("resolver único de efectividad del catálogo", () => {
  it("aplica la matriz de jerarquía antes de toda configuración", () => {
    const result = resolverCatalogoEfectivo(snapshot({ familia: { id: "f", clave: "F", activo: false, claseRecursoId: "c" } }));
    expect(result).toMatchObject({ effective: false, effectiveReasons: ["FAMILY_INACTIVE"], policies: [], assignments: [], rules: [], options: [] });
  });

  it("selecciona overrides por unidad y definición antes de filtrar activos", () => {
    const result = resolverCatalogoEfectivo(snapshot());
    expect(result.policies.map(row => row.id)).toEqual([]);
    expect(result.assignments.map(row => row.id)).toEqual([]);
    expect(result.suppressed.map(row => row.id)).toEqual(["type-u", "type-a"]);
  });

  it("no muta snapshots dirty y conserva presencia de false, cero y vacío", () => {
    const input = snapshot();
    const before = JSON.stringify(input);
    const values = new Map<string, unknown>([["a", false], ["b", 0], ["c", ""]]);
    const result = resolverCatalogoEfectivo(input, values);
    expect(JSON.stringify(input)).toBe(before);
    expect(result.values.has("a")).toBe(true);
    expect(result.values.has("b")).toBe(true);
    expect(result.values.has("c")).toBe(true);
  });
});
