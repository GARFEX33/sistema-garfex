import { mutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { adminInvalidReference, adminPublicationInvalid } from "./lib/errors";
import { consumeCursor, createCursor, ORDERING_VERSION, validatePageSize } from "./lib/pagination";
import { adminPageValidator, type Violation } from "./validators";
import { publicarCatalogoEnTransaccion } from "../catalogoRecursos/catalogoPublicado";
import { snapshotResultadoValidator } from "../catalogoRecursos/catalogoPublicadoValidators";

const revisionDetail = v.object({
  revisionId: v.id("catalogoRevisiones"),
  numero: v.number(),
  hashContenido: v.string(),
  creadoEn: v.number(),
  publicadoEn: v.number(),
});

const revisionArgs = {
  organizacionId: v.id("organizaciones"),
  revisionId: v.id("catalogoRevisiones"),
};

function violationFor(error: unknown): Violation {
  const message = error instanceof Error ? error.message : "publication aggregate is invalid";
  const coded = /^(HIERARCHY_REFERENCE_INVALID|PRINCIPAL_UNIT_COUNT|UNIT_INACTIVE|OPTION_SET_EMPTY|ASSIGNMENT_SELECTION_INVALID|RULE_REFERENCE_INVALID|RULE_RESULT_INVALID|RULE_CONFLICT|PRESENTATION_COUNT|PRESENTATION_TOKEN_INVALID|COMPATIBILITY_POLICY_CONFLICT|COMPATIBILITY_RELATION_INVALID|ALLOWLIST_EMPTY|TYPE_KEY_AMBIGUOUS|CATALOG_LIMIT_EXCEEDED):(.*)$/.exec(message);
  if (coded) return { code: coded[1] as Violation["code"], detail: coded[2] || undefined };
  if (message.startsWith("TYPE_KEY_AMBIGUOUS")) return { code: "TYPE_KEY_AMBIGUOUS", detail: message.slice("TYPE_KEY_AMBIGUOUS:".length) };
  if (message === "CATALOG_LIMIT_EXCEEDED") return { code: "CATALOG_LIMIT_EXCEEDED", detail: "publication exceeds the bounded catalog limit" };
  if (message.includes("unidad natural")) return { code: message.includes("inválida") ? "UNIT_INACTIVE" : "PRINCIPAL_UNIT_COUNT", detail: message };
  if (message.includes("presentación")) return { code: "PRESENTATION_COUNT", detail: message };
  if (message.includes("atributo no efectivo")) return { code: "PRESENTATION_TOKEN_INVALID", detail: message };
  if (message.includes("compatibilidad")) return { code: "COMPATIBILITY_RELATION_INVALID", detail: message };
  return { code: "ASSIGNMENT_SELECTION_INVALID", detail: message };
}

export const publicarCatalogo = mutation({
  args: { organizacionId: v.id("organizaciones") },
  returns: v.object({ disposition: v.union(v.literal("CREATED"), v.literal("UNCHANGED")), revisionId: v.id("catalogoRevisiones"), numero: v.number(), hashContenido: v.string() }),
  handler: async (ctx, { organizacionId }) => {
    const organization = await ctx.db.get(organizacionId);
    if (!organization) adminInvalidReference({ entityKind: "organizaciones", field: "organizacionId", reason: "organization does not exist" });
    if (!organization!.activo) adminInvalidReference({ entityKind: "organizaciones", field: "organizacionId", reason: "organization is inactive" });
    try {
      return await publicarCatalogoEnTransaccion(ctx as MutationCtx, organizacionId);
    } catch (error) {
      return adminPublicationInvalid({ organizationId: organizacionId, violations: [violationFor(error)] });
    }
  },
});

const historyContext = (organizacionId: Id<"organizaciones">, estado: "PUBLISHED" | null) => ({
  filters: { organizacionId, estado }, mode: "ALL" as const, plan: estado ? "porOrganizacionYEstadoYNumeroYAdminSort" : "porOrganizacionYNumero", order: ORDERING_VERSION,
});

export const listarRevisiones = query({
  args: { organizacionId: v.id("organizaciones"), estado: v.optional(v.literal("PUBLISHED")), cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()) },
  returns: adminPageValidator(revisionDetail),
  handler: async (ctx, args) => {
    const estado = args.estado ?? null;
    const context = historyContext(args.organizacionId, estado);
    const cursor = await consumeCursor(args.cursor ?? null, context);
    const indexed = estado
      ? ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYEstadoYNumeroYAdminSort", q => q.eq("organizacionId", args.organizacionId).eq("estado", estado)).order("desc")
      : ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYNumero", q => q.eq("organizacionId", args.organizacionId)).order("desc");
    const page = await indexed.paginate({ numItems: validatePageSize(args.pageSize), cursor });
    return {
      items: page.page.map(revision => ({ revisionId: revision._id, numero: revision.numero, hashContenido: revision.hashContenido, creadoEn: revision.creadoEn, publicadoEn: revision.publicadoEn })),
      continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, context),
      isExhausted: page.isDone,
    };
  },
});

export const obtenerRevision = query({
  args: revisionArgs,
  returns: v.union(revisionDetail, v.null()),
  handler: async (ctx, { organizacionId, revisionId }) => {
    const revision = await ctx.db.get(revisionId);
    if (!revision || revision.organizacionId !== organizacionId) return null;
    return { revisionId: revision._id, numero: revision.numero, hashContenido: revision.hashContenido, creadoEn: revision.creadoEn, publicadoEn: revision.publicadoEn };
  },
});

export const obtenerSnapshotTipo = query({
  args: { organizacionId: v.id("organizaciones"), revisionId: v.id("catalogoRevisiones"), tipoClave: v.string() },
  returns: v.union(snapshotResultadoValidator, v.null()),
  handler: async (ctx, { organizacionId, revisionId, tipoClave }) => {
    const revision = await ctx.db.get(revisionId);
    if (!revision || revision.organizacionId !== organizacionId) return null;
    const stored = await ctx.db.query("catalogoTipoSnapshots").withIndex("porRevisionYTipo", q => q.eq("revisionId", revisionId).eq("tipoClave", tipoClave)).first();
    return stored ? { revisionId: stored.revisionId, tipoClave: stored.tipoClave, snapshot: stored.snapshot } : null;
  },
});
