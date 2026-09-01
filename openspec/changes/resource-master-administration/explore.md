# Exploration: resource-master-administration

## Executive finding

The completed catalog administration stack provides the right additive boundary, structured error vocabulary, revision helpers, cursor envelopes, effective catalog resolver, aggregate validation, static Convex contract, and stacked-to-main delivery model. Resource administration should be a focused extension of that stack, not a replacement of `convex/catalogoRecursos/recursos.ts`.

The existing Resource storage model is already sufficient for the core aggregate: `recursos` stores `tipoRecursoId`, `unidadId`, technical identity, display fields, lifecycle, revision, and optional `organizacionId`; `valoresAtributoRecurso` stores the value rows; `identidadesRecurso` stores organization/version aliases. The main gaps are administrative projections, bounded reads, full-text pagination, structured errors, and safe integration with effective catalog state.

Repository structure was checked for `.codegraph/`; no CodeGraph MCP/CLI surface was available in this executor, so the structural evidence below comes from targeted repository reads after that check.

## Repository evidence

### Existing public Resource API

`convex/catalogoRecursos/recursos.ts` exports these public functions, whose names, arguments, and return validators must remain compatible:

- `crearRecurso`
- `obtenerRecurso`
- `obtenerDetalleRecurso`
- `listarRecursos`
- `buscarRecursos`
- `actualizarRecurso`
- `desactivarRecurso`
- `reactivarRecurso`

The public output `salidaRecurso` includes stored resource fields plus all value rows. `obtenerDetalleRecurso` instead joins Class, Family, Type, Unit, attribute definitions, options, and definition Units, then sorts attributes by configured order. Existing tests explicitly protect identity derivation, value persistence, historical inactive detail, atomic replacement, lifecycle behavior, and current error text. The new surface must therefore be additive under `convex/catalogoAdmin/recursos.ts` (or a similarly focused module), with no rename, removal, or return-shape change to the public functions.

### Resource validation and identity

`convex/catalogoRecursos/validacionRecurso.ts` loads the hierarchy, unit policies, assignments, rules, definitions, and options, then delegates business validation to pure `src/catalogoRecursos/dominio/validarRecurso.ts`. The pure validator already enforces hierarchy/effective catalog state, permitted Units, duplicate attributes, applicability, required/forbidden values, finite numbers, data types, and option ownership/activity.

`src/catalogoRecursos/dominio/identidadRecurso.ts` derives the deterministic `v1|Class|Family|Type|...` identity from classification keys and identity-participating values. It does not use the visible name. Option values contribute the option key; text is NFC-normalized, trimmed, whitespace-collapsed, and uppercased. Existing resource tests prove that changing a name does not change identity while changing an identity value does.

The current Convex adapter computes identity after validation and checks uniqueness through `recursos.porIdentificadorTecnico` for global resources or `porOrganizacionYIdentificadorTecnico` for organization-owned resources. Organization-owned updates reject a changed technical identity. `identidadesRecurso` registers an organization/version alias and rejects alias collisions. These facts make aliases and ownership part of the administrative safety boundary, even though the public Resource result does not expose aliases.

### Schema and indexes

Current `recursos` indexes are:

- `porIdentificadorTecnico`
- `porOrganizacionYIdentificadorTecnico`
- `porTipo`
- `porActivo`
- `porTipoYActivo`
- `porUnidad`
- search index `buscar`, searching `nombre` and filtering by `tipoRecursoId` and `activo`

`valoresAtributoRecurso` has `porRecurso`, `porAtributo`, and `porRecursoYAtributo`. `identidadesRecurso` has `porOrganizacionVersionClave` and `porRecurso`.

The existing search index proves that full-text retrieval is already an intended Convex capability. For summary list pagination, use the documented indexed ordering and compatibility-safe metadata only where required by that ordinary-list plan; do not add a required field to populated tables. For search, use Convex 1.45.0 native indexed relevance traversal, bind query text, filters, search-order version, and the native cursor in the completed opaque cursor envelope, and prove unchanged-data traversal before depending on the endpoint. Do not claim that relevance ordering is lexical ordering; specify the native search order explicitly. If the traversal proof fails, stop and revise the design/specification explicitly rather than collecting, sorting, or silently falling back.

### Effective catalog integration

The completed stack's `src/catalogoRecursos/dominio/catalogoEfectivo.ts` is the single hierarchy/effective-state resolver. `convex/catalogoAdmin/lib/cargarAgregado.ts` loads bounded indexed configuration and resolves units, assignment precedence, rules, presentation, compatibility, and aggregate status. `validacionAgregado.ts` supplies coded aggregate violations, and completed admin mutations use `ConvexError` with the `ADMIN_*` contract from `convex/catalogoAdmin/lib/errors.ts` and `validators.ts`.

Resource admin create/update/activate must reuse `validarRecurso` and the effective resolver rather than duplicate catalog rules. A resource can remain stored and readable when its Class/Family/Type or configuration later becomes inactive; it must not be newly created, updated into, or reactivated against an invalid/inactive effective catalog. A direct admin detail should annotate stored classification/effective state and retain values for repair/history instead of throwing merely because the current catalog is inert. This matches the completed stack's stored-but-inert draft and dirty-data decisions.

Publication remains explicit and immutable. Resource admin writes should not auto-publish, mutate revisions, or modify snapshots. Existing publication integration sees only effective catalog configuration, not administrative Resource summaries.

## Recommended bounded architecture

### Public module and contracts

Add `convex/catalogoAdmin/recursos.ts`, using the completed validators, pagination, revisions, and error helpers:

1. `listarRecursosResumen`: paginated summaries, with lifecycle mode and bounded filters for Type, Unit, and organization ownership. Summary fields should be enough for a grid: Resource ID, technical identity, name, Type reference, Unit reference, organization reference when present, active state, revision, and effective/inert classification status. It must not load values.
2. `buscarRecursosResumen`: paginated full-text summaries over `nombre` (and only additional indexed search fields if evidence justifies schema evolution), with the same lifecycle/Type/organization filters. Search text and all filters bind the opaque cursor.
3. `obtenerDetalleRecurso`: direct ID read with classification references, effective-state annotations, assignments/rules/presentation/compatibility diagnostics as needed by the admin form, and all stored values. This is a new administrative function name; it must not replace the existing public detail function.
4. `crearRecurso`, `actualizarRecurso`, `activarRecurso`, and `desactivarRecurso` under the admin namespace, returning the completed `CREATED` / `UPDATED` / `UNCHANGED` result shapes and structured errors.

The administrative detail must use one indexed `valoresAtributoRecurso` read and a bounded guard (`MAX_RESOURCE_VALUES + 1`) rather than an unbounded `.collect()`. If the product requires resources above the limit, return a coded bounded-state error rather than silently truncating values. Summary and search endpoints must never call the value loader.

### Create/update transaction flow

Use one Convex mutation transaction:

1. Validate intrinsic arguments and normalize mutable display text.
2. Resolve the supplied Class → Family → Type ownership and effective catalog snapshot.
3. Run the existing server-side resource validator, including Unit, assignment, rule, and option checks.
4. Compute the deterministic technical identity through the existing identity domain function.
5. Check duplicate identity across active and inactive resources in the correct ownership scope.
6. On create, insert Resource revision 1 and all value rows atomically, then create the organization alias when applicable.
7. On update, load by ID, compare `expectedRevision` first, verify immutable fields, construct and validate the complete proposed effective aggregate, decide semantic no-op only after that validation, then replace value rows atomically when material, patch the Resource once with revision plus one, and maintain aliases without deleting historical identity rows.

Any validation, duplicate, alias, or value-row failure must roll back the entire mutation. No hard-delete command is introduced.

### Immutable classification and identity decisions

Evidence supports the following safe defaults:

- `organizacionId` is immutable. Existing identity uniqueness and alias ownership are scoped by organization, and the public update path cannot safely transfer a resource between global and organization-owned scopes.
- Resource classification is immutable in the administrative API: Class, Family, and Type are represented by the Type plus its resolved parents, and the Type reference must not change after creation. The existing public update currently accepts classification fields, but allowing an admin classification move would recalculate identity, alter effective assignments/rules/units, and interact with organization aliases and active-resource blockers. There is no repository evidence of a safe migration/alias-transfer contract. Keep the old public function unchanged; make the new administrative contract conservative and reject classification changes with `ADMIN_IMMUTABLE_FIELD`.
- `identificadorTecnico` is derived and never writable. Identity-participating values may change only through the normal guarded update for a global resource. For an organization-owned resource, preserve the existing no-identity-change rule and return a structured administrative conflict/immutable error.
- `unidadId` is mutable only when the candidate Unit remains valid for the effective Type and the resource update is otherwise valid. Name and description are mutable.
- `activo` is lifecycle-controlled, not a general update field. Same-state lifecycle commands are idempotent after revision validation.

These defaults avoid identity alias transfer, classification drift, and partial revalidation. Reopening classification migration should be an explicit future change with alias history and consumer impact evidence, not an implicit part of this API.

### Organization ownership semantics

The schema makes ownership optional: `organizacionId === undefined` means a global resource, while a present ID means organization-owned. Existing code verifies the organization only indirectly through alias registration; there is no general ownership resolver or authentication boundary, and authentication/roles/permissions are explicitly out of scope. Therefore:

- Admin commands accept the stored ownership scope as data, but do not invent authorization.
- Create validates a supplied organization exists; inactive/missing organizations produce structured `ADMIN_INVALID_REFERENCE`.
- Duplicate identity checks remain global for global resources and organization-scoped for organization-owned resources, matching existing indexes.
- Do not reinterpret the optional field as tenant isolation. Organization-scoped publication is already established for revisions, but current catalog/resource configuration is shared.
- Alias rows remain organization-owned and versioned; no alias deletion is added to support a normal update.

### Lifecycle and catalog dependency matrix

- Deactivating a Resource is always allowed after revision validation and preserves values and identity.
- Reactivating a Resource requires current effective hierarchy, permitted active Unit, active applicable assignments/definitions/options, and valid active rules, matching `validarRecurso`; a failed reactivation leaves the row unchanged.
- Updating an active or inactive Resource must validate the proposed values against the current effective Type. An inactive resource may remain inspectable while its catalog branch is inert, but cannot be changed into a newly invalid active configuration.
- Catalog Class/Family/Type deactivation blockers already use indexed active-resource checks (`porTipoYActivo`) and must continue to see active Resources. Inactive Resources do not block catalog deactivation.
- Resource administrative operations do not cascade catalog or value lifecycle changes.

### Structured errors

Use the completed `ADMIN_*` contract, asserting `ConvexError.data` in tests rather than message text. Resource-specific failures should map as follows:

- missing Resource: `ADMIN_NOT_FOUND`;
- stale revision: `ADMIN_STALE_REVISION`;
- duplicate technical identity or alias: `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT`, with normalized identity and scope;
- classification/organization/derived identity change: `ADMIN_IMMUTABLE_FIELD`;
- catalog, Unit, assignment, option, or organization reference failure: `ADMIN_INVALID_REFERENCE`;
- invalid effective resource values or reactivation: `ADMIN_INVALID_STATE` or `ADMIN_AGGREGATE_INCOMPLETE`, with coded violations;
- excessive value cardinality: `ADMIN_INVALID_STATE` with a bounded-limit reason.

The existing public Spanish `Error` messages remain untouched for compatibility.

## Performance and correctness risks

1. **Existing `.collect()` risk.** `listarRecursos` and `buscarRecursos` collect all matching Resources; `conValores` collects every value row. These paths are unbounded as tables grow and are unsuitable as the implementation template for admin pagination.
2. **N+1 value loading.** Existing list/search map every Resource through `respuesta`, causing one indexed value query per result and returning large nested payloads. Admin summaries must avoid values entirely. Detail may load values once, with a bounded guard; do not use detail loading inside list/search.
3. **Search ordering.** Convex full-text search is indexed but its native order is relevance-oriented, not necessarily the technical-identity/name order used by ordinary lists. Bind the search text and explicit ordering version in the cursor. If the native traversal proof fails, block the search work unit and require an explicit spec/design revision before implementation; no collect/sort or fallback path is authorized.
4. **Duplicate identity race.** Convex transactions provide atomic conflict behavior, but uniqueness is application-enforced through indexes. Test concurrent-equivalent duplicate creates and include inactive rows in the candidate check.
5. **Catalog drift.** Values can outlive an inactive or changed catalog row. Detail must remain readable for repair/history, while create/update/reactivation must use current effective validation and publication must remain independent.
6. **Alias and identity drift.** Organization aliases are versioned and currently created only on create. Any update that changes identity must not silently orphan or transfer aliases; the conservative organization-owned immutability rule avoids this.
7. **Fan-out limits.** Effective validation loads assignments, rules, options, and policies with bounded `take(limit + 1)` patterns. Resource detail needs an explicit value limit and admin search/list needs page-size limits from the completed pagination helper.
8. **Classification change leakage.** The public update accepts classification IDs, but it has no dedicated migration semantics and can combine a Type move with values and identity recalculation. Treat this as unsafe for the new admin contract rather than widening the existing behavior.

## TDD and verification shape

Each work unit follows RED → GREEN → TRIANGULATE → REFACTOR and keeps tests with the behavior:

- pure tests for summary projection, classification immutability, identity scope, value limits, and effective/inert annotations;
- `convex-test` coverage for paginated list/search traversal, cursor mismatch across text/filter/order, no value loading in summaries, direct detail values, create/update atomicity, stale-before-no-op, duplicate inactive identities, alias conflicts, lifecycle idempotence, reactivation validation, and structured `ADMIN_*` errors;
- regression coverage for every existing `convex/catalogoRecursos/recursos.test.ts` scenario and unchanged public function signatures/returns;
- contract fixture additions using generated `api`, `FunctionArgs`, `FunctionReturnType`, IDs, page results, and `AdminErrorData` from the completed static package exports;
- `pnpm exec vitest run`, `pnpm typecheck`, `pnpm typecheck:consumer`, `pnpm exec convex codegen --typecheck enable`, and `pnpm exec convex dev --once` when a deployment is available (otherwise record `N/A — no deployment available`).

## Forecast and stacked delivery

The request spans a focused Resource API plus schema metadata/index work, tests, effective-catalog seams, and generated contract updates. It should remain stacked-to-main and should not be combined into one PR with the completed catalog implementation. The canonical split is W0 plus WU1–WU9 exactly as defined in the design and tasks; W0 is planning/runtime evidence, followed by nine behavior units.

| Order | Work unit | Forecast authored changed lines | Boundary |
|---|---|---:|---|
| 0 | Planning/runtime metadata evidence | 12 | Remove only planning evidence |
| 1 | Optional metadata, compatibility projection, indexes, and resumable backfill | 190 | Remove only schema/backfill/projection changes |
| 2 | Resource validators, projections, diagnostics, and structured mapping | 180 | Remove only Resource contract helpers/tests |
| 3 | Indexed summary list with filters, plans, and bound cursors | 175 | Remove summary list exports/planner |
| 4 | Convex 1.45.0 native full-text search and traversal proof | 190 | Remove search export/plan only |
| 5 | Direct admin detail and bounded value loading | 145 | Remove admin detail/value loader only |
| 6 | Atomic administrative create | 210 | Remove Resource admin create/persistence behavior |
| 7 | Revision-first update and immutable boundaries | 240 | Remove Resource admin update behavior |
| 8 | Lifecycle commands and effective-state integration | 170 | Remove lifecycle seam integration |
| 9 | Generated contract fixture, regressions, and rollout documentation | 130 authored (generated output excluded) | Remove only contract/documentation additions |

Estimated authored total is approximately **1,642 lines** across W0 and WU1–WU9, so the whole change has high 400-line budget risk while every proposed behavior unit remains below the budget. W0 is not a product PR. Each child PR targets the immediately preceding branch and then main through the stacked chain; tests and contract evidence stay with their behavior. No size exception is recommended.

## Open questions

No product open question is required for the bounded architecture above. Native Convex 1.45.0 search pagination is a prerequisite implementation proof: verify repeated equal-relevance traversal against unchanged data before the search dependency is accepted. If it cannot be proven, block the search work and make an explicit design/specification revision; never collect, sort, or silently select a technical-identity/adminSortId fallback.

## Recommendation

Proceed to proposal/design with an additive `catalogoAdmin.recursos` surface, reuse of the completed catalog resolver/validators/errors/pagination/revision patterns, immutable administrative classification and organization ownership, value-free paginated summaries, bounded direct detail values, and explicit native full-text cursor binding. Preserve every existing public Resource export and return contract, avoid `.collect()` in new list/search paths, prove native search before dependency, and deliver W0 plus WU1–WU9 as stacked-to-main work under the 400-authored-line review budget.
