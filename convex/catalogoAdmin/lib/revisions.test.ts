import { describe, expect, it } from "vitest";
import {
  applyLifecycleChange,
  applyRevisionedUpdate,
  createRevisioned,
  createRevisionedResult,
  normalizeText,
} from "./revisions";
import type { EntityReference } from "../validators";

const entity = { kind: "clasesRecurso", id: "class-1" } as EntityReference;

type RecordUnderTest = {
  _id: string;
  activo: boolean;
  clave: string;
  nombre: string;
  revision: number;
};

const record = (): RecordUnderTest => ({
  _id: "class-1",
  activo: false,
  clave: "CLASS",
  nombre: "Original",
  revision: 4,
});

describe("revision helpers", () => {
  it("creates revision-one records and create results", () => {
    expect(createRevisioned({ clave: "CLASS", activo: false })).toEqual({
      clave: "CLASS",
      activo: false,
      revision: 1,
    });
    expect(createRevisionedResult({ clave: "CLASS" })).toEqual({
      disposition: "CREATED",
      item: { clave: "CLASS", revision: 1 },
    });
  });

  it("checks revision before a same-state lifecycle no-op", async () => {
    const current = record();
    await expect(applyLifecycleChange({
      load: async () => current,
      expectedRevision: 3,
      entity,
      targetActive: false,
      patch: async () => {
        throw new Error("must not write");
      },
    })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
  });

  it("reports invalid expected revisions as structured argument errors", async () => {
    await expect(applyLifecycleChange({
      load: async () => record(),
      expectedRevision: 0,
      entity,
      targetActive: true,
      patch: async () => undefined,
    })).rejects.toMatchObject({
      data: { code: "ADMIN_INVALID_ARGUMENT", context: { field: "expectedRevision" } },
    });
  });

  it("returns an unchanged lifecycle result without writing", async () => {
    const current = record();
    let writes = 0;
    await expect(applyLifecycleChange({
      load: async () => current,
      expectedRevision: 4,
      entity,
      targetActive: false,
      patch: async () => { writes += 1; },
    })).resolves.toEqual({ disposition: "UNCHANGED", item: current });
    expect(writes).toBe(0);
  });

  it("increments a material lifecycle change exactly once", async () => {
    const current = record();
    let patched: RecordUnderTest | undefined;
    await expect(applyLifecycleChange({
      load: async () => current,
      expectedRevision: 4,
      entity,
      targetActive: true,
      patch: async next => { patched = next; },
    })).resolves.toEqual({ disposition: "UPDATED", item: { ...current, activo: true, revision: 5 } });
    expect(patched).toEqual({ ...current, activo: true, revision: 5 });
  });

  it("normalizes equal updates into a no-op", async () => {
    const current = record();
    let writes = 0;
    await expect(applyRevisionedUpdate({
      load: async () => current,
      expectedRevision: 4,
      entity,
      immutable: { clave: "CLASS" },
      changes: { nombre: "  Original  " },
      normalize: changes => ({ nombre: normalizeText(changes.nombre) }),
      current: item => ({ nombre: normalizeText(item.nombre) }),
      patch: async () => { writes += 1; },
    })).resolves.toEqual({ disposition: "UNCHANGED", item: current });
    expect(writes).toBe(0);
  });

  it("compares normalized object values independent of property order", async () => {
    const current = record();
    let writes = 0;
    await expect(applyRevisionedUpdate({
      load: async () => current,
      expectedRevision: 4,
      entity,
      changes: { first: "A" },
      normalize: () => ({ first: "A", second: { right: 2, left: 1 } }),
      current: () => ({ second: { left: 1, right: 2 }, first: "A" }),
      patch: async () => { writes += 1; },
    })).resolves.toEqual({ disposition: "UNCHANGED", item: current });
    expect(writes).toBe(0);
  });

  it("increments material normalized updates and preserves immutable fields", async () => {
    const current = record();
    await expect(applyRevisionedUpdate({
      load: async () => current,
      expectedRevision: 4,
      entity,
      immutable: { clave: "CLASS" },
      changes: { nombre: " Updated " },
      normalize: changes => ({ nombre: normalizeText(changes.nombre) }),
      current: item => ({ nombre: normalizeText(item.nombre) }),
      patch: async next => { expect(next).toEqual({ ...current, nombre: "Updated", revision: 5 }); },
    })).resolves.toEqual({ disposition: "UPDATED", item: { ...current, nombre: "Updated", revision: 5 } });
  });

  it("rejects immutable echoes before validation or writing", async () => {
    const current = record();
    let writes = 0;
    await expect(applyRevisionedUpdate({
      load: async () => current,
      expectedRevision: 4,
      entity,
      immutable: { clave: "OTHER" },
      changes: { nombre: "Updated" },
      normalize: changes => changes,
      current: item => ({ nombre: item.nombre }),
      validate: async () => { throw new Error("must not validate"); },
      patch: async () => { writes += 1; },
    })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
    expect(writes).toBe(0);
  });

  it("loads by seam and reports missing records", async () => {
    await expect(applyLifecycleChange({
      load: async () => null,
      expectedRevision: 1,
      entity,
      targetActive: true,
      patch: async () => undefined,
    })).rejects.toMatchObject({ data: { code: "ADMIN_NOT_FOUND" } });
  });

  it("validates before the patch so failures cannot partially write", async () => {
    const current = record();
    let writes = 0;
    await expect(applyRevisionedUpdate({
      load: async () => current,
      expectedRevision: 4,
      entity,
      immutable: { clave: "CLASS" },
      changes: { nombre: "Invalid" },
      normalize: changes => changes,
      current: item => ({ nombre: item.nombre }),
      validate: async () => { throw new Error("invalid aggregate"); },
      patch: async () => { writes += 1; },
    })).rejects.toThrow("invalid aggregate");
    expect(writes).toBe(0);
  });
});
