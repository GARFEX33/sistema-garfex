import { describe, expect, it } from "vitest";
import { classificationStatusFromReferences, normalizeResourceSearchText, projectResourceSummary } from "./recursoResumen";
import type { Doc } from "../../_generated/dataModel";
type Resource = Doc<"recursos">;
const resource = { _id: "resource-1", _creationTime: 1, tipoRecursoId: "type-1", unidadId: "unit-1", identificadorTecnico: "TYPE|A", nombre: "Resource", activo: true, revision: 3, organizacionId: "org-1" } as Resource;

describe("Resource search text normalization", () => {
  it("normalizes NFC, surrounding whitespace, and internal whitespace runs", () => {
    expect(normalizeResourceSearchText("  Cafe\u0301\t  de   campo  ")).toBe("Café de campo");
  });

  it("rejects text that becomes blank after normalization", () => {
    expect(normalizeResourceSearchText(" \t\n ")).toBe("");
  });
});

describe("Resource summary projection", () => {
  it("classifies inactive and missing historical references", () => { expect(classificationStatusFromReferences(resource, { type: null, family: null, clazz: null })).toEqual({ state: "BROKEN_REFERENCE", reasons: ["MISSING_REFERENCE", "CLASS_INACTIVE", "FAMILY_INACTIVE", "TYPE_INACTIVE"] }); expect(classificationStatusFromReferences(resource, { type: { _id: resource.tipoRecursoId, familiaRecursoId: "family-1" as never, activo: false }, family: { _id: "family-1" as never, claseRecursoId: "class-1" as never, activo: true }, clazz: { _id: "class-1" as never, activo: true } })).toEqual({ state: "INERT", reasons: ["TYPE_INACTIVE"] }); });
  it.each([
    ["type", { type: null, family: { _id: "family-1", claseRecursoId: "class-1", activo: true }, clazz: { _id: "class-1", activo: true } }],
    ["family", { type: { _id: "type-1", familiaRecursoId: "family-1", activo: true }, family: null, clazz: { _id: "class-1", activo: true } }],
    ["class", { type: { _id: "type-1", familiaRecursoId: "family-1", activo: true }, family: { _id: "family-1", claseRecursoId: "class-1", activo: true }, clazz: null }],
  ] as const)("marks a missing %s as broken rather than inert", (_missing, references) => {
    const status = classificationStatusFromReferences(resource, references as never);
    expect(status.state).toBe("BROKEN_REFERENCE");
    expect(status.reasons).toContain("MISSING_REFERENCE");
  });
  it("preserves the effective, inert, and broken summary states", () => {
    const effective = { type: { _id: "type-1", familiaRecursoId: "family-1", activo: true }, family: { _id: "family-1", claseRecursoId: "class-1", activo: true }, clazz: { _id: "class-1", activo: true } };
    expect(classificationStatusFromReferences(resource, effective as never).state).toBe("EFFECTIVE");
    expect(classificationStatusFromReferences(resource, { ...effective, type: { ...effective.type, activo: false } } as never).state).toBe("INERT");
    expect(classificationStatusFromReferences(resource, { ...effective, type: null } as never).state).toBe("BROKEN_REFERENCE");
  });
  it("is value-free and preserves lifecycle separately", () => { const summary = projectResourceSummary(resource, { state: "EFFECTIVE", reasons: [] }); expect(summary).toEqual({ id: resource._id, identificadorTecnico: resource.identificadorTecnico, nombre: resource.nombre, tipoRecursoId: resource.tipoRecursoId, unidadId: resource.unidadId, organizacionId: resource.organizacionId, activo: true, revision: 3, classificationStatus: { state: "EFFECTIVE", reasons: [] } }); expect(projectResourceSummary(resource, { state: "INERT", reasons: ["TYPE_INACTIVE"] })).toMatchObject({ activo: true, classificationStatus: { state: "INERT" } }); expect(summary).not.toHaveProperty("valores"); });
});
