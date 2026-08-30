import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../_generated/api";
import schema from "../schema";

const generatedModules = import.meta.glob("../_generated/**/*.{ts,js}");
const localModules = import.meta.glob("./*.{ts,js}");
const modules = {
  ...generatedModules,
  ...Object.fromEntries(Object.entries(localModules).map(([path, module]) => [`../catalogoRecursos/${path.slice(2)}`, module])),
};

describe("demo sintética del catálogo", () => {
  it("prueba el flujo real y es idempotente al repetirlo", async () => {
    const t = convexTest(schema, modules);
    const primera = await t.action(internal.catalogoRecursos.datosDemo.comprobar, {});
    const segunda = await t.action(internal.catalogoRecursos.datosDemo.comprobar, {});

    expect(primera).toEqual({
      synthetic: true,
      identificadorTecnico: "v1|DEMO_MATERIAL|DEMO_CONDUCTORES|DEMO_CABLE|DEMO_CALIBRE=DEMO_12|DEMO_MATERIAL=DEMO_COBRE",
      revisiones: [1, 2, 3],
      estados: [true, false, true],
      consultas: { clases: 1, familias: 1, tipos: 1, unidades: 1, atributos: 2, opciones: 2, reglas: 0 },
    });
    expect(segunda).toEqual(primera);
    expect(await t.run(async ctx => ({
      recursos: (await ctx.db.query("recursos").withIndex("porIdentificadorTecnico").collect()).map(r => ({ identidad: r.identificadorTecnico, activo: r.activo, revision: r.revision })),
      opciones: (await ctx.db.query("opcionesAtributo").withIndex("porDefinicion").collect()).map(o => o.clave).sort(),
      relaciones: (await ctx.db.query("relacionesOpcionesAtributo").withIndex("porOrigen").collect()).length,
    }))).toEqual({
      recursos: [{ identidad: primera.identificadorTecnico, activo: true, revision: 3 }],
      opciones: ["DEMO_12", "DEMO_14", "DEMO_ALUMINIO", "DEMO_COBRE"],
      relaciones: 0,
    });
  });
});
