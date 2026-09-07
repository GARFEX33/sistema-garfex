import { Infer, v } from "convex/values";

export const aplicabilidadValidator = v.union(
  v.literal("REQUIRED"),
  v.literal("OPTIONAL"),
  v.literal("CONDITIONAL"),
  v.literal("FORBIDDEN"),
  v.literal("NOT_APPLICABLE"),
);

export const tipoDatoValidator = v.union(
  v.literal("TEXTO"),
  v.literal("NUMERO"),
  v.literal("BOOLEANO"),
  v.literal("OPCION"),
);

const descripcion = v.optional(v.string());
const clase = v.object({ id: v.id("clasesRecurso"), clave: v.string(), nombre: v.string(), descripcion });
const familia = v.object({ id: v.id("familiasRecurso"), clave: v.string(), nombre: v.string(), descripcion });
const tipo = v.object({ id: v.id("tiposRecurso"), clave: v.string(), nombre: v.string(), descripcion });
const unidad = v.object({
  id: v.id("unidades"),
  clave: v.string(),
  nombre: v.string(),
  descripcion,
  simbolo: v.optional(v.string()),
});
const unidadAtributo = v.object({
  id: v.id("unidades"),
  clave: v.string(),
  nombre: v.string(),
  simbolo: v.union(v.string(), v.null()),
});
const opcion = v.object({
  id: v.id("opcionesAtributo"),
  clave: v.string(),
  nombre: v.string(),
  descripcion,
});
const modoCapturaValidator = v.union(v.literal("SELECCION"), v.literal("LIBRE"));
const valorPermitidoTipadoValidator = v.union(
  v.object({ kind: v.literal("TEXTO"), value: v.string() }),
  v.object({ kind: v.literal("NUMERO"), value: v.number() }),
  v.object({ kind: v.literal("BOOLEANO"), value: v.boolean() }),
  v.object({ kind: v.literal("OPCION"), opcionAtributoId: v.id("opcionesAtributo") }),
);
const valorPermitidoPublicado = v.object({
  clave: v.string(), nombre: v.string(), descripcion, orden: v.number(), valor: valorPermitidoTipadoValidator, opcionClave: v.optional(v.string()),
});
const atributo = v.object({
  id: v.id("atributosRecurso"),
  definicionAtributoId: v.id("definicionesAtributo"),
  clave: v.string(),
  nombre: v.string(),
  descripcion,
  tipoDato: tipoDatoValidator,
  unidad: v.union(unidadAtributo, v.null()),
  participaIdentidad: v.boolean(),
  aplicabilidad: aplicabilidadValidator,
  orden: v.number(),
  opciones: v.array(opcion),
});
const regla = v.object({
  id: v.id("reglasAtributoRecurso"),
  atributoCondicionClave: v.string(),
  opcionCondicionClave: v.optional(v.string()),
  atributoAfectadoClave: v.string(),
  aplicabilidad: aplicabilidadValidator,
});
const politicaCompatibilidad = v.object({
  atributoOrigenClave: v.string(),
  atributoDestinoClave: v.string(),
  modo: v.union(v.literal("ALLOWLIST"), v.literal("DENYLIST")),
  direccion: v.union(v.literal("DIRECTIONAL"), v.literal("SYMMETRIC")),
  pares: v.array(v.object({ origenOpcionClave: v.string(), destinoOpcionClave: v.string() })),
});

export const tokenPresentacionValidator = v.union(
      v.object({ tipo: v.literal("TYPE_NAME") }),
      v.object({ tipo: v.literal("ATTRIBUTE_VALUE"), atributoRecursoId: v.id("atributosRecurso") }),
      v.object({ tipo: v.literal("LITERAL"), texto: v.string() }),
    );
    export const politicaPresentacionValidator = v.object({
      tipoNombre: v.string(),
      tokens: v.array(v.union(
        v.object({ tipo: v.literal("TYPE_NAME") }),
        v.object({ tipo: v.literal("ATTRIBUTE_VALUE"), atributoClave: v.string() }),
        v.object({ tipo: v.literal("LITERAL"), texto: v.string() }),
      )),
      separador: v.string(),
    });

export const snapshotV1Validator = v.object({
  clase, familia, tipo, unidadNatural: unidad, atributos: v.array(atributo), reglas: v.array(regla),
  politicasCompatibilidad: v.array(politicaCompatibilidad), presentacionCanonica: politicaPresentacionValidator,
});

const selectionGraph = v.object({
  politicasUnidad: v.array(v.object({ unidadClave: v.string(), principal: v.boolean() })),
  atributos: v.array(v.object({
    atributoClave: v.string(), modoCaptura: modoCapturaValidator, tipoDato: tipoDatoValidator,
    valoresPermitidos: v.array(valorPermitidoPublicado),
  })),
  reglas: v.array(v.object({
    atributoCondicionClave: v.string(), valorPermitidoCondicionClave: v.optional(v.string()),
    atributoAfectadoClave: v.string(), aplicabilidad: aplicabilidadValidator,
  })),
});

export const snapshotV2Validator = v.object({
  snapshotVersion: v.literal(2), clase, familia, tipo, unidadNatural: unidad, atributos: v.array(atributo), reglas: v.array(regla),
  politicasCompatibilidad: v.array(politicaCompatibilidad), presentacionCanonica: politicaPresentacionValidator, selectionGraph,
});
export const snapshotValidator = v.union(snapshotV1Validator, snapshotV2Validator);

export const snapshotResultadoValidator = v.object({
  revisionId: v.id("catalogoRevisiones"),
  tipoClave: v.string(),
  snapshot: snapshotValidator,
});

export type Snapshot = Infer<typeof snapshotValidator>;
export type SnapshotResultado = Infer<typeof snapshotResultadoValidator>;
