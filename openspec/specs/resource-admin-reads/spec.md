# Resource Administration Reads Specification

## Purpose

Define native Convex pagination for Resource browsing and search, plus bounded direct detail, without changing legacy Resource reads or existing catalog-admin pagination.

## Requirements

### Requirement: Native paginated value-free summaries

The Resource administration API MUST provide a summary list whose registered query arguments include `paginationOpts` validated by `paginationOptsValidator`. The query MUST return Convex's native `PaginationResult<ResourceSummary>` shape and MUST execute one equality-prefix-valid indexed query ending in `.paginate(paginationOpts)`.

`ResourceSummary` MUST contain Resource ID, derived technical identity, name, Type reference, Unit reference, optional organization reference, active state, revision, and classification status. It MUST NOT contain or load Resource values.

The list MAY accept only:

- lifecycle `ALL`, `ACTIVE`, or `INACTIVE`;
- optional `tipoRecursoId`; and
- organization scope `ALL`, `GLOBAL`, or one organization.

Every supplied filter MUST be enforced by index equality. Unit filtering MUST NOT be exposed by this change. Native index order is the list order; the API MUST NOT add `adminSortId`, a product sort token, a plan token, a cursor envelope/hash, manual page accumulation, or a custom cache.

The generated query reference MUST be directly compatible with React `usePaginatedQuery`, which owns native continuation, page accumulation, reactive updates, and query reset when non-pagination arguments change.

#### Scenario: React consumes the native paginated query

- GIVEN a generated reference to `listarRecursosResumen`
- WHEN a React consumer calls `usePaginatedQuery` with lifecycle, Type, and scope arguments plus an initial item count
- THEN the call typechecks without an adapter or hand-written page DTO
- AND the result exposes the native paginated-query state and accumulated results.

#### Scenario: Summary traversal is complete

- GIVEN more matching Resources than fit in one page
- WHEN native continuation cursors traverse an unchanged result set
- THEN every matching Resource appears exactly once
- AND traversal terminates without omissions or duplicates
- AND no Resource value row is loaded.

#### Scenario: Every filter combination is indexed

- GIVEN any supported combination of lifecycle, Type, and scope
- WHEN a summary page is requested
- THEN the selected query uses equality-prefix-valid index clauses
- AND it performs no post-index `.filter()` or table-wide `.collect()`.

#### Scenario: Unit is not a Resource list filter

- GIVEN the generated Resource list arguments
- WHEN a consumer inspects or typechecks them
- THEN no Unit filter is present.

### Requirement: Minimal Resource list indexes

The Resource schema MUST use existing indexes for combinations that omit scope and the minimum additional indexes required by Convex equality-prefix rules for combinations that include scope.

The required coverage is:

| Filter combination | Required index capability |
|---|---|
| none | existing unfiltered stable traversal |
| lifecycle | existing lifecycle prefix |
| Type | existing Type prefix |
| lifecycle + Type | existing Type/lifecycle equality prefix |
| scope | scope prefix |
| scope + Type | scope/Type prefix |
| scope + lifecycle | scope/lifecycle prefix |
| scope + Type + lifecycle | scope/Type/lifecycle prefix |

One new index beginning `[adminScopeKey, tipoRecursoId, activo]` MUST cover scope, scope + Type, and scope + Type + lifecycle. One new index beginning `[adminScopeKey, activo]` MUST cover scope + lifecycle. Equivalent names are allowed; extra Resource list indexes MUST NOT be added without a distinct equality-prefix requirement.

`adminScopeKey` MUST be repaired for historical Resources. Resource `adminSortId` MUST NOT be required for native list pagination.

#### Scenario: Equality-prefix audit determines index count

- GIVEN lifecycle, Type, and scope are the only supported filters
- WHEN schema coverage is reviewed
- THEN the two scope-prefixed index shapes plus existing indexes cover every combination
- AND Unit-specific and custom-sort Resource indexes are absent.

### Requirement: Native paginated full-text summary search

The Resource administration API MUST provide indexed full-text search over Resource name. Its query arguments MUST include `paginationOptsValidator`, and its result MUST be native `PaginationResult<ResourceSummary>`.

Search MUST:

1. normalize text to NFC, trim it, and collapse internal whitespace;
2. reject blank normalized text with `ADMIN_INVALID_ARGUMENT`;
3. use `withSearchIndex` with equality filters for supplied lifecycle, Type, and scope values;
4. call `.paginate(paginationOpts)` directly; and
5. return value-free summaries in Convex native relevance order.

The search index MUST expose only the essential filter fields `tipoRecursoId`, `activo`, and `adminScopeKey`. Unit MUST NOT be a search filter. The implementation MUST NOT wrap native cursors, add runtime version/order tokens, collect all matches, perform an in-memory sort, or add a fallback traversal.

#### Scenario: Search traverses native relevance pages

- GIVEN more equal-relevance matches than one page
- WHEN an unchanged result set is traversed repeatedly with native continuation cursors
- THEN each expected Resource is returned exactly once per traversal
- AND traversal terminates
- AND no lexical or technical-identity ordering is claimed.

#### Scenario: Search applies essential equality filters

- GIVEN normalized search text and any supported lifecycle, Type, and scope combination
- WHEN a search page is requested
- THEN every supplied filter is applied through the search index
- AND no Unit filter or post-search table filter is used.

#### Scenario: Search arguments change natively

- GIVEN an active React paginated search
- WHEN normalized text, lifecycle, Type, or scope changes
- THEN `usePaginatedQuery` treats it as the changed generated query arguments
- AND no custom cursor-mismatch protocol is required.

#### Scenario: Search does not load values

- GIVEN matching Resources have stored values
- WHEN one search page is requested
- THEN the page contains only summaries
- AND no Resource-value query occurs.

### Requirement: Bounded direct Resource detail

The Resource administration API MUST provide direct detail lookup by Resource ID. A found detail MUST include stored fields, ownership/classification references, diagnostics, and all stored values within the supported bound. A missing Resource MUST return null.

Values MUST be loaded exactly once through `valoresAtributoRecurso.porRecurso` with `MAX_RESOURCE_VALUES + 1`. If cardinality exceeds the maximum, the query MUST fail with `ADMIN_INVALID_STATE` and safe limit context; values MUST NOT be truncated.

`MAX_RESOURCE_VALUES` MUST have one authoritative production definition shared by detail and mutations. The current central definition MUST be imported rather than duplicated.

#### Scenario: Detail performs one bounded indexed value load

- GIVEN a Resource has at most `MAX_RESOURCE_VALUES` values
- WHEN detail is requested
- THEN all values are returned through exactly one bounded indexed load.

#### Scenario: Excess values fail without truncation

- GIVEN a Resource has more than `MAX_RESOURCE_VALUES` values
- WHEN detail is requested
- THEN it fails with `ADMIN_INVALID_STATE`
- AND no partial detail is returned.

#### Scenario: Historical inert state remains inspectable

- GIVEN a stored Resource references an inactive or broken current catalog branch
- WHEN detail is requested
- THEN stored bounded data is returned
- AND diagnostics distinguish stored lifecycle from current effective state.

## Acceptance Criteria

- List and search use `paginationOptsValidator`, native pagination results, `.paginate()`, and generated `usePaginatedQuery` compatibility.
- Only lifecycle, Type, and organization scope are accepted as Resource list/search filters.
- Equality-prefix analysis, not an arbitrary target, determines Resource indexes.
- Resource reads add no `AdminPage`, custom cursor/token/cache, Unit filter, collect/sort fallback, or manual accumulation.
- Detail uses the single centralized value limit and one bounded indexed value read.
- Existing custom catalog-admin pagination remains outside this specification and unchanged.
