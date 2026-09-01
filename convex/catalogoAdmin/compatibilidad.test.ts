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
    const [aDef, bDef, numberDef, foreignDef] = await Promise.all(["A", "B", "N", "FOREIGN"].map((clave, index) => ctx.db.insert("definicionesAtributo", { clave, nombre: clave, tipoDato: index === 2 ? "NUMERO" : "OPCION", activo: true, revision: 1 })));
    const a = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: aDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    const b = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: bDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 2, activo: true, revision: 1 });
    const numeric = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: numberDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 3, activo: true, revision: 1 });
    const foreign = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: otro, definicionAtributoId: aDef, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    const a1 = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: aDef, clave: "A1", nombre: "A1", activo: true, revision: 1 });
    const a2 = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: aDef, clave: "A2", nombre: "A2", activo: true, revision: 1 });
    const b1 = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: bDef, clave: "B1", nombre: "B1", activo: true, revision: 1 });
    const b2 = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: bDef, clave: "B2", nombre: "B2", activo: true, revision: 1 });
    const foreignOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: foreignDef, clave: "F1", nombre: "F1", activo: true, revision: 1 });
    return { tipo, a, b, numeric, foreign, a1, a2, b1, b2, foreignOption };
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

  const relation = (politicaCompatibilidadId: any, opcionOrigenId: any, opcionDestinoId: any, extra: Record<string, unknown> = {}) => ({ politicaCompatibilidadId, opcionOrigenId, opcionDestinoId, activo: false, ...extra });

  it("administra relaciones con ownership, identidad reservada y ciclo de vida", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const policy = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b));
    const first = await t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(policy.item.id, ids.a1, ids.b1));
    expect(first.item).toMatchObject({ activo: false, revision: 1, effective: false, normalizedIdentity: expect.stringContaining("D|") });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(policy.item.id, ids.a1, ids.b1, { activo: true }))).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(policy.item.id, ids.a1, ids.foreignOption))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.actualizarRelacionCompatibilidad, { relacionCompatibilidadId: first.item.id, expectedRevision: 1, politicaCompatibilidadId: policy.item.id, opcionOrigenId: ids.a1, opcionDestinoId: ids.b1 })).resolves.toMatchObject({ disposition: "UNCHANGED" });
    const active = await t.mutation(api.catalogoAdmin.compatibilidad.activarRelacionCompatibilidad, { relacionCompatibilidadId: first.item.id, expectedRevision: 1 });
    expect(active.item).toMatchObject({ activo: true, revision: 2 });
    const inactive = await t.mutation(api.catalogoAdmin.compatibilidad.desactivarRelacionCompatibilidad, { relacionCompatibilidadId: first.item.id, expectedRevision: 2 });
    expect(inactive.item).toMatchObject({ activo: false, revision: 3 });
  });

  it("mantiene activa una relación almacenada inerte bajo política inactiva", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const policy = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b));
    const created = await t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(policy.item.id, ids.a1, ids.b1));
    expect(created.item).toMatchObject({ activo: false, effective: false, effectiveReasons: expect.arrayContaining(["INACTIVE", "POLICY_INACTIVE"]) });
    await t.run(async ctx => { await ctx.db.patch(ids.a1, { activo: false }); });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.activarRelacionCompatibilidad, { relacionCompatibilidadId: created.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
  });

  it("normaliza pares simétricos y reserva duplicados inactivos", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const policy = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b, { direccion: "SYMMETRIC" }));
    await t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(policy.item.id, ids.a1, ids.b1));
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(policy.item.id, ids.b1, ids.a1))).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    const details = await t.query(api.catalogoAdmin.compatibilidad.obtenerRelacionCompatibilidad, { relacionCompatibilidadId: (await t.query(api.catalogoAdmin.compatibilidad.listarRelacionesCompatibilidad, { politicaCompatibilidadId: policy.item.id, cursor: null, pageSize: 10 })).items[0].id });
    expect(details).toMatchObject({ normalizedIdentity: expect.stringMatching(/^S\\|/) });
  });

  it("recalcula metadatos al cambiar la dirección de una política", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const policy = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b));
    const created = await t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(policy.item.id, ids.a1, ids.b1));
    const changed = await t.mutation(api.catalogoAdmin.compatibilidad.actualizarPoliticaCompatibilidad, { politicaCompatibilidadId: policy.item.id, expectedRevision: 1, direccion: "SYMMETRIC" });
    expect(changed.item.direccion).toBe("SYMMETRIC");
    expect((await t.query(api.catalogoAdmin.compatibilidad.obtenerRelacionCompatibilidad, { relacionCompatibilidadId: created.item.id }))?.normalizedIdentity).toMatch(/^S\\|/);
  });

  it("rechaza un cambio de dirección que colisiona relaciones existentes", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const policy = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b, { activo: true }));
    await t.run(async ctx => {
      await ctx.db.insert("relacionesOpcionesAtributo", { politicaCompatibilidadId: policy.item.id, opcionOrigenId: ids.a1, opcionDestinoId: ids.b1, activo: false, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { politicaCompatibilidadId: policy.item.id, opcionOrigenId: ids.b1, opcionDestinoId: ids.a1, activo: false, revision: 1 });
    });
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.actualizarPoliticaCompatibilidad, { politicaCompatibilidadId: policy.item.id, expectedRevision: 1, direccion: "SYMMETRIC" })).rejects.toMatchObject({ data: { code: "ADMIN_CONFLICT" } });
  });

  it("permite allowlist con relación, mantiene denylist vacío e itera páginas", async () => {
    const t = convexTest(schema, modules); const ids = await setup(t);
    const allow = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.a, ids.b, { modo: "ALLOWLIST" }));
    await t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(allow.item.id, ids.a1, ids.b1, { activo: true }));
    await expect(t.mutation(api.catalogoAdmin.compatibilidad.activarPoliticaCompatibilidad, { politicaCompatibilidadId: allow.item.id, expectedRevision: 1 })).resolves.toMatchObject({ item: { activo: true } });
    const second = await t.mutation(api.catalogoAdmin.compatibilidad.crearRelacionCompatibilidad, relation(allow.item.id, ids.a2, ids.b2));
    expect(second.item.effective).toBe(false);
    const firstPage = await t.query(api.catalogoAdmin.compatibilidad.listarRelacionesCompatibilidad, { politicaCompatibilidadId: allow.item.id, cursor: null, pageSize: 1 });
    expect(firstPage.items).toHaveLength(1);
    if (firstPage.continuationCursor) {
      const next = await t.query(api.catalogoAdmin.compatibilidad.listarRelacionesCompatibilidad, { politicaCompatibilidadId: allow.item.id, cursor: firstPage.continuationCursor, pageSize: 1 });
      expect(next.items).toHaveLength(1);
    }
    const deny = await t.mutation(api.catalogoAdmin.compatibilidad.crearPoliticaCompatibilidad, create(ids.tipo, ids.b, ids.a, { modo: "DENYLIST", activo: true }));
    expect(deny.item.effective).toBe(true);
  });
});
