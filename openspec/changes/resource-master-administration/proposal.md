# Add bounded Resource master administration

## Intent

Add an additive `catalogoAdmin.recursos` API for safe, scalable Resource master administration while preserving every existing public Resource API unchanged. The new backend contract will support indexed cursor-paginated summaries, indexed full-text search, bounded direct detail with values, and atomic revision-guarded commands that reuse the completed catalog administration stack.

This is a backend and portable-contract change only. It does not implement a UI or replace `convex/catalogoRecursos/recursos.ts`.

## Problem statement

The current public Resource functions are compatible with existing consumers but are not a safe administrative foundation at scale:

- `listarRecursos` and `buscarRecursos` use `.collect()` and can read every matching Resource;
- list and search results load values through one indexed query per Resource, creating an N+1 read pattern and large nested payloads;
- administrative clients lack cursor-paginated Resource summaries and a separate bounded detail contract;
- Resource failures use legacy message text rather than the completed structured `ADMIN_*` error contract;
- administrative revision, immutable ownership/classification, effective-catalog validation, and lifecycle behavior are not exposed as one coherent API; and
- widening or replacing the existing public Resource functions would create unnecessary compatibility risk.

The completed catalog administration stack already supplies the required pagination envelope, revision semantics, effective-catalog resolver, structured errors, aggregate validation, generated Convex contract, and delivery conventions. Resource administration should extend that stack rather than duplicate it.

## Product outcome

A separate React consumer can use generated Convex types and references to browse, search, inspect, create, update, activate, and deactivate Resources through a bounded backend-authoritative contract. Summary reads remain lightweight, detail reads preserve values and inert historical state, and writes either commit the complete Resource aggregate or make no change.

## Goals

1. Add an additive `catalogoAdmin.recursos` API without changing existing public Resource names, arguments, returns, or error behavior.
2. Provide indexed cursor pagination for value-free Resource summaries with explicit bounded filters and stable cursor binding.
3. Provide indexed full-text Resource summary search without collecting or sorting an unbounded result set in memory.
4. Provide a separate direct detail read that returns stored values once, subject to an explicit cardinality limit.
5. Use structured `ADMIN_*` errors, expected-revision concurrency, idempotent lifecycle commands, and atomic writes.
6. Keep Resource classification and organization ownership immutable in the new administrative API.
7. Reuse current effective catalog and Resource validation so create, update, and reactivation enforce lifecycle and effective-state rules consistently.
8. Keep duplicate identity and alias checks indexed, ownership-aware, inclusive of inactive rows, and bounded.
9. Expose the new API as a portable generated Convex contract for React consumers without hand-maintained DTOs.
10. Deliver W0 plus WU1–WU9 exactly as defined in the design/tasks, with each behavior unit within a 400 authored additions-plus-deletions review budget; W0 is planning/runtime evidence, not a product PR.

## Non-goals

The following are explicitly excluded:

- Bandeja functionality.
- XML functionality or import/export.
- Authentication, authorization, roles, or permissions.
- Seed or fixture data as a product capability.
- Hard deletion of Resources, values, or aliases.
- A Resource administration UI or any other UI implementation.
- A replacement public Resource API.
- Renaming, removing, or changing any existing public Resource function or return contract.
- Classification or organization ownership migration.
- Automatic publication, publication mutation, or snapshot changes.

## Product and business rules

### Additive API boundary

- The new surface is exposed under `catalogoAdmin.recursos` through a focused Convex admin module.
- It includes summary list, summary search, direct detail, create, update, activate, and deactivate capabilities.
- Existing exports in `convex/catalogoRecursos/recursos.ts` remain available and behaviorally compatible, including their current Spanish error-message contract.
- The generated Convex `api` and data-model types are the portable React contract; no parallel DTO or manually maintained client SDK is introduced.

### Summary list and search

- List results contain only Resource summary fields needed by an administration grid: Resource ID, technical identity, name, Type reference, Unit reference, optional organization reference, active state, revision, and effective/inert classification status.
- Summary endpoints never load `valoresAtributoRecurso` rows.
- Ordinary listing uses indexed ordering with cursor pagination. Optional compatibility-safe sort metadata may be added, but no required field is added directly to populated rows.
- Supported list filters are bounded and index-backed, including lifecycle mode and filters for Type, Unit, and organization ownership as specified by the final contract.
- Full-text search uses a Convex search index and returns the same value-free summary shape.
- Search text, filters, ordering-version metadata, and the native cursor are bound into the completed opaque cursor envelope. A cursor from another query or filter set is rejected structurally.
- Search ordering is documented as the installed Convex search order, not misrepresented as lexical name or technical-identity order.
- Installed Convex 1.45.0 native relevance traversal must be proven with repeated equal-relevance pagination before the search dependency is accepted. If the native traversal proof fails, block the search work unit and require an explicit spec/design revision before implementation; no collect/sort or fallback path is authorized.

### Separate bounded detail

- Detail is a direct ID lookup separate from list and search.
- Detail returns stored classification references, effective/inert annotations needed for repair or history, and all stored Resource values within the supported bound.
- Values are loaded with one indexed `porRecurso` read using `MAX_RESOURCE_VALUES + 1` or an equivalent explicit guard.
- Excessive value cardinality returns a structured bounded-state error; values are never silently truncated.
- A Resource remains inspectable when its current catalog branch or configuration has become inactive or invalid.

### Revision concurrency and immutable fields

- Every mutable command accepts `expectedRevision` and checks it first; update validates immutable fields, constructs and validates the complete proposed effective aggregate, and only then decides semantic no-op.
- A stale revision returns `ADMIN_STALE_REVISION` and changes nothing.
- Same-state activate/deactivate commands are idempotent only after revision validation succeeds.
- Organization ownership is immutable: a Resource cannot move between global and organization-owned scope or between organizations.
- Classification is immutable in the admin API: the Type and its resolved Class/Family ownership cannot change after creation.
- `identificadorTecnico` is derived and never directly writable.
- For organization-owned Resources, identity-participating values cannot change the derived identity, preserving the existing alias boundary.
- Unit, name, description, and values may change only through the guarded update and only when the proposed aggregate validates.
- Active state changes only through lifecycle commands, not general update.

### Effective validation and lifecycle

- Create, update, and reactivation reuse the existing Resource validator and the completed effective catalog resolver; they do not duplicate catalog policy in the adapter or frontend.
- Create requires a valid effective Class → Family → Type chain, a permitted active Unit, valid assignments/rules/definitions/options, and valid Resource values.
- Update validates the hypothetical complete replacement against the current effective Type, whether the stored Resource is active or inactive.
- Reactivation applies the same current effective validation and leaves the Resource unchanged on failure.
- Deactivation is allowed after revision validation, preserves identity and values, and does not cascade into catalog or value lifecycle changes.
- Active Resources continue to participate in existing indexed catalog-deactivation blockers; inactive Resources do not block catalog deactivation.
- Resource commands do not publish, modify catalog revisions, or rewrite snapshots.

### Duplicate and ownership rules

- Duplicate technical identity checks include active and inactive Resources.
- Global Resources use global identity scope; organization-owned Resources use organization scope, matching existing indexes.
- Duplicate checks use bounded indexed reads and fail with structured context rather than scanning or collecting a table.
- Create validates that a supplied organization exists and is active, but this data validation does not invent an authorization or tenant-isolation policy.
- Organization alias creation remains versioned and atomic with Resource creation.
- Alias conflicts fail the whole transaction; normal updates do not delete or transfer historical alias rows.

### Atomic writes and structured errors

- Create inserts the Resource, all value rows, and any organization alias in one Convex mutation transaction.
- Update checks revision first, validates immutable fields, constructs and validates the complete proposed effective aggregate, decides semantic no-op only after valid-candidate construction, then computes identity, checks duplicates, replaces values, and increments the Resource revision in one transaction; an invalid aggregate cannot become a no-op.
- Validation, duplicate, alias, or value-write failures roll back the complete mutation.
- Administrative failures use the completed validated `ADMIN_*` payload contract, with machine behavior based on `ConvexError.data`, not prose.
- Expected mappings include:
  - missing Resource → `ADMIN_NOT_FOUND`;
  - stale revision → `ADMIN_STALE_REVISION`;
  - duplicate identity or alias → `ADMIN_DUPLICATE_KEY` or `ADMIN_CONFLICT`;
  - attempted classification, ownership, or prohibited identity change → `ADMIN_IMMUTABLE_FIELD`;
  - invalid catalog, Unit, option, assignment, or organization reference → `ADMIN_INVALID_REFERENCE`;
  - invalid effective state, values, or reactivation → `ADMIN_INVALID_STATE` or `ADMIN_AGGREGATE_INCOMPLETE` with coded violations; and
  - excessive value cardinality → `ADMIN_INVALID_STATE` with bounded-limit context.

## Scope

### In scope

- Additive `catalogoAdmin.recursos` queries and mutations.
- Indexed cursor pagination for Resource summaries.
- Indexed full-text summary search with bound opaque cursors.
- Separate bounded direct detail including stored values.
- Optional compatibility-safe Resource sort metadata and indexes required by the admin reads.
- Shared summary projections, validators, structured error mapping, and effective-state annotations.
- Expected-revision concurrency and idempotent lifecycle semantics.
- Immutable Resource classification and organization ownership in the admin API.
- Atomic Resource/value/alias writes and bounded indexed duplicate checks.
- Current effective-catalog validation for create, update, and reactivation.
- Generated Convex contract fixture coverage for a portable React consumer.
- Regression coverage proving all existing public Resource APIs remain compatible.

### Out of scope

All non-goals above remain excluded even when adjacent implementation appears convenient. In particular, this proposal does not authorize Bandeja, XML, auth/roles/permissions, seed data, hard delete, UI work, or a replacement public API.

## Affected areas

| Area | Expected impact |
|---|---|
| `convex/catalogoAdmin/recursos.ts` | New additive Resource administration queries and commands. |
| `convex/catalogoAdmin/lib/*` | Reuse or narrowly extend completed validators, errors, pagination, revision, and effective-aggregate helpers. |
| `convex/schema.ts` | Add only optional compatibility-safe sort metadata and indexes needed for bounded list/search behavior. |
| Resource domain validation and identity modules | Reuse existing validation and deterministic identity behavior; extract shared seams only when necessary. |
| Resource value and alias persistence | Use existing indexed relationships inside atomic, bounded administrative operations. |
| Generated Convex API/types and contract fixtures | Expose and verify the portable React contract as derived output. |
| Tests | Add pure and `convex-test` coverage for pagination, detail bounds, writes, lifecycle, errors, and compatibility. |
| Existing public Resource module | No public contract change; regression verification only, except safe internal sharing that preserves behavior. |

## Dependencies

This change depends on the completed catalog administration stack and must build on, not fork, its established contracts:

- structured `ADMIN_*` errors and validators;
- opaque cursor envelopes, page-size bounds, and cursor/filter mismatch handling;
- expected-revision and `CREATED` / `UPDATED` / `UNCHANGED` result semantics;
- effective catalog resolution and bounded aggregate loading;
- aggregate violation vocabulary;
- generated static Convex contract exports and consumer typechecking; and
- indexed active-Resource checks used by catalog lifecycle blockers.

It also depends on existing Resource validation, deterministic identity derivation, Resource/value/alias tables, and their current indexes. Installed Convex search ordering behavior must be verified during implementation as stated above.

## Delivery strategy and canonical W0 + WU1–WU9 boundaries

Delivery is **stacked PRs to main**. Each child remains independently reviewable, targets the immediately preceding branch during review, and is ultimately merged to main in order. Tests and documentation stay with the behavior they verify. Authored additions plus deletions must remain at or below **400 lines per PR**; generated output is excluded from the authored count but remains part of complete verification. No `size:exception` is planned.

| Order | Tentative work unit | Forecast authored lines | Independent rollback boundary |
|---:|---|---:|---|
| 0 | Planning/runtime metadata evidence | 12 | Remove only planning evidence. |
| 1 | Optional metadata, compatibility projection, indexes, and resumable backfill | 190 | Remove only schema/backfill/projection changes. |
| 2 | Resource validators, projections, diagnostics, and structured mapping | 180 | Remove only Resource contract helpers/tests. |
| 3 | Indexed summary list with filters, plans, and bound cursors | 175 | Remove summary list exports/planner. |
| 4 | Convex 1.45.0 native full-text search and traversal proof | 190 | Remove search export/plan only. |
| 5 | Direct admin detail and bounded value loading | 145 | Remove admin detail/value loader only. |
| 6 | Atomic administrative create | 210 | Remove Resource admin create/persistence behavior. |
| 7 | Revision-first update and immutable boundaries | 240 | Remove Resource admin update behavior. |
| 8 | Lifecycle commands and effective-state integration | 170 | Remove lifecycle seam integration. |
| 9 | Generated contract fixture, regressions, and rollout documentation | 130 authored | Remove only contract/documentation additions.

The estimated authored total is approximately 1,642 lines across W0 and WU1–WU9, creating high single-PR budget risk but no over-budget work unit. W0 is planning/runtime evidence, not a product PR. Any unit forecast or actual diff that approaches 400 authored lines must be split by behavior before review.

## Verification direction

Implementation follows the repository's strict TDD convention: RED → GREEN → TRIANGULATE → REFACTOR. Each work unit carries its focused tests and rollback evidence.

Required coverage includes:

- pure tests for summary projection, immutable classification/ownership, identity scope, value limits, and effective/inert annotations;
- `convex-test` traversal of multi-page list and search results without duplicates or omissions;
- rejection of cursors reused across different search text, filters, lifecycle mode, or ordering version;
- proof that summary endpoints do not load Resource values and detail loads them once through a bounded index path;
- stale revision checked before no-op, blockers, and aggregate validation;
- atomic create/update rollback on invalid values, duplicate identities, alias conflicts, and value-write failures;
- duplicates detected across inactive as well as active Resources in global and organization scopes;
- lifecycle idempotence, deactivation preservation, and reactivation against current effective catalog state;
- structured `ConvexError.data` assertions for all administrative failure classes;
- repeated equal-relevance search traversal against installed Convex 1.45.0;
- unchanged signatures, returns, and protected scenarios for all existing public Resource APIs; and
- generated `api`, `FunctionArgs`, `FunctionReturnType`, IDs, page results, and `AdminErrorData` consumer fixtures.

Repository verification commands are:

- `pnpm exec vitest run`
- `pnpm typecheck`
- `pnpm typecheck:consumer`
- `pnpm exec convex codegen --typecheck enable`
- `pnpm exec convex dev --once` when a deployment is available; otherwise record `N/A — no deployment available`.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| New code copies the existing unbounded `.collect()` list/search pattern | Require index-backed cursor pagination and tests over multiple pages; reject unbounded in-memory sorting. |
| Summary reads reproduce the existing N+1 value-loading behavior | Define summaries as value-free and instrument/test that list and search never call the value loader. |
| Native full-text ordering gives unstable equal-relevance traversal | Bind ordering version into cursors and verify installed Convex behavior; if the proof fails, block the search work unit and require an explicit spec/design revision before implementation. |
| New admin behavior changes legacy public contracts | Keep the namespace additive and run all existing Resource tests plus generated signature/return fixtures. |
| Duplicate identity or alias races create partial aggregates | Perform bounded indexed checks and every Resource/value/alias write within one Convex transaction. |
| Catalog drift makes historical Resources unreadable | Allow detail reads of stored inert state while enforcing current effective rules only at create, update, and reactivation boundaries. |
| Classification or ownership changes orphan aliases or alter identity scope | Reject those changes with `ADMIN_IMMUTABLE_FIELD`; defer migrations to a separate proposal. |
| Value fan-out exceeds Convex limits | Enforce an explicit `MAX_RESOURCE_VALUES + 1` detail guard and return a coded error instead of truncation. |
| Stricter admin validation is mistaken for a migration of existing rows | Preserve stored rows and public behavior; apply new rules only when the additive admin commands mutate or reactivate a Resource. |
| The stacked change overwhelms review capacity | Keep WU1–WU9 under 400 authored lines each, keep W0 as planning evidence, and split any unit that grows before opening review. |

## Compatibility and migration impact

- The change is additive: no existing public Resource export is renamed, removed, or assigned a new validator or return shape.
- Existing Spanish public error messages remain unchanged.
- Existing Resource, value, and alias rows are preserved; there is no seed, destructive migration, hard delete, or automatic rewrite.
- Any new sort field is optional and introduced with compatibility-safe indexes. Reads must define behavior for rows not yet carrying derived metadata rather than requiring an unsafe immediate schema rewrite.
- Existing active/inactive state and revision values remain authoritative.
- Existing published catalog revisions and snapshots remain unchanged.
- React consumers opt into the new generated admin references; current consumers require no migration.

## Rollback direction

- Roll back one stacked work unit at a time using the boundaries above; do not revert unrelated completed catalog administration behavior.
- Remove or disable additive `catalogoAdmin.recursos` functions to stop new admin use while leaving all Resource data intact.
- Remove optional indexes or derived metadata only when Convex schema compatibility permits; retaining unused optional metadata is preferable to destructive data cleanup.
- Never roll back by deleting Resources, values, aliases, or published snapshots.
- If a compatibility regression appears, revert the affected additive admin unit or shared internal extraction while preserving the existing public exports and stored data.
- Atomic transactions mean failed commands need no compensating data repair; already successful admin writes remain valid Resource data if the API surface is rolled back.

## Measurable success criteria

- Every existing public Resource function remains generated with the same argument and return contracts, and all existing Resource regression tests pass.
- Listing 1,000 or more test Resources traverses bounded pages with no duplicates or omissions and without any table-wide `.collect()` in the new list path.
- Full-text search traverses repeated pages with no duplicates or omissions for fixed text, filters, and ordering version; cursor reuse with any changed binding is rejected.
- List and search execute zero Resource-value queries per returned summary; direct detail performs exactly one indexed value query and rejects `MAX_RESOURCE_VALUES + 1` rows without truncation.
- Create and update leave zero partial Resource/value/alias changes after every tested validation, duplicate, alias, and injected value-write failure.
- Duplicate identity checks reject both active and inactive collisions in the correct global or organization scope through bounded indexed reads.
- Every mutable command rejects a stale revision before no-op or business validation; same-state lifecycle commands return the established unchanged result only for a current revision.
- Attempts to change classification or organization ownership fail with `ADMIN_IMMUTABLE_FIELD` and preserve all stored fields and values.
- Create, update, and reactivation reject ineffective or invalid catalog configurations with structured coded violations, while detail still returns stored inert Resources for repair/history.
- Generated contract fixtures compile for a separate React consumer using Convex types without a hand-maintained DTO layer.
- `pnpm exec vitest run`, `pnpm typecheck`, `pnpm typecheck:consumer`, and Convex code generation complete successfully; deployment verification is recorded when available.
- Each stacked PR remains at or below 400 authored additions plus deletions, or is split before review with no size exception.

## Proposal question round

No proposal question round is pending. The delegated request explicitly confirms the scope, non-goals, product rules, delivery strategy, and that no unresolved product question exists. The installed Convex search-ordering point is retained solely as implementation verification and must not reopen the confirmed product scope.

## Decisions carried forward

The specification and design must preserve these settled constraints: an additive `catalogoAdmin.recursos` API; indexed cursor pagination and full-text summary search; separate bounded detail with values; structured errors; expected-revision concurrency; immutable classification and ownership; bounded ownership-aware duplicate checks; atomic Resource/value/alias writes; current effective validation for create, update, and reactivation; a portable generated React contract; and preservation of every existing public Resource API. Bandeja, XML, auth/roles/permissions, seed, hard delete, UI, and a replacement public API remain excluded.
