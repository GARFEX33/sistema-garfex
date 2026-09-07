import type { Aplicabilidad, ValorEntrada } from "./tipos";

export type ResultadoRegla = Exclude<Aplicabilidad, "CONDITIONAL">;
export type ReglaCondicional = {
  id: string;
  atributoCondicionId: string;
  opcionCondicionId?: string;
  valorPermitidoCondicionId?: string;
  atributoAfectadoId: string;
  aplicabilidad: Aplicabilidad;
  activo: boolean;
};
export type ConflictoRegla = { affectedId: string; firstRuleId: string; secondRuleId: string };

const resultado = (value: Aplicabilidad): ResultadoRegla => value === "CONDITIONAL" ? "OPTIONAL" : value;
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

/** Selection-only predicates never become legacy presence predicates. */
export function proyectarReglasLegado(rules: readonly ReglaCondicional[]): ReglaCondicional[] {
  return rules.filter(rule => rule.valorPermitidoCondicionId === undefined || rule.opcionCondicionId !== undefined);
}

/** Legacy-only rows are rollout input and are excluded until mapped by the compatibility seam. */
export function proyectarReglasSeleccion(rules: readonly ReglaCondicional[]): ReglaCondicional[] {
  return rules.filter(rule => rule.valorPermitidoCondicionId !== undefined || rule.opcionCondicionId === undefined);
}

/** Two conditions are co-fireable unless they are different exact references of one assignment. */
function puedenDisparar(left: ReglaCondicional, right: ReglaCondicional, reference: "opcionCondicionId" | "valorPermitidoCondicionId"): boolean {
  return left.atributoCondicionId !== right.atributoCondicionId || left[reference] === undefined || right[reference] === undefined || left[reference] === right[reference];
}

export function puedenDispararJuntas(left: ReglaCondicional, right: ReglaCondicional): boolean {
  return puedenDisparar(left, right, "opcionCondicionId");
}

function detectarConflictos(rules: readonly ReglaCondicional[], reference: "opcionCondicionId" | "valorPermitidoCondicionId"): ConflictoRegla[] {
  const active = rules.filter(rule => rule.activo).slice().sort((a, b) => compare(a.id, b.id));
  const conflicts: ConflictoRegla[] = [];
  for (let i = 0; i < active.length; i += 1) for (let j = i + 1; j < active.length; j += 1) {
    const left = active[i], right = active[j];
    if (left.atributoAfectadoId === right.atributoAfectadoId && left.aplicabilidad !== right.aplicabilidad && puedenDisparar(left, right, reference))
      conflicts.push({ affectedId: left.atributoAfectadoId, firstRuleId: left.id, secondRuleId: right.id });
  }
  return conflicts;
}

export function detectarConflictosReglas(rules: readonly ReglaCondicional[]): ConflictoRegla[] {
  return detectarConflictos(proyectarReglasLegado(rules), "opcionCondicionId");
}

export function detectarConflictosReglasSeleccion(rules: readonly ReglaCondicional[]): ConflictoRegla[] {
  return detectarConflictos(proyectarReglasSeleccion(rules), "valorPermitidoCondicionId");
}

function resolverReglas(rules: readonly ReglaCondicional[], values: ReadonlyMap<string, unknown>, base: ReadonlyMap<string, Aplicabilidad>, reference: "opcionCondicionId" | "valorPermitidoCondicionId", valueForReference: (value: unknown) => string | undefined): Map<string, ResultadoRegla> {
  const result = new Map<string, ResultadoRegla>();
  for (const [id, applicability] of base) result.set(id, resultado(applicability));
  const fired = new Map<string, Set<ResultadoRegla>>();
  for (const rule of rules.filter(rule => rule.activo).slice().sort((a, b) => compare(a.id, b.id))) {
    const input = values.get(rule.atributoCondicionId);
    if (values.has(rule.atributoCondicionId) && (rule[reference] === undefined || valueForReference(input) === rule[reference])) {
      const valuesForTarget = fired.get(rule.atributoAfectadoId) ?? new Set<ResultadoRegla>();
      valuesForTarget.add(resultado(rule.aplicabilidad));
      fired.set(rule.atributoAfectadoId, valuesForTarget);
    }
  }
  for (const [id, valuesForTarget] of fired) result.set(id, [...valuesForTarget].sort(compare)[0]);
  return result;
}

export function evaluarReglasCondicionales(rules: readonly ReglaCondicional[], values: ReadonlyMap<string, unknown>, base: ReadonlyMap<string, Aplicabilidad>): Map<string, ResultadoRegla> {
  return resolverReglas(proyectarReglasLegado(rules), values, base, "opcionCondicionId", input => typeof input === "object" && input !== null ? (input as ValorEntrada).opcionAtributoId : undefined);
}

export function evaluarReglasCondicionalesSeleccion(rules: readonly ReglaCondicional[], values: ReadonlyMap<string, string>, base: ReadonlyMap<string, Aplicabilidad>): Map<string, ResultadoRegla> {
  return resolverReglas(proyectarReglasSeleccion(rules), values, base, "valorPermitidoCondicionId", input => typeof input === "string" ? input : undefined);
}

export function validarReglasCondicionales(rules: readonly ReglaCondicional[], selectedAssignments: ReadonlySet<string>, activeOptions: ReadonlySet<string> = new Set()): Array<{ code: "RULE_REFERENCE_INVALID" | "RULE_RESULT_INVALID" | "RULE_CONFLICT"; detail?: string }> {
  const violations: Array<{ code: "RULE_REFERENCE_INVALID" | "RULE_RESULT_INVALID" | "RULE_CONFLICT"; detail?: string }> = [];
  for (const rule of proyectarReglasLegado(rules).filter(candidate => candidate.activo)) {
    if (!selectedAssignments.has(rule.atributoCondicionId) || !selectedAssignments.has(rule.atributoAfectadoId) || rule.atributoCondicionId === rule.atributoAfectadoId)
      violations.push({ code: "RULE_REFERENCE_INVALID", detail: rule.id });
    if (rule.aplicabilidad === "CONDITIONAL") violations.push({ code: "RULE_RESULT_INVALID", detail: rule.id });
    if (rule.opcionCondicionId !== undefined && !activeOptions.has(rule.opcionCondicionId)) violations.push({ code: "RULE_REFERENCE_INVALID", detail: rule.id });
  }
  for (const conflict of detectarConflictosReglas(rules)) violations.push({ code: "RULE_CONFLICT", detail: `${conflict.firstRuleId}|${conflict.secondRuleId}` });
  return violations;
}

export const validarConflictosReglas = detectarConflictosReglas;
export const evaluarReglas = evaluarReglasCondicionales;
