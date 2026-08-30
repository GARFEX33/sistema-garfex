# Pre-Proposal Decision Gate

## Status

- Change: `complete-catalog-administration`
- Artifact store: OpenSpec
- Exploration: complete (`explore.md`)
- Optional research: unselected because this runtime has no declared evidence grants; proposal does not depend on research.
- Product decisions: confirmed by the user
- Proposal readiness: ready

## Confirmed Context

- Development-first workflow with one trusted administrator.
- No seed, authentication, hard deletes, duplicated frontend validation, or manually maintained DTO contracts.
- Catalog identity keys and parent links are immutable after creation.
- Catalog records use active/inactive lifecycle and optimistic revisions.
- Hierarchical children and active resources block parent deactivation.
- Configuration remains stored but becomes inert under an inactive parent chain.
- Administrative lists paginate; direct details read by ID.
- Convex remains the authoritative business-validation and generated TypeScript contract boundary.

## Confirmed Product Decisions

1. Publication is explicit: the administrator edits drafts and invokes Publish when ready.
2. Incomplete configuration is stored as inactive drafts; activation and publication validate the complete aggregate.
3. Units, attributes, rules, compatibility, and presentation may be prepared under an inactive Family or Type; they remain inert until the parent chain and configuration are active.
4. Existing public queries and mutations remain compatible; the change adds a separate administrative API.

## Consequences

These decisions affect whether a UI can build a type incrementally, when errors surface, how immutable snapshots are produced, whether inactive catalog branches can be prepared safely, and whether existing consumers continue working while the administrative API is introduced.
