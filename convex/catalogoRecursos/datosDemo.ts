import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { eliminarAliasesRecurso } from "./identidadesRecurso";

const keys = {
  clase: "DEMO_MATERIAL",
  familia: "DEMO_CONDUCTORES",
  tipo: "DEMO_CABLE",
  unidad: "DEMO_M",
  calibre: "DEMO_CALIBRE",
  material: "DEMO_MATERIAL",
  doce: "DEMO_12",
  catorce: "DEMO_14",
  cobre: "DEMO_COBRE",
  aluminio: "DEMO_ALUMINIO",
};
const identidad = "v1|DEMO_MATERIAL|DEMO_CONDUCTORES|DEMO_CABLE|DEMO_CALIBRE=DEMO_12|DEMO_MATERIAL=DEMO_COBRE";

const seedResult = v.object({
  claseRecursoId: v.id("clasesRecurso"),
  familiaRecursoId: v.id("familiasRecurso"),
  tipoRecursoId: v.id("tiposRecurso"),
  unidadId: v.id("unidades"),
  calibreDefinicionId: v.id("definicionesAtributo"),
  materialDefinicionId: v.id("definicionesAtributo"),
  calibreAtributoId: v.id("atributosRecurso"),
  materialAtributoId: v.id("atributosRecurso"),
  doceOpcionId: v.id("opcionesAtributo"),
  cobreOpcionId: v.id("opcionesAtributo"),
});

export const sembrar = internalMutation({
  args: {},
  returns: seedResult,
  handler: async (ctx) => {
    const clases = await ctx.db.query("clasesRecurso").withIndex("porClave", q => q.eq("clave", keys.clase)).collect();
    const familias = clases[0]
      ? await ctx.db.query("familiasRecurso").withIndex("porClaseYClave", q => q.eq("claseRecursoId", clases[0]._id).eq("clave", keys.familia)).collect()
      : [];
    const tipos = familias[0]
      ? await ctx.db.query("tiposRecurso").withIndex("porFamiliaYClave", q => q.eq("familiaRecursoId", familias[0]._id).eq("clave", keys.tipo)).collect()
      : [];
    const unidades = await ctx.db.query("unidades").withIndex("porClave", q => q.eq("clave", keys.unidad)).collect();
    const definiciones = await ctx.db.query("definicionesAtributo").withIndex("porClave", q => q.eq("clave", keys.calibre)).collect();
    const definicionesMaterial = await ctx.db.query("definicionesAtributo").withIndex("porClave", q => q.eq("clave", keys.material)).collect();
    const definicionIds = new Set([...definiciones, ...definicionesMaterial].map(d => d._id));
    const familiaIds = new Set(familias.map(f => f._id));
    const tipoIds = new Set(tipos.map(t => t._id));
    const opcionRows = [];
    for (const definicionId of definicionIds) {
      opcionRows.push(...await ctx.db.query("opcionesAtributo").withIndex("porDefinicion", q => q.eq("definicionAtributoId", definicionId)).collect());
    }
    const opcionIds = new Set(opcionRows.map(o => o._id));
    const atributos = [];
    for (const familiaId of familiaIds) {
      atributos.push(...await ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familiaId)).collect());
    }
    const atributoIds = new Set(atributos.map(a => a._id));
    for (const tipoId of tipoIds) {
      for (const politica of await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", q => q.eq("tipoRecursoId", tipoId)).collect()) await ctx.db.delete(politica._id);
          const reglas = await ctx.db.query("reglasAtributoRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", tipoId)).collect();
      for (const regla of reglas) await ctx.db.delete(regla._id);
    }
    const relationIds = new Set<Id<"relacionesOpcionesAtributo">>();
    for (const opcionId of opcionIds) {
      for (const relacion of await ctx.db.query("relacionesOpcionesAtributo").withIndex("porOrigen", q => q.eq("opcionOrigenId", opcionId)).collect()) relationIds.add(relacion._id);
      for (const relacion of await ctx.db.query("relacionesOpcionesAtributo").withIndex("porDestino", q => q.eq("opcionDestinoId", opcionId)).collect()) relationIds.add(relacion._id);
    }
    for (const relationId of relationIds) await ctx.db.delete(relationId);
    for (const tipoId of tipoIds) {
      for (const politica of await ctx.db.query("politicasUnidadRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", tipoId)).collect()) await ctx.db.delete(politica._id);
    }
    for (const familiaId of familiaIds) {
      for (const politica of await ctx.db.query("politicasUnidadRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familiaId)).collect()) await ctx.db.delete(politica._id);
    }
    const recursos = tipoIds.size === 1
      ? await ctx.db.query("recursos").withIndex("porTipo", q => q.eq("tipoRecursoId", [...tipoIds][0])).collect()
      : [];
    for (const recurso of recursos) {
      await eliminarAliasesRecurso(ctx, recurso._id);
      for (const valor of await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", recurso._id)).collect()) await ctx.db.delete(valor._id);
      await ctx.db.delete(recurso._id);
    }
    for (const atributoId of atributoIds) await ctx.db.delete(atributoId);
    for (const opcion of opcionRows) await ctx.db.delete(opcion._id);
    for (const definicion of [...definiciones, ...definicionesMaterial]) await ctx.db.delete(definicion._id);
    for (const tipo of tipos) await ctx.db.delete(tipo._id);
    for (const familia of familias) await ctx.db.delete(familia._id);
    for (const clase of clases) await ctx.db.delete(clase._id);
    for (const unidad of unidades) await ctx.db.delete(unidad._id);

    const claseRecursoId = await ctx.db.insert("clasesRecurso", { clave: keys.clase, nombre: "Demo sintética: material", descripcion: "Datos DEMO sintéticos", activo: true, revision: 1 });
    const familiaRecursoId = await ctx.db.insert("familiasRecurso", { claseRecursoId, clave: keys.familia, nombre: "Demo sintética: conductores", activo: true, revision: 1 });
    const tipoRecursoId = await ctx.db.insert("tiposRecurso", { familiaRecursoId, clave: keys.tipo, nombre: "Demo sintética: cable", activo: true, revision: 1 });
    const unidadId = await ctx.db.insert("unidades", { clave: keys.unidad, nombre: "Demo sintética: metro", simbolo: "m", activo: true, revision: 1 });
    await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId, tipoRecursoId, unidadId, principal: true, activo: true, revision: 1 });
    const calibreDefinicionId = await ctx.db.insert("definicionesAtributo", { clave: keys.calibre, nombre: "Demo sintética: calibre", tipoDato: "OPCION", activo: true, revision: 1 });
    const materialDefinicionId = await ctx.db.insert("definicionesAtributo", { clave: keys.material, nombre: "Demo sintética: material", tipoDato: "OPCION", activo: true, revision: 1 });
    const calibreAtributoId = await ctx.db.insert("atributosRecurso", { familiaRecursoId, tipoRecursoId, definicionAtributoId: calibreDefinicionId, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true, revision: 1 });
    const materialAtributoId = await ctx.db.insert("atributosRecurso", { familiaRecursoId, tipoRecursoId, definicionAtributoId: materialDefinicionId, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 2, activo: true, revision: 1 });
     await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId, tokens: [{ tipo: "TYPE_NAME" }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: calibreAtributoId }, { tipo: "ATTRIBUTE_VALUE", atributoRecursoId: materialAtributoId }], separador: " · ", activo: true, revision: 1 });
    const doceOpcionId = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: calibreDefinicionId, clave: keys.doce, nombre: "Demo sintética: 12", activo: true, revision: 1 });
    await ctx.db.insert("opcionesAtributo", { definicionAtributoId: calibreDefinicionId, clave: keys.catorce, nombre: "Demo sintética: 14", activo: true, revision: 1 });
    const cobreOpcionId = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: materialDefinicionId, clave: keys.cobre, nombre: "Demo sintética: cobre", activo: true, revision: 1 });
    await ctx.db.insert("opcionesAtributo", { definicionAtributoId: materialDefinicionId, clave: keys.aluminio, nombre: "Demo sintética: aluminio", activo: true, revision: 1 });
    return { claseRecursoId, familiaRecursoId, tipoRecursoId, unidadId, calibreDefinicionId, materialDefinicionId, calibreAtributoId, materialAtributoId, doceOpcionId, cobreOpcionId };
  },
});

const evidence = v.object({
  synthetic: v.literal(true),
  identificadorTecnico: v.string(),
  revisiones: v.array(v.number()),
  estados: v.array(v.boolean()),
  consultas: v.object({ clases: v.number(), familias: v.number(), tipos: v.number(), unidades: v.number(), atributos: v.number(), opciones: v.number(), reglas: v.number() }),
});

export const comprobar = internalAction({
  args: {},
  returns: evidence,
  handler: async (ctx): Promise<{
    synthetic: true;
    identificadorTecnico: string;
    revisiones: number[];
    estados: boolean[];
    consultas: { clases: number; familias: number; tipos: number; unidades: number; atributos: number; opciones: number; reglas: number };
  }> => {
    const seeded = await ctx.runMutation(internal.catalogoRecursos.datosDemo.sembrar, {});
    const organizacionId = await ctx.runMutation(internal.catalogoRecursos.catalogoPublicado.asegurarOrganizacion, { clave: "DEMO_GARFEX", nombre: "Demo Gárfex" });
    await ctx.runMutation(internal.catalogoRecursos.catalogoPublicado.publicarCatalogo, { organizacionId });
    const valores = [
      { atributoRecursoId: seeded.calibreAtributoId, valor: keys.doce, opcionAtributoId: seeded.doceOpcionId },
      { atributoRecursoId: seeded.materialAtributoId, valor: keys.cobre, opcionAtributoId: seeded.cobreOpcionId },
    ];
    const creado = await ctx.runMutation(api.catalogoRecursos.recursos.crearRecurso, { organizacionId, claseRecursoId: seeded.claseRecursoId, familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId, unidadId: seeded.unidadId, nombre: "Demo sintética: cable", descripcion: "No es un dato real de catálogo", valores });
    const obtenido = await ctx.runQuery(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: creado._id });
    const desactivado = await ctx.runMutation(api.catalogoRecursos.recursos.desactivarRecurso, { recursoId: creado._id, revisionEsperada: creado.revision });
    const durante = await ctx.runQuery(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: creado._id });
    const reactivado = await ctx.runMutation(api.catalogoRecursos.recursos.reactivarRecurso, { recursoId: creado._id, revisionEsperada: desactivado.revision });
    const final = await ctx.runQuery(api.catalogoRecursos.recursos.obtenerRecurso, { recursoId: creado._id });
    const [clases, familias, tipos, unidades, atributos, opciones, reglas] = await Promise.all([
      ctx.runQuery(api.catalogoRecursos.catalogo.consultarClases, {}),
      ctx.runQuery(api.catalogoRecursos.catalogo.consultarFamiliasDeClase, { claseRecursoId: seeded.claseRecursoId }),
      ctx.runQuery(api.catalogoRecursos.catalogo.consultarTiposDeFamilia, { familiaRecursoId: seeded.familiaRecursoId }),
      ctx.runQuery(api.catalogoRecursos.catalogo.consultarUnidadesValidas, { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId }),
      ctx.runQuery(api.catalogoRecursos.catalogo.consultarAtributosAplicables, { familiaRecursoId: seeded.familiaRecursoId, tipoRecursoId: seeded.tipoRecursoId }),
      ctx.runQuery(api.catalogoRecursos.catalogo.consultarOpcionesPermitidas, { definicionAtributoId: seeded.calibreDefinicionId }),
      ctx.runQuery(api.catalogoRecursos.catalogo.obtenerReglasValidacion, { tipoRecursoId: seeded.tipoRecursoId }),
    ]);
    return { synthetic: true, identificadorTecnico: final?.identificadorTecnico ?? obtenido!.identificadorTecnico, revisiones: [creado.revision, desactivado.revision, reactivado.revision], estados: [creado.activo, durante?.activo ?? false, final?.activo ?? false], consultas: { clases: clases.length, familias: familias.length, tipos: tipos.length, unidades: unidades.length, atributos: atributos.length, opciones: opciones.length, reglas: reglas.length } };
  },
});
