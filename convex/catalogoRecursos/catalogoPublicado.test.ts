import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";

/** Test-only Vite typing; ImportMeta.glob is not included in the root TypeScript config. */
declare global {
  interface ImportMeta {
    glob: (path: string) => Record<string, () => Promise<unknown>>;
  }
}
const generated = import.meta.glob("../_generated/**/*.{ts,js}");
const local = import.meta.glob("./*.{ts,js}");
const modules = { ...generated, ...Object.fromEntries(Object.entries(local).map(([p, m]) => [`../catalogoRecursos/${p.slice(2)}`, m])) };

type Fixture = {
  claseRecursoId: Id<"clasesRecurso">;
  familiaRecursoId: Id<"familiasRecurso">;
  tipoRecursoId: Id<"tiposRecurso">;
  unidadId: Id<"unidades">;
  calibreDefinicionId: Id<"definicionesAtributo">;
  materialDefinicionId: Id<"definicionesAtributo">;
  calibreAtributoId: Id<"atributosRecurso">;
  materialAtributoId: Id<"atributosRecurso">;
  doceOpcionId: Id<"opcionesAtributo">;
  cobreOpcionId: Id<"opcionesAtributo">;
};

const crearFixture = (t: ReturnType<typeof convexTest>) => t.run(async ctx => {
  const claseRecursoId = await ctx.db.insert("clasesRecurso", { clave: "TEST_MATERIAL", nombre: "Material", activo: true, revision: 1 });
  const familiaRecursoId = await ctx.db.insert("familiasRecurso", { claseRecursoId, clave: "TEST_CONDUCTORES", nombre: "Conductores", activo: true, revision: 1 });
  const tipoRecursoId = await ctx.db.insert("tiposRecurso", { familiaRecursoId, clave: "TEST_CABLE", nombre: "Cable", activo: true, revision: 1 });
  const unidadId = await ctx.db.insert("unidades", { clave: "TEST_M", nombre: "Metro", simbolo: "m", activo: true, revision: 1 });
  await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId, tipoRecursoId, unidadId, principal: true, activo: true, revision: 1 });
  const calibreDefinicionId = await ctx.db.insert("definicionesAtributo", { clave: "TEST_CALIBRE", nombre: "Calibre", tipoDato: "OPCION", activo: true, revision: 1 });
  const materialDefinicionId = await ctx.db.insert("definicionesAtributo", { clave: "TEST_MATERIAL", nombre: "Material", tipoDato: "OPCION", activo: true, revision: 1 });
  const calibreAtributoId = await ctx.db.insert("atributosRecurso", { familiaRecursoId, tipoRecursoId, definicionAtributoId: calibreDefinicionId, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true, revision: 1 });
  const materialAtributoId = await ctx.db.insert("atributosRecurso", { familiaRecursoId, tipoRecursoId, definicionAtributoId: materialDefinicionId, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 2, activo: true, revision: 1 });
  await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId, tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: calibreAtributoId }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: materialAtributoId }], separador: " · ", activo: true, revision: 1 });
  const doceOpcionId = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: calibreDefinicionId, clave: "TEST_12", nombre: "12", activo: true, revision: 1 });
  await ctx.db.insert("opcionesAtributo", { definicionAtributoId: calibreDefinicionId, clave: "TEST_14", nombre: "14", activo: true, revision: 1 });
  const cobreOpcionId = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: materialDefinicionId, clave: "TEST_COBRE", nombre: "Cobre", activo: true, revision: 1 });
  await ctx.db.insert("opcionesAtributo", { definicionAtributoId: materialDefinicionId, clave: "TEST_ALUMINIO", nombre: "Aluminio", activo: true, revision: 1 });
  return { claseRecursoId, familiaRecursoId, tipoRecursoId, unidadId, calibreDefinicionId, materialDefinicionId, calibreAtributoId, materialAtributoId, doceOpcionId, cobreOpcionId };
});

describe("catálogo publicado", () => {
  it("es idempotente y resuelve por organización", async () => {
    const t = convexTest(schema, modules);
    await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const first = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    expect(await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).toEqual(first);
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerUltimaRevisionPublicada, { organizacionClave: "ORG_A" }))?.hashContenido).toBe(first.hashContenido);
  });

  it("aísla organizaciones y conserva snapshots anteriores al cambiar etiquetas", async () => {
    const t = convexTest(schema, modules);
    const seeded = await crearFixture(t);
    const orgA = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const orgB = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_B", nombre: "B" });
    const first = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: orgA });
    const other = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: orgB });
    expect(other.revisionId).not.toBe(first.revisionId);
    expect(await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: other.revisionId, tipoClave: "TEST_CABLE" })).toBeNull();
    await t.run(async ctx => ctx.db.patch(seeded.tipoRecursoId, { nombre: "Etiqueta nueva" }));
    const second = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: orgA });
    expect(second.numero).toBe(2);
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: first.revisionId, tipoClave: "TEST_CABLE" }))?.snapshot.tipo.nombre).toContain("Cable");
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: second.revisionId, tipoClave: "TEST_CABLE" }))?.snapshot.tipo.nombre).toBe("Etiqueta nueva");
  });

  it("rechaza unidad natural ausente o con múltiples principales", async () => {
    const t = convexTest(schema, modules);
    const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      const policies = await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).collect();
      for (const policy of policies) await ctx.db.delete(policy._id);
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una");
    await t.run(async ctx => {
      const unitId = await ctx.db.insert("unidades", { clave: "TEST_CM", nombre: "Centímetro", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, unidadId: unitId, principal: true, activo: true, revision: 1 });
      const secondUnitId = await ctx.db.insert("unidades", { clave: "TEST_KM", nombre: "Kilómetro", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, unidadId: secondUnitId, principal: true, activo: true, revision: 1 });
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una");
  });

  it("aplica overrides, limita atributos y emite reglas y relaciones válidas", async () => {
    const t = convexTest(schema, modules);
    const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      const typeUnit = await ctx.db.insert("unidades", { clave: "TEST_TYPE", nombre: "Unidad tipo", activo: true, revision: 1 });
      const policy = await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).first();
      if (!policy) throw new Error("missing test policy");
      await ctx.db.patch(policy._id, { principal: false });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, unidadId: seeded.unidadId, principal: true, activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, unidadId: typeUnit, principal: true, activo: true, revision: 1 });
      const foreignClass = await ctx.db.insert("clasesRecurso", { clave: "TEST_FOREIGN_CLASS", nombre: "Foreign", activo: true, revision: 1 });
      const foreignFamily = await ctx.db.insert("familiasRecurso", { claseRecursoId: foreignClass, clave: "TEST_FOREIGN_FAMILY", nombre: "Foreign", activo: true, revision: 1 });
      const foreignType = await ctx.db.insert("tiposRecurso", { familiaRecursoId: foreignFamily, clave: "TEST_FOREIGN_TYPE", nombre: "Foreign", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, unidadId: seeded.unidadId, principal: true, activo: true, revision: 1 });
      const foreignDefinition = await ctx.db.insert("definicionesAtributo", { clave: "TEST_FOREIGN_ATTRIBUTE", nombre: "Foreign", tipoDato: "TEXTO", activo: true, revision: 1 });
      const foreignAttribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, definicionAtributoId: foreignDefinition, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true, revision: 1 });
      await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: foreignType, tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: foreignAttribute }], separador: " · ", activo: true, revision: 1 });
      const definition = await ctx.db.insert("definicionesAtributo", { clave: "TEST_OVERRIDE", nombre: "Override", tipoDato: "TEXTO", activo: true, revision: 1 });
      await ctx.db.insert("atributosRecurso", { familiaRecursoId: seeded.familiaRecursoId, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 3, activo: true, revision: 1 });
      const typeAttribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, definicionAtributoId: definition, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 4, activo: true, revision: 1 });
      const excludedDefinition = await ctx.db.insert("definicionesAtributo", { clave: "TEST_EXCLUDED", nombre: "Excluded", tipoDato: "OPCION", activo: true, revision: 1 });
      const excludedAttribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: seeded.familiaRecursoId, definicionAtributoId: excludedDefinition, aplicabilidad: "FORBIDDEN", participaIdentidad: false, orden: 5, activo: true, revision: 1 });
      const excludedOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: excludedDefinition, clave: "TEST_EXCLUDED_OPTION", nombre: "Excluded", activo: true, revision: 1 });
      await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: seeded.tipoRecursoId, atributoCondicionId: excludedAttribute, atributoAfectadoId: typeAttribute, aplicabilidad: "REQUIRED", activo: true, revision: 1 });
      const inactiveOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: seeded.materialDefinicionId, clave: "TEST_INACTIVE", nombre: "Inactive", activo: false, revision: 1 });
      const policyId = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: seeded.tipoRecursoId, atributoOrigenId: seeded.calibreAtributoId, atributoDestinoId: seeded.materialAtributoId, modo: "ALLOWLIST", direccion: "DIRECTIONAL", activo: true, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: seeded.cobreOpcionId, politicaCompatibilidadId: policyId, activo: true, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: inactiveOption, tipoRelacion: "INACTIVE", activo: false, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: excludedOption, tipoRelacion: "EXCLUDED", activo: false, revision: 1 });
    });
    const revision = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    const snapshot = (await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", tipoClave: "TEST_CABLE" }))!.snapshot;
    expect(snapshot.unidadNatural.clave).toBe("TEST_TYPE");
    expect(snapshot.atributos.find(attribute => attribute.clave === "TEST_OVERRIDE")).toMatchObject({ aplicabilidad: "REQUIRED", participaIdentidad: true });
    expect(snapshot.atributos.some(attribute => attribute.clave === "TEST_EXCLUDED")).toBe(false);
    expect(snapshot.atributos.some(attribute => attribute.clave === "TEST_FOREIGN_ATTRIBUTE")).toBe(false);
    expect(snapshot.reglas).toEqual([]);
    expect(snapshot.politicasCompatibilidad).toEqual([{ atributoOrigenClave: "TEST_CALIBRE", atributoDestinoClave: "TEST_MATERIAL", modo: "ALLOWLIST", direccion: "DIRECTIONAL", pares: [{ origenOpcionClave: "TEST_12", destinoOpcionClave: "TEST_COBRE" }] }]);
    expect(revision.hashContenido).toBeTruthy();
  });

  const rejectionTests = [
    ["rechaza relación activa sin política", async (t: ReturnType<typeof convexTest>, seeded: Fixture) => {
      await t.run(async ctx => { await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: seeded.cobreOpcionId, activo: true, revision: 1 }); });
      return "política de compatibilidad activa";
    }],
    ["rechaza relación activa ligada a política inactiva", async (t: ReturnType<typeof convexTest>, seeded: Fixture) => {
      await t.run(async ctx => { const policyId = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: seeded.tipoRecursoId, atributoOrigenId: seeded.calibreAtributoId, atributoDestinoId: seeded.materialAtributoId, modo: "ALLOWLIST", direccion: "DIRECTIONAL", activo: false, revision: 1 }); await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: seeded.cobreOpcionId, politicaCompatibilidadId: policyId, activo: true, revision: 1 }); });
      return "política de compatibilidad activa";
    }],
  ] as const;

  for (const [name, arrange] of rejectionTests) it(name, async () => {
    const t = convexTest(schema, modules);
    const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const message = await arrange(t, seeded);
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow(message);
  });

  it("rechaza opción ligada fuera de los endpoints declarados", async () => {
    const t = convexTest(schema, modules); const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => { const definitionId = await ctx.db.insert("definicionesAtributo", { clave: "TEST_FOREIGN_OPTION_ATTRIBUTE", nombre: "Foreign option", tipoDato: "OPCION", activo: true, revision: 1 }); const optionId = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: definitionId, clave: "TEST_FOREIGN_OPTION", nombre: "Foreign", activo: true, revision: 1 }); const policyId = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: seeded.tipoRecursoId, atributoOrigenId: seeded.calibreAtributoId, atributoDestinoId: seeded.materialAtributoId, modo: "ALLOWLIST", direccion: "DIRECTIONAL", activo: true, revision: 1 }); await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: optionId, politicaCompatibilidadId: policyId, activo: true, revision: 1 }); });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("opción fuera de endpoint");
  });

  it("rechaza tipo activo sin política de presentación", async () => {
    const t = convexTest(schema, modules); const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => { for (const policy of await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).collect()) await ctx.db.delete(policy._id); });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una política de presentación");
  });

  it("rechaza múltiples políticas de presentación activas", async () => {
    const t = convexTest(schema, modules); const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => { await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: seeded.tipoRecursoId, tokens: [{ tipo: "TYPE_NAME" }], separador: " · ", activo: true, revision: 2 }); });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una política de presentación");
  });

  it("rechaza token de atributo no efectivo", async () => {
    const t = convexTest(schema, modules); const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const foreignAttribute = await t.run(async ctx => { const foreignClass = await ctx.db.insert("clasesRecurso", { clave: "TEST_FOREIGN_CLASS", nombre: "Foreign", activo: true, revision: 1 }); const foreignFamily = await ctx.db.insert("familiasRecurso", { claseRecursoId: foreignClass, clave: "TEST_FOREIGN_FAMILY", nombre: "Foreign", activo: true, revision: 1 }); const foreignType = await ctx.db.insert("tiposRecurso", { familiaRecursoId: foreignFamily, clave: "TEST_FOREIGN_TYPE", nombre: "Foreign", activo: true, revision: 1 }); await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, unidadId: seeded.unidadId, principal: true, activo: true, revision: 1 }); const definition = await ctx.db.insert("definicionesAtributo", { clave: "TEST_FOREIGN_TOKEN", nombre: "Foreign", tipoDato: "TEXTO", activo: true, revision: 1 }); const attribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 9, activo: true, revision: 1 }); await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: foreignType, tokens: [{ tipo: "TYPE_NAME" }], separador: " · ", activo: true, revision: 1 }); return attribute; });
    await t.run(async ctx => { const policy = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).first(); if (!policy) throw new Error("missing presentation policy"); await ctx.db.patch(policy._id, { tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: foreignAttribute }] }); });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("atributo no efectivo");
  });

  it("cambiar la política crea revisión y conserva inmutable el snapshot anterior", async () => {
    const t = convexTest(schema, modules); const seeded = await crearFixture(t);
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const first = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    await t.run(async ctx => { const policy = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).first(); if (!policy) throw new Error("missing presentation policy"); await ctx.db.patch(policy._id, { separador: " / " }); });
    const second = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    expect(second.revisionId).not.toBe(first.revisionId); expect(second.hashContenido).not.toBe(first.hashContenido);
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: first.revisionId, tipoClave: "TEST_CABLE" }))!.snapshot.presentacionCanonica.separador).toBe(" · ");
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: second.revisionId, tipoClave: "TEST_CABLE" }))!.snapshot.presentacionCanonica.separador).toBe(" / ");
  });
});
