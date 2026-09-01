export type TokenPresentacionCanonica =
  | { tipo: "TYPE_NAME" }
  | { tipo: "ATTRIBUTE_VALUE"; atributoClave: string }
  | { tipo: "LITERAL"; texto: string };

export type PoliticaPresentacionCanonica = {
  tipoNombre: string;
  tokens: TokenPresentacionCanonica[];
  separador: string;
};

export type ValorPresentacion = {
  tipoDato?: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
  valor: string | number | boolean;
  opcionNombre?: string;
  unidad?: string;
};

export type ResultadoPresentacion = { ok: true; nombre: string } | { ok: false; error: "NOMBRE_VACIO" | "POLITICA_INVALIDA" };

// Los literales son declarativos e independientes: siempre se renderizan. Solo
// los tokens de atributo se omiten cuando no tienen valor; después se colapsan
// los separadores de forma determinista.

function normalize(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

export function renderizarPresentacionCanonica(
  politica: PoliticaPresentacionCanonica,
  valores: ReadonlyMap<string, ValorPresentacion | string | number | boolean>,
): ResultadoPresentacion {
  const separator = normalize(politica.separador);
  if (!separator || !normalize(politica.tipoNombre) || politica.tokens.length === 0) return { ok: false, error: "POLITICA_INVALIDA" };
  const partes: string[] = [];
  for (const token of politica.tokens) {
    let text: string | undefined;
    if (token.tipo === "TYPE_NAME") text = politica.tipoNombre;
    else if (token.tipo === "LITERAL") text = token.texto;
    else {
      const raw = valores.get(token.atributoClave);
      if (raw === undefined) continue;
      if (typeof raw === "object") {
        text = raw.tipoDato === "OPCION" ? (raw.opcionNombre ?? String(raw.valor)) : String(raw.valor);
        if (raw.unidad) text = `${text} ${raw.unidad}`;
      } else text = String(raw);
    }
    const normalized = normalize(text ?? "");
    if (normalized) partes.push(normalized);
  }
  const nombre = normalize(partes.join(` ${separator} `));
  return nombre ? { ok: true, nombre } : { ok: false, error: "NOMBRE_VACIO" };
}

export const renderizarNombreCanonico = renderizarPresentacionCanonica;
