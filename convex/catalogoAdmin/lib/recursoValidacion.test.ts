import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";
import { evaluarRecursoBounded, mapResourceAdminFailure, mapResourceValidationFailure, throwResourceAdminFailure } from "./recursoValidacion";
import type { AdminErrorData, EntityReference, Violation } from "../validators";
import type { ResourceAdminFailure } from "./recursoValidacion";

const empty = { clase: null, familia: null, tipo: null, unidad: null, politicas: [], atributos: [], reglas: [], opciones: [] };
const input = (count: number) => ({ claseRecursoId: "class-1", familiaRecursoId: "family-1", tipoRecursoId: "type-1", unidadId: "unit-1", valores: Array.from({ length: count }, (_, index) => ({ atributoRecursoId: `attribute-${index}`, valor: "x" })) });
const resource = { kind: "recursos" as const, id: "resource-1" as never };
const reference = { kind: "tiposRecurso" as const, id: "type-1" as never };
const violation: Violation = { code: "RESOURCE_VALUE_TYPE_INVALID", entity: resource, field: "valores" };

const adminFailures = [
  { code: "ADMIN_NOT_FOUND", context: { entity: resource } },
  { code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "recursos", field: "tipoRecursoId", reference, reason: "resource type is missing" } },
  { code: "ADMIN_INVALID_STATE", context: { entity: resource, field: "valores", reason: "resource values are invalid", violations: [violation] } },
  { code: "ADMIN_AGGREGATE_INCOMPLETE", context: { entity: resource, violations: [{ code: "CATALOG_LIMIT_EXCEEDED", entity: resource, field: "atributos" }] } },
  { code: "ADMIN_DUPLICATE_KEY", context: { entityKind: "recursos", normalizedIdentity: "TYPE|A", scope: "global" } },
  { code: "ADMIN_CONFLICT", context: { entity: resource, conflictKind: "resource-alias", conflictingEntity: { kind: "identidadesRecurso", id: "alias-1" as never } } },
  { code: "ADMIN_IMMUTABLE_FIELD", context: { entity: resource, field: "tipoRecursoId" } },
  { code: "ADMIN_INVALID_ARGUMENT", context: { field: "pageSize", reason: "must be between 1 and 100" } },
] satisfies ResourceAdminFailure[];

describe("bounded Resource validation", () => {
  it("rejects 201 without throwing and accepts the boundary", () => { expect(evaluarRecursoBounded(empty, input(201))).toEqual(expect.objectContaining({ ok: false, code: "RESOURCE_VALUE_LIMIT_EXCEEDED" })); expect(evaluarRecursoBounded(empty, input(200))).not.toEqual(expect.objectContaining({ code: "RESOURCE_VALUE_LIMIT_EXCEEDED" })); });
  it.each([["JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA", "ADMIN_INVALID_REFERENCE", "classification"], ["JERARQUIA_INVALIDA", "ADMIN_INVALID_REFERENCE", "classification"], ["UNIDAD_NO_PERMITIDA", "ADMIN_INVALID_REFERENCE", "unidadId"], ["ATRIBUTO_NO_APLICABLE", "ADMIN_INVALID_REFERENCE", "valores.atributoRecursoId"], ["DEFINICION_INEXISTENTE", "ADMIN_INVALID_REFERENCE", "definicionAtributoId"], ["OPCION_INVALIDA", "ADMIN_INVALID_REFERENCE", "opcionAtributoId"], ["ATRIBUTO_REPETIDO", "ADMIN_INVALID_STATE", "valores"], ["ATRIBUTO_REQUERIDO_AUSENTE", "ADMIN_INVALID_STATE", "valores"], ["NUMERO_NO_FINITO", "ADMIN_INVALID_STATE", "valores"], ["ATRIBUTO_PROHIBIDO", "ADMIN_INVALID_STATE", "valores"], ["TIPO_DE_VALOR_INVALIDO", "ADMIN_INVALID_STATE", "valores"]] as const)("maps %s", (failure, code, field) => { const mapped = mapResourceValidationFailure(failure, resource); expect(mapped.code).toBe(code); expect(mapped.context).toMatchObject({ field }); });
  it.each(adminFailures)("maps $code to its bounded Resource context", failure => {
    const mapped = mapResourceAdminFailure(failure);
    expect(mapped).toMatchObject({ code: failure.code, context: failure.context });
    expect(mapped.message).toEqual(expect.any(String));
  });
  it.each(adminFailures)("passes $code through the ConvexError boundary", failure => {
    try {
      throwResourceAdminFailure(failure);
      throw new Error("expected a ConvexError");
    } catch (error) {
      expect(error).toBeInstanceOf(ConvexError);
      const data = (error as ConvexError<AdminErrorData>).data;
      expect(data).toEqual(mapResourceAdminFailure(failure));
    }
  });
  it("keeps ConvexError data safe and prose-independent", () => { const mapped = mapResourceValidationFailure("NUMERO_NO_FINITO", resource); expect(() => { throw new ConvexError(mapped); }).toThrowError(ConvexError); expect(mapped).not.toHaveProperty("stack"); expect(mapped.message).toEqual(expect.any(String)); });
});
