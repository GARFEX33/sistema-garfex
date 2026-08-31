import { aplicabilidadBase } from "./asignacionesEfectivas";
import { evaluarReglasCondicionales } from "./reglasCondicionales";
import { resolverCatalogoEfectivo } from "./catalogoEfectivo";
import type {
  Aplicabilidad, AtributoConDefinicion, CatalogoSnapshot, EntradaRecurso, FalloValidacion,
  IdDominio, ResultadoDominio, ValorEntrada,
} from "./tipos";

export function validarRecurso(snapshot: CatalogoSnapshot, entrada: EntradaRecurso): ResultadoDominio {
  const { clase, familia, tipo, unidad } = snapshot;
  const resolved = resolverCatalogoEfectivo(snapshot);
  if (!resolved.effective || !clase || !familia || !tipo || !unidad?.activo)
    return fallo(resolved.effectiveReasons.includes("HIERARCHY_INVALID") ? "JERARQUIA_INVALIDA" : "JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA");
  if (!resolved.policies.some(policy => policy.unidadId === unidad.id && policy.activo)) return fallo("UNIDAD_NO_PERMITIDA");

  const originalById = new Map(snapshot.atributos.map(row => [row.id, row]));
  const aplicables = new Map<IdDominio, AtributoConDefinicion & { definicion: NonNullable<AtributoConDefinicion["definicion"]> }>();
  for (const selected of resolved.assignments) {
    const atributo = originalById.get(selected.id);
    const definicion = atributo?.definicion;
    if (atributo && atributo.activo && definicion?.activo) aplicables.set(atributo.definicionAtributoId, { ...atributo, definicion });
  }

  const valores = new Map<IdDominio, ValorEntrada>(entrada.valores.map(valor => [valor.atributoRecursoId, valor]));
  if (valores.size !== entrada.valores.length) return fallo("ATRIBUTO_REPETIDO");
  const atributosPorId = new Map([...aplicables.values()].map(atributo => [atributo.id, atributo]));
  for (const valor of entrada.valores) if (!atributosPorId.has(valor.atributoRecursoId)) return fallo("ATRIBUTO_NO_APLICABLE");

  const aplicabilidadBasePorId = new Map<IdDominio, Aplicabilidad>(
    [...aplicables.values()].map(atributo => [atributo.id, aplicabilidadBase(atributo.aplicabilidad)]),
  );
  const aplicabilidad = evaluarReglasCondicionales(resolved.rules, valores, aplicabilidadBasePorId);

  for (const [id, atributo] of aplicables) {
    const estado = aplicabilidad.get(atributo.id);
    if (estado === "REQUIRED" && !valores.has(atributo.id)) return fallo("ATRIBUTO_REQUERIDO_AUSENTE");
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
