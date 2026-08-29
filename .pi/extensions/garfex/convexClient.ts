import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Resource, ResourceQuery } from "./types";

export function getConvexUrl(env: Record<string, string | undefined> = process.env): string | undefined {
  return env.GARFEX_CONVEX_URL || env.CONVEX_URL;
}

export type ResourceRequest =
  | { kind: "list"; args: { activo: true } }
  | { kind: "search"; args: { texto: string; activo: true } };

export function resourceRequest(query: ResourceQuery): ResourceRequest {
  return query.kind === "list"
    ? { kind: "list", args: { activo: true } }
    : { kind: "search", args: { texto: query.text, activo: true } };
}

export function createResourceClient(
  env: Record<string, string | undefined> = process.env,
): (query: ResourceQuery) => Promise<Resource[]> {
  const url = getConvexUrl(env);
  if (!url) throw new Error("Configura GARFEX_CONVEX_URL (o CONVEX_URL) para conectar con Convex.");

  const client = new ConvexHttpClient(url, { logger: false });
  return (query) => {
    const request = resourceRequest(query);
    return request.kind === "list"
      ? client.query(api.catalogoRecursos.recursos.listarRecursos, request.args)
      : client.query(api.catalogoRecursos.recursos.buscarRecursos, request.args);
  };
}
