export type CanonicalOption = {
  clave: string;
  nombre: string;
  descripcion?: string;
};

export type CanonicalAttribute = {
  clave: string;
  nombre: string;
  descripcion?: string;
  tipoDato: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION";
  unidad: { clave: string; nombre: string; simbolo: string | null } | null;
  participaIdentidad: boolean;
  aplicabilidad: "REQUIRED" | "OPTIONAL" | "CONDITIONAL" | "FORBIDDEN" | "NOT_APPLICABLE";
  orden: number;
  opciones: CanonicalOption[];
};

export type CanonicalRule = {
  atributoCondicionClave: string;
  opcionCondicionClave?: string;
  atributoAfectadoClave: string;
  aplicabilidad: CanonicalAttribute["aplicabilidad"];
};

export type CanonicalPresentationToken =
      | { tipo: "TYPE_NAME" }
      | { tipo: "ATTRIBUTE_VALUE"; atributoClave: string }
      | { tipo: "LITERAL"; texto: string };
    export type CanonicalPresentationPolicy = { tipoNombre: string; tokens: CanonicalPresentationToken[]; separador: string };

    export type CanonicalCompatibilityPolicy = {
  atributoOrigenClave: string;
  atributoDestinoClave: string;
  modo: "ALLOWLIST" | "DENYLIST";
  direccion: "DIRECTIONAL" | "SYMMETRIC";
  pares: Array<{ origenOpcionClave: string; destinoOpcionClave: string }>;
};

export type CanonicalSnapshot = {
  clase: { clave: string; nombre: string; descripcion?: string };
  familia: { clave: string; nombre: string; descripcion?: string };
  tipo: { clave: string; nombre: string; descripcion?: string };
  unidadNatural: { clave: string; nombre: string; descripcion?: string; simbolo?: string };
  atributos: CanonicalAttribute[];
  reglas: CanonicalRule[];
  politicasCompatibilidad: CanonicalCompatibilityPolicy[];
      presentacionCanonica?: CanonicalPresentationPolicy;
    };

export type CanonicalCatalog = Array<{ tipoClave: string; snapshot: CanonicalSnapshot }>;

function compareCodePoints(left: string | undefined, right: string | undefined): number {
  const leftPoints = Array.from(left ?? "").map(character => character.codePointAt(0)!);
  const rightPoints = Array.from(right ?? "").map(character => character.codePointAt(0)!);
  for (let index = 0; index < Math.min(leftPoints.length, rightPoints.length); index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** JSON serialization with sorted object keys, independent of insertion order or locale. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  const object = value;
  const entries = Object.keys(object)
    .filter(key => object[key] !== undefined)
    .sort(compareCodePoints)
    .map(key => `${JSON.stringify(key)}:${stableStringify(object[key])}`);
  return `{${entries.join(",")}}`;
}

function compareOption(left: CanonicalOption, right: CanonicalOption): number {
  return compareCodePoints(left.clave, right.clave) || compareCodePoints(stableStringify(left), stableStringify(right));
}

function compareAttribute(left: CanonicalAttribute, right: CanonicalAttribute): number {
  return left.orden - right.orden || compareCodePoints(stableStringify(left), stableStringify(right));
}

function compareRule(left: CanonicalRule, right: CanonicalRule): number {
  return compareCodePoints(stableStringify(left), stableStringify(right));
}

function canonicalSnapshot(snapshot: CanonicalSnapshot): CanonicalSnapshot {
  return {
    clase: snapshot.clase,
    familia: snapshot.familia,
    tipo: snapshot.tipo,
    unidadNatural: snapshot.unidadNatural,
    atributos: snapshot.atributos
      .map(attribute => ({ ...attribute, opciones: [...attribute.opciones].sort(compareOption) }))
      .sort(compareAttribute),
    reglas: [...snapshot.reglas].sort(compareRule),
    ...(snapshot.presentacionCanonica ? { presentacionCanonica: snapshot.presentacionCanonica } : {}),
        politicasCompatibilidad: snapshot.politicasCompatibilidad
      .map(policy => ({ ...policy, pares: [...policy.pares].sort((left, right) => compareCodePoints(stableStringify(left), stableStringify(right))) }))
      .sort((left, right) => compareCodePoints(stableStringify(left), stableStringify(right))),
  };
}

export function canonicalizeCatalog(catalog: CanonicalCatalog): string {
  const ordered = [...catalog]
    .map(entry => ({ tipoClave: entry.tipoClave, snapshot: canonicalSnapshot(entry.snapshot) }))
    .sort((left, right) => {
      const typeOrder = compareCodePoints(left.tipoClave, right.tipoClave);
      if (typeOrder !== 0) return typeOrder;
      const familyOrder = compareCodePoints(left.snapshot.familia.clave, right.snapshot.familia.clave);
      if (familyOrder !== 0) return familyOrder;
      const classOrder = compareCodePoints(left.snapshot.clase.clave, right.snapshot.clase.clave);
      if (classOrder !== 0) return classOrder;
      return compareCodePoints(stableStringify(left), stableStringify(right));
    });
  return stableStringify(ordered);
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
