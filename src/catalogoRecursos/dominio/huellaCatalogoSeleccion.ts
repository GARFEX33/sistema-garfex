import type { ValorPermitidoTipado } from "./tipos";

export type ReferenciaCatalogo = Readonly<{ id: string; clave?: string; nombre?: string; activo: boolean; definicionAtributoId?: string; claseRecursoId?: string; familiaRecursoId?: string }>;
type PoliticaUnidadHuella = Readonly<{ id: string; familiaRecursoId: string; tipoRecursoId?: string; unidadId: string; activo: boolean; principal: boolean; state: string; unidad?: ReferenciaCatalogo }>;
export type HuellaInput = Readonly<{ claseRecursoId: string; familiaRecursoId: string; tipoRecursoId: string; unidadId: string; ownership: Readonly<{ kind: "GLOBAL" }> | Readonly<{ kind: "ORGANIZATION"; organizacionId: string }> }>;
export type HuellaGraph = Readonly<Record<string, unknown> & {
  hierarchyValid?: boolean; unitValid?: boolean;
  clase?: ReferenciaCatalogo; familia?: ReferenciaCatalogo; tipo?: ReferenciaCatalogo; unidad?: ReferenciaCatalogo; organizacion?: ReferenciaCatalogo;
  politicasUnidadEfectivas?: readonly PoliticaUnidadHuella[];
  familiaAsignaciones: readonly Record<string, unknown>[]; tipoAsignaciones: readonly Record<string, unknown>[];
  valoresPermitidos: readonly Readonly<{ id: string; definicionAtributoId: string; clave: string; nombre: string; orden: number; activo: boolean; valor: ValorPermitidoTipado }>[];
  opciones?: readonly ReferenciaCatalogo[]; reglas: readonly Record<string, unknown>[];
}>;

export const compararPuntosCodigo = (left: string, right: string): number => {
  const a = [...left], b = [...right];
  for (let index = 0; index < Math.min(a.length, b.length); index += 1) { const order = a[index].codePointAt(0)! - b[index].codePointAt(0)!; if (order !== 0) return order; }
  return a.length - b.length;
};
const json = (value: unknown): string => {
  if (value === undefined || value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value ?? null);
  if (typeof value === "number") return Number.isFinite(value) ? JSON.stringify(value) : JSON.stringify({ $number: String(value) });
  if (Array.isArray(value)) return `[${value.map(json).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => compararPuntosCodigo(a, b)).map(([key, item]) => `${JSON.stringify(key)}:${json(item)}`).join(",")}}`;
};
const texto = (value: unknown) => typeof value === "string" ? value : "";
const numero = (value: unknown) => typeof value === "number" ? value : 0;
const referencia = (kind: string, suppliedId: string | undefined, row: ReferenciaCatalogo | undefined) => !row
  ? suppliedId === undefined ? { state: "MISSING_REFERENCE", kind } : { state: "INVALID_REFERENCE", kind, suppliedId }
  : row.id !== suppliedId ? { state: "INVALID_REFERENCE", kind, suppliedId } : { state: "RESOLVED", kind, suppliedId, value: { id: row.id, clave: row.clave, nombre: row.nombre, activo: row.activo } };
const ordenAsignacion = (left: Record<string, unknown>, right: Record<string, unknown>) => numero(left.orden) - numero(right.orden) || compararPuntosCodigo(texto(left.definicionClave), texto(right.definicionClave)) || compararPuntosCodigo(texto(left.id), texto(right.id));
const ordenValor = (left: HuellaGraph["valoresPermitidos"][number], right: HuellaGraph["valoresPermitidos"][number]) => left.orden - right.orden || compararPuntosCodigo(left.clave, right.clave) || compararPuntosCodigo(left.id, right.id);

export async function huellaCatalogoSeleccion(input: HuellaInput, graph: HuellaGraph): Promise<string> {
  const assignments = [...graph.familiaAsignaciones, ...graph.tipoAsignaciones].sort(ordenAsignacion);
  const storedValues = [...graph.valoresPermitidos].sort(ordenValor);
  const values = storedValues;
  const optionIds = new Set(storedValues.flatMap((value) => value.valor.kind === "OPCION" ? [value.valor.opcionAtributoId] : []));
  const options = [...(graph.opciones ?? [])].filter((option) => optionIds.has(option.id)).sort((a, b) => compararPuntosCodigo(a.clave ?? "", b.clave ?? "") || compararPuntosCodigo(a.id, b.id));
  const rules = [...graph.reglas].sort((a, b) => compararPuntosCodigo(texto(a.atributoCondicionId), texto(b.atributoCondicionId)) || compararPuntosCodigo(texto(a.valorPermitidoCondicionId) || "PRESENCE", texto(b.valorPermitidoCondicionId) || "PRESENCE") || compararPuntosCodigo(texto(a.atributoAfectadoId), texto(b.atributoAfectadoId)) || compararPuntosCodigo(texto(a.aplicabilidad), texto(b.aplicabilidad)) || compararPuntosCodigo(texto(a.id), texto(b.id)));
  const policies = [...(graph.politicasUnidadEfectivas ?? [])].sort((a, b) => compararPuntosCodigo(a.familiaRecursoId, b.familiaRecursoId) || compararPuntosCodigo(a.tipoRecursoId ?? "", b.tipoRecursoId ?? "") || compararPuntosCodigo(a.unidadId, b.unidadId) || compararPuntosCodigo(a.id, b.id)).map(policy => ({ id: policy.id, familiaRecursoId: policy.familiaRecursoId, tipoRecursoId: policy.tipoRecursoId ?? null, unidadId: policy.unidadId, activo: policy.activo, principal: policy.principal, state: policy.state, unidad: referencia("POLICY_UNIT", policy.unidadId, policy.unidad) }));
  const canonical = {
    ownership: input.ownership.kind === "ORGANIZATION" ? { kind: input.ownership.kind, organization: referencia("ORGANIZATION", input.ownership.organizacionId, graph.organizacion) } : { kind: input.ownership.kind },
    hierarchy: {
      clase: referencia("CLASS", input.claseRecursoId, graph.clase), familia: referencia("FAMILY", input.familiaRecursoId, graph.familia), tipo: referencia("TYPE", input.tipoRecursoId, graph.tipo), unidad: referencia("UNIT", input.unidadId, graph.unidad),
      relationships: { familyToClass: { familiaId: graph.familia?.id ?? null, claseRecursoId: graph.familia?.claseRecursoId ?? null }, typeToFamily: { tipoId: graph.tipo?.id ?? null, familiaRecursoId: graph.tipo?.familiaRecursoId ?? null } },
      hierarchyValid: graph.hierarchyValid ?? null, unitValid: graph.unitValid ?? null,
    },
    policies, assignments, values, options, rules,
  };
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`selection-catalog-fingerprint:v1\n${json(canonical)}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
