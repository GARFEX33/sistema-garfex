import { paginationOptsValidator, paginationResultValidator, type PaginationResult } from "convex/server";
import { ConvexError, v, type Infer } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { MAX_RESOURCE_VALUES, resourceDetailValidator, resourceSummaryValidator, resourceOwnershipInputValidator, resourceValueInputValidator, type ResourceDetail, type ResourceSummary } from "./resourceValidators";
import { adminAggregateIncomplete, adminConflict, adminDuplicateKey, adminInvalidArgument, adminInvalidReference, adminImmutableField, adminInvalidState, adminNotFound, adminStaleRevision } from "./lib/errors";
import { cargarAgregado } from "./lib/cargarAgregado";
import { loadResourceValuesBounded, projectResourceDetail } from "./lib/recursoDetalle";
import { classificationStatusFromReferences, normalizeResourceSearchText, projectResourceSummary } from "./lib/recursoResumen";
import { lifecycleFilterValidator, createResultValidator, changeResultValidator } from "./validators";
import { applyLifecycleChange } from "./lib/revisions";
import { buscarAliasExacto, buscarRecursoPorIdentidad, insertarRecursoAdministrativo, reemplazarValoresRecurso } from "./lib/recursoPersistencia";
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
  claseRecursoId?: Id<"clasesRecurso">;
  familiaRecursoId?: Id<"familiasRecurso">;
  scope?: ResourceScope;
};
function scopeKey(scope: ResourceScope): string | undefined {
  if (scope.kind === "ALL") return undefined;
  return scope.kind === "GLOBAL" ? "GLOBAL" : `ORG:${scope.organizacionId}`;
}

function hierarchySelector(args: ResourceListArgs): "tipo" | "clase" | "familia" | undefined {
  const count = Number(args.tipoRecursoId !== undefined) + Number(args.claseRecursoId !== undefined) + Number(args.familiaRecursoId !== undefined);
  if (count > 1) adminInvalidArgument({ field: "classification", reason: "only one hierarchy selector may be supplied" });
  if (args.tipoRecursoId !== undefined) return "tipo";
  if (args.claseRecursoId !== undefined) return "clase";
  return args.familiaRecursoId === undefined ? undefined : "familia";
}

function resourceIndexQuery(ctx: QueryCtx, args: ResourceListArgs) {
  const active = args.lifecycle === "ACTIVE" ? true : args.lifecycle === "INACTIVE" ? false : undefined;
  const key = scopeKey(args.scope ?? { kind: "ALL" });
  const selector = hierarchySelector(args);
  if (key === undefined) {
    if (selector === "tipo") return active === undefined ? ctx.db.query("recursos").withIndex("porTipo", q => q.eq("tipoRecursoId", args.tipoRecursoId!)) : ctx.db.query("recursos").withIndex("porTipoYActivo", q => q.eq("tipoRecursoId", args.tipoRecursoId!).eq("activo", active));
    if (selector === "clase") return ctx.db.query("recursos").withIndex("porClaseYActivo", q => active === undefined ? q.eq("claseRecursoId", args.claseRecursoId!) : q.eq("claseRecursoId", args.claseRecursoId!).eq("activo", active));
    if (selector === "familia") return ctx.db.query("recursos").withIndex("porFamiliaYActivo", q => active === undefined ? q.eq("familiaRecursoId", args.familiaRecursoId!) : q.eq("familiaRecursoId", args.familiaRecursoId!).eq("activo", active));
    return active === undefined ? ctx.db.query("recursos").withIndex("porIdentificadorTecnico") : ctx.db.query("recursos").withIndex("porActivo", q => q.eq("activo", active));
  }
  if (selector === "tipo") return ctx.db.query("recursos").withIndex("adminPorScopeYTipoYActivo", q => active === undefined ? q.eq("adminScopeKey", key).eq("tipoRecursoId", args.tipoRecursoId!) : q.eq("adminScopeKey", key).eq("tipoRecursoId", args.tipoRecursoId!).eq("activo", active));
  if (selector === "clase") return ctx.db.query("recursos").withIndex("adminPorScopeYClaseYActivo", q => active === undefined ? q.eq("adminScopeKey", key).eq("claseRecursoId", args.claseRecursoId!) : q.eq("adminScopeKey", key).eq("claseRecursoId", args.claseRecursoId!).eq("activo", active));
  if (selector === "familia") return ctx.db.query("recursos").withIndex("adminPorScopeYFamiliaYActivo", q => active === undefined ? q.eq("adminScopeKey", key).eq("familiaRecursoId", args.familiaRecursoId!) : q.eq("adminScopeKey", key).eq("familiaRecursoId", args.familiaRecursoId!).eq("activo", active));
  return active === undefined ? ctx.db.query("recursos").withIndex("adminPorScopeYTipoYActivo", q => q.eq("adminScopeKey", key)) : ctx.db.query("recursos").withIndex("adminPorScopeYActivo", q => q.eq("adminScopeKey", key).eq("activo", active));
}

function resourceSearchQuery(ctx: QueryCtx, args: ResourceListArgs, searchText: string) {
  const active = args.lifecycle === "ACTIVE" ? true : args.lifecycle === "INACTIVE" ? false : undefined;
  const key = scopeKey(args.scope ?? { kind: "ALL" });
  const selector = hierarchySelector(args);
  return ctx.db.query("recursos").withSearchIndex("buscar", (q) => {
    let search = q.search("nombre", searchText);
    if (selector === "tipo") search = search.eq("tipoRecursoId", args.tipoRecursoId!);
    if (selector === "clase") search = search.eq("claseRecursoId", args.claseRecursoId!);
    if (selector === "familia") search = search.eq("familiaRecursoId", args.familiaRecursoId!);
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
      claseRecursoId: args.claseRecursoId,
      familiaRecursoId: args.familiaRecursoId,
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
    claseRecursoId: v.optional(v.id("clasesRecurso")),
    familiaRecursoId: v.optional(v.id("familiasRecurso")),
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
    claseRecursoId: v.optional(v.id("clasesRecurso")),
    familiaRecursoId: v.optional(v.id("familiasRecurso")),
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

function resourceValuesEqual(left: Array<{ atributoRecursoId: Id<"atributosRecurso">; valor: string | number | boolean; opcionAtributoId?: Id<"opcionesAtributo"> }>, right: Array<{ atributoRecursoId: Id<"atributosRecurso">; valor: string | number | boolean; opcionAtributoId?: Id<"opcionesAtributo"> }>): boolean {
  if (left.length !== right.length) return false;
  const ordered = (values: typeof left) => [...values].sort((a, b) => String(a.atributoRecursoId).localeCompare(String(b.atributoRecursoId)));
  const rightOrdered = ordered(right);
  return ordered(left).every((value, index) => {
    const other = rightOrdered[index];
    return value.atributoRecursoId === other.atributoRecursoId && value.valor === other.valor && value.opcionAtributoId === other.opcionAtributoId;
  });
}

async function validateCurrentResourceAggregate(ctx: QueryCtx, tipoRecursoId: Id<"tiposRecurso">, entity: { kind: "recursos"; id: Id<"recursos"> }): Promise<void> {
  const aggregate = await cargarAgregado(ctx, tipoRecursoId);
  if (!aggregate.effective) adminInvalidReference({ entityKind: "recursos", field: "classification", reference: { kind: "tiposRecurso", id: tipoRecursoId }, reason: "RESOURCE_CATALOG_NOT_EFFECTIVE" });
  if (aggregate.status !== "VALID") {
    const violations = aggregate.violations.length > 0
      ? aggregate.violations.map(violation => ({ ...violation, entity, field: "catalog" }))
      : [{ code: "ASSIGNMENT_SELECTION_INVALID" as const, entity, field: "catalog", detail: "effective aggregate was not evaluated" }];
    adminAggregateIncomplete({ entity, violations });
  }
}

export const actualizarRecurso = mutation({
  args: {
    recursoId: v.id("recursos"),
    expectedRevision: v.number(),
    claseRecursoId: v.optional(v.id("clasesRecurso")),
    familiaRecursoId: v.optional(v.id("familiasRecurso")),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    unidadId: v.optional(v.id("unidades")),
    // Echoes are immutable read-back guards; lifecycle and identity remain server-owned.
    activo: v.optional(v.boolean()),
    identificadorTecnico: v.optional(v.string()),
    nombre: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    valores: v.optional(v.array(resourceValueInputValidator)),
    ownership: v.optional(resourceOwnershipInputValidator),
  },
  returns: changeResultValidator(resourceSummaryValidator),
  handler: async (ctx, args) => {
    const actual = await ctx.db.get(args.recursoId);
    const entity = { kind: "recursos" as const, id: args.recursoId };
    if (!actual) adminNotFound({ entity });
    if (!Number.isInteger(args.expectedRevision) || args.expectedRevision <= 0) {
      adminInvalidArgument({ field: "expectedRevision", reason: "must be a positive integer" });
    }
    if (actual!.revision !== args.expectedRevision) {
      adminStaleRevision({ entity, expectedRevision: args.expectedRevision, currentRevision: actual!.revision });
    }
    if (args.activo !== undefined && args.activo !== actual!.activo) adminImmutableField({ entity, field: "activo" });
    if (args.identificadorTecnico !== undefined && args.identificadorTecnico !== actual!.identificadorTecnico) adminImmutableField({ entity, field: "identificadorTecnico" });

    const tipo = await ctx.db.get(actual!.tipoRecursoId);
    const familia = tipo ? await ctx.db.get(tipo.familiaRecursoId) : null;
    const clase = familia ? await ctx.db.get(familia.claseRecursoId) : null;
    if (!tipo || !familia || !clase) {
      adminInvalidReference({ entityKind: "recursos", field: "classification", reference: { kind: "tiposRecurso", id: actual!.tipoRecursoId }, reason: "RESOURCE_HIERARCHY_OR_UNIT_INVALID" });
    }
    if (args.claseRecursoId !== undefined && args.claseRecursoId !== clase!._id) adminImmutableField({ entity, field: "claseRecursoId" });
    if (args.familiaRecursoId !== undefined && args.familiaRecursoId !== familia!._id) adminImmutableField({ entity, field: "familiaRecursoId" });
    if (args.tipoRecursoId !== undefined && args.tipoRecursoId !== actual!.tipoRecursoId) adminImmutableField({ entity, field: "tipoRecursoId" });
    const currentOwnership = actual!.organizacionId === undefined
      ? { kind: "GLOBAL" as const }
      : { kind: "ORGANIZATION" as const, organizacionId: actual!.organizacionId };
    if (args.ownership !== undefined && (args.ownership.kind !== currentOwnership.kind || (args.ownership.kind === "ORGANIZATION" && args.ownership.organizacionId !== currentOwnership.organizacionId))) {
      adminImmutableField({ entity, field: "ownership" });
    }

    if (actual!.organizacionId !== undefined) {
      const organization = await ctx.db.get(actual!.organizacionId);
      if (!organization || !organization.activo) {
        adminInvalidReference({ entityKind: "recursos", field: "organizacionId", reference: { kind: "organizaciones", id: actual!.organizacionId }, reason: "RESOURCE_ORGANIZATION_MISSING_OR_INACTIVE" });
      }
    }
    const previousValues = await loadResourceValuesBounded(ctx, actual!._id);
    const candidateValues = args.valores === undefined
      ? previousValues.map(({ atributoRecursoId, valor, opcionAtributoId }) => ({ atributoRecursoId, valor, ...(opcionAtributoId === undefined ? {} : { opcionAtributoId }) }))
      : args.valores;
    if (candidateValues.length > MAX_RESOURCE_VALUES) {
      adminInvalidState({ entity, field: "valores", reason: "RESOURCE_VALUE_LIMIT_EXCEEDED: maximum 200 rows", violations: [{ code: "RESOURCE_VALUE_LIMIT_EXCEEDED", entity, field: "valores", count: candidateValues.length, detail: "maximum 200 rows" }] });
    }
    const candidate: CrearRecursoEntrada = {
      claseRecursoId: clase!._id,
      familiaRecursoId: familia!._id,
      tipoRecursoId: actual!.tipoRecursoId,
      unidadId: args.unidadId ?? actual!.unidadId,
      nombre: args.nombre === undefined ? actual!.nombre : normalizeAdminText(args.nombre),
      descripcion: args.descripcion === undefined ? actual!.descripcion : normalizeAdminText(args.descripcion),
      valores: candidateValues,
    };
    if (candidate.nombre.length === 0) adminInvalidArgument({ field: "nombre", reason: "must not be blank after normalization" });
    const validacion = await validarRecursoAdministrativo(ctx, candidate);
    if (!validacion.ok) throw new ConvexError(mapResourceValidationFailure(validacion.code, entity));
    await validateCurrentResourceAggregate(ctx, actual!.tipoRecursoId, entity);

    if (candidate.nombre === actual!.nombre && candidate.descripcion === actual!.descripcion && candidate.unidadId === actual!.unidadId && resourceValuesEqual(candidate.valores, previousValues)) {
      return { disposition: "UNCHANGED" as const, item: await summaryForResource(ctx, actual!) };
    }

    const identificadorTecnico = await derivarIdentidadRecurso(ctx, validacion.value, candidate.valores);
    if (actual!.organizacionId !== undefined && identificadorTecnico !== actual!.identificadorTecnico) {
      adminImmutableField({ entity, field: "identificadorTecnico" });
    }
    if (identificadorTecnico !== actual!.identificadorTecnico) {
      const duplicate = await buscarRecursoPorIdentidad(ctx, { organizacionId: actual!.organizacionId, identificadorTecnico });
      if (duplicate && duplicate._id !== actual!._id) adminDuplicateKey({ entityKind: "recursos", normalizedIdentity: identificadorTecnico, scope: deriveScopeKey(actual!.organizacionId) });
    }

    await reemplazarValoresRecurso(ctx, actual!._id, previousValues, candidate.valores);
    await ctx.db.patch(actual!._id, {
      unidadId: candidate.unidadId,
      identificadorTecnico,
      nombre: candidate.nombre,
      ...(candidate.descripcion === undefined ? {} : { descripcion: candidate.descripcion }),
      revision: actual!.revision + 1,
    });
    const updated = await ctx.db.get(actual!._id);
    if (!updated) throw new Error("Resource disappeared after update");
    return { disposition: "UPDATED" as const, item: await summaryForResource(ctx, updated) };
  },
});

async function validateResourceActivation(ctx: MutationCtx, next: Doc<"recursos">, entity: { kind: "recursos"; id: Id<"recursos"> }): Promise<void> {
  const type = await ctx.db.get(next.tipoRecursoId);
  const family = type ? await ctx.db.get(type.familiaRecursoId) : null;
  const clazz = family ? await ctx.db.get(family.claseRecursoId) : null;
  if (!type || !family || !clazz) {
    adminInvalidReference({ entityKind: "recursos", field: "classification", reference: { kind: "tiposRecurso", id: next.tipoRecursoId }, reason: "RESOURCE_HIERARCHY_OR_UNIT_INVALID" });
  }
  if (next.organizacionId !== undefined) {
    const organization = await ctx.db.get(next.organizacionId);
    if (!organization || !organization.activo) {
      adminInvalidReference({ entityKind: "recursos", field: "organizacionId", reference: { kind: "organizaciones", id: next.organizacionId }, reason: "RESOURCE_ORGANIZATION_MISSING_OR_INACTIVE" });
    }
  }
  const storedValues = await loadResourceValuesBounded(ctx, next._id);
  const valores = storedValues.map(({ atributoRecursoId, valor, opcionAtributoId }) => ({ atributoRecursoId, valor, ...(opcionAtributoId === undefined ? {} : { opcionAtributoId }) }));
  const candidate: CrearRecursoEntrada = {
    claseRecursoId: clazz!._id,
    familiaRecursoId: family!._id,
    tipoRecursoId: type!._id,
    unidadId: next.unidadId,
    nombre: next.nombre,
    descripcion: next.descripcion,
    valores,
  };
  const validation = await validarRecursoAdministrativo(ctx, candidate);
  if (!validation.ok) throw new ConvexError(mapResourceValidationFailure(validation.code, entity));
  await validateCurrentResourceAggregate(ctx, next.tipoRecursoId, entity);

  const derivedIdentity = await derivarIdentidadRecurso(ctx, validation.value, valores);
  if (next.organizacionId !== undefined && derivedIdentity !== next.identificadorTecnico) {
    adminImmutableField({ entity, field: "identificadorTecnico" });
  }
  const duplicate = await buscarRecursoPorIdentidad(ctx, { organizacionId: next.organizacionId, identificadorTecnico: derivedIdentity, excludeRecursoId: next._id });
  if (duplicate && duplicate._id !== next._id) adminDuplicateKey({ entityKind: "recursos", normalizedIdentity: derivedIdentity, scope: deriveScopeKey(next.organizacionId) });
  if (next.organizacionId !== undefined) {
    const alias = await buscarAliasExacto(ctx, { organizacionId: next.organizacionId, version: next.identidadVersion ?? 1, clave: derivedIdentity });
    if (alias && alias.recursoId !== next._id) adminConflict({ entity, conflictKind: "resource-alias", conflictingEntity: { kind: "identidadesRecurso", id: alias._id }, normalizedIdentity: derivedIdentity });
  }
  next.identificadorTecnico = derivedIdentity;
}

export const activarRecurso = mutation({
  args: { recursoId: v.id("recursos"), expectedRevision: v.number() },
  returns: changeResultValidator(resourceSummaryValidator),
  handler: async (ctx, args) => {
    const entity = { kind: "recursos" as const, id: args.recursoId };
    const result = await applyLifecycleChange<Doc<"recursos">>({
      load: () => ctx.db.get(args.recursoId),
      expectedRevision: args.expectedRevision,
      entity,
      targetActive: true,
      validate: next => validateResourceActivation(ctx, next, entity),
      patch: next => ctx.db.patch(next._id, { activo: true, identificadorTecnico: next.identificadorTecnico, revision: next.revision }),
    });
    return { disposition: result.disposition, item: await summaryForResource(ctx, result.item) };
  },
});

export const desactivarRecurso = mutation({
  args: { recursoId: v.id("recursos"), expectedRevision: v.number() },
  returns: changeResultValidator(resourceSummaryValidator),
  handler: async (ctx, args) => {
    const entity = { kind: "recursos" as const, id: args.recursoId };
    const result = await applyLifecycleChange<Doc<"recursos">>({
      load: () => ctx.db.get(args.recursoId),
      expectedRevision: args.expectedRevision,
      entity,
      targetActive: false,
      patch: next => ctx.db.patch(next._id, { activo: false, revision: next.revision }),
    });
    return { disposition: result.disposition, item: await summaryForResource(ctx, result.item) };
  },
});
