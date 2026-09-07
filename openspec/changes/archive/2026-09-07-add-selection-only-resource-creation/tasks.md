# Implementation Tasks: Selection-only Resource creation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 3,000–4,200 authored lines across schema, domain, Convex adapters, migrations, publication, tests, and consumer contracts |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 capture mode + typed allowed values → PR 2 migration + conditional-rule compatibility → PR 3 evaluator + fingerprint + identity → PR 4 live loader/query + transactional create → PR 5 publication compatibility → PR 6 regressions + generated consumer contract |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

## Execution Rules

Implement each work unit as a separately reviewable commit/PR slice, keep authored additions plus deletions below 400 lines, and retain tests with the behavior they prove. Follow RED → GREEN → TRIANGULATE → REFACTOR in order; after each work unit run its focused Vitest files with `pnpm exec vitest run` and record the exact result, use a Convex-test scenario where the unit has a registered-function boundary, record runtime harness `N/A` only for pure-domain units, and run `git diff --check`. Do not hand-edit `convex/_generated/*`; regenerate it only through `pnpm exec convex codegen --typecheck enable`.

## PR 1 — Additive catalog-storage foundation

### Work unit 1: Capture-mode compatibility seam

**Depends on:** existing definition schema and `convex/catalogoAdmin/atributos.ts`. **Finish/rollback boundary:** optional `modoCaptura` storage and its fallback reader can be removed without touching legacy values, options, or public Resource creators.

- [x] **RED:** Add failing cases in `src/catalogoRecursos/dominio/modoCaptura.test.ts` and `convex/catalogoAdmin/atributos.test.ts` for absent-mode fallback (`OPCION` → `SELECCION`, all other current types → `LIBRE`), explicit mode projection, and rejection of `DERIVADO`. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Add `src/catalogoRecursos/dominio/modoCaptura.ts`, additive mode types in `src/catalogoRecursos/dominio/tipos.ts`, optional `modoCaptura` validation in `convex/schema.ts`, and explicit create/update/detail handling in `convex/catalogoAdmin/atributos.ts` without changing legacy Resource inputs. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Extend the same tests to prove mode/type transitions use the existing revision seam, preserve absent legacy rows, and reject a transition to effective `SELECCION` when `convex/catalogoAdmin/lib/cargarAgregado.ts` finds no active valid allowed value. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Centralize all fallback resolution through `resolverModoCaptura`, remove duplicate mode branching, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and verify rollback is limited to `modoCaptura` fields/readers. <!-- sdd-owner: implementation -->

### Work unit 2: Typed allowed-value storage and admin lifecycle seam

**Depends on:** work unit 1. **Finish/rollback boundary:** the new `valoresPermitidosAtributo` table, its CRUD/read functions, and related indexes are additive and can remain inert if the new creator is disabled.

- [x] **RED:** Add failing tests in `convex/catalogoAdmin/atributos.test.ts` and `convex/catalogoAdmin/resourceValidators.test.ts` for the discriminated `valor` payload, exact `kind === tipoDato`, finite numbers, same-definition active OPCION sources, immutable scoped key, optimistic revision, and inactive-key reservation. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Add the reusable `ValorPermitidoTipado` validator/type, `valoresPermitidosAtributo` schema/indexes in `convex/schema.ts`, and create/detail/update/activate/deactivate functions in `convex/catalogoAdmin/atributos.ts` with `ADMIN_DUPLICATE_KEY`, `ADMIN_IMMUTABLE_FIELD`, and `ADMIN_STALE_REVISION` behavior. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Add tests for text, finite number, boolean, and option payloads; foreign/inactive option rejection; source-option mapping uniqueness; revision conflict no-write behavior; and lifecycle blockers for active rules, effective assignments, and publication candidates. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Extract shared payload/ownership/lifecycle validation in `convex/catalogoAdmin/atributos.ts` or its concrete `convex/catalogoAdmin/lib/` helper, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and confirm the rollback removes only allowed-value administration behavior. <!-- sdd-owner: implementation -->

### Work unit 3: Ordered allowed-value reads and Resource-value reference seam

**Depends on:** work unit 2. **Finish/rollback boundary:** pagination metadata and optional value-row reference are additive; legacy Resource rows and creators remain untouched.

- [x] **RED:** Add failing tests in `convex/catalogoAdmin/lib/pagination.test.ts`, `convex/catalogoAdmin/atributos.test.ts`, and `convex/catalogoAdmin/lib/recursoPersistencia.test.ts` for `orden → clave → id` cursor traversal, lifecycle-filter plans, inactive/non-effective administrative visibility, and ID-based allowed-value blockers. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Add `adminSortId` population and the two ordered list indexes to `convex/schema.ts`; implement `listarValoresPermitidosAtributo` in `convex/catalogoAdmin/atributos.ts` using only the documented indexes/native cursor; add optional `valorPermitidoId` plus `porValorPermitido` to `valoresAtributoRecurso`. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Prove equal-order/key ties neither skip nor repeat records, `ALL`/`ACTIVE`/`INACTIVE` cursor contexts cannot mix, and deactivation/reference blockers query `porValorPermitido` rather than inferring a reference from `valor === clave`; prove legacy rows without the field remain valid. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Share cursor-envelope and stored-reference projection helpers without in-memory reordering, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and confirm rollback does not backfill or delete legacy Resource values. <!-- sdd-owner: implementation -->

## PR 2 — Migration and conditional compatibility

### Work unit 4: Resumable mode/option/rule migration seam

**Depends on:** work units 1–3. **Finish/rollback boundary:** `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.ts` only adds mappings/optional fields and never rewrites Resources, aliases, revisions, or snapshots.

- [x] **RED:** Add failing migration tests in `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.test.ts` for resumable `DEFINITIONS`, `OPTIONS`, `RULES`, and `VERIFY` batches, including reruns, bounded continuation, conflicts, and no writes to legacy Resource value/snapshot tables. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Implement `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.ts` following the existing `backfillMetadatos` bounded state-machine pattern: explicitly backfill modes, create one `OPCION` typed allowed value per legacy option with `orden: 0`, populate `adminSortId`, and map rules through the source-option index. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Cover inactive-option migration exception, pre-existing key/payload or option-mapping conflict reporting without overwrite, unmapped-rule/invalid-active-option verification failures, and proof that every non-OPCION definition becomes `LIBRE`. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Extract bounded batch/report helpers and document the deploy → backfill → verify → tighten precondition beside the migration, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and confirm rollback leaves additive mappings inert rather than deleting data. <!-- sdd-owner: implementation -->

### Work unit 5: Dual conditional-rule reference seam

**Depends on:** work unit 4. **Finish/rollback boundary:** optional `valorPermitidoCondicionId` and selection projection can be reverted while legacy option predicates continue operating.

- [x] **RED:** Add failing tests in `convex/catalogoAdmin/reglas.test.ts` and `src/catalogoRecursos/dominio/reglasCondicionales.test.ts` for immutable dual-reference identity, mapped same-definition active values, allowed-only rule filtering from legacy evaluation, allowed-value-ID matching, and false/zero/empty-string legacy presence regressions. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Add optional rule-reference storage/indexes in `convex/schema.ts`; update `convex/catalogoAdmin/reglas.ts` and `src/catalogoRecursos/dominio/reglasCondicionales.ts` to validate/map dual references, retain legacy option semantics, and expose a selection-only predicate projection. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Test presence-only, legacy-only, dual mapped, and selection-only rules; foreign/inactive/mismatched option mapping rejection; conflict detection by allowed-value ID; activation no-write guarantees; and `CONDITIONAL` resolving to `OPTIONAL` when no rule fires. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Isolate legacy and selection projections behind explicit functions so neither can silently treat the other’s reference as presence, run `pnpm exec vitest run`, record the focused result and Convex-test scenario, and confirm rollback removes only the optional selection reference path. <!-- sdd-owner: implementation -->

## PR 3 — Deterministic selection domain

### Work unit 6: Pure evaluator applicability/status seam

**Depends on:** work units 1–5. **Finish/rollback boundary:** `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts` is database-independent and removable without modifying legacy validator exports.

- [x] **RED:** Create `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts` with failing fixtures for Type-over-Family precedence, stable assignment order, unknown/foreign/inactive/non-effective selections, duplicate assignment input, all four resolved applicability values, simultaneous conditional resolution, retained forbidden/non-applicable selections, and required/optional `LIBRE`. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Implement `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts` with database-independent graph/input/issue types, selection validation, conditional resolution through allowed-value IDs, normalized accepted-assignment tracking, and exact `INVALID → INCOMPLETE → VALID` precedence where `valid === (status === "VALID")`. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Add cases proving invalid input wins over missing required selections, duplicate IDs collapse in first-input order and cannot fire predicates, each effective assignment is reported, required selectable omissions populate `faltantesRequeridos`, and no resolved output returns `CONDITIONAL`. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Keep issue messages adjacent to fixed codes and reuse existing precedence/order utilities from `src/catalogoRecursos/dominio/asignacionesEfectivas.ts`, run `pnpm exec vitest run`, record the focused result with runtime harness `N/A` because this is pure domain code, and confirm rollback is isolated to the new evaluator module/tests. <!-- sdd-owner: implementation -->

### Work unit 7: Typed normalization, v2 identity, naming, and fingerprint seam

**Depends on:** work unit 6. **Finish/rollback boundary:** the evaluator’s private persistence sidecar and fingerprint module do not alter public legacy persistence contracts.

- [x] **RED:** Extend `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.test.ts` and add `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.test.ts` for typed TEXT/NUMERO/BOOLEANO/OPCION normalization, public omission/private retention of `valorPermitidoId`, v2 Class/Family/Type identity, label-versus-identity behavior, and deterministic fingerprint changes/no-changes. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Add `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts` and extend the evaluator to derive persistence only from typed `valor`, resolve OPCION to its current server option key, create the private `PersistableSelectionValue` sidecar, generate normalized names, reuse `identidadRecursoV2`/`serializarIdentidadV2`, and set identity version 2 inputs. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Prove finite-number enforcement, boolean false preservation, deliberately different allowed `clave`/payload values, code-point/stable ordering, storage-order independence, ownership active-state changes, option-key changes, unresolved reference sentinels, and publication/snapshot-only changes not affecting the live fingerprint. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Centralize code-point comparison, canonical serialization, and reference sentinels; ensure no v3 serializer or key-as-runtime-value shortcut is introduced; run `pnpm exec vitest run`, record the focused result with runtime harness `N/A`, and confirm rollback leaves legacy identity behavior intact. <!-- sdd-owner: implementation -->

## PR 4 — Live endpoint and atomic persistence

### Work unit 8: Shared bounded live loader and evaluation query seam

**Depends on:** work units 1–7. **Finish/rollback boundary:** the new loader/query reads live catalog data only and can be removed without changing publications or legacy endpoints.

- [x] **RED:** Add failing Convex-test cases in `convex/catalogoAdmin/recursos.test.ts` and a new `convex/catalogoAdmin/lib/cargarCreacionSeleccion.test.ts` for hierarchy/Unit validation, active organization validation, identical live graph semantics for `GLOBAL` and `ORGANIZATION`, and no effect from zero/one/multiple published snapshots. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Implement bounded indexed loading in `convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts` and add exact evaluation validators in `convex/catalogoAdmin/resourceValidators.ts`; register `evaluarCreacionDesdeSelecciones` in `convex/catalogoAdmin/recursos.ts` to call the unchanged pure evaluator and discard its private sidecar. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Assert every growable loader read uses an index plus a bound, direct submitted IDs use `db.get`, inactive/missing organizations return `OWNERSHIP_INVALID`, the exact top-level/assignment/normalized DTO field sets are preserved, and live endpoint tests fail if publication/revision/snapshot reads are introduced. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Share the one loader between `QueryCtx` and `MutationCtx`, preserve table-specific Convex IDs only at adapters, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback removes only the additive query/loader/validators. <!-- sdd-owner: implementation -->

### Work unit 9: Atomic create, persistence, and disposition seam

**Depends on:** work unit 8. **Finish/rollback boundary:** selection creation is additive; disable/remove only its mutation to roll back while retaining successful aggregates and all legacy creators.

- [x] **RED:** Add failing Convex-test cases in `convex/catalogoAdmin/recursos.test.ts` and `convex/catalogoAdmin/lib/recursoPersistencia.test.ts` for mandatory fingerprint, mismatch-before-status precedence, the four exact dispositions, exact two-key `CREATED`, no-write snapshots, v2 scoped conflicts including inactive reservations, OCC race behavior, and organization alias/global scope differences. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Refactor `convex/catalogoAdmin/lib/recursoPersistencia.ts` around an explicit server-only aggregate insertion helper while keeping `insertarRecursoAdministrativo` behavior unchanged; register `crearRecursoDesdeSelecciones` in `convex/catalogoAdmin/recursos.ts` to reload/evaluate, compare fingerprint before writes, convert identity conflicts to `INVALID`, persist `activo: false`, `identidadVersion: 2`, private values with `valorPermitidoId`, and a version-2 organization alias only when applicable. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Prove stale invalid/incomplete input still yields `CATALOG_CHANGED`, matching incomplete/invalid input writes no Resource/value/alias, valid creates derive every field without manual/primitive args, race losers return typed `IDENTITY_CONFLICT`, and every selection-created value row has an allowed-value ID while legacy-created rows do not need one. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Keep query/mutation orchestration thin, use Convex transaction/OCC only (no actions, locks, retries, or compensating writes), run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback is limited to the additive mutation/persistence path without deleting created Resources. <!-- sdd-owner: implementation -->

## PR 5 — Publication and snapshot compatibility

### Work unit 10: Publication representation, completeness, and canonical-hash seam

**Depends on:** work units 1–5. **Finish/rollback boundary:** v2 publication readers remain union-compatible; historical snapshots and revision bytes are never edited.

- [x] **RED:** Add failing tests in `src/catalogoRecursos/dominio/catalogoPublicado.test.ts`, `convex/catalogoRecursos/catalogoPublicado.test.ts`, and `convex/catalogoAdmin/publicacion.test.ts` for v1/v2 snapshot union reading, selection-mode/payload/rule/unit completeness, atomic publication failure, storage-order-independent v2 hash, semantic hash changes, and untouched historical snapshots. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Update `src/catalogoRecursos/dominio/catalogoPublicado.ts`, `convex/catalogoRecursos/catalogoPublicado.ts`, `convex/catalogoRecursos/catalogoPublicadoValidators.ts`, `convex/catalogoAdmin/lib/cargarAgregado.ts`, `convex/catalogoAdmin/publicacion.ts`, and `convex/schema.ts` to compile/validate `snapshotVersion: 2` selection graphs while retaining the exact legacy representation. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Prove an effective `SELECCION` assignment without active valid typed values prevents both revision and snapshot insertions, active OPCION payloads require active same-definition options, allowed-only rules do not leak into legacy projections, and equivalent v2 semantics hash equally despite database IDs/insertion order. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Version canonicalization with `catalog-content:v2`, share aggregate violation mapping, keep endpoint loaders publication-free, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback retains a reader for both snapshot versions. <!-- sdd-owner: implementation -->

## PR 6 — Compatibility proof and generated consumer surface

### Work unit 11: Legacy creator and stored-data regression seam

**Depends on:** work units 1–10. **Finish/rollback boundary:** regression tests protect existing public APIs and persistence shapes; no legacy data migration is introduced.

- [x] **CHARACTERIZE/SAFETY NET:** Add passing baseline characterization coverage in `convex/catalogoAdmin/recursos.test.ts`, `convex/catalogoAdmin/compatibilidad.test.ts`, `convex/catalogoRecursos/recursos.test.ts`, and `src/catalogoRecursos/dominio/compatibilidadOpciones.test.ts` for existing Resource creator arguments, returns, errors, primitive values, legacy option values/rules, and stored rows without `valorPermitidoId`; no production change was required. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Adjust only compatibility adapters in `convex/catalogoAdmin/lib/recursoPersistencia.ts`, `convex/catalogoRecursos/validacionRecurso.ts`, and affected existing validators so legacy creators and legacy-rule evaluation preserve their former observable behavior alongside the additive selection path. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Prove selection-only rules are filtered from legacy presence evaluation, historical Resource rows are not rewritten or inferred from values/keys, legacy Resource creation requires neither a fingerprint nor allowed-value ID, and the seven prior Resource admin functions remain exported unchanged. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Remove accidental coupling between legacy and selection-only validation paths, run `pnpm exec vitest run`, record the focused Convex-test result, and confirm rollback can disable new functions without changing legacy contracts or data. <!-- sdd-owner: implementation -->

### Work unit 12: Generated contracts and consumer typing seam

**Depends on:** work units 8–11. **Finish/rollback boundary:** generated declarations are produced by codegen only; consumer test removal does not alter runtime data.

- [x] **RED:** Add failing type assertions in `contract-tests/resource-admin-consumer.ts` for direct generated API references, exact shared Spanish input, selection `valorPermitidoId`, mandatory create fingerprint, exact public normalized DTO without an allowed-value ID, exhaustive four-disposition narrowing, and absence of suspended-selection/manual/primitive fields. <!-- sdd-owner: implementation -->
- [x] **GREEN:** Complete exact registered-function args/returns in `convex/catalogoAdmin/resourceValidators.ts` and `convex/catalogoAdmin/recursos.ts`, then regenerate `convex/_generated/*` exclusively with `pnpm exec convex codegen --typecheck enable`; do not hand-edit generated files. <!-- sdd-owner: implementation -->
- [x] **TRIANGULATE:** Extend `contract-tests/resource-admin-consumer.ts` to reject extra `CREATED` metadata, aliases for approved Spanish fields, a public `valorPermitidoId` in `valoresNormalizados`, and any fifth disposition; run `pnpm typecheck:consumer` and record its exact result. <!-- sdd-owner: implementation -->
- [x] **REFACTOR/VERIFY:** Consolidate contract fixtures around generated `FunctionArgs`/`FunctionReturnType`, run `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, and `git diff --check`; record exact results and use `pnpm exec convex dev --once` only when a deployment is available. <!-- sdd-owner: implementation -->

## Parent-owned post-apply actions

- [x] Start or reuse a bounded review across PR 1–PR 6 after implementation evidence is available; enforce the 400-authored-line budget per work unit and request the deferred chain-strategy decision before applying the high-risk delivery plan. <!-- sdd-owner: parent -->
- [x] Confirm the final verification receipt contains `pnpm exec vitest run && pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, `git diff --check`, focused-test results, and rollback boundaries before lifecycle completion. <!-- sdd-owner: parent -->
