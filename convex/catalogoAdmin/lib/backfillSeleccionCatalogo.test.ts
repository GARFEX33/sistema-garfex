import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../../_generated/api";
import schema from "../../schema";

const backfillReference = (internal as any).catalogoAdmin.lib.backfillSeleccionCatalogo.backfillSeleccionCatalogo;
const modules = {
  ...import.meta.glob("../../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../../catalogoAdmin/lib/${path.slice(2)}`, module])),
};

type BackfillResult = {
  phase: "DEFINITIONS" | "OPTIONS" | "RULES" | "VERIFY";
  processed: number;
  updated: number;
  nextCursor: string | null;
  conflicts: Array<{ code: string; id: string }>;
  diagnostics: Array<{ code: string; id: string }>;
};

async function seed(t: ReturnType<typeof convexTest>) {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "Clase", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "Familia", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "Tipo", activo: true, revision: 1 });
    const unidad = await ctx.db.insert("unidades", { clave: "U", nombre: "Unidad", activo: true, revision: 1 });
    const seleccion = await ctx.db.insert("definicionesAtributo", { clave: "COLOR", nombre: "Color", tipoDato: "OPCION", activo: true, revision: 2 });
    const libre = await ctx.db.insert("definicionesAtributo", { clave: "NOTA", nombre: "Nota", tipoDato: "TEXTO", activo: true, revision: 3 });
    const activeOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: seleccion, clave: "AZUL", nombre: "Azul", activo: true, revision: 4 });
    const inactiveOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: seleccion, clave: "GRIS", nombre: "Gris", activo: false, revision: 5 });
    const condition = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: seleccion, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    const affected = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: libre, aplicabilidad: "CONDITIONAL", participaIdentidad: false, orden: 2, activo: true, revision: 1 });
    const rule = await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: tipo, atributoCondicionId: condition, opcionCondicionId: activeOption, atributoAfectadoId: affected, aplicabilidad: "REQUIRED", activo: true, revision: 1 });
    const resource = await ctx.db.insert("recursos", { tipoRecursoId: tipo, unidadId: unidad, identificadorTecnico: "legacy", nombre: "Legacy", activo: true, revision: 1 });
    const value = await ctx.db.insert("valoresAtributoRecurso", { recursoId: resource, atributoRecursoId: condition, valor: "AZUL", opcionAtributoId: activeOption });
    const organization = await ctx.db.insert("organizaciones", { clave: "ORG", nombre: "Org", activo: true, revision: 1 });
    const revision = await ctx.db.insert("catalogoRevisiones", { organizacionId: organization, numero: 1, estado: "PUBLISHED", hashContenido: "hash", creadoEn: 1, publicadoEn: 2 });
    const snapshot = await ctx.db.insert("catalogoTipoSnapshots", { organizacionId: organization, revisionId: revision, tipoClave: "T", snapshot: { clase: { id: clase, clave: "C", nombre: "Clase" }, familia: { id: familia, clave: "F", nombre: "Familia" }, tipo: { id: tipo, clave: "T", nombre: "Tipo" }, unidadNatural: { id: unidad, clave: "U", nombre: "Unidad" }, atributos: [], reglas: [], presentacionCanonica: { tipoNombre: "Tipo", tokens: [{ tipo: "TYPE_NAME" }], separador: " / " }, politicasCompatibilidad: [] } });
    return { seleccion, libre, activeOption, inactiveOption, rule, value, snapshot };
  });
}

async function complete(t: ReturnType<typeof convexTest>, batchSize = 1) {
  let cursor: string | null = null;
  const results: BackfillResult[] = [];
  do {
    const result: BackfillResult = await t.mutation(backfillReference, { cursor, batchSize });
    results.push(result);
    cursor = result.nextCursor;
  } while (cursor !== null);
  return results;
}

describe("backfill de catálogo de selección", () => {
  it("reanuda DEFINITIONS, OPTIONS, RULES y VERIFY sin reescribir recursos o snapshots", async () => {
    const t = convexTest(schema, modules);
    const ids = await seed(t);
    const before = await t.run(async ctx => ({ value: await ctx.db.get(ids.value), snapshot: await ctx.db.get(ids.snapshot) }));

    const results = await complete(t);
    const after = await t.run(async ctx => ({
      definitions: [await ctx.db.get(ids.seleccion), await ctx.db.get(ids.libre)],
      values: await ctx.db.query("valoresPermitidosAtributo").withIndex("porDefinicionYClave", q => q.eq("definicionAtributoId", ids.seleccion)).take(10),
      rule: await ctx.db.get(ids.rule),
      value: await ctx.db.get(ids.value),
      snapshot: await ctx.db.get(ids.snapshot),
    }));

    expect(results.map(result => result.phase)).toEqual(expect.arrayContaining(["DEFINITIONS", "OPTIONS", "RULES", "VERIFY"]));
    expect(after.definitions).toMatchObject([{ modoCaptura: "SELECCION" }, { modoCaptura: "LIBRE" }]);
    expect(after.values).toEqual(expect.arrayContaining([
      expect.objectContaining({ clave: "AZUL", valor: { kind: "OPCION", opcionAtributoId: ids.activeOption }, activo: true, orden: 0 }),
      expect.objectContaining({ clave: "GRIS", valor: { kind: "OPCION", opcionAtributoId: ids.inactiveOption }, activo: false, orden: 0 }),
    ]));
    expect(after.values.every(value => value.adminSortId === value._id)).toBe(true);
    expect(after.rule).toMatchObject({ opcionCondicionId: ids.activeOption, valorPermitidoCondicionId: after.values.find(value => value.valor.kind === "OPCION" && value.valor.opcionAtributoId === ids.activeOption)!._id });
    expect(after.value).toEqual(before.value);
    expect(after.snapshot).toEqual(before.snapshot);
    expect(await complete(t)).toEqual(expect.arrayContaining([expect.objectContaining({ updated: 0 })]));
  });

  it("reports duplicate source mappings during verification without choosing one", async () => {
    const t = convexTest(schema, modules);
    const ids = await seed(t);
    await t.run(async ctx => {
      for (const clave of ["ONE", "TWO"]) {
        const id = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: ids.seleccion, clave, nombre: clave, orden: 0, valor: { kind: "OPCION", opcionAtributoId: ids.activeOption }, opcionAtributoIdIndex: ids.activeOption, activo: true, revision: 1 });
        await ctx.db.patch(id, { adminSortId: id });
      }
    });

    const results = await complete(t);
    const rule = await t.run(ctx => ctx.db.get(ids.rule));

    expect(results.flatMap(result => result.diagnostics)).toEqual(expect.arrayContaining([expect.objectContaining({ code: "DUPLICATE_OPTION_MAPPING", id: ids.activeOption })]));
    expect(rule).not.toHaveProperty("valorPermitidoCondicionId");
  });

  it("reports mapping collisions and verify diagnostics without overwriting legacy rows", async () => {
    const t = convexTest(schema, modules);
    const ids = await seed(t);
    await t.run(async ctx => {
      await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: ids.seleccion, clave: "AZUL", nombre: "Wrong", orden: 9, valor: { kind: "OPCION", opcionAtributoId: ids.inactiveOption }, opcionAtributoIdIndex: ids.inactiveOption, activo: true, revision: 9, adminSortId: "existing" });
    });

    const results = await complete(t);
    const state = await t.run(async ctx => ({ value: await ctx.db.query("valoresPermitidosAtributo").withIndex("porDefinicionYClave", q => q.eq("definicionAtributoId", ids.seleccion).eq("clave", "AZUL")).first(), rule: await ctx.db.get(ids.rule) }));

    expect(results.flatMap(result => result.conflicts)).toEqual(expect.arrayContaining([expect.objectContaining({ code: "OPTION_KEY_PAYLOAD_CONFLICT", id: ids.activeOption })]));
    expect(results.flatMap(result => result.diagnostics)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "UNMAPPED_OPTION_RULE", id: ids.rule }),
      expect.objectContaining({ code: "INVALID_ACTIVE_OPTION_MAPPING", id: state.value!._id }),
    ]));
    expect(state.value).toMatchObject({ nombre: "Wrong", valor: { kind: "OPCION", opcionAtributoId: ids.inactiveOption } });
    expect(state.rule).not.toHaveProperty("valorPermitidoCondicionId");
  });
});
