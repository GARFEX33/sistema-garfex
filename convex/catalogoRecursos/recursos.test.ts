import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import { identidadRecurso } from "./validacionRecurso";
import schema from "../schema";

const generatedModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("../_generated/**/*.{ts,js}");
const localModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("./*.{ts,js}");
const modules = {
  ...generatedModules,
  ...Object.fromEntries(
    Object.entries(localModules).map(([path, module]) => [
      `../catalogoRecursos/${path.slice(2)}`,
      module,
    ]),
  ),
};

type Fixture = Awaited<ReturnType<typeof seedFixture>>;

async function seedFixture(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "EQUIPO", nombre: "Equipo", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "BOMBA", nombre: "Bomba", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "CENTRIFUGA", nombre: "Centrífuga", activo: true, revision: 1 });
    const otraClase = await ctx.db.insert("clasesRecurso", { clave: "OTRA", nombre: "Otra", activo: true, revision: 1 });
    const otraFamilia = await ctx.db.insert("familiasRecurso", { claseRecursoId: otraClase, clave: "VALVULA", nombre: "Válvula", activo: true, revision: 1 });
    const otroTipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: otraFamilia, clave: "MARIPOSA", nombre: "Mariposa", activo: true, revision: 1 });
    const atributoOtraFamiliaDef = await ctx.db.insert("definicionesAtributo", { clave: "PRESION", nombre: "Presión", tipoDato: "NUMERO", activo: true, revision: 1 });
    const atributoOtraFamilia = await ctx.db.insert("atributosRecurso", { familiaRecursoId: otraFamilia, definicionAtributoId: atributoOtraFamiliaDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    const condicionalBaseDef = await ctx.db.insert("definicionesAtributo", { clave: "COND_BASE", nombre: "Condicional base", tipoDato: "TEXTO", activo: true, revision: 1 });
    const condicionalBase = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: condicionalBaseDef, aplicabilidad: "CONDITIONAL", participaIdentidad: false, orden: 5, activo: true, revision: 1 });
    const textoDef = await ctx.db.insert("definicionesAtributo", { clave: "TEXTO_ID", nombre: "Texto identidad", tipoDato: "TEXTO", activo: true, revision: 1 });
    const texto = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: textoDef, aplicabilidad: "OPTIONAL", participaIdentidad: true, orden: 6, activo: true, revision: 1 });
    const booleanoDef = await ctx.db.insert("definicionesAtributo", { clave: "BOOL_ID", nombre: "Booleano identidad", tipoDato: "BOOLEANO", activo: true, revision: 1 });
    const booleano = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: booleanoDef, aplicabilidad: "OPTIONAL", participaIdentidad: true, orden: 7, activo: true, revision: 1 });
    const numeroDef = await ctx.db.insert("definicionesAtributo", { clave: "NUM_ID", nombre: "Número identidad", tipoDato: "NUMERO", activo: true, revision: 1 });
    const numero = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: numeroDef, aplicabilidad: "OPTIONAL", participaIdentidad: true, orden: 8, activo: true, revision: 1 });
    const unidad = await ctx.db.insert("unidades", { clave: "UN", nombre: "Unidad", simbolo: "u", activo: true, revision: 1 });
    const unidadMala = await ctx.db.insert("unidades", { clave: "M", nombre: "Mala", activo: true, revision: 1 });
    const unidadTipo = await ctx.db.insert("unidades", { clave: "UT", nombre: "Unidad por tipo", activo: true, revision: 1 });
    await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: familia, unidadId: unidad, principal: true, activo: true, revision: 1 });
    await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, unidadId: unidadTipo, principal: true, activo: true, revision: 1 });
        await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: otraFamilia, unidadId: unidad, principal: true, activo: true, revision: 1 });
    const colorDef = await ctx.db.insert("definicionesAtributo", { clave: "COLOR", nombre: "Color", tipoDato: "OPCION", activo: true, revision: 1 });
    const pesoDef = await ctx.db.insert("definicionesAtributo", { clave: "PESO", nombre: "Peso", tipoDato: "NUMERO", unidadId: unidad, activo: true, revision: 1 });
    const modoDef = await ctx.db.insert("definicionesAtributo", { clave: "MODO", nombre: "Modo", tipoDato: "OPCION", activo: true, revision: 1 });
    const secretoDef = await ctx.db.insert("definicionesAtributo", { clave: "SECRETO", nombre: "Secreto", tipoDato: "TEXTO", activo: true, revision: 1 });
    const color = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: colorDef, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true, revision: 1 });
    const peso = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: pesoDef, aplicabilidad: "OPTIONAL", participaIdentidad: true, orden: 2, activo: true, revision: 1 });
    const modo = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: modoDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 3, activo: true, revision: 1 });
    const secreto = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: secretoDef, aplicabilidad: "FORBIDDEN", participaIdentidad: false, orden: 4, activo: true, revision: 1 });
    const noAplicaDef = await ctx.db.insert("definicionesAtributo", { clave: "NO_APLICA", nombre: "No aplica", tipoDato: "TEXTO", activo: true, revision: 1 });
    const noAplica = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: noAplicaDef, aplicabilidad: "NOT_APPLICABLE", participaIdentidad: false, orden: 9, activo: true, revision: 1 });
    const rojo = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: colorDef, clave: "ROJO", nombre: "Rojo", activo: true, revision: 1 });
    const automatico = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: modoDef, clave: "AUTO", nombre: "Automático", activo: true, revision: 1 });
    const opcionInactiva = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: colorDef, clave: "INACTIVA", nombre: "Inactiva", activo: false, revision: 1 });
    await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: tipo, atributoCondicionId: color, opcionCondicionId: rojo, atributoAfectadoId: modo, aplicabilidad: "REQUIRED", activo: true, revision: 1 });
    return { clase, familia, tipo, unidad, unidadMala, unidadTipo, color, peso, modo, secreto, noAplica, rojo, automatico, opcionInactiva, otraClase, otraFamilia, otroTipo, atributoOtraFamilia, condicionalBase, texto, booleano, numero, modoDef };
  });
}

function input(f: Fixture, overrides: Record<string, unknown> = {}) {
  return {
    claseRecursoId: f.clase, familiaRecursoId: f.familia, tipoRecursoId: f.tipo, unidadId: f.unidad,
    nombre: "Bomba visible", valores: [{ atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo }, { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico }], ...overrides,
  };
}

describe("recursos", () => {
  it("crea con identidad determinista y obtiene sus valores", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    const creado = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
    expect(creado.identificadorTecnico).toBe("v1|EQUIPO|BOMBA|CENTRIFUGA|COLOR=ROJO");
    expect(creado.revision).toBe(1); expect(creado.activo).toBe(true);
    expect(await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: creado._id })).toMatchObject({ nombre: "Bomba visible", valores: expect.arrayContaining([expect.objectContaining({ atributoRecursoId: f.color })]) });
  });

  it("no usa el nombre para identidad y rechaza duplicados", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { nombre: "Otro nombre" }))).rejects.toThrow(/duplic|identificador/i);
  });

  it.each([
    ["unidad no permitida", (f: Fixture) => ({ unidadId: f.unidadMala }), /Unidad no permitida/],
    ["atributo requerido ausente", (_f: Fixture) => ({ valores: [] }), /Atributo requerido ausente/],
    ["tipo incorrecto", (f: Fixture) => ({ valores: [{ atributoRecursoId: f.color, valor: 3 }] }), /Tipo de valor inválido/],
    ["opcion de otra definicion", (f: Fixture) => ({ valores: [{ atributoRecursoId: f.color, valor: "auto", opcionAtributoId: f.automatico }] }), /Opción inválida/],
    ["atributo de otra familia", (f: Fixture) => ({ valores: [{ atributoRecursoId: f.atributoOtraFamilia, valor: 3 }] }), /Atributo no aplicable/],
    ["atributo prohibido", (f: Fixture) => ({ valores: [{ atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo }, { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico }, { atributoRecursoId: f.secreto, valor: "x" }] }), /Atributo prohibido/],
    ["regla condicional requerida", (f: Fixture) => ({ valores: [{ atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo }] }), /Atributo requerido ausente/],
  ])("rechaza %s", async (_name, change, error) => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, change(f)))).rejects.toThrow(error);
  });

  it("permite un CONDITIONAL base sin regla activa", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    const creado = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
    expect(creado._id).toBeDefined();
  });

  it.each([
    ["clase y familia incompatibles", (f: Fixture) => ({ claseRecursoId: f.otraClase })],
    ["familia y tipo incompatibles", (f: Fixture) => ({ familiaRecursoId: f.otraFamilia })],
  ])("rechaza jerarquía: %s", async (_name, change) => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, change(f)))).rejects.toThrow(/Jerarquía/);
  });

  it("canonicaliza valores de identidad sin usar el nombre visible", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    const valores = [
      { atributoRecursoId: f.color, valor: "cualquier nombre", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico },
      { atributoRecursoId: f.texto, valor: "  é   texto  " },
      { atributoRecursoId: f.booleano, valor: true },
      { atributoRecursoId: f.numero, valor: 12.5 },
    ];
    const creado = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { nombre: "Nombre A", valores }));
    expect(creado.identificadorTecnico).toBe("v1|EQUIPO|BOMBA|CENTRIFUGA|BOOL_ID=TRUE|COLOR=ROJO|NUM_ID=12.5|TEXTO_ID=É TEXTO");
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { nombre: "Nombre B", valores }))).rejects.toThrow(/duplicado/);
  });

  it("rechaza números no finitos", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { valores: [
      { atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.numero, valor: Infinity },
    ] }))).rejects.toThrow(/Número no finito/);
  });

  it("acepta una política de unidad específica del tipo", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    const creado = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { unidadId: f.unidadTipo }));
    expect(creado.unidadId).toBe(f.unidadTipo);
  });

  it("rechaza miembros inactivos de la jerarquía", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    for (const id of [f.clase, f.familia, f.tipo]) {
      await t.run(async ctx => { await ctx.db.patch(id, { activo: false }); });
      await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f))).rejects.toThrow("Jerarquía o unidad inexistente/inactiva");
      await t.run(async ctx => { await ctx.db.patch(id, { activo: true }); });
    }
  });

  it("rechaza una unidad inactiva", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    await t.run(async ctx => { await ctx.db.patch(f.unidad, { activo: false }); });
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f))).rejects.toThrow("Jerarquía o unidad inexistente/inactiva");
  });

  it("rechaza atributos repetidos y opciones inactivas o sobre valores no OPCION", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { valores: [
      { atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico },
    ] }))).rejects.toThrow("Atributo repetido");
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { valores: [
      { atributoRecursoId: f.color, valor: "inactiva", opcionAtributoId: f.opcionInactiva },
      { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico },
    ] }))).rejects.toThrow("Opción inválida");
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { valores: [
      { atributoRecursoId: f.texto, valor: "texto", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico },
    ] }))).rejects.toThrow("Tipo de valor inválido");
  });

  it("persiste exactamente todos los valores suministrados", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    const supplied = [
      { atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico },
      { atributoRecursoId: f.peso, valor: 42.5 },
      { atributoRecursoId: f.texto, valor: "texto exacto" },
      { atributoRecursoId: f.booleano, valor: false },
      { atributoRecursoId: f.numero, valor: 0 },
    ];
    const creado = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { descripcion: "Descripción exacta", valores: supplied }));
    const obtenido = await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: creado._id });
    expect(obtenido).not.toBeNull();
    expect(obtenido).toMatchObject({ nombre: "Bomba visible", descripcion: "Descripción exacta" });
    expect(obtenido!.valores.map(({ atributoRecursoId, valor, opcionAtributoId }) => ({ atributoRecursoId, valor, opcionAtributoId }))).toEqual(supplied);
  });

  it("devuelve el detalle unido, con opciones y orden configurado", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const recurso = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { valores: [...input(f).valores, { atributoRecursoId: f.peso, valor: 42 }] }));
        const detalle = await t.query(api.catalogoRecursos.recursos.obtenerDetalleRecurso, { recursoId: recurso._id });
        expect(detalle).toMatchObject({ identificadorTecnico: recurso.identificadorTecnico, nombre: "Bomba visible", activo: true, revision: 1, clase: { clave: "EQUIPO", nombre: "Equipo" }, familia: { clave: "BOMBA", nombre: "Bomba" }, tipo: { clave: "CENTRIFUGA", nombre: "Centrífuga" }, unidad: { clave: "UN", nombre: "Unidad", simbolo: "u" } });
        expect(detalle!.atributos.map((a: { clave: string }) => a.clave)).toEqual(["COLOR", "PESO", "MODO"]);
        expect(detalle!.atributos.find((a: { clave: string }) => a.clave === "COLOR")).toMatchObject({ valor: "rojo", participaIdentidad: true, aplicabilidad: "REQUIRED", opcion: { clave: "ROJO", nombre: "Rojo" } });
        expect(detalle!.atributos.find((a: { clave: string }) => a.clave === "PESO")).toMatchObject({ valor: 42, tipoDato: "NUMERO", participaIdentidad: true, unidad: { clave: "UN", nombre: "Unidad", simbolo: "u" } });
            expect(JSON.stringify(detalle)).not.toContain("atributoRecursoId");
      });

      it("rechaza una opción almacenada de otra definición", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const recurso = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
        await t.run(async ctx => { await ctx.db.patch(f.rojo, { definicionAtributoId: f.modoDef }); });
        await expect(t.query(api.catalogoRecursos.recursos.obtenerDetalleRecurso, { recursoId: recurso._id })).rejects.toThrow(/Inconsistencia técnica del catálogo/);
      });

      it("mantiene visible el detalle histórico de un recurso inactivo", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const recurso = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
        await t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: recurso._id, revisionEsperada: 1 });
        expect(await t.query(api.catalogoRecursos.recursos.obtenerDetalleRecurso, { recursoId: recurso._id })).toMatchObject({ activo: false, revision: 2, atributos: expect.arrayContaining([expect.objectContaining({ clave: "COLOR", valor: "rojo" })]) });
      });

      it("devuelve null para un detalle inexistente", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const recurso = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
        await t.run(async ctx => { await ctx.db.delete(recurso._id); });
        expect(await t.query(api.catalogoRecursos.recursos.obtenerDetalleRecurso, { recursoId: recurso._id })).toBeNull();
      });

      it("falla claramente ante una referencia física de catálogo ausente", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const recurso = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
        await t.run(async ctx => { await ctx.db.delete(f.tipo); });
        await expect(t.query(api.catalogoRecursos.recursos.obtenerDetalleRecurso, { recursoId: recurso._id })).rejects.toThrow(/Inconsistencia técnica del catálogo/);
      });

      it("devuelve null para un recurso inexistente", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    const creado = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f));
    await t.run(async ctx => {
      for (const valor of await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", creado._id)).collect()) await ctx.db.delete(valor._id);
      await ctx.db.delete(creado._id);
    });
    expect(await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: creado._id })).toBeNull();
  });

    describe("listado, actualización y ciclo de vida", () => {
      async function crear(t: ReturnType<typeof convexTest>, f: Fixture, overrides: Record<string, unknown> = {}) {
        return t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, overrides));
      }

      it("lista sin filtro, por tipo y por estado activo", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const primero = await crear(t, f, { nombre: "Primero" });
        const segundo = await crear(t, f, { nombre: "Segundo", valores: [...input(f).valores, { atributoRecursoId: f.peso, valor: 2 }] });
            const tercero = await crear(t, f, { claseRecursoId: f.otraClase, familiaRecursoId: f.otraFamilia, tipoRecursoId: f.otroTipo, nombre: "Válvula Este", valores: [] });
        await t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: segundo._id, revisionEsperada: 1 });
        expect((await t.query(api.catalogoRecursos.recursos.listarRecursos, {})).map(r => r.nombre)).toEqual(["Primero", "Segundo", "Válvula Este"]);
        expect((await t.query(api.catalogoRecursos.recursos.listarRecursos, { tipoRecursoId: f.tipo })).map(r => r.nombre)).toEqual(["Primero", "Segundo"]);
        expect((await t.query(api.catalogoRecursos.recursos.listarRecursos, { activo: true })).map(r => r.nombre)).toEqual(["Primero", "Válvula Este"]);
        expect((await t.query(api.catalogoRecursos.recursos.listarRecursos, { activo: false })).map(r => r.nombre)).toEqual(["Segundo"]);
      });

      it("busca por nombre visible combinando tipo y estado", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const activo = await crear(t, f, { nombre: "Bomba Norte" });
        const inactivo = await crear(t, f, { nombre: "Bomba Sur", valores: [...input(f).valores, { atributoRecursoId: f.peso, valor: 3 }] });
            const otroTipo = await crear(t, f, { claseRecursoId: f.otraClase, familiaRecursoId: f.otraFamilia, tipoRecursoId: f.otroTipo, nombre: "Válvula Norte", valores: [] });
        await t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: inactivo._id, revisionEsperada: 1 });
        expect((await t.query(api.catalogoRecursos.recursos.buscarRecursos, { texto: "Bomba", tipoRecursoId: f.tipo, activo: true })).map(r => r._id)).toEqual([activo._id]);
        expect((await t.query(api.catalogoRecursos.recursos.buscarRecursos, { texto: "Sur", tipoRecursoId: f.tipo, activo: false })).map(r => r._id)).toEqual([inactivo._id]);
            expect((await t.query(api.catalogoRecursos.recursos.buscarRecursos, { texto: "Válvula", tipoRecursoId: f.tipo })).map(r => r._id)).toEqual([]);
            expect((await t.query(api.catalogoRecursos.recursos.buscarRecursos, { texto: "Norte", tipoRecursoId: f.otroTipo, activo: true })).map(r => r._id)).toEqual([otroTipo._id]);
      });

      it("actualiza una vez, conserva identidad con cambio de nombre y cambia identidad con valor técnico", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t); const original = await crear(t, f);
        const nombre = await t.mutation(api.catalogoRecursos.recursos.actualizarRecurso, { ...input(f, { nombre: "Nuevo nombre" }), recursoId: original._id, revisionEsperada: 1 });
        expect(nombre.revision).toBe(2); expect(nombre.identificadorTecnico).toBe(original.identificadorTecnico);
        const valores = [...input(f).valores, { atributoRecursoId: f.peso, valor: 8 }];
        const cambiado = await t.mutation(api.catalogoRecursos.recursos.actualizarRecurso, { ...input(f, { valores }), recursoId: original._id, revisionEsperada: 2 });
        expect(cambiado.revision).toBe(3); expect(cambiado.identificadorTecnico).not.toBe(original.identificadorTecnico);
      });

      it("rechaza actualización obsoleta y duplicada sin cambiar valores", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t);
        const primero = await crear(t, f); const segundo = await crear(t, f, { nombre: "Segundo", valores: [...input(f).valores, { atributoRecursoId: f.peso, valor: 4 }] });
        const antes = await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: primero._id });
        await expect(t.mutation(api.catalogoRecursos.recursos.actualizarRecurso, { ...input(f, { nombre: "Obsoleto" }), recursoId: primero._id, revisionEsperada: 0 })).rejects.toThrow(/obsoleta/);
        await expect(t.mutation(api.catalogoRecursos.recursos.actualizarRecurso, { ...input(f, { nombre: "Duplicado" }), recursoId: segundo._id, revisionEsperada: 1 })).rejects.toThrow(/duplicado/);
        expect(await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: primero._id })).toMatchObject({ revision: antes!.revision, identificadorTecnico: antes!.identificadorTecnico, nombre: antes!.nombre });
      });

      it("reemplaza valores atómicamente", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t); const recurso = await crear(t, f);
        const valores = [...input(f).valores, { atributoRecursoId: f.peso, valor: 9 }];
        const actualizado = await t.mutation(api.catalogoRecursos.recursos.actualizarRecurso, { ...input(f, { valores }), recursoId: recurso._id, revisionEsperada: 1 });
        expect(actualizado.valores.map(v => v.atributoRecursoId)).toEqual(valores.map(v => v.atributoRecursoId));
        expect(new Set(actualizado.valores.map(v => v._id)).size).toBe(valores.length);
        await expect(t.mutation(api.catalogoRecursos.recursos.actualizarRecurso, { ...input(f, { valores: [] }), recursoId: recurso._id, revisionEsperada: 2 })).rejects.toThrow(/requerido/);
        expect((await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: recurso._id }))!.valores.map(v => v.atributoRecursoId)).toEqual(valores.map(v => v.atributoRecursoId));
      });

      it("desactiva una vez, conserva datos y rechaza repetición u obsolescencia", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t); const recurso = await crear(t, f);
        const desactivado = await t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: recurso._id, revisionEsperada: 1 });
        expect(desactivado).toMatchObject({ activo: false, revision: 2, identificadorTecnico: recurso.identificadorTecnico, valores: recurso.valores });
        expect((await t.query(api.catalogoRecursos.recursos.listarRecursos, { activo: false })).map(r => r._id)).toContain(recurso._id);
        expect(await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: recurso._id })).toMatchObject({ activo: false, valores: recurso.valores });
        await expect(t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: recurso._id, revisionEsperada: 1 })).rejects.toThrow(/obsoleta/);
        await expect(t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: recurso._id, revisionEsperada: 2 })).rejects.toThrow(/activo/);
      });

      it("reactiva con identidad persistida y rechaza estado activo, revisión obsoleta y catálogos invalidados", async () => {
        const t = convexTest(schema, modules); const f = await seedFixture(t); const recurso = await crear(t, f);
        await t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: recurso._id, revisionEsperada: 1 });
        await t.run(async ctx => { await ctx.db.patch(f.tipo, { clave: "CENTRIFUGA-2" }); });
            const reactivado = await t.mutation(api.catalogoRecursos.recursos.reactivarRecurso, { recursoId: recurso._id, revisionEsperada: 2 });
        expect(reactivado).toMatchObject({ activo: true, revision: 3, identificadorTecnico: "v1|EQUIPO|BOMBA|CENTRIFUGA-2|COLOR=ROJO" });
            expect((await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: recurso._id }))!.identificadorTecnico).toBe("v1|EQUIPO|BOMBA|CENTRIFUGA-2|COLOR=ROJO");
        await expect(t.mutation(api.catalogoRecursos.recursos.reactivarRecurso, { recursoId: recurso._id, revisionEsperada: 3 })).rejects.toThrow(/activo/);
        await expect(t.mutation(api.catalogoRecursos.recursos.reactivarRecurso, { recursoId: recurso._id, revisionEsperada: 2 })).rejects.toThrow(/obsoleta/);
      });

      it.each(["unidad", "atributo", "opcion", "regla"])("no reactiva tras invalidar %s del catálogo", async kind => {
        const t = convexTest(schema, modules); const f = await seedFixture(t); const recurso = await crear(t, f);
        await t.mutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: recurso._id, revisionEsperada: 1 });
        await t.run(async ctx => {
          const id = kind === "unidad" ? f.unidad : kind === "atributo" ? f.color : kind === "opcion" ? f.rojo : (await ctx.db.query("reglasAtributoRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", f.tipo)).first())!._id;
          await ctx.db.patch(id, { activo: false });
        });
        await expect(t.mutation(api.catalogoRecursos.recursos.reactivarRecurso, { recursoId: recurso._id, revisionEsperada: 2 })).rejects.toThrow();
        expect((await t.query(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: recurso._id }))!.activo).toBe(false);
      });
    });

  it("revierte toda la creación cuando falla la validación", async () => {
    const t = convexTest(schema, modules); const f = await seedFixture(t);
    await expect(t.mutation(api.catalogoRecursos.recursos.crearRecurso, input(f, { valores: [
      { atributoRecursoId: f.color, valor: "rojo", opcionAtributoId: f.rojo },
      { atributoRecursoId: f.modo, valor: "auto", opcionAtributoId: f.automatico },
      { atributoRecursoId: f.noAplica, valor: "no debe persistir" },
    ] }))).rejects.toThrow("Atributo prohibido");
    const counts = await t.run(async ctx => ({
      recursos: (await ctx.db.query("recursos").withIndex("porIdentificadorTecnico").collect()).length,
      valores: (await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso").collect()).length,
    }));
    expect(counts).toEqual({ recursos: 0, valores: 0 });
  });
});
