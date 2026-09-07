# Delta for Resource Administration Contracts and Compatibility

## ADDED Requirements

### Requirement: Exact selection-only evaluation contract

The generated public query `evaluarCreacionDesdeSelecciones` MUST accept exactly this shared evaluation input: `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, and `ownership`. Each member of `selecciones` MUST contain exactly `asignacionAtributoId` and `valorPermitidoId`. The query MUST NOT accept a caller-supplied `nombre`, `descripcion`, primitive text/number/boolean value, manual identity, suspended-selection state, or a legacy option ID.

The backend MUST validate the supplied Class → Family → Type hierarchy, Unit, effective-unit policy, and `ownership` scope. It MUST NOT infer or trust hierarchy/scope merely because the IDs were supplied. `ownership` MUST be resolved only by one explicit backend-validated ownership-to-catalog rule; consumers MUST NOT provide catalog content or a resolved catalog identity in its place.

The query MUST return one `CreationEvaluation` whose top-level field set is exactly `status`, `valid`, `catalogFingerprint`, `nombre`, `identificadorTecnico`, `asignaciones`, `faltantesRequeridos`, `seleccionesInvalidas`, `valoresNormalizados`, and `issues`. These names, including the Spanish domain fields `claseRecursoId`, `familiaRecursoId`, `tipoRecursoId`, `unidadId`, `selecciones`, `asignacionAtributoId`, `valorPermitidoId`, `nombre`, and `identificadorTecnico`, are contract fields and MUST NOT acquire aliases.

`asignaciones` MUST contain one item for every effective assignment. Each item MUST contain `asignacionAtributoId`, `definicionAtributoId`, `aplicabilidadResuelta`, `participaIdentidad`, `orden`, and `effectiveReasons`, and MAY contain `selectedValueId` when its selected allowed value is accepted for that assignment. `aplicabilidadResuelta` MUST be `REQUIRED`, `OPTIONAL`, `FORBIDDEN`, or `NOT_APPLICABLE`; `CONDITIONAL` MUST NOT be returned as resolved applicability. The assignment-view property `selectedValueId` identifies the allowed value submitted under `valorPermitidoId`; `valorPermitidoId` MUST be used for selection input and every selection-oriented public response reference.

`faltantesRequeridos` MUST be an array of `Id<"atributosRecurso">` identifying every omitted required selectable assignment. `seleccionesInvalidas` MUST be an array of `Id<"atributosRecurso">` identifying each assignment for which at least one supplied selection is invalid; duplicate IDs MUST be collapsed in first-input order. Selection-specific diagnostics remain available through `issues`. `valoresNormalizados` MUST contain only accepted normalized selections and each item MUST use the current Resource-value persistence shape: `atributoRecursoId`, `valor`, and optional `opcionAtributoId`. `nombre` and `identificadorTecnico` MUST be strings only for a complete valid evaluation and MUST otherwise be `null`.

Each `issues` item MUST include a machine-authoritative `code` and a human-readable `message`, and MAY include `asignacionAtributoId` when an assignment is applicable. `code` MUST be one of `HIERARCHY_INVALID`, `UNIT_INVALID`, `OWNERSHIP_INVALID`, `ASSIGNMENT_UNKNOWN`, `ASSIGNMENT_DUPLICATE`, `ALLOWED_VALUE_UNKNOWN`, `ALLOWED_VALUE_FOREIGN`, `ALLOWED_VALUE_INACTIVE`, `SELECTION_NON_EFFECTIVE`, `SELECTION_FORBIDDEN`, `SELECTION_NOT_APPLICABLE`, `UNSUPPORTED_FREE_CAPTURE`, or `IDENTITY_CONFLICT`. Consumers MUST branch on `code` and MUST NOT need to parse `message` prose.

#### Scenario: Evaluation uses only selection input

- GIVEN a client has a Class, Family, Type, Unit, ownership, and allowed-value selections
- WHEN it calls `evaluarCreacionDesdeSelecciones`
- THEN the generated contract accepts those fields with each selection expressed as `asignacionAtributoId` and `valorPermitidoId`
- AND no manual name, description, primitive value, or legacy option ID is accepted.

#### Scenario: Evaluation reports every effective question

- GIVEN a Type has required, optional, forbidden, and conditionally non-applicable effective assignments
- WHEN the query evaluates a configuration
- THEN `asignaciones` contains one resolved item for each effective assignment
- AND each item reports `aplicabilidadResuelta` rather than `CONDITIONAL`.

### Requirement: Evaluation validity, issue, and status semantics

The evaluator MUST classify a selected inactive, foreign, duplicated, unknown, non-effective, forbidden, or non-applicable allowed value as invalid and report the corresponding typed `issues` and `seleccionesInvalidas` entries. A required effective `LIBRE` assignment encountered by this selection-only flow MUST be invalid with `UNSUPPORTED_FREE_CAPTURE`; an optional `LIBRE` assignment MAY be omitted. A missing required `SELECCION` assignment MUST be listed in `faltantesRequeridos`.

`status` MUST be exactly `"INVALID"`, `"INCOMPLETE"`, or `"VALID"`; `valid` MUST be boolean; and the invariant `status === "VALID"` if and only if `valid === true` MUST always hold. Status precedence MUST be `INVALID` if any invalid issue exists, otherwise `INCOMPLETE` if any required selectable assignment is missing, otherwise `VALID`. Thus an evaluation that has both a malformed supplied selection and a missing required selection MUST be `INVALID`.

#### Scenario: Invalid selection wins over incompleteness

- GIVEN one required selectable assignment is omitted
- AND another supplied allowed value is inactive
- WHEN the configuration is evaluated
- THEN `status` is `INVALID`
- AND `valid` is false
- AND `faltantesRequeridos` and the inactive-value issue are both reported.

#### Scenario: Required free capture is not falsely creatable

- GIVEN a required effective assignment has mode `LIBRE`
- WHEN a client evaluates otherwise complete allowed-value selections
- THEN the result contains `UNSUPPORTED_FREE_CAPTURE`
- AND `status` is `INVALID`
- AND `valid` is false.

### Requirement: Deterministic selection evaluation, identity, and fingerprint

The evaluator MUST first select effective assignments using existing Type-over-Family precedence and then apply lifecycle/applicability filtering. Effective assignment order MUST be ascending `orden`, then definition technical `clave` by Unicode code point, then assignment ID. Conditional predicates MUST compare allowed-value IDs and resolve before required/missing validation. A supplied selection that becomes forbidden or non-applicable after that resolution MUST be invalid; suspended client state MUST neither be sent nor persisted.

For a valid complete evaluation, `nombre` MUST be `<Tipo.nombre> · <identity-participating allowed-value labels>` in effective-assignment order. `identificadorTecnico` MUST be generated only from the Type technical key, identity-participating assignment technical keys, and selected allowed-value technical keys, never display labels. It MUST use the existing compatible length-safe versioned serialization.

`catalogFingerprint` MUST always be a string, including for `INVALID` and `INCOMPLETE` evaluations. It MUST be deterministic for the exact graph used by evaluation and MUST include the validated hierarchy and Unit, ownership-resolved lifecycle/effectivity inputs, selected assignment order/mode/identity participation, active allowed values, and effective conditional predicates. When a required hierarchy or catalog row cannot resolve, the canonical fingerprint input MUST retain its position using a deterministic reference-kind-specific missing sentinel when no identifier was supplied, or a deterministic invalid-reference sentinel incorporating the canonical supplied identifier when an identifier was supplied but cannot resolve; it MUST NOT omit that input. Equivalent effective graphs and equivalent unresolved-reference inputs MUST yield the same fingerprint regardless of storage order, and a change to any included input MUST yield a different fingerprint.

#### Scenario: Conditional applicability invalidates a retained selection

- GIVEN a conditional rule makes assignment B `NOT_APPLICABLE` when assignment A has a selected allowed value
- AND the client supplies values for both A and B
- WHEN evaluation resolves the rule
- THEN B is reported as an invalid non-applicable selection
- AND B is absent from `valoresNormalizados`.

#### Scenario: Label edit does not define technical identity

- GIVEN two otherwise identical valid evaluations use the same Type, assignment, and allowed-value technical keys
- WHEN an allowed-value display label changes
- THEN generated `identificadorTecnico` remains the same technical-key identity
- AND the generated `nombre` uses the current label.

#### Scenario: Behavior-relevant catalog change changes fingerprint

- GIVEN a valid evaluation has a returned `catalogFingerprint`
- WHEN an effective allowed value or conditional predicate changes
- THEN a later evaluation returns a different `catalogFingerprint`.

#### Scenario: Unresolved references still receive a fingerprint

- GIVEN an evaluation supplies a hierarchy or catalog identifier that cannot resolve
- WHEN the evaluator produces an invalid or incomplete result
- THEN `catalogFingerprint` is a string
- AND its canonical input includes the deterministic missing or invalid-reference sentinel for each unresolved position.

## MODIFIED Requirements

### Requirement: Scope exclusions

This change MUST NOT add Unit filtering, Bandeja, XML, authentication, authorization, roles/permissions, seed product capabilities, UI implementation, hard delete, cascades, publication mutation, classification migration, organization transfer, or replacement public APIs. It MAY add only the additive public evaluation query `evaluarCreacionDesdeSelecciones` and the additive public mutation `crearRecursoDesdeSelecciones` beside the seven existing Resource administration functions; it MUST NOT change legacy public Resource APIs.

#### Scenario: Generated surface respects exclusions

- GIVEN generated Resource administration references are inspected
- WHEN this change is accepted
- THEN the existing seven Resource administration functions remain available with their existing contracts
- AND the only new Resource creation references are `evaluarCreacionDesdeSelecciones` and `crearRecursoDesdeSelecciones`
- AND no excluded operation or Unit-filtering feature appears.

## Acceptance Criteria

- Evaluation has the exact shared Spanish-domain input fields, including `valorPermitidoId`, and does not accept manual or primitive creation input.
- Every evaluation returns the approved `CreationEvaluation` fields: resolved `asignaciones`, required omissions, invalid selections, persistence-shaped normalized values, typed issues, deterministic generated fields when valid, and the exact status/valid invariant.
- `catalogFingerprint` is always a deterministic string, including when hierarchy or catalog references cannot resolve.
- Typed issue codes cover hierarchy/scope, selection validity, unsupported required free capture, and identity conflict without prose parsing.
- Conditional evaluation, naming, technical identity, and fingerprints are deterministic and backend-authoritative.
- Legacy Resource contracts remain behaviorally compatible while exactly two additive selection-only references are exposed.
