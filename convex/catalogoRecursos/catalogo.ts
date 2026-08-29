import { query } from "../_generated/server";
import { v } from "convex/values";

const clase = v.object({
  id: v.string(),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const familia = v.object({
  id: v.string(),
  claseRecursoId: v.string(),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const tipo = v.object({
  id: v.string(),
  familiaRecursoId: v.string(),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const unidad = v.object({
  id: v.string(),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  simbolo: v.optional(v.string()),
  principal: v.boolean(),
});

const tipoDato = v.union(
  v.literal("TEXTO"),
  v.literal("NUMERO"),
  v.literal("BOOLEANO"),
  v.literal("OPCION"),
);

const aplicabilidad = v.union(
  v.literal("REQUIRED"),
  v.literal("OPTIONAL"),
  v.literal("CONDITIONAL"),
  v.literal("FORBIDDEN"),
  v.literal("NOT_APPLICABLE"),
);

const atributo = v.object({
  id: v.string(),
  definicionAtributoId: v.string(),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  tipoDato,
  unidadId: v.optional(v.string()),
  participaIdentidad: v.boolean(),
  aplicabilidad,
  orden: v.number(),
});

const opcion = v.object({
  id: v.string(),
  definicionAtributoId: v.string(),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const regla = v.object({
  id: v.string(),
  tipoRecursoId: v.string(),
  atributoCondicion: atributo,
  opcionCondicion: v.optional(opcion),
  atributoAfectado: atributo,
  aplicabilidad,
});

export const consultarClases = query({
  args: {},
  returns: v.array(clase),
  handler: async (ctx) => {
    const registros = await ctx.db
      .query("clasesRecurso")
      .withIndex("porClave")
      .collect();
    return registros
      .filter((registro) => registro.activo)
      .map(({ _id, clave, nombre, descripcion }) => ({
        id: _id,
        clave,
        nombre,
        descripcion,
      }));
  },
});

export const consultarFamiliasDeClase = query({
  args: { claseRecursoId: v.id("clasesRecurso") },
  returns: v.array(familia),
  handler: async (ctx, { claseRecursoId }) => {
    const registros = await ctx.db
      .query("familiasRecurso")
      .withIndex("porClase", (q) => q.eq("claseRecursoId", claseRecursoId))
      .collect();
    return registros
      .filter((registro) => registro.activo)
      .map(({ _id, claseRecursoId: claseId, clave, nombre, descripcion }) => ({
        id: _id,
        claseRecursoId: claseId,
        clave,
        nombre,
        descripcion,
      }));
  },
});

export const consultarTiposDeFamilia = query({
  args: { familiaRecursoId: v.id("familiasRecurso") },
  returns: v.array(tipo),
  handler: async (ctx, { familiaRecursoId }) => {
    const registros = await ctx.db
      .query("tiposRecurso")
      .withIndex("porFamilia", (q) => q.eq("familiaRecursoId", familiaRecursoId))
      .collect();
    return registros
      .filter((registro) => registro.activo)
      .map(({ _id, familiaRecursoId: familiaId, clave, nombre, descripcion }) => ({
        id: _id,
        familiaRecursoId: familiaId,
        clave,
        nombre,
        descripcion,
      }));
  },
});

export const consultarUnidadesValidas = query({
  args: {
    familiaRecursoId: v.id("familiasRecurso"),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
  },
  returns: v.array(unidad),
  handler: async (ctx, { familiaRecursoId, tipoRecursoId }) => {
    const familiares = await ctx.db
      .query("politicasUnidadRecurso")
      .withIndex("porFamilia", (q) => q.eq("familiaRecursoId", familiaRecursoId))
      .collect();
    const especificas = tipoRecursoId
      ? familiares.filter((politica) => politica.tipoRecursoId === tipoRecursoId)
      : [];
    const permitidas = new Map(
      familiares
        .filter((politica) => politica.tipoRecursoId === undefined)
        .map((politica) => [politica.unidadId, politica]),
    );
    for (const politica of especificas) permitidas.set(politica.unidadId, politica);

    const resultado = [];
    for (const politica of permitidas.values()) {
      if (!politica.activo) continue;
      const registro = await ctx.db.get(politica.unidadId);
      if (registro?.activo) {
        resultado.push({
          id: registro._id,
          clave: registro.clave,
          nombre: registro.nombre,
          descripcion: registro.descripcion,
          simbolo: registro.simbolo,
          principal: politica.principal,
        });
      }
    }
    return resultado;
  },
});

export const consultarAtributosAplicables = query({
  args: {
    familiaRecursoId: v.id("familiasRecurso"),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
  },
  returns: v.array(atributo),
  handler: async (ctx, { familiaRecursoId, tipoRecursoId }) => {
    const registros = await ctx.db
      .query("atributosRecurso")
      .withIndex("porFamilia", (q) => q.eq("familiaRecursoId", familiaRecursoId))
      .collect();
    const seleccionados = new Map(
      registros
        .filter((registro) => registro.tipoRecursoId === undefined)
        .map((registro) => [registro.definicionAtributoId, registro]),
    );
    if (tipoRecursoId) {
      for (const registro of registros) {
        if (registro.tipoRecursoId === tipoRecursoId) {
          seleccionados.set(registro.definicionAtributoId, registro);
        }
      }
    }

    const resultado = [];
    for (const registro of seleccionados.values()) {
      if (!registro.activo || registro.aplicabilidad === "FORBIDDEN" || registro.aplicabilidad === "NOT_APPLICABLE") continue;
      const definicion = await ctx.db.get(registro.definicionAtributoId);
      if (definicion?.activo) {
        resultado.push({
          id: registro._id,
          definicionAtributoId: definicion._id,
          clave: definicion.clave,
          nombre: definicion.nombre,
          descripcion: definicion.descripcion,
          tipoDato: definicion.tipoDato,
          unidadId: definicion.unidadId,
          participaIdentidad: registro.participaIdentidad,
          aplicabilidad: registro.aplicabilidad,
          orden: registro.orden,
        });
      }
    }
    return resultado.sort((a, b) => a.orden - b.orden);
  },
});

export const consultarOpcionesPermitidas = query({
  args: { definicionAtributoId: v.id("definicionesAtributo") },
  returns: v.array(opcion),
  handler: async (ctx, { definicionAtributoId }) => {
    const registros = await ctx.db
      .query("opcionesAtributo")
      .withIndex("porDefinicion", (q) => q.eq("definicionAtributoId", definicionAtributoId))
      .collect();
    return registros
      .filter((registro) => registro.activo)
      .map(({ _id, definicionAtributoId: definicionId, clave, nombre, descripcion }) => ({
        id: _id,
        definicionAtributoId: definicionId,
        clave,
        nombre,
        descripcion,
      }));
  },
});

export const obtenerReglasValidacion = query({
  args: { tipoRecursoId: v.id("tiposRecurso") },
  returns: v.array(regla),
  handler: async (ctx, { tipoRecursoId }) => {
    const registros = await ctx.db
      .query("reglasAtributoRecurso")
      .withIndex("porTipo", (q) => q.eq("tipoRecursoId", tipoRecursoId))
      .collect();
    const resultado = [];
    for (const registro of registros) {
      if (!registro.activo) continue;
      const condicion = await ctx.db.get(registro.atributoCondicionId);
      const afectado = await ctx.db.get(registro.atributoAfectadoId);
      if (!condicion?.activo || !afectado?.activo) continue;
      const [condicionDefinicion, afectadoDefinicion, opcionCondicion] = await Promise.all([
        ctx.db.get(condicion.definicionAtributoId),
        ctx.db.get(afectado.definicionAtributoId),
        registro.opcionCondicionId ? ctx.db.get(registro.opcionCondicionId) : null,
      ]);
      if (!condicionDefinicion?.activo || !afectadoDefinicion?.activo || (opcionCondicion && !opcionCondicion.activo)) continue;
      resultado.push({
        id: registro._id,
        tipoRecursoId: registro.tipoRecursoId,
        atributoCondicion: {
          id: condicion._id,
          definicionAtributoId: condicionDefinicion._id,
          clave: condicionDefinicion.clave,
          nombre: condicionDefinicion.nombre,
          descripcion: condicionDefinicion.descripcion,
          tipoDato: condicionDefinicion.tipoDato,
          unidadId: condicionDefinicion.unidadId,
          participaIdentidad: condicion.participaIdentidad,
          aplicabilidad: condicion.aplicabilidad,
          orden: condicion.orden,
        },
        opcionCondicion: opcionCondicion
          ? {
              id: opcionCondicion._id,
              definicionAtributoId: opcionCondicion.definicionAtributoId,
              clave: opcionCondicion.clave,
              nombre: opcionCondicion.nombre,
              descripcion: opcionCondicion.descripcion,
            }
          : undefined,
        atributoAfectado: {
          id: afectado._id,
          definicionAtributoId: afectadoDefinicion._id,
          clave: afectadoDefinicion.clave,
          nombre: afectadoDefinicion.nombre,
          descripcion: afectadoDefinicion.descripcion,
          tipoDato: afectadoDefinicion.tipoDato,
          unidadId: afectadoDefinicion.unidadId,
          participaIdentidad: afectado.participaIdentidad,
          aplicabilidad: afectado.aplicabilidad,
          orden: afectado.orden,
        },
        aplicabilidad: registro.aplicabilidad,
      });
    }
    return resultado;
  },
});
