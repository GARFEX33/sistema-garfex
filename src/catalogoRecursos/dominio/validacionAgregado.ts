export type AggregateStatus = "VALID" | "INVALID" | "NOT_EVALUATED";
export type AggregateViolationCode = "HIERARCHY_REFERENCE_INVALID" | "PRINCIPAL_UNIT_COUNT" | "UNIT_INACTIVE" | "OPTION_SET_EMPTY" | "ASSIGNMENT_SELECTION_INVALID" | "RULE_REFERENCE_INVALID" | "RULE_RESULT_INVALID" | "RULE_CONFLICT" | "PRESENTATION_COUNT" | "PRESENTATION_TOKEN_INVALID" | "COMPATIBILITY_POLICY_CONFLICT" | "ALLOWLIST_EMPTY" | "CATALOG_LIMIT_EXCEEDED";
export type AggregateViolation = { code: AggregateViolationCode; detail?: string };

export type AgregadoInput = {
  effective: boolean;
  hierarchy: { typeId: string; familyId: string; classId: string; familyOfTypeId: string; classOfFamilyId: string };
  principalUnits: Array<{ active: boolean; unitActive: boolean; principal?: boolean }>;
  presentationPolicies: Array<{ active: boolean; tokenCount: number; violations?: AggregateViolation[] }>;
  compatibilityPolicies?: Array<{ active: boolean; allowlist: boolean; hasRelation: boolean; valid?: boolean }>;
  deferredChecks?: Array<{ status: AggregateStatus; violations?: AggregateViolation[] }>;
};

export type ResultadoAgregado = { status: AggregateStatus; violations: AggregateViolation[] };

export function validarAgregado(input: AgregadoInput): ResultadoAgregado {
  if (!input.effective) return { status: "NOT_EVALUATED", violations: [] };
  const violations: AggregateViolation[] = [];
  if (input.hierarchy.familyOfTypeId !== input.hierarchy.familyId || input.hierarchy.classOfFamilyId !== input.hierarchy.classId)
    violations.push({ code: "HIERARCHY_REFERENCE_INVALID" });
  const principals = input.principalUnits.filter(policy => policy.active && policy.principal !== false);
  if (principals.length !== 1) violations.push({ code: "PRINCIPAL_UNIT_COUNT", detail: `expected one principal, got ${principals.length}` });
  if (principals.some(policy => !policy.unitActive)) violations.push({ code: "UNIT_INACTIVE" });
  const presentations = input.presentationPolicies.filter(policy => policy.active);
  if (presentations.length !== 1) violations.push({ code: "PRESENTATION_COUNT", detail: `expected one active presentation, got ${presentations.length}` });
  if (presentations.some(policy => policy.tokenCount < 1)) violations.push({ code: "PRESENTATION_TOKEN_INVALID" });
  for (const policy of presentations) violations.push(...(policy.violations ?? []));
  for (const policy of input.compatibilityPolicies ?? []) if (policy.active) {
    if (policy.valid === false) violations.push({ code: "COMPATIBILITY_POLICY_CONFLICT" });
    else if (policy.allowlist && !policy.hasRelation) violations.push({ code: "ALLOWLIST_EMPTY" });
  }
  for (const check of input.deferredChecks ?? []) violations.push(...(check.violations ?? []));
  const deferred = (input.deferredChecks ?? []).some(check => check.status === "NOT_EVALUATED");
  return { status: violations.length ? "INVALID" : deferred ? "NOT_EVALUATED" : "VALID", violations };
}
