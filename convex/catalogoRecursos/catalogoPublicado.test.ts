import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api, internal } from "../_generated/api";
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

describe("catálogo publicado", () => {
  it("es idempotente y resuelve por organización", async () => {
    const t = convexTest(schema, modules);
    await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const first = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    expect(await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).toEqual(first);
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerUltimaRevisionPublicada, { organizacionClave: "ORG_A" }))?.hashContenido).toBe(first.hashContenido);
  });

  it("aísla organizaciones y conserva snapshots anteriores al cambiar etiquetas", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const orgA = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const orgB = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_B", nombre: "B" });
    const first = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: orgA });
    const other = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: orgB });
    expect(other.revisionId).not.toBe(first.revisionId);
    expect(await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: other.revisionId, tipoClave: "DEMO_CABLE" })).toBeNull();
    await t.run(async ctx => ctx.db.patch(seeded.tipoRecursoId, { nombre: "Etiqueta nueva" }));
    const second = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: orgA });
    expect(second.numero).toBe(2);
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: first.revisionId, tipoClave: "DEMO_CABLE" }))?.snapshot.tipo.nombre).toContain("cable");
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: second.revisionId, tipoClave: "DEMO_CABLE" }))?.snapshot.tipo.nombre).toBe("Etiqueta nueva");
  });

  it("rechaza unidad natural ausente o con múltiples principales", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      const policies = await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).collect();
      for (const policy of policies) await ctx.db.delete(policy._id);
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una");
    await t.run(async ctx => {
      const unitId = await ctx.db.insert("unidades", { clave: "DEMO_CM", nombre: "Centímetro", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, unidadId: unitId, principal: true, activo: true, revision: 1 });
      const secondUnitId = await ctx.db.insert("unidades", { clave: "DEMO_KM", nombre: "Kilómetro", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, unidadId: secondUnitId, principal: true, activo: true, revision: 1 });
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una");
  });

  it("aplica overrides, limita atributos y emite reglas y relaciones válidas", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });

    await t.run(async ctx => {
      const typeUnit = await ctx.db.insert("unidades", { clave: "DEMO_TYPE", nombre: "Unidad tipo", activo: true, revision: 1 });
      const policy = await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).first();
      if (!policy) throw new Error("missing demo policy");
      await ctx.db.patch(policy._id, { principal: false });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, unidadId: seeded.unidadId, principal: true, activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, unidadId: typeUnit, principal: true, activo: true, revision: 1 });

      const foreignClass = await ctx.db.insert("clasesRecurso", { clave: "DEMO_FOREIGN_CLASS", nombre: "Foreign", activo: true, revision: 1 });
      const foreignFamily = await ctx.db.insert("familiasRecurso", { claseRecursoId: foreignClass, clave: "DEMO_FOREIGN_FAMILY", nombre: "Foreign", activo: true, revision: 1 });
      const foreignType = await ctx.db.insert("tiposRecurso", { familiaRecursoId: foreignFamily, clave: "DEMO_FOREIGN_TYPE", nombre: "Foreign", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, unidadId: seeded.unidadId, principal: true, activo: true, revision: 1 });
      const foreignDefinition = await ctx.db.insert("definicionesAtributo", { clave: "DEMO_FOREIGN_ATTRIBUTE", nombre: "Foreign", tipoDato: "TEXTO", activo: true, revision: 1 });
      const foreignAttribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, definicionAtributoId: foreignDefinition, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true, revision: 1 });
      await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: foreignType, tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: foreignAttribute }], separador: " · ", activo: true, revision: 1 });

      const definition = await ctx.db.insert("definicionesAtributo", { clave: "DEMO_OVERRIDE", nombre: "Override", tipoDato: "TEXTO", activo: true, revision: 1 });
      await ctx.db.insert("atributosRecurso", { familiaRecursoId: seeded.familiaRecursoId, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 3, activo: true, revision: 1 });
      const typeAttribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, definicionAtributoId: definition, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 4, activo: true, revision: 1 });
      const excludedDefinition = await ctx.db.insert("definicionesAtributo", { clave: "DEMO_EXCLUDED", nombre: "Excluded", tipoDato: "OPCION", activo: true, revision: 1 });
      const excludedAttribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: seeded.familiaRecursoId, definicionAtributoId: excludedDefinition, aplicabilidad: "FORBIDDEN", participaIdentidad: false, orden: 5, activo: true, revision: 1 });
      const excludedOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: excludedDefinition, clave: "DEMO_EXCLUDED_OPTION", nombre: "Excluded", activo: true, revision: 1 });
      await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: seeded.tipoRecursoId, atributoCondicionId: excludedAttribute, atributoAfectadoId: typeAttribute, aplicabilidad: "REQUIRED", activo: true, revision: 1 });

      const inactiveOption = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: seeded.materialDefinicionId, clave: "DEMO_INACTIVE", nombre: "Inactive", activo: false, revision: 1 });
      const policyId = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: seeded.tipoRecursoId, atributoOrigenId: seeded.calibreAtributoId, atributoDestinoId: seeded.materialAtributoId, modo: "ALLOWLIST", direccion: "DIRECTIONAL", activo: true, revision: 1 });
       await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: seeded.cobreOpcionId, politicaCompatibilidadId: policyId, activo: true, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: inactiveOption, tipoRelacion: "INACTIVE", activo: false, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: excludedOption, tipoRelacion: "EXCLUDED", activo: false, revision: 1 });
    });

    const revision = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    const snapshot = (await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", tipoClave: "DEMO_CABLE" }))!.snapshot;
    expect(snapshot.unidadNatural.clave).toBe("DEMO_TYPE");
    expect(snapshot.atributos.find(attribute => attribute.clave === "DEMO_OVERRIDE")).toMatchObject({ aplicabilidad: "REQUIRED", participaIdentidad: true });
    expect(snapshot.atributos.some(attribute => attribute.clave === "DEMO_EXCLUDED")).toBe(false);
    expect(snapshot.atributos.some(attribute => attribute.clave === "DEMO_FOREIGN_ATTRIBUTE")).toBe(false);
    expect(snapshot.reglas).toEqual([]);
    expect(snapshot.politicasCompatibilidad).toEqual([{ atributoOrigenClave: "DEMO_CALIBRE", atributoDestinoClave: "DEMO_MATERIAL", modo: "ALLOWLIST", direccion: "DIRECTIONAL", pares: [{ origenOpcionClave: "DEMO_12", destinoOpcionClave: "DEMO_COBRE" }] }]);
    expect(revision.hashContenido).toBeTruthy();
  });

  it("rechaza relación activa sin política", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: seeded.cobreOpcionId, activo: true, revision: 1 });
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("política de compatibilidad activa");
  });

  it("rechaza relación activa ligada a política inactiva", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      const policyId = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: seeded.tipoRecursoId, atributoOrigenId: seeded.calibreAtributoId, atributoDestinoId: seeded.materialAtributoId, modo: "ALLOWLIST", direccion: "DIRECTIONAL", activo: false, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: seeded.cobreOpcionId, politicaCompatibilidadId: policyId, activo: true, revision: 1 });
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("política de compatibilidad activa");
  });

  it("rechaza opción ligada fuera de los endpoints declarados", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      const definitionId = await ctx.db.insert("definicionesAtributo", { clave: "DEMO_FOREIGN_OPTION_ATTRIBUTE", nombre: "Foreign option", tipoDato: "OPCION", activo: true, revision: 1 });
      const optionId = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: definitionId, clave: "DEMO_FOREIGN_OPTION", nombre: "Foreign", activo: true, revision: 1 });
      const policyId = await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: seeded.tipoRecursoId, atributoOrigenId: seeded.calibreAtributoId, atributoDestinoId: seeded.materialAtributoId, modo: "ALLOWLIST", direccion: "DIRECTIONAL", activo: true, revision: 1 });
      await ctx.db.insert("relacionesOpcionesAtributo", { opcionOrigenId: seeded.doceOpcionId, opcionDestinoId: optionId, politicaCompatibilidadId: policyId, activo: true, revision: 1 });
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("opción fuera de endpoint");
  });

  it("rechaza tipo activo sin política de presentación", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      const policies = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).collect();
      for (const policy of policies) await ctx.db.delete(policy._id);
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una política de presentación");
  });

  it("rechaza múltiples políticas de presentación activas", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    await t.run(async ctx => {
      await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: seeded.tipoRecursoId, tokens: [{ tipo: "TYPE_NAME" }], separador: " · ", activo: true, revision: 2 });
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("exactamente una política de presentación");
  });

  it("rechaza token de atributo no efectivo", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const foreignAttribute = await t.run(async ctx => {
      const foreignClass = await ctx.db.insert("clasesRecurso", { clave: "FOREIGN_CLASS", nombre: "Foreign", activo: true, revision: 1 });
      const foreignFamily = await ctx.db.insert("familiasRecurso", { claseRecursoId: foreignClass, clave: "FOREIGN_FAMILY", nombre: "Foreign", activo: true, revision: 1 });
      const foreignType = await ctx.db.insert("tiposRecurso", { familiaRecursoId: foreignFamily, clave: "FOREIGN_TYPE", nombre: "Foreign", activo: true, revision: 1 });
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, unidadId: seeded.unidadId, principal: true, activo: true, revision: 1 });
      const definition = await ctx.db.insert("definicionesAtributo", { clave: "FOREIGN_TOKEN", nombre: "Foreign", tipoDato: "TEXTO", activo: true, revision: 1 });
      const attribute = await ctx.db.insert("atributosRecurso", { familiaRecursoId: foreignFamily, tipoRecursoId: foreignType, definicionAtributoId: definition, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 9, activo: true, revision: 1 });
      await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: foreignType, tokens: [{ tipo: "TYPE_NAME" }], separador: " · ", activo: true, revision: 1 });
      return attribute;
    });
    await t.run(async ctx => {
      const policy = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).first();
      if (!policy) throw new Error("missing presentation policy");
      await ctx.db.patch(policy._id, { tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: foreignAttribute }] });
    });
    await expect(t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org })).rejects.toThrow("atributo no efectivo");
  });

  it("cambiar la política crea revisión y conserva inmutable el snapshot anterior", async () => {
    const t = convexTest(schema, modules);
    const seeded = await t.mutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const org = await t.mutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "ORG_A", nombre: "A" });
    const first = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    await t.run(async ctx => {
      const policy = await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", query => query.eq("tipoRecursoId", seeded.tipoRecursoId)).first();
      if (!policy) throw new Error("missing presentation policy");
      await ctx.db.patch(policy._id, { separador: " / " });
    });
    const second = await t.mutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId: org });
    expect(second.revisionId).not.toBe(first.revisionId);
    expect(second.hashContenido).not.toBe(first.hashContenido);
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: first.revisionId, tipoClave: "DEMO_CABLE" }))!.snapshot.presentacionCanonica.separador).toBe(" · ");
    expect((await t.query(api.catalogoRecursos.catalogoPublicado.obtenerSnapshotTipo, { organizacionClave: "ORG_A", revisionId: second.revisionId, tipoClave: "DEMO_CABLE" }))!.snapshot.presentacionCanonica.separador).toBe(" / ");
  });
});
