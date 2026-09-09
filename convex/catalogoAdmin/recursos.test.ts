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

describe("catalogoAdmin.recursos legacy contract / WU11", () => {
  it("keeps the seven legacy admin functions and manual creator contract separate from selection creation", () => {
    for (const endpoint of [
      api.catalogoAdmin.recursos.crearRecurso,
      api.catalogoAdmin.recursos.listarRecursosResumen,
      api.catalogoAdmin.recursos.buscarRecursosResumen,
      api.catalogoAdmin.recursos.obtenerDetalleRecurso,
      api.catalogoAdmin.recursos.actualizarRecurso,
      api.catalogoAdmin.recursos.activarRecurso,
      api.catalogoAdmin.recursos.desactivarRecurso,
    ]) expect(endpoint).toBeDefined();
    const legacyCreator = source.slice(source.indexOf("export const crearRecurso ="), source.indexOf("export const listarRecursosResumen"));
    expect(legacyCreator).toContain("nombre: v.string()");
    expect(legacyCreator).toContain("descripcion: v.optional(v.string())");
    expect(legacyCreator).toContain("valores: v.array(resourceValueInputValidator)");
    expect(legacyCreator).not.toMatch(/expectedCatalogFingerprint|valorPermitidoId/);
        expect(legacyCreator).toContain('cargarAgregado(ctx, args.tipoRecursoId, {}, "RESOURCE")');
      });

      describe("B3 policy-independent legacy guards", () => {
        it("accepts an active Unit with no matching policy through create, update, and activate", async () => {
        const t = convexTest(schema, modules);
        const fixture = await seedFixture(t);
        await t.run(async ctx => {
          const foreignUnit = await ctx.db.insert("unidades", { clave: "FOREIGN", nombre: "Foreign", activo: true, revision: 1 });
          await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, unidadId: foreignUnit, principal: true, activo: true, revision: 1 });
          await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: fixture.typeA, tokens: [{ tipo: "TYPE_NAME" }], separador: " / ", activo: true, revision: 1 });
        });
        const created = await t.mutation(api.catalogoAdmin.recursos.crearRecurso, {
          claseRecursoId: fixture.clazz, familiaRecursoId: fixture.family, tipoRecursoId: fixture.typeA, unidadId: fixture.unit,
          nombre: "No policy resource", valores: [], ownership: { kind: "ORGANIZATION", organizacionId: fixture.organization },
        });
        expect(created).toMatchObject({ disposition: "CREATED", item: { unidadId: fixture.unit, organizacionId: fixture.organization, activo: false, revision: 1 } });
        const updated = await t.mutation(api.catalogoAdmin.recursos.actualizarRecurso, {
          recursoId: created.item.id, expectedRevision: 1, nombre: "Renamed resource", ownership: { kind: "ORGANIZATION", organizacionId: fixture.organization },
        });
        expect(updated).toMatchObject({ disposition: "UPDATED", item: { organizacionId: fixture.organization, activo: false, revision: 2 } });
        await expect(t.mutation(api.catalogoAdmin.recursos.activarRecurso, { recursoId: created.item.id, expectedRevision: 2 })).resolves.toMatchObject({ disposition: "UPDATED", item: { organizacionId: fixture.organization, activo: true, revision: 3 } });
      });
  });
});

describe("catalogoAdmin.recursos.crearRecursoDesdeSelecciones / WU9", () => {
  async function seedSelectable(t: ReturnType<typeof convexTest>, required = false) {
    const fixture = await seedFixture(t);
    const value = await t.run(async ctx => {
      await ctx.db.patch(fixture.definition, { modoCaptura: "SELECCION" });
      await ctx.db.patch(fixture.attribute, { aplicabilidad: required ? "REQUIRED" : "OPTIONAL", participaIdentidad: true });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, unidadId: fixture.unit, principal: true, activo: true, revision: 1 });
      return ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: fixture.definition, clave: "PROOF_VALUE", valor: { kind: "TEXTO", value: "derived value" }, nombre: "Derived value", orden: 1, activo: true, revision: 1 });
    });
    const input = { claseRecursoId: fixture.clazz, familiaRecursoId: fixture.family, tipoRecursoId: fixture.typeA, unidadId: fixture.unit, selecciones: [{ asignacionAtributoId: fixture.attribute, valorPermitidoId: value }], ownership: { kind: "GLOBAL" as const } };
    const evaluation = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
    return { fixture, value, input, evaluation };
  }

  async function creationState(t: ReturnType<typeof convexTest>) {
    return t.run(async (ctx: MutationCtx) => ({
      resources: await ctx.db.query("recursos").withIndex("porIdentificadorTecnico", q => q).collect(),
      values: await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q).collect(),
      aliases: await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q).collect()
    }));
  }

  it("requires a fingerprint, classifies stale input first, and does not write", async () => {
    const t = convexTest(schema, modules);
    const { input, evaluation } = await seedSelectable(t, true);
    await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, input as never)).rejects.toThrow(/expectedCatalogFingerprint/);
    const before = await creationState(t);
    const stale = await t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, selecciones: [], expectedCatalogFingerprint: "stale" });
    expect(Object.keys(stale).sort()).toEqual(["disposition", "evaluation"]);
    expect(stale).toMatchObject({ disposition: "CATALOG_CHANGED", evaluation: { catalogFingerprint: evaluation.catalogFingerprint, status: "INCOMPLETE" } });
    const foreign = await t.run(async ctx => ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: (await ctx.db.get(input.selecciones[0].valorPermitidoId))!.definicionAtributoId, clave: "STALE_INVALID", valor: { kind: "TEXTO", value: "stale" }, nombre: "Stale", orden: 2, activo: false, revision: 1 }));
    await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, selecciones: [{ asignacionAtributoId: input.selecciones[0].asignacionAtributoId, valorPermitidoId: foreign }], expectedCatalogFingerprint: "stale" })).resolves.toMatchObject({ disposition: "CATALOG_CHANGED", evaluation: { status: "INVALID" } });
    expect(await creationState(t)).toEqual(before);
  });

  it("returns matching incomplete and invalid evaluations without aggregate writes", async () => {
    const t = convexTest(schema, modules);
    const { fixture, input, evaluation } = await seedSelectable(t, true);
    const before = await creationState(t);
    await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, selecciones: [], expectedCatalogFingerprint: evaluation.catalogFingerprint })).resolves.toMatchObject({ disposition: "INCOMPLETE", evaluation: { status: "INCOMPLETE", valid: false } });
    const foreign = await t.run(ctx => ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: fixture.definition, clave: "FOREIGN", valor: { kind: "TEXTO", value: "foreign" }, nombre: "Foreign", orden: 2, activo: false, revision: 1 }));
    const invalidInput = { ...input, selecciones: [{ asignacionAtributoId: fixture.attribute, valorPermitidoId: foreign }] };
    const invalidEvaluation = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, invalidInput);
    expect(invalidEvaluation.catalogFingerprint).toBe(evaluation.catalogFingerprint);
    const invalid = await t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...invalidInput, expectedCatalogFingerprint: evaluation.catalogFingerprint });
    expect(invalid).toMatchObject({ disposition: "INVALID", evaluation: { catalogFingerprint: evaluation.catalogFingerprint, status: "INVALID", valid: false, issues: [{ code: "ALLOWED_VALUE_INACTIVE" }] } });
    expect(await creationState(t)).toEqual({ ...before, resources: before.resources, values: before.values, aliases: before.aliases });
  });

  it("persists the server-derived v2 global aggregate with private allowed-value references", async () => {
    const t = convexTest(schema, modules);
    const { input, value, evaluation } = await seedSelectable(t);
    const created = await t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluation.catalogFingerprint });
    expect(created.disposition).toBe("CREATED");
    if (created.disposition !== "CREATED") throw new Error("Expected a created Resource");
    expect(Object.keys(created).sort()).toEqual(["disposition", "item"]);
    expect(created.item).toMatchObject({ nombre: evaluation.nombre, identificadorTecnico: evaluation.identificadorTecnico, activo: false, revision: 1 });
    const stored = await t.run(async ctx => ({ resource: await ctx.db.get(created.item.id), values: await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", created.item.id)).collect(), aliases: await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", created.item.id)).collect() }));
    expect(stored.resource).toMatchObject({ identificadorTecnico: evaluation.identificadorTecnico, nombre: evaluation.nombre, activo: false, revision: 1, identidadVersion: 2 });
    expect(stored.resource).not.toHaveProperty("descripcion");
    expect(stored.values).toEqual([expect.objectContaining({ valor: "derived value", valorPermitidoId: value })]);
    expect(stored.aliases).toEqual([]);
  });

  it("reserves inactive scoped identities and creates only organization version-2 aliases", async () => {
    const t = convexTest(schema, modules);
    const { fixture, input, evaluation } = await seedSelectable(t);
    await t.run(ctx => ctx.db.insert("recursos", { tipoRecursoId: fixture.typeA, claseRecursoId: fixture.clazz, familiaRecursoId: fixture.family, unidadId: fixture.unit, identificadorTecnico: evaluation.identificadorTecnico!, nombre: "Inactive reservation", activo: false, revision: 1, identidadVersion: 2, adminScopeKey: "GLOBAL" }));
    const before = await creationState(t);
    const conflict = await t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluation.catalogFingerprint });
    expect(conflict).toMatchObject({ disposition: "INVALID", evaluation: { status: "INVALID", valid: false, nombre: null, identificadorTecnico: null, issues: [{ code: "IDENTITY_CONFLICT" }] } });
    expect(await creationState(t)).toEqual(before);

    const organizationInput = { ...input, ownership: { kind: "ORGANIZATION" as const, organizacionId: fixture.organization } };
    const organizationEvaluation = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, organizationInput);
    const aliasId = await t.run(async ctx => {
      const owner = await ctx.db.insert("recursos", { tipoRecursoId: fixture.typeA, unidadId: fixture.unit, identificadorTecnico: "other", nombre: "Alias owner", activo: false, revision: 1, organizacionId: fixture.organization, identidadVersion: 2, adminScopeKey: `ORG:${fixture.organization}` });
      return ctx.db.insert("identidadesRecurso", { organizacionId: fixture.organization, recursoId: owner, version: 2, clave: organizationEvaluation.identificadorTecnico!, activa: true, creadaEn: 1 });
    });
    const aliasBefore = await creationState(t);
    await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...organizationInput, expectedCatalogFingerprint: organizationEvaluation.catalogFingerprint })).resolves.toMatchObject({ disposition: "INVALID", evaluation: { issues: [{ code: "IDENTITY_CONFLICT" }] } });
    expect(await creationState(t)).toEqual(aliasBefore);
    await t.run(ctx => ctx.db.delete(aliasId));
    const created = await t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...organizationInput, expectedCatalogFingerprint: organizationEvaluation.catalogFingerprint });
    expect(created.disposition).toBe("CREATED");
    if (created.disposition !== "CREATED") throw new Error("Expected an organization Resource");
    const aliases = await t.run(ctx => ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", created.item.id)).collect());
    expect(aliases).toEqual([expect.objectContaining({ organizacionId: fixture.organization, version: 2, clave: organizationEvaluation.identificadorTecnico })]);
  });

  it("uses Convex OCC so one of two matching selection creates reports a typed conflict", async () => {
    const t = convexTest(schema, modules);
    const { input, evaluation } = await seedSelectable(t);
    const outcomes = await Promise.all([t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluation.catalogFingerprint }), t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluation.catalogFingerprint })]);
    expect(outcomes.filter(outcome => outcome.disposition === "CREATED")).toHaveLength(1);
    expect(outcomes.filter(outcome => outcome.disposition === "INVALID")).toEqual([expect.objectContaining({ evaluation: expect.objectContaining({ issues: expect.arrayContaining([expect.objectContaining({ code: "IDENTITY_CONFLICT" })]) }) })]);
    expect((await creationState(t)).resources.filter(resource => resource.identificadorTecnico === evaluation.identificadorTecnico)).toHaveLength(1);
  });
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
            const createSource = source.slice(source.indexOf("export const crearRecurso ="), source.indexOf("function deriveScopeKey"));
            const aggregateSource = source.slice(source.indexOf("async function validateCurrentResourceAggregate"), source.indexOf("export const actualizarRecurso"));
            expect(createSource).toContain('cargarAgregado(ctx, args.tipoRecursoId, {}, "RESOURCE")');
            expect(aggregateSource).toContain('cargarAgregado(ctx, tipoRecursoId, {}, "RESOURCE")');
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

describe("catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones / WU8", () => {
  it("evaluates the current live catalog with the exact public DTO", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const value = await t.run(async (ctx) => {
      await ctx.db.patch(fixture.definition, { modoCaptura: "SELECCION" });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, unidadId: fixture.unit, principal: true, activo: true, revision: 1 });
      return ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: fixture.definition, clave: "PROOF", valor: { kind: "TEXTO", value: "proof" }, nombre: "Proof", orden: 1, activo: true, revision: 1 });
    });
    const args = { claseRecursoId: fixture.clazz, familiaRecursoId: fixture.family, tipoRecursoId: fixture.typeA, unidadId: fixture.unit, selecciones: [{ asignacionAtributoId: fixture.attribute, valorPermitidoId: value }], ownership: { kind: "GLOBAL" as const } };
    const result = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, args);
    expect(Object.keys(result).sort()).toEqual(["asignaciones", "catalogFingerprint", "faltantesRequeridos", "identificadorTecnico", "issues", "nombre", "seleccionesInvalidas", "status", "valid", "valoresNormalizados"].sort());
    expect(result).toMatchObject({ status: "VALID", valid: true, valoresNormalizados: [{ atributoRecursoId: fixture.attribute, valor: "proof" }] });
    const foreign = await t.run(async (ctx) => {
      const definition = await ctx.db.insert("definicionesAtributo", { clave: "FOREIGN", nombre: "Foreign", tipoDato: "TEXTO", modoCaptura: "SELECCION", activo: true, revision: 1 });
      return ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: definition, clave: "FOREIGN", valor: { kind: "TEXTO", value: "foreign" }, nombre: "Foreign", orden: 1, activo: true, revision: 1 });
    });
    await expect(t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, { ...args, selecciones: [{ asignacionAtributoId: fixture.attribute, valorPermitidoId: foreign }] })).resolves.toMatchObject({ status: "INVALID", issues: [{ code: "ALLOWED_VALUE_FOREIGN" }] });
    const inactiveUnit = await t.run(ctx => ctx.db.insert("unidades", { clave: "INACTIVE", nombre: "Inactive", activo: false, revision: 1 }));
    await expect(t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, { ...args, unidadId: inactiveUnit })).resolves.toMatchObject({ status: "INVALID", issues: [{ code: "UNIT_INVALID" }] });
    await t.run(ctx => ctx.db.patch(fixture.organization, { activo: false }));
    const organizationArgs = { ...args, ownership: { kind: "ORGANIZATION" as const, organizacionId: fixture.organization } };
    await expect(t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, organizationArgs)).resolves.toMatchObject({ status: "INVALID", issues: [{ code: "OWNERSHIP_INVALID" }] });
    await t.run(ctx => ctx.db.delete(fixture.organization));
    await expect(t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, organizationArgs)).resolves.toMatchObject({ status: "INVALID", issues: [{ code: "OWNERSHIP_INVALID" }] });
  });
});

describe("catalogoAdmin.recursos selection creation / B4", () => {
  async function seedMetroLineal(t: ReturnType<typeof convexTest>) {
    const fixture = await seedFixture(t);
    const value = await t.run(async ctx => {
      await ctx.db.patch(fixture.definition, { modoCaptura: "SELECCION" });
      await ctx.db.patch(fixture.attribute, { participaIdentidad: true });
      return ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: fixture.definition, clave: "METRO_LINEAL", valor: { kind: "TEXTO", value: "metro-lineal" }, nombre: "Metro Lineal", orden: 1, activo: true, revision: 1 });
    });
    return { fixture, input: { claseRecursoId: fixture.clazz, familiaRecursoId: fixture.family, tipoRecursoId: fixture.typeA, unidadId: fixture.unit, selecciones: [{ asignacionAtributoId: fixture.attribute, valorPermitidoId: value }], ownership: { kind: "GLOBAL" as const } } };
  }

  async function policySnapshot(t: ReturnType<typeof convexTest>) {
    return t.run((ctx: MutationCtx) => ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYTipoYUnidadYAdminSort", q => q).collect());
  }

  const compareCodePoints = (left: string, right: string): number => {
    const a = [...left], b = [...right];
    for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
      const order = a[index].codePointAt(0)! - b[index].codePointAt(0)!;
      if (order !== 0) return order;
    }
    return a.length - b.length;
  };
  const legacyJson = (value: unknown): string => {
    if (value === undefined || value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value ?? null);
    if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : JSON.stringify({ $number: String(value) });
    if (Array.isArray(value)) return `[${value.map(legacyJson).join(",")}]`;
    return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => compareCodePoints(left, right)).map(([key, item]) => `${JSON.stringify(key)}:${legacyJson(item)}`).join(",")}}`;
  };
  const legacyReference = (kind: string, suppliedId: string | undefined, row: { id: string; clave?: string; nombre?: string; activo: boolean } | undefined) => !row
    ? suppliedId === undefined ? { state: "MISSING_REFERENCE", kind } : { state: "INVALID_REFERENCE", kind, suppliedId }
    : row.id !== suppliedId ? { state: "INVALID_REFERENCE", kind, suppliedId } : { state: "RESOLVED", kind, suppliedId, value: { id: row.id, clave: row.clave, nombre: row.nombre, activo: row.activo } };

  async function v1FingerprintForInFlightSelection(t: ReturnType<typeof convexTest>, input: Awaited<ReturnType<typeof seedMetroLineal>>["input"]) {
    return t.run(async (ctx: MutationCtx) => {
      const [clase, familia, tipo, unidad] = await Promise.all([ctx.db.get(input.claseRecursoId), ctx.db.get(input.familiaRecursoId), ctx.db.get(input.tipoRecursoId), ctx.db.get(input.unidadId)]);
      const attributes = await ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", input.familiaRecursoId)).collect();
      const definitions = new Map(await Promise.all(attributes.map(async attribute => [String(attribute.definicionAtributoId), await ctx.db.get(attribute.definicionAtributoId)] as const)));
      const assignment = (attribute: typeof attributes[number]) => ({ id: String(attribute._id), familiaId: String(attribute.familiaRecursoId), ...(attribute.tipoRecursoId === undefined ? {} : { tipoId: String(attribute.tipoRecursoId) }), definicionId: String(attribute.definicionAtributoId), definicionClave: definitions.get(String(attribute.definicionAtributoId))!.clave, tipoDato: definitions.get(String(attribute.definicionAtributoId))!.tipoDato, modoCaptura: definitions.get(String(attribute.definicionAtributoId))!.modoCaptura ?? "LIBRE", activo: attribute.activo, aplicabilidad: attribute.aplicabilidad, participaIdentidad: attribute.participaIdentidad, orden: attribute.orden, effectiveReasons: [] });
      const familyAssignments = attributes.filter(attribute => attribute.tipoRecursoId === undefined).map(assignment);
      const typeAssignments = attributes.filter(attribute => attribute.tipoRecursoId !== undefined).map(assignment);
      const selectedValue = await ctx.db.get(input.selecciones[0].valorPermitidoId);
      const policies = await ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYTipoYUnidadYAdminSort", q => q).collect();
      const hierarchyValid = Boolean(clase?.activo && familia?.activo && tipo?.activo && String(familia.claseRecursoId) === String(input.claseRecursoId) && String(tipo.familiaRecursoId) === String(input.familiaRecursoId));
      const familyPolicies = policies.filter(policy => policy.tipoRecursoId === undefined && String(policy.familiaRecursoId) === String(input.familiaRecursoId));
      const typePolicies = policies.filter(policy => String(policy.tipoRecursoId) === String(input.tipoRecursoId));
      const typePoliciesByUnit = new Map(typePolicies.map(policy => [String(policy.unidadId), policy]));
      const effectivePolicies = hierarchyValid ? [
        ...familyPolicies.filter(policy => policy.activo && !typePoliciesByUnit.has(String(policy.unidadId))),
        ...typePolicies.filter(policy => policy.activo),
      ] : [];
      const policyUnits = new Map(await Promise.all(effectivePolicies.map(async policy => [String(policy.unidadId), await ctx.db.get(policy.unidadId)] as const)));
      const text = (value: unknown) => typeof value === "string" ? value : "";
      const number = (value: unknown) => typeof value === "number" ? value : 0;
      const orderedAssignments = [...familyAssignments, ...typeAssignments].sort((left, right) => number(left.orden) - number(right.orden) || compareCodePoints(text(left.definicionClave), text(right.definicionClave)) || compareCodePoints(text(left.id), text(right.id)));
      const orderedValues = [selectedValue!].sort((left, right) => left.orden - right.orden || compareCodePoints(left.clave, right.clave) || compareCodePoints(String(left._id), String(right._id))).map(value => ({ id: String(value._id), definicionAtributoId: String(value.definicionAtributoId), clave: value.clave, nombre: value.nombre, orden: value.orden, activo: value.activo, valor: value.valor }));
      const canonical = {
        ownership: { kind: input.ownership.kind },
        hierarchy: {
          clase: legacyReference("CLASS", String(input.claseRecursoId), clase === null ? undefined : { id: String(clase._id), clave: clase.clave, nombre: clase.nombre, activo: clase.activo }),
          familia: legacyReference("FAMILY", String(input.familiaRecursoId), familia === null ? undefined : { id: String(familia._id), clave: familia.clave, nombre: familia.nombre, activo: familia.activo }),
          tipo: legacyReference("TYPE", String(input.tipoRecursoId), tipo === null ? undefined : { id: String(tipo._id), clave: tipo.clave, nombre: tipo.nombre, activo: tipo.activo }),
          unidad: legacyReference("UNIT", String(input.unidadId), unidad === null ? undefined : { id: String(unidad._id), clave: unidad.clave, nombre: unidad.nombre, activo: unidad.activo }),
          relationships: { familyToClass: { familiaId: familia === null ? null : String(familia._id), claseRecursoId: familia === null ? null : String(familia.claseRecursoId) }, typeToFamily: { tipoId: tipo === null ? null : String(tipo._id), familiaRecursoId: tipo === null ? null : String(tipo.familiaRecursoId) } },
          hierarchyValid,
          unitValid: Boolean(unidad?.activo && effectivePolicies.some(policy => String(policy.unidadId) === String(input.unidadId))),
        },
        policies: effectivePolicies.sort((left, right) => compareCodePoints(String(left.familiaRecursoId), String(right.familiaRecursoId)) || compareCodePoints(String(left.tipoRecursoId ?? ""), String(right.tipoRecursoId ?? "")) || compareCodePoints(String(left.unidadId), String(right.unidadId)) || compareCodePoints(String(left._id), String(right._id))).map(policy => ({ id: String(policy._id), familiaRecursoId: String(policy.familiaRecursoId), tipoRecursoId: policy.tipoRecursoId === undefined ? null : String(policy.tipoRecursoId), unidadId: String(policy.unidadId), activo: policy.activo, principal: policy.principal, state: "SELECTED", unidad: legacyReference("POLICY_UNIT", String(policy.unidadId), policyUnits.get(String(policy.unidadId)) === null ? undefined : (() => { const row = policyUnits.get(String(policy.unidadId))!; return { id: String(row._id), clave: row.clave, nombre: row.nombre, activo: row.activo }; })()) })),
        assignments: orderedAssignments,
        values: orderedValues,
        options: [],
        rules: [],
      };
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`selection-catalog-fingerprint:v1\n${legacyJson(canonical)}`));
      return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
    });
  }

  it("creates from an active no-policy Metro Lineal selection without mutating Unit policies", async () => {
    const t = convexTest(schema, modules);
    const { fixture, input } = await seedMetroLineal(t);
    const policiesBefore = await policySnapshot(t);
    expect(policiesBefore).toEqual([]);
    const evaluation = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
    expect(evaluation).toMatchObject({ status: "VALID", valid: true, nombre: "Type A · Metro Lineal" });
    expect(await policySnapshot(t)).toEqual(policiesBefore);
    const created = await t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluation.catalogFingerprint });
    expect(created).toMatchObject({ disposition: "CREATED", item: { unidadId: fixture.unit } });
    if (created.disposition !== "CREATED") throw new Error("Expected Metro Lineal creation");
    expect((await t.run(ctx => ctx.db.get(created.item.id)))?.unidadId).toBe(fixture.unit);
    expect(await policySnapshot(t)).toEqual(policiesBefore);
  });

  async function creationSnapshot(t: ReturnType<typeof convexTest>) {
    return t.run(async (ctx: MutationCtx) => ({
      resources: await ctx.db.query("recursos").withIndex("porIdentificadorTecnico", q => q).collect(),
      values: await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q).collect(),
      aliases: await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q).collect(),
    }));
  }

  it("keeps the v2 fingerprint stable across a policy-only mutation and still creates", async () => {
    const t = convexTest(schema, modules);
    const { fixture, input } = await seedMetroLineal(t);
    const evaluated = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
    const otherUnit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "POLICY_ONLY", nombre: "Policy only", activo: true });
    await t.mutation(api.catalogoAdmin.unidades.crearPoliticaUnidad, { familiaRecursoId: fixture.family, unidadId: otherUnit.item.id, principal: true, activo: true });
    const afterPolicy = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
    expect(afterPolicy.catalogFingerprint).toBe(evaluated.catalogFingerprint);
    await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluated.catalogFingerprint })).resolves.toMatchObject({ disposition: "CREATED", item: { unidadId: fixture.unit } });
  });

  it("keeps v2 eligibility stable across policy principal changes and deletion", async () => {
        const t = convexTest(schema, modules);
        const { fixture, input } = await seedMetroLineal(t);
        const evaluated = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
        const policyId = await t.run(ctx => ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, unidadId: fixture.unit, principal: true, activo: true, revision: 1 }));
        const inFlightV1 = await v1FingerprintForInFlightSelection(t, input);
        expect(inFlightV1).toMatch(/^[a-f0-9]{64}$/);
        expect(inFlightV1).not.toBe(evaluated.catalogFingerprint);
        expect(await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input)).toMatchObject({ status: "VALID", valid: true, catalogFingerprint: evaluated.catalogFingerprint });
        await t.run(ctx => ctx.db.patch(policyId, { principal: false }));
        expect(await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input)).toMatchObject({ status: "VALID", valid: true, catalogFingerprint: evaluated.catalogFingerprint });
        await t.run(ctx => ctx.db.delete(policyId));
        expect(await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input)).toMatchObject({ status: "VALID", valid: true, catalogFingerprint: evaluated.catalogFingerprint });
        const beforeStaleV1 = await creationSnapshot(t);
        await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: inFlightV1 })).resolves.toMatchObject({ disposition: "CATALOG_CHANGED", evaluation: { catalogFingerprint: evaluated.catalogFingerprint } });
        expect(await creationSnapshot(t)).toEqual(beforeStaleV1);
        await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluated.catalogFingerprint })).resolves.toMatchObject({ disposition: "CREATED", item: { unidadId: fixture.unit } });
      });

      it("keeps v2 creation eligible and fingerprint-stable when a type policy shadows the family policy", async () => {
        const t = convexTest(schema, modules);
        const { fixture, input } = await seedMetroLineal(t);
        await t.run(ctx => ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, unidadId: fixture.unit, principal: true, activo: true, revision: 1 }));
        const familyPolicyEvaluation = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
        expect(familyPolicyEvaluation).toMatchObject({ status: "VALID", valid: true });
        await t.run(ctx => ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: fixture.family, tipoRecursoId: fixture.typeA, unidadId: fixture.unit, principal: true, activo: false, revision: 1 }));
        const typeShadowedEvaluation = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
        expect(typeShadowedEvaluation).toMatchObject({ status: "VALID", valid: true, catalogFingerprint: familyPolicyEvaluation.catalogFingerprint });
        await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: familyPolicyEvaluation.catalogFingerprint })).resolves.toMatchObject({ disposition: "CREATED", item: { unidadId: fixture.unit } });
      });

      it("does not insert after selected-Unit deactivation", async () => {
        const t = convexTest(schema, modules);
        const { fixture, input } = await seedMetroLineal(t);
        const evaluated = await t.query(api.catalogoAdmin.recursos.evaluarCreacionDesdeSelecciones, input);
        await t.run(async ctx => {
          const resources = await ctx.db.query("recursos").withIndex("porUnidad", q => q.eq("unidadId", fixture.unit)).collect();
          await Promise.all(resources.map(resource => ctx.db.patch(resource._id, { activo: false })));
        });
        await t.mutation(api.catalogoAdmin.unidades.desactivarUnidad, { unidadId: fixture.unit, expectedRevision: 1 });
        const beforeInactive = await creationSnapshot(t);
        await expect(t.mutation(api.catalogoAdmin.recursos.crearRecursoDesdeSelecciones, { ...input, expectedCatalogFingerprint: evaluated.catalogFingerprint })).resolves.toMatchObject({ disposition: "CATALOG_CHANGED", evaluation: { status: "INVALID", issues: [{ code: "UNIT_INVALID" }] } });
        expect(await creationSnapshot(t)).toEqual(beforeInactive);
      });
});
