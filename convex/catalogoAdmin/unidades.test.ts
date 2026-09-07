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
    return { clase, familia, tipo };
  });
}

describe("administración de unidades y políticas", () => {
  it("rekeys the normalized global key while preserving mutable fields and revision semantics", async () => {
    const t = convexTest(schema, modules);
    const created = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: " M ", nombre: " Metro ", simbolo: "m" });
    expect(created.item).toMatchObject({ clave: "M", nombre: "Metro", simbolo: "m", revision: 1, activo: false });

    const changed = await t.mutation(api.catalogoAdmin.unidades.actualizarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 1,
      clave: " CM ",
      nombre: " Centímetro ",
      simbolo: " cm ",
    });
    expect(changed).toMatchObject({ disposition: "UPDATED", item: { clave: "CM", nombre: "Centímetro", simbolo: "cm", revision: 2 } });
    await expect(t.mutation(api.catalogoAdmin.unidades.actualizarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 2,
      clave: " CM ",
      nombre: " Centímetro ",
      simbolo: " cm ",
    })).resolves.toMatchObject({ disposition: "UNCHANGED", item: { revision: 2 } });
    await expect(t.mutation(api.catalogoAdmin.unidades.actualizarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 2,
      clave: " ",
    })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_ARGUMENT", context: { field: "clave" } } });

    await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "DUPLICADA", nombre: "Duplicada" });
    await expect(t.mutation(api.catalogoAdmin.unidades.actualizarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 2,
      clave: " DUPLICADA ",
    })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.unidades.actualizarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 1,
      clave: " ",
    })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
  });

  it("deletes an inactive unit without dependencies while preserving historical snapshots", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const created = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "Unidad" });
    const snapshotId = await t.run(async ctx => {
      const organizationId = await ctx.db.insert("organizaciones", { clave: "O", nombre: "Organización", activo: true, revision: 1 });
      const revisionId = await ctx.db.insert("catalogoRevisiones", { organizacionId: organizationId, numero: 1, estado: "PUBLISHED", hashContenido: "hash", creadoEn: 1, publicadoEn: 1 });
      return ctx.db.insert("catalogoTipoSnapshots", {
        organizacionId: organizationId,
        revisionId,
        tipoClave: "T",
        snapshot: {
          clase: { id: ids.clase, clave: "C", nombre: "C" },
          familia: { id: ids.familia, clave: "F", nombre: "F" },
          tipo: { id: ids.tipo, clave: "T", nombre: "T" },
          unidadNatural: { id: created.item.id, clave: "U", nombre: "Unidad" },
          atributos: [],
          reglas: [],
          presentacionCanonica: { tipoNombre: "T", tokens: [], separador: "" },
          politicasCompatibilidad: [],
        },
      });
    });
    await expect(t.mutation(api.catalogoAdmin.unidades.eliminarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 1,
    })).resolves.toEqual({ disposition: "DELETED", id: created.item.id });
    await expect(t.query(api.catalogoAdmin.unidades.obtenerUnidad, { unidadId: created.item.id })).resolves.toBeNull();
    expect(await t.run(ctx => ctx.db.get(snapshotId))).not.toBeNull();
  });

  it("checks deletion revision before rejecting an active unit", async () => {
    const t = convexTest(schema, modules);
    const created = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "Unidad", activo: true });
    await expect(t.mutation(api.catalogoAdmin.unidades.eliminarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 2,
    })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
    await expect(t.mutation(api.catalogoAdmin.unidades.eliminarUnidad, {
      unidadId: created.item.id,
      expectedRevision: 1,
    })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE", context: { field: "activo" } } });
  });

  it("blocks unit deletion for every direct dependency, including inactive rows", async () => {
    const blockers = [
      ["recursos", "resource"],
      ["definicionesAtributo", "attribute-definition"],
      ["politicasUnidadRecurso", "unit-policy"],
    ] as const;
    for (const [table, relationKind] of blockers) {
      const t = convexTest(schema, modules);
      const ids = await tree(t);
      const unit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: `U-${table}`, nombre: "Unidad" });
      await t.run(async ctx => {
        if (table === "recursos") return ctx.db.insert("recursos", { tipoRecursoId: ids.tipo, unidadId: unit.item.id, identificadorTecnico: "R", nombre: "Recurso", activo: false, revision: 1 });
        if (table === "definicionesAtributo") return ctx.db.insert("definicionesAtributo", { clave: "D", nombre: "Definición", tipoDato: "TEXTO", unidadId: unit.item.id, activo: false, revision: 1 });
        return ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, unidadId: unit.item.id, principal: false, activo: false, revision: 1 });
      });
      await expect(t.mutation(api.catalogoAdmin.unidades.eliminarUnidad, {
        unidadId: unit.item.id,
        expectedRevision: 1,
      })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED", context: { relationKind } } });
    }
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

  it("deletes inactive policies without touching snapshots and reports repeated deletion as not found", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const unit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "Unidad" });
    const policy = await t.mutation(api.catalogoAdmin.unidades.crearPoliticaUnidad, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, unidadId: unit.item.id, principal: false });
    const snapshotId = await t.run(async ctx => {
      const organizationId = await ctx.db.insert("organizaciones", { clave: "O", nombre: "Organización", activo: true, revision: 1 });
      const revisionId = await ctx.db.insert("catalogoRevisiones", { organizacionId: organizationId, numero: 1, estado: "PUBLISHED", hashContenido: "hash", creadoEn: 1, publicadoEn: 1 });
      return ctx.db.insert("catalogoTipoSnapshots", {
        organizacionId: organizationId,
        revisionId,
        tipoClave: "T",
        snapshot: {
          clase: { id: ids.clase, clave: "C", nombre: "C" },
          familia: { id: ids.familia, clave: "F", nombre: "F" },
          tipo: { id: ids.tipo, clave: "T", nombre: "T" },
          unidadNatural: { id: unit.item.id, clave: "U", nombre: "Unidad" },
          atributos: [],
          reglas: [],
          presentacionCanonica: { tipoNombre: "T", tokens: [], separador: "" },
          politicasCompatibilidad: [],
        },
      });
    });

    await expect(t.mutation(api.catalogoAdmin.unidades.eliminarPoliticaUnidad, {
      politicaUnidadId: policy.item.id,
      expectedRevision: 1,
    })).resolves.toEqual({ disposition: "DELETED", id: policy.item.id });
    await expect(t.query(api.catalogoAdmin.unidades.obtenerPoliticaUnidad, { politicaUnidadId: policy.item.id })).resolves.toBeNull();
    expect(await t.run(ctx => ctx.db.get(snapshotId))).not.toBeNull();
    await expect(t.mutation(api.catalogoAdmin.unidades.eliminarPoliticaUnidad, {
      politicaUnidadId: policy.item.id,
      expectedRevision: 1,
    })).rejects.toMatchObject({ data: { code: "ADMIN_NOT_FOUND" } });
  });

  it("checks policy deletion revision before rejecting an active policy", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const unit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "Unidad" });
    const policyId = await t.run(ctx => ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, unidadId: unit.item.id, principal: false, activo: true, revision: 1 }));

    await expect(t.mutation(api.catalogoAdmin.unidades.eliminarPoliticaUnidad, {
      politicaUnidadId: policyId,
      expectedRevision: 2,
    })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
    await expect(t.mutation(api.catalogoAdmin.unidades.eliminarPoliticaUnidad, {
      politicaUnidadId: policyId,
      expectedRevision: 1,
    })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE", context: { field: "activo", reason: "policy must be inactive before deletion" } } });
  });
});
