# Resource Administration Reads Specification

## Purpose

Define bounded administrative browsing, full-text search, and direct inspection of Resources without changing legacy Resource reads.

## Requirements

### Requirement: Value-free paginated summaries

The Resource administration API MUST provide cursor-paginated summary lists containing only Resource ID, derived technical identity, name, Type reference, Unit reference, optional organization reference, active state, revision, and stored/effective or inert classification status. Summaries MUST NOT contain or load Resource value rows.

Listing MUST use deterministic indexed traversal with a bounded page size. It MUST support lifecycle filtering (`ALL`, `ACTIVE`, or `INACTIVE`) and bounded index-backed filters for Type, Unit, and organization ownership. Omitting lifecycle mode MUST behave as `ALL`. A page MUST return items, an opaque continuation cursor or null, and an exhaustion indicator.

The cursor MUST bind the native cursor, normalized filters, lifecycle mode, and an explicit order-version token. Reusing it with any different binding MUST fail with `ADMIN_INVALID_ARGUMENT`. A non-integer or out-of-range page size MUST fail with `ADMIN_INVALID_ARGUMENT`. For an unchanged dataset and one binding, complete traversal MUST return every matching Resource exactly once without duplicates or omissions.

#### Scenario: Summary traversal is bounded and deterministic

- GIVEN more matching Resources than fit in one valid page
- WHEN all pages are traversed with unchanged filters and order version
- THEN every matching Resource is returned exactly once
- AND each page respects the requested bounded page size
- AND no Resource value row is loaded.

#### Scenario: Cursor mismatch is rejected

- GIVEN a cursor issued for one lifecycle mode, filter set, and order version
- WHEN it is reused after any bound value changes
- THEN the read fails with `ADMIN_INVALID_ARGUMENT`.

#### Scenario: Invalid page size is rejected

- GIVEN a page size is non-integer, zero, negative, or above the documented maximum
- WHEN a Resource summary page is requested
- THEN the read fails with `ADMIN_INVALID_ARGUMENT`
- AND no unbounded fallback page is produced.

#### Scenario: Summary reads avoid N plus one value loading

- GIVEN a summary page contains multiple Resources with stored values
- WHEN the page is listed
- THEN the response contains no values
- AND the read performs zero per-Resource value loads.

### Requirement: Bounded full-text summary search

The Resource administration API MUST provide cursor-paginated full-text search over an indexed Resource search field and return the same value-free summary shape. Search MUST apply its documented lifecycle and Resource filters through bounded indexed behavior and MUST NOT materialize the complete matching set with `.collect()` or unbounded in-memory sorting.

Search MUST use Convex 1.45.0 native indexed relevance traversal. Its order MUST be documented as the installed Convex full-text search order; it MUST NOT be represented as lexical name or technical-identity order. Before search becomes an implementation dependency, a focused gate MUST prove unchanged-data traversal with repeated equal-relevance results, no skips, and no duplicates. If that proof fails, search MUST be blocked pending an explicit design/specification revision; no technical-identity/adminSortId fallback, collection, or silent in-memory sorting is allowed. The opaque cursor MUST bind normalized search text, filters, lifecycle mode, the native cursor, and an explicit search order-version token. For an unchanged dataset and one binding, traversal MUST be stable and return every matching Resource exactly once without duplicates or omissions.

#### Scenario: Search traverses one unchanged result set

- GIVEN an unchanged set of Resources matching fixed text and filters
- WHEN all search pages are traversed using the returned cursors
- THEN every matching Resource is returned exactly once without duplicates or omissions
- AND results follow the documented installed search order rather than a claimed lexical order.

#### Scenario: Search cursor cannot cross queries

- GIVEN a cursor issued for one search text, filter set, lifecycle mode, and search order version
- WHEN it is reused with different text or any different binding
- THEN the search fails with `ADMIN_INVALID_ARGUMENT`.

#### Scenario: Search does not load values or collect all matches

- GIVEN many matching Resources each have stored values
- WHEN one bounded search page is requested
- THEN only value-free summaries are returned
- AND no per-Resource value load occurs
- AND the complete matching result set is not collected in memory.

### Requirement: Bounded direct Resource detail

The Resource administration API MUST provide direct detail lookup by Resource ID without scanning a collection. A found detail MUST return the stored Resource fields, stored classification and ownership references, all stored values within the supported bound, and diagnostics distinguishing stored lifecycle state from current effective or inert catalog state. A missing Resource detail MUST return null.

Values MUST be loaded exactly once through the Resource value index with a `MAX_RESOURCE_VALUES + 1` guard or an equivalent explicit bound. If stored cardinality exceeds the supported maximum, the read MUST fail with `ADMIN_INVALID_STATE`, include safe limit context, and MUST NOT truncate values. Inactive or currently ineffective catalog references MUST NOT make a stored Resource uninspectable.

#### Scenario: Detail performs one bounded indexed value load

- GIVEN a Resource has no more than the supported number of stored values
- WHEN its administrative detail is requested
- THEN the Resource and every stored value are returned
- AND values are obtained through exactly one bounded indexed load.

#### Scenario: Too many value rows fail without truncation

- GIVEN a Resource has more than `MAX_RESOURCE_VALUES` stored value rows
- WHEN its administrative detail is requested
- THEN the read fails with `ADMIN_INVALID_STATE`
- AND context identifies the bounded-value limit
- AND no truncated detail is returned.

#### Scenario: Inactive catalog remains diagnosable

- GIVEN a stored Resource references a catalog branch or configuration that is now inactive or ineffective
- WHEN its administrative detail is requested
- THEN the detail is returned with all bounded stored values
- AND diagnostics identify the stored and effective or inert states.

#### Scenario: Missing Resource detail is explicit

- GIVEN a well-formed Resource ID identifies no stored Resource
- WHEN administrative detail is requested
- THEN the result is null.

## Acceptance Criteria

- List and search return bounded value-free pages and perform no N plus one value loading.
- Cursor bindings reject changed query controls, and unchanged traversal has no duplicates or omissions.
- Full-text search uses documented Convex search order without claiming lexical relevance order or collecting all matches.
- Direct detail performs one bounded indexed value load, reports stored/effective diagnostics, and never truncates excessive values.
