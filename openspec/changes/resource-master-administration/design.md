# Design: Bounded Resource Master Administration

## 1. Design intent

Implement an additive Convex administration surface at `api.catalogoAdmin.recursos` without replacing or widening any function in `api.catalogoRecursos.recursos`. The implementation will use Convex 1.45.0 native transactions, indexes, search pagination, validators, and generated function references.

This design preserves the existing public Resource function names, arguments, return shapes, behavior, and Spanish error messages. Bandeja, XML, authentication, permissions, seed capabilities, UI, hard delete, cascading delete, publication changes, and public API replacement remain out of scope.

## Trade-offs

| Decision | Chosen direction | Trade-off |
|---|---|---|
| Additive vs replacement | Additive `catalogoAdmin.recursos` surface | Duplicates some entry points, but protects legacy names, returns, and errors. |
| Sort metadata vs memory sorting | Optional indexed sort metadata for ordinary lists | Adds schema/index and rollout work, but avoids unbounded scans and in-memory sorting. It is not a search fallback. |
| Summary/detail vs embedded values | Value-free summaries; bounded values only in direct detail | Requires a second read for values, but prevents N+1 payloads and keeps list pages bounded. |
| Immutable classification/ownership vs migration | Reject changes in this API | Defers migration and alias-transfer complexity to an explicit future change. |
| Native search vs custom projection | Convex 1.45.0 native indexed relevance traversal | Preserves native relevance semantics; traversal must be proven before dependency, otherwise design/spec revision is required. |
| Bounded limit vs unbounded reads | Enforce explicit page, aggregate, and value limits | Some oversized data must be repaired or handled separately, but silent truncation and runaway reads are avoided. |

## 2. Evidence-based decisions

Repository evidence fixes the main design choices:

- `recursos` already owns classification by `tipoRecursoId`, Unit, derived identity, lifecycle, revision, and optional organization ownership.
- `valoresAtributoRecurso.porRecurso` is the authoritative aggregate relationship.
- `identidadesRecurso.porOrganizacionVersionClave` is the organization/version alias boundary.
- `validacionRecurso.ts` and the pure domain modules already define Resource validity and identity; these rules will be exposed through a non-throwing administrative seam rather than copied.
- `catalogoAdmin/lib` already defines the `ADMIN_*` payloads, opaque cursor envelope, page bounds, revision behavior, effective aggregate loader, and result unions.
- Convex 1.45.0's installed `query.d.ts` defines `withSearchIndex` as an `OrderedQuery`, supports `.paginate(...)`, and documents relevance ordering and adjacent, non-overlapping native pages. It does not promise lexical ordering.
- Existing Resource reads spread a `recursos` document into their legacy result. Adding optional metadata therefore requires changing that internal projection to an explicit legacy field projection, or the legacy return validator could receive new fields. This internal change must not alter the generated legacy shape.

## 3. Additive API contract

Create `convex/catalogoAdmin/recursos.ts` with these public Convex functions:

| Function | Kind | Result |
|---|---|---|
| `listarRecursosResumen` | query | `AdminPage<ResourceSummary>` |
| `buscarRecursosResumen` | query | `AdminPage<ResourceSummary>` |
| `obtenerDetalleRecurso` | query | `ResourceDetail | null` |
| `crearRecurso` | mutation | `CreateResult<ResourceSummary>` |
| `actualizarRecurso` | mutation | `ChangeResult<ResourceSummary>` |
| `activarRecurso` | mutation | `ChangeResult<ResourceSummary>` |
| `desactivarRecurso` | mutation | `ChangeResult<ResourceSummary>` |

All registered functions use object form and declare both argument and return validators.

### 3.1 Shared input contracts

- `ResourceClassificationInput`: Class ID, Family ID, and Type ID.
- `ResourceOwnershipInput`: `{ kind: "GLOBAL" }` or `{ kind: "ORGANIZATION", organizacionId }`.
- `ResourceValueInput`: assignment ID, scalar value, and optional option ID.
- Description inputs use `string | null`; `null` clears the optional stored field.
- Create accepts classification, ownership, Unit, name, description, and values. It does not accept technical identity or active state. New Resources are active at revision 1.
- Update accepts Resource ID, `expectedRevision`, and optional mutable replacements for name, description, Unit, and values.
- Update also accepts an optional `immutableEcho` object solely to provide structured rejection for attempted Type/Class/Family, ownership, technical-identity, or active-state writes. Classification and ownership echoes must equal stored ownership; any supplied technical identity or active state is rejected. Omitting the echo never makes those fields mutable.
- Lifecycle commands accept only Resource ID and `expectedRevision`.

### 3.2 Summary projection

`ResourceSummary` contains only:

- `id`;
- `identificadorTecnico`;
- `nombre`;
- `tipoRecursoId`;
- `unidadId`;
- optional `organizacionId`;
- `activo`;
- `revision`; and
- `classificationStatus`, containing `state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE"` and the current hierarchy reasons.

`classificationStatus` is computed from the stored Type, its Family and Class, and `resolverJerarquiaEfectiva`. It does not evaluate or return Resource values. Resource lifecycle (`activo`) remains separate from catalog effectiveness.

### 3.3 Detail projection

`ResourceDetail` contains the summary fields plus:

- stored description and identity version;
- nullable resolved Class, Family, Type, Unit, and organization references, so damaged historical rows remain inspectable;
- `catalogDiagnostics` with hierarchy effectiveness/reasons, aggregate status (`VALID`, `INVALID`, or `NOT_EVALUATED`), and coded violations from `cargarAgregado`;
- all stored value rows, without joining each value to definitions or options.

The detail adapter reports current references and diagnostics; it does not rewrite or hide stored history. Missing catalog documents result in nullable references and inert/broken diagnostics, not a missing Resource response. Only a missing Resource ID returns `null`.

## 4. Module boundaries and allowed dependencies

The implementation is additive and uses this dependency direction:

```text
src/catalogoRecursos/dominio/*
           ^
convex/catalogoRecursos/validacionRecurso.ts
           ^
convex/catalogoAdmin/lib/recursoValidacion.ts
           ^
convex/catalogoAdmin/recursos.ts
```

Additional modules:

| File | Responsibility | Allowed dependencies |
|---|---|---|
| `convex/catalogoAdmin/resourceValidators.ts` | Resource args, summary, detail, diagnostics, and value validators; inferred internal types | `convex/values`, shared `catalogoAdmin/validators.ts` |
| `convex/catalogoAdmin/lib/recursoResumen.ts` | Pure summary projection, hierarchy annotation, list plan selection | generated data types, `catalogoEfectivo`, pagination types; never the value loader |
| `convex/catalogoAdmin/lib/recursoDetalle.ts` | Direct detail assembly and bounded value loading | `recursoResumen`, `cargarAgregado`, generated server/data types |
| `convex/catalogoAdmin/lib/recursoValidacion.ts` | Bounded administrative validation and domain-failure-to-`ADMIN_*` mapping | existing Resource validation seam, `cargarAgregado`, admin errors |
| `convex/catalogoAdmin/lib/recursoPersistencia.ts` | metadata, identity duplicate lookup, alias conflict lookup, aggregate writes | generated server/data types, existing identity and alias modules |
| `convex/catalogoAdmin/recursos.ts` | registered query/mutation orchestration only | the five Resource helpers and completed admin helpers |

Rules for dependency safety:

1. `recursoResumen.ts` must not import `recursoDetalle.ts`, `recursoPersistencia.ts`, or query `valoresAtributoRecurso`.
2. `recursoDetalle.ts` may import the summary projector; the reverse dependency is forbidden.
3. Admin code may reuse `catalogoRecursos` domain/adapter helpers. Existing public Resource modules must not depend on the new admin API.
4. Shared extraction from `validacionRecurso.ts` or `identidadesRecurso.ts` must preserve their current wrappers and Spanish messages.
5. Generated `_generated` files are produced only by Convex code generation and are never hand-maintained.
6. No new database, cache, queue, or service is introduced.

## 5. Schema, indexes, and populated-data rollout

### 5.1 Optional metadata

Add these optional fields to `recursos`:

- `adminSortId?: string`, always the Resource ID for newly written/backfilled rows;
- `adminScopeKey?: string`, equal to `GLOBAL` or `ORG:<organizacionId>`.

They are optional because `recursos` is populated. No deployment adds a required field to existing rows.

Every new Resource created by either the legacy or administrative mutation writes both fields. Administrative update heals them if absent. Ownership is immutable, so `adminScopeKey` does not otherwise change. The legacy `respuesta` helper changes from document spreading to an explicit legacy projection that omits both fields; all protected public returns remain byte-for-field compatible.

### 5.2 Deterministic list indexes

Ordinary admin ordering is ascending `(identificadorTecnico, adminSortId)`, identified by order token `resource-identity-id-v1`. Filters are independently combinable: Type, Unit, and ownership. Lifecycle is `ALL`, `ACTIVE`, or `INACTIVE`.

To avoid post-index filtering and sparse/unbounded page scans, add one index for each filter subset, and a lifecycle-prefixed counterpart:

- no facet: `adminPorOrden`, `adminPorActivoYOrden`;
- Type: `adminPorTipoYOrden`, `adminPorActivoYTipoYOrden`;
- Unit: `adminPorUnidadYOrden`, `adminPorActivoYUnidadYOrden`;
- scope: `adminPorScopeYOrden`, `adminPorActivoYScopeYOrden`;
- Type + Unit: `adminPorTipoYUnidadYOrden`, `adminPorActivoYTipoYUnidadYOrden`;
- Type + scope: `adminPorTipoYScopeYOrden`, `adminPorActivoYTipoYScopeYOrden`;
- Unit + scope: `adminPorUnidadYScopeYOrden`, `adminPorActivoYUnidadYScopeYOrden`;
- Type + Unit + scope: `adminPorTipoYUnidadYScopeYOrden`, `adminPorActivoYTipoYUnidadYScopeYOrden`.

Each index consists of exactly the named equality prefixes, followed by `identificadorTecnico` and `adminSortId`. Lifecycle-prefixed indexes put `activo` first. The planner uses a fixed mapping from the normalized filter bitmask and lifecycle mode to one index; it never falls back to `.filter()` or a full-table scan.

### 5.3 Search index

Extend the existing `recursos.buscar` search index filter fields from Type and active state to:

- `tipoRecursoId`;
- `unidadId`;
- `activo`;
- `adminScopeKey`.

The search field remains `nombre`; changing search semantics to include technical identity is not justified by existing behavior. Search results are documented as Convex 1.45.0 relevance order.

### 5.4 Safe backfill

Append a `recursos` plan to `catalogoAdmin/lib/backfillMetadatos.ts`; appending preserves the numeric meaning of any existing in-flight plan cursor. The plan paginates `recursos.porIdentificadorTecnico` in batches of at most 100 and idempotently patches only missing/incorrect `adminSortId` and `adminScopeKey` values.

Rollout order is mandatory:

1. Deploy optional fields, indexes, explicit legacy projection, metadata writes in both create paths, and the appended internal backfill plan.
2. Run the resumable backfill until it returns `nextCursor: null`. A rerun is safe and is the completion audit; concurrent creates already carry metadata.
3. Wait for Convex indexes/search index to report ready.
4. Deploy/enable Resource admin list and search functions.
5. Run traversal and legacy compatibility smoke tests before consumer adoption.

A filtered admin endpoint must not be exposed before step 2, because a missing `adminScopeKey` could otherwise omit a historical row. Rollback first removes/reverts admin endpoints; optional metadata and unused indexes may remain. No rollback deletes or rewrites Resource, value, alias, or publication data.

## 6. List and search data flow

### 6.1 List

1. Validate `pageSize` with the existing `validatePageSize` bound (default 25, integer 1–100).
2. Normalize omitted lifecycle to `ALL`, IDs to string values in the binding object, and ownership to `ALL`, `GLOBAL`, or `ORG:<id>`.
3. Choose the exact index plan from the filter bitmask and lifecycle mode.
4. Consume the opaque cursor with context:
   - `plan`: selected index name;
   - `mode`: normalized lifecycle mode;
   - `filters`: `{ tipoRecursoId: id|null, unidadId: id|null, scope: key|null }`;
   - `order`: `resource-identity-id-v1`.
5. Execute one indexed `.order("asc").paginate({ numItems: pageSize, cursor })`.
6. Resolve only Type/Family/Class references for the bounded page and project summaries.
7. Wrap the native cursor with the existing `createCursor`; return null when exhausted.

No branch in this flow receives a value loader capability.

### 6.2 Search

Search text is NFC-normalized, trimmed, and internal whitespace is collapsed. Blank text fails with `ADMIN_INVALID_ARGUMENT`. The binding includes normalized text plus the same normalized filters and lifecycle mode as list.

Primary plan for Convex 1.45.0:

1. Build `withSearchIndex("buscar", ...)`, applying every supplied filter as a search-index equality filter.
2. Call native `.paginate({ numItems: pageSize, cursor })`.
3. Project the same summaries as list without loading values.
4. Wrap the native cursor using plan `resource-search-native-v1` and order token `convex-1.45.0-relevance-v1`.

A list cursor cannot be used for search; a search cursor cannot cross text, filters, lifecycle mode, plan, or order version because the completed envelope hashes all of those fields.

### 6.3 Native search verification gate

Before the search work can merge or become a dependency for later work, an integration test against installed Convex 1.45.0 must create more equal-relevance hits than one page and traverse the unchanged result set repeatedly with page sizes 1, 2, and a non-divisor. Each traversal must contain every expected ID once, contain no unknown ID, and terminate. The package manifest/lock used by the test must resolve Convex exactly to 1.45.0; a version change requires a new order token and rerunning this gate.

If native traversal fails this gate, the search work is blocked. It requires an explicit design/specification revision before implementation proceeds; no technical-identity/adminSortId fallback, collection, or silent in-memory sorting is permitted.

## 7. Bounded detail loading

Define `MAX_RESOURCE_VALUES = 200`, matching the completed aggregate row bound.

`loadResourceValuesBounded(ctx, recursoId)` performs exactly one query:

```text
valoresAtributoRecurso
  .withIndex("porRecurso", recursoId)
  .take(MAX_RESOURCE_VALUES + 1)
```

- 0–200 rows are returned in the detail.
- 201 rows cause `ADMIN_INVALID_STATE` with field `valores`, reason `RESOURCE_VALUE_LIMIT_EXCEEDED`, and safe limit context in the reason/violations.
- Values are never truncated.
- The loader is called once only by direct detail and by mutations that need the stored aggregate; list/search cannot import it.

Tests prove the no-value-load property in two ways: a dependency-boundary test rejects any `valoresAtributoRecurso` access from the summary executor, and executor tests use a DB proxy that throws/counts when that table is queried. Detail tests assert exactly one indexed value query and the 200/201 boundary.

## 8. Effective and inert diagnostics

The stored Resource is always the inspection root. Diagnostics use the completed resolvers:

1. Resolve stored Type → Family → Class documents.
2. Call `resolverJerarquiaEfectiva` for exact hierarchy reasons.
3. For detail and mutation validation, call `cargarAgregado` for current bounded aggregate status and coded violations.
4. For create, update, and activation, require effective hierarchy and a `VALID` aggregate before Resource-value validation.
5. Then run the existing pure Resource validator against a bounded snapshot to validate Unit, selected assignments, rules, definitions, options, and values.

The administrative snapshot loader replaces each potentially growing `.collect()` with the relevant index and `.take(MAX_AGGREGATE_ROWS + 1)`. It returns a tagged limit failure before calling the pure validator when any relation exceeds 200 rows; the admin mapper emits `ADMIN_INVALID_STATE` with a `CATALOG_LIMIT_EXCEEDED` violation. The existing public wrapper keeps its current behavior and messages; only the new admin seam opts into this bounded result contract.

Summary computes hierarchy status only, preventing aggregate fan-out per list row. Detail may compute full aggregate diagnostics because it addresses one Resource. An inactive or currently inert Resource remains readable. After revision and immutable-field checks, an update constructs and completely validates the proposed current effective aggregate; only a valid candidate may return `UNCHANGED`. An invalid or inert aggregate fails even when the input is semantically identical; every material update and every activation validates current effectiveness.

## 9. Structured validation mapping without legacy changes

Refactor `convex/catalogoRecursos/validacionRecurso.ts` to expose a non-throwing, bounded evaluation result used by admin code. Keep the existing `validarRecurso` wrapper and its `mensajes` table unchanged, so legacy functions continue throwing the same Spanish text.

The admin mapper uses this mapping:

| Existing domain failure | Administrative failure |
|---|---|
| `JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA` | `ADMIN_INVALID_REFERENCE` with the inspected missing/inactive classification or Unit field |
| `JERARQUIA_INVALIDA` | `ADMIN_INVALID_REFERENCE`, field `classification`, reason `RESOURCE_HIERARCHY_INVALID` |
| `UNIDAD_NO_PERMITIDA` | `ADMIN_INVALID_REFERENCE`, field `unidadId`, reason `RESOURCE_UNIT_NOT_ALLOWED` |
| `ATRIBUTO_NO_APLICABLE` | `ADMIN_INVALID_REFERENCE`, field `valores.atributoRecursoId`, reason `RESOURCE_ATTRIBUTE_NOT_APPLICABLE` |
| `DEFINICION_INEXISTENTE` | `ADMIN_INVALID_REFERENCE`, field `definicionAtributoId`, reason `RESOURCE_DEFINITION_MISSING` |
| `OPCION_INVALIDA` | `ADMIN_INVALID_REFERENCE`, field `opcionAtributoId`, reason `RESOURCE_OPTION_INVALID` |
| `ATRIBUTO_REPETIDO` | `ADMIN_INVALID_STATE` with violation `RESOURCE_ATTRIBUTE_DUPLICATE` |
| `ATRIBUTO_REQUERIDO_AUSENTE` | `ADMIN_INVALID_STATE` with violation `RESOURCE_REQUIRED_VALUE_MISSING` |
| `NUMERO_NO_FINITO` | `ADMIN_INVALID_STATE` with violation `RESOURCE_NON_FINITE_NUMBER` |
| `ATRIBUTO_PROHIBIDO` | `ADMIN_INVALID_STATE` with violation `RESOURCE_ATTRIBUTE_FORBIDDEN` |
| `TIPO_DE_VALOR_INVALIDO` | `ADMIN_INVALID_STATE` with violation `RESOURCE_VALUE_TYPE_INVALID` |

Add those Resource violation literals plus `RESOURCE_VALUE_LIMIT_EXCEEDED` and `RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED` to the shared violation validator. Existing error variants are not renamed or removed.

Other exact mappings are:

- missing commanded Resource → `ADMIN_NOT_FOUND`;
- stale revision → `ADMIN_STALE_REVISION`;
- duplicate derived identity → `ADMIN_DUPLICATE_KEY` with normalized identity and `global` or organization scope;
- alias collision → `ADMIN_CONFLICT` with `conflictKind: "resource-alias"`;
- classification, ownership, active-state echo, direct technical identity, or prohibited organization-owned identity drift → `ADMIN_IMMUTABLE_FIELD`;
- missing/inactive organization → `ADMIN_INVALID_REFERENCE`;
- invalid/inert aggregate → `ADMIN_INVALID_STATE` with existing aggregate violations;
- invalid cursor/page size/search text → `ADMIN_INVALID_ARGUMENT`.

Admin code never catches an arbitrary Spanish `Error` and parses its message.

## 10. Atomic write algorithms

Every command is one Convex mutation transaction. There are no actions, external I/O calls, or compensating writes.

### 10.1 Create

1. Normalize name/description and reject blank name.
2. Reject more than 200 proposed values before catalog fan-out.
3. Resolve and verify the supplied Class → Family → Type ownership.
4. For organization ownership, load the organization and require it to exist and be active.
5. Load the completed effective aggregate and run bounded Resource evaluation.
6. Derive `identificadorTecnico` using the existing identity domain function.
7. Query exactly one ownership-aware identity index with `.take(1)`; do not filter by active state, so inactive duplicates conflict.
8. Query the exact organization/version/identity alias key when applicable.
9. Insert `recursos` with `activo: true`, revision 1, identity version 1 for organization ownership, and both admin metadata fields.
10. Insert all validated value rows.
11. Insert the versioned alias for organization ownership.
12. Return `CREATED` with a summary projected from the committed candidate.

The duplicate and alias index reads are in the same transaction as writes. Convex optimistic concurrency retries a racing equivalent transaction; after retry, the losing transaction observes the conflict. Any thrown validation, insert, or alias error rolls back steps 9–11.

### 10.2 Update: revision-first order

1. Directly load the Resource; missing returns `ADMIN_NOT_FOUND`.
2. Validate positive `expectedRevision` and compare it immediately. A mismatch returns `ADMIN_STALE_REVISION` before no-op detection, immutable checks, catalog loading, duplicate checks, or business validation.
3. Resolve stored classification and compare every supplied immutable echo. Reject ownership/Type/Class/Family differences and any supplied `identificadorTecnico` or `activo`.
4. Load stored values once with the 201-row guard; merge optional mutable replacements into a complete candidate. Normalize values into assignment-ID order for semantic comparison.
5. Require at most 200 candidate values, validate the current effective aggregate, and run bounded complete Resource validation for the complete candidate.
6. Only after candidate validation succeeds, if normalized mutable fields and values equal stored state, return `UNCHANGED` at the existing revision.
7. Derive the candidate identity. If organization-owned and it differs from the stored identity, return `ADMIN_IMMUTABLE_FIELD` for `identificadorTecnico`.
8. Query the appropriate identity index with `.take(2)`, including inactive rows; ignore only the current Resource ID and reject any other match. Two rows are required because the current Resource may be the first indexed result. Global Resources may adopt a new non-conflicting derived identity.
9. Complete all checks before writing. Delete the bounded old value rows, insert all replacement rows, and patch the Resource once with mutable fields, derived identity, healed metadata, and `revision + 1`.
10. Do not create, delete, transfer, or reactivate alias rows during normal update.
11. Return `UPDATED` with the new summary.

Any error in step 9 aborts the Convex transaction and restores the old fields, revision, values, and aliases.

### 10.3 Lifecycle

Both commands load the Resource and compare revision before same-state handling.

- Same target state after a current revision returns `UNCHANGED` and does not increment revision.
- Deactivation patches only `activo: false` and `revision + 1`. Values, aliases, identity, ownership, classification, catalog rows, revisions, and snapshots are untouched.
- Activation loads the bounded stored values, validates current effective aggregate and complete Resource state, re-derives identity, checks organization identity immutability and ownership-aware duplicates, then patches `activo: true`, healed metadata, and `revision + 1`.
- Failed activation leaves the Resource inactive.
- No hard-delete function exists.

## 11. Validator and generated consumer organization

- Keep common lifecycle, page, result, entity, violation, and `AdminErrorData` validators in `convex/catalogoAdmin/validators.ts`.
- Put Resource-specific validators in `convex/catalogoAdmin/resourceValidators.ts` and derive TypeScript types with `Infer`; do not create hand-written duplicate DTOs.
- `convex/catalogoAdmin/recursos.ts` imports those validators for every registered args/returns declaration.
- Convex code generation exposes the new references in `convex/_generated/api.*` and Resource metadata in the generated data model.
- Add `contract-tests/resource-admin-consumer.ts` and include it in `contract-tests/tsconfig.json`. The fixture must use `api.catalogoAdmin.recursos`, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, page cursors, diagnostics, all seven functions, result disposition narrowing, and exported `AdminErrorData`.
- The fixture imports from package exports only. It must not import backend implementation modules or define parallel DTOs.

## 12. Strict test strategy

Every work unit follows RED → GREEN → TRIANGULATE → REFACTOR:

1. **RED:** add the smallest focused failing test and record the exact focused command/failure.
2. **GREEN:** implement only enough behavior to pass it.
3. **TRIANGULATE:** add at least one counterexample or boundary case that would pass a hard-coded implementation.
4. **REFACTOR:** extract the named boundary, rerun the focused test, then run the complete verification set.

A red commit is not merged; RED/GREEN evidence is recorded in the work-unit receipt. Tests remain in the same work unit as behavior.

Required coverage:

- pure projection and diagnostic tests for effective, inert, and broken references;
- all 16 list plans, page-size boundaries, cursor binding changes, and complete traversal of 1,000+ Resources;
- DB-proxy proof that list/search issue zero value-table queries;
- native Convex 1.45.0 repeated equal-relevance traversal and cursor-binding tests;
- detail value-load count and 200/201 behavior;
- each domain failure mapping to validated `ConvexError.data`;
- stale-before-no-op/immutable/validation behavior;
- global and organization duplicate checks against active and inactive rows;
- alias conflict and injected value-write failure rollback;
- update replacement rollback preserving old fields, revision, values, and aliases;
- immutable classification/ownership and organization identity drift;
- lifecycle idempotence, deactivation preservation, and current-catalog activation;
- unchanged generated legacy signatures/returns and exact protected Spanish messages;
- external consumer type narrowing for every new function.

Focused tests use `pnpm exec vitest run <test-file>`. Final verification is:

- `pnpm exec vitest run`
- `pnpm typecheck`
- `pnpm typecheck:consumer`
- `pnpm exec convex codegen --typecheck enable`
- `pnpm exec convex dev --once` when a deployment is available; otherwise record `N/A — no deployment available`.

## 13. Review-safe stacked work units

The canonical split is W0 plus WU1, WU2a, WU2b, and WU3–WU9. W0 records planning/runtime metadata evidence and is not a product PR; WU1, WU2a, WU2b, and WU3–WU9 are the behavior units below.

Delivery is a linear stacked-to-main chain. During review, each child targets its immediate predecessor; after the predecessor merges, it is retargeted/rebased so only its own work unit remains. Every PR body states start state, end state, dependency, follow-up, exclusions, focused test result, runtime result or N/A, authored line count, and rollback boundary. No `size:exception` is planned.

| # | Work unit and end state | Prior dependency | Forecast authored changes | Verification with unit | Independent rollback boundary |
|---:|---|---|---:|---|---|
| W0 | Planning/runtime metadata evidence; no product behavior | Approved design/specs | 12 | Repository capability and configuration evidence | Remove only planning evidence |
| 1 | Optional Resource metadata, explicit legacy projection, 16 list indexes, search filter fields, resumable backfill | Completed catalog admin stack | 190 | schema/backfill tests and all legacy Resource tests | Revert schema/backfill and legacy projection before any admin read ships; retain data if already backfilled |
| 2a | Resource validators, value-free summary, detail contracts/projections, and effective/inert/broken diagnostics | WU1 | 190 | validator/summary/detail projection and boundary tests | Remove only Resource contract/projection/diagnostic files and added violation literals; no data changes |
| 2b | Non-throwing Resource validation seam, complete domain-to-ADMIN mapping, bounded-context ConvexError coverage, and legacy wrapper preservation | WU2a | 190 | validation seam, eight ADMIN context/ConvexError, and legacy regression tests | Remove only validation seam/mapping files and narrow legacy seam; preserve the legacy wrapper/messages |
| 3 | Indexed summary list with every filter plan and bound cursors | WU2a and WU2b plus completed backfill | 175 | multi-page/plan/cursor/no-value-load tests | Remove list export and planner; metadata/indexes may remain inert |
| 4 | Convex 1.45.0 native search and traversal gate | WU3 | 190 | equal-relevance traversal, cursor binding, no-value-load tests | Remove search export and plan; ordinary list remains |
| 5 | Direct detail and 200/201 bounded value loader | WU2a | 145 | detail/null/inert/value-query-count tests | Remove detail export and detail loader only |
| 6 | Atomic create with organization, identity, alias, and rollback behavior | WU2b and WU5 helpers | 210 | create validation/duplicate/alias/value-failure tests | Remove admin create; no stored rows are deleted |
| 7 | Revision-first update and immutable classification/ownership | WU6 | 240 | stale/no-op/identity/replacement/rollback tests | Remove admin update; create/read data remains valid |
| 8 | Activation/deactivation and current effective-catalog integration | WU7 | 170 | lifecycle/idempotence/inert activation/no-cascade tests | Remove lifecycle exports; reads/create/update remain |
| 9 | Generated API fixture, full legacy regression, rollout documentation | WU1–WU8 | 130 authored, generated output excluded | codegen, complete tests, both typechecks, deployment smoke or N/A | Remove fixture/docs and generated additions only after reverting API exports |

Each unit starts from a compiling predecessor and ends with its own behavior and tests. The original combined WU2 product/tests correction was 415 authored lines. The user selected the WU2a/WU2b split; no size exception applies. Each slice forecasts below 400 authored lines and has its own rollback boundary. If any unit reaches 350 authored additions plus deletions, split it before review; no unit may exceed 400.

Chain diagram used in each PR, marking the current node with `📍`:

```text
main ← WU1 ← WU2a ← WU2b ← WU3 ← WU4 ← WU5 ← WU6 ← WU7 ← WU8 ← WU9
```

## 14. Rollback and compatibility

- Stop new administrative use by reverting the affected additive function work unit; never delete Resource data as rollback.
- Failed mutations require no repair because Convex commits the whole mutation or none of it.
- Successful administrative writes remain valid ordinary Resource rows if the admin API is reverted.
- Revert a shared validation extraction immediately if a protected public Resource test or Spanish error changes.
- Keep optional backfilled metadata when removing indexes would create deployment risk; it is inert and excluded from legacy projections.
- Do not change catalog publication revisions or snapshots during rollout or rollback.
- No consumer migration is required until a consumer explicitly adopts the generated `catalogoAdmin.recursos` references.

## 15. Explicit exclusions

This design creates no Bandeja or XML behavior, auth/role/permission check, seed capability, UI, hard delete, cascade, publication operation, classification migration, organization transfer, or replacement public Resource API. It does not rename, remove, or alter any existing public Resource function.