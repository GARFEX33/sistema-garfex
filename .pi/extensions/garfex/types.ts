import { api } from "../../../convex/_generated/api";
import type { FunctionArgs, FunctionReturnType } from "convex/server";

export type Resource = FunctionReturnType<typeof api.catalogoRecursos.recursos.listarRecursos>[number];
export type Classes = FunctionReturnType<typeof api.catalogoRecursos.catalogo.consultarClases>;
export type Families = FunctionReturnType<typeof api.catalogoRecursos.catalogo.consultarFamiliasDeClase>;
export type Types = FunctionReturnType<typeof api.catalogoRecursos.catalogo.consultarTiposDeFamilia>;
export type ValidUnits = FunctionReturnType<typeof api.catalogoRecursos.catalogo.consultarUnidadesValidas>;
export type ApplicableAttributes = FunctionReturnType<typeof api.catalogoRecursos.catalogo.consultarAtributosAplicables>;
export type AllowedOptions = FunctionReturnType<typeof api.catalogoRecursos.catalogo.consultarOpcionesPermitidas>;
export type CreateResourceArgs = FunctionArgs<typeof api.catalogoRecursos.recursos.crearRecurso>;
export type CreatedResource = FunctionReturnType<typeof api.catalogoRecursos.recursos.crearRecurso>;
export type ClassesArgs = FunctionArgs<typeof api.catalogoRecursos.catalogo.consultarClases>;
export type FamiliesArgs = FunctionArgs<typeof api.catalogoRecursos.catalogo.consultarFamiliasDeClase>;
export type TypesArgs = FunctionArgs<typeof api.catalogoRecursos.catalogo.consultarTiposDeFamilia>;
export type ValidUnitsArgs = FunctionArgs<typeof api.catalogoRecursos.catalogo.consultarUnidadesValidas>;
export type ApplicableAttributesArgs = FunctionArgs<typeof api.catalogoRecursos.catalogo.consultarAtributosAplicables>;
export type AllowedOptionsArgs = FunctionArgs<typeof api.catalogoRecursos.catalogo.consultarOpcionesPermitidas>;

export type ResourceId = Resource["_id"];
export type ResourceValue = Resource["valores"][number];
export type ResourceDetail = NonNullable<FunctionReturnType<typeof api.catalogoRecursos.recursos.obtenerDetalleRecurso>>;

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

export interface ResourceBrowserDataSource {
  list(): Promise<Resource[]>;
  search(text: string): Promise<Resource[]>;
  getDetail(resourceId: ResourceId): Promise<ResourceDetail | null>;
}

export interface ResourceCreationDataSource {
  consultarClases(): Promise<Classes>;
  consultarFamiliasDeClase(args: FamiliesArgs): Promise<Families>;
  consultarTiposDeFamilia(args: TypesArgs): Promise<Types>;
  consultarUnidadesValidas(args: ValidUnitsArgs): Promise<ValidUnits>;
  consultarAtributosAplicables(args: ApplicableAttributesArgs): Promise<ApplicableAttributes>;
  consultarOpcionesPermitidas(args: AllowedOptionsArgs): Promise<AllowedOptions>;
  crearRecurso(args: CreateResourceArgs): Promise<CreatedResource>;
}

export interface ResourceDataSource extends ResourceBrowserDataSource, ResourceCreationDataSource {}

export function stateAfterLoad(query: ResourceQuery, resources: Resource[]): ViewState {
  return resources.length === 0
    ? { kind: "empty", query: query.kind === "search" ? query.text : "" }
    : { kind: "list", query: query.kind === "search" ? query.text : "", resources, selected: 0 };
}
