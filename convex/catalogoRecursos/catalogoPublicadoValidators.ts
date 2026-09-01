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

    export const snapshotValidator = v.object({
  clase,
  familia,
  tipo,
  unidadNatural: unidad,
  atributos: v.array(atributo),
  reglas: v.array(regla),
  politicasCompatibilidad: v.array(politicaCompatibilidad),
      presentacionCanonica: politicaPresentacionValidator,
    });

export const snapshotResultadoValidator = v.object({
  revisionId: v.id("catalogoRevisiones"),
  tipoClave: v.string(),
  snapshot: snapshotValidator,
});

export type Snapshot = Infer<typeof snapshotValidator>;
export type SnapshotResultado = Infer<typeof snapshotResultadoValidator>;
