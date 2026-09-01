# Resource Administration Writes and Lifecycle Specification

## Purpose

Define atomic, revision-guarded Resource creation, updates, identity rules, and lifecycle changes against the current effective catalog.

## Requirements

### Requirement: Atomic validated Resource creation

Creation MUST validate the complete proposed Resource with the existing Resource validator and completed effective-catalog resolver. It MUST require an effective Class → Family → Type chain, a permitted active Unit, valid assignments, rules, definitions and options, valid values, and an existing active organization when organization ownership is supplied.

The system MUST derive `identificadorTecnico`; callers MUST NOT write it directly. Duplicate identity checks MUST use bounded indexes, include active and inactive Resources, and use global scope for global Resources or organization scope for organization-owned Resources. Creation MUST atomically insert the Resource at revision 1, all values, and any versioned organization alias. Any validation, duplicate, alias, or value-write failure MUST leave all Resource, value, and alias data unchanged.

#### Scenario: Duplicate inactive identity is rejected

- GIVEN an inactive Resource already has a derived identity in the applicable global or organization scope
- WHEN creation derives the same identity in that scope
- THEN creation fails with `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT`
- AND no Resource, value, or alias row is added.

#### Scenario: Alias collision rolls back creation

- GIVEN an organization alias already conflicts with the alias required by a valid proposed Resource
- WHEN creation is requested
- THEN the command fails with `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT`
- AND neither the Resource nor any of its values is stored.

#### Scenario: Failed atomic create leaves no partial aggregate

- GIVEN Resource validation succeeds but an alias or value-row write fails
- WHEN creation executes
- THEN the command fails with a structured `ADMIN_*` error
- AND no Resource, value, or alias change is committed.

### Requirement: Revision-first atomic Resource update

Every update MUST require `expectedRevision` and compare it with the stored revision first, before no-op detection, blockers, immutable-field checks, duplicate checks, or aggregate validation. A stale revision MUST fail with `ADMIN_STALE_REVISION` and change nothing.

After the revision check, a current update MUST validate immutable fields, construct and validate the complete proposed effective aggregate with the existing Resource validator and current effective-catalog resolver, whether the stored Resource is active or inactive, and only then decide whether the candidate is a semantic no-op. An invalid aggregate MUST NOT succeed as `UNCHANGED`. It MUST atomically replace values, apply mutable Resource fields, and increment revision exactly once when a material change succeeds. Duplicate identity checks MUST remain bounded, ownership-scoped, and inclusive of inactive Resources. A failed update MUST preserve the prior Resource, revision, values, and aliases.

#### Scenario: Stale revision wins before a no-op

- GIVEN a Resource is already in the requested data state at revision 9
- WHEN update supplies `expectedRevision` 8
- THEN it fails with `ADMIN_STALE_REVISION`
- AND no validation or no-op success supersedes the stale failure
- AND stored data remains unchanged.

#### Scenario: Failed atomic update preserves the old aggregate

- GIVEN a current update proposes replacement values
- WHEN validation, duplicate checking, or a value write fails
- THEN the command returns a structured `ADMIN_*` failure
- AND the old Resource fields, revision, values, and aliases remain unchanged.

#### Scenario: Update rejects an ineffective catalog

- GIVEN an inactive Resource is stored under a catalog configuration that is now ineffective
- WHEN an update is requested with its current revision
- THEN the update fails with `ADMIN_INVALID_STATE`, `ADMIN_INVALID_REFERENCE`, or `ADMIN_AGGREGATE_INCOMPLETE` and coded context
- AND the historical Resource remains unchanged and inspectable.

### Requirement: Classification, ownership, identity, and active state boundaries

Organization ownership and classification MUST be immutable after creation. An update MUST NOT move a Resource between global and organization scope, between organizations, or to another Type or resolved Class/Family. `identificadorTecnico` MUST remain derived. For an organization-owned Resource, identity-participating value changes MUST be rejected when they would change the derived identity. Historical alias rows MUST NOT be deleted or transferred by normal updates.

Name, description, Unit, and values MAY change only through the guarded update when the complete candidate remains valid. Active state MUST change only through lifecycle commands and MUST NOT be accepted by general update.

#### Scenario: Immutable-field attempt is rejected

- GIVEN an existing Resource
- WHEN update attempts to change its organization ownership, Type or resolved classification, or directly supplied technical identity
- THEN it fails with `ADMIN_IMMUTABLE_FIELD`
- AND all Resource, value, and alias data remains unchanged.

#### Scenario: Organization-owned derived identity cannot drift

- GIVEN an organization-owned Resource has a versioned alias
- WHEN replacement values would change its derived technical identity
- THEN update fails with `ADMIN_IMMUTABLE_FIELD` or `ADMIN_CONFLICT`
- AND no alias is deleted, transferred, or added.

#### Scenario: General update cannot change lifecycle state

- GIVEN a Resource is active
- WHEN general update attempts to set it inactive
- THEN the command fails with a structured administrative error
- AND lifecycle state and revision remain unchanged.

### Requirement: Revision-guarded Resource lifecycle

Activation and deactivation MUST require `expectedRevision` and validate it before same-state handling or business validation. After a successful revision check, a same-state request MUST return `UNCHANGED` and leave the revision unchanged. A state change MUST increment revision exactly once.

Activation MUST validate the complete stored Resource against the current effective catalog and existing Resource rules. Failed activation MUST leave the Resource inactive. Deactivation MUST preserve identity, values, aliases, classification, and ownership; it MUST NOT cascade to catalog configuration or value lifecycle state. Resource administration MUST expose no hard-delete operation.

#### Scenario: Same-state lifecycle is idempotent only for a current revision

- GIVEN an active Resource at revision 5
- WHEN activation is requested with `expectedRevision` 5
- THEN the command returns `UNCHANGED`
- AND the Resource remains at revision 5 with no dependent changes.

#### Scenario: Stale same-state lifecycle fails first

- GIVEN an inactive Resource at revision 5
- WHEN deactivation is requested with `expectedRevision` 4
- THEN it fails with `ADMIN_STALE_REVISION`
- AND it is not reported as `UNCHANGED`.

#### Scenario: Activation rejects an inactive catalog

- GIVEN an inactive Resource references a currently inactive or invalid effective catalog aggregate
- WHEN activation is requested with the current revision
- THEN it fails with `ADMIN_INVALID_STATE`, `ADMIN_INVALID_REFERENCE`, or `ADMIN_AGGREGATE_INCOMPLETE` and coded violations
- AND the Resource remains inactive and unchanged.

#### Scenario: Deactivation does not cascade

- GIVEN an active Resource has stored values and aliases
- WHEN deactivation succeeds with the current revision
- THEN only the Resource lifecycle state and revision change
- AND its values, aliases, catalog records, and published data remain unchanged.

#### Scenario: Missing Resource command fails structurally

- GIVEN a well-formed Resource ID identifies no stored Resource
- WHEN update, activation, or deactivation is requested
- THEN the command fails with `ADMIN_NOT_FOUND`
- AND no data is changed.

## Acceptance Criteria

- Create and update reuse authoritative Resource and effective-catalog validation and commit complete aggregates atomically.
- Derived identities, inactive duplicates, ownership scopes, and organization aliases are checked through bounded atomic behavior.
- Revision checks precede no-op and validation behavior, and material changes increment revision exactly once.
- Classification and ownership are immutable, while active state is lifecycle-controlled.
- Lifecycle commands are current-revision idempotent, activation validates current effectiveness, and deactivation never deletes or cascades.
