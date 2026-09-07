import { ordenAsignaciones, resolverAsignaciones, type AsignacionEfectiva } from "./asignacionesEfectivas";
import { evaluarReglasCondicionalesSeleccion, type ReglaCondicional } from "./reglasCondicionales";
import { huellaCatalogoSeleccion, type HuellaGraph, type ReferenciaCatalogo } from "./huellaCatalogoSeleccion";
import { normalizarValor, serializarIdentidadV2 } from "./identidadRecurso";
import type { ModoCaptura, TipoDato, Valor, ValorPermitidoTipado } from "./tipos";

export type SelectionInput = Readonly<{ asignacionAtributoId: string; valorPermitidoId: string }>;
export type SelectionCreationInput = Readonly<{ claseRecursoId: string; familiaRecursoId: string; tipoRecursoId: string; unidadId: string; selecciones: readonly SelectionInput[]; ownership: Readonly<{ kind: "GLOBAL" }> | Readonly<{ kind: "ORGANIZATION"; organizacionId: string }> }>;
export type ResolvedApplicability = "REQUIRED" | "OPTIONAL" | "FORBIDDEN" | "NOT_APPLICABLE";
export type CreationIssueCode = "HIERARCHY_INVALID" | "UNIT_INVALID" | "OWNERSHIP_INVALID" | "ASSIGNMENT_UNKNOWN" | "ASSIGNMENT_DUPLICATE" | "ALLOWED_VALUE_UNKNOWN" | "ALLOWED_VALUE_FOREIGN" | "ALLOWED_VALUE_INACTIVE" | "SELECTION_NON_EFFECTIVE" | "SELECTION_FORBIDDEN" | "SELECTION_NOT_APPLICABLE" | "UNSUPPORTED_FREE_CAPTURE" | "IDENTITY_CONFLICT";
export type CreationIssue = Readonly<{ code: CreationIssueCode; message: string; asignacionAtributoId?: string }>;
export type EvaluatedAssignment = Readonly<{ asignacionAtributoId: string; definicionAtributoId: string; aplicabilidadResuelta: ResolvedApplicability; participaIdentidad: boolean; orden: number; effectiveReasons: readonly string[]; selectedValueId?: string }>;
export type NormalizedResourceValue = Readonly<{ atributoRecursoId: string; valor: Valor; opcionAtributoId?: string }>;
export type PersistableSelectionValue = Readonly<NormalizedResourceValue & { valorPermitidoId: string }>;
export type CreationEvaluation = Readonly<{ status: "INCOMPLETE" | "VALID" | "INVALID"; valid: boolean; catalogFingerprint: string; nombre: string | null; identificadorTecnico: string | null; asignaciones: readonly EvaluatedAssignment[]; faltantesRequeridos: readonly string[]; seleccionesInvalidas: readonly string[]; valoresNormalizados: readonly NormalizedResourceValue[]; issues: readonly CreationIssue[] }>;
export type InternalSelectionEvaluation = Readonly<{ evaluation: CreationEvaluation; valoresParaPersistir: readonly PersistableSelectionValue[] }>;

export type SelectionAssignment = AsignacionEfectiva & Readonly<{ modoCaptura: ModoCaptura; effectiveReasons: readonly string[]; tipoDato?: TipoDato }>;
export type SelectionAllowedValue = Readonly<{ id: string; definicionAtributoId: string; clave: string; nombre: string; orden: number; activo: boolean; valor: ValorPermitidoTipado }>;
export type SelectionOption = Readonly<{ id: string; definicionAtributoId: string; clave: string; activo: boolean }>;
export type SelectionCatalogGraph = HuellaGraph & Readonly<{ hierarchyValid?: boolean; unitValid?: boolean; ownershipValid?: boolean; clase?: ReferenciaCatalogo; familia?: ReferenciaCatalogo; tipo?: ReferenciaCatalogo; unidad?: ReferenciaCatalogo; organizacion?: ReferenciaCatalogo; familiaAsignaciones: readonly SelectionAssignment[]; tipoAsignaciones: readonly SelectionAssignment[]; valoresPermitidos: readonly SelectionAllowedValue[]; valoresPermitidosDiagnosticos?: readonly SelectionAllowedValue[]; opciones?: readonly SelectionOption[]; reglas: readonly ReglaCondicional[] }>;

const MENSAJES: Record<CreationIssueCode, string> = { HIERARCHY_INVALID: "La jerarquía seleccionada no es válida.", UNIT_INVALID: "La unidad seleccionada no es válida.", OWNERSHIP_INVALID: "La propiedad seleccionada no es válida.", ASSIGNMENT_UNKNOWN: "La asignación seleccionada no existe.", ASSIGNMENT_DUPLICATE: "La asignación fue enviada más de una vez.", ALLOWED_VALUE_UNKNOWN: "El valor permitido seleccionado no existe.", ALLOWED_VALUE_FOREIGN: "El valor permitido no pertenece a la asignación.", ALLOWED_VALUE_INACTIVE: "El valor permitido seleccionado está inactivo.", SELECTION_NON_EFFECTIVE: "La asignación seleccionada no es efectiva.", SELECTION_FORBIDDEN: "La asignación seleccionada está prohibida.", SELECTION_NOT_APPLICABLE: "La asignación seleccionada no aplica.", UNSUPPORTED_FREE_CAPTURE: "La captura libre no está soportada por este creador.", IDENTITY_CONFLICT: "La identidad del recurso ya existe." };
const emitir = (issues: CreationIssue[], code: CreationIssueCode, asignacionAtributoId?: string) => issues.push({ code, message: MENSAJES[code], ...(asignacionAtributoId === undefined ? {} : { asignacionAtributoId }) });
const etiqueta = (value: string) => value.normalize("NFC").trim().replace(/\s+/g, " ");
function normalizar(value: SelectionAllowedValue, assignment: SelectionAssignment, options: readonly SelectionOption[]): Omit<PersistableSelectionValue, "atributoRecursoId" | "valorPermitidoId"> {
  const payload = value.valor;
  if (assignment.tipoDato !== undefined && assignment.tipoDato !== payload.kind) throw new Error(`Valor permitido ${value.id} tiene tipo inválido.`);
  if (payload.kind === "TEXTO") return { valor: payload.value };
  if (payload.kind === "NUMERO") { if (!Number.isFinite(payload.value)) throw new Error(`Valor permitido ${value.id} NUMERO no finito.`); return { valor: payload.value }; }
  if (payload.kind === "BOOLEANO") return { valor: payload.value };
  const option = options.find((candidate) => candidate.id === payload.opcionAtributoId);
  if (!option || !option.activo || option.definicionAtributoId !== value.definicionAtributoId) throw new Error(`Valor permitido ${value.id} OPCION inválido.`);
  return { valor: option.clave, opcionAtributoId: option.id };
}

/** Evaluates only the supplied live graph and retains allowed-value IDs solely in its persistence sidecar. */
export async function evaluarCreacionSeleccion(input: SelectionCreationInput, graph: SelectionCatalogGraph): Promise<InternalSelectionEvaluation> {
  const issues: CreationIssue[] = [];
  if (graph.hierarchyValid === false) emitir(issues, "HIERARCHY_INVALID"); if (graph.unitValid === false) emitir(issues, "UNIT_INVALID"); if (graph.ownershipValid === false) emitir(issues, "OWNERSHIP_INVALID");
  const resolution = resolverAsignaciones({ familia: [...graph.familiaAsignaciones], tipo: [...graph.tipoAsignaciones], familiaId: input.familiaRecursoId, tipoId: input.tipoRecursoId });
  const assignments = resolution.selected.slice().sort(ordenAsignaciones) as SelectionAssignment[], effective = new Map(assignments.map((row) => [row.id, row]),), known = new Set([...graph.familiaAsignaciones, ...graph.tipoAsignaciones].map((row) => row.id));
  const counts = new Map<string, number>(); for (const selection of input.selecciones) counts.set(selection.asignacionAtributoId, (counts.get(selection.asignacionAtributoId) ?? 0) + 1);
  const accepted = new Map<string, SelectionAllowedValue>(), invalid = new Set<string>(), duplicates = new Set<string>();
  const invalidate = (id: string, code: CreationIssueCode) => { invalid.add(id); emitir(issues, code, id); };
  const unsupported = (id: string, selected = false) => { if (!issues.some((issue) => issue.code === "UNSUPPORTED_FREE_CAPTURE" && issue.asignacionAtributoId === id)) emitir(issues, "UNSUPPORTED_FREE_CAPTURE", id); if (selected) invalid.add(id); };
  for (const selection of input.selecciones) {
    const assignment = effective.get(selection.asignacionAtributoId);
    if ((counts.get(selection.asignacionAtributoId) ?? 0) > 1) { if (!duplicates.has(selection.asignacionAtributoId)) invalidate(selection.asignacionAtributoId, "ASSIGNMENT_DUPLICATE"); duplicates.add(selection.asignacionAtributoId); continue; }
    if (!assignment) { invalidate(selection.asignacionAtributoId, known.has(selection.asignacionAtributoId) ? "SELECTION_NON_EFFECTIVE" : "ASSIGNMENT_UNKNOWN"); continue; }
    if (assignment.modoCaptura === "LIBRE") { unsupported(assignment.id, true); continue; }
    const value = [...graph.valoresPermitidos, ...(graph.valoresPermitidosDiagnosticos ?? [])].find((candidate) => candidate.id === selection.valorPermitidoId);
    if (!value) { invalidate(assignment.id, "ALLOWED_VALUE_UNKNOWN"); continue; }
    if (value.definicionAtributoId !== assignment.definicionId) { invalidate(assignment.id, "ALLOWED_VALUE_FOREIGN"); continue; }
    if (!value.activo) { invalidate(assignment.id, "ALLOWED_VALUE_INACTIVE"); continue; }
    normalizar(value, assignment, graph.opciones ?? []); accepted.set(assignment.id, value);
  }
  const base = new Map(assignments.map((row) => [row.id, row.aplicabilidad])), predicates = new Map([...accepted].filter(([id]) => base.get(id) !== "FORBIDDEN" && base.get(id) !== "NOT_APPLICABLE").map(([id, value]) => [id, value.id]));
  const applicability = evaluarReglasCondicionalesSeleccion(graph.reglas, predicates, base);
  for (const [id] of accepted) { const resolved = applicability.get(id)!; if (resolved === "FORBIDDEN") { invalidate(id, "SELECTION_FORBIDDEN"); accepted.delete(id); } if (resolved === "NOT_APPLICABLE") { invalidate(id, "SELECTION_NOT_APPLICABLE"); accepted.delete(id); } }
  const faltantesRequeridos: string[] = []; for (const assignment of assignments) if (applicability.get(assignment.id) === "REQUIRED") { if (assignment.modoCaptura === "LIBRE") unsupported(assignment.id); else if (!accepted.has(assignment.id)) faltantesRequeridos.push(assignment.id); }
  const valoresParaPersistir = assignments.flatMap((assignment): PersistableSelectionValue[] => { const value = accepted.get(assignment.id); return value ? [{ atributoRecursoId: assignment.id, ...normalizar(value, assignment, graph.opciones ?? []), valorPermitidoId: value.id }] : []; });
  const status = issues.length > 0 ? "INVALID" : faltantesRequeridos.length > 0 ? "INCOMPLETE" : "VALID", firstInput = new Map<string, number>(); input.selecciones.forEach((selection, index) => { if (!firstInput.has(selection.asignacionAtributoId)) firstInput.set(selection.asignacionAtributoId, index); });
  const valid = status === "VALID", hierarchy = graph.clase && graph.familia && graph.tipo;
  const identityParts = assignments.filter((assignment) => assignment.participaIdentidad).flatMap((assignment) => { const value = valoresParaPersistir.find((row) => row.atributoRecursoId === assignment.id); return value ? [[assignment.definicionClave, value.opcionAtributoId ? value.valor as string : normalizarValor(value.valor)] as const] : []; });
  const nombre = valid && graph.tipo ? [etiqueta(graph.tipo.nombre ?? ""), ...assignments.filter((assignment) => assignment.participaIdentidad).flatMap((assignment) => { const value = accepted.get(assignment.id); return value ? [etiqueta(value.nombre)] : []; })].filter(Boolean).join(" · ") : null;
  const { selecciones: _, ...catalogInput } = input;
  const evaluation: CreationEvaluation = { status, valid, catalogFingerprint: await huellaCatalogoSeleccion(catalogInput, graph), nombre, identificadorTecnico: valid && hierarchy ? serializarIdentidadV2({ clave: graph.tipo!.clave! }, { clave: graph.familia!.clave! }, { clave: graph.clase!.clave! }, identityParts) : null, asignaciones: assignments.map((assignment) => ({ asignacionAtributoId: assignment.id, definicionAtributoId: assignment.definicionId, aplicabilidadResuelta: applicability.get(assignment.id)!, participaIdentidad: assignment.participaIdentidad, orden: assignment.orden, effectiveReasons: assignment.effectiveReasons, ...(accepted.has(assignment.id) ? { selectedValueId: accepted.get(assignment.id)!.id } : {}) })), faltantesRequeridos, seleccionesInvalidas: [...invalid].sort((left, right) => (firstInput.get(left) ?? Number.MAX_SAFE_INTEGER) - (firstInput.get(right) ?? Number.MAX_SAFE_INTEGER)), valoresNormalizados: valoresParaPersistir.map(({ valorPermitidoId: _, ...value }) => value), issues };
  return { evaluation, valoresParaPersistir };
}
