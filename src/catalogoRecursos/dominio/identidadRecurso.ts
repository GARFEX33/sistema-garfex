import type { Atributo, Clase, Definicion, Familia, IdDominio, Opcion, Tipo, ValorEntrada } from "./tipos";

export function identidadRecurso(
  tipo: Pick<Tipo, "clave">,
  familia: Pick<Familia, "clave">,
  clase: Pick<Clase, "clave">,
  atributos: Map<IdDominio, Atributo>,
  valores: Map<IdDominio, ValorEntrada>,
  definiciones: Map<IdDominio, Pick<Definicion, "clave">>,
  opciones: Map<IdDominio, Pick<Opcion, "clave">>,
): string {
  const partes = [...atributos.entries()]
    .filter(([, atributo]) => atributo.participaIdentidad && valores.has(atributo.id))
    .map(([, atributo]) => {
      const valor = valores.get(atributo.id)!;
      const clave = definiciones.get(atributo.definicionAtributoId)!.clave;
      const normalizado = valor.opcionAtributoId
        ? opciones.get(valor.opcionAtributoId)!.clave
        : typeof valor.valor === "string"
          ? valor.valor.normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase()
          : typeof valor.valor === "boolean"
            ? valor.valor ? "TRUE" : "FALSE"
            : String(valor.valor);
      return [clave, normalizado] as const;
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([clave, valor]) => `${clave}=${valor}`);
  return `v1|${clase.clave}|${familia.clave}|${tipo.clave}|${partes.join("|")}`;
}
