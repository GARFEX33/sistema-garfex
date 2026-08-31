# Resource Administration Writes and Lifecycle Specification

## Purpose

Define thin, revision-guarded Resource mutations that rely on Convex atomic transactions and optimistic concurrency control while retaining GARFEX aggregate, identity, ownership, and lifecycle rules.

## Requirements

### Requirement: Thin atomic Resource creation

Creation MUST be one Convex mutation. It MUST reuse the authoritative Resource validator and effective-catalog resolver to validate the complete candidate, including effective Class → Family → Type ownership, permitted active Unit, assignments, rules, definitions, options, values, and active organization when organization ownership is supplied.

The mutation MUST derive `identificadorTecnico`; callers MUST NOT write it directly. Duplicate checks MUST be bounded, ownership-scoped, and inclusive of inactive Resources. Organization alias checks MUST use the existing indexed alias boundary.

After all GARFEX checks pass, the mutation MUST insert Resource revision 1, values, and any organization alias in the same Convex transaction. Convex atomicity and OCC MUST be the rollback and race authority. The implementation MUST NOT add a transaction coordinator, compensating writes, application lock, custom retry protocol, or cache invalidation layer.

#### Scenario: Duplicate inactive identity is rejected

- GIVEN an inactive Resource owns the same derived identity in the applicable scope
- WHEN creation is attempted
- THEN it fails with `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT`
- AND final Resource, value, and alias state is unchanged.

#### Scenario: Alias or value failure leaves no partial aggregate

- GIVEN a valid candidate encounters an alias conflict or value-write failure
- WHEN the mutation fails
- THEN Convex commits none of the mutation writes
- AND final Resource, value, and alias state equals the pre-command state.

#### Scenario: Concurrent equivalent creates have one valid outcome

- GIVEN equivalent creates race for one scoped identity
- WHEN Convex resolves transaction conflicts through OCC
- THEN at most one aggregate is committed for that identity
- AND the other observable outcome is a structured duplicate/conflict failure
- AND no custom lock or retry state is stored.

### Requirement: Revision-first atomic Resource update

Update MUST be one Convex mutation and MUST require `expectedRevision`. It MUST compare the stored revision before no-op detection and GARFEX business validation. A stale revision MUST return `ADMIN_STALE_REVISION` and change nothing.

After the revision check, update MUST:

1. enforce immutable classification, organization ownership, direct technical identity, and lifecycle boundaries;
2. bounded-load stored values using the single authoritative `MAX_RESOURCE_VALUES` definition;
3. construct the complete proposed aggregate;
4. validate current effective catalog and Resource rules;
5. decide semantic no-op only after the candidate is valid;
6. check any changed derived identity through bounded ownership-aware indexes including inactive rows; and
7. atomically replace values and patch mutable Resource fields with one revision increment when material.

Convex transaction atomicity MUST preserve prior state on any failure. Tests MUST assert final state, not implement or depend on compensating behavior or internal retry choreography.

#### Scenario: Stale revision wins before no-op

- GIVEN stored state already equals the proposal at revision 9
- WHEN update supplies revision 8
- THEN it fails with `ADMIN_STALE_REVISION`
- AND final state remains unchanged.

#### Scenario: Invalid candidate cannot become unchanged

- GIVEN the stored Resource is now invalid against current effective catalog state
- WHEN update submits semantically equal mutable values with the current revision
- THEN validation fails with a structured `ADMIN_*` code
- AND `UNCHANGED` is not returned.

#### Scenario: Failed replacement preserves final state

- GIVEN update proposes replacement values
- WHEN validation, duplicate checking, or a write fails
- THEN stored fields, revision, values, and aliases equal their pre-command state.

### Requirement: GARFEX immutable and identity boundaries

Organization ownership and classification MUST remain immutable after creation. Update MUST NOT move a Resource between global and organization scope, between organizations, or to another Type or resolved Class/Family. Technical identity MUST remain derived. Organization-owned identity-participating values MUST NOT change the stored derived identity. Historical aliases MUST NOT be deleted, transferred, or recreated by normal update.

Name, description, Unit, and values MAY change only when the complete candidate is valid. Active state MUST change only through lifecycle mutations.

#### Scenario: Immutable change is rejected

- GIVEN an existing Resource
- WHEN update attempts classification, ownership, direct identity, or active-state change
- THEN it fails with `ADMIN_IMMUTABLE_FIELD` or the established structured conflict code
- AND final aggregate and aliases are unchanged.

### Requirement: Thin revision-guarded lifecycle mutations

Activation and deactivation MUST each be one Convex mutation. Both MUST compare `expectedRevision` before same-state handling. A current same-state command MUST return `UNCHANGED` without incrementing revision; a stale same-state command MUST fail with `ADMIN_STALE_REVISION`.

Activation MUST bounded-load the stored aggregate, validate current effective catalog and Resource rules, re-derive/check identity where required, and patch active state plus one revision increment. Deactivation MUST patch only active state and one revision increment. It MUST preserve values, aliases, identity, classification, ownership, catalog records, publication revisions, and snapshots.

No hard delete, custom transaction layer, compensating write, or cache invalidation is allowed.

#### Scenario: Current same-state lifecycle is unchanged

- GIVEN an active Resource at revision 5
- WHEN activation uses revision 5
- THEN it returns `UNCHANGED`
- AND final revision and aggregate data remain unchanged.

#### Scenario: Failed activation remains inactive

- GIVEN an inactive Resource is invalid against current effective catalog state
- WHEN activation uses the current revision
- THEN it fails with a structured `ADMIN_*` error
- AND final Resource state remains inactive with unchanged revision, values, and aliases.

#### Scenario: Deactivation does not cascade

- GIVEN an active Resource has values and aliases
- WHEN deactivation succeeds
- THEN only active state and revision change
- AND all dependent Resource, catalog, and publication data remains unchanged.

## Verification rules

- Failure tests MUST compare final persisted Resource/value/alias state with the pre-command state.
- OCC tests MUST assert externally visible uniqueness and revision outcomes; they MUST NOT couple to Convex retry counts.
- Revision-first, immutable-field, effective-catalog, identity, alias, and lifecycle rules remain explicit GARFEX behavior.
- No mutation may introduce a cache, lock table, transaction coordinator, compensating action, or manual retry protocol.

## Acceptance Criteria

- Create, update, activate, and deactivate remain thin Convex mutations around GARFEX business rules.
- Convex atomicity and OCC are used directly for commit, rollback, and race behavior.
- Every failure leaves the expected final database state without custom rollback code.
- Revision and domain rules remain fully covered.
