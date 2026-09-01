import { paginationOptsValidator, paginationResultValidator, type PaginationResult } from "convex/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { resourceDetailValidator, resourceSummaryValidator, resourceOwnershipInputValidator, resourceValueInputValidator, type ResourceDetail, type ResourceSummary } from "./resourceValidators";
import { adminAggregateIncomplete, adminConflict, adminDuplicateKey, adminInvalidArgument, adminInvalidReference } from "./lib/errors";
import { cargarAgregado } from "./lib/cargarAgregado";
import { loadResourceValuesBounded, projectResourceDetail } from "./lib/recursoDetalle";
import { classificationStatusFromReferences, normalizeResourceSearchText, projectResourceSummary } from "./lib/recursoResumen";
import { lifecycleFilterValidator, createResultValidator } from "./validators";
import { buscarAliasExacto, buscarRecursoPorIdentidad, insertarRecursoAdministrativo } from "./lib/recursoPersistencia";
import { derivarIdentidadRecurso, validarRecursoAdministrativo, type CrearRecursoEntrada } from "../catalogoRecursos/validacionRecurso";
import { mapResourceValidationFailure } from "./lib/recursoValidacion";

const resourceScopeValidator = v.union(
  v.object({ kind: v.literal("ALL") }),
  v.object({ kind: v.literal("GLOBAL") }),
  v.object({ kind: v.literal("ORGANIZATION"), organizacionId: v.id("organizaciones") }),
);
type ResourceScope = Infer<typeof resourceScopeValidator>;
type ResourceListArgs = {
  paginationOpts: Infer<typeof paginationOptsValidator>;
  lifecycle?: Infer<typeof lifecycleFilterValidator>;
  tipoRecursoId?: Id<"tiposRecurso">;
  scope?: ResourceScope;
};
function scopeKey(scope: ResourceScope): string | undefined {
  if (scope.kind === "ALL") return undefined;
  return scope.kind === "GLOBAL" ? "GLOBAL" : `ORG:${scope.organizacionId}`;
}

function resourceIndexQuery(ctx: QueryCtx, args: ResourceListArgs) {
  const lifecycle = args.lifecycle ?? "ALL";
  const typeId = args.tipoRecursoId;
  const key = scopeKey(args.scope ?? { kind: "ALL" });
  const active = lifecycle === "ACTIVE" ? true : lifecycle === "INACTIVE" ? false : undefined;

  if (key === undefined) {
    if (typeId === undefined) {
      return active === undefined
        ? ctx.db.query("recursos").withIndex("porIdentificadorTecnico")
        : ctx.db.query("recursos").withIndex("porActivo", (q) => q.eq("activo", active));
    }
    return active === undefined
      ? ctx.db.query("recursos").withIndex("porTipo", (q) => q.eq("tipoRecursoId", typeId))
      : ctx.db.query("recursos").withIndex("porTipoYActivo", (q) => q.eq("tipoRecursoId", typeId).eq("activo", active));
  }

  if (typeId === undefined) {
    return active === undefined
      ? ctx.db.query("recursos").withIndex("adminPorScopeYTipoYActivo", (q) => q.eq("adminScopeKey", key))
      : ctx.db.query("recursos").withIndex("adminPorScopeYActivo", (q) => q.eq("adminScopeKey", key).eq("activo", active));
  }
  return active === undefined
    ? ctx.db.query("recursos").withIndex("adminPorScopeYTipoYActivo", (q) => q.eq("adminScopeKey", key).eq("tipoRecursoId", typeId))
    : ctx.db.query("recursos").withIndex("adminPorScopeYTipoYActivo", (q) => q.eq("adminScopeKey", key).eq("tipoRecursoId", typeId).eq("activo", active));
}

function resourceSearchQuery(ctx: QueryCtx, args: ResourceListArgs, searchText: string) {
  const lifecycle = args.lifecycle ?? "ALL";
  const active = lifecycle === "ACTIVE" ? true : lifecycle === "INACTIVE" ? false : undefined;
  const typeId = args.tipoRecursoId;
  const key = scopeKey(args.scope ?? { kind: "ALL" });

  return ctx.db.query("recursos").withSearchIndex("buscar", (q) => {
    let search = q.search("nombre", searchText);
    if (typeId !== undefined) search = search.eq("tipoRecursoId", typeId);
    if (active !== undefined) search = search.eq("activo", active);
    if (key !== undefined) search = search.eq("adminScopeKey", key);
    return search;
  });
}

async function summaryForResource(ctx: QueryCtx, resource: Doc<"recursos">): Promise<ResourceSummary> {
  const type = await ctx.db.get(resource.tipoRecursoId);
  const family = type === null ? null : await ctx.db.get(type.familiaRecursoId);
  const clazz = family === null ? null : await ctx.db.get(family.claseRecursoId);
  return projectResourceSummary(resource, classificationStatusFromReferences(resource, { type, family, clazz }));
}

function projectResourcePage(ctx: QueryCtx, page: Doc<"recursos">[]): Promise<ResourceSummary[]> {
  return Promise.all(page.map((resource) => summaryForResource(ctx, resource)));
}

function normalizeAdminText(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

export const crearRecurso = mutation({
  args: {
    claseRecursoId: v.id("clasesRecurso"),
    familiaRecursoId: v.id("familiasRecurso"),
    tipoRecursoId: v.id("tiposRecurso"),
    unidadId: v.id("unidades"),
    nombre: v.string(),
    descripcion: v.optional(v.string()),
    valores: v.array(resourceValueInputValidator),
    ownership: resourceOwnershipInputValidator,
  },
  returns: createResultValidator(resourceSummaryValidator),
  handler: async (ctx, args) => {
    const nombre = normalizeAdminText(args.nombre);
    if (nombre.length === 0) adminInvalidArgument({ field: "nombre", reason: "must not be blank after normalization" });
    const descripcion = args.descripcion === undefined ? undefined : normalizeAdminText(args.descripcion);
    const organizacionId = args.ownership.kind === "ORGANIZATION" ? args.ownership.organizacionId : undefined;
    const resourceEntity = { kind: "tiposRecurso" as const, id: args.tipoRecursoId };

    if (organizacionId !== undefined) {
      const organizacion = await ctx.db.get(organizacionId);
      if (!organizacion || !organizacion.activo) {
        adminInvalidReference({ entityKind: "recursos", field: "organizacionId", reference: { kind: "organizaciones", id: organizacionId }, reason: "RESOURCE_ORGANIZATION_MISSING_OR_INACTIVE" });
      }
    }

    const entrada: CrearRecursoEntrada = {
      claseRecursoId: args.claseRecursoId,
      familiaRecursoId: args.familiaRecursoId,
      tipoRecursoId: args.tipoRecursoId,
      unidadId: args.unidadId,
      nombre,
      ...(descripcion === undefined ? {} : { descripcion }),
      valores: args.valores,
    };
    const validacion = await validarRecursoAdministrativo(ctx, entrada);
    if (!validacion.ok) throw new ConvexError(mapResourceValidationFailure(validacion.code, resourceEntity));

    const aggregate = await cargarAgregado(ctx, args.tipoRecursoId);
    if (!aggregate.effective) {
      adminInvalidReference({ entityKind: "recursos", field: "classification", reference: resourceEntity, reason: "RESOURCE_CATALOG_NOT_EFFECTIVE" });
    }
    if (aggregate.status !== "VALID") {
      const violations = aggregate.violations.length > 0
        ? aggregate.violations.map(violation => ({ ...violation, entity: resourceEntity, field: "catalog" }))
        : [{ code: "ASSIGNMENT_SELECTION_INVALID" as const, entity: resourceEntity, field: "catalog", detail: "effective aggregate was not evaluated" }];
      adminAggregateIncomplete({ entity: resourceEntity, violations });
    }

    const identificadorTecnico = await derivarIdentidadRecurso(ctx, validacion.value, args.valores);
    const duplicate = await buscarRecursoPorIdentidad(ctx, { organizacionId, identificadorTecnico });
    if (duplicate) adminDuplicateKey({ entityKind: "recursos", normalizedIdentity: identificadorTecnico, scope: deriveScopeKey(organizacionId) });
    if (organizacionId !== undefined) {
      const alias = await buscarAliasExacto(ctx, { organizacionId, version: 1, clave: identificadorTecnico });
      if (alias) adminConflict({ entity: resourceEntity, conflictKind: "resource-alias", conflictingEntity: { kind: "identidadesRecurso", id: alias._id }, normalizedIdentity: identificadorTecnico });
    }

    const recursoId = await insertarRecursoAdministrativo(ctx, {
      tipoRecursoId: args.tipoRecursoId,
      unidadId: args.unidadId,
      identificadorTecnico,
      nombre,
      descripcion,
      ownership: { organizacionId },
      valores: args.valores,
    });
    const recurso = await ctx.db.get(recursoId);
    if (!recurso) throw new Error("Resource disappeared after insertion");
    return { disposition: "CREATED" as const, item: await summaryForResource(ctx, recurso) };
  },
});

function deriveScopeKey(organizacionId: Id<"organizaciones"> | undefined): string {
  return organizacionId === undefined ? "GLOBAL" : `ORG:${organizacionId}`;
}

export const listarRecursosResumen = query({
  args: {
    paginationOpts: paginationOptsValidator,
    lifecycle: v.optional(lifecycleFilterValidator),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    scope: v.optional(resourceScopeValidator),
  },
  returns: paginationResultValidator(resourceSummaryValidator),
  handler: async (ctx, args): Promise<PaginationResult<ResourceSummary>> => {
    const page = await resourceIndexQuery(ctx, args).paginate(args.paginationOpts);
    return {
      ...page,
      page: await projectResourcePage(ctx, page.page),
    };
  },
});

export const buscarRecursosResumen = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchText: v.string(),
    lifecycle: v.optional(lifecycleFilterValidator),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    scope: v.optional(resourceScopeValidator),
  },
  returns: paginationResultValidator(resourceSummaryValidator),
  handler: async (ctx, args): Promise<PaginationResult<ResourceSummary>> => {
    const searchText = normalizeResourceSearchText(args.searchText);
    if (searchText.length === 0) {
      adminInvalidArgument({ field: "searchText", reason: "must not be blank after normalization" });
    }
    const page = await resourceSearchQuery(ctx, args, searchText).paginate(args.paginationOpts);
    return {
      ...page,
      page: await projectResourcePage(ctx, page.page),
    };
  },
});

type ResourceReferenceTable = "clasesRecurso" | "familiasRecurso" | "tiposRecurso" | "unidades" | "organizaciones";

function resourceReference<T extends ResourceReferenceTable>(document: {
  _id: Id<T>;
  clave: string;
  nombre: string;
  activo: boolean;
  revision: number;
}) {
  return { id: document._id, clave: document.clave, nombre: document.nombre, activo: document.activo, revision: document.revision };
}

function resourceUnitReference(document: Doc<"unidades">): ResourceDetail["unidad"] {
  return { ...resourceReference(document), simbolo: document.simbolo ?? null };
}

export const obtenerDetalleRecurso = query({
  args: { recursoId: v.id("recursos") },
  returns: v.union(resourceDetailValidator, v.null()),
  handler: async (ctx, { recursoId }): Promise<ResourceDetail | null> => {
    const recurso = await ctx.db.get(recursoId);
    if (!recurso) return null;

    const tipo = await ctx.db.get(recurso.tipoRecursoId);
    const familia = tipo ? await ctx.db.get(tipo.familiaRecursoId) : null;
    const clase = familia ? await ctx.db.get(familia.claseRecursoId) : null;
    const unidad = await ctx.db.get(recurso.unidadId);
    const organizacion = recurso.organizacionId ? await ctx.db.get(recurso.organizacionId) : null;
    const classificationStatus = classificationStatusFromReferences(recurso, { type: tipo, family: familia, clazz: clase });
    const summary = projectResourceSummary(recurso, classificationStatus);
    const aggregate = await cargarAgregado(ctx, recurso.tipoRecursoId);
    const valores = await loadResourceValuesBounded(ctx, recursoId);

    return projectResourceDetail(summary, {
      descripcion: recurso.descripcion ?? null,
      identidadVersion: recurso.identidadVersion ?? null,
      clase: clase ? resourceReference(clase) : null,
      familia: familia ? resourceReference(familia) : null,
      tipo: tipo ? resourceReference(tipo) : null,
      unidad: unidad ? resourceUnitReference(unidad) : null,
      organizacion: organizacion ? resourceReference(organizacion) : null,
      catalogDiagnostics: {
        hierarchy: classificationStatus,
        aggregateStatus: aggregate.status,
        violations: aggregate.violations,
      },
      valores,
    });
  },
});
