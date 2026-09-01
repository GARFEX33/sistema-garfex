# Exploration: native-first Resource master administration

## Executive finding

Resource administration should use Convex's native paginated query contract end to end. The current plan over-engineered ordinary list and search behavior by importing the completed catalog-admin cursor envelope, adding Resource-specific sort metadata, multiplying indexes for a Unit filter without a demonstrated UI need, and proposing query-plan/order-version machinery that Convex already supplies.

The correction is additive and artifact-scoped: preserve the completed W0, WU1, WU2a, and WU2b implementation evidence, then add a correction unit before WU3. That unit removes the unnecessary Resource additions from WU1 while retaining only `adminScopeKey` and the equality-prefix indexes needed for lifecycle state, Type, and organization scope.

Existing custom pagination in catalog administration is outside this Resource rescope. This change neither authorizes nor requires rewriting catalog-admin pagination, cursors, caches, or consumers.

## Audit method and evidence

The proposal, specifications, design, tasks, apply receipts, and targeted Resource implementation seams were inspected. Repository structure had already been checked for `.codegraph/`; no CodeGraph MCP/CLI surface is available in this executor, so targeted reads were used rather than broad filesystem exploration.

Relevant committed state:

- `recursos` already has `porIdentificadorTecnico`, `porActivo`, `porTipo`, and `porTipoYActivo` indexes.
- WU1 added optional `adminSortId`, optional `adminScopeKey`, sixteen `adminPor*` indexes, Unit as a search filter, and a Resource branch in the generic metadata backfill.
- The native index order is stable and cursor-compatible without a Resource `adminSortId`; ordinary list order may be documented as the selected Convex index order rather than a product sort promise.
- The Resource search index already searches `nombre`; the native search query can apply equality filters and call `.paginate()` directly.
- WU2a defines `MAX_RESOURCE_VALUES` once in `resourceValidators.ts`, and the bounded detail loader imports it. No duplicate production constant currently exists, so a separate consolidation unit is unnecessary. Future Resource readers and mutations must import that existing constant rather than redefine it.
- WU2a/WU2b already provide value-free projections, bounded detail contracts, diagnostics, and structured error mapping. Their completed evidence remains valid and must not be reopened merely because read pagination is simplified.

## Native-first decision

### Mandatory read contract

Resource list and search queries will:

1. declare `paginationOpts: paginationOptsValidator` in their arguments;
2. return Convex's native `PaginationResult<ResourceSummary>` shape, validated with the installed Convex pagination result validator where a registered return validator is required;
3. execute one indexed query ending in `.paginate(args.paginationOpts)`;
4. expose generated query references directly to React `usePaginatedQuery`; and
5. rely on Convex reactivity and native page accumulation instead of implementing a Resource cache or manual page accumulator.

The Resource surface will not introduce:

- `AdminPage`;
- a cursor envelope or cursor hash;
- cursor/query-plan/order-version tokens;
- manual page accumulation;
- a Resource-specific cache; or
- a custom pagination adapter for React.

Native continuation cursors are opaque Convex values. Query arguments other than `paginationOpts` remain ordinary generated arguments, so `usePaginatedQuery` resets and reacts according to Convex's native behavior when text or equality filters change.

### Essential filters only

Supported Resource list/search filters are:

- lifecycle state: `ALL`, `ACTIVE`, or `INACTIVE`;
- `tipoRecursoId`; and
- organization scope: all scopes, global only, or one organization.

Unit filtering is excluded. It may be proposed later only with a demonstrated UI requirement and an explicit index/query design.

`adminScopeKey` remains the only Resource-specific derived metadata needed for efficient global-versus-organization equality filtering:

- global Resource: `GLOBAL`;
- organization Resource: `ORG:<organizacionId>`.

### Equality-prefix index audit

Existing indexes cover all combinations that omit scope. Two Resource-specific indexes cover every combination that includes scope:

| Filters | Index source |
|---|---|
| none | existing `porIdentificadorTecnico` |
| lifecycle | existing `porActivo` |
| Type | existing `porTipo` |
| lifecycle + Type | existing `porTipoYActivo` |
| scope | new `[adminScopeKey, tipoRecursoId, activo]` index, using the scope prefix |
| scope + Type | same new index, using scope + Type prefix |
| scope + Type + lifecycle | same new index, using all three equality fields |
| scope + lifecycle | new `[adminScopeKey, activo]` index |

The exact implementation names may follow repository naming conventions, but the field order and count must match this equality-prefix proof. No arbitrary target index count is allowed. In the audited schema this means two dedicated Resource list indexes, plus the four existing indexes above.

Search needs one native search index with equality filter fields `tipoRecursoId`, `activo`, and `adminScopeKey`. `unidadId` is removed from that search filter list.

### WU1 correction boundary

WU1 remains historically complete. A new pending correction unit before WU3 will:

- remove Resource `adminSortId` schema/write/projection/backfill behavior when no other non-Resource contract depends on it;
- replace the sixteen Resource `adminPor*` indexes with the equality-prefix-minimal scope indexes above;
- remove Unit from Resource search filters;
- reduce the Resource branch of the existing generic metadata backfill to idempotent `adminScopeKey` repair only;
- preserve pre-existing catalog-admin backfill plans and behavior outside the appended Resource branch;
- update focused schema/backfill/legacy tests; and
- regenerate declarations only through Convex codegen during implementation.

Already stored optional `adminSortId` values do not require destructive cleanup. They may remain inert after the field/index/write dependency is removed, subject to normal Convex schema rollout safety.

## Read data flows

### Ordinary list

1. React calls `usePaginatedQuery(api.catalogoAdmin.recursos.listarRecursosResumen, filters, { initialNumItems })`.
2. Convex supplies native pagination options to the generated query contract.
3. The query normalizes lifecycle and scope, selects the equality-prefix-valid index, and applies only `.eq(...)` clauses supported by that prefix.
4. The query calls `.paginate(paginationOpts)` once.
5. The bounded page is projected to value-free summaries and returned as the native pagination result.
6. Convex owns continuation, reactive updates, page accumulation, and generated typing.

No `.collect()`, post-index `.filter()`, custom cursor validation, or Resource-value load is allowed.

### Full-text search

1. Normalize text with NFC, trim, and collapsed internal whitespace; blank text is `ADMIN_INVALID_ARGUMENT`.
2. Use `withSearchIndex("buscar", q => q.search("nombre", normalizedText)...)`.
3. Apply supplied lifecycle, Type, and scope values as search-index equality filters.
4. Call `.paginate(paginationOpts)` directly.
5. Return the native pagination result after value-free projection.

Search order is Convex native relevance order. Regression tests cover text normalization, equality-filter behavior, equal-relevance traversal on unchanged data, and no value loading. There is no order token, version token, cursor wrapper, or fallback sort.

## Write simplification

Convex mutations are already atomic transactions and use optimistic concurrency control. Resource mutations should remain thin orchestration around GARFEX rules:

- revision-first `expectedRevision` checks;
- immutable classification and organization ownership;
- deterministic technical identity and alias rules;
- current effective-catalog and Resource aggregate validation;
- bounded duplicate checks including inactive Resources; and
- lifecycle-specific domain behavior.

No custom transaction coordinator, compensating writes, application lock, retry protocol, or rollback implementation is required. Tests assert the final database state after validation, duplicate, alias, or write failures. OCC race coverage should verify externally visible outcomes, not internal retry choreography.

## Revised delivery recommendation

Preserve W0 → WU1 → WU2a → WU2b as completed history. Continue with:

`WU2c correction → WU3 native list → WU4 native search → WU5 detail → WU6 create → WU7 update → WU8 lifecycle → WU9 generated React contract`

A separate `MAX_RESOURCE_VALUES` consolidation unit is not needed because the constant already has one production definition and consumers import it. WU2c adds an explicit no-duplication regression/check so later units cannot fork it.

## Remaining product decisions

None. Unit filtering remains intentionally excluded until a future UI requirement is demonstrated. Search relevance and ordinary index order are native Convex semantics, not unresolved product sort decisions.
