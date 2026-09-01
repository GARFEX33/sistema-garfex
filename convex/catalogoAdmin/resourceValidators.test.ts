import { describe, expect, it } from "vitest";
import { MAX_RESOURCE_VALUES, resourceDetailValidator, resourceSummaryValidator, resourceValueValidator } from "./resourceValidators";

describe("Resource administrative validators", () => {
  it("defines bounded inferred contracts", () => { expect(MAX_RESOURCE_VALUES).toBe(200); expect(resourceValueValidator).toMatchObject({ kind: "object" }); expect(resourceSummaryValidator).toMatchObject({ kind: "object" }); expect(resourceDetailValidator).toMatchObject({ kind: "object" }); });
  it("keeps summary value-free and detail references nullable", () => { const summaryFields = Object.keys((resourceSummaryValidator as { fields?: object }).fields ?? {}); const detailFields = Object.keys((resourceDetailValidator as { fields?: object }).fields ?? {}); expect(summaryFields).not.toContain("valores"); expect(summaryFields).toEqual(expect.arrayContaining(["id", "identificadorTecnico", "classificationStatus"])); expect(detailFields).toEqual(expect.arrayContaining(["catalogDiagnostics", "clase", "familia", "tipo", "unidad", "organizacion", "valores"])); });
});
