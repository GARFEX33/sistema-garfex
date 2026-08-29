import { api } from "../../../convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type Resource = FunctionReturnType<typeof api.catalogoRecursos.recursos.listarRecursos>[number];
export type ResourceId = Resource["_id"];
export type ResourceValue = Resource["valores"][number];
export type ResourceDetail = NonNullable<FunctionReturnType<typeof api.catalogoRecursos.recursos.obtenerDetalleRecurso>>;
export type CatalogReference = ResourceDetail["clase"];
export type ResourceDetailAttribute = ResourceDetail["atributos"][number];

export type ViewState =
  | { kind: "loading"; query: string }
  | { kind: "list"; query: string; resources: Resource[]; selected: number }
  | { kind: "detail-loading"; resource: Resource }
  | { kind: "detail"; resource: ResourceDetail }
  | { kind: "detail-missing"; resource: Resource }
  | { kind: "detail-error"; resource: Resource; message: string }
  | { kind: "empty"; query: string }
  | { kind: "error"; query: string; message: string };

export type ResourceQuery = { kind: "list" } | { kind: "search"; text: string };

export interface ResourceDataSource {
  list(): Promise<Resource[]>;
  search(text: string): Promise<Resource[]>;
  getDetail(resourceId: ResourceId): Promise<ResourceDetail | null>;
}

export function stateAfterLoad(query: ResourceQuery, resources: Resource[]): ViewState {
  return resources.length === 0
    ? { kind: "empty", query: query.kind === "search" ? query.text : "" }
    : { kind: "list", query: query.kind === "search" ? query.text : "", resources, selected: 0 };
}
