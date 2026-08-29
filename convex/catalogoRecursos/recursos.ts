import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";
import { v } from "convex/values";
import {
  identidadRecurso,
  validarRecurso,
  type CrearRecursoEntrada,
} from "./validacionRecurso";

const valor = v.object({
  atributoRecursoId: v.id("atributosRecurso"),
  valor: v.union(v.string(), v.number(), v.boolean()),
  opcionAtributoId: v.optional(v.id("opcionesAtributo")),
});
const entrada = v.object({
  claseRecursoId: v.id("clasesRecurso"),
  familiaRecursoId: v.id("familiasRecurso"),
  tipoRecursoId: v.id("tiposRecurso"),
  unidadId: v.id("unidades"),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  valores: v.array(valor),
});
const salidaValor = v.object({
  _id: v.id("valoresAtributoRecurso"),
  _creationTime: v.number(),
  recursoId: v.id("recursos"),
  atributoRecursoId: v.id("atributosRecurso"),
  valor: v.union(v.string(), v.number(), v.boolean()),
  opcionAtributoId: v.optional(v.id("opcionesAtributo")),
});
const salidaRecurso = v.object({
  _id: v.id("recursos"),
  _creationTime: v.number(),
  tipoRecursoId: v.id("tiposRecurso"),
  unidadId: v.id("unidades"),
  identificadorTecnico: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  activo: v.boolean(),
  revision: v.number(),
  valores: v.array(salidaValor),
});
const revisionArgs = {
  recursoId: v.id("recursos"),
  revisionEsperada: v.number(),
};
type Ctx = MutationCtx | QueryCtx;

async function conIdentidad(
  ctx: MutationCtx,
  validado: Awaited<ReturnType<typeof validarRecurso>>,
  valores: CrearRecursoEntrada["valores"],
) {
  const definiciones = new Map<Id<"definicionesAtributo">, { clave: string }>();
  for (const atributo of validado.atributos.values()) {
    const def = atributo.definicion;
    definiciones.set(atributo.definicionAtributoId, def);
  }
  const opciones = new Map<Id<"opcionesAtributo">, { clave: string }>();
  for (const value of valores)
    if (value.opcionAtributoId) {
      const option = await ctx.db.get(value.opcionAtributoId);
      if (option) opciones.set(value.opcionAtributoId, option);
    }
  return identidadRecurso(
    validado.tipo,
    validado.familia,
    validado.clase,
    validado.atributos,
    validado.byAttr,
    definiciones,
    opciones,
  );
}
async function conValores(ctx: Ctx, recursoId: Id<"recursos">) {
  return await ctx.db
    .query("valoresAtributoRecurso")
    .withIndex("porRecurso", (q) => q.eq("recursoId", recursoId))
    .collect();
}
async function respuesta(
  ctx: Ctx,
  recurso: Doc<"recursos">,
  recursoId: Id<"recursos">,
) {
  return { ...recurso, valores: await conValores(ctx, recursoId) };
}

export const crearRecurso = mutation({
  args: entrada,
  returns: salidaRecurso,
  handler: async (ctx, args) => {
    const validado = await validarRecurso(ctx, args);
    const identificadorTecnico = await conIdentidad(
      ctx,
      validado,
      args.valores,
    );
    const existente = await ctx.db
      .query("recursos")
      .withIndex("porIdentificadorTecnico", (q) =>
        q.eq("identificadorTecnico", identificadorTecnico),
      )
      .first();
    if (existente)
      throw new Error("Recurso duplicado por identificador técnico");
    const recursoId = await ctx.db.insert("recursos", {
      tipoRecursoId: args.tipoRecursoId,
      unidadId: args.unidadId,
      identificadorTecnico,
      nombre: args.nombre,
      descripcion: args.descripcion,
      activo: true,
      revision: 1,
    });
    for (const item of args.valores)
      await ctx.db.insert("valoresAtributoRecurso", {
        recursoId,
        atributoRecursoId: item.atributoRecursoId,
        valor: item.valor,
        opcionAtributoId: item.opcionAtributoId,
      });
    return await respuesta(ctx, (await ctx.db.get(recursoId))!, recursoId);
  },
});

export const obtenerRecurso = query({
  args: { recursoId: v.id("recursos") },
  returns: v.union(salidaRecurso, v.null()),
  handler: async (ctx, { recursoId }) => {
    const recurso = await ctx.db.get(recursoId);
    return recurso ? await respuesta(ctx, recurso, recursoId) : null;
  },
});

export const listarRecursos = query({
  args: {
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    activo: v.optional(v.boolean()),
  },
  returns: v.array(salidaRecurso),
  handler: async (ctx, args) => {
    const recursos =
      args.tipoRecursoId !== undefined
        ? args.activo === undefined
          ? await ctx.db
              .query("recursos")
              .withIndex("porTipo", (q) =>
                q.eq("tipoRecursoId", args.tipoRecursoId!),
              )
              .collect()
          : await ctx.db
              .query("recursos")
              .withIndex("porTipoYActivo", (q) =>
                q
                  .eq("tipoRecursoId", args.tipoRecursoId!)
                  .eq("activo", args.activo!),
              )
              .collect()
        : await ctx.db
            .query("recursos")
            .withIndex("porActivo", (q) =>
                  args.activo === undefined ? q : q.eq("activo", args.activo!),
                )
            .collect();
    return await Promise.all(
      recursos
        .sort((a, b) => args.tipoRecursoId === undefined ? a.identificadorTecnico.localeCompare(b.identificadorTecnico) : 0)
            .filter(
          (r) =>
            args.tipoRecursoId !== undefined ||
            args.activo === undefined ||
            r.activo === args.activo,
        )
        .map((r) => respuesta(ctx, r, r._id)),
    );
  },
});

export const buscarRecursos = query({
  args: {
    texto: v.string(),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    activo: v.optional(v.boolean()),
  },
  returns: v.array(salidaRecurso),
  handler: async (ctx, args) => {
    const recursos = await ctx.db
      .query("recursos")
      .withSearchIndex("buscar", (q) => {
        let x = q.search("nombre", args.texto);
        if (args.tipoRecursoId !== undefined)
          x = x.eq("tipoRecursoId", args.tipoRecursoId);
        if (args.activo !== undefined) x = x.eq("activo", args.activo);
        return x;
      })
      .collect();
    return await Promise.all(recursos.map((r) => respuesta(ctx, r, r._id)));
  },
});

export const actualizarRecurso = mutation({
  args: {
    ...entrada.fields,
    recursoId: v.id("recursos"),
    revisionEsperada: v.number(),
  },
  returns: salidaRecurso,
  handler: async (ctx, args) => {
    const actual = await ctx.db.get(args.recursoId);
    if (!actual) throw new Error("Recurso inexistente");
    if (actual.revision !== args.revisionEsperada)
      throw new Error("Revisión obsoleta");
    const validado = await validarRecurso(ctx, args);
    const identificadorTecnico = await conIdentidad(
      ctx,
      validado,
      args.valores,
    );
    const existente = await ctx.db
      .query("recursos")
      .withIndex("porIdentificadorTecnico", (q) =>
        q.eq("identificadorTecnico", identificadorTecnico),
      )
      .first();
    if (existente && existente._id !== actual._id)
      throw new Error("Recurso duplicado por identificador técnico");
    for (const v of await conValores(ctx, actual._id))
      await ctx.db.delete(v._id);
    await ctx.db.patch(actual._id, {
      tipoRecursoId: args.tipoRecursoId,
      unidadId: args.unidadId,
      identificadorTecnico,
      nombre: args.nombre,
      descripcion: args.descripcion,
      revision: actual.revision + 1,
    });
    for (const item of args.valores)
      await ctx.db.insert("valoresAtributoRecurso", {
        recursoId: actual._id,
        atributoRecursoId: item.atributoRecursoId,
        valor: item.valor,
        opcionAtributoId: item.opcionAtributoId,
      });
    return await respuesta(ctx, (await ctx.db.get(actual._id))!, actual._id);
  },
});

export const desactivarRecurso = mutation({
  args: revisionArgs,
  returns: salidaRecurso,
  handler: async (ctx, args) => {
    const recurso = await ctx.db.get(args.recursoId);
    if (!recurso) throw new Error("Recurso inexistente");
    if (recurso.revision !== args.revisionEsperada)
      throw new Error("Revisión obsoleta");
    if (!recurso.activo) throw new Error("Recurso ya inactivo");
    await ctx.db.patch(recurso._id, {
      activo: false,
      revision: recurso.revision + 1,
    });
    return await respuesta(ctx, (await ctx.db.get(recurso._id))!, recurso._id);
  },
});

export const reactivarRecurso = mutation({
  args: revisionArgs,
  returns: salidaRecurso,
  handler: async (ctx, args) => {
    const recurso = await ctx.db.get(args.recursoId);
    if (!recurso) throw new Error("Recurso inexistente");
    if (recurso.revision !== args.revisionEsperada)
      throw new Error("Revisión obsoleta");
    if (recurso.activo) throw new Error("Recurso ya activo");
    const tipo = await ctx.db.get(recurso.tipoRecursoId);
    const familia = tipo ? await ctx.db.get(tipo.familiaRecursoId) : null;
    const clase = familia ? await ctx.db.get(familia.claseRecursoId) : null;
    if (!tipo || !familia || !clase) throw new Error("Jerarquía inexistente");
    const valores = await conValores(ctx, recurso._id);
    const entradaActual: CrearRecursoEntrada = {
      claseRecursoId: clase._id,
      familiaRecursoId: familia._id,
      tipoRecursoId: tipo._id,
      unidadId: recurso.unidadId,
      nombre: recurso.nombre,
      descripcion: recurso.descripcion,
      valores: valores.map(
        ({ atributoRecursoId, valor, opcionAtributoId }) => ({
          atributoRecursoId,
          valor,
          opcionAtributoId,
        }),
      ),
    };
    const validado = await validarRecurso(ctx, entradaActual);
    const reglas = await ctx.db
      .query("reglasAtributoRecurso")
      .withIndex("porTipo", (q) => q.eq("tipoRecursoId", tipo._id))
      .collect();
    if (reglas.some((regla) => !regla.activo))
      throw new Error("Catálogo de reglas inválido");
    const identidad = await conIdentidad(ctx, validado, entradaActual.valores);
    const existente = await ctx.db
      .query("recursos")
      .withIndex("porIdentificadorTecnico", (q) =>
        q.eq("identificadorTecnico", identidad),
      )
      .first();
    if (existente && existente._id !== recurso._id)
      throw new Error("Recurso duplicado por identificador técnico");
    await ctx.db.patch(recurso._id, {
      activo: true,
      identificadorTecnico: identidad,
      revision: recurso.revision + 1,
    });
    return await respuesta(ctx, (await ctx.db.get(recurso._id))!, recurso._id);
  },
});
