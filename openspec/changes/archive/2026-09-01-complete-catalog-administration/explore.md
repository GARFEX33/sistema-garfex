# Exploration: complete-catalog-administration

## Executive finding

The repository contains a substantial catalog domain model and a first public Convex slice, but not a complete administration API. The schema already represents nearly all requested concepts; the missing work is primarily authoritative admin commands/reads, lifecycle invariants, structured errors, pagination, and contract cleanup. The existing published-snapshot compiler is the main downstream dependency: admin mutations must preserve its effective-catalog assumptions or deliberately allow stored-but-inert configuration.

CodeGraph was checked as present (`.codegraph/`), but no CodeGraph MCP/CLI execution surface was available in this executor; structural inspection therefore fell back to targeted filesystem reads after that check.

## Current implementation map

| Area | Current capability | Gap for this change |
|---|---|---|
| Hierarchy | `clasesRecurso`, `familiasRecurso`, `tiposRecurso`; create mutations enforce active parents and scoped key uniqueness; active-only cascading reads exist | No admin update, activate/deactivate commands, direct details, all-state admin lists, pagination, child/resource blocking, or idempotent lifecycle commands. Parent/key immutability is not yet represented by an update API. |
| Units | `unidades` and `politicasUnidadRecurso`; family/type override resolution and principal-unit compilation exist | No admin mutation/read lifecycle for units or policies; no explicit invariant for effective principal count at administration time; existing valid-unit query is a full collect and is not an admin list. |
| Attributes | Definitions, family/type assignments, applicability, identity flag, order, optional definition unit, and options are stored; public effective-attribute read applies type precedence | No updates/lifecycle commands or complete admin reads for definitions, assignments, options, applicability, identity, or order. No explicit cross-entity validation command surface. |
| Conditional validation | `reglasAtributoRecurso` is stored; public `obtenerReglasValidacion` returns active joined rules; pure resource validation evaluates rules | No admin create/update/deactivate/read lifecycle. The domain validator has edge risks worth resolving in design: conditional state is initialized as optional, rule application is keyed by definition id, and required checks use truthiness (`!valor`), which can mishandle valid false/zero values. |
| Canonical presentation | Stored per-type token policy; compiler requires exactly one active policy, validates effective attributes and structural tokens; pure renderer is tested | No admin CRUD/lifecycle/read API. Schema token references use attribute IDs while published output uses keys; policy validation and replacement semantics remain unspecified. |
| Option compatibility | Policy and relation tables exist; pure evaluator handles allowlists, denylists, directional/symmetric scope; compiler validates active relations and endpoint membership | No admin API for policy/relation lifecycle or reads; uniqueness, pair replacement, endpoint/type consistency, inactive-parent behavior, and relation deletion semantics are unresolved. |
| Published catalog | Internal organization setup/publication, immutable revision rows, deterministic canonical hash, and snapshot reads exist; changes produce new revisions and old snapshots remain readable | Publication is internal, not an admin contract. Admin change-to-publication workflow, stale/inert configuration behavior, invalid draft handling, and whether publication is explicit or automatic need specification. Compiler currently skips inactive hierarchy branches but fails on some incomplete active configurations. |
| Resources | Public create/update/read/list/search and active/inactive resource lifecycle exist; resource validation and identity aliases are tested | Resource lists are unpaginated; existing resource lifecycle is non-idempotent for same-state commands and uses plain errors. Admin catalog deactivation must block when active descendants/resources exist, while resource detail/history must remain readable. |
| Portable Convex contract | Generated `api`/`dataModel` types are already used by tests; registered functions use object syntax and validators | No dedicated admin namespace/contract. Existing result shapes are duplicated manually across modules and some names expose consumer-oriented rather than admin-oriented projections. The new design should use generated Convex references/types as the UI contract, not a parallel DTO package or duplicated business validation. |

## Schema and domain evidence

`convex/schema.ts` already includes: hierarchy tables, units and unit policies, attribute definitions/assignments/options, canonical presentation policies, compatibility policies/relations, conditional rules, resources, identity aliases, and published revisions/snapshots. All catalog rows use `activo` plus `revision`; hierarchy/configuration parent references are mutable at the storage level because no admin update command currently mediates them.

`convex/catalogoRecursos/catalogo.ts` currently exposes create mutations and active-only queries. It relies on `Error` messages such as “Clave ... duplicada”, “... inexistente o inactiva”, and “... ya activo/inactivo”; these are not structured application error codes. Reads use `.collect()` and then filter in memory, which conflicts with the confirmed paginated admin-list requirement (and the Convex skill’s unbounded-read guidance).

`convex/catalogoRecursos/catalogoPublicado.ts` is the strongest downstream contract. It resolves family overrides before type overrides, requires exactly one effective active principal unit, emits effective attributes/rules/compatibility, requires exactly one active presentation policy, and persists immutable snapshots. It also has unbounded reads and plain errors, but those are publication internals rather than an admin UI contract unless publication is promoted.

`convex/catalogoRecursos/recursos.ts` demonstrates the existing resource transaction patterns and optimistic revision checks, but its lifecycle rejects same-state commands instead of making them idempotent. `validacionRecurso.ts` adapts the pure domain validator and maps domain codes to human messages, so it is a useful seam for preserving one backend validation authority rather than duplicating rules in React.

The pure domain modules have focused tests for resource validation, identity, canonical presentation, compatibility, and publication canonicalization. They do not define the complete admin command semantics.

## Confirmed decisions incorporated

- Dev-first, one trusted administrator; authentication/authorization is out of scope.
- No seed data and no hard delete; lifecycle is active/inactive.
- Parent references and identity keys are immutable after creation.
- Deactivation is blocked when active hierarchical children or active resources make it unsafe.
- Stored configuration remains present but inert while its parent chain is inactive.
- Same-state lifecycle commands are idempotent after revision validation.
- Admin lists paginate; admin details are direct reads.
- Backend owns definitions and command validation; React renders definitions and submits commands.
- Generated Convex references/types are the contract; no manual DTO duplication.
- Structured application error codes are required.
- The hierarchy design target approved at Judgment Day is `3bdce248a5ce37ae218b4ae9d2e24cc07531f006002726c9809554583fe8386a`.

## Decisions still needing proposal/spec resolution

1. **Admin surface shape:** one `catalogAdmin` module versus focused modules per aggregate; exact public versus internal exposure for the trusted admin UI.
2. **List semantics:** cursor/page-size validator and stable ordering for every aggregate; whether inactive rows are included by default and how parent filters behave.
3. **Revision semantics:** which create/update/lifecycle commands require `revisionEsperada`; whether all successful mutations return the full changed document or a compact generated type; exact stale-revision code and payload.
4. **Deactivation blockers:** precise graph rules for class→family→type, type/family configuration, and resources; whether inactive child rows count as blockers; whether a type with active resources can be deactivated independently of its family.
5. **Configuration inertness:** whether admin reads show stored configuration under inactive parents, and whether writes are allowed while inactive or only preserved without effect.
6. **Effective precedence:** duplicate assignment handling, override behavior, ordering ties, and whether a type assignment can intentionally neutralize a family assignment.
7. **Validation rule model:** allowed condition/affected attribute types, option ownership, conflicting rules, cycles, and whether rules may target forbidden/not-applicable attributes.
8. **Presentation policy:** replace-versus-edit semantics, token constraints, exactly-one active policy invariant during editing, and whether drafts are allowed before publication.
9. **Compatibility relations:** pair uniqueness, policy endpoint restrictions, symmetric storage normalization, allowlist/denylist conflict behavior, and lifecycle behavior when an option or endpoint is inactive.
10. **Publication boundary:** explicit admin “publish” command versus a separate future workflow; whether an invalid active configuration blocks all publication or only the affected type; what organization scope means while admin data is currently global.
11. **Error contract:** stable code names, safe public messages, optional structured fields (entity/id/revision), and mapping of Convex function errors for React consumers.
12. **Naming/versioning:** whether admin APIs are a new namespace and whether current public resource/catalog functions are preserved for compatibility or migrated within this change.

## Likely change surfaces

- `convex/schema.ts`: likely additional indexes for paginated/stable admin reads and uniqueness checks; avoid schema changes that make existing populated tables unsafe.
- `convex/catalogoRecursos/catalogo.ts`: substantial extraction or replacement into admin commands/queries, including all aggregate lifecycles and joined detail reads.
- New focused Convex modules are likely preferable for presentation, compatibility, and rules to keep the contract reviewable; they must share validators/error helpers rather than duplicate business logic.
- `convex/catalogoRecursos/catalogoPublicado.ts`: adapt compiler reads/invariants only where admin lifecycle/inertness decisions require it; preserve immutable snapshots.
- `convex/catalogoRecursos/recursos.ts` and `validacionRecurso.ts`: align resource lifecycle error/idempotency behavior and enforce catalog deactivation blockers without moving validation into the UI.
- `convex/_generated/*`: generated files are contract output and should be regenerated by the implementation workflow, never manually authored.
- Tests: extend Convex in-memory tests for every command/error path and focused domain tests for newly settled policy semantics.

## Testing capability and config assessment

The repository has Vitest 4, `convex-test`, `vitest.config.ts` using `edge-runtime`, and `pnpm typecheck` (`tsc --noEmit`). Existing Convex tests use `convexTest(schema, modules)` and cover happy paths, validation failures, snapshots, and aliases. There is no configured unit/integration/e2e command in OpenSpec despite real unit/domain and Convex integration-style tests being present.

`openspec/config.yaml` is stale or incomplete: it says no reliable runner, no tests, and blank typecheck/test commands, while `package.json` and `vitest.config.ts` clearly provide `pnpm typecheck` and a Vitest runner. Before tasks are finalized, update the OpenSpec testing context or explicitly record the commands in the change artifacts. Expected verification candidates are `pnpm typecheck` and `pnpm vitest run` (not executed during this read-only exploration).

## Review-budget risk

This is high risk for the 400 authored-line budget. The roadmap spans at least six aggregate families plus cross-cutting errors, pagination, indexes, lifecycle invariants, generated contract changes, and tests. A single PR would likely exceed budget and be hard to review. Plan work-unit slices around behavior (for example hierarchy/lifecycle; units; attributes/options; rules/presentation; compatibility; publication integration; contract/tests), keeping tests with each slice. The confirmed no-auth/no-seed scope reduces risk, but does not make the API and invariant surface small.

## Recommendation for next phase

Proceed to proposal/design, not implementation. First lock the aggregate command/read contract, error-code taxonomy, inertness/blocking matrix, and publication boundary. Then derive a phased task plan with pagination/index decisions and a review-workload forecast. The design should preserve one server-side validation path and expose only generated Convex types to the separate React UI.
