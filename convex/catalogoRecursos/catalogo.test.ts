import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";

const generatedModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("../_generated/**/*.{ts,js}");
const localModules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("./*.{ts,js}");
const modules = {
  ...generatedModules,
  ...Object.fromEntries(
    Object.entries(localModules).map(([path, module]) => [
      `../catalogoRecursos/${path.slice(2)}`,
      module,
    ]),
  ),
};

type Fixture = Awaited<ReturnType<typeof seedFixture>>;

async function seedFixture(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const claseBombas = await ctx.db.insert("clasesRecurso", {
      clave: "CLASE_BOMBAS",
      nombre: "Bombas industriales",
      descripcion: "Fixture sintético de bombas",
      activo: true,
      revision: 1,
    });
    const claseValvulas = await ctx.db.insert("clasesRecurso", {
      clave: "CLASE_VALVULAS",
      nombre: "Válvulas industriales",
      activo: true,
      revision: 1,
    });
    const claseInactiva = await ctx.db.insert("clasesRecurso", {
      clave: "CLASE_INACTIVA",
      nombre: "Clase inactiva",
      activo: false,
      revision: 1,
    });

    const familiaCentrifugas = await ctx.db.insert("familiasRecurso", {
      claseRecursoId: claseBombas,
      clave: "FAMILIA_CENTRIFUGAS",
      nombre: "Bombas centrífugas",
      activo: true,
      revision: 1,
    });
    const familiaValvulas = await ctx.db.insert("familiasRecurso", {
      claseRecursoId: claseValvulas,
      clave: "FAMILIA_VALVULAS",
      nombre: "Válvulas de proceso",
      activo: true,
      revision: 1,
    });
    const familiaInactiva = await ctx.db.insert("familiasRecurso", {
      claseRecursoId: claseBombas,
      clave: "FAMILIA_INACTIVA",
      nombre: "Familia inactiva",
      activo: false,
      revision: 1,
    });

    const tipoIndustrial = await ctx.db.insert("tiposRecurso", {
      familiaRecursoId: familiaCentrifugas,
      clave: "TIPO_INDUSTRIAL",
      nombre: "Centrífuga industrial",
      activo: true,
      revision: 1,
    });
    const tipoCompacto = await ctx.db.insert("tiposRecurso", {
      familiaRecursoId: familiaCentrifugas,
      clave: "TIPO_COMPACTO",
      nombre: "Centrífuga compacta",
      activo: true,
      revision: 1,
    });
    const tipoValvula = await ctx.db.insert("tiposRecurso", {
      familiaRecursoId: familiaValvulas,
      clave: "TIPO_MARIPOSA",
      nombre: "Válvula mariposa",
      activo: true,
      revision: 1,
    });
    const tipoInactivo = await ctx.db.insert("tiposRecurso", {
      familiaRecursoId: familiaCentrifugas,
      clave: "TIPO_INACTIVO",
      nombre: "Tipo inactivo",
      activo: false,
      revision: 1,
    });

    const unidadBase = await ctx.db.insert("unidades", {
      clave: "UNIDAD_BASE",
      nombre: "Unidad base",
      descripcion: "Unidad común a la familia",
      simbolo: "ub",
      activo: true,
      revision: 1,
    });
    const unidadTipo = await ctx.db.insert("unidades", {
      clave: "UNIDAD_TIPO",
      nombre: "Unidad específica",
      simbolo: "ut",
      activo: true,
      revision: 1,
    });
    const unidadOtraFamilia = await ctx.db.insert("unidades", {
      clave: "UNIDAD_VALVULA",
      nombre: "Unidad de válvula",
      simbolo: "uv",
      activo: true,
      revision: 1,
    });
    const unidadInactiva = await ctx.db.insert("unidades", {
      clave: "UNIDAD_INACTIVA",
      nombre: "Unidad inactiva",
      activo: false,
      revision: 1,
    });
    const unidadPoliticaInactiva = await ctx.db.insert("unidades", {
      clave: "UNIDAD_POLITICA_INACTIVA",
      nombre: "Política inactiva",
      activo: true,
      revision: 1,
    });
    await ctx.db.insert("politicasUnidadRecurso", {
      familiaRecursoId: familiaCentrifugas,
      unidadId: unidadBase,
      principal: true,
      activo: true,
      revision: 1,
    });
    await ctx.db.insert("politicasUnidadRecurso", {
      familiaRecursoId: familiaCentrifugas,
      unidadId: unidadPoliticaInactiva,
      principal: false,
      activo: false,
      revision: 1,
    });
    await ctx.db.insert("politicasUnidadRecurso", {
      familiaRecursoId: familiaCentrifugas,
      tipoRecursoId: tipoIndustrial,
      unidadId: unidadTipo,
      principal: true,
      activo: true,
      revision: 1,
    });
    await ctx.db.insert("politicasUnidadRecurso", {
      familiaRecursoId: familiaCentrifugas,
      tipoRecursoId: tipoIndustrial,
      unidadId: unidadInactiva,
      principal: false,
      activo: true,
      revision: 1,
    });
    await ctx.db.insert("politicasUnidadRecurso", {
      familiaRecursoId: familiaValvulas,
      tipoRecursoId: tipoValvula,
      unidadId: unidadOtraFamilia,
      principal: true,
      activo: true,
      revision: 1,
    });

    const definicionColor = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_COLOR",
      nombre: "Color",
      tipoDato: "OPCION",
      activo: true,
      revision: 1,
    });
    const definicionPresion = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_PRESION",
      nombre: "Presión nominal",
      tipoDato: "NUMERO",
      unidadId: unidadBase,
      activo: true,
      revision: 1,
    });
    const definicionDisponible = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_DISPONIBLE",
      nombre: "Disponible",
      tipoDato: "BOOLEANO",
      activo: true,
      revision: 1,
    });
    const definicionNota = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_NOTA",
      nombre: "Nota técnica",
      tipoDato: "TEXTO",
      activo: true,
      revision: 1,
    });
    const definicionProhibida = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_PROHIBIDO",
      nombre: "Dato prohibido",
      tipoDato: "TEXTO",
      activo: true,
      revision: 1,
    });
    const definicionInactiva = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_DEFINICION_INACTIVA",
      nombre: "Dato con definición inactiva",
      tipoDato: "TEXTO",
      activo: false,
      revision: 1,
    });

    const definicionAtributoInactivo = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_INACTIVO",
      nombre: "Dato inactivo",
      tipoDato: "TEXTO",
      activo: true,
      revision: 1,
    });
    const definicionOtroTipo = await ctx.db.insert("definicionesAtributo", {
      clave: "ATRIBUTO_OTRO_TIPO",
      nombre: "Dato de otro tipo",
      tipoDato: "TEXTO",
      activo: true,
      revision: 1,
    });

    const atributoColor = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      definicionAtributoId: definicionColor,
      aplicabilidad: "REQUIRED",
      participaIdentidad: true,
      orden: 1,
      activo: true,
      revision: 1,
    });
    const atributoPresionFamilia = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      definicionAtributoId: definicionPresion,
      aplicabilidad: "OPTIONAL",
      participaIdentidad: false,
      orden: 2,
      activo: true,
      revision: 1,
    });
    const atributoPresionTipo = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      tipoRecursoId: tipoIndustrial,
      definicionAtributoId: definicionPresion,
      aplicabilidad: "REQUIRED",
      participaIdentidad: true,
      orden: 3,
      activo: true,
      revision: 1,
    });
    const atributoDisponible = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      tipoRecursoId: tipoIndustrial,
      definicionAtributoId: definicionDisponible,
      aplicabilidad: "OPTIONAL",
      participaIdentidad: false,
      orden: 4,
      activo: true,
      revision: 1,
    });
    const atributoNota = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      definicionAtributoId: definicionNota,
      aplicabilidad: "CONDITIONAL",
      participaIdentidad: false,
      orden: 5,
      activo: true,
      revision: 1,
    });
    await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      definicionAtributoId: definicionProhibida,
      aplicabilidad: "FORBIDDEN",
      participaIdentidad: false,
      orden: 6,
      activo: true,
      revision: 1,
    });
    const atributoDefinicionInactiva = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      definicionAtributoId: definicionInactiva,
      aplicabilidad: "OPTIONAL",
      participaIdentidad: false,
      orden: 7,
      activo: true,
      revision: 1,
    });
    const atributoInactivo = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      definicionAtributoId: definicionAtributoInactivo,
      aplicabilidad: "OPTIONAL",
      participaIdentidad: false,
      orden: 8,
      activo: false,
      revision: 1,
    });
    const atributoOtroTipo = await ctx.db.insert("atributosRecurso", {
      familiaRecursoId: familiaCentrifugas,
      tipoRecursoId: tipoCompacto,
      definicionAtributoId: definicionOtroTipo,
      aplicabilidad: "OPTIONAL",
      participaIdentidad: false,
      orden: 9,
      activo: true,
      revision: 1,
    });

    const opcionRojo = await ctx.db.insert("opcionesAtributo", {
      definicionAtributoId: definicionColor,
      clave: "OPCION_ROJO",
      nombre: "Rojo",
      activo: true,
      revision: 1,
    });
    const opcionAzulInactiva = await ctx.db.insert("opcionesAtributo", {
      definicionAtributoId: definicionColor,
      clave: "OPCION_AZUL_INACTIVA",
      nombre: "Azul inactivo",
      activo: false,
      revision: 1,
    });

    const reglaActiva = await ctx.db.insert("reglasAtributoRecurso", {
      tipoRecursoId: tipoIndustrial,
      atributoCondicionId: atributoColor,
      opcionCondicionId: opcionRojo,
      atributoAfectadoId: atributoNota,
      aplicabilidad: "REQUIRED",
      activo: true,
      revision: 1,
    });
    await ctx.db.insert("reglasAtributoRecurso", {
      tipoRecursoId: tipoIndustrial,
      atributoCondicionId: atributoColor,
      opcionCondicionId: opcionAzulInactiva,
      atributoAfectadoId: atributoNota,
      aplicabilidad: "FORBIDDEN",
      activo: true,
      revision: 1,
    });
    await ctx.db.insert("reglasAtributoRecurso", {
      tipoRecursoId: tipoIndustrial,
      atributoCondicionId: atributoColor,
      opcionCondicionId: opcionRojo,
      atributoAfectadoId: atributoNota,
      aplicabilidad: "OPTIONAL",
      activo: false,
      revision: 1,
    });

    return {
      claseBombas, claseValvulas, claseInactiva, familiaCentrifugas, familiaValvulas,
      familiaInactiva, tipoIndustrial, tipoCompacto, tipoValvula, tipoInactivo,
      unidadBase, unidadTipo, unidadOtraFamilia, unidadInactiva, unidadPoliticaInactiva,
      definicionColor, definicionPresion, definicionDisponible, definicionNota,
      atributoColor, atributoPresionFamilia, atributoPresionTipo, atributoDisponible,
      atributoNota, atributoDefinicionInactiva, atributoInactivo, atributoOtroTipo,
    opcionRojo, reglaActiva,
    };
  });
}

describe("administración pública mínima del catálogo", () => {
  it("permite arrancar un catálogo vacío y crear un recurso sólo con mutaciones públicas", async () => {
    const t = convexTest(schema, modules);
    const clase = await t.mutation(api.catalogoRecursos.catalogo.crearClaseRecurso, {
      clave: "CLASE_BOMBAS", nombre: "Bombas",
    });
    const familia = await t.mutation(api.catalogoRecursos.catalogo.crearFamiliaRecurso, {
      claseRecursoId: clase.id, clave: "FAMILIA_CENTRIFUGAS", nombre: "Centrífugas",
    });
    const tipo = await t.mutation(api.catalogoRecursos.catalogo.crearTipoRecurso, {
      familiaRecursoId: familia.id, clave: "TIPO_INDUSTRIAL", nombre: "Industrial",
    });
    const unidad = await t.mutation(api.catalogoRecursos.catalogo.crearUnidad, {
      clave: "UNIDAD_BASE", nombre: "Unidad base", simbolo: "ub",
    });
    const politica = await t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: familia.id, unidadId: unidad.id, principal: true,
    });
    const definicion = await t.mutation(api.catalogoRecursos.catalogo.crearDefinicionAtributo, {
      clave: "ATRIBUTO_COLOR", nombre: "Color", tipoDato: "OPCION",
    });
    const atributo = await t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: familia.id, definicionAtributoId: definicion.id,
      aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1,
    });
    const opcion = await t.mutation(api.catalogoRecursos.catalogo.crearOpcionAtributo, {
      definicionAtributoId: definicion.id, clave: "ROJO", nombre: "Rojo",
    });

    expect([clase, familia, tipo, unidad, politica, definicion, atributo, opcion]).toHaveLength(8);
    expect([clase, familia, tipo, unidad, politica, definicion, atributo, opcion].every((resultado) => resultado.revision === 1)).toBe(true);
    const recurso = await t.mutation(api.catalogoRecursos.recursos.crearRecurso, {
      claseRecursoId: clase.id,
      familiaRecursoId: familia.id,
      tipoRecursoId: tipo.id,
      unidadId: unidad.id,
      nombre: "Bomba roja",
      valores: [{ atributoRecursoId: atributo.id, valor: "rojo", opcionAtributoId: opcion.id }],
    });
    expect(recurso.revision).toBe(1);
    expect(recurso.valores).toEqual([
      expect.objectContaining({ atributoRecursoId: atributo.id, opcionAtributoId: opcion.id }),
    ]);
  });

  it("separa duplicados de familia y tipo para unidades y atributos en ambos órdenes", async () => {
    const t = convexTest(schema, modules);
    const clase = await t.mutation(api.catalogoRecursos.catalogo.crearClaseRecurso, { clave: "CLASE", nombre: "Clase" });
    const familia = await t.mutation(api.catalogoRecursos.catalogo.crearFamiliaRecurso, {
      claseRecursoId: clase.id, clave: "FAMILIA", nombre: "Familia",
    });
    const tipo = await t.mutation(api.catalogoRecursos.catalogo.crearTipoRecurso, {
      familiaRecursoId: familia.id, clave: "TIPO", nombre: "Tipo",
    });
    const unidadTipoPrimero = await t.mutation(api.catalogoRecursos.catalogo.crearUnidad, {
      clave: "UNIDAD_TIPO_PRIMERO", nombre: "Unidad tipo primero",
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: familia.id, tipoRecursoId: tipo.id, unidadId: unidadTipoPrimero.id, principal: true,
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: familia.id, unidadId: unidadTipoPrimero.id, principal: false,
    });
    const unidadFamiliaPrimero = await t.mutation(api.catalogoRecursos.catalogo.crearUnidad, {
      clave: "UNIDAD_FAMILIA_PRIMERO", nombre: "Unidad familia primero",
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: familia.id, unidadId: unidadFamiliaPrimero.id, principal: true,
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: familia.id, tipoRecursoId: tipo.id, unidadId: unidadFamiliaPrimero.id, principal: false,
    });
    await expect(t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: familia.id, unidadId: unidadTipoPrimero.id, principal: true,
    })).rejects.toThrow(/duplicada/i);
    await expect(t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: familia.id, tipoRecursoId: tipo.id, unidadId: unidadTipoPrimero.id, principal: true,
    })).rejects.toThrow(/duplicada/i);

    const definicionTipoPrimero = await t.mutation(api.catalogoRecursos.catalogo.crearDefinicionAtributo, {
      clave: "ATRIBUTO_TIPO_PRIMERO", nombre: "Atributo tipo primero", tipoDato: "TEXTO",
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: familia.id, tipoRecursoId: tipo.id, definicionAtributoId: definicionTipoPrimero.id,
      aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 1,
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: familia.id, definicionAtributoId: definicionTipoPrimero.id,
      aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 2,
    });
    const definicionFamiliaPrimero = await t.mutation(api.catalogoRecursos.catalogo.crearDefinicionAtributo, {
      clave: "ATRIBUTO_FAMILIA_PRIMERO", nombre: "Atributo familia primero", tipoDato: "TEXTO",
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: familia.id, definicionAtributoId: definicionFamiliaPrimero.id,
      aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 3,
    });
    await t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: familia.id, tipoRecursoId: tipo.id, definicionAtributoId: definicionFamiliaPrimero.id,
      aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 4,
    });
    await expect(t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: familia.id, definicionAtributoId: definicionTipoPrimero.id,
      aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 5,
    })).rejects.toThrow(/duplicada/i);
    await expect(t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: familia.id, tipoRecursoId: tipo.id, definicionAtributoId: definicionTipoPrimero.id,
      aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 6,
    })).rejects.toThrow(/duplicada/i);
  });

  it("detecta duplicados de familia después de más de 100 asignaciones específicas de tipo", async () => {
    const t = convexTest(schema, modules);
    const datos = await t.run(async (ctx) => {
      const claseRecursoId = await ctx.db.insert("clasesRecurso", { clave: "CLASE_MASIVA", nombre: "Clase masiva", activo: true, revision: 1 });
      const familiaRecursoId = await ctx.db.insert("familiasRecurso", { claseRecursoId, clave: "FAMILIA_MASIVA", nombre: "Familia masiva", activo: true, revision: 1 });
      const unidadId = await ctx.db.insert("unidades", { clave: "UNIDAD_MASIVA", nombre: "Unidad masiva", activo: true, revision: 1 });
      const definicionAtributoId = await ctx.db.insert("definicionesAtributo", { clave: "ATRIBUTO_MASIVO", nombre: "Atributo masivo", tipoDato: "TEXTO", activo: true, revision: 1 });
      for (let indice = 0; indice < 101; indice += 1) {
        const tipoRecursoId = await ctx.db.insert("tiposRecurso", {
          familiaRecursoId,
          clave: `TIPO_MASIVO_${indice}`,
          nombre: `Tipo masivo ${indice}`,
          activo: true,
          revision: 1,
        });
        await ctx.db.insert("politicasUnidadRecurso", {
          familiaRecursoId,
          tipoRecursoId,
          unidadId,
          principal: true,
          activo: true,
          revision: 1,
        });
        await ctx.db.insert("atributosRecurso", {
          familiaRecursoId,
          tipoRecursoId,
          definicionAtributoId,
          aplicabilidad: "OPTIONAL",
          participaIdentidad: false,
          orden: indice,
          activo: true,
          revision: 1,
        });
      }
      await ctx.db.insert("politicasUnidadRecurso", { familiaRecursoId, unidadId, principal: true, activo: true, revision: 1 });
      await ctx.db.insert("atributosRecurso", {
        familiaRecursoId,
        definicionAtributoId,
        aplicabilidad: "OPTIONAL",
        participaIdentidad: false,
        orden: 101,
        activo: true,
        revision: 1,
      });
      return { familiaRecursoId, unidadId, definicionAtributoId };
    });

    await expect(t.mutation(api.catalogoRecursos.catalogo.asignarUnidadPermitida, {
      familiaRecursoId: datos.familiaRecursoId,
      unidadId: datos.unidadId,
      principal: false,
    })).rejects.toThrow(/duplicada/i);
    await expect(t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: datos.familiaRecursoId,
      definicionAtributoId: datos.definicionAtributoId,
      aplicabilidad: "OPTIONAL",
      participaIdentidad: false,
      orden: 102,
    })).rejects.toThrow(/duplicada/i);
  });

  it("rechaza duplicados, padres inactivos y combinaciones de tipo inválidas", async () => {
    const t = convexTest(schema, modules);
    const f = await t.run(async (ctx) => {
      const clase = await ctx.db.insert("clasesRecurso", { clave: "CLASE", nombre: "Clase", activo: true, revision: 1 });
      const otraClase = await ctx.db.insert("clasesRecurso", { clave: "OTRA_CLASE", nombre: "Otra clase", activo: true, revision: 1 });
      const inactiva = await ctx.db.insert("clasesRecurso", { clave: "INACTIVA", nombre: "Inactiva", activo: false, revision: 1 });
      const familia = await ctx.db.insert("familiasRecurso", { claseRecursoId: clase, clave: "FAMILIA", nombre: "Familia", activo: true, revision: 1 });
      const otraFamilia = await ctx.db.insert("familiasRecurso", { claseRecursoId: otraClase, clave: "OTRA_FAMILIA", nombre: "Otra familia", activo: true, revision: 1 });
      const tipo = await ctx.db.insert("tiposRecurso", { familiaRecursoId: otraFamilia, clave: "TIPO", nombre: "Tipo", activo: true, revision: 1 });
      const definicion = await ctx.db.insert("definicionesAtributo", { clave: "TEXTO", nombre: "Texto", tipoDato: "TEXTO", activo: true, revision: 1 });
      const opcion = await ctx.db.insert("opcionesAtributo", { definicionAtributoId: definicion, clave: "OPCION", nombre: "Opción", activo: true, revision: 1 });
      return { clase, inactiva, familia, tipo, definicion, opcion };
    });

    await expect(t.mutation(api.catalogoRecursos.catalogo.crearClaseRecurso, {
      clave: "CLASE", nombre: "Duplicada",
    })).rejects.toThrow(/duplicada/i);
    await expect(t.mutation(api.catalogoRecursos.catalogo.crearFamiliaRecurso, {
      claseRecursoId: f.inactiva, clave: "NUEVA", nombre: "Nueva",
    })).rejects.toThrow(/clase.*inactiva/i);
    await expect(t.mutation(api.catalogoRecursos.catalogo.asignarAtributo, {
      familiaRecursoId: f.familia, tipoRecursoId: f.tipo,
      definicionAtributoId: f.definicion, aplicabilidad: "OPTIONAL",
      participaIdentidad: false, orden: 1,
    })).rejects.toThrow(/tipo.*familia/i);
    await expect(t.mutation(api.catalogoRecursos.catalogo.crearOpcionAtributo, {
      definicionAtributoId: f.definicion, clave: "OPCION_2", nombre: "Opción 2",
    })).rejects.toThrow(/OPCION/i);
  });
});

describe("consultas públicas del catálogo", () => {
  it("consulta clases activas y excluye inactivas", async () => {
    const t = convexTest(schema, modules);
    const f = await seedFixture(t);
    const result = await t.query(api.catalogoRecursos.catalogo.consultarClases, {});
    expect(result).toEqual([
      expect.objectContaining({ id: f.claseBombas, clave: "CLASE_BOMBAS", nombre: "Bombas industriales" }),
      expect.objectContaining({ id: f.claseValvulas, clave: "CLASE_VALVULAS", nombre: "Válvulas industriales" }),
    ]);
    expect(result.some((row) => row.id === f.claseInactiva)).toBe(false);
  });

  it("consulta familias sólo de la clase solicitada y sólo activas", async () => {
    const t = convexTest(schema, modules);
    const f = await seedFixture(t);
    const result = await t.query(api.catalogoRecursos.catalogo.consultarFamiliasDeClase, { claseRecursoId: f.claseBombas });
    expect(result).toEqual([expect.objectContaining({ id: f.familiaCentrifugas, claseRecursoId: f.claseBombas })]);
    expect(result.some((row) => row.id === f.familiaValvulas || row.id === f.familiaInactiva)).toBe(false);
    expect(await t.query(api.catalogoRecursos.catalogo.consultarFamiliasDeClase, { claseRecursoId: f.claseValvulas })).toEqual([
      expect.objectContaining({ id: f.familiaValvulas }),
    ]);
  });

  it("consulta tipos sólo de la familia solicitada y excluye tipos inactivos", async () => {
    const t = convexTest(schema, modules);
    const f = await seedFixture(t);
    const result = await t.query(api.catalogoRecursos.catalogo.consultarTiposDeFamilia, { familiaRecursoId: f.familiaCentrifugas });
    expect(result.map((row) => row.id)).toEqual([f.tipoIndustrial, f.tipoCompacto]);
    expect(result.some((row) => row.id === f.tipoInactivo || row.id === f.tipoValvula)).toBe(false);
    expect(await t.query(api.catalogoRecursos.catalogo.consultarTiposDeFamilia, { familiaRecursoId: f.familiaInactiva })).toEqual([]);
  });

  it("combina unidades de familia y tipo, excluye políticas o unidades inactivas", async () => {
    const t = convexTest(schema, modules);
    const f = await seedFixture(t);
    const result = await t.query(api.catalogoRecursos.catalogo.consultarUnidadesValidas, {
      familiaRecursoId: f.familiaCentrifugas,
      tipoRecursoId: f.tipoIndustrial,
    });
    expect(result).toEqual([
      expect.objectContaining({ id: f.unidadBase, principal: true }),
      expect.objectContaining({ id: f.unidadTipo, clave: "UNIDAD_TIPO", principal: true }),
    ]);
    expect(result.some((row) => row.id === f.unidadInactiva || row.id === f.unidadPoliticaInactiva)).toBe(false);
    expect((await t.query(api.catalogoRecursos.catalogo.consultarUnidadesValidas, { familiaRecursoId: f.familiaCentrifugas })).map((row) => row.id)).toEqual([f.unidadBase]);
    expect(await t.query(api.catalogoRecursos.catalogo.consultarUnidadesValidas, { familiaRecursoId: f.familiaValvulas, tipoRecursoId: f.tipoIndustrial })).toEqual([]);
  });

  it("aplica precedencia específica del tipo y conserva los tipos de dato en español", async () => {
    const t = convexTest(schema, modules);
    const f = await seedFixture(t);
    const result = await t.query(api.catalogoRecursos.catalogo.consultarAtributosAplicables, {
      familiaRecursoId: f.familiaCentrifugas,
      tipoRecursoId: f.tipoIndustrial,
    });
    expect(result.map((row) => row.definicionAtributoId)).toEqual([
      f.definicionColor, f.definicionPresion, f.definicionDisponible, f.definicionNota,
    ]);
    expect(result.find((row) => row.definicionAtributoId === f.definicionPresion)).toMatchObject({
      id: f.atributoPresionTipo,
      definicionAtributoId: f.definicionPresion,
      unidadId: f.unidadBase,
      unidad: { id: f.unidadBase, clave: "UNIDAD_BASE", nombre: "Unidad base", simbolo: "ub" },
      tipoDato: "NUMERO",
      aplicabilidad: "REQUIRED",
      participaIdentidad: true,
    });
    expect(result.find((row) => row.definicionAtributoId === f.definicionColor)?.unidad).toBeNull();
    expect(result.find((row) => row.definicionAtributoId === f.definicionDisponible)?.tipoDato).toBe("BOOLEANO");
    expect(result.find((row) => row.definicionAtributoId === f.definicionNota)?.tipoDato).toBe("TEXTO");
    expect(result.some((row) => row.id === f.atributoPresionFamilia)).toBe(false);
    expect(result.some((row) => row.id === f.atributoDefinicionInactiva)).toBe(false);
    expect(result.some((row) => row.id === f.atributoInactivo)).toBe(false);
    expect(result.some((row) => row.id === f.atributoOtroTipo)).toBe(false);
    expect(await t.query(api.catalogoRecursos.catalogo.consultarAtributosAplicables, { familiaRecursoId: f.familiaValvulas })).toEqual([]);
  });

  it("consulta opciones sólo de la definición solicitada y excluye opciones inactivas", async () => {
    const t = convexTest(schema, modules);
    const f = await seedFixture(t);
    const result = await t.query(api.catalogoRecursos.catalogo.consultarOpcionesPermitidas, { definicionAtributoId: f.definicionColor });
    expect(result).toEqual([expect.objectContaining({ id: f.opcionRojo, definicionAtributoId: f.definicionColor, clave: "OPCION_ROJO" })]);
    expect(result.some((row) => row.clave === "OPCION_AZUL_INACTIVA")).toBe(false);
    expect(await t.query(api.catalogoRecursos.catalogo.consultarOpcionesPermitidas, { definicionAtributoId: f.definicionPresion })).toEqual([]);
  });

  it("devuelve reglas activas con sus atributos y opción unidos, sin cruzar tipos", async () => {
    const t = convexTest(schema, modules);
    const f = await seedFixture(t);
    const result = await t.query(api.catalogoRecursos.catalogo.obtenerReglasValidacion, { tipoRecursoId: f.tipoIndustrial });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: f.reglaActiva,
      tipoRecursoId: f.tipoIndustrial,
      aplicabilidad: "REQUIRED",
      atributoCondicion: { id: f.atributoColor, clave: "ATRIBUTO_COLOR", tipoDato: "OPCION" },
      opcionCondicion: { id: f.opcionRojo, clave: "OPCION_ROJO" },
      atributoAfectado: { id: f.atributoNota, clave: "ATRIBUTO_NOTA", tipoDato: "TEXTO" },
    });
    expect((await t.query(api.catalogoRecursos.catalogo.obtenerReglasValidacion, { tipoRecursoId: f.tipoCompacto })).length).toBe(0);
    expect((await t.query(api.catalogoRecursos.catalogo.obtenerReglasValidacion, { tipoRecursoId: f.tipoValvula })).length).toBe(0);
  });
});
