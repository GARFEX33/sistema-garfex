import { describe, expect, it } from "vitest";
import { compararPuntosCodigo, huellaCatalogoSeleccion, type HuellaGraph } from "./huellaCatalogoSeleccion";

const input = { claseRecursoId: "class", familiaRecursoId: "family", tipoRecursoId: "type", unidadId: "unit", ownership: { kind: "GLOBAL" as const } };
const graph = (overrides: Record<string, unknown> = {}): HuellaGraph => ({
  clase: { id: "class", clave: "CLASS", activo: true },
  familia: { id: "family", clave: "FAMILY", activo: true },
  tipo: { id: "type", clave: "TYPE", nombre: "Type", activo: true },
  unidad: { id: "unit", activo: true },
  familiaAsignaciones: [{ id: "identity", familiaId: "family", definicionId: "definition", definicionClave: "definition", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 0 }], tipoAsignaciones: [], reglas: [], opciones: [],
  valoresPermitidos: [
    { id: "z", definicionAtributoId: "definition", clave: "z", nombre: "Zulu", orden: 0, activo: true, valor: { kind: "TEXTO", value: "runtime" } },
    { id: "a", definicionAtributoId: "definition", clave: "a", nombre: "Alpha", orden: 0, activo: true, valor: { kind: "TEXTO", value: "runtime" } },
  ],
  ...overrides,
});

describe("huellaCatalogoSeleccion", () => {
  it("is stable across storage order but changes with a name-visible label", async () => {
    const ordered = await huellaCatalogoSeleccion(input, graph());
    const reordered = await huellaCatalogoSeleccion(input, graph({ valoresPermitidos: [...graph().valoresPermitidos].reverse() }));
    const renamed = await huellaCatalogoSeleccion(input, graph({ valoresPermitidos: [{ ...graph().valoresPermitidos[0], nombre: "Changed" }, graph().valoresPermitidos[1]] }));

    expect(reordered).toBe(ordered);
    expect(renamed).not.toBe(ordered);
  });

  it("changes when a non-identity allowed display label changes", async () => {
    const nonIdentityGraph = graph({
      familiaAsignaciones: [{ ...graph().familiaAsignaciones[0], participaIdentidad: false }],
    });
    const original = await huellaCatalogoSeleccion(input, nonIdentityGraph);
    const renamed = await huellaCatalogoSeleccion(input, {
      ...nonIdentityGraph,
      valoresPermitidos: nonIdentityGraph.valoresPermitidos.map((value) => value.id === "a" ? { ...value, nombre: "Renamed non-identity choice" } : value),
    });

    expect(renamed).not.toBe(original);
  });

  it("uses total sentinels for unresolved input and ignores publication-only fields", async () => {
    const missing = await huellaCatalogoSeleccion({ ...input, tipoRecursoId: "missing" }, graph({ tipo: undefined }));
    const changedPublication = await huellaCatalogoSeleccion({ ...input, tipoRecursoId: "missing" }, graph({ tipo: undefined, snapshotVersion: 2, hashContenido: "published" }));

    expect(missing).toMatch(/^[a-f0-9]{64}$/);
    expect(changedPublication).toBe(missing);
  });

  it("changes when hierarchy relationships, validity, or effective Unit-policy semantics change", async () => {
    const effectivePolicies = [{ id: "family-unit", familiaRecursoId: "family", unidadId: "unit", activo: true, principal: true, unidad: { id: "unit", clave: "UNIT", activo: true }, state: "SELECTED" }];
    const baselineGraph = graph({
      hierarchyValid: true,
      unitValid: true,
      familia: { ...graph().familia!, claseRecursoId: "class" } as HuellaGraph["familia"],
      tipo: { ...graph().tipo!, familiaRecursoId: "family" } as HuellaGraph["tipo"],
      politicasUnidadEfectivas: effectivePolicies,
    });
    const baseline = await huellaCatalogoSeleccion(input, baselineGraph);
    const relationshipChanged = await huellaCatalogoSeleccion(input, { ...baselineGraph, familia: { ...baselineGraph.familia!, claseRecursoId: "other-class" } as HuellaGraph["familia"] });
    const hierarchyInvalid = await huellaCatalogoSeleccion(input, { ...baselineGraph, hierarchyValid: false });
    const policyAdded = await huellaCatalogoSeleccion(input, { ...baselineGraph, politicasUnidadEfectivas: [...effectivePolicies, { id: "type-unit", familiaRecursoId: "family", tipoRecursoId: "type", unidadId: "other-unit", activo: true, principal: false, unidad: { id: "other-unit", clave: "OTHER", activo: true }, state: "SELECTED" }] });
    const policyRemoved = await huellaCatalogoSeleccion(input, { ...baselineGraph, politicasUnidadEfectivas: [] });
    const policyOverride = await huellaCatalogoSeleccion(input, { ...baselineGraph, politicasUnidadEfectivas: [{ ...effectivePolicies[0], tipoRecursoId: "type" }] });
    const principalChanged = await huellaCatalogoSeleccion(input, { ...baselineGraph, politicasUnidadEfectivas: [{ ...effectivePolicies[0], principal: false }] });
    const unitInactive = await huellaCatalogoSeleccion(input, { ...baselineGraph, politicasUnidadEfectivas: [{ ...effectivePolicies[0], unidad: { ...effectivePolicies[0].unidad, activo: false } }] });

    expect(relationshipChanged).not.toBe(baseline);
    expect(hierarchyInvalid).not.toBe(baseline);
    expect(policyAdded).not.toBe(baseline);
    expect(policyRemoved).not.toBe(baseline);
    expect(policyOverride).not.toBe(baseline);
    expect(principalChanged).not.toBe(baseline);
    expect(unitInactive).not.toBe(baseline);
  });

  it("orders Unicode keys by code point rather than UTF-16 storage units", () => {
    expect(compararPuntosCodigo("\u{1F600}", "\uFFFF")).toBeGreaterThan(0);
  });

  it("changes for organization state and the current key of a referenced option", async () => {
    const organizationInput = { ...input, ownership: { kind: "ORGANIZATION" as const, organizacionId: "org" } };
    const valoresPermitidos = [...graph().valoresPermitidos, { id: "option-value", definicionAtributoId: "definition", clave: "option", nombre: "Option", orden: 1, activo: true, valor: { kind: "OPCION" as const, opcionAtributoId: "option" } }];
    const base = await huellaCatalogoSeleccion(organizationInput, graph({ valoresPermitidos, organizacion: { id: "org", activo: true }, opciones: [{ id: "option", definicionAtributoId: "definition", clave: "é", activo: true }] }));
    const inactive = await huellaCatalogoSeleccion(organizationInput, graph({ valoresPermitidos, organizacion: { id: "org", activo: false }, opciones: [{ id: "option", definicionAtributoId: "definition", clave: "é", activo: true }] }));
    const optionChanged = await huellaCatalogoSeleccion(organizationInput, graph({ valoresPermitidos, organizacion: { id: "org", activo: true }, opciones: [{ id: "option", definicionAtributoId: "definition", clave: "z", activo: true }] }));

    expect(inactive).not.toBe(base);
    expect(optionChanged).not.toBe(base);
  });
});
