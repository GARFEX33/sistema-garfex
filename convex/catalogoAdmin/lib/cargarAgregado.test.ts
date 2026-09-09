import { describe, expect, it } from "vitest";
import { cargarAgregado, detectarClavesTipoAmbiguas, filtrarFilasEfectivas, limitarFilas, MAX_AGGREGATE_ROWS, type DbContext } from "./cargarAgregado";

const presentation = { activo: true, tokens: [{ tipo: "TYPE_NAME" }], separador: "-" };

function aggregateContext(rows: Record<string, unknown[]> = {}, extraDocuments: Array<[string, unknown]> = []) {
  const queried: string[] = [];
  const documents = new Map<string, unknown>([
    ["type", { _id: "type", familiaRecursoId: "family", activo: true, revision: 1 }],
    ["family", { _id: "family", claseRecursoId: "class", activo: true, revision: 1 }],
    ["class", { _id: "class", activo: true, revision: 1 }],
    ...extraDocuments,
  ]);
  const ctx = {
    db: {
      get: async (id: unknown) => documents.get(String(id)) ?? null,
      query: (table: string) => {
        queried.push(table);
        return { withIndex: () => ({ take: async () => rows[table] ?? [] }) };
      },
    },
  } as unknown as DbContext;
  return { ctx, queried };
}

describe("contrato del cargador de agregados", () => {
  it("limita fan-out y no expone filas bajo una jerarquía inerte", () => {
    const rows = Array.from({ length: MAX_AGGREGATE_ROWS + 1 }, (_, index) => ({ id: index, active: true }));
    expect(limitarFilas(rows)).toMatchObject({ exceeded: true, rows: [] });
    expect(filtrarFilasEfectivas(rows, false)).toEqual([]);
    expect(filtrarFilasEfectivas(rows.slice(0, 1), true)).toEqual(rows.slice(0, 1));
    expect(detectarClavesTipoAmbiguas([{ clave: "b" }, { clave: "a" }, { clave: "b" }])).toEqual(["b"]);
  });

  it("reevalúa Resource sin políticas, sin consultar su fan-out", async () => {
    const { ctx, queried } = aggregateContext({ politicasPresentacionCanonica: [presentation] });
    await expect(cargarAgregado(ctx, "type" as never, {}, "RESOURCE")).resolves.toMatchObject({ status: "VALID", violations: [] });
    expect(queried).not.toContain("politicasUnidadRecurso");

    const administrative = aggregateContext({ politicasPresentacionCanonica: [presentation] });
    await expect(cargarAgregado(administrative.ctx, "type" as never)).resolves.toMatchObject({
      status: "INVALID",
      violations: [{ code: "PRINCIPAL_UNIT_COUNT" }],
    });
  });

  it("no convierte el sentinel administrativo vacío en una aceptación Resource", async () => {
    const resource = aggregateContext();
    await expect(cargarAgregado(resource.ctx, "type" as never, {}, "RESOURCE")).resolves.toMatchObject({
      status: "INVALID",
      violations: [{ code: "PRESENTATION_COUNT" }],
    });
    const administrative = aggregateContext();
    await expect(cargarAgregado(administrative.ctx, "type" as never)).resolves.toMatchObject({ status: "NOT_EVALUATED" });
  });

  it("mantiene fallas no-policy y omite sólo el límite de fan-out de políticas", async () => {
    const resourcePolicyFanout = aggregateContext({
      politicasUnidadRecurso: Array.from({ length: MAX_AGGREGATE_ROWS + 1 }, () => ({})),
      politicasPresentacionCanonica: [presentation],
    });
    await expect(cargarAgregado(resourcePolicyFanout.ctx, "type" as never, {}, "RESOURCE")).resolves.toMatchObject({ status: "VALID" });

    const administrativePolicyFanout = aggregateContext({
      politicasUnidadRecurso: Array.from({ length: MAX_AGGREGATE_ROWS + 1 }, () => ({})),
      politicasPresentacionCanonica: [presentation],
    });
    await expect(cargarAgregado(administrativePolicyFanout.ctx, "type" as never)).resolves.toMatchObject({
      violations: [{ code: "CATALOG_LIMIT_EXCEEDED" }],
    });

    const nonPolicyFanout = aggregateContext({ atributosRecurso: Array.from({ length: MAX_AGGREGATE_ROWS + 1 }, () => ({})) });
    await expect(cargarAgregado(nonPolicyFanout.ctx, "type" as never, {}, "RESOURCE")).resolves.toMatchObject({
      violations: [{ code: "CATALOG_LIMIT_EXCEEDED" }],
    });
  });

  it("Resource conserva las fallas de opciones y reglas", async () => {
    const emptyOptions = aggregateContext({
      atributosRecurso: [{ _id: "attribute", familiaRecursoId: "family", definicionAtributoId: "definition", activo: true, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 1 }],
    }, [["definition", { _id: "definition", clave: "choice", tipoDato: "OPCION", activo: true }]]);
    await expect(cargarAgregado(emptyOptions.ctx, "type" as never, {}, "RESOURCE")).resolves.toMatchObject({
      violations: [{ code: "OPTION_SET_EMPTY" }],
    });

    const invalidRule = aggregateContext({
      reglasAtributoRecurso: [{ _id: "rule", atributoCondicionId: "missing", atributoAfectadoId: "other", aplicabilidad: "OPTIONAL", activo: true }],
    });
    await expect(cargarAgregado(invalidRule.ctx, "type" as never, {}, "RESOURCE")).resolves.toMatchObject({
      violations: [{ code: "RULE_REFERENCE_INVALID" }],
    });
  });
});
