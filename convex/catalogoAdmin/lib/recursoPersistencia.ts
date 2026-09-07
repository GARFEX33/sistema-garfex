import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { registrarAlias, resolverAlias } from "../../catalogoRecursos/identidadesRecurso";
import { deriveResourceMetadata } from "./backfillMetadatos";
import type { ResourceValue, ResourceValueInput } from "../resourceValidators";

type Ownership = { organizacionId?: Id<"organizaciones"> };
type Classification = {
  tipoRecursoId: Id<"tiposRecurso">;
  claseRecursoId: Id<"clasesRecurso">;
  familiaRecursoId: Id<"familiasRecurso">;
  unidadId: Id<"unidades">;
};

/** Internal persistence may carry the additive stored reference without widening legacy inputs. */
export type StoredResourceValueInput = ResourceValueInput & { valorPermitidoId?: Id<"valoresPermitidosAtributo"> };
export type SelectionResourceValueInput = StoredResourceValueInput & { valorPermitidoId: Id<"valoresPermitidosAtributo"> };

function storedValueDocument(recursoId: Id<"recursos">, value: StoredResourceValueInput) {
  return {
    recursoId,
    atributoRecursoId: value.atributoRecursoId,
    valor: value.valor,
    ...(value.opcionAtributoId === undefined ? {} : { opcionAtributoId: value.opcionAtributoId }),
    ...(value.valorPermitidoId === undefined ? {} : { valorPermitidoId: value.valorPermitidoId }),
  };
}

/** One indexed, bounded identity lookup; inactive Resources intentionally reserve identities. */
export async function buscarRecursoPorIdentidad(
  ctx: MutationCtx,
  input: { organizacionId?: Id<"organizaciones">; identificadorTecnico: string; excludeRecursoId?: Id<"recursos"> },
) {
  const query = input.organizacionId === undefined
    ? ctx.db.query("recursos").withIndex("porOrganizacionYIdentificadorTecnico", q => q.eq("organizacionId", undefined).eq("identificadorTecnico", input.identificadorTecnico))
    : ctx.db.query("recursos").withIndex("porOrganizacionYIdentificadorTecnico", q => q.eq("organizacionId", input.organizacionId).eq("identificadorTecnico", input.identificadorTecnico));
  return (await query.take(2)).find(row => row._id !== input.excludeRecursoId) ?? null;
}

/** Alias ownership is exact: organization, identity version, and derived key. */
export async function buscarAliasExacto(
  ctx: MutationCtx,
  input: { organizacionId: Id<"organizaciones">; version: number; clave: string },
) {
  return resolverAlias(ctx, input);
}

/** Server-only aggregate seam: callers provide resolved classification and derived lifecycle/identity. */
export async function insertarAgregadoRecurso(
  ctx: MutationCtx,
  input: {
    classification: Classification;
    ownership: Ownership;
    nombre: string;
    identificadorTecnico: string;
    identidadVersion?: number;
    activo: boolean;
    descripcion?: string;
    valores: StoredResourceValueInput[];
  },
): Promise<Id<"recursos">> {
  const { adminScopeKey } = deriveResourceMetadata(input.ownership);
  const recursoId = await ctx.db.insert("recursos", {
    ...input.classification,
    identificadorTecnico: input.identificadorTecnico,
    nombre: input.nombre,
    ...(input.descripcion === undefined ? {} : { descripcion: input.descripcion }),
    activo: input.activo,
    revision: 1,
    ...(input.ownership.organizacionId === undefined ? {} : { organizacionId: input.ownership.organizacionId }),
    ...(input.identidadVersion === undefined ? {} : { identidadVersion: input.identidadVersion }),
    adminScopeKey,
  });
  for (const value of input.valores) await ctx.db.insert("valoresAtributoRecurso", storedValueDocument(recursoId, value));
  if (input.ownership.organizacionId !== undefined && input.identidadVersion !== undefined) {
    await registrarAlias(ctx, { organizacionId: input.ownership.organizacionId, recursoId, version: input.identidadVersion, clave: input.identificadorTecnico });
  }
  return recursoId;
}

/** Legacy wrapper preserves v1 organization identity and all caller-observable behavior. */
export async function insertarRecursoAdministrativo(
  ctx: MutationCtx,
  input: Classification & { identificadorTecnico: string; nombre: string; descripcion?: string; ownership: Ownership; valores: ResourceValueInput[] },
): Promise<Id<"recursos">> {
  return insertarAgregadoRecurso(ctx, {
    classification: {
      claseRecursoId: input.claseRecursoId,
      familiaRecursoId: input.familiaRecursoId,
      tipoRecursoId: input.tipoRecursoId,
      unidadId: input.unidadId,
    },
    ownership: input.ownership,
    nombre: input.nombre,
    identificadorTecnico: input.identificadorTecnico,
    ...(input.ownership.organizacionId === undefined ? {} : { identidadVersion: 1 }),
    activo: false,
    ...(input.descripcion === undefined ? {} : { descripcion: input.descripcion }),
    valores: input.valores,
  });
}

/** Replace the bounded Resource value set inside the caller's Convex transaction. */
export async function reemplazarValoresRecurso(
  ctx: MutationCtx,
  recursoId: Id<"recursos">,
  anteriores: ResourceValue[],
  valores: ResourceValueInput[],
): Promise<void> {
  for (const anterior of anteriores) await ctx.db.delete(anterior._id);
  for (const valor of valores) {
    await ctx.db.insert("valoresAtributoRecurso", storedValueDocument(recursoId, valor));
  }
}
