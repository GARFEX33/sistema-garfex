export type ModoCompatibilidad = "ALLOWLIST" | "DENYLIST";
export type DireccionCompatibilidad = "DIRECTIONAL" | "SYMMETRIC";

export type ParCompatibilidad = { origenOpcionClave: string; destinoOpcionClave: string };
export type PoliticaCompatibilidad = {
  atributoOrigenClave: string; atributoDestinoClave: string; modo: ModoCompatibilidad;
  direccion: DireccionCompatibilidad; pares: ParCompatibilidad[]; activo?: boolean;
};
export type SlotCompatibilidad = { atributoOrigenId: string; atributoDestinoId: string; direccion: DireccionCompatibilidad };
export type ParCompatibilidadNormalizado = { origenOpcionId: string; origenOpcion: string; destinoOpcionId: string; destinoOpcion: string };

function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }

export function identidadSlotCompatibilidad(origen: string, destino: string, direccion: DireccionCompatibilidad): string {
  const [left, right] = direccion === "SYMMETRIC" && compare(origen, destino) > 0 ? [destino, origen] : [origen, destino];
  return `${direccion === "SYMMETRIC" ? "S" : "D"}|${left}|${right}`;
}

export function normalizarParCompatibilidad(origenId: string, origenOpcion: string, destinoId: string, destinoOpcion: string, direccion: DireccionCompatibilidad): ParCompatibilidadNormalizado {
  if (direccion === "SYMMETRIC" && compare(origenId, destinoId) > 0) return { origenOpcionId: destinoId, origenOpcion: destinoOpcion, destinoOpcionId: origenId, destinoOpcion: origenOpcion };
  return { origenOpcionId: origenId, origenOpcion, destinoOpcionId: destinoId, destinoOpcion };
}

/** Normalize a relation by endpoint identity, moving each option with its endpoint. */
export function normalizarParPorExtremos(origenExtremoId: string, origenOpcionId: string, destinoExtremoId: string, destinoOpcionId: string, direccion: DireccionCompatibilidad): { origenOpcionId: string; destinoOpcionId: string } {
  if (direccion === "SYMMETRIC" && compare(origenExtremoId, destinoExtremoId) > 0) return { origenOpcionId: destinoOpcionId, destinoOpcionId: origenOpcionId };
  return { origenOpcionId, destinoOpcionId };
}

/** Canonical identity for a relation; symmetric pairs move options with their endpoints. */
export function identidadParCompatibilidad(origenId: string, origenOpcion: string, destinoId: string, destinoOpcion: string, direccion: DireccionCompatibilidad): string {
  const pair = normalizarParCompatibilidad(origenId, origenOpcion, destinoId, destinoOpcion, direccion);
  return `${direccion === "SYMMETRIC" ? "S" : "D"}|${pair.origenOpcionId}|${pair.destinoOpcionId}`;
}

export function identidadParPorExtremos(origenExtremoId: string, origenOpcionId: string, destinoExtremoId: string, destinoOpcionId: string, direccion: DireccionCompatibilidad): string {
  const pair = normalizarParPorExtremos(origenExtremoId, origenOpcionId, destinoExtremoId, destinoOpcionId, direccion);
  return `${direccion === "SYMMETRIC" ? "S" : "D"}|${pair.origenOpcionId}|${pair.destinoOpcionId}`;
}

/** Mode is deliberately absent from slot identity: ALLOWLIST and DENYLIST still conflict. */
export function politicasCompatibilidadEnConflicto(left: SlotCompatibilidad, right: SlotCompatibilidad): boolean {
  if (left.direccion === "DIRECTIONAL" && right.direccion === "DIRECTIONAL") return left.atributoOrigenId === right.atributoOrigenId && left.atributoDestinoId === right.atributoDestinoId;
  if (left.direccion === "SYMMETRIC" && right.direccion === "SYMMETRIC") return identidadSlotCompatibilidad(left.atributoOrigenId, left.atributoDestinoId, "SYMMETRIC") === identidadSlotCompatibilidad(right.atributoOrigenId, right.atributoDestinoId, "SYMMETRIC");
  const directional = left.direccion === "DIRECTIONAL" ? left : right;
  const symmetric = left.direccion === "SYMMETRIC" ? left : right;
  return identidadSlotCompatibilidad(directional.atributoOrigenId, directional.atributoDestinoId, "SYMMETRIC") === identidadSlotCompatibilidad(symmetric.atributoOrigenId, symmetric.atributoDestinoId, "SYMMETRIC");
}

function coincide(policy: PoliticaCompatibilidad, origin: string, destination: string): boolean {
  return policy.pares.some(pair => pair.origenOpcionClave === origin && pair.destinoOpcionClave === destination)
    || (policy.direccion === "SYMMETRIC" && policy.pares.some(pair => pair.origenOpcionClave === destination && pair.destinoOpcionClave === origin));
}

/** Pure option-pair policy evaluation. Absence of applicable policies is allowed. */
export function evaluarCompatibilidadOpciones(
  policies: readonly PoliticaCompatibilidad[], originAttribute: string, originOption: string,
  destinationAttribute: string, destinationOption: string,
): boolean {
  const applicable = policies.filter(policy => policy.activo !== false && (
    (policy.atributoOrigenClave === originAttribute && policy.atributoDestinoClave === destinationAttribute)
      || (policy.direccion === "SYMMETRIC" && policy.atributoOrigenClave === destinationAttribute && policy.atributoDestinoClave === originAttribute)
  ));
  if (applicable.some(policy => policy.modo === "DENYLIST" && coincide(policy, originOption, destinationOption))) return false;
  return applicable.filter(policy => policy.modo === "ALLOWLIST").every(policy => policy.pares.length > 0 && coincide(policy, originOption, destinationOption));
}

export const esCompatibilidadPermitida = evaluarCompatibilidadOpciones;
