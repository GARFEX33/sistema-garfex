import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { cargarCreacionSeleccion } from "./cargarCreacionSeleccion";

const modules = (import.meta as ImportMeta & { glob: (pattern: string) => Record<string, () => Promise<unknown>> })
  .glob("../../**/*.{ts,js}");

async function seed(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "CLASS", nombre: "Class", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "FAMILY", nombre: "Family", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "TYPE", nombre: "Type", activo: true, revision: 1 });
    const unidad = await ctx.db.insert("unidades", { clave: "UNIT", nombre: "Unit", activo: true, revision: 1 });
    const organizacion = await ctx.db.insert("organizaciones", { clave: "ORG", nombre: "Org", activo: true, revision: 1 });
    const definicion = await ctx.db.insert("definicionesAtributo", { clave: "COLOR", nombre: "Color", tipoDato: "TEXTO", modoCaptura: "SELECCION", activo: true, revision: 1 });
    const asignacion = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: definicion, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true, revision: 1 });
    const valor = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: definicion, clave: "BLUE", valor: { kind: "TEXTO", value: "blue" }, nombre: "Blue", orden: 1, activo: true, revision: 1 });
    await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: familia, unidadId: unidad, principal: true, activo: true, revision: 1 });
    return { clase, familia, tipo, unidad, organizacion, definicion, asignacion, valor };
  });
}

describe("cargarCreacionSeleccion", () => {
  it("loads one current live graph for GLOBAL and ORGANIZATION without publication state", async () => {
    const t = convexTest(schema, modules), fixture = await seed(t);
    const input = { claseRecursoId: fixture.clase, familiaRecursoId: fixture.familia, tipoRecursoId: fixture.tipo, unidadId: fixture.unidad, selecciones: [], ownership: { kind: "GLOBAL" as const } };
    const global = await t.run(ctx => cargarCreacionSeleccion(ctx, input));
    const organization = await t.run(ctx => cargarCreacionSeleccion(ctx, { ...input, ownership: { kind: "ORGANIZATION" as const, organizacionId: fixture.organizacion } }));
    expect(global).toMatchObject({ hierarchyValid: true, unitValid: true, ownershipValid: true, valoresPermitidos: [{ id: fixture.valor }] });
    expect(organization).toMatchObject({ hierarchyValid: true, unitValid: true, ownershipValid: true, familiaAsignaciones: [{ id: fixture.asignacion }] });
    await t.run(async (ctx) => {
      for (const numero of [1, 2]) {
        const revision = await ctx.db.insert("catalogoRevisiones", { organizacionId: fixture.organizacion, numero, estado: "PUBLISHED", hashContenido: `snapshot-${numero}`, creadoEn: numero, publicadoEn: numero });
        await ctx.db.insert("catalogoTipoSnapshots", { organizacionId: fixture.organizacion, revisionId: revision, tipoClave: "TYPE", snapshot: { clase: { id: fixture.clase, clave: "CLASS", nombre: "Class" }, familia: { id: fixture.familia, clave: "FAMILY", nombre: "Family" }, tipo: { id: fixture.tipo, clave: "TYPE", nombre: "Type" }, unidadNatural: { id: fixture.unidad, clave: "UNIT", nombre: "Unit" }, atributos: [], reglas: [], presentacionCanonica: { tipoNombre: "Type", tokens: [{ tipo: "TYPE_NAME" }], separador: " / " }, politicasCompatibilidad: [] } });
      }
    });
    expect(await t.run(ctx => cargarCreacionSeleccion(ctx, input))).toEqual(global);
    await t.run(ctx => ctx.db.patch(fixture.organizacion, { activo: false }));
    await expect(t.run(ctx => cargarCreacionSeleccion(ctx, { ...input, ownership: { kind: "ORGANIZATION" as const, organizacionId: fixture.organizacion } }))).resolves.toMatchObject({ ownershipValid: false });
  });

  it("keeps direct-ID diagnostic values out of the canonical catalog and records selected policies with Unit state", async () => {
    const t = convexTest(schema, modules), fixture = await seed(t);
    const { inactive, inactiveUnit } = await t.run(async (ctx) => {
      const inactive = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: fixture.definicion, clave: "unused", valor: { kind: "TEXTO", value: "unused" }, nombre: "Unused", orden: 2, activo: false, revision: 1 });
      const inactiveUnit = await ctx.db.insert("unidades", { clave: "SECOND", nombre: "Second", activo: false, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.familia, tipoRecursoId: fixture.tipo, unidadId: inactiveUnit, principal: false, activo: true, revision: 1 });
      return { inactive, inactiveUnit };
    });
    const input = { claseRecursoId: fixture.clase, familiaRecursoId: fixture.familia, tipoRecursoId: fixture.tipo, unidadId: fixture.unidad, selecciones: [{ asignacionAtributoId: fixture.asignacion, valorPermitidoId: inactive }], ownership: { kind: "GLOBAL" as const } };
    const loaded = await t.run(ctx => cargarCreacionSeleccion(ctx, input));

    expect(loaded.valoresPermitidos.map(value => value.id)).toEqual([fixture.valor]);
    expect(loaded.valoresPermitidosDiagnosticos).toMatchObject([{ id: inactive, activo: false }]);
    expect(loaded.politicasUnidadEfectivas).toMatchObject([
      { unidadId: fixture.unidad, principal: true, state: "SELECTED", unidad: { id: fixture.unidad, activo: true } },
      { tipoRecursoId: fixture.tipo, unidadId: inactiveUnit, principal: false, state: "SELECTED", unidad: { id: inactiveUnit, activo: false } },
    ]);
  });

  it("uses bounded indexed reads and never reads publication tables", () => {
    const source = (import.meta as ImportMeta & { glob: (pattern: string, options?: object) => Record<string, string> })
      .glob("./cargarCreacionSeleccion.ts", { query: "?raw", import: "default", eager: true })["./cargarCreacionSeleccion.ts"];
    expect(source).toContain(".withIndex(");
    expect(source).toContain("ctx.db.get(input.claseRecursoId");
    expect(source).toContain("ctx.db.get(selection.asignacionAtributoId");
    expect(source).toContain("ctx.db.get(selection.valorPermitidoId");
    expect(source).toContain(".take(MAX_SELECTION_CATALOG_ROWS + 1)");
    expect(source).not.toMatch(/catalogoRevisiones|catalogoTipoSnapshots|\.collect\(/);
  });
});
