import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api, internal } from "../_generated/api";
import schema from "../schema";

const modules = {
  ...import.meta.glob("../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../catalogoAdmin/${path.slice(2)}`, module])),
  ...Object.fromEntries(Object.entries(import.meta.glob("../catalogoRecursos/*.{ts,js}"))),
};

async function fixture(t: ReturnType<typeof convexTest>) {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "Clase", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "Familia", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "Tipo", activo: true, revision: 1 });
    const unidad = await ctx.db.insert("unidades", { clave: "M", nombre: "Metro", simbolo: "m", activo: true, revision: 1 });
    await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, unidadId: unidad, principal: true, activo: true, revision: 1 });
    await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: tipo, tokens: [{ tipo: "TYPE_NAME" }], separador: " · ", activo: true, revision: 1 });
    const organizacion = await ctx.db.insert("organizaciones", { clave: "ORG", nombre: "Org", activo: true, revision: 1 });
    return { clase, familia, tipo, organizacion };
  });
}

const publish = (organizacionId: any) => ({ organizacionId });

describe("publicación administrativa explícita", () => {
  it("publica solo por el comando explícito y devuelve CREATED/UNCHANGED", async () => {
    const t = convexTest(schema, modules);
    const ids = await fixture(t);
    expect(await t.query(api.catalogoRecursos.catalogoPublicado.obtenerUltimaRevisionPublicada, { organizacionClave: "ORG" })).toBeNull();
    const first = await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion));
    expect(first).toMatchObject({ disposition: "CREATED", numero: 1 });
    await t.run(async ctx => ctx.db.patch(ids.tipo, { nombre: "Edited without publish" }));
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerUltimaRevisionPublicada, { organizacionClave: "ORG" }))?.numero).toBe(1);
    const unchanged = await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion));
    expect(unchanged).toMatchObject({ disposition: "CREATED", numero: 2 });
  });

  it("devuelve UNCHANGED y no agrega una revisión cuando el contenido no cambia", async () => {
    const t = convexTest(schema, modules);
    const ids = await fixture(t);
    const first = await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion));
    const unchanged = await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion));
    expect(unchanged).toEqual({ disposition: "UNCHANGED", revisionId: first.revisionId, numero: 1, hashContenido: first.hashContenido });
    expect((await t.query(api.catalogoAdmin.publicacion.listarRevisiones, { organizacionId: ids.organizacion, cursor: null, pageSize: 10 })).items).toHaveLength(1);
  });

  it("rechaza una organización ausente o inactiva con un error estructurado", async () => {
    const t = convexTest(schema, modules);
    const ids = await fixture(t);
    await t.run(async ctx => ctx.db.patch(ids.organizacion, { activo: false }));
    await expect(t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    await t.run(async ctx => ctx.db.delete(ids.organizacion));
    await expect(t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
  });

  it("mantiene snapshots inmutables, aísla organizaciones y pagina el historial descendente", async () => {
    const t = convexTest(schema, modules);
    const ids = await fixture(t);
    const other = await t.run(async ctx => ctx.db.insert("organizaciones", { clave: "OTHER", nombre: "Other", activo: true, revision: 1 }));
    const first = await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion));
    await t.run(async ctx => ctx.db.patch(ids.tipo, { nombre: "Nuevo" }));
    const second = await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion));
    await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(other));
    const page = await t.query(api.catalogoAdmin.publicacion.listarRevisiones, { organizacionId: ids.organizacion, cursor: null, pageSize: 1 });
    expect(page.items.map(item => item.numero)).toEqual([2]);
    expect(page.continuationCursor).toBeTruthy();
    const next = await t.query(api.catalogoAdmin.publicacion.listarRevisiones, { organizacionId: ids.organizacion, cursor: page.continuationCursor, pageSize: 1 });
    expect(next.items.map(item => item.numero)).toEqual([1]);
    expect(await t.query(api.catalogoAdmin.publicacion.obtenerRevision, { organizacionId: other, revisionId: first.revisionId })).toBeNull();
    const old = await t.query(api.catalogoAdmin.publicacion.obtenerSnapshotTipo, { organizacionId: ids.organizacion, revisionId: first.revisionId, tipoClave: "T" });
    expect(old?.snapshot.tipo.nombre).toBe("Tipo");
    expect((await t.query(api.catalogoAdmin.publicacion.obtenerSnapshotTipo, { organizacionId: ids.organizacion, revisionId: second.revisionId, tipoClave: "T" }))?.snapshot.tipo.nombre).toBe("Nuevo");
  });

  it("omite una rama inerte aunque contenga un Type activo incompleto", async () => {
    const t = convexTest(schema, modules);
    const ids = await fixture(t);
    await t.run(async ctx => {
      const family = await ctx.db.insert("familiasRecurso", { claseRecursoId: ids.clase, clave: "INERT", nombre: "Inert", activo: false, revision: 1 });
      await ctx.db.insert("tiposRecurso", { familiaRecursoId: family, clave: "DRAFT", nombre: "Draft", activo: true, revision: 1 });
    });
    const result = await t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion));
    expect(await t.query(api.catalogoAdmin.publicacion.obtenerSnapshotTipo, { organizacionId: ids.organizacion, revisionId: result.revisionId, tipoClave: "DRAFT" })).toBeNull();
  });

  it("falla atómicamente cuando un Type efectivo es inválido o su clave es ambigua", async () => {
    const t = convexTest(schema, modules);
    const ids = await fixture(t);
    await t.run(async ctx => {
      const invalid = await ctx.db.insert("tiposRecurso", { familiaRecursoId: ids.familia, clave: "INVALID", nombre: "Invalid", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: ids.familia, tipoRecursoId: invalid, unidadId: (await ctx.db.query("unidades").first())!._id, principal: true, activo: true, revision: 1 });
    });
    await expect(t.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(ids.organizacion))).rejects.toMatchObject({ data: { code: "ADMIN_PUBLICATION_INVALID" } });
    expect(await t.query(api.catalogoRecursos.catalogoPublicado.obtenerUltimaRevisionPublicada, { organizacionClave: "ORG" })).toBeNull();

    const ambiguous = convexTest(schema, modules);
    const duplicate = await fixture(ambiguous);
    await ambiguous.run(async ctx => { await ctx.db.insert("tiposRecurso", { familiaRecursoId: duplicate.familia, clave: "T", nombre: "Duplicate", activo: true, revision: 1 }); });
    await expect(ambiguous.mutation(api.catalogoAdmin.publicacion.publicarCatalogo, publish(duplicate.organizacion))).rejects.toMatchObject({ data: { code: "ADMIN_PUBLICATION_INVALID" } });
  });
});
