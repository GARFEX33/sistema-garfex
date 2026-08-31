# Resource master administration implementation tasks

## Native-first delivery rules

Implement only the additive `api.catalogoAdmin.recursos` surface. Resource list/search MUST use `paginationOptsValidator`, native `PaginationResult`, `.paginate()`, and direct React `usePaginatedQuery` compatibility. Do not add Resource `AdminPage`, custom cursor/hash/envelope, plan/order/version tokens, manual page accumulation, custom cache, Unit filtering, custom transaction coordination, compensating writes, locks, or retry protocols.

Existing custom catalog-admin pagination is outside this rescope and MUST NOT be rewritten here. Existing public Resource functions and Spanish error contracts remain unchanged.

Strict TDD remains RED → GREEN → TRIANGULATE → REFACTOR. Every pending authored work unit must remain below 400 additions plus deletions; split before review if it approaches 350. Generated declarations are CLI-owned and tracked separately.

## Historical evidence preservation

W0, WU1, WU2a, WU2b, WU2c, WU3a, and WU3b are completed units. Their checked rows below preserve what was implemented and verified, including WU1's now-superseded sixteen-index/Unit/sort design. Do not uncheck or reinterpret those rows. WU4 is next.

## Review Workload Forecast

| Field | Value |
|---|---|
| Pending authored estimate | Approximately 905 additions + deletions after completed WU3a/WU3b; generated declarations separate |
| 400-line budget risk | High across the stack; low per current unit; WU3a ~319 and WU3b ~152, no exception |
| Delivery | `auto-chain`, stacked-to-main |
| Sequence | W0 ✓ → WU1 ✓ → WU2a ✓ → WU2b ✓ → WU2c ✓ → WU3a ✓ → WU3b ✓ → WU4 → WU5 → WU6 → WU7 → WU8 → WU9 |
| Pending implementation rows | 24 |
| Completed implementation rows | 28 |
| Parent rows | 2 pending |

Decision needed before apply: No

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

- [ ] **RED** — Add failing tests for NFC/trim/collapsed-whitespace normalization, blank rejection, lifecycle/Type/scope search filters, no Unit argument, repeated equal-relevance native traversal, no values, and no collect/sort fallback; omit cursor binding and token/version tests; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register search with native pagination args/result validator, `withSearchIndex("buscar")`, supplied equality filters, and `.paginate(args.paginationOpts)`; return native relevance pages without cursor wrappers, runtime version/order tokens, fallback sorting, cache, or accumulator; estimate 70 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Repeat unchanged equal-relevance traversal with page sizes 1, 2, and a non-divisor, plus each essential filter combination and normalized-text counterexamples; verify no values/Unit/custom cursor layer; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize only search-text normalization and native page projection; document relevance order as native Convex behavior; rollback removes search export/tests only; estimate 15 lines. <!-- sdd-owner: implementation -->

### WU5 — Direct bounded Resource detail

**Dependency:** WU2a and WU2c. **End state:** direct detail returns stored/inert diagnostics and values through one bounded indexed load. **Allowed edit surfaces:** Resource admin query, completed detail helper/validators, focused tests, generated declarations.

- [ ] **RED** — Add failing cases for missing `null`, active/inactive/inert/broken detail, 0/1/200/201 values, exactly one `porRecurso` bounded load, no truncation, and centralized `MAX_RESOURCE_VALUES`; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register direct detail using the completed WU2a projector/loader and sole shared limit constant; preserve legacy detail; estimate 60 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify nullable references, exact load count, final error data at the limit, and no summary dependency on the loader; full verification and runtime-or-N/A; estimate 20 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep one named bounded loader and one authoritative limit definition; rollback removes detail export/integration only; estimate 15 lines. <!-- sdd-owner: implementation -->

### WU6 — Thin atomic administrative create

**Dependency:** WU2b and WU5. **End state:** one Convex mutation validates GARFEX rules and atomically creates Resource, values, and alias using native OCC. **Allowed edit surfaces:** Resource admin mutation, persistence/validation helpers, validators, focused tests, generated declarations.

- [ ] **RED** — Add create tests for effective catalog, organization, values/limit, scoped active/inactive duplicates, aliases, and final Resource/value/alias state after every failure and concurrent-equivalent outcome; do not test custom rollback/retry machinery; estimate 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement one thin mutation that validates, derives identity, performs bounded duplicate/alias reads, and writes Resource revision 1, values, scope key, and alias atomically; rely on Convex rollback/OCC; estimate 95 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Prove global/organization scope, inactive duplicate reservation, alias/value failure final state, at-most-one concurrent identity, no publication changes, and legacy create compatibility; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep persistence helpers bounded and business-focused; add no lock, coordinator, compensation, cache, or retry protocol; rollback removes admin create only; estimate 15 lines. <!-- sdd-owner: implementation -->

### WU7 — Thin revision-first administrative update

**Dependency:** WU6. **End state:** one Convex mutation checks revision first, validates a complete candidate, and atomically replaces mutable aggregate state. **Allowed edit surfaces:** Resource admin mutation, persistence/validation helpers, validators, focused tests, generated declarations.

- [ ] **RED** — Add tests for missing/stale-first behavior, valid no-op, mutable fields, immutable classification/ownership/identity/lifecycle, current ineffective catalog, inactive duplicates, alias preservation, and final aggregate state after each failure; estimate 45 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement revision-first candidate construction/validation, no-op after validation, bounded identity check, atomic value replacement and one revision patch; import the shared value limit and rely on Convex transaction rollback; estimate 115 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify stale beats no-op/business validation, invalid equal candidate is not unchanged, organization identity cannot drift, material revision increments once, and every failed final state equals the prior aggregate; full verification and runtime-or-N/A; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize candidate equality/immutable reporting without adding transaction choreography or retry coupling; rollback removes admin update only; estimate 15 lines. <!-- sdd-owner: implementation -->

### WU8 — Thin revision-guarded lifecycle mutations

**Dependency:** WU7. **End state:** activation/deactivation use one Convex mutation each, current-revision idempotence, and GARFEX effective-state rules. **Allowed edit surfaces:** Resource admin mutation/helpers/tests, catalog blocker regression tests only if needed, generated declarations.

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
- [ ] After verification, confirm all 52 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3a/WU3b, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->
