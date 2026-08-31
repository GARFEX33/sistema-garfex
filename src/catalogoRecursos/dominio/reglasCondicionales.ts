import type { Aplicabilidad, ValorEntrada } from "./tipos";

export type ResultadoRegla = Exclude<Aplicabilidad, "CONDITIONAL">;
export type ReglaCondicional = {
  id: string;
  atributoCondicionId: string;
  opcionCondicionId?: string;
  atributoAfectadoId: string;
  aplicabilidad: Aplicabilidad;
  activo: boolean;
};
export type ConflictoRegla = { affectedId: string; firstRuleId: string; secondRuleId: string };

const resultado = (value: Aplicabilidad): ResultadoRegla => value === "CONDITIONAL" ? "OPTIONAL" : value;
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

/** Two conditions are co-fireable unless they are different exact options of one assignment. */
export function puedenDispararJuntas(left: ReglaCondicional, right: ReglaCondicional): boolean {
  return left.atributoCondicionId !== right.atributoCondicionId || left.opcionCondicionId === undefined || right.opcionCondicionId === undefined || left.opcionCondicionId === right.opcionCondicionId;
}

export function detectarConflictosReglas(rules: readonly ReglaCondicional[]): ConflictoRegla[] {
  const active = rules.filter(rule => rule.activo).slice().sort((a, b) => compare(a.id, b.id));
  const conflicts: ConflictoRegla[] = [];
  for (let i = 0; i < active.length; i += 1) for (let j = i + 1; j < active.length; j += 1) {
    const left = active[i], right = active[j];
    if (left.atributoAfectadoId === right.atributoAfectadoId && left.aplicabilidad !== right.aplicabilidad && puedenDispararJuntas(left, right))
      conflicts.push({ affectedId: left.atributoAfectadoId, firstRuleId: left.id, secondRuleId: right.id });
  }
  return conflicts;
}

export function evaluarReglasCondicionales(
  rules: readonly ReglaCondicional[], values: ReadonlyMap<string, unknown>, base: ReadonlyMap<string, Aplicabilidad>,
): Map<string, ResultadoRegla> {
  const result = new Map<string, ResultadoRegla>();
  for (const [id, applicability] of base) result.set(id, resultado(applicability));
  const ordered = rules.filter(rule => rule.activo).slice().sort((a, b) => compare(a.id, b.id));
  const fired = new Map<string, Set<ResultadoRegla>>();
  for (const rule of ordered) {
    const input = values.get(rule.atributoCondicionId);
    const present = values.has(rule.atributoCondicionId);
    const option = typeof input === "object" && input !== null ? (input as ValorEntrada).opcionAtributoId : undefined;
    if (present && (rule.opcionCondicionId === undefined || option === rule.opcionCondicionId)) {
      const valuesForTarget = fired.get(rule.atributoAfectadoId) ?? new Set<ResultadoRegla>();
      valuesForTarget.add(resultado(rule.aplicabilidad));
      fired.set(rule.atributoAfectadoId, valuesForTarget);
    }
  }
  for (const [id, valuesForTarget] of fired) result.set(id, [...valuesForTarget].sort(compare)[0]);
  return result;
}

export function validarReglasCondicionales(
  rules: readonly ReglaCondicional[], selectedAssignments: ReadonlySet<string>, activeOptions: ReadonlySet<string> = new Set(),
): Array<{ code: "RULE_REFERENCE_INVALID" | "RULE_RESULT_INVALID" | "RULE_CONFLICT"; detail?: string }> {
  const violations: Array<{ code: "RULE_REFERENCE_INVALID" | "RULE_RESULT_INVALID" | "RULE_CONFLICT"; detail?: string }> = [];
  for (const rule of rules.filter(candidate => candidate.activo)) {
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
