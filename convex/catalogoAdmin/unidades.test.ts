import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = {
  ...import.meta.glob("../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../catalogoAdmin/${path.slice(2)}`, module])),
};
async function tree(t: ReturnType<typeof convexTest>) {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "C", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "F", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "T", activo: true, revision: 1 });
    return { familia, tipo };
  });
}

describe("administración de unidades y políticas", () => {
  it("administra unidades con identidad inmutable y revisión", async () => {
    const t = convexTest(schema, modules);
    const created = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: " M ", nombre: " Metro ", simbolo: "m" });
    expect(created.item).toMatchObject({ clave: "M", nombre: "Metro", revision: 1, activo: false });
    await expect(t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "M", nombre: "Otro" })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.unidades.actualizarUnidad, { unidadId: created.item.id, expectedRevision: 1, clave: "CM" })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
    await expect(t.mutation(api.catalogoAdmin.unidades.actualizarUnidad, { unidadId: created.item.id, expectedRevision: 1, nombre: "Metro largo" })).resolves.toMatchObject({ disposition: "UPDATED", item: { revision: 2 } });
  });

  it("rejects cross-family policies, reserves inactive identities, and resolves override/inheritance", async () => {
    const t = convexTest(schema, modules); const ids = await tree(t);
    const unit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "U", activo: true });
    await t.mutation(api.catalogoAdmin.unidades.crearPoliticaUnidad, { familiaRecursoId: ids.familia, unidadId: unit.item.id, principal: true, activo: true });
    const draft = await t.mutation(api.catalogoAdmin.unidades.crearPoliticaUnidad, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, unidadId: unit.item.id, principal: true });
    await expect(t.mutation(api.catalogoAdmin.unidades.crearPoliticaUnidad, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, unidadId: unit.item.id, principal: false })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    const other = await t.run(async ctx => { const c = await ctx.db.insert("clasesRecurso", { clave: "D", nombre: "D", activo: true, revision: 1 }); return ctx.db.insert("familiasRecurso", { claseRecursoId: c, clave: "G", nombre: "G", activo: true, revision: 1 }); });
    await expect(t.mutation(api.catalogoAdmin.unidades.crearPoliticaUnidad, { familiaRecursoId: other, tipoRecursoId: ids.tipo, unidadId: unit.item.id, principal: false })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    expect(draft.item).toMatchObject({ tipoRecursoId: ids.tipo, activo: false });
    const diagnostics = await t.query(api.catalogoAdmin.unidades.listarPoliticasUnidad, { paraTipoRecursoId: ids.tipo, cursor: null, pageSize: 10 });
    expect(diagnostics.items).toHaveLength(2);
    expect(diagnostics.items.find(item => item.tipoRecursoId === undefined)).toMatchObject({ shadowed: true, selection: "SHADOWED" });
  });

  it("blocks zero principal and active resource unit deactivation atomically", async () => {
    const t = convexTest(schema, modules); const ids = await tree(t);
    const unit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "U", activo: true });
    await t.mutation(api.catalogoAdmin.unidades.crearPoliticaUnidad, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, unidadId: unit.item.id, principal: true, activo: true });
    await expect(t.mutation(api.catalogoAdmin.unidades.desactivarPoliticaUnidad, { politicaUnidadId: (await t.query(api.catalogoAdmin.unidades.listarPoliticasUnidad, { tipoRecursoId: ids.tipo, cursor: null, pageSize: 10 })).items[0].id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
    await t.run(async ctx => { await ctx.db.insert("recursos", { tipoRecursoId: ids.tipo, unidadId: unit.item.id, identificadorTecnico: "R", nombre: "R", activo: true, revision: 1 }); });
    await expect(t.mutation(api.catalogoAdmin.unidades.desactivarUnidad, { unidadId: unit.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
  });
});
