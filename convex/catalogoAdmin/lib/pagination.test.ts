import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";
import { createCursor, consumeCursor, validatePageSize } from "./pagination";

describe("cursor administrativo", () => {
  const context = { filters: { mode: "ALL" }, mode: "ALL" as const, plan: "class-key-id", order: "key-id-v1" };

  it("rejects page sizes outside 1..100", () => {
    expect(() => validatePageSize(0)).toThrow(ConvexError);
    expect(() => validatePageSize(101)).toThrow(ConvexError);
    expect(validatePageSize(undefined)).toBe(25);
  });

  it("round-trips an opaque base64url envelope and binds its plan", async () => {
    const token = await createCursor("native-cursor", context);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    await expect(consumeCursor(token, context)).resolves.toBe("native-cursor");
    await expect(consumeCursor(token, { ...context, mode: "ACTIVE" })).rejects.toThrow(ConvexError);
    await expect(consumeCursor(token, { ...context, order: "other-order" })).rejects.toThrow(ConvexError);
    await expect(consumeCursor(token, { ...context, filters: { parent: "other" } })).rejects.toThrow(ConvexError);
    await expect(consumeCursor("not-a-cursor", context)).rejects.toThrow(ConvexError);
  });

  it("canonicalizes filter key order before hashing", async () => {
    const left = await createCursor("native", { ...context, filters: { b: 2, a: 1 } });
    const right = await createCursor("native", { ...context, filters: { a: 1, b: 2 } });
    expect(left).toBe(right);
  });
});
