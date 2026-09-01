import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { adminInvalidState } from "../lib/errors";
import { MAX_RESOURCE_VALUES, type ResourceDetail, type ResourceDiagnostics, type ResourceSummary } from "../resourceValidators";
import type { ResourceValue } from "../resourceValidators";

export type ResourceDetailReferences = {
  descripcion: string | null;
  identidadVersion: number | null;
  clase: ResourceDetail["clase"];
  familia: ResourceDetail["familia"];
  tipo: ResourceDetail["tipo"];
  unidad: ResourceDetail["unidad"];
  organizacion: ResourceDetail["organizacion"];
  catalogDiagnostics: ResourceDiagnostics;
  valores: ResourceValue[];
};

export function projectResourceDetail(summary: ResourceSummary, detail: ResourceDetailReferences): ResourceDetail {
  return { ...summary, ...detail };
}

export async function loadResourceValuesBounded(
  ctx: Pick<QueryCtx | MutationCtx, "db">,
  recursoId: Id<"recursos">,
): Promise<ResourceValue[]> {
  const values = await ctx.db.query("valoresAtributoRecurso").withIndex("porRecurso", q => q.eq("recursoId", recursoId)).take(MAX_RESOURCE_VALUES + 1);
  if (values.length > MAX_RESOURCE_VALUES) {
    const entity = { kind: "recursos" as const, id: recursoId };
    adminInvalidState({
      entity,
      field: "valores",
      reason: "RESOURCE_VALUE_LIMIT_EXCEEDED: maximum 200 rows",
      violations: [{ code: "RESOURCE_VALUE_LIMIT_EXCEEDED", entity, field: "valores", count: values.length, detail: "maximum 200 rows" }],
    });
  }
  return values;
}

export const cargarValoresRecursoAcotado = loadResourceValuesBounded;
