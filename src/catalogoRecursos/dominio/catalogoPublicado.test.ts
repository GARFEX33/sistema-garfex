import { describe, expect, it } from "vitest";
import { canonicalizeCatalog, sha256Hex, type CanonicalCatalog } from "./catalogoPublicado";

const entry = (tipoClave: string, nombre: string): CanonicalCatalog[number] => ({
  tipoClave,
  snapshot: {
    clase: { clave: "CLASE", nombre: "Clase" },
    familia: { clave: "FAMILIA", nombre: "Familia" },
    tipo: { clave: tipoClave, nombre },
    unidadNatural: { clave: "M", nombre: "Metro" },
    atributos: [{
      clave: "COLOR",
      nombre: "Color",
      tipoDato: "OPCION",
      unidad: null,
      participaIdentidad: true,
      aplicabilidad: "REQUIRED",
      orden: 1,
      opciones: [{ clave: "ROJO", nombre: "Rojo" }, { clave: "AZUL", nombre: "Azul" }],
    }],
    reglas: [],
    politicasCompatibilidad: [],
  },
});

describe("canonicalización del catálogo publicado", () => {
  it("ordena de forma estable sin depender del orden de entrada", () => {
    const first = canonicalizeCatalog([entry("B", "B"), entry("A", "A")]);
    const second = canonicalizeCatalog([entry("A", "A"), entry("B", "B")]);
    expect(first).toBe(second);
  });

  it("ignora inserción de propiedades y orden de todas las colecciones", () => {
        const original = entry("A", "A");
        const reordered: CanonicalCatalog[number] = {
          snapshot: {
            politicasCompatibilidad: [], reglas: [],
            atributos: [{ ...original.snapshot.atributos[0], opciones: [...original.snapshot.atributos[0].opciones].reverse() }],
            unidadNatural: { ...original.snapshot.unidadNatural },
            tipo: { ...original.snapshot.tipo }, familia: { ...original.snapshot.familia }, clase: { ...original.snapshot.clase },
          },
          tipoClave: "A",
        };
        expect(canonicalizeCatalog([original])).toBe(canonicalizeCatalog([reordered]));
      });

      it("cambia al modificar aplicabilidad o identidad", () => {
        const original = entry("A", "A");
        const changed = structuredClone(original);
        changed.snapshot.atributos[0].aplicabilidad = "OPTIONAL";
        expect(canonicalizeCatalog([original])).not.toBe(canonicalizeCatalog([changed]));
        changed.snapshot.atributos[0].aplicabilidad = "REQUIRED";
        changed.snapshot.atributos[0].participaIdentidad = false;
        expect(canonicalizeCatalog([original])).not.toBe(canonicalizeCatalog([changed]));
        changed.snapshot.atributos[0].participaIdentidad = true;
        changed.snapshot.atributos[0].opciones[0].clave = "OTRA";
        expect(canonicalizeCatalog([original])).not.toBe(canonicalizeCatalog([changed]));
        changed.snapshot.atributos[0].opciones[0].clave = "ROJO";
        changed.snapshot.atributos[0].unidad = { clave: "M", nombre: "Metro", simbolo: "m" };
        expect(canonicalizeCatalog([original])).not.toBe(canonicalizeCatalog([changed]));
      });

      it("produce el vector SHA-256 conocido", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
