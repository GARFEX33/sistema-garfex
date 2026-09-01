import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../_generated/api";
import schema from "../schema";

/** Test-only Vite typing; ImportMeta.glob is not included in the root TypeScript config. */
declare global {
  interface ImportMeta {
    glob: (path: string) => Record<string, () => Promise<unknown>>;
  }
}

const modules = {
  ...import.meta.glob("../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../catalogoRecursos/${path.slice(2)}`, module])),
};

async function seed(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const organizacionId = await ctx.db.insert("organizaciones", { clave: "ORG", nombre: "Org", activo: true, revision: 1 });
    const tipoRecursoId = await ctx.db.insert("tiposRecurso", { familiaRecursoId: await ctx.db.insert("familiasRecurso", { claseRecursoId: await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "C", activo: true, revision: 1 }), clave: "F", nombre: "F", activo: true, revision: 1 }), clave: "T", nombre: "T", activo: true, revision: 1 });
    const unidadId = await ctx.db.insert("unidades", { clave: "U", nombre: "U", activo: true, revision: 1 });
    const recursoId = await ctx.db.insert("recursos", { tipoRecursoId, unidadId, identificadorTecnico: "legacy", nombre: "R", activo: true, revision: 1, organizacionId });
    const otroId = await ctx.db.insert("recursos", { tipoRecursoId, unidadId, identificadorTecnico: "otro", nombre: "R2", activo: true, revision: 1, organizacionId });
    return { organizacionId, recursoId, otroId };
  });
}

describe("aliases de identidad", () => {
  it("registra idempotentemente, resuelve y rechaza colisiones entre recursos", async () => {
    const t = convexTest(schema, modules); const f = await seed(t);
    const input = { organizacionId: f.organizacionId, recursoId: f.recursoId, version: 1, clave: "v1|C|F|T" };
    const first = await t.mutation(internal.catalogoRecursos.identidadesRecurso.registrar, input);
    const second = await t.mutation(internal.catalogoRecursos.identidadesRecurso.registrar, input);
    expect(second._id).toBe(first._id);
    expect((await t.query(internal.catalogoRecursos.identidadesRecurso.resolver, { organizacionId: f.organizacionId, version: 1, clave: input.clave }))?.recursoId).toBe(f.recursoId);
    await expect(t.mutation(internal.catalogoRecursos.identidadesRecurso.registrar, { ...input, recursoId: f.otroId })).rejects.toThrow(/conflicto/i);
  });

  it("aísla aliases entre organizaciones", async () => {
    const t = convexTest(schema, modules); const f = await seed(t);
    const otra = await t.run(async ctx => await ctx.db.insert("organizaciones", { clave: "OTRA", nombre: "Otra", activo: true, revision: 1 }));
    await t.mutation(internal.catalogoRecursos.identidadesRecurso.registrar, { organizacionId: f.organizacionId, recursoId: f.recursoId, version: 1, clave: "K" });
    expect(await t.query(internal.catalogoRecursos.identidadesRecurso.resolver, { organizacionId: otra, version: 1, clave: "K" })).toBeNull();
  });
});
