import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";
import type { Id } from "../_generated/dataModel";

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
    return { clazz, family, typeA, typeB, unit, organization, ids };
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

  it("traverses more than 1,000 unchanged Resources without duplicates or omissions", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await t.run(async (ctx) => {
      for (let index = 100; index < 1201; index += 1) {
        await ctx.db.insert("recursos", {
          tipoRecursoId: fixture.typeA,
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
    await seedFixture(t);
    const traverse = async () => {
      const seen: string[] = [];
      let cursor: string | null = null;
      do {
        const result = await search(t, { searchText: "Resource", paginationOpts: { numItems, cursor } });
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
    const searchSource = source.slice(source.indexOf("function resourceSearchQuery"));
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
