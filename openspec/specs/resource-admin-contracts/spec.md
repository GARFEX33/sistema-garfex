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

This change MUST NOT add Unit filtering, Bandeja, XML, authentication, authorization, roles/permissions, seed product capabilities, UI implementation, hard delete, cascades, publication mutation, classification migration, organization transfer, or replacement public APIs.

#### Scenario: Generated surface respects exclusions

- GIVEN generated Resource administration references are inspected
- WHEN the change is accepted
- THEN only the seven approved Resource functions are exposed
- AND no excluded operation or Unit filter appears.

## Acceptance Criteria

- Native generated list/search references work directly with `usePaginatedQuery`.
- Package exposure is limited to generated API/data-model/error contracts and required React/Convex types.
- No Resource-specific page DTO, cursor/token layer, cache, or manual accumulator exists.
- Administrative failures remain structured and mutations remain atomically all-or-nothing.
- Every legacy Resource API and existing catalog-admin pagination contract remains unchanged.
