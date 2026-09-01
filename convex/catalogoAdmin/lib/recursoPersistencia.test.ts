import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../../_generated/api";
import schema from "../../schema";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { insertarRecursoAdministrativo } from "./recursoPersistencia";

const generatedModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("../../_generated/**/*.{ts,js}");
const localModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("../*.{ts,js}");
const modules = {
  ...generatedModules,
  ...Object.fromEntries(
    Object.entries(localModules).map(([path, module]) => [
      `../../catalogoAdmin/${path.slice(3)}`,
      module,
    ]),
  ),
};

type Fixture = Awaited<ReturnType<typeof seedFixture>>;
type CreateInput = {
  claseRecursoId: Id<"clasesRecurso">;
  familiaRecursoId: Id<"familiasRecurso">;
  tipoRecursoId: Id<"tiposRecurso">;
  unidadId: Id<"unidades">;
  nombre: string;
  descripcion?: string;
  valores: Array<{
    atributoRecursoId: Id<"atributosRecurso">;
    valor: string | number | boolean;
    opcionAtributoId?: Id<"opcionesAtributo">;
  }>;
  ownership:
    | { kind: "GLOBAL" }
    | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
};

async function seedFixture(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "CLASS", nombre: "Class", activo: true, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "FAMILY", nombre: "Family", activo: true, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "TYPE", nombre: "Type", activo: true, revision: 1 });
    const unidad = await ctx.db.insert("unidades", { clave: "UNIT", nombre: "Unit", activo: true, revision: 1 });
    const organization = await ctx.db.insert("organizaciones", { clave: "ORG", nombre: "Organization", activo: true, revision: 1 });
    const otherOrganization = await ctx.db.insert("organizaciones", { clave: "OTHER", nombre: "Other", activo: true, revision: 1 });
    const definition = await ctx.db.insert("definicionesAtributo", { clave: "VALUE", nombre: "Value", tipoDato: "TEXTO", activo: true, revision: 1 });
    const attribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
    await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: familia, unidadId: unidad, principal: true, activo: true, revision: 1 });
    await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: tipo, tokens: [{ tipo: "TYPE_NAME" }], separador: " / ", activo: true, revision: 1 });
    return { clase, familia, tipo, unidad, organization, otherOrganization, definition, attribute };
  });
}

function input(fixture: Fixture, overrides: Partial<CreateInput> = {}): CreateInput {
  return {
    claseRecursoId: fixture.clase,
    familiaRecursoId: fixture.familia,
    tipoRecursoId: fixture.tipo,
    unidadId: fixture.unidad,
    nombre: "Resource",
    valores: [],
    ownership: { kind: "GLOBAL" },
    ...overrides,
  };
}

function create(t: ReturnType<typeof convexTest>, args: CreateInput) {
  return t.mutation(api.catalogoAdmin.recursos.crearRecurso, args);
}

async function state(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx: MutationCtx) => ({
    resources: await ctx.db.query("recursos").withIndex("porIdentificadorTecnico", q => q).collect(),
    values: await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q).collect(),
    aliases: await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q).collect(),
  }));
}

describe("recursoPersistencia / crearRecurso", () => {
  it("accepts zero and persists a successful non-empty value set", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await expect(create(t, input(fixture))).resolves.toMatchObject({ disposition: "CREATED" });
    const result = await create(t, input(fixture, {
      nombre: "With value",
      valores: [{ atributoRecursoId: fixture.attribute, valor: "stored value" }],
      ownership: { kind: "ORGANIZATION", organizacionId: fixture.organization },
    }));
    expect(result.item.nombre).toBe("With value");
    const persistedResource = await t.run(async (ctx) => ctx.db.get(result.item.id));
    expect(persistedResource).not.toBeNull();
    expect(persistedResource?.activo).toBe(false);
    expect(persistedResource?.revision).toBe(1);
    expect(persistedResource?.organizacionId).toBe(fixture.organization);
    expect(persistedResource?.identificadorTecnico).toBe("v1|CLASS|FAMILY|TYPE|");
    expect(await t.run(async (ctx) => ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", result.item.id)).collect())).toEqual([
      expect.objectContaining({ atributoRecursoId: fixture.attribute, valor: "stored value", recursoId: result.item.id }),
    ]);
    expect(await t.run(async (ctx) => ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", result.item.id)).collect())).toEqual([
      expect.objectContaining({
        organizacionId: fixture.organization,
        recursoId: result.item.id,
        version: 1,
        clave: "v1|CLASS|FAMILY|TYPE|",
      }),
    ]);
  });

  it("accepts exactly 200 values and rejects 201 before any write", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const attributes = await t.run(async (ctx) => {
      const ids = [fixture.attribute];
      for (let index = 2; index <= 200; index += 1) {
        const definition = await ctx.db.insert("definicionesAtributo", { clave: `VALUE_${index}`, nombre: `Value ${index}`, tipoDato: "TEXTO", activo: true, revision: 1 });
        ids.push(await ctx.db.insert("atributosRecurso", { familiaRecursoId: fixture.familia, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: index, activo: true, revision: 1 }));
      }
      return ids;
    });
    const values = attributes.map((atributoRecursoId, index) => ({ atributoRecursoId, valor: `value-${index}` }));
    const created = await create(t, input(fixture, { valores: values }));
    expect(await t.run(async (ctx) => ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", created.item.id)).collect())).toHaveLength(200);

    const before = await state(t);
    await expect(create(t, input(fixture, { nombre: "Too many", valores: [...values, { atributoRecursoId: fixture.attribute, valor: "201" }] }))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_STATE" } });
    expect(await state(t)).toEqual(before);
  });

  it.each(["active", "inactive"])("requires an %s organization", async (status) => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    if (status === "inactive") await t.run(async (ctx) => { await ctx.db.patch(fixture.organization, { activo: false }); });
    else await t.run(async (ctx) => { await ctx.db.delete(fixture.organization); });
    const before = await state(t);
    await expect(create(t, input(fixture, { ownership: { kind: "ORGANIZATION", organizacionId: fixture.organization } }))).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE", context: { field: "organizacionId" } } });
    expect(await state(t)).toEqual(before);
  });

  it("keeps global and organization identities in separate exact scopes", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await create(t, input(fixture, { ownership: { kind: "ORGANIZATION", organizacionId: fixture.organization } }));
    await expect(create(t, input(fixture))).resolves.toMatchObject({ disposition: "CREATED" });
    await expect(create(t, input(fixture, { ownership: { kind: "ORGANIZATION", organizacionId: fixture.organization } }))).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(create(t, input(fixture))).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(create(t, input(fixture, { ownership: { kind: "ORGANIZATION", organizacionId: fixture.otherOrganization } }))).resolves.toMatchObject({ disposition: "CREATED" });
  });

  it("does not let an organization-owned row block global creation", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    await t.run(async (ctx) => {
      const organizationResource = await ctx.db.insert("recursos", { tipoRecursoId: fixture.tipo, unidadId: fixture.unidad, identificadorTecnico: "v1|CLASS|FAMILY|TYPE|", nombre: "Organization row", activo: false, revision: 1, organizacionId: fixture.organization, identidadVersion: 1, adminScopeKey: `ORG:${fixture.organization}` });
      await ctx.db.insert("identidadesRecurso", { organizacionId: fixture.organization, recursoId: organizationResource, version: 1, clave: "v1|CLASS|FAMILY|TYPE|", activa: true, creadaEn: 1 });
    });
    await expect(create(t, input(fixture))).resolves.toMatchObject({ disposition: "CREATED" });
  });

  it("reserves inactive duplicates in each exact scope and reports alias collisions", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const organizationInput = input(fixture, { ownership: { kind: "ORGANIZATION", organizacionId: fixture.organization } });
    await create(t, organizationInput);
    const before = await state(t);
    await expect(create(t, organizationInput)).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    expect(await state(t)).toEqual(before);

    const dummy = await t.run(async (ctx) => {
      const resourceId = await ctx.db.insert("recursos", { tipoRecursoId: fixture.tipo, unidadId: fixture.unidad, identificadorTecnico: "different", nombre: "Dummy", activo: false, revision: 1, organizacionId: fixture.otherOrganization, identidadVersion: 1, adminScopeKey: `ORG:${fixture.otherOrganization}` });
      await ctx.db.insert("identidadesRecurso", { organizacionId: fixture.otherOrganization, recursoId: resourceId, version: 1, clave: "v1|CLASS|FAMILY|TYPE|", activa: true, creadaEn: 1 });
      return resourceId;
    });
    const beforeAlias = await state(t);
    await expect(create(t, input(fixture, { ownership: { kind: "ORGANIZATION", organizacionId: fixture.otherOrganization } }))).rejects.toMatchObject({ data: { code: "ADMIN_CONFLICT" } });
    expect(dummy).toBeDefined();
    expect(await state(t)).toEqual(beforeAlias);
  });

  it("rolls back injected alias and value-write failures through the native transaction", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const before = await state(t);
    await expect(t.run(async (ctx) => insertarRecursoAdministrativo(ctx as never, {
      tipoRecursoId: fixture.tipo,
      unidadId: fixture.unidad,
      identificadorTecnico: "v1|CLASS|FAMILY|TYPE|",
      nombre: "Injected value failure",
      ownership: { organizacionId: fixture.organization },
      valores: [{ atributoRecursoId: fixture.attribute, valor: undefined } as never],
    }))).rejects.toThrow();
    expect(await state(t)).toEqual(before);

    await t.run(async (ctx) => {
      const resourceId = await ctx.db.insert("recursos", { tipoRecursoId: fixture.tipo, unidadId: fixture.unidad, identificadorTecnico: "different", nombre: "Alias owner", activo: false, revision: 1, organizacionId: fixture.organization, identidadVersion: 1, adminScopeKey: `ORG:${fixture.organization}` });
      await ctx.db.insert("identidadesRecurso", { organizacionId: fixture.organization, recursoId: resourceId, version: 1, clave: "v1|CLASS|FAMILY|TYPE|", activa: true, creadaEn: 1 });
    });
    const aliasBefore = await state(t);
    await expect(t.run(async (ctx) => insertarRecursoAdministrativo(ctx as never, {
      tipoRecursoId: fixture.tipo,
      unidadId: fixture.unidad,
      identificadorTecnico: "v1|CLASS|FAMILY|TYPE|",
      nombre: "Injected alias failure",
      ownership: { organizacionId: fixture.organization },
      valores: [],
    }))).rejects.toThrow(/conflicto/i);
    expect(await state(t)).toEqual(aliasBefore);
  });

  it("does not mutate publication data and leaves one committed identity under equivalent concurrency", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seedFixture(t);
    const args = input(fixture, { ownership: { kind: "GLOBAL" } });
    const outcomes = await Promise.allSettled([create(t, args), create(t, args)]);
    expect(outcomes.filter(outcome => outcome.status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter(outcome => outcome.status === "rejected")[0]).toMatchObject({ reason: { data: { code: "ADMIN_DUPLICATE_KEY" } } });
    expect(await t.run(async (ctx) => ({
      resources: (await ctx.db.query("recursos").withIndex("porIdentificadorTecnico", q => q.eq("identificadorTecnico", "v1|CLASS|FAMILY|TYPE|")).collect()).length,
      revisions: await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYNumero").collect(),
      snapshots: await ctx.db.query("catalogoTipoSnapshots").withIndex("porOrganizacionYTipo").collect(),
    }))).toMatchObject({ resources: 1, revisions: [], snapshots: [] });
  });
});
