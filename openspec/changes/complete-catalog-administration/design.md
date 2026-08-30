# Convex-native design for complete catalog administration

## Decision summary

The change adds an additive public namespace under `convex/catalogoAdmin/` and keeps every existing export under `convex/catalogoRecursos/`. Public modules stay thin: they validate arguments and returns, call shared transactional loaders and pure aggregate logic, and throw one typed `ConvexError` data contract. One effective-state resolver and one Type aggregate validator are reused by admin reads, existing public reads, resource validation, activation, and publication.

Publication remains a single organization-scoped Convex mutation. It validates and canonicalizes one transactional state, rejects ambiguous Type keys, and either returns the latest immutable revision as `UNCHANGED` or atomically creates a revision and all Type snapshots as `CREATED`.

The installed stack, not `openspec/config.yaml`, is authoritative: this repository has Convex 1.45.0, Vitest 4.1.11, `convex-test` 0.0.56, a working Vitest configuration, existing tests, and `pnpm typecheck`. The OpenSpec testing metadata is stale and must not be used to disable TDD.

## Module and public API boundaries

Public names are Spanish to match the existing backend, but their paths are isolated so existing names cannot collide or change.

| Module | Public entity prefixes | Stable operation pattern |
|---|---|---|
| `convex/catalogoAdmin/jerarquia.ts` | `Clase`, `Familia`, `Tipo` | `crearX`, `obtenerX`, `listarX`, `actualizarX`, `activarX`, `desactivarX` |
| `convex/catalogoAdmin/unidades.ts` | `Unidad`, `PoliticaUnidad` | Same six operations |
| `convex/catalogoAdmin/atributos.ts` | `DefinicionAtributo`, `AsignacionAtributo`, `OpcionAtributo` | Same six operations |
| `convex/catalogoAdmin/reglas.ts` | `ReglaAtributo` | Same six operations |
| `convex/catalogoAdmin/presentacion.ts` | `PoliticaPresentacion` | Same six operations |
| `convex/catalogoAdmin/compatibilidad.ts` | `PoliticaCompatibilidad`, `RelacionCompatibilidad` | Same six operations |
| `convex/catalogoAdmin/publicacion.ts` | `Catalogo`, `Revision`, `Snapshot` | `publicarCatalogo`, `obtenerRevision`, `listarRevisiones`, `obtenerSnapshotTipo` |

Generated references therefore remain predictable, for example `api.catalogoAdmin.jerarquia.activarTipo` and `api.catalogoAdmin.publicacion.publicarCatalogo`. There are no generic `save`, `upsert`, `delete`, implicit replace, or auto-publish functions. Public functions use object form with explicit `args` and `returns`; implementation-only functions default to ordinary TypeScript helpers or `internalQuery`/`internalMutation` only when a registered boundary is necessary.

Update arguments include `id`, `expectedRevision`, mutable fields, and optional immutable echoes (`clave`, owner/parent/endpoints). A differing immutable echo produces `ADMIN_IMMUTABLE_FIELD`; omitting it is normal. This is intentional because rejecting an unknown field at Convex argument validation time would not satisfy the structured immutable-field contract.

## Shared contracts

### Validators and result shapes

`convex/catalogoAdmin/validators.ts` is the single source for enum, entity-reference, lifecycle, pagination, result, violation, and error validators. It exports `Infer` types rather than parallel handwritten DTO interfaces.

Common shapes are:

```ts
type LifecycleFilter = "ALL" | "ACTIVE" | "INACTIVE";

type AdminPage<T> = {
  items: T[];
  continuationCursor: string | null;
  isExhausted: boolean;
};

type CreateResult<T> = { disposition: "CREATED"; item: T };
type ChangeResult<T> = {
  disposition: "UPDATED" | "UNCHANGED";
  item: T;
};

type PublishResult = {
  disposition: "CREATED" | "UNCHANGED";
  revisionId: Id<"catalogoRevisiones">;
  numero: number;
  hashContenido: string;
};
```

Creation initializes revision 1. A material update returns `UPDATED` and increments exactly once. An equal normalized update returns `UNCHANGED` without a write or revision increment. Same-state lifecycle commands also return `UNCHANGED` after the revision check.

Every admin detail contains stored `activo`, `revision`, immutable identity/owner fields, `effective`, and `effectiveReasons`. Type-facing details also expose `aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED"` and coded violations. Dirty rows stay inspectable instead of making reads throw. Missing detail queries return `null`.

### Structured `ConvexError`

`convex/catalogoAdmin/lib/errors.ts` exposes only closed constructors that throw:

```ts
throw new ConvexError<AdminErrorData>({ code, message, context });
```

`message` is a safe presentation aid. React switches only on `code` and validated `context`. `AdminErrorData` is a discriminated union inferred from `adminErrorDataValidator`; each code has a matching context rather than an unrestricted record.

| Code | Required context |
|---|---|
| `ADMIN_NOT_FOUND` | `{ entity }` |
| `ADMIN_DUPLICATE_KEY` | `{ entityKind, key?, scope?, normalizedIdentity? }` |
| `ADMIN_INVALID_REFERENCE` | `{ entityKind, field, reference?, reason }` |
| `ADMIN_IMMUTABLE_FIELD` | `{ entity, field }` |
| `ADMIN_STALE_REVISION` | `{ entity, expectedRevision, currentRevision }` |
| `ADMIN_INVALID_STATE` | `{ entity?, field?, reason, violations? }` |
| `ADMIN_DEPENDENCY_BLOCKED` | `{ entity, relationKind, blocker }` |
| `ADMIN_AGGREGATE_INCOMPLETE` | `{ entity, violations }` |
| `ADMIN_CONFLICT` | `{ entity?, conflictKind, conflictingEntity?, normalizedIdentity? }` |
| `ADMIN_INVALID_ARGUMENT` | `{ field, reason }` |
| `ADMIN_PUBLICATION_INVALID` | `{ organizationId, violations }` |

`entity` and `blocker` use a union of `{ kind: literal; id: v.id(table) }` for all catalog tables. Violations are `{ code, entity?, field?, relatedEntity?, count?, detail? }` with fixed codes: `HIERARCHY_REFERENCE_INVALID`, `PRINCIPAL_UNIT_COUNT`, `UNIT_INACTIVE`, `NUMERIC_UNIT_INVALID`, `OPTION_SET_EMPTY`, `ASSIGNMENT_SELECTION_INVALID`, `RULE_REFERENCE_INVALID`, `RULE_RESULT_INVALID`, `RULE_CONFLICT`, `PRESENTATION_COUNT`, `PRESENTATION_TOKEN_INVALID`, `COMPATIBILITY_POLICY_CONFLICT`, `COMPATIBILITY_RELATION_INVALID`, `ALLOWLIST_EMPTY`, `TYPE_KEY_AMBIGUOUS`, and `CATALOG_LIMIT_EXCEEDED`.

Convex function references do not encode thrown-error generics. To keep React typed without duplicating DTOs, the backend package exports the validator-inferred `AdminErrorData` alongside the generated API. Tests assert actual `ConvexError.data`, never message text.

## Revision and command execution

`convex/catalogoAdmin/lib/revisions.ts` implements this mandatory order for existing-record commands:

1. Load directly by ID or throw `ADMIN_NOT_FOUND`.
2. Compare `expectedRevision`; stale commands stop here.
3. Reject differing immutable echoes.
4. Normalize and compare mutable input.
5. For lifecycle, return `UNCHANGED` if already in the requested state.
6. Validate references, blockers, conflicts, and the hypothetical post-command aggregate.
7. Apply one patch with `revision + 1` and return `UPDATED`.

All work occurs in one Convex transaction. Validation failure or a thrown `ConvexError` commits no partial writes. Derived migration/order metadata may be patched without changing the business revision; those fields are not part of the admin DTO.

Creates validate identity uniqueness across active and inactive rows. Direct owners and references must exist and belong to the declared aggregate even for inactive drafts. Completeness is deferred only when the new or affected configuration is inactive or hierarchy-inert.

## Indexed pagination and cursor safety

### Cursor envelope

`convex/catalogoAdmin/lib/pagination.ts` wraps the native Convex cursor in an opaque base64url envelope:

```ts
{ v: 1, plan: string, filtersHash: string, order: string, cursor: string }
```

The hash is SHA-256 over canonicalized normalized filters, lifecycle mode, selected index plan, and ordering version. A supplied cursor is decoded before querying; malformed tokens or any plan/filter/order mismatch throw `ADMIN_INVALID_ARGUMENT`. Page size defaults to 25 and is restricted to integers from 1 through 100.

Every list calls `.withIndex(...).order(...).paginate(...)`; it never uses a database `.filter()` or unbounded `.collect()`. For entities with many optional filters, the planner chooses the most selective equality-prefix index. Remaining filters are applied in memory only to that bounded native candidate page. A sparse page may contain fewer than the requested number of matches, including zero, but its cursor advances. Traversing until `isExhausted` returns every match once, in the selected index's documented domain order, when there are no concurrent writes.

### Stable ordering metadata and indexes

Convex custom indexes cannot use `_id` as a declared field. Tables that need an ID tie-breaker gain optional `adminSortId: v.optional(v.string())`, populated from the inserted `_id` in the same create transaction and backfilled for existing rows before admin lists are enabled. Assignment rows also gain optional immutable `definicionClave`; compatibility rows gain optional normalized endpoint/option sort fields. These are compatibility metadata, not mutable business fields.

`schema.ts` adds indexes in these families; each filter-specific index repeats the entity's domain order after its equality prefix:

- hierarchy and globally keyed entities: key order, plus lifecycle-prefixed variants;
- policies: Family, optional Type (undefined first), Unit, `adminSortId`, plus Family/Type/Unit/lifecycle prefixes;
- assignments: Family, optional Type, numeric order, `definicionClave`, `adminSortId`, plus definition/applicability/identity/lifecycle prefixes;
- rules: Type, condition assignment, optional option, affected assignment, `adminSortId`, plus each documented filter prefix;
- presentation: Type, active state, `adminSortId`;
- compatibility policies: Type, normalized endpoints, direction, `adminSortId`, plus endpoint/mode/direction/lifecycle prefixes;
- compatibility relations: policy, normalized option pair, `adminSortId`, plus policy/endpoint-option/lifecycle prefixes;
- revisions: organization, state, revision number, `adminSortId`, queried descending;
- Types: an additional global key index for publication ambiguity detection;
- resources: existing `porTipoYActivo` and `porUnidad` support blockers; add organization/type variants only if a blocker test proves a missing access path.

Indexes are introduced staged where supported by Convex 1.45.0, then enabled after metadata backfill. No admin list ships against an index until its backfill verification reports zero missing metadata rows.

## Effective-state and aggregate architecture

### One resolver

`src/catalogoRecursos/dominio/catalogoEfectivo.ts` contains pure selection and effective-state functions. `convex/catalogoAdmin/lib/cargarAgregado.ts` loads bounded indexed rows and maps documents into that domain input. The resolver is the only implementation of:

- Class → Family → Type lifecycle effectiveness;
- per-Unit Type-over-Family selection, including inactive Type suppression;
- per-definition assignment selection, including inactive Type suppression;
- value-bearing applicability and deterministic `orden`, definition key, assignment ID order;
- option, rule, presentation, compatibility policy, and relation effectiveness.

`catalogoRecursos/catalogo.ts`, `validacionRecurso.ts`, and `catalogoPublicado.ts` are adapted behind their existing public signatures to call the same resolver. Admin reads call it to annotate stored rows; lifecycle commands and publication call it before aggregate validation. This prevents active rows beneath inactive parents from leaking through public reads, resource validation, or snapshots.

### Validation boundaries

Validation is layered so inactive drafts remain useful without accepting malformed ownership:

1. **Argument/intrinsic:** bounds, enums, finite numbers, normalized nonblank keys, token lengths.
2. **Reference/ownership:** owner exists, Type belongs to Family, assignments are selected for the Type, options belong to endpoint definitions. This always runs, including drafts.
3. **Record identity:** immutable fields and uniqueness across active and inactive rows.
4. **Policy aggregate:** unit policy, assignment/options, rule set, presentation policy, or compatibility policy after the proposed change.
5. **Type aggregate:** complete effective units, attributes/options, rules, presentation, and compatibility.
6. **Catalog publication:** every effective Type plus cross-Type published-key uniqueness and publication limits.

A mutation that changes an effective Type validates its post-command Type aggregate. A Family-level policy or definition change validates every currently effective Type it can affect. Activating a Type validates that Type; activating a Family or Class validates every active descendant that would become effective before changing the parent.

Convex cannot atomically validate or snapshot an unbounded catalog. Loaders use indexed `take(limit + 1)` guards. Initial conservative limits are `MAX_AFFECTED_TYPES = 200`, `MAX_PUBLICATION_TYPES = 200`, `MAX_PUBLICATION_ROWS = 8_000`, and `MAX_CANONICAL_BYTES = 8 MiB`. Exceeding an activation fan-out returns `ADMIN_INVALID_STATE`; exceeding publication limits returns `ADMIN_PUBLICATION_INVALID` with `CATALOG_LIMIT_EXCEEDED`. This explicit failure is preferred to a platform-limit exception or partial workflow. Limits are constants with boundary tests and can be raised only after measured Convex-limit verification.

## Domain-specific decisions

### Hierarchy and units

Keys and parent links never appear as writable business fields. Scoped uniqueness uses existing key indexes and includes inactive rows. Deactivation checks the exact blocker matrix using `porClase`, `porFamilia`, `porTipoYActivo`, and `porUnidad` access paths. It never cascades.

Unit selection occurs before active filtering. An inactive Type policy therefore suppresses the Family policy only for the same Unit. Exactly one selected, active policy marked principal and referencing an active Unit is required for each effective Type. Unit deactivation checks active resources, selected principal policies, and effective numeric definitions before patching.

### Attributes and options

Definitions enforce `NUMERO`-only Unit references and `OPCION`-only options. Assignment selection occurs before applicability/lifecycle filtering. `FORBIDDEN` and `NOT_APPLICABLE` are selected suppressors but never value-bearing output. `CONDITIONAL` has baseline `OPTIONAL` behavior.

Resource input is represented by a `Map` and presence is always `map.has(assignmentId)`. Thus `false`, `0`, and `""` fire presence rules and satisfy `REQUIRED`; truthiness is never used. Option values require an active option from the selected definition.

### Conditional rules and cycle safety

Rule identity is `(Type, condition assignment, optional condition option, affected assignment)` and is unique regardless of lifecycle. A rule cannot target its own condition, cannot return `CONDITIONAL`, and conditions inspect only raw submitted value presence or exact option identity—not applicability produced by another rule.

Conflict detection is pairwise and complete for this condition language. Two conditions can co-fire unless they test different exact options of the same assignment. If co-fireable rules target one assignment with different results, the set is rejected as `RULE_CONFLICT`; same-result rules are allowed. Graph cycles such as A→B and B→A do not trigger iteration because firing never reads derived applicability. They are evaluated once from the immutable input map and are accepted only if the same co-fireability conflict check remains order-independent. Self-cycles are rejected. Pure tests cover cycles, option exclusivity, and multiple same-result paths.

### Presentation replacement

There is no implicit replacement. Activating a second policy while one is active returns `ADMIN_CONFLICT`. Deactivating the sole policy of an effective Type returns `ADMIN_AGGREGATE_INCOMPLETE`. The supported replacement order is: deactivate the Type, create/edit the new inactive draft, deactivate the old policy, activate the new policy, then reactivate the Type. Token order is stored semantic order and is never sorted. Rendering uses NFC normalization, trimming, whitespace collapse, option display names, and numeric Unit symbols.

### Compatibility normalization

Policy slot identities are:

- directional: `D|originAssignmentId|destinationAssignmentId`;
- symmetric: `S|min(endpointId)|max(endpointId)`.

A directional activation checks its exact directional slot and the unordered symmetric slot. A symmetric activation checks the symmetric slot and both directional slots. Mode never creates another slot.

Directional relation identity is the ordered endpoint-option pair. Symmetric relation identity first normalizes endpoint assignment order, moving the corresponding options with their endpoints, then compares/stores the normalized pair. Duplicate checks include inactive relations. Changing policy direction recomputes derived child sort/identity metadata in the same guarded transaction and rejects any newly colliding relation before writing. Allowlist activation requires at least one effective relation; an empty denylist is valid.

## Inactive draft and activation workflow

The normal authoring path is:

1. Create the Type inactive, including beneath an inactive Family.
2. Create Units, definitions, options, policies, assignments, rules, presentation, and compatibility as inactive drafts. Direct references must already be valid.
3. Activate leaf configuration in dependency order: Units/definitions/options → unit and attribute assignments → relations/rules/presentation/compatibility policies.
4. Activate the Type; this is the first full Type completeness boundary.
5. Activate Family and Class parents last; each validates active descendants made effective.
6. Publish explicitly for an active organization.

Configuration may be stored active beneath an inactive hierarchy owner, but remains inert. No parent command cascades child state. Repairing an effective aggregate requires first making the owning branch inert when the intermediate state would otherwise be invalid.

## Publication and immutable history

`publicarCatalogo({ organizacionId })` is a public admin mutation. It first verifies that the organization exists and is active. Organization scopes revision numbering/history; current catalog configuration remains shared because existing catalog tables are not organization-owned.

The mutation then:

1. Resolves only Types whose Class, Family, and own lifecycle are active.
2. Detects duplicate effective `tipo.clave` values globally. Because historical lookup is `(revisionId, tipoClave)`, any duplicate is `TYPE_KEY_AMBIGUOUS`; no composite-key reinterpretation is introduced.
3. Validates every effective Type and accumulates safe coded violations.
4. Builds complete snapshots from the same resolved aggregate used by runtime validation.
5. Canonicalizes semantic content with Unicode code-point ordering. IDs, revisions, timestamps, and database iteration order are excluded from the hash; attribute order and presentation token order remain semantic. Options, rules, policies, and relation pairs use explicit stable tuple ordering.
6. Reads the latest revision for that organization by `(organization, state, number desc)`.
7. If hashes match, returns `UNCHANGED` with that revision and performs no writes.
8. Otherwise inserts the next revision and every per-Type snapshot in the same transaction, then returns `CREATED`.

No admin function updates or deletes revision/snapshot tables. Existing `obtenerUltimaRevisionPublicada` and `obtenerSnapshotTipo` remain available with their prior arguments and results. New admin revision reads use organization IDs, ownership checks, direct IDs, and paginated newest-first history.

## Separate React repository contract

Convex 1.45.0 supports static API/data-model code generation. Add `convex.json` with `codegen.staticApi: true`, `codegen.staticDataModel: true`, and the existing `js/dts` output mode. Generated files are committed, as recommended by the installed CLI, and `package.json` exposes subpaths for:

- `./convex-api` → generated `convex/_generated/api.js` plus `api.d.ts`;
- `./convex-data-model` → generated `dataModel.d.ts`;
- `./catalog-admin-errors` → validator-inferred `AdminErrorData` and the validator source.

Because this repository is currently private, the separate React repository consumes this backend repository as a pinned Git dependency (or the same artifact from a private registry) and imports `api` directly. It creates its own `ConvexReactClient` with that environment's deployment URL. It does not run backend functions from the React repository, copy DTOs, or maintain a second SDK/contract package. Contract updates are: change validators/functions here, run normal Convex codegen here, commit generated output, then bump the pinned backend version in React.

A consumer typecheck fixture verifies `FunctionArgs`/`FunctionReturnType`, pagination, publish disposition, IDs, and `AdminErrorData`. Static codegen is chosen over copying the current dynamic `api.d.ts`, because the latter imports backend function source modules and is not independently portable.

## Compatibility and migration

Migration is additive and staged:

1. Add only optional metadata fields and staged indexes. Preserve optional legacy `politicaCompatibilidadId` and `tipoRelacion` fields.
2. Run an internal, resumable metadata backfill in bounded batches. It writes `adminSortId`, immutable definition keys, and normalized compatibility keys only; it does not alter `activo`, revision, business content, or snapshots.
3. Verify zero missing metadata and duplicate normalized identities. Dirty duplicates are reported, not auto-deactivated or deleted.
4. Enable indexes and deploy read-only admin detail/list functions.
5. Deploy commands by aggregate slice.
6. Refactor existing public reads/resource validation/publication onto the shared resolver under regression tests.

Existing invalid active rows are never silently rewritten. Admin reads expose coded invalid reasons. Commands may correct mutable fields or lifecycle state, while activation/publication blocks invalid effective data. Existing inactive orphaned legacy rows remain inspectable but cannot be activated until repaired; new commands never create malformed references. Historical revisions and snapshots are untouched.

Existing public function paths, argument validators, return validators, and published snapshot shapes remain unchanged. Semantic tightening is limited to excluding hierarchy-inert configuration and enforcing backend rules already required by this change.

## File change map

| Area | Planned files |
|---|---|
| Configuration/contract | `convex.json`, `package.json`, regenerated `convex/_generated/*` |
| Schema | `convex/schema.ts` |
| Shared admin boundary | `convex/catalogoAdmin/validators.ts`, `lib/errors.ts`, `lib/revisions.ts`, `lib/pagination.ts`, `lib/cargarAgregado.ts`, `lib/validarComando.ts` |
| Public admin modules | The seven `convex/catalogoAdmin/*.ts` modules listed above |
| Pure domain | New `src/catalogoRecursos/dominio/catalogoEfectivo.ts`, `validacionAgregado.ts`, `reglasCondicionales.ts`; extend canonicalization, presentation, compatibility, and resource validation modules |
| Compatibility seams | `convex/catalogoRecursos/catalogo.ts`, `validacionRecurso.ts`, `catalogoPublicado.ts`, and narrowly `recursos.ts` for shared validation/blocker behavior |
| Tests | Co-located pure `*.test.ts`, admin `convex-test` suites by module, existing regression suites, and a small consumer typecheck fixture |

Generated files are derived output and never manually edited.

## TDD and verification architecture

Each behavior slice starts with a failing test and keeps tests in the same work unit.

- **Pure Vitest:** precedence matrices, lifecycle effectiveness, rule co-fireability/cycles, false/zero/empty-string presence, presentation normalization, compatibility slot/relation normalization, canonical ordering/hash.
- **`convex-test`:** function validators, create/update/lifecycle, stale-before-no-op ordering, structured `ConvexError.data`, atomic failures, blockers, draft visibility, cursor/filter mismatch, sparse pages, dirty legacy data, publication `CREATED`/`UNCHANGED`, organization isolation, immutable snapshots.
- **Regression:** all existing `catalogo`, resource, identity, presentation, compatibility, and publication tests remain green with unchanged public call shapes.
- **Contract:** a TypeScript-only consumer fixture imports package subpaths and typechecks representative React calls and error narrowing.
- **Schema/codegen:** generated output is refreshed by the normal Convex CLI and reviewed only as derived output.

Focused commands are:

```bash
pnpm exec vitest run <changed-test-files>
pnpm exec vitest run
pnpm typecheck
pnpm exec convex codegen --typecheck enable
```

When a deployment is available, finish with `pnpm exec convex dev --once`; otherwise record it as unavailable rather than claiming a push. `openspec/config.yaml` should be corrected in a separate tooling/docs work unit because its empty test configuration is demonstrably stale.

## Delivery, rollback, and review units

No implementation PR may exceed 400 authored additions plus deletions. Generated files are excluded from that authored count but remain part of the complete diff. A slice is split again before review if forecast or actual diff approaches the limit.

| Order | Reviewable behavior unit | Rollback boundary |
|---|---|---|
| 1 | Shared validators/errors/revision helpers plus pure tests | Remove additive helpers only |
| 2 | Optional metadata, staged indexes, bounded backfill and tests | Stop backfill; remove unused indexes/optional metadata only when safe |
| 3 | Cursor envelope/planner and one reference paginated entity | Remove admin read path; keep harmless indexes |
| 4 | Class lifecycle with blockers and tests | Remove Class admin exports only |
| 5 | Family lifecycle and tests | Remove Family admin exports only |
| 6 | Type lifecycle and aggregate hook skeleton | Remove Type admin exports; preserve stored rows |
| 7 | Units and unit-policy precedence | Remove unit admin exports/shared hook |
| 8 | Definitions and options | Remove those additive exports |
| 9 | Assignments, ordering, identity/applicability | Remove assignment exports and resolver integration |
| 10 | Rule administration and deterministic evaluation | Remove rule exports; retain old public behavior until its seam lands |
| 11 | Presentation drafts and explicit replacement workflow | Remove presentation admin exports |
| 12 | Compatibility policies | Remove policy exports |
| 13 | Compatibility relations/normalization | Remove relation exports/derived metadata use |
| 14 | Shared effective resolver in existing public/resource seams | Revert only seam adapters, not admin data |
| 15 | Publication command and admin history reads | Remove new publish/history exports; preserve all historical rows and old reads |
| 16 | Static generated multi-repo contract and consumer fixture | Remove package subpath exports; backend functions remain |

Every unit includes its focused test command/result, full relevant test result, typecheck, runtime harness result or explicit `N/A`, and an exact file/behavior rollback statement. Disabling the new public publish reference stops future admin publications without deleting or mutating history. No rollback hard-deletes catalog rows, revisions, or snapshots.

## Tradeoffs and rejected alternatives

| Decision | Benefit | Cost / rejected alternative |
|---|---|---|
| Focused public modules plus shared domain/loaders | Stable discoverable API without a mega-module | More files; rejected expanding `catalogo.ts`, which risks existing consumers |
| Throw typed `ConvexError` | Stable machine failures and transactional rollback | Generated function refs do not type thrown data, so the validator-inferred type is exported beside generated API |
| Native paginate plus bound cursor envelope | Convex-native scaling and filter/order misuse detection | Sparse filtered pages are allowed; rejected unbounded collection and in-memory full sorting |
| Optional derived sort/normalization metadata | Exact required ordering and uniqueness on indexes | Requires staged backfill; rejected relying on implicit `_creationTime` when specs require ID ties |
| One resolver and validator | Activation, runtime, and publication cannot drift | Existing modules require careful adapter refactoring and regression tests |
| No presentation replace command | No implicit deactivation and fully reviewable lifecycle | Replacement requires Type deactivation workflow |
| Raw-input single-pass rules | False/zero semantics and cycles are deterministic | Less expressive than rules depending on derived applicability; that language is deliberately out of scope |
| Bounded atomic activation/publication | Predictable Convex transactions with no partial state | Catalogs above explicit limits require future sharding/versioned compiler design rather than failing at platform limits |
| Static generated backend package exports | Official Convex codegen remains the contract; no DTO copy | React must pin/bump the backend repository artifact |
| Additive dirty-data migration | No destructive rewrite or historical mutation | Invalid legacy active data remains visible and blocks activation/publication until corrected |

## Design completion checklist

- Proposal and all eight specifications are reflected without reopening settled product decisions.
- Existing public functions and historical reads remain additive compatibility boundaries.
- Every collection read has bounded indexed pagination and cursor/filter binding.
- Effective state, aggregate validation, rule conflicts/cycles, false/zero presence, presentation replacement, compatibility normalization, Type-key ambiguity, and publication no-op behavior have one explicit design.
- Migration, tests, verification, rollback, and sub-400-line review slicing are defined before task generation.
