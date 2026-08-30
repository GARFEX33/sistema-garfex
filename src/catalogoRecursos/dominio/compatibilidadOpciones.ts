export type ModoCompatibilidad = "ALLOWLIST" | "DENYLIST";
export type DireccionCompatibilidad = "DIRECTIONAL" | "SYMMETRIC";

export type ParCompatibilidad = {
  origenOpcionClave: string;
  destinoOpcionClave: string;
};

export type PoliticaCompatibilidad = {
  atributoOrigenClave: string;
  atributoDestinoClave: string;
  modo: ModoCompatibilidad;
  direccion: DireccionCompatibilidad;
  pares: ParCompatibilidad[];
};

function coincide(policy: PoliticaCompatibilidad, origin: string, destination: string): boolean {
  return policy.pares.some(pair => pair.origenOpcionClave === origin && pair.destinoOpcionClave === destination)
    || (policy.direccion === "SYMMETRIC" && policy.pares.some(pair => pair.origenOpcionClave === destination && pair.destinoOpcionClave === origin));
}

/** Pure option-pair policy evaluation. Absence of applicable policies is allowed. */
export function evaluarCompatibilidadOpciones(
  policies: readonly PoliticaCompatibilidad[],
  originAttribute: string,
  originOption: string,
  destinationAttribute: string,
  destinationOption: string,
): boolean {
  const applicable = policies.filter(policy =>
    (policy.atributoOrigenClave === originAttribute && policy.atributoDestinoClave === destinationAttribute)
      || (policy.direccion === "SYMMETRIC"
        && policy.atributoOrigenClave === destinationAttribute
        && policy.atributoDestinoClave === originAttribute),
  );
  if (applicable.some(policy => policy.modo === "DENYLIST" && coincide(policy, originOption, destinationOption))) return false;
  return applicable.filter(policy => policy.modo === "ALLOWLIST").every(policy => coincide(policy, originOption, destinationOption));
}

export const esCompatibilidadPermitida = evaluarCompatibilidadOpciones;
