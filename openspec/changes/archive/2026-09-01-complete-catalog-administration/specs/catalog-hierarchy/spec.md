# Catalog Hierarchy Specification

## Purpose

Define administration and lifecycle behavior for Classes, Families, and Types without allowing unsafe re-parenting or draft leakage.

## Requirements

### Requirement: Hierarchy creation and immutable identity

Administrators MUST be able to create inactive or active Classes, Families, and Types. Class keys MUST be unique globally, Family keys MUST be unique within their Class, and Type keys MUST be unique within their Family. Keys and parent links MUST be immutable after creation. Names, descriptions, explicit ordering fields if present, and lifecycle state MAY be updated under optimistic revision rules.

An inactive child MAY be created beneath an inactive parent. Creating or activating an active child beneath an inactive parent MUST store it but leave it ineffective; activation of a parent MUST validate every active descendant that would become effective.

#### Scenario: Scoped duplicate is rejected

- GIVEN a Family key already exists in a Class
- WHEN another Family is created with that key in the same Class
- THEN the command fails with `ADMIN_DUPLICATE_KEY`
- AND no Family is created.

#### Scenario: Same key in another scope is allowed

- GIVEN a Family key exists in one Class
- WHEN an otherwise valid Family with the same key is created in another Class
- THEN creation succeeds at revision 1.

#### Scenario: Re-parenting is rejected

- GIVEN an existing Type belongs to one Family
- WHEN an update attempts to change its Family ID
- THEN the command fails with `ADMIN_IMMUTABLE_FIELD`
- AND the Type remains under its original Family.

### Requirement: Hierarchy activation validates newly effective descendants

Activating a Class MUST validate all active Families and Types that would become effective. Activating a Family MUST require its Class to exist and validate all active Types that would become effective. Activating a Type MUST validate the complete effective Type aggregate, including units, attributes, rules, presentation, and compatibility. Any failure MUST leave the entire hierarchy state unchanged.

#### Scenario: Type activation rejects incomplete aggregate

- GIVEN an inactive Type has no valid principal unit or active canonical presentation
- WHEN activation is requested with its current revision
- THEN the command fails with `ADMIN_AGGREGATE_INCOMPLETE`
- AND the Type remains inactive.

#### Scenario: Parent activation is atomic

- GIVEN an inactive Class has two active stored descendant Types
- AND one descendant aggregate is invalid
- WHEN the Class is activated
- THEN activation fails with coded violation context identifying the invalid descendant
- AND the Class and all descendants retain their prior states.

### Requirement: Exact hierarchy deactivation blockers

A hierarchy deactivation that would change state MUST apply this blocker matrix transactionally:

| Target | Blocking active hierarchy | Blocking active resources |
|---|---|---|
| Class | Any active Family or Type in its subtree | Any active resource whose Type is in the subtree |
| Family | Any active Type in the Family | Any active resource whose Type is in the Family |
| Type | None | Any active resource of the Type |

Only stored records whose own lifecycle state is active count as hierarchy blockers, even if currently inert under another inactive ancestor. Inactive descendants, configuration records, and inactive resources MUST NOT block hierarchy deactivation. Configuration under a successfully deactivated branch MUST remain stored and become inert; it MUST NOT be cascaded, rewritten, or deleted.

#### Scenario: Active child blocks parent deactivation

- GIVEN an active Family contains an active Type
- WHEN the Family is deactivated with its current revision
- THEN the command fails with `ADMIN_DEPENDENCY_BLOCKED`
- AND context identifies the active Type relation.

#### Scenario: Active resource blocks Type deactivation

- GIVEN an active resource belongs to an active Type
- WHEN the Type is deactivated
- THEN the command fails with `ADMIN_DEPENDENCY_BLOCKED`
- AND neither the resource nor Type is changed.

#### Scenario: Inactive descendants do not block

- GIVEN an active Family has only inactive Types and inactive resources
- WHEN the Family is deactivated with its current revision
- THEN deactivation succeeds
- AND descendant and configuration records remain stored unchanged.

#### Scenario: Same-state deactivation bypasses blockers after revision check

- GIVEN an already inactive Family has a stored active Type
- WHEN deactivation is requested with the Family's current revision
- THEN the command succeeds as a no-op
- AND no descendant is changed.

### Requirement: Hierarchy administrative reads

Admin APIs MUST provide direct details and paginated lists for all three hierarchy levels. Classes MUST order by key then ID; Families by Class, key, then ID; Types by Family, key, then ID, all ascending by Unicode code-point order for keys. Family lists MUST support a Class filter and Type lists MUST support a Family filter. Returned records MUST expose stored active state, revision, immutable parent IDs, and computed effectiveness.

#### Scenario: Inactive branch remains inspectable

- GIVEN a Type is stored beneath an inactive Family
- WHEN the Type detail is requested by ID
- THEN the detail includes the Type and Family identifiers
- AND reports the Type as ineffective regardless of its own active flag.

#### Scenario: Family filter is stable across pages

- GIVEN more matching Types than fit one page
- WHEN all pages are traversed with one Family filter
- THEN only Types of that Family are returned
- AND each is returned once in key/ID order.

## Acceptance Criteria

- Classes, Families, and Types support create, detail, paginated list, mutable-field update, activate, and deactivate behavior.
- Key scopes and immutable parent links are enforced.
- Type and parent activation validates every aggregate made effective.
- The blocker matrix distinguishes active descendants/resources from inactive rows and inert configuration.
- Deactivation never cascades or deletes stored descendants.
