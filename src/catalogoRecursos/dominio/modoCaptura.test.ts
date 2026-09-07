import { describe, expect, it } from "vitest";
import { resolverModoCaptura } from "./modoCaptura";

describe("resolverModoCaptura", () => {
  it("interpreta definiciones OPCION sin modo almacenado como SELECCION", () => {
    expect(resolverModoCaptura({ tipoDato: "OPCION" })).toBe("SELECCION");
  });

  it("uses an explicit mode and treats every other legacy data type as LIBRE", () => {
    expect(resolverModoCaptura({ tipoDato: "TEXTO" })).toBe("LIBRE");
    expect(resolverModoCaptura({ tipoDato: "NUMERO" })).toBe("LIBRE");
    expect(resolverModoCaptura({ tipoDato: "BOOLEANO" })).toBe("LIBRE");
    expect(resolverModoCaptura({ tipoDato: "OPCION", modoCaptura: "LIBRE" })).toBe("LIBRE");
  });
});
