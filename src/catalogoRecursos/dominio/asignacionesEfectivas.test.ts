import { describe, expect, it } from "vitest";
import { proyectarAsignacionesEfectivas, proyectarIdentidad, resolverAsignaciones, validarCompletitudAsignaciones } from "./asignacionesEfectivas";

type A = { id: string; familiaId: string; tipoId?: string; definicionId: string; definicionClave: string; tipoDato?: "TEXTO" | "NUMERO" | "BOOLEANO" | "OPCION"; activo: boolean; aplicabilidad: "REQUIRED" | "OPTIONAL" | "CONDITIONAL" | "FORBIDDEN" | "NOT_APPLICABLE"; participaIdentidad: boolean; orden: number };
const row = (id: string, extra: Partial<A> = {}): A => ({ id, familiaId: "f", definicionId: id, definicionClave: id, activo: true, aplicabilidad: "OPTIONAL", participaIdentidad: true, orden: 1, ...extra });

describe("asignaciones efectivas", () => {
  it("selects Type before applicability and suppresses an inactive override", () => {
    const family = row("d", { aplicabilidad: "REQUIRED" });
    const override = row("t", { tipoId: "t", definicionId: "d", definicionClave: "d", activo: false });
    expect(resolverAsignaciones({ familia: [family], tipo: [override], familiaId: "f", tipoId: "t" })).toMatchObject({ selected: [], shadowed: [family], suppressed: [override] });
  });

  it("requires an active option set for effective OPCION assignments", () => {
    const optionAssignment = row("option", { tipoDato: "OPCION" });
    expect(validarCompletitudAsignaciones([optionAssignment], [])).toEqual(["option"]);
    expect(validarCompletitudAsignaciones([optionAssignment], [{ id: "o", definicionId: "option", activo: true }])).toEqual([]);
  });

  it("excludes non-identity assignments while preserving false presence", () => {
    const rows = [row("identity"), row("not-identity", { participaIdentidad: false })];
    expect(proyectarIdentidad(rows, new Map<string, unknown>([["identity", false], ["not-identity", "x"]]))).toMatchObject([{ id: "identity", value: false }]);
  });

  it("omits forbidden values and orders ties by definition key then assignment id", () => {
    const rows = [row("z", { definicionClave: "B", orden: 2 }), row("a", { definicionClave: "A", orden: 2 }), row("forbidden", { definicionClave: "C", aplicabilidad: "FORBIDDEN" })];
    const projected = proyectarAsignacionesEfectivas(rows, new Map<string, unknown>([["forbidden", "present"], ["z", false], ["a", 0]]));
    expect(projected.map(item => item.id)).toEqual(["a", "z"]);
    expect(projected.find(item => item.id === "a")?.value).toBe(0);
  });
});
