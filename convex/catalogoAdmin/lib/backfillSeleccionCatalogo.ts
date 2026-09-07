import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

const MAX_BATCH_SIZE = 100;
const phases = ["DEFINITIONS", "OPTIONS", "RULES", "VERIFY", "VERIFY", "VERIFY"] as const;
type Phase = typeof phases[number];
type Cursor = { plan: number; cursor: string | null };
type Row = { _id: string; [key: string]: any };
type Report = { code: string; id: string };

const reportValidator = v.object({ code: v.string(), id: v.string() });
const resultValidator = v.object({
  phase: v.union(v.literal("DEFINITIONS"), v.literal("OPTIONS"), v.literal("RULES"), v.literal("VERIFY")),
  processed: v.number(), updated: v.number(), nextCursor: v.union(v.string(), v.null()),
  conflicts: v.array(reportValidator), diagnostics: v.array(reportValidator),
});

function decodeCursor(value: string | null | undefined): Cursor {
  if (value == null) return { plan: 0, cursor: null };
  try {
    const parsed = JSON.parse(atob(value)) as Cursor;
    if (!Number.isInteger(parsed.plan) || parsed.plan < 0 || parsed.plan >= phases.length || (parsed.cursor !== null && typeof parsed.cursor !== "string")) throw new Error();
    return parsed;
  } catch {
    throw new Error("Cursor de backfill de selección inválido");
  }
}

function encodeCursor(value: Cursor) {
  return btoa(JSON.stringify(value));
}

function nextCursor(state: Cursor, page: { isDone: boolean; continueCursor: string }) {
  const plan = page.isDone ? state.plan + 1 : state.plan;
  return plan === phases.length ? null : encodeCursor({ plan, cursor: page.isDone ? null : page.continueCursor });
}

function optionPayload(option: Row) {
  return { kind: "OPCION" as const, opcionAtributoId: option._id };
}

async function mappingFor(db: any, optionId: string) {
  const mappings = await db.query("valoresPermitidosAtributo").withIndex("porOpcionDeValor", (q: any) => q.eq("opcionAtributoIdIndex", optionId)).take(2);
  return mappings as Row[];
}

function validMapping(rows: Row[], option: Row) {
  return rows.length === 1
    && rows[0].definicionAtributoId === option.definicionAtributoId
    && rows[0].valor?.kind === "OPCION"
    && rows[0].valor.opcionAtributoId === option._id;
}

async function migrateOption(db: any, option: Row, conflicts: Report[]) {
  const byKey = await db.query("valoresPermitidosAtributo").withIndex("porDefinicionYClave", (q: any) => q.eq("definicionAtributoId", option.definicionAtributoId).eq("clave", option.clave)).first() as Row | null;
  const mappings = await mappingFor(db, option._id);
  if (validMapping(mappings, option)) return 0;
  if (byKey || mappings.length > 0) {
    conflicts.push({ code: byKey ? "OPTION_KEY_PAYLOAD_CONFLICT" : "OPTION_MAPPING_CONFLICT", id: String(option._id) });
    return 0;
  }
  const id = await db.insert("valoresPermitidosAtributo", {
    definicionAtributoId: option.definicionAtributoId,
    clave: option.clave,
    nombre: option.nombre,
    descripcion: option.descripcion,
    orden: 0,
    valor: optionPayload(option),
    opcionAtributoIdIndex: option._id,
    activo: option.activo,
    revision: 1,
  });
  await db.patch(id, { adminSortId: id });
  return 1;
}

async function migrateRule(db: any, rule: Row, diagnostics: Report[]) {
  if (rule.opcionCondicionId === undefined || rule.valorPermitidoCondicionId !== undefined) return 0;
  const option = await db.get(rule.opcionCondicionId) as Row | null;
  const mappings = option ? await mappingFor(db, option._id) : [];
  if (!option || !validMapping(mappings, option)) {
    diagnostics.push({ code: "UNMAPPED_OPTION_RULE", id: String(rule._id) });
    return 0;
  }
  await db.patch(rule._id, { valorPermitidoCondicionId: mappings[0]._id });
  return 1;
}

async function verifyDefinition(row: Row, diagnostics: Report[]) {
  if (row.modoCaptura === undefined) diagnostics.push({ code: "MISSING_CAPTURE_MODE", id: String(row._id) });
}

async function verifyValue(db: any, row: Row, diagnostics: Report[]) {
  if (row.adminSortId === undefined) diagnostics.push({ code: "MISSING_PAGINATION_METADATA", id: String(row._id) });
  if (!row.activo || row.valor?.kind !== "OPCION") return;
  const option = await db.get(row.valor.opcionAtributoId) as Row | null;
  const mappings = option ? await mappingFor(db, option._id) : [];
  if (mappings.length > 1) diagnostics.push({ code: "DUPLICATE_OPTION_MAPPING", id: String(option!._id) });
  if (!option || !option.activo || option.definicionAtributoId !== row.definicionAtributoId || row.opcionAtributoIdIndex !== option._id) {
    diagnostics.push({ code: "INVALID_ACTIVE_OPTION_MAPPING", id: String(row._id) });
  }
}

async function verifyRule(db: any, row: Row, diagnostics: Report[]) {
  if (row.opcionCondicionId === undefined) return;
  const option = await db.get(row.opcionCondicionId) as Row | null;
  const mappings = option ? await mappingFor(db, option._id) : [];
  if (!option || !validMapping(mappings, option) || row.valorPermitidoCondicionId !== mappings[0]._id) {
    diagnostics.push({ code: "UNMAPPED_OPTION_RULE", id: String(row._id) });
  }
}

/** Deploy optional fields, run this bounded backfill to completion, verify diagnostics are empty, then tighten definition mode storage. */
export const backfillSeleccionCatalogo = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())), batchSize: v.optional(v.number()) },
  returns: resultValidator,
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 50;
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) throw new Error("batchSize debe estar entre 1 y 100");
    const state = decodeCursor(args.cursor);
    const db = ctx.db as any;
    const phase: Phase = phases[state.plan];
    const conflicts: Report[] = [];
    const diagnostics: Report[] = [];
    const source = state.plan === 0 ? ["definicionesAtributo", "porClave"]
      : state.plan === 1 ? ["opcionesAtributo", "porDefinicionYClave"]
        : state.plan === 2 ? ["reglasAtributoRecurso", "porTipo"]
          : state.plan === 3 ? ["definicionesAtributo", "porClave"]
            : state.plan === 4 ? ["valoresPermitidosAtributo", "porDefinicionYOrdenYClaveYAdminSort"]
              : ["reglasAtributoRecurso", "porTipo"];
    const page = await db.query(source[0]).withIndex(source[1]).order("asc").paginate({ numItems: batchSize, cursor: state.cursor });
    let updated = 0;
    for (const row of page.page as Row[]) {
      if (state.plan === 0 && row.modoCaptura === undefined) {
        await db.patch(row._id, { modoCaptura: row.tipoDato === "OPCION" ? "SELECCION" : "LIBRE" });
        updated += 1;
      } else if (state.plan === 1) {
        updated += await migrateOption(db, row, conflicts);
      } else if (state.plan === 2) {
        updated += await migrateRule(db, row, diagnostics);
      } else if (state.plan === 3) {
        await verifyDefinition(row, diagnostics);
      } else if (state.plan === 4) {
        await verifyValue(db, row, diagnostics);
      } else {
        await verifyRule(db, row, diagnostics);
      }
    }
    return { phase, processed: page.page.length, updated, nextCursor: nextCursor(state, page), conflicts, diagnostics };
  },
});
