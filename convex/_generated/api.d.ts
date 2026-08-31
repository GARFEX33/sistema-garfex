/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as catalogoAdmin_atributos from "../catalogoAdmin/atributos.js";
import type * as catalogoAdmin_jerarquia from "../catalogoAdmin/jerarquia.js";
import type * as catalogoAdmin_lib_backfillMetadatos from "../catalogoAdmin/lib/backfillMetadatos.js";
import type * as catalogoAdmin_lib_cargarAgregado from "../catalogoAdmin/lib/cargarAgregado.js";
import type * as catalogoAdmin_lib_errors from "../catalogoAdmin/lib/errors.js";
import type * as catalogoAdmin_lib_pagination from "../catalogoAdmin/lib/pagination.js";
import type * as catalogoAdmin_lib_revisions from "../catalogoAdmin/lib/revisions.js";
import type * as catalogoAdmin_presentacion from "../catalogoAdmin/presentacion.js";
import type * as catalogoAdmin_reglas from "../catalogoAdmin/reglas.js";
import type * as catalogoAdmin_unidades from "../catalogoAdmin/unidades.js";
import type * as catalogoAdmin_validators from "../catalogoAdmin/validators.js";
import type * as catalogoRecursos_catalogo from "../catalogoRecursos/catalogo.js";
import type * as catalogoRecursos_catalogoPublicado from "../catalogoRecursos/catalogoPublicado.js";
import type * as catalogoRecursos_catalogoPublicadoValidators from "../catalogoRecursos/catalogoPublicadoValidators.js";
import type * as catalogoRecursos_identidadesRecurso from "../catalogoRecursos/identidadesRecurso.js";
import type * as catalogoRecursos_recursos from "../catalogoRecursos/recursos.js";
import type * as catalogoRecursos_validacionRecurso from "../catalogoRecursos/validacionRecurso.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "catalogoAdmin/atributos": typeof catalogoAdmin_atributos;
  "catalogoAdmin/jerarquia": typeof catalogoAdmin_jerarquia;
  "catalogoAdmin/lib/backfillMetadatos": typeof catalogoAdmin_lib_backfillMetadatos;
  "catalogoAdmin/lib/cargarAgregado": typeof catalogoAdmin_lib_cargarAgregado;
  "catalogoAdmin/lib/errors": typeof catalogoAdmin_lib_errors;
  "catalogoAdmin/lib/pagination": typeof catalogoAdmin_lib_pagination;
  "catalogoAdmin/lib/revisions": typeof catalogoAdmin_lib_revisions;
  "catalogoAdmin/presentacion": typeof catalogoAdmin_presentacion;
  "catalogoAdmin/reglas": typeof catalogoAdmin_reglas;
  "catalogoAdmin/unidades": typeof catalogoAdmin_unidades;
  "catalogoAdmin/validators": typeof catalogoAdmin_validators;
  "catalogoRecursos/catalogo": typeof catalogoRecursos_catalogo;
  "catalogoRecursos/catalogoPublicado": typeof catalogoRecursos_catalogoPublicado;
  "catalogoRecursos/catalogoPublicadoValidators": typeof catalogoRecursos_catalogoPublicadoValidators;
  "catalogoRecursos/identidadesRecurso": typeof catalogoRecursos_identidadesRecurso;
  "catalogoRecursos/recursos": typeof catalogoRecursos_recursos;
  "catalogoRecursos/validacionRecurso": typeof catalogoRecursos_validacionRecurso;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
