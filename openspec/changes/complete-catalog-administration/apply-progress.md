# Apply progress — W0

## Status consumed

- `schemaName`: `spec-driven`
- `changeName`: `complete-catalog-administration`
- `artifactStore`: `openspec` (authoritative)
- `applyState`: `ready`
- Planning artifacts: proposal, eight specs, design, and tasks were present and complete.
- `actionContext.mode`: `repo-local`
- `workspaceRoot`: `/home/garfex/PROGRAMACION/sistema-garfex`
- `allowedEditRoots`: `/home/garfex/PROGRAMACION/sistema-garfex`
- Delivery: chained, `stacked-to-main`; current boundary W0 only.
- Action-context warnings: none.
- Review workload gate: decision needed `No`; chained PRs recommended `Yes`; chain strategy `stacked-to-main`; 400-line budget risk `High` for the roadmap and `Low` for W0.

## W0 scope and before/after checklist

### RED — before mismatch

| Capability | Before (`openspec/config.yaml`) | Repository evidence | After target |
|---|---|---|---|
| Strict TDD | `strict_tdd: false` | `package.json` has `vitest ^4.1.11` and `convex-test ^0.0.56`; `tasks.md` mandates RED/GREEN/TRIANGULATE/REFACTOR | `strict_tdd: true` |
| Runner/framework | Blank command/framework; context said no reliable runner | `vitest.config.ts` configures Vitest with `edge-runtime` and inlines `convex-test` | Vitest 4 and `pnpm exec vitest run` |
| Unit tests | `none`, no command | Existing `src/**/*.test.ts` pure-domain tests | Vitest command recorded |
| Integration-style tests | `none`, no command | Existing `convex/**/*.test.ts` uses `convexTest(schema, modules)` from `convex-test` | `convex-test via Vitest` recorded |
| E2E | Context said none, with no explicit configured layer | No E2E command or test layer is present | E2E remains `[]`/blank; no command invented |
| Typecheck | Blank | `package.json` script `typecheck: tsc --noEmit`; `tsconfig.json` has `noEmit: true` and includes `convex/**/*.ts` and `src/**/*.ts` | `pnpm typecheck (tsc --noEmit)` |

The RED focused baseline command passed because W0 changes tooling metadata rather than application behavior; the RED condition was the unsatisfied metadata checklist above, not an expected product-test failure.

### GREEN/TRIANGULATE/REFACTOR — after checklist

- `openspec/config.yaml` now truthfully records Vitest 4, `pnpm exec vitest run`, `convex-test via Vitest`, no E2E command, `pnpm typecheck (tsc --noEmit)`, and strict TDD.
- Only W0 implementation rows were checked in `tasks.md`.
- No application, backend, generated, package, Vitest, or TypeScript source files were changed.

## TDD Cycle Evidence

| Cycle | Exact focused evidence | Result |
|---|---|---|
| RED | `pnpm exec vitest run convex/catalogoRecursos/catalogo.test.ts` | PASS — 1 file, 11 tests; pre-change metadata mismatch documented above |
| GREEN | `pnpm exec vitest run src/catalogoRecursos/dominio/validarRecurso.test.ts` | PASS — 1 file, 1 test |
| TRIANGULATE | `pnpm exec vitest run convex/catalogoRecursos/catalogoPublicado.test.ts` | PASS — 1 file, 11 tests |
| TRIANGULATE full | `pnpm exec vitest run && pnpm typecheck` | PASS — 12 files, 109 tests; `$ tsc --noEmit` passed |
| Runtime boundary | `pnpm exec convex dev --once` | PASS — local Convex backend started and functions were ready; CLI reported no linked Convex account and used local port 3210 |
| REFACTOR | `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts` | PASS — 1 file, 4 tests |
| REFACTOR full | `pnpm exec vitest run && pnpm typecheck` | PASS — 12 files, 109 tests; `$ tsc --noEmit` passed |
| Final hygiene | `git diff --check` | PASS — no output |

The Vitest runs emitted the existing Vite `configLoader: native` warning from `vitest.config.ts`; it did not fail tests and was outside W0's allowed edit surface.

## Completed tasks and persisted checkboxes

- W0 RED — completed and persisted as `- [x]`.
- W0 GREEN — completed and persisted as `- [x]`.
- W0 TRIANGULATE — completed and persisted as `- [x]`.
- W0 REFACTOR — completed and persisted as `- [x]`.

## Files changed and changed-line boundary

- `openspec/config.yaml`: 15 additions, 17 deletions in the implementation diff (`32` changed lines); metadata-only.
- `openspec/changes/complete-catalog-administration/tasks.md`: four checkbox flips from `[ ]` to `[x]` for W0 only.
- `openspec/changes/complete-catalog-administration/apply-progress.md`: this cumulative evidence record.
- Authored application/backend changes: none.
- Generated-file changes: none.

## Rollback boundary

W0 implementation rollback is exactly `git restore -- openspec/config.yaml`; it removes only the corrected OpenSpec metadata. If the W0 task evidence itself is discarded, restore the four W0 checkbox flips in `tasks.md` separately. No application or backend behavior is involved.

## Remaining work and deferred lifecycle actions

Next implementation work unit: **W1 — Shared admin validators, errors, and revision semantics**. Its RED/GREEN/TRIANGULATE/REFACTOR rows remain unchecked and are outside this delegated boundary.

Parent-owned deferred lifecycle rows remain unchanged:

- `- [ ] After apply, collect ordinary SDD status evidence by running ... <!-- sdd-owner: parent -->`
- `- [ ] After post-apply verification, confirm the lifecycle gate ... <!-- sdd-owner: parent -->`

All other unchecked implementation rows, beginning with W1, remain deferred to later work units. No review, receipt, verification actor, commit, push, or PR was started by this apply executor.

## Status produced

- W0 implementation-owned task progress: 4 W0 rows complete; later implementation work remains.
- `nextRecommended`: `parent-lifecycle` for this delegated apply result; parent-owned post-apply lifecycle gates remain pending.

# Apply progress — W1a

## Status consumed

- Native status: `spec-driven`, `openspec` authoritative, `applyState: ready`, `changeName: complete-catalog-administration`.
- Active attempt: `sha256:132a7ed2f7b5c7fefa2c616a54fe5371180b28c84e3770296504c467b58e0950`; objective `W1a-admin-error-contracts`; max attempt changes `220`.
- `actionContext`: `repo-local`; workspace/allowed root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Workload gate: decision `No`; chained delivery `Yes`, strategy `stacked-to-main`; W1a remains below the 400-line review budget.
- Strict TDD is active. W1b revision/concurrency work is explicitly pending and is not claimed here.

## W1a recovery and persisted checkboxes

- W1a is complete: its four `RED`, `GREEN`, `TRIANGULATE`, and `REFACTOR` rows are `- [x]` in `tasks.md`.
- W1b revision/concurrency helper rows remain `- [ ]`; downstream W2–W16 rows remain unchanged.
- W0 history above is preserved. No application/test file was edited, staged, unstaged, deleted, or committed by this recovery.

## TDD Cycle Evidence

| Cycle/evidence | Exact command | Result |
|---|---|---|
| Independent focused verification | `pnpm exec vitest run convex/catalogoAdmin/lib/errors.test.ts` | PASS — 1 file, 12 tests. |
| Full suite | `pnpm exec vitest run` | PASS — 13 files, 121 tests. |
| Typecheck | `pnpm typecheck` | PASS — `tsc --noEmit`. |
| Hygiene | `git diff --check` | PASS — no output. |
| Runtime boundary | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account. |

The Vitest commands emitted the existing Vite `configLoader: native` warning; it did not affect results.

## W1a implementation evidence

- `validators.ts` contains inferred entity references, lifecycle/page/result validators, 16 fixed violation codes, and the closed 11-code `AdminErrorData` union.
- `lib/errors.ts` contains fixed-code constructors with validated safe contexts and presentation-only messages.
- W1b files `lib/revisions.ts` and `lib/revisions.test.ts` are absent from this slice and remain pending.
- Staged W1a source/test files are unchanged: `validators.ts`, `lib/errors.ts`, and `lib/errors.test.ts` (158 authored lines total).
- `pnpm exec convex dev --once` temporarily regenerated `convex/_generated/api.d.ts`; it differed only by W1a module imports, was restored without touching the index, and no generated diff remains. No other generated or application file changed unexpectedly.

## Files, boundary, and rollback

- Allowed artifact edits: `tasks.md` and this `apply-progress.md` only.
- W1a implementation files were not edited in this attempt; no schema, entity command, publication, auth, seed, hard-delete, or unrelated behavior was added.
- Recovery artifact changes are compacted to keep the attempt under 220 changed lines; W1a source remains within the 400-authored-line review budget.
- Rollback: remove the three additive W1a source/test files and restore only the W1a checkbox flips; leave W1b and all downstream work untouched.

## Remaining work and status produced

- Exact next implementation slice: W1b revision/concurrency helpers (`lib/revisions.ts` and `lib/revisions.test.ts`), all four rows unchecked in `tasks.md`.
- W2–W16 implementation rows and both parent-owned lifecycle rows remain deferred; parent-owned rows are preserved byte-for-byte.
- `nextRecommended`: `parent-lifecycle` for this apply result. This executor did not run review, receipt, refutation, correction, validation, finish, or settle actions.

# Apply progress — W1b

## Status consumed

- Native runtime revision `sha256:b04e326714572b5a384adf63d1aff0220a223e75591164cfcd561bb537843294`; objective W1b, attempt ordinal 4, bounds 2 attempts / 220 changed lines.
- Native artifact status: `openspec` authoritative, `applyState: ready`; proposal, specs, design, tasks, and prior progress present.
- `actionContext`: `repo-local`; workspace root and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Workload gate: decision `No`; chained delivery `Yes`, strategy `stacked-to-main`; W1b boundary remains below 400 authored lines.

## W1b evidence

The existing helper/test candidate was reviewed against the foundation revision contract. One real defect was found: invalid non-positive `expectedRevision` values escaped as `RangeError` instead of the structured `ADMIN_INVALID_ARGUMENT` contract. The focused test was added first, observed failing, then `fresh` was narrowed to use the shared structured error constructor. No other behavior or design deviation was found.

| Cycle | Evidence | Result |
|---|---|---|
| RED | Added invalid-`expectedRevision` test; focused run failed with the prior `RangeError`. | PASS — expected RED |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/lib/revisions.test.ts` | PASS — 1 file, 11 tests |
| TRIANGULATE | `pnpm exec vitest run` and `pnpm typecheck` | PASS — 14 files, 132 tests; `tsc --noEmit` |
| Runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210 |
| Hygiene | `git diff --check` | PASS — no output |
| REFACTOR | Re-read helper and reran focused/full evidence after the narrow error-path fix. | PASS — no generated edits |

## Completed tasks and persisted checkboxes

- W1b RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md`.
- Only the four W1b implementation rows were changed in `tasks.md`; W1a, downstream implementation rows, and parent-owned rows were preserved.

## Files and boundaries

- `convex/catalogoAdmin/lib/revisions.ts`: structured invalid-revision error fix.
- `convex/catalogoAdmin/lib/revisions.test.ts`: regression test for invalid expected revisions; existing concurrency coverage retained.
- `openspec/changes/complete-catalog-administration/tasks.md`: four W1b checkbox updates only.
- `openspec/changes/complete-catalog-administration/apply-progress.md`: cumulative W1b evidence appended; W0/W1a history preserved.
- Convex generated output changed transiently during runtime and was restored; no generated file remains modified.
- Rollback boundary: remove the W1b helper/test and restore only the four W1b checkbox flips; leave W1a and all prior/downstream work intact.

## Remaining tasks and deferred lifecycle

The exact remaining unchecked task rows follow; they remain unchanged in `tasks.md`.
- [ ] **RED** — Add `convex/catalogoAdmin/lib/backfillMetadatos.test.ts` and schema/index assertions for missing metadata, duplicate normalized identities, bounded batches, and preservation of `activo`, `revision`, business fields, revisions, and snapshots; evidence is failing tests before schema/backfill implementation, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only the new tests, estimate 28 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add optional fields/indexes to `convex/schema.ts` and implement the bounded internal backfill target; acceptance evidence is zero missing metadata after a complete test backfill, dirty duplicates reported rather than deleted/deactivated, and no required field added to populated tables, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback disable the backfill and remove only unused indexes/optional metadata when safe, estimate 62 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise every documented index family, repeated/resumed batches, empty tables, existing legacy optional fields, and Convex schema/code generation; acceptance evidence is focused/full Vitest pass, `pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback stop backfill and retain only proven-safe schema additions, estimate 28 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make metadata derivation and duplicate reports deterministic and document derived fields beside the schema; acceptance evidence is stable repeated output and no generated file hand edits, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only W2 backfill/index cleanup, estimate 12 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pagination tests for malformed cursors, filter/order reuse, default ALL state, page bounds, deterministic key/ID ordering, sparse pages, and direct missing detail; evidence is focused failures in `convex/catalogoAdmin/lib/pagination.test.ts` and `convex/catalogoAdmin/jerarquia.test.ts`, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/pagination.test.ts convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W3 tests, estimate 22 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement the cursor envelope/planner and Class `obtenerClase`/`listarClases` reads using an indexed bounded query; acceptance evidence is both lifecycle states visible by default, filters ANDed, null missing detail, and no `.filter()`/unbounded `.collect()` in the new list, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/pagination.test.ts convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W3 read exports while retaining harmless indexes, estimate 38 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test cursor plan binding across lifecycle/ordering/filter changes and compare all-page traversal with expected IDs; acceptance evidence is focused/full Vitest pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/pagination.test.ts convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W3 list/detail code and tests, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep cursor canonicalization, index plan naming, and page result validators shared for all later entities; acceptance evidence is unchanged ordering/error behavior and no new full scans, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/pagination.test.ts convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only W3 refactor, estimate 6 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing Convex tests for Class create at revision 1, duplicate/immutable key, stale update, parent activation with one invalid descendant, active descendant/resource blockers, inactive blockers ignored, and same-state no-op; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W4 test additions, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement only Class commands and indexed blocker/descendant validation in `convex/catalogoAdmin/jerarquia.ts`; acceptance evidence is all W4 scenarios passing with unchanged stored rows after failures and no cascade/delete, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove Class command exports and W4-specific loader code while preserving W3 reads, estimate 44 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Add transaction tests for multiple descendants, inert active descendants, active resources, stale-before-blocker checks, and public-read compatibility; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W4 Class command/test changes, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Extract only Class-specific blocker predicates and keep the module thin over shared revisions/errors; acceptance evidence is unchanged error data and full regression pass, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W4 refactor, estimate 8 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing Family tests for scoped duplicate versus another Class, cross-Class reference, immutable parent, stale and same-state lifecycle, active Type/resource blockers, inactive descendants allowed, and activation validating effective Types; evidence is focused RED output, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W5 test additions, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement Family create/update/activate/deactivate plus direct/list behavior and blocker checks in `convex/catalogoAdmin/jerarquia.ts`; acceptance evidence is all Family scenarios passing atomically with stored descendants untouched, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove Family exports and Family-only logic while retaining Class/W3 behavior, estimate 38 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test Class filter cursor traversal, inactive branch effectiveness, parent activation fan-out, stale checks before aggregate/blocker checks, and existing public calls; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W5 Family code/tests only, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse scoped hierarchy loaders and common result shapes without widening mutable fields; acceptance evidence is unchanged Family ordering and errors, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W5 refactor, estimate 8 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing Type tests for cross-Family ownership, immutable Family/key, active-under-inactive inertness, incomplete Type activation, active resource deactivation blocker, stale-before-no-op, direct/list filters, and atomic parent activation; add pure aggregate-loader contract tests, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W6 tests, estimate 34 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement Type commands and minimal aggregate loader/validator interfaces, returning `VALID|INVALID|NOT_EVALUATED` plus coded violations without leaking inert rows; acceptance evidence is Type lifecycle tests passing and no partial parent/Type state changes, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove Type exports and hook skeleton while preserving stored rows and Class/Family APIs, estimate 58 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise active configuration beneath inactive ancestors, fan-out limits, legacy dirty rows, public inertness regression, generated refs, and no hard-delete exports; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W6 Type/hook changes only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make aggregate loader inputs bounded and keep Type-specific completeness delegation explicit for later units; acceptance evidence is stable status/violation output and no unbounded collection, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W6 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure precedence tests under `src/catalogoRecursos/dominio/unidadesEfectivas.test.ts` and Convex tests under `convex/catalogoAdmin/unidades.test.ts` for duplicate/incompatible references, inactive override suppression, per-Unit inheritance, zero/multiple principal, stale/no-op, and deactivation blockers; evidence is failing focused tests, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoAdmin/unidades.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W7 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add Unit/policy commands, precedence resolver, indexed lists/details, and principal validation in `convex/catalogoAdmin/unidades.ts` plus named pure domain target; acceptance evidence is exact matrix behavior, inactive drafts remain inert, and active aggregate changes are atomic, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoAdmin/unidades.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove unit admin exports/resolver hook while preserving schema metadata, estimate 54 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test numeric unit activity, active resources, family/type filters, selected/shadowed diagnostics, principal conflict, page cursor binding, and W6 Type activation integration; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/unidades.test.ts src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W7 code/tests, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Consolidate policy identity and effective-unit selection with bounded loaders and shared violation codes; acceptance evidence is unchanged precedence and no duplicated React-facing validation, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoAdmin/unidades.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W7 refactor, estimate 12 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing Convex tests for nonnumeric Unit references, wrong-type options, duplicate definition/option identities including inactive rows, immutable owners, stale/no-op lifecycle, effective dependency blockers, and default ALL lists; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W8 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement definition and option create/detail/list/update/activate/deactivate commands in `convex/catalogoAdmin/atributos.ts` with indexed filters and reference validation; acceptance evidence is all ownership/type/identity/lifecycle scenarios passing with no hard delete, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove definition/option exports and W8-specific logic, estimate 54 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Integrate dependency checks against active assignments/rules/presentation/compatibility/resource values and verify inactive/parent-inert options never affect public behavior; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W8 integration only, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Share definition/option reference validators and stable scope ordering; acceptance evidence is unchanged coded errors and generated output only from codegen, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W8 refactor, estimate 16 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure and Convex tests for Type-over-Family selection, inactive suppression, forbidden/not-applicable value rejection, conditional optional baseline, option assignment completeness, cross-Family/definition references, duplicate inactive assignments, identity exclusion, and deterministic order ties; evidence is focused failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W9 tests, estimate 38 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement assignment commands/list/detail annotations and pure selection/order/value-bearing projection in the named files; acceptance evidence is exact precedence and applicability matrices, active option ownership, and atomic effective-aggregate validation, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove assignment exports/resolver integration while retaining W8 definitions/options, estimate 62 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise `Map.has` semantics for false, 0, and empty string through resource validation, identity aliases, public effective reads, cursor filters, and Type activation; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts src/catalogoRecursos/dominio/validarRecurso.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W9 assignment seam/tests only, estimate 32 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make order/definition-key/assignment-ID tie-breaking and selected/shadowed diagnostics single-source; acceptance evidence is repeated deterministic output and no frontend rule duplication, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W9 refactor, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure/Convex tests for false/zero/empty-string presence, conditional optional baseline, foreign assignment/option, self-target rejection, exact duplicate inactive identity, contradictory co-active rules, same-result rules, A→B/B→A cycle safety, and inert drafts; evidence is focused RED failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W10 tests, estimate 34 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement rule command/read lifecycle and pure one-pass evaluator/conflict checker in the named files; acceptance evidence is order-independent evaluation, `ADMIN_CONFLICT` for co-fire contradictions, and inactive rules omitted from effective/public output, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove rule exports/evaluator integration while retaining prior public behavior, estimate 56 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test active option/definition dependency deactivation, Type activation/publication aggregate hooks, rule filters/cursors, structured violations, and existing resource validation regression; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/reglas.test.ts src/catalogoRecursos/dominio/reglasCondicionales.test.ts src/catalogoRecursos/dominio/validarRecurso.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W10 seam changes only, estimate 26 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep raw-input rule semantics explicit and eliminate iteration-order dependence without introducing derived applicability dependencies; acceptance evidence is stable repeated evaluations and unchanged coded errors, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W10 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure/Convex tests for multiple drafts, second-active conflict, attribute-only invalid policy, foreign/inactive token references, token order preservation, missing optional omission, NFC/trim/whitespace normalization, option display name, numeric symbol, and empty final rendering; evidence is focused RED failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W11 tests, estimate 28 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement presentation policy lifecycle/reads in `convex/catalogoAdmin/presentacion.ts` and rendering/validation changes in the named domain module; acceptance evidence is exact replacement order (deactivate Type, draft, old policy, new policy, reactivate Type) with no implicit replacement, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove presentation exports/integration while preserving old renderer contract where possible, estimate 44 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify Type activation requires one valid effective policy, parent-inert policies are omitted from public/publication paths, detail preserves exact stored tokens, and cursor filter mismatch is structured; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/presentacion.test.ts src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W11 Type/publication hooks only, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize normalization and token-reference validation while preserving semantic sequence; acceptance evidence is unchanged hashes/rendered names and no sorted token regression, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W11 refactor, estimate 10 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for non-option/foreign endpoints, directional reverse allowance, directional/symmetric conflicts, symmetric reverse conflict, mode-independent slot identity, empty allowlist rejection, empty denylist acceptance, inactive policy inertness, and stale/no-op lifecycle; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 tests, estimate 26 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement policy commands/reads, normalized slot identities, endpoint validation, and aggregate checks in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is the exact active-policy conflict matrix with no implicit deactivation, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove policy exports and W12 integration while preserving existing evaluator, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test endpoint selection after assignment precedence, resource/public evaluation in both directions, policy filters/order/cursors, active option dependency blockers, generated refs, and Type activation integration; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 seam changes only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make policy slot normalization and conflict checks reusable by relation administration without changing mode semantics; acceptance evidence is stable normalized identities and unchanged evaluator results, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W12 refactor, estimate 12 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for foreign/out-of-endpoint options, directional ordered duplicates, reversed symmetric duplicates, inactive duplicate reservation, policy direction collision, inactive-policy inert relations, empty allowlist, empty denylist, and relation page filters/order; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement relation create/detail/list/update/activate/deactivate and normalized metadata updates in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is exact identity and lifecycle behavior with no partial writes or hard deletion, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove relation exports/derived use while preserving policy APIs and stored rows, estimate 52 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise relation evaluation in both directions, active/inactive option and policy dependencies, direction changes with collisions, cursor traversal, publication aggregate hooks, and legacy optional fields; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 relation integration only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Share normalized pair construction with canonicalization/evaluation and document preservation of legacy `politicaCompatibilidadId`/`tipoRelacion`; acceptance evidence is deterministic relation IDs and unchanged policy matrix, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoAdmin/compatibilidad.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W13 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add cross-seam regression tests proving active rows below inactive Class/Family/Type branches currently leak or resolve inconsistently, plus pure precedence matrices and dirty-data annotations; evidence is focused failures without changing existing call shapes, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only new W14 tests, estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement the shared effective resolver and adapt the four named public/resource seams while preserving validators, return shapes, historical reads, and backend authority; acceptance evidence is inert configuration excluded from public/runtime/publication output and all existing tests remain passing, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only seam adapters/resolver integration while retaining additive admin data and APIs, estimate 74 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Run every existing catalog/resource/identity/presentation/compatibility/publication suite plus new cross-aggregate tests for stale commands, bounded limits, legacy invalid active rows, false/zero/empty values, and no snapshot mutation; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only W14 seam adapters/tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Remove duplicate effective-state logic and enforce bounded indexed loader paths without changing existing public contracts; acceptance evidence is a code search showing one resolver path, stable regression results, and no new unbounded `.collect()`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W14 refactor only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add Convex/pure tests for explicit-only publication, inactive/missing organization, inert branch omission, one-invalid-Type all-or-nothing failure, ambiguous Type key, deterministic storage-order-independent hash, semantic token-order hash change, repeated `UNCHANGED`, changed `CREATED`, organization isolation, history pagination, and live-edit snapshot immutability; evidence is focused failures, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement `publicarCatalogo`, revision/history reads, canonicalization integration, bounded limit guards, and atomic revision/snapshot insertion in `convex/catalogoAdmin/publicacion.ts` and the existing publication seam; acceptance evidence is exact disposition/result fields, no writes on validation failure or unchanged content, and old snapshots byte-for-byte stable, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove new publish/history exports and leave all historical rows/old reads untouched, estimate 76 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify all aggregate validators, publication limits, Type-key ambiguity, organization ownership, descending cursor pages, historical direct reads, generated refs, and existing public latest/snapshot contracts; acceptance evidence is focused/full pass, `pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 admin publication entry point while preserving compiler/history storage and old reads, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep canonicalization independent of IDs/revisions/timestamps and isolate admin publication from legacy public functions; acceptance evidence is stable hashes, immutable history, no automatic publication from mutations, and no hard-delete export, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoAdmin/publicacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W15 refactor only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add the consumer fixture and contract assertions before static exports exist; evidence is the expected typecheck failure for `api.catalogoAdmin.*`, `FunctionArgs`/`FunctionReturnType`, pagination, publish result, IDs, and `AdminErrorData`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only `contract-tests/catalog-admin-consumer.ts` and fixture config, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add `convex.json` static API/data-model settings, package subpaths, and regenerate derived `convex/_generated/*`; acceptance evidence is the fixture typechecking without copied DTOs or backend-function execution, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove package/config exports and derived generated output only through the normal generation workflow, estimate 30 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck representative React-facing calls, all admin module references, result unions, cursor fields, IDs, and discriminated `AdminErrorData`; run `pnpm exec convex codegen --typecheck enable` and all Vitest/regression suites, with runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W16 package/fixture surfaces and retain backend behavior, estimate 20 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Document the pinned Git/private-package consumption path near the package exports without introducing a manual SDK/DTO layer; acceptance evidence is clean generated diff, unchanged public compatibility, and stable fixture typecheck, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W16 documentation/export cleanup, estimate 12 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] After apply, collect ordinary SDD status evidence by running `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `git diff --check`, and `git status --short` over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, and `contract-tests/**`; acceptance evidence is the recorded command/status output, including runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the verification/status record only, estimate 0 authored lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/complete-catalog-administration/tasks.md`; acceptance evidence is all RED/GREEN/TRIANGULATE/REFACTOR results recorded, no authored work unit exceeds 400 changed lines, and every rollback boundary remains actionable, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the lifecycle decision record only, estimate 0 authored lines. <!-- sdd-owner: parent -->

Parent-owned rows are deferred to the parent lifecycle. This executor did not run review, receipts, verification, refutation, correction, finish, settle, commit, push, or PR actions. `nextRecommended: parent-lifecycle`.

# Apply progress — W2

## Status and boundary

- Native status: `openspec` authoritative, `applyState: ready`, change `complete-catalog-administration`; all required planning artifacts and prior progress were present.
- `actionContext`: `repo-local`; workspace/allowed root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none. Delivery is chained `stacked-to-main`; W2 stayed below the 380-attempt/400-review-line boundary.
- Existing `convex/` migration conventions were inspected; no migration registration target existed, so no extra registration file was changed.

## W2 evidence

- Added optional `adminSortId`, `definicionClave`, normalized compatibility metadata, and staged exact-order admin index families for hierarchy, units, attributes, rules, presentation, compatibility, and revisions.
- Added internal `backfillMetadatos` with one bounded pagination call per resumable invocation, opaque table/cursor state, repeat-safe derived patches, bounded duplicate candidate reads, and deterministic code-point duplicate reports. Lifecycle, revision, business, legacy compatibility, revision-history, and snapshot fields remain unchanged.
- W2 RED failed before the target existed; GREEN and later cycles passed. New tests cover missing/existing metadata, empty tables, resumed/repeated batches, duplicates, index coverage, and preservation.
- W2b correction generated the version-correct `convex/tsconfig.json` with `pnpm exec convex codegen --init --typecheck enable`; the incidental generated API binding diff was restored.

## TDD Cycle Evidence

| Cycle | Evidence | Result |
|---|---|---|
| RED | Focused backfill test before implementation | Expected missing-target failure |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts` | PASS — 1 file, 2 tests |
| TRIANGULATE | `pnpm exec vitest run` | PASS — 15 files, 134 tests |
| TRIANGULATE | `pnpm typecheck` | PASS — `tsc --noEmit` |
| W2b focused rerun | `pnpm exec vitest run convex/catalogoAdmin/lib/backfillMetadatos.test.ts` | PASS — 1 file, 2 tests |
| W2b full rerun | `pnpm exec vitest run` | PASS — 15 files, 134 tests |
| W2b root typecheck | `pnpm typecheck` | PASS — `tsc --noEmit` |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated bindings and typechecked Convex functions using `convex/tsconfig.json` |
| Runtime/hygiene | `pnpm exec convex dev --once`; `git diff --check` | PASS — local functions ready; no whitespace errors |

## Completion and remaining work

- W2 RED, GREEN, TRIANGULATE, and REFACTOR are checked in `tasks.md`; only W2 implementation rows changed. Generated API output was transiently regenerated and restored.
- Changed files: `convex/tsconfig.json`, `convex/schema.ts`, `convex/catalogoAdmin/lib/backfillMetadatos.ts`, its test, W2 task checkboxes, and this cumulative record. The generated API binding was incidental and restored. Rollback is limited to W2 backfill/tests, the generated Convex config, and safe W2 schema metadata/index cleanup; stored business/history data remains.
- W3 is next; its exact unchecked `- [ ] **RED** — Add pagination tests...` row and all later implementation rows remain in `tasks.md`. Parent-owned lifecycle rows remain unchanged and deferred. This executor did not review, commit, push, PR, or run lifecycle actions; `nextRecommended: parent-lifecycle`.
- Native W2 attempt settlement returned `complete`; no delivery or review gate was performed.

# Apply progress — W3

## Status consumed

- Native status: `spec-driven`, `openspec` authoritative, `applyState: ready`; proposal, eight specs, design, tasks, and cumulative progress were present.
- Active attempt: `sha256:4adb290d57bd55e1de58480b7ef8dc5c1b18dfbd8cb7c1f1f78051501e8a8baf`; W3 bounds are 2 attempts and 380 changed lines. The parent token was authenticated with a matching acquire; no second attempt was opened.
- `actionContext`: `repo-local`; workspace root and allowed root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Workload gate: decision needed `No`; chained delivery `Yes`, strategy `stacked-to-main`; W3 is the assigned slice and remains below the 400-line branch budget.

## TDD Cycle Evidence

| Cycle | Evidence | Result |
|---|---|---|
| RED | Added the two W3 focused test files, then ran `pnpm exec vitest run convex/catalogoAdmin/lib/pagination.test.ts convex/catalogoAdmin/jerarquia.test.ts` before implementation | Expected failure: missing pagination module and admin hierarchy module |
| GREEN | Implemented cursor helpers and Class detail/list reads; focused command | PASS — 2 files, 5 tests |
| TRIANGULATE | Added lifecycle/filter/order cursor-binding, sparse-page, deterministic key/ID traversal, and missing-detail assertions; focused command | PASS — 2 files, 5 tests |
| TRIANGULATE full | `pnpm exec vitest run` | PASS — 17 files, 139 tests |
| TRIANGULATE typecheck | `pnpm typecheck` | PASS — `tsc --noEmit` |
| TRIANGULATE codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated bindings and Convex functions typechecked |
| TRIANGULATE runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked Convex account |
| REFACTOR | Replaced locale-sensitive cursor canonicalization with code-point ordering and reran focused/full evidence | PASS — no behavior regressions |
| Hygiene | `git diff --check` | PASS — no whitespace errors |

## W3 implementation evidence

- `lib/pagination.ts` provides a base64url envelope `{ v, plan, filtersHash, order, cursor }`; the SHA-256 binding covers canonical filters, lifecycle mode, selected plan, and ordering version. It rejects malformed or reused cursors with `ADMIN_INVALID_ARGUMENT` and validates page sizes 1–100 with default 25.
- `jerarquia.ts` exposes read-only `obtenerClase` and `listarClases`. The list uses `porClaveYAdminSort` for `ALL`, `porActivoYClaveYAdminSort` for state modes, and native bounded `.withIndex(...).order(...).paginate(...)`; no new `.filter()` or unbounded `.collect()` path was added.
- Class details expose stored lifecycle/revision and `effective`/`effectiveReasons`; missing direct IDs return `null`. Tests prove default ALL visibility, state filtering, sparse pages, cursor mismatch rejection, and complete deterministic traversal.
- W3 is read-only; no mutations, deletion, schema edits, or unrelated public API changes were introduced.

## Completed tasks and persisted checkbox updates

- W3 RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md`.
- W0–W2 history and parent-owned rows were preserved. The generated `convex/_generated/api.d.ts` update is legitimate derived output for the new public `catalogoAdmin.jerarquia` references; it was produced by codegen and not hand-edited.

## Files and rollback boundary

- Changed: `convex/catalogoAdmin/lib/pagination.ts`, `convex/catalogoAdmin/lib/pagination.test.ts`, `convex/catalogoAdmin/jerarquia.ts`, `convex/catalogoAdmin/jerarquia.test.ts`, generated `convex/_generated/api.d.ts`, W3 task checkboxes, and this cumulative record.
- Authored implementation remains within the W3 380-line attempt bound and the complete branch diff remains below 400 changed lines.
- Rollback: remove the W3 pagination/detail/list helpers and tests, restore only the four W3 checkbox flips, and regenerate the Convex bindings after removing the W3 public module. Retain W2 metadata/indexes; no stored catalog/history rows are affected.

## Remaining tasks and deferred lifecycle actions

The next exact unchecked implementation rows are W4 and remain unchanged:

- [ ] **RED** — Add failing Convex tests for Class create at revision 1, duplicate/immutable key, stale update, parent activation with one invalid descendant, active descendant/resource blockers, inactive blockers ignored, and same-state no-op; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W4 test additions, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement only Class commands and indexed blocker/descendant validation in `convex/catalogoAdmin/jerarquia.ts`; acceptance evidence is all W4 scenarios passing with unchanged stored rows after failures and no cascade/delete, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove Class command exports and W4-specific loader code while preserving W3 reads, estimate 44 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Add transaction tests for multiple descendants, inert active descendants, active resources, stale-before-blocker checks, and public-read compatibility; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W4 Class command/test changes, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Extract only Class-specific blocker predicates and keep the module thin over shared revisions/errors; acceptance evidence is unchanged error data and full regression pass, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W4 refactor, estimate 8 authored lines. <!-- sdd-owner: implementation -->

All later implementation rows W5–W16 remain unchecked in `tasks.md`. Parent-owned lifecycle rows remain deferred byte-for-byte:

- [ ] After apply, collect ordinary SDD status evidence by running `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `git diff --check`, and `git status --short` over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, and `contract-tests/**`; acceptance evidence is the recorded command/status output, including runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the verification/status record only, estimate 0 authored lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/complete-catalog-administration/tasks.md`; acceptance evidence is all RED/GREEN/TRIANGULATE/REFACTOR results recorded, no authored work unit exceeds 400 changed lines, and every rollback boundary remains actionable, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the lifecycle decision record only, estimate 0 authored lines. <!-- sdd-owner: parent -->

No review, receipt, verification actor, refutation, correction, settle, commit, push, PR, or delivery gate was started. `nextRecommended: parent-lifecycle`.

## Status produced

- W3 implementation-owned task progress: 4 W3 rows complete; W4–W16 implementation work remains.
- Parent lifecycle actions remain deferred; parent owns review/verify/settle/delivery.

# Apply progress — W4

## Status consumed

- Native status: `gentle-ai.sdd-status` v2, `openspec` authoritative, `applyState: ready`, change `complete-catalog-administration`.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Active attempt authenticated with native token `sha256:f399d12af443b12c8fce4a2f6ae05e954631bc94a678734043381785fa831759`; bounds: 2 attempts / 380 changed lines.
- Workload gate: decision needed `No`; chained delivery `Yes`; strategy `stacked-to-main`; W4 forecast 90 lines and actual authored diff 198 lines before task/progress records, under the 400-line branch boundary.
- Strict TDD is active. Skill resolution: `paths-injected` for all five requested skill paths; strict-TDD guidance loaded from the global support path.

## TDD Cycle Evidence

| Cycle | Evidence | Result |
|---|---|---|
| Safety net | `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts` before edits | PASS — 1 file, 2 tests |
| RED | Added W4 lifecycle/blocker tests, then focused run before Class commands existed | Expected RED — missing `crearClase`, `actualizarClase`, `activarClase`, and `desactivarClase` exports |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts` | PASS — 1 file, 6 tests |
| TRIANGULATE | Added material update, inactive duplicate, valid parent fan-out, exact blocker context, active-resource and inert-branch cases; focused run | PASS — 1 file, 6 tests |
| TRIANGULATE regression | `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts` | PASS — 2 files, 17 tests |
| Full suite | `pnpm exec vitest run` | PASS — 17 files, 143 tests |
| Root typecheck | `pnpm typecheck` | PASS — `tsc --noEmit` |
| Convex codegen/typecheck | `pnpm exec convex codegen --typecheck enable` | PASS — generated bindings and Convex functions typechecked; no generated diff required |
| Runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account |
| REFACTOR | Narrowed update patch fields, deferred immutable echo normalization until after revision guard, removed unused descendant count, reran focused/full evidence | PASS — behavior unchanged |
| Diff hygiene | `git diff --check` | PASS — no whitespace errors |

## W4 implementation evidence

- Added `crearClase`, `actualizarClase`, `activarClase`, and `desactivarClase` while preserving W3 `obtenerClase`/`listarClases` exports.
- Class creation normalizes nonblank keys/names, reserves duplicate keys across active and inactive rows through the indexed `porClave` path, initializes revision 1, and populates derived `adminSortId` atomically.
- Updates use the shared revision helper for stale-before-immutable/no-op ordering, normalized descriptive no-ops, single-step revision increments, and immutable key echoes.
- Activation validates bounded active Family/Type descendants before the one Class patch; invalid active descendant revisions return `ADMIN_AGGREGATE_INCOMPLETE` and leave Class, Family, and Type rows unchanged.
- Deactivation checks bounded indexed `porClase`, `porFamilia`, and `porTipoYActivo` paths. Active stored Families, Types, and resources block with `ADMIN_DEPENDENCY_BLOCKED`; inactive descendants/resources are ignored; no cascade or hard-delete path exists.
- Same-state lifecycle requests return `UNCHANGED` only after the expected-revision check and bypass blockers/aggregate checks.
- No shared loader file was required; Class-specific bounded predicates remain in `jerarquia.ts` as allowed.

## Completed tasks and persisted checkbox updates

- W4 RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md` and were re-read after persistence.
- W0–W3 history and parent-owned rows were preserved. No generated file, schema, public catalog function, hard-delete command, review, receipt, verification actor, commit, push, PR, or settle action was started.

## Files and rollback boundary

- Changed: `convex/catalogoAdmin/jerarquia.ts`, `convex/catalogoAdmin/jerarquia.test.ts`, `openspec/changes/complete-catalog-administration/tasks.md`, and this cumulative progress record.
- Generated API output was regenerated and remained unchanged because the existing module binding already covered `jerarquia.ts`.
- Authored implementation/test diff is 198 changed lines before task/progress bookkeeping; total branch diff remains below 400 changed lines.
- Rollback boundary: remove the four Class command exports and W4 test additions from `jerarquia.ts`/`jerarquia.test.ts`, restore the four W4 checkbox flips, and retain W3 read exports plus W2 schema/index metadata. Stored rows are never deleted or cascaded.

## Remaining tasks and deferred lifecycle actions

The next exact unchecked implementation rows are W5 and remain unchanged in `tasks.md`:

- [ ] **RED** — Add failing Family tests for scoped duplicate versus another Class, cross-Class reference, immutable parent, stale and same-state lifecycle, active Type/resource blockers, inactive descendants allowed, and activation validating effective Types; evidence is focused RED output, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W5 test additions, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement Family create/update/activate/deactivate plus direct/list behavior and blocker checks in `convex/catalogoAdmin/jerarquia.ts`; acceptance evidence is all Family scenarios passing atomically with stored descendants untouched, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove Family exports and Family-only logic while retaining Class/W3 behavior, estimate 38 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test Class filter cursor traversal, inactive branch effectiveness, parent activation fan-out, stale checks before aggregate/blocker checks, and existing public calls; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W5 Family code/tests only, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Reuse scoped hierarchy loaders and common result shapes without widening mutable fields; acceptance evidence is unchanged Family ordering and errors, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W5 refactor, estimate 8 authored lines. <!-- sdd-owner: implementation -->

All later W6–W16 implementation rows remain unchecked byte-for-byte in `tasks.md`. Parent-owned lifecycle rows remain deferred byte-for-byte:

- [ ] After apply, collect ordinary SDD status evidence by running `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `git diff --check`, and `git status --short` over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, and `contract-tests/**`; acceptance evidence is the recorded command/status output, including runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the verification/status record only, estimate 0 authored lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/complete-catalog-administration/tasks.md`; acceptance evidence is all RED/GREEN/TRIANGULATE/REFACTOR results recorded, no authored work unit exceeds 400 changed lines, and every rollback boundary remains actionable, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the lifecycle decision record only, estimate 0 authored lines. <!-- sdd-owner: parent -->

## Status produced

- W4 implementation-owned task progress: 4 W4 rows complete; W5–W16 remain for later work units.
- Parent lifecycle actions remain deferred; `nextRecommended: parent-lifecycle`.

# Apply progress — W5

## Status consumed and boundary

- Native `gentle-ai.sdd-status` v2: `openspec` authoritative; change `complete-catalog-administration`; `applyState: ready`.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Parent-authenticated attempt token: `sha256:9dd436d50ba06b7a447d265405f21219a6cc71a923066c082a05847bbaba8c58`; bounds 2 attempts / 380 changed lines; W5 stayed within the requested boundary.
- Workload gate: decision needed `No`; chained delivery `Yes`; strategy `stacked-to-main`; W5 is the assigned slice and the complete current diff is 221 authored changed lines, below 400.
- Strict TDD is active. Skill resolution: `paths-injected` for all five requested skill paths; global strict-TDD guidance was available.

## W5 TDD Cycle Evidence

| Cycle | Exact evidence | Result |
|---|---|---|
| RED | Added Family tests, then `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts` | Expected RED — Family exports were absent; 4 new tests failed |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts` | PASS — 1 file, 10 tests |
| TRIANGULATE focused | `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts` | PASS — 2 files, 21 tests |
| TRIANGULATE full/typecheck | `pnpm exec vitest run && pnpm typecheck` | PASS — 17 files, 147 tests; `tsc --noEmit` passed |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated Convex bindings and Convex TypeScript passed; no generated diff required |
| Runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account |
| REFACTOR focused | Reused the bounded Family Type loader, then `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts` | PASS — 1 file, 10 tests |
| REFACTOR full/typecheck | `pnpm exec vitest run && pnpm typecheck` | PASS — 17 files, 147 tests; `tsc --noEmit` passed |
| Final codegen/runtime | `pnpm exec convex codegen --typecheck enable && pnpm exec convex dev --once` | PASS — codegen/typecheck and local runtime readiness |
| Hygiene | `git diff --check` | PASS — no whitespace errors |

The Vitest commands emitted the existing Vite `configLoader: native` warning; it did not affect results. Convex emitted its existing AI-files advisory; local runtime readiness was successful.

## Completed W5 tasks and persisted checkbox updates

- W5 RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md` and were re-read after persistence.
- Family commands now create revision-one rows, normalize identity/descriptions, reject missing Class owners, and reserve duplicate keys through indexed `porClaseYClave` across active and inactive rows.
- Family updates preserve immutable Class/key fields and use shared stale-before-immutable/no-op revision ordering.
- Family activation validates bounded active Types that become effective only when the Class is active; failed validation leaves the Family and descendants unchanged.
- Family deactivation uses indexed `porFamilia` and `porTipoYActivo` blockers, ignores inactive descendants/resources only when no active blocker exists, and never cascades or deletes.
- Family detail/list reads expose stored lifecycle/revision, immutable Class ownership, effective state/reasons, optional Class filtering, and bound cursor pagination using `porClaseYClaveYAdminSort` or `porActivoYClaseYClaveYAdminSort`.
- Existing Class behavior and public catalog calls remained passing; generated output was unchanged after normal codegen.

## Files changed and rollback boundary

- `convex/catalogoAdmin/jerarquia.ts`
- `convex/catalogoAdmin/jerarquia.test.ts`
- `openspec/changes/complete-catalog-administration/tasks.md`
- `openspec/changes/complete-catalog-administration/apply-progress.md`
- Authored implementation/test diff is 221 changed lines in the current branch diff; no generated file changed.
- Rollback boundary: remove the Family exports, Family-specific loader/blocker/detail/list code, and W5 tests from the two Convex files; restore only the four W5 checkbox flips. Retain W3 Class reads, W4 Class lifecycle, W2 schema/index metadata, and stored rows. No review, receipt, verification actor, commit, push, PR, or delivery gate was started.

## Remaining tasks and deferred lifecycle actions

The following exact unchecked task lines remain persisted and are deferred to later implementation units or the parent lifecycle:
- [ ] **RED** — Add failing Type tests for cross-Family ownership, immutable Family/key, active-under-inactive inertness, incomplete Type activation, active resource deactivation blocker, stale-before-no-op, direct/list filters, and atomic parent activation; add pure aggregate-loader contract tests, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W6 tests, estimate 34 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement Type commands and minimal aggregate loader/validator interfaces, returning `VALID|INVALID|NOT_EVALUATED` plus coded violations without leaking inert rows; acceptance evidence is Type lifecycle tests passing and no partial parent/Type state changes, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove Type exports and hook skeleton while preserving stored rows and Class/Family APIs, estimate 58 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise active configuration beneath inactive ancestors, fan-out limits, legacy dirty rows, public inertness regression, generated refs, and no hard-delete exports; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoRecursos/catalogo.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W6 Type/hook changes only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make aggregate loader inputs bounded and keep Type-specific completeness delegation explicit for later units; acceptance evidence is stable status/violation output and no unbounded collection, focused command `pnpm exec vitest run convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W6 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure precedence tests under `src/catalogoRecursos/dominio/unidadesEfectivas.test.ts` and Convex tests under `convex/catalogoAdmin/unidades.test.ts` for duplicate/incompatible references, inactive override suppression, per-Unit inheritance, zero/multiple principal, stale/no-op, and deactivation blockers; evidence is failing focused tests, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoAdmin/unidades.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W7 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add Unit/policy commands, precedence resolver, indexed lists/details, and principal validation in `convex/catalogoAdmin/unidades.ts` plus named pure domain target; acceptance evidence is exact matrix behavior, inactive drafts remain inert, and active aggregate changes are atomic, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoAdmin/unidades.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove unit admin exports/resolver hook while preserving schema metadata, estimate 54 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test numeric unit activity, active resources, family/type filters, selected/shadowed diagnostics, principal conflict, page cursor binding, and W6 Type activation integration; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/unidades.test.ts src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W7 code/tests, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Consolidate policy identity and effective-unit selection with bounded loaders and shared violation codes; acceptance evidence is unchanged precedence and no duplicated React-facing validation, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoAdmin/unidades.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W7 refactor, estimate 12 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing Convex tests for nonnumeric Unit references, wrong-type options, duplicate definition/option identities including inactive rows, immutable owners, stale/no-op lifecycle, effective dependency blockers, and default ALL lists; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W8 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement definition and option create/detail/list/update/activate/deactivate commands in `convex/catalogoAdmin/atributos.ts` with indexed filters and reference validation; acceptance evidence is all ownership/type/identity/lifecycle scenarios passing with no hard delete, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove definition/option exports and W8-specific logic, estimate 54 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Integrate dependency checks against active assignments/rules/presentation/compatibility/resource values and verify inactive/parent-inert options never affect public behavior; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W8 integration only, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Share definition/option reference validators and stable scope ordering; acceptance evidence is unchanged coded errors and generated output only from codegen, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W8 refactor, estimate 16 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure and Convex tests for Type-over-Family selection, inactive suppression, forbidden/not-applicable value rejection, conditional optional baseline, option assignment completeness, cross-Family/definition references, duplicate inactive assignments, identity exclusion, and deterministic order ties; evidence is focused failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W9 tests, estimate 38 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement assignment commands/list/detail annotations and pure selection/order/value-bearing projection in the named files; acceptance evidence is exact precedence and applicability matrices, active option ownership, and atomic effective-aggregate validation, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove assignment exports/resolver integration while retaining W8 definitions/options, estimate 62 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise `Map.has` semantics for false, 0, and empty string through resource validation, identity aliases, public effective reads, cursor filters, and Type activation; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts src/catalogoRecursos/dominio/validarRecurso.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W9 assignment seam/tests only, estimate 32 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make order/definition-key/assignment-ID tie-breaking and selected/shadowed diagnostics single-source; acceptance evidence is repeated deterministic output and no frontend rule duplication, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W9 refactor, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure/Convex tests for false/zero/empty-string presence, conditional optional baseline, foreign assignment/option, self-target rejection, exact duplicate inactive identity, contradictory co-active rules, same-result rules, A→B/B→A cycle safety, and inert drafts; evidence is focused RED failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W10 tests, estimate 34 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement rule command/read lifecycle and pure one-pass evaluator/conflict checker in the named files; acceptance evidence is order-independent evaluation, `ADMIN_CONFLICT` for co-fire contradictions, and inactive rules omitted from effective/public output, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove rule exports/evaluator integration while retaining prior public behavior, estimate 56 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test active option/definition dependency deactivation, Type activation/publication aggregate hooks, rule filters/cursors, structured violations, and existing resource validation regression; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/reglas.test.ts src/catalogoRecursos/dominio/reglasCondicionales.test.ts src/catalogoRecursos/dominio/validarRecurso.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W10 seam changes only, estimate 26 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep raw-input rule semantics explicit and eliminate iteration-order dependence without introducing derived applicability dependencies; acceptance evidence is stable repeated evaluations and unchanged coded errors, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W10 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure/Convex tests for multiple drafts, second-active conflict, attribute-only invalid policy, foreign/inactive token references, token order preservation, missing optional omission, NFC/trim/whitespace normalization, option display name, numeric symbol, and empty final rendering; evidence is focused RED failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W11 tests, estimate 28 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement presentation policy lifecycle/reads in `convex/catalogoAdmin/presentacion.ts` and rendering/validation changes in the named domain module; acceptance evidence is exact replacement order (deactivate Type, draft, old policy, new policy, reactivate Type) with no implicit replacement, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove presentation exports/integration while preserving old renderer contract where possible, estimate 44 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify Type activation requires one valid effective policy, parent-inert policies are omitted from public/publication paths, detail preserves exact stored tokens, and cursor filter mismatch is structured; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/presentacion.test.ts src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W11 Type/publication hooks only, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize normalization and token-reference validation while preserving semantic sequence; acceptance evidence is unchanged hashes/rendered names and no sorted token regression, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W11 refactor, estimate 10 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for non-option/foreign endpoints, directional reverse allowance, directional/symmetric conflicts, symmetric reverse conflict, mode-independent slot identity, empty allowlist rejection, empty denylist acceptance, inactive policy inertness, and stale/no-op lifecycle; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 tests, estimate 26 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement policy commands/reads, normalized slot identities, endpoint validation, and aggregate checks in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is the exact active-policy conflict matrix with no implicit deactivation, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove policy exports and W12 integration while preserving existing evaluator, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test endpoint selection after assignment precedence, resource/public evaluation in both directions, policy filters/order/cursors, active option dependency blockers, generated refs, and Type activation integration; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 seam changes only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make policy slot normalization and conflict checks reusable by relation administration without changing mode semantics; acceptance evidence is stable normalized identities and unchanged evaluator results, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W12 refactor, estimate 12 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for foreign/out-of-endpoint options, directional ordered duplicates, reversed symmetric duplicates, inactive duplicate reservation, policy direction collision, inactive-policy inert relations, empty allowlist, empty denylist, and relation page filters/order; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement relation create/detail/list/update/activate/deactivate and normalized metadata updates in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is exact identity and lifecycle behavior with no partial writes or hard deletion, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove relation exports/derived use while preserving policy APIs and stored rows, estimate 52 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise relation evaluation in both directions, active/inactive option and policy dependencies, direction changes with collisions, cursor traversal, publication aggregate hooks, and legacy optional fields; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 relation integration only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Share normalized pair construction with canonicalization/evaluation and document preservation of legacy `politicaCompatibilidadId`/`tipoRelacion`; acceptance evidence is deterministic relation IDs and unchanged policy matrix, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoAdmin/compatibilidad.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W13 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add cross-seam regression tests proving active rows below inactive Class/Family/Type branches currently leak or resolve inconsistently, plus pure precedence matrices and dirty-data annotations; evidence is focused failures without changing existing call shapes, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only new W14 tests, estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement the shared effective resolver and adapt the four named public/resource seams while preserving validators, return shapes, historical reads, and backend authority; acceptance evidence is inert configuration excluded from public/runtime/publication output and all existing tests remain passing, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only seam adapters/resolver integration while retaining additive admin data and APIs, estimate 74 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Run every existing catalog/resource/identity/presentation/compatibility/publication suite plus new cross-aggregate tests for stale commands, bounded limits, legacy invalid active rows, false/zero/empty values, and no snapshot mutation; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only W14 seam adapters/tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Remove duplicate effective-state logic and enforce bounded indexed loader paths without changing existing public contracts; acceptance evidence is a code search showing one resolver path, stable regression results, and no new unbounded `.collect()`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W14 refactor only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add Convex/pure tests for explicit-only publication, inactive/missing organization, inert branch omission, one-invalid-Type all-or-nothing failure, ambiguous Type key, deterministic storage-order-independent hash, semantic token-order hash change, repeated `UNCHANGED`, changed `CREATED`, organization isolation, history pagination, and live-edit snapshot immutability; evidence is focused failures, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement `publicarCatalogo`, revision/history reads, canonicalization integration, bounded limit guards, and atomic revision/snapshot insertion in `convex/catalogoAdmin/publicacion.ts` and the existing publication seam; acceptance evidence is exact disposition/result fields, no writes on validation failure or unchanged content, and old snapshots byte-for-byte stable, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove new publish/history exports and leave all historical rows/old reads untouched, estimate 76 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify all aggregate validators, publication limits, Type-key ambiguity, organization ownership, descending cursor pages, historical direct reads, generated refs, and existing public latest/snapshot contracts; acceptance evidence is focused/full pass, `pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 admin publication entry point while preserving compiler/history storage and old reads, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep canonicalization independent of IDs/revisions/timestamps and isolate admin publication from legacy public functions; acceptance evidence is stable hashes, immutable history, no automatic publication from mutations, and no hard-delete export, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoAdmin/publicacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W15 refactor only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add the consumer fixture and contract assertions before static exports exist; evidence is the expected typecheck failure for `api.catalogoAdmin.*`, `FunctionArgs`/`FunctionReturnType`, pagination, publish result, IDs, and `AdminErrorData`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only `contract-tests/catalog-admin-consumer.ts` and fixture config, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add `convex.json` static API/data-model settings, package subpaths, and regenerate derived `convex/_generated/*`; acceptance evidence is the fixture typechecking without copied DTOs or backend-function execution, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove package/config exports and derived generated output only through the normal generation workflow, estimate 30 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck representative React-facing calls, all admin module references, result unions, cursor fields, IDs, and discriminated `AdminErrorData`; run `pnpm exec convex codegen --typecheck enable` and all Vitest/regression suites, with runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W16 package/fixture surfaces and retain backend behavior, estimate 20 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Document the pinned Git/private-package consumption path near the package exports without introducing a manual SDK/DTO layer; acceptance evidence is clean generated diff, unchanged public compatibility, and stable fixture typecheck, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W16 documentation/export cleanup, estimate 12 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] After apply, collect ordinary SDD status evidence by running `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `git diff --check`, and `git status --short` over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, and `contract-tests/**`; acceptance evidence is the recorded command/status output, including runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the verification/status record only, estimate 0 authored lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/complete-catalog-administration/tasks.md`; acceptance evidence is all RED/GREEN/TRIANGULATE/REFACTOR results recorded, no authored work unit exceeds 400 changed lines, and every rollback boundary remains actionable, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the lifecycle decision record only, estimate 0 authored lines. <!-- sdd-owner: parent -->

## Status produced

- Native status after checkbox persistence: `taskProgress.completed: 29`, `taskProgress.pending: 46`, `applyState: ready`, `verify: blocked`, `nextRecommended: apply`.
- This delegated executor recommends `parent-lifecycle` for orchestration; parent-owned verification/status and lifecycle rows remain untouched.

# Apply progress — W6

## Status and workload boundary

- Native status consumed: `openspec` authoritative; change `complete-catalog-administration`; `applyState: ready`; proposal, specs, design, tasks, and prior apply-progress present.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Active attempt continued with native token `sha256:3ec2e3282dea164d75a6913ae6dd0f64078ed0bf0313d84587a0f5669067c556`; bounds 2 attempts / 380 changed lines.
- Workload gate consumed: decision needed `No`; chained delivery `Yes`; strategy `stacked-to-main`; roadmap risk `High`, assigned W6 slice remains below the 400-line boundary.

## TDD Cycle Evidence

| Cycle | Exact evidence | Result |
|---|---|---|
| RED | Initial focused W6 command before implementation | Expected failure: missing `crearTipo`, `cargarAgregado`, and `validarAgregado` targets; existing W3-W5 tests remained green. |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/jerarquia.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts` | PASS — 3 files, 16 tests. |
| GREEN typecheck | `pnpm typecheck` | PASS — `tsc --noEmit`. |
| TRIANGULATE focused | W6 tests plus `convex/catalogoRecursos/catalogo.test.ts`, `recursos.test.ts`, and `catalogoPublicado.test.ts` | PASS — 6 files, 75 tests. |
| TRIANGULATE full | `pnpm exec vitest run` | PASS — 19 files, 153 tests. |
| TRIANGULATE/codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated bindings and TypeScript check completed. |
| TRIANGULATE runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account. |
| REFACTOR | Bounded loader helpers, dirty-row handling, ambiguity helper, then focused/full tests and typecheck | PASS — stable status/violation output. |
| Hygiene | `git diff --check` | PASS — no whitespace errors. |

## Completed W6 tasks and persisted checkbox updates

- W6 RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md`; the persisted artifact was re-read after the final checkbox update.
- Type administration now provides create, direct detail, bounded filtered list, mutable update, activate, and deactivate commands with revision-one creation, immutable Family/key echoes, scoped duplicate reservation, and no hard delete.
- Active Types below inactive Class/Family branches remain stored and are reported ineffective with `NOT_EVALUATED`; inert aggregate rows are not returned by the loader.
- Effective Type activation and parent Family/Class activation use bounded aggregate checks with coded principal-unit, inactive-unit, presentation, hierarchy, and limit violations; failures are transactional.
- Type deactivation uses the indexed `porTipoYActivo` resource blocker; stale revision checks precede no-op, blocker, and aggregate validation.
- Aggregate interfaces return `VALID|INVALID|NOT_EVALUATED`; bounded rows and global Type-key ambiguity support are exposed for later aggregate/publication slices.

## Files changed and rollback boundary

- `convex/catalogoAdmin/jerarquia.ts`
- `convex/catalogoAdmin/jerarquia.test.ts`
- `convex/catalogoAdmin/lib/cargarAgregado.ts`
- `convex/catalogoAdmin/lib/cargarAgregado.test.ts`
- `src/catalogoRecursos/dominio/validacionAgregado.ts`
- `src/catalogoRecursos/dominio/validacionAgregado.test.ts`
- `convex/_generated/api.d.ts` (normal codegen output only)
- `openspec/changes/complete-catalog-administration/tasks.md`
- `openspec/changes/complete-catalog-administration/apply-progress.md`
- Current W6 diff is approximately 324 authored changed lines (326 including the two generated binding lines), below the 380-attempt and 400-review-line limits; no oversized split was needed.
- Rollback boundary: remove W6 Type exports, aggregate loader/domain hook, W6 tests, and generated binding through normal codegen while retaining stored rows, Class/Family APIs, W2 metadata, and prior public behavior. No review, receipt, validation, commit, push, PR, or delivery gate was started.

## Deviations

- `validarComando.ts` was not created because it is outside the explicitly allowed edit surfaces; the bounded loader and pure validator provide the approved W6 hook boundary.
- Legacy hierarchy rows with no aggregate configuration remain `NOT_EVALUATED` during parent activation to preserve W3-W5 behavior; explicit malformed/partial aggregate rows return coded invalid status and block effective activation.

## Remaining tasks and deferred lifecycle actions

- The next implementation row is the unchanged W7 RED row: `- [ ] **RED** — Add pure precedence tests under `src/catalogoRecursos/dominio/unidadesEfectivas.test.ts` and Convex tests under `convex/catalogoAdmin/unidades.test.ts` ... <!-- sdd-owner: implementation -->`.
- Parent-owned rows remain byte-for-byte deferred: `- [ ] After apply, collect ordinary SDD status evidence ... <!-- sdd-owner: parent -->` and `- [ ] After post-apply verification, confirm the lifecycle gate ... <!-- sdd-owner: parent -->`.
- All W7-W16 implementation rows remain unchecked in `tasks.md`; no parent-owned task was selected or modified.

## Status produced

- Native status remains `applyState: ready` because later implementation tasks remain; final verification is blocked pending parent lifecycle approval.
- `nextRecommended: parent-lifecycle`; parent owns verification, receipts, delivery gates, and settle actions.

# Apply progress — W7

## Status consumed and boundary

- Native status: `spec-driven`, `openspec` authoritative, `applyState: ready`; change `complete-catalog-administration` and all proposal/spec/design/tasks artifacts present.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Active attempt continued with native token `sha256:6b3c6d427f8a7bcef84e93f15b15d802ee709918a6722f946a9a2d0876ff7209`; bound to 2 attempts / 380 changed lines. Workload gate was resolved `Decision needed before apply: No`, chained `stacked-to-main`; W7 stayed below the 400-line review boundary.

## TDD Cycle Evidence

| Cycle | Evidence | Result |
|---|---|---|
| RED | Added pure precedence and Convex lifecycle tests, then ran the focused command before implementation | Expected failures: missing resolver/admin module |
| GREEN | `pnpm exec vitest run src/catalogoRecursos/dominio/unidadesEfectivas.test.ts convex/catalogoAdmin/unidades.test.ts` | PASS — 2 files, 6 tests |
| TRIANGULATE | Focused W7 tests plus `cargarAgregado`, aggregate, hierarchy, catalog, resource, and publication regression tests | PASS — 6 files, 75 tests |
| TRIANGULATE full | `pnpm exec vitest run` | PASS — 21 files, 159 tests |
| Typecheck | `pnpm typecheck` | PASS — `tsc --noEmit` |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated API binding includes `catalogoAdmin/unidades` |
| Runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account |
| REFACTOR/hygiene | `git diff --check` | PASS — no whitespace errors |

## Completed tasks and persisted checkboxes

- W7 RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md`; the persisted tasks file was re-read after the update.
- Unit commands provide create/detail/list/update/activate/deactivate with immutable global keys, normalized descriptive fields, revisions, and active-resource/numeric/principal blockers.
- Policy commands provide create/detail/list/update/activate/deactivate with immutable references, duplicate identity reservation across lifecycle states, ownership checks, bounded indexed reads, and selected/shadowed/suppressed diagnostics.
- `resolverUnidadesEfectivas` is the single pure Type-over-Family precedence implementation: inactive Type overrides suppress inheritance per Unit while unrelated Family Units continue to inherit.
- Aggregate loading now uses the resolver before principal counting, preserving W6 effective hierarchy and bounded-row behavior; active aggregate failures remain transactional through Convex mutations.

## Files and rollback boundary

- Added `convex/catalogoAdmin/unidades.ts`, `convex/catalogoAdmin/unidades.test.ts`, `src/catalogoRecursos/dominio/unidadesEfectivas.ts`, and `src/catalogoRecursos/dominio/unidadesEfectivas.test.ts`.
- Updated `convex/catalogoAdmin/lib/cargarAgregado.ts`, generated `convex/_generated/api.d.ts`, this progress record, and only W7 task checkbox rows.
- Authored W7 diff is approximately 237 changed lines before this progress record, below the 380-attempt and 400-review-line limits; generated changes are derived only.
- Rollback boundary: remove the W7 unit/policy module and pure resolver/tests, revert the W7 aggregate-loader selection change and generated binding through normal codegen, and restore only the four W7 checkbox flips; retain schema metadata, stored rows, and W6 hierarchy APIs.

## Deviations and remaining work

- No schema change was needed because W2 already supplied the required unit-policy indexes and optional sort metadata.
- `validarComando.ts` remains outside the explicitly allowed W7 surfaces; validation is kept in the module over the shared pure resolver and W6 loader hook.
- Next unchecked implementation rows remain W8, beginning exactly with:
  - [ ] **RED** — Add failing Convex tests for nonnumeric Unit references, wrong-type options, duplicate definition/option identities including inactive rows, immutable owners, stale/no-op lifecycle, effective dependency blockers, and default ALL lists; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W8 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
  - [ ] **GREEN** — Implement definition and option create/detail/list/update/activate/deactivate commands in `convex/catalogoAdmin/atributos.ts` with indexed filters and reference validation; acceptance evidence is all ownership/type/identity/lifecycle scenarios passing with no hard delete, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove definition/option exports and W8-specific logic, estimate 54 authored lines. <!-- sdd-owner: implementation -->
  - [ ] **TRIANGULATE** — Integrate dependency checks against active assignments/rules/presentation/compatibility/resource values and verify inactive/parent-inert options never affect public behavior; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W8 integration only, estimate 30 authored lines. <!-- sdd-owner: implementation -->
  - [ ] **REFACTOR** — Share definition/option reference validators and stable scope ordering; acceptance evidence is unchanged coded errors and generated output only from codegen, focused command `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W8 refactor, estimate 16 authored lines. <!-- sdd-owner: implementation -->
- Parent-owned lifecycle rows remain unchanged and deferred byte-for-byte:
  - [ ] After apply, collect ordinary SDD status evidence by running `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `git diff --check`, and `git status --short` over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, and `contract-tests/**`; acceptance evidence is the recorded command/status output, including runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the verification/status record only, estimate 0 authored lines. <!-- sdd-owner: parent -->
  - [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/complete-catalog-administration/tasks.md`; acceptance evidence is all RED/GREEN/TRIANGULATE/REFACTOR results recorded, no authored work unit exceeds 400 changed lines, and every rollback boundary remains actionable, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the lifecycle decision record only, estimate 0 authored lines. <!-- sdd-owner: parent -->

## Status produced

- Native artifact status remains `applyState: ready` because W8–W16 implementation tasks remain; `verify` remains blocked pending parent lifecycle approval.
- `nextRecommended: parent-lifecycle`; no review, receipt, validation actor, commit, stage, push, PR, or delivery gate was started by this executor. The provider attempt settlement returned `complete` after the passed runtime evidence.

# Apply progress — W8

## Status consumed and workload boundary

- Native status consumed: `gentle-ai sdd-status complete-catalog-administration --cwd /home/garfex/PROGRAMACION/sistema-garfex --json`; `openspec` authoritative, `applyState: ready`, required proposal/spec/design/tasks/apply-progress present.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- The parent-provided active attempt token `sha256:331caa2224ea0fde7edee71f9844fe001300d7730d94cf903e0b58d8560f54d5` was authenticated with bounds of 2 attempts and 380 changed lines; no new attempt or settlement was started.
- Review workload gate consumed: `Decision needed before apply: No`; chained delivery `Yes`; chain strategy `stacked-to-main`; roadmap risk `High`, while W8 remained below the 400-line boundary.

## TDD Cycle Evidence

| Cycle | Exact evidence | Result |
|---|---|---|
| RED | `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts` before the module existed | Expected failure: missing `catalogoAdmin/atributos` module and API binding. |
| GREEN | `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts` | PASS — 1 file, 3 tests. |
| GREEN typecheck | `pnpm typecheck` | PASS — `tsc --noEmit`. |
| TRIANGULATE focused | `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts convex/catalogoRecursos/recursos.test.ts` | PASS — 2 files, 41 tests. |
| TRIANGULATE full | `pnpm exec vitest run && pnpm typecheck` | PASS — 22 files, 163 tests; TypeScript passed. |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated API binding includes `catalogoAdmin/atributos` and Convex TypeScript check completed. |
| Runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account. |
| REFACTOR | Shared typed entity references and common definition/option reference paths, followed by focused/full tests | PASS — behavior and generated bindings remained stable. |
| Hygiene | `git diff --check` | PASS — no whitespace errors. |

## Completed tasks and persisted checkbox updates

- W8 RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md`; the persisted tasks artifact was re-read after the final update.
- Definitions provide create, direct detail, indexed cursor list with default `ALL`, normalized descriptive updates, activation/deactivation, revision checks, immutable global keys, supported data types, and NUMERO-only Unit references.
- Options provide create, direct detail, indexed cursor list with default `ALL`, descriptive updates, activation/deactivation, revision checks, immutable definition/key ownership, scoped duplicate reservation across inactive rows, and inert effective annotations.
- Dependency checks cover effective assignments, rules, presentation tokens, compatibility endpoints/relations, and active resource values. Inactive hierarchy/definition/policy dependencies are ignored for blockers through effective Type checks.
- No hard-delete command was introduced. Generated `convex/_generated/api.d.ts` was retained as normal codegen output.

## Files changed and rollback boundary

- Added `convex/catalogoAdmin/atributos.ts` and `convex/catalogoAdmin/atributos.test.ts`.
- Updated `convex/_generated/api.d.ts`, `openspec/changes/complete-catalog-administration/tasks.md`, and this cumulative progress record.
- No changes were made to `cargarAgregado.ts`, its test, or `validacionAgregado.ts` because W8 dependency integration fit the existing bounded loader/reference seams.
- Authored implementation/test footprint is 179 lines before progress/task metadata; generated output is derived. The slice is below the 380-attempt and 400-review-line limits.
- Rollback boundary: remove the W8 attribute module/test and its generated API binding through normal codegen, restore only the four W8 checkbox flips, and retain W0–W7 rows, schema metadata, stored catalog records, and prior APIs. No review, receipt, validation actor, commit, stage, push, PR, or delivery gate was started.

## Deviations

- The requested allowed edit surfaces did not include `convex/schema.ts`; existing W2 indexes were sufficient, so no schema change was needed.
- W8 does not add assignment administration or alter existing public resource validation; those are W9/W14 boundaries. It supplies dependency blockers against their persisted rows without changing their APIs.
- The existing Vitest Vite `configLoader: native` warning and Convex AI-files notice were emitted but did not affect verification.

## Remaining tasks and deferred lifecycle actions

The exact unchecked implementation and parent-owned rows remain persisted in `tasks.md`:
- [ ] **RED** — Add pure and Convex tests for Type-over-Family selection, inactive suppression, forbidden/not-applicable value rejection, conditional optional baseline, option assignment completeness, cross-Family/definition references, duplicate inactive assignments, identity exclusion, and deterministic order ties; evidence is focused failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W9 tests, estimate 38 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement assignment commands/list/detail annotations and pure selection/order/value-bearing projection in the named files; acceptance evidence is exact precedence and applicability matrices, active option ownership, and atomic effective-aggregate validation, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove assignment exports/resolver integration while retaining W8 definitions/options, estimate 62 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise `Map.has` semantics for false, 0, and empty string through resource validation, identity aliases, public effective reads, cursor filters, and Type activation; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts src/catalogoRecursos/dominio/validarRecurso.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W9 assignment seam/tests only, estimate 32 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make order/definition-key/assignment-ID tie-breaking and selected/shadowed diagnostics single-source; acceptance evidence is repeated deterministic output and no frontend rule duplication, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W9 refactor, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure/Convex tests for false/zero/empty-string presence, conditional optional baseline, foreign assignment/option, self-target rejection, exact duplicate inactive identity, contradictory co-active rules, same-result rules, A→B/B→A cycle safety, and inert drafts; evidence is focused RED failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W10 tests, estimate 34 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement rule command/read lifecycle and pure one-pass evaluator/conflict checker in the named files; acceptance evidence is order-independent evaluation, `ADMIN_CONFLICT` for co-fire contradictions, and inactive rules omitted from effective/public output, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove rule exports/evaluator integration while retaining prior public behavior, estimate 56 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test active option/definition dependency deactivation, Type activation/publication aggregate hooks, rule filters/cursors, structured violations, and existing resource validation regression; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/reglas.test.ts src/catalogoRecursos/dominio/reglasCondicionales.test.ts src/catalogoRecursos/dominio/validarRecurso.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W10 seam changes only, estimate 26 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep raw-input rule semantics explicit and eliminate iteration-order dependence without introducing derived applicability dependencies; acceptance evidence is stable repeated evaluations and unchanged coded errors, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W10 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add pure/Convex tests for multiple drafts, second-active conflict, attribute-only invalid policy, foreign/inactive token references, token order preservation, missing optional omission, NFC/trim/whitespace normalization, option display name, numeric symbol, and empty final rendering; evidence is focused RED failures, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W11 tests, estimate 28 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement presentation policy lifecycle/reads in `convex/catalogoAdmin/presentacion.ts` and rendering/validation changes in the named domain module; acceptance evidence is exact replacement order (deactivate Type, draft, old policy, new policy, reactivate Type) with no implicit replacement, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove presentation exports/integration while preserving old renderer contract where possible, estimate 44 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify Type activation requires one valid effective policy, parent-inert policies are omitted from public/publication paths, detail preserves exact stored tokens, and cursor filter mismatch is structured; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/presentacion.test.ts src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W11 Type/publication hooks only, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Centralize normalization and token-reference validation while preserving semantic sequence; acceptance evidence is unchanged hashes/rendered names and no sorted token regression, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W11 refactor, estimate 10 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for non-option/foreign endpoints, directional reverse allowance, directional/symmetric conflicts, symmetric reverse conflict, mode-independent slot identity, empty allowlist rejection, empty denylist acceptance, inactive policy inertness, and stale/no-op lifecycle; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 tests, estimate 26 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement policy commands/reads, normalized slot identities, endpoint validation, and aggregate checks in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is the exact active-policy conflict matrix with no implicit deactivation, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove policy exports and W12 integration while preserving existing evaluator, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test endpoint selection after assignment precedence, resource/public evaluation in both directions, policy filters/order/cursors, active option dependency blockers, generated refs, and Type activation integration; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 seam changes only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make policy slot normalization and conflict checks reusable by relation administration without changing mode semantics; acceptance evidence is stable normalized identities and unchanged evaluator results, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W12 refactor, estimate 12 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for foreign/out-of-endpoint options, directional ordered duplicates, reversed symmetric duplicates, inactive duplicate reservation, policy direction collision, inactive-policy inert relations, empty allowlist, empty denylist, and relation page filters/order; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement relation create/detail/list/update/activate/deactivate and normalized metadata updates in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is exact identity and lifecycle behavior with no partial writes or hard deletion, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove relation exports/derived use while preserving policy APIs and stored rows, estimate 52 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise relation evaluation in both directions, active/inactive option and policy dependencies, direction changes with collisions, cursor traversal, publication aggregate hooks, and legacy optional fields; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 relation integration only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Share normalized pair construction with canonicalization/evaluation and document preservation of legacy `politicaCompatibilidadId`/`tipoRelacion`; acceptance evidence is deterministic relation IDs and unchanged policy matrix, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoAdmin/compatibilidad.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W13 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add cross-seam regression tests proving active rows below inactive Class/Family/Type branches currently leak or resolve inconsistently, plus pure precedence matrices and dirty-data annotations; evidence is focused failures without changing existing call shapes, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only new W14 tests, estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement the shared effective resolver and adapt the four named public/resource seams while preserving validators, return shapes, historical reads, and backend authority; acceptance evidence is inert configuration excluded from public/runtime/publication output and all existing tests remain passing, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only seam adapters/resolver integration while retaining additive admin data and APIs, estimate 74 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Run every existing catalog/resource/identity/presentation/compatibility/publication suite plus new cross-aggregate tests for stale commands, bounded limits, legacy invalid active rows, false/zero/empty values, and no snapshot mutation; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only W14 seam adapters/tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Remove duplicate effective-state logic and enforce bounded indexed loader paths without changing existing public contracts; acceptance evidence is a code search showing one resolver path, stable regression results, and no new unbounded `.collect()`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W14 refactor only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add Convex/pure tests for explicit-only publication, inactive/missing organization, inert branch omission, one-invalid-Type all-or-nothing failure, ambiguous Type key, deterministic storage-order-independent hash, semantic token-order hash change, repeated `UNCHANGED`, changed `CREATED`, organization isolation, history pagination, and live-edit snapshot immutability; evidence is focused failures, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement `publicarCatalogo`, revision/history reads, canonicalization integration, bounded limit guards, and atomic revision/snapshot insertion in `convex/catalogoAdmin/publicacion.ts` and the existing publication seam; acceptance evidence is exact disposition/result fields, no writes on validation failure or unchanged content, and old snapshots byte-for-byte stable, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove new publish/history exports and leave all historical rows/old reads untouched, estimate 76 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify all aggregate validators, publication limits, Type-key ambiguity, organization ownership, descending cursor pages, historical direct reads, generated refs, and existing public latest/snapshot contracts; acceptance evidence is focused/full pass, `pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 admin publication entry point while preserving compiler/history storage and old reads, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep canonicalization independent of IDs/revisions/timestamps and isolate admin publication from legacy public functions; acceptance evidence is stable hashes, immutable history, no automatic publication from mutations, and no hard-delete export, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoAdmin/publicacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W15 refactor only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add the consumer fixture and contract assertions before static exports exist; evidence is the expected typecheck failure for `api.catalogoAdmin.*`, `FunctionArgs`/`FunctionReturnType`, pagination, publish result, IDs, and `AdminErrorData`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only `contract-tests/catalog-admin-consumer.ts` and fixture config, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add `convex.json` static API/data-model settings, package subpaths, and regenerate derived `convex/_generated/*`; acceptance evidence is the fixture typechecking without copied DTOs or backend-function execution, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove package/config exports and derived generated output only through the normal generation workflow, estimate 30 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck representative React-facing calls, all admin module references, result unions, cursor fields, IDs, and discriminated `AdminErrorData`; run `pnpm exec convex codegen --typecheck enable` and all Vitest/regression suites, with runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W16 package/fixture surfaces and retain backend behavior, estimate 20 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Document the pinned Git/private-package consumption path near the package exports without introducing a manual SDK/DTO layer; acceptance evidence is clean generated diff, unchanged public compatibility, and stable fixture typecheck, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W16 documentation/export cleanup, estimate 12 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] After apply, collect ordinary SDD status evidence by running `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `git diff --check`, and `git status --short` over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, and `contract-tests/**`; acceptance evidence is the recorded command/status output, including runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the verification/status record only, estimate 0 authored lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/complete-catalog-administration/tasks.md`; acceptance evidence is all RED/GREEN/TRIANGULATE/REFACTOR results recorded, no authored work unit exceeds 400 changed lines, and every rollback boundary remains actionable, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the lifecycle decision record only, estimate 0 authored lines. <!-- sdd-owner: parent -->

Parent-owned rows remain deferred byte-for-byte to the parent lifecycle. `nextRecommended: parent-lifecycle`; final verification remains blocked until parent-owned lifecycle actions and later implementation work are handled.

## Status produced

- Native status after checkbox persistence: `taskProgress.completed: 41`, `taskProgress.pending: 34`, `applyState: ready`, `verify: blocked`, `nextRecommended: apply`.
- This delegated apply result recommends `parent-lifecycle`; the executor did not create/approve receipts, launch review/refutation/correction/validation actors, settle the active attempt, or perform delivery actions.

# Apply progress — W9

## Status consumed and workload boundary

- Native status was consumed before editing: `openspec` authoritative, `applyState: ready`, change `complete-catalog-administration`, `actionContext.mode: repo-local`, workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- The parent token `sha256:2bc4e76ebc889b527a44d65cad63db741a4c73e1b88f6e87eebfadb9802a8004` was authenticated for W9 with 2 attempts and 380 changed-line bounds; no size exception was used.
- Workload gate was resolved by the parent: `Decision needed before apply: No`, `Chained PRs recommended: Yes`, `Chain strategy: stacked-to-main`, roadmap `400-line budget risk: High`; this W9 slice stayed below the 380-attempt/400-authored-line boundary at approximately 220 authored additions/deletions including new files.

## TDD Cycle Evidence

| Cycle | Exact evidence | Result |
|---|---|---|
| RED | `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts convex/catalogoAdmin/atributos.test.ts` before implementation | Expected failures: missing pure module and assignment exports. |
| GREEN | Same focused command after pure resolver and assignment commands | PASS — 2 files, 7 tests. |
| GREEN typecheck | `pnpm typecheck` | PASS — `tsc --noEmit`. |
| TRIANGULATE | `pnpm exec vitest run src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts src/catalogoRecursos/dominio/validarRecurso.test.ts convex/catalogoAdmin/atributos.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts` | PASS — 5 files, 15 tests. |
| TRIANGULATE full | `pnpm exec vitest run` | PASS — 23 files, 170 tests. |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated bindings/typecheck completed; no generated diff was required because the existing module binding already covered the additive module. |
| Runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account. |
| REFACTOR | Reused the pure selection/order/projection helpers in resource validation and aggregate loading; focused and full evidence remained green. | PASS. |
| Hygiene | `git diff --check` | PASS — no output. |

A final post-settlement focused rerun after the narrow active-option scan correction also passed: 5 files/15 tests, `pnpm typecheck`, full 23-file/170-test suite, and `git diff --check`.

## W9 implementation and persisted task updates

- Added the pure Family/Type resolver, selected/shadowed/suppressed diagnostics, deterministic `orden`/definition-key/assignment-ID ordering, value-bearing projection, identity projection, conditional optional baseline, and active option completeness helper in `src/catalogoRecursos/dominio/asignacionesEfectivas.ts` with focused tests.
- Added assignment create/detail/list/update/activate/deactivate commands to `convex/catalogoAdmin/atributos.ts`, including immutable ownership/definition references, duplicate reservation across inactive rows, bounded indexed pagination, applicability and effective annotations, and atomic option-set validation.
- Updated domain resource validation to select Type assignments before filtering and use `Map.has` for required/forbidden checks, covering `false`, `0`, and empty string; aggregate loading now validates effective option assignment completeness.
- Updated `src/catalogoRecursos/dominio/validacionAgregado.ts` with assignment violation codes needed by the aggregate seam.
- W9 RED, GREEN, TRIANGULATE, and REFACTOR rows are visibly `- [x]` in the persisted `tasks.md`; W10 onward and both parent-owned rows remain unchecked and unchanged.

## Files changed and rollback boundary

- `convex/catalogoAdmin/atributos.ts`, `convex/catalogoAdmin/atributos.test.ts`.
- `src/catalogoRecursos/dominio/asignacionesEfectivas.ts`, `src/catalogoRecursos/dominio/asignacionesEfectivas.test.ts`.
- `src/catalogoRecursos/dominio/validarRecurso.ts`, `src/catalogoRecursos/dominio/validarRecurso.test.ts`.
- `convex/catalogoAdmin/lib/cargarAgregado.ts`, `src/catalogoRecursos/dominio/validacionAgregado.ts`.
- `openspec/changes/complete-catalog-administration/tasks.md` and this cumulative progress record.
- No changes were staged, committed, pushed, or reviewed; the parent token was settled with passed evidence after runtime completion, and no generated file was hand-edited.
- Rollback is the W9 boundary: remove the assignment exports/tests and pure resolver/tests, revert only the W9 aggregate/resource-validation seam changes, and restore the four W9 checkbox flips; retain W8 definitions/options and all stored rows.

## Remaining tasks and deferred lifecycle actions

- The exact next unchecked implementation row is: `- [ ] **RED** — Add pure/Convex tests for false/zero/empty-string presence, conditional optional baseline, foreign assignment/option, self-target rejection, exact duplicate inactive identity, contradictory co-active rules, same-result rules, A→B/B→A cycle safety, and inert drafts; ... <!-- sdd-owner: implementation -->` in `tasks.md` (W10); all W10–W16 rows remain there byte-for-byte.
- Parent-owned rows remain deferred unchanged: `- [ ] After apply, collect ordinary SDD status evidence ... <!-- sdd-owner: parent -->` and `- [ ] After post-apply verification, confirm the lifecycle gate ... <!-- sdd-owner: parent -->`.
- Current native status after persistence: `taskProgress.completed: 45`, `taskProgress.pending: 30`, `applyState: ready`, `verify: blocked`, `nextRecommended: apply`; this executor returns `parent-lifecycle`.
- No review, receipt, refutation, correction, validation actor, delivery gate, commit, stage, push, or PR action was started by this executor; the required native attempt settlement completed with state `complete`.

# Apply progress — W10

## Status consumed and workload boundary

- Native status: `spec-driven`, `openspec` authoritative, `applyState: ready`, change `complete-catalog-administration`.
- `actionContext`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Parent token `sha256:b42dcbebbddef30ca8fdfff4811e4d7a53e7e3618568e79e3d9787a9ebf8827e` authenticated W10 with 2 attempts and 380 changed-line bounds.
- Workload gate resolved: decision `No`; chained delivery `Yes`, `stacked-to-main`; W10 stayed below the 400-line boundary.

## TDD Cycle Evidence

| Cycle | Evidence | Result |
|---|---|---|
| RED | W10 focused tests before implementation | Expected missing-module/API failures |
| GREEN | `pnpm exec vitest run src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/reglas.test.ts` | PASS — 2 files, 5 tests |
| TRIANGULATE | Focused rules/resource/aggregate tests plus typecheck | PASS — 5 files, 11 tests; `tsc --noEmit` passed |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — retained generated `catalogoAdmin/reglas` binding |
| Runtime | `pnpm exec convex dev --once` | PASS — local functions ready on port 3210; no linked account |
| REFACTOR | `pnpm exec vitest run && pnpm typecheck` | PASS — 25 files, 176 tests; typecheck passed |
| Hygiene | `git diff --check` | PASS — no output |

## W10 implementation and checkbox evidence

- Added rule lifecycle/read commands, immutable identity, selected Type references, option ownership, duplicate inactive reservation, cursor/filter reads, effective annotations, and structured conflicts.
- Added pure raw-presence evaluation, CONDITIONAL optional baseline, deterministic one-pass order, co-fire conflict detection, same-result support, inactive filtering, and cycle safety.
- Wired rule evaluation into resource validation and rule violations into bounded Type aggregate loading.
- W10 RED, GREEN, TRIANGULATE, and REFACTOR are visibly `- [x]` in `tasks.md`; W11 onward and parent rows remain unchanged.

## Files and rollback boundary

- Changed: `convex/catalogoAdmin/reglas.ts`, both W10 tests, `src/catalogoRecursos/dominio/reglasCondicionales.ts`, `validarRecurso.ts`, `validarRecurso.test.ts`, `convex/catalogoAdmin/lib/cargarAgregado.ts`, `validacionAgregado.ts`, and generated `convex/_generated/api.d.ts`.
- Rollback removes W10 rule modules/tests and reverts only W10 evaluator, aggregate, resource-validation, violation-code, and generated-binding changes; W9 behavior and stored rows remain.
- No hard-delete or derived-applicability dependency was introduced.

## Remaining exact unchecked rows

- [ ] W11 implementation rows — exact persisted lines remain in `tasks.md`.
- [ ] W12 implementation rows — exact persisted lines remain in `tasks.md`.
- [ ] W13 implementation rows — exact persisted lines remain in `tasks.md`.
- [ ] W14 implementation rows — exact persisted lines remain in `tasks.md`.
- [ ] W15 implementation rows — exact persisted lines remain in `tasks.md`.
- [ ] W16 implementation rows — exact persisted lines remain in `tasks.md`.

## Deferred parent lifecycle actions

- [ ] After apply, collect ordinary SDD status evidence ... <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate ... <!-- sdd-owner: parent -->

## Status produced

- W10 implementation tasks are complete; later implementation rows and parent lifecycle rows remain pending.
- Native status remains `applyState: ready`, `verify: blocked`, `nextRecommended: apply`; this executor recommends `parent-lifecycle`.
- No review, receipt, verification actor, correction, validation, commit, stage, push, PR, or delivery gate was started.

# Apply progress — W11

## Status consumed and workload boundary

- Native status was consumed before editing: `openspec` authoritative, change `complete-catalog-administration`, `applyState: ready`, all proposal/spec/design/tasks artifacts present.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Parent token `sha256:104045666dd2655f7f501d5adebabf9088cda265f27cfa2890c475a4d3145072` was authenticated for W11 with 2 attempts and 380 changed-line bounds. The chained `stacked-to-main` delivery decision was already resolved; no exception was used.
- Workload gate: `Decision needed before apply: No`; chained PRs `Yes`; roadmap risk `High`, but this W11 slice remained below the 400-line review boundary.

## TDD Cycle Evidence

| Cycle | Exact evidence | Result |
|---|---|---|
| RED | `pnpm exec vitest run src/catalogoRecursos/dominio/presentacionCanonica.test.ts convex/catalogoAdmin/presentacion.test.ts` before implementation | Expected Convex module-resolution failures; pure baseline passed. |
| GREEN | Same focused command after presentation module/domain implementation | PASS — 2 files, 11 tests. |
| TRIANGULATE | `pnpm exec vitest run convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts convex/catalogoAdmin/presentacion.test.ts src/catalogoRecursos/dominio/presentacionCanonica.test.ts` | PASS — 4 files, 33 tests. |
| TRIANGULATE full | `pnpm exec vitest run` | PASS — 26 files, 181 tests. |
| Typecheck | `pnpm typecheck` | PASS — root `tsc --noEmit`. |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated API binding retained. |
| Runtime | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account. |
| REFACTOR | Focused W11 command plus `pnpm typecheck` after normalization/token-validation centralization | PASS. |
| Hygiene | `git diff --check` | PASS — no output. |

## W11 implementation and persisted checkbox evidence

- Added canonical presentation policy create/detail/list/update/activate/deactivate operations with bounded tokens/separators/literals, immutable Type ownership, revision checks, active-slot conflict protection, sole-policy deactivation protection, and explicit replacement sequencing.
- Added centralized NFC/trim/whitespace normalization and structural/token-reference validation without sorting token arrays; inactive drafts remain inspectable and stored token order/references are returned unchanged in detail.
- Extended aggregate validation so effective Type activation rejects invalid active presentation policies and parent-inert configuration remains `NOT_EVALUATED`; existing public catalog regression paths remain green.
- Extended pure rendering for optional-token omission, option display names, numeric unit symbols, normalized names/separators, semantic order, and explicit empty final output.
- W11 RED, GREEN, TRIANGULATE, and REFACTOR rows are visibly `- [x]` in the persisted `tasks.md`; W12-W16 and parent-owned rows remain unchecked.

## Files and rollback boundary

- Changed: `convex/catalogoAdmin/presentacion.ts`, `convex/catalogoAdmin/presentacion.test.ts`, `src/catalogoRecursos/dominio/presentacionCanonica.ts`, `src/catalogoRecursos/dominio/presentacionCanonica.test.ts`, `convex/catalogoAdmin/lib/cargarAgregado.ts`, `src/catalogoRecursos/dominio/validacionAgregado.ts`, and generated `convex/_generated/api.d.ts`.
- Rollback boundary: remove the W11 presentation module/tests and generated binding through normal codegen, revert the W11 aggregate-validator/loader seam changes, and restore only the four W11 checkbox flips; retain W0-W10 behavior and stored catalog rows. No hard deletion, implicit replacement, review, receipt, validation actor, commit, stage, push, PR, or delivery action was performed.
- Authored implementation/test changes stayed below the 380-attempt and 400-review-line boundaries; generated output was retained only from normal codegen.

## Remaining exact unchecked rows

- [ ] **RED** — Add failing tests for non-option/foreign endpoints, directional reverse allowance, directional/symmetric conflicts, symmetric reverse conflict, mode-independent slot identity, empty allowlist rejection, empty denylist acceptance, inactive policy inertness, and stale/no-op lifecycle; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 tests, estimate 26 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement policy commands/reads, normalized slot identities, endpoint validation, and aggregate checks in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is the exact active-policy conflict matrix with no implicit deactivation, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove policy exports and W12 integration while preserving existing evaluator, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Test endpoint selection after assignment precedence, resource/public evaluation in both directions, policy filters/order/cursors, active option dependency blockers, generated refs, and Type activation integration; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/recursos.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W12 seam changes only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Make policy slot normalization and conflict checks reusable by relation administration without changing mode semantics; acceptance evidence is stable normalized identities and unchanged evaluator results, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W12 refactor, estimate 12 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add failing tests for foreign/out-of-endpoint options, directional ordered duplicates, reversed symmetric duplicates, inactive duplicate reservation, policy direction collision, inactive-policy inert relations, empty allowlist, empty denylist, and relation page filters/order; evidence is focused RED failures, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 tests, estimate 30 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement relation create/detail/list/update/activate/deactivate and normalized metadata updates in `convex/catalogoAdmin/compatibilidad.ts`; acceptance evidence is exact identity and lifecycle behavior with no partial writes or hard deletion, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove relation exports/derived use while preserving policy APIs and stored rows, estimate 52 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Exercise relation evaluation in both directions, active/inactive option and policy dependencies, direction changes with collisions, cursor traversal, publication aggregate hooks, and legacy optional fields; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W13 relation integration only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Share normalized pair construction with canonicalization/evaluation and document preservation of legacy `politicaCompatibilidadId`/`tipoRelacion`; acceptance evidence is deterministic relation IDs and unchanged policy matrix, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoAdmin/compatibilidad.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W13 refactor, estimate 14 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add cross-seam regression tests proving active rows below inactive Class/Family/Type branches currently leak or resolve inconsistently, plus pure precedence matrices and dirty-data annotations; evidence is focused failures without changing existing call shapes, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only new W14 tests, estimate 40 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement the shared effective resolver and adapt the four named public/resource seams while preserving validators, return shapes, historical reads, and backend authority; acceptance evidence is inert configuration excluded from public/runtime/publication output and all existing tests remain passing, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only seam adapters/resolver integration while retaining additive admin data and APIs, estimate 74 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Run every existing catalog/resource/identity/presentation/compatibility/publication suite plus new cross-aggregate tests for stale commands, bounded limits, legacy invalid active rows, false/zero/empty values, and no snapshot mutation; acceptance evidence is focused/full pass, `pnpm typecheck`, codegen, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert only W14 seam adapters/tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Remove duplicate effective-state logic and enforce bounded indexed loader paths without changing existing public contracts; acceptance evidence is a code search showing one resolver path, stable regression results, and no new unbounded `.collect()`, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoEfectivo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W14 refactor only, estimate 24 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add Convex/pure tests for explicit-only publication, inactive/missing organization, inert branch omission, one-invalid-Type all-or-nothing failure, ambiguous Type key, deterministic storage-order-independent hash, semantic token-order hash change, repeated `UNCHANGED`, changed `CREATED`, organization isolation, history pagination, and live-edit snapshot immutability; evidence is focused failures, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 tests, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Implement `publicarCatalogo`, revision/history reads, canonicalization integration, bounded limit guards, and atomic revision/snapshot insertion in `convex/catalogoAdmin/publicacion.ts` and the existing publication seam; acceptance evidence is exact disposition/result fields, no writes on validation failure or unchanged content, and old snapshots byte-for-byte stable, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove new publish/history exports and leave all historical rows/old reads untouched, estimate 76 authored lines. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Verify all aggregate validators, publication limits, Type-key ambiguity, organization ownership, descending cursor pages, historical direct reads, generated refs, and existing public latest/snapshot contracts; acceptance evidence is focused/full pass, `pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm exec vitest run convex/catalogoAdmin/publicacion.test.ts src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove W15 admin publication entry point while preserving compiler/history storage and old reads, estimate 42 authored lines. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Keep canonicalization independent of IDs/revisions/timestamps and isolate admin publication from legacy public functions; acceptance evidence is stable hashes, immutable history, no automatic publication from mutations, and no hard-delete export, focused command `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoAdmin/publicacion.test.ts`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W15 refactor only, estimate 20 authored lines. <!-- sdd-owner: implementation -->
- [ ] **RED** — Add the consumer fixture and contract assertions before static exports exist; evidence is the expected typecheck failure for `api.catalogoAdmin.*`, `FunctionArgs`/`FunctionReturnType`, pagination, publish result, IDs, and `AdminErrorData`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only `contract-tests/catalog-admin-consumer.ts` and fixture config, estimate 18 authored lines. <!-- sdd-owner: implementation -->
- [ ] **GREEN** — Add `convex.json` static API/data-model settings, package subpaths, and regenerate derived `convex/_generated/*`; acceptance evidence is the fixture typechecking without copied DTOs or backend-function execution, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove package/config exports and derived generated output only through the normal generation workflow, estimate 30 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE** — Typecheck representative React-facing calls, all admin module references, result unions, cursor fields, IDs, and discriminated `AdminErrorData`; run `pnpm exec convex codegen --typecheck enable` and all Vitest/regression suites, with runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback remove only W16 package/fixture surfaces and retain backend behavior, estimate 20 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR** — Document the pinned Git/private-package consumption path near the package exports without introducing a manual SDK/DTO layer; acceptance evidence is clean generated diff, unchanged public compatibility, and stable fixture typecheck, focused command `pnpm typecheck`, full command `pnpm exec vitest run && pnpm typecheck`, rollback revert W16 documentation/export cleanup, estimate 12 authored lines plus derived output excluded from forecast. <!-- sdd-owner: implementation -->
- [ ] After apply, collect ordinary SDD status evidence by running `sdd-verify`, `pnpm exec vitest run`, `pnpm typecheck`, `git diff --check`, and `git status --short` over `convex/catalogoAdmin/**`, `convex/schema.ts`, `src/catalogoRecursos/**`, `convex/_generated/*`, and `contract-tests/**`; acceptance evidence is the recorded command/status output, including runtime `pnpm exec convex dev --once` or `N/A — no deployment available`, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the verification/status record only, estimate 0 authored lines. <!-- sdd-owner: parent -->
- [ ] After post-apply verification, confirm the lifecycle gate in `openspec/changes/complete-catalog-administration/tasks.md`; acceptance evidence is all RED/GREEN/TRIANGULATE/REFACTOR results recorded, no authored work unit exceeds 400 changed lines, and every rollback boundary remains actionable, focused command `git diff --check`, full command `pnpm exec vitest run && pnpm typecheck`, rollback boundary is the lifecycle decision record only, estimate 0 authored lines. <!-- sdd-owner: parent -->

## Status produced

- Native status after checkbox persistence: `taskProgress.completed: 53`, `taskProgress.pending: 22`, `applyState: ready`, `verify: blocked`, `nextRecommended: apply`; final verification is not claimed because later implementation and parent lifecycle rows remain.
- The authenticated W11 attempt was settled `passed` with evidence revision `sha256:994fd298ff8cbbc88e1f1ab3c17851400db6aa4051785ab14b529aab6d227030`.
- This executor recommends `parent-lifecycle`; it did not create/approve receipts, launch review/refutation/correction/validation actors, or perform delivery actions.

# Apply progress — W12

## Status consumed

- Native status: `openspec` authoritative; `changeName: complete-catalog-administration`; `applyState: ready`; proposal, specs, design, tasks, and cumulative apply progress present.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Active bounded attempt continued with token `sha256:913ef608c7317b120372601fa3b196167793d19b80e272f1debbf073b2b2b53d`; bounds 2 attempts / 380 changed lines; delivery boundary W12 on `sdd/catalog-admin-w12`, stacked on W11.
- Workload gate: decision needed `No`; chained delivery `Yes`; strategy `stacked-to-main`; roadmap risk `High`, W12 slice remained within the requested boundary.

## W12 implementation evidence

- Added compatibility policy lifecycle/detail/list/update/activate/deactivate commands with optimistic revision/no-op behavior and no hard deletion.
- Added effective endpoint validation through Type assignment precedence, distinct endpoint checks, OPCION definition checks, active option-set checks, and hierarchy inertness annotations.
- Added reusable directional/symmetric slot identity and conflict predicates. Directional reverse slots coexist; symmetric reverse and directional/symmetric overlaps conflict; mode is excluded from identity.
- Added active allowlist nonempty enforcement, empty denylist acceptance, inactive-policy inertness, normalized metadata, filtered cursor reads, and generated API references.
- Extended aggregate loading/validation so active compatibility policies participate in Type completeness checks without affecting inert branches.
- Pure evaluation now ignores explicitly inactive policies, preserves directional scope, evaluates symmetric calls in both directions, and rejects empty active allowlists.

## TDD Cycle Evidence

| Cycle | Exact evidence | Result |
|---|---|---|
| RED | `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` before implementation | Expected failures: missing admin module and missing normalization exports |
| GREEN | Same focused command after implementation | PASS — 2 files, 10 tests |
| GREEN aggregate seam | `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts src/catalogoRecursos/dominio/validacionAgregado.test.ts` | PASS — 3 files, 12 tests |
| TRIANGULATE focused/regression | `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/recursos.test.ts` | PASS — 3 files, 47 tests |
| TRIANGULATE public | `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/catalogo.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts` | PASS — 4 files, 32 tests |
| TRIANGULATE full/typecheck | `pnpm exec vitest run`; `pnpm typecheck` | PASS — 27 files, 186 tests; `tsc --noEmit` passed |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated bindings and TypeScript validation completed |
| Runtime boundary | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked account |
| REFACTOR | Reused exported slot normalization/conflict helpers and reran focused/full evidence | PASS — behavior and evaluator results unchanged |
| Hygiene | `git diff --check` | PASS — no output |

## Completed tasks and persisted checkboxes

- W12 RED, GREEN, TRIANGULATE, and REFACTOR are marked `- [x]` in `tasks.md`.
- Only W12 implementation rows were checked; W13–W16 implementation rows and both parent-owned lifecycle rows remain deferred.

## Files changed and rollback boundary

- `convex/catalogoAdmin/compatibilidad.ts` and `convex/catalogoAdmin/compatibilidad.test.ts`: policy administration and focused Convex tests.
- `src/catalogoRecursos/dominio/compatibilidadOpciones.ts` and its test: reusable slot/pair normalization, conflict matrix, inactive filtering, and pure evaluation evidence.
- `convex/catalogoAdmin/lib/cargarAgregado.ts` and `src/catalogoRecursos/dominio/validacionAgregado.ts`: active compatibility aggregate checks.
- `convex/_generated/api.d.ts`: retained normal codegen additions for `catalogoAdmin.compatibilidad`.
- `openspec/changes/complete-catalog-administration/tasks.md`: four W12 checkbox updates only.
- Authored W12 changes are below the 380-attempt/400-review-line boundary; generated output is derived and excluded from authored estimates.
- Rollback: remove W12 compatibility policy exports/tests and compatibility aggregate seam changes, restore the four W12 checkbox flips, and retain prior W11 behavior and generated output only through normal codegen. No rows, relations, snapshots, or revisions are deleted.

## Remaining tasks and deferred lifecycle

- Exact next implementation slice: W13 — Compatibility relations and normalization; all four W13 rows remain unchecked.
- W14–W16 implementation rows remain unchecked.
- Parent-owned lifecycle rows remain byte-for-byte unchanged and deferred to the parent lifecycle.
- `nextRecommended`: `parent-lifecycle`; this executor did not start review, receipt, refutation, correction, validation, commit, push, PR, or settle actions.

## W12 final evidence amendment

- Reordered active-policy validation so a directional/symmetric slot collision reports `ADMIN_CONFLICT` before an empty-allowlist aggregate error; this preserves the exact conflict matrix independent of policy mode/content.
- Final focused/regression run: `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts convex/catalogoRecursos/recursos.test.ts` — PASS, 3 files / 47 tests.
- Final full run: `pnpm exec vitest run` — PASS, 27 files / 186 tests.
- Final contract/runtime run: `pnpm exec convex codegen --typecheck enable && pnpm exec convex dev --once && pnpm typecheck && git diff --check` — PASS; local functions ready, `tsc --noEmit` passed, diff clean.
- Re-read persisted tasks: W12 implementation rows are visibly `- [x]`; native status reports `taskProgress.completed: 57`, `pending: 18`, `applyState: ready`, `verify: blocked`, `nextRecommended: apply`. Later implementation and parent lifecycle rows remain, so this phase returns `parent-lifecycle`.

# Apply progress — W13

## Status consumed and workload boundary

- Native status was consumed before editing: `openspec` authoritative, `changeName: complete-catalog-administration`, `applyState: ready`; proposal, all specs, design, tasks, and cumulative apply progress were present.
- `actionContext.mode`: `repo-local`; workspace and allowed edit root `/home/garfex/PROGRAMACION/sistema-garfex`; warnings: none.
- Active bounded attempt was authenticated with token `sha256:b7f79ef925b7b22eb91cf0ac9a83dff2b20a199bff83a0145d0d6f26f8ed3bed`; bounds 2 attempts / 380 changed lines; delivery boundary W13 on `sdd/catalog-admin-w13`, stacked on W12.
- Workload gate: `Decision needed before apply: No`; chained delivery `Yes`; strategy `stacked-to-main`; roadmap risk `High`, while this W13 slice remained below the 400-line boundary.

## W13 implementation evidence

- Added relation create/detail/list/update/activate/deactivate Convex commands with optimistic revision checks, immutable policy/option echoes, no hard delete, and transactional validation before writes.
- Enforced endpoint ownership, symmetric reverse input acceptance, active-option requirements on activation, duplicate reservation across inactive relations, inactive-policy inertness annotations, and policy direction collision checks.
- Added relation normalized metadata and deterministic normalized identities. Symmetric normalization orders endpoint identities and moves the corresponding option IDs together; legacy optional `politicaCompatibilidadId` and `tipoRelacion` fields are never rewritten.
- Added relation list filters for policy/options/state with opaque cursor binding, plus pure normalized-pair helpers and bidirectional directional/symmetric evaluator coverage.
- W13 RED, GREEN, TRIANGULATE, and REFACTOR rows are visibly `- [x]` in the persisted `tasks.md`; W14-W16 and both parent-owned lifecycle rows remain unchecked.

## TDD Cycle Evidence

| Cycle | Exact evidence | Result |
|---|---|---|
| RED | `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` before implementation | Expected failures: missing relation exports and missing normalized-pair helper. |
| GREEN | Same focused command after relation lifecycle implementation | PASS — 2 files, 14 tests. |
| TRIANGULATE focused | `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` | PASS — 2 files, 17 tests. |
| TRIANGULATE regressions | `pnpm exec vitest run convex/catalogoRecursos/recursos.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts` | PASS — 2 files, 48 tests. |
| TRIANGULATE full/typecheck | `pnpm exec vitest run`; `pnpm typecheck` | PASS — 27 files, 192 tests; root `tsc --noEmit` passed. |
| Codegen | `pnpm exec convex codegen --typecheck enable` | PASS — generated bindings and TypeScript validation completed; no incidental generated diff remained. |
| Runtime boundary | `pnpm exec convex dev --once` | PASS — local Convex functions ready on port 3210; no linked Convex account. |
| REFACTOR | Endpoint-aware canonical pair normalization plus focused tests/typecheck | PASS — deterministic identities and prior policy evaluator matrix preserved. |
| Hygiene | `git diff --check` | PASS — no output. |

## Files and rollback boundary

- Changed: `convex/catalogoAdmin/compatibilidad.ts`, `convex/catalogoAdmin/compatibilidad.test.ts`, `src/catalogoRecursos/dominio/compatibilidadOpciones.ts`, `src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`, `openspec/changes/complete-catalog-administration/tasks.md`, and this cumulative progress file.
- `convex/_generated/api.d.ts` was included in the allowed generated surface but required no new diff because the compatibility module binding already existed from W12; codegen was run normally.
- Authored diff is 207 changed lines before the progress/task record, below the requested 380-attempt and 400-review-line limits.
- Rollback boundary: remove W13 relation exports/tests and endpoint-aware normalization helpers, restore only the four W13 checkbox flips, and retain W12 policy APIs, stored rows, legacy optional metadata, and prior evaluator behavior. No relation, policy, revision, snapshot, stage, commit, push, PR, review, receipt, or delivery action was performed.

## Remaining exact unchecked rows and deferred lifecycle

- W14, W15, and W16 implementation rows remain unchecked in `tasks.md`; their exact persisted lines are unchanged.
- Parent-owned rows remain byte-for-byte unchanged and deferred: `After apply, collect ordinary SDD status evidence... <!-- sdd-owner: parent -->` and `After post-apply verification, confirm the lifecycle gate... <!-- sdd-owner: parent -->`.
- Native status after persistence: `taskProgress.completed: 61`, `pending: 14`, `applyState: ready`, `verify: blocked`, `nextRecommended: apply`.
- This executor recommends `parent-lifecycle`; final verification, review, receipts, refutation, correction, validation, settle, and delivery actions remain parent-owned.

## W13 final evidence amendment

- Final focused run: `pnpm exec vitest run convex/catalogoAdmin/compatibilidad.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` — PASS, 2 files / 17 tests.
- Final required boundary run: `pnpm exec vitest run && pnpm typecheck && pnpm exec convex codegen --typecheck enable && pnpm exec convex dev --once && git diff --check` — PASS, 27 files / 193 tests; root typecheck, codegen, local runtime readiness, and diff hygiene passed.
- Re-read persisted W13 rows: all four implementation checkboxes are visibly `- [x]`; native status remains `taskProgress.completed: 61`, `pending: 14`, `applyState: ready`, `verify: blocked`, `nextRecommended: apply` because W14-W16 and parent lifecycle rows remain.
