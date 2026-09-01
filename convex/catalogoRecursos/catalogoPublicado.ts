import { internalMutation, query } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { canonicalizeCatalog, sha256Hex, type CanonicalCatalog, type CanonicalSnapshot } from "../../src/catalogoRecursos/dominio/catalogoPublicado";
import { snapshotResultadoValidator, type Snapshot } from "./catalogoPublicadoValidators";
import { resolverCatalogoEfectivo, resolverJerarquiaEfectiva } from "../../src/catalogoRecursos/dominio/catalogoEfectivo";
import { cargarAgregado } from "../catalogoAdmin/lib/cargarAgregado";

const claveArgs = { organizacionClave: v.string() };
const revisionResultado = v.object({
  revisionId: v.id("catalogoRevisiones"),
  numero: v.number(),
  hashContenido: v.string(),
  creadoEn: v.number(),
  publicadoEn: v.number(),
});

type SnapshotEntry = { tipoClave: string; snapshot: Snapshot };
type OptionDoc = Doc<"opcionesAtributo">;
type AttributeDoc = Doc<"atributosRecurso">;
type DefinitionDoc = Doc<"definicionesAtributo">;

export const MAX_PUBLICATION_TYPES = 200;
export const MAX_PUBLICATION_ROWS = 8_000;
export const MAX_CANONICAL_BYTES = 8 * 1024 * 1024;

function boundedRows<T>(rows: T[]): T[] {
  if (rows.length > MAX_PUBLICATION_ROWS) throw new Error("CATALOG_LIMIT_EXCEEDED");
  return rows;
}

export type BuiltCatalog = { snapshots: SnapshotEntry[]; hash: string };

function compareCodePoints(left: string | undefined, right: string | undefined): number {
  const leftPoints = Array.from(left ?? "").map(character => character.codePointAt(0)!);
  const rightPoints = Array.from(right ?? "").map(character => character.codePointAt(0)!);
  for (let index = 0; index < Math.min(leftPoints.length, rightPoints.length); index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
}

function compareStable(left: unknown, right: unknown): number {
  return compareCodePoints(JSON.stringify(left), JSON.stringify(right));
}

export async function compile(ctx: MutationCtx): Promise<BuiltCatalog> {
  const allRelations = await ctx.db.query("relacionesOpcionesAtributo").withIndex("porActivo", query => query.eq("activo", true)).take(MAX_PUBLICATION_ROWS + 1);
  const compatibilityPolicyRows = await ctx.db.query("politicasCompatibilidadOpciones").take(MAX_PUBLICATION_ROWS + 1);
  const compatibilityPoliciesById = new Map(compatibilityPolicyRows.map(policy => [policy._id, policy]));
  const types = await ctx.db.query("tiposRecurso").withIndex("porFamilia").take(MAX_PUBLICATION_TYPES + 1);
  if (allRelations.length > MAX_PUBLICATION_ROWS || compatibilityPolicyRows.length > MAX_PUBLICATION_ROWS || types.length > MAX_PUBLICATION_TYPES) throw new Error("CATALOG_LIMIT_EXCEEDED");
  const effectiveTypeIds = new Set<string>();
  for (const type of types) {
    const family = await ctx.db.get(type.familiaRecursoId);
    const classDocument = family ? await ctx.db.get(family.claseRecursoId) : null;
    if (resolverJerarquiaEfectiva({ classId: String(classDocument?._id), familyId: String(family?._id), typeId: String(type._id), familyClassId: String(family?.claseRecursoId), typeFamilyId: String(type.familiaRecursoId), classActive: classDocument?.activo, familyActive: family?.activo, typeActive: type.activo }).effective) effectiveTypeIds.add(String(type._id));
  }
  if (allRelations.some(relation => {
    const policy = relation.politicaCompatibilidadId === undefined ? undefined : compatibilityPoliciesById.get(relation.politicaCompatibilidadId);
    return policy === undefined || (!policy.activo && effectiveTypeIds.has(String(policy.tipoRecursoId)));
  })) throw new Error("Relación activa sin política de compatibilidad activa");
  const activeTypes = types.filter(type => effectiveTypeIds.has(String(type._id)));
  const ambiguousKeys = new Set<string>();
  const seenKeys = new Set<string>();
  for (const type of activeTypes) (seenKeys.has(type.clave) ? ambiguousKeys : seenKeys).add(type.clave);
  if (ambiguousKeys.size > 0) throw new Error(`TYPE_KEY_AMBIGUOUS:${[...ambiguousKeys].sort(compareCodePoints).join(",")}`);
  activeTypes.sort((left, right) => compareCodePoints(left.clave, right.clave) || compareStable(left, right));
  const snapshots: SnapshotEntry[] = [];
  const canonical: CanonicalCatalog = [];

  for (const type of activeTypes) {
    const aggregate = await cargarAgregado(ctx, type._id);
    if (aggregate.status === "INVALID" && aggregate.violations[0]?.code !== "COMPATIBILITY_POLICY_CONFLICT") {
      const violation = aggregate.violations[0];
      const legacyDetail = violation?.code === "PRINCIPAL_UNIT_COUNT"
        ? `Tipo ${type.clave}: se requiere exactamente una unidad natural efectiva`
        : violation?.code === "UNIT_INACTIVE"
          ? `Unidad natural inválida para ${type.clave}`
          : violation?.code === "PRESENTATION_COUNT"
            ? `Tipo ${type.clave}: se requiere exactamente una política de presentación activa`
            : violation?.code === "PRESENTATION_TOKEN_INVALID"
              ? `Política de presentación inválida para ${type.clave}: atributo no efectivo`
              : violation?.detail ?? "effective aggregate is invalid";
      throw new Error(`${violation?.code ?? "ASSIGNMENT_SELECTION_INVALID"}:${legacyDetail}`);
    }
    const family = await ctx.db.get(type.familiaRecursoId);
    const classDocument = family ? await ctx.db.get(family.claseRecursoId) : null;
    if (!family || !classDocument || !resolverJerarquiaEfectiva({ classId: String(classDocument._id), familyId: String(family._id), typeId: String(type._id), familyClassId: String(family.claseRecursoId), typeFamilyId: String(type.familiaRecursoId), classActive: classDocument.activo, familyActive: family.activo, typeActive: type.activo }).effective) continue;

    const policies = boundedRows(await ctx.db.query("politicasUnidadRecurso")
      .withIndex("porFamilia", query => query.eq("familiaRecursoId", family._id))
      .take(MAX_PUBLICATION_ROWS + 1));
    const effectivePolicies = resolverCatalogoEfectivo({
      clase: { id: String(classDocument._id), clave: classDocument.clave, activo: classDocument.activo },
      familia: { id: String(family._id), clave: family.clave, activo: family.activo, claseRecursoId: String(family.claseRecursoId) },
      tipo: { id: String(type._id), clave: type.clave, activo: type.activo, familiaRecursoId: String(type.familiaRecursoId) },
      unidad: null, politicas: policies.map(policy => ({ id: String(policy._id), familiaRecursoId: String(policy.familiaRecursoId), tipoRecursoId: policy.tipoRecursoId === undefined ? undefined : String(policy.tipoRecursoId), unidadId: String(policy.unidadId), activo: policy.activo, principal: policy.principal })), atributos: [], reglas: [], opciones: [],
    } as never);
    const effectiveByUnit = new Map(policies.filter(policy => effectivePolicies.policies.some(selected => String(selected.id) === String(policy._id))).map(policy => [policy.unidadId, policy]));
    const principals = [...effectiveByUnit.values()].filter(policy => policy.activo && policy.principal);
    if (principals.length !== 1) {
      throw new Error(`Tipo ${type.clave}: se requiere exactamente una unidad natural efectiva`);
    }

    const naturalUnit = await ctx.db.get(principals[0].unidadId);
    if (!naturalUnit?.activo) throw new Error(`Unidad natural inválida para ${type.clave}`);

    const attributes = boundedRows(await ctx.db.query("atributosRecurso")
      .withIndex("porFamilia", query => query.eq("familiaRecursoId", family._id))
      .take(MAX_PUBLICATION_ROWS + 1));
    const effectiveAssignments = resolverCatalogoEfectivo({
      clase: { id: String(classDocument._id), clave: classDocument.clave, activo: classDocument.activo },
      familia: { id: String(family._id), clave: family.clave, activo: family.activo, claseRecursoId: String(family.claseRecursoId) },
      tipo: { id: String(type._id), clave: type.clave, activo: type.activo, familiaRecursoId: String(type.familiaRecursoId) },
      unidad: null, politicas: [], atributos: attributes.map(attribute => ({ ...attribute, id: String(attribute._id), familiaId: String(attribute.familiaRecursoId), tipoId: attribute.tipoRecursoId === undefined ? undefined : String(attribute.tipoRecursoId), definicionId: String(attribute.definicionAtributoId), definicionClave: String(attribute.definicionAtributoId) })), reglas: [], opciones: [],
    } as never);
    const selected = new Map<Id<"definicionesAtributo">, AttributeDoc>(attributes.filter(attribute => effectiveAssignments.assignments.some(row => String(row.id) === String(attribute._id))).map(attribute => [attribute.definicionAtributoId, attribute]));

    const snapshotAttributes: Snapshot["atributos"] = [];
    const optionDefinitions = new Map<Id<"opcionesAtributo">, { attribute: AttributeDoc; definition: DefinitionDoc; option: OptionDoc }>();
    for (const attribute of selected.values()) {
      if (!attribute.activo || attribute.aplicabilidad === "FORBIDDEN" || attribute.aplicabilidad === "NOT_APPLICABLE") continue;
      const definition = await ctx.db.get(attribute.definicionAtributoId);
      if (!definition?.activo) continue;
      const attributeUnit = definition.unidadId ? await ctx.db.get(definition.unidadId) : null;
      const options = boundedRows(await ctx.db.query("opcionesAtributo")
        .withIndex("porDefinicion", query => query.eq("definicionAtributoId", definition._id))
        .take(MAX_PUBLICATION_ROWS + 1))
        .filter(option => option.activo)
        .sort((left, right) => compareCodePoints(left.clave, right.clave) || compareStable(left, right));
      for (const option of options) optionDefinitions.set(option._id, { attribute, definition, option });
      snapshotAttributes.push({
        id: attribute._id,
        definicionAtributoId: definition._id,
        clave: definition.clave,
        nombre: definition.nombre,
        descripcion: definition.descripcion,
        tipoDato: definition.tipoDato,
        unidad: attributeUnit ? { id: attributeUnit._id, clave: attributeUnit.clave, nombre: attributeUnit.nombre, simbolo: attributeUnit.simbolo ?? null } : null,
        participaIdentidad: attribute.participaIdentidad,
        aplicabilidad: attribute.aplicabilidad,
        orden: attribute.orden,
        opciones: options.map(option => ({ id: option._id, clave: option.clave, nombre: option.nombre, descripcion: option.descripcion })),
      });
    }

    const effectiveAttributeIds = new Set(snapshotAttributes.map(attribute => attribute.id));
    const effectiveDefinitionIds = new Set(snapshotAttributes.map(attribute => attribute.definicionAtributoId));
    const rules: Snapshot["reglas"] = [];
    const ruleRows = boundedRows(await ctx.db.query("reglasAtributoRecurso")
      .withIndex("porTipo", query => query.eq("tipoRecursoId", type._id))
      .take(MAX_PUBLICATION_ROWS + 1));
    for (const rule of ruleRows.filter(item => item.activo)) {
      if (!effectiveAttributeIds.has(rule.atributoCondicionId) || !effectiveAttributeIds.has(rule.atributoAfectadoId)) continue;
      const conditionAttribute = await ctx.db.get(rule.atributoCondicionId);
      const affectedAttribute = await ctx.db.get(rule.atributoAfectadoId);
      if (!conditionAttribute || !affectedAttribute) continue;
      const conditionDefinition = await ctx.db.get(conditionAttribute.definicionAtributoId);
      const affectedDefinition = await ctx.db.get(affectedAttribute.definicionAtributoId);
      if (!conditionDefinition || !affectedDefinition || !effectiveDefinitionIds.has(conditionDefinition._id) || !effectiveDefinitionIds.has(affectedDefinition._id)) continue;
      let conditionOptionKey: string | undefined;
      if (rule.opcionCondicionId !== undefined) {
        const option = optionDefinitions.get(rule.opcionCondicionId);
        if (!option || option.definition._id !== conditionDefinition._id) continue;
        conditionOptionKey = option.option.clave;
      }
      rules.push({ id: rule._id, atributoCondicionClave: conditionDefinition.clave, opcionCondicionClave: conditionOptionKey, atributoAfectadoClave: affectedDefinition.clave, aplicabilidad: rule.aplicabilidad });
    }

    const compatibilityPolicies: Snapshot["politicasCompatibilidad"] = [];
    for (const policy of compatibilityPolicyRows.filter(item => item.activo && item.tipoRecursoId === type._id)) {
      const originAttribute = await ctx.db.get(policy.atributoOrigenId);
      const destinationAttribute = await ctx.db.get(policy.atributoDestinoId);
      if (!originAttribute || !destinationAttribute || !effectiveAttributeIds.has(originAttribute._id) || !effectiveAttributeIds.has(destinationAttribute._id)) {
        throw new Error(`Política de compatibilidad inválida para ${type.clave}: endpoints no efectivos`);
      }
      const originDefinition = await ctx.db.get(originAttribute.definicionAtributoId);
      const destinationDefinition = await ctx.db.get(destinationAttribute.definicionAtributoId);
      if (!originDefinition || !destinationDefinition) throw new Error(`Política de compatibilidad inválida para ${type.clave}`);
      const pairs: Snapshot["politicasCompatibilidad"][number]["pares"] = [];
      for (const relation of allRelations.filter(item => item.activo && item.politicaCompatibilidadId === policy._id)) {
        const origin = optionDefinitions.get(relation.opcionOrigenId);
        const destination = optionDefinitions.get(relation.opcionDestinoId);
        if (!origin || !destination || origin.attribute._id !== originAttribute._id || destination.attribute._id !== destinationAttribute._id) {
          throw new Error(`Política de compatibilidad inválida para ${type.clave}: opción fuera de endpoint`);
        }
        pairs.push({ origenOpcionClave: origin.option.clave, destinoOpcionClave: destination.option.clave });
      }
      compatibilityPolicies.push({ atributoOrigenClave: originDefinition.clave, atributoDestinoClave: destinationDefinition.clave, modo: policy.modo, direccion: policy.direccion, pares: pairs });
    }

    const presentationPolicies = boundedRows(await ctx.db.query("politicasPresentacionCanonica")
          .withIndex("porTipoYActivo", query => query.eq("tipoRecursoId", type._id).eq("activo", true))
          .take(MAX_PUBLICATION_ROWS + 1));
        if (presentationPolicies.length !== 1) throw new Error(`Tipo ${type.clave}: se requiere exactamente una política de presentación activa`);
        const presentationPolicy = presentationPolicies[0];
        if (presentationPolicy.separador.trim() === "" || presentationPolicy.separador.length > 100 || presentationPolicy.tokens.length === 0) throw new Error(`Política de presentación inválida para ${type.clave}`);
        const presentationTokens: NonNullable<Snapshot["presentacionCanonica"]>["tokens"] = [];
        let structural = false;
        for (const token of presentationPolicy.tokens) {
          if (token.tipo === "TYPE_NAME") { presentationTokens.push(token); structural = true; }
          else if (token.tipo === "LITERAL") {
            if (token.texto.trim() === "" || token.texto.length > 1000) throw new Error(`Política de presentación inválida para ${type.clave}`);
            presentationTokens.push(token); structural = true;
          } else {
            const attribute = snapshotAttributes.find(item => item.id === token.atributoRecursoId);
            if (!attribute) throw new Error(`Política de presentación inválida para ${type.clave}: atributo no efectivo`);
            presentationTokens.push({ tipo: "ATTRIBUTE_VALUE", atributoClave: attribute.clave });
          }
        }
        if (!structural) throw new Error(`Política de presentación inválida para ${type.clave}: nombre estructuralmente vacío`);

        const snapshot: Snapshot = {
      clase: { id: classDocument._id, clave: classDocument.clave, nombre: classDocument.nombre, descripcion: classDocument.descripcion },
      familia: { id: family._id, clave: family.clave, nombre: family.nombre, descripcion: family.descripcion },
      tipo: { id: type._id, clave: type.clave, nombre: type.nombre, descripcion: type.descripcion },
      unidadNatural: { id: naturalUnit._id, clave: naturalUnit.clave, nombre: naturalUnit.nombre, descripcion: naturalUnit.descripcion, simbolo: naturalUnit.simbolo },
      atributos: snapshotAttributes,
      reglas: rules,
      politicasCompatibilidad: compatibilityPolicies,
       presentacionCanonica: { tipoNombre: type.nombre, tokens: presentationTokens, separador: presentationPolicy.separador },
    };
    snapshots.push({ tipoClave: type.clave, snapshot });
    canonical.push({ tipoClave: type.clave, snapshot: toCanonical(snapshot) });
  }

  const canonicalContent = canonicalizeCatalog(canonical);
  if (new TextEncoder().encode(canonicalContent).byteLength > MAX_CANONICAL_BYTES) throw new Error("CATALOG_LIMIT_EXCEEDED");
  return { snapshots, hash: await sha256Hex(canonicalContent) };
}

function toCanonical(snapshot: Snapshot): CanonicalSnapshot {
  return {
    clase: { clave: snapshot.clase.clave, nombre: snapshot.clase.nombre, descripcion: snapshot.clase.descripcion },
    familia: { clave: snapshot.familia.clave, nombre: snapshot.familia.nombre, descripcion: snapshot.familia.descripcion },
    tipo: { clave: snapshot.tipo.clave, nombre: snapshot.tipo.nombre, descripcion: snapshot.tipo.descripcion },
    unidadNatural: { clave: snapshot.unidadNatural.clave, nombre: snapshot.unidadNatural.nombre, descripcion: snapshot.unidadNatural.descripcion, simbolo: snapshot.unidadNatural.simbolo },
    atributos: snapshot.atributos.map(attribute => ({ clave: attribute.clave, nombre: attribute.nombre, descripcion: attribute.descripcion, tipoDato: attribute.tipoDato, unidad: attribute.unidad ? { clave: attribute.unidad.clave, nombre: attribute.unidad.nombre, simbolo: attribute.unidad.simbolo } : null, participaIdentidad: attribute.participaIdentidad, aplicabilidad: attribute.aplicabilidad, orden: attribute.orden, opciones: attribute.opciones.map(option => ({ clave: option.clave, nombre: option.nombre, descripcion: option.descripcion })) })),
    reglas: snapshot.reglas.map(rule => ({ atributoCondicionClave: rule.atributoCondicionClave, opcionCondicionClave: rule.opcionCondicionClave, atributoAfectadoClave: rule.atributoAfectadoClave, aplicabilidad: rule.aplicabilidad })),
    politicasCompatibilidad: snapshot.politicasCompatibilidad,
     presentacionCanonica: snapshot.presentacionCanonica,
  };
}

export const asegurarOrganizacion = internalMutation({
  args: { clave: v.string(), nombre: v.string() },
  returns: v.id("organizaciones"),
  handler: async (ctx, { clave, nombre }) => {
    const found = await ctx.db.query("organizaciones").withIndex("porClave", query => query.eq("clave", clave)).first();
    if (found) return found._id;
    return await ctx.db.insert("organizaciones", { clave, nombre, activo: true, revision: 1 });
  },
});

export type PublicationResult = { disposition: "CREATED" | "UNCHANGED"; revisionId: Id<"catalogoRevisiones">; numero: number; hashContenido: string };

export async function publicarCatalogoEnTransaccion(ctx: MutationCtx, organizacionId: Id<"organizaciones">): Promise<PublicationResult> {
  const organization = await ctx.db.get(organizacionId);
  if (!organization?.activo) throw new Error("Organización inválida");
  const built = await compile(ctx);
  const latest = await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYEstado", query => query.eq("organizacionId", organizacionId).eq("estado", "PUBLISHED")).order("desc").first();
  if (latest?.hashContenido === built.hash) return { disposition: "UNCHANGED", revisionId: latest._id, numero: latest.numero, hashContenido: latest.hashContenido };
  const previous = await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYNumero", query => query.eq("organizacionId", organizacionId)).order("desc").first();
  const numero = (previous?.numero ?? 0) + 1;
  const now = Date.now();
  const revisionId = await ctx.db.insert("catalogoRevisiones", { organizacionId, numero, estado: "PUBLISHED", hashContenido: built.hash, creadoEn: now, publicadoEn: now });
  for (const entry of built.snapshots) await ctx.db.insert("catalogoTipoSnapshots", { organizacionId, revisionId, tipoClave: entry.tipoClave, snapshot: entry.snapshot });
  return { disposition: "CREATED", revisionId, numero, hashContenido: built.hash };
}

export const publicarCatalogo = internalMutation({
  args: { organizacionId: v.id("organizaciones") },
  returns: v.object({ revisionId: v.id("catalogoRevisiones"), numero: v.number(), hashContenido: v.string() }),
  handler: async (ctx, { organizacionId }) => {
    const organization = await ctx.db.get(organizacionId);
    if (!organization?.activo) throw new Error("Organización inválida");
    const built = await compile(ctx);
    const latest = await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYEstado", query => query.eq("organizacionId", organizacionId).eq("estado", "PUBLISHED")).order("desc").first();
    if (latest?.hashContenido === built.hash) return { revisionId: latest._id, numero: latest.numero, hashContenido: latest.hashContenido };
    const previous = await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYNumero", query => query.eq("organizacionId", organizacionId)).order("desc").first();
    const numero = (previous?.numero ?? 0) + 1;
    const now = Date.now();
    const revisionId = await ctx.db.insert("catalogoRevisiones", { organizacionId, numero, estado: "PUBLISHED", hashContenido: built.hash, creadoEn: now, publicadoEn: now });
    for (const entry of built.snapshots) await ctx.db.insert("catalogoTipoSnapshots", { organizacionId, revisionId, tipoClave: entry.tipoClave, snapshot: entry.snapshot });
    return { revisionId, numero, hashContenido: built.hash };
  },
});

export const obtenerUltimaRevisionPublicada = query({
  args: claveArgs,
  returns: v.union(revisionResultado, v.null()),
  handler: async (ctx, { organizacionClave }) => {
    const organization = await ctx.db.query("organizaciones").withIndex("porClave", query => query.eq("clave", organizacionClave)).first();
    if (!organization) return null;
    const revision = await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYEstado", query => query.eq("organizacionId", organization._id).eq("estado", "PUBLISHED")).order("desc").first();
    return revision ? { revisionId: revision._id, numero: revision.numero, hashContenido: revision.hashContenido, creadoEn: revision.creadoEn, publicadoEn: revision.publicadoEn } : null;
  },
});

export const obtenerSnapshotTipo = query({
  args: { ...claveArgs, tipoClave: v.string(), revisionId: v.optional(v.id("catalogoRevisiones")) },
  returns: v.union(snapshotResultadoValidator, v.null()),
  handler: async (ctx, { organizacionClave, tipoClave, revisionId }) => {
    const organization = await ctx.db.query("organizaciones").withIndex("porClave", query => query.eq("clave", organizacionClave)).first();
    if (!organization) return null;
    const revision = revisionId
      ? await ctx.db.get(revisionId)
      : await ctx.db.query("catalogoRevisiones").withIndex("porOrganizacionYEstado", query => query.eq("organizacionId", organization._id).eq("estado", "PUBLISHED")).order("desc").first();
    if (!revision || revision.organizacionId !== organization._id) return null;
    const stored = await ctx.db.query("catalogoTipoSnapshots").withIndex("porRevisionYTipo", query => query.eq("revisionId", revision._id).eq("tipoClave", tipoClave)).first();
    return stored ? { revisionId: stored.revisionId, tipoClave: stored.tipoClave, snapshot: stored.snapshot } : null;
  },
});
