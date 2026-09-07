# Delta for Catalog Publication and Revision History

## ADDED Requirements

### Requirement: Allowed-value publication representation and completeness

Publication MUST compile the effective `modoCaptura`, active allowed values, allowed-value conditional predicates, and legacy-option forward mappings needed for compatibility into the current snapshot representation. An effective `SELECCION` assignment MUST have at least one active allowed value; otherwise the publication candidate MUST fail with `ADMIN_PUBLICATION_INVALID` and create no revision or snapshot rows.

Snapshot validators, aggregate completeness checks, lifecycle checks, canonical serialization, generated declarations, and administrative snapshot reads MUST agree on this representation. Historical snapshots MUST remain immutable and readable in their original representation; publication MUST NOT rewrite them to add allowed values.

#### Scenario: Incomplete effective selection blocks publication

- GIVEN an effective `SELECCION` assignment has no active allowed values
- WHEN an administrator publishes its organization catalog
- THEN Publish fails with `ADMIN_PUBLICATION_INVALID`
- AND no new revision or snapshot rows are written.

#### Scenario: Historical snapshot is not rewritten

- GIVEN a revision was published before allowed-value support
- WHEN a later catalog revision is published with allowed values
- THEN the earlier revision remains byte-for-byte equivalent when read
- AND only the new revision uses the allowed-value representation.

### Requirement: Allowed values participate in deterministic content identity

The canonical content hash MUST deterministically include the effective capture mode, active allowed values, allowed-value condition predicates, and lifecycle/effectivity inputs that can change selection-only evaluation. Canonical ordering of allowed values MUST be `orden`, then technical `clave` by Unicode code point, then a stable semantic tie-breaker that is independent of storage IDs. Equivalent effective catalog content MUST produce the same hash regardless of storage insertion order; any change to an included allowed value, mode, predicate, ordering, or lifecycle/effectivity input MUST change the hash.

#### Scenario: Reordered storage produces the same hash

- GIVEN two equivalent effective catalogs contain the same allowed values inserted in different database order
- WHEN each catalog is published
- THEN their canonical candidate hashes are equal.

#### Scenario: Allowed-value lifecycle changes the hash

- GIVEN a published effective selection assignment has an active allowed value
- WHEN that allowed value is validly deactivated and the catalog is republished
- THEN the new candidate hash differs from the prior hash.

## Acceptance Criteria

- Publication rejects incomplete effective selection assignments atomically.
- New snapshots consistently represent modes, allowed values, and allowed-value predicates while retaining legacy compatibility mappings.
- Canonical hashes include every effective input that can change selection evaluation and remain independent of storage order.
- Historical revisions and snapshots are never rewritten.
