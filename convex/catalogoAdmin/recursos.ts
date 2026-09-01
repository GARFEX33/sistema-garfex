import { paginationOptsValidator, paginationResultValidator, type PaginationResult } from "convex/server";
import { v, type Infer } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { resourceSummaryValidator, type ResourceSummary } from "./resourceValidators";
import { classificationStatusFromReferences, projectResourceSummary } from "./lib/recursoResumen";
import { lifecycleFilterValidator } from "./validators";

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

async function summaryForResource(ctx: QueryCtx, resource: Doc<"recursos">): Promise<ResourceSummary> {
  const type = await ctx.db.get(resource.tipoRecursoId);
  const family = type === null ? null : await ctx.db.get(type.familiaRecursoId);
  const clazz = family === null ? null : await ctx.db.get(family.claseRecursoId);
  return projectResourceSummary(resource, classificationStatusFromReferences(resource, { type, family, clazz }));
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
      page: await Promise.all(page.page.map((resource) => summaryForResource(ctx, resource))),
    };
  },
});
