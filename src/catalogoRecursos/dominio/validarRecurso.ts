import { aplicabilidadBase, resolverAsignaciones, type AsignacionEfectiva } from "./asignacionesEfectivas";
import type {
  Aplicabilidad, AtributoConDefinicion, CatalogoSnapshot, EntradaRecurso, FalloValidacion,
  IdDominio, ResultadoDominio, ValorEntrada,
} from "./tipos";

export function validarRecurso(snapshot: CatalogoSnapshot, entrada: EntradaRecurso): ResultadoDominio {
  const { clase, familia, tipo, unidad } = snapshot;
  if (!clase?.activo || !familia?.activo || !tipo?.activo || !unidad?.activo)
    return fallo("JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA");
  if (familia.claseRecursoId !== clase.id || tipo.familiaRecursoId !== familia.id)
    return fallo("JERARQUIA_INVALIDA");

  const familiaPolicy = snapshot.politicas.find(p => p.tipoRecursoId === undefined && p.unidadId === unidad.id && p.activo);
  const tipoPolicy = snapshot.politicas.find(p => p.tipoRecursoId === tipo.id && p.unidadId === unidad.id && p.activo);
  if (!familiaPolicy && !tipoPolicy) return fallo("UNIDAD_NO_PERMITIDA");

  const rows = snapshot.atributos.map(registro => ({ ...registro, familiaId: familia.id, tipoId: registro.tipoRecursoId, definicionId: registro.definicionAtributoId, definicionClave: registro.definicion?.clave ?? registro.definicionAtributoId, orden: (registro as AtributoConDefinicion & { orden?: number }).orden ?? 0 } as AtributoConDefinicion & AsignacionEfectiva));
  const resolution = resolverAsignaciones({ familia: rows.filter(row => row.tipoId === undefined), tipo: rows.filter(row => row.tipoId === tipo.id), familiaId: familia.id, tipoId: tipo.id });
  const aplicables = new Map<IdDominio, AtributoConDefinicion & { definicion: NonNullable<AtributoConDefinicion["definicion"]> }>();
  const originalById = new Map(rows.map(row => [row.id, row]));
  for (const selected of resolution.selected) {
    const atributo = originalById.get(selected.id)!;
    const definicion = atributo.definicion;
    if (atributo.activo && definicion?.activo) aplicables.set(atributo.definicionAtributoId, { ...atributo, definicion });
  }

  const valores = new Map<IdDominio, ValorEntrada>(entrada.valores.map(valor => [valor.atributoRecursoId, valor]));
  if (valores.size !== entrada.valores.length) return fallo("ATRIBUTO_REPETIDO");
  const atributosPorId = new Map([...aplicables.values()].map(atributo => [atributo.id, atributo]));
  for (const valor of entrada.valores) if (!atributosPorId.has(valor.atributoRecursoId)) return fallo("ATRIBUTO_NO_APLICABLE");

  const aplicabilidad = new Map<IdDominio, Aplicabilidad>(
    [...aplicables].map(([id, atributo]) => [id, aplicabilidadBase(atributo.aplicabilidad)]),
  );
  for (const regla of snapshot.reglas.filter(regla => regla.activo)) {
    const condicionAtributo = atributosPorId.get(regla.atributoCondicionId);
    const afectadoAtributo = atributosPorId.get(regla.atributoAfectadoId);
    if (!condicionAtributo || !afectadoAtributo) continue;
    const condicion = valores.get(regla.atributoCondicionId);
    let activa = condicion !== undefined;
    if (activa && regla.opcionCondicionId) activa = condicion!.opcionAtributoId === regla.opcionCondicionId;
    if (activa) aplicabilidad.set(afectadoAtributo.definicionAtributoId, regla.aplicabilidad);
  }

  for (const [id, atributo] of aplicables) {
    const estado = aplicabilidad.get(id);
    if ((estado === "REQUIRED" || estado === "CONDITIONAL") && !valores.has(atributo.id)) return fallo("ATRIBUTO_REQUERIDO_AUSENTE");
    if ((estado === "FORBIDDEN" || estado === "NOT_APPLICABLE") && valores.has(atributo.id)) return fallo("ATRIBUTO_PROHIBIDO");
    if (!valores.has(atributo.id)) continue;
    const valor = valores.get(atributo.id)!;
    if (typeof valor.valor === "number" && !Number.isFinite(valor.valor)) return fallo("NUMERO_NO_FINITO");
    const def = atributo.definicion;
    if (!def) return fallo("DEFINICION_INEXISTENTE");
    const correcto = (def.tipoDato === "TEXTO" && typeof valor.valor === "string") ||
      (def.tipoDato === "NUMERO" && typeof valor.valor === "number") ||
      (def.tipoDato === "BOOLEANO" && typeof valor.valor === "boolean") ||
      (def.tipoDato === "OPCION" && typeof valor.valor === "string" && valor.opcionAtributoId !== undefined);
    if (!correcto || (def.tipoDato !== "OPCION" && valor.opcionAtributoId !== undefined)) return fallo("TIPO_DE_VALOR_INVALIDO");
    if (valor.opcionAtributoId !== undefined) {
      const opcion = snapshot.opciones.find(option => option.id === valor.opcionAtributoId);
      if (!opcion?.activo || opcion.definicionAtributoId !== def.id) return fallo("OPCION_INVALIDA");
    }
  }
  return { ok: true, value: { atributos: aplicables, valores, aplicabilidad } };
}

function fallo(code: FalloValidacion): ResultadoDominio { return { ok: false, code }; }
