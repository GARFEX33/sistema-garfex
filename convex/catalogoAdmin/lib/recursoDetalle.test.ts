import { describe, expect, it } from "vitest";
import { projectResourceDetail } from "./recursoDetalle";

describe("Resource detail projection", () => {
  it("depends on summary and keeps historical references nullable", () => { const hierarchy = { state: "BROKEN_REFERENCE" as const, reasons: ["MISSING_REFERENCE"] }; const summary = { id: "resource-1" as never, identificadorTecnico: "TYPE|A", nombre: "Resource", tipoRecursoId: "type-1" as never, unidadId: "unit-1" as never, activo: false, revision: 2, classificationStatus: hierarchy }; const extra = { descripcion: null, identidadVersion: null, clase: null, familia: null, tipo: null, unidad: null, organizacion: null, catalogDiagnostics: { hierarchy, aggregateStatus: "NOT_EVALUATED" as const, violations: [] }, valores: [] }; expect(projectResourceDetail(summary, extra)).toEqual({ ...summary, ...extra }); });
});
