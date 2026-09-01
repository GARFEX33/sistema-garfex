import { describe, expect, it } from "vitest";
import { detectarClavesTipoAmbiguas, filtrarFilasEfectivas, limitarFilas, MAX_AGGREGATE_ROWS } from "./cargarAgregado";

describe("contrato del cargador de agregados", () => {
  it("limita fan-out y no expone filas bajo una jerarquía inerte", () => {
    const rows = Array.from({ length: MAX_AGGREGATE_ROWS + 1 }, (_, index) => ({ id: index, active: true }));
    expect(limitarFilas(rows)).toMatchObject({ exceeded: true, rows: [] });
    expect(filtrarFilasEfectivas(rows, false)).toEqual([]);
    expect(filtrarFilasEfectivas(rows.slice(0, 1), true)).toEqual(rows.slice(0, 1));
    expect(detectarClavesTipoAmbiguas([{ clave: "b" }, { clave: "a" }, { clave: "b" }])).toEqual(["b"]);
  });
});
