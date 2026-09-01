# Design: Bounded Resource Master Administration

## 1. Design intent

Implement an additive Convex administration surface at `api.catalogoAdmin.recursos` without replacing or widening any function in `api.catalogoRecursos.recursos`. The implementation will use Convex 1.45.0 native transactions, indexes, search pagination, validators, and generated function references.

This design preserves the existing public Resource function names, arguments, return shapes, behavior, and Spanish error messages. Bandeja, XML, authentication, permissions, seed capabilities, UI, hard delete, cascading delete, publication changes, and public API replacement remain out of scope.

## Trade-offs

| Decision | Chosen direction | Trade-off |
|---|---|---|
| Additive vs replacement | Additive `catalogoAdmin.recursos` surface | Duplicates some entry points, but protects legacy names, returns, and errors. |
| Sort metadata vs memory sorting | Optional indexed sort metadata for ordinary lists | Adds schema/index and rollout work, but avoids unbounded scans and in-memory sorting. It is not a search fallback. |
| Summary/detail vs embedded values | Value-free summaries; bounded values only in direct detail | Requires a second read for values, but prevents N+1 payloads and keeps list pages bounded. |
| Immutable classification/ownership vs migration | Reject changes in this API | Defers migration and alias-transfer complexity to an explicit future change. |
| Native search vs custom projection | Convex 1.45.0 native indexed relevance traversal | Preserves native relevance semantics; traversal must be proven before dependency, otherwise design/spec revision is required. |
| Bounded limit vs unbounded reads | Enforce explicit page, aggregate, and value limits | Some oversized data must be repaired or handled separately, but silent truncation and runaway reads are avoided. |

## 2. Evidence-based decisions

Repository evidence fixes the main design choices:

- `recursos` already owns classification by `tipoRecursoId`, Unit, derived identity, lifecycle, revision, and optional organization ownership.
- `valoresAtributoRecurso.porRecurso` is the authoritative aggregate relationship.
- `identidadesRecurso.porOrganizacionVersionClave` is the organization/version alias boundary.
- `validacionRecurso.ts` and the pure domain modules already define Resource validity and identity; these rules will be exposed through a non-throwing administrative seam rather than copied.
- `catalogoAdmin/lib` already defines the `ADMIN_*` payloads, opaque cursor envelope, page bounds, revision behavior, effective aggregate loader, and result unions.
- Convex 1.45.0's installed `query.d.ts` defines `withSearchIndex` as an `OrderedQuery`, supports `.paginate(...)`, and documents relevance ordering and adjacent, non-overlapping native pages. It does not promise lexical ordering.
- Existing Resource reads spread a `recursos` document into their legacy result. Adding optional metadata therefore requires changing that internal projection to an explicit legacy field projection, or the legacy return validator could receive new fields. This internal change must not alter the generated legacy shape.

## 3. Additive API contract

Create `convex/catalogoAdmin/recursos.ts` with these public Convex functions:

| Function | Kind | Result |
|---|---|---|
| `listarRecursosResumen` | query | `AdminPage<ResourceSummary>` |
| `buscarRecursosResumen` | query | `AdminPage<ResourceSummary>` |
| `obtenerDetalleRecurso` | query | `ResourceDetail | null` |
| `crearRecurso` | mutation | `CreateResult<ResourceSummary>` |
| `actualizarRecurso` | mutation | `ChangeResult<ResourceSummary>` |
| `activarRecurso` | mutation | `ChangeResult<ResourceSummary>` |
| `desactivarRecurso` | mutation | `ChangeResult<ResourceSummary>` |

All registered functions use object form and declare both argument and return validators.

### 3.1 Shared input contracts

- `ResourceClassificationInput`: Class ID, Family ID, and Type ID.
- `ResourceOwnershipInput`: `{ kind: "GLOBAL" }` or `{ kind: "ORGANIZATION", organizacionId }`.
- `ResourceValueInput`: assignment ID, scalar value, and optional option ID.
- Description inputs use `string | null`; `null` clears the optional stored field.
- Create accepts classification, ownership, Unit, name, description, and values. It does not accept technical identity or active state. New Resources are active at revision 1.
- Update accepts Resource ID, `expectedRevision`, and optional mutable replacements for name, description, Unit, and values.
- Update also accepts an optional `immutableEcho` object solely to provide structured rejection for attempted Type/Class/Family, ownership, technical-identity, or active-state writes. Classification and ownership echoes must equal stored ownership; any supplied technical identity or active state is rejected. Omitting the echo never makes those fields mutable.
- Lifecycle commands accept only Resource ID and `expectedRevision`.

### 3.2 Summary projection

`ResourceSummary` contains only:

- `id`;
- `identificadorTecnico`;
- `nombre`;
- `tipoRecursoId`;
- `unidadId`;
- optional `organizacionId`;
- `activo`;
- `revision`; and
- `classificationStatus`, containing `state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE"` and the current hierarchy reasons.

`classificationStatus` is computed from the stored Type, its Family and Class, and `resolverJerarquiaEfectiva`. It does not evaluate or return Resource values. Resource lifecycle (`activo`) remains separate from catalog effectiveness.

### 3.3 Detail projection

`ResourceDetail` contains the summary fields plus:

- stored description and identity version;
- nullable resolved Class, Family, Type, Unit, and organization references, so damaged historical rows remain inspectable;
- `catalogDiagnostics` with hierarchy effectiveness/reasons, aggregate status (`VALID`, `INVALID`, or `NOT_EVALUATED`), and coded violations from `cargarAgregado`;
- all stored value rows, without joining each value to definitions or options.

The detail adapter reports current references and diagnostics; it does not rewrite or hide stored history. Missing catalog documents result in nullable references and inert/broken diagnostics, not a missing Resource response. Only a missing Resource ID returns `null`.

## 4. Module boundaries and allowed dependencies

The implementation is additive and uses this dependency direction:

```text
src/catalogoRecursos/dominio/*
           ^
convex/catalogoRecursos/validacionRecurso.ts
           ^
convex/catalogoAdmin/lib/recursoValidacion.ts
           ^
convex/catalogoAdmin/recursos.ts
```

Additional modules:

| File | Responsibility | Allowed dependencies |
|---|---|---|
| `convex/catalogoAdmin/resourceValidators.ts` | Resource args, summary, detail, diagnostics, and value validators; inferred internal types | `convex/values`, shared `catalogoAdmin/validators.ts` |
| `convex/catalogoAdmin/lib/recursoResumen.ts` | Pure summary projection, hierarchy annotation, list plan selection | generated data types, `catalogoEfectivo`, pagination types; never the value loader |
| `convex/catalogoAdmin/lib/recursoDetalle.ts` | Direct detail assembly and bounded value loading | `recursoResumen`, `cargarAgregado`, generated server/data types |
| `convex/catalogoAdmin/lib/recursoValidacion.ts` | Bounded administrative validation and domain-failure-to-`ADMIN_*` mapping | existing Resource validation seam, `cargarAgregado`, admin errors |
| `convex/catalogoAdmin/lib/recursoPersistencia.ts` | metadata, identity duplicate lookup, alias conflict lookup, aggregate writes | generated server/data types, existing identity and alias modules |
| `convex/catalogoAdmin/recursos.ts` | registered query/mutation orchestration only | the five Resource helpers and completed admin helpers |

Rules for dependency safety:

1. `recursoResumen.ts` must not import `recursoDetalle.ts`, `recursoPersistencia.ts`, or query `valoresAtributoRecurso`.
2. `recursoDetalle.ts` may import the summary projector; the reverse dependency is forbidden.
3. Admin code may reuse `catalogoRecursos` domain/adapter helpers. Existing public Resource modules must not depend on the new admin API.
4. Shared extraction from `validacionRecurso.ts` or `identidadesRecurso.ts` must preserve their current wrappers and Spanish messages.
5. Generated `_generated` files are produced only by Convex code generation and are never hand-maintained.
6. No new database, cache, queue, or service is introduced.

## 5. Schema, indexes, and populated-data rollout

### 5.1 Optional metadata

Add these optional fields to `recursos`:

- `adminSortId?: string`, always the Resource ID for newly written/backfilled rows;
- `adminScopeKey?: string`, equal to `GLOBAL` or `ORG:<organizacionId>`.

They are optional because `recursos` is populated. No deployment adds a required field to existing rows.

Every new Resource created by either the legacy or administrative mutation writes both fields. Administrative update heals them if absent. Ownership is immutable, so `adminScopeKey` does not otherwise change. The legacy `respuesta` helper changes from document spreading to an explicit legacy projection that omits both fields; all protected public returns remain byte-for-field compatible.

### 5.2 Deterministic list indexes

Ordinary admin ordering is ascending `(identificadorTecnico, adminSortId)`, identified by order token `resource-identity-id-v1`. Filters are independently combinable: Type, Unit, and ownership. Lifecycle is `ALL`, `ACTIVE`, or `INACTIVE`.

To avoid post-index filtering and sparse/unbounded page scans, add one index for each filter subset, and a lifecycle-prefixed counterpart:

- no facet: `adminPorOrden`, `adminPorActivoYOrden`;
- Type: `adminPorTipoYOrden`, `adminPorActivoYTipoYOrden`;
- Unit: `adminPorUnidadYOrden`, `adminPorActivoYUnidadYOrden`;
- scope: `adminPorScopeYOrden`, `adminPorActivoYScopeYOrden`;
- Type + Unit: `adminPorTipoYUnidadYOrden`, `adminPorActivoYTipoYUnidadYOrden`;
- Type + scope: `adminPorTipoYScopeYOrden`, `adminPorActivoYTipoYScopeYOrden`;
- Unit + scope: `adminPorUnidadYScopeYOrden`, `adminPorActivoYUnidadYScopeYOrden`;
- Type + Unit + scope: `adminPorTipoYUnidadYScopeYOrden`, `adminPorActivoYTipoYUnidadYScopeYOrden`.

Each index consists of exactly the named equality prefixes, followed by `identificadorTecnico` and `adminSortId`. Lifecycle-prefixed indexes put `activo` first. The planner uses a fixed mapping from the normalized filter bitmask and lifecycle mode to one index; it never falls back to `.filter()` or a full-table scan.

### 5.3 Search index

Extend the existing `recursos.buscar` search index filter fields from Type and active state to:

- `tipoRecursoId`;
- `unidadId`;
- `activo`;
- `adminScopeKey`.

The search field remains `nombre`; changing search semantics to include technical identity is not justified by existing behavior. Search results are documented as Convex 1.45.0 relevance order.

### 5.4 Safe backfill

Append a `recursos` plan to `catalogoAdmin/lib/backfillMetadatos.ts`; appending preserves the numeric meaning of any existing in-flight plan cursor. The plan paginates `recursos.porIdentificadorTecnico` in batches of at most 100 and idempotently patches only missing/incorrect `adminSortId` and `adminScopeKey` values.

Rollout order is mandatory:

1. Deploy optional fields, indexes, explicit legacy projection, metadata writes in both create paths, and the appended internal backfill plan.
2. Run the resumable backfill until it returns `nextCursor: null`. A rerun is safe and is the completion audit; concurrent creates already carry metadata.
3. Wait for Convex indexes/search index to report ready.
4. Deploy/enable Resource admin list and search functions.
5. Run traversal and legacy compatibility smoke tests before consumer adoption.

A filtered admin endpoint must not be exposed before step 2, because a missing `adminScopeKey` could otherwise omit a historical row. Rollback first removes/reverts admin endpoints; optional metadata and unused indexes may remain. No rollback deletes or rewrites Resource, value, alias, or publication data.

## 6. List and search data flow

### 6.1 List

1. Validate `pageSize` with the existing `validatePageSize` bound (default 25, integer 1–100).
2. Normalize omitted lifecycle to `ALL`, IDs to string values in the binding object, and ownership to `ALL`, `GLOBAL`, or `ORG:<id>`.
3. Choose the exact index plan from the filter bitmask and lifecycle mode.
4. Consume the opaque cursor with context:
   - `plan`: selected index name;
   - `mode`: normalized lifecycle mode;
   - `filters`: `{ tipoRecursoId: id|null, unidadId: id|null, scope: key|null }`;
   - `order`: `resource-identity-id-v1`.
5. Execute one indexed `.order("asc").paginate({ numItems: pageSize, cursor })`.
6. Resolve only Type/Family/Class references for the bounded page and project summaries.
7. Wrap the native cursor with the existing `createCursor`; return null when exhausted.

No branch in this flow receives a value loader capability.

### 6.2 Search

Search text is NFC-normalized, trimmed, and internal whitespace is collapsed. Blank text fails with `ADMIN_INVALID_ARGUMENT`. The binding includes normalized text plus the same normalized filters and lifecycle mode as list.

Primary plan for Convex 1.45.0:

1. Build `withSearchIndex("buscar", ...)`, applying every supplied filter as a search-index equality filter.
2. Call native `.paginate({ numItems: pageSize, cursor })`.
3. Project the same summaries as list without loading values.
4. Wrap the native cursor using plan `resource-search-native-v1` and order token `convex-1.45.0-relevance-v1`.

A list cursor cannot be used for search; a search cursor cannot cross text, filters, lifecycle mode, plan, or order version because the completed envelope hashes all of those fields.

### 6.3 Native search verification gate

Before the search work can merge or become a dependency for later work, an integration test against installed Convex 1.45.0 must create more equal-relevance hits than one page and traverse the unchanged result set repeatedly with page sizes 1, 2, and a non-divisor. Each traversal must contain every expected ID once, contain no unknown ID, and terminate. The package manifest/lock used by the test must resolve Convex exactly to 1.45.0; a version change requires a new order token and rerunning this gate.

If native traversal fails this gate, the search work is blocked. It requires an explicit design/specification revision before implementation proceeds; no technical-identity/adminSortId fallback, collection, or silent in-memory sorting is permitted.

