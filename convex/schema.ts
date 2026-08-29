import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const estadoCatalogo = {
  activo: v.boolean(),
  revision: v.number(),
};

const identificacionCatalogo = {
  clave: v.string(),
  nombre: v.string(),
  descripcion: v.optional(v.string()),
  ...estadoCatalogo,
};

const aplicabilidad = v.union(
  v.literal("REQUIRED"),
  v.literal("OPTIONAL"),
  v.literal("CONDITIONAL"),
  v.literal("FORBIDDEN"),
  v.literal("NOT_APPLICABLE"),
);

export default defineSchema({
  clasesRecurso: defineTable(identificacionCatalogo).index("porClave", ["clave"]),

  familiasRecurso: defineTable({
    claseRecursoId: v.id("clasesRecurso"),
    ...identificacionCatalogo,
  })
    .index("porClase", ["claseRecursoId"])
    .index("porClaseYClave", ["claseRecursoId", "clave"]),

  tiposRecurso: defineTable({
    familiaRecursoId: v.id("familiasRecurso"),
    ...identificacionCatalogo,
  })
    .index("porFamilia", ["familiaRecursoId"])
    .index("porFamiliaYClave", ["familiaRecursoId", "clave"]),

  unidades: defineTable({
    ...identificacionCatalogo,
    simbolo: v.optional(v.string()),
  }).index("porClave", ["clave"]),

  politicasUnidadRecurso: defineTable({
    familiaRecursoId: v.id("familiasRecurso"),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    unidadId: v.id("unidades"),
    principal: v.boolean(),
    ...estadoCatalogo,
  })
    .index("porFamilia", ["familiaRecursoId"])
    .index("porFamiliaYUnidad", ["familiaRecursoId", "unidadId"])
    .index("porTipo", ["tipoRecursoId"])
    .index("porTipoYUnidad", ["tipoRecursoId", "unidadId"]),

  definicionesAtributo: defineTable({
    ...identificacionCatalogo,
    tipoDato: v.union(
      v.literal("TEXTO"),
      v.literal("NUMERO"),
      v.literal("BOOLEANO"),
      v.literal("OPCION"),
    ),
    unidadId: v.optional(v.id("unidades")),
  }).index("porClave", ["clave"]),

  atributosRecurso: defineTable({
    familiaRecursoId: v.id("familiasRecurso"),
    tipoRecursoId: v.optional(v.id("tiposRecurso")),
    definicionAtributoId: v.id("definicionesAtributo"),
    aplicabilidad,
    participaIdentidad: v.boolean(),
    orden: v.number(),
    ...estadoCatalogo,
  })
    .index("porFamilia", ["familiaRecursoId"])
    .index("porDefinicion", ["definicionAtributoId"])
    .index("porFamiliaYDefinicion", ["familiaRecursoId", "definicionAtributoId"])
    .index("porTipo", ["tipoRecursoId"])
    .index("porTipoYDefinicion", ["tipoRecursoId", "definicionAtributoId"]),

  opcionesAtributo: defineTable({
    definicionAtributoId: v.id("definicionesAtributo"),
    ...identificacionCatalogo,
  })
    .index("porDefinicion", ["definicionAtributoId"])
    .index("porDefinicionYClave", ["definicionAtributoId", "clave"]),

  relacionesOpcionesAtributo: defineTable({
    opcionOrigenId: v.id("opcionesAtributo"),
    opcionDestinoId: v.id("opcionesAtributo"),
    tipoRelacion: v.string(),
    ...estadoCatalogo,
  })
    .index("porOrigen", ["opcionOrigenId"])
    .index("porDestino", ["opcionDestinoId"])
    .index("porOrigenYDestino", ["opcionOrigenId", "opcionDestinoId"]),

  reglasAtributoRecurso: defineTable({
    tipoRecursoId: v.id("tiposRecurso"),
    atributoCondicionId: v.id("atributosRecurso"),
    opcionCondicionId: v.optional(v.id("opcionesAtributo")),
    atributoAfectadoId: v.id("atributosRecurso"),
    aplicabilidad,
    ...estadoCatalogo,
  })
    .index("porTipo", ["tipoRecursoId"])
    .index("porAtributoCondicion", ["atributoCondicionId"])
    .index("porAtributoAfectado", ["atributoAfectadoId"]),

  recursos: defineTable({
    tipoRecursoId: v.id("tiposRecurso"),
    unidadId: v.id("unidades"),
    identificadorTecnico: v.string(),
    nombre: v.string(),
    descripcion: v.optional(v.string()),
    activo: v.boolean(),
    revision: v.number(),
  })
    .index("porIdentificadorTecnico", ["identificadorTecnico"])
    .index("porTipo", ["tipoRecursoId"])
    .index("porActivo", ["activo"])
        .index("porTipoYActivo", ["tipoRecursoId", "activo"])
    .searchIndex("buscar", {
      searchField: "nombre",
      filterFields: ["tipoRecursoId", "activo"],
    }),

  valoresAtributoRecurso: defineTable({
    recursoId: v.id("recursos"),
    atributoRecursoId: v.id("atributosRecurso"),
    valor: v.union(v.string(), v.number(), v.boolean()),
    opcionAtributoId: v.optional(v.id("opcionesAtributo")),
  })
    .index("porRecurso", ["recursoId"])
    .index("porAtributo", ["atributoRecursoId"])
    .index("porRecursoYAtributo", ["recursoId", "atributoRecursoId"]),
});
