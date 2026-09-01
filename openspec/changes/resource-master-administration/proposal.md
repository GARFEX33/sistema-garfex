# Add native-first Resource master administration

## Intent

Add an additive `catalogoAdmin.recursos` API for safe Resource master administration while preserving every existing public Resource API. Resource reads use Convex native pagination, search, reactivity, and generated types; Resource writes use Convex atomic mutations and optimistic concurrency control. Custom code is limited to GARFEX domain and revision rules.

This is a backend and portable-contract change only. It does not implement a UI, replace `convex/catalogoRecursos/recursos.ts`, or authorize changes to existing custom catalog-admin pagination.

## Native-first rescope decision

The previous Resource plan copied catalog-admin pagination machinery that is unnecessary for this surface. The accepted correction is:

- query args use `paginationOptsValidator`;
- query results use native `PaginationResult<ResourceSummary>`;
- indexed list and full-text search end in `.paginate()`;
- React consumers use generated references directly with `usePaginatedQuery`;
- Convex owns native continuation, reactivity, page accumulation, code generation, atomic transactions, retries, and OCC; and
- Resource custom code implements only GARFEX validation, identity, ownership, revision, lifecycle, and error rules.

Resource administration will not define `AdminPage`, a cursor envelope/hash, plan or order tokens, manual page accumulation, or a custom cache.

## Audit rationale

The Resource table already has indexes for unscoped combinations of lifecycle and Type. WU1 added optional `adminSortId`, sixteen Resource list indexes, Unit filtering, and a broader Resource backfill because the prior design required a custom deterministic order and every optional filter combination. Native Convex pagination does not require that layer.

Only lifecycle, Type, and organization scope are essential filters. Equality-prefix analysis requires two new scope indexes in addition to existing `porIdentificadorTecnico`, `porActivo`, `porTipo`, and `porTipoYActivo` indexes:

1. `[adminScopeKey, tipoRecursoId, activo]` for scope, scope + Type, and scope + Type + lifecycle;
2. `[adminScopeKey, activo]` for scope + lifecycle.

Exact names may follow repository conventions. The implementation must preserve this field-order proof and must not chase an arbitrary index count. Unit filtering is excluded until a demonstrated UI requirement justifies it.

WU2a already centralizes `MAX_RESOURCE_VALUES` in one production definition, and the detail loader imports it. No separate consolidation unit is needed; later units must reuse that definition.

## Product outcome

A React consumer can use generated Convex references and types to:

- browse and search value-free Resource summaries with `usePaginatedQuery`;
- inspect one bounded Resource detail including stored values and diagnostics;
- create, update, activate, and deactivate Resources through structured revision-guarded commands; and
- receive reactive updates without a Resource-specific cache or synchronization layer.

## Goals

1. Add an additive `catalogoAdmin.recursos` API without changing legacy Resource names, arguments, returns, behavior, or Spanish errors.
2. Provide native paginated, indexed, value-free summary listing.
3. Provide native paginated full-text search in Convex relevance order.
4. Support only fully indexed lifecycle, Type, and organization-scope filters.
5. Provide direct bounded detail with one indexed value load and no silent truncation.
6. Keep classification and organization ownership immutable in the admin API.
7. Reuse existing Resource and effective-catalog validation.
8. Preserve ownership-aware duplicate and alias rules, including inactive rows.
9. Use thin Convex mutations with revision guards, atomicity, and OCC.
10. Expose generated Convex types and a direct `usePaginatedQuery` consumer fixture.
11. Preserve completed W0, WU1, WU2a, and WU2b evidence as historical truth, then correct WU1 before WU3.
12. Keep every pending authored work unit under 400 additions plus deletions.

## Non-goals

- Unit filtering for Resource list or search.
- A Resource administration UI.
- Rewriting existing custom catalog-admin pagination or consumers.
- Resource `AdminPage`, custom cursor binding, cursor hashes, query plans, order tokens, manual page accumulation, or custom caching.
- Bandeja, XML, import/export, authentication, authorization, roles, permissions, seed capabilities, hard delete, cascades, publication changes, or snapshots.
- Classification or organization ownership migration.
- Replacement or widening of existing public Resource functions.

## Product and business rules

### Native list and search

- `listarRecursosResumen` and `buscarRecursosResumen` accept native pagination options validated by `paginationOptsValidator`.
- Both return native pagination results containing value-free `ResourceSummary` rows.
- List uses one equality-prefix-valid index and one `.paginate()` call.
- Search uses `withSearchIndex`, native equality filters, and one `.paginate()` call.
- Search text is NFC-normalized, trimmed, and whitespace-collapsed; blank text is invalid.
- Search order is Convex native relevance order. Ordinary list order is the selected Convex index order. Neither endpoint promises lexical or technical-identity product sorting.
- Changing ordinary query arguments causes native React query identity/reset behavior; there is no custom cursor mismatch protocol.
- Summary endpoints never load `valoresAtributoRecurso`.

### Supported filters

- lifecycle: `ALL`, `ACTIVE`, `INACTIVE`;
- optional Type ID; and
- scope: all, global, or one organization.

Every supplied equality filter must be applied through an index or search-index equality field. Unit is not accepted.

### Detail

- Detail is a direct Resource ID lookup and returns stored fields, current diagnostics, and all stored values within `MAX_RESOURCE_VALUES`.
- Values use one `porRecurso` read bounded by `MAX_RESOURCE_VALUES + 1`.
- Excess cardinality returns structured `ADMIN_INVALID_STATE`; values are never truncated.
- Historical inactive or inert Resources remain inspectable.

### Writes

- Every command is one Convex mutation transaction.
- Create validates and atomically writes Resource, values, and organization alias.
- Update checks `expectedRevision` before no-op and business validation, validates a complete candidate, and atomically replaces values and patches one revision.
- Activate/deactivate check revision before same-state handling; activate validates current effective state, while deactivate preserves aggregate data.
- Convex atomicity and OCC are authoritative. No compensating writes, custom locks, or transaction wrapper is introduced.
- Failure tests inspect final Resource/value/alias state and retain GARFEX revision/domain assertions.

## Compatibility boundary

The existing functions in `convex/catalogoRecursos/recursos.ts` remain unchanged in public name, arguments, return shape, behavior, and Spanish error text. Existing catalog-admin `AdminPage`/cursor machinery, where already used, remains outside this Resource rescope and is not a template or rewrite target here.

## Corrective rollout

1. Keep W0, WU1, WU2a, and WU2b checkboxes and receipts complete.
2. Apply WU2c before any WU3 work:
   - remove Resource Unit list/search behavior;
   - remove unnecessary Resource `adminSortId` behavior;
   - replace sixteen Resource list indexes with the equality-prefix-minimal scope indexes;
   - reduce the appended Resource backfill behavior to `adminScopeKey` repair only;
   - preserve pre-existing catalog-admin metadata backfill behavior; and
   - verify the existing single `MAX_RESOURCE_VALUES` definition remains authoritative.
3. Wait for corrected indexes/search index to be ready and complete `adminScopeKey` repair.
4. Implement WU3–WU9 in order.

Rollback removes additive endpoints first. Optional historical metadata may remain inert; no rollback deletes Resource, value, alias, catalog, or publication data.

## Revised work-unit forecast

| Order | Work unit | State | Forecast authored lines | Rollback boundary |
|---:|---|---|---:|---|
| W0 | Planning/runtime metadata | Complete history | recorded | Evidence only |
| WU1 | Original Resource metadata/index/backfill slice | Complete history; superseded in part | recorded | Correct through WU2c, do not rewrite receipt |
| WU2a | Resource contracts/projections/detail seam | Complete history | recorded | Existing focused helper boundary |
| WU2b | Resource validation/ADMIN mapping seam | Complete history | recorded | Existing focused validation boundary |
| WU2c | Native-first Resource schema/backfill correction | Pending | 180 | Corrected Resource schema/backfill/write/test changes only |
| WU3 | Native paginated list | Pending | 155 | List export and list tests |
| WU4 | Native paginated full-text search | Pending | 145 | Search export and search tests |
| WU5 | Direct bounded detail | Pending | 120 | Detail export and integration tests |
| WU6 | Thin atomic create | Pending | 175 | Admin create orchestration/tests |
| WU7 | Thin revision-first update | Pending | 210 | Admin update orchestration/tests |
| WU8 | Thin lifecycle mutations | Pending | 145 | Lifecycle exports/tests |
| WU9 | Generated native React contract and regressions | Pending | 110 authored | Fixture/package exposure/docs; generated output separate |

Pending authored work is forecast at approximately 1,240 lines. Every pending unit is below 400 authored changed lines; split before review if any unit approaches 350.

## Verification direction

- focused Vitest/`convex-test` coverage per work unit;
- native list/search multi-page traversal with no duplicates or omissions on unchanged data;
- direct `usePaginatedQuery` consumer typing using native paginated query shapes;
- equality-prefix/index schema assertions and no Unit filter;
- summary no-value-load and detail single bounded-load assertions;
- final-state atomic failure assertions for create/update/lifecycle;
- stale revision, immutable field, identity, alias, and current-effective-state rules;
- legacy Resource regression tests; and
- full Vitest, typecheck, consumer typecheck, Convex codegen, and runtime evidence when available.

## Remaining product decisions

None. A future Unit filter requires a separate demonstrated UI need and index decision. Existing catalog-admin pagination remains explicitly unchanged by this proposal.
