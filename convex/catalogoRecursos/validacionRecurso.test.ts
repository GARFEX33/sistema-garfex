import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import type { MutationCtx } from "../_generated/server";
import { validarRecursoAdministrativo, type CrearRecursoEntrada } from "./validacionRecurso";

const modules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("../_generated/**/*.{ts,js}");
const source = (import.meta as ImportMeta & {
  glob: (pattern: string, options?: object) => Record<string, string>;
}).glob("./validacionRecurso.ts", { query: "?raw", import: "default", eager: true })["./validacionRecurso.ts"];

async function seed(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "CLASS", nombre: "Class", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "FAMILY", nombre: "Family", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "TYPE", nombre: "Type", activo: true, revision: 1 });
    const unidad = await ctx.db.insert("unidades", { clave: "UNIT", nombre: "Unit", activo: true, revision: 1 });
    const definicion = await ctx.db.insert("definicionesAtributo", { clave: "LABEL", nombre: "Label", tipoDato: "TEXTO", activo: true, revision: 1 });
    const atributo = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: definicion, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    return { clase, familia, tipo, unidad, atributo };
  });
}

function entrada(fixture: Awaited<ReturnType<typeof seed>>, unidadId = fixture.unidad): CrearRecursoEntrada {
  return {
    claseRecursoId: fixture.clase,
    familiaRecursoId: fixture.familia,
    tipoRecursoId: fixture.tipo,
    unidadId,
    nombre: "Resource",
    valores: [{ atributoRecursoId: fixture.atributo, valor: "label" }],
  };
}

async function evaluate(t: ReturnType<typeof convexTest>, value: CrearRecursoEntrada) {
  return t.run(async ctx => {
    const result = await validarRecursoAdministrativo(ctx as MutationCtx, value);
    return result.ok ? { ok: true } : result;
  });
}

describe("validacionRecurso legacy snapshot", () => {
  it("accepts an active Unit without policies and keeps absent or inactive Units invalid", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seed(t);
    await expect(evaluate(t, entrada(fixture))).resolves.toMatchObject({ ok: true });
    expect(source).not.toContain('query("politicasUnidadRecurso")');
    expect(source).toContain("politicas: []");

    const inactive = await t.run(ctx => ctx.db.insert("unidades", { clave: "INACTIVE", nombre: "Inactive", activo: false, revision: 1 }));
    await expect(evaluate(t, entrada(fixture, inactive))).resolves.toEqual({ ok: false, code: "JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA" });
    await t.run(ctx => ctx.db.delete(fixture.unidad));
    await expect(evaluate(t, entrada(fixture))).resolves.toEqual({ ok: false, code: "JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA" });
  });
});
