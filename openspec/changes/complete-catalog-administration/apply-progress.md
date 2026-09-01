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
