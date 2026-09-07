# Catalog Conditional Rules Specification

## Purpose

Define safe, deterministic administration and evaluation of conditional attribute rules for each Type.

## Requirements

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

### Requirement: Rule effects and presence semantics

An active rule MAY set the affected assignment to `REQUIRED`, `OPTIONAL`, `FORBIDDEN`, or `NOT_APPLICABLE`; it MUST NOT set it to `CONDITIONAL`. A rule without a condition option MUST fire when a value is present for its condition assignment. Presence MUST be determined by existence of the submitted value, so valid `false`, numeric `0`, and empty string values count as present. A rule with a condition option MUST fire only when that exact active option is selected.

A selected assignment whose base applicability is `CONDITIONAL` MUST behave as `OPTIONAL` when no active rule fires. Required-value validation MUST also use value presence rather than JavaScript truthiness.

#### Scenario: Boolean false triggers a presence rule

- GIVEN a rule without an option condition observes a Boolean assignment
- WHEN the resource supplies `false`
- THEN the rule fires because the value is present.

#### Scenario: Numeric zero satisfies required applicability

- GIVEN a matching rule makes a numeric assignment `REQUIRED`
- WHEN the resource supplies `0`
- THEN the required check succeeds.

#### Scenario: Conditional baseline is optional

- GIVEN an effective assignment is `CONDITIONAL`
- AND none of its active rules fire
- WHEN a resource omits that assignment
- THEN omission is valid.

### Requirement: Conflict-free deterministic rule sets

The active rules for one Type MUST be order-independent. For every affected assignment and every realizable combination of condition values, all rules that can fire together MUST yield the same resulting applicability. If two co-activatable rules can yield different results, activation or update MUST fail with `ADMIN_CONFLICT`. Multiple co-activatable rules yielding the same result MAY coexist; exact duplicate identities remain forbidden.

Rules MUST NOT form applicability dependencies on their affected attribute's resulting presence, and a rule MUST NOT target its own condition assignment. Runtime evaluation MUST therefore require no iterative or order-dependent cycle resolution.

#### Scenario: Contradictory co-active rules are rejected

- GIVEN one active rule can make an assignment `REQUIRED`
- AND a proposed rule can fire at the same time and make it `FORBIDDEN`
- WHEN the proposed rule is activated
- THEN activation fails with `ADMIN_CONFLICT`
- AND the active rule set is unchanged.

#### Scenario: Same-result rules are deterministic

- GIVEN two distinct conditions can fire together
- AND both set the same affected assignment to `REQUIRED`
- WHEN both conditions are present
- THEN the resulting applicability is `REQUIRED` regardless of storage order.

### Requirement: Rule lifecycle follows effective dependencies

Inactive rules MAY be stored as drafts under inactive Types. An active rule is effective only when its Type hierarchy, condition assignment, affected assignment, definitions, and optional condition option are effective. Activating or changing a rule MUST validate the entire active rule set for the Type. A dependency change MUST be rejected if it would invalidate an effective rule; otherwise the owner branch MUST first be made inactive so the rule becomes inert.

#### Scenario: Draft rule under inactive Type remains inert

- GIVEN a valid active rule is stored under an inactive Type
- WHEN resources or publication are evaluated
- THEN the rule has no effect and is omitted from publication.

#### Scenario: Effective option cannot be removed from a rule

- GIVEN an effective rule depends on an active condition option
- WHEN that option is deactivated while the Type remains effective
- THEN the command fails with `ADMIN_DEPENDENCY_BLOCKED`.

### Requirement: Rule administrative reads

Admin APIs MUST provide direct rule details and cursor-paginated lists filterable by Type, condition assignment, affected assignment, resulting applicability, and lifecycle state. Stable order MUST be Type ID, condition assignment ID, optional option ID, affected assignment ID, then rule ID. Results MUST expose stored state, revision, effectiveness, and coded invalid/inert reasons when applicable.

#### Scenario: Admin can inspect inactive rule drafts

- GIVEN active and inactive rules exist for a Type
- WHEN rules are listed without a lifecycle filter
- THEN both states are returned in stable order
- AND each reports whether it is effective.

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

- Rule references and option ownership are validated within one Type aggregate.
- Presence semantics correctly handle `false`, `0`, and empty string values.
- `CONDITIONAL` defaults to optional and cannot be emitted as a rule result.
- Co-activatable contradictory rules are rejected, making evaluation order-independent.
- Inert rules remain admin-visible but absent from runtime and publication behavior.
