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
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "Tipo", activo: true, revision: 1 });
    const foreignType = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "X", nombre: "Otro", activo: true, revision: 1 });
    const definition = await ctx.db.insert("definicionesAtributo", { clave: "COLOR", nombre: "Color", tipoDato: "OPCION", activo: true, revision: 1 });
    const assignment = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    const foreign = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: foreignType, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    return { tipo, assignment, foreign };
  });
}

describe("administración de presentación canónica", () => {
  it("permite múltiples borradores, conserva tokens y exige reemplazo explícito", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const first = await t.mutation(api.catalogoAdmin.presentacion.crearPoliticaPresentacion, { tipoRecursoId: ids.tipo, tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: ids.assignment }], separador: " / " });
    const second = await t.mutation(api.catalogoAdmin.presentacion.crearPoliticaPresentacion, { tipoRecursoId: ids.tipo, tokens: [{ tipo: "LITERAL", texto: "final" }, { tipo: "TYPE_NAME" }], separador: " · " });
    expect(second.item.tokens.map(token => token.tipo)).toEqual(["LITERAL", "TYPE_NAME"]);
    await expect(t.mutation(api.catalogoAdmin.presentacion.activarPoliticaPresentacion, { politicaPresentacionId: first.item.id, expectedRevision: 1 })).resolves.toMatchObject({ item: { activo: true } });
    await expect(t.mutation(api.catalogoAdmin.presentacion.activarPoliticaPresentacion, { politicaPresentacionId: second.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_CONFLICT" } });
    expect((await t.query(api.catalogoAdmin.presentacion.listarPoliticasPresentacion, { tipoRecursoId: ids.tipo, modo: "ALL", cursor: null, pageSize: 10 })).items).toHaveLength(2);
  });

  it("rejects attribute-only and foreign token references without activating drafts", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const attributeOnly = await t.mutation(api.catalogoAdmin.presentacion.crearPoliticaPresentacion, { tipoRecursoId: ids.tipo, tokens: [{ tipo: "ATTRIBUTE_VALUE", atributoRecursoId: ids.assignment }], separador: "-" });
    await expect(t.mutation(api.catalogoAdmin.presentacion.activarPoliticaPresentacion, { politicaPresentacionId: attributeOnly.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE" } });
    await expect(t.mutation(api.catalogoAdmin.presentacion.crearPoliticaPresentacion, { tipoRecursoId: ids.tipo, tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: ids.foreign }], separador: "-" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    expect(await t.query(api.catalogoAdmin.presentacion.obtenerPoliticaPresentacion, { politicaPresentacionId: attributeOnly.item.id })).toMatchObject({ activo: false, revision: 1 });
  });

  it("binds cursors to lifecycle filters", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    await t.mutation(api.catalogoAdmin.presentacion.crearPoliticaPresentacion, { tipoRecursoId: ids.tipo, tokens: [{ tipo: "TYPE_NAME" }], separador: "-" });
    const page = await t.query(api.catalogoAdmin.presentacion.listarPoliticasPresentacion, { tipoRecursoId: ids.tipo, modo: "ALL", cursor: null, pageSize: 1 });
    if (page.continuationCursor) await expect(t.query(api.catalogoAdmin.presentacion.listarPoliticasPresentacion, { tipoRecursoId: ids.tipo, modo: "ACTIVE", cursor: page.continuationCursor, pageSize: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_ARGUMENT" } });
  });
});
