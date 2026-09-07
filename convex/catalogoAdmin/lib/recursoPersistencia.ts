import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { registrarAlias, resolverAlias } from "../../catalogoRecursos/identidadesRecurso";
import { deriveResourceMetadata } from "./backfillMetadatos";
import type { ResourceValue, ResourceValueInput } from "../resourceValidators";

type Ownership = { organizacionId?: Id<"organizaciones"> };

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

/** Writes one complete Resource aggregate; Convex owns atomic rollback and OCC. */
export async function insertarRecursoAdministrativo(
  ctx: MutationCtx,
  input: {
    tipoRecursoId: Id<"tiposRecurso">;
    claseRecursoId: Id<"clasesRecurso">;
    familiaRecursoId: Id<"familiasRecurso">;
    unidadId: Id<"unidades">;
    identificadorTecnico: string;
    nombre: string;
    descripcion?: string;
    ownership: Ownership;
    valores: ResourceValueInput[];
  },
): Promise<Id<"recursos">> {
  const { adminScopeKey } = deriveResourceMetadata(input.ownership);
  const recursoId = await ctx.db.insert("recursos", {
    tipoRecursoId: input.tipoRecursoId,
    claseRecursoId: input.claseRecursoId,
    familiaRecursoId: input.familiaRecursoId,
    unidadId: input.unidadId,
    identificadorTecnico: input.identificadorTecnico,
    nombre: input.nombre,
    ...(input.descripcion === undefined ? {} : { descripcion: input.descripcion }),
    activo: false,
    revision: 1,
    ...(input.ownership.organizacionId === undefined ? {} : {
      organizacionId: input.ownership.organizacionId,
      identidadVersion: 1,
    }),
    adminScopeKey,
  });
  for (const value of input.valores) {
    await ctx.db.insert("valoresAtributoRecurso", storedValueDocument(recursoId, value));
  }
  if (input.ownership.organizacionId !== undefined) {
    await registrarAlias(ctx, {
      organizacionId: input.ownership.organizacionId,
      recursoId,
      version: 1,
      clave: input.identificadorTecnico,
    });
  }
  return recursoId;
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
