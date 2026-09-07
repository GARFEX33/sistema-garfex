# OpenSpec Sync Report

- **status:** pass
- **change:** `add-selection-only-resource-creation`
- **artifact store:** `openspec`
- **sync mode:** archive-time canonical sync, explicitly authorized by the delegated request to perform the project-standard sync/archive flow
- **workspace:** `/home/garfex/PROGRAMACION/sistema-garfex`
- **date:** 2026-09-07

## Status consumed

- Native dispatcher: `next: archive`
- Apply: `all_done`
- Verify: `all_done`
- Archive: `ready`
- Tasks: `50/50 complete`
- Action context: `repo-local`; workspace root and allowed edit root are the authoritative repository
- Store authority: authoritative file-backed `openspec`

## Canonical specs synced

- `openspec/specs/catalog-attributes/spec.md`
  - ADDED: `Capture-mode compatibility and migration`
  - ADDED: `Allowed-value ownership, lifecycle, and revision`
  - ADDED: `Allowed-value administrative reads and stable pagination`
  - ADDED: `Legacy-option to allowed-value migration`
- `openspec/specs/catalog-conditional-rules/spec.md`
  - MODIFIED: `Rule ownership and references`
  - ADDED: `Selection-only conditional predicate evaluation`
- `openspec/specs/catalog-publication/spec.md`
  - ADDED: `Allowed-value publication representation and completeness`
  - ADDED: `Allowed values participate in deterministic content identity`
- `openspec/specs/resource-admin-contracts/spec.md`
  - MODIFIED: `Scope exclusions`
  - ADDED: `Exact selection-only evaluation contract`
  - ADDED: `Evaluation validity, issue, and status semantics`
  - ADDED: `Deterministic selection evaluation, identity, and fingerprint`
- `openspec/specs/resource-admin-writes/spec.md`
  - ADDED: `Atomic selection-only Resource creation`
  - ADDED: `Exact selection-only creation disposition union`
  - ADDED: `No-write outcomes and legacy creator compatibility`

## Destructive merge guard

The two required MODIFIED requirement replacements were `Rule ownership and references` and `Scope exclusions`. Approximately 14 prior canonical lines were replaced; no unrelated canonical requirements were removed. The delegated request explicitly authorized canonical delta reconciliation as part of the sync/archive flow, so the required destructive-sync approval was recorded and applied.

## Validation

- All five delta domains were merged by exact requirement heading.
- Existing canonical requirements outside the named deltas were preserved.
- No active same-domain change was found.
- `git diff --check -- openspec/specs` passed.
- No implementation, generated Convex file, native review authority, or global configuration was changed.
