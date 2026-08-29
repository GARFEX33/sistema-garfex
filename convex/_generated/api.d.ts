/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as catalogoRecursos_catalogo from "../catalogoRecursos/catalogo.js";
import type * as catalogoRecursos_recursos from "../catalogoRecursos/recursos.js";
import type * as catalogoRecursos_validacionRecurso from "../catalogoRecursos/validacionRecurso.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "catalogoRecursos/catalogo": typeof catalogoRecursos_catalogo;
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
