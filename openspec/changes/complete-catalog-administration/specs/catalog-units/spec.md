# Catalog Units and Policies Specification

## Purpose

Define Unit administration and Family/Type unit-policy precedence so every effective Type resolves to one valid principal unit while drafts remain stageable.

## Requirements

### Requirement: Unit administration

Administrators MUST be able to create, read, paginate, update mutable descriptive fields and symbol, activate, and deactivate Units. Unit keys MUST be globally unique and immutable. Unit lists MUST order by key then ID in ascending Unicode code-point order and include inactive Units by default.

A Unit referenced by an active resource MUST NOT be deactivated. A Unit whose deactivation would invalidate any effective Type's principal-unit aggregate or any effective numeric attribute unit reference MUST NOT be deactivated. Such failures MUST use `ADMIN_DEPENDENCY_BLOCKED` and identify a blocker without changing data.

#### Scenario: Duplicate Unit key is rejected

- GIVEN a Unit with a key already exists
- WHEN another Unit is created with that key
- THEN creation fails with `ADMIN_DUPLICATE_KEY`.

#### Scenario: Used Unit cannot be deactivated

- GIVEN an active resource directly uses a Unit
- WHEN that Unit is deactivated with its current revision
- THEN the command fails with `ADMIN_DEPENDENCY_BLOCKED`
- AND the Unit stays active.

### Requirement: Unit-policy ownership and uniqueness

A unit policy MUST belong to exactly one Family scope or to one Type within that Family and MUST reference an existing Unit. At most one policy MAY exist for the same `(Family, optional Type, Unit)` identity, regardless of lifecycle state. Its Family, optional Type, and Unit references MUST be immutable; `principal` and lifecycle state MAY change under aggregate validation.

#### Scenario: Type policy cannot cross Families

- GIVEN a Type belongs to Family A
- WHEN a policy declares Family B and that Type
- THEN the command fails with `ADMIN_INVALID_REFERENCE`
- AND no policy is stored.

#### Scenario: Inactive duplicate still reserves identity

- GIVEN an inactive policy already exists for a Type and Unit
- WHEN another policy is created for the same Type and Unit
- THEN creation fails with `ADMIN_DUPLICATE_KEY`.

### Requirement: Exact Family/Type precedence

For each Unit and Type, effective policy selection MUST follow this matrix before active-state filtering:

| Type-level row for Unit | Family-level row for Unit | Selected row |
|---|---|---|
| Exists, active | Any | Type row |
| Exists, inactive | Any | Type row, which intentionally suppresses inheritance and is inert |
| Absent | Exists | Family row |
| Absent | Absent | None |

A selected policy is usable only when it is active, its Unit is active, and its owning hierarchy is effective. This per-Unit override MUST NOT replace unrelated Family policies for other Units.

#### Scenario: Inactive Type override suppresses inherited Unit

- GIVEN a Family has an active policy for Unit U
- AND its Type has an inactive policy for Unit U
- WHEN effective Units are resolved for the Type
- THEN Unit U is not inherited from the Family.

#### Scenario: Type overrides only one Unit

- GIVEN a Family has active policies for Units U1 and U2
- AND a Type has its own policy only for U1
- WHEN policies are resolved
- THEN the Type row determines U1
- AND the Family row still determines U2.

### Requirement: Exactly one effective principal Unit

Every effective Type MUST resolve to exactly one usable selected policy marked `principal`. Additional usable non-principal Units MAY be allowed. Activating a Type or publishing the catalog MUST reject zero or multiple principal Units with `ADMIN_AGGREGATE_INCOMPLETE` or `ADMIN_PUBLICATION_INVALID`, respectively. Activating or changing a policy that affects an effective Type MUST preserve exactly one principal Unit for every affected effective Type.

#### Scenario: No principal blocks Type activation

- GIVEN an inactive Type resolves only non-principal policies
- WHEN the Type is activated
- THEN activation fails with `ADMIN_AGGREGATE_INCOMPLETE`.

#### Scenario: Two principals block policy activation

- GIVEN an effective Type already resolves one principal Unit
- WHEN another selected policy is activated as principal
- THEN activation fails with `ADMIN_CONFLICT`
- AND both policies retain their prior states.

#### Scenario: Inert policy draft does not affect resolution

- GIVEN an inactive Type contains incomplete inactive unit-policy drafts
- WHEN another effective Type or publication is evaluated
- THEN those drafts do not affect principal resolution.

### Requirement: Unit-policy administrative reads

Admin APIs MUST provide policy detail and cursor-paginated policy lists filterable by Family, Type, Unit, and lifecycle state. Ordering MUST be by Family ID, optional Type ID with Family-level rows first, Unit ID, then policy ID. Results MUST expose stored state, principal flag, revision, selected/shadowed status for a requested Type when applicable, and current effectiveness.

#### Scenario: Admin can diagnose a shadowed Family policy

- GIVEN a Type-level policy exists for the same Unit as a Family policy
- WHEN policies are listed for that Type's resolution
- THEN both stored rows are visible
- AND the Family row is identified as shadowed for that Type.

## Acceptance Criteria

- Units and Family/Type policies are fully administrable without hard deletion.
- Policy identity and cross-Family references are validated.
- Per-Unit Type override, including inactive suppression, follows the exact precedence matrix.
- Every effective Type has exactly one active principal Unit.
- Unit and policy changes cannot invalidate effective Types or active resources.
