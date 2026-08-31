import { v, type Infer, type Validator } from "convex/values";

export const entityKinds = ["organizaciones", "catalogoRevisiones", "catalogoTipoSnapshots", "clasesRecurso", "familiasRecurso", "tiposRecurso", "unidades", "politicasUnidadRecurso", "definicionesAtributo", "atributosRecurso", "opcionesAtributo", "politicasPresentacionCanonica", "politicasCompatibilidadOpciones", "relacionesOpcionesAtributo", "reglasAtributoRecurso", "recursos", "identidadesRecurso", "valoresAtributoRecurso"] as const;
export const entityKindValidator = v.union(v.literal("organizaciones"), v.literal("catalogoRevisiones"), v.literal("catalogoTipoSnapshots"), v.literal("clasesRecurso"), v.literal("familiasRecurso"), v.literal("tiposRecurso"), v.literal("unidades"), v.literal("politicasUnidadRecurso"), v.literal("definicionesAtributo"), v.literal("atributosRecurso"), v.literal("opcionesAtributo"), v.literal("politicasPresentacionCanonica"), v.literal("politicasCompatibilidadOpciones"), v.literal("relacionesOpcionesAtributo"), v.literal("reglasAtributoRecurso"), v.literal("recursos"), v.literal("identidadesRecurso"), v.literal("valoresAtributoRecurso"));
export type EntityKind = (typeof entityKinds)[number];

export const entityReferenceValidator = v.union(
  v.object({ kind: v.literal("organizaciones"), id: v.id("organizaciones") }), v.object({ kind: v.literal("catalogoRevisiones"), id: v.id("catalogoRevisiones") }), v.object({ kind: v.literal("catalogoTipoSnapshots"), id: v.id("catalogoTipoSnapshots") }), v.object({ kind: v.literal("clasesRecurso"), id: v.id("clasesRecurso") }), v.object({ kind: v.literal("familiasRecurso"), id: v.id("familiasRecurso") }), v.object({ kind: v.literal("tiposRecurso"), id: v.id("tiposRecurso") }), v.object({ kind: v.literal("unidades"), id: v.id("unidades") }), v.object({ kind: v.literal("politicasUnidadRecurso"), id: v.id("politicasUnidadRecurso") }), v.object({ kind: v.literal("definicionesAtributo"), id: v.id("definicionesAtributo") }), v.object({ kind: v.literal("atributosRecurso"), id: v.id("atributosRecurso") }), v.object({ kind: v.literal("opcionesAtributo"), id: v.id("opcionesAtributo") }), v.object({ kind: v.literal("politicasPresentacionCanonica"), id: v.id("politicasPresentacionCanonica") }), v.object({ kind: v.literal("politicasCompatibilidadOpciones"), id: v.id("politicasCompatibilidadOpciones") }), v.object({ kind: v.literal("relacionesOpcionesAtributo"), id: v.id("relacionesOpcionesAtributo") }), v.object({ kind: v.literal("reglasAtributoRecurso"), id: v.id("reglasAtributoRecurso") }), v.object({ kind: v.literal("recursos"), id: v.id("recursos") }), v.object({ kind: v.literal("identidadesRecurso"), id: v.id("identidadesRecurso") }), v.object({ kind: v.literal("valoresAtributoRecurso"), id: v.id("valoresAtributoRecurso") }),
);
export type EntityReference = Infer<typeof entityReferenceValidator>;

export const lifecycleStateValidator = v.union(v.literal("ACTIVE"), v.literal("INACTIVE"));
export const lifecycleFilterValidator = v.union(v.literal("ALL"), v.literal("ACTIVE"), v.literal("INACTIVE"));
export type LifecycleState = Infer<typeof lifecycleStateValidator>;
export type LifecycleFilter = Infer<typeof lifecycleFilterValidator>;
export const pageArgsValidator = v.object({ cursor: v.union(v.string(), v.null()), pageSize: v.number() });
export type PageArgs = Infer<typeof pageArgsValidator>;

export const violationCodes = ["HIERARCHY_REFERENCE_INVALID", "PRINCIPAL_UNIT_COUNT", "UNIT_INACTIVE", "NUMERIC_UNIT_INVALID", "OPTION_SET_EMPTY", "ASSIGNMENT_SELECTION_INVALID", "RULE_REFERENCE_INVALID", "RULE_RESULT_INVALID", "RULE_CONFLICT", "PRESENTATION_COUNT", "PRESENTATION_TOKEN_INVALID", "COMPATIBILITY_POLICY_CONFLICT", "COMPATIBILITY_RELATION_INVALID", "ALLOWLIST_EMPTY", "TYPE_KEY_AMBIGUOUS", "CATALOG_LIMIT_EXCEEDED"] as const;
export const violationCodeValidator = v.union(v.literal("HIERARCHY_REFERENCE_INVALID"), v.literal("PRINCIPAL_UNIT_COUNT"), v.literal("UNIT_INACTIVE"), v.literal("NUMERIC_UNIT_INVALID"), v.literal("OPTION_SET_EMPTY"), v.literal("ASSIGNMENT_SELECTION_INVALID"), v.literal("RULE_REFERENCE_INVALID"), v.literal("RULE_RESULT_INVALID"), v.literal("RULE_CONFLICT"), v.literal("PRESENTATION_COUNT"), v.literal("PRESENTATION_TOKEN_INVALID"), v.literal("COMPATIBILITY_POLICY_CONFLICT"), v.literal("COMPATIBILITY_RELATION_INVALID"), v.literal("ALLOWLIST_EMPTY"), v.literal("TYPE_KEY_AMBIGUOUS"), v.literal("CATALOG_LIMIT_EXCEEDED"));
export type ViolationCode = Infer<typeof violationCodeValidator>;
export const violationValidator = v.object({ code: violationCodeValidator, entity: v.optional(entityReferenceValidator), field: v.optional(v.string()), relatedEntity: v.optional(entityReferenceValidator), count: v.optional(v.number()), detail: v.optional(v.string()) });
export type Violation = Infer<typeof violationValidator>;

const entityContext = v.object({ entity: entityReferenceValidator });
const duplicateContext = v.object({ entityKind: entityKindValidator, key: v.optional(v.string()), scope: v.optional(v.string()), normalizedIdentity: v.optional(v.string()) });
const referenceContext = v.object({ entityKind: entityKindValidator, field: v.string(), reference: v.optional(entityReferenceValidator), reason: v.string() });
const immutableContext = v.object({ entity: entityReferenceValidator, field: v.string() });
const staleContext = v.object({ entity: entityReferenceValidator, expectedRevision: v.number(), currentRevision: v.number() });
const stateContext = v.object({ entity: v.optional(entityReferenceValidator), field: v.optional(v.string()), reason: v.string(), violations: v.optional(v.array(violationValidator)) });
const dependencyContext = v.object({ entity: entityReferenceValidator, relationKind: v.string(), blocker: entityReferenceValidator });
const aggregateContext = v.object({ entity: entityReferenceValidator, violations: v.array(violationValidator) });
const conflictContext = v.object({ entity: v.optional(entityReferenceValidator), conflictKind: v.string(), conflictingEntity: v.optional(entityReferenceValidator), normalizedIdentity: v.optional(v.string()) });
const argumentContext = v.object({ field: v.string(), reason: v.string() });
const publicationContext = v.object({ organizationId: v.id("organizaciones"), violations: v.array(violationValidator) });
const error = <C extends string, T extends Validator<any, any, any>>(code: C, context: T) => v.object({ code: v.literal(code), message: v.string(), context });
export const adminErrorDataValidator = v.union(error("ADMIN_NOT_FOUND", entityContext), error("ADMIN_DUPLICATE_KEY", duplicateContext), error("ADMIN_INVALID_REFERENCE", referenceContext), error("ADMIN_IMMUTABLE_FIELD", immutableContext), error("ADMIN_STALE_REVISION", staleContext), error("ADMIN_INVALID_STATE", stateContext), error("ADMIN_DEPENDENCY_BLOCKED", dependencyContext), error("ADMIN_AGGREGATE_INCOMPLETE", aggregateContext), error("ADMIN_CONFLICT", conflictContext), error("ADMIN_INVALID_ARGUMENT", argumentContext), error("ADMIN_PUBLICATION_INVALID", publicationContext));
export type AdminErrorData = Infer<typeof adminErrorDataValidator>;

export const adminPageValidator = <T extends Validator<any, "required", any>>(item: T) => v.object({ items: v.array(item), continuationCursor: v.union(v.string(), v.null()), isExhausted: v.boolean() });
export type AdminPage<T> = { items: T[]; continuationCursor: string | null; isExhausted: boolean };
export const createResultValidator = <T extends Validator<any, "required", any>>(item: T) => v.object({ disposition: v.literal("CREATED"), item });
export const changeResultValidator = <T extends Validator<any, "required", any>>(item: T) => v.object({ disposition: v.union(v.literal("UPDATED"), v.literal("UNCHANGED")), item });
export type CreateResult<T> = { disposition: "CREATED"; item: T };
export type ChangeResult<T> = { disposition: "UPDATED" | "UNCHANGED"; item: T };
export const revisionCommandValidator = v.object({ expectedRevision: v.number() });
export type RevisionCommand = Infer<typeof revisionCommandValidator>;
