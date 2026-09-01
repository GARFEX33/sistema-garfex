# Design: Native-First Resource Master Administration

## 1. Decision

Implement the additive `api.catalogoAdmin.recursos` surface with native Convex pagination, search, reactivity, generated types, atomic mutations, and optimistic concurrency control. Custom Resource code exists only for GARFEX business rules and projections.

The prior Resource design is superseded where it required `AdminPage`, cursor envelopes/hashes, list/search plans, order/version tokens, `adminSortId`, Unit filtering, manual page accumulation, or a custom cache. Completed W0, WU1, WU2a, and WU2b receipts remain historical truth. Completed WU2c corrects WU1 before WU3; WU3 is next.

Existing custom catalog-admin pagination remains outside this Resource rescope. No catalog-admin query, cursor, page result, cache, or consumer is authorized for rewrite here.

## 2. Design principles

1. **Native before custom:** use `paginationOptsValidator`, `PaginationResult`, `.paginate()`, `usePaginatedQuery`, generated references, transaction atomicity, and OCC directly.
2. **Only indexed filters:** Resource list/search supports lifecycle, Type, and organization scope only.
3. **No speculative Unit filter:** Unit remains a summary/detail field but is not a list/search control until a UI requirement is demonstrated.
4. **No duplicate platform layer:** no Resource cursor protocol, pagination adapter, page accumulator, cache, lock, compensating transaction, or retry coordinator.
5. **GARFEX rules remain explicit:** revisions, immutable ownership/classification, effective-catalog validation, identity/alias behavior, and structured errors remain application responsibilities.
6. **Historical evidence is immutable:** completed work receipts are not rewritten; corrective work is represented by a new unit and new evidence.

## 3. Trade-offs

| Decision | Chosen direction | Consequence |
|---|---|---|
| Resource page contract | Native Convex pagination result | Consumers couple to the generated Convex contract, which is intentional; no custom stable page DTO is maintained. |
| Cursor behavior | Native opaque continuation cursor | No Resource-specific cross-filter cursor error or hash; changed React args use native query identity/reset behavior. |
| Ordinary ordering | Selected Convex index order | Stable native traversal without `adminSortId`; no lexical/technical-identity product sort promise. |
| Search ordering | Convex native relevance | Preserves search semantics and removes token/version runtime layers; regression covers unchanged-data traversal. |
| Filters | lifecycle + Type + scope | Covers demonstrated essentials with full indexing; Unit filtering is deferred. |
| Scope metadata | Keep `adminScopeKey` only | One derived equality field and bounded repair are required for global/organization selection. |
| Writes | Thin mutation orchestration | Convex provides atomic commit/rollback and OCC; tests focus on final state rather than internal retries. |
| Existing catalog pagination | Leave unchanged | Resource and catalog administration may use different page contracts; avoiding an unrelated migration is safer. |

## 4. Additive API contract

Create or complete `convex/catalogoAdmin/recursos.ts` with seven public functions:

| Function | Kind | Native/result contract |
|---|---|---|
| `listarRecursosResumen` | query | `PaginationResult<ResourceSummary>` |
| `buscarRecursosResumen` | query | `PaginationResult<ResourceSummary>` |
| `obtenerDetalleRecurso` | query | `ResourceDetail | null` |
| `crearRecurso` | mutation | established `CreateResult<ResourceSummary>` |
| `actualizarRecurso` | mutation | established `ChangeResult<ResourceSummary>` |
| `activarRecurso` | mutation | established `ChangeResult<ResourceSummary>` |
| `desactivarRecurso` | mutation | established `ChangeResult<ResourceSummary>` |

All registered functions use object syntax with args and return validators.

### 4.1 Native list arguments

Conceptual generated arguments:

```ts
{
  paginationOpts: paginationOptsValidator,
  lifecycle?: "ALL" | "ACTIVE" | "INACTIVE",
  tipoRecursoId?: Id<"tiposRecurso">,
  scope?:
    | { kind: "ALL" }
    | { kind: "GLOBAL" }
    | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
}
```

Omitted lifecycle and scope normalize to `ALL`. No `unidadId`, page size, cursor envelope, plan, sort, or order/version argument exists. Page size and native cursor are inside `paginationOpts`.

Use the installed Convex exports for:

- `paginationOptsValidator`;
- `paginationResultValidator(resourceSummaryValidator)` for the registered return validator; and
- `PaginationResult<ResourceSummary>` for internal/static typing.

Implementation must verify the exact installed 1.45.x export locations before coding; no hand-written approximation of the native page shape is allowed.

### 4.2 Native search arguments

Search has the list controls plus `searchText: string`. It uses the same `paginationOpts` contract and returns the same native pagination result. Search text normalization is GARFEX adapter behavior:

1. Unicode NFC;
2. trim leading/trailing whitespace;
3. collapse internal whitespace runs;
4. reject blank result with `ADMIN_INVALID_ARGUMENT`.

There is no cursor binding, search plan, search-order token, runtime version token, or custom cache key.

### 4.3 Summary and detail

WU2a's completed value-free `ResourceSummary` and bounded `ResourceDetail` remain the contract. Summary contains Unit as display/reference data but list/search cannot filter by it.

`MAX_RESOURCE_VALUES` currently has one production definition in `convex/catalogoAdmin/resourceValidators.ts`, and `recursoDetalle.ts` imports it. WU2c confirms this remains the sole definition. WU5–WU8 import it rather than declaring another constant. A separate consolidation unit is therefore unnecessary.

## 5. Schema and equality-prefix design

### 5.1 Scope key

Retain only:

```text
adminScopeKey = "GLOBAL"
adminScopeKey = "ORG:<organizacionId>"
```

The field remains optional during populated-data rollout. Legacy and admin create paths write it. The Resource branch appended to `backfillMetadatos` repairs only missing or incorrect `adminScopeKey`; it does not compute Resource sort metadata or add Resource duplicate reporting. Pre-existing non-Resource catalog-admin backfill plans remain unchanged.

### 5.2 Remove Resource custom sort behavior

Convex indexes provide stable native traversal and native continuation. Therefore Resource `adminSortId` is removed from:

- Resource read design and contracts;
- Resource index definitions;
- legacy/admin Resource writes;
- Resource metadata derivation;
- the appended Resource backfill branch; and
- Resource tests and generated model expectations.

The schema keeps `adminSortId` as a clearly deprecated optional storage field temporarily because this execution cannot prove that every deployed row is free of WU1 metadata. It is inert residue only: no runtime write, query, index, backfill, or API contract depends on it.

Safe populated-data rollout:

1. audit whether WU1's optional Resource `adminSortId` reached a deployment;
2. stop writes/backfill production of the field and remove all index dependencies;
3. if stored values exist, run a bounded one-time operator cleanup over `recursos` using `porIdentificadorTecnico`, unsetting only `adminSortId` page by page, then independently verify zero remaining values;
4. remove the optional schema field in a later tightening deployment only after that cleanup is proven; and
5. never delete or rewrite Resource business data.

This WU2c records the cleanup/tightening boundary but does not add an executable cleanup helper: the generic metadata backfill remains scope-only, and no runtime path may depend on the obsolete field. WU1 runtime evidence claimed no successful deployment, but the active local dev session and any deployed rows cannot be treated as proof of absence.

### 5.3 Exact list index coverage

Existing schema indexes cover all combinations without scope:

| Filters | Index |
|---|---|
| none | `porIdentificadorTecnico` |
| lifecycle | `porActivo` |
| Type | `porTipo` |
| Type + lifecycle | `porTipoYActivo` |

Add exactly the scope equality-prefix shapes required by the remaining combinations:

| Shape | Covers |
|---|---|
| `[adminScopeKey, tipoRecursoId, activo]` | scope; scope + Type; scope + Type + lifecycle |
| `[adminScopeKey, activo]` | scope + lifecycle |

Repository-conventional names may be `adminPorScopeYTipoYActivo` and `adminPorScopeYActivo`. The names are not contractual; equality-prefix field order is. No Unit or sort suffix is present. This gives two dedicated Resource admin list indexes, not an arbitrary target.

### 5.4 Search index

The Resource `buscar` index remains:

```text
searchField: nombre
filterFields: [tipoRecursoId, activo, adminScopeKey]
```

Remove `unidadId`. Search equality filters are added only when supplied.

## 6. Read data flow

### 6.1 List

```text
React usePaginatedQuery
  → generated listarRecursosResumen reference
  → normalize lifecycle/scope
  → choose equality-prefix-valid index branch
  → withIndex(...eq clauses...)
  → paginate(args.paginationOpts)
  → project bounded page to ResourceSummary
  → return native PaginationResult
```

Index branch table:

| Scope | Type | Lifecycle | Branch |
|---|---|---|---|
| ALL | none | ALL | `porIdentificadorTecnico` |
| ALL | none | ACTIVE/INACTIVE | `porActivo` |
| ALL | set | ALL | `porTipo` |
| ALL | set | ACTIVE/INACTIVE | `porTipoYActivo` |
| GLOBAL/ORG | none | ALL | scope/Type/active index with scope equality only |
| GLOBAL/ORG | none | ACTIVE/INACTIVE | scope/active index |
| GLOBAL/ORG | set | ALL | scope/Type/active index through Type prefix |
| GLOBAL/ORG | set | ACTIVE/INACTIVE | scope/Type/active index through full equality prefix |

Each branch calls `.paginate()` exactly once. The handler preserves native pagination metadata and replaces only `page` with projected summaries. It performs no `.collect()`, query `.filter()`, in-memory sort, value load, or custom cursor transformation.

Classification annotation may load bounded direct references for each page item as already designed in WU2a, but it must not load Resource values or whole aggregate diagnostics.

### 6.2 Search

```text
React usePaginatedQuery
  → generated buscarRecursosResumen reference
  → normalize and validate search text
  → withSearchIndex("buscar", search + supplied equality filters)
  → paginate(args.paginationOpts)
  → project bounded page to ResourceSummary
  → return native PaginationResult in relevance order
```

Search order is native Convex relevance. Tests create more equal-relevance results than one page and repeat traversal on unchanged data. A Convex version update reruns the regression, but no runtime order-version token is added.

### 6.3 React behavior

Consumer code uses:

```ts
usePaginatedQuery(
  api.catalogoAdmin.recursos.listarRecursosResumen,
  { lifecycle, tipoRecursoId, scope },
  { initialNumItems: 25 },
)
```

and the corresponding search reference. The hook owns load-more state, accumulated `results`, reactive updates, and reset when ordinary args change. The Resource package exposes no page reducer, cursor store, query cache, or synchronization utility.

## 7. Detail data flow

WU5 wires the completed WU2a detail seam:

1. `ctx.db.get(recursoId)`;
2. return `null` when absent;
3. resolve nullable current references and diagnostics;
4. call `loadResourceValuesBounded` exactly once;
5. return all values when count is at most `MAX_RESOURCE_VALUES`;
6. throw validated `ADMIN_INVALID_STATE` at `MAX_RESOURCE_VALUES + 1`.

Summary modules cannot import the detail/value loader. Stored inactive/inert Resources remain inspectable.

## 8. Thin mutation architecture

Every command is one Convex mutation. No action, external I/O, custom transaction manager, compensating write, lock table, cache invalidation, or manual OCC retry exists.

### 8.1 Shared GARFEX mutation seams

- normalize names/descriptions and candidate values;
- load current Resource and bounded values;
- compare expected revision first;
- resolve current effective catalog and validate Resource aggregate;
- derive technical identity;
- perform bounded ownership-aware duplicate and alias lookups;
- enforce immutable classification/ownership and lifecycle boundaries;
- map failures through WU2b's structured `ADMIN_*` seam.

These seams calculate and validate. The registered mutation owns the single transaction and performs the final writes.

### 8.2 Create

1. normalize and bound input;
2. validate organization and effective catalog;
3. validate complete Resource values;
4. derive identity;
5. check scoped duplicate and exact alias;
6. insert Resource revision 1 with `adminScopeKey`;
7. insert values;
8. insert organization alias when required;
9. return `CREATED` summary.

Convex aborts all writes on any throw. OCC retries conflicting transactions; after retry, a loser observes duplicate/alias state. Tests assert at most one committed identity and final aggregate state, not retry count.

### 8.3 Update

1. load Resource or `ADMIN_NOT_FOUND`;
2. compare `expectedRevision` before no-op or domain work;
3. enforce immutable echoes/boundaries;
4. bounded-load stored values using centralized `MAX_RESOURCE_VALUES`;
5. build and validate the complete candidate;
6. return `UNCHANGED` only if the valid normalized candidate equals stored state;
7. derive/check identity, including inactive conflicts;
8. replace bounded values and patch Resource once with revision + 1;
9. preserve aliases;
10. return `UPDATED`.

Any failure leaves final Resource, revision, values, and aliases unchanged through native transaction atomicity.

### 8.4 Lifecycle

Both commands load and compare revision before same-state handling.

- Deactivate: patch only `activo: false` and revision + 1.
- Activate: bounded-load values, validate current effective state, derive/check identity, then patch `activo: true` and revision + 1.
- Current same state: `UNCHANGED` with no revision change.
- Stale same state: `ADMIN_STALE_REVISION`.

Existing indexed catalog blockers continue to use active Resource state. No cascade or publication behavior is introduced.

## 9. Module and file changes

| Surface | WU2c–WU9 design |
|---|---|
| `convex/schema.ts` | WU2c removes Unit/search and sixteen Resource sort indexes; retains scope key; adds only two equality-prefix scope indexes; safely removes Resource `adminSortId`. |
| `convex/catalogoAdmin/lib/backfillMetadatos.ts` | Preserve catalog plans; Resource branch repairs only `adminScopeKey`. Optional obsolete-field cleanup is a separate bounded WU2c rollout helper if deployed data requires it. |
| `convex/catalogoRecursos/recursos.ts` | WU2c stops Resource `adminSortId` writes while preserving public projections/contracts; continues scope-key writes. |
| `convex/catalogoAdmin/resourceValidators.ts` | Keep completed summary/detail contracts and sole `MAX_RESOURCE_VALUES`; add native list/search args validators without duplicating page types. |
| `convex/catalogoAdmin/lib/recursoResumen.ts` | Keep value-free projection; add small native index branch selection and search normalization only. |
| `convex/catalogoAdmin/lib/recursoDetalle.ts` | Keep centralized bounded loader and detail assembly. |
| `convex/catalogoAdmin/lib/recursoValidacion.ts` | Keep completed GARFEX-to-`ADMIN_*` mapping; reuse from thin mutations. |
| `convex/catalogoAdmin/lib/recursoPersistencia.ts` | Bounded identity/alias lookups and write helpers only; no transaction/cache/retry abstraction. |
| `convex/catalogoAdmin/recursos.ts` | Registered native paginated queries and thin mutations. |
| `contract-tests/resource-admin-consumer.ts` | Direct generated `usePaginatedQuery`, native args/results, mutations, IDs, diagnostics, and structured error typing. |
| package exports/generated files | Expose generated references/types only; generated files remain CLI-owned. |

No implementation file for a Resource page envelope, cursor codec, pagination reducer, cache, or Unit filter is permitted.

## 10. Test design

Every pending unit follows RED → GREEN → TRIANGULATE → REFACTOR and remains below 400 authored changed lines.

### WU2c correction

- schema asserts no Resource Unit search filter, sort field dependency, or sixteen sort indexes;
- equality-prefix matrix proves exactly two new scope shapes plus existing coverage;
- Resource backfill repairs only scope key and preserves business data;
- legacy/admin creates write scope key but not sort metadata;
- optional obsolete-field cleanup is bounded and final-state safe if deployment audit requires it;
- legacy Resource tests remain unchanged;
- one production `MAX_RESOURCE_VALUES` definition is asserted/imported.

### WU3 native list

- native args/returns validators;
- all eight lifecycle/Type/scope combinations;
- native page sizes and continuation over 1,000+ unchanged Resources;
- no duplicates/omissions and termination;
- no `.collect()`, post-index `.filter()`, values, custom cursor tests, or Unit argument;
- direct generated paginated query shape.

### WU4 native search

- normalization and blank rejection;
- essential equality filters only;
- native `.paginate()` and relevance order;
- repeated equal-relevance traversal at several native page sizes;
- no values, collect/sort fallback, cursor binding tests, plan token, or version token.

### WU5 detail

- missing `null`;
- active/inactive/inert/broken diagnostics;
- 0/1/max/max+1 values;
- exactly one indexed value load;
- no duplicated limit constant.

### WU6–WU8 mutations

- GARFEX validation, revision, immutable, identity, alias, and lifecycle rules;
- final database state after every failure;
- concurrent-equivalent externally visible outcome under OCC;
- no tests coupled to retry count, compensating writes, custom locks, or internal transaction choreography.

### WU9 generated consumer

- `FunctionArgs`/`FunctionReturnType` and `Id<"recursos">`;
- direct React `usePaginatedQuery` for list/search;
- native results/status/load-more typing;
- all mutation result dispositions and detail diagnostics;
- `AdminErrorData` narrowing;
- no DTO, adapter, cache, manual accumulator, Unit filter, or backend implementation import;
- unchanged legacy generated references.

Full verification:

- `pnpm exec vitest run`
- `pnpm typecheck`
- `pnpm typecheck:consumer`
- `pnpm exec convex codegen --typecheck enable`
- `git diff --check`
- `pnpm exec convex dev --once` when a deployment is available, otherwise exact runtime N/A evidence

## 11. Rollout and rollback

### Rollout

1. Preserve W0/WU1/WU2a/WU2b receipts.
2. WU2c audited deployment state, stopped obsolete sort writes, corrected Resource indexes/search filters, repaired scope metadata, and safely retained obsolete Resource sort metadata as inert rollout residue where deployment absence could not be proven.
3. Wait for corrected indexes/search index to become ready and complete scope repair.
4. Deploy WU3 native list.
5. Deploy WU4 native search.
6. Deploy WU5–WU8 detail and mutations.
7. Generate and expose WU9 consumer contract.
8. Run full legacy and native consumer verification.

### Rollback

- Revert the affected additive Resource endpoint unit first.
- WU2c rollback may retain a populated `adminScopeKey`; it is harmless derived metadata.
- Never restore unnecessary sort indexes merely to preserve historical WU1 implementation shape; WU1 history is preserved in receipts, not by keeping superseded behavior.
- Never delete Resources, values, aliases, catalog revisions, or snapshots.
- Successful Resource mutations remain valid ordinary Resource data if admin functions are removed.
- Existing catalog-admin pagination remains untouched throughout rollout and rollback.

## 12. Work-unit sequence and forecast

| Unit | State | Dependency | Forecast authored lines | Independent rollback |
|---|---|---|---:|---|
| W0 | Complete history | approved planning | recorded | evidence only |
| WU1 | Complete history; partially superseded | catalog admin stack | recorded | corrected by WU2c; receipt unchanged |
| WU2a | Complete history | WU1 | recorded | contracts/projections/detail helpers |
| WU2b | Complete history | WU2a | recorded | validation/mapping seam |
| WU2c | Complete | WU2b | 180 | Resource schema/backfill/write correction and focused tests |
| WU3 | Pending | WU2c | 155 | native list export/tests |
| WU4 | Pending | WU3 | 145 | native search export/tests |
| WU5 | Pending | WU2a, WU2c | 120 | detail export/integration tests |
| WU6 | Pending | WU2b, WU5 | 175 | create export/orchestration/tests |
| WU7 | Pending | WU6 | 210 | update export/orchestration/tests |
| WU8 | Pending | WU7 | 145 | lifecycle exports/tests |
| WU9 | Pending | WU3–WU8 | 110 authored | generated consumer fixture/package exposure/docs |

Pending forecast is approximately 1,240 authored changed lines. Every pending unit is under 400; split before review if any approaches 350. Generated declarations are tracked separately.

There are 48 implementation-owned TDD rows after adding WU2c: 20 completed rows and 28 pending rows. Two parent-owned gates remain pending, for 50 total task rows.

## 13. Remaining product decisions

None. Unit filtering requires a future demonstrated UI requirement. Deployment inspection for obsolete optional metadata is a technical rollout check, not a product decision.
