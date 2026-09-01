# Catalog Publication and Revision History Specification

## Purpose

Define explicit validation and publication of deterministic immutable catalog revisions, including unchanged-content behavior and historical reads.

## Requirements

### Requirement: Publication is explicit and organization-scoped

Publication MUST occur only through an explicit admin command naming an existing active organization. Catalog mutations MUST NOT publish automatically. A publication command MUST evaluate one transactional catalog state and either produce a complete success result or create no revision/snapshot rows.

#### Scenario: Mutation does not publish

- GIVEN a latest published revision exists
- WHEN an administrator changes catalog configuration successfully
- THEN the latest revision remains unchanged
- AND no new revision exists until Publish is explicitly invoked.

#### Scenario: Inactive organization cannot publish

- GIVEN the target organization is inactive or missing
- WHEN Publish is invoked
- THEN the command fails with `ADMIN_INVALID_REFERENCE`
- AND no revision is created.

### Requirement: Effective catalog publication boundary

Publication MUST include only Types whose own state, Family, and Class are active. Configuration under an excluded hierarchy branch, or with its own lifecycle inactive, MUST remain stored but be omitted and MUST NOT by itself block publication.

Every included Type MUST pass complete aggregate validation: exactly one usable principal Unit; valid effective attribute definitions, assignments, options, unit references, applicability, identity/order projection; a conflict-free valid rule set; exactly one valid canonical presentation policy; and valid compatibility policies/relations. Effective references MUST not point to inactive or foreign entities. Effective Type keys used by historical direct lookup MUST be unambiguous within the published catalog. Any violation MUST fail the whole command with `ADMIN_PUBLICATION_INVALID`, create no revision, and leave all drafts/configuration unchanged.

#### Scenario: Inert incomplete branch is omitted

- GIVEN an inactive Family contains incomplete Type drafts
- AND all effective Types are valid
- WHEN Publish is invoked
- THEN publication succeeds without the inactive Family's Types
- AND the drafts remain unchanged.

#### Scenario: One invalid effective Type blocks all publication

- GIVEN two effective Types and one lacks a valid presentation policy
- WHEN Publish is invoked
- THEN the command fails with `ADMIN_PUBLICATION_INVALID`
- AND no partial revision or snapshot for the valid Type is created.

#### Scenario: Ambiguous published Type key is rejected

- GIVEN two effective Types in different Families share the Type key used by historical direct lookup
- WHEN Publish is invoked
- THEN publication fails with a coded conflict violation rather than storing an ambiguous revision.

### Requirement: Deterministic canonical content identity

Publication MUST derive a canonical content hash from effective business content, independent of database iteration order, storage IDs, revisions, and timestamps. Canonical ordering MUST use Unicode code-point ordering for identity keys and normalized semantic tuples; attribute presentation order and presentation token order MUST remain semantic and be preserved. Options, rules, compatibility policies, and relation pairs MUST have deterministic tie-break ordering. Equivalent effective content MUST produce the same hash; any observable published-content change MUST produce a different hash.

#### Scenario: Storage order does not change identity

- GIVEN two transactional catalog states have equivalent effective business content inserted in different storage orders
- WHEN each is canonicalized
- THEN both produce the same content hash.

#### Scenario: Semantic presentation order changes identity

- GIVEN a valid published candidate
- WHEN the order of canonical presentation tokens changes
- THEN the canonical content hash changes.

### Requirement: Exact unchanged-publication result

Publish MUST return a discriminated result with disposition `CREATED` or `UNCHANGED`, revision ID, monotonically increasing revision number, and content hash. If the candidate hash equals the latest published revision for the organization, Publish MUST return `UNCHANGED` with that existing latest revision's identity, MUST NOT increment the revision number, and MUST NOT insert or mutate revision/snapshot rows. Otherwise it MUST create the next revision and return `CREATED`.

#### Scenario: Repeated unchanged publication is a no-op

- GIVEN revision 12 is the latest published revision
- AND effective canonical content has not changed
- WHEN Publish is invoked
- THEN it returns disposition `UNCHANGED`, revision 12, and its existing hash
- AND no revision 13 is created.

#### Scenario: Changed content creates next revision

- GIVEN revision 12 is latest
- AND effective canonical content changed validly
- WHEN Publish is invoked
- THEN revision 13 is created with disposition `CREATED`
- AND revision 12 remains unchanged.

### Requirement: Published revisions and snapshots are immutable

A successful `CREATED` publication MUST persist one immutable revision identity and the complete per-Type snapshots for that canonical catalog state. Previously published revisions and snapshots MUST never be edited, replaced, lifecycle-deactivated, or hard-deleted by admin commands, rollback, later publication, or draft correction.

#### Scenario: Later publication preserves history

- GIVEN a Type snapshot exists in revision 4
- WHEN revision 5 is published after catalog edits
- THEN direct read of revision 4 returns byte-for-byte equivalent validated content as before
- AND revision 5 contains the new content independently.

#### Scenario: Failed publication preserves latest history

- GIVEN a latest valid revision exists
- WHEN a later Publish fails validation
- THEN the latest revision and all historical snapshots remain unchanged.

### Requirement: Revision history and direct reads

Admin revision history MUST be cursor-paginated by organization in descending revision number then revision ID, with optional exact state filter where supported. Direct revision reads MUST address revision ID and verify organization ownership. Direct snapshot reads MUST address revision ID plus Type key and MUST return null for a missing revision/snapshot or organization mismatch without exposing another organization's data. Existing public latest-revision and historical snapshot reads MUST retain their prior contracts.

#### Scenario: History pages newest first

- GIVEN an organization has more revisions than one page
- WHEN all history pages are traversed
- THEN revisions are returned once each from highest to lowest number.

#### Scenario: Cross-organization revision is not returned

- GIVEN a revision belongs to organization A
- WHEN it is requested in organization B's context
- THEN the direct read returns null.

### Requirement: Published snapshot content

Each Type snapshot MUST contain the effective Class, Family, Type, principal Unit, ordered value-bearing attributes and active options, effective conditional rules, canonical presentation, and effective option-compatibility policies/relations necessary for existing backend consumers. It MUST contain stable catalog keys and display/policy content, while historical behavior MUST not depend on mutable live rows after publication.

#### Scenario: Live edit does not alter snapshot

- GIVEN a snapshot has been published
- WHEN a live catalog name or option is later edited
- THEN reading the old snapshot returns the original published name or option.

## Acceptance Criteria

- Publication is explicit, organization-scoped, atomic, and never triggered by ordinary admin mutations.
- Only complete effective Types are published; inert drafts are omitted and invalid effective data blocks the whole command.
- Canonical hashes are deterministic and distinguish semantic content changes.
- Unchanged publication returns the existing revision with `UNCHANGED` and inserts nothing.
- Revision history is paginated, snapshots are directly readable, and all historical content is immutable.
- Existing public revision and snapshot APIs remain compatible.
