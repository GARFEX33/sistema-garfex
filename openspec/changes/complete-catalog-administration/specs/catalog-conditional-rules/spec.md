# Catalog Conditional Rules Specification

## Purpose

Define safe, deterministic administration and evaluation of conditional attribute rules for each Type.

## Requirements

### Requirement: Rule ownership and references

A conditional rule MUST belong to one Type and reference a condition assignment and affected assignment selected for that same Type. The condition and affected assignments MUST be distinct. An optional condition option MAY be supplied only when the condition definition is `OPCION`, and it MUST be an active option owned by that definition before the rule can be activated.

Rule Type, condition assignment, optional condition option, and affected assignment form immutable rule identity. The resulting applicability and lifecycle state MAY be updated. Exact duplicate rule identity MUST be rejected with `ADMIN_DUPLICATE_KEY` regardless of lifecycle state.

#### Scenario: Foreign Type attribute is rejected

- GIVEN an assignment is not selected for the rule's Type
- WHEN a rule references that assignment
- THEN creation or activation fails with `ADMIN_INVALID_REFERENCE`.

#### Scenario: Condition option must belong to condition definition

- GIVEN an option belongs to another definition
- WHEN it is used as a rule's condition option
- THEN the command fails with `ADMIN_INVALID_REFERENCE`.

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

## Acceptance Criteria

- Rule references and option ownership are validated within one Type aggregate.
- Presence semantics correctly handle `false`, `0`, and empty string values.
- `CONDITIONAL` defaults to optional and cannot be emitted as a rule result.
- Co-activatable contradictory rules are rejected, making evaluation order-independent.
- Inert rules remain admin-visible but absent from runtime and publication behavior.
