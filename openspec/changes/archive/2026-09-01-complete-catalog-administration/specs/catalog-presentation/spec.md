# Catalog Canonical Presentation Specification

## Purpose

Define draftable, deterministic per-Type canonical presentation policies whose active form is complete and safe to publish.

## Requirements

### Requirement: Presentation policy lifecycle and cardinality

Administrators MUST be able to create, detail, paginate, update, activate, and deactivate presentation policies owned by a Type. The owning Type is immutable. Multiple inactive drafts MAY coexist, but an effective Type MUST have exactly one active policy. Activating a policy while another policy for that Type is active MUST fail with `ADMIN_CONFLICT`; no implicit replacement or deactivation is allowed.

#### Scenario: Multiple drafts are allowed

- GIVEN a Type has multiple inactive presentation policies
- WHEN they are read by the admin API
- THEN all drafts are returned
- AND none affects public or publication output.

#### Scenario: Second active policy is rejected

- GIVEN a Type already has one active presentation policy
- WHEN another policy is activated
- THEN activation fails with `ADMIN_CONFLICT`
- AND the first policy remains the sole active policy.

### Requirement: Valid token sequence

A presentation policy MUST have at least one token and a nonblank separator no longer than 100 characters. Supported tokens MUST be:

- `TYPE_NAME`;
- `ATTRIBUTE_VALUE` referencing an assignment selected as an effective value-bearing attribute for the owning Type; and
- `LITERAL` containing nonblank text no longer than 1000 characters.

At least one `TYPE_NAME` or nonblank `LITERAL` token MUST be present so the policy is structurally capable of a nonempty result when optional attribute values are absent. Token order MUST be preserved as semantic order. Invalid or cross-Type attribute references MUST fail with `ADMIN_INVALID_REFERENCE` or `ADMIN_INVALID_STATE` and no partial change.

#### Scenario: Attribute-only policy is rejected

- GIVEN a policy contains only `ATTRIBUTE_VALUE` tokens
- WHEN it is activated
- THEN activation fails with `ADMIN_INVALID_STATE`
- AND it remains inactive.

#### Scenario: Foreign attribute token is rejected

- GIVEN an attribute is not selected as effective for the policy's Type
- WHEN a policy references it
- THEN the command fails with `ADMIN_INVALID_REFERENCE`.

### Requirement: Canonical rendering semantics

Canonical rendering MUST process tokens in stored order. `TYPE_NAME` MUST render the effective Type name; `LITERAL` MUST always render its normalized text; `ATTRIBUTE_VALUE` MUST render the effective submitted value and be omitted when no value exists. Option values MUST render the option name, and numeric values with a Unit symbol MUST include that symbol.

Rendered text, literals, Type names, and separators MUST be Unicode NFC-normalized, trimmed, and have repeated whitespace collapsed. Remaining parts MUST be joined deterministically using the normalized separator. Rendering MUST reject an empty final name rather than returning ambiguous blank output.

#### Scenario: Missing optional attribute is omitted

- GIVEN a valid policy contains Type name, an optional attribute, and a literal
- AND the resource omits the optional attribute
- WHEN its canonical name is rendered
- THEN the attribute token is omitted
- AND the structural tokens still produce a nonempty deterministic name.

#### Scenario: Option uses display name

- GIVEN an `OPCION` attribute has a selected option with a display name
- WHEN its `ATTRIBUTE_VALUE` token is rendered
- THEN the option display name is used rather than its storage ID.

### Requirement: Presentation effectiveness and dependent changes

An active policy is effective only when its Type hierarchy and every referenced assignment/definition are effective. Activating a Type and publishing MUST require exactly one valid effective presentation policy. A command that would invalidate the sole policy of an effective Type MUST be rejected; administrators MAY stage replacement while the Type is inactive.

#### Scenario: Type without presentation cannot activate

- GIVEN an inactive Type has no active valid policy
- WHEN the Type is activated
- THEN activation fails with `ADMIN_AGGREGATE_INCOMPLETE`.

#### Scenario: Inert policy is excluded from publication

- GIVEN an active policy belongs to a Type beneath an inactive Family
- WHEN the catalog is published
- THEN that policy and Type are omitted from publication validation/output.

### Requirement: Presentation administrative reads

Admin APIs MUST provide direct details and paginated policy lists filterable by Type and lifecycle state. Ordering MUST be Type ID, active state, then policy ID. Results MUST preserve token order and expose revision, stored/effective state, and whether another policy currently occupies the Type's active slot.

#### Scenario: Draft editor receives stored token order

- GIVEN an inactive policy has a mixed token sequence
- WHEN its detail is read
- THEN the exact stored token order and references are returned for editing.

## Acceptance Criteria

- Presentation policies support complete admin lifecycle and draft visibility.
- Exactly one active valid policy is required per effective Type, without implicit replacement.
- Token/reference/length constraints and structural nonempty behavior are enforced.
- Rendering is normalized, deterministic, and preserves semantic token order.
- Inactive or parent-inert policies do not affect public behavior or publication.
