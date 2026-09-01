import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { registrarAlias, resolverAlias } from "../../catalogoRecursos/identidadesRecurso";
import { deriveResourceMetadata } from "./backfillMetadatos";
import type { ResourceValueInput } from "../resourceValidators";

type Ownership = { organizacionId?: Id<"organizaciones"> };

/** One indexed, bounded identity lookup; inactive Resources intentionally reserve identities. */
export async function buscarRecursoPorIdentidad(
  ctx: MutationCtx,
  input: { organizacionId?: Id<"organizaciones">; identificadorTecnico: string },
) {
  const query = input.organizacionId === undefined
    ? ctx.db.query("recursos").withIndex("porIdentificadorTecnico", q => q.eq("identificadorTecnico", input.identificadorTecnico))
    : ctx.db.query("recursos").withIndex("porOrganizacionYIdentificadorTecnico", q => q.eq("organizacionId", input.organizacionId).eq("identificadorTecnico", input.identificadorTecnico));
  return (await query.take(2))[0] ?? null;
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
    unidadId: Id<"unidades">;
    identificadorTecnico: string;
    nombre: string;
    descripcion?: string;
    ownership: Ownership;
    valores: ResourceValueInput[];
  },
): Promise<Id<"recursos">> {
  const recursoId = await ctx.db.insert("recursos", {
    tipoRecursoId: input.tipoRecursoId,
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
    ...deriveResourceMetadata(input.ownership),
  });
  for (const value of input.valores) {
    await ctx.db.insert("valoresAtributoRecurso", {
      recursoId,
      atributoRecursoId: value.atributoRecursoId,
      valor: value.valor,
      ...(value.opcionAtributoId === undefined ? {} : { opcionAtributoId: value.opcionAtributoId }),
    });
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
