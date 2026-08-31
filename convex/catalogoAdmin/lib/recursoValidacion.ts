import type { EntityReference, Violation } from "../validators";
import type { AdminErrorData } from "../validators";
import {
  adminAggregateIncomplete,
  adminConflict,
  adminDuplicateKey,
  adminImmutableField,
  adminInvalidArgument,
  adminInvalidReference,
  adminInvalidState,
  adminNotFound,
} from "./errors";
import { evaluarRecurso as evaluarRecursoDominio } from "../../catalogoRecursos/validacionRecurso";
import type { CatalogoSnapshot, EntradaRecurso, FalloValidacion, ResultadoDominio } from "../../../src/catalogoRecursos/dominio/tipos";

export const MAX_RESOURCE_VALIDATION_VALUES = 200;
export type ResourceValidationFailure = FalloValidacion | "RESOURCE_VALUE_LIMIT_EXCEEDED";
export type BoundedResourceValidation = ResultadoDominio | { ok: false; code: "RESOURCE_VALUE_LIMIT_EXCEEDED" };

/** Pure, non-throwing Resource validation with an explicit aggregate bound. */
export function evaluarRecursoBounded(
  snapshot: CatalogoSnapshot,
  entrada: EntradaRecurso,
  limit = MAX_RESOURCE_VALIDATION_VALUES,
): BoundedResourceValidation {
  if (entrada.valores.length > limit) return { ok: false, code: "RESOURCE_VALUE_LIMIT_EXCEEDED" };
  return evaluarRecursoDominio(snapshot, entrada, limit) as BoundedResourceValidation;
}

const messages: Record<AdminErrorData["code"], string> = {
  ADMIN_NOT_FOUND: "The requested catalog entity was not found.",
  ADMIN_DUPLICATE_KEY: "The catalog identity is already in use.",
  ADMIN_INVALID_REFERENCE: "A catalog reference is invalid.",
  ADMIN_IMMUTABLE_FIELD: "An immutable catalog field cannot be changed.",
  ADMIN_STALE_REVISION: "The catalog entity has changed since it was read.",
  ADMIN_INVALID_STATE: "The requested catalog state is invalid.",
  ADMIN_DEPENDENCY_BLOCKED: "An active catalog dependency blocks this operation.",
  ADMIN_AGGREGATE_INCOMPLETE: "The catalog aggregate is incomplete.",
  ADMIN_CONFLICT: "The catalog configuration is contradictory.",
  ADMIN_INVALID_ARGUMENT: "A catalog argument is invalid.",
  ADMIN_PUBLICATION_INVALID: "The catalog cannot be published.",
};

const stateViolation = (code: Extract<Violation["code"], `RESOURCE_${string}`>, entity: EntityReference, field: string): Violation => ({ code, entity, field });

export type ResourceAdminCode =
  | "ADMIN_NOT_FOUND"
  | "ADMIN_INVALID_REFERENCE"
  | "ADMIN_INVALID_STATE"
  | "ADMIN_AGGREGATE_INCOMPLETE"
  | "ADMIN_DUPLICATE_KEY"
  | "ADMIN_CONFLICT"
  | "ADMIN_IMMUTABLE_FIELD"
  | "ADMIN_INVALID_ARGUMENT";

/** A closed Resource error seam: contexts are the shared validated shapes, not endpoint arguments. */
export type ResourceAdminFailure = {
  [Code in ResourceAdminCode]: {
    code: Code;
    context: Extract<AdminErrorData, { code: Code }>["context"];
  };
}[ResourceAdminCode];

/** Map a Resource failure to the shared structured data without parsing message prose. */
export function mapResourceAdminFailure(failure: ResourceAdminFailure): AdminErrorData {
  return { ...failure, message: messages[failure.code] } as AdminErrorData;
}

/**
 * Cross the same checked error boundary used by administrative endpoints.
 * Keeping this here provides a reusable Resource seam without creating an endpoint.
 */
export function throwResourceAdminFailure(failure: ResourceAdminFailure): never {
  const mapped = mapResourceAdminFailure(failure);
  switch (mapped.code) {
    case "ADMIN_NOT_FOUND": return adminNotFound(mapped.context);
    case "ADMIN_INVALID_REFERENCE": return adminInvalidReference(mapped.context);
    case "ADMIN_INVALID_STATE": return adminInvalidState(mapped.context);
    case "ADMIN_AGGREGATE_INCOMPLETE": return adminAggregateIncomplete(mapped.context);
    case "ADMIN_DUPLICATE_KEY": return adminDuplicateKey(mapped.context);
    case "ADMIN_CONFLICT": return adminConflict(mapped.context);
    case "ADMIN_IMMUTABLE_FIELD": return adminImmutableField(mapped.context);
    case "ADMIN_INVALID_ARGUMENT": return adminInvalidArgument(mapped.context);
    default: throw new Error(`Unsupported Resource admin error: ${mapped.code}`);
  }
}

/** Map domain failures to validated administrative data, without parsing Error messages. */
export function mapResourceValidationFailure(failure: ResourceValidationFailure, entity: EntityReference): AdminErrorData {
  switch (failure) {
    case "JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA":
      return mapResourceAdminFailure({ code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "recursos", field: "classification", reference: entity, reason: "RESOURCE_HIERARCHY_OR_UNIT_INVALID" } });
    case "JERARQUIA_INVALIDA":
      return mapResourceAdminFailure({ code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "recursos", field: "classification", reference: entity, reason: "RESOURCE_HIERARCHY_INVALID" } });
    case "UNIDAD_NO_PERMITIDA":
      return mapResourceAdminFailure({ code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "recursos", field: "unidadId", reference: entity, reason: "RESOURCE_UNIT_NOT_ALLOWED" } });
    case "ATRIBUTO_NO_APLICABLE":
      return mapResourceAdminFailure({ code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "recursos", field: "valores.atributoRecursoId", reference: entity, reason: "RESOURCE_ATTRIBUTE_NOT_APPLICABLE" } });
    case "DEFINICION_INEXISTENTE":
      return mapResourceAdminFailure({ code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "recursos", field: "definicionAtributoId", reference: entity, reason: "RESOURCE_DEFINITION_MISSING" } });
    case "OPCION_INVALIDA":
      return mapResourceAdminFailure({ code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "recursos", field: "opcionAtributoId", reference: entity, reason: "RESOURCE_OPTION_INVALID" } });
    case "ATRIBUTO_REPETIDO":
      return stateError("valores", "RESOURCE_ATTRIBUTE_DUPLICATE", entity);
    case "ATRIBUTO_REQUERIDO_AUSENTE":
      return stateError("valores", "RESOURCE_REQUIRED_VALUE_MISSING", entity);
    case "NUMERO_NO_FINITO":
      return stateError("valores", "RESOURCE_NON_FINITE_NUMBER", entity);
    case "ATRIBUTO_PROHIBIDO":
      return stateError("valores", "RESOURCE_ATTRIBUTE_FORBIDDEN", entity);
    case "TIPO_DE_VALOR_INVALIDO":
      return stateError("valores", "RESOURCE_VALUE_TYPE_INVALID", entity);
    case "RESOURCE_VALUE_LIMIT_EXCEEDED":
      return stateError("valores", "RESOURCE_VALUE_LIMIT_EXCEEDED", entity);
  }
}

function stateError(field: string, code: Extract<Violation["code"], `RESOURCE_${string}`>, entity: EntityReference): AdminErrorData {
  return mapResourceAdminFailure({ code: "ADMIN_INVALID_STATE", context: { entity, field, reason: code, violations: [stateViolation(code, entity, field)] } });
}

export const mapearFalloValidacionRecurso = mapResourceValidationFailure;
export const evaluarValidacionRecurso = evaluarRecursoBounded;
