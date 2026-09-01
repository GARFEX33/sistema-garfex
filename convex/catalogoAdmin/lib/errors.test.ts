import { ConvexError } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { describe, expect, it } from "vitest";
import {
  adminAggregateIncomplete,
  adminConflict,
  adminDependencyBlocked,
  adminDuplicateKey,
  adminImmutableField,
  adminInvalidArgument,
  adminInvalidReference,
  adminInvalidState,
  adminNotFound,
  adminPublicationInvalid,
  adminStaleRevision,
} from "./errors";
import type { AdminErrorData, EntityReference, Violation } from "../validators";
import { adminErrorDataValidator } from "../validators";

type TestId = EntityReference["id"];
const entity = { kind: "clasesRecurso", id: "class-1" as TestId } as EntityReference;
const violation: Violation = { code: "RULE_CONFLICT", entity };

function expectAdminError(action: () => never, code: AdminErrorData["code"], context: unknown) {
  try {
    action();
    throw new Error("expected an error");
  } catch (error) {
    expect(error).toBeInstanceOf(ConvexError);
    const data = (error as ConvexError<AdminErrorData>).data;
    expect(data.code).toBe(code);
    expect(data.context).toEqual(context);
    expect(data.message).toEqual(expect.any(String));
  }
}

describe("structured admin errors", () => {
  it.each([
    ["ADMIN_NOT_FOUND", () => adminNotFound({ entity }), { entity }],
    ["ADMIN_DUPLICATE_KEY", () => adminDuplicateKey({ entityKind: "clasesRecurso", key: "C", scope: "global" }), { entityKind: "clasesRecurso", key: "C", scope: "global" }],
    ["ADMIN_INVALID_REFERENCE", () => adminInvalidReference({ entityKind: "familiasRecurso", field: "claseRecursoId", reference: entity, reason: "wrong owner" }), { entityKind: "familiasRecurso", field: "claseRecursoId", reference: entity, reason: "wrong owner" }],
    ["ADMIN_IMMUTABLE_FIELD", () => adminImmutableField({ entity, field: "clave" }), { entity, field: "clave" }],
    ["ADMIN_STALE_REVISION", () => adminStaleRevision({ entity, expectedRevision: 2, currentRevision: 3 }), { entity, expectedRevision: 2, currentRevision: 3 }],
    ["ADMIN_INVALID_STATE", () => adminInvalidState({ entity, field: "activo", reason: "invalid transition", violations: [violation] }), { entity, field: "activo", reason: "invalid transition", violations: [violation] }],
    ["ADMIN_DEPENDENCY_BLOCKED", () => adminDependencyBlocked({ entity, relationKind: "active-child", blocker: entity }), { entity, relationKind: "active-child", blocker: entity }],
    ["ADMIN_AGGREGATE_INCOMPLETE", () => adminAggregateIncomplete({ entity, violations: [violation] }), { entity, violations: [violation] }],
    ["ADMIN_CONFLICT", () => adminConflict({ entity, conflictKind: "duplicate-policy", conflictingEntity: entity, normalizedIdentity: "P|A|B" }), { entity, conflictKind: "duplicate-policy", conflictingEntity: entity, normalizedIdentity: "P|A|B" }],
    ["ADMIN_INVALID_ARGUMENT", () => adminInvalidArgument({ field: "pageSize", reason: "out of range" }), { field: "pageSize", reason: "out of range" }],
    ["ADMIN_PUBLICATION_INVALID", () => adminPublicationInvalid({ organizationId: "org-1" as Id<"organizaciones">, violations: [violation] }), { organizationId: "org-1", violations: [violation] }],
  ] as const)("uses the closed %s context", (_code, action, context) => {
    expectAdminError(action, _code, context);
  });

  it("does not accept malformed or unsafe contexts at runtime", () => {
    expect(() => adminStaleRevision({ entity, expectedRevision: -1, currentRevision: 0 })).toThrow();
    expect(() => adminInvalidArgument({ field: "", reason: "bad" })).toThrow();
    expect(() => adminNotFound({ entity: { kind: "unknown", id: "leak" } as unknown as EntityReference })).toThrow();
    expect(() => adminAggregateIncomplete({ entity, violations: [{ code: "UNKNOWN" } as unknown as Violation] })).toThrow();
    expect(() => adminInvalidArgument({ field: "field", reason: "bad", secret: "not safe" } as never)).toThrow();
    expect(adminErrorDataValidator).toMatchObject({ kind: "union" });
  });
});
