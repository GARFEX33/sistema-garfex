# Exploration: selection-only resource creation

## Result

Proceed with a new additive creator API backed by a typed `valoresPermitidosAtributo` model and one shared, pure selection evaluator. The current Resource creators remain compatibility paths; the new flow must not accept manual name/description or primitive values.

## Evidence and current seams

- `.codegraph/` is present, but this executor has no CodeGraph MCP/CLI surface. After the required availability check, inspection used targeted reads.
- `definicionesAtributo.tipoDato` is currently `TEXTO | NUMERO | BOOLEANO | OPCION`; `opcionesAtributo` is owned only by `OPCION` definitions.
- Effective assignment precedence and ordering already exist in `src/catalogoRecursos/dominio/asignacionesEfectivas.ts`: selection precedes filtering, and order is `orden → definicionClave → assignment id`.
- Conditional rules currently predicate on legacy `opcionCondicionId`; `evaluarReglasCondicionales` already has correct presence semantics for `false`, `0`, and empty strings.
- The current pure Resource validator accepts primitive values and manual create input. Both legacy `catalogoRecursos.crearRecurso` and administrative `catalogoAdmin.recursos.crearRecurso` accept caller name/description/values.
- Published catalog revisions already have deterministic `hashContenido`, but their snapshot shape, compiler, and canonical hash presently serialize legacy options rather than allowed values.

## Recommended model and migration boundary

Add `modoCaptura: SELECCION | LIBRE` to attribute definitions. `DERIVADO` is absent from validators, schema, API, and evaluator v1.

Introduce `valoresPermitidosAtributo` as a first-class lifecycle/revisioned table with at least definition ownership, immutable technical `clave`, display `nombre`, optional description, `orden`, `activo`, and `revision`. Its list/index order must be `orden → clave → id`; its identity key is `(definicionAtributoId, clave)` even when inactive.

Use a safe coexistence migration:

1. Add `modoCaptura` as optional during rollout and interpret absent legacy rows by `tipoDato` (`OPCION` as `SELECCION`; all other types as `LIBRE`).
2. Backfill every `OPCION` definition to explicit `SELECCION` and every other definition to `LIBRE`.
3. Create one allowed value for every legacy option, preserving key, label, lifecycle, ordering, and a forward legacy-option mapping needed by old records/rules.
4. Add an optional allowed-value condition reference to rules, backfill it from the legacy option mapping, and make the new evaluator consume only the allowed-value reference.
5. Retain legacy options, option references, values, APIs, and Resource creation until a separately proven compatibility retirement; do not rewrite stored Resource values destructively.

The publication compiler, snapshot validators, canonicalization, aggregate completeness checks, rule lifecycle validation, option compatibility boundaries, generated declarations, and admin reads must be migrated together. Active/effective selection assignments require at least one active allowed value; inactive or shadowed records remain inspectable but are not effective.

## Shared evaluation contract

Expose public `evaluarCreacionDesdeSelecciones` with the confirmed shared input: `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership`. The backend validates the supplied hierarchy and effective-unit policy rather than omitting or deriving those inputs; it then loads selected assignments, active allowed values, and effective rules, resolves `CONDITIONAL`, and produces one normalized evaluation object.

The pure evaluator must be reusable unchanged by the query adapter and the create mutation. It should return:

- `catalogFingerprint`, deterministically derived from the exact effective selection graph used for evaluation (validated hierarchy and unit, selected assignment order/mode/identity flag, active allowed values, effective predicates, and lifecycle/effectivity inputs);
- applicability for every effective assignment, including `REQUIRED`, `OPTIONAL`, `FORBIDDEN`, and `NOT_APPLICABLE` after conditional resolution;
- normalized assignment/value-permitted selections;
- generated `nombre` and stable `identificadorTecnico` when evaluation is complete and valid;
- `missingSelections`, `invalidSelections`, and typed `issues`; and
- `{ status: INCOMPLETE | VALID | INVALID, valid: boolean }`, with the invariant `status === "VALID"` if and only if `valid === true`.

Status precedence is `INVALID` when any invalid issue exists, otherwise `INCOMPLETE` when required selectable assignments are missing, otherwise `VALID`. A selected inactive, foreign, duplicated, non-effective, forbidden, or non-applicable value is invalid. A required `LIBRE` assignment reached by the selection-only flow is invalid with a typed unsupported-capture issue; optional LIBRE assignments may be omitted. This prevents the UI from falsely presenting a creatable configuration it cannot submit.

Conditional predicates must compare allowed-value IDs, not labels or legacy option IDs. Selections suspended in the client are not transmitted; the server nevertheless recomputes applicability and rejects any supplied value that is no longer applicable.

Generate the name as `<Tipo.nombre> · <identity-participating allowed-value labels>` in stable effective-assignment order (`orden → clave → id`). Generate the technical identity from Type/assignment technical keys and allowed-value technical keys, not labels; reuse the existing length-safe/versioned identity serialization where compatible and record the chosen identity version explicitly.

## Create contract

`crearRecursoDesdeSelecciones` requires `expectedCatalogFingerprint: string` in addition to the shared evaluation input: `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership`. In one Convex mutation it reloads and evaluates the current catalog, validates the supplied hierarchy and effective-unit policy, compares the supplied fingerprint, checks the generated identity collision, and writes the Resource/value rows only for a valid current evaluation.

Expected outcomes are a return union, not generic Convex errors:

- `CREATED` is exactly `{ disposition: "CREATED", item: ResourceSummary }`;
- `CATALOG_CHANGED` includes the current evaluation/fingerprint and writes nothing;
- `INCOMPLETE` includes the current evaluation and writes nothing; and
- `INVALID` includes typed invalid issues and writes nothing.

Identity conflicts discovered during the transaction are an `INVALID` expected-flow result with a typed identity-conflict issue. Unexpected platform/data-corruption failures may still throw. Convex transaction atomicity remains the concurrency authority; no lock, action, retry coordinator, or compensating write is needed.

The new API accepts `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership`, and the backend validates hierarchy and effective-unit policy for those inputs. It derives name, technical identifier, active state, and persisted normalized selections server-side, and accepts neither manual name/description nor caller primitive values. The legacy `crearRecurso` remains behaviorally compatible during the transition.

## Required artifact supersession

The new proposal/design/specs must explicitly supersede the creator portions of archived `2026-09-01-resource-master-administration`: manual `nombre`/`descripcion`, primitive-specific value controls, simplified conditional handling, and the obsolete Resource-data stage are not part of the new creator. Historical archived receipts remain immutable; supersession is documented by this change rather than rewriting evidence.

## Delivery and verification

Use strict TDD (`RED → GREEN → TRIANGULATE → REFACTOR`) in slices under the 400-line review budget:

1. schema/validator migration plus allowed-value lifecycle/index tests;
2. pure selection evaluator tests for precedence, conditionals, presence, status invariant, naming, technical identity, and deterministic fingerprint;
3. query and transactional create integration tests for each explicit disposition, stale fingerprint, identity race, and no-partial-write state;
4. publication/snapshot/canonical-hash migration and legacy compatibility regressions; and
5. generated consumer typing proving the client sends `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership` (plus `expectedCatalogFingerprint` for create) and retains suspended selections locally.

Verification must include focused Vitest/convex-test suites, `pnpm exec vitest run`, `pnpm typecheck`, Convex code generation/typecheck, and `git diff --check`. Roll out optional fields and backfills before tightening validators; do not delete legacy options or rewrite legacy Resource value rows in this change.

## Residual design risks

The implementation must choose and document the catalog scope used to resolve the effective fingerprint when a Type is published for multiple organizations. That resolution must use an explicit backend-validated ownership rule; `ownership` is a confirmed API input, not a client-supplied catalog payload. It must also reconcile existing option-compatibility policies with allowed-value predicates before allowing those policies to affect the new selection evaluator.
