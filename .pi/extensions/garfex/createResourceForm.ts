import type {
  ApplicableAttributes,
  CreateResourceArgs,
} from "./types";

export type FormDataType = "TEXTO" | "NUMERO" | "BOOLEANO";
export type FormValue = string | number | boolean;

/** Converts a wizard field into the scalar Convex accepts for its data type. */
export function parseResourceValue(type: FormDataType, raw: string | number | boolean): FormValue {
  if (type === "TEXTO") return String(raw);
  if (type === "NUMERO") {
    if (typeof raw === "string" && raw.trim() === "") throw new Error("Número inválido");
    const value = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(value)) throw new Error("Número inválido");
    return value;
  }
  if (typeof raw === "boolean") return raw;
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error("Booleano inválido");
}

type DisplayAttribute = Pick<ApplicableAttributes[number], "nombre" | "aplicabilidad" | "unidad">;

export function buildAttributeDisplayLabel(attribute: DisplayAttribute): string {
  const unit = attribute.unidad?.simbolo || attribute.unidad?.nombre;
  return `${attribute.nombre} (${attribute.aplicabilidad}${unit ? `, ${unit}` : ""})`;
}

export type CreateResourceDraft = CreateResourceArgs;

/** Maps the explicit wizard draft only; business validation remains in Convex. */
export function buildCreateResourceArgs(draft: CreateResourceDraft): CreateResourceArgs {
  return {
    claseRecursoId: draft.claseRecursoId,
    familiaRecursoId: draft.familiaRecursoId,
    tipoRecursoId: draft.tipoRecursoId,
    unidadId: draft.unidadId,
    nombre: draft.nombre,
    ...(draft.descripcion === undefined ? {} : { descripcion: draft.descripcion }),
    valores: draft.valores.map((value) => ({
      atributoRecursoId: value.atributoRecursoId,
      valor: value.valor,
      ...(value.opcionAtributoId === undefined ? {} : { opcionAtributoId: value.opcionAtributoId }),
    })),
  };
}
