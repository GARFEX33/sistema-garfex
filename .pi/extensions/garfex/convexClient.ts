import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { ResourceDataSource, ResourceId, ResourceQuery } from "./types";

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

export function detailRequest(resourceId: ResourceId): { recursoId: ResourceId } {
  return { recursoId: resourceId };
}

type ResourceQueryClient = Pick<ConvexHttpClient, "query">;
type ResourceQueryClientFactory = (url: string) => ResourceQueryClient;

export function createResourceDataSource(
  env: Record<string, string | undefined> = process.env,
  createClient: ResourceQueryClientFactory = (url) => new ConvexHttpClient(url, { logger: false }),
): ResourceDataSource {
  const url = getConvexUrl(env);
  if (!url) throw new Error("Configura GARFEX_CONVEX_URL (o CONVEX_URL) para conectar con Convex.");

  const client = createClient(url);
  return {
    list: () => {
      const request = resourceRequest({ kind: "list" });
      return client.query(api.catalogoRecursos.recursos.listarRecursos, request.args);
    },
    search: (text) => {
      const request = resourceRequest({ kind: "search", text });
      return client.query(api.catalogoRecursos.recursos.buscarRecursos, request.args);
    },
    getDetail: (resourceId) => client.query(
      api.catalogoRecursos.recursos.obtenerDetalleRecurso,
      detailRequest(resourceId),
    ),
  };
}
