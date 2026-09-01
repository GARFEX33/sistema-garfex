import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import type {
  FunctionArgs,
  FunctionReturnType,
  PaginationResult,
} from "convex/server";
import { api } from "sistema-garfex/convex-api";
import type { DataModel, Id } from "sistema-garfex/convex-data-model";
import type { AdminErrorData } from "sistema-garfex/catalog-admin-errors";

declare const organizationId: Id<"organizaciones">;
declare const typeId: Id<"tiposRecurso">;
declare const classId: Id<"clasesRecurso">;
declare const familyId: Id<"familiasRecurso">;
declare const unitId: Id<"unidades">;
declare const attributeId: Id<"atributosRecurso">;
declare const resourceId: Id<"recursos">;

type ResourceApi = typeof api.catalogoAdmin.recursos;
type ListReference = ResourceApi["listarRecursosResumen"];
type SearchReference = ResourceApi["buscarRecursosResumen"];
type Summary = FunctionReturnType<ListReference>["page"][number];
type Detail = NonNullable<FunctionReturnType<ResourceApi["obtenerDetalleRecurso"]>>;
type ChangeResult = FunctionReturnType<ResourceApi["actualizarRecurso"]>;
type MutationResult =
  | FunctionReturnType<ResourceApi["crearRecurso"]>
  | ChangeResult;
type NativePage = PaginationResult<Summary>;

type ListArgs = Omit<FunctionArgs<ListReference>, "paginationOpts">;
type SearchArgs = Omit<FunctionArgs<SearchReference>, "paginationOpts">;
type ExcludedQueryKeys =
  | "unidadId"
  | "cursor"
  | "continueCursor"
  | "continuationCursor"
  | "plan"
  | "orderToken"
  | "versionToken";
type NoExcludedQueryKeys<T> = Extract<keyof T, ExcludedQueryKeys> extends never ? true : false;
const listHasOnlyNativeControls: NoExcludedQueryKeys<ListArgs> = true;
const searchHasOnlyNativeControls: NoExcludedQueryKeys<SearchArgs> = true;

const listArgs = {
  lifecycle: "ACTIVE",
  tipoRecursoId: typeId,
  scope: { kind: "ORGANIZATION", organizacionId: organizationId },
} satisfies ListArgs;
const searchArgs = {
  searchText: "  Bomba\t Norte  ",
  lifecycle: "INACTIVE",
  tipoRecursoId: typeId,
  scope: { kind: "GLOBAL" },
} satisfies SearchArgs;

const listState = usePaginatedQuery(
  api.catalogoAdmin.recursos.listarRecursosResumen,
  listArgs,
  { initialNumItems: 25 },
);
const searchState = usePaginatedQuery(
  api.catalogoAdmin.recursos.buscarRecursosResumen,
  searchArgs,
  { initialNumItems: 25 },
);

const firstSummary: Summary | undefined = listState.results[0];
const searchSummary: Summary | undefined = searchState.results[0];
const summaryId: Id<"recursos"> | undefined = firstSummary?.id;
const summaryIdentity: string | undefined = firstSummary?.identificadorTecnico;
const summaryName: string | undefined = firstSummary?.nombre;
const summaryType: Id<"tiposRecurso"> | undefined = firstSummary?.tipoRecursoId;
const summaryUnit: Id<"unidades"> | undefined = firstSummary?.unidadId;
const summaryOrganization: Id<"organizaciones"> | undefined = firstSummary?.organizacionId;
const summaryActive: boolean | undefined = firstSummary?.activo;
const summaryRevision: number | undefined = firstSummary?.revision;
const summaryClassification:
  | "EFFECTIVE"
  | "INERT"
  | "BROKEN_REFERENCE"
  | undefined = firstSummary?.classificationStatus.state;

function inspectPaginatedState(
  state: typeof listState | typeof searchState,
  page: FunctionReturnType<ListReference> | FunctionReturnType<SearchReference>,
): void {
  const nativePage: NativePage = page;
  const cursor: string = nativePage.continueCursor;
  const done: boolean = nativePage.isDone;
  const splitCursor: string | null | undefined = nativePage.splitCursor;
  const pageStatus: "SplitRecommended" | "SplitRequired" | null | undefined = nativePage.pageStatus;
  const status:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted" = state.status;
  const loading: boolean = state.isLoading;
  if (status === "CanLoadMore") state.loadMore(25);
  if (status === "LoadingMore") state.loadMore(25);
  void [cursor, done, splitCursor, pageStatus, loading, state.results, page.page];
}

const detail = useQuery(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId: resourceId });
function inspectDetail(value: Detail | undefined): void {
  if (!value) return;
  const detailId: Id<"recursos"> = value.id;
  const detailIdentity: string = value.identificadorTecnico;
  const detailName: string = value.nombre;
  const detailDescription: string | null = value.descripcion;
  const detailRevision: number = value.revision;
  const hierarchyState = value.catalogDiagnostics.hierarchy.state;
  const aggregateStatus = value.catalogDiagnostics.aggregateStatus;
  const violations = value.catalogDiagnostics.violations;
  const historyIdentityVersion: number | null = value.identidadVersion;
  const storedValues = value.valores;
  void [detailId, detailIdentity, detailName, detailDescription, detailRevision, hierarchyState, aggregateStatus, violations, historyIdentityVersion, storedValues];
}

const createArgs = {
  claseRecursoId: classId,
  familiaRecursoId: familyId,
  tipoRecursoId: typeId,
  unidadId: unitId,
  nombre: "Bomba visible",
  ownership: { kind: "ORGANIZATION", organizacionId: organizationId },
  valores: [{ atributoRecursoId: attributeId, valor: "rojo" }],
} satisfies FunctionArgs<ResourceApi["crearRecurso"]>;
const updateArgs = {
  recursoId: resourceId,
  expectedRevision: 7,
  claseRecursoId: classId,
  familiaRecursoId: familyId,
  tipoRecursoId: typeId,
  unidadId: unitId,
  ownership: { kind: "ORGANIZATION", organizacionId: organizationId },
  activo: false,
  identificadorTecnico: "v1|EQUIPO|BOMBA|CENTRIFUGA|COLOR=ROJO",
  nombre: "Bomba actualizada",
  descripcion: "Descripción actualizada",
  valores: [{ atributoRecursoId: attributeId, valor: "rojo" }],
} satisfies FunctionArgs<ResourceApi["actualizarRecurso"]>;
const lifecycleArgs = { recursoId: resourceId, expectedRevision: 7 } satisfies FunctionArgs<ResourceApi["activarRecurso"]>;

const create = useMutation(api.catalogoAdmin.recursos.crearRecurso);
const update = useMutation(api.catalogoAdmin.recursos.actualizarRecurso);
const activate = useMutation(api.catalogoAdmin.recursos.activarRecurso);
const deactivate = useMutation(api.catalogoAdmin.recursos.desactivarRecurso);

async function inspectMutations(): Promise<void> {
  const created: FunctionReturnType<ResourceApi["crearRecurso"]> = await create(createArgs);
  const updated: ChangeResult = await update(updateArgs);
  const activated: FunctionReturnType<ResourceApi["activarRecurso"]> = await activate(lifecycleArgs);
  const deactivated: FunctionReturnType<ResourceApi["desactivarRecurso"]> = await deactivate(lifecycleArgs);
  inspectDisposition(created);
  inspectDisposition(updated);
  inspectDisposition(activated);
  inspectDisposition(deactivated);
}

function inspectDisposition(result: MutationResult): void {
  if (result.disposition === "CREATED") {
    const createdRevision: number = result.item.revision;
    void createdRevision;
  } else if (result.disposition === "UPDATED") {
    const revised: number = result.item.revision;
    void revised;
  } else {
    const unchangedRevision: number = result.item.revision;
    void unchangedRevision;
  }
}

function describeAdminError(error: AdminErrorData): string {
  switch (error.code) {
    case "ADMIN_NOT_FOUND":
      return error.context.entity.kind;
    case "ADMIN_DUPLICATE_KEY":
      return error.context.normalizedIdentity ?? error.context.key ?? error.context.entityKind;
    case "ADMIN_INVALID_REFERENCE":
      return `${error.context.entityKind}:${error.context.field}:${error.context.reason}`;
    case "ADMIN_IMMUTABLE_FIELD":
      return `${error.context.entity.kind}:${error.context.field}`;
    case "ADMIN_STALE_REVISION":
      return `${error.context.expectedRevision}->${error.context.currentRevision}`;
    case "ADMIN_INVALID_STATE":
      return error.context.reason;
    case "ADMIN_DEPENDENCY_BLOCKED":
      return `${error.context.entity.kind}:${error.context.relationKind}:${error.context.blocker.kind}`;
    case "ADMIN_AGGREGATE_INCOMPLETE":
      return `${error.context.entity.kind}:${error.context.violations.length}`;
    case "ADMIN_CONFLICT":
      return error.context.conflictKind;
    case "ADMIN_INVALID_ARGUMENT":
      return `${error.context.field}:${error.context.reason}`;
    case "ADMIN_PUBLICATION_INVALID":
      return `${error.context.organizationId}:${error.context.violations.length}`;
  }
}

const generatedSummaryContract: Summary | undefined = firstSummary;
declare const nativeListPage: FunctionReturnType<ListReference>;
declare const nativeSearchPage: FunctionReturnType<SearchReference>;
inspectPaginatedState(listState, nativeListPage);
inspectPaginatedState(searchState, nativeSearchPage);

const legacyCreateArgs: FunctionArgs<typeof api.catalogoRecursos.recursos.crearRecurso> = {
  claseRecursoId: classId,
  familiaRecursoId: familyId,
  tipoRecursoId: typeId,
  unidadId: unitId,
  nombre: "Legacy resource",
  valores: [],
};
type LegacyCreateReturn = FunctionReturnType<typeof api.catalogoRecursos.recursos.crearRecurso>;
type LegacyDetailReturn = FunctionReturnType<typeof api.catalogoRecursos.recursos.obtenerDetalleRecurso>;
const legacyFields: keyof LegacyCreateReturn = "identificadorTecnico";
const legacyDetailFields: keyof NonNullable<LegacyDetailReturn> = "atributos";
const modelResource: DataModel["recursos"] = {} as DataModel["recursos"];
void [detail, searchSummary, listHasOnlyNativeControls, searchHasOnlyNativeControls, inspectPaginatedState, inspectDetail, inspectMutations, describeAdminError, generatedSummaryContract, legacyCreateArgs, legacyFields, legacyDetailFields, modelResource];
