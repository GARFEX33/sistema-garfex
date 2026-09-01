import { v, type Infer } from "convex/values";
import { violationValidator } from "./validators";

export const MAX_RESOURCE_VALUES = 200;

export const resourceValueValidator = v.object({
  _id: v.id("valoresAtributoRecurso"),
  _creationTime: v.number(),
  recursoId: v.id("recursos"),
  atributoRecursoId: v.id("atributosRecurso"),
  valor: v.union(v.string(), v.number(), v.boolean()),
  opcionAtributoId: v.optional(v.id("opcionesAtributo")),
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
