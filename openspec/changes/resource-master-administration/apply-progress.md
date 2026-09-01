# Apply progress — resource-master-administration

## Status

| Field | Value |
|---|---|
| Change | `resource-master-administration` |
| Artifact store | `openspec` |
| Apply state | `WU8 complete; WU9 next` |
| Historical completion | `W0, WU1, WU2a, WU2b, WU2c, WU3a, WU3b, WU4, WU5, WU6a, WU6b, WU7a, WU7b, WU8` |
| Current work unit | `WU8 — lifecycle gate corrections complete` |
| Delivery | `stacked-to-main` |
| Active branch/PR | `<record by parent>` |
| Parent decision gate | `Pending parent lifecycle after WU8` |

WU3a native query/tests, WU3b's real installed React-hook correction, WU4 native search, WU5 direct bounded detail, the corrected WU6a/WU6b slices, WU7a/WU7b, and WU8 are complete. Existing historical receipts remain preserved. WU9 is next; the current task sequence in `tasks.md` supersedes old cumulative “exact unchecked task lines” snapshots embedded in earlier receipts.

OpenSpec CLI remains absent in this environment; it was not installed or used.

## Work-unit receipt

| Field | Evidence |
|---|---|
| Work unit | `<W0/WU1/...>` |
| Allowed edit surfaces | `<exact paths>` |
| RED focused command/result | `<command and expected or actual result>` |
| GREEN focused command/result | `<command and actual result>` |
| TRIANGULATE focused/full result | `<commands and actual results>` |
| REFACTOR focused/full result | `<commands and actual results>` |
| Runtime boundary | `pnpm exec convex dev --once` or `N/A — no deployment available` |
| Authored changed lines | `<additions + deletions>` |
| Generated declaration lines | `<separate count; never included in authored count>` |
| Rollback boundary | `<exact files/behavior removable>` |
| Remaining work | `<next work unit>` |

## Final parent gates

- After parent validation and apply/runtime start, record `sdd-verify`, full Vitest, typecheck, consumer typecheck, codegen, `git diff --check`, and `git status --short` results.
- Confirm WU2c completed before WU3, including deployment audit/cleanup evidence, equality-prefix index coverage, scope-only Resource backfill behavior, and unchanged non-Resource catalog-admin behavior.
- Record native list/search traversal and direct `usePaginatedQuery` consumer typing; confirm no Resource `AdminPage`, custom cursor/token/cache, Unit filter, collect/sort fallback, or manual accumulation exists.
- Record final-state mutation failure/OCC evidence and confirm GARFEX revision/domain rules and every legacy Resource contract remain protected.
- Confirm every task checkbox and parent lifecycle gate in `tasks.md` has its required owner and evidence.

## W0 Apply Evidence — `W0-resource-admin-tdd-metadata`

- Scope was limited to W0. No product code, generated declarations, package files, or other change artifacts were edited; WU1 was not started.
- Consumed native status was authoritative OpenSpec status: `applyState: ready`, `nextRecommended: apply`, all proposal/spec/design/tasks artifacts present, `verifyReport` missing, and no blocked reasons. Action context was repo-local at `/home/garfex/PROGRAMACION/sistema-garfex`; delegated edit surfaces were limited to `openspec/config.yaml`, this `tasks.md`, and this `apply-progress.md`.
- Ownership validation found 42 valid terminal markers and 0 malformed markers. Four implementation-owned W0 rows were completed; parent-owned lifecycle rows remain deferred.
- Installed capability evidence: `convex@1.45.0`, `vitest@4.1.11`, `convex-test@0.0.56`, `typescript@7.0.2`; Vitest uses `vitest.config.ts` with `edge-runtime` and inlined `convex-test`; `tsconfig.json` covers `convex/**/*.ts` and `src/**/*.ts`; no E2E layer is configured.
- `openspec/config.yaml` was already truthful for strict TDD, Vitest 4, `pnpm exec vitest run`, `convex-test via Vitest`, `pnpm typecheck`, and no E2E layer. No config edit was made.

### W0 focused and full evidence

| Row | Focused command/result | Full boundary/result |
|---|---|---|
| RED | `pnpm exec vitest run convex/catalogoRecursos/recursos.test.ts` — 1 file, 37 tests passed | `pnpm exec vitest run && pnpm typecheck && git diff --check` — 29 files, 205 tests passed; `tsc --noEmit` passed; diff check passed |
| GREEN | `pnpm exec vitest run src/catalogoRecursos/dominio/validarRecurso.test.ts` — 1 file, 3 tests passed | `pnpm exec vitest run && pnpm typecheck && git diff --check` — 29 files, 205 tests passed; `tsc --noEmit` passed; diff check passed |
| TRIANGULATE | `pnpm exec vitest run convex/catalogoRecursos/catalogoPublicado.test.ts` — 1 file, 12 tests passed | `pnpm exec vitest run && pnpm typecheck && git diff --check` — 29 files, 205 tests passed; `tsc --noEmit` passed; diff check passed |
| REFACTOR | `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts` — 1 file, 5 tests passed | `pnpm exec vitest run && pnpm typecheck && git diff --check` — 29 files, 205 tests passed; `tsc --noEmit` passed; diff check passed |

Runtime boundary: no runtime command was run; runtime start/lifecycle management was explicitly outside this delegated W0 scope. No runtime evidence is claimed.

Files changed: `openspec/changes/resource-master-administration/tasks.md` (four W0 implementation checkboxes) and `openspec/changes/resource-master-administration/apply-progress.md` (this evidence). `openspec/config.yaml` had no edit. Product authored changes: 0; generated declaration changes: 0. Rollback boundary: revert only the W0 checkbox/evidence metadata; no product behavior or data is involved.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| W0 RED | `convex/catalogoRecursos/recursos.test.ts` | Integration-style via Vitest/convex-test | N/A — metadata evidence only | ✅ Planning/config comparison recorded | ✅ 37/37 focused; 205/205 full | ✅ Existing Resource behavior exercised | ✅ Full boundary passed |
| W0 GREEN | `src/catalogoRecursos/dominio/validarRecurso.test.ts` | Unit | N/A — no product edit | ✅ No config mutation required | ✅ 3/3 focused; 205/205 full | ✅ Existing validator paths exercised | ✅ Full boundary passed |
| W0 TRIANGULATE | `convex/catalogoRecursos/catalogoPublicado.test.ts` | Integration-style via Vitest/convex-test | N/A — no product edit | ✅ Capability/runtime metadata cross-check | ✅ 12/12 focused; 205/205 full | ✅ Publication scenarios exercised | ✅ Full boundary passed |
| W0 REFACTOR | `src/catalogoRecursos/dominio/catalogoPublicado.test.ts` | Unit | N/A — no product edit | ✅ YAML normalization review | ✅ 5/5 focused; 205/205 full | ➖ Structural metadata only; no alternate implementation path | ✅ Full boundary passed |

### Remaining work

W0 is complete. WU1–WU9 implementation rows and both parent-owned lifecycle rows remain unchecked and deferred; no WU1 work was started. Exact unchecked task lines are retained in `tasks.md` and will be reported in the final phase envelope.


### Exact unchecked task lines

- [ ] **RED** — Add failing schema/backfill/legacy-regression tests in `convex/catalogoAdmin/lib/backfillMetadatos.test.ts` and `convex/catalogoRecursos/recursos.test.ts` for optional populated-table fields, all 16 ordinary-list index plans, search filter fields, missing metadata, repeated bounded batches, duplicate reports, metadata writes, and byte-for-field legacy output; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU1 tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add optional `adminSortId`/`adminScopeKey` and the exact design index families to `convex/schema.ts`; implement the bounded resumable plan in `convex/catalogoAdmin/lib/backfillMetadatos.ts`; write metadata in the legacy create path and define the shared derived-field contract that WU6 admin create must consume; replace legacy document spreading with an explicit projection that omits metadata; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check`; rollback disables/removes only WU1 backfill/index/projection changes and never deletes data; authored estimate: 95 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise every index family, empty and populated tables, resumed and repeated backfill cursors, concurrent-create metadata, inactive duplicate reservation, preservation of `activo`, `revision`, business fields, aliases, catalog revisions, and snapshots; prove generated output is derived and legacy Resource APIs keep names/args/returns/messages; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, runtime command or exact N/A record, and `git diff --check`; rollback stops WU1 and retains only proven-safe optional metadata; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make metadata derivation, duplicate reporting, and legacy projection deterministic and document optional rollout/backfill ordering beside `convex/schema.ts` or the approved change documentation; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback reverts only WU1 cleanup/docs; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing pure tests in `convex/catalogoAdmin/lib/recursoResumen.test.ts`, `convex/catalogoAdmin/lib/recursoDetalle.test.ts`, `convex/catalogoAdmin/lib/recursoValidacion.test.ts`, and `convex/catalogoAdmin/resourceValidators.test.ts` for summary shape without values, effective/inert/broken hierarchy status, nullable historical references, value-limit boundary, every listed domain-failure mapping, and `ConvexError.data` safety; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/resourceValidators.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU2 tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement inferred validators and the three Resource helper seams, including `MAX_RESOURCE_VALUES = 200`, coded violations, non-throwing bounded validation, and explicit mapping to `ADMIN_NOT_FOUND`, `ADMIN_INVALID_REFERENCE`, `ADMIN_INVALID_STATE`, `ADMIN_AGGREGATE_INCOMPLETE`, `ADMIN_DUPLICATE_KEY`, `ADMIN_CONFLICT`, `ADMIN_IMMUTABLE_FIELD`, and `ADMIN_INVALID_ARGUMENT`; preserve the existing Spanish `validarRecurso` wrapper and messages; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/resourceValidators.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU2 helpers/violation additions and reverts the narrow legacy seam if compatibility changes; authored estimate: 85 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Add counterexamples for inactive catalog branches, missing Type/Family/Class/Unit/organization references, duplicate/required/forbidden/non-finite/invalid-type values, excessive aggregate fan-out, safe context limits, and message changes; run protected legacy Resource scenarios and assert names, arguments, returns, and Spanish errors remain unchanged; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes WU2 integration/tests while preserving stored data and legacy behavior; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep summary projection unable to import/query the value loader, keep detail dependent on summary rather than vice versa, and centralize domain-to-admin error mapping; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU2 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` scenarios in `convex/catalogoAdmin/recursos.test.ts` for page-size bounds, default `ALL`, all lifecycle modes, all 16 filter plans, ANDed filters, multi-page 1,000+ traversal without duplicates/omissions, cursor mismatch, sparse pages, and a DB proxy/dependency proof that summary execution performs zero `valoresAtributoRecurso` queries; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU3 tests; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register `listarRecursosResumen` in `convex/catalogoAdmin/recursos.ts`; normalize filters and lifecycle, select the exact design index plan, consume/emit the opaque cursor binding `plan`, filters, mode, and `resource-identity-id-v1`, call indexed `.order("asc").paginate`, resolve only classification references, and return the shared `AdminPage<ResourceSummary>`; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes the list export/planner while retaining WU1 metadata/indexes and WU2 helpers; authored estimate: 90 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Traverse every filter/lifecycle plan with page sizes 1, 2, 25, 100 and sparse matches; reuse cursors across changed filter, lifecycle, plan, and ordering bindings; assert page envelopes, exhaustion, no `.collect()`/post-index `.filter()`, and zero value loads; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/pagination.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU3 list behavior/tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep plan selection and canonical cursor binding reusable for search and keep `recursoResumen.ts` statically unable to depend on detail/persistence/value loading; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/pagination.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU3 refactor; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add the installed-version traversal gate before implementing the endpoint: assert the manifest/lock resolves Convex exactly to `1.45.0`, create more equal-relevance hits than one page, and traverse the unchanged result repeatedly with page sizes 1, 2, and a non-divisor, requiring every expected ID exactly once, no unknown IDs, and termination; also add cursor-binding failure tests for text, filters, lifecycle, plan, and order; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU4 tests; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Only if the RED traversal gate passes, implement native `withSearchIndex("buscar", ...)` plus native `.paginate`, normalized NFC/trimmed search text, all indexed filters, `resource-search-native-v1`, and `convex-1.45.0-relevance-v1`; if the gate fails, stop and record the required explicit design/specification revision instead of implementing search. Focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes the native search endpoint/plan only; authored estimate: 85 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Repeat native equal-relevance traversal with changed page sizes, cursor-binding failures, and no-value-load/without-collect proofs; document the installed Convex relevance order rather than lexical order; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU4 native search tests/behavior; authored estimate: 45 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep native search normalization, cursor binding, version/order tokens, and the proof gate explicit; pin a new order token if the installed Convex version changes and remove any unbounded collection or in-memory sort; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/pagination.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback reverts only WU4 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` cases for missing ID → `null`, stored active/inactive detail, missing/inactive catalog references, all values at 200, 201 rows rejected without truncation, exactly one indexed value query, and list/search DB-proxy rejection if a value table is accessed; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU5 tests; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement direct ID lookup and `loadResourceValuesBounded` with `MAX_RESOURCE_VALUES + 1` through `valoresAtributoRecurso.porRecurso`, nullable resolved references, aggregate diagnostics, and `ADMIN_INVALID_STATE` limit context; register only the new admin detail name and keep legacy detail untouched; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes the admin detail export/loader only; authored estimate: 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify 0/1/200/201 value boundaries, inactive and broken historical references, exact query count, no truncation, no direct collection scan, no summary value access, and preservation of all existing public detail outputs; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU5 integration/tests; authored estimate: 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep the detail loader behind one named bounded seam and prevent `recursoResumen.ts` from importing it; keep stored history visible even when current catalog state is inert; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU5 cleanup; authored estimate: 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` create cases for effective Class→Family→Type, active Unit, assignments/rules/definitions/options/values, blank/over-limit values, missing/inactive organization, derived identity, global and organization duplicate identities including inactive rows, alias collision, and injected alias/value-write failure with no partial rows; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU6 tests; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement one Convex mutation transaction that normalizes inputs, validates bounded effective aggregate/resource state, derives `identificadorTecnico`, performs one ownership-aware indexed duplicate check and exact alias check, then inserts Resource revision 1, values, and organization/version alias with `CREATED` summary; map every failure to validated `ADMIN_*` data and never accept caller technical identity or active state; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes admin create/persistence code and leaves all stored rows untouched; authored estimate: 110 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Prove global versus organization scope, inactive duplicate reservation, alias atomicity, concurrent-equivalent duplicate behavior, validation-before-write, injected value-write rollback, no publication/catalog-revision/snapshot mutation, structured contexts, and legacy `crearRecurso` signatures/returns/messages; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/identidadesRecurso.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU6 create behavior/tests; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep persistence orchestration thin, identity/alias checks bounded and ownership-aware, and all atomic writes in one transaction without adding authorization or migration semantics; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU6 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` cases for missing Resource, invalid expected revision, stale-before-no-op and stale-before-validation, normalized no-op, material update revision increment, mutable name/description/Unit/values, immutable Type/Class/Family/ownership/active/technical identity echoes, organization identity drift, inactive duplicate collision, invalid current effective catalog, alias preservation, and injected replacement value-write rollback; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU7 tests; authored estimate: 45 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement revision-first update: load Resource, compare positive `expectedRevision`, check immutable echoes, bounded-load old values, construct the complete candidate, validate its current effective aggregate and Resource state, return `UNCHANGED` only after that validation when semantically equal, then derive identity, perform bounded ownership-aware `.take(2)` duplicate lookup including inactive rows, delete/insert values and patch Resource once with revision plus one; preserve historical aliases and return `UPDATED`; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes admin update only and preserves create/read data and every legacy API; authored estimate: 125 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Instrument call order to prove stale wins before no-op/immutable/blocker/aggregate work; test current and stale same-state updates, global identity changes, organization identity rejection, inactive collisions, invalid values, alias/value preservation after every failure, no partial replacement, exactly-one revision increment, and legacy update regression; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU7 integration/tests; authored estimate: 50 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize candidate merge/equality and immutable-field reporting while keeping active state lifecycle-only, organization aliases non-transferable, and Convex transaction rollback authoritative; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU7 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` lifecycle cases for missing Resource, stale same-state command, current-revision `UNCHANGED`, revision increment exactly once, deactivation preservation of values/aliases/identity/classification/ownership, activation against effective and inert catalog branches, invalid stored values, failed activation unchanged/inactive, active-resource catalog blocker visibility, inactive-resource blocker exclusion, and no cascade/publication/snapshot mutation; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU8 tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement `activarRecurso` and `desactivarRecurso` with revision comparison before same-state/business handling; make deactivation patch only `activo` and revision, and make activation load bounded values, validate current effective hierarchy/aggregate/Resource state, re-derive identity, check scoped duplicates/organization identity, then patch active state and metadata atomically; keep inactive historical detail readable and expose no hard delete; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes lifecycle exports/integration while retaining reads/create/update and stored data; authored estimate: 90 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test current versus stale same-state commands, effective/inert/broken hierarchy, inactive Unit/options/assignments/rules, duplicate activation, catalog deactivation blockers before/after resource deactivation, unchanged aliases/values/catalog revisions/snapshots, and all structured failure codes; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU8 lifecycle tests/seams; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep lifecycle orchestration on shared revision/effective-validation helpers, isolate active-resource blocker integration, and verify no resource command publishes or cascades; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU8 cleanup; authored estimate: 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add `contract-tests/resource-admin-consumer.ts` and fixture configuration before static exports are available; assert generated `api.catalogoAdmin.recursos` references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, page cursors, summaries, detail diagnostics, all seven arguments/results, dispositions, and `AdminErrorData`; add legacy signature/return/message regression assertions; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, and `git diff --check`; rollback removes only WU9 fixture/regression tests; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required static Convex/package exports and regenerate `convex/_generated/*` through `pnpm exec convex codegen --typecheck enable`; make the fixture compile without backend imports, hand-maintained DTOs, or duplicated frontend validation; include legacy Resource APIs in the complete regression surface; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes package/config/fixture additions and generated output only through the normal generation workflow after API exports are reverted; authored estimate: 45 lines, generated declaration lines tracked separately and excluded from authored budget. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Run the complete legacy Resource suite and generated contract fixture; narrow `AdminErrorData` by discriminant, typecheck every new function/result/page/detail/ID, verify no excluded operation is exported, confirm generated declarations match the source, and record rollout order (optional schema/indexes → backfill complete → index readiness → endpoints → smoke tests) plus runtime evidence; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU9 fixture/docs after reverting API exports, with generated lines reported separately; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep package exports limited to generated Convex API/data-model/error types, document pinned/private-package consumption and native relevance search ordering without adding an SDK/DTO layer, and preserve exact legacy Resource contracts; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback reverts only WU9 documentation/export cleanup; authored estimate: 20 lines, generated declaration lines tracked separately and excluded from authored budget. <!-- sdd-owner: implementation -->
- [ ] After apply, collect status evidence over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, `contract-tests/**`, and this change directory using `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `pnpm typecheck:consumer`, `git diff --check`, and `git status --short`; record each focused/full/runtime result and generated-versus-authored line accounting in `openspec/changes/resource-master-administration/apply-progress.md`; rollback boundary is the evidence record only; authored estimate: 0 lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/resource-master-administration/tasks.md`: all RED/GREEN/TRIANGULATE/REFACTOR rows have evidence, every authored work-unit diff remains below 400 lines, generated declarations are separately identified, legacy APIs remain protected, the selected search branch is the only branch implemented, and every rollback boundary is actionable; focused command `git diff --check`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `pnpm typecheck:consumer` and codegen; rollback boundary is the lifecycle decision record only; authored estimate: 0 lines. <!-- sdd-owner: parent -->


## WU1 Apply Evidence — `resource-admin-wu1`

### Structured status consumed

- Native status: `schemaName: gentle-ai.sdd-status`, change `resource-master-administration`, artifact store `openspec`, authoritative `applyState: ready`, `nextRecommended: apply`, and proposal/specs/design/tasks/apply-progress present.
- Action context: `repo-local`, workspace `/home/garfex/PROGRAMACION/sistema-garfex`, allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; no edit-root warning.
- Workload gate: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, `400-line budget risk: High`; parent delivery context authorized the WU1 slice under `auto-chain`.
- Native attempt authority: continued the acquired WU1 attempt with token `sha256:64b11e8a696d4529bc5aa2e6897651bfdd330c201b57c0e01c005c7d29fec901`; no second attempt was acquired.

### Scope and TDD evidence

- WU1 only. WU2 and later product work was not started; no admin list/search endpoint was added.
- RED focused command: `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts` — intentionally failed with 3 failing assertions: undeclared Resource admin index, missing metadata/projection behavior, and the newly added backfill fixture initially lacked its module map. The pre-existing legacy tests passed in that run.
- GREEN focused command: same command — 2 files, 41 tests passed.
- GREEN boundary: `pnpm exec convex codegen --typecheck enable && pnpm exec vitest run && pnpm typecheck && git diff --check` — Convex codegen passed; 29 files, 207 tests passed; `tsc --noEmit` passed; diff check passed.
- TRIANGULATE focused command: same command — 2 files, 41 tests passed, covering empty/populated tables, resumed and repeated batches, incorrect/missing metadata, global/organization duplicate reports including inactive rows, all 16 Resource indexes, search filters, legacy projection, and preserved Resource fields.
- TRIANGULATE boundary: `pnpm exec convex codegen --typecheck enable && pnpm exec vitest run && pnpm typecheck && git diff --check` — codegen passed; 29 files, 207 tests passed; typecheck and diff check passed.
- REFACTOR focused command: same command — 2 files, 41 tests passed.
- REFACTOR boundary: `pnpm exec convex codegen --typecheck enable && pnpm exec vitest run && pnpm typecheck && git diff --check` — codegen passed; 29 files, 207 tests passed; typecheck and diff check passed.
- TDD Cycle Evidence: RED observed the required failure; GREEN supplied optional metadata, exact index/search schema, bounded backfill, metadata writes, and explicit legacy projection; TRIANGULATE proved duplicate/scope/boundary/preservation counterexamples; REFACTOR extracted `deriveResourceMetadata` as the deterministic contract and documented rollout ordering.

### Implementation and accounting

- Changed allowed surfaces: `convex/schema.ts`, `convex/catalogoAdmin/lib/backfillMetadatos.ts`, `convex/catalogoAdmin/lib/backfillMetadatos.test.ts`, `convex/catalogoRecursos/recursos.ts`, `convex/catalogoRecursos/recursos.test.ts`, generated `convex/_generated/dataModel.d.ts`, and WU1 checkbox metadata in `tasks.md`. `convex/_generated/api.d.ts` was not changed.
- Behavior: `recursos` now has optional `adminSortId`/`adminScopeKey`, the exact 16 ordinary-list index plans, and `buscar` filters for Type, Unit, active state, and scope. The appended bounded plan repairs missing/incorrect metadata, resumes by cursor, and reports deterministic scoped duplicate identities without deleting data. Legacy create writes metadata transactionally, while all legacy Resource responses use an explicit projection omitting metadata.
- Authored diff before this evidence append: 139 additions/deletions excluding generated declarations; current WU1 authored total remains below the 320 runtime-line ceiling and 400-line review budget. Generated diff: 113 additions and 1 deletion in `convex/_generated/dataModel.d.ts`; generated lines are excluded from authored accounting.
- Runtime boundary: `pnpm exec convex dev --once` was attempted and returned `A local backend is still running on port 3210`; no successful runtime evidence is claimed, and the existing backend was not stopped or mutated.
- Rollback boundary: revert only WU1 schema/index/backfill/projection and focused tests; retain any already-backfilled optional metadata and never delete Resource, value, alias, catalog revision, or snapshot data.

### Remaining work

WU1 implementation rows are complete. WU2–WU9 implementation rows and both parent-owned lifecycle rows remain deferred to the parent lifecycle. The exact current unchecked task lines follow:
- [ ] **RED** — Add failing pure tests in `convex/catalogoAdmin/lib/recursoResumen.test.ts`, `convex/catalogoAdmin/lib/recursoDetalle.test.ts`, `convex/catalogoAdmin/lib/recursoValidacion.test.ts`, and `convex/catalogoAdmin/resourceValidators.test.ts` for summary shape without values, effective/inert/broken hierarchy status, nullable historical references, value-limit boundary, every listed domain-failure mapping, and `ConvexError.data` safety; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/resourceValidators.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU2 tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement inferred validators and the three Resource helper seams, including `MAX_RESOURCE_VALUES = 200`, coded violations, non-throwing bounded validation, and explicit mapping to `ADMIN_NOT_FOUND`, `ADMIN_INVALID_REFERENCE`, `ADMIN_INVALID_STATE`, `ADMIN_AGGREGATE_INCOMPLETE`, `ADMIN_DUPLICATE_KEY`, `ADMIN_CONFLICT`, `ADMIN_IMMUTABLE_FIELD`, and `ADMIN_INVALID_ARGUMENT`; preserve the existing Spanish `validarRecurso` wrapper and messages; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/resourceValidators.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU2 helpers/violation additions and reverts the narrow legacy seam if compatibility changes; authored estimate: 85 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Add counterexamples for inactive catalog branches, missing Type/Family/Class/Unit/organization references, duplicate/required/forbidden/non-finite/invalid-type values, excessive aggregate fan-out, safe context limits, and message changes; run protected legacy Resource scenarios and assert names, arguments, returns, and Spanish errors remain unchanged; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes WU2 integration/tests while preserving stored data and legacy behavior; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep summary projection unable to import/query the value loader, keep detail dependent on summary rather than vice versa, and centralize domain-to-admin error mapping; focused command `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU2 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` scenarios in `convex/catalogoAdmin/recursos.test.ts` for page-size bounds, default `ALL`, all lifecycle modes, all 16 filter plans, ANDed filters, multi-page 1,000+ traversal without duplicates/omissions, cursor mismatch, sparse pages, and a DB proxy/dependency proof that summary execution performs zero `valoresAtributoRecurso` queries; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU3 tests; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register `listarRecursosResumen` in `convex/catalogoAdmin/recursos.ts`; normalize filters and lifecycle, select the exact design index plan, consume/emit the opaque cursor binding `plan`, filters, mode, and `resource-identity-id-v1`, call indexed `.order("asc").paginate`, resolve only classification references, and return the shared `AdminPage<ResourceSummary>`; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes the list export/planner while retaining WU1 metadata/indexes and WU2 helpers; authored estimate: 90 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Traverse every filter/lifecycle plan with page sizes 1, 2, 25, 100 and sparse matches; reuse cursors across changed filter, lifecycle, plan, and ordering bindings; assert page envelopes, exhaustion, no `.collect()`/post-index `.filter()`, and zero value loads; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/pagination.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU3 list behavior/tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep plan selection and canonical cursor binding reusable for search and keep `recursoResumen.ts` statically unable to depend on detail/persistence/value loading; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/pagination.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU3 refactor; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add the installed-version traversal gate before implementing the endpoint: assert the manifest/lock resolves Convex exactly to `1.45.0`, create more equal-relevance hits than one page, and traverse the unchanged result repeatedly with page sizes 1, 2, and a non-divisor, requiring every expected ID exactly once, no unknown IDs, and termination; also add cursor-binding failure tests for text, filters, lifecycle, plan, and order; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU4 tests; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Only if the RED traversal gate passes, implement native `withSearchIndex("buscar", ...)` plus native `.paginate`, normalized NFC/trimmed search text, all indexed filters, `resource-search-native-v1`, and `convex-1.45.0-relevance-v1`; if the gate fails, stop and record the required explicit design/specification revision instead of implementing search. Focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes the native search endpoint/plan only; authored estimate: 85 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Repeat native equal-relevance traversal with changed page sizes, cursor-binding failures, and no-value-load/without-collect proofs; document the installed Convex relevance order rather than lexical order; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU4 native search tests/behavior; authored estimate: 45 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep native search normalization, cursor binding, version/order tokens, and the proof gate explicit; pin a new order token if the installed Convex version changes and remove any unbounded collection or in-memory sort; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/pagination.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback reverts only WU4 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` cases for missing ID → `null`, stored active/inactive detail, missing/inactive catalog references, all values at 200, 201 rows rejected without truncation, exactly one indexed value query, and list/search DB-proxy rejection if a value table is accessed; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU5 tests; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement direct ID lookup and `loadResourceValuesBounded` with `MAX_RESOURCE_VALUES + 1` through `valoresAtributoRecurso.porRecurso`, nullable resolved references, aggregate diagnostics, and `ADMIN_INVALID_STATE` limit context; register only the new admin detail name and keep legacy detail untouched; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes the admin detail export/loader only; authored estimate: 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify 0/1/200/201 value boundaries, inactive and broken historical references, exact query count, no truncation, no direct collection scan, no summary value access, and preservation of all existing public detail outputs; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU5 integration/tests; authored estimate: 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep the detail loader behind one named bounded seam and prevent `recursoResumen.ts` from importing it; keep stored history visible even when current catalog state is inert; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU5 cleanup; authored estimate: 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` create cases for effective Class→Family→Type, active Unit, assignments/rules/definitions/options/values, blank/over-limit values, missing/inactive organization, derived identity, global and organization duplicate identities including inactive rows, alias collision, and injected alias/value-write failure with no partial rows; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU6 tests; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement one Convex mutation transaction that normalizes inputs, validates bounded effective aggregate/resource state, derives `identificadorTecnico`, performs one ownership-aware indexed duplicate check and exact alias check, then inserts Resource revision 1, values, and organization/version alias with `CREATED` summary; map every failure to validated `ADMIN_*` data and never accept caller technical identity or active state; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes admin create/persistence code and leaves all stored rows untouched; authored estimate: 110 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Prove global versus organization scope, inactive duplicate reservation, alias atomicity, concurrent-equivalent duplicate behavior, validation-before-write, injected value-write rollback, no publication/catalog-revision/snapshot mutation, structured contexts, and legacy `crearRecurso` signatures/returns/messages; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/identidadesRecurso.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU6 create behavior/tests; authored estimate: 40 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep persistence orchestration thin, identity/alias checks bounded and ownership-aware, and all atomic writes in one transaction without adding authorization or migration semantics; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU6 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` cases for missing Resource, invalid expected revision, stale-before-no-op and stale-before-validation, normalized no-op, material update revision increment, mutable name/description/Unit/values, immutable Type/Class/Family/ownership/active/technical identity echoes, organization identity drift, inactive duplicate collision, invalid current effective catalog, alias preservation, and injected replacement value-write rollback; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU7 tests; authored estimate: 45 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement revision-first update: load Resource, compare positive `expectedRevision`, check immutable echoes, bounded-load old values, construct the complete candidate, validate its current effective aggregate and Resource state, return `UNCHANGED` only after that validation when semantically equal, then derive identity, perform bounded ownership-aware `.take(2)` duplicate lookup including inactive rows, delete/insert values and patch Resource once with revision plus one; preserve historical aliases and return `UPDATED`; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes admin update only and preserves create/read data and every legacy API; authored estimate: 125 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Instrument call order to prove stale wins before no-op/immutable/blocker/aggregate work; test current and stale same-state updates, global identity changes, organization identity rejection, inactive collisions, invalid values, alias/value preservation after every failure, no partial replacement, exactly-one revision increment, and legacy update regression; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU7 integration/tests; authored estimate: 50 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize candidate merge/equality and immutable-field reporting while keeping active state lifecycle-only, organization aliases non-transferable, and Convex transaction rollback authoritative; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU7 refactoring; authored estimate: 20 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing `convex-test` lifecycle cases for missing Resource, stale same-state command, current-revision `UNCHANGED`, revision increment exactly once, deactivation preservation of values/aliases/identity/classification/ownership, activation against effective and inert catalog branches, invalid stored values, failed activation unchanged/inactive, active-resource catalog blocker visibility, inactive-resource blocker exclusion, and no cascade/publication/snapshot mutation; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback removes only WU8 tests; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement `activarRecurso` and `desactivarRecurso` with revision comparison before same-state/business handling; make deactivation patch only `activo` and revision, and make activation load bounded values, validate current effective hierarchy/aggregate/Resource state, re-derive identity, check scoped duplicates/organization identity, then patch active state and metadata atomically; keep inactive historical detail readable and expose no hard delete; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes lifecycle exports/integration while retaining reads/create/update and stored data; authored estimate: 90 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test current versus stale same-state commands, effective/inert/broken hierarchy, inactive Unit/options/assignments/rules, duplicate activation, catalog deactivation blockers before/after resource deactivation, unchanged aliases/values/catalog revisions/snapshots, and all structured failure codes; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU8 lifecycle tests/seams; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep lifecycle orchestration on shared revision/effective-validation helpers, isolate active-resource blocker integration, and verify no resource command publishes or cascades; focused command `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `git diff --check`; rollback reverts only WU8 cleanup; authored estimate: 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add `contract-tests/resource-admin-consumer.ts` and fixture configuration before static exports are available; assert generated `api.catalogoAdmin.recursos` references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, page cursors, summaries, detail diagnostics, all seven arguments/results, dispositions, and `AdminErrorData`; add legacy signature/return/message regression assertions; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, and `git diff --check`; rollback removes only WU9 fixture/regression tests; authored estimate: 30 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required static Convex/package exports and regenerate `convex/_generated/*` through `pnpm exec convex codegen --typecheck enable`; make the fixture compile without backend imports, hand-maintained DTOs, or duplicated frontend validation; include legacy Resource APIs in the complete regression surface; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback removes package/config/fixture additions and generated output only through the normal generation workflow after API exports are reverted; authored estimate: 45 lines, generated declaration lines tracked separately and excluded from authored budget. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Run the complete legacy Resource suite and generated contract fixture; narrow `AdminErrorData` by discriminant, typecheck every new function/result/page/detail/ID, verify no excluded operation is exported, confirm generated declarations match the source, and record rollout order (optional schema/indexes → backfill complete → index readiness → endpoints → smoke tests) plus runtime evidence; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, runtime command or exact N/A record, and `git diff --check`; rollback removes only WU9 fixture/docs after reverting API exports, with generated lines reported separately; authored estimate: 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep package exports limited to generated Convex API/data-model/error types, document pinned/private-package consumption and native relevance search ordering without adding an SDK/DTO layer, and preserve exact legacy Resource contracts; focused command `pnpm typecheck:consumer`; full boundary `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, codegen, runtime command or exact N/A record, and `git diff --check`; rollback reverts only WU9 documentation/export cleanup; authored estimate: 20 lines, generated declaration lines tracked separately and excluded from authored budget. <!-- sdd-owner: implementation -->
- [ ] After apply, collect status evidence over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, `contract-tests/**`, and this change directory using `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `pnpm typecheck:consumer`, `git diff --check`, and `git status --short`; record each focused/full/runtime result and generated-versus-authored line accounting in `openspec/changes/resource-master-administration/apply-progress.md`; rollback boundary is the evidence record only; authored estimate: 0 lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/resource-master-administration/tasks.md`: all RED/GREEN/TRIANGULATE/REFACTOR rows have evidence, every authored work-unit diff remains below 400 lines, generated declarations are separately identified, legacy APIs remain protected, the selected search branch is the only branch implemented, and every rollback boundary is actionable; focused command `git diff --check`; full boundary `pnpm exec vitest run && pnpm typecheck` plus `pnpm typecheck:consumer` and codegen; rollback boundary is the lifecycle decision record only; authored estimate: 0 lines. <!-- sdd-owner: parent -->

## WU2 Apply Evidence — `WU2-resource-contract-helpers`

### Structured status consumed and produced

- Native status was authoritative OpenSpec status: `applyState: ready`, `nextRecommended: apply`, proposal/specs/design/tasks/apply-progress present, `verifyReport` missing, and no blocked reasons. Action context was `repo-local` at `/home/garfex/PROGRAMACION/sistema-garfex`, with the workspace root allowed; no edit-root warning occurred.
- The acquired native runtime authority was active ordinal 5 for `WU2-resource-contract-helpers`, with evidence goal `Add Resource admin validators, value-free summaries, bounded detail contracts, diagnostics, and structured error mapping`, maximum 2 attempts and 380 changed lines. No second acquire was performed; the parent-held attempt was continued.
- Workload gate: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, `400-line budget risk: High`; parent context authorized only the WU2 `auto-chain` slice. WU3 was not started.
- After checkbox persistence, native status reports 12 of 42 implementation rows complete, 30 remaining, `applyState: ready`, and `verify`/`archive` blocked pending later implementation and parent lifecycle work. Only the four WU2 implementation rows were changed; all WU3–WU9 and parent-owned unchecked lines remain in `tasks.md`.

### Scope and strict TDD evidence

- RED focused command: `pnpm exec vitest run convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — intentionally failed in all 4 suites because the helper modules did not yet exist.
- GREEN focused command: the same four-file command — 4 files, 17 tests passed.
- TRIANGULATE focused command: `pnpm exec vitest run convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoAdmin/lib/recursoResumen.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoRecursos/recursos.test.ts` — 4 files, 54 tests passed, including protected legacy Resource scenarios and inactive/missing reference, value-boundary, mapping, and safe-context counterexamples.
- REFACTOR focused command: the four helper test files — 4 files, 18 tests passed; `pnpm typecheck` passed.
- Full boundary: `pnpm exec vitest run && pnpm typecheck && pnpm exec convex codegen --typecheck enable && git diff --check` — 33 files, 225 tests passed; typecheck, codegen, and diff check passed. Codegen changed only derived `convex/_generated/api.d.ts` violation unions (48 additions, 6 deletions); it was not hand-edited.
- Runtime boundary: `pnpm exec convex dev --once` returned `A local backend is still running on port 3210`; no runtime evidence is claimed, and the active user Convex dev process was not stopped or altered.

### Implementation and accounting

- Added inferred Resource value/input/ownership/classification/summary/detail/diagnostic validators with `MAX_RESOURCE_VALUES = 200`; summaries contain no `valores`, and detail references are nullable.
- Added value-free summary projection and `EFFECTIVE`/`INERT`/`BROKEN_REFERENCE` hierarchy status, summary-dependent detail assembly, and one indexed bounded value-loader seam using `take(MAX_RESOURCE_VALUES + 1)` with coded `RESOURCE_VALUE_LIMIT_EXCEEDED` state data.
- Added the non-throwing bounded `evaluarRecurso` seam beside the unchanged Spanish throwing `validarRecurso` wrapper and centralized all listed domain-failure-to-validated-`ADMIN_*` mapping without parsing legacy messages. Added the seven Resource violation literals plus the two requested limit/search literals.
- Changed surfaces were limited to WU2 helper/tests, shared `convex/catalogoAdmin/validators.ts`, the narrow `convex/catalogoRecursos/validacionRecurso.ts` seam, CLI-generated `convex/_generated/api.d.ts`, and WU2 task/evidence metadata. No admin endpoint, WU3 work, branch, stage, commit, or destructive runtime operation was added.
- Authored additions plus deletions: 324 lines (302 helper/test lines, 14 shared/legacy seam lines, 8 WU2 checkbox lines), below the 380-attempt and 400-review budgets. Generated accounting is separate: 48 additions and 6 deletions. Rollback boundary: remove only WU2 Resource helper/violation/test changes and the narrow non-throwing seam; retain stored data and all legacy behavior.

### TDD Cycle Evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| WU2 RED | ✅ 4 expected missing-module failures | ✅ 17 focused tests | ✅ Counterexample coverage added | ✅ Focused rerun passed |
| WU2 GREEN | ✅ Contract failure established | ✅ Validators, projections, loader, seam, mapping implemented | ✅ 200/201 boundary and mappings exercised | ✅ Typecheck passed |
| WU2 TRIANGULATE | ✅ Boundary tests drove implementation | ✅ 54-test legacy/projection run passed | ✅ Inactive/missing references and safe data passed | ✅ Full boundary passed |
| WU2 REFACTOR | ✅ Legacy behavior protected | ✅ Focused suite passed | ✅ Summary has no detail/value-loader dependency | ✅ Full Vitest, typecheck, codegen, diff check passed |

### Remaining work

WU2a and WU2b implementation rows are complete. WU3–WU9 implementation rows and both parent-owned lifecycle rows remain unchecked and deferred; no WU3 work was started. Their exact unchecked task lines remain in the cumulative receipt above and in `tasks.md`.

## WU2 Correction Evidence — `WU2-resource-contract-correction`

- Structured status consumed: authoritative OpenSpec `applyState: ready`, `nextRecommended: apply`, all required proposal/spec/design/tasks/apply-progress artifacts present, no blocked reasons; action context `repo-local` at `/home/garfex/PROGRAMACION/sistema-garfex` with the workspace root allowed. Active correction authority was ordinal 6, token `sha256:92c368ed83512fbb100e4664759a9d72997b625e2fdadb91e58aa89d679503b7`, work unit `WU2-resource-contract-correction`, max 480 changed lines. Workload gate remained `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, `400-line budget risk: High`; only the authorized correction slice was applied.
- Corrected missing Type classification fallback in `recursoResumen.ts`: missing Type now necessarily yields `BROKEN_REFERENCE` with `MISSING_REFERENCE`; effective and inert branches remain covered. Added focused counterexamples for missing Type/Family/Class and all three summary states.
- Completed the Resource-specific closed mapping seam in `recursoValidacion.ts` for `ADMIN_NOT_FOUND`, `ADMIN_INVALID_REFERENCE`, `ADMIN_INVALID_STATE`, `ADMIN_AGGREGATE_INCOMPLETE`, `ADMIN_DUPLICATE_KEY`, `ADMIN_CONFLICT`, `ADMIN_IMMUTABLE_FIELD`, and `ADMIN_INVALID_ARGUMENT`. The throw seam delegates to the existing validated admin error boundary; no endpoint behavior or legacy wrapper/message changed.
- Persisted WU2 task rows were already `[x]` and remain checked; WU3 was not started. Changed correction surfaces: `convex/catalogoAdmin/lib/recursoResumen.ts`, `convex/catalogoAdmin/lib/recursoResumen.test.ts`, `convex/catalogoAdmin/lib/recursoValidacion.ts`, and `convex/catalogoAdmin/lib/recursoValidacion.test.ts`. No DB query-count/detail-loader tests were added.
- Strict-TDD evidence: RED produced 18 expected failures for missing-reference and absent mapping seams; GREEN passed the four focused suites with 38 tests; TRIANGULATE covered each mapping output through `ConvexError.data` and missing-reference counterexamples; REFACTOR centralized domain mapping through the Resource seam.
- Verification: four focused suites passed (4 files, 38 tests); legacy `convex/catalogoRecursos/recursos.test.ts` passed (38 tests); full Vitest passed (33 files, 245 tests); `pnpm typecheck` passed; Convex codegen with `--typecheck enable` passed twice; generated `api.d.ts` and `dataModel.d.ts` hashes were stable across both runs (`30803f5755a017c53c98e773f1ce44138cd7c0271e859b7d97a8abee5a208891` and `3ce2d765a69bf3f2186d5951f1647f53f0d6f6746f464a510afbb84515b84bd2`); `git diff --check` passed. Runtime/dev was not started or mutated.
- Correction diff is 110 authored additions/deletions before this evidence append; generated declarations had no correction drift. No commit, branch, or staging operation was performed. Next action is `parent-lifecycle`; verify remains blocked until all later implementation rows and parent review gates are complete.

## WU2 Split Decision — `WU2a-resource-contracts` and `WU2b-resource-validation`

- The corrected combined WU2 product/tests change measured 415 authored lines. The user selected the split into WU2a and WU2b; no size exception was granted.
- WU2a is the completed validator/value-free summary/detail/diagnostics slice: `resourceValidators*`, `recursoResumen*`, and `recursoDetalle*`, with shared violation-validator additions where required. Its forecast is below 400 authored lines; rollback removes only those contracts/projections/diagnostics and their focused tests/violation additions.
- WU2b is the completed non-throwing validation seam and complete domain-to-ADMIN mapping slice: `recursoValidacion*`, the narrow `catalogoRecursos/validacionRecurso.ts` seam, shared/derived contract updates, and focused tests. Its forecast is below 400 authored lines; rollback removes only that seam/mapping and focused tests while preserving the legacy wrapper and Spanish messages.
- WU2a focused commands were the Resource validator, summary, and detail suites; WU2b focused commands were the Resource validation seam plus legacy validation/Resource suites. Existing evidence is retained above; no additional test execution is claimed by this record.
- Dependencies at the time of this historical split read WU1 → WU2a → WU2b → WU3; the later native-first rescope below inserts WU2c before WU3. WU5 still depends on WU2a, and WU6 on WU2b plus WU5. Parent gates remain unchecked.

## Native-first artifact rescope — `resource-native-pagination-decision`

### Decision and audit record

- The user selected native Convex pagination as mandatory for Resource administration: `paginationOptsValidator`, native `PaginationResult`, query `.paginate()`, and direct React `usePaginatedQuery` compatibility.
- Resource `AdminPage`, custom cursor envelopes/hashes, manual page accumulation, query-plan/order/version tokens, and custom cache behavior are no longer authorized.
- Essential Resource list/search filters are lifecycle, Type, and organization scope. Unit filtering is excluded until a demonstrated UI requirement produces a separate decision.
- Equality-prefix analysis uses existing unscoped indexes and exactly two additional scope index shapes: `[adminScopeKey, tipoRecursoId, activo]` and `[adminScopeKey, activo]`. This is a field-prefix proof, not an arbitrary index-count target.
- Resource `adminSortId` is unnecessary because native index pagination has stable implicit ordering. WU2c removes its Resource read/write/index/backfill dependency and safely removes stored/schema state if deployment inspection shows WU1 data reached a backend.
- The pre-existing generic catalog metadata backfill remains intact. Its appended Resource branch is corrected to repair only `adminScopeKey`; any one-time obsolete-field cleanup is separate migration hygiene, not generic backfill behavior.
- `MAX_RESOURCE_VALUES` already has one production definition in `resourceValidators.ts`, imported by the detail loader. No extra consolidation unit is needed; WU2c verifies later units reuse it.
- Convex mutation atomicity and OCC are authoritative for create/update/lifecycle rollback and races. Pending tests assert final database state while retaining GARFEX revision, identity, ownership, alias, effective-catalog, and lifecycle rules.
- Existing custom catalog-admin pagination is explicitly outside this Resource rescope and is not authorized for rewrite.

### Historical and pending state

- Completed W0, WU1, WU2a, and WU2b checkboxes and receipts remain unchanged as historical truth.
- WU1’s completed behavior is partially superseded by the completed WU2c correction; WU1 was not unchecked or rewritten as if it had never happened.
- Revised sequence: `W0 ✓ → WU1 ✓ → WU2a ✓ → WU2b ✓ → WU2c ✓ → WU3 → WU4 → WU5 → WU6 → WU7 → WU8 → WU9`.
- Revised counts: 48 implementation-owned TDD rows total, 20 complete and 28 pending; both parent-owned gates remain unchecked, for 50 task rows total.
- Pending authored forecast is approximately 1,240 changed lines. Every pending unit is forecast below 400 authored additions plus deletions; generated declarations remain separate.
- No product, generated, package, Git, runtime, branch, or commit mutation was performed by this artifact rescope. No verification command or runtime evidence is claimed.

### Next boundary

WU2c is complete before WU3. Its rollback boundary is limited to Resource-specific schema/index/search-filter/scope-backfill/write corrections and focused tests; it must preserve non-Resource catalog-admin behavior and all stored Resource business data.

## WU2c Apply Evidence — native-first Resource correction

### Structured status consumed

- Native status was authoritative OpenSpec status for `resource-master-administration`: `applyState: ready`, `nextRecommended: apply`, `artifactStore: openspec`, all required proposal/spec/design/tasks/apply-progress artifacts present, and no blocked reasons.
- Action context was `repo-local` with workspace `/home/garfex/PROGRAMACION/sistema-garfex` and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; no edit-root warning.
- Workload gate was resolved by the task delivery path `auto-chain`, `stacked-to-main`; WU2c remained within its 180-line authored budget despite the stack-wide high-risk forecast. Only WU2c was implemented; WU3 was not started.
- Ownership validation found valid terminal markers; only the four WU2c implementation rows were changed to checked. Parent-owned lifecycle rows remain deferred.
- The active native attempt was continued with token `sha256:473ffb8d2d019261c6e4803d79f2a5358731cd137ae3c7d665b9e128e8435a85` through request `wu2c-apply-20260302`; no second attempt was created.

### Strict TDD cycle evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| WU2c correction | Focused run intentionally failed 3 assertions: obsolete scope index was missing, Resource backfill still reported duplicates, and legacy Resource creation still wrote `adminSortId`. | Focused `backfillMetadatos.test.ts recursos.test.ts`: 2 files, 42 tests passed after schema/backfill/write correction. | Same focused suite: 2 files, 42 tests passed with all eight equality-prefix branches, scope repair, non-Resource backfill preservation, legacy output, and no Unit search filter. | Focused suite: 2 files, 42 tests passed after centralizing the limit import, making scope derivation-only, removing Resource duplicate-candidate work, and cleaning diff whitespace. |

### Implementation

- `convex/schema.ts`: removed all sixteen Resource `adminPor*` sort indexes; retained only `adminPorScopeYTipoYActivo` (`adminScopeKey`, `tipoRecursoId`, `activo`) and `adminPorScopeYActivo` (`adminScopeKey`, `activo`); removed `unidadId` from the Resource search filter fields.
- `convex/catalogoAdmin/lib/backfillMetadatos.ts`: Resource metadata now derives/repairs only `adminScopeKey`; Resource duplicate candidate/report work is absent; every non-Resource metadata plan remains unchanged.
- `convex/catalogoRecursos/recursos.ts`: legacy creation continues writing scope metadata but no longer writes `adminSortId`; legacy projections, arguments, return shapes, and Spanish behavior remain unchanged.
- `convex/catalogoRecursos/validacionRecurso.ts`: imports `MAX_RESOURCE_VALUES` from the sole production definition in `convex/catalogoAdmin/resourceValidators.ts` instead of defining a duplicate.
- Focused tests assert the generated index field-prefix tuples, reject all sixteen obsolete index names at the type level, reject the Unit search filter at the generated type level, preserve non-Resource plans, and preserve legacy business fields/output.
- `convex/_generated/dataModel.d.ts` was regenerated through the Convex CLI. `convex/_generated/api.d.ts` was not changed because WU2c adds no endpoint.

### Populated-schema rollout boundary

- Deployment audit found an active local anonymous Convex dev process and could not prove that no deployed row contains WU1 `adminSortId`; the process was not stopped and no destructive cleanup was attempted.
- The optional `recursos.adminSortId` storage field is therefore retained as clearly deprecated inert residue. No runtime write, query, index, backfill, or API depends on it.
- The recorded safe tightening sequence is: bounded operator traversal through `recursos.porIdentificadorTecnico`, unset only `adminSortId`, independently verify zero remaining values, then remove the optional schema field in a later deployment. The generic backfill is not that cleanup helper.
- No Resource, value, alias, catalog revision, snapshot, or other business data was deleted or rewritten.

### Verification evidence

- RED focused: `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts convex/catalogoRecursos/recursos.test.ts` — 3 expected failures, 38 legacy tests passed.
- GREEN focused: same command — 2 files, 42 tests passed.
- TRIANGULATE/REFACTOR focused: same command — 2 files, 42 tests passed.
- Full boundary: `pnpm exec convex codegen --typecheck enable && pnpm exec vitest run && pnpm typecheck && pnpm typecheck:consumer && git diff --check` — codegen/typecheck passed; 33 files, 246 tests passed; application and consumer typechecks passed; diff check passed.
- Codegen truth: under the already-running user-attached Convex dev session, `pnpm exec convex codegen --typecheck enable` emitted `Uploading functions to Convex`; the `api.d.ts` and `dataModel.d.ts` hashes stayed unchanged. No cleanup or second codegen was performed, and the active dev session was not stopped.
- Runtime evidence without stopping the active dev session: PID 3850724 remained running; local legacy `listarRecursos` and `buscarRecursos` both returned `{"status":"success","value":[]}`; direct mutation access to the internal backfill returned the expected “Could not find public function” response and performed no write. The active process was never stopped.
- Final status after task updates reported `taskProgress.total: 50`, `complete: 20`, `pending: 28`, `applyState: ready`, `verify: blocked` pending parent lifecycle approval.

### Accounting and boundary

- WU2c accounting is exact: 164 authored changed lines including `design.md`, 107 generated declaration lines, 8 task metadata lines, 84 apply evidence lines, and 363 changed lines across the complete worktree. Generated lines remain separate from authored accounting.
- Generated declaration accounting is included in the exact 107 generated declaration lines above; generated lines remain separate from authored accounting.
- Changed paths (10): `convex/schema.ts`, `convex/catalogoAdmin/lib/backfillMetadatos.ts`, `convex/catalogoAdmin/lib/backfillMetadatos.test.ts`, `convex/catalogoRecursos/recursos.ts`, `convex/catalogoRecursos/recursos.test.ts`, `convex/catalogoRecursos/validacionRecurso.ts`, `convex/_generated/dataModel.d.ts`, `openspec/changes/resource-master-administration/design.md`, `openspec/changes/resource-master-administration/tasks.md`, and `openspec/changes/resource-master-administration/apply-progress.md`.
- Rollback boundary: revert only these WU2c Resource schema/index/search-filter/scope-backfill/write/test/design corrections and generated output via normal Convex codegen; retain any scope metadata and never delete business rows. Existing catalog-admin pagination remains untouched.

### Remaining work

The persisted tasks artifact was re-read after completion. The exact unchecked task lines are the current WU3–WU9 implementation rows and the two deferred parent-owned lifecycle rows; WU3 remains the next product boundary and no WU3 code was started.

- [ ] **RED** — Add failing tests for `paginationOptsValidator`, native result shape, all eight lifecycle/Type/scope combinations, native multi-page traversal, no Unit argument, no values, no `.collect()`/query `.filter()`, and direct paginated-query typing; do not add custom cursor mismatch tests; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register the list query, select the equality-prefix-valid index branch, call `.paginate(args.paginationOpts)` once, project only the native page, and return native pagination metadata unchanged; no `AdminPage`, cursor codec, plan/order token, cache, or accumulator; estimate 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Traverse 1,000+ unchanged Resources with several native page sizes and every filter combination, proving exact coverage, termination, zero value loads, and generated `usePaginatedQuery` compatibility; full verification and runtime-or-N/A; estimate 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep index-branch selection and page projection small and statically separated from detail/value loading; rollback removes only list export/helper/tests; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for NFC/trim/collapsed-whitespace normalization, blank rejection, lifecycle/Type/scope search filters, no Unit argument, repeated equal-relevance native traversal, no values, and no collect/sort fallback; omit cursor binding and token/version tests; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register search with native pagination args/result validator, `withSearchIndex("buscar")`, supplied equality filters, and `.paginate(args.paginationOpts)`; return native relevance pages without cursor wrappers, runtime version/order tokens, fallback sorting, cache, or accumulator; estimate 70 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Repeat unchanged equal-relevance traversal with page sizes 1, 2, and a non-divisor, plus each essential filter combination and normalized-text counterexamples; verify no values/Unit/custom cursor layer; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize only search-text normalization and native page projection; document relevance order as native Convex behavior; rollback removes search export/tests only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing cases for missing `null`, active/inactive/inert/broken detail, 0/1/200/201 values, exactly one `porRecurso` bounded load, no truncation, and centralized `MAX_RESOURCE_VALUES`; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register direct detail using the completed WU2a projector/loader and sole shared limit constant; preserve legacy detail; estimate 60 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify nullable references, exact load count, final error data at the limit, and no summary dependency on the loader; full verification and runtime-or-N/A; estimate 20 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep one named bounded loader and one authoritative limit definition; rollback removes detail export/integration only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add create tests for effective catalog, organization, values/limit, scoped active/inactive duplicates, aliases, and final Resource/value/alias state after every failure and concurrent-equivalent outcome; do not test custom rollback/retry machinery; estimate 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement one thin mutation that validates, derives identity, performs bounded duplicate/alias reads, and writes Resource revision 1, values, scope key, and alias atomically; rely on Convex rollback/OCC; estimate 95 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Prove global/organization scope, inactive duplicate reservation, alias/value failure final state, at-most-one concurrent identity, no publication changes, and legacy create compatibility; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep persistence helpers bounded and business-focused; add no lock, coordinator, compensation, cache, or retry protocol; rollback removes admin create only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add tests for missing/stale-first behavior, valid no-op, mutable fields, immutable classification/ownership/identity/lifecycle, current ineffective catalog, inactive duplicates, alias preservation, and final aggregate state after each failure; estimate 45 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement revision-first candidate construction/validation, no-op after validation, bounded identity check, atomic value replacement and one revision patch; import the shared value limit and rely on Convex transaction rollback; estimate 115 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify stale beats no-op/business validation, invalid equal candidate is not unchanged, organization identity cannot drift, material revision increments once, and every failed final state equals the prior aggregate; full verification and runtime-or-N/A; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize candidate equality/immutable reporting without adding transaction choreography or retry coupling; rollback removes admin update only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add lifecycle tests for missing/stale/current same-state, exactly-one revision increment, activation against effective/inert/invalid state, deactivation preservation, blocker visibility, and final state after failures; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement thin activate/deactivate mutations with revision-first handling; activation validates bounded current aggregate and identity, deactivation patches only state/revision; rely on native atomicity/OCC; estimate 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify current versus stale same-state, failed activation remains unchanged, values/aliases/catalog/publication remain preserved, and blockers observe active state; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse revision/effective-validation seams and remove any transaction/cache/retry abstraction; rollback removes lifecycle exports only; estimate 10 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add a consumer fixture using generated references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, direct `usePaginatedQuery` list/search calls, native results/status/load-more, detail, seven functions, dispositions, and `AdminErrorData`; assert no Unit/token/DTO/adapter/cache; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required package exposure and regenerate through Convex codegen; make the fixture compile without backend imports, manual DTOs, page adapters, or duplicated validation; estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck every native query/mutation shape, run full legacy Resource regressions, verify generated declarations match source, and confirm existing catalog-admin pagination was not changed; full verification and runtime-or-N/A; estimate 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep exports limited to generated Convex/API/data-model/error contracts and concise consumer documentation; rollback removes fixture/export/docs after API exports; estimate 15 authored lines. <!-- sdd-owner: implementation -->
- [ ] After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in `apply-progress.md`; rollback is evidence-only. <!-- sdd-owner: parent -->
- [ ] After verification, confirm all 48 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->

## WU3a Apply Evidence — `resource-master-wu3-native-list`

### Structured status consumed and produced

- Consumed native status authority: `schemaName: gentle-ai.sdd-status`, change `resource-master-administration`, artifact store `openspec`, authoritative `applyState: ready`, `dependencies.apply: ready`, `nextRecommended: apply`, all proposal/spec/design/tasks/apply-progress artifacts present, and no blocked reasons.
- Action context was `repo-local` at `/home/garfex/PROGRAMACION/sistema-garfex`; allowed edit root was `/home/garfex/PROGRAMACION/sistema-garfex`, with no edit-root warning.
- Workload gate: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, and `400-line budget risk: High`; this execution was limited to the assigned WU3 stacked slice. The WU3 authored diff remained below 400 additions plus deletions.
- Native attempt authority: continued the already-acquired WU3 attempt with token `sha256:653d21784253598508717bab10a532825736dc8bf061e42cedca3b86c7830175`; no second attempt was acquired.
- Produced phase disposition: WU3 implementation complete; WU4–WU9 and parent-owned lifecycle gates remain deferred. The parent lifecycle is the next route; no verify, review, receipt, commit, branch, or delivery gate was started.

### Strict TDD cycle evidence

| Phase | Evidence |
|---|---|
| RED | Added `convex/catalogoAdmin/recursos.test.ts` scenarios for native arguments/shape, value-free summaries, lifecycle/Type/scope matrix, page sizes, 1,000+ traversal, excluded pagination/value operations, and added `contract-tests/resource-admin-consumer.ts`; the pre-implementation focused run failed before the endpoint could execute (the initial value fixture was rejected and the source assertion had no file), while `pnpm typecheck:consumer` failed with `Property 'recursos' does not exist`. |
| GREEN | Added `listarRecursosResumen` with the installed Convex `1.45.0` `paginationOptsValidator` and `paginationResultValidator`, selected the eight equality-prefix-valid branches, invoked `.paginate(args.paginationOpts)` once, projected only `page`, and regenerated declarations with `pnpm exec convex codegen --typecheck enable`; focused result: 17 tests passed, `pnpm typecheck` passed, and `pnpm typecheck:consumer` passed. |
| TRIANGULATE | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts` — 2 files, 55 tests passed; native traversal covered 1,109 unchanged summaries at page size 37, all scope/lifecycle/Type combinations, global and organization scopes, sparse filters, value-free output, and native page sizes 1 and 100. Generated consumer typing passed. |
| REFACTOR | Kept index selection in `resourceIndexQuery`, summary projection in `summaryForResource`, and detail/value loading out of the module; static assertions verify one `.paginate(`, no `.collect()`/`.filter()`, no Unit/admin-sort/cursor/token/cache layer, and no value-table access. Full boundary passed: 34 files, 263 tests; repository and consumer typechecks passed; codegen and `git diff --check` passed. |

### Implementation and accounting

- Changed allowed authored surfaces: `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/recursos.test.ts`, `contract-tests/resource-admin-consumer.ts`, `contract-tests/tsconfig.json`, and WU3 checkbox/evidence metadata. Generated surface changed only through CLI: `convex/_generated/api.d.ts`.
- `listarRecursosResumen` accepts only native pagination options plus optional `lifecycle`, `tipoRecursoId`, and `scope` (`ALL`, `GLOBAL`, or one organization). It uses `porIdentificadorTecnico`, `porActivo`, `porTipo`, `porTipoYActivo`, `adminPorScopeYTipoYActivo`, or `adminPorScopeYActivo` according to the exact equality-prefix matrix.
- Native metadata is returned unchanged by spreading the pagination result and replacing only `page`; summaries resolve classification references but never access `valoresAtributoRecurso`. No Resource `AdminPage`, custom cursor/hash/envelope, plan/order token, Unit filter, accumulator, cache, `.collect()`, or query `.filter()` was added.
- Authored accounting for the WU3 slice before this evidence append: `76` new lines in the endpoint, `243` new lines in focused tests, `44` new lines in the native consumer fixture, and `2` changed lines in consumer config plus `8` task checkbox lines, for `373` additions/deletions. Generated declaration accounting: `42` additions in `convex/_generated/api.d.ts`, tracked separately and excluded from the authored budget. Apply-progress is evidence metadata and excluded from the WU3 behavior budget.
- Runtime boundary: `pnpm exec convex dev --once` was attempted without stopping the active development backend and returned `A local backend is still running on port 3210`; no active Convex dev was stopped or claimed as successful. Convex-test integration evidence is the active-dev-compatible runtime proof: WU3 focused scenarios and the full suite passed. No runtime mutation or deployment evidence is claimed.
- Rollback boundary: remove only `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/recursos.test.ts`, `contract-tests/resource-admin-consumer.ts`, its `tsconfig` include, and the generated API entry regenerated after removing the endpoint; retain all Resource data and existing legacy/catalog-admin behavior.

### Remaining work — exact current unchecked task lines

- [ ] **RED** — Add failing tests for NFC/trim/collapsed-whitespace normalization, blank rejection, lifecycle/Type/scope search filters, no Unit argument, repeated equal-relevance native traversal, no values, and no collect/sort fallback; omit cursor binding and token/version tests; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register search with native pagination args/result validator, `withSearchIndex("buscar")`, supplied equality filters, and `.paginate(args.paginationOpts)`; return native relevance pages without cursor wrappers, runtime version/order tokens, fallback sorting, cache, or accumulator; estimate 70 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Repeat unchanged equal-relevance traversal with page sizes 1, 2, and a non-divisor, plus each essential filter combination and normalized-text counterexamples; verify no values/Unit/custom cursor layer; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize only search-text normalization and native page projection; document relevance order as native Convex behavior; rollback removes search export/tests only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing cases for missing `null`, active/inactive/inert/broken detail, 0/1/200/201 values, exactly one `porRecurso` bounded load, no truncation, and centralized `MAX_RESOURCE_VALUES`; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register direct detail using the completed WU2a projector/loader and sole shared limit constant; preserve legacy detail; estimate 60 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify nullable references, exact load count, final error data at the limit, and no summary dependency on the loader; full verification and runtime-or-N/A; estimate 20 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep one named bounded loader and one authoritative limit definition; rollback removes detail export/integration only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add create tests for effective catalog, organization, values/limit, scoped active/inactive duplicates, aliases, and final Resource/value/alias state after every failure and concurrent-equivalent outcome; do not test custom rollback/retry machinery; estimate 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement one thin mutation that validates, derives identity, performs bounded duplicate/alias reads, and writes Resource revision 1, values, scope key, and alias atomically; rely on Convex rollback/OCC; estimate 95 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Prove global/organization scope, inactive duplicate reservation, alias/value failure final state, at-most-one concurrent identity, no publication changes, and legacy create compatibility; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep persistence helpers bounded and business-focused; add no lock, coordinator, compensation, cache, or retry protocol; rollback removes admin create only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add tests for missing/stale-first behavior, valid no-op, mutable fields, immutable classification/ownership/identity/lifecycle, current ineffective catalog, inactive duplicates, alias preservation, and final aggregate state after each failure; estimate 45 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement revision-first candidate construction/validation, no-op after validation, bounded identity check, atomic value replacement and one revision patch; import the shared value limit and rely on Convex transaction rollback; estimate 115 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify stale beats no-op/business validation, invalid equal candidate is not unchanged, organization identity cannot drift, material revision increments once, and every failed final state equals the prior aggregate; full verification and runtime-or-N/A; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize candidate equality/immutable reporting without adding transaction choreography or retry coupling; rollback removes admin update only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add lifecycle tests for missing/stale/current same-state, exactly-one revision increment, activation against effective/inert/invalid state, deactivation preservation, blocker visibility, and final state after failures; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement thin activate/deactivate mutations with revision-first handling; activation validates bounded current aggregate and identity, deactivation patches only state/revision; rely on native atomicity/OCC; estimate 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify current versus stale same-state, failed activation remains unchanged, values/aliases/catalog/publication remain preserved, and blockers observe active state; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse revision/effective-validation seams and remove any transaction/cache/retry abstraction; rollback removes lifecycle exports only; estimate 10 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add a consumer fixture using generated references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, direct `usePaginatedQuery` list/search calls, native results/status/load-more, detail, seven functions, dispositions, and `AdminErrorData`; assert no Unit/token/DTO/adapter/cache; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required package exposure and regenerate through Convex codegen; make the fixture compile without backend imports, manual DTOs, page adapters, or duplicated validation; estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck every native query/mutation shape, run full legacy Resource regressions, verify generated declarations match source, and confirm existing catalog-admin pagination was not changed; full verification and runtime-or-N/A; estimate 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep exports limited to generated Convex/API/data-model/error contracts and concise consumer documentation; rollback removes fixture/export/docs after API exports; estimate 15 authored lines. <!-- sdd-owner: implementation -->
- [ ] After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in `apply-progress.md`; rollback is evidence-only. <!-- sdd-owner: parent -->
- [ ] After verification, confirm all 48 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->

## WU3b Apply Evidence — `WU3b-native-react-pagination-contract`

### Structured status consumed and produced

- Consumed authoritative native status before editing: `artifactStore: openspec`, `applyState: ready`, `dependencies.apply: ready`, `nextRecommended: apply`, required proposal/spec/design/tasks/apply-progress artifacts present, and no blocked reasons.
- Action context was `repo-local` at `/home/garfex/PROGRAMACION/sistema-garfex`; the authoritative allowed edit root was `/home/garfex/PROGRAMACION/sistema-garfex`; no edit-root warning occurred.
- Workload gate was resolved by the approved `auto-chain`, `stacked-to-main` delivery path. WU3a query/tests remain accounted at approximately 319 authored changed lines; WU3b consumer/generated/task/evidence remains accounted at approximately 152 authored changed lines. Both are below 400 with no exception.
- Native attempt authority was continued at ordinal 9 with token `sha256:7d3ffd4d5f2e7064ad1f109a8c8c9260b4216a067fcf7d4309f19017c5148593` for `WU3b-native-react-pagination-contract`; no second attempt was acquired.
- Produced phase disposition: WU3a and WU3b are complete; WU4 is next. No WU4 implementation, review, receipt, commit, branch, staging, or delivery gate was started.

### Scope and strict-TDD evidence

- WU3a historical query/test work was not modified. `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/recursos.test.ts`, and generated declarations were not edited in this correction. `contract-tests/tsconfig.json` was also not modified by this correction. The earlier WU3a receipt's generated-consumer statement remains exact evidence for the then-present fixture; this WU3b correction is the evidence for the actual installed hook.
- RED: replaced the local hook declaration with the installed `convex/react` import and intentionally asserted the generated `nombre` field as a number; `pnpm typecheck:consumer` failed as expected with `contract-tests/resource-admin-consumer.ts(32,7): error TS2322: Type 'string' is not assignable to type 'number'.` No production/runtime behavior was changed.
- GREEN: corrected the assertion to `string`; `pnpm typecheck:consumer` passed with the actual installed hook and generated list reference.
- TRIANGULATE: the fixture now typechecks lifecycle, Type, and organization-scope filters, `initialNumItems: 25`, native accumulated `results`, all four native status literals, `loadMore`, Resource ID, technical identity, name, Type/Unit/organization IDs, active state, revision, and classification state.
- REFACTOR: the fixture contains no local `usePaginatedQuery` imitation, adapter, DTO, cache, manual accumulator, Unit filter, or backend implementation import. The generated API remains source-derived and hash-stable.

### Exact verification evidence

- `pnpm typecheck:consumer` — passed after the RED correction.
- `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts` — 2 files, 55 tests passed.
- `pnpm exec vitest run && pnpm typecheck` — 34 files, 263 tests passed; `tsc --noEmit` passed. Vitest emitted its existing `configLoader: 'native'` warning for `vitest.config.ts`; the command exited successfully.
- `pnpm exec convex codegen --typecheck enable` — passed; the CLI reported `Uploading functions to Convex` and generated bindings without changing generated content.
- Generated hash stability around codegen: `api.d.ts` `afb07e2557b4e0293c32bb3f02227af0af29d3b07389d8e037d1968b362b3e49` before and after; `dataModel.d.ts` `9a8b61204ae45f57599118e070485b5a11ad2329ea7304259e0d63303c0f15f1` before and after; both stable.
- `git diff --check` — passed after the correction.
- Runtime boundary: `N/A — active Convex dev was preserved as required; no runtime command, deployment, process stop, or mutation was performed.`

### Accounting and rollback

- WU3a query/tests: approximately 319 authored changed lines (`76` endpoint plus `243` focused-test lines), below 400; generated API accounting remains separate.
- WU3b consumer/generated/task/evidence: approximately 152 authored changed lines, below 400; no exception. The correction's generated API content remained hash-stable and source-derived rather than hand-edited.
- Correction files changed: `contract-tests/resource-admin-consumer.ts`, `openspec/changes/resource-master-administration/design.md`, `openspec/changes/resource-master-administration/tasks.md`, and this progress artifact. Existing WU3a changes in other paths were preserved untouched.
- Rollback boundary: revert only the direct-hook consumer fixture correction and WU3a/WU3b naming/evidence metadata; do not revert the native Resource query/tests, alter generated declarations, or delete Resource data.

### Current remaining work — exact unchecked task lines

The persisted `tasks.md` artifact was re-read after checkbox updates. WU3a and WU3b implementation rows are visibly `[x]`; WU4, WU5, WU6, WU7, WU8, WU9, and the two parent-owned lifecycle rows remain unchecked. Their exact current lines are retained in `tasks.md`; the next unit is WU4 and depends on both WU3a and WU3b.

## WU4 Apply Evidence — native paginated full-text Resource search

- Consumed authoritative status: `openspec`, `resource-master-administration`, `applyState: ready`, `dependencies.apply: ready`, `nextRecommended: apply`, all required planning artifacts present, no blocked reasons. Action context was repo-local at `/home/garfex/PROGRAMACION/sistema-garfex`, with that workspace as the allowed edit root and no warning.
- Workload gate: `Decision needed before apply: No`; chained delivery is `Yes`, `stacked-to-main`, with high aggregate risk but low current-unit risk; no exception used. Only WU4 was applied.
- Native attempt ordinal 10 continued with token `sha256:f92e9350b1aa2e23e60959472cdeb5ad051c640c6690699af3f283280e27d2df`. Runtime settlement recorded the active-dev port guard as failed; no process was stopped or mutated.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU4 RED | `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/lib/recursoResumen.test.ts` | convex-test + unit | 23 passed | Missing normalization/search export failed | N/A | N/A | N/A |
| WU4 GREEN | same | convex-test + unit | 23 passed | Tests were written first | 49 focused tests passed | N/A | N/A |
| WU4 TRIANGULATE | same | convex-test + unit | 49 passed | N/A | N/A | 18 filter combinations, NFC/trim/whitespace/blank cases, native sizes 1/2/3, repeated relevance traversal, metadata, no values, generated reference, and no-fallback proofs passed | N/A |
| WU4 REFACTOR | same | convex-test + unit | 49 passed | N/A | N/A | N/A | Shared native page projection extracted; 49/49 remained green |

### Implementation and verification

- `buscarRecursosResumen` uses native `paginationOptsValidator`, `paginationResultValidator(resourceSummaryValidator)`, one normalized `q.search("nombre", searchText)`, only `tipoRecursoId`/`activo`/`adminScopeKey` equality filters, native relevance order, and one endpoint `.paginate(args.paginationOpts)`.
- Normalization is NFC, trim, and collapsed whitespace. Blank normalized input raises validated `ADMIN_INVALID_ARGUMENT` on `searchText`. Projection is value-free and preserves native pagination metadata.
- No Unit argument, custom cursor/token/version layer, cache, accumulator, `.collect()`, post-search filter, or fallback sort was added.
- Focused: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoResumen.test.ts` — 2 files, 49 tests passed.
- Full: `pnpm exec vitest run` — 34 files, 289 tests passed; only the existing Vitest native-config warning was emitted.
- Typechecks: `pnpm typecheck` and `pnpm typecheck:consumer` passed.
- Codegen: `pnpm exec convex codegen --typecheck enable` passed twice. Generated `api.d.ts` and `dataModel.d.ts` hashes were stable; generated API diff is 41 additions, tracked separately.
- `git diff --check` passed. Runtime: `pnpm exec convex dev --once` exited because the active local backend occupied port 3210; the active dev process was preserved and no successful runtime evidence is claimed.

### Files, accounting, and rollback

- Changed allowed surfaces: `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/lib/recursoResumen.ts`, `convex/catalogoAdmin/lib/recursoResumen.test.ts`, generated `convex/_generated/api.d.ts`, `openspec/changes/resource-master-administration/tasks.md`, and this progress artifact.
- Exact WU4 diff against the attempt begin tree before this evidence append was 171 authored additions/deletions excluding generated declarations: 12 test, 4 helper, 101 integration-test, 46 endpoint, and 8 task-checkbox lines. Generated diff was 41 additions. The evidence append adds 57 authored lines, for 228 authored additions/deletions in the current worktree; all remain below the 390-line native attempt bound and 400-line authored review budget.
- Rollback boundary: remove only WU4 search/normalization/projection code, focused tests, generated API regeneration after source removal, and WU4 task/evidence metadata; preserve WU3 list behavior, legacy APIs, schema/data, and active dev.

### Remaining work — exact current unchecked task lines

- [ ] **RED** — Add failing cases for missing `null`, active/inactive/inert/broken detail, 0/1/200/201 values, exactly one `porRecurso` bounded load, no truncation, and centralized `MAX_RESOURCE_VALUES`; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Register direct detail using the completed WU2a projector/loader and sole shared limit constant; preserve legacy detail; estimate 60 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify nullable references, exact load count, final error data at the limit, and no summary dependency on the loader; full verification and runtime-or-N/A; estimate 20 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep one named bounded loader and one authoritative limit definition; rollback removes detail export/integration only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add create tests for effective catalog, organization, values/limit, scoped active/inactive duplicates, aliases, and final Resource/value/alias state after every failure and concurrent-equivalent outcome; do not test custom rollback/retry machinery; estimate 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement one thin mutation that validates, derives identity, performs bounded duplicate/alias reads, and writes Resource revision 1, values, scope key, and alias atomically; rely on Convex rollback/OCC; estimate 95 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Prove global/organization scope, inactive duplicate reservation, alias/value failure final state, at-most-one concurrent identity, no publication changes, and legacy create compatibility; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep persistence helpers bounded and business-focused; add no lock, coordinator, compensation, cache, or retry protocol; rollback removes admin create only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add tests for missing/stale-first behavior, valid no-op, mutable fields, immutable classification/ownership/identity/lifecycle, current ineffective catalog, inactive duplicates, alias preservation, and final aggregate state after each failure; estimate 45 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement revision-first candidate construction/validation, no-op after validation, bounded identity check, atomic value replacement and one revision patch; import the shared value limit and rely on Convex transaction rollback; estimate 115 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify stale beats no-op/business validation, invalid equal candidate is not unchanged, organization identity cannot drift, material revision increments once, and every failed final state equals the prior aggregate; full verification and runtime-or-N/A; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize candidate equality/immutable reporting without adding transaction choreography or retry coupling; rollback removes admin update only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add lifecycle tests for missing/stale/current same-state, exactly-one revision increment, activation against effective/inert/invalid state, deactivation preservation, blocker visibility, and final state after failures; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement thin activate/deactivate mutations with revision-first handling; activation validates bounded current aggregate and identity, deactivation patches only state/revision; rely on native atomicity/OCC; estimate 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify current versus stale same-state, failed activation remains unchanged, values/aliases/catalog/publication remain preserved, and blockers observe active state; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse revision/effective-validation seams and remove any transaction/cache/retry abstraction; rollback removes lifecycle exports only; estimate 10 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add a consumer fixture using generated references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, direct `usePaginatedQuery` list/search calls, native results/status/load-more, detail, seven functions, dispositions, and `AdminErrorData`; assert no Unit/token/DTO/adapter/cache; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required package exposure and regenerate through Convex codegen; make the fixture compile without backend imports, manual DTOs, page adapters, or duplicated validation; estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck every native query/mutation shape, run full legacy Resource regressions, verify generated declarations match source, and confirm existing catalog-admin pagination was not changed; full verification and runtime-or-N/A; estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep exports limited to generated Convex/API/data-model/error contracts and concise consumer documentation; rollback removes fixture/export/docs after API exports; estimate 15 authored lines. <!-- sdd-owner: implementation -->
- [ ] After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in `apply-progress.md`; rollback is evidence-only. <!-- sdd-owner: parent -->
- [ ] After verification, confirm all 56 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3a/WU3b, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->

## WU5 Apply Evidence — `resource-admin-wu5`

### Structured status consumed

- Native status was authoritative OpenSpec status for `resource-master-administration`: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, all required artifacts present, and no blocked reasons.
- Action context was `repo-local` with workspace `/home/garfex/PROGRAMACION/sistema-garfex` and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; no edit-root warning was present.
- Workload gate was `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, and `400-line budget risk: High`; the parent assigned only WU5 under `auto-chain`. Authored WU5 scope was 189 changed lines, below 400; no split was needed.
- Ownership validation found zero malformed markers. Only WU5 implementation rows were selected and checked; WU6 onward and both parent rows remain deferred.
- Native attempt authority reported active parent token `sha256:0a08fe2a665fb1f55541a41c6f61884dbd713bd66bd69e1f558e4a653276c0c2`. This executor did not acquire a competing attempt or settle it.
- Parent settlement must preserve this exact obligation: `sha256:20b6ff8ed2d33b6d74208f12972818ca91d29e5864155161c7579db2b90410fc` requires remediation with distinct current verification evidence. No alternate evidence revision was invented.

### Scope and TDD evidence

- WU5 only. No WU6 mutation, branch, stage, commit, custom persistence, custom pagination, or active Convex development shutdown was started.
- Safety net: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — 3 files, 44 tests passed before edits.
- RED: detail integration and bounded-loader tests were added first; `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts` — 49 tests, 7 expected failures and 42 existing tests passed because the admin detail export did not yet exist.
- GREEN: registered the direct detail query, reused summary/detail projection, `cargarAgregado`, nullable references, and `loadResourceValuesBounded`; focused suite reached 49/49 passing.
- TRIANGULATE: added organization ownership, inactive/inert/broken references, 0/1/200 and 201 cardinalities, structured limit failure assertions, and a one-query helper harness; `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts` — 2 files, 52 tests passed.
- REFACTOR: generalized typed catalog reference projection after codegen exposed the Unit-reference union mismatch; the same focused suite remained 52/52 passing.

### Implementation and accounting

- Detail performs direct `ctx.db.get(recursoId)` and returns `null` when absent. Found details include stored fields, nullable Class/Family/Type/Unit/organization references, hierarchy and aggregate diagnostics, and stored values.
- The sole value access is `loadResourceValuesBounded`, using `valoresAtributoRecurso.porRecurso` and exactly `.take(MAX_RESOURCE_VALUES + 1)`. Counts 0, 1, and 200 are returned; 201 throws validated `ADMIN_INVALID_STATE` with `RESOURCE_VALUE_LIMIT_EXCEEDED` context and no truncated detail.
- Summary/list/search remains value-free; legacy `convex/catalogoRecursos/recursos.ts` detail behavior remains unchanged and passed regression coverage.
- Verified WU5 accounting: 189 authored code/test changed lines, 207 generated declaration lines, 19 task-artifact lines, and 86 apply-evidence lines after evidence corrections, for 501 total changed lines in the staged candidate. The reviewable WU5 product/test slice remains 189 authored lines; the authored code/test diff was 186 additions + 3 deletions across `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/recursos.test.ts`, and `convex/catalogoAdmin/lib/recursoDetalle.test.ts`. Generated output is tracked separately and produced only by Convex CLI.
- Files changed: `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/lib/recursoDetalle.test.ts`, `convex/_generated/api.d.ts`, `openspec/changes/resource-master-administration/tasks.md`, and this progress artifact.
- Rollback boundary: remove only the WU5 admin detail export/integration and WU5 tests; retain shared contracts/loader and never delete stored Resource, value, alias, catalog, publication, or snapshot data.

### Verification evidence

| Check | Result |
|---|---|
| Focused WU5 implementation suite | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts` — 2 files, 52 tests passed |
| Focused WU5/legacy/helper/validator tests | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoAdmin/lib/recursoDetalle.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — 4 files, 92 tests passed |
| Full Vitest | `pnpm exec vitest run` — 34 files, 299 tests passed |
| Backend typecheck | `pnpm typecheck` — `tsc --noEmit` passed |
| Consumer typecheck | `pnpm typecheck:consumer` — passed |
| Convex codegen/typecheck | `pnpm exec convex codegen --typecheck enable` — passed |
| Parent disposition | `convex codegen --typecheck enable` printing `Uploading functions to Convex...` under the already-running attached dev process is established native Convex CLI behavior observed repeatedly; repository hashes/status remained stable, no custom deploy or process stop occurred, and this is not a WU5 blocker |
| Generated hash stability | repeated codegen kept generated hashes stable; `convex/_generated/api.d.ts` SHA-256 remained `2b40408ba17d997bea7f17fa3db47ffea833a7aaf7b87af4edc659535c1dd8b5` |
| Diff validation | `git diff --check` — passed |
| Active-dev-compatible runtime boundary | `pnpm exec convex dev --once` returned `A local backend is still running on port 3210`; active development was not stopped or mutated |

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU5 RED | `convex/catalogoAdmin/recursos.test.ts` | Integration via convex-test | ✅ 44/44 | ✅ 7 expected failures / 42 pass | ✅ 49/49 | ✅ 52/52 with boundaries and references | ✅ 52/52 |
| WU5 GREEN | `convex/catalogoAdmin/recursos.ts` | Integration via convex-test | ✅ 44/44 | ✅ Missing export failure | ✅ Detail query passed | ✅ Limit/reference cases passed | ✅ Typed reference fix passed |
| WU5 TRIANGULATE | `convex/catalogoAdmin/lib/recursoDetalle.test.ts` | Unit plus bounded query harness | ✅ 1 existing test | ✅ Access test written | ✅ Focused suite passed | ✅ Query/index/take counts asserted | ✅ Focused suite passed |
| WU5 REFACTOR | `convex/catalogoAdmin/recursos.ts` | Typecheck and integration | ✅ 52/52 | ✅ Existing behavior captured | ✅ Codegen passed after fix | ✅ Legacy/full suites passed | ✅ Clean |

### Remaining work

The exact unchecked implementation and parent-owned task lines are retained below; no WU6 work was started:

- [ ] **RED** — Add create tests for effective catalog, organization, values/limit, scoped active/inactive duplicates, aliases, and final Resource/value/alias state after every failure and concurrent-equivalent outcome; do not test custom rollback/retry machinery; estimate 40 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement one thin mutation that validates, derives identity, performs bounded duplicate/alias reads, and writes Resource revision 1, values, scope key, and alias atomically; rely on Convex rollback/OCC; estimate 95 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Prove global/organization scope, inactive duplicate reservation, alias atomicity, concurrent-equivalent duplicate behavior, validation-before-write, injected value-write rollback, no publication/catalog-revision/snapshot mutation, structured contexts, and legacy create compatibility; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep persistence helpers bounded and business-focused; add no lock, coordinator, compensation, cache, or retry protocol; rollback removes admin create only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add tests for missing/stale-first behavior, valid no-op, mutable fields, immutable classification/ownership/identity/lifecycle, current ineffective catalog, inactive duplicates, alias preservation, and final aggregate state after each failure; estimate 45 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement revision-first candidate construction/validation, no-op after validation, bounded identity check, atomic value replacement and one revision patch; import the shared value limit and rely on Convex transaction rollback; estimate 115 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify stale beats no-op/business validation, invalid equal candidate is not unchanged, organization identity cannot drift, material revision increments once, and every failed final state equals the prior aggregate; full verification and runtime-or-N/A; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize candidate equality/immutable reporting without adding transaction choreography or retry coupling; rollback removes admin update only; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add lifecycle tests for missing/stale/current same-state, exactly-one revision increment, activation against effective/inert/invalid state, deactivation preservation, blocker visibility, and final state after failures; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement thin activate/deactivate mutations with revision-first handling; activation validates bounded current aggregate and identity, deactivation patches only state/revision; rely on native atomicity/OCC; estimate 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify current versus stale same-state, failed activation remains unchanged, values/aliases/catalog/publication remain preserved, and blockers observe active state; full verification and runtime-or-N/A; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse revision/effective-validation seams and remove any transaction/cache/retry abstraction; rollback removes lifecycle exports only; estimate 10 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add a consumer fixture using generated references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, direct `usePaginatedQuery` list/search calls, native results/status/load-more, detail, seven functions, dispositions, and `AdminErrorData`; assert no Unit/token/DTO/adapter/cache; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required package exposure and regenerate through Convex codegen; make the fixture compile without backend imports, manual DTOs, page adapters, or duplicated validation; estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck every native query/mutation shape, run full legacy Resource regressions, verify generated declarations match source, and confirm existing catalog-admin pagination was not changed; full verification and runtime-or-N/A; estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep exports limited to generated Convex/API/data-model/error contracts and concise consumer documentation; rollback removes fixture/export/docs after API exports; estimate 15 authored lines. <!-- sdd-owner: implementation -->
- [ ] After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in `apply-progress.md`; rollback is evidence-only. <!-- sdd-owner: parent -->
- [ ] After verification, confirm all 56 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3a/WU3b, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->

## WU6 Apply Evidence — corrected and split into WU6a/WU6b

### Structured status consumed and produced

- Consumed native `gentle-ai.sdd-status` v2 for `resource-master-administration`: authoritative `openspec`, `applyState: ready`, `nextRecommended: apply`, proposal/specs/design/tasks/apply-progress present, verify report missing, and no blocked reasons.
- Action context was `repo-local` at `/home/garfex/PROGRAMACION/sistema-garfex`, with the workspace as the allowed edit root; no edit-root warning was present.
- Workload guard was explicitly `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, and `400-line budget risk: High`. The verifier-recommended split is the resolved delivery path: WU6a contains the base implementation, first dedicated scenarios, and 37 generated lines; WU6b contains the one-line global-scope fix, remaining dedicated boundary tests, and final documentation. Each slice stays below 400 changed lines with no exception. WU7 was not started.
- Continued the active native attempt with token `sha256:d53e0b32f37a0ea8445d179233cd4337e4d29d3303d55542a454637a71de575a`; no second attempt or runtime start was used.
- Produced state: WU6a and WU6b implementation rows are checked; WU7 is next. The authoritative task artifact has 56 implementation rows = 44 checked + 12 unchecked, 2 parent rows unchecked, and 58 total rows. Verify remains parent-gated.

### WU6a — thin mutation and base validation

- RED evidence was the focused create surface before the scope correction: the new create scenarios exposed the missing/incorrect administrative create behavior; no custom rollback or retry behavior was introduced.
- GREEN evidence is covered by the create mutation, bounded administrative validator/identity seam, and persistence helper. The mutation derives identity, writes inactive revision-one Resources, persists supplied values, writes organization aliases, and relies on native Convex atomicity/OCC.
- TRIANGULATE evidence includes accepted 0/200 and rejected 201 value boundaries, effective hierarchy and active Unit validation, successful non-empty value persistence, active/inactive organization validation, structured failures, and legacy Resource regression coverage.
- REFACTOR evidence is the thin helper boundary: no lock, retry protocol, coordinator, compensation, cache, publication mutation, or legacy API change.

### WU6b — scope correction and failure boundaries

- RED focused command: `pnpm exec vitest run convex/catalogoAdmin/lib/recursoPersistencia.test.ts` — 9 tests executed, with 2 expected failures proving that an organization-owned duplicate incorrectly blocked global creation before the correction.
- GREEN/TRIANGULATE focused command: `pnpm exec vitest run convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoAdmin/recursos.test.ts` — 2 files, 59 tests passed. Dedicated coverage proves global lookup matches only `organizacionId === undefined`, organization lookup is exact, inactive duplicates reserve each scope, cross-scope creates are allowed, aliases collide exactly, and final Resource/value/alias state is unchanged after boundary failures.
- Failure-boundary evidence includes natural alias collision plus deliberately injected alias/value-write failures through the persistence helper; both leave the complete final aggregate unchanged. Equivalent concurrent creates produced one committed identity and one structured duplicate failure. Publication revisions and type snapshots remained empty.
- Focused final commands: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts` — 1 file, 50 tests passed; `pnpm exec vitest run convex/catalogoAdmin/lib/recursoPersistencia.test.ts` — 1 file, 9 tests passed.

### Verification and accounting

- Full suite: `pnpm exec vitest run` — 35 files, 308 tests passed.
- Typechecks: `pnpm typecheck` passed; `pnpm typecheck:consumer` passed.
- Generated stability: no codegen was rerun for this correction. Prior codegen under active development emitted native CLI download/upload messages; `convex/_generated/api.d.ts` SHA-256 was `e23977e4b7ed5121437f90e546f6d0496eda8c4f8901cd61f618a2e4c075a3bc` on both prior runs, and repository hashes/status stayed stable. The generated declaration adds only the create reference and is excluded from authored line budgets.
- Diff checks: `git diff --check` passed. No branch, stage, commit, or active Convex development process was stopped. These observations do not prove remote runtime non-mutation, and no such claim is made.
- Final authored intended review boundaries: WU6a approximately 260 changed lines and WU6b approximately 270 changed lines, each below 400; generated declarations remain separate. The direct rollback boundary for WU6a removes base create/validation/persistence behavior; WU6b removes only the scope correction and dedicated boundary tests. Neither rollback deletes stored Resource, value, alias, catalog, publication, or snapshot data.

### Files and remaining work

- Product/test surfaces: `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/lib/recursoPersistencia.ts`, `convex/catalogoAdmin/lib/recursoPersistencia.test.ts`, and the shared administrative validation seam in `convex/catalogoRecursos/validacionRecurso.ts`.
- Generated surface: `convex/_generated/api.d.ts`, regenerated only through the Convex CLI.
- Planning evidence: `openspec/changes/resource-master-administration/design.md`, `tasks.md`, and this `apply-progress.md`; the old WU6 block is represented historically as checked WU6a and WU6b, with WU7 depending on both.
- Remaining implementation tasks are WU7, WU8, and WU9. Exact unchecked implementation rows are the four WU7 rows, four WU8 rows, and four WU9 rows in `tasks.md`; both parent-owned lifecycle gates remain deferred and byte-for-byte preserved.

### TDD Cycle Evidence

| Slice | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| WU6a | Create scenarios established the missing admin-create behavior before implementation | Thin mutation, validator/identity seam, persistence, values, aliases, and revision-one inactive write passed focused coverage | 0/200/201, effective references, organizations, values, aliases, structured errors, and legacy regressions passed | Native atomicity/OCC retained; no transaction machinery added |
| WU6b | Dedicated scope test failed 2/9 on organization rows blocking global creates | Undefined-organization equality lookup corrected; dedicated plus integration focused suites passed 59/59 | Scope matrix, inactive reservation, alias/value final-state rollback, concurrency, publication non-mutation, and legacy compatibility passed | Documentation and intended review split corrected; generated hash and diff checks passed |

### Parent lifecycle handoff

Parent must perform review/verification lifecycle actions. This executor did not start bounded review, create or approve receipts, validate delivery gates, stop the active Convex dev process, or run a runtime deployment harness. Next recommended action is `parent-lifecycle` for review and then WU7 apply.

## WU6a/WU6b gate-finding correction evidence

### Structured status and scope

- Consumed authoritative native status for `resource-master-administration`: `artifactStore: openspec`, `applyState: ready`, `dependencies.apply: ready`, `nextRecommended: apply`, all required apply artifacts present, and no blocked reasons.
- Action context was `repo-local` at `/home/garfex/PROGRAMACION/sistema-garfex`; the user-authorized edit surfaces were limited to `convex/catalogoAdmin/lib/recursoPersistencia.test.ts` and the three OpenSpec evidence/design/task files. No target was outside the authoritative workspace.
- Workload gate was resolved by the verifier-recommended stacked split: WU6a base implementation + first dedicated scenarios + 37 generated lines; WU6b one-line global-scope fix + remaining dedicated boundary tests + final documentation. Both slices stay below 400 changed lines; no exception was used. WU7 was not started.
- Ownership count from the persisted task artifact: 56 implementation rows = 44 checked + 12 unchecked; 2 parent rows unchecked; 58 total. No task checkbox changed in this correction; WU6a/WU6b remain checked and WU7–WU9 remain deferred. Parent-owned checkbox rows were preserved byte-for-byte.

### Exact dedicated-test assertions added

In `convex/catalogoAdmin/lib/recursoPersistencia.test.ts`, the existing first scenario now reads the created organization-owned Resource and asserts:

```ts
expect(persistedResource).not.toBeNull();
expect(persistedResource?.activo).toBe(false);
expect(persistedResource?.revision).toBe(1);
expect(persistedResource?.organizacionId).toBe(fixture.organization);
expect(persistedResource?.identificadorTecnico).toBe("v1|CLASS|FAMILY|TYPE|");
expect(await t.run(async (ctx) => ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", result.item.id)).collect())).toEqual([
  expect.objectContaining({
    organizacionId: fixture.organization,
    recursoId: result.item.id,
    version: 1,
    clave: "v1|CLASS|FAMILY|TYPE|",
  }),
]);
```

The dedicated suite remains nine scenarios; no scenario was added.

### TDD and verification evidence

| Phase | Evidence |
|---|---|
| RED | Temporarily inverted the new `activo` expectation; dedicated Vitest failed 1/9 with received `false` versus expected `true`, then the assertion was corrected. No production code was edited. |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/lib/recursoPersistencia.test.ts` — 1 file, 9 tests passed. |
| TRIANGULATE | `pnpm exec vitest run convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoAdmin/recursos.test.ts` — 2 files, 59 tests passed; `pnpm exec vitest run` — 35 files, 308 tests passed. |
| REFACTOR | `pnpm typecheck` passed; `pnpm typecheck:consumer` passed; `git diff --check` passed. Counts, review split, runtime wording, and file accounting were reconciled without codegen rerun. |

### Runtime and generated-output wording

Prior codegen under active development emitted native CLI download/upload messages. Repository hashes/status stayed stable and no process was stopped. Prior generated hash evidence remains sufficient; codegen was not run again. These observations do not prove remote runtime non-mutation, so no such claim is made.

### Final file accounting and parent staging boundary

- Correction surfaces: `convex/catalogoAdmin/lib/recursoPersistencia.test.ts` (14 added assertion lines; nine scenarios preserved), `design.md`, `tasks.md`, and `apply-progress.md` (documentation/evidence reconciliation). No runtime/product source, generated declaration, branch, stage, or commit was changed by this correction.
- Current worktree accounting against `HEAD` for the three tracked OpenSpec files is `apply-progress.md +106/-5`, `design.md +30/-11`, and `tasks.md +28/-13`; this includes preserved historical evidence already present in the worktree. The dedicated test is untracked at 227 total lines, with the correction hunk limited to the assertion block above.
- Recommended parent staging hunk boundary: `convex/catalogoAdmin/lib/recursoPersistencia.test.ts`, immediately after `expect(result.item.nombre).toBe("With value");` and before the existing `valoresAtributoRecurso` assertion.
- Rollback boundary: remove only the added dedicated assertions and the WU6a/WU6b documentation/evidence reconciliation; do not alter product behavior, generated files, parent lifecycle state, or stored data.

## WU7 Apply Evidence — `sdd-apply-wu7`

### Structured status consumed

- Native status was authoritative OpenSpec status for `resource-master-administration`: `applyState: ready`, `nextRecommended: apply`, proposal/specs/design/tasks/apply-progress present, `artifactStore: openspec`, and no blocked reasons.
- Action context was `repo-local` with workspace `/home/garfex/PROGRAMACION/sistema-garfex` and that workspace as the allowed edit root.
- The active native attempt was continued with token `sha256:ec3115027bb82f832bf1c8a59af3210283001af95261051f8d1ce57bd9ebe582`; no second attempt was acquired.
- Workload gate was consumed from `tasks.md`: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, and `400-line budget risk: High` across the stack but low for WU7. WU7 remained the only implementation slice applied; authored review accounting is below 400 lines and no size exception was used.
- Skill resolution: `paths-injected`; all five parent-injected skill paths were read before implementation.

### Completed WU7 tasks and persisted checkbox updates

- WU7 RED, GREEN, TRIANGULATE, and REFACTOR rows were marked `[x]` in `openspec/changes/resource-master-administration/tasks.md` immediately after completion.
- RED added missing/stale-first, normalized no-op, invalid-equal, immutable, identity, duplicate, value-bound, alias, and final-state tests.
- GREEN added the thin `actualizarRecurso` mutation, revision-first checks, complete candidate validation, bounded identity lookup, atomic replacement helper, and one Resource revision patch.
- TRIANGULATE covered stale precedence, mutable changes, global identity changes, organization identity drift, inactive duplicate reservation, aliases, 0/200/201 value boundaries, replacement rollback, no partial state, and revision increments.
- REFACTOR kept candidate equality and aggregate validation in small seams without locks, retries, compensating writes, caches, coordinators, or publication writes.

### TDD Cycle Evidence

| Cycle | Evidence |
|---|---|
| RED | `pnpm typecheck` failed because the generated admin API did not yet expose `actualizarRecurso`; the focused test suite also recorded the missing surface before implementation. |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts` passed after implementation and generated API exposure; focused WU7 tests passed. |
| TRIANGULATE | Four-file focused suite passed with 135 tests, including final Resource/value/alias snapshots after failures and native transaction rollback. |
| REFACTOR | Full suite and both typechecks passed after consolidating validators/imports and isolating the update/value-replacement seams. |

### Verification and accounting

- Focused command: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoRecursos/recursos.test.ts` — 4 files, 135 tests passed.
- Full command: `pnpm exec vitest run` — 35 files, 317 tests passed.
- Typechecks: `pnpm typecheck` passed; `pnpm typecheck:consumer` passed.
- Generated verification: `pnpm exec convex codegen --typecheck enable` passed. `convex/_generated/api.d.ts` changed by CLI only, with 39 generated additions; hash remained stable across the post-codegen check (`5a084a82d712f39ce0fab033ec4e270d46f8521ab6c5baad3f5d54ab82d14c62`).
- Diff verification: `git diff --check` passed.
- Authored WU7 diff accounting: 276 additions plus 7 deletions across the update mutation, persistence helper, and tests; generated declaration accounting is separate and excluded. The authored review unit is below 400 lines.
- Runtime boundary: no `convex dev --once` or active development stop was run; no runtime evidence is claimed. Codegen was run as explicitly requested and did not mutate Resource data.
- Changed allowed surfaces: `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/lib/recursoPersistencia.ts`, `convex/catalogoAdmin/lib/recursoPersistencia.test.ts`, `convex/_generated/api.d.ts`, and this apply-progress/task metadata.
- Rollback boundary: remove the WU7 admin update export, replacement helper, generated API output through normal codegen after reverting the source export, and WU7 tests; preserve all Resource, value, alias, catalog, publication, and legacy data/contracts.
- Minor test-harness adjustment: bounded the existing search source assertion at the search endpoint so it does not inspect later WU7 mutation code; no product behavior changed.

### Remaining work

WU8, WU9, and both parent-owned lifecycle gates remain unchecked and deferred to the parent lifecycle. Exact unchecked task lines currently remaining in `tasks.md` are:

- [ ] **RED** — Add lifecycle tests for missing/stale/current same-state, exactly-one revision increment, activation against effective/inert/invalid state, deactivation preservation, blocker visibility, and final state after failures; estimate 35 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement thin activate/deactivate mutations with revision-first handling; activation validates bounded current aggregate and identity, deactivation patches only state/revision; rely on native atomicity/OCC; estimate 75 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify current versus stale same-state, failed activation remains unchanged, values/aliases/catalog/publication remain preserved, and blockers observe active state; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse revision/effective-validation seams and remove any transaction/cache/retry abstraction; estimate 10 lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add a consumer fixture using generated references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, direct `usePaginatedQuery` list/search calls, native results/status/load-more, detail, seven functions, dispositions, and `AdminErrorData`; assert no Unit/token/DTO/adapter/cache; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required package exposure and regenerate through Convex codegen; make the fixture compile without backend imports, manual DTOs, page adapters, or duplicated validation; estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Run complete legacy Resource suite and generated contract fixture; narrow `AdminErrorData` by discriminant, typecheck every new function/result/page/detail/ID, verify no excluded operation is exported, confirm generated declarations match source, and record rollout order plus runtime evidence; estimate 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep exports limited to generated Convex/API/data-model/error contracts and concise consumer documentation; rollback removes fixture/export/docs after API exports; estimate 15 authored lines. <!-- sdd-owner: implementation -->
- [ ] After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in `apply-progress.md`; rollback is evidence-only. <!-- sdd-owner: parent -->
- [ ] After verification, confirm all 56 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3a/WU3b, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->

Next recommended action: `parent-lifecycle`. `sdd-apply` does not start review, refutation, correction, validation, or delivery actors and does not create or approve receipts.

## WU7 correction and split evidence — `sdd-apply-wu7a-wu7b`

### Structured status consumed and produced

- Consumed authoritative OpenSpec status for `resource-master-administration`: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, all proposal/spec/design/tasks/apply-progress artifacts present, `verifyReport` missing, and no blocked reasons.
- Action context was `repo-local` at `/home/garfex/PROGRAMACION/sistema-garfex`; the workspace itself was the allowed edit root. CodeGraph MCP was unavailable; after confirming the existing `.codegraph/` directory, read-only filesystem inspection was used as the documented fallback.
- Continued the parent-held native attempt with token `sha256:d54388ae374c1b30c92ca84615aa8c0d9c7780cf4bf996df83e341ac638d5ab2`; no second attempt, branch, stage, commit, runtime stop, or delivery actor was started. Final staged numstat exactly remained `39/0 convex/_generated/api.d.ts`, `12/1 recursoPersistencia.test.ts`, `19/1 recursoPersistencia.ts`, `125/1 recursos.test.ts`, `120/4 recursos.ts`, `57/0 apply-progress.md`, and `4/4 tasks.md`.
- The workload gate was resolved by the parent delivery path: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, and `400-line budget risk: High` for the stack but no per-slice exception. The work was split into WU7a and WU7b, both below 400 authored changed lines by the intended hunk boundaries.
- Persisted task status now records WU7a, WU7b, and WU8 as checked implementation slices; WU9 remains unchecked. Native status after the update reports 62 total rows, 56 complete, 6 pending, and `nextRecommended: apply` because parent gates remain.

### WU7a — revision-first update/base replacement

- Completed the thin `actualizarRecurso` mutation and `reemplazarValoresRecurso` helper. Revision is checked immediately after the direct Resource load and before no-op or business work; candidate validation precedes normalized equality; successful material updates delete/insert the bounded value set and patch the Resource exactly once with revision + 1.
- Tests cover missing Resource, stale-first behavior, normalized no-op, mutable replacement, invalid values, exact 0/200/201 value bounds, exact persisted value candidate, and native rollback of a failed replacement. Resource/value/alias snapshots are used for failed commands.
- Intended parent commit boundary: `convex/catalogoAdmin/recursos.ts` from `resourceValuesEqual` through the `actualizarRecurso` export, excluding the exact echo-argument/check hunk; `convex/catalogoAdmin/lib/recursoPersistencia.ts` import plus `reemplazarValoresRecurso`; `convex/catalogoAdmin/recursos.test.ts` existing WU7 fixture/update tests through the 0/200/201 test; `convex/catalogoAdmin/lib/recursoPersistencia.test.ts` replacement test; `convex/_generated/api.d.ts` generated update reference. Hunk anchors are `resourceValuesEqual`, `export const actualizarRecurso`, `reemplazarValoresRecurso`, and `actualizarRecurso / WU7`.
- WU7a authored count: 348 changed lines (337 additions + 11 deletions) in the staged implementation/base-replacement commit; generated declarations are separate (39 additions in `convex/_generated/api.d.ts`). This is below the 400-line budget.

### WU7b — immutable/order/final-state boundaries

- Added optional immutable echoes only where required: `activo` and `identificadorTecnico`; existing Type, resolved Class/Family, and ownership/scope arguments remain optional echoes. Matching echoes pass; changed echoes return validated `ADMIN_IMMUTABLE_FIELD`. Lifecycle and technical identity remain server-owned and no organization alias is rewritten.
- Corrected `convex/catalogoAdmin/recursos.test.ts` with bounded `valueSet`, catalog revision/snapshot snapshot helpers, and immutable-error helpers. Added exact mutable Unit persistence, exact 0/200/201 value sets, individual Class/Family/organization stale echoes, complete Resource/value/alias failure snapshots for inactive Unit and ineffective catalog, unchanged catalog revision/snapshot publication state across success/failure, and exact immutable `ADMIN_IMMUTABLE_FIELD` context assertions (the contract supplies only `entity` and `field`, with no `current`/`attempted` keys).
- Intended parent commit boundary: the echo argument/check hunk in `convex/catalogoAdmin/recursos.ts` anchored at `// Echoes are immutable read-back guards`; new boundary tests in `convex/catalogoAdmin/recursos.test.ts` anchored at `accepts matching immutable echoes`; task/design/progress split reconciliation. WU8 task dependency is the `WU7a and WU7b` line.
- WU7b authored count: 330 changed lines (292 additions + 38 deletions) in the unstaged echo/boundary/documentation commit; generated output is separate (2 additions in `convex/_generated/api.d.ts`). This is below the 400-line budget.

### TDD Cycle Evidence

| Slice | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|
| WU7a | Existing WU7 RED evidence recorded the missing generated update reference before implementation; replacement RED was exercised through the failing replacement assertion before the helper was available. | Focused update/replacement tests passed after the thin mutation/helper and generated reference were present. | Exact value sets, stale/no-op ordering, invalid candidate, persisted state, and rollback passed. | Candidate equality and replacement remain isolated without custom transaction machinery. |
| WU7b | New verification assertions were written before the correction evidence run; existing echo/order/final-state coverage remained the safety net. | Focused tests passed with the completed mutation and bounded helpers. | The stale Class/Family/organization matrix, exact value sets, full failure snapshots, and catalog immutability cases passed. | Helpers reduced fixture/assertion repetition without changing production behavior. |

### Verification and final accounting

- Focused: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoAdmin/lib/recursoValidacion.test.ts convex/catalogoRecursos/recursos.test.ts` — 4 files, 142 tests passed.
- Full: `pnpm exec vitest run` — 35 files, 324 tests passed.
- Typechecks: `pnpm typecheck` passed; `pnpm typecheck:consumer` passed.
- Codegen was not rerun per instruction; the prior stable API declaration hash remains `1666115e18721e5922f362655d37cb92fa3a60c20198d5a39afa41a26545acc5`, and generated output remains CLI-owned (41 historical additions in `convex/_generated/api.d.ts`).
- Diff checks: `git diff --check` passed. No runtime harness was run because the user prohibited mutating/stopping active development; no runtime evidence is claimed.
- Parent commit accounting is precise at the current index/worktree boundary: WU7a is 348 authored changed lines (337 additions + 11 deletions) plus 39 generated additions; WU7b is 330 authored changed lines (292 additions + 38 deletions) plus 2 generated additions. Both intended commits are below 400 authored changed lines; counts do not claim that the parent has committed either slice.
- Remaining exact unchecked implementation lines are the four WU9 rows. Parent-owned lifecycle rows remain unchecked and deferred. `next_recommended: parent-lifecycle`; no review, receipt, validation, or delivery action was started.

### Rollback boundaries

- WU7a rollback: remove the admin update export, bounded replacement helper, associated WU7a tests, and the generated update reference through normal codegen; preserve Resource, values, aliases, catalog, publication, snapshots, create/read behavior, and legacy APIs.
- WU7b rollback: remove only the two echo arguments/checks, WU7b boundary tests, and split documentation; retain the WU7a update/base-replacement behavior and all stored data.

## WU8 Apply Evidence — `WU8-thin-resource-lifecycle`

- Consumed current native status for the WU8 gate correction: authoritative OpenSpec, change `resource-master-administration`, `applyState: ready`, `dependencies.apply: ready`, proposal/spec/design/tasks/apply-progress present, `actionContext.mode: repo-local`, workspace `/home/garfex/PROGRAMACION/sistema-garfex`, allowed edit root the repository, and no blocked reasons. The workload forecast was `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, `400-line budget risk: High` for the completed stack but low for pending WU9; WU8 is complete below the 400-line boundary and no exception was used.
- Continued the parent-held native WU8 attempt with token `sha256:97d0fa5d6a85f0ce669bc4545c1c95e733a6295263cf0c7e43b47108c2dc2c8f`; no second attempt, branch, stage, commit, review/receipt actor, runtime stop, or WU9 work was started. CodeGraph CLI was available and its index was current; the MCP proxy was unavailable, so the read-only CLI/filesystem fallback was used after the CodeGraph check.
- RED wrote lifecycle tests before adding the two exports. The focused run initially failed because the exports were absent, then the corrected RED setup exercised the intended missing-export failure without product implementation. GREEN passed the lifecycle suite after the thin mutations and generated references were added. The gate correction adds four direct activation cases: exact `ADMIN_INVALID_STATE` for duplicate stored values, exact organization-owned derived-identity `ADMIN_IMMUTABLE_FIELD`, exact `ADMIN_CONFLICT` for an alias collision, and successful same-identity activation in another organization; failure snapshots cover all Resources, values, aliases, catalog revisions, and publication snapshots.
- Implemented `activarRecurso` and `desactivarRecurso` with the shared revision-first lifecycle seam. Activation returns current same-state `UNCHANGED`, bounded-loads values, validates current hierarchy/Unit/Resource and effective aggregate state, derives identity, checks ownership-scoped Resource and organization-alias conflicts, then patches active state, derived identity, and revision atomically. Deactivation patches only `activo` and revision. No cascade, publication, snapshot, cache, lock, coordinator, compensation, or retry machinery was added.
- Extended `buscarRecursoPorIdentidad` with an optional excluded Resource ID so activation can detect another matching Resource even when the current Resource is the first bounded index result; existing create/update callers remain compatible.

### WU8 focused and boundary evidence

| Phase | Command/result |
|---|---|
| Safety net | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts` — 3 files, 89 tests passed before edits |
| RED | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts` — 4 lifecycle tests failed while `activarRecurso` was not exported; existing 65 tests passed |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts` — 1 file, 69 tests passed |
| TRIANGULATE | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts` — 1 file, 75 tests passed; four direct activation gate cases pass |
| REFACTOR | `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts && pnpm typecheck` — 3 files, 95 tests passed; `tsc --noEmit` passed |
| Persistence/catalog regression | `pnpm exec vitest run convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts` — 3 files, 34 tests passed |
| Full boundary | `pnpm exec vitest run` — 35 files, 334 tests passed; `pnpm typecheck` passed; `pnpm typecheck:consumer` passed; `git diff --check` passed |
| Codegen/hash | Codegen was not rerun per instruction; generated output remains CLI-owned with 44 generated additions in `convex/_generated/api.d.ts` |

### WU8 TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU8 RED | `convex/catalogoAdmin/recursos.test.ts` | Integration-style via Vitest/convex-test | ✅ 89/89 | ✅ Missing-export failure observed | ✅ 69/69 after implementation | ✅ Four lifecycle behaviors plus failure setup | ✅ Boundary passed |
| WU8 GREEN | `convex/catalogoAdmin/recursos.test.ts` | Integration-style via Vitest/convex-test | ✅ 69/69 | ✅ Lifecycle references were absent first | ✅ 69/69 | ✅ Effective/inert/invalid/duplicate and blocker paths | ✅ Boundary passed |
| WU8 TRIANGULATE + gate correction | `convex/catalogoAdmin/recursos.test.ts` | Integration-style via Vitest/convex-test | ✅ 69/69 | ✅ Four direct assertions written first | ✅ 75/75 | ✅ Exact contexts, complete snapshots, and cross-organization success | ✅ Full/type/diff boundary passed without codegen |
| WU8 REFACTOR | `convex/catalogoAdmin/recursos.ts`, `convex/catalogoAdmin/lib/recursoPersistencia.ts` | Integration-style via Vitest/convex-test | ✅ 71/71 | N/A — cleanup only | ✅ 95/95 focused boundary | ✅ Persistence and publication regressions 34/34 | ✅ Historical full/type/consumer/diff boundary passed; no codegen in gate correction |

### WU8 task persistence and accounting

- Persisted `tasks.md` now marks only the four WU8 implementation rows `[x]`; all WU9 and parent-owned rows remain unchanged and deferred. Re-read confirmation: the only unchecked rows are WU9 RED/GREEN/TRIANGULATE/REFACTOR and the two parent lifecycle gates.
- Gate-correction files changed: `convex/catalogoAdmin/recursos.test.ts`, `openspec/changes/resource-master-administration/tasks.md`, and this progress artifact only; prior WU8 production/generated changes were untouched, and no runtime data, consumer fixture, or WU9 surface changed.
- Final authored accounting at the current worktree boundary: product/test **313** lines (`recursos.test.ts` 232 additions; `recursos.ts` 76 additions + 1 deletion; `recursoPersistencia.ts` 2 additions + 2 deletions), task metadata **18** lines (9 additions + 9 deletions), and apply evidence **67** lines (60 additions + 7 deletions), totaling **398 non-generated authored lines**; baseline before the new assertions was 214 + 8 + 53 = **275**, so this correction adds 123. Generated output is separate: `convex/_generated/api.d.ts` **44 additions**. The complete non-generated authored total remains below 400.
- Rollback boundary: remove only `activarRecurso`/`desactivarRecurso`, `validateResourceActivation`, the optional excluded-ID lookup behavior, WU8 lifecycle tests, generated lifecycle references through normal codegen, and WU8 checkbox/evidence metadata; preserve reads, create/update, legacy APIs, all stored Resource/value/alias/catalog/publication/snapshot data, and existing catalog-admin blocker behavior.
- Runtime boundary: no runtime/dev command was started or stopped and no runtime data operation was performed; exact runtime evidence is `N/A — runtime mutation was prohibited and the active development session was left untouched`.

### WU8 remaining work

- WU9 remains pending and was not started. Exact unchecked implementation rows are the four WU9 rows at `tasks.md:168-171`.
- Parent-owned lifecycle gates remain deferred: `After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in apply-progress.md; rollback is evidence-only.` and `After verification, confirm all 60 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3a/WU3b, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance.`
- Next action is `parent-lifecycle`; this executor did not start bounded review, refutation, correction, validation, delivery, or archive gates.

### Exact unchecked task lines after WU8

- [ ] **RED** — Add a consumer fixture using generated references, `FunctionArgs`, `FunctionReturnType`, `Id<"recursos">`, direct `usePaginatedQuery` list/search calls, native results/status/load-more, detail, seven functions, dispositions, and `AdminErrorData`; assert no Unit/token/DTO/adapter/cache; estimate 25 lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add only required package exposure and regenerate through Convex codegen; make the fixture compile without backend imports, manual DTOs, page adapters, or duplicated validation; estimate 40 lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck every native query/mutation shape, run full legacy Resource regressions, verify generated declarations match source, and confirm existing catalog-admin pagination was not changed; full verification and runtime-or-N/A; estimate 30 lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep exports limited to generated Convex/API/data-model/error contracts and concise consumer documentation; rollback removes fixture/export/docs after API exports; estimate 15 lines. <!-- sdd-owner: implementation -->
- [ ] After apply, collect focused/full/runtime evidence, generated-versus-authored accounting, WU2c deployment audit/cleanup result, native list/search traversal, final-state mutation failures, legacy compatibility, and unchanged catalog-admin pagination in `apply-progress.md`; rollback is evidence-only. <!-- sdd-owner: parent -->
- [ ] After verification, confirm all 60 implementation rows have evidence, every pending authored unit remained below 400 lines, generated output is separate, WU2c preceded WU3a/WU3b, no Resource custom pagination/cache/Unit filter exists, and every rollback boundary is actionable; keep this gate unchecked until parent acceptance. <!-- sdd-owner: parent -->
