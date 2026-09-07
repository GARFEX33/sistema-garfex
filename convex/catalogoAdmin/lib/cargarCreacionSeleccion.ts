import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { resolverAsignaciones } from "../../../src/catalogoRecursos/dominio/asignacionesEfectivas";
import { resolverModoCaptura } from "../../../src/catalogoRecursos/dominio/modoCaptura";
import { resolverUnidadesEfectivas, type PoliticaUnidadEfectiva } from "../../../src/catalogoRecursos/dominio/unidadesEfectivas";
import type { SelectionCatalogGraph, SelectionCreationInput } from "../../../src/catalogoRecursos/dominio/evaluarCreacionSeleccion";

export const MAX_SELECTION_CATALOG_ROWS = 200;
type DbContext = Pick<QueryCtx | MutationCtx, "db">;

function bounded<T>(rows: T[]): T[] {
  if (rows.length > MAX_SELECTION_CATALOG_ROWS) throw new Error("SELECTION_CATALOG_LIMIT_EXCEEDED");
  return rows;
}

function reference(row: { _id: string; clave: string; nombre: string; activo: boolean } | null) {
  return row === null ? undefined : { id: String(row._id), clave: row.clave, nombre: row.nombre, activo: row.activo };
}
function referenciaFamilia(row: { _id: string; claseRecursoId: string; clave: string; nombre: string; activo: boolean } | null) {
  const base = reference(row);
  return base === undefined ? undefined : { ...base, claseRecursoId: String(row!.claseRecursoId) };
}
function referenciaTipo(row: { _id: string; familiaRecursoId: string; clave: string; nombre: string; activo: boolean } | null) {
  const base = reference(row);
  return base === undefined ? undefined : { ...base, familiaRecursoId: String(row!.familiaRecursoId) };
}

/** Loads only the current live catalog; ownership never selects publications or snapshots. */
export async function cargarCreacionSeleccion(ctx: DbContext, input: SelectionCreationInput): Promise<SelectionCatalogGraph> {
  const clase = await ctx.db.get(input.claseRecursoId as Id<"clasesRecurso">);
  const familia = await ctx.db.get(input.familiaRecursoId as Id<"familiasRecurso">);
  const tipo = await ctx.db.get(input.tipoRecursoId as Id<"tiposRecurso">);
  const unidad = await ctx.db.get(input.unidadId as Id<"unidades">);
  const organizacion = input.ownership.kind === "ORGANIZATION"
    ? await ctx.db.get(input.ownership.organizacionId as Id<"organizaciones">)
    : null;
  const hierarchyValid = Boolean(clase?.activo && familia?.activo && tipo?.activo
    && String(familia.claseRecursoId) === input.claseRecursoId
    && String(tipo.familiaRecursoId) === input.familiaRecursoId);
  const ownershipValid = input.ownership.kind === "GLOBAL" || Boolean(organizacion?.activo);

  const familyPolicies = familia === null ? [] : bounded(await ctx.db.query("politicasUnidadRecurso")
    .withIndex("porFamilia", query => query.eq("familiaRecursoId", familia._id)).take(MAX_SELECTION_CATALOG_ROWS + 1));
  const typePolicies = tipo === null ? [] : bounded(await ctx.db.query("politicasUnidadRecurso")
    .withIndex("porTipo", query => query.eq("tipoRecursoId", tipo._id)).take(MAX_SELECTION_CATALOG_ROWS + 1));
  const policyRows = [...familyPolicies.filter(row => row.tipoRecursoId === undefined), ...typePolicies];
  const policyUnits = new Map((await Promise.all([...new Set(policyRows.map(row => row.unidadId))].map(async unidadId => [String(unidadId), await ctx.db.get(unidadId)] as const))).map(([id, row]) => [id, row]));
  const asPolicy = (row: typeof familyPolicies[number]): PoliticaUnidadEfectiva => ({
    id: String(row._id), familiaRecursoId: String(row.familiaRecursoId),
    ...(row.tipoRecursoId === undefined ? {} : { tipoRecursoId: String(row.tipoRecursoId) }),
    unidadId: String(row.unidadId), activo: row.activo, principal: row.principal,
    unidadActiva: policyUnits.get(String(row.unidadId))?.activo === true,
  });
  const effectivePolicies = resolverUnidadesEfectivas({
    familia: familyPolicies.filter(row => row.tipoRecursoId === undefined).map(asPolicy),
    tipo: typePolicies.map(asPolicy), tipoEfectivo: hierarchyValid,
  });
  const politicasUnidadEfectivas = effectivePolicies.selected.map(policy => ({
    id: policy.id, familiaRecursoId: policy.familiaRecursoId,
    ...(policy.tipoRecursoId === undefined ? {} : { tipoRecursoId: policy.tipoRecursoId }),
    unidadId: policy.unidadId, activo: policy.activo, principal: policy.principal, state: "SELECTED" as const,
    unidad: reference(policyUnits.get(policy.unidadId) ?? null),
  }));
  const unitValid = Boolean(unidad?.activo && effectivePolicies.selected.some(policy => policy.unidadId === input.unidadId));

  const rows = familia === null ? [] : bounded(await ctx.db.query("atributosRecurso")
    .withIndex("porFamilia", query => query.eq("familiaRecursoId", familia._id)).take(MAX_SELECTION_CATALOG_ROWS + 1));
  const definitions = new Map<string, NonNullable<Awaited<ReturnType<typeof ctx.db.get<"definicionesAtributo">>>>>();
  for (const definitionId of new Set(rows.map(row => row.definicionAtributoId))) {
    const definition = await ctx.db.get(definitionId);
    if (definition === null) throw new Error("SELECTION_CATALOG_DEFINITION_MISSING");
    definitions.set(String(definitionId), definition);
  }
  const assignment = (row: typeof rows[number]) => {
    const definition = definitions.get(String(row.definicionAtributoId));
    if (!definition) throw new Error("SELECTION_CATALOG_DEFINITION_MISSING");
    return {
      id: String(row._id), familiaId: String(row.familiaRecursoId),
      ...(row.tipoRecursoId === undefined ? {} : { tipoId: String(row.tipoRecursoId) }),
      definicionId: String(row.definicionAtributoId), definicionClave: definition.clave,
      tipoDato: definition.tipoDato, modoCaptura: resolverModoCaptura(definition),
      activo: row.activo, aplicabilidad: row.aplicabilidad, participaIdentidad: row.participaIdentidad,
      orden: row.orden, effectiveReasons: [],
    };
  };
  const familiaAsignaciones = rows.filter(row => row.tipoRecursoId === undefined).map(assignment);
  const tipoAsignaciones = rows.filter(row => row.tipoRecursoId !== undefined).map(assignment);
  const selected = resolverAsignaciones({ familia: familiaAsignaciones, tipo: tipoAsignaciones, familiaId: input.familiaRecursoId, tipoId: input.tipoRecursoId }).selected;
  const valoresPermitidos = [] as SelectionCatalogGraph["valoresPermitidos"][number][];
  for (const definitionId of new Set(selected.map(row => row.definicionId))) {
    const values = bounded(await ctx.db.query("valoresPermitidosAtributo").withIndex("porDefinicionYClave", query => query.eq("definicionAtributoId", definitionId as Id<"definicionesAtributo">)).take(MAX_SELECTION_CATALOG_ROWS + 1));
    valoresPermitidos.push(...values.filter(value => value.activo).map(value => ({ id: String(value._id), definicionAtributoId: String(value.definicionAtributoId), clave: value.clave, nombre: value.nombre, orden: value.orden, activo: value.activo, valor: value.valor })));
  }
  await Promise.all(input.selecciones.map(selection => ctx.db.get(selection.asignacionAtributoId as Id<"atributosRecurso">)));
  const submittedValues = await Promise.all(input.selecciones.map(selection => ctx.db.get(selection.valorPermitidoId as Id<"valoresPermitidosAtributo">)));
  const valoresPermitidosDiagnosticos = submittedValues.filter((value): value is NonNullable<typeof value> => value !== null && !valoresPermitidos.some(candidate => candidate.id === String(value._id))).map(value => ({ id: String(value._id), definicionAtributoId: String(value.definicionAtributoId), clave: value.clave, nombre: value.nombre, orden: value.orden, activo: value.activo, valor: value.valor }));
  const opciones = [] as NonNullable<SelectionCatalogGraph["opciones"]>[number][];
  for (const optionId of new Set(valoresPermitidos.flatMap(value => value.valor.kind === "OPCION" ? [value.valor.opcionAtributoId] : []))) {
    const option = await ctx.db.get(optionId as Id<"opcionesAtributo">);
    if (option === null) throw new Error("SELECTION_CATALOG_OPTION_MISSING");
    opciones.push({ id: String(option._id), definicionAtributoId: String(option.definicionAtributoId), clave: option.clave, activo: option.activo });
  }
  const reglas = tipo === null ? [] : bounded(await ctx.db.query("reglasAtributoRecurso")
    .withIndex("porTipo", query => query.eq("tipoRecursoId", tipo._id)).take(MAX_SELECTION_CATALOG_ROWS + 1))
    .filter(rule => rule.activo).map(rule => ({ id: String(rule._id), atributoCondicionId: String(rule.atributoCondicionId), ...(rule.opcionCondicionId === undefined ? {} : { opcionCondicionId: String(rule.opcionCondicionId) }), ...(rule.valorPermitidoCondicionId === undefined ? {} : { valorPermitidoCondicionId: String(rule.valorPermitidoCondicionId) }), atributoAfectadoId: String(rule.atributoAfectadoId), aplicabilidad: rule.aplicabilidad, activo: rule.activo }));

  return { hierarchyValid, unitValid, ownershipValid, clase: reference(clase), familia: referenciaFamilia(familia), tipo: referenciaTipo(tipo), unidad: reference(unidad), ...(organizacion === null ? {} : { organizacion: reference(organizacion) }), politicasUnidadEfectivas, familiaAsignaciones, tipoAsignaciones, valoresPermitidos, valoresPermitidosDiagnosticos, opciones, reglas };
}
