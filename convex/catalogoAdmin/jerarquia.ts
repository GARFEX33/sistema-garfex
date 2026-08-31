import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { adminPageValidator, lifecycleFilterValidator } from "./validators";
import { consumeCursor, createCursor, ORDERING_VERSION, validatePageSize } from "./lib/pagination";

const claseDetalle = v.object({
  id: v.id("clasesRecurso"),
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  activo: v.boolean(),
  revision: v.number(),
  effective: v.boolean(),
  effectiveReasons: v.array(v.string()),
});
const planAll = "porClaveYAdminSort";
const planState = "porActivoYClaveYAdminSort";
const cursorContext = (mode: "ALL" | "ACTIVE" | "INACTIVE", plan: string) => ({ filters: {}, mode, plan, order: ORDERING_VERSION });
type Clase = { _id: Id<"clasesRecurso">; clave: string; nombre: string; descripcion?: string; activo: boolean; revision: number };

function toDetail(row: Clase) {
  return { id: row._id, clave: row.clave, nombre: row.nombre, descripcion: row.descripcion, activo: row.activo, revision: row.revision, effective: row.activo, effectiveReasons: row.activo ? [] : ["INACTIVE"] };
}

export const obtenerClase = query({
  args: { claseRecursoId: v.id("clasesRecurso") },
  returns: v.union(claseDetalle, v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.claseRecursoId);
    return row ? toDetail(row) : null;
  },
});

export const listarClases = query({
  args: { cursor: v.optional(v.union(v.string(), v.null())), pageSize: v.optional(v.number()), modo: v.optional(lifecycleFilterValidator) },
  returns: adminPageValidator(claseDetalle),
  handler: async (ctx, args) => {
    const mode = args.modo ?? "ALL";
    const pageSize = validatePageSize(args.pageSize);
    const plan = mode === "ALL" ? planAll : planState;
    const nativeCursor = await consumeCursor(args.cursor ?? null, cursorContext(mode, plan));
    const indexed = mode === "ALL"
      ? ctx.db.query("clasesRecurso").withIndex(planAll).order("asc")
      : ctx.db.query("clasesRecurso").withIndex(planState, q => q.eq("activo", mode === "ACTIVE")).order("asc");
    const page = await indexed.paginate({ numItems: pageSize, cursor: nativeCursor });
    return {
      items: (page.page as Clase[]).map(toDetail),
      continuationCursor: page.isDone ? null : await createCursor(page.continueCursor, cursorContext(mode, plan)),
      isExhausted: page.isDone,
    };
  },
});
