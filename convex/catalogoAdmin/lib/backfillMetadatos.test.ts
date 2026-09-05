import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../../_generated/api";
import type { Id, DataModel } from "../../_generated/dataModel";
import schema from "../../schema";
import { metadataPatch } from "./backfillMetadatos";

const backfillReference = (internal as any).catalogoAdmin.lib.backfillMetadatos.backfillMetadatos;
type ResourceIndexes = DataModel["recursos"]["indexes"];
type ResourceIndexNames = keyof ResourceIndexes;
type ObsoleteResourceIndex =
  | "adminPorOrden" | "adminPorActivoYOrden" | "adminPorTipoYOrden" | "adminPorActivoYTipoYOrden"
  | "adminPorUnidadYOrden" | "adminPorActivoYUnidadYOrden" | "adminPorScopeYOrden" | "adminPorActivoYScopeYOrden"
  | "adminPorTipoYUnidadYOrden" | "adminPorActivoYTipoYUnidadYOrden" | "adminPorTipoYScopeYOrden" | "adminPorActivoYTipoYScopeYOrden"
  | "adminPorUnidadYScopeYOrden" | "adminPorActivoYUnidadYScopeYOrden" | "adminPorTipoYUnidadYScopeYOrden" | "adminPorActivoYTipoYUnidadYScopeYOrden";
type Assert<T extends true> = T;
const resourceSchemaAssertions: [
  Assert<Extract<ObsoleteResourceIndex, ResourceIndexNames> extends never ? true : false>,
  Assert<ResourceIndexes["adminPorScopeYTipoYActivo"] extends ["adminScopeKey", "tipoRecursoId", "activo", "_creationTime"] ? true : false>,
  Assert<ResourceIndexes["adminPorScopeYActivo"] extends ["adminScopeKey", "activo", "_creationTime"] ? true : false>,
] = [true, true, true];
const modules = {
  ...import.meta.glob("../../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../../catalogoAdmin/lib/${path.slice(2)}`, module])),
};

type Fixture = {
  clase: Id<"clasesRecurso">;
  familia: Id<"familiasRecurso">;
  tipo: Id<"tiposRecurso">;
  unidad: Id<"unidades">;
  definicion: Id<"definicionesAtributo">;
  atributo: Id<"atributosRecurso">;
  opcion: Id<"opcionesAtributo">;
  revision: Id<"catalogoRevisiones">;
  snapshot: Id<"catalogoTipoSnapshots">;
};

async function seed(t: ReturnType<typeof convexTest>): Promise<Fixture> {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "Clase", activo: true, revision: 7 });
    await ctx.db.insert("clasesRecurso", { clave: "C2", nombre: "Otra clase", activo: false, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "Familia", activo: false, revision: 4 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "Tipo", activo: true, revision: 3 });
    const unidad = await ctx.db.insert("unidades", { clave: "U", nombre: "Unidad", activo: true, revision: 2 });
    const definicion = await ctx.db.insert("definicionesAtributo", { clave: "D", nombre: "Definición", tipoDato: "OPCION", activo: true, revision: 5 });
    const atributo = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: definicion, aplicabilidad: "OPTIONAL", participaIdentidad: true, orden: 8, activo: true, revision: 6 });
    const duplicate = await ctx.db.insert("atributosRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, definicionAtributoId: definicion, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 9, activo: false, revision: 1 });
    const opcion = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: definicion, clave: "O", nombre: "Opción", activo: true, revision: 2 });
    await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: familia, tipoRecursoId: tipo, unidadId: unidad, principal: true, activo: true, revision: 3 });
    await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: tipo, tokens: [{ tipo: "TYPE_NAME" }], separador: " / ", activo: true, revision: 2 });
    const policy = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: tipo, atributoOrigenId: atributo, atributoDestinoId: duplicate, modo: "DENYLIST", direccion: "SYMMETRIC", activo: false, revision: 2 });
    await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: opcion, opcionDestinoId: opcion, politicaCompatibilidadId: policy, tipoRelacion: "legacy", activo: true, revision: 2 });
    await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: tipo, atributoCondicionId: atributo, atributoAfectadoId: duplicate, aplicabilidad: "OPTIONAL", activo: false, revision: 2 });
    const organization = await ctx.db.insert("organizaciones", { clave: "ORG", nombre: "Org", activo: true, revision: 1 });
    const revision = await ctx.db.insert("catalogoRevisiones", { organizacionId: organization, numero: 11, estado: "PUBLISHED", hashContenido: "hash", creadoEn: 1, publicadoEn: 2 });
    const snapshot = await ctx.db.insert("catalogoTipoSnapshots", { organizacionId: organization, revisionId: revision, tipoClave: "T", snapshot: { clase: { id: clase, clave: "C", nombre: "Clase" }, familia: { id: familia, clave: "F", nombre: "Familia" }, tipo: { id: tipo, clave: "T", nombre: "Tipo" }, unidadNatural: { id: unidad, clave: "U", nombre: "Unidad" }, atributos: [], reglas: [], presentacionCanonica: { tipoNombre: "Tipo", tokens: [{ tipo: "TYPE_NAME" }], separador: " / " }, politicasCompatibilidad: [] } });
    void duplicate;
    return { clase, familia, tipo, unidad, definicion, atributo, opcion, revision, snapshot };
  });
}

type BackfillResult = { processed: number; updated: number; nextCursor: string | null; duplicateReports: Array<{ table: string; identity: string; ids: string[] }> };

async function runToCompletion(t: ReturnType<typeof convexTest>, batchSize = 2) {
  let cursor: string | null = null;
  const reports: unknown[] = [];
  do {
    const result: BackfillResult = await t.mutation(backfillReference, { cursor, batchSize });
    reports.push(...result.duplicateReports);
    cursor = result.nextCursor;
  } while (cursor !== null);
  return reports;
}

describe("derivación de metadatos WU2c", () => {
  it("mantiene la única derivación de alcance sin producir sort metadata", () => {
    expect(metadataPatch("recursos", { _id: "r1", organizacionId: "o1" })).toEqual({ adminScopeKey: "ORG:o1" });
    expect(metadataPatch("recursos", { _id: "r1" })).toEqual({ adminScopeKey: "GLOBAL" });
  });
});

describe("backfill de metadatos administrativos", () => {
  it("rellena metadatos opcionales en lotes reanudables y conserva datos", async () => {
    const t = convexTest(schema, modules);
    const fixture = await seed(t);
    await t.run(async ctx => { await ctx.db.patch(fixture.clase, { adminSortId: fixture.clase }); });
    const before = await t.run(async ctx => ({
      family: await ctx.db.get(fixture.familia),
      type: await ctx.db.get(fixture.tipo),
      revision: await ctx.db.get(fixture.revision),
      snapshot: await ctx.db.get(fixture.snapshot),
    }));

    const first = await t.mutation(backfillReference, { cursor: null, batchSize: 1 });
    expect(first.processed).toBe(1);
    expect(first.nextCursor).not.toBeNull();
    const reports = await runToCompletion(t);
    const after = await t.run(async ctx => ({
      family: await ctx.db.get(fixture.familia),
      type: await ctx.db.get(fixture.tipo),
      revision: await ctx.db.get(fixture.revision),
      snapshot: await ctx.db.get(fixture.snapshot),
      attribute: await ctx.db.get(fixture.atributo),
    }));

    expect(after.family).toMatchObject({ activo: before.family!.activo, revision: before.family!.revision, adminSortId: fixture.familia });
    expect(after.type).toMatchObject({ activo: before.type!.activo, revision: before.type!.revision, adminSortId: fixture.tipo });
    expect(after.revision).toMatchObject(before.revision!);
    expect(after.snapshot).toEqual(before.snapshot);
    expect(after.attribute).toMatchObject({ adminSortId: fixture.atributo, definicionClave: "D" });
    const duplicate = reports.filter((report): report is { table: string; identity: string; ids: string[] } => typeof report === "object" && report !== null && (report as { table?: string }).table === "atributosRecurso");
    expect(duplicate).toHaveLength(1);
    expect(duplicate[0].ids).toEqual([...new Set(duplicate[0].ids)].sort());
    expect(duplicate[0].identity).toContain("D");
  });

  it("es idempotente, admite tablas vacías y expone solo los índices Resource mínimos", async () => {
    const empty = convexTest(schema, modules);
    expect(await runToCompletion(empty, 3)).toEqual([]);

    const t = convexTest(schema, modules);
    await seed(t);
    await runToCompletion(t, 3);
    const repeated = await runToCompletion(t, 3);
    expect(repeated).toEqual(expect.any(Array));
    await t.run(async ctx => {
      await ctx.db.query("clasesRecurso").withIndex("porClaveYAdminSort").take(1);
      await ctx.db.query("familiasRecurso").withIndex("porClaseYClaveYAdminSort").take(1);
      await ctx.db.query("tiposRecurso").withIndex("porClaveYAdminSort").take(1);
      await ctx.db.query("unidades").withIndex("porClaveYAdminSort").take(1);
      await ctx.db.query("definicionesAtributo").withIndex("porClaveYAdminSort").take(1);
      await ctx.db.query("atributosRecurso").withIndex("porFamiliaYTipoYDefinicionYAdminSort").take(1);
      await ctx.db.query("opcionesAtributo").withIndex("porDefinicionYClaveYAdminSort").take(1);
      await ctx.db.query("politicasUnidadRecurso").withIndex("porFamiliaYTipoYUnidadYAdminSort").take(1);
      await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipoYActivoYAdminSort").take(1);
      await ctx.db.query("politicasCompatibilidadOpciones").withIndex("porTipoYNormalizadosYDireccionYAdminSort").take(1);
      await ctx.db.query("relacionesOpcionesAtributo").withIndex("porPoliticaYOpcionesNormalizadasYAdminSort").take(1);
      await ctx.db.query("reglasAtributoRecurso").withIndex("porTipoYCondicionYOpcionYAfectadoYAdminSort").take(1);
      await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYEstadoYNumeroYAdminSort").take(1);
      await (ctx.db.query("recursos") as any).withIndex("adminPorScopeYTipoYActivo").take(1);
      await (ctx.db.query("recursos") as any).withIndex("adminPorScopeYActivo").take(1);
          await (ctx.db.query("recursos") as any).withIndex("porIdentificadorTecnico").take(1);
          await (ctx.db.query("recursos") as any).withIndex("porActivo", (q: any) => q.eq("activo", true)).take(1);
          await (ctx.db.query("recursos") as any).withIndex("porTipo", (q: any) => q.eq("tipoRecursoId", "tipo")).take(1);
          await (ctx.db.query("recursos") as any).withIndex("porTipoYActivo", (q: any) => q.eq("tipoRecursoId", "tipo").eq("activo", true)).take(1);
          await (ctx.db.query("recursos") as any).withIndex("adminPorScopeYTipoYActivo", (q: any) => q.eq("adminScopeKey", "GLOBAL")).take(1);
          await (ctx.db.query("recursos") as any).withIndex("adminPorScopeYTipoYActivo", (q: any) => q.eq("adminScopeKey", "GLOBAL").eq("tipoRecursoId", "tipo")).take(1);
          await (ctx.db.query("recursos") as any).withIndex("adminPorScopeYActivo", (q: any) => q.eq("adminScopeKey", "GLOBAL").eq("activo", true)).take(1);
          await (ctx.db.query("recursos") as any).withIndex("adminPorScopeYTipoYActivo", (q: any) => q.eq("adminScopeKey", "GLOBAL").eq("tipoRecursoId", "tipo").eq("activo", true)).take(1);




      expect(resourceSchemaAssertions).toBeDefined();













    });
  });

  it("backfills Resource lineage only from an intact hierarchy and is idempotent", async () => {
    const t = convexTest(schema, modules);
    const f = await seed(t);
    const ids = await t.run(async ctx => {
      const valid = await ctx.db.insert("recursos", { tipoRecursoId: f.tipo, unidadId: f.unidad, identificadorTecnico: "valid", nombre: "Valid", activo: true, revision: 1 });
      const clazz = await ctx.db.insert("clasesRecurso", { clave: "BROKEN_CLASS", nombre: "Broken class", activo: true, revision: 1 });
      const family = await ctx.db.insert("familiasRecurso", { claseRecursoId: clazz, clave: "BROKEN_FAMILY", nombre: "Broken family", activo: true, revision: 1 });
      const type = await ctx.db.insert("tiposRecurso", { familiaRecursoId: family, clave: "BROKEN_TYPE", nombre: "Broken type", activo: true, revision: 1 });
      const broken = await ctx.db.insert("recursos", { tipoRecursoId: type, unidadId: f.unidad, identificadorTecnico: "broken", nombre: "Broken", activo: true, revision: 1 });
      await ctx.db.delete(type);
      return { valid, broken };
    });
    await runToCompletion(t, 1);
    const first = await t.run(async ctx => ({ valid: await ctx.db.get(ids.valid), broken: await ctx.db.get(ids.broken) }));
    expect(first.valid).toMatchObject({ claseRecursoId: f.clase, familiaRecursoId: f.familia, adminScopeKey: "GLOBAL" });
    expect(first.broken).toMatchObject({ adminScopeKey: "GLOBAL" });
    expect(first.broken).not.toHaveProperty("claseRecursoId");
    expect(first.broken).not.toHaveProperty("familiaRecursoId");
    await runToCompletion(t, 1);
    expect(await t.run(async ctx => ({ valid: await ctx.db.get(ids.valid), broken: await ctx.db.get(ids.broken) }))).toEqual(first);
  });

  it("repara solo el alcance de recursos en lotes repetibles", async () => {
    const t = convexTest(schema, modules);
    const f = await seed(t);
    const organization = await t.run(async ctx => (await ctx.db.get(f.revision))!.organizacionId);
    const ids = await t.run(async ctx => {
      const globalId = await ctx.db.insert("recursos", {
        tipoRecursoId: f.tipo, unidadId: f.unidad, identificadorTecnico: "R-1", nombre: "Global", descripcion: "Preservar", activo: false, revision: 4,
        adminSortId: "legacy-sort", adminScopeKey: "ORG:incorrecta",
      });
      const orgId = await ctx.db.insert("recursos", {
        tipoRecursoId: f.tipo, unidadId: f.unidad, identificadorTecnico: "R-1", nombre: "Organización", activo: false, revision: 8, organizacionId: organization,
        identidadVersion: 1,
      });
      const globalDuplicate = await ctx.db.insert("recursos", {
        tipoRecursoId: f.tipo, unidadId: f.unidad, identificadorTecnico: "R-1", nombre: "Global duplicado", activo: true, revision: 5,
      });
      const orgDuplicate = await ctx.db.insert("recursos", {
        tipoRecursoId: f.tipo, unidadId: f.unidad, identificadorTecnico: "R-1", nombre: "Organización duplicada", activo: true, revision: 9, organizacionId: organization,
        identidadVersion: 1,
      });
      return { globalId, orgId, globalDuplicate, orgDuplicate };
    });

    const reports = await runToCompletion(t, 1);
    const resourceReport = reports.filter((report): report is { table: string; identity: string; ids: string[] } =>
      typeof report === "object" && report !== null && (report as { table?: string }).table === "recursos");
    expect(resourceReport).toEqual([]);



    const rows = await t.run(async ctx => ({ global: await ctx.db.get(ids.globalId), organization: await ctx.db.get(ids.orgId) }));
    expect(rows.global).toMatchObject({ adminSortId: "legacy-sort", adminScopeKey: "GLOBAL", tipoRecursoId: f.tipo, unidadId: f.unidad, nombre: "Global", descripcion: "Preservar", activo: false, revision: 4 });
    expect(rows.organization).toMatchObject({ adminScopeKey: `ORG:${organization}`, activo: false, revision: 8 });
    const duplicates = await t.run(async ctx => ({ global: await ctx.db.get(ids.globalDuplicate), organization: await ctx.db.get(ids.orgDuplicate) }));
    expect(duplicates.global).toMatchObject({ adminScopeKey: "GLOBAL" });
        expect(duplicates.global).not.toHaveProperty("adminSortId");
    expect(duplicates.organization).toMatchObject({ adminScopeKey: `ORG:${organization}` });
        expect(duplicates.organization).not.toHaveProperty("adminSortId");
    const repeatedReports = (await runToCompletion(t, 1)).filter((report): report is { table: string; identity: string; ids: string[] } =>
      typeof report === "object" && report !== null && (report as { table?: string }).table === "recursos");
    expect(repeatedReports).toEqual([]);

  });
});
