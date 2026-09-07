# Apply Progress: add-selection-only-resource-creation

## Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
planningHome:
  root: /home/garfex/PROGRAMACION/sistema-garfex/openspec
  changesDir: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes
changeRoot: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes/add-selection-only-resource-creation
artifactPaths:
  proposal: [proposal.md]
  specs: [specs/catalog-attributes/spec.md, specs/catalog-conditional-rules/spec.md, specs/catalog-publication/spec.md, specs/resource-admin-contracts/spec.md, specs/resource-admin-writes/spec.md]
  design: [design.md]
  tasks: [tasks.md]
  applyProgress: [apply-progress.md]
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
taskProgress:
  total: 48
  complete: 3
  remaining: 45
  unchecked:
    - "- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->"
deferredParentActions:
  total: 2
  complete: 0
  remaining: 2
  unchecked:
    - "Start or reuse a bounded review across PR 1–PR 6 after implementation evidence is available."
    - "Confirm the final verification receipt contains the required full checks and evidence."
taskArtifactErrors: []
applyState: ready
dependencies:
  apply: ready
  verify: ready
  sync: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots:
    - /home/garfex/PROGRAMACION/sistema-garfex/src/catalogoRecursos/dominio/modoCaptura.ts
    - /home/garfex/PROGRAMACION/sistema-garfex/src/catalogoRecursos/dominio/modoCaptura.test.ts
    - /home/garfex/PROGRAMACION/sistema-garfex/src/catalogoRecursos/dominio/tipos.ts
    - /home/garfex/PROGRAMACION/sistema-garfex/convex/schema.ts
    - /home/garfex/PROGRAMACION/sistema-garfex/convex/catalogoAdmin/atributos.ts
    - /home/garfex/PROGRAMACION/sistema-garfex/convex/catalogoAdmin/atributos.test.ts
    - /home/garfex/PROGRAMACION/sistema-garfex/convex/catalogoAdmin/lib/cargarAgregado.ts
    - /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes/add-selection-only-resource-creation
  warnings:
    - "Native status was supplied as ready; this shape was reconstructed from the authoritative OpenSpec artifacts and delegated edit roots."
nextRecommended: apply
isNonAuthoritative: false
```

## Work unit 1 — Capture-mode compatibility seam

Completed implementation tasks and persisted checkbox evidence:

- `[x] RED`: added fallback, explicit projection, and `DERIVADO` rejection cases.
- `[x] GREEN`: added the optional storage field, domain type/resolver, and explicit create/update/detail projection.
- `[x] REFACTOR/VERIFY`: all fallback reads use `resolverModoCaptura`; focused and full verification passed.

The following assigned line remains unchecked because it depends on Work unit 2's `valoresPermitidosAtributo` model and active-valid-value semantics; no placeholder aggregate rule was added:

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->

All Work units 2–12 remain unchecked and were not edited. Parent-owned lifecycle rows remain byte-for-byte unchanged.

### Files changed

- `src/catalogoRecursos/dominio/modoCaptura.ts`
- `src/catalogoRecursos/dominio/modoCaptura.test.ts`
- `src/catalogoRecursos/dominio/tipos.ts`
- `convex/schema.ts`
- `convex/catalogoAdmin/atributos.ts`
- `convex/catalogoAdmin/atributos.test.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU1 RED/GREEN | `modoCaptura.test.ts`, `atributos.test.ts` | Unit + Convex integration | `atributos.test.ts`: 6/6 passed | Both new expectations failed: missing resolver and unsupported `modoCaptura` argument | 8/8 focused tests passed | 11/11 focused tests passed for legacy fallback, explicit mode, revisioned transition, and rejection/no-write | Fallback is centralized in `resolverModoCaptura`; no further refactor was needed |
| WU1 aggregate transition | `atributos.test.ts` | Convex integration | Covered above | Not added dishonestly | Deferred | Deferred until WU2 creates active allowed-value authority | Deferred dependency recorded; checkbox remains unchecked |

### Verification evidence

- `pnpm exec vitest run src/catalogoRecursos/dominio/modoCaptura.test.ts convex/catalogoAdmin/atributos.test.ts` — 11 tests passed in 2 files.
- `pnpm exec vitest run` — 352 tests passed in 36 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Convex-test runtime scenario: definition create projects an explicit mode; direct legacy no-mode rows project the fallback; a revisioned inactive transition updates to revision 2; `DERIVADO` rejects without a row write.
- `pnpm exec convex dev --once` — not run because no deployment validation was available or required for this additive local slice.

### Workload and rollback boundary

PR 1 / Work unit 1 only, for the accepted `stacked-to-main` chain. The authored implementation diff is 90 additions and 7 deletions before OpenSpec progress/task bookkeeping, within the 400-line attempt limit. Rollback is limited to optional `modoCaptura` storage, the fallback reader, and its admin projection; it does not alter legacy Resource inputs, values, options, or creators.

### Deviations and risks

- `cargarAgregado.ts` was intentionally not changed: enforcing an effective `SELECCION` transition requires active valid allowed values, which do not exist until Work unit 2.
- Existing unrelated modifications named in the delegation were preserved; no generated Convex declaration was hand-edited.

## Work unit 2 — Typed allowed-value storage and admin lifecycle seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: ready
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: consumed from delegated prompt
warnings:
  - Existing unrelated modifications were preserved.
  - Ordered pagination, Resource-value references, rule references, and publication candidates remain future work-unit authority.
taskProgress:
  implementationComplete: 6
  implementationRemaining: 42
nextRecommended: parent-lifecycle
```

Completed persisted implementation rows:

- `[x] WU2 RED`: recorded failures for missing typed validator/admin functions and missing selection-value authority.
- `[x] WU2 GREEN`: added the typed union, additive table with scoped-key and source-option indexes, and create/detail/update/activate/deactivate operations.
- `[x] WU2 REFACTOR/VERIFY`: centralized typed payload, option ownership, effective-value, selection-completeness, and lifecycle checks.

The WU1 TRIANGULATE row remains unchecked: the new storage makes the direct definition-transition check testable, but `cargarAgregado.ts` does not yet load and validate typed allowed values, so claiming its required aggregate-loader assertion would be dishonest.

The WU2 TRIANGULATE row remains unchecked exactly as persisted because active rule, publication-candidate, and stored Resource-reference blockers require the rule/reference/publication seams owned by later work units. The implemented and tested last-active-value effective-assignment blocker is partial coverage only.

### Files changed

- `convex/schema.ts`
- `convex/catalogoAdmin/atributos.ts`
- `convex/catalogoAdmin/atributos.test.ts`
- `convex/catalogoAdmin/resourceValidators.ts`
- `convex/catalogoAdmin/resourceValidators.test.ts`
- `src/catalogoRecursos/dominio/tipos.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU2 typed storage | `atributos.test.ts`, `resourceValidators.test.ts` | Convex integration + unit | 11/11 focused tests passed | 3 failures: missing union/functions and no active-value guard | 14/14 focused tests passed | 16/16 pass for all four payload kinds, foreign/inactive option rejection, source mapping uniqueness, revision no-write, payload update, and the effective-assignment last-value blocker; rule/publication/reference blockers deferred | Shared validation helpers extracted; 16/16 remained green |
| WU1 aggregate-loader condition | `atributos.test.ts` | Convex integration | Included above | Direct transition behavior was exercised | Direct transition guard is green | Not complete: no `cargarAgregado` typed-value load/assertion exists yet | Deferred without a checkbox update |

### Verification evidence

- `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — 16 tests passed in 2 files.
- `pnpm exec vitest run` — 357 tests passed in 36 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Convex-test runtime scenario: typed TEXT/NUMERO/BOOLEANO/OPCION records enforce definition-kind, finite-number, active same-definition option, immutable scoped identity, source-option uniqueness, optimistic revision, lifecycle state, and last-active effective-selection protection.
- `pnpm exec convex codegen --typecheck enable` — not run: generated contract/codegen is WU12 authority, and the delegated roots prohibit touching the already-modified `convex/_generated/api.d.ts`; no generated file was hand-edited.

### Workload, PR boundary, and rollback

Delivery remains `stacked-to-main`, PR 1 / WU2. The WU2 tracked permitted-code delta from the prior WU1 ledger is 162 additions and 5 deletions; with the prior WU1 ledger this remains below the 400-line delivery budget. Rollback removes only the additive `valoresPermitidosAtributo` table, typed validator/type, and allowed-value admin functions; legacy options, Resources, Resource values, and creators remain untouched.

### Remaining tasks and deviations

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
- WU3–WU12 implementation rows remain unchecked in the persisted task artifact and are outside this delegated work unit.
- Parent-owned lifecycle rows were preserved byte-for-byte and remain deferred.

## Work unit 2 — Gatekeeper correction rerun

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: proceed
continuationAuthority:
  token: sha256:62f14d4b886e5a91bec9122be32c0c204a95cd8667ed4333706de0ad86e10b2a
  maxChangedLines: 400
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: consumed from the delegated prompt
warnings:
  - Strict TDD was active and followed for the correction.
  - Existing unrelated worktree modifications were preserved.
  - No WU3 implementation was started.
taskProgress:
  implementationComplete: 6
  implementationRemaining: 42
nextRecommended: parent-lifecycle
```

Corrected allowed-value diagnostics and public command arguments without changing the WU2 task scope. `valoresPermitidosAtributo` is now a canonical admin entity kind/reference, `allowedValueEntity(id)` supplies the actual allowed-value entity to update and lifecycle revision contexts, and allowed-value duplicate/reference diagnostics identify that entity kind. The public detail, update, activate, and deactivate field is consistently `valorPermitidoId`; no `valorPermitidoAtributoId` alias remains in the implementation.

The persisted WU2 RED, GREEN, and REFACTOR/VERIFY checkboxes were already `[x]`; this rerun re-read `tasks.md` and confirmed all three remain visibly checked. No checkbox was changed dishonestly. WU1/WU2 TRIANGULATE and later work-unit rows remain unchecked.

### Files changed by this correction

- `convex/catalogoAdmin/atributos.ts`
- `convex/catalogoAdmin/atributos.test.ts`
- `convex/catalogoAdmin/validators.ts`
- `convex/catalogoAdmin/validators.test.ts`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|
| WU2 gatekeeper correction | `atributos.test.ts`, `validators.test.ts` | Convex integration + unit | 3 failures proved the missing canonical entity kind, old public ID argument, and misreported reference context | 17/17 focused tests passed after adding the canonical reference/helper and `valorPermitidoId` args | 18/18 focused tests passed after rejecting the old alias and accepting the stable public field | Kept one typed entity helper; removed every allowed-value entity `as never` cast |

### Verification evidence

- `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts convex/catalogoAdmin/validators.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — RED: 3 failures; GREEN: 17 tests passed; TRIANGULATE: 18 tests passed in 3 files.
- `pnpm exec vitest run` — 359 tests passed in 37 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Convex-test scenario: allowed-value create, update, detail, activation, and deactivation accept only `valorPermitidoId`; duplicate, reference, immutable, stale-revision, and last-active lifecycle diagnostics identify the correct allowed-value entity context.

### Workload, boundary, and remaining work

This is the delegated PR 1 / WU2 correction only; no WU3 code was started. The current tracked WU1+WU2 permitted-code diff is 276 insertions and 14 deletions, plus the new 11-line validator test, and remains under the 400-line continuation authority. Rollback is limited to the additive allowed-value admin entity/reference and public argument correction.

The following implementation-owned rows remain unchecked exactly as persisted:

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->

WU3 TRIANGULATE blockers for stored Resource references and later rule/publication seams remain deferred. Parent-owned lifecycle rows remain byte-for-byte unchanged.


## Work unit 3 — Ordered allowed-value reads and Resource-value reference seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: proceed
continuationAuthority:
  token: sha256:a472f6c0378e7f86a218af48cc8efab5185b27aaa34ec8e867fa68a761c78b3c
  workUnit: allowed-value-pagination-reference
  maxChangedLines: 400
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU3 allowlist consumed
warnings:
  - Strict TDD was active with pnpm exec vitest run.
  - Pre-existing unrelated modifications, including prohibited hierarchy/unit/catalog/consumer and generated API files, were preserved.
  - Migration, conditional-rule, evaluator, publication, and selection-creator work was not started.
taskProgress:
  implementationComplete: 10
  implementationRemaining: 38
nextRecommended: parent-lifecycle
```

Completed persisted implementation rows: WU3 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`.

### Files changed

- `convex/schema.ts`
- `convex/catalogoAdmin/atributos.ts`
- `convex/catalogoAdmin/lib/pagination.ts`
- `convex/catalogoAdmin/lib/recursoPersistencia.ts`
- `convex/catalogoAdmin/resourceValidators.ts`
- `convex/catalogoAdmin/lib/pagination.test.ts`
- `convex/catalogoAdmin/atributos.test.ts`
- `convex/catalogoAdmin/lib/recursoPersistencia.test.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU3 ordered list | `pagination.test.ts`, `atributos.test.ts` | Unit + Convex integration | 30/30 focused tests passed | New public list test failed because `listarValoresPermitidosAtributo` was not exported | 27 focused tests passed after the ordered indexes, sort ID, and native cursor list were added | Equal order/key records traverse over two pages without repeats; ALL/ACTIVE/INACTIVE cursor contexts reject mixing | Reused cursor envelopes with an allowed-value ordering version and performed no post-page sorting/filtering; 34/34 focused tests passed |
| WU3 stored reference | `recursoPersistencia.test.ts` | Convex integration | Included above | Insert with `valorPermitidoId` failed schema validation before the optional field existed | 27 focused tests passed after the optional field/index and stored-ID blocker were added | A distinct scalar value still blocks through `porValorPermitido`; legacy rows without the field remain valid | Shared stored-value projection accepts the optional internal reference while legacy public inputs remain unchanged; 34/34 focused tests passed |

### Verification evidence

- Safety net: `pnpm exec vitest run convex/catalogoAdmin/lib/pagination.test.ts convex/catalogoAdmin/atributos.test.ts convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — 30 tests passed in 4 files.
- RED: `atributos.test.ts` failed because the list export was absent; `recursoPersistencia.test.ts` failed because `valorPermitidoId` was not in the schema.
- GREEN: the two changed focused files passed 27 tests.
- Final focused: `pnpm exec vitest run convex/catalogoAdmin/lib/pagination.test.ts convex/catalogoAdmin/atributos.test.ts convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — 34 tests passed in 4 files.
- Full suite: `pnpm exec vitest run` — 363 tests passed in 37 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Convex-test scenario: cursor-paged admin reads use only `orden → clave → adminSortId` indexes and keep inactive/non-effective records visible; a live Resource value blocks allowed-value deactivation only by its stored allowed-value ID, while an unreferenced legacy row remains valid.
- `pnpm exec convex dev --once` — not run because no deployment validation was available; code generation was not run because WU12 owns generated contracts and the delegated roots prohibit modifying `convex/_generated/api.d.ts`.

### Workload, rollback, and deviations

Delivery is `stacked-to-main`, PR1/WU3. The WU3 delta is limited to ordered allowed-value administration and the optional stored reference seam; no commit or PR was created. Rollback removes the two additive allowed-value order indexes, the optional Resource-value reference/index, list function, and ID blocker without deleting/backfilling legacy Resource values. No design deviation was introduced.

### Remaining implementation-owned tasks

The following exact unchecked lines remain deferred; parent-owned lines are unchanged byte-for-byte:
- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing migration tests in `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.test.ts` for resumable `DEFINITIONS`, `OPTIONS`, `RULES`, and `VERIFY` batches, including reruns, bounded continuation, conflicts, and no writes to legacy Resource value/snapshot tables. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Implement `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.ts` following the existing `backfillMetadatos` bounded state-machine pattern: explicitly backfill modes, create one `OPCION` typed allowed value per legacy option with `orden: 0`, populate `adminSortId`, and map rules through the source-option index. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Cover inactive-option migration exception, pre-existing key/payload or option-mapping conflict reporting without overwrite, unmapped-rule/invalid-active-option verification failures, and proof that every non-OPCION definition becomes `LIBRE`. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Extract bounded batch/report helpers and document the deploy → backfill → verify → tighten precondition beside the migration, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and confirm rollback leaves additive mappings inert rather than deleting data. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing tests in `convex/catalogoAdmin/reglas.test.ts` and `src/catalogoRecursos/dominio/reglasCondicionales.test.ts` for immutable dual-reference identity, mapped same-definition active values, allowed-only rule filtering from legacy evaluation, allowed-value-ID matching, and false/zero/empty-string legacy presence regressions. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Add optional rule-reference storage/indexes in `convex/schema.ts`; update `convex/catalogoAdmin/reglas.ts` and `src/catalogoRecursos/dominio/reglasCondicionales.ts` to validate/map dual references, retain legacy option semantics, and expose a selection-only predicate projection. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Test presence-only, legacy-only, dual mapped, and selection-only rules; foreign/inactive/mismatched option mapping rejection; conflict detection by allowed-value ID; activation no-write guarantees; and `CONDITIONAL` resolving to `OPTIONAL` when no rule fires. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Isolate legacy and selection projections behind explicit functions so neither can silently treat the other’s reference as presence, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and confirm rollback removes only the optional selection reference path. <!-- sdd-owner: implementation -->
- [ ] **RED:** Create `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts` with failing fixtures for Type-over-Family precedence, stable assignment order, unknown/foreign/inactive/non-effective selections, duplicate assignment input, all four resolved applicability values, simultaneous conditional resolution, retained forbidden/non-applicable selections, and required/optional `LIBRE`. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Implement `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts` with database-independent graph/input/issue types, selection validation, conditional resolution through allowed-value IDs, normalized accepted-assignment tracking, and exact `INVALID → INCOMPLETE → VALID` precedence where `valid === (status === "VALID")`. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add cases proving invalid input wins over missing required selections, duplicate IDs collapse in first-input order and cannot fire predicates, each effective assignment is reported, required selectable omissions populate `faltantesRequeridos`, and no resolved output returns `CONDITIONAL`. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Keep issue messages adjacent to fixed codes and reuse existing precedence/order utilities from `src/catalogoRecursos/dominio/asignacionesEfectivas.ts`, run `pnpm exec vitest run`, record the focused result with runtime harness `N/A` because this is pure domain code, and confirm rollback is isolated to the new evaluator module/tests. <!-- sdd-owner: implementation -->
- [ ] **RED:** Extend `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts` and add `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts` for typed TEXT/NUMERO/BOOLEANO/OPCION normalization, public omission/private retention of `valorPermitidoId`, v2 Class/Family/Type identity, label-versus-identity behavior, and deterministic fingerprint changes/no-changes. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Add `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts` and extend the evaluator to derive persistence only from typed `valor`, resolve OPCION to its current server option key, create the private `PersistableSelectionValue` sidecar, generate normalized names, reuse `identidadRecursoV2`/`serializarIdentidadV2`, and set identity version 2 inputs. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Prove finite-number enforcement, boolean false preservation, deliberately different allowed `clave`/payload values, code-point/stable ordering, storage-order independence, ownership active-state changes, option-key changes, unresolved reference sentinels, and publication/snapshot-only changes not affecting the live fingerprint. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Centralize code-point comparison, canonical serialization, and reference sentinels; ensure no v3 serializer or key-as-runtime-value shortcut is introduced; run `pnpm exec vitest run`, record the focused result with runtime harness `N/A`, and confirm rollback leaves legacy identity behavior intact. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing Convex-test cases in `convex/catalogoAdmin/recursos.test.ts` and a new `convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts` for hierarchy/Unit validation, active organization validation, identical live graph semantics for `GLOBAL` and `ORGANIZATION`, and no effect from zero/one/multiple published snapshots. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Implement bounded indexed loading in `convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts` and add exact evaluation validators in `convex/catalogoAdmin/resourceValidators.ts`; register `evaluarCreacionDesdeSelecciones` in `convex/catalogoAdmin/recursos.ts` to call the unchanged pure evaluator and discard its private sidecar. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Assert every growable loader read uses an index plus a bound, direct submitted IDs use `db.get`, inactive/missing organizations return `OWNERSHIP_INVALID`, the exact top-level/assignment/normalized DTO field sets are preserved, and live endpoint tests fail if publication/revision/snapshot reads are introduced. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Share the one loader between `QueryCtx` and `MutationCtx`, preserve table-specific Convex IDs only at adapters, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback removes only the additive query/loader/validators. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing Convex-test cases in `convex/catalogoAdmin/recursos.test.ts` and `convex/catalogoAdmin/lib/recursoPersistencia.test.ts` for mandatory fingerprint, mismatch-before-status precedence, the four exact dispositions, exact two-key `CREATED`, no-write snapshots, v2 scoped conflicts including inactive reservations, OCC race behavior, and organization alias/global scope differences. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Refactor `convex/catalogoAdmin/lib/recursoPersistencia.ts` around an explicit server-only aggregate insertion helper while keeping `insertarRecursoAdministrativo` behavior unchanged; register `crearRecursoDesdeSelecciones` in `convex/catalogoAdmin/recursos.ts` to reload/evaluate, compare fingerprint before writes, convert identity conflicts to `INVALID`, persist `activo: false`, `identidadVersion: 2`, private values with `valorPermitidoId`, and a version-2 organization alias only when applicable. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Prove stale invalid/incomplete input still yields `CATALOG_CHANGED`, matching incomplete/invalid input writes no Resource/value/alias, valid creates derive every field without manual/primitive args, race losers return typed `IDENTITY_CONFLICT`, and every selection-created value row has an allowed-value ID while legacy-created rows do not need one. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Keep query/mutation orchestration thin, use Convex transaction/OCC only (no actions, locks, retries, or compensating writes), run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback is limited to the additive mutation/persistence path without deleting created Resources. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing tests in `src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, `convex/catalogoRecursos/catalogoPublicado.test.ts`, and `convex/catalogoAdmin/publicacion.test.ts` for v1/v2 snapshot union reading, selection-mode/payload/rule/unit completeness, atomic publication failure, storage-order-independent v2 hash, semantic hash changes, and untouched historical snapshots. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Update `src/catalogoRecursos/dominio/catalogoPublicado.ts`, `convex/catalogoRecursos/catalogoPublicado.ts`, `convex/catalogoRecursos/catalogoPublicadoValidators.ts`, `convex/catalogoAdmin/lib/cargarAgregado.ts`, `convex/catalogoAdmin/publicacion.ts`, and `convex/schema.ts` to compile/validate `snapshotVersion: 2` selection graphs while retaining the exact legacy representation. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Prove an effective `SELECCION` assignment without active valid typed values prevents both revision and snapshot insertions, active OPCION payloads require active same-definition options, allowed-only rules do not leak into legacy projections, and equivalent v2 semantics hash equally despite database IDs/insertion order. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Version canonicalization with `catalog-content:v2`, share aggregate violation mapping, keep endpoint loaders publication-free, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback retains a reader for both snapshot versions. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add characterization failures in `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/compatibilidad.test.ts`, `convex/catalogoRecursos/recursos.test.ts`, and `src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` for all existing Resource creator arguments, returns, errors, primitive values, legacy option values/rules, and stored rows without `valorPermitidoId`. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Adjust only compatibility adapters in `convex/catalogoAdmin/lib/recursoPersistencia.ts`, `convex/catalogoRecursos/validacionRecurso.ts`, and affected existing validators so legacy creators and legacy-rule evaluation preserve their former observable behavior alongside the additive selection path. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Prove selection-only rules are filtered from legacy presence evaluation, historical Resource rows are not rewritten or inferred from values/keys, legacy Resource creation requires neither a fingerprint nor allowed-value ID, and the seven prior Resource admin functions remain exported unchanged. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Remove accidental coupling between legacy and selection-only validation paths, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback can disable new functions without changing legacy contracts or data. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing type assertions in `contract-tests/resource-admin-consumer.ts` for direct generated API references, exact shared Spanish input, selection `valorPermitidoId`, mandatory create fingerprint, exact public normalized DTO without an allowed-value ID, exhaustive four-disposition narrowing, and absence of suspended-selection/manual/primitive fields. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Complete exact registered-function args/returns in `convex/catalogoAdmin/resourceValidators.ts` and `convex/catalogoAdmin/recursos.ts`, then regenerate `convex/_generated/*` exclusively with `pnpm exec convex codegen --typecheck enable`; do not hand-edit generated files. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Extend `contract-tests/resource-admin-consumer.ts` to reject extra `CREATED` metadata, aliases for approved Spanish fields, a public `valorPermitidoId` in `valoresNormalizados`, and any fifth disposition; run `pnpm typecheck:consumer` and record its exact result. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Consolidate contract fixtures around generated `FunctionArgs`/`FunctionReturnType`, run `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check`; record exact results and use `pnpm exec convex dev --once` only when a deployment is available. <!-- sdd-owner: implementation -->

## Work unit 4 — Resumable mode/option/rule migration seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: proceed
continuationAuthority:
  token: sha256:a638464746031eb3b3f5ea9983638b4f3c5b05f746453cd5758c44788e28176f
  workUnit: selection-catalog-backfill
  maxChangedLines: 400
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: consumed from delegated prompt
warnings:
  - Existing unrelated modifications were preserved.
  - The optional rule field is migration-only storage; WU5 evaluation and rule-write behavior remain deferred.
nextRecommended: parent-lifecycle
```

Completed persisted rows: WU4 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`.

### Files changed

- `convex/schema.ts`
- `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.ts`
- `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.test.ts`
- `convex/_generated/dataModel.d.ts` (regenerated by `pnpm exec convex codegen --typecheck enable`)
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU4 migration | `backfillSeleccionCatalogo.test.ts` | Convex integration | `atributos.test.ts` and `reglas.test.ts`: 18/18 passed | 2 tests failed because the migration module was absent | 2/2 migration tests passed | Added duplicate-source mapping diagnostics case; it failed, then 3/3 passed | Extracted bounded phase, cursor, mapping, and verification helpers; focused tests remained green |

### Verification evidence

- RED: `pnpm exec vitest run convex/catalogoAdmin/lib/backfillSeleccionCatalogo.test.ts` — 2 failures, missing `catalogoAdmin/lib/backfillSeleccionCatalogo` module.
- GREEN/TRIANGULATE/REFACTOR: `pnpm exec vitest run convex/catalogoAdmin/lib/backfillSeleccionCatalogo.test.ts` — 3 tests passed.
- `pnpm exec vitest run` — 366 tests passed in 38 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `pnpm exec convex codegen --typecheck enable` — passed; generated data model was refreshed without hand editing.
- `git diff --check` — passed.
- Convex-test scenario: bounded continuation patches missing definition modes, creates active and inactive OPCION mappings at order zero, retains legacy rule option references while adding the optional mapped value ID, reports collisions/invalid mappings, and leaves Resource values and snapshots byte-identical.

### Rollback, boundary, and remaining work

Delivery is `stacked-to-main`, PR2/WU4; no commit or PR was created. Rollback removes only the internal migration and optional mapping storage while retaining migrated additive rows inert; it never deletes or rewrites Resources, aliases, revisions, snapshots, or legacy Resource values. WU5 owns the optional rule field's write validation, indexes, and evaluation projection.

The following implementation-owned WU5 lines remain unchecked:
- [ ] **RED:** Add failing tests in `convex/catalogoAdmin/reglas.test.ts` and `src/catalogoRecursos/dominio/reglasCondicionales.test.ts` for immutable dual-reference identity, mapped same-definition active values, allowed-only rule filtering from legacy evaluation, allowed-value-ID matching, and false/zero/empty-string legacy presence regressions. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Add optional rule-reference storage/indexes in `convex/schema.ts`; update `convex/catalogoAdmin/reglas.ts` and `src/catalogoRecursos/dominio/reglasCondicionales.ts` to validate/map dual references, retain legacy option semantics, and expose a selection-only predicate projection. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Test presence-only, legacy-only, dual mapped, and selection-only rules; foreign/inactive/mismatched option mapping rejection; conflict detection by allowed-value ID; activation no-write guarantees; and `CONDITIONAL` resolving to `OPTIONAL` when no rule fires. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Isolate legacy and selection projections behind explicit functions so neither can silently treat the other’s reference as presence, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and confirm rollback removes only the optional selection reference path. <!-- sdd-owner: implementation -->
