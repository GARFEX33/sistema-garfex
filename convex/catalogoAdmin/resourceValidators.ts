import { v, type Infer } from "convex/values";
import { violationValidator } from "./validators";

export const MAX_RESOURCE_VALUES = 200;

export const valorPermitidoTipadoValidator = v.union(
  v.object({ kind: v.literal("TEXTO"), value: v.string() }),
  v.object({ kind: v.literal("NUMERO"), value: v.number() }),
  v.object({ kind: v.literal("BOOLEANO"), value: v.boolean() }),
  v.object({ kind: v.literal("OPCION"), opcionAtributoId: v.id("opcionesAtributo") }),
);
export type ValorPermitidoTipado = Infer<typeof valorPermitidoTipadoValidator>;

export const resourceValueValidator = v.object({
  _id: v.id("valoresAtributoRecurso"),
  _creationTime: v.number(),
  recursoId: v.id("recursos"),
  atributoRecursoId: v.id("atributosRecurso"),
  valor: v.union(v.string(), v.number(), v.boolean()),
  opcionAtributoId: v.optional(v.id("opcionesAtributo")),
  valorPermitidoId: v.optional(v.id("valoresPermitidosAtributo")),
});
export type ResourceValue = Infer<typeof resourceValueValidator>;

export const resourceValueInputValidator = v.object({
  atributoRecursoId: v.id("atributosRecurso"),
  valor: v.union(v.string(), v.number(), v.boolean()),
  opcionAtributoId: v.optional(v.id("opcionesAtributo")),
});
export type ResourceValueInput = Infer<typeof resourceValueInputValidator>;

export const resourceClassificationInputValidator = v.object({
  claseRecursoId: v.id("clasesRecurso"),
  familiaRecursoId: v.id("familiasRecurso"),
  tipoRecursoId: v.id("tiposRecurso"),
});
export type ResourceClassificationInput = Infer<typeof resourceClassificationInputValidator>;

export const resourceOwnershipInputValidator = v.union(
  v.object({ kind: v.literal("GLOBAL") }),
  v.object({ kind: v.literal("ORGANIZATION"), organizacionId: v.id("organizaciones") }),
);
export type ResourceOwnershipInput = Infer<typeof resourceOwnershipInputValidator>;

export const selectionInputValidator = v.object({
  asignacionAtributoId: v.id("atributosRecurso"),
  valorPermitidoId: v.id("valoresPermitidosAtributo"),
});
export const selectionCreationInputFields = {
  claseRecursoId: v.id("clasesRecurso"),
  familiaRecursoId: v.id("familiasRecurso"),
  tipoRecursoId: v.id("tiposRecurso"),
  unidadId: v.id("unidades"),
  selecciones: v.array(selectionInputValidator),
  ownership: resourceOwnershipInputValidator,
};
export const selectionCreationInputValidator = v.object(selectionCreationInputFields);
export const creationIssueValidator = v.object({
  code: v.union(v.literal("HIERARCHY_INVALID"), v.literal("UNIT_INVALID"), v.literal("OWNERSHIP_INVALID"), v.literal("ASSIGNMENT_UNKNOWN"), v.literal("ASSIGNMENT_DUPLICATE"), v.literal("ALLOWED_VALUE_UNKNOWN"), v.literal("ALLOWED_VALUE_FOREIGN"), v.literal("ALLOWED_VALUE_INACTIVE"), v.literal("SELECTION_NON_EFFECTIVE"), v.literal("SELECTION_FORBIDDEN"), v.literal("SELECTION_NOT_APPLICABLE"), v.literal("UNSUPPORTED_FREE_CAPTURE"), v.literal("IDENTITY_CONFLICT")),
  message: v.string(), asignacionAtributoId: v.optional(v.id("atributosRecurso")),
});
export const creationEvaluationValidator = v.object({
  status: v.union(v.literal("INCOMPLETE"), v.literal("VALID"), v.literal("INVALID")), valid: v.boolean(), catalogFingerprint: v.string(), nombre: v.union(v.string(), v.null()), identificadorTecnico: v.union(v.string(), v.null()),
  asignaciones: v.array(v.object({ asignacionAtributoId: v.id("atributosRecurso"), definicionAtributoId: v.id("definicionesAtributo"), aplicabilidadResuelta: v.union(v.literal("REQUIRED"), v.literal("OPTIONAL"), v.literal("FORBIDDEN"), v.literal("NOT_APPLICABLE")), participaIdentidad: v.boolean(), orden: v.number(), effectiveReasons: v.array(v.string()), selectedValueId: v.optional(v.id("valoresPermitidosAtributo")) })),
  faltantesRequeridos: v.array(v.id("atributosRecurso")), seleccionesInvalidas: v.array(v.id("atributosRecurso")),
  valoresNormalizados: v.array(resourceValueInputValidator), issues: v.array(creationIssueValidator),
});
export type CreationEvaluation = Infer<typeof creationEvaluationValidator>;

export const resourceClassificationStatusValidator = v.object({
  state: v.union(v.literal("EFFECTIVE"), v.literal("INERT"), v.literal("BROKEN_REFERENCE")),
  reasons: v.array(v.string()),
});
export type ResourceClassificationStatus = Infer<typeof resourceClassificationStatusValidator>;

export const resourceSummaryValidator = v.object({
  id: v.id("recursos"),
  identificadorTecnico: v.string(),
  nombre: v.string(),
  tipoRecursoId: v.id("tiposRecurso"),
  unidadId: v.id("unidades"),
  organizacionId: v.optional(v.id("organizaciones")),
  activo: v.boolean(),
  revision: v.number(),
  classificationStatus: resourceClassificationStatusValidator,
});
export type ResourceSummary = Infer<typeof resourceSummaryValidator>;

export const selectionCreateResultValidator = v.union(
  v.object({ disposition: v.literal("CREATED"), item: resourceSummaryValidator }),
  v.object({ disposition: v.literal("CATALOG_CHANGED"), evaluation: creationEvaluationValidator }),
  v.object({ disposition: v.literal("INCOMPLETE"), evaluation: creationEvaluationValidator }),
  v.object({ disposition: v.literal("INVALID"), evaluation: creationEvaluationValidator }),
);
export type SelectionCreateResult = Infer<typeof selectionCreateResultValidator>;

export const resourceReferenceValidator = v.object({
  id: v.union(
    v.id("clasesRecurso"), v.id("familiasRecurso"), v.id("tiposRecurso"),
    v.id("unidades"), v.id("organizaciones"),
  ),
  clave: v.string(),
  nombre: v.string(),
  activo: v.boolean(),
  revision: v.number(),
});
export const resourceUnitReferenceValidator = v.object({
  id: v.id("unidades"), clave: v.string(), nombre: v.string(), simbolo: v.union(v.string(), v.null()), activo: v.boolean(), revision: v.number(),
});
export const resourceDiagnosticsValidator = v.object({
  hierarchy: resourceClassificationStatusValidator,
  aggregateStatus: v.union(v.literal("VALID"), v.literal("INVALID"), v.literal("NOT_EVALUATED")),
  violations: v.array(violationValidator),
});
export type ResourceDiagnostics = Infer<typeof resourceDiagnosticsValidator>;

export const resourceDetailValidator = v.object({
  id: v.id("recursos"),
  identificadorTecnico: v.string(),
  nombre: v.string(),
  tipoRecursoId: v.id("tiposRecurso"),
  unidadId: v.id("unidades"),
  organizacionId: v.optional(v.id("organizaciones")),
  activo: v.boolean(),
  revision: v.number(),
  classificationStatus: resourceClassificationStatusValidator,
  descripcion: v.union(v.string(), v.null()),
  identidadVersion: v.union(v.number(), v.null()),
  clase: v.union(resourceReferenceValidator, v.null()),
  familia: v.union(resourceReferenceValidator, v.null()),
  tipo: v.union(resourceReferenceValidator, v.null()),
  unidad: v.union(resourceUnitReferenceValidator, v.null()),
  organizacion: v.union(resourceReferenceValidator, v.null()),
  catalogDiagnostics: resourceDiagnosticsValidator,
  valores: v.array(resourceValueValidator),
});
export type ResourceDetail = Infer<typeof resourceDetailValidator>;

// Spanish aliases keep the backend vocabulary available without duplicating contracts.
export const recursoValorValidator = resourceValueValidator;
export const recursoResumenValidator = resourceSummaryValidator;
export const recursoDetalleValidator = resourceDetailValidator;
