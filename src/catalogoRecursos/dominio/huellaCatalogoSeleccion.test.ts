import { describe, expect, it } from "vitest";
import { compararPuntosCodigo, huellaCatalogoSeleccion, type HuellaGraph } from "./huellaCatalogoSeleccion";

const input = { claseRecursoId: "class", familiaRecursoId: "family", tipoRecursoId: "type", unidadId: "unit", ownership: { kind: "GLOBAL" as const } };
const graph = (overrides: Record<string, unknown> = {}): HuellaGraph => ({
  clase: { id: "class", clave: "CLASS", activo: true },
  familia: { id: "family", clave: "FAMILY", activo: true, claseRecursoId: "class" },
  tipo: { id: "type", clave: "TYPE", nombre: "Type", activo: true, familiaRecursoId: "family" },
  unidad: { id: "unit", clave: "METRO_LINEAL", nombre: "Metro Lineal", activo: true },
  hierarchyValid: true,
  unitValid: true,
  familiaAsignaciones: [{ id: "identity", familiaId: "family", definicionId: "definition", definicionClave: "definition", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 0 }],
  tipoAsignaciones: [],
  reglas: [],
  opciones: [],
  valoresPermitidos: [
    { id: "z", definicionAtributoId: "definition", clave: "z", nombre: "Zulu", orden: 0, activo: true, valor: { kind: "TEXTO", value: "runtime" } },
    { id: "a", definicionAtributoId: "definition", clave: "a", nombre: "Alpha", orden: 0, activo: true, valor: { kind: "TEXTO", value: "runtime" } },
  ],
  ...overrides,
});

describe("huellaCatalogoSeleccion", () => {
  it("is deterministic across storage order and uses the v2 selection-only canonicalization", async () => {
    const ordered = await huellaCatalogoSeleccion(input, graph());
    const reordered = await huellaCatalogoSeleccion(input, graph({ valoresPermitidos: [...graph().valoresPermitidos].reverse() }));
    const source = (import.meta as ImportMeta & { glob: (pattern: string, options?: object) => Record<string, string> })
      .glob("./huellaCatalogoSeleccion.ts", { query: "?raw", import: "default", eager: true })["./huellaCatalogoSeleccion.ts"];

    expect(await huellaCatalogoSeleccion(input, graph())).toBe(ordered);
    expect(reordered).toBe(ordered);
    expect(ordered).toMatch(/^[a-f0-9]{64}$/);
    expect(ordered).not.toBe("f9fa49f24a655d678f1ed9969553074383bfe6af6182564c44167ee30b2e8095");
    expect(source).toContain("selection-catalog-fingerprint:v2");
    expect(source).not.toContain("politicasUnidadEfectivas");
  });

  it("ignores foreign, inactive, and invalid policy-shaped data", async () => {
    const baseline = await huellaCatalogoSeleccion(input, graph());
    const policyOnly = await huellaCatalogoSeleccion(input, {
      ...graph(),
      politicasUnidadEfectivas: [
        { id: "foreign", familiaRecursoId: "other-family", tipoRecursoId: "other-type", unidadId: "missing", activo: false, principal: false, state: "INVALID", unidad: { id: "other", activo: false } },
      ],
    } as HuellaGraph);

    expect(policyOnly).toBe(baseline);
  });

  it("invalidates for relevant Unit, hierarchy, ownership, attributes, values, options, and rules", async () => {
    const baseline = await huellaCatalogoSeleccion(input, graph());
    const organizationInput = { ...input, ownership: { kind: "ORGANIZATION" as const, organizacionId: "org" } };
    const organizationGraph = graph({ organizacion: { id: "org", activo: true } });
    const organization = await huellaCatalogoSeleccion(organizationInput, organizationGraph);
    const valuesWithOption = [...graph().valoresPermitidos, { id: "option-value", definicionAtributoId: "definition", clave: "option", nombre: "Option", orden: 1, activo: true, valor: { kind: "OPCION" as const, opcionAtributoId: "option" } }];

    await expect(huellaCatalogoSeleccion(input, graph({ unidad: { ...graph().unidad!, activo: false } }))).resolves.not.toBe(baseline);
    await expect(huellaCatalogoSeleccion(input, graph({ familia: { ...graph().familia!, claseRecursoId: "other-class" } }))).resolves.not.toBe(baseline);
    await expect(huellaCatalogoSeleccion(input, graph({ familiaAsignaciones: [{ ...graph().familiaAsignaciones[0], aplicabilidad: "OPTIONAL" }] }))).resolves.not.toBe(baseline);
    await expect(huellaCatalogoSeleccion(input, graph({ valoresPermitidos: [{ ...graph().valoresPermitidos[0], nombre: "Changed" }, graph().valoresPermitidos[1]] }))).resolves.not.toBe(baseline);
    await expect(huellaCatalogoSeleccion(input, graph({ valoresPermitidos: valuesWithOption, opciones: [{ id: "option", definicionAtributoId: "definition", clave: "NEW", activo: true }] }))).resolves.not.toBe(baseline);
    await expect(huellaCatalogoSeleccion(input, graph({ reglas: [{ id: "rule", atributoCondicionId: "identity", atributoAfectadoId: "identity", aplicabilidad: "OPTIONAL" }] }))).resolves.not.toBe(baseline);
    await expect(huellaCatalogoSeleccion(organizationInput, { ...organizationGraph, organizacion: { id: "org", activo: false } })).resolves.not.toBe(organization);
  });

  it("uses total sentinels for unresolved input and code-point ordering", async () => {
    await expect(huellaCatalogoSeleccion({ ...input, tipoRecursoId: "missing" }, graph({ tipo: undefined }))).resolves.toMatch(/^[a-f0-9]{64}$/);
    expect(compararPuntosCodigo("\u{1F600}", "\uFFFF")).toBeGreaterThan(0);
  });
});
