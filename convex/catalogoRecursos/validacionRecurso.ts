import type { Id, Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { identidadRecurso as identidadDominio } from "../../src/catalogoRecursos/dominio/identidadRecurso";
import { validarRecurso as validarDominio } from "../../src/catalogoRecursos/dominio/validarRecurso";
import type { Aplicabilidad, Atributo, CatalogoSnapshot, EntradaRecurso, FalloValidacion, Opcion, Definicion, ValorEntrada as ValorDominio, ResultadoDominio } from "../../src/catalogoRecursos/dominio/tipos";
import { MAX_RESOURCE_VALUES } from "../catalogoAdmin/resourceValidators";

export type ValorEntrada = Omit<ValorDominio, "atributoRecursoId" | "opcionAtributoId"> & {
  atributoRecursoId: Id<"atributosRecurso">;
  opcionAtributoId?: Id<"opcionesAtributo">;
};
export type CrearRecursoEntrada = Omit<EntradaRecurso, "claseRecursoId" | "familiaRecursoId" | "tipoRecursoId" | "unidadId" | "valores"> & {
  nombre: string;
  descripcion?: string;
  claseRecursoId: Id<"clasesRecurso">;
  familiaRecursoId: Id<"familiasRecurso">;
  tipoRecursoId: Id<"tiposRecurso">;
  unidadId: Id<"unidades">;
  valores: ValorEntrada[];
};

type AtributoValidado = Doc<"atributosRecurso"> & { definicion: Doc<"definicionesAtributo"> };
export type RecursoValidado = {
  clase: Doc<"clasesRecurso">;
  familia: Doc<"familiasRecurso">;
  tipo: Doc<"tiposRecurso">;
  atributos: Map<Id<"definicionesAtributo">, AtributoValidado>;
  byAttr: Map<Id<"atributosRecurso">, ValorEntrada>;
  aplicabilidad: Map<string, Aplicabilidad>;
};

/** Pure, bounded evaluation seam; unlike validarRecurso it never throws. */
export function evaluarRecurso(snapshot: CatalogoSnapshot, entrada: EntradaRecurso, limit = MAX_RESOURCE_VALUES): ResultadoDominio | { ok: false; code: "RESOURCE_VALUE_LIMIT_EXCEEDED" } {
  if (entrada.valores.length > limit) return { ok: false, code: "RESOURCE_VALUE_LIMIT_EXCEEDED" };
  return validarDominio(snapshot, entrada);
}

const mensajes: Record<string, string> = {
  JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA: "Jerarquía o unidad inexistente/inactiva",
  JERARQUIA_INVALIDA: "Jerarquía de clase, familia y tipo inválida",
  UNIDAD_NO_PERMITIDA: "Unidad no permitida",
  ATRIBUTO_REPETIDO: "Atributo repetido",
  ATRIBUTO_NO_APLICABLE: "Atributo no aplicable",
  ATRIBUTO_REQUERIDO_AUSENTE: "Atributo requerido ausente",
  NUMERO_NO_FINITO: "Número no finito",
  ATRIBUTO_PROHIBIDO: "Atributo prohibido",
  DEFINICION_INEXISTENTE: "Definición inexistente",
  TIPO_DE_VALOR_INVALIDO: "Tipo de valor inválido",
  OPCION_INVALIDA: "Opción inválida",
};

function id(id: string): string { return id; }
function entradaDominio(entrada: CrearRecursoEntrada): EntradaRecurso {
  return {
    claseRecursoId: id(entrada.claseRecursoId), familiaRecursoId: id(entrada.familiaRecursoId),
    tipoRecursoId: id(entrada.tipoRecursoId), unidadId: id(entrada.unidadId),
    valores: entrada.valores.map(v => ({ atributoRecursoId: id(v.atributoRecursoId), valor: v.valor, opcionAtributoId: v.opcionAtributoId === undefined ? undefined : id(v.opcionAtributoId) })),
  };
}

export async function validarRecurso(ctx: MutationCtx, entrada: CrearRecursoEntrada): Promise<RecursoValidado> {
  const snapshot = await cargarSnapshot(ctx, entrada);
  const resultado = validarDominio(snapshot, entradaDominio(entrada));
  if (!resultado.ok) throw new Error(mensajes[resultado.code]);
  return construirRecursoValidado(snapshot, resultado, entrada);
}

function construirRecursoValidado(snapshot: SnapshotConDocumentos, resultado: Extract<ResultadoDominio, { ok: true }>, entrada: CrearRecursoEntrada): RecursoValidado {
  const clase = snapshot.claseOriginal;
  const familia = snapshot.familiaOriginal;
  const tipo = snapshot.tipoOriginal;
  const unidad = snapshot.unidadOriginal;
  if (!clase || !familia || !tipo || !unidad)
    throw new Error(mensajes.JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA);
  const atributos = new Map<Id<"definicionesAtributo">, AtributoValidado>();
  for (const [definicionId, atributo] of resultado.value.atributos) {
    const original = snapshot.atributosOriginales.get(atributo.id);
    const definicion = snapshot.definicionesOriginales.get(definicionId);
    if (!original || !definicion)
      throw new Error(mensajes.JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA);
    atributos.set(definicion._id, { ...original, definicion });
  }
  return {
    clase, familia, tipo, atributos,
    byAttr: new Map(entrada.valores.map(v => [v.atributoRecursoId, v])),
    aplicabilidad: resultado.value.aplicabilidad,
  };
}

export type ResultadoRecursoAdministrativo =
  | { ok: true; value: RecursoValidado }
  | { ok: false; code: FalloValidacion | "RESOURCE_VALUE_LIMIT_EXCEEDED" };

export async function validarRecursoAdministrativo(ctx: MutationCtx, entrada: CrearRecursoEntrada): Promise<ResultadoRecursoAdministrativo> {
  const snapshot = await cargarSnapshot(ctx, entrada);
  const resultado = evaluarRecurso(snapshot, entradaDominio(entrada), MAX_RESOURCE_VALUES);
  if (!resultado.ok) return resultado;
  return { ok: true, value: construirRecursoValidado(snapshot, resultado, entrada) };
}

type SnapshotConDocumentos = CatalogoSnapshot & {
  claseOriginal: Doc<"clasesRecurso"> | null;
  familiaOriginal: Doc<"familiasRecurso"> | null;
  tipoOriginal: Doc<"tiposRecurso"> | null;
  unidadOriginal: Doc<"unidades"> | null;
  atributosOriginales: Map<string, Doc<"atributosRecurso">>;
  definicionesOriginales: Map<string, Doc<"definicionesAtributo">>;
};

async function cargarSnapshot(ctx: MutationCtx, entrada: CrearRecursoEntrada): Promise<SnapshotConDocumentos> {
  const [claseDoc, familiaDoc, tipoDoc, unidadDoc] = await Promise.all([
    ctx.db.get(entrada.claseRecursoId), ctx.db.get(entrada.familiaRecursoId), ctx.db.get(entrada.tipoRecursoId), ctx.db.get(entrada.unidadId),
  ]);
  const [politicas, registros, reglas] = await Promise.all([
    familiaDoc ? ctx.db.query("politicasUnidadRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familiaDoc._id)).collect() : Promise.resolve([]),
    familiaDoc ? ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familiaDoc._id)).collect() : Promise.resolve([]),
    tipoDoc ? ctx.db.query("reglasAtributoRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", tipoDoc._id)).collect() : Promise.resolve([]),
  ]);
  const definiciones = (await Promise.all([...new Set(registros.map(r => r.definicionAtributoId))].map(id => ctx.db.get(id)))).filter((d): d is Doc<"definicionesAtributo"> => d !== null);
  const opcionIds = [...new Set([...entrada.valores.flatMap(v => v.opcionAtributoId ? [v.opcionAtributoId] : []), ...reglas.flatMap(r => r.opcionCondicionId ? [r.opcionCondicionId] : [])])];
  const opciones = (await Promise.all(opcionIds.map(optionId => ctx.db.get(optionId)))).filter((o): o is Doc<"opcionesAtributo"> => o !== null);
  const definicion = (r: Doc<"atributosRecurso">) => definiciones.find(d => d._id === r.definicionAtributoId);
  return {
    claseOriginal: claseDoc,
    familiaOriginal: familiaDoc,
    tipoOriginal: tipoDoc,
    unidadOriginal: unidadDoc,
    atributosOriginales: new Map(registros.map(r => [id(r._id), r])),
    definicionesOriginales: new Map(definiciones.map(d => [id(d._id), d])),
    clase: claseDoc ? { id: id(claseDoc._id), clave: claseDoc.clave, activo: claseDoc.activo } : null,
    familia: familiaDoc ? { id: id(familiaDoc._id), clave: familiaDoc.clave, activo: familiaDoc.activo, claseRecursoId: id(familiaDoc.claseRecursoId) } : null,
    tipo: tipoDoc ? { id: id(tipoDoc._id), clave: tipoDoc.clave, activo: tipoDoc.activo, familiaRecursoId: id(tipoDoc.familiaRecursoId) } : null,
    unidad: unidadDoc ? { id: id(unidadDoc._id), activo: unidadDoc.activo } : null,
    politicas: politicas.map(p => ({ id: id(p._id), activo: p.activo, familiaRecursoId: id(p.familiaRecursoId), tipoRecursoId: p.tipoRecursoId === undefined ? undefined : id(p.tipoRecursoId), unidadId: id(p.unidadId) })),
    atributos: registros.map(r => { const d = definicion(r); return { id: id(r._id), activo: r.activo, definicionAtributoId: id(r.definicionAtributoId), tipoRecursoId: r.tipoRecursoId === undefined ? undefined : id(r.tipoRecursoId), aplicabilidad: r.aplicabilidad, participaIdentidad: r.participaIdentidad, definicion: d ? { id: id(d._id), clave: d.clave, tipoDato: d.tipoDato, activo: d.activo } : null }; }),
    reglas: reglas.map(r => ({ id: id(r._id), activo: r.activo, atributoCondicionId: id(r.atributoCondicionId), opcionCondicionId: r.opcionCondicionId === undefined ? undefined : id(r.opcionCondicionId), atributoAfectadoId: id(r.atributoAfectadoId), aplicabilidad: r.aplicabilidad })),
    opciones: opciones.map(o => ({ id: id(o._id), activo: o.activo, definicionAtributoId: id(o.definicionAtributoId), clave: o.clave })),
  };
}

export async function derivarIdentidadRecurso(ctx: MutationCtx, validado: RecursoValidado, valores: ValorEntrada[]): Promise<string> {
  const definiciones = new Map<Id<"definicionesAtributo">, { clave: string }>();
  for (const atributo of validado.atributos.values()) definiciones.set(atributo.definicionAtributoId, atributo.definicion);
  const opciones = new Map<Id<"opcionesAtributo">, { clave: string }>();
  for (const value of valores) if (value.opcionAtributoId) {
    const option = await ctx.db.get(value.opcionAtributoId);
    if (option) opciones.set(value.opcionAtributoId, option);
  }
  return identidadRecurso(validado.tipo, validado.familia, validado.clase, validado.atributos, validado.byAttr, definiciones, opciones);
}

export function identidadRecurso(tipo: { clave: string }, familia: { clave: string }, clase: { clave: string }, atributos: Map<Id<"definicionesAtributo">, { _id: Id<"atributosRecurso">; definicionAtributoId: Id<"definicionesAtributo">; participaIdentidad: boolean }>, valores: Map<Id<"atributosRecurso">, ValorEntrada>, definiciones: Map<Id<"definicionesAtributo">, { clave: string }>, opciones: Map<Id<"opcionesAtributo">, { clave: string }>) {
  const atributosDominio = new Map<string, Atributo>([...atributos].map(([key, a]) => [id(key), { id: id(a._id), activo: true, definicionAtributoId: id(a.definicionAtributoId), participaIdentidad: a.participaIdentidad, aplicabilidad: "OPTIONAL" }]));
  const valoresDominio = new Map<string, ValorDominio>([...valores].map(([key, value]) => [id(key), { atributoRecursoId: id(value.atributoRecursoId), valor: value.valor, opcionAtributoId: value.opcionAtributoId === undefined ? undefined : id(value.opcionAtributoId) }]));
  const definicionesDominio = new Map<string, Pick<Definicion, "clave">>([...definiciones].map(([key, value]) => [id(key), value]));
  const opcionesDominio = new Map<string, Pick<Opcion, "clave">>([...opciones].map(([key, value]) => [id(key), value]));
  return identidadDominio(tipo, familia, clase, atributosDominio, valoresDominio, definicionesDominio, opcionesDominio);
}
