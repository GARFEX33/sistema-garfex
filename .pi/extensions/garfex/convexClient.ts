import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type {
  AllowedOptionsArgs,
  ApplicableAttributesArgs,
  CreateResourceArgs,
  FamiliesArgs,
  ResourceDataSource,
  ResourceId,
  ResourceQuery,
  TypesArgs,
  ValidUnitsArgs,
} from "./types";

export function getConvexUrl(env: Record<string, string | undefined> = process.env): string | undefined {
  return env.GARFEX_CONVEX_URL || env.CONVEX_URL;
}

export type ResourceRequest =
  | { kind: "list"; args: { activo: true } }
  | { kind: "search"; args: { texto: string; activo: true } };

export function resourceRequest(query: { kind: "list" }): Extract<ResourceRequest, { kind: "list" }>;
export function resourceRequest(query: { kind: "search"; text: string }): Extract<ResourceRequest, { kind: "search" }>;
export function resourceRequest(query: ResourceQuery): ResourceRequest {
  if (query.kind === "list") return { kind: "list", args: { activo: true } };
  return { kind: "search", args: { texto: query.text, activo: true } };
}

export function detailRequest(resourceId: ResourceId): { recursoId: ResourceId } {
  return { recursoId: resourceId };
}

type ResourceQueryClient = Pick<ConvexHttpClient, "query" | "mutation">;
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
    consultarClases: () => client.query(
      api.catalogoRecursos.catalogo.consultarClases,
      {},
    ),
    consultarFamiliasDeClase: (args: FamiliesArgs) => client.query(
      api.catalogoRecursos.catalogo.consultarFamiliasDeClase,
      args,
    ),
    consultarTiposDeFamilia: (args: TypesArgs) => client.query(
      api.catalogoRecursos.catalogo.consultarTiposDeFamilia,
      args,
    ),
    consultarUnidadesValidas: (args: ValidUnitsArgs) => client.query(
      api.catalogoRecursos.catalogo.consultarUnidadesValidas,
      args,
    ),
    consultarAtributosAplicables: (args: ApplicableAttributesArgs) => client.query(
      api.catalogoRecursos.catalogo.consultarAtributosAplicables,
      args,
    ),
    consultarOpcionesPermitidas: (args: AllowedOptionsArgs) => client.query(
      api.catalogoRecursos.catalogo.consultarOpcionesPermitidas,
      args,
    ),
    crearRecurso: (args: CreateResourceArgs) => client.mutation(
      api.catalogoRecursos.recursos.crearRecurso,
      args,
    ),
  };
}
