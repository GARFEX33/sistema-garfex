import { describe, expect, it } from "vitest";
import { projectResourceDetail, loadResourceValuesBounded } from "./recursoDetalle";
import { MAX_RESOURCE_VALUES } from "../resourceValidators";

describe("Resource detail projection", () => {
  it("depends on summary and keeps historical references nullable", () => { const hierarchy = { state: "BROKEN_REFERENCE" as const, reasons: ["MISSING_REFERENCE"] }; const summary = { id: "resource-1" as never, identificadorTecnico: "TYPE|A", nombre: "Resource", tipoRecursoId: "type-1" as never, unidadId: "unit-1" as never, activo: false, revision: 2, classificationStatus: hierarchy }; const extra = { descripcion: null, identidadVersion: null, clase: null, familia: null, tipo: null, unidad: null, organizacion: null, catalogDiagnostics: { hierarchy, aggregateStatus: "NOT_EVALUATED" as const, violations: [] }, valores: [] }; expect(projectResourceDetail(summary, extra)).toEqual({ ...summary, ...extra }); });

  it("performs one indexed bounded value query", async () => {
    let queryCalls = 0;
    let indexCalls = 0;
    let takeCalls = 0;
    const take = async (limit: number) => {
      takeCalls += 1;
      expect(limit).toBe(MAX_RESOURCE_VALUES + 1);
      return [];
    };
    const withIndex = (name: string, predicate: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
      indexCalls += 1;
      expect(name).toBe("porRecurso");
      predicate({ eq: (field, value) => { expect(field).toBe("recursoId"); expect(value).toBe("resource-1"); return {}; } });
      return { take };
    };
    const query = (table: string) => { queryCalls += 1; expect(table).toBe("valoresAtributoRecurso"); return { withIndex }; };
    const values = await loadResourceValuesBounded({ db: { query } } as never, "resource-1" as never);
    expect(values).toEqual([]);
    expect(queryCalls).toBe(1);
    expect(indexCalls).toBe(1);
    expect(takeCalls).toBe(1);
  });
});
