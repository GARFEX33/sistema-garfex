# Delta for Resource Administration Writes and Lifecycle

## ADDED Requirements

### Requirement: Atomic selection-only Resource creation

`crearRecursoDesdeSelecciones` MUST be one Convex mutation. Its input MUST be the exact shared evaluation input—`claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership`—plus mandatory `expectedCatalogFingerprint: string`. Each member of `selecciones` MUST contain exactly `asignacionAtributoId` and `valorPermitidoId`. The mutation MUST NOT accept caller-supplied `nombre`, `descripcion`, `identificadorTecnico`, active state, primitive value, legacy option ID, or suspended-selection state.

Within the transaction, the mutation MUST reload the current effective catalog, validate hierarchy, effective-unit policy, and ownership resolution, and invoke the unchanged pure evaluator used by `evaluarCreacionDesdeSelecciones`. It MUST compare `expectedCatalogFingerprint` to the current evaluation's `catalogFingerprint` before any Resource, normalized-value, or alias write. It MUST check generated technical-identity uniqueness inside the same transaction, including inactive Resources in the applicable ownership scope.

After reevaluation, disposition selection MUST use this strict precedence: first, a fingerprint mismatch MUST return `CATALOG_CHANGED` with the current `CreationEvaluation`, even when that current evaluation is `INCOMPLETE` or `INVALID`; second, a matching fingerprint MUST map a current `INCOMPLETE` evaluation to `INCOMPLETE` and a current `INVALID` evaluation to `INVALID`; only a matching `VALID` evaluation MAY proceed to the transaction-local identity check and write. The mutation MUST derive `nombre`, `identificadorTecnico`, identity version, active state, and persistence-shaped normalized values server-side. Convex atomicity and optimistic concurrency control MUST be the sole commit, rollback, and concurrency authority; the implementation MUST NOT add a lock, action, retry coordinator, compensating write, or custom transaction layer.

#### Scenario: Stale catalog write is rejected before persistence

- GIVEN a client evaluates selections and receives fingerprint `F1`
- AND the effective catalog changes so a current evaluation has fingerprint `F2`
- WHEN the client calls `crearRecursoDesdeSelecciones` with `expectedCatalogFingerprint` `F1`
- THEN no Resource, normalized value, or alias row is written
- AND the result is `CATALOG_CHANGED` with the current evaluation and fingerprint.

#### Scenario: Fingerprint mismatch wins over current invalidity

- GIVEN a client supplies an expected fingerprint that differs from the current evaluation fingerprint
- AND the current evaluation is `INVALID` or `INCOMPLETE`
- WHEN it calls `crearRecursoDesdeSelecciones`
- THEN the result is `CATALOG_CHANGED` with the current `CreationEvaluation`
- AND it is not classified as `INVALID` or `INCOMPLETE`
- AND no Resource, normalized value, or alias row is written.

#### Scenario: Matching valid request derives all persisted fields

- GIVEN a valid complete current evaluation and a matching expected fingerprint
- WHEN creation succeeds
- THEN the persisted Resource name, technical identity, active state, and values equal the server-derived evaluation
- AND any persisted identity version is derived server-side from the chosen compatible serialization
- AND no caller-authored name, description, or primitive value is persisted through this creator.

### Requirement: Exact selection-only creation disposition union

`crearRecursoDesdeSelecciones` MUST return an expected-flow discriminated union with no generic validation error for its classified outcomes:

- `CREATED` MUST be exactly `{ disposition: "CREATED", item: ResourceSummary }`.
- `CATALOG_CHANGED` MUST include `disposition: "CATALOG_CHANGED"` and the current `CreationEvaluation`, whose string `catalogFingerprint` is the current fingerprint.
- `INCOMPLETE` MUST include `disposition: "INCOMPLETE"` and the current `CreationEvaluation` after a matching fingerprint is confirmed.
- `INVALID` MUST include `disposition: "INVALID"` and the current `CreationEvaluation` after a matching fingerprint is confirmed; its typed invalid issues MUST be available through that evaluation's `issues`.

The only expected dispositions MUST be `CREATED`, `CATALOG_CHANGED`, `INCOMPLETE`, and `INVALID`. A generated-identity conflict detected in the mutation MUST return `INVALID` with `IDENTITY_CONFLICT`; it MUST NOT be exposed as a generic duplicate error. Unexpected platform failures and data-corruption failures MAY throw.

#### Scenario: Incomplete configuration is a returned disposition

- GIVEN current evaluation has no invalid issues and omits a required selectable assignment
- WHEN the client calls creation with the current fingerprint
- THEN the result has disposition `INCOMPLETE`
- AND it includes the current evaluation with `status` `INCOMPLETE`
- AND no Resource, normalized value, or alias row is written.

#### Scenario: Concurrent identity conflict is an expected invalid outcome

- GIVEN two matching valid creation requests race for the same generated identity
- WHEN Convex resolves the transaction conflict
- THEN at most one request returns `CREATED`
- AND any losing request returns `INVALID` with an `IDENTITY_CONFLICT` issue
- AND the losing request writes no partial Resource, value, or alias state.

### Requirement: No-write outcomes and legacy creator compatibility

`CATALOG_CHANGED`, `INCOMPLETE`, and `INVALID`, including an identity-conflict `INVALID`, MUST leave Resource, normalized value, and alias state exactly as it was before the mutation. The selection-only mutation MUST not partially persist a generated name, technical identity, revision, value, or alias for any no-write outcome.

Existing Resource creators, including `crearRecurso`, MUST retain their names, arguments, return shapes, behavior, existing error messages, primitive-value support, legacy option support, and compatibility with stored Resource values. The selection-only creator supersedes only the archived creator behavior concerning manual `nombre`/`descripcion`, primitive-specific value controls, simplified conditional handling, and a separate Resource-data stage; archived receipts and historical data MUST remain unchanged.

#### Scenario: Invalid selection leaves all aggregate state unchanged

- GIVEN a creation request contains a foreign or inactive allowed value
- WHEN the selection-only mutation returns `INVALID`
- THEN Resource, normalized value, and alias state equals the pre-command state
- AND no partial aggregate exists.

#### Scenario: Legacy creation remains unchanged

- GIVEN an existing consumer calls legacy `crearRecurso` with its supported legacy payload
- WHEN selection-only creation is introduced
- THEN the legacy call retains its prior observable behavior and error messages
- AND it is not required to supply `expectedCatalogFingerprint`.

## Acceptance Criteria

- Creation requires the exact shared selection input with `valorPermitidoId` plus mandatory `expectedCatalogFingerprint`.
- Create and evaluate use the same current pure evaluation semantics and always return its string fingerprint on an expected no-write result.
- After reevaluation, fingerprint mismatch deterministically returns `CATALOG_CHANGED` before current `INCOMPLETE` or `INVALID` status is classified; only a matching `VALID` result can write.
- `CREATED` is exactly `{ disposition: "CREATED", item: ResourceSummary }` and no other creation disposition exists beyond the stated four.
- Stale, incomplete, invalid, and identity-conflict outcomes write no Resource, value, or alias state.
- Generated fields are server-authored, identity uniqueness is transactionally enforced, and legacy creators stay compatible.
