/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";
import type { GenericId as Id } from "convex/values";

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: {
  catalogoAdmin: {
    atributos: {
      activarAsignacionAtributo: FunctionReference<
        "mutation",
        "public",
        { atributoRecursoId: Id<"atributosRecurso">; expectedRevision: number },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            definicionAtributoId: Id<"definicionesAtributo">;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"atributosRecurso">;
            orden: number;
            participaIdentidad: boolean;
            revision: number;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            tipoRecursoId?: Id<"tiposRecurso">;
          };
        }
      >;
      activarDefinicionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          definicionAtributoId: Id<"definicionesAtributo">;
          expectedRevision: number;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"definicionesAtributo">;
            nombre: string;
            revision: number;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidadId?: Id<"unidades">;
          };
        }
      >;
      activarOpcionAtributo: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; opcionAtributoId: Id<"opcionesAtributo"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"opcionesAtributo">;
            nombre: string;
            revision: number;
          };
        }
      >;
      actualizarAsignacionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          aplicabilidad?:
            | "REQUIRED"
            | "OPTIONAL"
            | "CONDITIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE";
          atributoRecursoId: Id<"atributosRecurso">;
          definicionAtributoId?: Id<"definicionesAtributo">;
          expectedRevision: number;
          familiaRecursoId?: Id<"familiasRecurso">;
          orden?: number;
          participaIdentidad?: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            definicionAtributoId: Id<"definicionesAtributo">;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"atributosRecurso">;
            orden: number;
            participaIdentidad: boolean;
            revision: number;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            tipoRecursoId?: Id<"tiposRecurso">;
          };
        }
      >;
      actualizarDefinicionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          clave?: string;
          definicionAtributoId: Id<"definicionesAtributo">;
          descripcion?: string;
          expectedRevision: number;
          nombre?: string;
          tipoDato?: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
          unidadId?: Id<"unidades"> | null;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"definicionesAtributo">;
            nombre: string;
            revision: number;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidadId?: Id<"unidades">;
          };
        }
      >;
      actualizarOpcionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          clave?: string;
          definicionAtributoId?: Id<"definicionesAtributo">;
          descripcion?: string;
          expectedRevision: number;
          nombre?: string;
          opcionAtributoId: Id<"opcionesAtributo">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"opcionesAtributo">;
            nombre: string;
            revision: number;
          };
        }
      >;
      crearAsignacionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          aplicabilidad:
            | "REQUIRED"
            | "OPTIONAL"
            | "CONDITIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE";
          definicionAtributoId: Id<"definicionesAtributo">;
          familiaRecursoId: Id<"familiasRecurso">;
          orden: number;
          participaIdentidad: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            definicionAtributoId: Id<"definicionesAtributo">;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"atributosRecurso">;
            orden: number;
            participaIdentidad: boolean;
            revision: number;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            tipoRecursoId?: Id<"tiposRecurso">;
          };
        }
      >;
      crearDefinicionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          clave: string;
          descripcion?: string;
          nombre: string;
          tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
          unidadId?: Id<"unidades">;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"definicionesAtributo">;
            nombre: string;
            revision: number;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidadId?: Id<"unidades">;
          };
        }
      >;
      crearOpcionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          clave: string;
          definicionAtributoId: Id<"definicionesAtributo">;
          descripcion?: string;
          nombre: string;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"opcionesAtributo">;
            nombre: string;
            revision: number;
          };
        }
      >;
      desactivarAsignacionAtributo: FunctionReference<
        "mutation",
        "public",
        { atributoRecursoId: Id<"atributosRecurso">; expectedRevision: number },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            definicionAtributoId: Id<"definicionesAtributo">;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"atributosRecurso">;
            orden: number;
            participaIdentidad: boolean;
            revision: number;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            tipoRecursoId?: Id<"tiposRecurso">;
          };
        }
      >;
      desactivarDefinicionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          definicionAtributoId: Id<"definicionesAtributo">;
          expectedRevision: number;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"definicionesAtributo">;
            nombre: string;
            revision: number;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidadId?: Id<"unidades">;
          };
        }
      >;
      desactivarOpcionAtributo: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; opcionAtributoId: Id<"opcionesAtributo"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"opcionesAtributo">;
            nombre: string;
            revision: number;
          };
        }
      >;
      listarAsignacionesAtributo: FunctionReference<
        "query",
        "public",
        {
          aplicabilidad?:
            | "REQUIRED"
            | "OPTIONAL"
            | "CONDITIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE";
          cursor?: string | null;
          definicionAtributoId?: Id<"definicionesAtributo">;
          familiaRecursoId?: Id<"familiasRecurso">;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
          participaIdentidad?: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            definicionAtributoId: Id<"definicionesAtributo">;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"atributosRecurso">;
            orden: number;
            participaIdentidad: boolean;
            revision: number;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            tipoRecursoId?: Id<"tiposRecurso">;
          }>;
        }
      >;
      listarDefinicionesAtributo: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
          tipoDato?: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
          unidadId?: Id<"unidades">;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"definicionesAtributo">;
            nombre: string;
            revision: number;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidadId?: Id<"unidades">;
          }>;
        }
      >;
      listarOpcionesAtributo: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          definicionAtributoId?: Id<"definicionesAtributo">;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"opcionesAtributo">;
            nombre: string;
            revision: number;
          }>;
        }
      >;
      obtenerAsignacionAtributo: FunctionReference<
        "query",
        "public",
        {
          atributoRecursoId: Id<"atributosRecurso">;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          activo: boolean;
          aplicabilidad:
            | "REQUIRED"
            | "OPTIONAL"
            | "CONDITIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE";
          definicionAtributoId: Id<"definicionesAtributo">;
          effective: boolean;
          effectiveReasons: Array<string>;
          familiaRecursoId: Id<"familiasRecurso">;
          id: Id<"atributosRecurso">;
          orden: number;
          participaIdentidad: boolean;
          revision: number;
          selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
          tipoRecursoId?: Id<"tiposRecurso">;
        } | null
      >;
      obtenerDefinicionAtributo: FunctionReference<
        "query",
        "public",
        { definicionAtributoId: Id<"definicionesAtributo"> },
        {
          activo: boolean;
          clave: string;
          descripcion?: string;
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"definicionesAtributo">;
          nombre: string;
          revision: number;
          tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
          unidadId?: Id<"unidades">;
        } | null
      >;
      obtenerOpcionAtributo: FunctionReference<
        "query",
        "public",
        { opcionAtributoId: Id<"opcionesAtributo"> },
        {
          activo: boolean;
          clave: string;
          definicionAtributoId: Id<"definicionesAtributo">;
          descripcion?: string;
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"opcionesAtributo">;
          nombre: string;
          revision: number;
        } | null
      >;
    };
    compatibilidad: {
      activarPoliticaCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          politicaCompatibilidadId: Id<"politicasCompatibilidadOpciones">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            atributoDestinoId: Id<"atributosRecurso">;
            atributoOrigenId: Id<"atributosRecurso">;
            direccion: "DIRECTIONAL" | "SYMMETRIC";
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasCompatibilidadOpciones">;
            modo: "ALLOWLIST" | "DENYLIST";
            normalizedIdentity: string;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      activarRelacionCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          relacionCompatibilidadId: Id<"relacionesOpcionesAtributo">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"relacionesOpcionesAtributo">;
            normalizedIdentity: string;
            opcionDestinoId: Id<"opcionesAtributo">;
            opcionOrigenId: Id<"opcionesAtributo">;
            politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
            revision: number;
          };
        }
      >;
      actualizarPoliticaCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          atributoDestinoId?: Id<"atributosRecurso">;
          atributoOrigenId?: Id<"atributosRecurso">;
          direccion?: "DIRECTIONAL" | "SYMMETRIC";
          expectedRevision: number;
          modo?: "ALLOWLIST" | "DENYLIST";
          politicaCompatibilidadId: Id<"politicasCompatibilidadOpciones">;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            atributoDestinoId: Id<"atributosRecurso">;
            atributoOrigenId: Id<"atributosRecurso">;
            direccion: "DIRECTIONAL" | "SYMMETRIC";
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasCompatibilidadOpciones">;
            modo: "ALLOWLIST" | "DENYLIST";
            normalizedIdentity: string;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      actualizarRelacionCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          opcionDestinoId?: Id<"opcionesAtributo">;
          opcionOrigenId?: Id<"opcionesAtributo">;
          politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
          relacionCompatibilidadId: Id<"relacionesOpcionesAtributo">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"relacionesOpcionesAtributo">;
            normalizedIdentity: string;
            opcionDestinoId: Id<"opcionesAtributo">;
            opcionOrigenId: Id<"opcionesAtributo">;
            politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
            revision: number;
          };
        }
      >;
      crearPoliticaCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          atributoDestinoId: Id<"atributosRecurso">;
          atributoOrigenId: Id<"atributosRecurso">;
          direccion: "DIRECTIONAL" | "SYMMETRIC";
          modo: "ALLOWLIST" | "DENYLIST";
          tipoRecursoId: Id<"tiposRecurso">;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            atributoDestinoId: Id<"atributosRecurso">;
            atributoOrigenId: Id<"atributosRecurso">;
            direccion: "DIRECTIONAL" | "SYMMETRIC";
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasCompatibilidadOpciones">;
            modo: "ALLOWLIST" | "DENYLIST";
            normalizedIdentity: string;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      crearRelacionCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          opcionDestinoId: Id<"opcionesAtributo">;
          opcionOrigenId: Id<"opcionesAtributo">;
          politicaCompatibilidadId: Id<"politicasCompatibilidadOpciones">;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"relacionesOpcionesAtributo">;
            normalizedIdentity: string;
            opcionDestinoId: Id<"opcionesAtributo">;
            opcionOrigenId: Id<"opcionesAtributo">;
            politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
            revision: number;
          };
        }
      >;
      desactivarPoliticaCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          politicaCompatibilidadId: Id<"politicasCompatibilidadOpciones">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            atributoDestinoId: Id<"atributosRecurso">;
            atributoOrigenId: Id<"atributosRecurso">;
            direccion: "DIRECTIONAL" | "SYMMETRIC";
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasCompatibilidadOpciones">;
            modo: "ALLOWLIST" | "DENYLIST";
            normalizedIdentity: string;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      desactivarRelacionCompatibilidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          relacionCompatibilidadId: Id<"relacionesOpcionesAtributo">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"relacionesOpcionesAtributo">;
            normalizedIdentity: string;
            opcionDestinoId: Id<"opcionesAtributo">;
            opcionOrigenId: Id<"opcionesAtributo">;
            politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
            revision: number;
          };
        }
      >;
      listarPoliticasCompatibilidad: FunctionReference<
        "query",
        "public",
        {
          atributoDestinoId?: Id<"atributosRecurso">;
          atributoId?: Id<"atributosRecurso">;
          atributoOrigenId?: Id<"atributosRecurso">;
          cursor?: string | null;
          direccion?: "DIRECTIONAL" | "SYMMETRIC";
          estado?: "ALL" | "ACTIVE" | "INACTIVE";
          modo?: "ALLOWLIST" | "DENYLIST" | "ALL" | "ACTIVE" | "INACTIVE";
          modoPolitica?: "ALLOWLIST" | "DENYLIST";
          pageSize?: number;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            atributoDestinoId: Id<"atributosRecurso">;
            atributoOrigenId: Id<"atributosRecurso">;
            direccion: "DIRECTIONAL" | "SYMMETRIC";
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasCompatibilidadOpciones">;
            modo: "ALLOWLIST" | "DENYLIST";
            normalizedIdentity: string;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          }>;
        }
      >;
      listarRelacionesCompatibilidad: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          estado?: "ALL" | "ACTIVE" | "INACTIVE";
          opcionDestinoId?: Id<"opcionesAtributo">;
          opcionId?: Id<"opcionesAtributo">;
          opcionOrigenId?: Id<"opcionesAtributo">;
          pageSize?: number;
          politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"relacionesOpcionesAtributo">;
            normalizedIdentity: string;
            opcionDestinoId: Id<"opcionesAtributo">;
            opcionOrigenId: Id<"opcionesAtributo">;
            politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
            revision: number;
          }>;
        }
      >;
      obtenerPoliticaCompatibilidad: FunctionReference<
        "query",
        "public",
        { politicaCompatibilidadId: Id<"politicasCompatibilidadOpciones"> },
        {
          activo: boolean;
          atributoDestinoId: Id<"atributosRecurso">;
          atributoOrigenId: Id<"atributosRecurso">;
          direccion: "DIRECTIONAL" | "SYMMETRIC";
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"politicasCompatibilidadOpciones">;
          modo: "ALLOWLIST" | "DENYLIST";
          normalizedIdentity: string;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
        } | null
      >;
      obtenerRelacionCompatibilidad: FunctionReference<
        "query",
        "public",
        { relacionCompatibilidadId: Id<"relacionesOpcionesAtributo"> },
        {
          activo: boolean;
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"relacionesOpcionesAtributo">;
          normalizedIdentity: string;
          opcionDestinoId: Id<"opcionesAtributo">;
          opcionOrigenId: Id<"opcionesAtributo">;
          politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
          revision: number;
        } | null
      >;
    };
    jerarquia: {
      activarClase: FunctionReference<
        "mutation",
        "public",
        { claseRecursoId: Id<"clasesRecurso">; expectedRevision: number },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"clasesRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      activarFamilia: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; familiaRecursoId: Id<"familiasRecurso"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            claseRecursoId: Id<"clasesRecurso">;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"familiasRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      activarTipo: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; tipoRecursoId: Id<"tiposRecurso"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED";
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"tiposRecurso">;
            nombre: string;
            revision: number;
            violations: Array<{
              code:
                | "HIERARCHY_REFERENCE_INVALID"
                | "PRINCIPAL_UNIT_COUNT"
                | "UNIT_INACTIVE"
                | "NUMERIC_UNIT_INVALID"
                | "OPTION_SET_EMPTY"
                | "ASSIGNMENT_SELECTION_INVALID"
                | "RULE_REFERENCE_INVALID"
                | "RULE_RESULT_INVALID"
                | "RULE_CONFLICT"
                | "PRESENTATION_COUNT"
                | "PRESENTATION_TOKEN_INVALID"
                | "COMPATIBILITY_POLICY_CONFLICT"
                | "COMPATIBILITY_RELATION_INVALID"
                | "ALLOWLIST_EMPTY"
                | "TYPE_KEY_AMBIGUOUS"
                | "CATALOG_LIMIT_EXCEEDED"
                | "RESOURCE_VALUE_LIMIT_EXCEEDED"
                | "RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED"
                | "RESOURCE_ATTRIBUTE_DUPLICATE"
                | "RESOURCE_REQUIRED_VALUE_MISSING"
                | "RESOURCE_NON_FINITE_NUMBER"
                | "RESOURCE_ATTRIBUTE_FORBIDDEN"
                | "RESOURCE_VALUE_TYPE_INVALID";
              count?: number;
              detail?: string;
              entity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
              field?: string;
              relatedEntity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
            }>;
          };
        }
      >;
      actualizarClase: FunctionReference<
        "mutation",
        "public",
        {
          claseRecursoId: Id<"clasesRecurso">;
          clave?: string;
          descripcion?: string;
          expectedRevision: number;
          nombre?: string;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"clasesRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      actualizarFamilia: FunctionReference<
        "mutation",
        "public",
        {
          claseRecursoId?: Id<"clasesRecurso">;
          clave?: string;
          descripcion?: string;
          expectedRevision: number;
          familiaRecursoId: Id<"familiasRecurso">;
          nombre?: string;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            claseRecursoId: Id<"clasesRecurso">;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"familiasRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      actualizarTipo: FunctionReference<
        "mutation",
        "public",
        {
          clave?: string;
          descripcion?: string;
          expectedRevision: number;
          familiaRecursoId?: Id<"familiasRecurso">;
          nombre?: string;
          tipoRecursoId: Id<"tiposRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED";
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"tiposRecurso">;
            nombre: string;
            revision: number;
            violations: Array<{
              code:
                | "HIERARCHY_REFERENCE_INVALID"
                | "PRINCIPAL_UNIT_COUNT"
                | "UNIT_INACTIVE"
                | "NUMERIC_UNIT_INVALID"
                | "OPTION_SET_EMPTY"
                | "ASSIGNMENT_SELECTION_INVALID"
                | "RULE_REFERENCE_INVALID"
                | "RULE_RESULT_INVALID"
                | "RULE_CONFLICT"
                | "PRESENTATION_COUNT"
                | "PRESENTATION_TOKEN_INVALID"
                | "COMPATIBILITY_POLICY_CONFLICT"
                | "COMPATIBILITY_RELATION_INVALID"
                | "ALLOWLIST_EMPTY"
                | "TYPE_KEY_AMBIGUOUS"
                | "CATALOG_LIMIT_EXCEEDED"
                | "RESOURCE_VALUE_LIMIT_EXCEEDED"
                | "RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED"
                | "RESOURCE_ATTRIBUTE_DUPLICATE"
                | "RESOURCE_REQUIRED_VALUE_MISSING"
                | "RESOURCE_NON_FINITE_NUMBER"
                | "RESOURCE_ATTRIBUTE_FORBIDDEN"
                | "RESOURCE_VALUE_TYPE_INVALID";
              count?: number;
              detail?: string;
              entity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
              field?: string;
              relatedEntity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
            }>;
          };
        }
      >;
      crearClase: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          clave: string;
          descripcion?: string;
          nombre: string;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"clasesRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      crearFamilia: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          claseRecursoId: Id<"clasesRecurso">;
          clave: string;
          descripcion?: string;
          nombre: string;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            claseRecursoId: Id<"clasesRecurso">;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"familiasRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      crearTipo: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          clave: string;
          descripcion?: string;
          familiaRecursoId: Id<"familiasRecurso">;
          nombre: string;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED";
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"tiposRecurso">;
            nombre: string;
            revision: number;
            violations: Array<{
              code:
                | "HIERARCHY_REFERENCE_INVALID"
                | "PRINCIPAL_UNIT_COUNT"
                | "UNIT_INACTIVE"
                | "NUMERIC_UNIT_INVALID"
                | "OPTION_SET_EMPTY"
                | "ASSIGNMENT_SELECTION_INVALID"
                | "RULE_REFERENCE_INVALID"
                | "RULE_RESULT_INVALID"
                | "RULE_CONFLICT"
                | "PRESENTATION_COUNT"
                | "PRESENTATION_TOKEN_INVALID"
                | "COMPATIBILITY_POLICY_CONFLICT"
                | "COMPATIBILITY_RELATION_INVALID"
                | "ALLOWLIST_EMPTY"
                | "TYPE_KEY_AMBIGUOUS"
                | "CATALOG_LIMIT_EXCEEDED"
                | "RESOURCE_VALUE_LIMIT_EXCEEDED"
                | "RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED"
                | "RESOURCE_ATTRIBUTE_DUPLICATE"
                | "RESOURCE_REQUIRED_VALUE_MISSING"
                | "RESOURCE_NON_FINITE_NUMBER"
                | "RESOURCE_ATTRIBUTE_FORBIDDEN"
                | "RESOURCE_VALUE_TYPE_INVALID";
              count?: number;
              detail?: string;
              entity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
              field?: string;
              relatedEntity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
            }>;
          };
        }
      >;
      desactivarClase: FunctionReference<
        "mutation",
        "public",
        { claseRecursoId: Id<"clasesRecurso">; expectedRevision: number },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"clasesRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      desactivarFamilia: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; familiaRecursoId: Id<"familiasRecurso"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            claseRecursoId: Id<"clasesRecurso">;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"familiasRecurso">;
            nombre: string;
            revision: number;
          };
        }
      >;
      desactivarTipo: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; tipoRecursoId: Id<"tiposRecurso"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED";
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"tiposRecurso">;
            nombre: string;
            revision: number;
            violations: Array<{
              code:
                | "HIERARCHY_REFERENCE_INVALID"
                | "PRINCIPAL_UNIT_COUNT"
                | "UNIT_INACTIVE"
                | "NUMERIC_UNIT_INVALID"
                | "OPTION_SET_EMPTY"
                | "ASSIGNMENT_SELECTION_INVALID"
                | "RULE_REFERENCE_INVALID"
                | "RULE_RESULT_INVALID"
                | "RULE_CONFLICT"
                | "PRESENTATION_COUNT"
                | "PRESENTATION_TOKEN_INVALID"
                | "COMPATIBILITY_POLICY_CONFLICT"
                | "COMPATIBILITY_RELATION_INVALID"
                | "ALLOWLIST_EMPTY"
                | "TYPE_KEY_AMBIGUOUS"
                | "CATALOG_LIMIT_EXCEEDED"
                | "RESOURCE_VALUE_LIMIT_EXCEEDED"
                | "RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED"
                | "RESOURCE_ATTRIBUTE_DUPLICATE"
                | "RESOURCE_REQUIRED_VALUE_MISSING"
                | "RESOURCE_NON_FINITE_NUMBER"
                | "RESOURCE_ATTRIBUTE_FORBIDDEN"
                | "RESOURCE_VALUE_TYPE_INVALID";
              count?: number;
              detail?: string;
              entity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
              field?: string;
              relatedEntity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
            }>;
          };
        }
      >;
      listarClases: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"clasesRecurso">;
            nombre: string;
            revision: number;
          }>;
        }
      >;
      listarFamilias: FunctionReference<
        "query",
        "public",
        {
          claseRecursoId?: Id<"clasesRecurso">;
          cursor?: string | null;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            claseRecursoId: Id<"clasesRecurso">;
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"familiasRecurso">;
            nombre: string;
            revision: number;
          }>;
        }
      >;
      listarTipos: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          familiaRecursoId?: Id<"familiasRecurso">;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED";
            clave: string;
            descripcion?: string;
            effective: boolean;
            effectiveReasons: Array<string>;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"tiposRecurso">;
            nombre: string;
            revision: number;
            violations: Array<{
              code:
                | "HIERARCHY_REFERENCE_INVALID"
                | "PRINCIPAL_UNIT_COUNT"
                | "UNIT_INACTIVE"
                | "NUMERIC_UNIT_INVALID"
                | "OPTION_SET_EMPTY"
                | "ASSIGNMENT_SELECTION_INVALID"
                | "RULE_REFERENCE_INVALID"
                | "RULE_RESULT_INVALID"
                | "RULE_CONFLICT"
                | "PRESENTATION_COUNT"
                | "PRESENTATION_TOKEN_INVALID"
                | "COMPATIBILITY_POLICY_CONFLICT"
                | "COMPATIBILITY_RELATION_INVALID"
                | "ALLOWLIST_EMPTY"
                | "TYPE_KEY_AMBIGUOUS"
                | "CATALOG_LIMIT_EXCEEDED"
                | "RESOURCE_VALUE_LIMIT_EXCEEDED"
                | "RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED"
                | "RESOURCE_ATTRIBUTE_DUPLICATE"
                | "RESOURCE_REQUIRED_VALUE_MISSING"
                | "RESOURCE_NON_FINITE_NUMBER"
                | "RESOURCE_ATTRIBUTE_FORBIDDEN"
                | "RESOURCE_VALUE_TYPE_INVALID";
              count?: number;
              detail?: string;
              entity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
              field?: string;
              relatedEntity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
            }>;
          }>;
        }
      >;
      obtenerClase: FunctionReference<
        "query",
        "public",
        { claseRecursoId: Id<"clasesRecurso"> },
        {
          activo: boolean;
          clave: string;
          descripcion?: string;
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"clasesRecurso">;
          nombre: string;
          revision: number;
        } | null
      >;
      obtenerFamilia: FunctionReference<
        "query",
        "public",
        { familiaRecursoId: Id<"familiasRecurso"> },
        {
          activo: boolean;
          claseRecursoId: Id<"clasesRecurso">;
          clave: string;
          descripcion?: string;
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"familiasRecurso">;
          nombre: string;
          revision: number;
        } | null
      >;
      obtenerTipo: FunctionReference<
        "query",
        "public",
        { tipoRecursoId: Id<"tiposRecurso"> },
        {
          activo: boolean;
          aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED";
          clave: string;
          descripcion?: string;
          effective: boolean;
          effectiveReasons: Array<string>;
          familiaRecursoId: Id<"familiasRecurso">;
          id: Id<"tiposRecurso">;
          nombre: string;
          revision: number;
          violations: Array<{
            code:
              | "HIERARCHY_REFERENCE_INVALID"
              | "PRINCIPAL_UNIT_COUNT"
              | "UNIT_INACTIVE"
              | "NUMERIC_UNIT_INVALID"
              | "OPTION_SET_EMPTY"
              | "ASSIGNMENT_SELECTION_INVALID"
              | "RULE_REFERENCE_INVALID"
              | "RULE_RESULT_INVALID"
              | "RULE_CONFLICT"
              | "PRESENTATION_COUNT"
              | "PRESENTATION_TOKEN_INVALID"
              | "COMPATIBILITY_POLICY_CONFLICT"
              | "COMPATIBILITY_RELATION_INVALID"
              | "ALLOWLIST_EMPTY"
              | "TYPE_KEY_AMBIGUOUS"
              | "CATALOG_LIMIT_EXCEEDED"
              | "RESOURCE_VALUE_LIMIT_EXCEEDED"
              | "RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED"
              | "RESOURCE_ATTRIBUTE_DUPLICATE"
              | "RESOURCE_REQUIRED_VALUE_MISSING"
              | "RESOURCE_NON_FINITE_NUMBER"
              | "RESOURCE_ATTRIBUTE_FORBIDDEN"
              | "RESOURCE_VALUE_TYPE_INVALID";
            count?: number;
            detail?: string;
            entity?:
              | { id: Id<"organizaciones">; kind: "organizaciones" }
              | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
              | {
                  id: Id<"catalogoTipoSnapshots">;
                  kind: "catalogoTipoSnapshots";
                }
              | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
              | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
              | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
              | { id: Id<"unidades">; kind: "unidades" }
              | {
                  id: Id<"politicasUnidadRecurso">;
                  kind: "politicasUnidadRecurso";
                }
              | { id: Id<"definicionesAtributo">; kind: "definicionesAtributo" }
              | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
              | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
              | {
                  id: Id<"politicasPresentacionCanonica">;
                  kind: "politicasPresentacionCanonica";
                }
              | {
                  id: Id<"politicasCompatibilidadOpciones">;
                  kind: "politicasCompatibilidadOpciones";
                }
              | {
                  id: Id<"relacionesOpcionesAtributo">;
                  kind: "relacionesOpcionesAtributo";
                }
              | {
                  id: Id<"reglasAtributoRecurso">;
                  kind: "reglasAtributoRecurso";
                }
              | { id: Id<"recursos">; kind: "recursos" }
              | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
              | {
                  id: Id<"valoresAtributoRecurso">;
                  kind: "valoresAtributoRecurso";
                };
            field?: string;
            relatedEntity?:
              | { id: Id<"organizaciones">; kind: "organizaciones" }
              | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
              | {
                  id: Id<"catalogoTipoSnapshots">;
                  kind: "catalogoTipoSnapshots";
                }
              | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
              | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
              | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
              | { id: Id<"unidades">; kind: "unidades" }
              | {
                  id: Id<"politicasUnidadRecurso">;
                  kind: "politicasUnidadRecurso";
                }
              | { id: Id<"definicionesAtributo">; kind: "definicionesAtributo" }
              | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
              | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
              | {
                  id: Id<"politicasPresentacionCanonica">;
                  kind: "politicasPresentacionCanonica";
                }
              | {
                  id: Id<"politicasCompatibilidadOpciones">;
                  kind: "politicasCompatibilidadOpciones";
                }
              | {
                  id: Id<"relacionesOpcionesAtributo">;
                  kind: "relacionesOpcionesAtributo";
                }
              | {
                  id: Id<"reglasAtributoRecurso">;
                  kind: "reglasAtributoRecurso";
                }
              | { id: Id<"recursos">; kind: "recursos" }
              | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
              | {
                  id: Id<"valoresAtributoRecurso">;
                  kind: "valoresAtributoRecurso";
                };
          }>;
        } | null
      >;
    };
    presentacion: {
      activarPoliticaPresentacion: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          politicaPresentacionId: Id<"politicasPresentacionCanonica">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activeSlotOccupied: boolean;
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasPresentacionCanonica">;
            revision: number;
            separador: string;
            tipoRecursoId: Id<"tiposRecurso">;
            tokens: Array<
              | { tipo: "TYPE_NAME" }
              | {
                  atributoRecursoId: Id<"atributosRecurso">;
                  tipo: "ATTRIBUTE_VALUE";
                }
              | { texto: string; tipo: "LITERAL" }
            >;
          };
        }
      >;
      actualizarPoliticaPresentacion: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          politicaPresentacionId: Id<"politicasPresentacionCanonica">;
          separador?: string;
          tipoRecursoId?: Id<"tiposRecurso">;
          tokens?: Array<
            | { tipo: "TYPE_NAME" }
            | {
                atributoRecursoId: Id<"atributosRecurso">;
                tipo: "ATTRIBUTE_VALUE";
              }
            | { texto: string; tipo: "LITERAL" }
          >;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activeSlotOccupied: boolean;
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasPresentacionCanonica">;
            revision: number;
            separador: string;
            tipoRecursoId: Id<"tiposRecurso">;
            tokens: Array<
              | { tipo: "TYPE_NAME" }
              | {
                  atributoRecursoId: Id<"atributosRecurso">;
                  tipo: "ATTRIBUTE_VALUE";
                }
              | { texto: string; tipo: "LITERAL" }
            >;
          };
        }
      >;
      crearPoliticaPresentacion: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          separador: string;
          tipoRecursoId: Id<"tiposRecurso">;
          tokens: Array<
            | { tipo: "TYPE_NAME" }
            | {
                atributoRecursoId: Id<"atributosRecurso">;
                tipo: "ATTRIBUTE_VALUE";
              }
            | { texto: string; tipo: "LITERAL" }
          >;
        },
        {
          disposition: "CREATED";
          item: {
            activeSlotOccupied: boolean;
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasPresentacionCanonica">;
            revision: number;
            separador: string;
            tipoRecursoId: Id<"tiposRecurso">;
            tokens: Array<
              | { tipo: "TYPE_NAME" }
              | {
                  atributoRecursoId: Id<"atributosRecurso">;
                  tipo: "ATTRIBUTE_VALUE";
                }
              | { texto: string; tipo: "LITERAL" }
            >;
          };
        }
      >;
      desactivarPoliticaPresentacion: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          politicaPresentacionId: Id<"politicasPresentacionCanonica">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activeSlotOccupied: boolean;
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasPresentacionCanonica">;
            revision: number;
            separador: string;
            tipoRecursoId: Id<"tiposRecurso">;
            tokens: Array<
              | { tipo: "TYPE_NAME" }
              | {
                  atributoRecursoId: Id<"atributosRecurso">;
                  tipo: "ATTRIBUTE_VALUE";
                }
              | { texto: string; tipo: "LITERAL" }
            >;
          };
        }
      >;
      listarPoliticasPresentacion: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activeSlotOccupied: boolean;
            activo: boolean;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"politicasPresentacionCanonica">;
            revision: number;
            separador: string;
            tipoRecursoId: Id<"tiposRecurso">;
            tokens: Array<
              | { tipo: "TYPE_NAME" }
              | {
                  atributoRecursoId: Id<"atributosRecurso">;
                  tipo: "ATTRIBUTE_VALUE";
                }
              | { texto: string; tipo: "LITERAL" }
            >;
          }>;
        }
      >;
      obtenerPoliticaPresentacion: FunctionReference<
        "query",
        "public",
        { politicaPresentacionId: Id<"politicasPresentacionCanonica"> },
        {
          activeSlotOccupied: boolean;
          activo: boolean;
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"politicasPresentacionCanonica">;
          revision: number;
          separador: string;
          tipoRecursoId: Id<"tiposRecurso">;
          tokens: Array<
            | { tipo: "TYPE_NAME" }
            | {
                atributoRecursoId: Id<"atributosRecurso">;
                tipo: "ATTRIBUTE_VALUE";
              }
            | { texto: string; tipo: "LITERAL" }
          >;
        } | null
      >;
    };
    publicacion: {
      listarRevisiones: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          estado?: "PUBLISHED";
          organizacionId: Id<"organizaciones">;
          pageSize?: number;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            creadoEn: number;
            hashContenido: string;
            numero: number;
            publicadoEn: number;
            revisionId: Id<"catalogoRevisiones">;
          }>;
        }
      >;
      obtenerRevision: FunctionReference<
        "query",
        "public",
        {
          organizacionId: Id<"organizaciones">;
          revisionId: Id<"catalogoRevisiones">;
        },
        {
          creadoEn: number;
          hashContenido: string;
          numero: number;
          publicadoEn: number;
          revisionId: Id<"catalogoRevisiones">;
        } | null
      >;
      obtenerSnapshotTipo: FunctionReference<
        "query",
        "public",
        {
          organizacionId: Id<"organizaciones">;
          revisionId: Id<"catalogoRevisiones">;
          tipoClave: string;
        },
        {
          revisionId: Id<"catalogoRevisiones">;
          snapshot: {
            atributos: Array<{
              aplicabilidad:
                | "REQUIRED"
                | "OPTIONAL"
                | "CONDITIONAL"
                | "FORBIDDEN"
                | "NOT_APPLICABLE";
              clave: string;
              definicionAtributoId: Id<"definicionesAtributo">;
              descripcion?: string;
              id: Id<"atributosRecurso">;
              nombre: string;
              opciones: Array<{
                clave: string;
                descripcion?: string;
                id: Id<"opcionesAtributo">;
                nombre: string;
              }>;
              orden: number;
              participaIdentidad: boolean;
              tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
              unidad: {
                clave: string;
                id: Id<"unidades">;
                nombre: string;
                simbolo: string | null;
              } | null;
            }>;
            clase: {
              clave: string;
              descripcion?: string;
              id: Id<"clasesRecurso">;
              nombre: string;
            };
            familia: {
              clave: string;
              descripcion?: string;
              id: Id<"familiasRecurso">;
              nombre: string;
            };
            politicasCompatibilidad: Array<{
              atributoDestinoClave: string;
              atributoOrigenClave: string;
              direccion: "DIRECTIONAL" | "SYMMETRIC";
              modo: "ALLOWLIST" | "DENYLIST";
              pares: Array<{
                destinoOpcionClave: string;
                origenOpcionClave: string;
              }>;
            }>;
            presentacionCanonica: {
              separador: string;
              tipoNombre: string;
              tokens: Array<
                | { tipo: "TYPE_NAME" }
                | { atributoClave: string; tipo: "ATTRIBUTE_VALUE" }
                | { texto: string; tipo: "LITERAL" }
              >;
            };
            reglas: Array<{
              aplicabilidad:
                | "REQUIRED"
                | "OPTIONAL"
                | "CONDITIONAL"
                | "FORBIDDEN"
                | "NOT_APPLICABLE";
              atributoAfectadoClave: string;
              atributoCondicionClave: string;
              id: Id<"reglasAtributoRecurso">;
              opcionCondicionClave?: string;
            }>;
            tipo: {
              clave: string;
              descripcion?: string;
              id: Id<"tiposRecurso">;
              nombre: string;
            };
            unidadNatural: {
              clave: string;
              descripcion?: string;
              id: Id<"unidades">;
              nombre: string;
              simbolo?: string;
            };
          };
          tipoClave: string;
        } | null
      >;
      publicarCatalogo: FunctionReference<
        "mutation",
        "public",
        { organizacionId: Id<"organizaciones"> },
        {
          disposition: "CREATED" | "UNCHANGED";
          hashContenido: string;
          numero: number;
          revisionId: Id<"catalogoRevisiones">;
        }
      >;
    };
    recursos: {
      activarRecurso: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; recursoId: Id<"recursos"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            classificationStatus: {
              reasons: Array<string>;
              state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
            };
            id: Id<"recursos">;
            identificadorTecnico: string;
            nombre: string;
            organizacionId?: Id<"organizaciones">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      actualizarRecurso: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          claseRecursoId?: Id<"clasesRecurso">;
          descripcion?: string;
          expectedRevision: number;
          familiaRecursoId?: Id<"familiasRecurso">;
          identificadorTecnico?: string;
          nombre?: string;
          ownership?:
            | { kind: "GLOBAL" }
            | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
          recursoId: Id<"recursos">;
          tipoRecursoId?: Id<"tiposRecurso">;
          unidadId?: Id<"unidades">;
          valores?: Array<{
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            valor: string | number | boolean;
          }>;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            classificationStatus: {
              reasons: Array<string>;
              state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
            };
            id: Id<"recursos">;
            identificadorTecnico: string;
            nombre: string;
            organizacionId?: Id<"organizaciones">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      buscarRecursosResumen: FunctionReference<
        "query",
        "public",
        {
          claseRecursoId?: Id<"clasesRecurso">;
          familiaRecursoId?: Id<"familiasRecurso">;
          lifecycle?: "ALL" | "ACTIVE" | "INACTIVE";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          scope?:
            | { kind: "ALL" }
            | { kind: "GLOBAL" }
            | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
          searchText: string;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            activo: boolean;
            classificationStatus: {
              reasons: Array<string>;
              state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
            };
            id: Id<"recursos">;
            identificadorTecnico: string;
            nombre: string;
            organizacionId?: Id<"organizaciones">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      crearRecurso: FunctionReference<
        "mutation",
        "public",
        {
          claseRecursoId: Id<"clasesRecurso">;
          descripcion?: string;
          familiaRecursoId: Id<"familiasRecurso">;
          nombre: string;
          ownership:
            | { kind: "GLOBAL" }
            | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            valor: string | number | boolean;
          }>;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            classificationStatus: {
              reasons: Array<string>;
              state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
            };
            id: Id<"recursos">;
            identificadorTecnico: string;
            nombre: string;
            organizacionId?: Id<"organizaciones">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      desactivarRecurso: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; recursoId: Id<"recursos"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            classificationStatus: {
              reasons: Array<string>;
              state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
            };
            id: Id<"recursos">;
            identificadorTecnico: string;
            nombre: string;
            organizacionId?: Id<"organizaciones">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      listarRecursosResumen: FunctionReference<
        "query",
        "public",
        {
          claseRecursoId?: Id<"clasesRecurso">;
          familiaRecursoId?: Id<"familiasRecurso">;
          lifecycle?: "ALL" | "ACTIVE" | "INACTIVE";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          scope?:
            | { kind: "ALL" }
            | { kind: "GLOBAL" }
            | { kind: "ORGANIZATION"; organizacionId: Id<"organizaciones"> };
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            activo: boolean;
            classificationStatus: {
              reasons: Array<string>;
              state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
            };
            id: Id<"recursos">;
            identificadorTecnico: string;
            nombre: string;
            organizacionId?: Id<"organizaciones">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
      obtenerDetalleRecurso: FunctionReference<
        "query",
        "public",
        { recursoId: Id<"recursos"> },
        {
          activo: boolean;
          catalogDiagnostics: {
            aggregateStatus: "VALID" | "INVALID" | "NOT_EVALUATED";
            hierarchy: {
              reasons: Array<string>;
              state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
            };
            violations: Array<{
              code:
                | "HIERARCHY_REFERENCE_INVALID"
                | "PRINCIPAL_UNIT_COUNT"
                | "UNIT_INACTIVE"
                | "NUMERIC_UNIT_INVALID"
                | "OPTION_SET_EMPTY"
                | "ASSIGNMENT_SELECTION_INVALID"
                | "RULE_REFERENCE_INVALID"
                | "RULE_RESULT_INVALID"
                | "RULE_CONFLICT"
                | "PRESENTATION_COUNT"
                | "PRESENTATION_TOKEN_INVALID"
                | "COMPATIBILITY_POLICY_CONFLICT"
                | "COMPATIBILITY_RELATION_INVALID"
                | "ALLOWLIST_EMPTY"
                | "TYPE_KEY_AMBIGUOUS"
                | "CATALOG_LIMIT_EXCEEDED"
                | "RESOURCE_VALUE_LIMIT_EXCEEDED"
                | "RESOURCE_SEARCH_RESULT_LIMIT_EXCEEDED"
                | "RESOURCE_ATTRIBUTE_DUPLICATE"
                | "RESOURCE_REQUIRED_VALUE_MISSING"
                | "RESOURCE_NON_FINITE_NUMBER"
                | "RESOURCE_ATTRIBUTE_FORBIDDEN"
                | "RESOURCE_VALUE_TYPE_INVALID";
              count?: number;
              detail?: string;
              entity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
              field?: string;
              relatedEntity?:
                | { id: Id<"organizaciones">; kind: "organizaciones" }
                | { id: Id<"catalogoRevisiones">; kind: "catalogoRevisiones" }
                | {
                    id: Id<"catalogoTipoSnapshots">;
                    kind: "catalogoTipoSnapshots";
                  }
                | { id: Id<"clasesRecurso">; kind: "clasesRecurso" }
                | { id: Id<"familiasRecurso">; kind: "familiasRecurso" }
                | { id: Id<"tiposRecurso">; kind: "tiposRecurso" }
                | { id: Id<"unidades">; kind: "unidades" }
                | {
                    id: Id<"politicasUnidadRecurso">;
                    kind: "politicasUnidadRecurso";
                  }
                | {
                    id: Id<"definicionesAtributo">;
                    kind: "definicionesAtributo";
                  }
                | { id: Id<"atributosRecurso">; kind: "atributosRecurso" }
                | { id: Id<"opcionesAtributo">; kind: "opcionesAtributo" }
                | {
                    id: Id<"politicasPresentacionCanonica">;
                    kind: "politicasPresentacionCanonica";
                  }
                | {
                    id: Id<"politicasCompatibilidadOpciones">;
                    kind: "politicasCompatibilidadOpciones";
                  }
                | {
                    id: Id<"relacionesOpcionesAtributo">;
                    kind: "relacionesOpcionesAtributo";
                  }
                | {
                    id: Id<"reglasAtributoRecurso">;
                    kind: "reglasAtributoRecurso";
                  }
                | { id: Id<"recursos">; kind: "recursos" }
                | { id: Id<"identidadesRecurso">; kind: "identidadesRecurso" }
                | {
                    id: Id<"valoresAtributoRecurso">;
                    kind: "valoresAtributoRecurso";
                  };
            }>;
          };
          clase: {
            activo: boolean;
            clave: string;
            id:
              | Id<"clasesRecurso">
              | Id<"familiasRecurso">
              | Id<"tiposRecurso">
              | Id<"unidades">
              | Id<"organizaciones">;
            nombre: string;
            revision: number;
          } | null;
          classificationStatus: {
            reasons: Array<string>;
            state: "EFFECTIVE" | "INERT" | "BROKEN_REFERENCE";
          };
          descripcion: string | null;
          familia: {
            activo: boolean;
            clave: string;
            id:
              | Id<"clasesRecurso">
              | Id<"familiasRecurso">
              | Id<"tiposRecurso">
              | Id<"unidades">
              | Id<"organizaciones">;
            nombre: string;
            revision: number;
          } | null;
          id: Id<"recursos">;
          identidadVersion: number | null;
          identificadorTecnico: string;
          nombre: string;
          organizacion: {
            activo: boolean;
            clave: string;
            id:
              | Id<"clasesRecurso">
              | Id<"familiasRecurso">
              | Id<"tiposRecurso">
              | Id<"unidades">
              | Id<"organizaciones">;
            nombre: string;
            revision: number;
          } | null;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipo: {
            activo: boolean;
            clave: string;
            id:
              | Id<"clasesRecurso">
              | Id<"familiasRecurso">
              | Id<"tiposRecurso">
              | Id<"unidades">
              | Id<"organizaciones">;
            nombre: string;
            revision: number;
          } | null;
          tipoRecursoId: Id<"tiposRecurso">;
          unidad: {
            activo: boolean;
            clave: string;
            id: Id<"unidades">;
            nombre: string;
            revision: number;
            simbolo: string | null;
          } | null;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        } | null
      >;
    };
    reglas: {
      activarReglaAtributo: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          reglaAtributoRecursoId: Id<"reglasAtributoRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE"
              | "CONDITIONAL";
            atributoAfectadoId: Id<"atributosRecurso">;
            atributoCondicionId: Id<"atributosRecurso">;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"reglasAtributoRecurso">;
            opcionCondicionId?: Id<"opcionesAtributo">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      actualizarReglaAtributo: FunctionReference<
        "mutation",
        "public",
        {
          aplicabilidad?:
            | "REQUIRED"
            | "OPTIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE"
            | "CONDITIONAL";
          atributoAfectadoId?: Id<"atributosRecurso">;
          atributoCondicionId?: Id<"atributosRecurso">;
          expectedRevision: number;
          opcionCondicionId?: Id<"opcionesAtributo"> | null;
          reglaAtributoRecursoId: Id<"reglasAtributoRecurso">;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE"
              | "CONDITIONAL";
            atributoAfectadoId: Id<"atributosRecurso">;
            atributoCondicionId: Id<"atributosRecurso">;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"reglasAtributoRecurso">;
            opcionCondicionId?: Id<"opcionesAtributo">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      crearReglaAtributo: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          aplicabilidad:
            | "REQUIRED"
            | "OPTIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE"
            | "CONDITIONAL";
          atributoAfectadoId: Id<"atributosRecurso">;
          atributoCondicionId: Id<"atributosRecurso">;
          opcionCondicionId?: Id<"opcionesAtributo">;
          tipoRecursoId: Id<"tiposRecurso">;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE"
              | "CONDITIONAL";
            atributoAfectadoId: Id<"atributosRecurso">;
            atributoCondicionId: Id<"atributosRecurso">;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"reglasAtributoRecurso">;
            opcionCondicionId?: Id<"opcionesAtributo">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      desactivarReglaAtributo: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          reglaAtributoRecursoId: Id<"reglasAtributoRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE"
              | "CONDITIONAL";
            atributoAfectadoId: Id<"atributosRecurso">;
            atributoCondicionId: Id<"atributosRecurso">;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"reglasAtributoRecurso">;
            opcionCondicionId?: Id<"opcionesAtributo">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          };
        }
      >;
      listarReglasAtributo: FunctionReference<
        "query",
        "public",
        {
          aplicabilidad?:
            | "REQUIRED"
            | "OPTIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE"
            | "CONDITIONAL";
          atributoAfectadoId?: Id<"atributosRecurso">;
          atributoCondicionId?: Id<"atributosRecurso">;
          cursor?: string | null;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          opcionCondicionId?: Id<"opcionesAtributo">;
          pageSize?: number;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE"
              | "CONDITIONAL";
            atributoAfectadoId: Id<"atributosRecurso">;
            atributoCondicionId: Id<"atributosRecurso">;
            effective: boolean;
            effectiveReasons: Array<string>;
            id: Id<"reglasAtributoRecurso">;
            opcionCondicionId?: Id<"opcionesAtributo">;
            revision: number;
            tipoRecursoId: Id<"tiposRecurso">;
          }>;
        }
      >;
      obtenerReglaAtributo: FunctionReference<
        "query",
        "public",
        { reglaAtributoRecursoId: Id<"reglasAtributoRecurso"> },
        {
          activo: boolean;
          aplicabilidad:
            | "REQUIRED"
            | "OPTIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE"
            | "CONDITIONAL";
          atributoAfectadoId: Id<"atributosRecurso">;
          atributoCondicionId: Id<"atributosRecurso">;
          effective: boolean;
          effectiveReasons: Array<string>;
          id: Id<"reglasAtributoRecurso">;
          opcionCondicionId?: Id<"opcionesAtributo">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
        } | null
      >;
    };
    unidades: {
      activarPoliticaUnidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          politicaUnidadId: Id<"politicasUnidadRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            effective: boolean;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"politicasUnidadRecurso">;
            principal: boolean;
            revision: number;
            selected: boolean;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            shadowed: boolean;
            tipoRecursoId?: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      activarUnidad: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; unidadId: Id<"unidades"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            id: Id<"unidades">;
            nombre: string;
            revision: number;
            simbolo?: string;
          };
        }
      >;
      actualizarPoliticaUnidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          familiaRecursoId?: Id<"familiasRecurso">;
          politicaUnidadId: Id<"politicasUnidadRecurso">;
          principal?: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
          unidadId?: Id<"unidades">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            effective: boolean;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"politicasUnidadRecurso">;
            principal: boolean;
            revision: number;
            selected: boolean;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            shadowed: boolean;
            tipoRecursoId?: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      actualizarUnidad: FunctionReference<
        "mutation",
        "public",
        {
          clave?: string;
          descripcion?: string;
          expectedRevision: number;
          nombre?: string;
          simbolo?: string;
          unidadId: Id<"unidades">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            id: Id<"unidades">;
            nombre: string;
            revision: number;
            simbolo?: string;
          };
        }
      >;
      crearPoliticaUnidad: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          familiaRecursoId: Id<"familiasRecurso">;
          principal: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            effective: boolean;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"politicasUnidadRecurso">;
            principal: boolean;
            revision: number;
            selected: boolean;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            shadowed: boolean;
            tipoRecursoId?: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      crearUnidad: FunctionReference<
        "mutation",
        "public",
        {
          activo?: boolean;
          clave: string;
          descripcion?: string;
          nombre: string;
          simbolo?: string;
        },
        {
          disposition: "CREATED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            id: Id<"unidades">;
            nombre: string;
            revision: number;
            simbolo?: string;
          };
        }
      >;
      desactivarPoliticaUnidad: FunctionReference<
        "mutation",
        "public",
        {
          expectedRevision: number;
          politicaUnidadId: Id<"politicasUnidadRecurso">;
        },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            effective: boolean;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"politicasUnidadRecurso">;
            principal: boolean;
            revision: number;
            selected: boolean;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            shadowed: boolean;
            tipoRecursoId?: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          };
        }
      >;
      desactivarUnidad: FunctionReference<
        "mutation",
        "public",
        { expectedRevision: number; unidadId: Id<"unidades"> },
        {
          disposition: "UPDATED" | "UNCHANGED";
          item: {
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            id: Id<"unidades">;
            nombre: string;
            revision: number;
            simbolo?: string;
          };
        }
      >;
      listarPoliticasUnidad: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          familiaRecursoId?: Id<"familiasRecurso">;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
          paraTipoRecursoId?: Id<"tiposRecurso">;
          tipoRecursoId?: Id<"tiposRecurso">;
          unidadId?: Id<"unidades">;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            effective: boolean;
            familiaRecursoId: Id<"familiasRecurso">;
            id: Id<"politicasUnidadRecurso">;
            principal: boolean;
            revision: number;
            selected: boolean;
            selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
            shadowed: boolean;
            tipoRecursoId?: Id<"tiposRecurso">;
            unidadId: Id<"unidades">;
          }>;
        }
      >;
      listarUnidades: FunctionReference<
        "query",
        "public",
        {
          cursor?: string | null;
          modo?: "ALL" | "ACTIVE" | "INACTIVE";
          pageSize?: number;
        },
        {
          continuationCursor: string | null;
          isExhausted: boolean;
          items: Array<{
            activo: boolean;
            clave: string;
            descripcion?: string;
            effective: boolean;
            id: Id<"unidades">;
            nombre: string;
            revision: number;
            simbolo?: string;
          }>;
        }
      >;
      obtenerPoliticaUnidad: FunctionReference<
        "query",
        "public",
        {
          paraTipoRecursoId?: Id<"tiposRecurso">;
          politicaUnidadId: Id<"politicasUnidadRecurso">;
        },
        {
          activo: boolean;
          effective: boolean;
          familiaRecursoId: Id<"familiasRecurso">;
          id: Id<"politicasUnidadRecurso">;
          principal: boolean;
          revision: number;
          selected: boolean;
          selection: "SELECTED" | "SHADOWED" | "SUPPRESSED" | "NONE";
          shadowed: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
        } | null
      >;
      obtenerUnidad: FunctionReference<
        "query",
        "public",
        { unidadId: Id<"unidades"> },
        {
          activo: boolean;
          clave: string;
          descripcion?: string;
          effective: boolean;
          id: Id<"unidades">;
          nombre: string;
          revision: number;
          simbolo?: string;
        } | null
      >;
    };
  };
  catalogoRecursos: {
    catalogo: {
      asignarAtributo: FunctionReference<
        "mutation",
        "public",
        {
          aplicabilidad:
            | "REQUIRED"
            | "OPTIONAL"
            | "CONDITIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE";
          definicionAtributoId: Id<"definicionesAtributo">;
          familiaRecursoId: Id<"familiasRecurso">;
          orden: number;
          participaIdentidad: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        { id: Id<"atributosRecurso">; revision: number }
      >;
      asignarUnidadPermitida: FunctionReference<
        "mutation",
        "public",
        {
          familiaRecursoId: Id<"familiasRecurso">;
          principal: boolean;
          tipoRecursoId?: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
        },
        { id: Id<"politicasUnidadRecurso">; revision: number }
      >;
      consultarAtributosAplicables: FunctionReference<
        "query",
        "public",
        {
          familiaRecursoId: Id<"familiasRecurso">;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        Array<{
          aplicabilidad:
            | "REQUIRED"
            | "OPTIONAL"
            | "CONDITIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE";
          clave: string;
          definicionAtributoId: Id<"definicionesAtributo">;
          descripcion?: string;
          id: Id<"atributosRecurso">;
          nombre: string;
          orden: number;
          participaIdentidad: boolean;
          tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
          unidad: {
            clave: string;
            id: Id<"unidades">;
            nombre: string;
            simbolo: string | null;
          } | null;
          unidadId?: Id<"unidades">;
        }>
      >;
      consultarClases: FunctionReference<
        "query",
        "public",
        {},
        Array<{
          clave: string;
          descripcion?: string;
          id: Id<"clasesRecurso">;
          nombre: string;
        }>
      >;
      consultarFamiliasDeClase: FunctionReference<
        "query",
        "public",
        { claseRecursoId: Id<"clasesRecurso"> },
        Array<{
          claseRecursoId: Id<"clasesRecurso">;
          clave: string;
          descripcion?: string;
          id: Id<"familiasRecurso">;
          nombre: string;
        }>
      >;
      consultarOpcionesPermitidas: FunctionReference<
        "query",
        "public",
        { definicionAtributoId: Id<"definicionesAtributo"> },
        Array<{
          clave: string;
          definicionAtributoId: Id<"definicionesAtributo">;
          descripcion?: string;
          id: Id<"opcionesAtributo">;
          nombre: string;
        }>
      >;
      consultarTiposDeFamilia: FunctionReference<
        "query",
        "public",
        { familiaRecursoId: Id<"familiasRecurso"> },
        Array<{
          clave: string;
          descripcion?: string;
          familiaRecursoId: Id<"familiasRecurso">;
          id: Id<"tiposRecurso">;
          nombre: string;
        }>
      >;
      consultarUnidadesValidas: FunctionReference<
        "query",
        "public",
        {
          familiaRecursoId: Id<"familiasRecurso">;
          tipoRecursoId?: Id<"tiposRecurso">;
        },
        Array<{
          clave: string;
          descripcion?: string;
          id: Id<"unidades">;
          nombre: string;
          principal: boolean;
          simbolo?: string;
        }>
      >;
      crearClaseRecurso: FunctionReference<
        "mutation",
        "public",
        { clave: string; descripcion?: string; nombre: string },
        { id: Id<"clasesRecurso">; revision: number }
      >;
      crearDefinicionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          clave: string;
          descripcion?: string;
          nombre: string;
          tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
          unidadId?: Id<"unidades">;
        },
        { id: Id<"definicionesAtributo">; revision: number }
      >;
      crearFamiliaRecurso: FunctionReference<
        "mutation",
        "public",
        {
          claseRecursoId: Id<"clasesRecurso">;
          clave: string;
          descripcion?: string;
          nombre: string;
        },
        { id: Id<"familiasRecurso">; revision: number }
      >;
      crearOpcionAtributo: FunctionReference<
        "mutation",
        "public",
        {
          clave: string;
          definicionAtributoId: Id<"definicionesAtributo">;
          descripcion?: string;
          nombre: string;
        },
        { id: Id<"opcionesAtributo">; revision: number }
      >;
      crearTipoRecurso: FunctionReference<
        "mutation",
        "public",
        {
          clave: string;
          descripcion?: string;
          familiaRecursoId: Id<"familiasRecurso">;
          nombre: string;
        },
        { id: Id<"tiposRecurso">; revision: number }
      >;
      crearUnidad: FunctionReference<
        "mutation",
        "public",
        {
          clave: string;
          descripcion?: string;
          nombre: string;
          simbolo?: string;
        },
        { id: Id<"unidades">; revision: number }
      >;
      obtenerReglasValidacion: FunctionReference<
        "query",
        "public",
        { tipoRecursoId: Id<"tiposRecurso"> },
        Array<{
          aplicabilidad:
            | "REQUIRED"
            | "OPTIONAL"
            | "CONDITIONAL"
            | "FORBIDDEN"
            | "NOT_APPLICABLE";
          atributoAfectado: {
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            id: Id<"atributosRecurso">;
            nombre: string;
            orden: number;
            participaIdentidad: boolean;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidad: {
              clave: string;
              id: Id<"unidades">;
              nombre: string;
              simbolo: string | null;
            } | null;
            unidadId?: Id<"unidades">;
          };
          atributoCondicion: {
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            id: Id<"atributosRecurso">;
            nombre: string;
            orden: number;
            participaIdentidad: boolean;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidad: {
              clave: string;
              id: Id<"unidades">;
              nombre: string;
              simbolo: string | null;
            } | null;
            unidadId?: Id<"unidades">;
          };
          id: Id<"reglasAtributoRecurso">;
          opcionCondicion?: {
            clave: string;
            definicionAtributoId: Id<"definicionesAtributo">;
            descripcion?: string;
            id: Id<"opcionesAtributo">;
            nombre: string;
          };
          tipoRecursoId: Id<"tiposRecurso">;
        }>
      >;
    };
    catalogoPublicado: {
      obtenerSnapshotTipo: FunctionReference<
        "query",
        "public",
        {
          organizacionClave: string;
          revisionId?: Id<"catalogoRevisiones">;
          tipoClave: string;
        },
        {
          revisionId: Id<"catalogoRevisiones">;
          snapshot: {
            atributos: Array<{
              aplicabilidad:
                | "REQUIRED"
                | "OPTIONAL"
                | "CONDITIONAL"
                | "FORBIDDEN"
                | "NOT_APPLICABLE";
              clave: string;
              definicionAtributoId: Id<"definicionesAtributo">;
              descripcion?: string;
              id: Id<"atributosRecurso">;
              nombre: string;
              opciones: Array<{
                clave: string;
                descripcion?: string;
                id: Id<"opcionesAtributo">;
                nombre: string;
              }>;
              orden: number;
              participaIdentidad: boolean;
              tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
              unidad: {
                clave: string;
                id: Id<"unidades">;
                nombre: string;
                simbolo: string | null;
              } | null;
            }>;
            clase: {
              clave: string;
              descripcion?: string;
              id: Id<"clasesRecurso">;
              nombre: string;
            };
            familia: {
              clave: string;
              descripcion?: string;
              id: Id<"familiasRecurso">;
              nombre: string;
            };
            politicasCompatibilidad: Array<{
              atributoDestinoClave: string;
              atributoOrigenClave: string;
              direccion: "DIRECTIONAL" | "SYMMETRIC";
              modo: "ALLOWLIST" | "DENYLIST";
              pares: Array<{
                destinoOpcionClave: string;
                origenOpcionClave: string;
              }>;
            }>;
            presentacionCanonica: {
              separador: string;
              tipoNombre: string;
              tokens: Array<
                | { tipo: "TYPE_NAME" }
                | { atributoClave: string; tipo: "ATTRIBUTE_VALUE" }
                | { texto: string; tipo: "LITERAL" }
              >;
            };
            reglas: Array<{
              aplicabilidad:
                | "REQUIRED"
                | "OPTIONAL"
                | "CONDITIONAL"
                | "FORBIDDEN"
                | "NOT_APPLICABLE";
              atributoAfectadoClave: string;
              atributoCondicionClave: string;
              id: Id<"reglasAtributoRecurso">;
              opcionCondicionClave?: string;
            }>;
            tipo: {
              clave: string;
              descripcion?: string;
              id: Id<"tiposRecurso">;
              nombre: string;
            };
            unidadNatural: {
              clave: string;
              descripcion?: string;
              id: Id<"unidades">;
              nombre: string;
              simbolo?: string;
            };
          };
          tipoClave: string;
        } | null
      >;
      obtenerUltimaRevisionPublicada: FunctionReference<
        "query",
        "public",
        { organizacionClave: string },
        {
          creadoEn: number;
          hashContenido: string;
          numero: number;
          publicadoEn: number;
          revisionId: Id<"catalogoRevisiones">;
        } | null
      >;
    };
    recursos: {
      actualizarRecurso: FunctionReference<
        "mutation",
        "public",
        {
          claseRecursoId: Id<"clasesRecurso">;
          descripcion?: string;
          familiaRecursoId: Id<"familiasRecurso">;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          recursoId: Id<"recursos">;
          revisionEsperada: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            valor: string | number | boolean;
          }>;
        },
        {
          _creationTime: number;
          _id: Id<"recursos">;
          activo: boolean;
          descripcion?: string;
          identidadVersion?: number;
          identificadorTecnico: string;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        }
      >;
      buscarRecursos: FunctionReference<
        "query",
        "public",
        { activo?: boolean; texto: string; tipoRecursoId?: Id<"tiposRecurso"> },
        Array<{
          _creationTime: number;
          _id: Id<"recursos">;
          activo: boolean;
          descripcion?: string;
          identidadVersion?: number;
          identificadorTecnico: string;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        }>
      >;
      crearRecurso: FunctionReference<
        "mutation",
        "public",
        {
          claseRecursoId: Id<"clasesRecurso">;
          descripcion?: string;
          familiaRecursoId: Id<"familiasRecurso">;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            valor: string | number | boolean;
          }>;
        },
        {
          _creationTime: number;
          _id: Id<"recursos">;
          activo: boolean;
          descripcion?: string;
          identidadVersion?: number;
          identificadorTecnico: string;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        }
      >;
      desactivarRecurso: FunctionReference<
        "mutation",
        "public",
        { recursoId: Id<"recursos">; revisionEsperada: number },
        {
          _creationTime: number;
          _id: Id<"recursos">;
          activo: boolean;
          descripcion?: string;
          identidadVersion?: number;
          identificadorTecnico: string;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        }
      >;
      listarRecursos: FunctionReference<
        "query",
        "public",
        { activo?: boolean; tipoRecursoId?: Id<"tiposRecurso"> },
        Array<{
          _creationTime: number;
          _id: Id<"recursos">;
          activo: boolean;
          descripcion?: string;
          identidadVersion?: number;
          identificadorTecnico: string;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        }>
      >;
      obtenerDetalleRecurso: FunctionReference<
        "query",
        "public",
        { recursoId: Id<"recursos"> },
        {
          activo: boolean;
          atributos: Array<{
            activo: boolean;
            aplicabilidad:
              | "REQUIRED"
              | "OPTIONAL"
              | "CONDITIONAL"
              | "FORBIDDEN"
              | "NOT_APPLICABLE";
            clave: string;
            id: Id<"atributosRecurso">;
            nombre: string;
            opcion: {
              activo: boolean;
              clave: string;
              id: Id<"opcionesAtributo">;
              nombre: string;
              revision: number;
            } | null;
            orden: number;
            participaIdentidad: boolean;
            tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
            unidad: {
              activo: boolean;
              clave: string;
              id: Id<"unidades">;
              nombre: string;
              revision: number;
              simbolo: string | null;
            } | null;
            valor: string | number | boolean | null;
          }>;
          clase: {
            activo: boolean;
            clave: string;
            id: Id<"clasesRecurso">;
            nombre: string;
            revision: number;
          };
          descripcion?: string;
          familia: {
            activo: boolean;
            clave: string;
            id: Id<"familiasRecurso">;
            nombre: string;
            revision: number;
          };
          id: Id<"recursos">;
          identificadorTecnico: string;
          nombre: string;
          revision: number;
          tipo: {
            activo: boolean;
            clave: string;
            id: Id<"tiposRecurso">;
            nombre: string;
            revision: number;
          };
          unidad: {
            activo: boolean;
            clave: string;
            id: Id<"unidades">;
            nombre: string;
            revision: number;
            simbolo: string | null;
          };
        } | null
      >;
      obtenerRecurso: FunctionReference<
        "query",
        "public",
        { recursoId: Id<"recursos"> },
        {
          _creationTime: number;
          _id: Id<"recursos">;
          activo: boolean;
          descripcion?: string;
          identidadVersion?: number;
          identificadorTecnico: string;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        } | null
      >;
      reactivarRecurso: FunctionReference<
        "mutation",
        "public",
        { recursoId: Id<"recursos">; revisionEsperada: number },
        {
          _creationTime: number;
          _id: Id<"recursos">;
          activo: boolean;
          descripcion?: string;
          identidadVersion?: number;
          identificadorTecnico: string;
          nombre: string;
          organizacionId?: Id<"organizaciones">;
          revision: number;
          tipoRecursoId: Id<"tiposRecurso">;
          unidadId: Id<"unidades">;
          valores: Array<{
            _creationTime: number;
            _id: Id<"valoresAtributoRecurso">;
            atributoRecursoId: Id<"atributosRecurso">;
            opcionAtributoId?: Id<"opcionesAtributo">;
            recursoId: Id<"recursos">;
            valor: string | number | boolean;
          }>;
        }
      >;
    };
  };
};

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: {
  catalogoAdmin: {
    lib: {
      backfillMetadatos: {
        backfillMetadatos: FunctionReference<
          "mutation",
          "internal",
          { batchSize?: number; cursor?: string | null },
          {
            duplicateReports: Array<{
              identity: string;
              ids: Array<string>;
              table: string;
            }>;
            nextCursor: string | null;
            processed: number;
            updated: number;
          }
        >;
      };
    };
  };
  catalogoRecursos: {
    catalogoPublicado: {
      asegurarOrganizacion: FunctionReference<
        "mutation",
        "internal",
        { clave: string; nombre: string },
        Id<"organizaciones">
      >;
      publicarCatalogo: FunctionReference<
        "mutation",
        "internal",
        { organizacionId: Id<"organizaciones"> },
        {
          hashContenido: string;
          numero: number;
          revisionId: Id<"catalogoRevisiones">;
        }
      >;
    };
    identidadesRecurso: {
      eliminar: FunctionReference<
        "mutation",
        "internal",
        { recursoId: Id<"recursos"> },
        null
      >;
      registrar: FunctionReference<
        "mutation",
        "internal",
        {
          clave: string;
          organizacionId: Id<"organizaciones">;
          recursoId: Id<"recursos">;
          version: number;
        },
        {
          _creationTime: number;
          _id: Id<"identidadesRecurso">;
          activa: boolean;
          clave: string;
          creadaEn: number;
          organizacionId: Id<"organizaciones">;
          recursoId: Id<"recursos">;
          version: number;
        }
      >;
      resolver: FunctionReference<
        "query",
        "internal",
        {
          clave: string;
          organizacionId: Id<"organizaciones">;
          version: number;
        },
        {
          _creationTime: number;
          _id: Id<"identidadesRecurso">;
          activa: boolean;
          clave: string;
          creadaEn: number;
          organizacionId: Id<"organizaciones">;
          recursoId: Id<"recursos">;
          version: number;
        } | null
      >;
    };
  };
};

export declare const components: {};
