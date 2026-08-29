export type IdDominio = string;

export type Valor = string | number | boolean;

export type ValorEntrada = {
  atributoRecursoId: IdDominio;
  valor: Valor;
  opcionAtributoId?: IdDominio;
};

export type EntradaRecurso = {
  claseRecursoId: IdDominio;
  familiaRecursoId: IdDominio;
  tipoRecursoId: IdDominio;
  unidadId: IdDominio;
  valores: ValorEntrada[];
};

export type Aplicabilidad = "REQUIRED" | "OPTIONAL" | "CONDITIONAL" | "FORBIDDEN" | "NOT_APPLICABLE";
export type TipoDato = "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";

export type ElementoCatalogo = { id: IdDominio; activo: boolean };
export type Clase = ElementoCatalogo & { clave: string };
export type Familia = ElementoCatalogo & { clave: string; claseRecursoId: IdDominio };
export type Tipo = ElementoCatalogo & { clave: string; familiaRecursoId: IdDominio };
export type Unidad = ElementoCatalogo;

export type PoliticaUnidad = ElementoCatalogo & {
  familiaRecursoId: IdDominio;
  tipoRecursoId?: IdDominio;
  unidadId: IdDominio;
};

export type Definicion = ElementoCatalogo & { clave: string; tipoDato: TipoDato };
export type Atributo = ElementoCatalogo & {
  definicionAtributoId: IdDominio;
  tipoRecursoId?: IdDominio;
  aplicabilidad: Aplicabilidad;
  participaIdentidad: boolean;
};
export type AtributoConDefinicion = Atributo & { definicion: Definicion | null };
export type Opcion = ElementoCatalogo & { definicionAtributoId: IdDominio; clave: string };
export type Regla = ElementoCatalogo & {
  atributoCondicionId: IdDominio;
  opcionCondicionId?: IdDominio;
  atributoAfectadoId: IdDominio;
  aplicabilidad: Aplicabilidad;
};

export type CatalogoSnapshot = {
  clase: Clase | null;
  familia: Familia | null;
  tipo: Tipo | null;
  unidad: Unidad | null;
  politicas: PoliticaUnidad[];
  atributos: AtributoConDefinicion[];
  reglas: Regla[];
  opciones: Opcion[];
};

export type FalloValidacion =
  | "JERARQUIA_O_UNIDAD_INEXISTENTE_INACTIVA"
  | "JERARQUIA_INVALIDA"
  | "UNIDAD_NO_PERMITIDA"
  | "ATRIBUTO_REPETIDO"
  | "ATRIBUTO_NO_APLICABLE"
  | "ATRIBUTO_REQUERIDO_AUSENTE"
  | "NUMERO_NO_FINITO"
  | "ATRIBUTO_PROHIBIDO"
  | "DEFINICION_INEXISTENTE"
  | "TIPO_DE_VALOR_INVALIDO"
  | "OPCION_INVALIDA";

export type ResultadoValidacion = {
  atributos: Map<IdDominio, Atributo & { definicion: Definicion }>;
  valores: Map<IdDominio, ValorEntrada>;
  aplicabilidad: Map<IdDominio, Aplicabilidad>;
};

export type ResultadoDominio =
  | { ok: true; value: ResultadoValidacion }
  | { ok: false; code: FalloValidacion };
