import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { api } from "sistema-garfex/convex-api";
import type { DataModel, Id } from "sistema-garfex/convex-data-model";
import type { AdminErrorData } from "sistema-garfex/catalog-admin-errors";

declare function useQuery<Q extends FunctionReference<"query">>(reference: Q, args: FunctionArgs<Q>): FunctionReturnType<Q>;
declare function useMutation<M extends FunctionReference<"mutation">>(reference: M, args: FunctionArgs<M>): Promise<FunctionReturnType<M>>;
declare const organizationId: Id<"organizaciones">;
declare const classId: Id<"clasesRecurso">;
declare const typeId: Id<"tiposRecurso">;
declare const revisionId: Id<"catalogoRevisiones">;

const classesArgs = {
  cursor: null,
  pageSize: 25,
  modo: "ALL",
} satisfies FunctionArgs<typeof api.catalogoAdmin.jerarquia.listarClases>;
const classes = useQuery(api.catalogoAdmin.jerarquia.listarClases, classesArgs);
const classCursor: string | null = classes.continuationCursor;
const classEffective: boolean = classes.items[0]?.effective ?? false;

const units = useQuery(api.catalogoAdmin.unidades.listarUnidades, { cursor: null, pageSize: 10 });
const definitions = useQuery(api.catalogoAdmin.atributos.listarDefinicionesAtributo, { cursor: null, pageSize: 10 });
const rules = useQuery(api.catalogoAdmin.reglas.listarReglasAtributo, { cursor: null, pageSize: 10 });
const presentations = useQuery(api.catalogoAdmin.presentacion.listarPoliticasPresentacion, { cursor: null, pageSize: 10 });
const compatibility = useQuery(api.catalogoAdmin.compatibilidad.listarPoliticasCompatibilidad, { cursor: null, pageSize: 10 });
const revisions = useQuery(api.catalogoAdmin.publicacion.listarRevisiones, { organizacionId: organizationId, cursor: null, pageSize: 10 });

const classById = useQuery(api.catalogoAdmin.jerarquia.obtenerClase, { claseRecursoId: classId });
const snapshot = useQuery(api.catalogoAdmin.publicacion.obtenerSnapshotTipo, {
  organizacionId: organizationId,
  revisionId,
  tipoClave: "chair",
});
const published = useMutation(api.catalogoAdmin.publicacion.publicarCatalogo, { organizacionId: organizationId });

async function publishedLabel(): Promise<string> {
  return publicationLabel(await published);
}

const checkPagination = [
  classCursor,
  classes.isExhausted,
  units.continuationCursor,
  definitions.items,
  rules.isExhausted,
  presentations.continuationCursor,
  compatibility.items,
  revisions.isExhausted,
  classById,
  snapshot,
];
void checkPagination;

function publicationLabel(result: FunctionReturnType<typeof api.catalogoAdmin.publicacion.publicarCatalogo>): string {
  if (result.disposition === "CREATED") return `${result.revisionId}:${result.numero}`;
  return `unchanged:${result.hashContenido}`;
}

function handleAdminError(error: AdminErrorData): string {
  if (error.code === "ADMIN_STALE_REVISION") {
    return `${error.context.expectedRevision}->${error.context.currentRevision}`;
  }
  if (error.code === "ADMIN_PUBLICATION_INVALID") {
    return error.context.violations[0]?.code ?? "valid";
  }
  return error.code;
}

const table: DataModel["tiposRecurso"] = {} as DataModel["tiposRecurso"];
void [publishedLabel, typeId, table, publicationLabel, handleAdminError];
