# Resource Administration Contracts and Compatibility Specification

## Purpose

Define the additive structured-error and generated native Convex contract while preserving legacy Resource APIs and the existing catalog-admin pagination boundary.

## Requirements

### Requirement: Native generated paginated query contract

`listarRecursosResumen` and `buscarRecursosResumen` MUST expose generated Convex paginated query references whose backend arguments use `paginationOptsValidator` and whose backend results are native `PaginationResult<ResourceSummary>` values.

A React consumer MUST use each generated reference directly with `usePaginatedQuery`. The contract MUST NOT require a Resource `AdminPage`, cursor envelope/hash, plan or order token, hand-written page DTO, manual page accumulator, or Resource cache.

#### Scenario: Consumer list fixture uses usePaginatedQuery directly

- GIVEN generated `api.catalogoAdmin.recursos.listarRecursosResumen`
- WHEN the consumer fixture calls `usePaginatedQuery` with lifecycle, Type, and scope arguments
- THEN TypeScript accepts the native paginated query reference
- AND the fixture narrows native status and consumes accumulated `results`
- AND no pagination adapter is imported.

#### Scenario: Consumer search fixture uses native arguments

- GIVEN generated `api.catalogoAdmin.recursos.buscarRecursosResumen`
- WHEN the consumer fixture supplies search text plus lifecycle, Type, and scope
- THEN TypeScript accepts the call
- AND Unit, cursor-token, order-version, and plan arguments are absent.

### Requirement: Static generated Resource contract

Resource administration query/mutation references, function arguments, function returns, IDs, summary/detail diagnostics, native pagination results, result dispositions, and `AdminErrorData` MUST be exposed through generated Convex API/data-model types and the package's required static exports.

The separate consumer fixture MUST use `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, generated references, and React `usePaginatedQuery` without importing backend implementation modules or defining parallel DTOs or validation rules.

#### Scenario: Consumer fixture typechecks the complete surface

- GIVEN Convex code generation has run
- WHEN `pnpm typecheck:consumer` executes
- THEN list, search, detail, create, update, activate, and deactivate references typecheck
- AND native paginated query shapes are represented
- AND structured errors and mutation result unions can be narrowed.

### Requirement: Structured Resource administrative failures

Every failed Resource administrative operation MUST use the completed validated `ADMIN_*` payload. Consumer behavior MUST depend on `ConvexError.data.code` and safe coded context, not message prose. Mutation failures MUST commit no partial state by virtue of Convex transaction atomicity.

| Condition | Required code |
|---|---|
| Missing commanded Resource | `ADMIN_NOT_FOUND` |
| Stale expected revision | `ADMIN_STALE_REVISION` |
| Duplicate identity or alias | `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT` |
| Classification, ownership, or prohibited identity change | `ADMIN_IMMUTABLE_FIELD` |
| Missing, inactive, foreign, or incompatible reference | `ADMIN_INVALID_REFERENCE` |
| Invalid lifecycle/effective/value state | `ADMIN_INVALID_STATE` or `ADMIN_AGGREGATE_INCOMPLETE` |
| Invalid page size or blank normalized search | `ADMIN_INVALID_ARGUMENT` |
| Excessive value cardinality | `ADMIN_INVALID_STATE` with bounded context |

Native continuation cursors are owned by Convex. This Resource contract MUST NOT add custom cursor-binding or cursor-hash errors.

#### Scenario: Consumer handles failures without prose parsing

- GIVEN an administrative operation fails
- WHEN a consumer handles the error
- THEN it can branch on validated `ConvexError.data.code` and coded context
- AND no Spanish or English message parsing is required.

### Requirement: Additive legacy compatibility

Existing public Resource functions—`crearRecurso`, `obtenerRecurso`, `obtenerDetalleRecurso`, `listarRecursos`, `buscarRecursos`, `actualizarRecurso`, `desactivarRecurso`, and `reactivarRecurso`—MUST retain their names, arguments, return shapes, behavior, and existing error messages.

The WU2 validation seam MUST preserve the legacy throwing wrapper. Resource schema correction MUST preserve legacy stored data and public projections.

#### Scenario: Legacy Resource consumer remains unchanged

- GIVEN a consumer uses an existing public Resource function
- WHEN Resource administration is added and WU1 is corrected
- THEN the consumer compiles against the same contract
- AND protected runtime behavior and error text remain unchanged.

### Requirement: Existing catalog-admin pagination is outside scope

Any custom `AdminPage`, cursor envelope, query-plan token, order token, or consumer behavior already used by catalog administration MUST remain outside this Resource rescope. This change MUST NOT authorize rewriting, migrating, or deleting that existing catalog-admin behavior.

#### Scenario: Resource native pagination does not expand scope

- GIVEN the Resource design uses native pagination
- WHEN affected artifacts and implementation diffs are reviewed
- THEN only the Resource administration surface and its Resource-specific WU1 corrections are changed
- AND existing catalog-admin pagination contracts remain intact.

### Requirement: Scope exclusions

This change MUST NOT add Unit filtering, Bandeja, XML, authentication, authorization, roles/permissions, seed product capabilities, UI implementation, hard delete, cascades, publication mutation, classification migration, organization transfer, or replacement public APIs. It MAY add only the additive public evaluation query `evaluarCreacionDesdeSelecciones` and the additive public mutation `crearRecursoDesdeSelecciones` beside the seven existing Resource administration functions; it MUST NOT change legacy public Resource APIs.

#### Scenario: Generated surface respects exclusions

- GIVEN generated Resource administration references are inspected
- WHEN this change is accepted
- THEN the existing seven Resource administration functions remain available with their existing contracts
- AND the only new Resource creation references are `evaluarCreacionDesdeSelecciones` and `crearRecursoDesdeSelecciones`
- AND no excluded operation or Unit-filtering feature appears.

### Requirement: Exact selection-only evaluation contract

The generated public query `evaluarCreacionDesdeSelecciones` MUST accept exactly this shared evaluation input: `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership`. Each member of `selecciones` MUST contain exactly `asignacionAtributoId` and `valorPermitidoId`. The query MUST NOT accept a caller-supplied `nombre`, `descripcion`, primitive text/number/boolean value, manual identity, suspended-selection state, or a legacy option ID.

The backend MUST validate the supplied Class → Family → Type hierarchy, Unit, effective-unit policy, and `ownership` scope. It MUST NOT infer or trust hierarchy/scope merely because the IDs were supplied. `ownership` MUST be resolved only by one explicit backend-validated ownership-to-catalog rule; consumers MUST NOT provide catalog content or a resolved catalog identity in its place.

The query MUST return one `CreationEvaluation` whose top-level field set is exactly `status`, `valid`, `catalogFingerprint`, `nombre`, `identificadorTecnico`, `asignaciones`, `faltantesRequeridos`, `seleccionesInvalidas`, `valoresNormalizados`, and `issues`. These names, including the Spanish domain fields `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, `asignacionAtributoId`, `valorPermitidoId`, `nombre`, and `identificadorTecnico`, are contract fields and MUST NOT acquire aliases.

`asignaciones` MUST contain one item for every effective assignment. Each item MUST contain `asignacionAtributoId`, `definicionAtributoId`, `aplicabilidadResuelta`, `participaIdentidad`, `orden`, and `effectiveReasons`, and MAY contain `selectedValueId` when its selected allowed value is accepted for that assignment. `aplicabilidadResuelta` MUST be `REQUIRED`, `OPTIONAL`, `FORBIDDEN`, or `NOT_APPLICABLE`; `CONDITIONAL` MUST NOT be returned as resolved applicability. The assignment-view property `selectedValueId` identifies the allowed value submitted under `valorPermitidoId`; `valorPermitidoId` MUST be used for selection input and every selection-oriented public response reference.

`faltantesRequeridos` MUST be an array of `Id<"atributosRecurso">` identifying every omitted required selectable assignment. `seleccionesInvalidas` MUST be an array of `Id<"atributosRecurso">` identifying each assignment for which at least one supplied selection is invalid; duplicate IDs MUST be collapsed in first-input order. Selection-specific diagnostics remain available through `issues`. `valoresNormalizados` MUST contain only accepted normalized selections and each item MUST use the current Resource-value persistence shape: `atributoRecursoId`, `valor`, and optional `opcionAtributoId`. `nombre` and `identificadorTecnico` MUST be strings only for a complete valid evaluation and MUST otherwise be `null`.

Each `issues` item MUST include a machine-authoritative `code` and a human-readable `message`, and MAY include `asignacionAtributoId` when an assignment is applicable. `code` MUST be one of `HIERARCHY_INVALID`, `UNIT_INVALID`, `OWNERSHIP_INVALID`, `ASSIGNMENT_UNKNOWN`, `ASSIGNMENT_DUPLICATE`, `ALLOWED_VALUE_UNKNOWN`, `ALLOWED_VALUE_FOREIGN`, `ALLOWED_VALUE_INACTIVE`, `SELECTION_NON_EFFECTIVE`, `SELECTION_FORBIDDEN`, `SELECTION_NOT_APPLICABLE`, `UNSUPPORTED_FREE_CAPTURE`, or `IDENTITY_CONFLICT`. Consumers MUST branch on `code` and MUST NOT need to parse `message` prose.

#### Scenario: Evaluation uses only selection input

- GIVEN a client has a Class, Family, Type, Unit, ownership, and allowed-value selections
- WHEN it calls `evaluarCreacionDesdeSelecciones`
- THEN the generated contract accepts those fields with each selection expressed as `asignacionAtributoId` and `valorPermitidoId`
- AND no manual name, description, primitive value, or legacy option ID is accepted.

#### Scenario: Evaluation reports every effective question

- GIVEN a Type has required, optional, forbidden, and conditionally non-applicable effective assignments
- WHEN the query evaluates a configuration
- THEN `asignaciones` contains one resolved item for each effective assignment
- AND each item reports `aplicabilidadResuelta` rather than `CONDITIONAL`.

### Requirement: Evaluation validity, issue, and status semantics

The evaluator MUST classify a selected inactive, foreign, duplicated, unknown, non-effective, forbidden, or non-applicable allowed value as invalid and report the corresponding typed `issues` and `seleccionesInvalidas` entries. A required effective `LIBRE` assignment encountered by this selection-only flow MUST be invalid with `UNSUPPORTED_FREE_CAPTURE`; an optional `LIBRE` assignment MAY be omitted. A missing required `SELECCION` assignment MUST be listed in `faltantesRequeridos`.

`status` MUST be exactly `"INVALID"`, `"INCOMPLETE"`, or `"VALID"`; `valid` MUST be boolean; and the invariant `status === "VALID"` if and only if `valid === true` MUST always hold. Status precedence MUST be `INVALID` if any invalid issue exists, otherwise `INCOMPLETE` if any required selectable assignment is missing, otherwise `VALID`. Thus an evaluation that has both a malformed supplied selection and a missing required selection MUST be `INVALID`.

#### Scenario: Invalid selection wins over incompleteness

- GIVEN one required selectable assignment is omitted
- AND another supplied allowed value is inactive
- WHEN the configuration is evaluated
- THEN `status` is `INVALID`
- AND `valid` is false
- AND `faltantesRequeridos` and the inactive-value issue are both reported.

#### Scenario: Required free capture is not falsely creatable

- GIVEN a required effective assignment has mode `LIBRE`
- WHEN a client evaluates otherwise complete allowed-value selections
- THEN the result contains `UNSUPPORTED_FREE_CAPTURE`
- AND `status` is `INVALID`
- AND `valid` is false.

### Requirement: Deterministic selection evaluation, identity, and fingerprint

The evaluator MUST first select effective assignments using existing Type-over-Family precedence and then apply lifecycle/applicability filtering. Effective assignment order MUST be ascending `orden`, then definition technical `clave` by Unicode code point, then assignment ID. Conditional predicates MUST compare allowed-value IDs and resolve before required/missing validation. A supplied selection that becomes forbidden or non-applicable after that resolution MUST be invalid; suspended client state MUST neither be sent nor persisted.

For a valid complete evaluation, `nombre` MUST be `<Tipo.nombre> · <identity-participating allowed-value labels>` in effective-assignment order. `identificadorTecnico` MUST be generated only from the Type technical key, identity-participating assignment technical keys, and selected allowed-value technical keys, never display labels. It MUST use the existing compatible length-safe versioned serialization.

`catalogFingerprint` MUST always be a string, including for `INVALID` and `INCOMPLETE` evaluations. It MUST be deterministic for the exact graph used by evaluation and MUST include the validated hierarchy and Unit, ownership-resolved lifecycle/effectivity inputs, selected assignment order/mode/identity participation, active allowed values, and effective conditional predicates. When a required hierarchy or catalog row cannot resolve, the canonical fingerprint input MUST retain its position using a deterministic reference-kind-specific missing sentinel when no identifier was supplied, or a deterministic invalid-reference sentinel incorporating the canonical supplied identifier when an identifier was supplied but cannot resolve; it MUST NOT omit that input. Equivalent effective graphs and equivalent unresolved-reference inputs MUST yield the same fingerprint regardless of storage order, and a change to any included input MUST yield a different fingerprint.

#### Scenario: Conditional applicability invalidates a retained selection

- GIVEN a conditional rule makes assignment B `NOT_APPLICABLE` when assignment A has a selected allowed value
- AND the client supplies values for both A and B
- WHEN evaluation resolves the rule
- THEN B is reported as an invalid non-applicable selection
- AND B is absent from `valoresNormalizados`.

#### Scenario: Label edit does not define technical identity

- GIVEN two otherwise identical valid evaluations use the same Type, assignment, and allowed-value technical keys
- WHEN an allowed-value display label changes
- THEN generated `identificadorTecnico` remains the same technical-key identity
- AND the generated `nombre` uses the current label.

#### Scenario: Behavior-relevant catalog change changes fingerprint

- GIVEN a valid evaluation has a returned `catalogFingerprint`
- WHEN an effective allowed value or conditional predicate changes
- THEN a later evaluation returns a different `catalogFingerprint`.

#### Scenario: Unresolved references still receive a fingerprint

- GIVEN an evaluation supplies a hierarchy or catalog identifier that cannot resolve
- WHEN the evaluator produces an invalid or incomplete result
- THEN `catalogFingerprint` is a string
- AND its canonical input includes the deterministic missing or invalid-reference sentinel for each unresolved position.


## Acceptance Criteria

- Native generated list/search references work directly with `usePaginatedQuery`.
- Package exposure is limited to generated API/data-model/error contracts and required React/Convex types.
- No Resource-specific page DTO, cursor/token layer, cache, or manual accumulator exists.
- Administrative failures remain structured and mutations remain atomically all-or-nothing.
- Every legacy Resource API and existing catalog-admin pagination contract remains unchanged.
