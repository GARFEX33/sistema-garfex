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

      it("preserva el orden semántico de tokens y excluye identidad de almacenamiento", () => {
        const first = entry("A", "A");
        first.snapshot.presentacionCanonica = { tipoNombre: "A", separador: "-", tokens: [{ tipo: "TYPE_NAME" }, { tipo: "LITERAL", texto: "x" }] };
        const second = structuredClone(first);
        second.snapshot.presentacionCanonica!.tokens.reverse();
        expect(canonicalizeCatalog([first])).not.toBe(canonicalizeCatalog([second]));
        const historical = structuredClone(first) as typeof first & { revision?: number; id?: string; creadoEn?: number };
        historical.revision = 4; historical.id = "storage-id"; historical.creadoEn = 123;
        expect(canonicalizeCatalog([first])).toBe(canonicalizeCatalog([historical]));
      });

      it("canonicaliza el grafo de selección v2 sin IDs de almacenamiento", () => {
    const published = entry("A", "A") as CanonicalCatalog[number] & { snapshot: Record<string, unknown> };
    published.snapshot.snapshotVersion = 2;
    published.snapshot.selectionGraph = {
      politicasUnidad: [{ unidadClave: "M", principal: true }],
      atributos: [{
        atributoClave: "COLOR", modoCaptura: "SELECCION", tipoDato: "OPCION",
        valoresPermitidos: [
          { clave: "AZUL", nombre: "Azul", orden: 1, valor: { kind: "OPCION", opcionAtributoId: "storage-a" }, opcionClave: "AZUL" },
          { clave: "ROJO", nombre: "Rojo", orden: 1, valor: { kind: "OPCION", opcionAtributoId: "storage-b" }, opcionClave: "ROJO" },
        ],
      }],
      reglas: [{ atributoCondicionClave: "COLOR", valorPermitidoCondicionClave: "AZUL", atributoAfectadoClave: "COLOR", aplicabilidad: "OPTIONAL" }],
    };
    const reordered = structuredClone(published);
    const values = (reordered.snapshot.selectionGraph as { atributos: Array<{ valoresPermitidos: Array<{ valor: { opcionAtributoId: string } }> }> }).atributos[0].valoresPermitidos;
    values.reverse(); values[0].valor.opcionAtributoId = "other-storage-id";
    expect(canonicalizeCatalog([published as CanonicalCatalog[number]])).toBe(canonicalizeCatalog([reordered as CanonicalCatalog[number]]));
    (values[0].valor as { opcionAtributoId: string }).opcionAtributoId = "semantic-change";
    (reordered.snapshot.selectionGraph as { atributos: Array<{ valoresPermitidos: Array<{ opcionClave: string }> }> }).atributos[0].valoresPermitidos[0].opcionClave = "VERDE";
    const canonical = canonicalizeCatalog([published as CanonicalCatalog[number]]);
    expect(canonical).not.toBe(canonicalizeCatalog([reordered as CanonicalCatalog[number]]));
    const changes: Array<(graph: any) => void> = [
      graph => { graph.atributos[0].modoCaptura = "LIBRE"; },
      graph => { graph.atributos[0].valoresPermitidos[0].valor = { kind: "TEXTO", value: "azul" }; },
      graph => { graph.reglas[0].aplicabilidad = "REQUIRED"; },
      graph => { graph.politicasUnidad[0].unidadClave = "CM"; },
    ];
    for (const change of changes) {
      const semantic = structuredClone(published);
      change(semantic.snapshot.selectionGraph);
      expect(canonicalizeCatalog([semantic as CanonicalCatalog[number]])).not.toBe(canonical);
    }
  });

  it("canonicaliza todas las políticas de Unidad efectivas sin IDs de almacenamiento", () => {
    const published = entry("A", "A") as CanonicalCatalog[number] & { snapshot: Record<string, unknown> };
    published.snapshot.snapshotVersion = 2;
    published.snapshot.selectionGraph = {
      politicasUnidad: [
        { unidadClave: "M", principal: true },
        { unidadClave: "CM", principal: false },
      ],
      atributos: [],
      reglas: [],
    };
    const reordered = structuredClone(published);
    (reordered.snapshot.selectionGraph as { politicasUnidad: unknown[] }).politicasUnidad.reverse();
    expect(canonicalizeCatalog([published as CanonicalCatalog[number]])).toBe(canonicalizeCatalog([reordered as CanonicalCatalog[number]]));

    const withoutNonPrincipal = structuredClone(published);
    (withoutNonPrincipal.snapshot.selectionGraph as { politicasUnidad: unknown[] }).politicasUnidad.pop();
    expect(canonicalizeCatalog([published as CanonicalCatalog[number]])).not.toBe(canonicalizeCatalog([withoutNonPrincipal as CanonicalCatalog[number]]));

    const withAdditionalNonPrincipal = structuredClone(published);
    (withAdditionalNonPrincipal.snapshot.selectionGraph as { politicasUnidad: Array<{ unidadClave: string; principal: boolean }> }).politicasUnidad.push({ unidadClave: "KM", principal: false });
    expect(canonicalizeCatalog([published as CanonicalCatalog[number]])).not.toBe(canonicalizeCatalog([withAdditionalNonPrincipal as CanonicalCatalog[number]]));

    const changedNonPrincipal = structuredClone(published);
    (changedNonPrincipal.snapshot.selectionGraph as { politicasUnidad: Array<{ unidadClave: string; principal: boolean }> }).politicasUnidad[1] = { unidadClave: "KM", principal: false };
    expect(canonicalizeCatalog([published as CanonicalCatalog[number]])).not.toBe(canonicalizeCatalog([changedNonPrincipal as CanonicalCatalog[number]]));
  });

  it("produce el vector SHA-256 conocido", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
