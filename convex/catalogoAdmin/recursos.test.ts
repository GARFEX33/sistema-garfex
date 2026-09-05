import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const generatedModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("../_generated/**/*.{ts,js}");
const localModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("./*.{ts,js}");
const modules = {
  ...generatedModules,
  ...Object.fromEntries(
    Object.entries(localModules).map(([path, module]) => [
      `../catalogoAdmin/${path.slice(2)}`,
      module,
    ]),
  ),
};
const source = (import.meta as ImportMeta & {
  glob: (pattern: string, options?: object) => Record<string, string>;
}).glob("./recursos.ts", { query: "?raw", import: "default", eager: true })["./recursos.ts"];

type Fixture = Awaited<ReturnType<typeof seedFixture>>;
type ListArgs = {
  paginationOpts: { numItems: number; cursor: string | null };
  lifecycle?: "ALL" | "ACTIVE" | "INACTIVE";
  tipoRecursoId?: Id<"tiposRecurso">;
  claseRecursoId?: Id<"clasesRecurso">;
  familiaRecursoId?: Id<"familiasRecurso">;
  scope?:
    | { kind: "ALL" }
    | { kind: "GLOBAL" }
    | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
};
type SearchArgs = ListArgs & { searchText: string };

async function seedFixture(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const clazz = await ctx.db.insert("clasesRecurso", {
      clave: "CLASS",
      nombre: "Class",
      activo: true,
      revision: 1,
    });
    const family = await ctx.db.insert("familiasRecurso", {
      claseRecursoId: clazz,
      clave: "FAMILY",
      nombre: "Family",
      activo: true,
      revision: 1,
    });
    const typeA = await ctx.db.insert("tiposRecurso", {
      familiaRecursoId: family,
      clave: "TYPE_A",
      nombre: "Type A",
      activo: true,
      revision: 1,
    });
    const typeB = await ctx.db.insert("tiposRecurso", {
      familiaRecursoId: family,
      clave: "TYPE_B",
      nombre: "Type B",
      activo: true,
      revision: 1,
    });
    const unit = await ctx.db.insert("unidades", {
      clave: "UNIT",
      nombre: "Unit",
      activo: true,
      revision: 1,
    });
    const organization = await ctx.db.insert("organizaciones", {
      clave: "ORG",
      nombre: "Organization",
      activo: true,
      revision: 1,
    });
    const definition = await ctx.db.insert("definicionesAtributo", {
      clave: "PROOF",
      nombre: "Proof",
      tipoDato: "TEXTO",
      activo: true,
      revision: 1,
    });
    const attribute = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: family,
      definicionAtributoId: definition,
      aplicabilidad: "OPTIONAL",
      participaIdentidad: false,
      orden: 1,
      activo: true,
      revision: 1,
    });

    async function resource(
      index: number,
      tipoRecursoId: Id<"tiposRecurso">,
      activo: boolean,
      organizacionId?: Id<"organizaciones">,
    ) {
      return ctx.db.insert("recursos", {
        tipoRecursoId,
        claseRecursoId: clazz,
        familiaRecursoId: family,
        unidadId: unit,
        identificadorTecnico: `RESOURCE_${index}`,
        nombre: `Resource ${index}`,
        activo,
        revision: 1,
        organizacionId,
        adminScopeKey: organizacionId === undefined ? "GLOBAL" : `ORG:${organizacionId}`,
      });
    }

    const ids = {
      globalAActive: await resource(1, typeA, true),
      globalAInactive: await resource(2, typeA, false),
      globalBActive: await resource(3, typeB, true),
      globalBInactive: await resource(4, typeB, false),
      organizationAActive: await resource(5, typeA, true, organization),
      organizationAInactive: await resource(6, typeA, false, organization),
      organizationBActive: await resource(7, typeB, true, organization),
      organizationBInactive: await resource(8, typeB, false, organization),
    };
    await ctx.db.insert("valoresAtributoRecurso", {
      recursoId: ids.globalAActive,
      atributoRecursoId: attribute,
      valor: "must not be returned",
    });
    return { clazz, family, typeA, typeB, unit, organization, definition, attribute, ids };
  });
}

function list(t: ReturnType<typeof convexTest>, args: ListArgs) {
  return t.query(api.catalogoAdmin.recursos.listarRecursosResumen, args);
}

function search(t: ReturnType<typeof convexTest>, args: SearchArgs) {
  return t.query(api.catalogoAdmin.recursos.buscarRecursosResumen, args);
}

function pageArgs(overrides: Partial<ListArgs> = {}): ListArgs {
  return {
    paginationOpts: { numItems: 25, cursor: null },
    ...overrides,
  };
}

describe("catalogoAdmin.recursos.listarRecursosResumen", () => {
  it("returns the native page shape and value-free summaries", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);

    const result = await list(t, pageArgs());

    expect(result).toEqual(
      expect.objectContaining({
        page: expect.any(Array),
        continueCursor: expect.any(String),
        isDone: expect.any(Boolean),
      }),
    );
    expect(result.page[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        identificadorTecnico: expect.any(String),
        nombre: expect.any(String),
        tipoRecursoId: fixture.typeA,
        unidadId: fixture.unit,
        activo: expect.any(Boolean),
        revision: 1,
        classificationStatus: { state: "EFFECTIVE", reasons: [] },
      }),
    );
    expect(result.page[0]).not.toHaveProperty("valores");
  });

  it.each([
    ["ALL / no Type / ALL", {}, [1, 2, 3, 4, 5, 6, 7, 8]],
    ["ALL / no Type / ACTIVE", { lifecycle: "ACTIVE" }, [1, 3, 5, 7]],
    ["ALL / Type / ALL", (f: Fixture) => ({ tipoRecursoId: f.typeA }), [1, 2, 5, 6]],
    ["ALL / Type / INACTIVE", (f: Fixture) => ({ tipoRecursoId: f.typeA, lifecycle: "INACTIVE" }), [2, 6]],
    ["GLOBAL / no Type / ALL", { scope: { kind: "GLOBAL" } }, [1, 2, 3, 4]],
    ["GLOBAL / no Type / ACTIVE", { scope: { kind: "GLOBAL" }, lifecycle: "ACTIVE" }, [1, 3]],
    ["GLOBAL / Type / ALL", (f: Fixture) => ({ scope: { kind: "GLOBAL" }, tipoRecursoId: f.typeB }), [3, 4]],
    ["GLOBAL / Type / ACTIVE", (f: Fixture) => ({ scope: { kind: "GLOBAL" }, tipoRecursoId: f.typeB, lifecycle: "ACTIVE" }), [3]],
    ["ORGANIZATION / no Type / ALL", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization } }), [5, 6, 7, 8]],
    ["ORGANIZATION / no Type / INACTIVE", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, lifecycle: "INACTIVE" }), [6, 8]],
    ["ORGANIZATION / Type / ALL", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, tipoRecursoId: f.typeA }), [5, 6]],
    ["ORGANIZATION / Type / ACTIVE", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, tipoRecursoId: f.typeA, lifecycle: "ACTIVE" }), [5]],
  ] as const)("applies %s through indexed equality prefixes", async (_name, filters, expectedIndexes) => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const resolved = typeof filters === "function" ? filters(fixture) : filters;
    const result = await list(t, pageArgs(resolved));
    expect(result.page.map((item) => Number(item.identificadorTecnico.replace("RESOURCE_", ""))).sort((a, b) => a - b)).toEqual(expectedIndexes);
    expect(result.isDone).toBe(true);
  });

  it.each([1, 100])("uses native page sizing for numItems=%s", async (numItems) => {
    const t = convexTest(schema, modules);
    await seedFixture(t);
    const result = await list(t, { paginationOpts: { numItems, cursor: null } });
    expect(result.page).toHaveLength(Math.min(numItems, 8));
    expect(result.continueCursor).toEqual(expect.any(String));
  });

  it("uses one native pagination call without excluded filters or value access", () => {
    const listSource = source.slice(0, source.indexOf("export const buscarRecursosResumen"));
    expect(listSource).toContain("paginationOptsValidator");
    expect(listSource).toContain(".paginate(args.paginationOpts)");
    expect(listSource.match(/\.paginate\(/g)).toHaveLength(1);
    expect(listSource).not.toMatch(/AdminPage|pageArgsValidator|adminSortId|unidadId\\s*:/);
    expect(listSource).not.toMatch(/cursor envelope|cursor hash|order token|manual accumulation|cache/i);
    expect(listSource).not.toContain("valoresAtributoRecurso");
    expect(listSource).not.toMatch(/\.collect\(|\.filter\(/);
  });

  it("narrows Class and Family selectors before native pagination", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const alternate = await t.run(async (ctx) => {
      const family = await ctx.db.insert("familiasRecurso", { claseRecursoId: fixture.clazz, clave: "FAMILY_2", nombre: "Family 2", activo: true, revision: 1 });
      const type = await ctx.db.insert("tiposRecurso", { familiaRecursoId: family, clave: "TYPE_2", nombre: "Type 2", activo: true, revision: 1 });
      await ctx.db.insert("recursos", { tipoRecursoId: type, claseRecursoId: fixture.clazz, familiaRecursoId: family, unidadId: fixture.unit, identificadorTecnico: "RESOURCE_9", nombre: "Resource 9", activo: true, revision: 1, adminScopeKey: "GLOBAL" });
      return { family };
    });
    const ids = (result: Awaited<ReturnType<typeof list>>) => result.page.map(item => Number(item.identificadorTecnico.replace("RESOURCE_", ""))).sort((a, b) => a - b);
    expect(ids(await list(t, pageArgs({ claseRecursoId: fixture.clazz })))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(ids(await list(t, pageArgs({ familiaRecursoId: alternate.family })))).toEqual([9]);
    expect(ids(await list(t, pageArgs({ claseRecursoId: fixture.clazz, lifecycle: "ACTIVE", scope: { kind: "GLOBAL" } })))).toEqual([1, 3, 9]);
    const familySearch = await search(t, { searchText: "Resource", paginationOpts: { numItems: 25, cursor: null }, familiaRecursoId: alternate.family, lifecycle: "ACTIVE", scope: { kind: "GLOBAL" } });
    expect(familySearch.page.map(item => item.identificadorTecnico)).toEqual(["RESOURCE_9"]);
  });

  it("rejects ambiguous hierarchy selectors with a classification argument error", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    for (const request of [
      list(t, pageArgs({ claseRecursoId: fixture.clazz, familiaRecursoId: fixture.family })),
      search(t, { searchText: "Resource", paginationOpts: { numItems: 1, cursor: null }, familiaRecursoId: fixture.family, tipoRecursoId: fixture.typeA }),
    ]) {
      await expect(request).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_ARGUMENT", context: { field: "classification" } } });
    }
  });

  it("traverses more than 1,000 unchanged Resources without duplicates or omissions", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await t.run(async (ctx) => {
      for (let index = 100; index < 1201; index += 1) {
        await ctx.db.insert("recursos", {
          tipoRecursoId: fixture.typeA,
          claseRecursoId: fixture.clazz,
          familiaRecursoId: fixture.family,
          unidadId: fixture.unit,
          identificadorTecnico: `RESOURCE_${index}`,
          nombre: `Resource ${index}`,
          activo: true,
          revision: 1,
          adminScopeKey: "GLOBAL",
        });
      }
    });

    const seen: string[] = [];
    let cursor: string | null = null;
    do {
      const result = await list(t, {
        paginationOpts: { numItems: 37, cursor },
        claseRecursoId: fixture.clazz,
      });
      seen.push(...result.page.map((item) => item.id));
      cursor = result.isDone ? null : result.continueCursor;
    } while (cursor !== null);

    expect(seen).toHaveLength(1109);
    expect(new Set(seen)).toHaveLength(seen.length);
  });
});

describe("catalogoAdmin.recursos.buscarRecursosResumen", () => {
  it("registers a native search reference with a value-free native page", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const result = await search(t, { searchText: "  Resource\t ", paginationOpts: { numItems: 2, cursor: null } });

    expect(result.page).toHaveLength(2);
    expect(result).toEqual(expect.objectContaining({ continueCursor: expect.any(String), isDone: expect.any(Boolean), splitCursor: null, pageStatus: null }));
    expect(result.page[0]).not.toHaveProperty("valores");
    expect(result.page.every((item) => item.tipoRecursoId === fixture.typeA || item.tipoRecursoId === fixture.typeB)).toBe(true);
  });

  it("rejects a blank normalized search with a structured argument error", async () => {
    const t = convexTest(schema, modules);
    await seedFixture(t);
    await expect(search(t, { searchText: " \t\n ", paginationOpts: { numItems: 2, cursor: null } })).rejects.toMatchObject({
      data: { code: "ADMIN_INVALID_ARGUMENT", context: { field: "searchText" } },
    });
  });

  it.each([
    ["ALL / no Type / ALL", {}, [1, 2, 3, 4, 5, 6, 7, 8]],
    ["ALL / no Type / ACTIVE", { lifecycle: "ACTIVE" }, [1, 3, 5, 7]],
    ["ALL / no Type / INACTIVE", { lifecycle: "INACTIVE" }, [2, 4, 6, 8]],
    ["ALL / Type / ALL", (f: Fixture) => ({ tipoRecursoId: f.typeA }), [1, 2, 5, 6]],
    ["ALL / Type / ACTIVE", (f: Fixture) => ({ tipoRecursoId: f.typeA, lifecycle: "ACTIVE" }), [1, 5]],
    ["ALL / Type / INACTIVE", (f: Fixture) => ({ tipoRecursoId: f.typeA, lifecycle: "INACTIVE" }), [2, 6]],
    ["GLOBAL / no Type / ALL", { scope: { kind: "GLOBAL" } }, [1, 2, 3, 4]],
    ["GLOBAL / no Type / ACTIVE", { scope: { kind: "GLOBAL" }, lifecycle: "ACTIVE" }, [1, 3]],
    ["GLOBAL / no Type / INACTIVE", { scope: { kind: "GLOBAL" }, lifecycle: "INACTIVE" }, [2, 4]],
    ["GLOBAL / Type / ALL", (f: Fixture) => ({ scope: { kind: "GLOBAL" }, tipoRecursoId: f.typeB }), [3, 4]],
    ["GLOBAL / Type / ACTIVE", (f: Fixture) => ({ scope: { kind: "GLOBAL" }, tipoRecursoId: f.typeB, lifecycle: "ACTIVE" }), [3]],
    ["GLOBAL / Type / INACTIVE", (f: Fixture) => ({ scope: { kind: "GLOBAL" }, tipoRecursoId: f.typeB, lifecycle: "INACTIVE" }), [4]],
    ["ORGANIZATION / no Type / ALL", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization } }), [5, 6, 7, 8]],
    ["ORGANIZATION / no Type / ACTIVE", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, lifecycle: "ACTIVE" }), [5, 7]],
    ["ORGANIZATION / no Type / INACTIVE", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, lifecycle: "INACTIVE" }), [6, 8]],
    ["ORGANIZATION / Type / ALL", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, tipoRecursoId: f.typeA }), [5, 6]],
    ["ORGANIZATION / Type / ACTIVE", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, tipoRecursoId: f.typeA, lifecycle: "ACTIVE" }), [5]],
    ["ORGANIZATION / Type / INACTIVE", (f: Fixture) => ({ scope: { kind: "ORGANIZATION", organizacionId: f.organization }, tipoRecursoId: f.typeA, lifecycle: "INACTIVE" }), [6]],
  ] as const)("applies %s through search-index equality filters", async (_name, filters, expectedIndexes) => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const resolved = typeof filters === "function" ? filters(fixture) : filters;
    const result = await search(t, { ...resolved, searchText: " Resource ", paginationOpts: { numItems: 25, cursor: null } });
    expect(result.page.map((item) => Number(item.identificadorTecnico.replace("RESOURCE_", ""))).sort((a, b) => a - b)).toEqual(expectedIndexes);
    expect(result.isDone).toBe(true);
  });

  it.each([1, 2, 3])("traverses unchanged equal-relevance results exactly once with page size %s", async (numItems) => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const traverse = async () => {
      const seen: string[] = [];
      let cursor: string | null = null;
      do {
        const result = await search(t, { searchText: "Resource", paginationOpts: { numItems, cursor }, familiaRecursoId: fixture.family });
        seen.push(...result.page.map((item) => item.id));
        cursor = result.isDone ? null : result.continueCursor;
      } while (cursor !== null);
      return seen;
    };
    const first = await traverse();
    const second = await traverse();
    expect(first).toHaveLength(8);
    expect(new Set(first)).toHaveLength(first.length);
    expect(second).toEqual(first);
  });

  it("uses native relevance pagination without custom values, sorting, or cursor layers", () => {
    const searchSource = source.slice(source.indexOf("function resourceSearchQuery"), source.indexOf("export const buscarRecursosResumen"));
    const endpointSource = source.slice(source.indexOf("export const buscarRecursosResumen"));
    expect(searchSource).toContain('withSearchIndex("buscar"');
    expect(endpointSource).toContain(".paginate(args.paginationOpts)");
    expect(endpointSource.match(/\.paginate\(/g)).toHaveLength(1);
    expect(searchSource).not.toMatch(/AdminPage|cursor envelope|plan token|order token|version token|cache|accumulator/i);
    expect(searchSource).not.toMatch(/valoresAtributoRecurso|\.collect\(|\.filter\(|\.sort\(/);
    expect(endpointSource).not.toMatch(/unidadId\\s*:/);
    expect(api.catalogoAdmin.recursos.buscarRecursosResumen).toBeDefined();
  });

});

describe("catalogoAdmin.recursos.obtenerDetalleRecurso", () => {
  const detailSource = (import.meta as ImportMeta & {
    glob: (pattern: string, options?: object) => Record<string, string>;
  }).glob("./lib/recursoDetalle.ts", { query: "?raw", import: "default", eager: true })["./lib/recursoDetalle.ts"];

  it("returns null for an unknown Resource ID", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const unknown = fixture.ids.globalAActive;
    await t.run(async (ctx) => { await ctx.db.delete(unknown); });

    await expect(t.query(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId: unknown })).resolves.toBeNull();
  });

  it("returns a complete active detail with diagnostics and stored values", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const result = await t.query(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId: fixture.ids.globalAActive });

    expect(result).toMatchObject({
      id: fixture.ids.globalAActive,
      identificadorTecnico: "RESOURCE_1",
      descripcion: null,
      identidadVersion: null,
      clase: { id: fixture.clazz, activo: true },
      familia: { id: fixture.family, activo: true },
      tipo: { id: fixture.typeA, activo: true },
      unidad: { id: fixture.unit, simbolo: null, activo: true },
      organizacion: null,
      classificationStatus: { state: "EFFECTIVE" },
      catalogDiagnostics: { hierarchy: { state: "EFFECTIVE" }, aggregateStatus: "NOT_EVALUATED", violations: [] },
    });
    expect(result?.valores).toHaveLength(1);
    expect(result?.valores[0]).toMatchObject({ recursoId: fixture.ids.globalAActive, atributoRecursoId: fixture.attribute, valor: "must not be returned" });
  });

  it("preserves organization references and nullable historical fields", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await t.run(async (ctx) => {
      await ctx.db.patch(fixture.ids.organizationAActive, { descripcion: "owned", identidadVersion: 7 });
    });

    const result = await t.query(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId: fixture.ids.organizationAActive });
    expect(result).toMatchObject({ descripcion: "owned", identidadVersion: 7, organizacion: { id: fixture.organization, clave: "ORG", activo: true }, activo: true });
    expect(result?.valores).toEqual([]);
  });

  it("keeps inactive history and broken references readable", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await t.run(async (ctx) => { await ctx.db.patch(fixture.typeA, { activo: false }); });

    const inert = await t.query(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId: fixture.ids.globalAInactive });
    expect(inert).toMatchObject({ activo: false, tipo: { id: fixture.typeA, activo: false }, classificationStatus: { state: "INERT" }, catalogDiagnostics: { hierarchy: { state: "INERT" } } });

    await t.run(async (ctx) => {
      await ctx.db.delete(fixture.typeA);
      await ctx.db.delete(fixture.family);
      await ctx.db.delete(fixture.clazz);
      await ctx.db.delete(fixture.unit);
      await ctx.db.delete(fixture.organization);
    });
    const broken = await t.query(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId: fixture.ids.organizationAInactive });
    expect(broken).toMatchObject({ clase: null, familia: null, tipo: null, unidad: null, organizacion: null, classificationStatus: { state: "BROKEN_REFERENCE" }, catalogDiagnostics: { hierarchy: { state: "BROKEN_REFERENCE" }, aggregateStatus: "INVALID" } });
  });

  it.each([0, 1, 200])("returns all stored values at the accepted boundary (%s)", async (count) => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const recursoId = count === 1 ? fixture.ids.globalAActive : fixture.ids.globalBActive;
    await t.run(async (ctx) => {
      const existing = count === 1 ? 1 : 0;
      for (let index = existing; index < count; index += 1) {
        await ctx.db.insert("valoresAtributoRecurso", { recursoId, atributoRecursoId: fixture.attribute, valor: `value-${index}` });
      }
    });
    const result = await t.query(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId });
    expect(result?.valores).toHaveLength(count);
  });

  it("rejects the first excessive value without truncating the result", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await t.run(async (ctx) => {
      for (let index = 1; index < 201; index += 1) {
        await ctx.db.insert("valoresAtributoRecurso", { recursoId: fixture.ids.globalAActive, atributoRecursoId: fixture.attribute, valor: `value-${index}` });
      }
    });

    await expect(t.query(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId: fixture.ids.globalAActive })).rejects.toMatchObject({
      data: { code: "ADMIN_INVALID_STATE", context: { field: "valores", reason: expect.stringContaining("RESOURCE_VALUE_LIMIT_EXCEEDED"), violations: [{ code: "RESOURCE_VALUE_LIMIT_EXCEEDED", count: 201 }] } },
    });
  });

  it("uses exactly one bounded indexed value load and keeps summaries value-free", () => {
    const loader = detailSource.slice(detailSource.indexOf("export async function loadResourceValuesBounded"));
    expect(loader.match(/\.take\(/g)).toHaveLength(1);
    expect(loader).toContain('.withIndex("porRecurso"');
    expect(loader).toContain(".take(MAX_RESOURCE_VALUES + 1)");
    expect(loader).not.toContain(".collect()");
    const summarySource = source.slice(source.indexOf("export const listarRecursosResumen"), source.indexOf("function resourceReference"));
    expect(summarySource).not.toContain("loadResourceValuesBounded");
  });
});

    describe("catalogoAdmin.recursos.actualizarRecurso", () => {
      it("exposes the revision-first update mutation", () => {
        expect(api.catalogoAdmin.recursos.actualizarRecurso).toBeDefined();
      });
    });

    describe("catalogoAdmin.recursos.actualizarRecurso / WU7", () => {
      async function seedUpdatable(t: ReturnType<typeof convexTest>, organizationId?: Id<"organizaciones"> | "FIXTURE", identity = false) {
        const fixture = await seedFixture(t);
        const owner = organizationId === "FIXTURE" ? fixture.organization : organizationId;
        await t.run(async (ctx) => {
          await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, unidadId: fixture.unit, principal: true, activo: true, revision: 1 });
          await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: fixture.typeA, tokens: [{ tipo: "TYPE_NAME" }], separador: " / ", activo: true, revision: 1 });
          if (identity) await ctx.db.patch(fixture.attribute, { participaIdentidad: true });
        });
        const resourceId = await t.run(async (ctx) => {
          const id = await ctx.db.insert("recursos", {
            tipoRecursoId: fixture.typeA,
            unidadId: fixture.unit,
            identificadorTecnico: identity ? "v1|CLASS|FAMILY|TYPE_A|PROOF=A" : "v1|CLASS|FAMILY|TYPE_A|",
            nombre: "Resource",
            descripcion: "Description",
            activo: false,
            revision: 1,
            organizacionId: owner,
            ...(owner === undefined ? {} : { identidadVersion: 1 }),
            adminScopeKey: owner === undefined ? "GLOBAL" : `ORG:${owner}`,
          });
          if (identity) await ctx.db.insert("valoresAtributoRecurso", { recursoId: id, atributoRecursoId: fixture.attribute, valor: "A" });
          if (owner !== undefined) await ctx.db.insert("identidadesRecurso", { organizacionId: owner, recursoId: id, version: 1, clave: identity ? "v1|CLASS|FAMILY|TYPE_A|PROOF=A" : "v1|CLASS|FAMILY|TYPE_A|", activa: true, creadaEn: 1 });
          return id;
        });
        return { ...fixture, resourceId };
      }

      async function snapshot(t: ReturnType<typeof convexTest>, recursoId: Id<"recursos">) {
        return t.run(async (ctx: MutationCtx) => ({
          resource: await ctx.db.get(recursoId),
          values: await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", recursoId)).collect(),
          aliases: await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", recursoId)).collect(),
        }));
      }

      function valueSet(values: Array<{ atributoRecursoId: Id<"atributosRecurso">; valor: string | number | boolean; opcionAtributoId?: Id<"opcionesAtributo"> }>) {
        return values
          .map(({ atributoRecursoId, valor, opcionAtributoId }) => ({ atributoRecursoId, valor, ...(opcionAtributoId === undefined ? {} : { opcionAtributoId }) }))
          .sort((left, right) => String(left.atributoRecursoId).localeCompare(String(right.atributoRecursoId)));
      }

      async function catalogSnapshot(t: ReturnType<typeof convexTest>) {
        return t.run(async (ctx: MutationCtx) => ({
          revisions: await ctx.db.query("catalogoRevisiones").collect(),
          snapshots: await ctx.db.query("catalogoTipoSnapshots").collect(),
        }));
      }

      async function seedPublishedCatalog(t: ReturnType<typeof convexTest>, fixture: Fixture) {
        await t.run(async (ctx: MutationCtx) => {
          const revisionId = await ctx.db.insert("catalogoRevisiones", {
            organizacionId: fixture.organization,
            numero: 1,
            estado: "PUBLISHED",
            hashContenido: "stable-catalog",
            creadoEn: 1,
            publicadoEn: 2,
          });
          await ctx.db.insert("catalogoTipoSnapshots", {
            organizacionId: fixture.organization,
            revisionId,
            tipoClave: "TYPE_A",
            snapshot: {
              clase: { id: fixture.clazz, clave: "CLASS", nombre: "Class" },
              familia: { id: fixture.family, clave: "FAMILY", nombre: "Family" },
              tipo: { id: fixture.typeA, clave: "TYPE_A", nombre: "Type A" },
              unidadNatural: { id: fixture.unit, clave: "UNIT", nombre: "Unit" },
              atributos: [],
              reglas: [],
              presentacionCanonica: { tipoNombre: "Type A", tokens: [{ tipo: "TYPE_NAME" }], separador: " / " },
              politicasCompatibilidad: [],
            },
          });
        });
      }

      async function expectImmutableEcho(
        t: ReturnType<typeof convexTest>,
        fixture: Awaited<ReturnType<typeof seedUpdatable>>,
        candidate: Record<string, unknown>,
        field: string,
      ) {
        const outcome = await t
          .mutation(api.catalogoAdmin.recursos.actualizarRecurso, {
            recursoId: fixture.resourceId,
            expectedRevision: 1,
            ...candidate,
          } as never)
          .then(() => ({ status: "fulfilled" as const }), (error: unknown) => ({ status: "rejected" as const, error }));
        expect(outcome.status).toBe("rejected");
        if (outcome.status === "rejected") {
          expect(outcome.error).toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
          expect((outcome.error as { data: { context: unknown } }).data.context).toEqual({
            entity: { kind: "recursos", id: fixture.resourceId },
            field,
          });
        }
      }

      it("loads directly, reports missing, and rejects stale before no-op or validation", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        const before = await snapshot(t, fixture.resourceId);
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 9, nombre: "  Resource  " })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
        expect(await snapshot(t, fixture.resourceId)).toEqual(before);
        const missing = await t.run(async (ctx) => { const id = await ctx.db.insert("recursos", { tipoRecursoId: fixture.typeA, unidadId: fixture.unit, identificadorTecnico: "gone", nombre: "Gone", activo: false, revision: 1 }); await ctx.db.delete(id); return id; });
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: missing, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_NOT_FOUND" } });
      });

      it("validates before normalized equality and updates mutable fields once", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        await seedPublishedCatalog(t, fixture);
        const unchanged = await t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, nombre: "  Resource  ", descripcion: " Description " });
        expect(unchanged).toMatchObject({ disposition: "UNCHANGED", item: { revision: 1, nombre: "Resource" } });
        await t.run(async (ctx) => { await ctx.db.patch(fixture.unit, { activo: false }); });
        const inactiveUnitBefore = await snapshot(t, fixture.resourceId);
        const inactiveUnitCatalogBefore = await catalogSnapshot(t);
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, nombre: "  Resource  " })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
        expect(await snapshot(t, fixture.resourceId)).toEqual(inactiveUnitBefore);
        expect(await catalogSnapshot(t)).toEqual(inactiveUnitCatalogBefore);
        await t.run(async (ctx) => { await ctx.db.patch(fixture.unit, { activo: true }); });
        const successCatalogBefore = await catalogSnapshot(t);
        const changed = await t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, nombre: "  Changed  ", descripcion: "  New description ", valores: [{ atributoRecursoId: fixture.attribute, valor: "new" }] });
        expect(changed).toMatchObject({ disposition: "UPDATED", item: { revision: 2, nombre: "Changed" } });
        expect((await snapshot(t, fixture.resourceId)).resource?.revision).toBe(2);
        expect(await catalogSnapshot(t)).toEqual(successCatalogBefore);
      });

      it("replaces the mutable Unit and persists the exact replacement", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        await seedPublishedCatalog(t, fixture);
        const replacementUnit = await t.run(async (ctx) => {
          const unit = await ctx.db.insert("unidades", { clave: "REPLACEMENT_UNIT", nombre: "Replacement unit", activo: true, revision: 1 });
          const policy = await ctx.db.query("politicasUnidadRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", fixture.family)).first();
          await ctx.db.patch(policy!._id, { unidadId: unit });
          return unit;
        });
        const catalogBefore = await catalogSnapshot(t);
        const result = await t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, unidadId: replacementUnit, nombre: " Renamed with unit " });
        expect(result).toMatchObject({ disposition: "UPDATED", item: { revision: 2, unidadId: replacementUnit, nombre: "Renamed with unit" } });
        const after = await snapshot(t, fixture.resourceId);
        expect(after.resource).toMatchObject({ unidadId: replacementUnit, revision: 2, nombre: "Renamed with unit" });
        expect(after.resource?.unidadId).toBe(replacementUnit);
        expect(await catalogSnapshot(t)).toEqual(catalogBefore);
      });

      it.each([
        ["classification", "tipoRecursoId"],
        ["ownership", "ownership"],
      ] as const)("rejects immutable %s and preserves the aggregate", async (_field, expectedField) => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        const before = await snapshot(t, fixture.resourceId);
        const otherOrganization = await t.run(async ctx => ctx.db.insert("organizaciones", { clave: "OTHER", nombre: "Other", activo: true, revision: 1 }));
        const change = _field === "classification" ? { tipoRecursoId: fixture.typeB } : { ownership: { kind: "ORGANIZATION" as const, organizacionId: otherOrganization } };
        await expectImmutableEcho(t, fixture, change, expectedField);
        expect(await snapshot(t, fixture.resourceId)).toEqual(before);
      });

      it("permits a global identity change only when its inactive scoped identity is free", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, undefined, true);
        const changed = await t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, valores: [{ atributoRecursoId: fixture.attribute, valor: "B" }] });
        expect(changed).toMatchObject({ disposition: "UPDATED", item: { revision: 2, identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|PROOF=B" } });
      });

      it("rejects organization identity drift and reserves inactive duplicates while preserving aliases", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, "FIXTURE", true);
        const before = await snapshot(t, fixture.resourceId);
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, valores: [{ atributoRecursoId: fixture.attribute, valor: "B" }] })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
        expect(await snapshot(t, fixture.resourceId)).toEqual(before);

        const duplicate = await t.run(async (ctx) => ctx.db.insert("recursos", { tipoRecursoId: fixture.typeA, unidadId: fixture.unit, identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|PROOF=B", nombre: "Reserved", activo: false, revision: 1, adminScopeKey: "GLOBAL" }));
        expect(duplicate).toBeDefined();
        const global = await seedUpdatable(t, undefined, true);
        const globalBefore = await snapshot(t, global.resourceId);
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: global.resourceId, expectedRevision: 1, valores: [{ atributoRecursoId: global.attribute, valor: "B" }] })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
        expect(await snapshot(t, global.resourceId)).toEqual(globalBefore);
      });


      it("accepts 200 replacement values and rejects 201 without partial writes", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        const attributes = await t.run(async (ctx: MutationCtx) => {
          const ids = [fixture.attribute];
          for (let index = 2; index <= 200; index += 1) {
            const definition = await ctx.db.insert("definicionesAtributo", { clave: `VALUE_${index}`, nombre: `Value ${index}`, tipoDato: "TEXTO", activo: true, revision: 1 });
            ids.push(await ctx.db.insert("atributosRecurso", { familiaRecursoId: fixture.family, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: index, activo: true, revision: 1 }));
          }
          return ids;
        });
        const values = attributes.map((atributoRecursoId, index) => ({ atributoRecursoId, valor: `value-${index}` }));
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, valores: values })).resolves.toMatchObject({ disposition: "UPDATED", item: { revision: 2 } });
        expect(valueSet((await snapshot(t, fixture.resourceId)).values)).toEqual(valueSet(values));
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 2, valores: [] })).resolves.toMatchObject({ disposition: "UPDATED", item: { revision: 3 } });
        expect(valueSet((await snapshot(t, fixture.resourceId)).values)).toEqual([]);
        const before = await snapshot(t, fixture.resourceId);
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 3, valores: [...values, { atributoRecursoId: fixture.attribute, valor: "201" }] })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE" } });
        expect(await snapshot(t, fixture.resourceId)).toEqual(before);
      });

      it("accepts matching immutable echoes and rejects changed echoes without mutation", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        const otherClass = await t.run(async ctx => ctx.db.insert("clasesRecurso", { clave: "OTHER_CLASS", nombre: "Other class", activo: true, revision: 1 }));
        const otherFamily = await t.run(async ctx => ctx.db.insert("familiasRecurso", { claseRecursoId: otherClass, clave: "OTHER_FAMILY", nombre: "Other family", activo: true, revision: 1 }));
        const otherOrganization = await t.run(async ctx => ctx.db.insert("organizaciones", { clave: "OTHER", nombre: "Other", activo: true, revision: 1 }));
        const matching = await t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, {
          recursoId: fixture.resourceId, expectedRevision: 1,
          claseRecursoId: fixture.clazz, familiaRecursoId: fixture.family, tipoRecursoId: fixture.typeA,
          ownership: { kind: "GLOBAL" }, activo: false, identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|",
        } as never);
        expect(matching).toMatchObject({ disposition: "UNCHANGED", item: { revision: 1 } });
        const changedEchoes = [
          ["claseRecursoId", { claseRecursoId: otherClass }], ["familiaRecursoId", { familiaRecursoId: otherFamily }], ["tipoRecursoId", { tipoRecursoId: fixture.typeB }],
          ["ownership", { ownership: { kind: "ORGANIZATION" as const, organizacionId: otherOrganization } }],
          ["activo", { activo: true }], ["identificadorTecnico", { identificadorTecnico: "different" }],
        ] as const;
        for (const [field, echo] of changedEchoes) {
          const before = await snapshot(t, fixture.resourceId);
          await expectImmutableEcho(t, fixture, echo, field);
          expect(await snapshot(t, fixture.resourceId)).toEqual(before);
        }
      });

      it("gives a stale revision precedence over each immutable echo and invalid candidate", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        const otherClass = await t.run(async ctx => ctx.db.insert("clasesRecurso", { clave: "STALE_CLASS", nombre: "Stale class", activo: true, revision: 1 }));
        const otherFamily = await t.run(async ctx => ctx.db.insert("familiasRecurso", { claseRecursoId: otherClass, clave: "STALE_FAMILY", nombre: "Stale family", activo: true, revision: 1 }));
        const otherOrganization = await t.run(async ctx => ctx.db.insert("organizaciones", { clave: "STALE_ORG", nombre: "Stale organization", activo: true, revision: 1 }));
        const candidates = [
          ["class", { claseRecursoId: otherClass }],
          ["family", { familiaRecursoId: otherFamily }],
          ["organization ownership", { ownership: { kind: "ORGANIZATION" as const, organizacionId: otherOrganization } }],
          ["active lifecycle", { activo: true }],
          ["technical identity", { identificadorTecnico: "different" }],
          ["invalid values", { valores: [{ atributoRecursoId: fixture.attribute, valor: "first" }, { atributoRecursoId: fixture.attribute, valor: "duplicate" }] }],
        ] as const;
        for (const [_label, candidate] of candidates) {
          const before = await snapshot(t, fixture.resourceId);
          await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 9, ...candidate } as never)).rejects.toMatchObject({
            data: {
              code: "ADMIN_STALE_REVISION",
              context: { entity: { kind: "recursos", id: fixture.resourceId }, expectedRevision: 9, currentRevision: 1 },
            },
          });
          expect(await snapshot(t, fixture.resourceId)).toEqual(before);
        }
      });

      it("rejects an invalid semantically equal candidate and preserves every aggregate row", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        await t.run(async ctx => {
          await ctx.db.insert("atributosRecurso", { familiaRecursoId: fixture.family, definicionAtributoId: fixture.definition, aplicabilidad: "REQUIRED", participaIdentidad: false, orden: 2, activo: true, revision: 1 });
        });
        const before = await snapshot(t, fixture.resourceId);
        await expect(t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, nombre: " Resource ", descripcion: " Description " })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE" } });
        expect(await snapshot(t, fixture.resourceId)).toEqual(before);
      });

      it("rejects an ineffective or invalid aggregate without changing Resource state", async () => {
        const ineffective = convexTest(schema, modules);
        const inertFixture = await seedUpdatable(ineffective);
        await seedPublishedCatalog(ineffective, inertFixture);
        await ineffective.run(async ctx => { await ctx.db.patch(inertFixture.typeA, { activo: false }); });
        const inertBefore = await snapshot(ineffective, inertFixture.resourceId);
        const inertCatalogBefore = await catalogSnapshot(ineffective);
        await expect(ineffective.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: inertFixture.resourceId, expectedRevision: 1, nombre: "changed" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
        expect(await snapshot(ineffective, inertFixture.resourceId)).toEqual(inertBefore);
        expect(await catalogSnapshot(ineffective)).toEqual(inertCatalogBefore);
        const aggregate = convexTest(schema, modules);
        const aggregateFixture = await seedUpdatable(aggregate);
        await aggregate.run(async ctx => { await ctx.db.patch(aggregateFixture.attribute, { activo: false }); await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: aggregateFixture.typeA, tokens: [{ tipo: "ATTRIBUTE_VALUE", atributoRecursoId: aggregateFixture.attribute }], separador: " / ", activo: true, revision: 1 }); });
        const aggregateBefore = await snapshot(aggregate, aggregateFixture.resourceId);
        await expect(aggregate.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: aggregateFixture.resourceId, expectedRevision: 1, nombre: "changed" })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
        expect(await snapshot(aggregate, aggregateFixture.resourceId)).toEqual(aggregateBefore);
      });

      it("preserves organization aliases on a successful mutable replacement", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, "FIXTURE");
        const before = await snapshot(t, fixture.resourceId);
        const result = await t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1, nombre: " Renamed " });
        expect(result).toMatchObject({ disposition: "UPDATED", item: { revision: 2, nombre: "Renamed" } });
        const after = await snapshot(t, fixture.resourceId);
        expect(after.aliases).toEqual(before.aliases);
        expect(after.values).toEqual(before.values);
        expect(after.resource).toMatchObject({ organizacionId: fixture.organization, revision: 2, activo: false });
      });

      it("keeps update orchestration thin and never publishes catalog state", () => {
        const updateSource = source.slice(source.indexOf("export const actualizarRecurso"));
        expect(updateSource).not.toMatch(/lock|retry|compensat|cache|coordinator/i);
        expect(updateSource.match(/reemplazarValoresRecurso/g)).toHaveLength(1);
        expect(updateSource.match(/ctx\.db\.patch\(actual!\._id/g)).toHaveLength(1);
        expect(updateSource).not.toMatch(/catalogoRevisiones|catalogoTipoSnapshots|public/);
      });
    });

    async function seedUpdatable(t: ReturnType<typeof convexTest>, organization: boolean | "FIXTURE" = false, identity = false) {
      const fixture = await seedFixture(t);
      await t.run(async ctx => {
        await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, unidadId: fixture.unit, principal: true, activo: true, revision: 1 });
        await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: fixture.typeA, tokens: [{ tipo: "TYPE_NAME" }], separador: " / ", activo: true, revision: 1 });
        if (identity) await ctx.db.patch(fixture.attribute, { participaIdentidad: true });
      });
      const resourceId = await t.run(async ctx => {
        const owner = organization ? fixture.organization : undefined;
        const id = await ctx.db.insert("recursos", {
          tipoRecursoId: fixture.typeA, unidadId: fixture.unit,
          identificadorTecnico: identity ? "v1|CLASS|FAMILY|TYPE_A|PROOF=A" : "v1|CLASS|FAMILY|TYPE_A|",
          nombre: "Resource", descripcion: "Description", activo: false, revision: 1,
          ...(owner === undefined ? {} : { organizacionId: owner, identidadVersion: 1 }),
          adminScopeKey: owner === undefined ? "GLOBAL" : `ORG:${owner}`,
        });
        if (identity) await ctx.db.insert("valoresAtributoRecurso", { recursoId: id, atributoRecursoId: fixture.attribute, valor: "A" });
        if (owner !== undefined) await ctx.db.insert("identidadesRecurso", { organizacionId: owner, recursoId: id, version: 1, clave: identity ? "v1|CLASS|FAMILY|TYPE_A|PROOF=A" : "v1|CLASS|FAMILY|TYPE_A|", activa: true, creadaEn: 1 });
        return id;
      });
      return { ...fixture, resourceId };
    }

    async function snapshot(t: ReturnType<typeof convexTest>, recursoId: Id<"recursos">) {
      return t.run(async (ctx: MutationCtx) => ({
        resource: await ctx.db.get(recursoId),
        values: await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", recursoId)).collect(),
        aliases: await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", recursoId)).collect(),
      }));
    }

    async function catalogSnapshot(t: ReturnType<typeof convexTest>) {
      return t.run(async (ctx: MutationCtx) => ({ revisions: await ctx.db.query("catalogoRevisiones").collect(), snapshots: await ctx.db.query("catalogoTipoSnapshots").collect() }));
    }

    async function completeLifecycleSnapshot(t: ReturnType<typeof convexTest>) { return t.run(async (ctx: MutationCtx) => ({ resources: await ctx.db.query("recursos").collect(), values: await ctx.db.query("valoresAtributoRecurso").collect(), aliases: await ctx.db.query("identidadesRecurso").collect(), catalog: await ctx.db.query("catalogoRevisiones").collect(), publication: await ctx.db.query("catalogoTipoSnapshots").collect() })); }

    async function expectActivationFailure(t: ReturnType<typeof convexTest>, recursoId: Id<"recursos">, code: string, context: unknown) { const outcome = await t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId, expectedRevision: 1 }).then(() => null, (error: unknown) => error as { data: { code: string; context: unknown } }); expect(outcome).toMatchObject({ data: { code } }); expect(outcome?.data.context).toEqual(context); }

    describe("catalogoAdmin.recursos lifecycle / WU8", () => {
      it("loads directly and checks revision before same-state handling", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        await expect(t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 0 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_ARGUMENT" } });
        await expect(t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 9 })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
        await expect(t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: true, revision: 2 } });
        await expect(t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 2 })).resolves.toMatchObject({ disposition: "UNCHANGED", item: { activo: true, revision: 2 } });
        await expect(t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
        const missing = await t.run(async ctx => { const id = await ctx.db.insert("recursos", { tipoRecursoId: fixture.typeA, unidadId: fixture.unit, identificadorTecnico: "missing", nombre: "Missing", activo: false, revision: 1 }); await ctx.db.delete(id); return id; });
        await expect(t.mutation(api.catalogoAdmin.recursos.desactivarRecurso, { recursoId: missing, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_NOT_FOUND" } });
      });

      it("deactivates with one revision increment and preserves the aggregate", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, "FIXTURE", true);
        await t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1 });
        const before = await snapshot(t, fixture.resourceId);
        const catalogBefore = await catalogSnapshot(t);
        const result = await t.mutation(api.catalogoAdmin.recursos.desactivarRecurso, { recursoId: fixture.resourceId, expectedRevision: 2 });
        expect(result).toMatchObject({ disposition: "UPDATED", item: { activo: false, revision: 3 } });
        const after = await snapshot(t, fixture.resourceId);
        expect(after.values).toEqual(before.values);
        expect(after.aliases).toEqual(before.aliases);
        expect(after.resource).toMatchObject({ tipoRecursoId: fixture.typeA, unidadId: fixture.unit, organizacionId: fixture.organization, identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|PROOF=A", activo: false, revision: 3 });
        expect(await catalogSnapshot(t)).toEqual(catalogBefore);
        await expect(t.mutation(api.catalogoAdmin.recursos.desactivarRecurso, { recursoId: fixture.resourceId, expectedRevision: 3 })).resolves.toMatchObject({ disposition: "UNCHANGED", item: { revision: 3 } });
      });

      it("rejects ineffective, invalid, and duplicate activation without changing final state", async () => {
        const ineffective = convexTest(schema, modules);
        const inert = await seedUpdatable(ineffective, "FIXTURE", true);
        await ineffective.run(async ctx => ctx.db.patch(inert.typeA, { activo: false }));
        const inertBefore = await snapshot(ineffective, inert.resourceId);
        await expect(ineffective.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: inert.resourceId, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
        expect(await snapshot(ineffective, inert.resourceId)).toEqual(inertBefore);

        const invalid = convexTest(schema, modules);
        const broken = await seedUpdatable(invalid);
        await invalid.run(async ctx => {
          await ctx.db.patch(broken.attribute, { activo: false });
          const presentation = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", q => q.eq("tipoRecursoId", broken.typeA)).first();
          if (presentation) await ctx.db.patch(presentation._id, { tokens: [{ tipo: "ATTRIBUTE_VALUE", atributoRecursoId: broken.attribute }] });
        });
        const invalidBefore = await snapshot(invalid, broken.resourceId);
        await expect(invalid.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: broken.resourceId, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
        expect(await snapshot(invalid, broken.resourceId)).toEqual(invalidBefore);

        const duplicate = convexTest(schema, modules);
        const candidate = await seedUpdatable(duplicate, "FIXTURE", true);
        await duplicate.run(async ctx => ctx.db.insert("recursos", { tipoRecursoId: candidate.typeA, unidadId: candidate.unit, identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|PROOF=A", nombre: "Duplicate", activo: true, revision: 1, organizacionId: candidate.organization, identidadVersion: 1, adminScopeKey: `ORG:${candidate.organization}` }));
        const duplicateBefore = await snapshot(duplicate, candidate.resourceId);
        await expect(duplicate.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: candidate.resourceId, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
        expect(await snapshot(duplicate, candidate.resourceId)).toEqual(duplicateBefore);
      });

      it("keeps catalog blockers limited to active Resources", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t);
        await t.run(async ctx => {
          await ctx.db.patch(fixture.ids.globalAActive, { activo: false });
          await ctx.db.patch(fixture.ids.organizationAActive, { activo: false });
        });
        await t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1 });
        await expect(t.mutation(api.catalogoAdmin.jerarquia.desactivarTipo, { tipoRecursoId: fixture.typeA, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED", context: { relationKind: "active-resource" } } });
        await t.mutation(api.catalogoAdmin.recursos.desactivarRecurso, { recursoId: fixture.resourceId, expectedRevision: 2 });
        await expect(t.mutation(api.catalogoAdmin.jerarquia.desactivarTipo, { tipoRecursoId: fixture.typeA, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: false, revision: 2 } });
      });

      it("returns exact ADMIN_INVALID_STATE context and preserves the complete lifecycle snapshot", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, "FIXTURE", true);
        await t.run(async ctx => {
          await ctx.db.insert("valoresAtributoRecurso", { recursoId: fixture.resourceId, atributoRecursoId: fixture.attribute, valor: "duplicate" });
        });
        const before = await completeLifecycleSnapshot(t);
        await expectActivationFailure(t, fixture.resourceId, "ADMIN_INVALID_STATE", {
          entity: { kind: "recursos", id: fixture.resourceId },
          field: "valores",
          reason: "RESOURCE_ATTRIBUTE_DUPLICATE",
          violations: [{ code: "RESOURCE_ATTRIBUTE_DUPLICATE", entity: { kind: "recursos", id: fixture.resourceId }, field: "valores" }],
        });
        expect(await completeLifecycleSnapshot(t)).toEqual(before);
      });

      it("returns exact organization identity-drift context and preserves the complete lifecycle snapshot", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, "FIXTURE", true);
        const storedValue = await t.run(async ctx => ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", fixture.resourceId)).first());
        await t.run(async ctx => ctx.db.patch(storedValue!._id, { valor: "B" }));
        const before = await completeLifecycleSnapshot(t);
        await expectActivationFailure(t, fixture.resourceId, "ADMIN_IMMUTABLE_FIELD", { entity: { kind: "recursos", id: fixture.resourceId }, field: "identificadorTecnico" });
        expect(await completeLifecycleSnapshot(t)).toEqual(before);
      });

      it("returns exact alias-conflict context and preserves the complete lifecycle snapshot", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, "FIXTURE", true);
        await t.run(async ctx => {
          const existingAlias = await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", fixture.resourceId)).first();
          if (existingAlias) await ctx.db.delete(existingAlias._id);
        });
        const conflictingAlias = await t.run(async ctx => {
          const conflictingResource = await ctx.db.insert("recursos", {
            tipoRecursoId: fixture.typeA,
            unidadId: fixture.unit,
            identificadorTecnico: "different-identity",
            nombre: "Alias owner",
            activo: false,
            revision: 1,
            organizacionId: fixture.organization,
            identidadVersion: 1,
            adminScopeKey: `ORG:${fixture.organization}`,
          });
          return ctx.db.insert("identidadesRecurso", {
            organizacionId: fixture.organization,
            recursoId: conflictingResource,
            version: 1,
            clave: "v1|CLASS|FAMILY|TYPE_A|PROOF=A",
            activa: true,
            creadaEn: 1,
          });
        });
        const before = await completeLifecycleSnapshot(t);
        await expectActivationFailure(t, fixture.resourceId, "ADMIN_CONFLICT", {
          entity: { kind: "recursos", id: fixture.resourceId },
          conflictKind: "resource-alias",
          conflictingEntity: { kind: "identidadesRecurso", id: conflictingAlias },
          normalizedIdentity: "v1|CLASS|FAMILY|TYPE_A|PROOF=A",
        });
        expect(await completeLifecycleSnapshot(t)).toEqual(before);
      });

      it("allows the same technical identity in a different organization", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedUpdatable(t, "FIXTURE", true);
        const otherOrganization = await t.run(async ctx => ctx.db.insert("organizaciones", { clave: "OTHER", nombre: "Other", activo: true, revision: 1 }));
        const otherResource = await t.run(async ctx => {
          const resourceId = await ctx.db.insert("recursos", {
            tipoRecursoId: fixture.typeA,
            unidadId: fixture.unit,
            identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|PROOF=A",
            nombre: "Other organization resource",
            activo: true,
            revision: 1,
            organizacionId: otherOrganization,
            identidadVersion: 1,
            adminScopeKey: `ORG:${otherOrganization}`,
          });
          await ctx.db.insert("identidadesRecurso", {
            organizacionId: otherOrganization,
            recursoId: resourceId,
            version: 1,
            clave: "v1|CLASS|FAMILY|TYPE_A|PROOF=A",
            activa: true,
            creadaEn: 1,
          });
          return resourceId;
        });
        const result = await t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: fixture.resourceId, expectedRevision: 1 });
        expect(result).toMatchObject({ disposition: "UPDATED", item: { id: fixture.resourceId, activo: true, revision: 2, identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|PROOF=A" } });
        expect(await t.run(async ctx => ctx.db.get(otherResource))).toMatchObject({ organizacionId: otherOrganization, activo: true, revision: 1, identificadorTecnico: "v1|CLASS|FAMILY|TYPE_A|PROOF=A" });
      });

      it("triangulates inactive-unit, broken-reference, and stale deactivation paths", async () => {
        const inactiveUnit = convexTest(schema, modules);
        const unitFixture = await seedUpdatable(inactiveUnit);
        await inactiveUnit.run(async ctx => ctx.db.patch(unitFixture.unit, { activo: false }));
        const unitBefore = await snapshot(inactiveUnit, unitFixture.resourceId);
        await expect(inactiveUnit.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: unitFixture.resourceId, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
        expect(await snapshot(inactiveUnit, unitFixture.resourceId)).toEqual(unitBefore);

        const broken = convexTest(schema, modules);
        const brokenFixture = await seedUpdatable(broken);
        await broken.run(async ctx => ctx.db.delete(brokenFixture.typeA));
        const brokenBefore = await snapshot(broken, brokenFixture.resourceId);
        await expect(broken.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: brokenFixture.resourceId, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
        expect(await snapshot(broken, brokenFixture.resourceId)).toEqual(brokenBefore);

        const stale = convexTest(schema, modules);
        const staleFixture = await seedUpdatable(stale);
        await expect(stale.mutation(api.catalogoAdmin.recursos.desactivarRecurso, { recursoId: staleFixture.resourceId, expectedRevision: 9 })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
        await expect(stale.mutation(api.catalogoAdmin.recursos.desactivarRecurso, { recursoId: staleFixture.resourceId, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UNCHANGED", item: { activo: false, revision: 1 } });
      });

      it("keeps lifecycle mutations thin and free of publication or transaction machinery", () => {
        const lifecycleSource = source.slice(source.indexOf("export const activarRecurso"));
        expect(lifecycleSource).not.toMatch(/lock|retry|compensat|cache|coordinator|catalogoRevisiones|catalogoTipoSnapshots|public/);
        expect(lifecycleSource).toContain("targetActive: false");
        expect(lifecycleSource).toContain("patch: next => ctx.db.patch(next._id, { activo: false, revision: next.revision })");
      });
    });
