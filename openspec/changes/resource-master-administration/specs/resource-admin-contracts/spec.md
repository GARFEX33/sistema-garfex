# Resource Administration Contracts and Compatibility Specification

## Purpose

Define the additive structured-error and generated TypeScript contract while preserving every legacy public Resource API and the confirmed scope boundary.

## Requirements

### Requirement: Structured Resource administrative failures

Every failed Resource administrative operation MUST use the completed validated `ADMIN_*` error payload, with machine behavior determined by `ConvexError.data.code` and safe validated context rather than message prose. Aggregate failures MUST include coded violations when multiple or specific catalog/value defects require correction. No failure MAY commit partial data.

Resource failures MUST map as follows:

| Condition | Required code |
|---|---|
| Missing commanded Resource | `ADMIN_NOT_FOUND` |
| Stale expected revision | `ADMIN_STALE_REVISION` |
| Duplicate derived identity | `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT` |
| Alias collision | `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT` |
| Classification, ownership, or prohibited identity change | `ADMIN_IMMUTABLE_FIELD` |
| Missing, inactive, foreign, or incompatible reference | `ADMIN_INVALID_REFERENCE` |
| Invalid lifecycle/effective/value state | `ADMIN_INVALID_STATE` or `ADMIN_AGGREGATE_INCOMPLETE` with coded violations |
| Invalid cursor or page size | `ADMIN_INVALID_ARGUMENT` |
| Excessive stored value cardinality | `ADMIN_INVALID_STATE` with bounded-limit context |

#### Scenario: Consumer handles coded violations without prose parsing

- GIVEN a Resource command detects multiple invalid effective assignments, options, or values
- WHEN the command fails
- THEN `ConvexError.data` contains an allowed `ADMIN_*` code and coded violations with safe references
- AND changing the human-readable message would not change consumer behavior
- AND no data is changed.

#### Scenario: Missing Resource has a stable machine code

- GIVEN a mutation targets a Resource that does not exist
- WHEN the failure reaches a consumer
- THEN `ConvexError.data.code` is `ADMIN_NOT_FOUND`
- AND the consumer need not parse Spanish or English prose.

### Requirement: Additive legacy Resource compatibility

The new administration surface MUST be additive under `catalogoAdmin.recursos`. Existing public Resource functions, including `crearRecurso`, `obtenerRecurso`, `obtenerDetalleRecurso`, `listarRecursos`, `buscarRecursos`, `actualizarRecurso`, `desactivarRecurso`, and `reactivarRecurso`, MUST retain their names, arguments, return shapes, behavior, and existing error-message contracts. The administration API MUST NOT replace, rename, remove, or widen those public contracts.

#### Scenario: Legacy Resource consumer remains unchanged

- GIVEN a consumer uses any existing public Resource function
- WHEN the Resource administration surface is added
- THEN the consumer compiles against the same arguments and return type
- AND protected runtime behavior and legacy error text remain unchanged.

### Requirement: Static generated React contract

The Resource administration queries, commands, result unions, IDs, page envelopes, detail diagnostics, and `AdminErrorData` MUST be exposed through generated Convex `api` and data-model TypeScript types. A separate React consumer MUST be able to typecheck calls and results through `FunctionArgs`, `FunctionReturnType`, and generated references without a manually maintained DTO, SDK, or duplicated frontend validation rules.

#### Scenario: Consumer typecheck proves the portable contract

- GIVEN Convex code generation has produced the administration references and types
- WHEN the separate React contract fixture runs its consumer typecheck
- THEN list, search, detail, create, update, activate, and deactivate arguments and results compile
- AND structured errors and page fields are statically represented
- AND no hand-maintained translation contract is required.

### Requirement: Resource administration scope exclusions

This change MUST NOT add Bandeja behavior, XML import or export, authentication, authorization, roles or permissions, seed or fixture product capabilities, UI implementation, hard deletion, cascading deletion, or replacement of a public Resource API. Resource commands MUST NOT automatically publish, mutate catalog publication revisions, or rewrite snapshots.

#### Scenario: Generated surface respects the scope boundary

- GIVEN the generated administration contract and its behavior are inspected
- WHEN the change is accepted
- THEN it contains only the additive Resource administration capabilities
- AND it exposes no Bandeja, XML, auth/permission, seed, UI, hard-delete, cascade, public-replacement, or automatic-publication operation.

## Acceptance Criteria

- Administrative failures use validated `ADMIN_*` codes, safe context, coded violations, and atomic failure semantics.
- Every legacy public Resource API remains source-, type-, behavior-, and error-compatible.
- Generated Convex types form the static React contract and pass the separate consumer typecheck without manual DTOs.
- Bandeja, XML, auth/permissions, seed, UI, hard delete/cascade, public API replacement, and publication mutation remain excluded.
