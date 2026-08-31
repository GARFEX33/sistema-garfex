import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = {
  ...import.meta.glob("../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../catalogoAdmin/${path.slice(2)}`, module])),
};

async function tree(t: ReturnType<typeof convexTest>, active = true) {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "C", activo: active, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "F", activo: active, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "T", activo: active, revision: 1 });
    return { clase, familia, tipo };
  });
}

describe("administración de definiciones y opciones", () => {
  it("enforces definition type/unit policy, identity, revisions, and ALL reads", async () => {
    const t = convexTest(schema, modules);
    const unit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "Unit", activo: true });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "bad", nombre: "Bad", tipoDato: "TEXTO", unidadId: unit.item.id })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    const inactive = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: " D ", nombre: " Definition ", tipoDato: "OPCION" });
    expect(inactive.item).toMatchObject({ clave: "D", nombre: "Definition", activo: false, revision: 1 });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "D", nombre: "Again", tipoDato: "OPCION" })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: inactive.item.id, expectedRevision: 1, clave: "OTHER" })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: inactive.item.id, expectedRevision: 1, nombre: " Definition " })).resolves.toMatchObject({ disposition: "UNCHANGED" });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: inactive.item.id, expectedRevision: 2, nombre: "stale" })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
    const page = await t.query(api.catalogoAdmin.atributos.listarDefinicionesAtributo, { cursor: null, pageSize: 10 });
    expect(page.items).toHaveLength(1);
    expect(await t.query(api.catalogoAdmin.atributos.obtenerDefinicionAtributo, { definicionAtributoId: inactive.item.id })).toMatchObject({ effective: false });
  });

  it("restricts options to OPCION definitions and reserves inactive identities", async () => {
    const t = convexTest(schema, modules);
    const text = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "T", nombre: "Text", tipoDato: "TEXTO" });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: text.item.id, clave: "X", nombre: "X" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "O", nombre: "Option", tipoDato: "OPCION", activo: true });
    const option = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: definition.item.id, clave: " X ", nombre: " X ", activo: false });
    expect(option.item).toMatchObject({ clave: "X", activo: false, effective: false, revision: 1 });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: definition.item.id, clave: "X", nombre: "Again" })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1, definicionAtributoId: text.item.id })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.activarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: true } });
  });

  it("keeps active options inert below an inactive definition and blocks effective dependency removal", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "O", nombre: "Option", tipoDato: "OPCION", activo: true });
    const option = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: definition.item.id, clave: "X", nombre: "X", activo: true });
    await t.run(async ctx => {
      const assignment = await ctx.db.insert("atributosRecurso", { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
      await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: ids.tipo, atributoCondicionId: assignment, atributoAfectadoId: assignment, opcionCondicionId: option.item.id, aplicabilidad: "OPTIONAL", activo: true, revision: 1 });
    });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    await t.run(async ctx => { for (const row of await ctx.db.query("reglasAtributoRecurso").withIndex("porTipo").take(10)) await ctx.db.delete(row._id); for (const row of await ctx.db.query("atributosRecurso").withIndex("porDefinicion", q => q.eq("definicionAtributoId", definition.item.id)).take(10)) await ctx.db.delete(row._id); });
    await t.mutation(api.catalogoAdmin.atributos.desactivarDefinicionAtributo, { definicionAtributoId: definition.item.id, expectedRevision: 1 });
    expect(await t.query(api.catalogoAdmin.atributos.obtenerOpcionAtributo, { opcionAtributoId: option.item.id })).toMatchObject({ effective: false });
  });

  it("blocks effective presentation, compatibility, and resource dependencies", async () => {
    const t = convexTest(schema, modules); const ids = await tree(t);
    const first = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "A", nombre: "A", tipoDato: "OPCION", activo: true });
    const second = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "B", nombre: "B", tipoDato: "OPCION", activo: true });
    const option = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: first.item.id, clave: "A1", nombre: "A1", activo: true });
    const option2 = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: second.item.id, clave: "B1", nombre: "B1", activo: true });
    const assignment = await t.run(async ctx => ctx.db.insert("atributosRecurso", { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: first.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 }));
    await t.run(async ctx => { await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: ids.tipo, tokens: [{ tipo: "ATTRIBUTE_VALUE", atributoRecursoId: assignment }], separador: "-", activo: true, revision: 1 }); });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarDefinicionAtributo, { definicionAtributoId: first.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    await t.run(async ctx => { for (const row of await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", q => q.eq("tipoRecursoId", ids.tipo)).take(10)) await ctx.db.delete(row._id); await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: ids.tipo, atributoOrigenId: assignment, atributoDestinoId: assignment, modo: "DENYLIST", direccion: "DIRECTIONAL", activo: true, revision: 1 }); });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarDefinicionAtributo, { definicionAtributoId: first.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    await t.run(async ctx => { for (const row of await ctx.db.query("politicasCompatibilidadOpciones").withIndex("porTipo", q => q.eq("tipoRecursoId", ids.tipo)).take(10)) await ctx.db.delete(row._id); const resource = await ctx.db.insert("recursos", { tipoRecursoId: ids.tipo, unidadId: await ctx.db.insert("unidades", { clave: "U", nombre: "U", activo: true, revision: 1 }), identificadorTecnico: "R", nombre: "R", activo: true, revision: 1 }); await ctx.db.insert("valoresAtributoRecurso", { recursoId: resource, atributoRecursoId: assignment, valor: "A", opcionAtributoId: option.item.id }); });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    expect(option2.item.effective).toBe(true);
  });

  it("administra asignaciones con identidad, ownership y precedence", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "D", nombre: "D", tipoDato: "TEXTO", activo: true });
    const family = await t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, definicionAtributoId: definition.item.id, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 2 });
    expect(family.item).toMatchObject({ activo: false, revision: 1, selection: "SELECTED" });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true })).resolves.toMatchObject({ disposition: "CREATED" });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    const page = await t.query(api.catalogoAdmin.atributos.listarAsignacionesAtributo, { tipoRecursoId: ids.tipo, cursor: null, pageSize: 10 });
    expect(page.items.map(item => item.selection)).toEqual(["SHADOWED", "SELECTED"]);
  });

  it("requires options before an effective OPCION assignment can activate", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "O", nombre: "O", tipoDato: "OPCION", activo: true });
    const assignment = await t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1 });
    await expect(t.mutation(api.catalogoAdmin.atributos.activarAsignacionAtributo, { atributoRecursoId: assignment.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
  });
});
