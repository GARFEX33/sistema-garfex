import { describe, expect, it } from "vitest";
import { validarRecurso } from "./validarRecurso";
import type { CatalogoSnapshot, EntradaRecurso } from "./tipos";

const base = (): CatalogoSnapshot => ({
  clase: { id: "clase", clave: "CLASE", activo: true },
  familia: { id: "familia", clave: "FAMILIA", activo: true, claseRecursoId: "clase" },
  tipo: { id: "tipo", clave: "TIPO", activo: true, familiaRecursoId: "familia" },
  unidad: { id: "unidad", activo: true },
  politicas: [{ id: "politica", activo: true, familiaRecursoId: "familia", unidadId: "unidad" }],
  atributos: [
    { id: "atributo-familia", activo: true, definicionAtributoId: "def", tipoRecursoId: undefined, aplicabilidad: "OPTIONAL", participaIdentidad: false, definicion: { id: "def", clave: "DEF", tipoDato: "TEXTO", activo: true } },
    { id: "atributo-tipo", activo: true, definicionAtributoId: "def", tipoRecursoId: "tipo", aplicabilidad: "REQUIRED", participaIdentidad: false, definicion: { id: "def", clave: "DEF", tipoDato: "TEXTO", activo: true } },
  ],
  reglas: [], opciones: [],
});

const entrada = (atributoRecursoId: string): EntradaRecurso => ({
  claseRecursoId: "clase", familiaRecursoId: "familia", tipoRecursoId: "tipo", unidadId: "unidad",
  valores: [{ atributoRecursoId, valor: "valor" }],
});

describe("precedencia de atributos", () => {
  it("reemplaza por definición y aplica el atributo específico del tipo", () => {
    const snapshot = base();
    expect(validarRecurso(snapshot, { ...entrada("atributo-tipo"), valores: [] })).toEqual({ ok: false, code: "ATRIBUTO_REQUERIDO_AUSENTE" });
    expect(validarRecurso(snapshot, entrada("atributo-familia"))).toEqual({ ok: false, code: "ATRIBUTO_NO_APLICABLE" });
    const resultado = validarRecurso(snapshot, entrada("atributo-tipo"));
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect([...resultado.value.atributos.keys()]).toEqual(["def"]);
  });

  it("uses presence rather than truthiness for required and forbidden values", () => {
    for (const [tipoDato, value] of [["BOOLEANO", false], ["NUMERO", 0], ["TEXTO", ""]] as const) {
      const snapshot = base();
      snapshot.atributos[1].definicion = { id: "def", clave: "DEF", tipoDato, activo: true };
      expect(validarRecurso(snapshot, { ...entrada("atributo-tipo"), valores: [{ atributoRecursoId: "atributo-tipo", valor: value }] }).ok).toBe(true);
    }
    const forbidden = base();
    forbidden.atributos[1].aplicabilidad = "FORBIDDEN";
    expect(validarRecurso(forbidden, entrada("atributo-tipo"))).toEqual({ ok: false, code: "ATRIBUTO_PROHIBIDO" });
  });

  it("applies a raw-input rule to false, zero, and empty string without iterating", () => {
    for (const [tipoDato, value] of [["BOOLEANO", false], ["NUMERO", 0], ["TEXTO", ""]] as const) {
      const snapshot = base();
      snapshot.atributos.push({ id: "atributo-afectado", activo: true, definicionAtributoId: "def-afectado", tipoRecursoId: "tipo", aplicabilidad: "CONDITIONAL", participaIdentidad: false, definicion: { id: "def-afectado", clave: "AFECTADO", tipoDato: "TEXTO", activo: true } });
      snapshot.atributos[1].definicion = { id: "def", clave: "DEF", tipoDato, activo: true };
      snapshot.reglas = [{ id: "regla", activo: true, atributoCondicionId: "atributo-tipo", atributoAfectadoId: "atributo-afectado", aplicabilidad: "REQUIRED" }];
      expect(validarRecurso(snapshot, { ...entrada("atributo-tipo"), valores: [{ atributoRecursoId: "atributo-tipo", valor: value }] })).toEqual({ ok: false, code: "ATRIBUTO_REQUERIDO_AUSENTE" });
    }
  });
});
