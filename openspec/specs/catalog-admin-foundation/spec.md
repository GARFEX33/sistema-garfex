# Catalog Admin Foundation Specification

## Purpose

Define the common administrative contract for structured failures, optimistic revisions, draft/effective lifecycle, paginated reads, and the generated Convex boundary consumed by a separate React application.

## Requirements

### Requirement: Structured administrative failures

Every failed administrative command MUST return a structured application error whose machine contract is `code` plus validated `context`; human-readable `message` text MUST NOT be required for programmatic handling. The stable codes MUST have these meanings:

| Code | Meaning |
|---|---|
| `ADMIN_NOT_FOUND` | A commanded entity does not exist. |
| `ADMIN_DUPLICATE_KEY` | A key or normalized relation identity conflicts in its defined scope. |
| `ADMIN_INVALID_REFERENCE` | A referenced entity is missing, belongs to another aggregate, or has an incompatible kind. |
| `ADMIN_IMMUTABLE_FIELD` | A command attempts to change an immutable key, owner, parent, or endpoint identity. |
| `ADMIN_STALE_REVISION` | `expectedRevision` differs from the current revision. |
| `ADMIN_INVALID_STATE` | The requested lifecycle state or active configuration is intrinsically invalid. |
| `ADMIN_DEPENDENCY_BLOCKED` | Active dependents make the command unsafe. |
| `ADMIN_AGGREGATE_INCOMPLETE` | The post-command aggregate lacks required effective configuration. |
| `ADMIN_CONFLICT` | Individually valid records produce an ambiguous or contradictory effective policy. |
| `ADMIN_INVALID_ARGUMENT` | An argument fails a documented value or pagination constraint. |
| `ADMIN_PUBLICATION_INVALID` | The effective catalog cannot be published; context identifies its violations. |

Error context MUST expose only safe machine fields needed for correction, such as entity kind/ID, field, key, scope ID, relation kind, blocker ID, expected/current revision, or a list of coded violations. A failed command MUST commit no partial writes.

#### Scenario: React handles a stale write without parsing prose

- GIVEN an entity currently at revision 7
- WHEN an admin command supplies `expectedRevision` 6
- THEN the command fails with code `ADMIN_STALE_REVISION`
- AND context reports expected revision 6 and current revision 7
- AND no catalog record is changed.

#### Scenario: Validation reports multiple safe violations

- GIVEN publication finds multiple invalid effective aggregates
- WHEN the command fails
- THEN it returns `ADMIN_PUBLICATION_INVALID`
- AND context contains coded violations with safe entity references
- AND changing the human message would not change the machine contract.

### Requirement: Optimistic revision semantics

Every command that updates an existing record or requests its activation/deactivation MUST require the caller's `expectedRevision`. Revision validation MUST occur before same-state handling, dependency checks, or aggregate validation. Every command that materially changes one record MUST increment that record's revision by exactly one; creation MUST initialize revision to 1.

#### Scenario: Current update succeeds

- GIVEN a record at revision 3
- WHEN a valid update supplies `expectedRevision` 3 and changes a mutable field
- THEN the update succeeds atomically
- AND the returned record is at revision 4.

#### Scenario: Stale same-state lifecycle request still fails

- GIVEN an inactive record at revision 5
- WHEN deactivation is requested with `expectedRevision` 4
- THEN the command fails with `ADMIN_STALE_REVISION`
- AND it is not treated as an idempotent success.

### Requirement: Idempotent lifecycle and no hard deletion

After a successful revision check, activation of an already active record and deactivation of an already inactive record MUST succeed as no-ops, return the current record, and leave its revision unchanged. Administrative APIs MUST NOT expose a hard-delete command for catalog records or published revisions.

#### Scenario: Same-state command is a no-op

- GIVEN an active record at revision 8
- WHEN activation is requested with `expectedRevision` 8
- THEN the command succeeds
- AND the record remains at revision 8
- AND no dependent record is modified.

#### Scenario: Catalog data cannot be hard-deleted

- GIVEN any catalog entity or published revision
- WHEN the generated admin contract is inspected
- THEN it exposes lifecycle commands where applicable
- AND it exposes no hard-delete command.

### Requirement: Draft and effective-state matrix

Admin detail and list reads MUST expose stored lifecycle state and whether the record is currently effective. Effectiveness MUST follow this matrix:

| Own state | Required owner/parent chain | Result |
|---|---|---|
| Inactive | Any | Stored inactive draft; inert. |
| Active | Any required owner/parent inactive | Stored active configuration; inert. |
| Active | All required owners/parents active | Effective, subject to aggregate validity. |

Inactive or inert records MUST remain visible to admin reads but MUST NOT affect existing public catalog behavior or publication output. Malformed references are never valid drafts: referenced owners MUST exist and belong to the declared aggregate even when inactive. Incomplete related configuration MAY be saved only while the incomplete record is inactive. Activating a configuration MUST validate its relevant policy aggregate; activating a hierarchy Type MUST validate the complete Type aggregate.

#### Scenario: Draft under inactive hierarchy remains inert

- GIVEN an inactive Family with stored Type configuration
- AND the configuration is active but its required Family owner is inactive
- WHEN admin and public reads are performed
- THEN the admin read returns the stored configuration as ineffective
- AND existing public behavior does not use it
- AND publication excludes it.

#### Scenario: Incomplete configuration cannot become active

- GIVEN an inactive configuration whose relevant aggregate is incomplete
- WHEN activation is requested with the current revision
- THEN the command fails with `ADMIN_AGGREGATE_INCOMPLETE`
- AND the configuration remains an inactive draft.

### Requirement: Post-command integrity for effective aggregates

A command that would alter an already effective aggregate MUST validate the affected aggregate's post-command state before commit. It MUST reject a change that would leave effective configuration incomplete, contradictory, or invalid. Administrators MAY stage such a transition by first making the owning hierarchy branch inactive, editing inert drafts, and reactivating the branch after full validation.

#### Scenario: Active aggregate cannot be broken in place

- GIVEN an effective Type with exactly one principal unit policy
- WHEN the principal policy is deactivated while the Type remains effective
- THEN the command fails with `ADMIN_AGGREGATE_INCOMPLETE`
- AND the policy remains active.

#### Scenario: Inactive branch permits staged repair

- GIVEN a Type and its parent chain are inactive
- WHEN incomplete related records are created or edited as inactive drafts
- THEN those commands may succeed if their direct references are valid
- AND no public or published behavior changes.

### Requirement: Cursor-paginated administrative reads

Every administrative collection read MUST use an opaque cursor, a bounded page size, deterministic indexed ordering, and explicit filters. Unless a lifecycle filter is supplied, lists MUST include active and inactive records. Lifecycle filter values MUST be `ALL`, `ACTIVE`, or `INACTIVE`; parent/scope filters and lifecycle filters MUST combine with logical AND. Each result MUST include the page items, a continuation cursor or null, and an exhaustion indicator. Reusing a cursor with different filters or ordering MUST fail with `ADMIN_INVALID_ARGUMENT`.

Direct detail reads MUST address one record by ID without scanning a collection, MUST expose stored inactive/inert state, and MUST return null when that ID does not exist. In the absence of concurrent writes, traversing all pages MUST return each matching record exactly once.

#### Scenario: Admin lists drafts by default

- GIVEN a scope containing active and inactive records
- WHEN its list is requested without a lifecycle filter
- THEN both states are eligible for the page
- AND items follow the domain's documented stable order.

#### Scenario: Cursor cannot be reused under another filter

- GIVEN a cursor obtained for active records under one parent
- WHEN it is supplied with the inactive filter or another parent
- THEN the query fails with `ADMIN_INVALID_ARGUMENT`.

#### Scenario: Missing detail is explicit

- GIVEN a well-formed ID that identifies no stored record
- WHEN the corresponding admin detail query is called
- THEN it returns null.

### Requirement: Additive generated Convex contract

The complete administration surface MUST be exposed as separate public Convex admin references with validated arguments and returns so Convex-generated `api` and `dataModel` TypeScript types are the portable contract for the React consumer. Existing public catalog, resource, and historical snapshot function names, arguments, return shapes, and compatibility behavior MUST remain available. Business validation MUST remain backend-authoritative; the change MUST NOT introduce a manually maintained DTO, SDK, parallel contract package, or frontend-owned validation rule set.

#### Scenario: React consumes the generated admin surface

- GIVEN generated Convex types are refreshed through the normal toolchain
- WHEN a separate TypeScript React consumer imports the generated contract
- THEN all admin queries, commands, result unions, pagination fields, and structured error data are typed
- AND no manual DTO translation layer is required.

#### Scenario: Existing consumer remains compatible

- GIVEN a consumer compiled against an existing public function
- WHEN the additive admin surface is introduced
- THEN the existing function remains callable with its prior contract
- AND it is not renamed or replaced.

### Requirement: Scope exclusions remain enforced

This change MUST NOT add authentication or authorization policy, seed/fixture product operations, UI implementation, automatic publication after mutations, or automatic rewriting of existing active data or historical snapshots.

#### Scenario: Editing does not publish

- GIVEN an administrator successfully changes effective catalog configuration
- WHEN the command commits
- THEN no catalog revision is published automatically.

#### Scenario: Legacy invalid data is not silently rewritten

- GIVEN pre-existing active data violates a newly explicit aggregate rule
- WHEN admin reads or publication validation encounter it
- THEN the stored row remains unchanged
- AND publication is blocked until corrected through admin commands.

## Acceptance Criteria

- All administrative failures use the fixed code taxonomy and atomic failure semantics.
- Existing-record commands enforce optimistic revisions and idempotent same-state lifecycle behavior.
- Admin details expose stored/effective state and all lists are cursor-paginated with explicit filtering.
- Inert drafts never affect existing public behavior or publication.
- Generated Convex types are the only added client contract and existing public APIs remain compatible.
- No excluded auth, seed, hard-delete, UI, automatic-publication, or manual-DTO capability is introduced.
