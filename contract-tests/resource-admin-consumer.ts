import { usePaginatedQuery } from "convex/react";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { api } from "sistema-garfex/convex-api";
import type { Id } from "sistema-garfex/convex-data-model";

declare const organizationId: Id<"organizaciones">;
declare const typeId: Id<"tiposRecurso">;

type ResourceListArgs = Omit<
  FunctionArgs<typeof api.catalogoAdmin.recursos.listarRecursosResumen>,
  "paginationOpts"
>;
type ResourceSummary = FunctionReturnType<
  typeof api.catalogoAdmin.recursos.listarRecursosResumen
>["page"][number];

const resourceArgs = {
  lifecycle: "ACTIVE",
  tipoRecursoId: typeId,
  scope: { kind: "ORGANIZATION", organizacionId: organizationId },
} satisfies ResourceListArgs;

const resourcePage = usePaginatedQuery(
  api.catalogoAdmin.recursos.listarRecursosResumen,
  resourceArgs,
  { initialNumItems: 25 },
);

const firstSummary: ResourceSummary | undefined = resourcePage.results[0];
const resourceId: Id<"recursos"> | undefined = firstSummary?.id;
const technicalIdentity: string | undefined = firstSummary?.identificadorTecnico;
const resourceName: string | undefined = firstSummary?.nombre;
const resourceTypeId: Id<"tiposRecurso"> | undefined = firstSummary?.tipoRecursoId;
const resourceUnitId: Id<"unidades"> | undefined = firstSummary?.unidadId;
const resourceOrganizationId: Id<"organizaciones"> | undefined = firstSummary?.organizacionId;
const active: boolean | undefined = firstSummary?.activo;
const revision: number | undefined = firstSummary?.revision;
const classificationState: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE" | undefined = firstSummary?.classificationStatus.state;
const status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted" = resourcePage.status;
resourcePage.loadMore(25);
void [resourceId, technicalIdentity, resourceName, resourceTypeId, resourceUnitId, resourceOrganizationId, active, revision, classificationState, status];
