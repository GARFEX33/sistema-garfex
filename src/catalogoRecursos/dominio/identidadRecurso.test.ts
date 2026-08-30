import { describe, expect, it } from "vitest";
import { identidadRecurso, identidadRecursoV2, normalizarValor, serializarIdentidadV2 } from "./identidadRecurso";

describe("identidad de recursos", () => {
  const clase = { id: "c", clave: "CLASE", activo: true };
  const familia = { id: "f", clave: "FAMILIA", activo: true, claseRecursoId: "c" };
  const tipo = { id: "t", clave: "TIPO", activo: true, familiaRecursoId: "f" };
  const atributo = { id: "a", activo: true, definicionAtributoId: "d", participaIdentidad: true, aplicabilidad: "OPTIONAL" as const };
  const definiciones = new Map([["d", { clave: "CODIGO" }]]);

  it("preserva la identidad v1 histórica", () => {
    expect(identidadRecurso(tipo, familia, clase, new Map([["a", atributo]]), new Map([["a", { atributoRecursoId: "a", valor: "  e\u0301  x " }]]), definiciones, new Map())).toBe("v1|CLASE|FAMILIA|TIPO|CODIGO=É X");
  });

  it("normaliza Unicode, booleanos y números", () => {
    expect(normalizarValor("e\u0301")).toBe("É");
    expect(normalizarValor(true)).toBe("TRUE");
    expect(normalizarValor(false)).toBe("FALSE");
    expect(normalizarValor(12.5)).toBe("12.5");
  });

  it("hace independientes el orden y seguros los delimitadores en v2", () => {
    const a = serializarIdentidadV2(tipo, familia, clase, [["A|=", "x|=y"], ["B", "z"]]);
    const b = serializarIdentidadV2(tipo, familia, clase, [["B", "z"], ["A|=", "x|=y"]]);
    expect(a).toBe(b);
    expect(a).not.toBe(serializarIdentidadV2(tipo, familia, clase, [["A", "|=x"], ["B", "z"]]));
  });

  it("serializa la misma identidad v2 con valores equivalentes", () => {
    const base = identidadRecursoV2(tipo, familia, clase, new Map([["a", atributo]]), new Map([["a", { atributoRecursoId: "a", valor: "e\u0301" }]]), definiciones, new Map());
    const nfc = identidadRecursoV2(tipo, familia, clase, new Map([["a", atributo]]), new Map([["a", { atributoRecursoId: "a", valor: "é" }]]), definiciones, new Map());
    expect(base).toBe(nfc);
  });
});
