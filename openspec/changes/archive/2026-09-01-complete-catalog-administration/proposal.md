# Complete catalog administration with explicit publication

## Intent

Add a complete, backend-authoritative administration surface for the resource catalog while preserving every existing public consumer function. A trusted administrator must be able to prepare inactive catalog drafts across the full domain, validate and activate complete aggregates, and explicitly publish immutable catalog revisions for separate React consumers through Convex's generated TypeScript API.

This change closes the gap between the repository's broad catalog schema and its currently narrow public Convex surface. It turns the existing model and snapshot compiler into an operable catalog lifecycle without moving business rules into the frontend or introducing a parallel DTO contract.

## Problem statement

The repository already stores hierarchy, units, attributes, rules, presentation, compatibility, resources, and published snapshots, but most catalog concepts cannot be administered through a coherent API. Existing catalog functions cover only an initial slice, use plain error strings, expose active-only or unpaginated reads, and do not define complete draft, activation, deactivation, concurrency, or publication behavior.

As a result:

- catalog configuration cannot be prepared and reviewed incrementally through an admin client;
- incomplete data has no safe, explicit draft lifecycle;
- aggregate completeness is enforced inconsistently or only inside publication internals;
- stale writes and lifecycle failures cannot be handled reliably by a React client;
- administrative reads do not scale predictably;
- expanding the current public API directly would risk existing consumers; and
- the immutable snapshot compiler exists, but publication is not an explicit administrative product operation.

## Goals

1. Provide a separate generated Convex admin API for every catalog aggregate in the approved roadmap.
2. Allow incomplete configuration to be stored as inactive drafts, including beneath inactive hierarchy branches.
3. Keep drafts inert until both their parent chain and their own lifecycle state make them effective.
4. Validate aggregate completeness when configuration is activated and again when a catalog is published.
5. Make publication an explicit command that creates a deterministic, immutable catalog revision/snapshot.
6. Preserve existing public functions and extend behavior without breaking current consumers.
7. Standardize optimistic concurrency, idempotent lifecycle commands, structured error codes, direct detail reads, and paginated lists.
8. Keep Convex as the sole authority for business validation and generated client contracts.
9. Deliver the roadmap as reviewable behavior slices that remain within the 400-authored-line review budget per PR.

## Non-goals

- Authentication, authorization, roles, or multi-administrator policy.
- Seed or fixture data as a product capability.
- Hard deletion of catalog records or published revisions.
- A React administration interface.
- Frontend-owned or manually duplicated business validation.
- A manually maintained DTO, SDK, or parallel API-contract package.
- Replacing existing public resource or catalog functions.
- Automatically publishing after each administrative mutation.
- Rewriting immutable historical snapshots after publication.
- Solving unrelated resource-list pagination unless required by a catalog-administration invariant.

## Product model and business rules

### Draft and effective state

- Incomplete configurations are stored only as inactive drafts.
- Draft configuration may be created and edited under an inactive Family or Type.
- A configuration is effective only when it is active and every required parent in its hierarchy is active.
- Configuration beneath an inactive parent remains stored and visible to admin reads but is inert for public behavior and publication output.
- Activating a configuration validates the complete aggregate relevant to that configuration.
- Publishing validates the complete effective catalog; invalid active configuration prevents publication rather than producing a partial or misleading snapshot.

### Identity and hierarchy

- Catalog keys and parent links are immutable after creation.
- Updates may change only explicitly mutable descriptive, ordering, policy, or lifecycle fields.
- Deactivation is blocked by active hierarchical children and by active resources whose validity depends on the target branch.
- Inactive descendants and inert draft configuration do not by themselves block deactivation.
- Same-state activation or deactivation is idempotent after the optimistic revision check succeeds.
- No administrative command performs a hard delete.

### Concurrency and errors

- Mutable commands use optimistic revision checks through an expected revision supplied by the caller.
- A stale expected revision fails without applying partial changes.
- Administrative failures expose stable structured application error codes with safe context suitable for programmatic React handling.
- Error details may identify the entity, conflicting key, blocking relation, or current revision, but must not make human message text the machine contract.
- Exact code names and payload validators will be fixed in the specification/design while preserving these semantics.

### Reads and contracts

- Administrative collection reads are cursor-paginated with stable indexed ordering and explicit filters.
- Administrative detail reads address a record directly by ID and may expose stored inactive/inert state needed for editing.
- Existing consumer reads retain their current compatibility behavior.
- Convex registered functions and generated `api`/`dataModel` types are the portable contract for the separate React application.
- Shared validators and server-side domain logic prevent contract and validation duplication across modules.

### Publication

- Publication occurs only through an explicit admin command.
- A successful publication compiles the effective catalog and creates a new immutable revision/snapshot with deterministic canonical identity.
- Publishing unchanged canonical content must follow a deterministic, documented result rather than silently mutating an existing snapshot; exact no-op response semantics are deferred to design.
- Previously published revisions remain directly readable and unchanged.
- Failed validation creates no revision and leaves drafts untouched.

## Proposed capabilities

### 1. Hierarchy administration

Create, inspect, paginate, update mutable fields, activate, and deactivate Classes, Families, and Types. Enforce scoped key uniqueness, immutable keys/parents, optimistic revisions, active-child/resource blockers, and inert subtree behavior.

### 2. Unit and unit-policy administration

Manage Units and Family/Type unit policies, including principal-unit and override semantics. Support inactive drafts and validate that each effective aggregate resolves to the required valid principal-unit configuration before activation/publication.

### 3. Attribute administration

Manage attribute definitions, Family/Type assignments, options, applicability, identity participation, ordering, and unit references. Preserve effective precedence while preventing invalid ownership, duplicate, or cross-aggregate references.

### 4. Conditional-rule administration

Manage conditional attribute rules as inactive drafts or active rules. Validate condition and target compatibility, option ownership, conflicting rule combinations, and runtime-safe required-value semantics before rules become effective.

### 5. Canonical-presentation administration

Manage per-Type canonical presentation policies and token sequences. Validate references against effective attributes and ensure the effective policy required by publication is complete without forcing incomplete drafts to be active.

### 6. Compatibility administration

Manage compatibility policies and option relations, including directional or symmetric semantics and allowlist/denylist behavior. Validate endpoints, option membership, relation uniqueness, and inactive-parent effects.

### 7. Explicit publication and revision reads

Expose an administrative publish command over the existing compiler and immutable snapshot storage. Validate the aggregate, create deterministic immutable revisions, and expose paginated revision history plus direct snapshot/revision reads without changing historical data.

### 8. Portable generated admin contract

Expose the capabilities through a separate admin namespace or focused admin modules, all using Convex validators, generated references/types, indexed pagination, shared structured errors, and shared backend business rules. Exact module boundaries are a design decision, not a product constraint.

## Scope

### In scope

- Schema indexes and optional compatibility-safe schema evolution needed for stable admin reads and constraints.
- Separate admin commands and queries for hierarchy, units/policies, attributes/assignments/options, presentation, conditional rules, compatibility, and publication.
- Aggregate activation/publication validation and stored-but-inert draft behavior.
- Optimistic revision enforcement and idempotent lifecycle behavior.
- Structured admin error contract.
- Immutable key and parent-link enforcement at command boundaries.
- Active descendant/resource blockers for hierarchy deactivation.
- Generated Convex API/type regeneration through the normal toolchain.
- Convex in-memory and pure-domain tests for behavior and failure paths.
- Compatibility adjustments to publication/resource seams only where required by the new invariants.

### Out of scope

The non-goals above remain excluded even when adjacent implementation would be convenient. In particular, this proposal does not authorize auth, seed data, hard deletes, UI business rules, or a replacement public API.

## Affected areas

| Area | Expected impact |
|---|---|
| `convex/schema.ts` | Add indexes and only compatibility-safe fields needed for pagination, lookup, and lifecycle constraints. |
| Existing catalog module | Preserve public behavior; extract or share validation where needed rather than breaking exports. |
| New admin modules | Add focused public admin commands/queries with shared validators and errors. |
| Published-catalog compiler | Promote publication through an admin boundary and align inertness/completeness checks while preserving immutable output. |
| Resource functions | Participate in hierarchy deactivation blocker checks; otherwise retain existing public contracts. |
| Pure domain modules | Clarify effective precedence, rule, presentation, and compatibility validation where aggregate activation needs reusable logic. |
| Generated Convex files | Regenerated contract output only; never manually authored. |
| Tests | Add deterministic `convex-test` and pure-domain coverage for commands, concurrency, blockers, inertness, validation, and snapshots. |
| Separate React consumer | Gains a generated, structured admin contract; no frontend implementation is included. |

## Migration and compatibility direction

1. Add indexes and any new fields using Convex-safe evolution; do not add required fields directly to populated tables.
2. Introduce the admin API alongside existing public functions rather than renaming or removing them.
3. Treat existing rows according to their current `activo` and `revision` values; do not seed, hard-delete, or silently publish them.
4. Preserve existing published revisions and canonical snapshot readability exactly.
5. Apply stricter completeness checks at activation/publication boundaries, not as a destructive migration of inactive stored configuration.
6. If existing active data violates newly explicit aggregate rules, surface it as an activation/publication validation failure and provide an administrative correction path; do not rewrite it automatically.
7. Regenerate Convex types as derived output so React can consume the added API without a hand-maintained contract.

## Phased delivery intent

This roadmap is intentionally split into independently reviewable behavior slices. Each implementation slice includes its own tests, generated-contract effects, verification evidence, and rollback boundary. If a slice approaches 400 authored additions plus deletions, it is split again before review rather than accepted as one oversized PR.

1. **Admin foundation:** shared structured errors, revision semantics, pagination conventions, and required indexes.
2. **Hierarchy lifecycle:** complete Class/Family/Type administration and deactivation blockers.
3. **Units and policies:** draft/effective unit configuration and principal-unit validation.
4. **Attributes and options:** definitions, assignments, precedence, options, identity, applicability, and ordering.
5. **Rules and presentation:** conditional validation plus canonical presentation drafts and activation checks.
6. **Compatibility:** policies, relations, endpoint validation, and effective-state behavior.
7. **Publication:** explicit publish command, immutable revision history, aggregate validation, and unchanged-snapshot semantics.
8. **Contract hardening:** end-to-end generated API checks, compatibility regression coverage, and documentation for the separate React consumer.

The specification and design may subdivide these phases further. They must not combine unrelated file-type work or separate tests from the behavior they verify.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| New lifecycle rules accidentally change existing consumer behavior | Add the admin surface alongside existing exports and run compatibility regression tests for public functions. |
| Inactive drafts leak into effective catalog behavior | Centralize effective-state resolution and test inactive parent/configuration combinations through public reads and publication. |
| Aggregate rules differ between activation, publication, and resource validation | Reuse pure/server validation seams and make publication the final aggregate validation boundary. |
| Concurrent admin edits overwrite each other | Require expected revisions on mutable commands and return a stable stale-revision error. |
| Deactivation leaves active resources or hierarchy in an invalid state | Evaluate blockers transactionally with indexed reads before changing lifecycle state. |
| Unbounded reads exceed Convex limits | Require cursor pagination and indexed ordering for admin lists; avoid table-wide `.collect()` paths. |
| Structured errors become coupled to prose | Treat stable codes and validated metadata as the machine contract; messages remain presentation aids. |
| Existing active data fails stricter rules | Avoid destructive migration; expose correction through admin reads/commands and block only activation/publication that would produce invalid effective state. |
| Snapshot semantics regress | Keep revisions immutable and extend deterministic canonicalization tests before exposing publication. |
| Roadmap overwhelms review capacity | Deliver behavior-based chained slices under the 400-authored-line budget, with tests and rollback in each slice. |

## Rollback direction

- Roll back one delivery slice at a time by removing its new admin functions, indexes/optional fields when safe, and tests without reverting unrelated public behavior.
- Disable or remove the new admin publish entry point to stop new publications while leaving all immutable historical revisions readable.
- Preserve stored catalog rows during rollback; no rollback step hard-deletes administrator data.
- Never roll back by mutating or deleting already published snapshots.
- If a compatibility issue appears, retain generated/public consumer exports and revert only the additive admin behavior or the stricter boundary validation responsible for the issue.
- Detailed file-level rollback boundaries belong to the task plan for each work unit.

## Success criteria

- A trusted admin client can create and manage every roadmap aggregate through generated Convex references and types.
- Incomplete configuration can be saved as inactive drafts, including under inactive hierarchy, without affecting public behavior or published output.
- Activation rejects incomplete or inconsistent aggregates with stable structured error codes and no partial writes.
- Parent links and identity keys cannot be changed after creation.
- Mutable commands reject stale revisions; same-state lifecycle commands succeed idempotently after revision validation.
- Unsafe hierarchy deactivation is blocked when active descendants or active resources depend on it.
- Every admin list is cursor-paginated with stable indexed ordering, and every detail is directly readable by ID.
- Explicit publication rejects invalid effective catalogs and creates deterministic immutable snapshots for valid catalogs.
- Existing public functions and historical snapshot reads remain compatible.
- Business validation remains in Convex/shared domain code, with no manually duplicated DTO or frontend validation contract.
- Deterministic tests cover happy paths, stale revisions, structured failures, lifecycle blockers, inert drafts, aggregate completeness, and publication immutability.
- Each implementation PR stays within the 400-authored-line review budget or is split into a documented chained slice before review.

## Proposal decisions carried forward

The following are settled constraints for specification and design: explicit publication, immutable snapshots, inactive incomplete drafts, inert configuration beneath inactive hierarchy, completeness checks at activation/publication, a separate additive admin API, immutable keys/parents, optimistic revisions, structured errors, paginated admin reads, and the stated exclusions.

The remaining work is technical specification and design: exact function/module names, validators, stable error-code taxonomy, pagination ordering/filter contracts, precedence/conflict matrices, and unchanged-publication response semantics. Those decisions must refine—not reopen—the product constraints in this proposal.
