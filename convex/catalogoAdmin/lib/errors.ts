import { ConvexError } from "convex/values";
import { entityKinds, violationCodes } from "../validators";
import type { AdminErrorData, EntityReference, EntityKind, Violation } from "../validators";
export type { AdminErrorData, EntityReference, EntityKind, Violation } from "../validators";

const messages: Record<AdminErrorData["code"], string> = {
  ADMIN_NOT_FOUND: "The requested catalog entity was not found.", ADMIN_DUPLICATE_KEY: "The catalog identity is already in use.", ADMIN_INVALID_REFERENCE: "A catalog reference is invalid.", ADMIN_IMMUTABLE_FIELD: "An immutable catalog field cannot be changed.", ADMIN_STALE_REVISION: "The catalog entity has changed since it was read.", ADMIN_INVALID_STATE: "The requested catalog state is invalid.", ADMIN_DEPENDENCY_BLOCKED: "An active catalog dependency blocks this operation.", ADMIN_AGGREGATE_INCOMPLETE: "The catalog aggregate is incomplete.", ADMIN_CONFLICT: "The catalog configuration is contradictory.", ADMIN_INVALID_ARGUMENT: "A catalog argument is invalid.", ADMIN_PUBLICATION_INVALID: "The catalog cannot be published.",
};
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const only = (value: Record<string, unknown>, keys: readonly string[]) => Object.keys(value).every(key => keys.includes(key));
const kind = (value: unknown): value is EntityKind => typeof value === "string" && (entityKinds as readonly string[]).includes(value);
const entity = (value: unknown): value is EntityReference => record(value) && only(value, ["kind", "id"]) && kind(value.kind) && text(value.id);
const violations = (value: unknown): value is Violation[] => Array.isArray(value) && value.every(item => record(item) && only(item, ["code", "entity", "field", "relatedEntity", "count", "detail"]) && text(item.code) && (violationCodes as readonly string[]).includes(item.code) && (item.entity === undefined || entity(item.entity)) && (item.relatedEntity === undefined || entity(item.relatedEntity)) && (item.field === undefined || text(item.field)) && (item.detail === undefined || text(item.detail)) && (item.count === undefined || (typeof item.count === "number" && Number.isFinite(item.count) && item.count >= 0)));
function contextIsValid(code: AdminErrorData["code"], value: unknown): boolean {
  if (!record(value)) return false;
  const c = value;
  switch (code) {
    case "ADMIN_NOT_FOUND": return only(c, ["entity"]) && entity(c.entity);
    case "ADMIN_DUPLICATE_KEY": return only(c, ["entityKind", "key", "scope", "normalizedIdentity"]) && kind(c.entityKind) && ["key", "scope", "normalizedIdentity"].every(k => c[k] === undefined || text(c[k]));
    case "ADMIN_INVALID_REFERENCE": return only(c, ["entityKind", "field", "reference", "reason"]) && kind(c.entityKind) && text(c.field) && text(c.reason) && (c.reference === undefined || entity(c.reference));
    case "ADMIN_IMMUTABLE_FIELD": return only(c, ["entity", "field"]) && entity(c.entity) && text(c.field);
    case "ADMIN_STALE_REVISION": return only(c, ["entity", "expectedRevision", "currentRevision"]) && entity(c.entity) && integer(c.expectedRevision) && integer(c.currentRevision);
    case "ADMIN_INVALID_STATE": return only(c, ["entity", "field", "reason", "violations"]) && (c.entity === undefined || entity(c.entity)) && (c.field === undefined || text(c.field)) && text(c.reason) && (c.violations === undefined || violations(c.violations));
    case "ADMIN_DEPENDENCY_BLOCKED": return only(c, ["entity", "relationKind", "blocker"]) && entity(c.entity) && text(c.relationKind) && entity(c.blocker);
    case "ADMIN_AGGREGATE_INCOMPLETE": return only(c, ["entity", "violations"]) && entity(c.entity) && violations(c.violations);
    case "ADMIN_CONFLICT": return only(c, ["entity", "conflictKind", "conflictingEntity", "normalizedIdentity"]) && (c.entity === undefined || entity(c.entity)) && text(c.conflictKind) && (c.conflictingEntity === undefined || entity(c.conflictingEntity)) && (c.normalizedIdentity === undefined || text(c.normalizedIdentity));
    case "ADMIN_INVALID_ARGUMENT": return only(c, ["field", "reason"]) && text(c.field) && text(c.reason);
    case "ADMIN_PUBLICATION_INVALID": return only(c, ["organizationId", "violations"]) && text(c.organizationId) && violations(c.violations);
  }
}
function integer(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 0; }
function fail<C extends AdminErrorData["code"]>(code: C, context: Extract<AdminErrorData, { code: C }>["context"]): never {
  if (!contextIsValid(code, context)) throw new TypeError(`Invalid ${code} context`);
  throw new ConvexError({ code, message: messages[code], context } as AdminErrorData);
}

export const adminNotFound = (c: Extract<AdminErrorData, { code: "ADMIN_NOT_FOUND" }>["context"]): never => fail("ADMIN_NOT_FOUND", c);
export const adminDuplicateKey = (c: Extract<AdminErrorData, { code: "ADMIN_DUPLICATE_KEY" }>["context"]): never => fail("ADMIN_DUPLICATE_KEY", c);
export const adminInvalidReference = (c: Extract<AdminErrorData, { code: "ADMIN_INVALID_REFERENCE" }>["context"]): never => fail("ADMIN_INVALID_REFERENCE", c);
export const adminImmutableField = (c: Extract<AdminErrorData, { code: "ADMIN_IMMUTABLE_FIELD" }>["context"]): never => fail("ADMIN_IMMUTABLE_FIELD", c);
export const adminStaleRevision = (c: Extract<AdminErrorData, { code: "ADMIN_STALE_REVISION" }>["context"]): never => fail("ADMIN_STALE_REVISION", c);
export const adminInvalidState = (c: Extract<AdminErrorData, { code: "ADMIN_INVALID_STATE" }>["context"]): never => fail("ADMIN_INVALID_STATE", c);
export const adminDependencyBlocked = (c: Extract<AdminErrorData, { code: "ADMIN_DEPENDENCY_BLOCKED" }>["context"]): never => fail("ADMIN_DEPENDENCY_BLOCKED", c);
export const adminAggregateIncomplete = (c: Extract<AdminErrorData, { code: "ADMIN_AGGREGATE_INCOMPLETE" }>["context"]): never => fail("ADMIN_AGGREGATE_INCOMPLETE", c);
export const adminConflict = (c: Extract<AdminErrorData, { code: "ADMIN_CONFLICT" }>["context"]): never => fail("ADMIN_CONFLICT", c);
export const adminInvalidArgument = (c: Extract<AdminErrorData, { code: "ADMIN_INVALID_ARGUMENT" }>["context"]): never => fail("ADMIN_INVALID_ARGUMENT", c);
export const adminPublicationInvalid = (c: Extract<AdminErrorData, { code: "ADMIN_PUBLICATION_INVALID" }>["context"]): never => fail("ADMIN_PUBLICATION_INVALID", c);
export const throwAdminNotFound = adminNotFound, throwAdminDuplicateKey = adminDuplicateKey, throwAdminInvalidReference = adminInvalidReference, throwAdminImmutableField = adminImmutableField, throwAdminStaleRevision = adminStaleRevision, throwAdminInvalidState = adminInvalidState, throwAdminDependencyBlocked = adminDependencyBlocked, throwAdminAggregateIncomplete = adminAggregateIncomplete, throwAdminConflict = adminConflict, throwAdminInvalidArgument = adminInvalidArgument, throwAdminPublicationInvalid = adminPublicationInvalid;
