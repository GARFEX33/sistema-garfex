import { internalMutation, internalQuery } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const args = {
  organizacionId: v.id("organizaciones"), recursoId: v.id("recursos"), version: v.number(), clave: v.string(),
};
const resultado = v.object({ _id: v.id("identidadesRecurso"), _creationTime: v.number(), organizacionId: v.id("organizaciones"), recursoId: v.id("recursos"), version: v.number(), clave: v.string(), activa: v.boolean(), creadaEn: v.number() });

type Ctx = MutationCtx | QueryCtx;

export async function registrarAlias(ctx: MutationCtx, input: { organizacionId: Id<"organizaciones">; recursoId: Id<"recursos">; version: number; clave: string }) {
  const recurso = await ctx.db.get(input.recursoId);
  if (!recurso || recurso.organizacionId !== input.organizacionId) throw new Error("El recurso no pertenece a la organización");
  const existente = await ctx.db.query("identidadesRecurso").withIndex("porOrganizacionVersionClave", q => q.eq("organizacionId", input.organizacionId).eq("version", input.version).eq("clave", input.clave)).first();
  if (existente) {
    if (existente.recursoId !== input.recursoId) throw new Error("Alias de identidad en conflicto");
    if (!existente.activa) await ctx.db.patch(existente._id, { activa: true });
    return (await ctx.db.get(existente._id))!;
  }
  const id = await ctx.db.insert("identidadesRecurso", { ...input, activa: true, creadaEn: Date.now() });
  return (await ctx.db.get(id))!;
}

export async function resolverAlias(ctx: Ctx, input: { organizacionId: Id<"organizaciones">; version: number; clave: string }) {
  return await ctx.db.query("identidadesRecurso").withIndex("porOrganizacionVersionClave", q => q.eq("organizacionId", input.organizacionId).eq("version", input.version).eq("clave", input.clave)).first();
}

export async function eliminarAliasesRecurso(ctx: MutationCtx, recursoId: Id<"recursos">) {
  const aliases = await ctx.db.query("identidadesRecurso").withIndex("porRecurso", q => q.eq("recursoId", recursoId)).collect();
  for (const alias of aliases) await ctx.db.delete(alias._id);
}

export const registrar = internalMutation({ args, returns: resultado, handler: (ctx, input) => registrarAlias(ctx, input) });
export const resolver = internalQuery({ args: { organizacionId: v.id("organizaciones"), version: v.number(), clave: v.string() }, returns: v.union(resultado, v.null()), handler: (ctx, input) => resolverAlias(ctx, input) });
export const eliminar = internalMutation({ args: { recursoId: v.id("recursos") }, returns: v.null(), handler: async (ctx, { recursoId }) => { await eliminarAliasesRecurso(ctx, recursoId); return null; } });
