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

## Work unit 5 — Dual conditional-rule reference seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: proceed
continuationAuthority:
  token: sha256:9b58a7f5a5c15932e19c5eb20153da50445afae440c3983858a9ab7b85bb3c4a
  workUnit: dual-conditional-rule-references
  maxChangedLines: 400
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: consumed from delegated prompt
warnings:
  - Strict TDD was active with pnpm exec vitest run.
  - WU1/WU2 triangulation rows remain deferred because their aggregate/publication dependency assertions are not fully provable in this work unit.
  - The pure evaluator was not started.
nextRecommended: parent-lifecycle
```

Completed persisted implementation rows: WU5 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`; the tasks artifact now has 18 checked and 30 unchecked implementation-owned rows.

### Files changed

- `convex/schema.ts`
- `convex/catalogoAdmin/reglas.ts`
- `convex/catalogoAdmin/reglas.test.ts`
- `convex/catalogoAdmin/lib/cargarAgregado.ts`
- `src/catalogoRecursos/dominio/reglasCondicionales.ts`
- `src/catalogoRecursos/dominio/reglasCondicionales.test.ts`
- `convex/catalogoRecursos/validacionRecurso.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU5 dual rule seam | `reglas.test.ts`, `reglasCondicionales.test.ts` | Convex integration + unit | 5/5 focused tests passed | 2 failures: unsupported rule reference argument and missing legacy projection; later inactive dual test failed as expected | 7/7 focused tests passed after optional reference/index, mapped writes, and projections | 9/9 focused tests passed for presence-only, legacy-only mapping, dual/allowed-only predicates, foreign/inactive/mismatched values, conflict IDs, no-write activation, and base `CONDITIONAL → OPTIONAL` | Extracted explicit legacy/selection projections plus shared rule/conflict resolvers; final focused and full suites remained green |

### Verification evidence

- RED: `pnpm exec vitest run convex/catalogoAdmin/reglas.test.ts src/catalogoRecursos/dominio/reglasCondicionales.test.ts` — 2 failed tests: unexpected `valorPermitidoCondicionId` and missing `proyectarReglasLegado`.
- Triangulation RED: `pnpm exec vitest run convex/catalogoAdmin/reglas.test.ts` — 1 failed test because an inactive dual allowed value was accepted.
- Focused GREEN/TRIANGULATE/REFACTOR: `pnpm exec vitest run convex/catalogoAdmin/reglas.test.ts src/catalogoRecursos/dominio/reglasCondicionales.test.ts` — 9 tests passed in 2 files.
- Full suite: `pnpm exec vitest run` — 370 tests passed in 38 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Convex-test runtime scenario: dual references backfill only through the same-definition OPCION mapping; foreign/mismatched/inactive values reject; failed activation leaves the draft inactive at revision 1.
- `pnpm exec convex codegen --typecheck enable` and `pnpm exec convex dev --once` — not run: generated consumer work is WU12 authority and no deployment validation was available; no generated file was hand-edited.

### Workload, rollback, and remaining work

Delivery is `stacked-to-main`, PR2/WU5; no commit or PR was created. The WU5 permitted-code delta is 142 additions and 46 deletions, and task bookkeeping is 4 additions and 4 deletions, within the 400-line authority. Rollback removes only the optional rule reference/index, dual mapping validation, and selection projection; legacy option predicates and stored Resources remain intact.

The following earlier implementation-owned rows remain unchecked because this slice did not make their complete assertions provable:

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->

WU6–WU12 implementation rows remain unchecked exactly as persisted; parent-owned lifecycle rows were preserved byte-for-byte.

## Work unit 6 — Pure evaluator applicability/status seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: ready
taskProgress:
  total: 48
  complete: 22
  remaining: 26
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU6 allowlist consumed
warnings:
  - Strict TDD is active with pnpm exec vitest run.
  - The delivery decision is resolved: stacked-to-main, PR3/WU6, under the 400-line limit.
  - Existing WU5 and unrelated worktree modifications were preserved.
nextRecommended: parent-lifecycle
```

The prior delivery-metadata blocker is obsolete. The parent selected split delivery with `chain_strategy=stacked-to-main`; this implementation is PR3/WU6 and no size exception was used.

### Completed persisted implementation rows

- `[x] WU6 RED`: failing pure-domain fixtures created for precedence, ordering, selection classifications, applicability, conditions, retained selections, and `LIBRE` behavior.
- `[x] WU6 GREEN`: database-independent evaluator and exact Spanish public contract types implemented.
- `[x] WU6 TRIANGULATE`: invalid-over-incomplete, duplicate predicate suppression, required omissions, and non-`CONDITIONAL` resolution covered.
- `[x] WU6 REFACTOR/VERIFY`: messages are adjacent to codes and assignment precedence/order utilities are reused.

The four WU6 implementation-owned checkboxes are visibly `[x]` in `tasks.md`; parent-owned lifecycle rows were not changed.

### Files changed

- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts`
- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU6 evaluator | `evaluarCreacionSeleccion.test.ts` | Unit | N/A (new module) | The focused run failed because the evaluator module did not exist | 4/4 passed after the minimal evaluator; one fixture was corrected from foreign to inactive ownership | Added invalid-over-incomplete coverage; 5/5 passed | Preserved all tests after separating predicates from retained selections and de-duplicating required-LIBRE diagnostics |

### Verification evidence

- RED: `pnpm exec vitest run src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts` — failed because `./evaluarCreacionSeleccion` did not exist.
- Focused GREEN/TRIANGULATE/REFACTOR: `pnpm exec vitest run src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts` — 5 tests passed.
- `pnpm exec vitest run` — 375 tests passed in 39 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Runtime harness: N/A; this is pure database-independent domain code.

### Workload, rollback, and deviations

PR3/WU6 is the `stacked-to-main` boundary. The new evaluator and its focused tests total 222 authored lines; task/progress bookkeeping keeps this attempt below the supplied 400-line limit. Rollback removes only the new evaluator module and its tests, leaving legacy validators and conditional-rule exports unchanged.

WU6 intentionally receives `catalogFingerprint` from the plain graph and returns `nombre` and `identificadorTecnico` as `null`. WU7 retains authority for hash calculation, complete typed normalization, persistence sidecar, generated naming, and v2 identity; no WU7 behavior was faked.

### Remaining implementation-owned work

The following next WU7 rows remain visibly unchecked in the persisted task artifact:

- [ ] **RED:** Extend `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts` and add `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts` for typed TEXT/NUMERO/BOOLEANO/OPCION normalization, public omission/private retention of `valorPermitidoId`, v2 Class/Family/Type identity, label-versus-identity behavior, and deterministic fingerprint changes/no-changes. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Add `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts` and extend the evaluator to derive persistence only from typed `valor`, resolve OPCION to its current server option key, create the private `PersistableSelectionValue` sidecar, generate normalized names, reuse `identidadRecursoV2`/`serializarIdentidadV2`, and set identity version 2 inputs. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Prove finite-number enforcement, boolean false preservation, deliberately different allowed `clave`/payload values, code-point/stable ordering, storage-order independence, ownership active-state changes, option-key changes, unresolved reference sentinels, and publication/snapshot-only changes not affecting the live fingerprint. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Centralize code-point comparison, canonical serialization, and reference sentinels; ensure no v3 serializer or key-as-runtime-value shortcut is introduced; run `pnpm exec vitest run`, record the focused result with runtime harness `N/A`, and confirm rollback leaves legacy identity behavior intact. <!-- sdd-owner: implementation -->

Earlier WU1/WU2 triangulation rows and WU8–WU12 rows remain unchecked exactly as persisted; parent-owned lifecycle actions remain deferred.

## Work unit 7 — Typed normalization, v2 identity, naming, and fingerprint seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: proceed
continuationAuthority:
  token: sha256:1371bd5dc008e3c8e35e6f70fef58bccbeb592b4c755b7524472d883311cacf7
  workUnit: PR3/WU7
  maxChangedLines: 400
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU7 allowlist consumed
warnings:
  - Strict TDD was active with pnpm exec vitest run.
  - Existing WU5/WU6 and unrelated worktree changes were preserved.
  - CodeGraph MCP was unavailable after the existing index check, so focused filesystem reads were used.
taskProgress:
  total: 50
  complete: 26
  remaining: 24
nextRecommended: parent-lifecycle
```

### Completed persisted implementation rows

- `[x] WU7 RED`: added typed normalization, sidecar, v2 hierarchy identity, name/label, and deterministic fingerprint failures.
- `[x] WU7 GREEN`: added the pure SHA-256 live-graph canonicalizer and typed evaluator normalization/persistence/name/identity behavior.
- `[x] WU7 TRIANGULATE`: covered finite numbers, false booleans, payload-versus-key authority, code-point order, storage order, organization state, option keys, sentinels, and publication-only exclusion.
- `[x] WU7 REFACTOR/VERIFY`: centralized code-point comparison, canonical JSON, and total reference sentinels; no v3 serializer was introduced.

All four WU7 implementation checkboxes are visibly `[x]` in `tasks.md`. Parent-owned rows were preserved byte-for-byte.

### Files changed

- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts`
- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts`
- `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts`
- `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts`
- `src/catalogoRecursos/dominio/identidadRecurso.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU7 normalization/identity | `evaluarCreacionSeleccion.test.ts`, `identidadRecurso.test.ts` | Unit | 9/9 passed | Typed runtime payload and private-sidecar expectations failed | 13 focused tests passed after typed normalization/sidecar/name/v2 implementation | Label identity/name behavior, false, distinct `clave`, finite number, and option key paths are covered | Reused the v2 serializer without a v3 path; 15 focused tests pass |
| WU7 fingerprint | `huellaCatalogoSeleccion.test.ts` | Unit | N/A (new module) | Missing module failed | SHA-256 graph fingerprints passed | Reorder, label, ownership, referenced option, sentinel, publication-only, and code-point cases passed; the code-point test first failed under UTF-16 ordering | Shared comparator, canonical JSON, and sentinels; 15 focused tests pass |

### Verification evidence

- Safety net: `pnpm exec vitest run src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts src/catalogoRecursos/dominio/identidadRecurso.test.ts` — 9 tests passed in 2 files.
- RED: focused evaluator tests failed with typed payload objects and non-finite numbers; the fingerprint suite failed because `huellaCatalogoSeleccion` was absent; code-point ordering later failed under the initial UTF-16 comparator.
- Focused: `pnpm exec vitest run src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts src/catalogoRecursos/dominio/identidadRecurso.test.ts` — 15 tests passed in 3 files.
- Full suite: `pnpm exec vitest run` — 381 tests passed in 40 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Runtime harness: N/A; WU7 is pure database-independent domain code.

### Workload, rollback, and remaining work

Delivery is `stacked-to-main`, PR3/WU7; no commit or PR was created. The WU7 additions are confined to the evaluator enrichment, the new fingerprint module/tests, and the v2 comparator integration, staying below the 400-line delegated budget when measured from the pre-existing WU6 files. Rollback removes that enrichment and the new fingerprint module/tests without changing legacy identity v1 behavior or persistence contracts.

No WU7 implementation line remains unchecked. WU8–WU12 and earlier WU1/WU2 triangulation lines remain unchecked in the persisted task artifact; they are outside this work unit. Parent-owned lifecycle actions remain deferred.

## Work unit 7 — Gatekeeper correction rerun

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: ready
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU7 allowlist consumed
warnings:
  - Strict TDD was active with pnpm exec vitest run.
  - Existing unrelated worktree modifications were preserved.
  - No WU8 work was started.
nextRecommended: parent-lifecycle
```

The fingerprint now models only catalog assumptions. `HuellaInput` no longer contains `selecciones`, canonical content no longer contains `submittedReferences`, and the evaluator strips selections before calculating the fingerprint. Every stored effective selectable allowed value now retains its display `nombre` in canonical content, including values whose definition does not participate in technical identity.

### Persisted task evidence

WU7 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY remain visibly checked in `tasks.md` at lines 87–90 after the focused and full checks passed. No checkbox transition was needed for this correction; the parent-owned rows were left byte-for-byte unchanged.

### Files changed by this correction

- `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts`
- `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts`
- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts`
- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU7 fingerprint correction | `evaluarCreacionSeleccion.test.ts`, `huellaCatalogoSeleccion.test.ts` | Unit | 11/11 focused tests passed | 2 expected failures: fingerprints varied with submitted selections and a non-identity label edit did not change the fingerprint | 13/13 focused tests passed after removing answer-set canonicalization and retaining every allowed label | One evaluator case covers zero, valid, invalid, duplicate, reordered, and different selections; identity and non-identity label cases both prove label sensitivity | `HuellaInput` now expresses catalog-only inputs and the focused suite stayed green after the test fixture removed its obsolete selection field |

### Verification evidence

- Safety net: `pnpm exec vitest run src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts` — 11 tests passed in 2 files.
- RED: the same focused command — 2 failures (selection-dependent fingerprints and ignored non-identity label), with 11 other tests passing.
- GREEN/triangulation/refactor: the same focused command — 13 tests passed in 2 files.
- Full suite: `pnpm exec vitest run` — 383 tests passed in 40 files.
- Typecheck: `pnpm typecheck` — passed (`tsc --noEmit`).
- Diff validation: `git diff --check` — passed.
- Runtime harness: N/A; this is pure database-independent domain code.

### Workload, boundary, deviations, and remaining tasks

Delivery remains `stacked-to-main`, PR3/WU7, under the supplied 400-line continuation limit. The correction is limited to catalog-fingerprint canonicalization and its pure-domain regression tests; it does not change technical identity behavior, normalized persistence, or any WU8 adapter. No design deviation was introduced.

The persisted implementation-owned rows below remain unchecked and outside WU7:

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing Convex-test cases in `convex/catalogoAdmin/recursos.test.ts` and a new `convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts` for hierarchy/Unit validation, active organization validation, identical live graph semantics for `GLOBAL` and `ORGANIZATION`, and no effect from zero/one/multiple published snapshots. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Implement bounded indexed loading in `convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts` and add exact evaluation validators in `convex/catalogoAdmin/resourceValidators.ts`; register `evaluarCreacionDesdeSelecciones` in `convex/catalogoAdmin/recursos.ts` to call the unchanged pure evaluator and discard its private sidecar. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Assert every growable loader read uses an index plus a bound, direct submitted IDs use `db.get`, inactive/missing organizations return `OWNERSHIP_INVALID`, the exact top-level/assignment/normalized DTO field sets are preserved, and live endpoint tests fail if publication/revision/snapshot reads are introduced. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Share the one loader between `QueryCtx` and `MutationCtx`, preserve table-specific Convex IDs only at adapters, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback removes only the additive query/loader/validators. <!-- sdd-owner: implementation -->

All later WU8–WU12 unchecked implementation rows remain byte-for-byte in `tasks.md`; the two parent-owned lifecycle rows remain deferred.

## Work unit 8 — Shared bounded live loader and evaluation query seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: proceed
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU8 allowlist consumed
warnings:
  - Strict TDD is active with pnpm exec vitest run.
  - Existing WU5–WU7 and unrelated worktree modifications were preserved.
  - Generated declarations were regenerated through Convex codegen, never hand-edited.
nextRecommended: parent-lifecycle
```

Completed persisted implementation rows: WU8 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`.

### TDD Cycle Evidence

| Task | Test file | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|
| WU8 loader/query | `cargarCreacionSeleccion.test.ts`, `recursos.test.ts` | Both failed because the loader module and public query export were absent. | 80 focused tests passed after the shared loader, exact validators, and thin query were added. | Foreign selected values, inactive Unit, inactive/missing organization, direct submitted-ID reads, bounds, exact DTO fields, and two published snapshots were covered. | One `Pick<QueryCtx \| MutationCtx, "db">` loader remains; the query discards the private sidecar. |

### Files changed

- `convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts`
- `convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts`
- `convex/catalogoAdmin/resourceValidators.ts`
- `convex/catalogoAdmin/recursos.ts`
- `convex/catalogoAdmin/recursos.test.ts`
- `convex/_generated/api.d.ts` and `convex/_generated/dataModel.d.ts` (regenerated by `pnpm exec convex codegen --typecheck enable`)
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### Verification evidence

- RED: `pnpm exec vitest run convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts convex/catalogoAdmin/recursos.test.ts` — loader module missing and query export absent.
- Focused: `pnpm exec vitest run convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts convex/catalogoAdmin/recursos.test.ts` — 80 passed in 2 files.
- Full: `pnpm exec vitest run` — 386 passed in 41 files.
- `pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check` — passed.
- Convex-test scenario: GLOBAL and ORGANIZATION share the live effective graph; inactive ownership/Unit and foreign values return `INVALID`; publication revisions/snapshots do not affect the loader.

### Workload, rollback, and remaining tasks

Delivery is `stacked-to-main`, PR4/WU8; no commit or push was created. Rollback removes only the additive loader, query, evaluation validators, and generated query declaration, without touching publication or legacy Resource endpoints. No design deviation was introduced.

Exact remaining unchecked implementation-owned rows:
- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
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

## Work unit 9 — Atomic create, persistence, and disposition seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: ready
continuationAuthority:
  state: proceed
  token: sha256:a9066f6d3dab31254a5b28e51f5185cfcda5c945e10621dfef68bf4062f33843
  workUnit: PR4/WU9
  maxChangedLines: 400
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU9 allowlist consumed
warnings:
  - Strict TDD was active with pnpm exec vitest run.
  - Existing WU5–WU8 and unrelated worktree modifications were preserved.
  - Generated declarations were regenerated by Convex codegen, never hand-edited.
  - Attempt settlement recorded 491 changed lines against the 400-line limit; maintainer reset is required.
taskProgress:
  total: 50
  complete: 34
  remaining: 16
nextRecommended: maintainer-decision
```

Completed persisted implementation rows: WU9 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`.

### Files changed

- `convex/catalogoAdmin/lib/recursoPersistencia.ts`
- `convex/catalogoAdmin/recursos.ts`
- `convex/catalogoAdmin/resourceValidators.ts`
- `convex/catalogoAdmin/recursos.test.ts`
- `convex/catalogoAdmin/resourceValidators.test.ts`
- `convex/_generated/api.d.ts` (regenerated by `pnpm exec convex codegen --typecheck enable`)
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU9 atomic selection creation | `recursos.test.ts`, `recursoPersistencia.test.ts`, `resourceValidators.test.ts` | Convex integration + unit | 93 focused tests passed | 4 failures confirmed the missing public mutation | 97 focused tests passed after the mutation, result validator, and aggregate insertion seam | 99 focused tests passed for stale invalid/incomplete precedence, inactive Resource/alias conflicts, global/org aliases, and an OCC race | The lower aggregate seam retains legacy v1 behavior; focused tests stayed green |

### Verification evidence

- Safety net: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/lib/recursoPersistencia.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — 93 tests passed in 3 files.
- RED: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts` — 4 failures because `crearRecursoDesdeSelecciones` was not exported.
- GREEN: focused three-file command — 97 tests passed.
- TRIANGULATE/REFACTOR: focused three-file command — 99 tests passed.
- Full suite: `pnpm exec vitest run` — 392 tests passed in 41 files.
- `pnpm typecheck`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check` — passed.
- Attempt settlement: passed evidence was recorded, but the runtime ledger measured 491 changed lines and returned `blocked: maintainer_decision` because the limit is 400.
- Convex-test scenario: matching valid creation writes one inactive v2 Resource with private `valorPermitidoId` rows; stale, incomplete, invalid, Resource/alias conflict, and race-loser paths write no aggregate state.

### Workload, rollback, and deviations

Delivery is `stacked-to-main`, PR4/WU9; no commit, push, publication, or WU10 work was started. Runtime settlement measured 491 changed lines, exceeding the 400-line authority by 91, so a maintainer must reset the objective before further lifecycle work; no reset was attempted here. Generated declarations are codegen output. Rollback removes only the additive mutation and v2 selection persistence path, retaining successfully created aggregates and every legacy creator. No design deviation was introduced.

### Remaining implementation-owned tasks

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
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

Parent-owned lifecycle rows remain deferred and byte-for-byte unchanged.

## Work unit 10 — Publication representation, completeness, and canonical-hash seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: proceed
continuationAuthority:
  state: proceed
  token: sha256:d5e44209dccbe37e4fc2ad71af4c33a3a22091af874e69486a1f1c85f06492fa
  workUnit: PR5/WU10
  maxChangedLines: 400
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU10 allowlist consumed
warnings:
  - Strict TDD was active with pnpm exec vitest run.
  - Existing WU9 and unrelated worktree modifications were preserved.
  - Code generation was run, never hand-edited.
taskProgress:
  implementationComplete: 38
  implementationRemaining: 10
nextRecommended: parent-lifecycle
```

Completed persisted rows: WU10 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`.

### Files changed

- `src/catalogoRecursos/dominio/catalogoPublicado.ts`
- `src/catalogoRecursos/dominio/catalogoPublicado.test.ts`
- `convex/catalogoRecursos/catalogoPublicado.ts`
- `convex/catalogoRecursos/catalogoPublicado.test.ts`
- `convex/catalogoRecursos/catalogoPublicadoValidators.ts`
- `convex/catalogoAdmin/lib/cargarAgregado.ts`
- `convex/catalogoAdmin/publicacion.test.ts`
- `convex/schema.ts`
- `convex/_generated/api.d.ts` and `convex/_generated/dataModel.d.ts` (regenerated by `pnpm exec convex codegen --typecheck enable`)
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU10 publication compatibility | `catalogoPublicado.test.ts`, `publicacion.test.ts` | Unit + Convex integration | 24/24 focused tests passed | 3 failures: v2 graph absent, semantic hash omitted, and empty selection publication wrote a revision | 27/27 focused tests passed after the v1/v2 validator union, v2 compiler, canonical domain, and aggregate completeness guard | 29/29 focused tests passed for untouched v1 rows, allowed-only rule exclusion, inactive OPCION source rejection, and storage-ID/order-independent hashing | Canonical content is explicitly prefixed `catalog-content:v2`; aggregate violations retain the existing publication mapping and live loaders remain publication-free |

### Verification evidence

- RED: `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts convex/catalogoAdmin/publicacion.test.ts` — 3 expected failures.
- GREEN: `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts convex/catalogoAdmin/publicacion.test.ts` — 27 passed in 4 files.
- TRIANGULATE: the same focused command — 29 passed in 4 files.
- Full: `pnpm exec vitest run` — 397 passed in 41 files.
- `pnpm typecheck` — passed.
- `pnpm exec convex codegen --typecheck enable` — passed; generated declarations were not hand-edited.
- `git diff --check` — passed.
- Convex-test scenario: invalid effective selection catalog data raises `ADMIN_PUBLICATION_INVALID` before revision/snapshot insertion; valid v2 publications retain typed values and selection-only predicates without exposing them through legacy rules.

### Workload, rollback, and deviations

Delivery is `stacked-to-main`, PR5/WU10. The authored WU10 code-and-test delta is 255 lines before task/progress bookkeeping, within the 400-line authority; regenerated declarations are generated output. Rollback removes only v2 compilation/canonicalization while retaining both reader variants and all stored snapshots unchanged. No design deviation was introduced, and no WU11/WU12 implementation was started.

### Remaining implementation-owned tasks

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add characterization failures in `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/compatibilidad.test.ts`, `convex/catalogoRecursos/recursos.test.ts`, and `src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` for all existing Resource creator arguments, returns, errors, primitive values, legacy option values/rules, and stored rows without `valorPermitidoId`. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Adjust only compatibility adapters in `convex/catalogoAdmin/lib/recursoPersistencia.ts`, `convex/catalogoRecursos/validacionRecurso.ts`, and affected existing validators so legacy creators and legacy-rule evaluation preserve their former observable behavior alongside the additive selection path. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Prove selection-only rules are filtered from legacy presence evaluation, historical Resource rows are not rewritten or inferred from values/keys, legacy Resource creation requires neither a fingerprint nor allowed-value ID, and the seven prior Resource admin functions remain exported unchanged. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Remove accidental coupling between legacy and selection-only validation paths, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback can disable new functions without changing legacy contracts or data. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing type assertions in `contract-tests/resource-admin-consumer.ts` for direct generated API references, exact shared Spanish input, selection `valorPermitidoId`, mandatory create fingerprint, exact public normalized DTO without an allowed-value ID, exhaustive four-disposition narrowing, and absence of suspended-selection/manual/primitive fields. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Complete exact registered-function args/returns in `convex/catalogoAdmin/resourceValidators.ts` and `convex/catalogoAdmin/recursos.ts`, then regenerate `convex/_generated/*` exclusively with `pnpm exec convex codegen --typecheck enable`; do not hand-edit generated files. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Extend `contract-tests/resource-admin-consumer.ts` to reject extra `CREATED` metadata, aliases for approved Spanish fields, a public `valorPermitidoId` in `valoresNormalizados`, and any fifth disposition; run `pnpm typecheck:consumer` and record its exact result. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Consolidate contract fixtures around generated `FunctionArgs`/`FunctionReturnType`, run `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check`; record exact results and use `pnpm exec convex dev --once` only when a deployment is available. <!-- sdd-owner: implementation -->

Parent-owned lifecycle rows remain deferred and byte-for-byte unchanged.

## Work unit 10 — Gatekeeper correction rerun

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
planningHome:
  root: /home/garfex/PROGRAMACION/sistema-garfex/openspec
  changesDir: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes
changeRoot: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes/add-selection-only-resource-creation
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
taskProgress:
  total: 48
  complete: 38
  remaining: 10
  unchecked: persisted implementation rows listed below
deferredParentActions:
  total: 2
  complete: 0
  remaining: 2
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
  allowedEditRoots: delegated WU10 allowlist consumed
  warnings:
    - Pre-existing unrelated worktree changes were preserved.
    - No WU11 work was started.
nextRecommended: parent-lifecycle
isNonAuthoritative: false
```

The already-complete WU10 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY rows remain visibly `[x]` in `tasks.md`; no checkbox was changed. The correction replaces the singular v2 Unit-policy semantic field with the exact `selectionGraph.politicasUnidad` collection. It contains every active precedence-selected policy's Unit technical key and principal flag, validates every selected Unit row before publication, and contains no storage IDs. Both compiler and canonicalizer order the collection by Unit technical key with a semantic principal tie-breaker.

### Files changed

- `src/catalogoRecursos/dominio/catalogoPublicado.ts`
- `src/catalogoRecursos/dominio/catalogoPublicado.test.ts`
- `convex/catalogoRecursos/catalogoPublicado.ts`
- `convex/catalogoRecursos/catalogoPublicado.test.ts`
- `convex/catalogoRecursos/catalogoPublicadoValidators.ts`
- `convex/_generated/api.d.ts` and `convex/_generated/dataModel.d.ts` (codegen only)
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU10 complete effective Unit-policy publication | `catalogoPublicado.test.ts` (domain and Convex) | Unit + Convex integration | 28/28 focused tests passed | 2 failures: a non-principal policy was absent from v2 and its removal did not affect canonical content | 23/23 domain/Convex focused tests passed after plural v2 policy compilation, validation, and canonicalization | 30/30 focused tests passed after addition/removal/change, insertion-order, and inactive non-principal policy cases | Removed the redundant singular field; no further refactor was needed |

### Verification evidence

- `pnpm exec vitest run src/catalogoRecursos/dominio/catalogoPublicado.test.ts convex/catalogoRecursos/catalogoPublicado.test.ts convex/catalogoAdmin/publicacion.test.ts` — 30 tests passed in 3 files.
- `pnpm exec vitest run` — 399 tests passed in 41 files.
- `pnpm typecheck` — passed (`tsc --noEmit`).
- `pnpm exec convex codegen --typecheck enable` — passed; only generated declarations were updated by codegen.
- `git diff --check` — passed.
- Legacy v1 snapshot reader coverage remains green; v1 snapshot objects remain untouched and v2 has no `unidadPolitica` field.

### Workload, boundary, and remaining work

Delivery remains `stacked-to-main`, PR5/WU10. The current authored WU10 publication code/test delta is 315 additions/deletions before generated output and OpenSpec bookkeeping, within the 400-line authority. Rollback removes only the v2 plural policy representation/canonicalization while preserving union-compatible v1 reading and immutable stored snapshots.

Exact unchecked implementation rows remain deferred:

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add characterization failures in `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/compatibilidad.test.ts`, `convex/catalogoRecursos/recursos.test.ts`, and `src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` for all existing Resource creator arguments, returns, errors, primitive values, legacy option values/rules, and stored rows without `valorPermitidoId`. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Adjust only compatibility adapters in `convex/catalogoAdmin/lib/recursoPersistencia.ts`, `convex/catalogoRecursos/validacionRecurso.ts`, and affected existing validators so legacy creators and legacy-rule evaluation preserve their former observable behavior alongside the additive selection path. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Prove selection-only rules are filtered from legacy presence evaluation, historical Resource rows are not rewritten or inferred from values/keys, legacy Resource creation requires neither a fingerprint nor allowed-value ID, and the seven prior Resource admin functions remain exported unchanged. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Remove accidental coupling between legacy and selection-only validation paths, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback can disable new functions without changing legacy contracts or data. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing type assertions in `contract-tests/resource-admin-consumer.ts` for direct generated API references, exact shared Spanish input, selection `valorPermitidoId`, mandatory create fingerprint, exact public normalized DTO without an allowed-value ID, exhaustive four-disposition narrowing, and absence of suspended-selection/manual/primitive fields. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Complete exact registered-function args/returns in `convex/catalogoAdmin/resourceValidators.ts` and `convex/catalogoAdmin/recursos.ts`, then regenerate `convex/_generated/*` exclusively with `pnpm exec convex codegen --typecheck enable`; do not hand-edit generated files. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Extend `contract-tests/resource-admin-consumer.ts` to reject extra `CREATED` metadata, aliases for approved Spanish fields, a public `valorPermitidoId` in `valoresNormalizados`, and any fifth disposition; run `pnpm typecheck:consumer` and record its exact result. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Consolidate contract fixtures around generated `FunctionArgs`/`FunctionReturnType`, run `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check`; record exact results and use `pnpm exec convex dev --once` only when a deployment is available. <!-- sdd-owner: implementation -->

### Runtime accounting correction

Native attempt status after the verification shows the live `selection-publication-v2` objective was charged **1,403 changed lines** against its 400-line cap because the initial candidate included pre-existing tracked/untracked WU8/WU9 work. The attempted settlement therefore has `changed_line_budget_exceeded: true`, `decision_required: true`, and `next_action: reset`; it is not a completed 400-line WU10 receipt. No reset, commit, push, review, or WU11 work was performed. The local code/test delta above remains 315 authored lines, but the runtime authority is controlling and requires a maintainer reset decision before lifecycle continuation.

## Work unit 11 — Legacy creator and stored-data regression seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: ready
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated WU11 allowlist consumed
warnings:
  - Strict TDD is active with pnpm exec vitest run.
  - Existing WU1/WU2 triangulation rows and WU12 remain outside this work unit.
  - Pre-existing unrelated worktree modifications were preserved.
nextRecommended: parent-lifecycle
```

Completed persisted implementation rows: WU11 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`. Parent-owned rows remain byte-for-byte unchanged.

### Files changed

- `convex/catalogoAdmin/recursos.test.ts`
- `convex/catalogoAdmin/compatibilidad.test.ts`
- `convex/catalogoRecursos/recursos.test.ts`
- `src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU11 legacy compatibility | `recursos.test.ts`, `compatibilidad.test.ts`, public `recursos.test.ts`, `compatibilidadOpciones.test.ts` | Convex integration + unit | 148/148 focused tests passed in 6 files | Characterization expectations were added first; the existing compatibility implementation satisfied them, so no real regression produced a failing RED run | No adapter change was warranted; 143 tests passed in the initial four-file characterization run | 152/152 focused tests prove selection-only predicates are filtered, same value/key rows remain unlinked, primitives/manual fields remain accepted, and all seven legacy admin exports remain available | No production refactor was needed; legacy and selection paths remain separate |

### Verification evidence

- Safety net: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/compatibilidad.test.ts convex/catalogoRecursos/recursos.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts src/catalogoRecursos/dominio/reglasCondicionales.test.ts convex/catalogoAdmin/resourceValidators.test.ts` — 148 tests passed in 6 files.
- Characterization run: `pnpm exec vitest run convex/catalogoAdmin/recursos.test.ts convex/catalogoAdmin/compatibilidad.test.ts convex/catalogoRecursos/recursos.test.ts src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` — 143 tests passed in 4 files; no compatibility regression required adapter changes.
- Focused final: the six-file safety-net command — 152 tests passed in 6 files.
- Full suite: `pnpm exec vitest run` — 403 tests passed in 41 files.
- Typecheck: `pnpm typecheck` — passed (`tsc --noEmit`).
- `git diff --check` — passed.
- Codegen was not run because this tests-only WU changes no registered Convex signatures or schema; consumer typecheck was not directly impacted and remains WU12 authority.
- Convex-test scenario: legacy creation accepts manual name/description plus text, boolean `false`, number `0`, and option values without `expectedCatalogFingerprint` or `valorPermitidoId`; its stored values retain no allowed-value reference even where an allowed key equals the stored option value, and an allowed-value-only rule cannot impose a legacy required value.

### Workload, rollback, and deviations

Delivery is `stacked-to-main`, PR6/WU11; no commit, push, WU12, or lifecycle action was started. This WU added 57 test lines across the allowed compatibility surfaces, under the 400-line token budget. Rollback removes only these regression tests; it does not change legacy creators, selection functions, stored Resource rows, or publications. The requested characterization is approval-style: all newly asserted legacy contracts were already green, so the permitted compatibility adapters were intentionally unchanged.

### Remaining implementation-owned tasks

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
- [ ] **RED:** Add failing type assertions in `contract-tests/resource-admin-consumer.ts` for direct generated API references, exact shared Spanish input, selection `valorPermitidoId`, mandatory create fingerprint, exact public normalized DTO without an allowed-value ID, exhaustive four-disposition narrowing, and absence of suspended-selection/manual/primitive fields. <!-- sdd-owner: implementation -->
- [ ] **GREEN:** Complete exact registered-function args/returns in `convex/catalogoAdmin/resourceValidators.ts` and `convex/catalogoAdmin/recursos.ts`, then regenerate `convex/_generated/*` exclusively with `pnpm exec convex codegen --typecheck enable`; do not hand-edit generated files. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Extend `contract-tests/resource-admin-consumer.ts` to reject extra `CREATED` metadata, aliases for approved Spanish fields, a public `valorPermitidoId` in `valoresNormalizados`, and any fifth disposition; run `pnpm typecheck:consumer` and record its exact result. <!-- sdd-owner: implementation -->
- [ ] **REFACTOR/VERIFY:** Consolidate contract fixtures around generated `FunctionArgs`/`FunctionReturnType`, run `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check`; record exact results and use `pnpm exec convex dev --once` only when a deployment is available. <!-- sdd-owner: implementation -->

### Runtime attempt settlement

`gentle-ai sdd-attempt settle` completed the `legacy-resource-compatibility` objective with outcome `passed` and evidence revision `sha256:199cd693455305ea766fa178351b45f2a04f63ac8f8962e9dca5fc162151a37d`. The runtime authority returned `state: complete`; WU12 was not acquired or started.

## Work unit 12 — Generated contracts and consumer typing seam

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
planningHome:
  root: /home/garfex/PROGRAMACION/sistema-garfex/openspec
  changesDir: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes
changeRoot: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes/add-selection-only-resource-creation
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
taskProgress:
  total: 48
  complete: 46
  remaining: 2
  unchecked:
    - "- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->"
    - "- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->"
deferredParentActions:
  total: 2
  complete: 0
  remaining: 2
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
  allowedEditRoots: delegated WU12 allowlist consumed
  warnings:
    - Existing unrelated worktree modifications, including generated declarations and prior work units, were preserved.
    - CodeGraph MCP was unavailable after the existing index check; the read-only upstream CodeGraph CLI was used before focused file reads.
    - `convex dev --once` could not run because another local backend already owns port 3210.
nextRecommended: parent-lifecycle
isNonAuthoritative: false
```

Completed persisted implementation rows: WU12 RED, GREEN, TRIANGULATE, and REFACTOR/VERIFY are visibly `[x]` in `tasks.md`. Only these WU12 rows were updated; the two earlier implementation triangulation rows and both parent-owned lifecycle rows remain unchanged.

### Files changed

- `contract-tests/resource-admin-consumer.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

`pnpm exec convex codegen --typecheck enable` regenerated/validated the Convex declaration surface. No generated declaration was hand-edited, and no `resourceValidators.ts` or `recursos.ts` patch was needed because their already-registered arguments and returns satisfied the new direct generated-consumer assertions.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU12 generated consumer contract | `contract-tests/resource-admin-consumer.ts` | Type-level consumer contract | `pnpm typecheck:consumer` passed before the fixture | The first whole-argument equivalence assertion failed; inspecting the generated direct reference confirmed the registered fields were already exact, so the fixture was refined to atomic exact key/ID assertions rather than changing production code | `pnpm typecheck:consumer` passed with direct `FunctionArgs`/`FunctionReturnType` assertions | `@ts-expect-error` assertions reject suspended/manual/primitive/legacy-option/English-alias inputs, missing fingerprint, public normalized allowed IDs, extra `CREATED` metadata, and a fifth disposition; exhaustive four-way narrowing compiled | Consolidated the fixture around direct generated references and reusable `Exact`/`Assert` helpers; checks remained green |

### Verification evidence

- Safety net: `pnpm typecheck:consumer` — passed.
- RED: `pnpm typecheck:consumer` — failed at the initial whole-object exactness assertion (`TS2344`); generated API inspection showed no registered contract mismatch.
- GREEN/TRIANGULATE/REFACTOR: `pnpm typecheck:consumer` — passed.
- `pnpm exec convex codegen --typecheck enable` — passed; declarations were generated exclusively through Convex codegen.
- `pnpm exec vitest run && pnpm typecheck` — passed: 41 files and 403 tests passed; `tsc --noEmit` passed.
- `git diff --check` — passed.
- `pnpm exec convex dev --once` — attempted because deployment configuration was available, but blocked by an already-running local backend on port 3210; no code change was made to resolve the environment conflict.

### Workload, rollback, deviations, and remaining work

Delivery is the resolved `stacked-to-main` PR6/WU12 boundary. This work unit adds 94 consumer-contract lines plus OpenSpec bookkeeping, below the 400-line attempt budget; generated output is excluded from authored-line accounting and no commit or push was created. Rollback removes only the consumer type-contract fixture and its WU12 task/progress evidence; it changes no runtime data or registered API behavior.

No design deviation was introduced. The earlier whole-object type equality failure was a fixture-level type-identity limitation, not a generated API mismatch; atomic exact field/key assertions retain the required consumer-contract coverage without widening the registered contract.

Exact remaining implementation-owned rows:

- [ ] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [ ] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->

Parent-owned lifecycle rows remain deferred and byte-for-byte unchanged.

## PR 1 compatibility closure — deferred WU1/WU2 TRIANGULATE rows

### Status consumed / produced

```yaml
schemaName: spec-driven
changeName: add-selection-only-resource-creation
artifactStore: openspec
planningHome:
  root: /home/garfex/PROGRAMACION/sistema-garfex/openspec
  changesDir: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes
changeRoot: /home/garfex/PROGRAMACION/sistema-garfex/openspec/changes/add-selection-only-resource-creation
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
taskProgress:
  total: 48
  complete: 48
  remaining: 0
  unchecked: []
deferredParentActions:
  total: 2
  complete: 0
  remaining: 2
  unchecked:
    - "- [ ] Start or reuse a bounded review across PR 1–PR 6 after implementation evidence is available; enforce the 400-authored-line budget per work unit and request the deferred chain-strategy decision before applying the high-risk delivery plan. <!-- sdd-owner: parent -->"
    - "- [ ] Confirm the final verification receipt contains `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, `git diff --check`, focused-test results, and rollback boundaries before lifecycle completion. <!-- sdd-owner: parent -->"
taskArtifactErrors: []
applyState: all_done
dependencies:
  apply: all_done
  verify: ready
  sync: blocked
  archive: blocked
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated allowlist consumed
  warnings:
    - Existing unrelated worktree modifications were preserved.
    - Code generation refreshed pre-existing generated declaration changes; no generated declaration was hand-edited.
nextRecommended: parent-lifecycle
isNonAuthoritative: false
```

Completed persisted implementation rows (and only these rows changed):

- `[x] WU1 TRIANGULATE`: legacy absent-mode fallback remains projected; revisioned mode/type updates retain their revision seam; `cargarAgregado` rejects an effective `SELECCION` assignment with only an active invalid typed value.
- `[x] WU2 TRIANGULATE`: the existing typed TEXTO/finite NUMERO/BOOLEANO/OPCION, foreign/inactive option, source mapping uniqueness, and stale no-write cases remain covered; effective-assignment and active-rule lifecycle blockers are now proved.

### Files changed

- `convex/catalogoAdmin/atributos.test.ts`
- `convex/catalogoAdmin/atributos.ts`
- `convex/schema.ts` (additive `porValorPermitidoCondicion` lookup index only)
- `convex/_generated/api.d.ts` and `convex/_generated/dataModel.d.ts` (codegen only)
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| WU1 mode/aggregate closure | `convex/catalogoAdmin/atributos.test.ts` | Convex integration | 23/23 focused tests passed in 4 files | The new active-rule lifecycle assertion initially received `UPDATED`, proving the missing rule blocker after the setup was triangulated with a fallback allowed value | 25/25 focused tests passed after the indexed active-rule blocker | `cargarAgregado` rejects both no active valid typed value and an active mismatched payload; existing revision/legacy fallback cases remain green | No further refactor was needed; the bounded indexed blocker is a single helper |
| WU2 typed lifecycle closure | `convex/catalogoAdmin/atributos.test.ts`, `resourceValidators.test.ts` | Convex integration + unit | Included above | The required rule blocker failed before production code changed | 25/25 focused tests passed | Existing tests cover all four payload kinds, option ownership/lifecycle, source mapping uniqueness, stale no-write, and effective-assignment protection; the new alternate-value rule fixture proves the independent active-rule branch | The additive index closes the bounded direct-reference lookup gap without migration or validator tightening |

### Verification evidence

- Safety net: `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts convex/catalogoAdmin/resourceValidators.test.ts convex/catalogoAdmin/lib/cargarAgregado.test.ts src/catalogoRecursos/dominio/modoCaptura.test.ts` — 23 tests passed in 4 files.
- RED: `pnpm exec vitest run convex/catalogoAdmin/atributos.test.ts` — 1 failed / 17 passed because an allowed value referenced by an active effective rule deactivated as `UPDATED` when another valid value remained.
- GREEN/TRIANGULATE: the four-file focused command — 25 tests passed in 4 files.
- Full: `pnpm exec vitest run` — 41 files and 405 tests passed.
- Typecheck: `pnpm typecheck` — passed (`tsc --noEmit`).
- Codegen: `pnpm exec convex codegen --typecheck enable` — passed; generated declarations were refreshed only by the command.
- Diff: `git diff --check` — passed.
- Convex-test scenario: an effective selection aggregate containing only an active invalid typed payload fails with `ASSIGNMENT_SELECTION_INVALID` and `OPTION_SET_EMPTY`; a referenced active effective rule blocks deactivation even with a fallback allowed value, leaving the value active at revision 1.

### Workload, rollback, deviations, and deferred lifecycle

Delivery is the resolved `stacked-to-main` final PR1 compatibility closure, within the supplied 400 authored-line scope: 68 test lines, 7 adapter lines, and one additive schema-index line before codegen and OpenSpec bookkeeping. The only production change is a bounded direct index lookup that prevents deactivation of an allowed value referenced by an active effective rule. The existing `cargarAgregado` behavior already correctly rejected invalid/empty effective selections, so it received test coverage rather than a behavior change. Rollback removes the direct rule-reference index and blocker while retaining existing mode fallback, typed storage, and later work-unit compatibility behavior.

No parent-owned checkbox was edited. The two parent lifecycle actions above remain deferred for the parent; no review, receipt, commit, or push was created.

### Runtime attempt settlement

`gentle-ai sdd-attempt settle` completed the `deferred-mode-value-triangulation` objective with outcome `passed` and evidence revision `sha256:49b0f5b94cb293066be4e058eb90d6b1ce6ae84bd0b8576c8368311b2824974b`; runtime authority returned `state: complete`.

## Parent final verification receipt

The parent confirmed the final technical receipt and marked only its verification action complete. `pnpm exec vitest run && pnpm typecheck` passed with 405/405 tests across 41 files; `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check` passed. Codegen left all five generated-file hashes unchanged. The consolidated focused run passed 217/217 tests across evaluator/fingerprint, live loader/query/create, publication v1/v2, legacy compatibility, migration/backfill, allowed values, and rules. Contract evidence confirms `VALID` iff `valid`, exactly four creation dispositions and a two-key `CREATED`, fingerprint-mismatch precedence, no-write expected outcomes, and publication-free live endpoints. Rollback boundaries remain documented per WU1–WU12 above. `pnpm exec convex dev --once` remains N/A because the existing local `convex-local-ba` process owns port 3210.

Technical verification is ready for review.

## Parent bounded review receipt

The native provider mismatch was repaired by disabling the persistent Gentle AI 2.6.0 development-binary override, restoring package-pinned 2.5.0, enabling the explicitly authorized global RDD mode, and synchronizing managed assets. The parent selected all six intended untracked implementation/test files and received fresh consent for the exact frozen candidate.

Native ordinary review lineage `review-d2dc699d1a9ccbd1` reviewed the workspace projection at target `sha256:20be5ca826a13ce6c15b703040193c2e6bf0575386bb06d17eb7dfff90dbb74a` (35 files, 3,635 changed lines, medium tier, 200-line correction budget) through the `review-reliability` lens. The review closed `approved`; acknowledgement consumed revision `sha256:40aa5e3d99ca4b7124d1db50bfb91d819f735c4c971f7b17a029726731f6dfb2` and burned the authority receipt. No correction transition was offered. Five warnings were explicitly informational and non-blocking: presence-rule publication loss, rule-blocker truncation, selection-rule validation gap, stale Unit-policy fingerprint, and unbounded aggregate loader total. They remain separate follow-up work and do not reopen this approved candidate.

Delivery remains ordinary repository policy with the resolved `stacked-to-main` strategy. No commit, push, PR, or release was performed by the review lifecycle.

## Failed-verification blocker remediation

### Status consumed / produced

```yaml
schemaName: gentle-ai.sdd-status
changeName: add-selection-only-resource-creation
artifactStore: openspec
applyState: all_done
nextRecommended: verify
actionContext:
  mode: repo-local
  workspaceRoot: /home/garfex/PROGRAMACION/sistema-garfex
  allowedEditRoots: delegated remediation allowlist consumed
warnings:
  - The authoritative status retains all tasks as complete; the parent-provided correction token authorized only failed-verification remediation.
  - verify-report.md was preserved as the immutable failed artifact.
```

Remediated the three failed-verification blockers under correction token `sha256:ac51f264f1ed72bb9705fe75b70a834777f3d6193e68be3a6ab4ffb7dbb3e29e`.

- Canonical `valoresPermitidos` now contains only active effective catalog rows. Direct-ID submitted inactive or foreign rows are retained exclusively in `valoresPermitidosDiagnosticos` for evaluator classification, so no submitted answer affects `catalogFingerprint`.
- The fingerprint now includes Family→Class and Type→Family relationship values, computed hierarchy/unit validity, and a canonically ordered complete effective Unit-policy set with policy lifecycle/principal fields and direct-loaded referenced Unit lifecycle state.
- WU11 is corrected truthfully: its checked row is now `CHARACTERIZE/SAFETY NET`, documenting the passing legacy baseline and that no production correction was needed; no historical failing RED is claimed.

### Files changed

- `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts`
- `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts`
- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts`
- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts`
- `convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts`
- `convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts`
- `convex/catalogoAdmin/recursos.test.ts`
- `openspec/changes/add-selection-only-resource-creation/tasks.md`
- `openspec/changes/add-selection-only-resource-creation/apply-progress.md`

### TDD Cycle Evidence

| Task | Test file | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Fingerprint and direct-ID remediation | `evaluarCreacionSeleccion.test.ts`, `huellaCatalogoSeleccion.test.ts` | Unit | 91/91 focused tests passed in 3 files | 2 failures: diagnostic inactive/foreign IDs were classified as unknown, and relationship/policy changes did not change the hash | 18/18 focused domain/loader tests passed after separating diagnostics and canonical fingerprint inputs | Added policy removal, Type override, principal, and referenced inactive-Unit variants; 102/102 focused evaluator/fingerprint/loader/create tests passed | Canonical policy projection and relationship references remain single-purpose; focused tests stayed green |
| Loader policy projection | `cargarCreacionSeleccion.test.ts` | Convex integration | Included above | The new assertion failed because an inactive submitted row was appended to canonical values | Passed after the loader kept it in diagnostics and projected direct-loaded policy Units | Added a Type policy for an inactive second Unit and proved both selected policies retain stable lifecycle/principal/Unit state | Reused existing bounded reads and direct `db.get`; no publication reads were added |
| WU11 planning-label correction | `tasks.md`, prior WU11 characterization evidence | Documentation | N/A | Not applicable: no production behavior changed and no historical RED existed | The checked `CHARACTERIZE/SAFETY NET` row truthfully records the passing baseline | Not applicable | No code refactor was needed |

### Verification evidence

- Safety net: `pnpm exec vitest run src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts convex/catalogoAdmin/recursos.test.ts` — 91 tests passed in 3 files.
- RED: `pnpm exec vitest run src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts` — 2 failures; `pnpm exec vitest run convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts` — 1 failure.
- Focused GREEN/TRIANGULATE: `pnpm exec vitest run src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts convex/catalogoAdmin/recursos.test.ts` — 102 tests passed in 4 files.
- `pnpm exec vitest run` — 408 tests passed in 41 files.
- `pnpm typecheck` — passed.
- `pnpm typecheck:consumer` — passed.
- `pnpm exec convex codegen --typecheck enable` — passed; pre/post generated declaration hashes were identical.
- `git diff --check` — passed.

### Workload, deviations, and remaining lifecycle

This remediation is the parent-authorized failed-verification correction slice with a 400-line cap; it changes only the delegated domain, loader, test, and OpenSpec surfaces. No public DTO changed, no publication table was read, and the mandatory create fingerprint mismatch precedence remains unchanged. The persisted WU11 row is visibly checked and all other implementation task rows remain checked; parent-owned lifecycle rows were not edited. No re-verification, archive, commit, or push was performed. The next action is parent-owned independent verification.
