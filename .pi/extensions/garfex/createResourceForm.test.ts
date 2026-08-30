import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createResourceDataSource, loadProjectEnv } from "./convexClient";
import {
  buildAttributeDisplayLabel,
  buildCreateResourceArgs,
  parseResourceValue,
} from "./createResourceForm";
import type { ApplicableAttributes, CreateResourceArgs } from "./types";
import { fakeId } from "./testFixtures";

// These arbitrary strings stand in for Convex-branded IDs in this adapter-only test.
const args = {
  claseRecursoId: fakeId<"clasesRecurso">("c1"),
  familiaRecursoId: fakeId<"familiasRecurso">("f1"),
  tipoRecursoId: fakeId<"tiposRecurso">("t1"),
  unidadId: fakeId<"unidades">("u1"),
  nombre: "Bomba",
  descripcion: "demo",
  valores: [
    { atributoRecursoId: fakeId<"atributosRecurso">("a1"), valor: 12.5, opcionAtributoId: fakeId<"opcionesAtributo">("o1") },
  ],
} as CreateResourceArgs;

describe("create resource adapter", () => {
  it("loads project .env files with .env.local precedence", () => {
    const cwd = mkdtempSync(join(tmpdir(), "garfex-env-"));
    try {
      writeFileSync(join(cwd, ".env"), "GARFEX_TEST_SENTINEL=base\n");
      writeFileSync(join(cwd, ".env.local"), "GARFEX_TEST_SENTINEL=local\nCONVEX_URL=http://127.0.0.1:3210\n");
      const loaded = loadProjectEnv(cwd);
      expect(loaded.GARFEX_TEST_SENTINEL).toBe("local");
      expect(loaded.CONVEX_URL).toBe(process.env.CONVEX_URL ?? "http://127.0.0.1:3210");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("uses the generated references and exact arguments for catalog and creation calls", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const mutation = vi.fn().mockResolvedValue(args);
    const source = createResourceDataSource({ GARFEX_CONVEX_URL: "https://example" }, () => ({ query, mutation }));
    await source.consultarClases();
    await source.consultarFamiliasDeClase({ claseRecursoId: fakeId<"clasesRecurso">("c1") });
    await source.consultarTiposDeFamilia({ familiaRecursoId: fakeId<"familiasRecurso">("f1") });
    await source.consultarUnidadesValidas({ familiaRecursoId: fakeId<"familiasRecurso">("f1"), tipoRecursoId: fakeId<"tiposRecurso">("t1") });
    await source.consultarAtributosAplicables({ familiaRecursoId: fakeId<"familiasRecurso">("f1") });
    await source.consultarOpcionesPermitidas({ definicionAtributoId: fakeId<"definicionesAtributo">("d1") });
    await source.crearRecurso(args);
    expect(query).toHaveBeenNthCalledWith(1, api.catalogoRecursos.catalogo.consultarClases, {});
    expect(query).toHaveBeenNthCalledWith(2, api.catalogoRecursos.catalogo.consultarFamiliasDeClase, { claseRecursoId: fakeId<"clasesRecurso">("c1") });
    expect(query).toHaveBeenNthCalledWith(3, api.catalogoRecursos.catalogo.consultarTiposDeFamilia, { familiaRecursoId: fakeId<"familiasRecurso">("f1") });
    expect(query).toHaveBeenNthCalledWith(4, api.catalogoRecursos.catalogo.consultarUnidadesValidas, { familiaRecursoId: fakeId<"familiasRecurso">("f1"), tipoRecursoId: fakeId<"tiposRecurso">("t1") });
    expect(query).toHaveBeenNthCalledWith(5, api.catalogoRecursos.catalogo.consultarAtributosAplicables, { familiaRecursoId: fakeId<"familiasRecurso">("f1") });
    expect(query).toHaveBeenNthCalledWith(6, api.catalogoRecursos.catalogo.consultarOpcionesPermitidas, { definicionAtributoId: fakeId<"definicionesAtributo">("d1") });
    expect(mutation).toHaveBeenCalledWith(api.catalogoRecursos.recursos.crearRecurso, args);
  });

  it("parses text, finite numbers, and booleans without business validation", () => {
    expect(parseResourceValue("TEXTO", "  texto ")).toBe("  texto ");
    expect(parseResourceValue("NUMERO", "12.5")).toBe(12.5);
    expect(parseResourceValue("BOOLEANO", "true")).toBe(true);
    expect(() => parseResourceValue("NUMERO", "Infinity")).toThrow("Número inválido");
    expect(() => parseResourceValue("BOOLEANO", "sí")).toThrow("Booleano inválido");
  });

  it("builds labels and final transport args without adding validation", () => {
    expect(buildAttributeDisplayLabel({
          nombre: "Peso",
          aplicabilidad: "OPTIONAL",
          // Test-only cast for the Convex-branded unit ID.
          unidad: { id: fakeId<"unidades">("u1"), clave: "UN", nombre: "Unidad", simbolo: "u" } as NonNullable<ApplicableAttributes[number]["unidad"]>,
        }))
      .toBe("Peso (OPTIONAL, u)");
    expect(buildCreateResourceArgs(args)).toEqual(args);
  });
});
