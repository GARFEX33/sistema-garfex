/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
  AnyDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */

export type DataModel = {
  atributosRecurso: {
    document: {
      activo: boolean;
      adminSortId?: string;
      aplicabilidad:
        | "REQUIRED"
        | "OPTIONAL"
        | "CONDITIONAL"
        | "FORBIDDEN"
        | "NOT_APPLICABLE";
      definicionAtributoId: Id<"definicionesAtributo">;
      definicionClave?: string;
      familiaRecursoId: Id<"familiasRecurso">;
      orden: number;
      participaIdentidad: boolean;
      revision: number;
      tipoRecursoId?: Id<"tiposRecurso">;
      _id: Id<"atributosRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "aplicabilidad"
      | "definicionAtributoId"
      | "definicionClave"
      | "familiaRecursoId"
      | "orden"
      | "participaIdentidad"
      | "revision"
      | "tipoRecursoId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porAplicabilidadYActivoYFamiliaYTipoYOrdenYDefinicionYAdminSort: [
        "aplicabilidad",
        "activo",
        "familiaRecursoId",
        "tipoRecursoId",
        "orden",
        "definicionClave",
        "adminSortId",
        "_creationTime",
      ];
      porDefinicion: ["definicionAtributoId", "_creationTime"];
      porDefinicionYActivoYFamiliaYTipoYOrdenYAdminSort: [
        "definicionClave",
        "activo",
        "familiaRecursoId",
        "tipoRecursoId",
        "orden",
        "adminSortId",
        "_creationTime",
      ];
      porFamilia: ["familiaRecursoId", "_creationTime"];
      porFamiliaYDefinicion: [
        "familiaRecursoId",
        "definicionAtributoId",
        "_creationTime",
      ];
      porFamiliaYTipoYDefinicion: [
        "familiaRecursoId",
        "tipoRecursoId",
        "definicionAtributoId",
        "_creationTime",
      ];
      porFamiliaYTipoYDefinicionYAdminSort: [
        "familiaRecursoId",
        "tipoRecursoId",
        "orden",
        "definicionClave",
        "adminSortId",
        "_creationTime",
      ];
      porIdentidadYActivoYFamiliaYTipoYOrdenYDefinicionYAdminSort: [
        "participaIdentidad",
        "activo",
        "familiaRecursoId",
        "tipoRecursoId",
        "orden",
        "definicionClave",
        "adminSortId",
        "_creationTime",
      ];
      porTipo: ["tipoRecursoId", "_creationTime"];
      porTipoYDefinicion: [
        "tipoRecursoId",
        "definicionAtributoId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  catalogoRevisiones: {
    document: {
      adminSortId?: string;
      creadoEn: number;
      estado: "PUBLISHED";
      hashContenido: string;
      numero: number;
      organizacionId: Id<"organizaciones">;
      publicadoEn: number;
      _id: Id<"catalogoRevisiones">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "adminSortId"
      | "creadoEn"
      | "estado"
      | "hashContenido"
      | "numero"
      | "organizacionId"
      | "publicadoEn";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porOrganizacionYEstado: ["organizacionId", "estado", "_creationTime"];
      porOrganizacionYEstadoYNumeroYAdminSort: [
        "organizacionId",
        "estado",
        "numero",
        "adminSortId",
        "_creationTime",
      ];
      porOrganizacionYNumero: ["organizacionId", "numero", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  catalogoTipoSnapshots: {
    document: {
      organizacionId: Id<"organizaciones">;
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
      _id: Id<"catalogoTipoSnapshots">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "organizacionId"
      | "revisionId"
      | "snapshot"
      | "snapshot.atributos"
      | "snapshot.clase"
      | "snapshot.clase.clave"
      | "snapshot.clase.descripcion"
      | "snapshot.clase.id"
      | "snapshot.clase.nombre"
      | "snapshot.familia"
      | "snapshot.familia.clave"
      | "snapshot.familia.descripcion"
      | "snapshot.familia.id"
      | "snapshot.familia.nombre"
      | "snapshot.politicasCompatibilidad"
      | "snapshot.presentacionCanonica"
      | "snapshot.presentacionCanonica.separador"
      | "snapshot.presentacionCanonica.tipoNombre"
      | "snapshot.presentacionCanonica.tokens"
      | "snapshot.reglas"
      | "snapshot.tipo"
      | "snapshot.tipo.clave"
      | "snapshot.tipo.descripcion"
      | "snapshot.tipo.id"
      | "snapshot.tipo.nombre"
      | "snapshot.unidadNatural"
      | "snapshot.unidadNatural.clave"
      | "snapshot.unidadNatural.descripcion"
      | "snapshot.unidadNatural.id"
      | "snapshot.unidadNatural.nombre"
      | "snapshot.unidadNatural.simbolo"
      | "tipoClave";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porOrganizacionYTipo: ["organizacionId", "tipoClave", "_creationTime"];
      porRevisionYTipo: ["revisionId", "tipoClave", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  clasesRecurso: {
    document: {
      activo: boolean;
      adminSortId?: string;
      clave: string;
      descripcion?: string;
      nombre: string;
      revision: number;
      _id: Id<"clasesRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "clave"
      | "descripcion"
      | "nombre"
      | "revision";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivoYClaveYAdminSort: [
        "activo",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
      porClave: ["clave", "_creationTime"];
      porClaveYAdminSort: ["clave", "adminSortId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  definicionesAtributo: {
    document: {
      activo: boolean;
      adminSortId?: string;
      clave: string;
      descripcion?: string;
      nombre: string;
      revision: number;
      tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
      unidadId?: Id<"unidades">;
      _id: Id<"definicionesAtributo">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "clave"
      | "descripcion"
      | "nombre"
      | "revision"
      | "tipoDato"
      | "unidadId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivoYClaveYAdminSort: [
        "activo",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
      porClave: ["clave", "_creationTime"];
      porClaveYAdminSort: ["clave", "adminSortId", "_creationTime"];
      porUnidad: ["unidadId", "_creationTime"];
      porUnidadYActivoYClaveYAdminSort: [
        "unidadId",
        "activo",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  familiasRecurso: {
    document: {
      activo: boolean;
      adminSortId?: string;
      claseRecursoId: Id<"clasesRecurso">;
      clave: string;
      descripcion?: string;
      nombre: string;
      revision: number;
      _id: Id<"familiasRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "claseRecursoId"
      | "clave"
      | "descripcion"
      | "nombre"
      | "revision";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivoYClaseYClaveYAdminSort: [
        "activo",
        "claseRecursoId",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
      porClase: ["claseRecursoId", "_creationTime"];
      porClaseYClave: ["claseRecursoId", "clave", "_creationTime"];
      porClaseYClaveYAdminSort: [
        "claseRecursoId",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  identidadesRecurso: {
    document: {
      activa: boolean;
      clave: string;
      creadaEn: number;
      organizacionId: Id<"organizaciones">;
      recursoId: Id<"recursos">;
      version: number;
      _id: Id<"identidadesRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activa"
      | "clave"
      | "creadaEn"
      | "organizacionId"
      | "recursoId"
      | "version";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porOrganizacionVersionClave: [
        "organizacionId",
        "version",
        "clave",
        "_creationTime",
      ];
      porRecurso: ["recursoId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  opcionesAtributo: {
    document: {
      activo: boolean;
      adminSortId?: string;
      clave: string;
      definicionAtributoId: Id<"definicionesAtributo">;
      descripcion?: string;
      nombre: string;
      revision: number;
      _id: Id<"opcionesAtributo">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "clave"
      | "definicionAtributoId"
      | "descripcion"
      | "nombre"
      | "revision";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivoYDefinicionYClaveYAdminSort: [
        "activo",
        "definicionAtributoId",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
      porDefinicion: ["definicionAtributoId", "_creationTime"];
      porDefinicionYClave: ["definicionAtributoId", "clave", "_creationTime"];
      porDefinicionYClaveYAdminSort: [
        "definicionAtributoId",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  organizaciones: {
    document: {
      activo: boolean;
      clave: string;
      nombre: string;
      revision: number;
      _id: Id<"organizaciones">;
      _creationTime: number;
    };
    fieldPaths:
      "_creationTime" | "_id" | "activo" | "clave" | "nombre" | "revision";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porClave: ["clave", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  politicasCompatibilidadOpciones: {
    document: {
      activo: boolean;
      adminSortId?: string;
      atributoDestinoId: Id<"atributosRecurso">;
      atributoDestinoIdNormalizado?: string;
      atributoOrigenId: Id<"atributosRecurso">;
      atributoOrigenIdNormalizado?: string;
      direccion: "DIRECTIONAL" | "SYMMETRIC";
      modo: "ALLOWLIST" | "DENYLIST";
      revision: number;
      tipoRecursoId: Id<"tiposRecurso">;
      _id: Id<"politicasCompatibilidadOpciones">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "atributoDestinoId"
      | "atributoDestinoIdNormalizado"
      | "atributoOrigenId"
      | "atributoOrigenIdNormalizado"
      | "direccion"
      | "modo"
      | "revision"
      | "tipoRecursoId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porTipo: ["tipoRecursoId", "_creationTime"];
      porTipoYActivoYNormalizadosYDireccionYAdminSort: [
        "tipoRecursoId",
        "activo",
        "atributoOrigenIdNormalizado",
        "atributoDestinoIdNormalizado",
        "direccion",
        "adminSortId",
        "_creationTime",
      ];
      porTipoYEstado: ["tipoRecursoId", "activo", "_creationTime"];
      porTipoYNormalizadosYDireccionYAdminSort: [
        "tipoRecursoId",
        "atributoOrigenIdNormalizado",
        "atributoDestinoIdNormalizado",
        "direccion",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  politicasPresentacionCanonica: {
    document: {
      activo: boolean;
      adminSortId?: string;
      revision: number;
      separador: string;
      tipoRecursoId: Id<"tiposRecurso">;
      tokens: Array<
        | { tipo: "TYPE_NAME" }
        | { atributoRecursoId: Id<"atributosRecurso">; tipo: "ATTRIBUTE_VALUE" }
        | { texto: string; tipo: "LITERAL" }
      >;
      _id: Id<"politicasPresentacionCanonica">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "revision"
      | "separador"
      | "tipoRecursoId"
      | "tokens";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porTipo: ["tipoRecursoId", "_creationTime"];
      porTipoYActivo: ["tipoRecursoId", "activo", "_creationTime"];
      porTipoYActivoYAdminSort: [
        "tipoRecursoId",
        "activo",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  politicasUnidadRecurso: {
    document: {
      activo: boolean;
      adminSortId?: string;
      familiaRecursoId: Id<"familiasRecurso">;
      principal: boolean;
      revision: number;
      tipoRecursoId?: Id<"tiposRecurso">;
      unidadId: Id<"unidades">;
      _id: Id<"politicasUnidadRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "familiaRecursoId"
      | "principal"
      | "revision"
      | "tipoRecursoId"
      | "unidadId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porFamilia: ["familiaRecursoId", "_creationTime"];
      porFamiliaYActivoYTipoYUnidadYAdminSort: [
        "familiaRecursoId",
        "activo",
        "tipoRecursoId",
        "unidadId",
        "adminSortId",
        "_creationTime",
      ];
      porFamiliaYTipoYUnidad: [
        "familiaRecursoId",
        "tipoRecursoId",
        "unidadId",
        "_creationTime",
      ];
      porFamiliaYTipoYUnidadYAdminSort: [
        "familiaRecursoId",
        "tipoRecursoId",
        "unidadId",
        "adminSortId",
        "_creationTime",
      ];
      porFamiliaYUnidad: ["familiaRecursoId", "unidadId", "_creationTime"];
      porTipo: ["tipoRecursoId", "_creationTime"];
      porTipoYActivoYFamiliaYUnidadYAdminSort: [
        "tipoRecursoId",
        "activo",
        "familiaRecursoId",
        "unidadId",
        "adminSortId",
        "_creationTime",
      ];
      porTipoYUnidad: ["tipoRecursoId", "unidadId", "_creationTime"];
      porUnidad: ["unidadId", "_creationTime"];
      porUnidadYActivoYFamiliaYTipoYAdminSort: [
        "unidadId",
        "activo",
        "familiaRecursoId",
        "tipoRecursoId",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  recursos: {
    document: {
      activo: boolean;
      descripcion?: string;
      identidadVersion?: number;
      identificadorTecnico: string;
      nombre: string;
      organizacionId?: Id<"organizaciones">;
      revision: number;
      tipoRecursoId: Id<"tiposRecurso">;
      unidadId: Id<"unidades">;
      _id: Id<"recursos">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "descripcion"
      | "identidadVersion"
      | "identificadorTecnico"
      | "nombre"
      | "organizacionId"
      | "revision"
      | "tipoRecursoId"
      | "unidadId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivo: ["activo", "_creationTime"];
      porIdentificadorTecnico: ["identificadorTecnico", "_creationTime"];
      porOrganizacionYIdentificadorTecnico: [
        "organizacionId",
        "identificadorTecnico",
        "_creationTime",
      ];
      porTipo: ["tipoRecursoId", "_creationTime"];
      porTipoYActivo: ["tipoRecursoId", "activo", "_creationTime"];
      porUnidad: ["unidadId", "_creationTime"];
    };
    searchIndexes: {
      buscar: {
        searchField: "nombre";
        filterFields: "activo" | "tipoRecursoId";
      };
    };
    vectorIndexes: {};
  };
  reglasAtributoRecurso: {
    document: {
      activo: boolean;
      adminSortId?: string;
      aplicabilidad:
        | "REQUIRED"
        | "OPTIONAL"
        | "CONDITIONAL"
        | "FORBIDDEN"
        | "NOT_APPLICABLE";
      atributoAfectadoId: Id<"atributosRecurso">;
      atributoCondicionId: Id<"atributosRecurso">;
      opcionCondicionId?: Id<"opcionesAtributo">;
      revision: number;
      tipoRecursoId: Id<"tiposRecurso">;
      _id: Id<"reglasAtributoRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "aplicabilidad"
      | "atributoAfectadoId"
      | "atributoCondicionId"
      | "opcionCondicionId"
      | "revision"
      | "tipoRecursoId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porAtributoAfectado: ["atributoAfectadoId", "_creationTime"];
      porAtributoCondicion: ["atributoCondicionId", "_creationTime"];
      porTipo: ["tipoRecursoId", "_creationTime"];
      porTipoYActivoYCondicionYOpcionYAfectadoYAdminSort: [
        "tipoRecursoId",
        "activo",
        "atributoCondicionId",
        "opcionCondicionId",
        "atributoAfectadoId",
        "adminSortId",
        "_creationTime",
      ];
      porTipoYCondicionYOpcionYAfectadoYAdminSort: [
        "tipoRecursoId",
        "atributoCondicionId",
        "opcionCondicionId",
        "atributoAfectadoId",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  relacionesOpcionesAtributo: {
    document: {
      activo: boolean;
      adminSortId?: string;
      opcionDestinoId: Id<"opcionesAtributo">;
      opcionDestinoIdNormalizada?: string;
      opcionOrigenId: Id<"opcionesAtributo">;
      opcionOrigenIdNormalizada?: string;
      politicaCompatibilidadId?: Id<"politicasCompatibilidadOpciones">;
      revision: number;
      tipoRelacion?: string;
      _id: Id<"relacionesOpcionesAtributo">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "opcionDestinoId"
      | "opcionDestinoIdNormalizada"
      | "opcionOrigenId"
      | "opcionOrigenIdNormalizada"
      | "politicaCompatibilidadId"
      | "revision"
      | "tipoRelacion";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivo: ["activo", "_creationTime"];
      porDestino: ["opcionDestinoId", "_creationTime"];
      porOrigen: ["opcionOrigenId", "_creationTime"];
      porOrigenYDestino: ["opcionOrigenId", "opcionDestinoId", "_creationTime"];
      porPolitica: ["politicaCompatibilidadId", "_creationTime"];
      porPoliticaYActivoYOpcionesNormalizadasYAdminSort: [
        "politicaCompatibilidadId",
        "activo",
        "opcionOrigenIdNormalizada",
        "opcionDestinoIdNormalizada",
        "adminSortId",
        "_creationTime",
      ];
      porPoliticaYOpcionesNormalizadasYAdminSort: [
        "politicaCompatibilidadId",
        "opcionOrigenIdNormalizada",
        "opcionDestinoIdNormalizada",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  tiposRecurso: {
    document: {
      activo: boolean;
      adminSortId?: string;
      clave: string;
      descripcion?: string;
      familiaRecursoId: Id<"familiasRecurso">;
      nombre: string;
      revision: number;
      _id: Id<"tiposRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "clave"
      | "descripcion"
      | "familiaRecursoId"
      | "nombre"
      | "revision";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivoYFamiliaYClaveYAdminSort: [
        "activo",
        "familiaRecursoId",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
      porClaveYAdminSort: ["clave", "adminSortId", "_creationTime"];
      porFamilia: ["familiaRecursoId", "_creationTime"];
      porFamiliaYClave: ["familiaRecursoId", "clave", "_creationTime"];
      porFamiliaYClaveYAdminSort: [
        "familiaRecursoId",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  unidades: {
    document: {
      activo: boolean;
      adminSortId?: string;
      clave: string;
      descripcion?: string;
      nombre: string;
      revision: number;
      simbolo?: string;
      _id: Id<"unidades">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "activo"
      | "adminSortId"
      | "clave"
      | "descripcion"
      | "nombre"
      | "revision"
      | "simbolo";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porActivoYClaveYAdminSort: [
        "activo",
        "clave",
        "adminSortId",
        "_creationTime",
      ];
      porClave: ["clave", "_creationTime"];
      porClaveYAdminSort: ["clave", "adminSortId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  valoresAtributoRecurso: {
    document: {
      atributoRecursoId: Id<"atributosRecurso">;
      opcionAtributoId?: Id<"opcionesAtributo">;
      recursoId: Id<"recursos">;
      valor: string | number | boolean;
      _id: Id<"valoresAtributoRecurso">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "atributoRecursoId"
      | "opcionAtributoId"
      | "recursoId"
      | "valor";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      porAtributo: ["atributoRecursoId", "_creationTime"];
      porRecurso: ["recursoId", "_creationTime"];
      porRecursoYAtributo: ["recursoId", "atributoRecursoId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
};

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/using/document-ids).
 *
 * Documents can be loaded using `db.get(tableName, id)` in query and mutation functions.
 *
 * IDs are just strings at runtime, but this type can be used to distinguish them from other
 * strings when type checking.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;
