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
export type ErrorEstructuraPresentacion = "TOKENS_VACIOS" | "TOKENS_EXCESIVOS" | "SEPARADOR_INVALIDO" | "LITERAL_INVALIDO" | "SIN_CONTENIDO_ESTRUCTURAL";

export const MAX_TOKENS_PRESENTACION = 100;
export const MAX_LITERAL_PRESENTACION = 1000;
export const MAX_SEPARADOR_PRESENTACION = 100;

/** The same normalization is used for policy storage and for rendered parts. */
export function normalizarTextoPresentacion(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

export function normalizarPoliticaPresentacion(politica: PoliticaPresentacionCanonica): PoliticaPresentacionCanonica {
  return {
    ...politica,
    separador: normalizarTextoPresentacion(politica.separador),
    tokens: politica.tokens.map(token => token.tipo === "LITERAL" ? { ...token, texto: normalizarTextoPresentacion(token.texto) } : { ...token }),
  };
}

/** Structural validation intentionally does not sort or otherwise reorder tokens. */
export function validarEstructuraPresentacion(politica: Pick<PoliticaPresentacionCanonica, "tokens" | "separador">): ErrorEstructuraPresentacion | null {
  if (politica.tokens.length === 0) return "TOKENS_VACIOS";
  if (politica.tokens.length > MAX_TOKENS_PRESENTACION) return "TOKENS_EXCESIVOS";
  const separator = normalizarTextoPresentacion(politica.separador);
  if (!separator || separator.length > MAX_SEPARADOR_PRESENTACION) return "SEPARADOR_INVALIDO";
  let structural = false;
  for (const token of politica.tokens) {
    if (token.tipo === "TYPE_NAME") structural = true;
    if (token.tipo === "LITERAL") {
      const literal = normalizarTextoPresentacion(token.texto);
      if (!literal || literal.length > MAX_LITERAL_PRESENTACION) return "LITERAL_INVALIDO";
      structural = true;
    }
  }
  return structural ? null : "SIN_CONTENIDO_ESTRUCTURAL";
}

export function renderizarPresentacionCanonica(
  politica: PoliticaPresentacionCanonica,
  valores: ReadonlyMap<string, ValorPresentacion | string | number | boolean>,
): ResultadoPresentacion {
  const normalizedPolicy = normalizarPoliticaPresentacion(politica);
  const structure = validarEstructuraPresentacion(normalizedPolicy);
  if (!normalizarTextoPresentacion(normalizedPolicy.tipoNombre) || (structure && structure !== "SIN_CONTENIDO_ESTRUCTURAL")) return { ok: false, error: "POLITICA_INVALIDA" };
  const partes: string[] = [];
  for (const token of normalizedPolicy.tokens) {
    let text: string | undefined;
    if (token.tipo === "TYPE_NAME") text = normalizedPolicy.tipoNombre;
    else if (token.tipo === "LITERAL") text = token.texto;
    else {
      const raw = valores.get(token.atributoClave);
      if (raw === undefined) continue;
      if (typeof raw === "object" && raw !== null) {
        text = raw.tipoDato === "OPCION" ? (raw.opcionNombre ?? String(raw.valor)) : String(raw.valor);
        if (raw.unidad) text = `${text} ${raw.unidad}`;
      } else text = String(raw);
    }
    const normalized = normalizarTextoPresentacion(text ?? "");
    if (normalized) partes.push(normalized);
  }
  const nombre = normalizarTextoPresentacion(partes.join(` ${normalizedPolicy.separador} `));
  return nombre ? { ok: true, nombre } : { ok: false, error: "NOMBRE_VACIO" };
}

export const renderizarNombreCanonico = renderizarPresentacionCanonica;
