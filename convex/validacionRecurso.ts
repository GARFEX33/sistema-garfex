import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export type ValorEntrada = {
  atributoRecursoId: Id<"atributosRecurso">;
  valor: string | number | boolean;
  opcionAtributoId?: Id<"opcionesAtributo">;
};

export type CrearRecursoEntrada = {
  claseRecursoId: Id<"clasesRecurso">;
  familiaRecursoId: Id<"familiasRecurso">;
  tipoRecursoId: Id<"tiposRecurso">;
  unidadId: Id<"unidades">;
  nombre: string;
  descripcion?: string;
  valores: ValorEntrada[];
};

export async function validarRecurso(ctx: MutationCtx, entrada: CrearRecursoEntrada) {
  const [clase, familia, tipo, unidad] = await Promise.all([
    ctx.db.get(entrada.claseRecursoId), ctx.db.get(entrada.familiaRecursoId),
    ctx.db.get(entrada.tipoRecursoId), ctx.db.get(entrada.unidadId),
  ]);
  if (!clase?.activo || !familia?.activo || !tipo?.activo || !unidad?.activo) throw new Error("Jerarquía o unidad inexistente/inactiva");
  if (familia.claseRecursoId !== clase._id || tipo.familiaRecursoId !== familia._id) throw new Error("Jerarquía de clase, familia y tipo inválida");

  const politicas = await ctx.db.query("politicasUnidadRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familia._id)).collect();
  const familiaPolicy = politicas.find(p => p.tipoRecursoId === undefined && p.unidadId === unidad._id && p.activo);
  const tipoPolicy = politicas.find(p => p.tipoRecursoId === tipo._id && p.unidadId === unidad._id && p.activo);
  if (!familiaPolicy && !tipoPolicy) throw new Error("Unidad no permitida");

  const registros = await ctx.db.query("atributosRecurso").withIndex("porFamilia", q => q.eq("familiaRecursoId", familia._id)).collect();
  const atributos = new Map<Id<"definicionesAtributo">, (typeof registros)[number]>();
  for (const r of registros) if (r.tipoRecursoId === undefined) atributos.set(r.definicionAtributoId, r);
  for (const r of registros) if (r.tipoRecursoId === tipo._id) atributos.set(r.definicionAtributoId, r);
  const aplicables = new Map<Id<"atributosRecurso">, (typeof registros)[number]>();
  for (const r of atributos.values()) {
    const def = await ctx.db.get(r.definicionAtributoId);
    if (r.activo && def?.activo) aplicables.set(r._id, r);
  }
  const byAttr = new Map(entrada.valores.map(v => [v.atributoRecursoId, v]));
  if (byAttr.size !== entrada.valores.length) throw new Error("Atributo repetido");
  for (const valor of entrada.valores) if (!aplicables.has(valor.atributoRecursoId)) throw new Error("Atributo no aplicable");

  const reglas = await ctx.db.query("reglasAtributoRecurso").withIndex("porTipo", q => q.eq("tipoRecursoId", tipo._id)).collect();
  const aplicabilidad = new Map<Id<"atributosRecurso">, "REQUIRED" | "OPTIONAL" | "CONDITIONAL" | "FORBIDDEN" | "NOT_APPLICABLE">(
    [...aplicables].map(([id, r]) => [id, r.aplicabilidad === "CONDITIONAL" ? "OPTIONAL" : r.aplicabilidad]),
  );
  for (const regla of reglas.filter(r => r.activo)) {
    if (!aplicables.has(regla.atributoCondicionId) || !aplicables.has(regla.atributoAfectadoId)) continue;
    const condicion = byAttr.get(regla.atributoCondicionId);
    let activa = condicion !== undefined;
    if (activa && regla.opcionCondicionId) activa = condicion!.opcionAtributoId === regla.opcionCondicionId;
    if (activa) aplicabilidad.set(regla.atributoAfectadoId, regla.aplicabilidad);
  }
  for (const [id, r] of aplicables) {
    const valor = byAttr.get(id); const estado = aplicabilidad.get(id);
    if ((estado === "REQUIRED" || estado === "CONDITIONAL") && !valor) throw new Error("Atributo requerido ausente");
    if (valor?.valor !== undefined && typeof valor.valor === "number" && !Number.isFinite(valor.valor)) throw new Error("Número no finito");
    if ((estado === "FORBIDDEN" || estado === "NOT_APPLICABLE") && valor) throw new Error("Atributo prohibido");
    if (!valor) continue;
    const def = await ctx.db.get(r.definicionAtributoId);
    if (!def) throw new Error("Definición inexistente");
    const correcto = (def.tipoDato === "TEXTO" && typeof valor.valor === "string") || (def.tipoDato === "NUMERO" && typeof valor.valor === "number") || (def.tipoDato === "BOOLEANO" && typeof valor.valor === "boolean") || (def.tipoDato === "OPCION" && typeof valor.valor === "string" && valor.opcionAtributoId !== undefined);
    if (!correcto || (def.tipoDato !== "OPCION" && valor.opcionAtributoId !== undefined)) throw new Error("Tipo de valor inválido");
    if (valor.opcionAtributoId) {
      const opcion = await ctx.db.get(valor.opcionAtributoId);
      if (!opcion?.activo || opcion.definicionAtributoId !== def._id) throw new Error("Opción inválida");
    }
  }
  return { clase, familia, tipo, atributos: aplicables, byAttr, aplicabilidad };
}

export function identidadRecurso(
  tipo: { clave: string }, familia: { clave: string }, clase: { clave: string },
  atributos: Map<Id<"atributosRecurso">, { definicionAtributoId: Id<"definicionesAtributo">; participaIdentidad: boolean }>,
  valores: Map<Id<"atributosRecurso">, ValorEntrada>, definiciones: Map<Id<"definicionesAtributo">, { clave: string }>, opciones: Map<Id<"opcionesAtributo">, { clave: string }>,
) {
  const partes = [...atributos.entries()].filter(([id, a]) => a.participaIdentidad && valores.has(id)).map(([id, a]) => {
    const v = valores.get(id)!;
    const clave = definiciones.get(a.definicionAtributoId)!.clave;
    const valor = v.opcionAtributoId
      ? opciones.get(v.opcionAtributoId)!.clave
      : typeof v.valor === "string"
        ? v.valor.normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase()
        : typeof v.valor === "boolean"
          ? v.valor ? "TRUE" : "FALSE"
          : Number.isFinite(v.valor) ? String(v.valor) : (() => { throw new Error("Número no finito"); })();
    return [clave, valor] as const;
  }).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`);
  return `v1|${clase.clave}|${familia.clave}|${tipo.clave}|${partes.join("|")}`;
}
