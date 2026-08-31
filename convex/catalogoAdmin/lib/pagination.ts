import { adminInvalidArgument } from "./errors";
import type { LifecycleFilter } from "../validators";

export const ORDERING_VERSION = "key-id-v1";
export type CursorContext = { filters: unknown; mode: LifecycleFilter; plan: string; order: string };

type CursorEnvelope = { v: 1; plan: string; filtersHash: string; order: string; cursor: string };

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => compareCodePoints(left, right)).map(([key, entry]) => [key, canonical(entry)]));
  }
  return value;
}

function compareCodePoints(left: string, right: string): number {
  const a = [...left].map(character => character.codePointAt(0)!);
  const b = [...right].map(character => character.codePointAt(0)!);
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) if (a[index] !== b[index]) return a[index] - b[index];
  return a.length - b.length;
}

async function contextHash(context: CursorContext): Promise<string> {
  const input = JSON.stringify(canonical({ filters: context.filters, mode: context.mode, plan: context.plan, order: context.order }));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function encode(value: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(value: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid base64url");
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, character => character.charCodeAt(0)));
}

export function validatePageSize(pageSize: number | undefined): number {
  const result = pageSize ?? 25;
  if (!Number.isInteger(result) || result < 1 || result > 100) adminInvalidArgument({ field: "pageSize", reason: "must be an integer from 1 through 100" });
  return result;
}

export async function createCursor(cursor: string, context: CursorContext): Promise<string> {
  const envelope: CursorEnvelope = { v: 1, plan: context.plan, filtersHash: await contextHash(context), order: context.order, cursor };
  return encode(JSON.stringify(envelope));
}

export async function consumeCursor(token: string | null, context: CursorContext): Promise<string | null> {
  if (token === null) return null;
  try {
    const parsed = JSON.parse(decode(token)) as Partial<CursorEnvelope>;
    if (parsed.v !== 1 || parsed.plan !== context.plan || parsed.order !== context.order || typeof parsed.cursor !== "string" || typeof parsed.filtersHash !== "string" || parsed.filtersHash !== await contextHash(context)) throw new Error("cursor context mismatch");
    return parsed.cursor;
  } catch {
    adminInvalidArgument({ field: "cursor", reason: "malformed or incompatible cursor" });
    return null;
  }
}
