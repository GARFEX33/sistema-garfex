# Design: Selection-only Resource creation

## 1. Decision

Add two public functions to `api.catalogoAdmin.recursos`:

- `evaluarCreacionDesdeSelecciones`, a query that loads the current live effective administrative catalog and passes it to a pure evaluator; and
- `crearRecursoDesdeSelecciones`, a mutation that reloads that same live graph, invokes the same evaluator, applies the required disposition precedence, checks identity uniqueness, and writes one Resource aggregate atomically.

Both `GLOBAL` and `ORGANIZATION` use the same live `catalogoAdmin` graph. `ownership` does not select a publication or snapshot. It only validates an organization when one is supplied and selects Resource identity/alias scope. This keeps evaluation aligned with the live frontend discovery APIs.

The implementation is additive. Existing Resource creators, primitive values, legacy options, Resource rows, aliases, and historical snapshots remain compatibility surfaces. This design supersedes only the creator portions of archived change `2026-09-01-resource-master-administration` concerning manual `nombre`/`descripcion`, primitive-specific controls, simplified conditional handling, and a separate Resource-data stage.

The repository has no `packages/coding-agent` directory, so the explicitly requested repo-local schema, domain, and Convex surfaces are the implementation boundary.

## 2. Architectural decisions and trade-offs

| Concern | Chosen configuration | Alternative rejected and trade-off |
|---|---|---|
| Capture mode | `modoCaptura` has only `SELECCION | LIBRE`; absent storage is interpreted from `tipoDato` during rollout. | Replacing `tipoDato` would break legacy validation and stored Resource values. `DERIVADO` is not introduced in v1. |
| Allowed-value meaning | Every `valoresPermitidosAtributo` row stores and exposes a discriminated typed `valor`; `clave` remains only stable technical identity. | Treating `clave` as the selected runtime value loses number/boolean typing and breaks non-option selection semantics. |
| Typed payload | `valor` is exactly `TEXTO(string) | NUMERO(number) | BOOLEANO(boolean) | OPCION(opcionAtributoId)`, and its `kind` must equal the owning definition's `tipoDato`. | A primitive union without a discriminator cannot validate the definition/payload relation or distinguish an option reference from text. |
| Option migration | Each legacy option produces one allowed value whose `valor` is `{ kind: "OPCION", opcionAtributoId: sourceOptionId }`; option key/label/lifecycle/order are preserved separately. | Copying the option `clave` into runtime `valor` would erase the authoritative option reference and make rule migration ambiguous. |
| Catalog source | Both ownership kinds evaluate the current live effective admin catalog. Organization ownership additionally requires the exact organization to be active. | Resolving `ORGANIZATION` through its latest published snapshot would make live discovery and evaluation disagree. |
| Publication | New publication representations include capture modes, typed allowed values, and allowed-value predicates for future publication compatibility; historical snapshots remain immutable. | Making snapshots the source for either new admin endpoint is explicitly rejected. |
| Evaluation | One deterministic, side-effect-free domain evaluator receives a fully loaded live graph and returns an exact public evaluation plus a private persistence sidecar. | Reconstructing persistence references from public DTO values would duplicate logic and invite `valor === clave` inference. |
| Identity | Reuse `identidadRecursoV2`/`serializarIdentidadV2` semantics with Class, Family, Type, definition keys, and authoritative normalized values or option keys. Persist `identidadVersion: 2`. | Identity v1 is delimiter-unsafe; a new v3 that omits Class and Family would break established hierarchy identity. |
| Resource initial lifecycle | The new admin creator stores `activo: false`, matching the existing administrative creator policy. | Accepting lifecycle input is forbidden; creating active would bypass the established activation boundary. |
| Normalized persistence | Persist typed payload values: text string, finite number, boolean, or the canonical server-derived option key string plus `opcionAtributoId`. Every new row also stores `valorPermitidoId`. | Persisting allowed-value `clave` as runtime value is incorrect; later matching `valor` to `clave` is not a valid reference mechanism. |
| Public normalized DTO | `CreationEvaluation.valoresNormalizados` remains exactly `{ atributoRecursoId, valor, opcionAtributoId? }`. | Exposing `valorPermitidoId` there would violate the approved exact public evaluation contract. |
| Allowed-value pagination | Materialize `adminSortId = String(_id)` and paginate by definition/lifecycle, `orden`, `clave`, then `adminSortId`. | In-memory sorting after pagination can skip or repeat rows. |

## 3. Data model and compatibility rollout

### 3.1 Attribute definitions

Add to `definicionesAtributo` initially as optional storage:

```ts
modoCaptura?: "SELECCION" | "LIBRE";
```

All reads pass through one pure helper:

```ts
resolverModoCaptura(definition): "SELECCION" | "LIBRE";
```

It returns the stored field when present; otherwise it returns `SELECCION` for `tipoDato === "OPCION"` and `LIBRE` for every other current type. Admin detail and publication expose the effective value, never `undefined`.

Rollout order is mandatory:

1. deploy the optional schema and fallback reader;
2. make all new definition writes explicit;
3. backfill every definition;
4. verify zero missing values; and
5. only then make stored `modoCaptura` required. Update validators keep it optional only as patch syntax.

Changing `modoCaptura` or `tipoDato` uses the existing revision/update seam and validates the resulting pair. A transition to `SELECCION` is rejected with `ADMIN_AGGREGATE_INCOMPLETE` if a resulting effective assignment has no active valid allowed value. A transition away from `SELECCION`, or a `tipoDato` change, is blocked while an active rule, publication candidate, or active Resource reference would be invalidated.

### 3.2 Authoritative typed allowed values

Define and reuse one validator/type in schema, admin arguments/results, publication, and domain adapters:

```ts
type ValorPermitidoTipado =
  | { kind: "TEXTO"; value: string }
  | { kind: "NUMERO"; value: number }
  | { kind: "BOOLEANO"; value: boolean }
  | { kind: "OPCION"; opcionAtributoId: Id<"opcionesAtributo"> };
```

Add table `valoresPermitidosAtributo`:

```ts
{
  definicionAtributoId: Id<"definicionesAtributo">;
  clave: string;
  valor: ValorPermitidoTipado;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  revision: number;
  adminSortId?: string; // set to String(_id) in the insertion transaction
}
```

`clave` is the immutable technical identity of the catalog row. `valor` is the authoritative typed runtime/persistence value and must never be replaced by, defaulted from, or compared to `clave`. `definicionAtributoId` and `clave` are immutable. Required indexes are:

```text
porDefinicionYClave
  [definicionAtributoId, clave]
porOpcionDeValor
  [valor.opcionAtributoId]
porDefinicionYOrdenYClaveYAdminSort
  [definicionAtributoId, orden, clave, adminSortId]
porDefinicionYActivoYOrdenYClaveYAdminSort
  [definicionAtributoId, activo, orden, clave, adminSortId]
```

If the schema compiler cannot index a discriminated-union nested path directly, add an optional internal `opcionAtributoIdIndex` populated only from the `OPCION` branch and index that field. It is index metadata, not the authoritative payload, and validators must prove it equals `valor.opcionAtributoId`. No code may use the helper instead of the typed union for domain behavior.

The scoped key index enforces identity across active and inactive rows. The option index makes migration/rule backfill bounded and enforces one allowed-value mapping per legacy option. The ordered indexes are the only list plans.

Administrative functions in `convex/catalogoAdmin/atributos.ts` are:

- `crearValorPermitidoAtributo`;
- `obtenerValorPermitidoAtributo`;
- `listarValoresPermitidosAtributo`;
- `actualizarValorPermitidoAtributo`;
- `activarValorPermitidoAtributo`; and
- `desactivarValorPermitidoAtributo`.

Create accepts the typed `valor`. Update may patch `nombre`, `descripcion`, `orden`, and `valor`, and requires `expectedRevision`; lifecycle commands also require `expectedRevision`. Detail/list projections expose the exact typed `valor` union as well as ownership, lifecycle, revision, `effective`, and deterministic `effectiveReasons`.

Every ordinary create and update validates the resulting record:

1. the definition exists;
2. `valor.kind === definicion.tipoDato` exactly;
3. a `NUMERO` payload satisfies `Number.isFinite(valor.value)`;
4. an `OPCION` payload references an existing active option owned by the same definition;
5. `(definicionAtributoId, clave)` remains unique across lifecycle states;
6. an `OPCION` source option is not mapped by another allowed value; and
7. `clave`/`nombre` normalization and finite `orden` follow existing admin conventions.

Changing `valor` is behavior-changing: revision increases, the live fingerprint changes, and dependency checks run before patching. It is blocked when an active Resource row references the allowed value or when changing an option mapping would invalidate a dual legacy/selection rule. Deactivation is blocked when the value is referenced by an active effective selection rule, is the last active valid value of an effective `SELECCION` assignment, or is referenced by an active Resource created from selections. All Resource blockers use stored `valorPermitidoId`; they never infer a reference by comparing `valor` with `clave`.

### 3.3 Resource-value reference

Add compatibility-safe optional storage to `valoresAtributoRecurso`:

```ts
valorPermitidoId?: Id<"valoresPermitidosAtributo">;
```

Add index:

```text
porValorPermitido [valorPermitidoId]
```

Every value row created by `crearRecursoDesdeSelecciones` sets this field. Legacy rows remain valid without it, are not backfilled by comparing values or keys, and legacy creators continue writing their existing shape. Internal persistence input for the new path therefore contains:

```ts
{
  atributoRecursoId: Id<"atributosRecurso">;
  valor: string | number | boolean;
  opcionAtributoId?: Id<"opcionesAtributo">;
  valorPermitidoId: Id<"valoresPermitidosAtributo">;
}
```

The public `CreationEvaluation.valoresNormalizados` projection deliberately strips `valorPermitidoId` and remains exactly the approved three-field shape. Stored Resource detail may expose the optional reference additively where the existing stored-row validator is used, but legacy request contracts do not gain or require it.

### 3.4 Legacy-option migration

The migration is an internal, bounded, resumable state machine following the existing `backfillMetadatos` pattern:

1. `DEFINITIONS`: patch missing `modoCaptura` values.
2. `OPTIONS`: for each legacy option, find its mapping through `porOpcionDeValor`; otherwise insert one allowed value under the same definition with copied `clave`, `nombre`, `descripcion`, lifecycle, `revision: 1`, and `valor: { kind: "OPCION", opcionAtributoId: option._id }`.
3. `RULES`: map every `opcionCondicionId` through that typed OPCION payload and patch `valorPermitidoCondicionId` without changing the legacy reference.
4. `VERIFY`: report missing modes, duplicate/conflicting option mappings, active allowed values whose option is inactive/foreign/missing, unmapped option rules, and missing pagination metadata.

The current option model has no explicit order. Its effective deterministic order is key then ID, so migration assigns `orden: 0`; `0 → clave → id` preserves the observable order. Inactive legacy options migrate to inactive allowed values even though ordinary admin create/update requires an active OPCION target. That is a migration-only compatibility exception; such a row cannot activate until its referenced option is active and same-definition.

Reruns reuse the source-option mapping. A pre-existing `(definition, key)` row with a different typed payload, or an existing mapping for the source option under another row, is reported as a conflict and never overwritten. The migration does not update existing `valoresAtributoRecurso`, delete options, or edit aliases, Resources, revisions, or snapshots.

### 3.5 Conditional rules

Add permanently optional storage:

```ts
valorPermitidoCondicionId?: Id<"valoresPermitidosAtributo">;
```

Keep `opcionCondicionId`. Add a full identity index containing Type, condition assignment, legacy option, allowed value, affected assignment, and `adminSortId`; retain old indexes while legacy code depends on them.

Rule write behavior is:

- neither reference means a presence predicate in both evaluators;
- both references mean legacy and selection-specific equivalents; the allowed value must belong to the condition definition and its typed payload must be `{ kind: "OPCION", opcionAtributoId: opcionCondicionId }`;
- only `valorPermitidoCondicionId` means a selection-only predicate; legacy Resource validation filters this rule out rather than treating it as presence;
- only `opcionCondicionId` is accepted during compatibility rollout and the backend fills its mapped allowed value; after migration verification, an unmapped active rule cannot be created or activated.

Both references are immutable identity fields. Activation requires active, effective, same-definition references. The selection evaluator reads only `valorPermitidoCondicionId`; the legacy evaluator continues reading only `opcionCondicionId`. Conflict detection compares presence versus specific predicates and allowed-value IDs for the selection projection.

Conditional resolution remains in v1 and is simultaneous and deterministic: structurally valid selections on base-applicable `SELECCION` assignments form the predicate map; active rules evaluate against that map; a value-specific rule compares allowed-value IDs; a presence rule uses `Map.has`; and all firing results for a target must agree. Base `CONDITIONAL` resolves to `OPTIONAL` when no rule fires. A selection later resolved to `FORBIDDEN` or `NOT_APPLICABLE` is invalid and is not normalized; resolution is not recursively rerun.

## 4. Ownership and live catalog resolution

### 4.1 Explicit rule

`ownership` is exactly:

```ts
type ResourceOwnershipInput =
  | { kind: "GLOBAL" }
  | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
```

Resolution is backend-only:

- `GLOBAL`: validate the current live Class → Family → Type hierarchy, Unit policy, effective assignments, definitions, active allowed values, and effective rules.
- `ORGANIZATION`: load the exact organization by ID and require it to be active, then validate the same current live graph used for `GLOBAL`.

No publication revision, `PUBLISHED` row, snapshot, snapshot version, `hashContenido`, or publication fallback participates in either endpoint. A Type being published by zero, one, or multiple organizations is irrelevant to evaluation. This is intentional because frontend discovery uses live `catalogoAdmin` APIs.

`ownership` still affects Resource persistence and uniqueness:

- global Resources use `organizacionId === undefined` and global identity scope;
- organization Resources use the exact `organizacionId` and organization identity/alias scope;
- inactive Resources reserve identity in the same scope.

A missing or inactive organization yields `OWNERSHIP_INVALID`. Broken bounded-loader invariants remain corruption failures and may throw.

### 4.2 Shared live loader

`convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts` is one bounded live loader accepting `Pick<QueryCtx | MutationCtx, "db">`. Both adapters call it. It validates the supplied hierarchy and effective Unit policy from current rows, resolves existing Type-over-Family assignment precedence, and loads the definitions, typed allowed values, legacy options needed by OPCION payloads, and conditional rules.

The loader returns one immutable `SelectionCatalogGraph` regardless of ownership kind. Ownership contributes a validation/scope slot, but never selects a different catalog data source.

## 5. Pure evaluator contract and modules

### 5.1 Public and internal domain types

`src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts` owns database-independent types. Domain IDs are strings; Convex adapters preserve table-specific public IDs.

```ts
export type SelectionInput = Readonly<{
  asignacionAtributoId: string;
  valorPermitidoId: string;
}>;

export type SelectionCreationInput = Readonly<{
  claseRecursoId: string;
  familiaRecursoId: string;
  tipoRecursoId: string;
  unidadId: string;
  selecciones: readonly SelectionInput[];
  ownership:
    | Readonly<{ kind: "GLOBAL" }>
    | Readonly<{ kind: "ORGANIZATION"; organizacionId: string }>;
}>;

export type ResolvedApplicability =
  | "REQUIRED"
  | "OPTIONAL"
  | "FORBIDDEN"
  | "NOT_APPLICABLE";

export type CreationIssueCode =
  | "HIERARCHY_INVALID"
  | "UNIT_INVALID"
  | "OWNERSHIP_INVALID"
  | "ASSIGNMENT_UNKNOWN"
  | "ASSIGNMENT_DUPLICATE"
  | "ALLOWED_VALUE_UNKNOWN"
  | "ALLOWED_VALUE_FOREIGN"
  | "ALLOWED_VALUE_INACTIVE"
  | "SELECTION_NON_EFFECTIVE"
  | "SELECTION_FORBIDDEN"
  | "SELECTION_NOT_APPLICABLE"
  | "UNSUPPORTED_FREE_CAPTURE"
  | "IDENTITY_CONFLICT";

export type CreationIssue = Readonly<{
  code: CreationIssueCode;
  message: string;
  asignacionAtributoId?: string;
}>;

export type EvaluatedAssignment = Readonly<{
  asignacionAtributoId: string;
  definicionAtributoId: string;
  aplicabilidadResuelta: ResolvedApplicability;
  participaIdentidad: boolean;
  orden: number;
  effectiveReasons: readonly string[];
  selectedValueId?: string;
}>;

export type NormalizedResourceValue = Readonly<{
  atributoRecursoId: string;
  valor: string | number | boolean;
  opcionAtributoId?: string;
}>;

export type CreationEvaluation = Readonly<{
  status: "INCOMPLETE" | "VALID" | "INVALID";
  valid: boolean;
  catalogFingerprint: string;
  nombre: string | null;
  identificadorTecnico: string | null;
  asignaciones: readonly EvaluatedAssignment[];
  faltantesRequeridos: readonly string[];
  seleccionesInvalidas: readonly string[];
  valoresNormalizados: readonly NormalizedResourceValue[];
  issues: readonly CreationIssue[];
}>;
```

The evaluator keeps `valorPermitidoId` in a private sidecar captured at the moment a selection is accepted:

```ts
export type PersistableSelectionValue = Readonly<
  NormalizedResourceValue & { valorPermitidoId: string }
>;

export type InternalSelectionEvaluation = Readonly<{
  evaluation: CreationEvaluation;
  valoresParaPersistir: readonly PersistableSelectionValue[];
}>;

export async function evaluarCreacionSeleccion(
  input: SelectionCreationInput,
  graph: SelectionCatalogGraph,
): Promise<InternalSelectionEvaluation>;
```

The query returns only `result.evaluation`. The mutation persists only `result.valoresParaPersistir` after all gates pass. The sidecar prevents any later inference from `valor`, `clave`, labels, or option names while preserving the exact public DTO.

### 5.2 Module boundaries

- `src/catalogoRecursos/dominio/modoCaptura.ts`: fallback mode resolution only.
- `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts`: validation, duplicate handling, conditional resolution, typed normalization, status, naming, v2 identity inputs, and private persistence sidecar.
- `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts`: canonical live-graph model, code-point comparators, reference sentinels, stable stringify, and SHA-256.
- `src/catalogoRecursos/dominio/identidadRecurso.ts`: existing `normalizarValor`, `identidadRecursoV2`, and `serializarIdentidadV2` remain the identity authority; no v3 is added.
- `src/catalogoRecursos/dominio/reglasCondicionales.ts`: additive selection-rule projection; legacy functions and presence behavior remain unchanged.
- `convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts`: sole bounded live database loader.
- `convex/catalogoAdmin/resourceValidators.ts`: exact Convex input/evaluation/disposition validators plus private persistence types where needed.
- `convex/catalogoAdmin/recursos.ts`: registered query/mutation orchestration only.

The evaluator imports no Convex runtime modules and performs no reads or writes. Its only asynchronous operation is deterministic SHA-256 through the existing Web Crypto-compatible approach.

### 5.3 Typed normalization

For each accepted allowed value, normalize from `allowedValue.valor`, never from `allowedValue.clave`:

| `valor.kind` | Public/stored `valor` | Public/stored `opcionAtributoId` | Private/stored `valorPermitidoId` |
|---|---|---|---|
| `TEXTO` | `valor.value` as string | absent | selected allowed-value ID |
| `NUMERO` | finite `valor.value` as number | absent | selected allowed-value ID |
| `BOOLEANO` | `valor.value` as boolean | absent | selected allowed-value ID |
| `OPCION` | canonical current `opcion.clave` derived server-side | `valor.opcionAtributoId` | selected allowed-value ID |

The loader/evaluator treats an active allowed value with a mismatched `kind`, non-finite number, missing/foreign/inactive option, or inconsistent index helper as catalog corruption, not as a caller-authored primitive. Such a row is not an effective selectable value. Publication and admin writes prevent these states prospectively.

### 5.4 Evaluation algorithm

1. Build the canonical fingerprint from the loaded current live graph before classifying status.
2. Emit hierarchy, Unit, and ownership issues for invalid required references.
3. Resolve family-versus-Type assignment precedence before lifecycle/applicability filtering, using existing `resolverAsignaciones` semantics.
4. Sort effective assignments by `orden`, definition `clave` by Unicode code point, then assignment ID.
5. Scan `selecciones` in input order. Duplicate assignment IDs make that assignment invalid and remove all its occurrences from predicate, normalized, and persistence candidates.
6. Classify unknown assignments, non-effective assignments, unknown/foreign/inactive allowed values, and selections supplied to `LIBRE` assignments. Validate the selected allowed value's typed payload against its definition. Invalid candidates never fire conditions.
7. Evaluate active conditional predicates by allowed-value ID or presence and resolve every effective assignment to the four-value result union.
8. Reject retained selections now resolved forbidden/non-applicable; omit them from normalized values, persistence sidecar, and `selectedValueId`.
9. For each required `SELECCION` assignment without an accepted value, append its ID to `faltantesRequeridos`. For each required `LIBRE` assignment, emit `UNSUPPORTED_FREE_CAPTURE`. Optional `LIBRE` may remain unanswered.
10. Derive public normalization and its private `valorPermitidoId` sidecar together from the typed payload. Sort both by effective assignment order.
11. Build `seleccionesInvalidas` by first appearance in input, collapsing duplicate assignment IDs.
12. Choose status with strict precedence: any invalid issue gives `INVALID`; otherwise any missing required selection gives `INCOMPLETE`; otherwise `VALID`. Set `valid` to `status === "VALID"` and no other rule.
13. Only for `VALID`, generate `nombre` and the version-2 `identificadorTecnico`; otherwise both are `null`.

Fixed messages live beside issue codes so consumers branch on codes and tests can assert stable diagnostics.

## 6. Fingerprint design

`catalogFingerprint` is lowercase SHA-256 hex over a domain-prefixed stable serialization:

```text
selection-catalog-fingerprint:v1\n<canonical JSON>
```

For both ownership kinds, canonical content comes from the same current live effective graph. It includes:

- ownership kind and, for organization ownership, exact organization ID plus existence/active validation state;
- fixed Class, Family, Type, and Unit reference slots;
- supplied IDs and resolved IDs, technical keys, and lifecycle/effectivity facts;
- effective Unit policy selection;
- precedence-selected assignment IDs, definition IDs/keys, effective mode, data type, base applicability, identity participation, order, source level, and effectivity reasons;
- active valid allowed-value IDs, immutable `clave`, exact typed `valor` payload, display `nombre`, order, and referenced option ID/key/lifecycle for OPCION;
- Type display name used by generated naming;
- effective conditional rule IDs, condition/target assignment IDs, optional `valorPermitidoCondicionId`, and result; and
- deterministic diagnostic sentinels for unresolved catalog and submitted references.

Including typed `valor` is mandatory because it changes persisted normalized values and, for identity-participating assignments, version-2 identity. Including an OPCION target's current technical key is mandatory because it determines canonical persisted string and identity. `clave` remains included as catalog selection identity/order, but it is never substituted for typed `valor`.

Object keys use code-point order. Assignments and allowed values use their contractual orders; rules use condition assignment, optional allowed-value ID/presence marker, target assignment, result, then rule ID. Storage insertion order and timestamps are excluded. Administrative revision numbers are excluded when the represented semantics are otherwise identical.

Reference slots are never omitted:

```ts
{ state: "MISSING_REFERENCE", kind: "TYPE" }
{ state: "INVALID_REFERENCE", kind: "TYPE", suppliedId: "..." }
{ state: "RESOLVED", kind: "TYPE", suppliedId: "...", value: { ... } }
```

The same principle applies to Class, Family, Type, Unit, organization validation, submitted assignments, and submitted allowed values. Public validators require hierarchy IDs, but total sentinels keep the pure canonicalizer deterministic for invalid inputs. Valid selected answers are not fingerprint inputs; the token detects catalog assumptions, not one answer set.

No publication revision ID, snapshot version, snapshot bytes, or `hashContenido` is included. Organization identity and active state may change validation/scope and therefore the fingerprint, but publication state cannot.

## 7. Naming and technical identity

For a valid evaluation, collect accepted allowed-value labels only from identity-participating assignments in effective-assignment order. Normalize each display component with NFC, trim, and whitespace collapse. The result is:

```text
<Tipo.nombre> · <label 1> · <label 2> ...
```

When there are no identity-participating labels, the name is exactly normalized `Tipo.nombre`, with no trailing separator.

Technical identity reuses the existing version-2 serializer. It includes the validated current Class, Family, and Type technical keys and one pair per accepted identity-participating assignment:

```text
version = 2
hierarchy = [Clase.clave, Familia.clave, Tipo.clave]
parts = [definicion.clave, authoritativeNormalizedValueOrOptionKey]
```

The second part is derived as follows:

- `TEXTO`: `normalizarValor(allowedValue.valor.value)`;
- `NUMERO`: `normalizarValor(allowedValue.valor.value)` after finite validation;
- `BOOLEANO`: `normalizarValor(allowedValue.valor.value)`;
- `OPCION`: the current referenced `opcionesAtributo.clave`, exactly as existing v2 option identity semantics require.

The evaluator calls `serializarIdentidadV2(tipo, familia, clase, parts)` or adapts the same accepted values into `identidadRecursoV2`; it does not introduce another serializer/version. Allowed-value display labels never define identity, and allowed-value `clave` is not used as the runtime identity value. Existing v1/v2 rows remain untouched.

Every Resource created by the new path stores `identidadVersion: 2`, including global Resources. Organization aliases use `version: 2`; global Resources continue to use no organization alias. Identity uniqueness remains scoped by ownership and includes inactive Resources.

## 8. Public Convex contracts

### 8.1 Shared exact input

Both public functions accept exactly these shared fields:

```ts
{
  claseRecursoId: Id<"clasesRecurso">;
  familiaRecursoId: Id<"familiasRecurso">;
  tipoRecursoId: Id<"tiposRecurso">;
  unidadId: Id<"unidades">;
  selecciones: Array<{
    asignacionAtributoId: Id<"atributosRecurso">;
    valorPermitidoId: Id<"valoresPermitidosAtributo">;
  }>;
  ownership: ResourceOwnershipInput;
}
```

`crearRecursoDesdeSelecciones` additionally requires `expectedCatalogFingerprint: string`. No validator accepts manual name, description, identity, lifecycle, primitive value, legacy option ID, catalog revision/snapshot, or suspended-selection state.

The query return validator has exactly these top-level fields:

```text
status
valid
catalogFingerprint
nombre
identificadorTecnico
asignaciones
faltantesRequeridos
seleccionesInvalidas
valoresNormalizados
issues
```

`asignaciones` has exactly the required six fields plus optional `selectedValueId`. Input and selection-oriented references retain `valorPermitidoId`; the approved assignment-view exception remains `selectedValueId`. `valoresNormalizados` remains exactly:

```ts
Array<{
  atributoRecursoId: Id<"atributosRecurso">;
  valor: string | number | boolean;
  opcionAtributoId?: Id<"opcionesAtributo">;
}>;
```

It does not expose `valorPermitidoId`, even though the corresponding internal persistence row carries that reference.

### 8.2 Exact create result

```ts
type SelectionCreateResult =
  | { disposition: "CREATED"; item: ResourceSummary }
  | { disposition: "CATALOG_CHANGED"; evaluation: CreationEvaluation }
  | { disposition: "INCOMPLETE"; evaluation: CreationEvaluation }
  | { disposition: "INVALID"; evaluation: CreationEvaluation };
```

The `CREATED` member has exactly `disposition` and `item`; it has no evaluation, fingerprint, issue, or extra metadata. No fifth disposition exists.

## 9. Query and mutation data flow

### 9.1 Evaluation query

```text
public query args
  → cargarCreacionSeleccion(ctx.db, args)
      → load/validate active organization only when ORGANIZATION
      → load current live hierarchy and Unit policy
      → load current live assignments, definitions, typed values, options, rules
      → select precedence and build diagnostics/canonical live graph
  → evaluarCreacionSeleccion(domainInput, graph)
      → { evaluation, valoresParaPersistir }
  → discard private sidecar
  → exact public CreationEvaluation validator
```

Every growable read uses an index and `.take(limit + 1)` or native pagination. Direct submitted IDs use `ctx.db.get`. No unbounded `.collect()` is introduced.

### 9.2 Create mutation

```text
public mutation args + expectedCatalogFingerprint
  → reload current live graph through cargarCreacionSeleccion in this transaction
  → invoke unchanged evaluarCreacionSeleccion
  → if fingerprint differs: CATALOG_CHANGED
  → else if status INCOMPLETE: INCOMPLETE
  → else if status INVALID: INVALID
  → else check scoped Resource identity and organization alias version 2
  → on conflict: convert evaluation to INVALID + IDENTITY_CONFLICT
  → insert Resource, private normalized rows with valorPermitidoId, and optional alias
  → project ResourceSummary
  → exactly { disposition: "CREATED", item }
```

Fingerprint comparison occurs before every Resource/value/alias write and before evaluation status mapping. Identity checks occur only for a matching valid evaluation and still before writes. A conflict conversion sets `status: "INVALID"`, `valid: false`, `nombre: null`, and `identificadorTecnico: null`, appends `IDENTITY_CONFLICT`, and leaves assignment/missing/normalized diagnostics unchanged.

Convex transaction atomicity and OCC are the only concurrency mechanism. If equivalent mutations race, a retried loser reloads and observes the committed Resource/alias, then returns expected `INVALID`. No action, lock, retry coordinator, compensating write, or custom transaction abstraction is added.

## 10. Persistence reuse and legacy compatibility

Refactor `recursoPersistencia.ts` around one lower-level aggregate insertion helper with explicit server-only fields:

```ts
{
  classification;
  ownership;
  nombre;
  identificadorTecnico;
  identidadVersion;
  activo;
  valores;
}
```

The existing `insertarRecursoAdministrativo` wrapper continues supplying its current v1 defaults, request shape, return shape, errors, and behavior. The selection path supplies:

- validated Class/Family/Type/Unit IDs;
- resolved ownership scope;
- generated `nombre` and `identificadorTecnico`;
- `identidadVersion: 2` in both scopes;
- `activo: false`;
- no description; and
- private normalized rows containing `valorPermitidoId`.

The low-level helper writes `revision: 1` and current `adminScopeKey`. For organization ownership it writes a version-2 alias in the same transaction; global ownership writes no alias.

Legacy `crearRecurso` functions and validators continue accepting caller primitive values and optional legacy option IDs exactly as before. They do not require a fingerprint or allowed-value ID and continue writing rows without `valorPermitidoId`. Existing stored values are never rewritten or retroactively linked by value/key comparison. Selection-only rules without a legacy option remain filtered from legacy evaluation so they cannot become accidental presence predicates.

## 11. Publication, snapshot, and hash compatibility

Publication work represents the new catalog model for future publication consumers only. Neither `evaluarCreacionDesdeSelecciones` nor `crearRecursoDesdeSelecciones` reads this representation.

### 11.1 Snapshot representation

`catalogoTipoSnapshots.snapshot` becomes a validator union:

- legacy representation: the current exact shape, unchanged; or
- selection representation with `snapshotVersion: 2`, the complete legacy projection, and `selectionGraph`.

Historical rows remain valid and byte-for-byte unchanged. New publications write representation 2. `selectionGraph` contains:

- effective `modoCaptura` and `tipoDato`;
- active allowed values with immutable `clave`, exact typed `valor`, display fields, and order;
- OPCION forward compatibility through the payload's `opcionAtributoId` and the referenced option technical key;
- effective allowed-value predicates;
- effective assignment, hierarchy, and Unit-policy inputs required to interpret the published catalog; and
- legacy projections needed by existing publication consumers.

Selection-only rules with no legacy option are omitted from the legacy rule projection so they cannot become accidental presence predicates. Snapshot additions do not create an organization evaluation loader and do not gate the new live endpoints.

### 11.2 Completeness and lifecycle

`cargarAgregado` and publication validation change option completeness into mode-and-payload completeness: every active precedence-selected assignment whose effective mode is `SELECCION` must have at least one active allowed value whose payload kind matches the definition. Active OPCION payloads additionally require an active same-definition source option. Legacy OPCION checks remain for legacy consumers while they exist.

Publication fails atomically with `ADMIN_PUBLICATION_INVALID` when a selection assignment is empty, an allowed payload is invalid, a mapped predicate is invalid, a Unit policy is unresolved, a limit is exceeded, or another aggregate invariant fails. It writes neither revision nor snapshot on failure.

### 11.3 Canonical publication hash

Version publication canonicalization:

```text
catalog-content:v2\n<canonical JSON>
```

The v2 canonical representation includes effective mode/type, each active allowed value's technical key and authoritative typed payload, option technical mapping, display/output fields, allowed predicate semantics, Unit policy inputs, assignment order/identity/applicability, and all existing legacy publication semantics. Allowed values sort by `orden`, `clave` in code-point order, then stable semantic serialization independent of storage IDs.

The first v2 publication intentionally differs from v1. Later equivalent v2 content is `UNCHANGED`; any included semantic change produces a new hash. Old revision rows and snapshots are never patched. Publication revision/hash values do not participate in selection evaluation fingerprints.

## 12. Deterministic pagination and administrative reads

Allowed-value list cursor context binds:

```text
definicionAtributoId + lifecycle mode + index plan + ordering version
```

`ALL` uses `porDefinicionYOrdenYClaveYAdminSort`. `ACTIVE`/`INACTIVE` use `porDefinicionYActivoYOrdenYClaveYAdminSort`. Each request paginates once, maps without filtering/reordering, and passes the native continuation through the existing cursor envelope. Traversal returns each matching row once in `orden → clave → id` order.

Allowed-value admin reads expose the typed `valor` union and include inactive/non-effective rows. Live selection discovery/evaluation exposes only active effective choices while retaining direct-ID diagnostics for invalid submissions. Snapshot admin reads return the representation union but are not used by either new Resource endpoint.

## 13. Affected files

| File/area | Change |
|---|---|
| `convex/schema.ts` | Optional-then-required mode, typed allowed-value table/indexes, rule reference/index, optional Resource-value reference/index, snapshot union. |
| `src/catalogoRecursos/dominio/tipos.ts` | Additive capture/typed allowed-value domain types without changing legacy inputs. |
| `src/catalogoRecursos/dominio/modoCaptura.ts` | New compatibility resolver. |
| `src/catalogoRecursos/dominio/evaluarCreacionSeleccion.ts` | Pure evaluator, exact public evaluation, typed normalization, and private persistence sidecar. |
| `src/catalogoRecursos/dominio/huellaCatalogoSeleccion.ts` | Canonical current-live-graph fingerprint implementation. |
| `src/catalogoRecursos/dominio/asignacionesEfectivas.ts` | Reuse ordering/precedence; add mode/payload completeness without changing legacy exports. |
| `src/catalogoRecursos/dominio/reglasCondicionales.ts` | Add selection predicate projection/conflict checks while preserving legacy presence semantics. |
| `src/catalogoRecursos/dominio/identidadRecurso.ts` | Reuse existing v2 exports unchanged; no identity v3 implementation. |
| `src/catalogoRecursos/dominio/catalogoPublicado.ts` | Version-2 publication types/hash containing typed allowed values. |
| `convex/catalogoAdmin/atributos.ts` | Mode fields plus typed allowed-value CRUD/detail/list/lifecycle and ID-based blockers. |
| `convex/catalogoAdmin/reglas.ts` | Allowed-value predicate writes, typed mapping validation, reads, identity, and dual projection. |
| `convex/catalogoAdmin/lib/cargarAgregado.ts` | Mode/typed-value completeness and rule lifecycle checks. |
| `convex/catalogoAdmin/lib/cargarCreacionSeleccion.ts` | New shared bounded current-live loader for both ownership kinds. |
| `convex/catalogoAdmin/lib/backfillSeleccionCatalogo.ts` | Bounded definitions/options/rules migration and verification using OPCION payload references. |
| `convex/catalogoAdmin/resourceValidators.ts` | Exact public selection contracts; stored Resource value gains optional reference while public normalized DTO does not. |
| `convex/catalogoAdmin/lib/recursoPersistencia.ts` | Shared insertion seam with explicit identity version and private `valorPermitidoId`; legacy wrapper remains compatible. |
| `convex/catalogoAdmin/recursos.ts` | Register only the two additive selection functions and orchestrate exact dispositions. |
| `convex/catalogoRecursos/validacionRecurso.ts` | Ensure selection-only rules cannot become legacy presence rules; preserve legacy creation semantics. |
| `convex/catalogoRecursos/catalogoPublicado.ts` | Compile representation 2 for future publication compatibility only. |
| `convex/catalogoRecursos/catalogoPublicadoValidators.ts` | Legacy/selection snapshot union with typed allowed values. |
| `convex/catalogoAdmin/publicacion.ts` | Read union and map new completeness violations; no role in new endpoint loading. |
| `convex/catalogoAdmin/validators.ts` | Add allowed-value entity references and reused aggregate violation codes. |
| `contract-tests/resource-admin-consumer.ts` | Exact generated arguments, Spanish evaluation fields, mandatory fingerprint, unchanged normalized DTO, and four-way result narrowing. |
| `convex/_generated/*` | Regenerate through Convex CLI only; never hand-edit. |

Focused tests are colocated beside each changed domain/Convex module. Existing legacy tests remain regression authority.

## 14. Strict TDD seams and delivery slices

Every implementation slice follows `RED → GREEN → TRIANGULATE → REFACTOR` and stays below 400 authored additions plus deletions. Split a slice before implementation if it approaches the limit.

1. **Mode seam:** fallback tests; optional schema/admin projection; explicit writes/backfill; tightening deferred until verification.
2. **Typed allowed storage seam:** union validators; create/update `kind === tipoDato`; finite numbers; active same-definition OPCION references; typed detail/list; immutable key and revision tests.
3. **Pagination/reference seam:** deterministic multipage traversal; option mapping uniqueness; optional `valorPermitidoId` schema/index; ID-based blocker tests proving no `valor === clave` inference.
4. **Migration seam:** idempotent definitions/options/rules batches; OPCION payload references; inactive migration exception; collision reports; no Resource/value/snapshot rewrites.
5. **Rule seam:** mapped dual references, allowed-only filtering from legacy, presence falsey regressions, conflict and lifecycle tests.
6. **Pure evaluator seam:** issue classification, duplicates, precedence, all resolved applicability values, simultaneous conditionals, required/optional LIBRE behavior, and status invariant.
7. **Typed normalization seam:** TEXT string, finite NUMERO number, BOOLEANO boolean, OPCION server-derived option key plus option ID; public DTO omits allowed ID while private sidecar retains it.
8. **Fingerprint seam:** same live graph for both ownership kinds; ownership-state changes; typed payload changes; option-key changes; storage-order independence; unresolved sentinels; proof that publication/snapshot changes alone do not change it.
9. **Identity/name seam:** exact v2 length-safe serialization with Class/Family/Type; authoritative normalized primitive values and option keys; `identidadVersion: 2`; label edits affect name but not identity; allowed `clave` is not substituted for runtime value.
10. **Loader/query seam:** current live fixtures for GLOBAL and ORGANIZATION; active organization validation; hierarchy/Unit validation; multiple/no publications produce the same live behavior; bounded reads; exact query validator.
11. **Create seam:** mandatory fingerprint; mismatch precedence; all four dispositions; exact `CREATED` keys; version-2 Resource/alias conflicts; inactive duplicate reservation; OCC race; no-write snapshots; persisted `valorPermitidoId` on every new value row.
12. **Publication seam:** typed selection representation, mode/value/rule/unit completeness, v2 canonical hash, insertion-order independence, immutable v1 snapshots, and proof that endpoints do not read publications.
13. **Legacy compatibility seam:** both legacy creators retain arguments, behavior, errors, primitive/option support, and rows without allowed references; existing stored values remain unchanged.
14. **Generated-consumer seam:** direct generated refs and `FunctionArgs`/`FunctionReturnType`; exact `valorPermitidoId` input; exact Spanish evaluation fields; mandatory create fingerprint; exact public normalized DTO; exhaustive disposition switch; no suspended-selection field.

Required verification:

```text
pnpm exec vitest run
pnpm typecheck
pnpm typecheck:consumer
pnpm exec convex codegen --typecheck enable
git diff --check
pnpm exec convex dev --once   # when a deployment is available
```

## 15. Risks and mitigations

| Risk | Mitigation |
|---|---|
| `clave` is accidentally persisted as selected value | Central typed union and one normalization function derive persistence only from `valor`; tests use deliberately different `clave` and payload values. |
| An allowed payload disagrees with its definition | Create/update/result validators require exact kind equality; numeric finite checks and active same-definition option checks run on resulting records. |
| Resource blockers guess references from scalar values | Every new selection-created row stores `valorPermitidoId`; blockers use `porValorPermitido`; legacy rows are never guessed/backfilled. |
| Public normalized contract gains an internal reference | Evaluator returns an exact public projection plus a private persistence sidecar; generated contract tests reject extra public fields. |
| Organization evaluation disagrees with live discovery | Both ownership kinds use one current-live loader; tests prove publication presence/content has no effect. |
| Organization validity or scope is omitted from staleness detection | Fingerprint includes ownership kind, exact organization ID, and organization existence/active state, but no publication data. |
| Identity loses hierarchy or changes version | Call existing v2 serializer with Class/Family/Type and persist version 2; tests reject v3 and hierarchy omission. |
| Typed value changes fail to stale identity/persistence assumptions | Fingerprint includes the full typed payload and referenced option key/lifecycle. |
| Duplicate input ambiguously drives rules | Duplicate assignment IDs invalidate all occurrences and remove them from predicate and persistence candidates. |
| New selection-only rule changes legacy creation | Legacy loader excludes allowed-only rules; mapped dual rules retain their legacy option predicate. |
| Migrated inactive options cannot satisfy ordinary active-option validation | Migration alone may create a matching inactive allowed row; activation/update requires restoring a valid active same-definition option. |
| Publication scope expands into endpoint resolution | Publication modules only serialize/validate future-compatible representation; endpoint dependency tests prohibit snapshot/revision reads. |
| Identity collides under concurrency | Scoped Resource and alias checks occur before writes in one mutation; OCC retries expose the winner to the loser. |
| Optional mode/reference fields are tightened too early | Separate deploy/backfill/verify/tighten stages; `valorPermitidoId` remains optional because legacy rows intentionally lack it. |
| Legacy creator behavior changes during persistence refactor | Keep old public validators and wrapper defaults; regression tests assert arguments, errors, stored values, and return shapes. |

## 16. Rollout

1. Deploy additive optional `modoCaptura`, typed allowed-value storage/indexes, optional `valorPermitidoId` plus index, optional rule reference, snapshot union, and fallback readers. Wait for indexes to become ready.
2. Deploy explicit definition/allowed-value writes and ordinary typed validators, but do not expose selection endpoints yet.
3. Run bounded definition, option, and rule migrations. Resolve conflicts and verify every migrated option maps through an OPCION payload, active mappings reference active same-definition options, and pagination metadata is complete.
4. Deploy publication representation 2 and verify deterministic hashes and untouched historical snapshots. Do not make endpoint enablement depend on publishing an organization.
5. Deploy the pure evaluator, one current-live loader, query, and mutation. Verify GLOBAL and ORGANIZATION discover/evaluate identical catalog semantics, with organization active-state validation and distinct persistence scope.
6. Regenerate contracts and migrate consumers. Suspended selections remain local and are removed before requests.
7. Verify every selection-created Resource value stores `valorPermitidoId`, while public `valoresNormalizados` remains unchanged and legacy rows/creators remain valid without the reference.
8. After zero missing definition modes is independently verified and all deployed writers are explicit, tighten stored/create `modoCaptura`; keep `valorPermitidoId` optional for legacy compatibility.
9. Run focused/full tests, typechecks, codegen, and deployment validation after every deployable slice.

## 17. Rollback

1. Remove or disable `evaluarCreacionDesdeSelecciones` and `crearRecursoDesdeSelecciones` first. Existing creators remain available.
2. Revert the latest adapter/domain slice without deleting successfully created Resources, value rows, or version-2 aliases.
3. Stop new allowed-reference writes if rule behavior is rolled back; retain optional fields, typed rows, mappings, and Resource-value references as inert compatibility data.
4. Roll publication code back only to a reader that still accepts both snapshot representations. Never patch or delete representation-2 or historical snapshots.
5. Restore the `modoCaptura` fallback reader if needed; do not destructively remove populated fields.
6. Never delete legacy options/references, infer/backfill `valorPermitidoId` from scalar values, rewrite existing Resource values, or restore data through compensating transactions.
7. Retain additive indexes/fields until no deployed code uses them; schema rollback against populated data is riskier than inert storage.

## 18. Acceptance trace

This design preserves the exact shared Spanish input and evaluation names, including selection input `valorPermitidoId`, mandatory `expectedCatalogFingerprint`, always-string fingerprint, `CONDITIONAL` resolution in v1, and exact `CREATED` shape. It keeps public `valoresNormalizados` exactly unchanged while storing `valorPermitidoId` privately on new Resource-value rows.

The allowed-value runtime authority is the typed `valor` union, with definition-kind equality, finite numbers, and active same-definition option validation. Migration writes OPCION payloads that reference source options. Typed payloads—not allowed-value keys—drive Resource persistence and version-2 identity.

Both ownership kinds evaluate one current live effective admin graph. Ownership validates organization state and selects Resource uniqueness/alias scope; publications remain a future-compatible representation only. The fingerprint follows that same live graph and contains no publication revision or snapshot.

New selection-created Resources preserve established hierarchy identity by reusing length-safe v2 semantics with Class, Family, Type, definition keys, and authoritative normalized values/option keys, and they persist `identidadVersion: 2`. Existing creators and historical data remain compatible and unchanged.
