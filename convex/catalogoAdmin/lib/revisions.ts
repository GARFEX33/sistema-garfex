import type { ChangeResult, CreateResult, EntityReference } from "../validators";
import { adminImmutableField, adminInvalidArgument, adminNotFound, adminStaleRevision } from "./errors";

export type RevisionedRecord = { revision: number };
type ImmutableValues = Record<string, unknown>;
type UpdateOptions<R extends RevisionedRecord, C, N> = { load: () => R | null | undefined | Promise<R | null | undefined>; expectedRevision: number; entity: EntityReference; immutable?: ImmutableValues; changes: C; normalize: (changes: C) => N; current: (record: R) => N; validate?: (next: R, normalized: N) => void | Promise<void>; patch: (next: R) => void | Promise<void> };
export type LifecycleOptions<R extends RevisionedRecord & { activo: boolean }> = { load: () => R | null | undefined | Promise<R | null | undefined>; expectedRevision: number; entity: EntityReference; targetActive: boolean; immutable?: ImmutableValues; validate?: (next: R) => void | Promise<void>; patch: (next: R) => void | Promise<void> };

export const normalizeText = (value: string): string => value.normalize("NFC").trim().replace(/\s+/gu, " ");
export function createRevisioned<T extends object>(record: T): T & { revision: 1 } { return { ...record, revision: 1 }; }
export function createRevisionedResult<T extends object>(record: T): CreateResult<T & { revision: 1 }> { return { disposition: "CREATED", item: createRevisioned(record) }; }
function integer(value: unknown): value is number { return typeof value === "number" && Number.isInteger(value) && value >= 1; }
function fresh<R extends RevisionedRecord>(record: R, expected: number, entity: EntityReference): void { if (!integer(expected)) adminInvalidArgument({ field: "expectedRevision", reason: "must be a positive integer" }); if (!integer(record.revision)) adminInvalidArgument({ field: "revision", reason: "must be a positive integer" }); if (record.revision !== expected) adminStaleRevision({ entity, expectedRevision: expected, currentRevision: record.revision }); }
function echoes<R>(record: R, immutable: ImmutableValues | undefined, entity: EntityReference): void { for (const [field, value] of Object.entries(immutable ?? {})) if (value !== undefined && !Object.is((record as Record<string, unknown>)[field], value)) adminImmutableField({ entity, field }); }
function equal(left: unknown, right: unknown): boolean { if (Object.is(left, right)) return true; if (typeof left !== "object" || left === null || typeof right !== "object" || right === null) return false; if (Array.isArray(left) || Array.isArray(right)) return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((v, i) => equal(v, right[i])); const a = left as Record<string, unknown>, b = right as Record<string, unknown>, ak = Object.keys(a).sort(), bk = Object.keys(b).sort(); return ak.length === bk.length && ak.every((key, i) => key === bk[i] && equal(a[key], b[key])); }

/** All validation completes before patch is called, preserving transactional callers. */
export async function applyRevisionedUpdate<R extends RevisionedRecord, C, N>(o: UpdateOptions<R, C, N>): Promise<ChangeResult<R>> {
  const loaded = await o.load(); if (loaded == null) adminNotFound({ entity: o.entity }); const record = loaded as R; fresh(record, o.expectedRevision, o.entity); echoes(record, o.immutable, o.entity); const normalized = o.normalize(o.changes), previous = o.current(record);
  if (equal(normalized, previous)) return { disposition: "UNCHANGED", item: record };
  const next = { ...record, ...normalized, revision: record.revision + 1 } as unknown as R; await o.validate?.(next, normalized); await o.patch(next); return { disposition: "UPDATED", item: next };
}
export async function applyLifecycleChange<R extends RevisionedRecord & { activo: boolean }>(o: LifecycleOptions<R>): Promise<ChangeResult<R>> {
  const loaded = await o.load(); if (loaded == null) adminNotFound({ entity: o.entity }); const record = loaded as R; fresh(record, o.expectedRevision, o.entity); echoes(record, o.immutable, o.entity);
  if (record.activo === o.targetActive) return { disposition: "UNCHANGED", item: record }; const next = { ...record, activo: o.targetActive, revision: record.revision + 1 } as unknown as R; await o.validate?.(next); await o.patch(next); return { disposition: "UPDATED", item: next };
}
export const aplicarActualizacionRevisionada = applyRevisionedUpdate, aplicarCambioCicloVida = applyLifecycleChange, crearConRevision = createRevisioned, crearResultadoConRevision = createRevisionedResult;
