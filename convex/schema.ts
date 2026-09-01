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

const estadoRevisionCatalogo = v.literal("PUBLISHED");

export default defineSchema({
  organizaciones: defineTable({ clave: v.string(), nombre: v.string(), activo: v.boolean(), revision: v.number() }).index("porClave", ["clave"]),
  catalogoRevisiones: defineTable({ organizacionId: v.id("organizaciones"), numero: v.number(), estado: estadoRevisionCatalogo, hashContenido: v.string(), creadoEn: v.number(), publicadoEn: v.number() }).index("porOrganizacionYNumero", ["organizacionId", "numero"]).index("porOrganizacionYEstado", ["organizacionId", "estado"]),
  catalogoTipoSnapshots: defineTable({
    organizacionId: v.id("organizaciones"), revisionId: v.id("catalogoRevisiones"), tipoClave: v.string(),
    snapshot: v.object({
      clase: v.object({ id: v.id("clasesRecurso"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()) }),
      familia: v.object({ id: v.id("familiasRecurso"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()) }),
      tipo: v.object({ id: v.id("tiposRecurso"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()) }),
      unidadNatural: v.object({ id: v.id("unidades"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()), simbolo: v.optional(v.string()) }),
      atributos: v.array(v.object({ id: v.id("atributosRecurso"), definicionAtributoId: v.id("definicionesAtributo"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()), tipoDato: v.union(v.literal("TEXTO"), v.literal("NUMERO"), v.literal("BOOLEANO"), v.literal("OPCION")), unidad: v.union(v.object({ id: v.id("unidades"), clave: v.string(), nombre: v.string(), simbolo: v.union(v.string(), v.null()) }), v.null()), participaIdentidad: v.boolean(), aplicabilidad, orden: v.number(), opciones: v.array(v.object({ id: v.id("opcionesAtributo"), clave: v.string(), nombre: v.string(), descripcion: v.optional(v.string()) })) })),
      reglas: v.array(v.object({ id: v.id("reglasAtributoRecurso"), atributoCondicionClave: v.string(), opcionCondicionClave: v.optional(v.string()), atributoAfectadoClave: v.string(), aplicabilidad })),
      presentacionCanonica: v.object({ tipoNombre: v.string(), tokens: v.array(v.union(v.object({ tipo: v.literal("TYPE_NAME") }), v.object({ tipo: v.literal("ATTRIBUTE_VALUE"), atributoClave: v.string() }), v.object({ tipo: v.literal("LITERAL"), texto: v.string() }))), separador: v.string() }),
          politicasCompatibilidad: v.array(v.object({ atributoOrigenClave: v.string(), atributoDestinoClave: v.string(), modo: v.union(v.literal("ALLOWLIST"), v.literal("DENYLIST")), direccion: v.union(v.literal("DIRECTIONAL"), v.literal("SYMMETRIC")), pares: v.array(v.object({ origenOpcionClave: v.string(), destinoOpcionClave: v.string() })) })),
    }),
  }).index("porRevisionYTipo", ["revisionId", "tipoClave"]).index("porOrganizacionYTipo", ["organizacionId", "tipoClave"]),
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
        .index("porFamiliaYTipoYUnidad", ["familiaRecursoId", "tipoRecursoId", "unidadId"])
    .index("porTipo", ["tipoRecursoId"])
    .index("porTipoYUnidad", ["tipoRecursoId", "unidadId"])
    .index("porUnidad", ["unidadId"]),

  definicionesAtributo: defineTable({
    ...identificacionCatalogo,
    tipoDato: v.union(
      v.literal("TEXTO"),
      v.literal("NUMERO"),
      v.literal("BOOLEANO"),
      v.literal("OPCION"),
    ),
    unidadId: v.optional(v.id("unidades")),
  }).index("porClave", ["clave"]).index("porUnidad", ["unidadId"]),

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
        .index("porFamiliaYTipoYDefinicion", ["familiaRecursoId", "tipoRecursoId", "definicionAtributoId"])
    .index("porTipo", ["tipoRecursoId"])
    .index("porTipoYDefinicion", ["tipoRecursoId", "definicionAtributoId"]),

  opcionesAtributo: defineTable({
    definicionAtributoId: v.id("definicionesAtributo"),
    ...identificacionCatalogo,
  })
    .index("porDefinicion", ["definicionAtributoId"])
    .index("porDefinicionYClave", ["definicionAtributoId", "clave"]),

  politicasPresentacionCanonica: defineTable({
        tipoRecursoId: v.id("tiposRecurso"),
        tokens: v.array(v.union(
          v.object({ tipo: v.literal("TYPE_NAME") }),
          v.object({ tipo: v.literal("ATTRIBUTE_VALUE"), atributoRecursoId: v.id("atributosRecurso") }),
          v.object({ tipo: v.literal("LITERAL"), texto: v.string() }),
        )),
        separador: v.string(),
        ...estadoCatalogo,
      }).index("porTipo", ["tipoRecursoId"]).index("porTipoYActivo", ["tipoRecursoId", "activo"]),

      politicasCompatibilidadOpciones: defineTable({
    tipoRecursoId: v.id("tiposRecurso"),
    atributoOrigenId: v.id("atributosRecurso"),
    atributoDestinoId: v.id("atributosRecurso"),
    modo: v.union(v.literal("ALLOWLIST"), v.literal("DENYLIST")),
    direccion: v.union(v.literal("DIRECTIONAL"), v.literal("SYMMETRIC")),
    ...estadoCatalogo,
  })
    .index("porTipo", ["tipoRecursoId"])
    .index("porTipoYEstado", ["tipoRecursoId", "activo"]),

  relacionesOpcionesAtributo: defineTable({
    opcionOrigenId: v.id("opcionesAtributo"),
    opcionDestinoId: v.id("opcionesAtributo"),
    politicaCompatibilidadId: v.optional(v.id("politicasCompatibilidadOpciones")),
    tipoRelacion: v.optional(v.string()),
    ...estadoCatalogo,
  })
    .index("porOrigen", ["opcionOrigenId"])
    .index("porDestino", ["opcionDestinoId"])
    .index("porOrigenYDestino", ["opcionOrigenId", "opcionDestinoId"])
    .index("porPolitica", ["politicaCompatibilidadId"])
    .index("porActivo", ["activo"]),

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
    organizacionId: v.optional(v.id("organizaciones")),
    identidadVersion: v.optional(v.number()),
  })
    .index("porIdentificadorTecnico", ["identificadorTecnico"])
    .index("porOrganizacionYIdentificadorTecnico", ["organizacionId", "identificadorTecnico"])
    .index("porTipo", ["tipoRecursoId"])
    .index("porActivo", ["activo"])
        .index("porTipoYActivo", ["tipoRecursoId", "activo"])
    .index("porUnidad", ["unidadId"])
    .searchIndex("buscar", {
      searchField: "nombre",
      filterFields: ["tipoRecursoId", "activo"],
    }),


  identidadesRecurso: defineTable({
    organizacionId: v.id("organizaciones"),
    recursoId: v.id("recursos"),
    version: v.number(),
    clave: v.string(),
    activa: v.boolean(),
    creadaEn: v.number(),
  })
    .index("porOrganizacionVersionClave", ["organizacionId", "version", "clave"])
    .index("porRecurso", ["recursoId"]),

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
