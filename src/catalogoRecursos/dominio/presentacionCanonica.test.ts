import { describe, expect, it } from "vitest";
import { renderizarPresentacionCanonica } from "./presentacionCanonica";

const policy = (tokens: Parameters<typeof renderizarPresentacionCanonica>[0]["tokens"], separador = " · ") => ({
  tipoNombre: "Cable",
  tokens,
  separador,
});

describe("presentación canónica", () => {
  it("renderiza etiquetas de opciones demo", () => {
    const result = renderizarPresentacionCanonica(
      policy([{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "MATERIAL" }]),
      new Map([["MATERIAL", { tipoDato: "OPCION", valor: "TEST_COBRE", opcionNombre: "Cobre" }]]),
    );
    expect(result).toEqual({ ok: true, nombre: "Cable · Cobre" });
  });

  it("omite atributos ausentes o con valor indefinido", () => {
    const result = renderizarPresentacionCanonica(
      policy([{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "CALIBRE" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "MATERIAL" }]),
      new Map([["MATERIAL", "Cobre"]]),
    );
    expect(result).toEqual({ ok: true, nombre: "Cable · Cobre" });
  });

  it("renderiza escalares con unidad", () => {
    const result = renderizarPresentacionCanonica(
      policy([{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "LONGITUD" }]),
      new Map([["LONGITUD", { tipoDato: "NUMERO", valor: 12, unidad: "cm" }]]),
    );
    expect(result).toEqual({ ok: true, nombre: "Cable · 12 cm" });
  });

  it("renderiza literales aunque el atributo adyacente se omita", () => {
    const result = renderizarPresentacionCanonica(
      policy([{ tipo: "LITERAL", texto: "Ø" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "DIAMETRO" }, { tipo: "LITERAL", texto: "nominal" }]),
      new Map(),
    );
    expect(result).toEqual({ ok: true, nombre: "Ø · nominal" });
  });

  it("normaliza espacios y aplica separadores determinísticamente", () => {
    const render = (values: ReadonlyMap<string, string>) => renderizarPresentacionCanonica(
      policy([{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "A" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "B" }], "   /   "),
      values,
    );
    expect(render(new Map([["A", "  uno   "], ["B", " dos "]]))).toEqual({ ok: true, nombre: "Cable / uno / dos" });
    expect(render(new Map([["B", " dos "]]))).toEqual({ ok: true, nombre: "Cable / dos" });
  });

  it("devuelve un error explícito para salida en blanco", () => {
    expect(renderizarPresentacionCanonica(
      policy([{ tipo: "ATTRIBUTE_VALUE", atributoClave: "A" }]),
      new Map(),
    )).toEqual({ ok: false, error: "NOMBRE_VACIO" });
  });

  it("preserva el orden semántico y normaliza NFC, nombres de opción y símbolos", () => {
    expect(renderizarPresentacionCanonica(
      { tipoNombre: "Cafe\u0301  ", tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "B" }, { tipo: "LITERAL", texto: " final " }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "A" }], separador: "  /  " },
      new Map<string, string | { tipoDato: "OPCION"; valor: string; opcionNombre: string }>([["A", " uno "], ["B", { tipoDato: "OPCION", valor: "id", opcionNombre: "  Té   verde " }]]),
    )).toEqual({ ok: true, nombre: "Café / Té verde / final / uno" });
  });

  it("omite todo valor opcional y rechaza una política estructuralmente vacía", () => {
    expect(renderizarPresentacionCanonica(
      policy([{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoClave: "OPTIONAL" }, { tipo: "LITERAL", texto: "final" }]), new Map(),
    )).toEqual({ ok: true, nombre: "Cable · final" });
    expect(renderizarPresentacionCanonica(
      { tipoNombre: " ", tokens: [{ tipo: "TYPE_NAME" }], separador: "-" }, new Map(),
    )).toEqual({ ok: false, error: "POLITICA_INVALIDA" });
  });
});
