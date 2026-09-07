import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = {
  ...import.meta.glob("../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../catalogoAdmin/${path.slice(2)}`, module])),
};

async function setup(t: ReturnType<typeof convexTest>) {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "C", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "F", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "T", activo: true, revision: 1 });
    const other = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "O", nombre: "O", activo: true, revision: 1 });
    const definitions = await Promise.all(["a", "b", "c", "d"].map(clave => ctx.db.insert("definicionesAtributo", { clave, nombre: clave, tipoDato: "TEXTO", activo: true, revision: 1 })));
    const a = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: definitions[0], aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    const b = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: definitions[1], aplicabilidad: "CONDITIONAL", participaIdentidad: false, orden: 2, activo: true, revision: 1 });
    const c = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: definitions[2], aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 3, activo: true, revision: 1 });
    const d = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: definitions[3], aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 4, activo: true, revision: 1 });
    const foreign = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: other, definicionAtributoId: definitions[2], aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    return { tipo, a, b, c, d, foreign };
  });
}

async function setupDualReference(t: ReturnType<typeof convexTest>, tipo: string, familia: string) {
  return t.run(async ctx => {
    const definition = await ctx.db.insert("definicionesAtributo", { clave: "option", nombre: "option", tipoDato: "OPCION", activo: true, revision: 1 });
    const targetDefinition = await ctx.db.insert("definicionesAtributo", { clave: "target", nombre: "target", tipoDato: "TEXTO", activo: true, revision: 1 });
    const condition = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia as any, tipoRecursoId: tipo as any, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 5, activo: true, revision: 1 });
    const target = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia as any, tipoRecursoId: tipo as any, definicionAtributoId: targetDefinition, aplicabilidad: "CONDITIONAL", participaIdentidad: false, orden: 6, activo: true, revision: 1 });
    const option = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: definition, clave: "yes", nombre: "yes", activo: true, revision: 1 });
    const value = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: definition, clave: "yes", nombre: "yes", orden: 0, valor: { kind: "OPCION", opcionAtributoId: option }, opcionAtributoIdIndex: option, activo: true, revision: 1 });
    const otherOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: definition, clave: "no", nombre: "no", activo: true, revision: 1 });
    const otherValue = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: definition, clave: "no", nombre: "no", orden: 0, valor: { kind: "OPCION", opcionAtributoId: otherOption }, opcionAtributoIdIndex: otherOption, activo: true, revision: 1 });
    const foreignValue = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: targetDefinition, clave: "foreign", nombre: "foreign", orden: 0, valor: { kind: "TEXTO", value: "foreign" }, activo: true, revision: 1 });
    return { condition, target, option, value, otherValue, foreignValue };
  });
}

describe("administración de reglas condicionales", () => {
  it("rejects foreign assignments, self-targets, and reserves inactive identities", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    await expect(t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.foreign, atributoAfectadoId: ids.b, aplicabilidad: "REQUIRED" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    await expect(t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.a, atributoAfectadoId: ids.a, aplicabilidad: "REQUIRED" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE" } });
    const draft = await t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.a, atributoAfectadoId: ids.b, aplicabilidad: "REQUIRED" });
    await expect(t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.a, atributoAfectadoId: ids.b, aplicabilidad: "REQUIRED" })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    expect(draft.item).toMatchObject({ activo: false, revision: 1, effective: false });
    const updated = await t.mutation(api.catalogoAdmin.reglas.actualizarReglaAtributo, { reglaAtributoRecursoId: draft.item.id, expectedRevision: 1, aplicabilidad: "OPTIONAL" });
    expect(updated).toMatchObject({ disposition: "UPDATED", item: { revision: 2, aplicabilidad: "OPTIONAL" } });
    await expect(t.mutation(api.catalogoAdmin.reglas.desactivarReglaAtributo, { reglaAtributoRecursoId: draft.item.id, expectedRevision: 2 })).resolves.toMatchObject({ disposition: "UNCHANGED" });
    const page = await t.query(api.catalogoAdmin.reglas.listarReglasAtributo, { tipoRecursoId: ids.tipo, cursor: null, pageSize: 10 });
    expect(page.items).toHaveLength(1);
  });

  it("rejects CONDITIONAL results and contradictory co-active rules while allowing same-result rules", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    await expect(t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.a, atributoAfectadoId: ids.b, aplicabilidad: "CONDITIONAL" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE" } });
    const first = await t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.a, atributoAfectadoId: ids.b, aplicabilidad: "REQUIRED" });
    await t.mutation(api.catalogoAdmin.reglas.activarReglaAtributo, { reglaAtributoRecursoId: first.item.id, expectedRevision: 1 });
    const contradictory = await t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.c, atributoAfectadoId: ids.b, aplicabilidad: "FORBIDDEN" });
    await expect(t.mutation(api.catalogoAdmin.reglas.activarReglaAtributo, { reglaAtributoRecursoId: contradictory.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_CONFLICT" } });
    const sameResult = await t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: ids.d, atributoAfectadoId: ids.b, aplicabilidad: "REQUIRED" });
    await expect(t.mutation(api.catalogoAdmin.reglas.activarReglaAtributo, { reglaAtributoRecursoId: sameResult.item.id, expectedRevision: 1 })).resolves.toMatchObject({ item: { activo: true } });
  });

  it("stores mapped dual identities and rejects an immutable conflicting allowed value", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const dual = await setupDualReference(t, ids.tipo, (await t.run(ctx => ctx.db.get(ids.tipo)))!.familiaRecursoId);
    const draft = await t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: dual.condition, opcionCondicionId: dual.option, valorPermitidoCondicionId: dual.value, atributoAfectadoId: dual.target, aplicabilidad: "REQUIRED" });
    expect(draft.item).toMatchObject({ opcionCondicionId: dual.option, valorPermitidoCondicionId: dual.value, activo: false });
    await expect(t.mutation(api.catalogoAdmin.reglas.actualizarReglaAtributo, { reglaAtributoRecursoId: draft.item.id, expectedRevision: 1, valorPermitidoCondicionId: dual.otherValue })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
    await expect(t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: dual.condition, opcionCondicionId: dual.option, valorPermitidoCondicionId: dual.otherValue, atributoAfectadoId: dual.target, aplicabilidad: "OPTIONAL" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    await expect(t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: dual.condition, valorPermitidoCondicionId: dual.foreignValue, atributoAfectadoId: dual.target, aplicabilidad: "OPTIONAL" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
  });

  it("backfills legacy-only references, accepts allowed-only predicates, and prevents inactive activation writes", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const dual = await setupDualReference(t, ids.tipo, (await t.run(ctx => ctx.db.get(ids.tipo)))!.familiaRecursoId);
    const legacy = await t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: dual.condition, opcionCondicionId: dual.option, atributoAfectadoId: ids.b, aplicabilidad: "REQUIRED" });
    expect(legacy.item).toMatchObject({ opcionCondicionId: dual.option, valorPermitidoCondicionId: dual.value });
    const selection = await t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: dual.condition, valorPermitidoCondicionId: dual.otherValue, atributoAfectadoId: ids.c, aplicabilidad: "OPTIONAL" });
    await t.run(ctx => ctx.db.patch(dual.otherValue, { activo: false }));
    await expect(t.mutation(api.catalogoAdmin.reglas.activarReglaAtributo, { reglaAtributoRecursoId: selection.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    expect(await t.query(api.catalogoAdmin.reglas.obtenerReglaAtributo, { reglaAtributoRecursoId: selection.item.id })).toMatchObject({ activo: false, revision: 1, valorPermitidoCondicionId: dual.otherValue });
    await t.run(ctx => ctx.db.patch(dual.value, { activo: false }));
    await expect(t.mutation(api.catalogoAdmin.reglas.crearReglaAtributo, { tipoRecursoId: ids.tipo, atributoCondicionId: dual.condition, opcionCondicionId: dual.option, valorPermitidoCondicionId: dual.value, atributoAfectadoId: dual.target, aplicabilidad: "REQUIRED" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
  });
});
