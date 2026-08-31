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
});
