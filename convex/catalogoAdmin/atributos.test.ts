import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = {
  ...import.meta.glob("../_generated/**/*.{ts,js}"),
  ...Object.fromEntries(Object.entries(import.meta.glob("./*.{ts,js}")).map(([path, module]) => [`../catalogoAdmin/${path.slice(2)}`, module])),
};

async function tree(t: ReturnType<typeof convexTest>, active = true) {
  return t.run(async ctx => {
    const clase = await ctx.db.insert("clasesRecurso", { clave: "C", nombre: "C", activo: active, revision: 1 });
    const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "F", nombre: "F", activo: active, revision: 1 });
    const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: familia, clave: "T", nombre: "T", activo: active, revision: 1 });
    return { clase, familia, tipo };
  });
}

describe("administración de definiciones y opciones", () => {
  it("enforces definition type/unit policy, identity, revisions, and ALL reads", async () => {
    const t = convexTest(schema, modules);
    const unit = await t.mutation(api.catalogoAdmin.unidades.crearUnidad, { clave: "U", nombre: "Unit", activo: true });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "bad", nombre: "Bad", tipoDato: "TEXTO", unidadId: unit.item.id })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    const inactive = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: " D ", nombre: " Definition ", tipoDato: "OPCION" });
    expect(inactive.item).toMatchObject({ clave: "D", nombre: "Definition", activo: false, revision: 1 });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "D", nombre: "Again", tipoDato: "OPCION" })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: inactive.item.id, expectedRevision: 1, clave: "OTHER" })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: inactive.item.id, expectedRevision: 1, nombre: " Definition " })).resolves.toMatchObject({ disposition: "UNCHANGED" });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: inactive.item.id, expectedRevision: 2, nombre: "stale" })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION" } });
    const page = await t.query(api.catalogoAdmin.atributos.listarDefinicionesAtributo, { cursor: null, pageSize: 10 });
    expect(page.items).toHaveLength(1);
    expect(await t.query(api.catalogoAdmin.atributos.obtenerDefinicionAtributo, { definicionAtributoId: inactive.item.id })).toMatchObject({ effective: false });
  });

  it("restricts options to OPCION definitions and reserves inactive identities", async () => {
    const t = convexTest(schema, modules);
    const text = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "T", nombre: "Text", tipoDato: "TEXTO" });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: text.item.id, clave: "X", nombre: "X" })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE" } });
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "O", nombre: "Option", tipoDato: "OPCION", activo: true });
    const option = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: definition.item.id, clave: " X ", nombre: " X ", activo: false });
    expect(option.item).toMatchObject({ clave: "X", activo: false, effective: false, revision: 1 });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: definition.item.id, clave: "X", nombre: "Again" })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1, definicionAtributoId: text.item.id })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.activarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: true } });
  });

  it("keeps active options inert below an inactive definition and blocks effective dependency removal", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "O", nombre: "Option", tipoDato: "OPCION", activo: true });
    const option = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: definition.item.id, clave: "X", nombre: "X", activo: true });
    await t.run(async ctx => {
      const assignment = await ctx.db.insert("atributosRecurso", { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 });
      await ctx.db.insert("reglasAtributoRecurso", { tipoRecursoId: ids.tipo, atributoCondicionId: assignment, atributoAfectadoId: assignment, opcionCondicionId: option.item.id, aplicabilidad: "OPTIONAL", activo: true, revision: 1 });
    });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    await t.run(async ctx => { for (const row of await ctx.db.query("reglasAtributoRecurso").withIndex("porTipo").take(10)) await ctx.db.delete(row._id); for (const row of await ctx.db.query("atributosRecurso").withIndex("porDefinicion", q => q.eq("definicionAtributoId", definition.item.id)).take(10)) await ctx.db.delete(row._id); });
    await t.mutation(api.catalogoAdmin.atributos.desactivarDefinicionAtributo, { definicionAtributoId: definition.item.id, expectedRevision: 1 });
    expect(await t.query(api.catalogoAdmin.atributos.obtenerOpcionAtributo, { opcionAtributoId: option.item.id })).toMatchObject({ effective: false });
  });

  it("blocks effective presentation, compatibility, and resource dependencies", async () => {
    const t = convexTest(schema, modules); const ids = await tree(t);
    const first = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "A", nombre: "A", tipoDato: "OPCION", activo: true });
    const second = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "B", nombre: "B", tipoDato: "OPCION", activo: true });
    const option = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: first.item.id, clave: "A1", nombre: "A1", activo: true });
    const option2 = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: second.item.id, clave: "B1", nombre: "B1", activo: true });
    const assignment = await t.run(async ctx => ctx.db.insert("atributosRecurso", { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: first.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true, revision: 1 }));
    await t.run(async ctx => { await ctx.db.insert("politicasPresentacionCanonica", { tipoRecursoId: ids.tipo, tokens: [{ tipo: "ATTRIBUTE_VALUE", atributoRecursoId: assignment }], separador: "-", activo: true, revision: 1 }); });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarDefinicionAtributo, { definicionAtributoId: first.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    await t.run(async ctx => { for (const row of await ctx.db.query("politicasPresentacionCanonica").withIndex("porTipo", q => q.eq("tipoRecursoId", ids.tipo)).take(10)) await ctx.db.delete(row._id); await ctx.db.insert("politicasCompatibilidadOpciones", { tipoRecursoId: ids.tipo, atributoOrigenId: assignment, atributoDestinoId: assignment, modo: "DENYLIST", direccion: "DIRECTIONAL", activo: true, revision: 1 }); });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarDefinicionAtributo, { definicionAtributoId: first.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    await t.run(async ctx => { for (const row of await ctx.db.query("politicasCompatibilidadOpciones").withIndex("porTipo", q => q.eq("tipoRecursoId", ids.tipo)).take(10)) await ctx.db.delete(row._id); const resource = await ctx.db.insert("recursos", { tipoRecursoId: ids.tipo, unidadId: await ctx.db.insert("unidades", { clave: "U", nombre: "U", activo: true, revision: 1 }), identificadorTecnico: "R", nombre: "R", activo: true, revision: 1 }); await ctx.db.insert("valoresAtributoRecurso", { recursoId: resource, atributoRecursoId: assignment, valor: "A", opcionAtributoId: option.item.id }); });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarOpcionAtributo, { opcionAtributoId: option.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_DEPENDENCY_BLOCKED" } });
    expect(option2.item.effective).toBe(true);
  });

  it("administra asignaciones con identidad, ownership y precedence", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "D", nombre: "D", tipoDato: "TEXTO", activo: true });
    const family = await t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, definicionAtributoId: definition.item.id, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 2 });
    expect(family.item).toMatchObject({ activo: false, revision: 1, selection: "SELECTED" });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true })).resolves.toMatchObject({ disposition: "CREATED" });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1, activo: true })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    const page = await t.query(api.catalogoAdmin.atributos.listarAsignacionesAtributo, { tipoRecursoId: ids.tipo, cursor: null, pageSize: 10 });
    expect(page.items.map(item => item.selection)).toEqual(["SHADOWED", "SELECTED"]);
  });

  it("requires options before an effective OPCION assignment can activate", async () => {
    const t = convexTest(schema, modules);
    const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "O", nombre: "O", tipoDato: "OPCION", activo: true });
    const assignment = await t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1 });
    await expect(t.mutation(api.catalogoAdmin.atributos.activarAsignacionAtributo, { atributoRecursoId: assignment.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
  });

  it("stores typed allowed values with scoped immutable identities and revisions", async () => {
    const t = convexTest(schema, modules);
    const text = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "TEXT", nombre: "Text", tipoDato: "TEXTO", activo: true });
    const number = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "NUMBER", nombre: "Number", tipoDato: "NUMERO", activo: true });
    const boolean = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "BOOLEAN", nombre: "Boolean", tipoDato: "BOOLEANO", activo: true });
    const optionDefinition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "OPTION", nombre: "Option", tipoDato: "OPCION", activo: true });
    const source = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: optionDefinition.item.id, clave: "SOURCE", nombre: "Source", activo: true });
    const inactiveSource = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: optionDefinition.item.id, clave: "INACTIVE", nombre: "Inactive", activo: false });
    const foreignDefinition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "FOREIGN_OPTION", nombre: "Foreign option", tipoDato: "OPCION", activo: true });
    const foreignSource = await t.mutation(api.catalogoAdmin.atributos.crearOpcionAtributo, { definicionAtributoId: foreignDefinition.item.id, clave: "FOREIGN", nombre: "Foreign", activo: true });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: text.item.id, clave: "WRONG", nombre: "Wrong", orden: 1, valor: { kind: "NUMERO", value: 3 } })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "valoresPermitidosAtributo", field: "valor.kind", reference: { kind: "definicionesAtributo", id: text.item.id } } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: number.item.id, clave: "INFINITE", nombre: "Infinite", orden: 1, valor: { kind: "NUMERO", value: Infinity } } as never)).rejects.toThrow();
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: number.item.id, clave: "FINITE", nombre: "Finite", orden: 1, valor: { kind: "NUMERO", value: 3.5 } })).resolves.toMatchObject({ item: { valor: { kind: "NUMERO", value: 3.5 } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: boolean.item.id, clave: "FALSE", nombre: "False", orden: 1, valor: { kind: "BOOLEANO", value: false } })).resolves.toMatchObject({ item: { valor: { kind: "BOOLEANO", value: false } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: optionDefinition.item.id, clave: "FOREIGN", nombre: "Foreign", orden: 1, valor: { kind: "OPCION", opcionAtributoId: foreignSource.item.id } })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "valoresPermitidosAtributo", field: "valor.opcionAtributoId", reference: { kind: "opcionesAtributo", id: foreignSource.item.id } } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: optionDefinition.item.id, clave: "INACTIVE", nombre: "Inactive", orden: 1, valor: { kind: "OPCION", opcionAtributoId: inactiveSource.item.id } })).rejects.toMatchObject({ data: { code: "ADMIN_INVALID_REFERENCE", context: { entityKind: "valoresPermitidosAtributo", field: "valor.opcionAtributoId", reference: { kind: "opcionesAtributo", id: inactiveSource.item.id } } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: optionDefinition.item.id, clave: "SOURCE", nombre: "Source", orden: 1, valor: { kind: "OPCION", opcionAtributoId: source.item.id } })).resolves.toMatchObject({ item: { valor: { kind: "OPCION", opcionAtributoId: source.item.id } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: optionDefinition.item.id, clave: "SOURCE_DUPLICATE", nombre: "Duplicate source", orden: 2, valor: { kind: "OPCION", opcionAtributoId: source.item.id } })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY" } });
    const textValue = await t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: text.item.id, clave: "TEXT_VALUE", nombre: "Text value", orden: 1, activo: false, valor: { kind: "TEXTO", value: "typed" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: text.item.id, clave: "TEXT_VALUE", nombre: "Duplicate", orden: 2, valor: { kind: "TEXTO", value: "duplicate" } })).rejects.toMatchObject({ data: { code: "ADMIN_DUPLICATE_KEY", context: { entityKind: "valoresPermitidosAtributo", key: "TEXT_VALUE", scope: text.item.id } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarValorPermitidoAtributo, { valorPermitidoId: textValue.item.id, expectedRevision: 1, clave: "OTHER" })).rejects.toMatchObject({ data: { code: "ADMIN_IMMUTABLE_FIELD", context: { entity: { kind: "valoresPermitidosAtributo", id: textValue.item.id }, field: "clave" } } });
    await expect(t.mutation(api.catalogoAdmin.atributos.activarValorPermitidoAtributo, { valorPermitidoId: textValue.item.id, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: true, revision: 2 } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarValorPermitidoAtributo, { valorPermitidoId: textValue.item.id, expectedRevision: 2, valor: { kind: "TEXTO", value: "changed" } })).resolves.toMatchObject({ disposition: "UPDATED", item: { valor: { kind: "TEXTO", value: "changed" }, revision: 3 } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarValorPermitidoAtributo, { valorPermitidoId: textValue.item.id, expectedRevision: 1, nombre: "Stale" })).rejects.toMatchObject({ data: { code: "ADMIN_STALE_REVISION", context: { entity: { kind: "valoresPermitidosAtributo", id: textValue.item.id }, expectedRevision: 1, currentRevision: 3 } } });
    expect(await t.query(api.catalogoAdmin.atributos.obtenerValorPermitidoAtributo, { valorPermitidoId: textValue.item.id })).toMatchObject({ valor: { kind: "TEXTO", value: "changed" }, activo: true, revision: 3 });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarValorPermitidoAtributo, { valorPermitidoId: textValue.item.id, expectedRevision: 3 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: false, revision: 4 } });
    expect(boolean.item.tipoDato).toBe("BOOLEANO");
  });

  it("accepts only valorPermitidoId for allowed-value commands", async () => {
    const t = convexTest(schema, modules);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "PUBLIC_ID", nombre: "Public ID", tipoDato: "TEXTO", activo: true });
    const value = await t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: definition.item.id, clave: "VALUE", nombre: "Value", orden: 1, valor: { kind: "TEXTO", value: "value" } });
    await expect(t.query(api.catalogoAdmin.atributos.obtenerValorPermitidoAtributo, { valorPermitidoAtributoId: value.item.id } as never)).rejects.toThrow(/valorPermitidoId/);
    await expect(t.query(api.catalogoAdmin.atributos.obtenerValorPermitidoAtributo, { valorPermitidoId: value.item.id })).resolves.toMatchObject({ id: value.item.id });
  });

  it("blocks deactivation of the last typed value for an effective selection assignment", async () => {
    const t = convexTest(schema, modules); const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "LAST", nombre: "Last", tipoDato: "TEXTO", modoCaptura: "SELECCION", activo: true });
    const first = await t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: definition.item.id, clave: "FIRST", nombre: "First", orden: 1, activo: true, valor: { kind: "TEXTO", value: "first" } });
    await t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarValorPermitidoAtributo, { valorPermitidoId: first.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE", context: { entity: { kind: "valoresPermitidosAtributo", id: first.item.id } } } });
    await t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: definition.item.id, clave: "SECOND", nombre: "Second", orden: 2, activo: true, valor: { kind: "TEXTO", value: "second" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.desactivarValorPermitidoAtributo, { valorPermitidoId: first.item.id, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: false, revision: 2 } });
  });

  it("requires an active typed allowed value before an effective selection assignment can activate", async () => {
    const t = convexTest(schema, modules); const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "SELECT", nombre: "Select", tipoDato: "TEXTO", modoCaptura: "SELECCION", activo: true });
    const assignment = await t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1 });
    await expect(t.mutation(api.catalogoAdmin.atributos.activarAsignacionAtributo, { atributoRecursoId: assignment.item.id, expectedRevision: 1 })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
    await t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: definition.item.id, clave: "VALUE", nombre: "Value", orden: 1, activo: true, valor: { kind: "TEXTO", value: "authority" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.activarAsignacionAtributo, { atributoRecursoId: assignment.item.id, expectedRevision: 1 })).resolves.toMatchObject({ disposition: "UPDATED", item: { activo: true } });
  });

  it("rejects a revisioned transition to selection until typed allowed values exist", async () => {
    const t = convexTest(schema, modules); const ids = await tree(t);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "TRANSITION", nombre: "Transition", tipoDato: "TEXTO", modoCaptura: "LIBRE", activo: true });
    await t.mutation(api.catalogoAdmin.atributos.crearAsignacionAtributo, { familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, definicionAtributoId: definition.item.id, aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: definition.item.id, expectedRevision: 1, modoCaptura: "SELECCION" })).rejects.toMatchObject({ data: { code: "ADMIN_AGGREGATE_INCOMPLETE" } });
    expect(await t.query(api.catalogoAdmin.atributos.obtenerDefinicionAtributo, { definicionAtributoId: definition.item.id })).toMatchObject({ modoCaptura: "LIBRE", revision: 1 });
    await t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, { definicionAtributoId: definition.item.id, clave: "AUTHORITY", nombre: "Authority", orden: 1, activo: true, valor: { kind: "TEXTO", value: "value" } });
    await expect(t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, { definicionAtributoId: definition.item.id, expectedRevision: 1, modoCaptura: "SELECCION" })).resolves.toMatchObject({ disposition: "UPDATED", item: { modoCaptura: "SELECCION", revision: 2 } });
  });

  it("stores and projects an explicit capture mode", async () => {
    const t = convexTest(schema, modules);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, {
      clave: "S",
      nombre: "Selectable",
      tipoDato: "OPCION",
      modoCaptura: "SELECCION",
    });

    expect(definition.item).toMatchObject({ modoCaptura: "SELECCION" });
  });

  it("preserves absent legacy modes and changes explicit modes through the revision seam", async () => {
    const t = convexTest(schema, modules);
    const legacy = await t.run(ctx => ctx.db.insert("definicionesAtributo", {
      clave: "LEGACY_OPTION",
      nombre: "Legacy option",
      tipoDato: "OPCION",
      activo: false,
      revision: 1,
    }));
    const legacyText = await t.run(ctx => ctx.db.insert("definicionesAtributo", {
      clave: "LEGACY_TEXT",
      nombre: "Legacy text",
      tipoDato: "TEXTO",
      activo: false,
      revision: 1,
    }));
    expect(await t.query(api.catalogoAdmin.atributos.obtenerDefinicionAtributo, { definicionAtributoId: legacy })).toMatchObject({ modoCaptura: "SELECCION" });
    expect(await t.query(api.catalogoAdmin.atributos.obtenerDefinicionAtributo, { definicionAtributoId: legacyText })).toMatchObject({ modoCaptura: "LIBRE" });

    const updated = await t.mutation(api.catalogoAdmin.atributos.actualizarDefinicionAtributo, {
      definicionAtributoId: legacyText,
      expectedRevision: 1,
      tipoDato: "OPCION",
      modoCaptura: "SELECCION",
    });
    expect(updated).toMatchObject({ disposition: "UPDATED", item: { tipoDato: "OPCION", modoCaptura: "SELECCION", revision: 2 } });
  });

  it("rejects DERIVADO without creating a definition", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, {
      clave: "DERIVED",
      nombre: "Derived",
      tipoDato: "TEXTO",
      modoCaptura: "DERIVADO",
    } as never)).rejects.toThrow();
    const page = await t.query(api.catalogoAdmin.atributos.listarDefinicionesAtributo, { cursor: null, pageSize: 10 });
    expect(page.items).toEqual([]);
  });

  it("paginates allowed values by order and key without mixing lifecycle cursors", async () => {
    const t = convexTest(schema, modules);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, {
      clave: "PAGED", nombre: "Paged", tipoDato: "TEXTO", activo: true,
    });
    await Promise.all([
      ["B", 1, true], ["A", 1, true], ["INACTIVE", 0, false], ["FIRST", 0, true],
    ].map(async ([clave, orden, activo]) => t.mutation(api.catalogoAdmin.atributos.crearValorPermitidoAtributo, {
      definicionAtributoId: definition.item.id,
      clave: clave as string,
      nombre: clave as string,
      orden: orden as number,
      activo: activo as boolean,
      valor: { kind: "TEXTO", value: clave as string },
    })));

    const first = await t.query(api.catalogoAdmin.atributos.listarValoresPermitidosAtributo, {
      definicionAtributoId: definition.item.id, modo: "ALL", pageSize: 2,
    });
    const second = await t.query(api.catalogoAdmin.atributos.listarValoresPermitidosAtributo, {
      definicionAtributoId: definition.item.id, modo: "ALL", pageSize: 2, cursor: first.continuationCursor,
    });
    expect([...first.items, ...second.items].map(item => item.clave)).toEqual(["FIRST", "INACTIVE", "A", "B"]);
    expect([...first.items, ...second.items]).toHaveLength(4);
    await expect(t.query(api.catalogoAdmin.atributos.listarValoresPermitidosAtributo, {
      definicionAtributoId: definition.item.id, modo: "ACTIVE", pageSize: 2, cursor: first.continuationCursor,
    })).rejects.toThrow(/cursor/i);
    expect((await t.query(api.catalogoAdmin.atributos.listarValoresPermitidosAtributo, {
      definicionAtributoId: definition.item.id, modo: "INACTIVE", pageSize: 2,
    })).items).toMatchObject([{ clave: "INACTIVE", activo: false, effective: false, effectiveReasons: ["INACTIVE"] }]);
  });


  it("does not skip or repeat equal-order and equal-key allowed-value ties", async () => {
    const t = convexTest(schema, modules);
    const definition = await t.mutation(api.catalogoAdmin.atributos.crearDefinicionAtributo, { clave: "TIES", nombre: "Ties", tipoDato: "TEXTO", activo: true });
    const ids = await t.run(async ctx => {
      const first = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: definition.item.id, clave: "SAME", nombre: "First", orden: 1, valor: { kind: "TEXTO", value: "first" }, activo: true, revision: 1 });
      const second = await ctx.db.insert("valoresPermitidosAtributo", { definicionAtributoId: definition.item.id, clave: "SAME", nombre: "Second", orden: 1, valor: { kind: "TEXTO", value: "second" }, activo: true, revision: 1 });
      await ctx.db.patch(first, { adminSortId: first });
      await ctx.db.patch(second, { adminSortId: second });
      return [first, second];
    });
    const first = await t.query(api.catalogoAdmin.atributos.listarValoresPermitidosAtributo, { definicionAtributoId: definition.item.id, pageSize: 1 });
    const second = await t.query(api.catalogoAdmin.atributos.listarValoresPermitidosAtributo, { definicionAtributoId: definition.item.id, pageSize: 1, cursor: first.continuationCursor });
    expect([...first.items, ...second.items].map(item => item.id)).toEqual([...ids].sort());
  });

});
