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
    const otro = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "X", nombre: "X", activo: true, revision: 1 });
    const [aDef, bDef, numberDef] = await Promise.all(["A", "B", "N"].map((clave, index) => ctx.db.insert("definicionesAtributo", { clave, nombre: clave, tipoDato: index === 2 ? "NUMERO" : "OPCION", activo: true, revision: 1 })));
    const a = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: aDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    const b = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: bDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 2, activo: true, revision: 1 });
    const numeric = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: numberDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 3, activo: true, revision: 1 });
    const foreign = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: otro, definicionAtributoId: aDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    await ctx.db.insert("opcionesAtributo", { definicionAtributoId: aDef, clave: "A1", nombre: "A1", activo: true, revision: 1 });
    await ctx.db.insert("opcionesAtributo", { definicionAtributoId: bDef, clave: "B1", nombre: "B1", activo: true, revision: 1 });
    return { tipo, a, b, numeric, foreign };
  });
}

const create = (tipoRecursoId: any, atributoOrigenId: any, atributoDestinoId: any, extra: Record<string, unknown> = {}) => ({ tipoRecursoId, atributoOrigenId, atributoDestinoId, modo: "DENYLIST" as const, direccion: "DIRECTIONAL" as const, ...extra });

describe("administración de políticas de compatibilidad", () => {
  it("valida endpoints option seleccionados y distintos", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.numeric))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.foreign))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.a))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_ARGUMENT" } });
  });
  it("applies the exact directional/symmetric conflict matrix without changing existing policies", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const ab = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b, { activo: true }));
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.b, ids.a, { activo: true }))).resolves.toMatchObject({ item: { activo: true } });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b, { direccion: "SYMMETRIC", activo: true }))).rejects.toMatchObject({ data: { code: "ADMIN_CONFLICT" } });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b, { modo: "ALLOWLIST", activo: false }))).resolves.toMatchObject({ item: { activo: false } });
    expect(await t.query(api.catalogoAdmin.compatibilidad.obtenerPoliticaCompatibilidad, { politicaCompatibilidadId: ab.item.id })).toMatchObject({ activo: true, revision: 1 });
  });
  it("requires nonempty allowlists, accepts empty denylists, and honors stale/no-op lifecycle", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const allow = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b, { modo: "ALLOWLIST" }));
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.activarPoliticaCompatibilidad, { politicaCompatibilidadId: allow.item.id, expectedRevision: 2 })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.activarPoliticaCompatibilidad, { politicaCompatibilidadId: allow.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
    const deny = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.b, ids.a, { activo: false }));
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.desactivarPoliticaCompatibilidad, { politicaCompatibilidadId: deny.item.id, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UNCHANGED" });
    const page = await t.query(api.catalogoAdmin.compatibilidad.listarPoliticasCompatibilidad, { tipoRecursoId: ids.tipo, cursor: null, pageSize: 10, modo: "ALL" });
    expect(page.items).toHaveLength(2);
  });
});
