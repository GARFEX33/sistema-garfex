import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";

const codePointCompare = (left: string, right: string) => {
  const a = [...left].map(character => character.codePointAt(0)!);
  const b = [...right].map(character => character.codePointAt(0)!);
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) if (a[index] !== b[index]) return a[index] - b[index];
  return a.length - b.length;
};
const modules = {
  ...import.meta.glob("../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../catalogoAdmin/${path.slice(2)}`, module])),
};

async function seed(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const ids = [];
    for (const [clave, activo] of [["Z", true], ["A", false], ["A", true]] as const) {
      const id = await ctx.db.insert("clasesRecurso", { clave, nombre: clave, activo, revision: 1 });
      await ctx.db.patch(id, { adminSortId: id });
      ids.push(id);
    }
    return ids;
  });
}

async function insertClass(t: ReturnType<typeof convexTest>, values: { clave: string; activo: boolean; revision?: number }) {
  return t.run(async ctx => {
    const id = await ctx.db.insert("clasesRecurso", { clave: values.clave, nombre: values.clave, activo: values.activo, revision: values.revision ?? 1 });
    await ctx.db.patch(id, { adminSortId: id });
    return id;
  });
}

async function insertTree(t: ReturnType<typeof convexTest>, options: { classActive: boolean; familyActive: boolean; typeActive: boolean; typeRevision?: number; resourceActive?: boolean }) {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "Clase", activo: options.classActive, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "Familia", activo: options.familyActive, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "Tipo", activo: options.typeActive, revision: options.typeRevision ?? 1 });
    if (options.resourceActive !== undefined) {
      const unidad = await ctx.db.insert("unidades", { clave: "U", nombre: "Unidad", activo: true, revision: 1 });
      await ctx.db.insert("recursos", { tipoRecursoId: tipo, unidadId: unidad, identificadorTecnico: "R", nombre: "Recurso", activo: options.resourceActive, revision: 1 });
    }
    return { clase, familia, tipo };
  });
}

describe("ciclo administrativo de clases", () => {
  it("crea en revisión uno, normaliza cambios y rechaza duplicados o claves inmutables", async () => {
    const t = convexTest(schema, modules);
    await insertClass(t, { clave: "RESERVADA", activo: false });
    const created = await t.mutation(api.catalogoAdmin.jerarquia.crearClase, { clave: "  NUEVA  ", nombre: "  Clase nueva  ", activo: false });
    expect(created).toMatchObject({ disposition: "CREATED", item: { clave: "NUEVA", nombre: "Clase nueva", activo: false, revision: 1 } });
    await expect(t.mutation(api.catalogoAdmin.jerarquia.crearClase, { clave: "NUEVA", nombre: "Otra", activo: false })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.jerarquia.crearClase, { clave: "RESERVADA", nombre: "Otra", activo: false })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    const unchanged = await t.mutation(api.catalogoAdmin.jerarquia.actualizarClase, { claseRecursoId: created.item.id, expectedRevision: 1, clave: "NUEVA", nombre: "  Clase nueva  " });
    expect(unchanged).toMatchObject({ disposition: "UNCHANGED", item: { revision: 1, nombre: "Clase nueva" } });
    const changed = await t.mutation(api.catalogoAdmin.jerarquia.actualizarClase, { claseRecursoId: created.item.id, expectedRevision: 1, nombre: "  Nombre cambiado  " });
    expect(changed).toMatchObject({ disposition: "UPDATED", item: { revision: 2, nombre: "Nombre cambiado" } });
    await expect(t.mutation(api.catalogoAdmin.jerarquia.actualizarClase, { claseRecursoId: created.item.id, expectedRevision: 1, nombre: "No" })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
    await expect(t.mutation(api.catalogoAdmin.jerarquia.actualizarClase, { claseRecursoId: created.item.id, expectedRevision: 2, clave: "OTRA", nombre: "No" })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
  });

  it("valida todos los descendientes antes de activar y no deja cambios parciales", async () => {
    const t = convexTest(schema, modules);
    const tree = await insertTree(t, { classActive: false, familyActive: true, typeActive: true, typeRevision: 0 });
    await expect(t.mutation(api.catalogoAdmin.jerarquia.activarClase, { claseRecursoId: tree.clase, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
    expect(await t.query(api.catalogoAdmin.jerarquia.obtenerClase, { claseRecursoId: tree.clase })).toMatchObject({ activo: false, revision: 1 });
    expect(await t.run(async ctx => ({ family: await ctx.db.get(tree.familia), type: await ctx.db.get(tree.tipo) }))).toMatchObject({ family: { activo: true, revision: 1 }, type: { activo: true, revision: 0 } });
    const valid = convexTest(schema, modules);
    const validTree = await insertTree(valid, { classActive: false, familyActive: true, typeActive: true });
    await expect(valid.mutation(api.catalogoAdmin.jerarquia.activarClase, { claseRecursoId: validTree.clase, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: true, revision: 2 } });
    await expect(valid.mutation(api.catalogoAdmin.jerarquia.activarClase, { claseRecursoId: validTree.clase, expectedRevision: 2 })).resolves.toMatchObject({ disposition: "UNCHANGED", item: { activo: true, revision: 2 } });
  });

  it("bloquea clases por descendientes y recursos activos, pero ignora ramas y recursos inactivos", async () => {
    const descendant = convexTest(schema, modules);
    const blocked = await insertTree(descendant, { classActive: true, familyActive: true, typeActive: true });
    await expect(descendant.mutation(api.catalogoAdmin.jerarquia.desactivarClase, { claseRecursoId: blocked.clase, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED", context: { entity: { kind: "clasesRecurso", id: blocked.clase }, relationKind: "active-family", blocker: { kind: "familiasRecurso", id: blocked.familia } } } });
    const resource = convexTest(schema, modules);
    const resourceBlocked = await insertTree(resource, { classActive: true, familyActive: false, typeActive: false, resourceActive: true });
    await expect(resource.mutation(api.catalogoAdmin.jerarquia.desactivarClase, { claseRecursoId: resourceBlocked.clase, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    const safe = convexTest(schema, modules);
    const inert = await insertTree(safe, { classActive: true, familyActive: false, typeActive: false, resourceActive: false });
    const result = await safe.mutation(api.catalogoAdmin.jerarquia.desactivarClase, { claseRecursoId: inert.clase, expectedRevision: 1 });
    expect(result).toMatchObject({ disposition: "UPDATED", item: { activo: false, revision: 2 } });
    expect(await safe.run(async ctx => ({ family: await ctx.db.get(inert.familia), type: await ctx.db.get(inert.tipo) }))).toMatchObject({ family: { activo: false, revision: 1 }, type: { activo: false, revision: 1 } });
  });

  it("comprueba revisión antes de blockers y hace no-op del mismo estado", async () => {
    const t = convexTest(schema, modules);
    const tree = await insertTree(t, { classActive: false, familyActive: true, typeActive: true });
    await expect(t.mutation(api.catalogoAdmin.jerarquia.desactivarClase, { claseRecursoId: tree.clase, expectedRevision: 2 })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
    const result = await t.mutation(api.catalogoAdmin.jerarquia.desactivarClase, { claseRecursoId: tree.clase, expectedRevision: 1 });
    expect(result).toMatchObject({ disposition: "UNCHANGED", item: { activo: false, revision: 1 } });
    expect(await t.run(async ctx => ctx.db.get(tree.familia))).toMatchObject({ activo: true, revision: 1 });
  });
});

describe("lecturas administrativas de clases", () => {
  it("incluye ambos estados por defecto y pagina en orden determinista", async () => {
    const t = convexTest(schema, modules);
    const ids = await seed(t);
    const expected = await t.run(async (ctx) => {
      const rows = (await Promise.all(ids.map(id => ctx.db.get(id)))).filter(Boolean);
      return rows.sort((left, right) => codePointCompare(left!.clave, right!.clave) || codePointCompare(String(left!._id), String(right!._id)));
    });
    const first = await t.query(api.catalogoAdmin.jerarquia.listarClases, { pageSize: 2, cursor: null });
    expect(first.items.map((item: { id: string }) => item.id)).toEqual(expected.slice(0, 2).map(row => row!._id));
    expect(first.continuationCursor).not.toBeNull();
    const second = await t.query(api.catalogoAdmin.jerarquia.listarClases, { pageSize: 2, cursor: first.continuationCursor });
    expect(second.items.map((item: { id: string }) => item.id)).toEqual(expected.slice(2).map(row => row!._id));
    expect(second.isExhausted).toBe(true);
  });

  it("applies lifecycle filtering and returns null for a missing detail", async () => {
    const t = convexTest(schema, modules);
    const [id] = await seed(t);
    const page = await t.query(api.catalogoAdmin.jerarquia.listarClases, { modo: "ACTIVE", pageSize: 100, cursor: null });
    expect(page.items.every((item: { activo: boolean }) => item.activo)).toBe(true);
    expect(page.items).toHaveLength(2);
    const sparse = await t.query(api.catalogoAdmin.jerarquia.listarClases, { modo: "INACTIVE", pageSize: 100, cursor: null });
    expect(sparse.items).toHaveLength(1);
    const activeFirst = await t.query(api.catalogoAdmin.jerarquia.listarClases, { modo: "ACTIVE", pageSize: 1, cursor: null });
    await expect(t.query(api.catalogoAdmin.jerarquia.listarClases, { modo: "INACTIVE", pageSize: 1, cursor: activeFirst.continuationCursor })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_ARGUMENT" } });
    expect(sparse.isExhausted).toBe(true);
    expect(await t.query(api.catalogoAdmin.jerarquia.obtenerClase, { claseRecursoId: id })).toMatchObject({ id, effective: true });
    await t.run(async (ctx) => { await ctx.db.delete(id); });
    expect(await t.query(api.catalogoAdmin.jerarquia.obtenerClase, { claseRecursoId: id })).toBeNull();
  });

  describe("ciclo administrativo de familias", () => {
    it("aplica identidad dentro de la clase y mantiene la propiedad inmutable", async () => {
      const t = convexTest(schema, modules);
      const classes = await t.run(async ctx => {
        const first = await ctx.db.insert("clasesRecurso", { clave: "C1", nombre: "C1", activo: true, revision: 1 });
        const second = await ctx.db.insert("clasesRecurso", { clave: "C2", nombre: "C2", activo: true, revision: 1 });
        return { first, second };
      });
      const created = await t.mutation(api.catalogoAdmin.jerarquia.crearFamilia, { claseRecursoId: classes.first, clave: "  F  ", nombre: " Familia ", activo: false });
      expect(created).toMatchObject({ disposition: "CREATED", item: { claseRecursoId: classes.first, clave: "F", nombre: "Familia", revision: 1, effective: false } });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.crearFamilia, { claseRecursoId: classes.first, clave: "F", nombre: "Otra" })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.crearFamilia, { claseRecursoId: classes.second, clave: "F", nombre: "Otra" })).resolves.toMatchObject({ item: { claseRecursoId: classes.second, revision: 1 } });
      const unchanged = await t.mutation(api.catalogoAdmin.jerarquia.actualizarFamilia, { familiaRecursoId: created.item.id, expectedRevision: 1, claseRecursoId: classes.first, clave: "F", nombre: " Familia " });
      expect(unchanged).toMatchObject({ disposition: "UNCHANGED", item: { revision: 1 } });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.actualizarFamilia, { familiaRecursoId: created.item.id, expectedRevision: 1, claseRecursoId: classes.second })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.actualizarFamilia, { familiaRecursoId: created.item.id, expectedRevision: 2, nombre: "No" })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
      const missing = await t.run(async ctx => { const id = await ctx.db.insert("clasesRecurso", { clave: "gone", nombre: "gone", activo: true, revision: 1 }); await ctx.db.delete(id); return id; });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.crearFamilia, { claseRecursoId: missing, clave: "X", nombre: "X" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    });

    it("bloquea descendientes y recursos activos sin tocar la rama", async () => {
      const blocked = convexTest(schema, modules);
      const active = await insertTree(blocked, { classActive: true, familyActive: true, typeActive: true });
      await expect(blocked.mutation(api.catalogoAdmin.jerarquia.desactivarFamilia, { familiaRecursoId: active.familia, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED", context: { relationKind: "active-type", blocker: { kind: "tiposRecurso", id: active.tipo } } } });
      const resource = convexTest(schema, modules);
      const resourceTree = await insertTree(resource, { classActive: true, familyActive: true, typeActive: false, resourceActive: true });
      await expect(resource.mutation(api.catalogoAdmin.jerarquia.desactivarFamilia, { familiaRecursoId: resourceTree.familia, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
      const safe = convexTest(schema, modules);
      const inert = await insertTree(safe, { classActive: true, familyActive: true, typeActive: false, resourceActive: false });
      const result = await safe.mutation(api.catalogoAdmin.jerarquia.desactivarFamilia, { familiaRecursoId: inert.familia, expectedRevision: 1 });
      expect(result).toMatchObject({ disposition: "UPDATED", item: { activo: false, revision: 2, effective: false } });
      expect(await safe.run(async ctx => ({ family: await ctx.db.get(inert.familia), type: await ctx.db.get(inert.tipo) }))).toMatchObject({ family: { activo: false, revision: 2 }, type: { activo: false, revision: 1 } });
    });

    it("valida revisión antes de no-op y valida los tipos efectivos al activar", async () => {
      const t = convexTest(schema, modules);
      const invalid = await insertTree(t, { classActive: true, familyActive: false, typeActive: true, typeRevision: 0 });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.activarFamilia, { familiaRecursoId: invalid.familia, expectedRevision: 2 })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.activarFamilia, { familiaRecursoId: invalid.familia, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
      expect(await t.run(async ctx => ({ family: await ctx.db.get(invalid.familia), type: await ctx.db.get(invalid.tipo) }))).toMatchObject({ family: { activo: false, revision: 1 }, type: { activo: true, revision: 0 } });
      await expect(t.mutation(api.catalogoAdmin.jerarquia.desactivarFamilia, { familiaRecursoId: invalid.familia, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UNCHANGED", item: { revision: 1 } });
      const noOp = convexTest(schema, modules);
      const inactive = await insertTree(noOp, { classActive: true, familyActive: false, typeActive: true });
      const changed = await noOp.mutation(api.catalogoAdmin.jerarquia.activarFamilia, { familiaRecursoId: inactive.familia, expectedRevision: 1 });
      expect(changed).toMatchObject({ disposition: "UPDATED", item: { revision: 2 } });
      const unchanged = await noOp.mutation(api.catalogoAdmin.jerarquia.activarFamilia, { familiaRecursoId: inactive.familia, expectedRevision: 2 });
      expect(unchanged).toMatchObject({ disposition: "UNCHANGED", item: { revision: 2 } });
    });

    it("pagina por clase y anota una familia bajo una clase inactiva como inerte", async () => {
      const t = convexTest(schema, modules);
      const ids = await t.run(async ctx => {
        const first = await ctx.db.insert("clasesRecurso", { clave: "A", nombre: "A", activo: true, revision: 1 });
        const second = await ctx.db.insert("clasesRecurso", { clave: "B", nombre: "B", activo: false, revision: 1 });
        const family = await ctx.db.insert("familiasRecurso", { claseRecursoId: second, clave: "F", nombre: "F", activo: true, revision: 1 });
        const other = await ctx.db.insert("familiasRecurso", { claseRecursoId: first, clave: "F", nombre: "F", activo: true, revision: 1 });
        await ctx.db.patch(family, { adminSortId: family }); await ctx.db.patch(other, { adminSortId: other });
        return { first, second, family };
      });
      expect(await t.query(api.catalogoAdmin.jerarquia.obtenerFamilia, { familiaRecursoId: ids.family })).toMatchObject({ claseRecursoId: ids.second, activo: true, effective: false });
      const page = await t.query(api.catalogoAdmin.jerarquia.listarFamilias, { claseRecursoId: ids.second, pageSize: 1, cursor: null });
      expect(page.items).toHaveLength(1);
      expect(page.items[0]).toMatchObject({ claseRecursoId: ids.second, effective: false });
      await t.run(async ctx => { for (const key of ["G", "H"]) { const id = await ctx.db.insert("familiasRecurso", { claseRecursoId: ids.second, clave: key, nombre: key, activo: true, revision: 1 }); await ctx.db.patch(id, { adminSortId: id }); } });
      const seen: string[] = []; let cursor: string | null = null;
      do { const next: { items: Array<{ id: string }>; continuationCursor: string | null } = await t.query(api.catalogoAdmin.jerarquia.listarFamilias, { claseRecursoId: ids.second, pageSize: 1, cursor }); seen.push(...next.items.map(item => item.id)); cursor = next.continuationCursor; } while (cursor);
      expect(seen).toHaveLength(3);
      const bound = await t.query(api.catalogoAdmin.jerarquia.listarFamilias, { claseRecursoId: ids.second, pageSize: 1, cursor: null });
      await expect(t.query(api.catalogoAdmin.jerarquia.listarFamilias, { claseRecursoId: ids.first, pageSize: 1, cursor: bound.continuationCursor })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_ARGUMENT" } });
    });
  });
});
