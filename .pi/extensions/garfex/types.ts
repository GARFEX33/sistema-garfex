export type ResourceId = string;

export interface ResourceValue {
  atributoRecursoId: ResourceId;
  valor: string | number | boolean;
  opcionAtributoId?: ResourceId;
}

export interface Resource {
  _id: ResourceId;
  _creationTime: number;
  tipoRecursoId: ResourceId;
  unidadId: ResourceId;
  identificadorTecnico: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  revision: number;
  valores: ResourceValue[];
}

export type ViewState =
  | { kind: "loading"; query: string }
  | { kind: "list"; query: string; resources: Resource[]; selected: number }
  | { kind: "detail"; resource: Resource }
  | { kind: "empty"; query: string }
  | { kind: "error"; query: string; message: string };

export type ResourceQuery = { kind: "list" } | { kind: "search"; text: string };

export function stateAfterLoad(query: ResourceQuery, resources: Resource[]): ViewState {
  return resources.length === 0
    ? { kind: "empty", query: query.kind === "search" ? query.text : "" }
    : { kind: "list", query: query.kind === "search" ? query.text : "", resources, selected: 0 };
}
