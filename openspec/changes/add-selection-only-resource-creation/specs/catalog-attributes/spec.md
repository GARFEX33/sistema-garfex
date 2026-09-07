# Delta for Catalog Attributes and Options

## ADDED Requirements

### Requirement: Capture-mode compatibility and migration

Attribute definitions MUST expose `modoCaptura` as `SELECCION` or `LIBRE`; `DERIVADO` MUST be absent from v1 storage, validators, administrative APIs, publication, and selection evaluation. During the additive rollout only, an absent stored mode MUST be interpreted as `SELECCION` when `tipoDato` is `OPCION` and as `LIBRE` for every other currently supported data type. The system MUST backfill that interpretation to an explicit mode before making the field required.

Every legacy `OPCION` definition MUST be backfilled to `SELECCION`; every other current definition MUST be backfilled to `LIBRE`. This migration MUST preserve legacy definitions, options, option references, Resource values, and legacy creator behavior. It MUST NOT destructively rewrite existing Resource value rows.

#### Scenario: Legacy definition remains interpretable before backfill

- GIVEN a stored `OPCION` definition has no `modoCaptura`
- WHEN it is resolved during the compatibility rollout
- THEN its effective mode is `SELECCION`
- AND a stored non-`OPCION` definition without a mode resolves to `LIBRE`.

#### Scenario: Derived capture mode is rejected

- GIVEN an administrator creates or updates an attribute definition
- WHEN `modoCaptura` is `DERIVADO`
- THEN the command fails validation
- AND no definition change is committed.

### Requirement: Allowed-value ownership, lifecycle, and revision

Administrators MUST be able to create, detail, cursor-paginate, update descriptive fields and `orden`, activate, and deactivate `valoresPermitidosAtributo` records. Each allowed value MUST have one immutable `definicionAtributoId`, an immutable technical `clave`, display `nombre`, optional `descripcion`, numeric `orden`, `activo`, and optimistic `revision`.

The stable identity of an allowed value MUST be `(definicionAtributoId, clave)`, including inactive records. Creating a duplicate identity MUST fail with `ADMIN_DUPLICATE_KEY`; changing its definition or key MUST fail with `ADMIN_IMMUTABLE_FIELD`. Lifecycle and update commands MUST require the current revision and reject stale revisions with `ADMIN_STALE_REVISION`. A command that would invalidate an effective conditional predicate, effective selected assignment, publication candidate, or compatibility boundary MUST fail without changing the value.

#### Scenario: Inactive allowed value reserves its key

- GIVEN an inactive allowed value with key `AZUL` belongs to a definition
- WHEN an administrator creates another allowed value with key `AZUL` for that definition
- THEN creation fails with `ADMIN_DUPLICATE_KEY`
- AND the inactive value remains unchanged.

#### Scenario: Stale allowed-value update changes nothing

- GIVEN an allowed value is at revision 4
- WHEN an update supplies expected revision 3
- THEN it fails with `ADMIN_STALE_REVISION`
- AND its stored fields and lifecycle state remain unchanged.

### Requirement: Allowed-value administrative reads and stable pagination

Allowed-value administration MUST provide a direct detail read and cursor-paginated lists scoped by definition, with optional lifecycle filtering. A list without a lifecycle filter MUST include active and inactive stored values. Results MUST be ordered by ascending `orden`, then `clave` by Unicode code point, then allowed-value ID; that order MUST remain the pagination order so a complete traversal returns every matching stored value once in deterministic order.

Reads MUST expose stored lifecycle state, revision, definition ownership, and whether the value is currently effective. Inactive, shadowed, or otherwise non-effective values MUST remain administratively inspectable even though they are not available for effective selection.

#### Scenario: Equal order values paginate deterministically

- GIVEN three allowed values for one definition have the same `orden`
- AND their keys are `B`, `A`, and `A` with distinct IDs
- WHEN all pages are traversed
- THEN values are returned by key `A`, key `A` ID order, then key `B`
- AND no value is skipped or repeated.

### Requirement: Legacy-option to allowed-value migration

For every legacy option, migration MUST create one allowed value under the same definition that preserves its technical key, display label, lifecycle state, and ordering. The migrated allowed value MUST retain a forward reference to its source legacy option so legacy Resource records and rules remain interpretable. The migration MUST be idempotent: rerunning it MUST neither create duplicate allowed values nor alter a completed mapping.

An active effective `SELECCION` assignment MUST resolve at least one active allowed value. Inactive or shadowed allowed values MAY remain stored and visible to administrators, but MUST NOT be effective selection choices.

#### Scenario: Option migration preserves an inactive option

- GIVEN an inactive legacy option with key, label, and order under an `OPCION` definition
- WHEN the allowed-value migration runs
- THEN exactly one mapped allowed value is present with the same key, label, order, and inactive state
- AND the legacy option remains present.

#### Scenario: Effective selection assignment cannot have no active values

- GIVEN an inactive assignment with effective mode `SELECCION` has no active allowed value
- WHEN activation would make that assignment effective
- THEN activation fails with `ADMIN_AGGREGATE_INCOMPLETE`
- AND no lifecycle state changes.

## Acceptance Criteria

- `modoCaptura` supports only `SELECCION` and `LIBRE`, with the stated compatibility interpretation and backfill.
- `DERIVADO` is absent from v1 behavior and contracts.
- Allowed values have immutable scoped identity, revision-guarded lifecycle, stable ordered pagination, and admin visibility for inactive rows.
- Legacy options map one-to-one to allowed values without deleting legacy data or rewriting Resource values.
- Effective selectable assignments always have an active allowed value.
