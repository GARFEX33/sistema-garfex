# Delta for Catalog Conditional Rules

## MODIFIED Requirements

### Requirement: Rule ownership and references

A conditional rule MUST belong to one Type and reference a condition assignment and affected assignment selected for that same Type. The condition and affected assignments MUST be distinct. A legacy optional condition option MAY be supplied only when the condition definition is `OPCION`, and it MUST be an active option owned by that definition before the rule can be activated. A condition-specific rule MAY retain that legacy option for compatibility and MUST carry the optional `valorPermitidoCondicionId` used by the selection-only evaluator. When supplied, `valorPermitidoCondicionId` MUST identify an active allowed value owned by the condition definition before the rule can be activated.

Rule Type, condition assignment, legacy optional condition option, optional allowed-value condition reference, and affected assignment form immutable rule identity. The resulting applicability and lifecycle state MAY be updated. Exact duplicate rule identity MUST be rejected with `ADMIN_DUPLICATE_KEY` regardless of lifecycle state. Migration MUST backfill the allowed-value reference through the legacy-option mapping without deleting or changing legacy rule references; the selection-only evaluator MUST consume only `valorPermitidoCondicionId`.

(Previously: condition-specific rules referenced only an optional legacy option.)

#### Scenario: Foreign allowed value is rejected

- GIVEN an allowed value belongs to a definition other than the condition assignment's definition
- WHEN it is used as `valorPermitidoCondicionId`
- THEN creation or activation fails with `ADMIN_INVALID_REFERENCE`
- AND the rule is unchanged.

#### Scenario: Backfilled rule remains compatible with legacy consumers

- GIVEN an existing condition-specific rule references a legacy option with a migrated allowed-value mapping
- WHEN the rule migration runs
- THEN the rule retains its legacy option reference and gains the mapped allowed-value reference
- AND legacy rule readers remain able to interpret the stored rule.

## ADDED Requirements

### Requirement: Selection-only conditional predicate evaluation

The selection-only evaluator MUST compare a condition-specific predicate to the selected allowed-value ID, never to an allowed-value label or legacy option ID. A rule with no allowed-value condition reference MUST use the established presence semantics for its condition assignment. Presence MUST continue to distinguish a supplied `false`, numeric `0`, and empty string from absence in shared legacy rule behavior.

After applying the existing conflict-free rule set, each effective assignment in the selection-only flow MUST report one resolved value in its `CreationEvaluation.asignaciones[].aplicabilidadResuelta`: `REQUIRED`, `OPTIONAL`, `FORBIDDEN`, or `NOT_APPLICABLE`. A base `CONDITIONAL` assignment with no firing active rule MUST resolve to `OPTIONAL`; `CONDITIONAL` MUST NOT be returned as a resolved value.

#### Scenario: Matching allowed value makes an assignment required

- GIVEN an active rule predicates on allowed-value ID `valorA`
- AND the condition assignment is selected with `valorA`
- WHEN selection-only applicability is evaluated
- THEN the affected assignment resolves to the rule's configured applicability.

#### Scenario: Nonmatching allowed value does not fire a rule

- GIVEN an active rule predicates on allowed-value ID `valorA`
- AND the condition assignment is selected with a different active allowed-value ID
- WHEN selection-only applicability is evaluated
- THEN that rule does not fire
- AND a base `CONDITIONAL` affected assignment resolves to `OPTIONAL` unless another active rule fires.

## Acceptance Criteria

- Condition-specific rules can carry a mapped allowed-value reference while retaining legacy option references.
- The selection-only evaluator uses allowed-value IDs and never labels or legacy option IDs for condition matching.
- Each resolved selection is exposed through `CreationEvaluation.asignaciones[].aplicabilidadResuelta` as one of `REQUIRED`, `OPTIONAL`, `FORBIDDEN`, or `NOT_APPLICABLE`.
- Legacy presence semantics and legacy rule compatibility are preserved.
