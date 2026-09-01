import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { resolverJerarquiaEfectiva, resolverCatalogoEfectivo } from "../../src/catalogoRecursos/dominio/catalogoEfectivo";

const clase = v.object({
  id: v.id("clasesRecurso"),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const familia = v.object({
  id: v.id("familiasRecurso"),
  claseRecursoId: v.id("clasesRecurso"),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const tipo = v.object({
  id: v.id("tiposRecurso"),
  familiaRecursoId: v.id("familiasRecurso"),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const unidad = v.object({
  id: v.id("unidades"),
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

const unidadAtributo = v.object({
  id: v.id("unidades"),
  clave: v.string(),
  nombre: v.string(),
  simbolo: v.union(v.string(), v.null()),
});

const atributo = v.object({
  id: v.id("atributosRecurso"),
  definicionAtributoId: v.id("definicionesAtributo"),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  tipoDato,
  unidadId: v.optional(v.id("unidades")),
  unidad: v.union(unidadAtributo, v.null()),
  participaIdentidad: v.boolean(),
  aplicabilidad,
  orden: v.number(),
});

const opcion = v.object({
  id: v.id("opcionesAtributo"),
  definicionAtributoId: v.id("definicionesAtributo"),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
});

const identificacionArgs = {
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
};
const resultadoClaseCreada = v.object({ id: v.id("clasesRecurso"), revision: v.number() });
const resultadoFamiliaCreada = v.object({ id: v.id("familiasRecurso"), revision: v.number() });
const resultadoTipoCreado = v.object({ id: v.id("tiposRecurso"), revision: v.number() });
const resultadoUnidadCreada = v.object({ id: v.id("unidades"), revision: v.number() });
const resultadoPoliticaUnidadCreada = v.object({ id: v.id("politicasUnidadRecurso"), revision: v.number() });
const resultadoDefinicionCreada = v.object({ id: v.id("definicionesAtributo"), revision: v.number() });
const resultadoAtributoCreado = v.object({ id: v.id("atributosRecurso"), revision: v.number() });
const resultadoOpcionCreada = v.object({ id: v.id("opcionesAtributo"), revision: v.number() });

const regla = v.object({
  id: v.id("reglasAtributoRecurso"),
  tipoRecursoId: v.id("tiposRecurso"),
  atributoCondicion: atributo,
  opcionCondicion: v.optional(opcion),
  atributoAfectado: atributo,
  aplicabilidad,
});

async function unidadDeDefinicion(ctx: QueryCtx, unidadId: Id<"unidades"> | undefined) {
  if (!unidadId) return null;
  const registro = await ctx.db.get(unidadId);
  return registro
    ? { id: registro._id, clave: registro.clave, nombre: registro.nombre, simbolo: registro.simbolo ?? null }
    : null;
}

async function exigirClaseActiva(ctx: MutationCtx, claseRecursoId: Id<"clasesRecurso">) {
  const clase = await ctx.db.get(claseRecursoId);
  if (!clase?.activo) throw new Error("Clase inexistente o inactiva");
  return clase;
}

async function exigirFamiliaActiva(ctx: MutationCtx, familiaRecursoId: Id<"familiasRecurso">) {
  const familia = await ctx.db.get(familiaRecursoId);
  if (!familia?.activo) throw new Error("Familia inexistente o inactiva");
  await exigirClaseActiva(ctx, familia.claseRecursoId);
  return familia;
}

async function exigirTipoActivo(ctx: MutationCtx, tipoRecursoId: Id<"tiposRecurso">) {
  const tipo = await ctx.db.get(tipoRecursoId);
  if (!tipo?.activo) throw new Error("Tipo inexistente o inactivo");
  await exigirFamiliaActiva(ctx, tipo.familiaRecursoId);
  return tipo;
}

async function exigirUnidadActiva(ctx: MutationCtx, unidadId: Id<"unidades">) {
  const unidad = await ctx.db.get(unidadId);
  if (!unidad?.activo) throw new Error("Unidad inexistente o inactiva");
  return unidad;
}

async function exigirDefinicionActiva(ctx: MutationCtx, definicionAtributoId: Id<"definicionesAtributo">) {
  const definicion = await ctx.db.get(definicionAtributoId);
  if (!definicion?.activo) throw new Error("Definición de atributo inexistente o inactiva");
  return definicion;
}

export const crearClaseRecurso = mutation({
  args: identificacionArgs,
  returns: resultadoClaseCreada,
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("clasesRecurso").withIndex("porClave", (q) => q.eq("clave", args.clave)).first();
    if (existente) throw new Error("Clave de clase duplicada");
    const id = await ctx.db.insert("clasesRecurso", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
});

export const crearFamiliaRecurso = mutation({
  args: { ...identificacionArgs, claseRecursoId: v.id("clasesRecurso") },
  returns: resultadoFamiliaCreada,
  handler: async (ctx, args) => {
    await exigirClaseActiva(ctx, args.claseRecursoId);
    const existente = await ctx.db.query("familiasRecurso").withIndex("porClaseYClave", (q) => q.eq("claseRecursoId", args.claseRecursoId).eq("clave", args.clave)).first();
    if (existente) throw new Error("Clave de familia duplicada en la clase");
    const id = await ctx.db.insert("familiasRecurso", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
});

export const crearTipoRecurso = mutation({
  args: { ...identificacionArgs, familiaRecursoId: v.id("familiasRecurso") },
  returns: resultadoTipoCreado,
  handler: async (ctx, args) => {
    await exigirFamiliaActiva(ctx, args.familiaRecursoId);
    const existente = await ctx.db.query("tiposRecurso").withIndex("porFamiliaYClave", (q) => q.eq("familiaRecursoId", args.familiaRecursoId).eq("clave", args.clave)).first();
    if (existente) throw new Error("Clave de tipo duplicada en la familia");
    const id = await ctx.db.insert("tiposRecurso", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
});

export const crearUnidad = mutation({
  args: { ...identificacionArgs, simbolo: v.optional(v.string()) },
  returns: resultadoUnidadCreada,
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("unidades").withIndex("porClave", (q) => q.eq("clave", args.clave)).first();
    if (existente) throw new Error("Clave de unidad duplicada");
    const id = await ctx.db.insert("unidades", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
});

export const asignarUnidadPermitida = mutation({
  args: {
    familiaRecursoId: v.id("familiasRecurso"),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    unidadId: v.id("unidades"),
    principal: v.boolean(),
  },
  returns: resultadoPoliticaUnidadCreada,
  handler: async (ctx, args) => {
    const familia = await exigirFamiliaActiva(ctx, args.familiaRecursoId);
    if (args.tipoRecursoId !== undefined) {
      const tipo = await exigirTipoActivo(ctx, args.tipoRecursoId);
      if (tipo.familiaRecursoId !== familia._id) throw new Error("El tipo no pertenece a la familia");
    }
    await exigirUnidadActiva(ctx, args.unidadId);
    const existente = args.tipoRecursoId === undefined
      ? await ctx.db.query("politicasUnidadRecurso")
          .withIndex("porFamiliaYTipoYUnidad", (q) => q.eq("familiaRecursoId", familia._id).eq("tipoRecursoId", undefined).eq("unidadId", args.unidadId))
          .first()
      : await ctx.db.query("politicasUnidadRecurso").withIndex("porTipoYUnidad", (q) => q.eq("tipoRecursoId", args.tipoRecursoId!).eq("unidadId", args.unidadId)).first();
    if (existente) throw new Error("Asignación de unidad duplicada");
    const id = await ctx.db.insert("politicasUnidadRecurso", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
});

export const crearDefinicionAtributo = mutation({
  args: { ...identificacionArgs, tipoDato, unidadId: v.optional(v.id("unidades")) },
  returns: resultadoDefinicionCreada,
  handler: async (ctx, args) => {
    const existente = await ctx.db.query("definicionesAtributo").withIndex("porClave", (q) => q.eq("clave", args.clave)).first();
    if (existente) throw new Error("Clave de definición de atributo duplicada");
    if (args.unidadId !== undefined) await exigirUnidadActiva(ctx, args.unidadId);
    const id = await ctx.db.insert("definicionesAtributo", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
});

export const asignarAtributo = mutation({
  args: {
    familiaRecursoId: v.id("familiasRecurso"),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    definicionAtributoId: v.id("definicionesAtributo"),
    aplicabilidad,
    participaIdentidad: v.boolean(),
    orden: v.number(),
  },
  returns: resultadoAtributoCreado,
  handler: async (ctx, args) => {
    const familia = await exigirFamiliaActiva(ctx, args.familiaRecursoId);
    if (args.tipoRecursoId !== undefined) {
      const tipo = await exigirTipoActivo(ctx, args.tipoRecursoId);
      if (tipo.familiaRecursoId !== familia._id) throw new Error("El tipo no pertenece a la familia");
    }
    await exigirDefinicionActiva(ctx, args.definicionAtributoId);
    const existente = args.tipoRecursoId === undefined
      ? await ctx.db.query("atributosRecurso")
          .withIndex("porFamiliaYTipoYDefinicion", (q) => q.eq("familiaRecursoId", familia._id).eq("tipoRecursoId", undefined).eq("definicionAtributoId", args.definicionAtributoId))
          .first()
      : await ctx.db.query("atributosRecurso").withIndex("porTipoYDefinicion", (q) => q.eq("tipoRecursoId", args.tipoRecursoId!).eq("definicionAtributoId", args.definicionAtributoId)).first();
    if (existente) throw new Error("Asignación de atributo duplicada");
    const id = await ctx.db.insert("atributosRecurso", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
});

export const crearOpcionAtributo = mutation({
  args: {
    definicionAtributoId: v.id("definicionesAtributo"),
    ...identificacionArgs,
  },
  returns: resultadoOpcionCreada,
  handler: async (ctx, args) => {
    const definicion = await exigirDefinicionActiva(ctx, args.definicionAtributoId);
    if (definicion.tipoDato !== "OPCION") throw new Error("Sólo una definición OPCION admite opciones");
    const existente = await ctx.db.query("opcionesAtributo").withIndex("porDefinicionYClave", (q) => q.eq("definicionAtributoId", args.definicionAtributoId).eq("clave", args.clave)).first();
    if (existente) throw new Error("Clave de opción duplicada en la definición");
    const id = await ctx.db.insert("opcionesAtributo", { ...args, activo: true, revision: 1 });
    return { id, revision: 1 };
  },
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
    const claseDoc = await ctx.db.get(claseRecursoId);
    if (!claseDoc?.activo) return [];
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
    const familiaDoc = await ctx.db.get(familiaRecursoId);
    const claseDoc = familiaDoc ? await ctx.db.get(familiaDoc.claseRecursoId) : null;
    if (!familiaDoc || !claseDoc) return [];
    const registros = await ctx.db
      .query("tiposRecurso")
      .withIndex("porFamilia", (q) => q.eq("familiaRecursoId", familiaRecursoId))
      .collect();
    return registros
      .filter((registro) => resolverJerarquiaEfectiva({ classId: String(claseDoc._id), familyId: String(familiaDoc._id), typeId: String(registro._id), familyClassId: String(familiaDoc.claseRecursoId), typeFamilyId: String(registro.familiaRecursoId), classActive: claseDoc.activo, familyActive: familiaDoc.activo, typeActive: registro.activo }).effective)
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
    const familiaDoc = await ctx.db.get(familiaRecursoId);
    const claseDoc = familiaDoc ? await ctx.db.get(familiaDoc.claseRecursoId) : null;
    const tipoDoc = tipoRecursoId ? await ctx.db.get(tipoRecursoId) : null;
    const hierarchy = resolverJerarquiaEfectiva({
      classId: String(claseDoc?._id), familyId: String(familiaDoc?._id), typeId: String(tipoDoc?._id ?? familiaRecursoId),
      familyClassId: String(familiaDoc?.claseRecursoId), typeFamilyId: tipoRecursoId ? String(tipoDoc?.familiaRecursoId) : String(familiaRecursoId),
      classActive: claseDoc?.activo, familyActive: familiaDoc?.activo, typeActive: tipoDoc?.activo ?? true,
    });
    if (!hierarchy.effective) return [];
    const familiares = await ctx.db
      .query("politicasUnidadRecurso")
      .withIndex("porFamilia", (q) => q.eq("familiaRecursoId", familiaRecursoId))
      .collect();
    const resolved = resolverCatalogoEfectivo({
      clase: claseDoc ? { id: String(claseDoc._id), clave: claseDoc.clave, activo: claseDoc.activo } : null,
      familia: familiaDoc ? { id: String(familiaDoc._id), clave: familiaDoc.clave, activo: familiaDoc.activo, claseRecursoId: String(familiaDoc.claseRecursoId) } : null,
      tipo: { id: String(tipoDoc?._id ?? familiaRecursoId), clave: String(tipoDoc?.clave ?? ""), activo: tipoDoc?.activo ?? true, familiaRecursoId: String(tipoDoc?.familiaRecursoId ?? familiaRecursoId) },
      unidad: null, politicas: familiares.map(policy => ({ id: String(policy._id), familiaRecursoId: String(policy.familiaRecursoId), tipoRecursoId: policy.tipoRecursoId === undefined ? undefined : String(policy.tipoRecursoId), unidadId: String(policy.unidadId), activo: policy.activo, principal: policy.principal })), atributos: [], reglas: [], opciones: [],
    } as never);
    const selectedIds = new Set(resolved.policies.map(policy => String(policy.id)));
    const permitidas = new Map(familiares.filter(policy => selectedIds.has(String(policy._id))).map(policy => [policy.unidadId, policy]));

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
    const familiaDoc = await ctx.db.get(familiaRecursoId);
    const claseDoc = familiaDoc ? await ctx.db.get(familiaDoc.claseRecursoId) : null;
    const tipoDoc = tipoRecursoId ? await ctx.db.get(tipoRecursoId) : null;
    const hierarchy = resolverJerarquiaEfectiva({
      classId: String(claseDoc?._id), familyId: String(familiaDoc?._id), typeId: String(tipoDoc?._id ?? familiaRecursoId),
      familyClassId: String(familiaDoc?.claseRecursoId), typeFamilyId: tipoRecursoId ? String(tipoDoc?.familiaRecursoId) : String(familiaRecursoId),
      classActive: claseDoc?.activo, familyActive: familiaDoc?.activo, typeActive: tipoDoc?.activo ?? true,
    });
    if (!hierarchy.effective) return [];
    const registros = await ctx.db
      .query("atributosRecurso")
      .withIndex("porFamilia", (q) => q.eq("familiaRecursoId", familiaRecursoId))
      .collect();
    const resolved = resolverCatalogoEfectivo({
      clase: claseDoc ? { id: String(claseDoc._id), clave: claseDoc.clave, activo: claseDoc.activo } : null,
      familia: familiaDoc ? { id: String(familiaDoc._id), clave: familiaDoc.clave, activo: familiaDoc.activo, claseRecursoId: String(familiaDoc.claseRecursoId) } : null,
      tipo: { id: String(tipoDoc?._id ?? familiaRecursoId), clave: String(tipoDoc?.clave ?? ""), activo: tipoDoc?.activo ?? true, familiaRecursoId: String(tipoDoc?.familiaRecursoId ?? familiaRecursoId) },
      unidad: null, politicas: [], atributos: registros.map(row => ({ ...row, id: String(row._id), familiaId: String(row.familiaRecursoId), tipoId: row.tipoRecursoId === undefined ? undefined : String(row.tipoRecursoId), definicionId: String(row.definicionAtributoId), definicionClave: String(row.definicionAtributoId) })), reglas: [], opciones: [],
    } as never);
    const selectedIds = new Set(resolved.assignments.map(row => String(row.id)));
    const seleccionados = new Map(registros.filter(row => selectedIds.has(String(row._id))).map(row => [row.definicionAtributoId, row]));

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
          unidad: await unidadDeDefinicion(ctx, definicion.unidadId),
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
    const tipoDoc = await ctx.db.get(tipoRecursoId);
    const familiaDoc = tipoDoc ? await ctx.db.get(tipoDoc.familiaRecursoId) : null;
    const claseDoc = familiaDoc ? await ctx.db.get(familiaDoc.claseRecursoId) : null;
    if (!resolverJerarquiaEfectiva({ classId: String(claseDoc?._id), familyId: String(familiaDoc?._id), typeId: String(tipoDoc?._id), familyClassId: String(familiaDoc?.claseRecursoId), typeFamilyId: String(tipoDoc?.familiaRecursoId), classActive: claseDoc?.activo, familyActive: familiaDoc?.activo, typeActive: tipoDoc?.activo }).effective) return [];
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
          unidad: await unidadDeDefinicion(ctx, condicionDefinicion.unidadId),
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
          unidad: await unidadDeDefinicion(ctx, afectadoDefinicion.unidadId),
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
