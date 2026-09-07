# Add selection-only Resource creation

## Intent

Add a new backend-authoritative Resource creator in which users configure a Resource only by selecting catalog-owned allowed values. A shared evaluator will resolve effective assignments and conditional questions, report whether the configuration is incomplete, valid, or invalid, and generate the Resource name and technical identity. Creation will re-run that same evaluation atomically and reject stale catalog assumptions without partial writes.

This is an additive path. Existing Resource creators and stored Resource values remain compatibility surfaces during migration.

## Problem statement

The current Resource creation paths accept caller-authored names, descriptions, and primitive attribute values. They also expose primitive-specific controls and a simplified view of conditional applicability. That lets clients construct Resources from inputs that are not constrained to the current effective catalog, duplicates business rules across consumers, and makes it difficult to provide an atomic question flow when `CONDITIONAL` assignments change what must be answered next.

The catalog currently models `OPCION` values through legacy option records, while published snapshots, conditional predicates, and creator validation are coupled to those records. There is no first-class allowed-value model shared by all selectable attribute types, no deterministic evaluation fingerprint for detecting catalog changes between preview and create, and no explicit expected-flow result that distinguishes an incomplete configuration from invalid input or a changed catalog.

## Product outcome

A client can progressively ask only the currently applicable selection questions, submit the same typed configuration for preview and creation, and receive deterministic backend results. The backend—not the client—will:

- validate the supplied Class, Family, Type, Unit, ownership, assignments, and values;
- resolve effective precedence and `CONDITIONAL` applicability;
- generate the Resource name and stable technical identity;
- identify missing and invalid selections with typed issues;
- detect when the effective catalog changed after evaluation; and
- create the Resource and normalized value rows in one transaction only when the current evaluation is valid.

Selections that become temporarily inapplicable may be retained as suspended UI state, but suspended selections are not sent to the backend. Active/suspended state is frontend behavior and is not added to the server contract or persisted model.

## Scope

### In scope

1. Add `modoCaptura: SELECCION | LIBRE` to attribute definitions through a compatibility-safe optional-field rollout and backfill.
2. Add lifecycle- and revision-aware `valoresPermitidosAtributo` records with definition ownership, immutable technical `clave`, display `nombre`, optional description, `orden`, `activo`, and `revision`.
3. Migrate every `OPCION` definition to `SELECCION` with equivalent allowed values, and migrate every other current attribute type to `LIBRE`.
4. Add an allowed-value reference for conditional predicates and make the new evaluator compare allowed-value IDs rather than labels or legacy option IDs.
5. Add one pure selection evaluator reused unchanged by the public evaluation query and transactional create mutation.
6. Add `evaluarCreacionDesdeSelecciones` for progressive evaluation and `crearRecursoDesdeSelecciones` for atomic creation.
7. Include the new allowed-value model and references in publication compilation, snapshot validation, canonicalization, completeness validation, lifecycle checks, generated contracts, and relevant admin reads.
8. Preserve existing creators, legacy options and references, existing Resource values, and historical snapshots as compatibility paths while the new flow is introduced.
9. Deliver the change in strict TDD slices, each kept below the configured 400-authored-line review budget.

### Out of scope

- Manual Resource `nombre` or `descripcion` in the new creator.
- Caller-supplied primitive text, number, or boolean values in the new creator.
- A `DERIVADO` capture mode in schema, validators, APIs, or evaluator v1.
- Persisting or transmitting suspended selections.
- Destructive rewriting of existing Resource value rows.
- Removal or behavioral changes to existing Resource creation APIs.
- Deletion of legacy options, option references, or historical published revisions.
- Custom locks, actions, retry coordinators, or compensating writes around creation.
- A new authorization system or frontend implementation.

## Proposed model and migration boundary

`modoCaptura` describes how a definition can be answered without replacing the existing `tipoDato` migration boundary. During rollout, an absent mode is interpreted as `SELECCION` for legacy `OPCION` definitions and `LIBRE` for every other current type. The field is then backfilled explicitly before validators are tightened. `DERIVADO` is intentionally excluded from v1.

Each allowed value belongs to one attribute definition. Its stable identity is `(definicionAtributoId, clave)`, including inactive records, and deterministic listing order is `orden → clave → id`. Active, effective `SELECCION` assignments require at least one active allowed value. Inactive or shadowed records remain inspectable but are not effective.

For each legacy option, migration creates a corresponding allowed value while preserving technical key, label, lifecycle state, and ordering. A forward mapping to the legacy option is retained so old Resource records and rules remain interpretable. Conditional rules gain an optional allowed-value reference, backfilled through this mapping; the new evaluator consumes only the allowed-value reference.

The publication compiler and snapshot contract must migrate as one compatibility boundary: snapshot validators, canonical serialization and hash generation, aggregate completeness checks, rule lifecycle validation, option compatibility handling, generated declarations, and admin reads must agree on the new representation. Historical snapshots remain immutable.

## Shared evaluation contract

`evaluarCreacionDesdeSelecciones` and `crearRecursoDesdeSelecciones` share this input exactly:

- `claseRecursoId`;
- `familiaRecursoId`;
- `tipoRecursoId`;
- `unidadId`;
- `selecciones`; and
- `ownership`.

The create input additionally requires `expectedCatalogFingerprint: string`. The backend validates the supplied hierarchy and effective-unit policy; it does not omit, infer, or trust those relationships merely because IDs were supplied. `ownership` selects scope under an explicit backend-validated rule and is not treated as client-authored catalog data.

The shared pure evaluator loads or receives the exact effective selection graph and returns one normalized `CreationEvaluation` containing:

- a deterministic `catalogFingerprint` over the validated hierarchy and Unit, ownership-resolved lifecycle/effectivity inputs, selected assignment order/mode/identity participation, active allowed values, and effective conditional predicates;
- applicability for every effective assignment after conditional resolution: `REQUIRED`, `OPTIONAL`, `FORBIDDEN`, or `NOT_APPLICABLE`;
- normalized assignment/allowed-value selections;
- generated `nombre` and stable `identificadorTecnico` when complete and valid;
- `missingSelections`, `invalidSelections`, and typed `issues`; and
- `{ status: "INCOMPLETE" | "VALID" | "INVALID", valid: boolean }` with the exact invariant `status === "VALID"` if and only if `valid === true`.

Status precedence is:

1. `INVALID` when any invalid issue exists;
2. otherwise `INCOMPLETE` when a required selectable assignment is missing;
3. otherwise `VALID`.

A selected inactive, foreign, duplicated, non-effective, forbidden, or non-applicable value is invalid. A required `LIBRE` assignment reached by this selection-only flow is invalid with a typed unsupported-capture issue; an optional `LIBRE` assignment may be omitted. Presence checks must continue to distinguish valid falsey values in legacy/shared rule behavior even though the new creator accepts only allowed-value selections.

Conditional predicates compare allowed-value IDs. Effective assignment precedence remains selection before filtering, with stable order `orden → clave → id` (using the definition technical key and assignment ID as the applicable stable tie-breakers). The generated name is `<Tipo.nombre> · <identity-participating allowed-value labels>` in effective-assignment order. The technical identity uses Type, assignment, and allowed-value technical keys rather than labels, reusing the existing length-safe versioned serialization where compatible and recording the chosen identity version explicitly.

## Atomic creation contract

`crearRecursoDesdeSelecciones` runs as one Convex mutation. It reloads the current catalog, invokes the same pure evaluator, validates hierarchy and effective-unit policy, compares `expectedCatalogFingerprint`, checks generated identity uniqueness, and writes the Resource plus normalized value rows only for a valid current evaluation.

Expected outcomes use this explicit disposition union rather than generic Convex errors:

- `CREATED` is exactly `{ disposition: "CREATED", item: ResourceSummary }`;
- `CATALOG_CHANGED` includes the current evaluation and fingerprint and writes nothing;
- `INCOMPLETE` includes the current evaluation and writes nothing; and
- `INVALID` includes typed invalid issues and writes nothing.

An identity conflict discovered inside the transaction is an expected `INVALID` result with a typed identity-conflict issue. Unexpected platform or data-corruption failures may still throw. Convex transaction atomicity and optimistic concurrency control are the concurrency authority.

The mutation derives name, technical identifier, active state, and persisted normalized selections server-side. It accepts neither a manual name/description nor primitive values.

## Supersession and compatibility

This proposal supersedes only the creator portions of archived change `2026-09-01-resource-master-administration` that describe:

- manual `nombre` or `descripcion` entry;
- primitive-specific Resource value controls;
- simplified conditional handling; and
- a separate Resource-data stage in the new creator flow.

Those behaviors do not apply to `crearRecursoDesdeSelecciones`. Archived receipts remain immutable and continue to document historical delivery. Existing `crearRecurso` functions remain behaviorally compatible until a separate change proves that legacy creator and data compatibility can be retired.

## Affected areas

| Area | Expected impact |
|---|---|
| Convex schema and validators | Add compatibility-safe `modoCaptura`, allowed-value storage/indexes, rule references, and exact typed evaluation/create result validators. |
| Catalog administration | Manage allowed-value lifecycle and expose inactive records for administration while enforcing ownership, key identity, ordering, and revision rules. |
| Effective assignment domain logic | Reuse existing precedence and ordering while adding selectable capture/applicability inputs. |
| Pure Resource validation/evaluation | Add the single shared evaluator, normalized selections, typed issues, naming, technical identity, and fingerprint generation. |
| Public Resource API | Add evaluation query and atomic selection-only creation mutation without changing legacy exports. |
| Conditional rules | Migrate predicates to allowed-value references for the new evaluator while retaining legacy references for compatibility. |
| Publication and snapshots | Compile, validate, canonicalize, hash, and type the allowed-value representation without rewriting historical revisions. |
| Resource persistence | Write only server-generated Resource fields and normalized selected values on `CREATED`; preserve existing rows unchanged. |
| Generated Convex contract | Expose exact shared input, mandatory create fingerprint, evaluation invariant, and disposition union to consumers. |
| Frontend integration contract | Support progressive conditional questions and local suspended selections without moving backend validation into the client. |
| Tests and migration tooling | Add pure evaluator, convex-test integration, migration, publication/hash, compatibility, and generated-consumer typing coverage. |

## Delivery approach

Use strict `RED → GREEN → TRIANGULATE → REFACTOR` slices:

1. compatibility-safe schema/validator migration and allowed-value lifecycle/index behavior;
2. pure evaluator behavior for precedence, conditional atomic question flow, presence semantics, status invariant, normalization, naming, technical identity, and deterministic fingerprint;
3. query and transactional create behavior for every disposition, stale fingerprints, identity conflicts/races, and no-partial-write guarantees;
4. publication, snapshot, canonical hash, rule-reference migration, and legacy compatibility regressions; and
5. generated consumer typing showing the exact shared input, mandatory create fingerprint, and client-local suspended selections.

Each implementation slice must stay below 400 authored additions plus deletions or be split before review. Verification includes focused Vitest/`convex-test` tests, `pnpm exec vitest run`, `pnpm typecheck`, Convex code generation/type validation, and `git diff --check`.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Evaluation and creation disagree after catalog changes | Use one pure evaluator in both adapters and require `expectedCatalogFingerprint` for every create. |
| A stale or newly inapplicable selection is persisted | Recompute applicability in the mutation and classify supplied forbidden, non-applicable, inactive, foreign, duplicated, or non-effective values as invalid. |
| Fingerprints are unstable or omit behavior-relevant state | Canonicalize the exact effective graph, define stable ordering, include lifecycle/effectivity inputs, and add deterministic change/no-change tests. |
| Organization scope resolves a different published catalog | Design must document one explicit backend-validated ownership resolution rule, including Types published for multiple organizations. |
| Legacy options, predicates, or Resource values become unreadable | Use additive fields and forward mappings; retain legacy tables/references/APIs and do not destructively rewrite existing values. |
| Publication hashes change accidentally or historical snapshots are altered | Version the new snapshot representation, test canonical hashes, and keep historical revisions immutable. |
| Required free-form data makes the selection-only UI appear creatable | Return typed unsupported-capture invalid issues for required `LIBRE` assignments; allow optional `LIBRE` assignments to be omitted. |
| Duplicate identities race between evaluation and create | Check identity inside the atomic mutation and return typed `INVALID` with no partial writes. |
| Option compatibility semantics conflict with allowed-value predicates | Reconcile and test the compatibility boundary before those policies influence the new evaluator. |
| Migration tightens populated schema too early | Add optional fields first, deploy/backfill and verify mappings, then tighten validators in a later safe step. |

## Rollback

1. Disable or remove the additive evaluation and selection-only create endpoints first; legacy creators remain available.
2. Stop new writes to allowed-value references while retaining migrated allowed values and mappings as inert data if removing them is unsafe.
3. Roll back publication/compiler use of the new representation only through a compatibility-aware code rollback; never mutate or delete historical snapshots.
4. Keep optional migration fields until all deployed code and stored rows permit safe removal.
5. Never roll back by deleting Resources created successfully through this flow or by rewriting legacy Resource value rows.
6. Roll back one TDD slice at a time within its documented schema, API, compiler, or consumer boundary.

## Success criteria

- A client can evaluate and create a Resource using only `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership`, with mandatory `expectedCatalogFingerprint` added for create.
- The shared evaluator drives conditional questions and returns deterministic applicability, normalized selections, typed issues, generated identity fields, and a deterministic catalog fingerprint.
- Every `CreationEvaluation` satisfies `status === "VALID"` if and only if `valid === true`, with `INVALID` taking precedence over `INCOMPLETE`.
- The creator returns only `CREATED | CATALOG_CHANGED | INCOMPLETE | INVALID`, and `CREATED` has exactly `{ disposition: "CREATED", item: ResourceSummary }`.
- `CATALOG_CHANGED`, `INCOMPLETE`, `INVALID`, and identity-conflict outcomes perform no Resource, value, or alias partial writes.
- Manual names/descriptions and caller primitive values cannot enter the new creator contract.
- Every effective selectable assignment is evaluated in stable precedence/order, including allowed-value-based conditional rules.
- Required `LIBRE` assignments are reported as unsupported by this flow, while optional `LIBRE` assignments can be omitted.
- Existing Resource creators, legacy options/rules/values, public behavior, and historical snapshots remain compatible.
- `OPCION` definitions and values migrate to `SELECCION` plus allowed values; all other current types migrate to `LIBRE`; `DERIVADO` is absent from v1.
- Publication snapshots and hashes deterministically represent the migrated effective catalog without rewriting historical revisions.
- Focused and full Vitest/`convex-test`, typecheck, Convex generated-contract checks, and diff validation pass for review-sized TDD slices.

## Decisions carried forward

Product decisions are complete for this proposal: evaluator support is mandatory in v1 because `CONDITIONAL` drives the atomic question flow; the create fingerprint is mandatory; the disposition union and `CreationEvaluation` invariant are exact; selection-only creation excludes manual and primitive input; migration maps `OPCION` to `SELECCION` plus allowed values and all other current types to `LIBRE`; `DERIVADO` is excluded; one evaluator is shared by evaluate and create; active/suspended selections remain frontend behavior; and the superseded creator artifacts are not implementation authority for the new path.

The remaining specification/design work may choose module boundaries and the explicit ownership-to-catalog resolution algorithm, but it must preserve these product contracts and compatibility boundaries.
