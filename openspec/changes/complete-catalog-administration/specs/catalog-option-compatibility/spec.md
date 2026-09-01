# Catalog Option Compatibility Specification

## Purpose

Define unambiguous allowlist/denylist option compatibility policies, directional/symmetric scope, relation identity, and inert lifecycle behavior.

## Requirements

### Requirement: Compatibility policy endpoints

A compatibility policy MUST belong to one Type and reference two distinct assignments selected as effective `OPCION` attributes for that Type before activation. Type and endpoint references MUST be immutable. Mode (`ALLOWLIST` or `DENYLIST`), direction (`DIRECTIONAL` or `SYMMETRIC`), and lifecycle state MAY change only when the post-command effective policy set remains valid.

#### Scenario: Non-option endpoint is rejected

- GIVEN one endpoint assignment is numeric
- WHEN a policy using it is activated
- THEN activation fails with `ADMIN_INVALID_REFERENCE`.

#### Scenario: Endpoint from another Type is rejected

- GIVEN an option assignment is not selected for the owning Type
- WHEN it is used as an endpoint
- THEN the command fails with `ADMIN_INVALID_REFERENCE`.

### Requirement: Exact active-policy conflict matrix

Active policies for endpoint attributes A and B MUST obey this matrix:

| Existing active policy | Proposed active policy | Result |
|---|---|---|
| Directional A→B | Directional A→B | Conflict |
| Directional A→B | Directional B→A | Allowed |
| Directional A→B or B→A | Symmetric A↔B | Conflict |
| Symmetric A↔B | Directional A→B or B→A | Conflict |
| Symmetric A↔B | Symmetric B↔A | Conflict |

Mode does not create another slot: an allowlist and denylist with the same directional or normalized symmetric identity conflict. Inactive policy drafts do not occupy a slot. Conflicts MUST fail with `ADMIN_CONFLICT` without implicitly deactivating any policy.

#### Scenario: Reverse directional policies coexist

- GIVEN an active directional policy A→B
- WHEN a directional policy B→A is activated
- THEN activation may succeed if both aggregates are otherwise valid.

#### Scenario: Symmetric policy conflicts with a directional policy

- GIVEN an active directional policy A→B
- WHEN a symmetric A↔B policy is activated
- THEN activation fails with `ADMIN_CONFLICT`.

### Requirement: Relation ownership and normalized uniqueness

A relation MUST belong to one compatibility policy and reference one active option from its source endpoint definition and one active option from its destination endpoint definition before activation. Policy and option references MUST be immutable. For a directional policy, relation identity is the ordered source/destination option pair. For a symmetric policy, reversed pairs are the same normalized identity. A duplicate identity MUST fail with `ADMIN_DUPLICATE_KEY` regardless of relation lifecycle state.

Active relations beneath an inactive policy MAY remain stored but are inert. A relation without an owning policy or with an option outside its endpoints MUST never become effective.

#### Scenario: Reversed symmetric duplicate is rejected

- GIVEN a symmetric policy stores relation option A1↔B1
- WHEN a relation with the normalized reverse identity is created
- THEN creation fails with `ADMIN_DUPLICATE_KEY`.

#### Scenario: Relation option outside endpoint is rejected

- GIVEN an option belongs to a third definition
- WHEN a relation uses it for either endpoint
- THEN the command fails with `ADMIN_INVALID_REFERENCE`.

### Requirement: Exact allowlist and denylist evaluation

For an applicable policy, compatibility MUST follow this matrix:

| Mode | Pair present as active relation | Pair absent |
|---|---|---|
| `ALLOWLIST` | Allowed | Denied |
| `DENYLIST` | Denied | Allowed |

A directional policy MUST apply only from its source attribute to its destination attribute. A symmetric policy MUST apply in both attribute directions and match its normalized relation in either direction. When no active applicable policy exists, the option pair MUST be allowed. An active allowlist MUST contain at least one active valid relation; an active denylist MAY contain none.

#### Scenario: Empty allowlist cannot activate

- GIVEN an inactive allowlist has no active relations
- WHEN the policy is activated
- THEN activation fails with `ADMIN_AGGREGATE_INCOMPLETE`.

#### Scenario: Empty denylist allows all pairs

- GIVEN an active denylist has no active relations
- WHEN a valid endpoint option pair is evaluated
- THEN the pair is allowed.

#### Scenario: Reverse call ignores directional policy

- GIVEN only a directional A→B denylist contains A1→B1
- WHEN compatibility is evaluated from B1 to A1
- THEN that policy is not applicable
- AND, absent another applicable policy, the pair is allowed.

### Requirement: Effective-state and dependency safety

A policy is effective only under an effective Type with effective endpoint assignments; a relation is effective only when its policy and both options are effective. Inactive or hierarchy-inert policies/relations MUST not constrain resource values or publication. Commands that would orphan effective policies or relations MUST fail with `ADMIN_DEPENDENCY_BLOCKED`; staged repairs require first making the owning Type or policy inert.

#### Scenario: Inactive policy relations do not deny values

- GIVEN an inactive denylist has active stored relations
- WHEN a resource pair is evaluated
- THEN those relations have no effect.

#### Scenario: Endpoint option cannot be deactivated in use

- GIVEN an effective relation references an active option
- WHEN that option is deactivated
- THEN the command fails with `ADMIN_DEPENDENCY_BLOCKED`.

### Requirement: Compatibility administrative reads

Admin APIs MUST provide direct details and paginated lists for policies and relations. Policy lists MUST filter by Type, endpoint, mode, direction, and lifecycle state and order by Type ID, normalized endpoints, direction, then policy ID. Relation lists MUST filter by policy, endpoint option, and lifecycle state and order by policy ID, normalized option pair, then relation ID. Results MUST expose stored/effective state and normalized identity.

#### Scenario: Admin can inspect inert relations

- GIVEN an inactive policy owns stored relations
- WHEN relations are listed for that policy
- THEN all stored relations are visible
- AND each is reported as ineffective.

## Acceptance Criteria

- Policies and relations have complete draft/lifecycle/read administration.
- Endpoint membership and normalized relation uniqueness are enforced.
- Active policy slots obey the directional/symmetric conflict matrix.
- Allowlist/denylist behavior follows the exact evaluation matrix.
- Inactive-parent configuration remains stored but has no runtime or publication effect.
