# Resource master administration implementation tasks

## Native-first delivery rules

Implement only the additive `api.catalogoAdmin.recursos` surface. Resource list/search MUST use `paginationOptsValidator`, native `PaginationResult`, `.paginate()`, and direct React `usePaginatedQuery` compatibility. Do not add Resource `AdminPage`, custom cursor/hash/envelope, plan/order/version tokens, manual page accumulation, custom cache, Unit filtering, custom transaction coordination, compensating writes, locks, or retry protocols.

Existing custom catalog-admin pagination is outside this rescope and MUST NOT be rewritten here. Existing public Resource functions and Spanish error contracts remain unchanged.

Strict TDD remains RED → GREEN → TRIANGULATE → REFACTOR. Every pending authored work unit must remain below 400 additions plus deletions; split before review if it approaches 350. Generated declarations are CLI-owned and tracked separately.

## Historical evidence preservation

W0, WU1, WU2a, WU2b, WU2c, WU3a, WU3b, WU4, WU5, WU6a, WU6b, WU7a, and WU7b are completed units. Their checked rows below preserve what was implemented and verified, including WU1's now-superseded sixteen-index/Unit/sort design. Do not uncheck or reinterpret those rows. WU8 is next and depends on both WU7 slices.

## Review Workload Forecast

| Field | Value |
|---|---|
| Pending authored estimate | Approximately 255 additions + deletions across pending WU8–WU9; generated declarations separate |
| 400-line budget risk | High across the completed stack; low per pending unit; WU8 ~145 and WU9 ~110, no exception |
| Delivery | `auto-chain`, stacked-to-main |
| Sequence | W0 ✓ → WU1 ✓ → WU2a ✓ → WU2b ✓ → WU2c ✓ → WU3a ✓ → WU3b ✓ → WU4 ✓ → WU5 ✓ → WU6a ✓ → WU6b ✓ → WU7a ✓ → WU7b ✓ → WU8 → WU9 |
| Implementation rows | 60 total: 52 checked, 8 unchecked |
| Parent rows | 2 total: 0 checked, 2 unchecked |
| Total rows | 62 |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Verifier-recommended review split: WU6a and WU6b remain historical slices. WU7a contains revision-first update/base replacement; WU7b contains immutable echoes, ordering, and final-state boundaries. Each intended slice stays below 400 lines, with no size exception.

## Completed historical work units

### W0 — Plan and prove strict-TDD runtime metadata

**Historical end state:** planning/runtime metadata was verified; no product behavior was added.

- [x] **RED** — Compare `openspec/config.yaml` with the installed `package.json`, `vitest.config.ts`, `tsconfig.json`, and existing test locations; record the strict-TDD requirement and any metadata mismatch as the focused evidence, using `pnpm exec vitest run convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback boundary is removal of the W0 evidence/config change only; authored estimate: 2 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — If metadata is stale, correct only `openspec/config.yaml` to use strict TDD, Vitest 4, `pnpm exec vitest run`, `convex-test via Vitest`, `pnpm typecheck`, and no configured E2E layer; if already correct, record a no-edit confirmation, using `pnpm exec vitest run src/catalogoRecursos/dominio/validarRecurso.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback `git restore -- openspec/config.yaml`; authored estimate: 6 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Confirm the metadata names only installed capabilities and records runtime as `pnpm exec convex dev --once` or `N/A — no deployment available`, using `pnpm exec vitest run convex/catalogoRecursos/catalogoPublicado.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback restores only `openspec/config.yaml`; authored estimate: 2 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Normalize the YAML context without adding unsupported runners or commands, using `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only the W0 metadata cleanup; authored estimate: 2 lines. <!-- sdd-owner: implementation -->

### WU1 — Original optional metadata, indexes, and resumable backfill

**Historical end state:** WU1 implemented `adminSortId`, `adminScopeKey`, sixteen Resource list indexes, Unit search filtering, Resource metadata writes/projection, and a Resource backfill branch. This evidence remains true. WU2c supersedes those Resource choices before WU3.

- [x] **RED** — Add failing schema/backfill/legacy-regression tests in `convex/catalogoAdmin/lib/backfillMetadatos.test.ts` and `convex/catalogoRecursos/recursos.test.ts` for optional populated-table fields, all 16 ordinary-list index plans, search filter fields, missing metadata, repeated bounded batches, duplicate reports, metadata writes, and byte-for-field legacy output; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU1 tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Add optional `adminSortId`/`adminScopeKey` and the exact design index families to `convex/schema.ts`; implement the bounded resumable plan in `convex/catalogoAdmin/lib/backfillMetadatos.ts`; write metadata in the legacy create path and define the shared derived-field contract that WU6 admin create must consume; replace legacy document spreading with an explicit projection that omits metadata; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check`; rollback disables/removes only WU1 backfill/index/projection changes and never deletes data; authored estimate: 95 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Exercise every index family, empty and populated tables, resumed and repeated backfill cursors, concurrent-create metadata, inactive duplicate reservation, preservation of `activo`, `revision`, business fields, aliases, catalog revisions, and snapshots; prove generated output is derived and legacy Resource APIs keep names/args/returns/messages; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, runtime command or exact N/A record, and `git diff --check`; rollback stops WU1 and retains only proven-safe optional metadata; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Make metadata derivation, duplicate reporting, and legacy projection deterministic and document optional rollout/backfill ordering beside `convex/schema.ts` or the approved change documentation; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback reverts only WU1 cleanup/docs; authored estimate: 20 lines. <!-- sdd-owner: implementation -->

### WU2a — Resource validators, value-free summaries, detail contracts, and diagnostics

**Historical end state:** completed inferred contracts, summary/detail projections, diagnostics, and centralized `MAX_RESOURCE_VALUES` definition.

- [x] **RED** — Add failing pure tests in `convex/catalogoAdmin/lib/recursoResumen.test.ts`, `convex/catalogoAdmin/lib/recursoDetalle.test.ts`, and `convex/catalogoAdmin/resourceValidators.test.ts` for inferred Resource validator shapes, value-free summaries, effective/inert/broken hierarchy status, nullable historical references, and the 200/201 detail value boundary; focused command `pnpm exec vitest run convex/catalogoAdmin/resourceValidators.test.ts convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU2a tests; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Implement the inferred Resource validators and summary/detail contracts and projections, including `MAX_RESOURCE_VALUES = 200`, coded limit violations, nullable historical references, and value-free list projections; focused command `pnpm exec vitest run convex/catalogoAdmin/resourceValidators.test.ts convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck && pnpm exec convex codegen --typecheck enable && git diff --check`; rollback removes only WU2a contract/projection/diagnostic files and violation additions; authored estimate: 95 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Exercise effective, inert, and broken branches, missing Type/Family/Class/Unit/organization references, 0/200/201 value boundaries, safe limit context, and the no-value-load projection boundary; focused command `pnpm exec vitest run convex/catalogoAdmin/resourceValidators.test.ts convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck && pnpm exec convex codegen --typecheck enable && git diff --check`; rollback removes only WU2a integration/tests while preserving stored data; authored estimate: 45 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Keep summary projection unable to import/query the value loader, keep detail dependent on summary rather than vice versa, and centralize domain-to-admin error mapping; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/resourceValidators.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck && git diff --check`; rollback reverts only WU2a refactoring; authored estimate: 25 lines. <!-- sdd-owner: implementation -->

### WU2b — Non-throwing validation seam, complete ADMIN mapping, and legacy preservation

**Historical end state:** completed bounded Resource evaluation, structured mapping, and unchanged legacy wrapper/messages.

- [x] **RED** — Add failing validation tests for bounded evaluation, every listed domain failure, all eight bounded contexts (`ADMIN_NOT_FOUND`, `ADMIN_INVALID_REFERENCE`, `ADMIN_INVALID_STATE`, `ADMIN_AGGREGATE_INCOMPLETE`, `ADMIN_DUPLICATE_KEY`, `ADMIN_CONFLICT`, `ADMIN_IMMUTABLE_FIELD`, `ADMIN_INVALID_ARGUMENT`) through `ConvexError.data`, and unchanged legacy wrapper behavior; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoRecursos/validacionRecurso.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck && git diff --check`; rollback removes only WU2b tests; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Implement the non-throwing bounded Resource seam, map every domain failure to validated `ADMIN_*` data and shared violation literals, and preserve the throwing `validarRecurso` wrapper and Spanish messages; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoRecursos/validacionRecurso.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck && pnpm exec convex codegen --typecheck enable && git diff --check`; rollback removes only WU2b validation/mapping files and reverts the narrow seam if compatibility changes; authored estimate: 105 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Prove all eight context/`ConvexError.data` cases, duplicate/required/forbidden/non-finite/invalid-type failures, excessive aggregate fan-out, safe limits, and legacy names, arguments, returns, and Spanish errors; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoRecursos/validacionRecurso.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck && pnpm exec convex codegen --typecheck enable && git diff --check`; rollback removes only WU2b integration/tests while preserving stored data and legacy behavior; authored estimate: 45 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Centralize domain-to-admin mapping behind the validation seam without parsing Spanish messages, and keep the legacy wrapper as the compatibility boundary; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoRecursos/validacionRecurso.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck && git diff --check`; rollback reverts only WU2b refactoring; authored estimate: 25 lines. <!-- sdd-owner: implementation -->

## Implementation work units

### WU2c — Correct WU1 to native-first Resource indexes and metadata

**Dependency:** completed WU1/WU2a/WU2b. **End state:** Resource pagination has no Unit/sort dependency; only `adminScopeKey` and equality-prefix-minimal scope indexes remain; the Resource backfill branch repairs scope only; the sole existing `MAX_RESOURCE_VALUES` definition remains authoritative. **Allowed edit surfaces:** `convex/schema.ts`, Resource-specific branches in `convex/catalogoAdmin/lib/backfillMetadatos.ts`, narrowly `convex/catalogoRecursos/recursos.ts`, narrowly `convex/catalogoRecursos/validacionRecurso.ts` for the centralized constant import, WU2c focused tests, `openspec/changes/resource-master-administration/design.md` for rollout evidence, `openspec/changes/resource-master-administration/tasks.md` for WU2c metadata, `openspec/changes/resource-master-administration/apply-progress.md` for apply evidence, and CLI-generated declarations. Preserve non-Resource catalog-admin backfill behavior.

- [x] **RED** — Add failing schema/backfill/legacy tests proving Unit is absent from Resource search filters, sixteen Resource `adminPor*` sort indexes are rejected, equality-prefix coverage requires only `[adminScopeKey,tipoRecursoId,activo]` and `[adminScopeKey,activo]`, Resource backfill patches only scope, Resource writes do not require `adminSortId`, and one production `MAX_RESOURCE_VALUES` definition is imported; focused `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; rollback removes only WU2c tests; estimate 35 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Remove Resource Unit search filtering, sort-index/write/backfill dependencies, and obsolete `adminSortId` schema state using the safe populated-data sequence in `design.md`; retain `adminScopeKey`, preserve all prior catalog plans, and add exactly the two equality-prefix scope index shapes; run focused tests, codegen, and typecheck; rollback restores only the correction while never deleting business data; estimate 85 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Exercise all eight supported lifecycle/Type/scope combinations against schema prefix coverage, empty/populated scope repair, global/organization rows, legacy output, and optional bounded obsolete-field cleanup if deployment audit requires it; prove no Unit/sort dependency and no catalog-admin pagination change; full Vitest/typecheck/codegen/runtime-or-N/A; estimate 40 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Keep Resource scope derivation small, Resource backfill responsibility limited to `adminScopeKey`, and the centralized value limit imported by future units; remove temporary cleanup code only after rollout evidence permits; rollback reverts WU2c cleanup only; estimate 20 lines. <!-- sdd-owner: implementation -->

### WU3a — Native paginated Resource summary query and tests

**Dependency:** WU2c complete and corrected indexes ready. **End state:** `listarRecursosResumen` returns native `PaginationResult<ResourceSummary>` with native pagination behavior proven by focused tests. **Allowed edit surfaces:** `convex/catalogoAdmin/recursos.ts`, Resource validators/summary helper, focused Resource admin tests, and generated declarations. Historical WU3 query/test accounting: approximately 319 authored changed lines, below the 400-line budget; generated declarations are separate.

- [x] **RED** — Add failing tests for `paginationOptsValidator`, native result shape, all eight lifecycle/Type/scope combinations, native multi-page traversal, no Unit argument, no values, and no `.collect()`/query `.filter()`; do not add custom cursor mismatch tests; estimate 55 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Register the list query, select the equality-prefix-valid index branch, call `.paginate(args.paginationOpts)` once, project only the native page, and return native pagination metadata unchanged; no `AdminPage`, cursor codec, plan/order token, cache, or accumulator; estimate 90 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Traverse 1,000+ unchanged Resources with several native page sizes and every filter combination, proving exact coverage, termination, zero value loads, and native result compatibility; full verification and runtime-or-N/A; estimate 130 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Keep index-branch selection and page projection small and statically separated from detail/value loading; rollback removes only list export/helper/tests; estimate 44 lines. <!-- sdd-owner: implementation -->

### WU3b — Real native React hook and generated consumer contract

**Dependency:** WU3a complete. **End state:** the consumer compiles the installed `convex/react` `usePaginatedQuery` directly against the generated list reference, essential filters, native status/load-more result, and every Resource summary field; no local hook imitation or parallel DTO exists. **Allowed edit surfaces:** `contract-tests/resource-admin-consumer.ts`, `contract-tests/tsconfig.json`, generated declarations through the Convex CLI, and change evidence. Historical WU3b consumer/generated/task/evidence accounting: approximately 152 authored changed lines, below the 400-line budget; generated declarations remain source-derived and separate.

- [x] **RED** — Replace the local hook declaration with the installed `convex/react` import and retain a compile-time failure while the Resource summary field assertion is intentionally incompatible; focused command `pnpm typecheck:consumer`; estimate 30 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Use the real `usePaginatedQuery` with generated `listarRecursosResumen`, lifecycle/Type/scope filters, `initialNumItems`, native `results`/`status`/`loadMore`, and generated Resource summary fields; estimate 40 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Run consumer typecheck, focused WU3 tests, full tests/typecheck, source-derived codegen with hash stability, and diff checks without changing the Resource query/test or generated declaration content; estimate 52 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Keep the fixture limited to direct generated references and installed hook types, with no adapter, DTO, cache, accumulator, Unit filter, or backend implementation import; rollback removes only the consumer correction and evidence metadata; estimate 30 lines. <!-- sdd-owner: implementation -->

### WU4 — Native paginated full-text Resource search

**Dependency:** WU3a and WU3b, plus corrected search index readiness. **End state:** `buscarRecursosResumen` uses native search `.paginate()` with essential equality filters and relevance-order regression coverage. **Allowed edit surfaces:** Resource admin query/summary helper/tests and generated declarations.

- [x] **RED** — Add failing tests for NFC/trim/collapsed-whitespace normalization, blank rejection, lifecycle/Type/scope search filters, no Unit argument, repeated equal-relevance native traversal, no values, and no collect/sort fallback; omit cursor binding and token/version tests; estimate 35 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Register search with native pagination args/result validator, `withSearchIndex("buscar")`, supplied equality filters, and `.paginate(args.paginationOpts)`; return native relevance pages without cursor wrappers, runtime version/order tokens, fallback sorting, cache, or accumulator; estimate 70 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Repeat unchanged equal-relevance traversal with page sizes 1, 2, and a non-divisor, plus each essential filter combination and normalized-text counterexamples; verify no values/Unit/custom cursor layer; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Centralize only search-text normalization and native page projection; document relevance order as native Convex behavior; rollback removes search export/tests only; estimate 15 lines. <!-- sdd-owner: implementation -->

### WU5 — Direct bounded Resource detail

**Dependency:** WU2a and WU2c. **End state:** direct detail returns stored/inert diagnostics and values through one bounded indexed load. **Allowed edit surfaces:** Resource admin query, completed detail helper/validators, focused tests, generated declarations.

- [x] **RED** — Add failing cases for missing `null`, active/inactive/inert/broken detail, 0/1/200/201 values, exactly one `porRecurso` bounded load, no truncation, and centralized `MAX_RESOURCE_VALUES`; estimate 25 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Register direct detail using the completed WU2a projector/loader and sole shared limit constant; preserve legacy detail; estimate 60 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Verify nullable references, exact load count, final error data at the limit, and no summary dependency on the loader; full verification and runtime-or-N/A; estimate 20 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Keep one named bounded loader and one authoritative limit definition; rollback removes detail export/integration only; estimate 15 lines. <!-- sdd-owner: implementation -->

### WU6a — Thin atomic administrative create and base validation

**Dependency:** WU2b and WU5. **Historical end state:** one thin Convex mutation validates the complete base candidate, derives identity, and atomically writes an inactive revision-one Resource, values, scope metadata, and organization alias using native OCC. **Allowed edit surfaces:** Resource admin mutation, persistence/validation helpers, validators, focused tests, generated declarations.

- [x] **RED** — Add the base create tests and dedicated persistence-test harness for effective Class→Family→Type, active Unit, successful non-empty values, 0/200 accepted and 201 rejected values, derived identity, revision-one inactive output, and organization aliases; do not test custom rollback/retry machinery; estimate 120 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Implement one thin mutation plus bounded validation/identity/persistence seams; callers cannot supply technical identity or active state, and Convex owns atomic Resource/value/alias writes and OCC; estimate 190 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Verify effective aggregate/resource validation, value persistence, structured failures, and legacy compatibility without publication mutation or custom transaction machinery; estimate 70 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Keep persistence business-focused and below the 400-line boundary; rollback removes only the WU6a create/base-validation slice; estimate 35 lines. <!-- sdd-owner: implementation -->

### WU6b — Scope correction and atomic failure boundaries

**Dependency:** WU6a. **Historical end state:** global identity lookup considers only Resources with `organizacionId === undefined`; organization lookup is exact organization plus identity; inactive rows remain reserved in both scopes, and all alias/value failures leave the final aggregate unchanged. **Dedicated surface:** `convex/catalogoAdmin/lib/recursoPersistencia.test.ts`.

- [x] **RED** — Add focused scope and boundary cases for global/organization and cross-scope duplicates, active/inactive organizations, alias collisions, injected alias/value-write failures, equivalent concurrency, publication non-mutation, and final Resource/value/alias state; estimate 180 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Correct the global indexed lookup to equality-match the missing optional organization field while retaining exact organization lookup; keep one mutation and native rollback/OCC with no lock, retry, coordinator, compensation, or cache; estimate 35 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Run the dedicated and integration focused suites and confirm global organization-owned rows do not block global creation, while inactive duplicates do block their own scope; estimate 55 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Record the split, honest evidence, generated separation, and below-400 intended review boundary; rollback reverts only the WU6b scope correction/tests/evidence; estimate 30 lines. <!-- sdd-owner: implementation -->

### WU7a — Revision-first update and base replacement

**Dependency:** WU6a and WU6b. **End state:** one Convex mutation checks revision first, validates a complete candidate, and atomically replaces the mutable Resource/value set. **Allowed edit surfaces:** Resource admin mutation, persistence/validation helpers, focused update tests, and generated declarations. **Actual authored split count:** 348 changed lines (337 additions + 11 deletions); generated declarations are separate.

- [x] **RED** — Add failing tests for missing/stale-first behavior, valid normalized no-op, mutable fields, exact 0/200/201 value replacement sets, invalid values, and persisted candidate equality; estimate 45 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Implement revision-first candidate construction/validation, no-op only after validation, bounded identity check, atomic value replacement, and one revision patch; import the shared value limit and rely on Convex transaction rollback; estimate 115 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Verify stale beats no-op and invalid candidates, invalid semantically equal candidates fail, material success increments exactly once, and persisted Resource/value state is exact; full verification and runtime-or-N/A; estimate 35 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Keep candidate equality and replacement as thin business seams without transaction choreography or retry coupling; rollback removes only the update/base-replacement slice; estimate 15 lines. <!-- sdd-owner: implementation -->

### WU7b — Immutable echoes, ordering, and final-state boundaries

**Dependency:** WU7a. **End state:** update accepts only matching optional immutable echoes for Type, resolved Class/Family, organization scope, active lifecycle, and derived technical identity; changed echoes fail before mutation, and every failure preserves the complete aggregate. **Allowed edit surfaces:** Resource admin mutation, focused update/persistence tests, validators only when required for the argument contract, generated declarations, and change evidence. **Actual authored split count:** 330 changed lines (292 additions + 38 deletions); generated declarations are separate.

- [x] **RED** — Add failing tests for matching/changed immutable echoes, stale-first precedence over immutable/catalog/invalid work, ineffective catalog/aggregate, inactive/global duplicate collisions, organization identity drift, alias preservation, and publication/catalog snapshot non-mutation; estimate 45 lines. <!-- sdd-owner: implementation -->
- [x] **GREEN** — Add only the necessary active-lifecycle and derived-identity echo arguments, enforce all immutable boundaries while keeping matching echoes valid, preserve aliases, and retain one thin native Convex mutation; estimate 35 lines. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE** — Assert Resource/value/alias final state after every failure, global identity collision behavior, organization scope preservation, no catalog revision/snapshot/publication mutation, and the no-lock/no-retry/no-compensation source boundary; full verification and runtime-or-N/A; estimate 50 lines. <!-- sdd-owner: implementation -->
- [x] **REFACTOR** — Record the corrected split, truthful generated separation, and actionable rollback boundary while keeping WU8 dependent on both WU7 slices; estimate 20 lines. <!-- sdd-owner: implementation -->

### WU8 — Thin revision-guarded lifecycle mutations

**Dependency:** WU7a and WU7b. **End state:** activation/deactivation use one Convex mutation each, current-revision idempotence, and GARFEX effective-state rules. **Allowed edit surfaces:** Resource admin mutation/helpers/tests, catalog blocker regression tests only if needed, generated declarations.

- [ ] **RED** — Add lifecycle tests for missing/stale/current same-state, exactly-one revision increment, activation against effective/inert/invalid state, deactivation preservation, blocker visibility, and final state after failures; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement thin activate/deactivate mutations with revision-first handling; activation validates bounded current aggregate and identity, deactivation patches only state/revision; rely on native atomicity/OCC; estimate 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify current versus stale same-state, failed activation remains unchanged, values/aliases/catalog/publication remain preserved, and blockers observe active state; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse revision/effective-validation seams and remove any transaction/cache/retry abstraction; rollback removes lifecycle exports only; estimate 10 lines. <!-- sdd-owner: implementation -->

### WU9 — Generated native React contract and regressions

**Dependency:** WU3a, WU3b, and WU4–WU8. **End state:** package/generated exposure and a consumer fixture use native paginated query references directly; legacy contracts remain protected. **Allowed edit surfaces:** package/static export config only as required, `contract-tests/resource-admin-consumer.ts`, consumer config/docs, focused regressions, CLI-generated declarations, change evidence.

- [ ] **RED** — Add a consumer fixture using generated references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, direct `usePaginatedQuery` list/search calls, native results/status/load-more, detail, seven functions, dispositions, and `AdminErrorData`; assert no Unit/token/DTO/adapter/cache; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required package exposure and regenerate through Convex codegen; make the fixture compile without backend imports, manual DTOs, page adapters, or duplicated validation; estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck every native query/mutation shape, run full legacy Resource regressions, verify generated declarations match source, and confirm existing catalog-admin pagination was not changed; full verification and runtime-or-N/A; estimate 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep exports limited to generated Convex/API/data-model/error contracts and concise consumer documentation; rollback removes fixture/export/docs after API exports; estimate 15 authored lines. <!-- sdd-owner: implementation -->

## Parent-owned post-apply gates

- [ ] After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in `apply-progress.md`; rollback is evidence-only. <!-- sdd-owner: parent -->
- [ ] After verification, confirm all 60 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3a/WU3b, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->
