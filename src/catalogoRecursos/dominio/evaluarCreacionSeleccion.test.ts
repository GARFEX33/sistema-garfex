import { describe, expect, it } from "vitest";
import {
  evaluarCreacionSeleccion,
  type SelectionCatalogGraph,
  type SelectionCreationInput,
} from "./evaluarCreacionSeleccion";

const input = (selecciones: SelectionCreationInput["selecciones"]): SelectionCreationInput => ({
  claseRecursoId: "class", familiaRecursoId: "family", tipoRecursoId: "type", unidadId: "unit",
  ownership: { kind: "GLOBAL" }, selecciones,
});

const graph = (overrides: Partial<SelectionCatalogGraph> = {}): SelectionCatalogGraph => ({
  catalogFingerprint: "fingerprint",
  familiaAsignaciones: [
    { id: "shadowed", familiaId: "family", definicionId: "shared", definicionClave: "Z", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 0, modoCaptura: "SELECCION", effectiveReasons: ["FAMILY"] },
    { id: "optional", familiaId: "family", definicionId: "optional", definicionClave: "B", activo: true, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 2, modoCaptura: "SELECCION", effectiveReasons: ["FAMILY"] },
    { id: "free-required", familiaId: "family", definicionId: "free", definicionClave: "C", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 3, modoCaptura: "LIBRE", effectiveReasons: ["FAMILY"] },
    { id: "free-optional", familiaId: "family", definicionId: "free-optional", definicionClave: "D", activo: true, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 4, modoCaptura: "LIBRE", effectiveReasons: ["FAMILY"] },
  ],
  tipoAsignaciones: [
    { id: "required", familiaId: "family", tipoId: "type", definicionId: "shared", definicionClave: "A", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, modoCaptura: "SELECCION", effectiveReasons: ["TYPE"] },
    { id: "conditional", familiaId: "family", tipoId: "type", definicionId: "conditional", definicionClave: "E", activo: true, aplicabilidad: "CONDITIONAL", participaIdentidad: false, orden: 5, modoCaptura: "SELECCION", effectiveReasons: ["TYPE"] },
    { id: "forbidden", familiaId: "family", tipoId: "type", definicionId: "forbidden", definicionClave: "F", activo: true, aplicabilidad: "CONDITIONAL", participaIdentidad: false, orden: 6, modoCaptura: "SELECCION", effectiveReasons: ["TYPE"] },
    { id: "not-applicable", familiaId: "family", tipoId: "type", definicionId: "not-applicable", definicionClave: "G", activo: true, aplicabilidad: "CONDITIONAL", participaIdentidad: false, orden: 7, modoCaptura: "SELECCION", effectiveReasons: ["TYPE"] },
    { id: "inactive", familiaId: "family", tipoId: "type", definicionId: "inactive", definicionClave: "H", activo: false, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 8, modoCaptura: "SELECCION", effectiveReasons: ["TYPE"] },
  ],
  valoresPermitidos: [
    { id: "required-value", definicionAtributoId: "shared", clave: "required", nombre: "Required", orden: 0, activo: true, valor: { kind: "TEXTO", value: "normalized" } },
    { id: "optional-value", definicionAtributoId: "optional", clave: "optional", nombre: "Optional", orden: 0, activo: true, valor: { kind: "BOOLEANO", value: false } },
    { id: "conditional-value", definicionAtributoId: "conditional", clave: "conditional", nombre: "Conditional", orden: 0, activo: true, valor: { kind: "TEXTO", value: "conditional" } },
    { id: "forbidden-value", definicionAtributoId: "forbidden", clave: "forbidden", nombre: "Forbidden", orden: 0, activo: true, valor: { kind: "TEXTO", value: "forbidden" } },
    { id: "not-applicable-value", definicionAtributoId: "not-applicable", clave: "not-applicable", nombre: "Not applicable", orden: 0, activo: true, valor: { kind: "TEXTO", value: "not-applicable" } },
    { id: "inactive-value", definicionAtributoId: "shared", clave: "inactive", nombre: "Inactive", orden: 0, activo: false, valor: { kind: "TEXTO", value: "old" } },
    { id: "inactive-optional-value", definicionAtributoId: "optional", clave: "inactive-optional", nombre: "Inactive optional", orden: 0, activo: false, valor: { kind: "TEXTO", value: "old" } },
    { id: "foreign-value", definicionAtributoId: "foreign", clave: "foreign", nombre: "Foreign", orden: 0, activo: true, valor: { kind: "TEXTO", value: "foreign" } },
  ],
  reglas: [
    { id: "make-required", atributoCondicionId: "required", valorPermitidoCondicionId: "required-value", atributoAfectadoId: "conditional", aplicabilidad: "REQUIRED", activo: true },
    { id: "make-forbidden", atributoCondicionId: "required", valorPermitidoCondicionId: "required-value", atributoAfectadoId: "forbidden", aplicabilidad: "FORBIDDEN", activo: true },
    { id: "make-not-applicable", atributoCondicionId: "required", valorPermitidoCondicionId: "required-value", atributoAfectadoId: "not-applicable", aplicabilidad: "NOT_APPLICABLE", activo: true },
  ],
  ...overrides,
});

describe("evaluarCreacionSeleccion", () => {
  it("uses Type-over-Family precedence, stable order, simultaneous conditions, and normalized accepted values", async () => {
    const result = await evaluarCreacionSeleccion(input([
      { asignacionAtributoId: "required", valorPermitidoId: "required-value" },
      { asignacionAtributoId: "optional", valorPermitidoId: "optional-value" },
      { asignacionAtributoId: "forbidden", valorPermitidoId: "forbidden-value" },
      { asignacionAtributoId: "not-applicable", valorPermitidoId: "not-applicable-value" },
    ]), graph());

    expect(result.evaluation.asignaciones.map(item => [item.asignacionAtributoId, item.aplicabilidadResuelta, item.selectedValueId])).toEqual([
      ["required", "REQUIRED", "required-value"], ["optional", "OPTIONAL", "optional-value"], ["free-required", "REQUIRED", undefined], ["free-optional", "OPTIONAL", undefined], ["conditional", "REQUIRED", undefined], ["forbidden", "FORBIDDEN", undefined], ["not-applicable", "NOT_APPLICABLE", undefined],
    ]);
    expect(result.evaluation.valoresNormalizados).toEqual([
      { atributoRecursoId: "required", valor: "normalized" }, { atributoRecursoId: "optional", valor: false },
    ]);
    expect(result.evaluation.issues.map(issue => issue.code)).toEqual(["SELECTION_FORBIDDEN", "SELECTION_NOT_APPLICABLE", "UNSUPPORTED_FREE_CAPTURE"]);
    expect(result.evaluation.status).toBe("INVALID");
    expect(result.evaluation.valid).toBe(false);
    expect(result.evaluation.nombre).toBeNull();
    expect(result.evaluation.identificadorTecnico).toBeNull();
  });

  it("classifies unknown, foreign, inactive, non-effective, and duplicate selections in first-input order", async () => {
    const result = await evaluarCreacionSeleccion(input([
      { asignacionAtributoId: "unknown", valorPermitidoId: "none" },
      { asignacionAtributoId: "required", valorPermitidoId: "foreign-value" },
      { asignacionAtributoId: "required", valorPermitidoId: "required-value" },
      { asignacionAtributoId: "inactive", valorPermitidoId: "required-value" },
      { asignacionAtributoId: "optional", valorPermitidoId: "inactive-optional-value" },
    ]), graph());

    expect(result.evaluation.seleccionesInvalidas).toEqual(["unknown", "required", "inactive", "optional"]);
    expect(result.evaluation.issues.map(issue => issue.code)).toEqual([
      "ASSIGNMENT_UNKNOWN", "ASSIGNMENT_DUPLICATE", "SELECTION_NON_EFFECTIVE", "ALLOWED_VALUE_INACTIVE", "UNSUPPORTED_FREE_CAPTURE",
    ]);
    expect(result.evaluation.faltantesRequeridos).toEqual(["required"]);
    expect(result.evaluation.status).toBe("INVALID");
  });

  it("does not let duplicate or invalid predicates fire and reports all effective applicability values", async () => {
    const duplicate = await evaluarCreacionSeleccion(input([
      { asignacionAtributoId: "required", valorPermitidoId: "required-value" },
      { asignacionAtributoId: "required", valorPermitidoId: "required-value" },
    ]), graph());
    const invalid = await evaluarCreacionSeleccion(input([
      { asignacionAtributoId: "required", valorPermitidoId: "foreign-value" },
    ]), graph());

    for (const result of [duplicate, invalid]) {
      expect(result.evaluation.asignaciones.find(item => item.asignacionAtributoId === "conditional")?.aplicabilidadResuelta).toBe("OPTIONAL");
      expect(result.evaluation.asignaciones.find(item => item.asignacionAtributoId === "forbidden")?.aplicabilidadResuelta).toBe("OPTIONAL");
    }
  });

  it("gives invalid input precedence over a simultaneous required omission", async () => {
    const result = await evaluarCreacionSeleccion(input([{ asignacionAtributoId: "optional", valorPermitidoId: "foreign-value" }]), graph());

    expect(result.evaluation.faltantesRequeridos).toEqual(["required"]);
    expect(result.evaluation.issues.map(issue => issue.code)).toEqual(["ALLOWED_VALUE_FOREIGN", "UNSUPPORTED_FREE_CAPTURE"]);
    expect(result.evaluation.status).toBe("INVALID");
    expect(result.evaluation.valid).toBe(false);
  });

  it("reports required selectable omissions as incomplete while optional LIBRE may be omitted", async () => {
    const result = await evaluarCreacionSeleccion(input([]), graph({
      familiaAsignaciones: [{ id: "needed", familiaId: "family", definicionId: "needed", definicionClave: "A", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 1, modoCaptura: "SELECCION", effectiveReasons: [] }, { id: "free", familiaId: "family", definicionId: "free", definicionClave: "B", activo: true, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 2, modoCaptura: "LIBRE", effectiveReasons: [] }],
      tipoAsignaciones: [], reglas: [], valoresPermitidos: [{ id: "needed-value", definicionAtributoId: "needed", clave: "needed", nombre: "Needed", orden: 0, activo: true, valor: { kind: "NUMERO", value: 1 } }],
    }));

    expect(result.evaluation.faltantesRequeridos).toEqual(["needed"]);
    expect(result.evaluation.issues).toEqual([]);
    expect(result.evaluation.status).toBe("INCOMPLETE");
    expect(result.evaluation.valid).toBe(false);
    expect(result.evaluation.catalogFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("normalizes typed payloads without exposing their allowed-value IDs and keeps them for persistence", async () => {
    const assignments = ["text", "number", "boolean", "option"].map((id, orden) => ({ id, familiaId: "family", definicionId: id, definicionClave: `D-${id}`, activo: true, aplicabilidad: "REQUIRED" as const, participaIdentidad: true, orden, modoCaptura: "SELECCION" as const, effectiveReasons: [] }));
    const catalog = graph({
      familiaAsignaciones: assignments,
      tipoAsignaciones: [],
      reglas: [],
      valoresPermitidos: [
        { id: "text-value", definicionAtributoId: "text", clave: "NOT-THE-TEXT", nombre: " Texto ", activo: true, orden: 0, valor: { kind: "TEXTO", value: "runtime text" } },
        { id: "number-value", definicionAtributoId: "number", clave: "NOT-THE-NUMBER", nombre: "Number", activo: true, orden: 0, valor: { kind: "NUMERO", value: 42 } },
        { id: "boolean-value", definicionAtributoId: "boolean", clave: "NOT-THE-BOOLEAN", nombre: "False", activo: true, orden: 0, valor: { kind: "BOOLEANO", value: false } },
        { id: "option-value", definicionAtributoId: "option", clave: "NOT-THE-OPTION", nombre: "Option label", activo: true, orden: 0, valor: { kind: "OPCION", opcionAtributoId: "option-id" } },
      ],
      opciones: [{ id: "option-id", definicionAtributoId: "option", clave: "CURRENT-OPTION", activo: true }],
      clase: { id: "class", clave: "CLASS", nombre: "Class", activo: true },
      familia: { id: "family", clave: "FAMILY", nombre: "Family", activo: true },
      tipo: { id: "type", clave: "TYPE", nombre: "Type name", activo: true },
      unidad: { id: "unit", activo: true },
    } as SelectionCatalogGraph);
    const result = await evaluarCreacionSeleccion(input(assignments.map((assignment) => ({ asignacionAtributoId: assignment.id, valorPermitidoId: `${assignment.id}-value` }))), catalog);

    expect(result.evaluation.valoresNormalizados).toEqual([
      { atributoRecursoId: "text", valor: "runtime text" },
      { atributoRecursoId: "number", valor: 42 },
      { atributoRecursoId: "boolean", valor: false },
      { atributoRecursoId: "option", valor: "CURRENT-OPTION", opcionAtributoId: "option-id" },
    ]);
    expect(result.evaluation.valoresNormalizados.every((value) => !("valorPermitidoId" in value))).toBe(true);
    expect((result as unknown as { valoresParaPersistir: unknown }).valoresParaPersistir).toEqual([
      { atributoRecursoId: "text", valor: "runtime text", valorPermitidoId: "text-value" },
      { atributoRecursoId: "number", valor: 42, valorPermitidoId: "number-value" },
      { atributoRecursoId: "boolean", valor: false, valorPermitidoId: "boolean-value" },
      { atributoRecursoId: "option", valor: "CURRENT-OPTION", opcionAtributoId: "option-id", valorPermitidoId: "option-value" },
    ]);
    expect(result.evaluation.nombre).toBe("Type name · Texto · Number · False · Option label");
    expect(result.evaluation.identificadorTecnico).toContain("5:CLASS|6:FAMILY|4:TYPE");
    expect(result.evaluation.identificadorTecnico).not.toContain("NOT-THE-");
    const renamed = await evaluarCreacionSeleccion(input(assignments.map((assignment) => ({ asignacionAtributoId: assignment.id, valorPermitidoId: `${assignment.id}-value` }))), { ...catalog, valoresPermitidos: catalog.valoresPermitidos.map((value) => value.id === "text-value" ? { ...value, nombre: "Renamed" } : value) });
    expect(renamed.evaluation.identificadorTecnico).toBe(result.evaluation.identificadorTecnico);
    expect(renamed.evaluation.nombre).toBe("Type name · Renamed · Number · False · Option label");
  });

  it("keeps the catalog fingerprint independent from zero, valid, invalid, duplicate, reordered, and different selections", async () => {
    const selectionGraph = graph({
      familiaAsignaciones: [
        { id: "required", familiaId: "family", definicionId: "required", definicionClave: "A", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 0, modoCaptura: "SELECCION", effectiveReasons: [] },
        { id: "optional", familiaId: "family", definicionId: "optional", definicionClave: "B", activo: true, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, modoCaptura: "SELECCION", effectiveReasons: [] },
      ],
      tipoAsignaciones: [],
      reglas: [],
      valoresPermitidos: [
        { id: "required-value", definicionAtributoId: "required", clave: "REQUIRED", nombre: "Required", orden: 0, activo: true, valor: { kind: "TEXTO", value: "required" } },
        { id: "optional-value", definicionAtributoId: "optional", clave: "OPTIONAL", nombre: "Optional", orden: 0, activo: true, valor: { kind: "TEXTO", value: "optional" } },
      ],
    });
    const evaluations = await Promise.all([
      [],
      [{ asignacionAtributoId: "required", valorPermitidoId: "required-value" }],
      [{ asignacionAtributoId: "unknown", valorPermitidoId: "unknown-value" }],
      [{ asignacionAtributoId: "required", valorPermitidoId: "required-value" }, { asignacionAtributoId: "required", valorPermitidoId: "required-value" }],
      [{ asignacionAtributoId: "required", valorPermitidoId: "required-value" }, { asignacionAtributoId: "optional", valorPermitidoId: "optional-value" }],
      [{ asignacionAtributoId: "optional", valorPermitidoId: "optional-value" }, { asignacionAtributoId: "required", valorPermitidoId: "required-value" }],
      [{ asignacionAtributoId: "optional", valorPermitidoId: "optional-value" }],
    ].map(async (selecciones) => (await evaluarCreacionSeleccion(input(selecciones), selectionGraph)).evaluation));

    expect(evaluations.map((evaluation) => evaluation.catalogFingerprint)).toEqual(Array(7).fill(evaluations[0].catalogFingerprint));
    expect(evaluations[1].status).toBe("VALID");
    expect(evaluations[2].status).toBe("INVALID");
  });

  it("keeps canonical fingerprints stable while diagnosing inactive and foreign direct-ID submissions", async () => {
    const selectionGraph = graph({
      familiaAsignaciones: [{ id: "required", familiaId: "family", definicionId: "required", definicionClave: "A", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 0, modoCaptura: "SELECCION", effectiveReasons: [] }],
      tipoAsignaciones: [], reglas: [],
      valoresPermitidos: [{ id: "active", definicionAtributoId: "required", clave: "ACTIVE", nombre: "Active", orden: 0, activo: true, valor: { kind: "TEXTO", value: "active" } }],
      valoresPermitidosDiagnosticos: [
        { id: "inactive", definicionAtributoId: "required", clave: "INACTIVE", nombre: "Inactive", orden: 0, activo: false, valor: { kind: "TEXTO", value: "inactive" } },
        { id: "foreign", definicionAtributoId: "foreign", clave: "FOREIGN", nombre: "Foreign", orden: 0, activo: true, valor: { kind: "TEXTO", value: "foreign" } },
      ],
    } as SelectionCatalogGraph);
    const baseline = await evaluarCreacionSeleccion(input([]), selectionGraph);
    const inactive = await evaluarCreacionSeleccion(input([{ asignacionAtributoId: "required", valorPermitidoId: "inactive" }]), selectionGraph);
    const foreign = await evaluarCreacionSeleccion(input([{ asignacionAtributoId: "required", valorPermitidoId: "foreign" }]), selectionGraph);

    expect(inactive.evaluation.catalogFingerprint).toBe(baseline.evaluation.catalogFingerprint);
    expect(foreign.evaluation.catalogFingerprint).toBe(baseline.evaluation.catalogFingerprint);
    expect(inactive.evaluation.issues.map(issue => issue.code)).toContain("ALLOWED_VALUE_INACTIVE");
    expect(foreign.evaluation.issues.map(issue => issue.code)).toContain("ALLOWED_VALUE_FOREIGN");
  });

  it("accepts an active selected Unit without policy data, retains UNIT_INVALID, and keeps incomplete attributes", async () => {
    const selectionGraph = graph({
      hierarchyValid: true,
      unitValid: true,
      familiaAsignaciones: [{ id: "required", familiaId: "family", definicionId: "required", definicionClave: "A", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 0, modoCaptura: "SELECCION", effectiveReasons: [] }],
      tipoAsignaciones: [],
      reglas: [],
      valoresPermitidos: [{ id: "required-value", definicionAtributoId: "required", clave: "REQUIRED", nombre: "Required", orden: 0, activo: true, valor: { kind: "TEXTO", value: "required" } }],
    });
    const valid = await evaluarCreacionSeleccion(input([{ asignacionAtributoId: "required", valorPermitidoId: "required-value" }]), selectionGraph);
    const inactive = await evaluarCreacionSeleccion(input([{ asignacionAtributoId: "required", valorPermitidoId: "required-value" }]), { ...selectionGraph, unitValid: false });
    const incomplete = await evaluarCreacionSeleccion(input([]), selectionGraph);

    expect(valid.evaluation.status).toBe("VALID");
    expect(inactive.evaluation.issues.map(issue => issue.code)).toContain("UNIT_INVALID");
    expect(inactive.evaluation.status).toBe("INVALID");
    expect(incomplete.evaluation).toMatchObject({ status: "INCOMPLETE", faltantesRequeridos: ["required"] });
  });

  it("rejects non-finite typed numbers as catalog corruption", async () => {
    const catalog = graph({
      familiaAsignaciones: [{ id: "number", familiaId: "family", definicionId: "number", definicionClave: "N", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 0, modoCaptura: "SELECCION", effectiveReasons: [] }],
      tipoAsignaciones: [], reglas: [],
      valoresPermitidos: [{ id: "number-value", definicionAtributoId: "number", clave: "N", nombre: "Number", activo: true, orden: 0, valor: { kind: "NUMERO", value: Number.NaN } }],
    } as SelectionCatalogGraph);
    await expect(evaluarCreacionSeleccion(input([{ asignacionAtributoId: "number", valorPermitidoId: "number-value" }]), catalog)).rejects.toThrow("NUMERO");
  });
});
