import { internalMutation } from "../../_generated/server";
import { v } from "convex/values";

const MAX_BATCH_SIZE = 100;
const plans = [
  ["clasesRecurso", "porClave"], ["familiasRecurso", "porClaseYClave"], ["tiposRecurso", "porFamiliaYClave"],
  ["unidades", "porClave"], ["definicionesAtributo", "porClave"], ["atributosRecurso", "porFamiliaYTipoYDefinicion"],
  ["opcionesAtributo", "porDefinicionYClave"], ["politicasUnidadRecurso", "porFamiliaYTipoYUnidad"],
  ["politicasPresentacionCanonica", "porTipo"], ["politicasCompatibilidadOpciones", "porTipo"],
  ["relacionesOpcionesAtributo", "porOrigenYDestino"], ["reglasAtributoRecurso", "porTipo"], ["catalogoRevisiones", "porOrganizacionYNumero"], ["recursos", "porIdentificadorTecnico"],
] as const;
type Row = { _id: string; [key: string]: unknown };
type PlanCursor = { plan: number; cursor: string | null };

export type ResourceMetadataSource = { organizacionId?: string };
export function deriveResourceMetadata(source: ResourceMetadataSource): { adminScopeKey: string } {
  return { adminScopeKey: source.organizacionId === undefined ? "GLOBAL" : `ORG:${source.organizacionId}` };
}
type DuplicateReport = { table: string; identity: string; ids: string[] };

function encodeCursor(value: PlanCursor): string {
  return btoa(JSON.stringify(value));
}
function decodeCursor(value: string | null | undefined): PlanCursor {
  if (value == null) return { plan: 0, cursor: null };
  try {
    const parsed = JSON.parse(atob(value)) as PlanCursor;
    if (!Number.isInteger(parsed.plan) || parsed.plan < 0 || parsed.plan >= plans.length || (parsed.cursor !== null && typeof parsed.cursor !== "string")) throw new Error();
    return parsed;
  } catch {
    throw new Error("Cursor de backfill inválido");
  }
}

function compareCodePoints(left: string, right: string): number {
  const a = Array.from(left).map(character => character.codePointAt(0)!);
  const b = Array.from(right).map(character => character.codePointAt(0)!);
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) if (a[index] !== b[index]) return a[index] - b[index];
  return a.length - b.length;
}
function sortedPair(left: string, right: string): [string, string] {
  return compareCodePoints(left, right) <= 0 ? [left, right] : [right, left];
}

export function metadataPatch(table: string, row: Row, definitionKey?: string, policy?: Row): Record<string, string | undefined> {
  const patch: Record<string, string | undefined> = table === "recursos"
    ? deriveResourceMetadata({ organizacionId: row.organizacionId as string | undefined })
    : { adminSortId: row._id };
  if (table === "atributosRecurso") patch.definicionClave = definitionKey;
  if (table === "politicasCompatibilidadOpciones") {
    const [origin, destination] = row.direccion === "SYMMETRIC"
      ? sortedPair(String(row.atributoOrigenId), String(row.atributoDestinoId))
      : [String(row.atributoOrigenId), String(row.atributoDestinoId)];
    patch.atributoOrigenIdNormalizado = origin;
    patch.atributoDestinoIdNormalizado = destination;
  }
  if (table === "relacionesOpcionesAtributo" && policy) {
    const [origin, destination] = policy.direccion === "SYMMETRIC" && String(policy.atributoOrigenId) > String(policy.atributoDestinoId)
      ? [String(row.opcionDestinoId), String(row.opcionOrigenId)]
      : [String(row.opcionOrigenId), String(row.opcionDestinoId)];
    patch.opcionOrigenIdNormalizada = origin;
    patch.opcionDestinoIdNormalizada = destination;
  }
  return patch;
}

function identity(table: string, row: Row, patch: Record<string, string | undefined>): string | null {
  if (table === "atributosRecurso" && patch.definicionClave) return [String(row.familiaRecursoId), String(row.tipoRecursoId ?? ""), patch.definicionClave].join("|");
  if (table === "politicasCompatibilidadOpciones" && patch.atributoOrigenIdNormalizado && patch.atributoDestinoIdNormalizado) return [String(row.tipoRecursoId), patch.atributoOrigenIdNormalizado, patch.atributoDestinoIdNormalizado, String(row.direccion)].join("|");
  if (table === "relacionesOpcionesAtributo" && patch.opcionOrigenIdNormalizada && patch.opcionDestinoIdNormalizada) return [String(row.politicaCompatibilidadId ?? ""), patch.opcionOrigenIdNormalizada, patch.opcionDestinoIdNormalizada].join("|");
  return null;
}

export function duplicateReports(table: string, rows: Array<{ row: Row; patch: Record<string, string | undefined> }>): DuplicateReport[] {
  const groups = new Map<string, string[]>();
  for (const { row, patch } of rows) {
    const key = identity(table, row, patch);
    if (key) groups.set(key, [...(groups.get(key) ?? []), row._id]);
  }
  return [...groups.entries()]
    .map(([identityValue, ids]) => ({ table, identity: identityValue, ids: [...new Set(ids)].sort(compareCodePoints) }))
    .filter(({ ids }) => ids.length > 1)
    .sort((left, right) => compareCodePoints(left.identity, right.identity));
}

const duplicateReportValidator = v.object({ table: v.string(), identity: v.string(), ids: v.array(v.string()) });

export const backfillMetadatos = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())), batchSize: v.optional(v.number()) },
  returns: v.object({ processed: v.number(), updated: v.number(), nextCursor: v.union(v.string(), v.null()), duplicateReports: v.array(duplicateReportValidator) }),
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 50;
    if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) throw new Error("batchSize debe estar entre 1 y 100");
    const state = decodeCursor(args.cursor);
    const db = ctx.db as any;
    let processed = 0;
    let updated = 0;
    const reports: DuplicateReport[] = [];

    const [table, index] = plans[state.plan];
    const page = await db.query(table).withIndex(index).order("asc").paginate({ numItems: batchSize, cursor: state.cursor });
    const prepared: Array<{ row: Row; patch: Record<string, string | undefined> }> = [];
    for (const row of page.page as Row[]) {
      let definitionKey: string | undefined;
      let policy: Row | undefined;
      if (table === "atributosRecurso") definitionKey = (await db.get(row.definicionAtributoId))?.clave;
      if (table === "relacionesOpcionesAtributo" && row.politicaCompatibilidadId) policy = (await db.get(row.politicaCompatibilidadId)) ?? undefined;
      const patch = metadataPatch(table, row, definitionKey, policy);
      prepared.push({ row, patch });
      const duplicateCandidates = table === "recursos" ? [] : await candidatesForDuplicateIdentity(db, table, row);
      for (const candidate of duplicateCandidates) {
        const candidateDefinitionKey = table === "atributosRecurso" ? (await db.get(candidate.definicionAtributoId))?.clave : undefined;
        const candidatePolicy = table === "relacionesOpcionesAtributo" && candidate.politicaCompatibilidadId
          ? (await db.get(candidate.politicaCompatibilidadId)) ?? undefined : undefined;
        prepared.push({ row: candidate, patch: metadataPatch(table, candidate, candidateDefinitionKey, candidatePolicy) });
      }
      const changes = Object.fromEntries(Object.entries(patch).filter(([key, value]) => value !== undefined && row[key] !== value));
      if (Object.keys(changes).length > 0) {
        await db.patch(row._id, changes);
        updated += 1;
      }
      processed += 1;
    }
    if (table !== "recursos") reports.push(...duplicateReports(table, prepared));
    const nextState = page.isDone ? state.plan + 1 : state.plan;
    return { processed, updated, nextCursor: nextState >= plans.length ? null : encodeCursor({ plan: nextState, cursor: page.isDone ? null : page.continueCursor }), duplicateReports: reports.sort(reportOrder) };
  },
});

async function candidatesForDuplicateIdentity(db: any, table: string, row: Row): Promise<Row[]> {
  if (table === "atributosRecurso") return (await db.query(table).withIndex("porFamiliaYDefinicion", (q: any) => q.eq("familiaRecursoId", row.familiaRecursoId).eq("definicionAtributoId", row.definicionAtributoId)).take(101) as Row[])
    .filter(candidate => String(candidate.tipoRecursoId ?? "") === String(row.tipoRecursoId ?? ""));
  if (table === "politicasCompatibilidadOpciones") return await db.query(table).withIndex("porTipo", (q: any) => q.eq("tipoRecursoId", row.tipoRecursoId)).take(101) as Row[];
  if (table === "relacionesOpcionesAtributo" && row.politicaCompatibilidadId) return await db.query(table).withIndex("porPolitica", (q: any) => q.eq("politicaCompatibilidadId", row.politicaCompatibilidadId)).take(101) as Row[];
  return [];
}

function reportOrder(left: DuplicateReport, right: DuplicateReport): number {
  return compareCodePoints(left.table, right.table) || compareCodePoints(left.identity, right.identity) || compareCodePoints(left.ids.join("|"), right.ids.join("|"));
}
