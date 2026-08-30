import type { Atributo, Clase, Definicion, Familia, IdDominio, Opcion, Tipo, Valor, ValorEntrada } from "./tipos";

export function normalizarValor(valor: Valor): string {
  if (typeof valor === "string") return valor.normalize("NFC").trim().replace(/\s+/g, " ").toUpperCase();
  if (typeof valor === "boolean") return valor ? "TRUE" : "FALSE";
  return String(valor);
}

export function identidadRecurso(
  tipo: Pick<Tipo, "clave">, familia: Pick<Familia, "clave">, clase: Pick<Clase, "clave">,
  atributos: Map<IdDominio, Atributo>, valores: Map<IdDominio, ValorEntrada>,
  definiciones: Map<IdDominio, Pick<Definicion, "clave">>, opciones: Map<IdDominio, Pick<Opcion, "clave">>,
): string {
  const partes = [...atributos.entries()]
    .filter(([, atributo]) => atributo.participaIdentidad && valores.has(atributo.id))
    .map(([, atributo]) => {
      const valor = valores.get(atributo.id)!;
      const clave = definiciones.get(atributo.definicionAtributoId)!.clave;
      const normalizado = valor.opcionAtributoId ? opciones.get(valor.opcionAtributoId)!.clave : normalizarValor(valor.valor);
      return [clave, normalizado] as const;
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([clave, valor]) => `${clave}=${valor}`);
  return `v1|${clase.clave}|${familia.clave}|${tipo.clave}|${partes.join("|")}`;
}

function componente(valor: string): string {
  return `${new TextEncoder().encode(valor).length}:${valor}`;
}

export function serializarIdentidadV2(
  tipo: Pick<Tipo, "clave">, familia: Pick<Familia, "clave">, clase: Pick<Clase, "clave">,
  partes: readonly (readonly [string, string])[],
): string {
  const ordenadas = [...partes].sort(([a], [b]) => a.localeCompare(b));
  return ["v2", clase.clave, familia.clave, tipo.clave, ...ordenadas.flatMap(([clave, valor]) => [clave, valor])]
    .map(componente).join("|");
}

export function identidadRecursoV2(
  tipo: Pick<Tipo, "clave">, familia: Pick<Familia, "clave">, clase: Pick<Clase, "clave">,
  atributos: Map<IdDominio, Atributo>, valores: Map<IdDominio, ValorEntrada>,
  definiciones: Map<IdDominio, Pick<Definicion, "clave">>, opciones: Map<IdDominio, Pick<Opcion, "clave">>,
): string {
  const partes = [...atributos.values()]
    .filter((atributo) => atributo.participaIdentidad && valores.has(atributo.id))
    .map((atributo) => {
      const valor = valores.get(atributo.id)!;
      return [definiciones.get(atributo.definicionAtributoId)!.clave, valor.opcionAtributoId ? opciones.get(valor.opcionAtributoId)!.clave : normalizarValor(valor.valor)] as const;
    });
  return serializarIdentidadV2(tipo, familia, clase, partes);
}
