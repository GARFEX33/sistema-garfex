# Catalog Attributes and Options Specification

## Purpose

Define attribute definitions, Family/Type assignments, options, applicability, identity participation, order, unit references, and deterministic precedence.

## Requirements

### Requirement: Attribute definition identity and data policy

Administrators MUST be able to create, detail, paginate, update, activate, and deactivate attribute definitions. Definition keys MUST be globally unique and immutable. Supported data types MUST remain `TEXTO`, `NUMERO`, `BOOLEANO`, and `OPCION`.

Only a `NUMERO` definition MAY reference a Unit, and that Unit MUST exist; an effective numeric definition's referenced Unit MUST be active. Only an `OPCION` definition MAY own options. A change to an effective definition MUST be rejected if it would invalidate selected assignments, active rules, presentation, compatibility, or active resource values.

#### Scenario: Non-numeric Unit reference is rejected

- GIVEN an existing Unit
- WHEN a `TEXTO`, `BOOLEANO`, or `OPCION` definition is created with that Unit reference
- THEN creation fails with `ADMIN_INVALID_REFERENCE`.

#### Scenario: Effective type change cannot orphan options

- GIVEN an effective `OPCION` definition has active options and dependents
- WHEN its data type is changed to `TEXTO`
- THEN the command fails with `ADMIN_DEPENDENCY_BLOCKED`
- AND the definition is unchanged.

### Requirement: Option ownership and scoped identity

Administrators MUST be able to create, detail, paginate, update descriptive fields, activate, and deactivate options under `OPCION` definitions. Option keys MUST be unique within their definition and immutable; the owning definition MUST be immutable. An active option MUST have an active `OPCION` definition to be effective. An option change MUST be rejected if it would invalidate an effective rule, compatibility relation, or active resource value.

#### Scenario: Option under wrong data type is rejected

- GIVEN a numeric definition
- WHEN an option is created under it
- THEN creation fails with `ADMIN_INVALID_REFERENCE`.

#### Scenario: Same Option key in different definitions is allowed

- GIVEN an Option key exists under one `OPCION` definition
- WHEN the same key is created under another `OPCION` definition
- THEN creation succeeds.

### Requirement: Assignment ownership and uniqueness

An attribute assignment MUST belong to a Family or to a Type in that Family and MUST reference one existing definition. At most one assignment MAY exist for `(Family, optional Type, definition)`, regardless of lifecycle state. Family, optional Type, and definition references MUST be immutable. Applicability, identity participation, order, and lifecycle state MUST be administrable under optimistic revision and post-command aggregate validation.

#### Scenario: Cross-Family Type assignment is rejected

- GIVEN a Type belongs to Family A
- WHEN an assignment declares Family B and that Type
- THEN the command fails with `ADMIN_INVALID_REFERENCE`.

#### Scenario: Duplicate assignment is rejected even when inactive

- GIVEN an inactive Type assignment exists for one definition
- WHEN another assignment is created for the same Type and definition
- THEN creation fails with `ADMIN_DUPLICATE_KEY`.

### Requirement: Exact assignment precedence and applicability

For each definition and Type, assignment selection MUST occur before lifecycle/applicability filtering:

| Type assignment | Family assignment | Selected result |
|---|---|---|
| Exists | Any | Type assignment |
| Absent | Exists | Family assignment |
| Absent | Absent | No attribute |

An inactive selected Type assignment MUST intentionally suppress its Family assignment. A selected assignment contributes an effective input attribute only when the assignment and definition are active and its hierarchy is effective. `FORBIDDEN` and `NOT_APPLICABLE` selected assignments MUST suppress inherited behavior and reject supplied resource values; they MUST NOT appear as value-bearing published attributes. `CONDITIONAL` MUST have baseline `OPTIONAL` behavior until a matching active rule changes it. `REQUIRED` and `OPTIONAL` retain their literal meanings.

#### Scenario: Type assignment overrides Family assignment

- GIVEN a Family assignment is `REQUIRED`
- AND its Type has an active assignment for the same definition marked `OPTIONAL`
- WHEN effective attributes are resolved
- THEN the Type sees one `OPTIONAL` assignment
- AND the Family assignment is not also applied.

#### Scenario: Inactive override neutralizes inheritance

- GIVEN an active Family assignment
- AND an inactive Type assignment for the same definition
- WHEN effective attributes are resolved for the Type
- THEN that definition is absent for the Type.

#### Scenario: Forbidden override rejects a value

- GIVEN a selected effective assignment is `FORBIDDEN`
- WHEN a resource command supplies a value for it
- THEN backend validation rejects the value
- AND the assignment is absent from published value-bearing attributes.

### Requirement: Option completeness and value membership

An effective `OPCION` assignment MUST resolve at least one effective option. Resource values for an option assignment MUST identify an active option owned by that assignment's definition. A value for any other option, an inactive option, or an option from another definition MUST be rejected by backend validation.

#### Scenario: Option assignment without options cannot activate

- GIVEN an inactive `OPCION` assignment resolves no active option
- WHEN activation would make it effective
- THEN activation fails with `ADMIN_AGGREGATE_INCOMPLETE`.

#### Scenario: Cross-definition option is rejected

- GIVEN two option definitions each have active options
- WHEN a resource supplies an option owned by the other definition
- THEN backend validation rejects it as an invalid option.

### Requirement: Identity participation and deterministic order

The effective assignment's `participaIdentidad` flag MUST be the authoritative identity-participation setting for that Type. Inactive, shadowed, `FORBIDDEN`, and `NOT_APPLICABLE` assignments MUST NOT contribute identity values. Existing backend identity generation remains authoritative and MUST observe Type-over-Family precedence.

Effective value-bearing attributes MUST sort by ascending numeric `orden`, then definition key by Unicode code point, then assignment ID. Ordering ties MUST therefore be deterministic; no uniqueness constraint on `orden` is required.

#### Scenario: Shadowed identity flag has no effect

- GIVEN a Family assignment participates in identity
- AND a selected Type override for the same definition does not
- WHEN identity is computed
- THEN that definition does not participate for the Type.

#### Scenario: Equal orders are deterministic

- GIVEN two effective assignments have the same `orden`
- WHEN admin or publication ordering is produced repeatedly
- THEN their definition-key/ID tie-break order is stable.

### Requirement: Attribute administrative reads

Admin APIs MUST provide direct details and paginated lists for definitions, assignments, and options. Definition and option lists MUST order by scope key then ID. Assignment lists MUST support Family, Type, definition, applicability, identity-participation, and lifecycle filters and order by scope, numeric order, definition identity, then assignment ID. Reads MUST expose stored state, selected/shadowed status in a requested Type context, and effectiveness.

#### Scenario: Admin sees both inherited and overriding rows

- GIVEN a Type override shadows a Family assignment
- WHEN assignments are listed in that Type context
- THEN both stored records are visible
- AND their selected/shadowed status is explicit.

## Acceptance Criteria

- Definitions, assignments, and options have complete admin lifecycle/read coverage.
- Data types, unit references, option ownership, and scoped uniqueness are enforced.
- Type-over-Family precedence and inactive suppression follow the exact matrix.
- Applicability, identity participation, and ordering are deterministic and backend-authoritative.
- Effective option assignments and resource option values enforce active membership.
