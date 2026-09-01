import { describe, expect, it, vi } from "vitest";
import { fakeId } from "./testFixtures";
import { runCreateResourceWizard, type ResourceWizardUi } from "./createResourceWizard";
import type { ResourceCreationDataSource } from "./types";


const ids = {
  clase: fakeId<"clasesRecurso">("c1"),
  familia: fakeId<"familiasRecurso">("f1"),
  tipo: fakeId<"tiposRecurso">("t1"),
  unidad: fakeId<"unidades">("u1"),
  atributo: fakeId<"atributosRecurso">("a1"),
  definicion: fakeId<"definicionesAtributo">("d1"),
  opcion: fakeId<"opcionesAtributo">("o1"),
};

function source(): ResourceCreationDataSource {
  return {
    consultarClases: vi.fn().mockResolvedValue([{ id: ids.clase, clave: "EQ", nombre: "Equipo", descripcion: undefined }]),
    consultarFamiliasDeClase: vi.fn().mockResolvedValue([{ id: ids.familia, claseRecursoId: ids.clase, clave: "BO", nombre: "Bomba", descripcion: undefined }]),
    consultarTiposDeFamilia: vi.fn().mockResolvedValue([{ id: ids.tipo, familiaRecursoId: ids.familia, clave: "CE", nombre: "Centrífuga", descripcion: undefined }]),
    consultarUnidadesValidas: vi.fn().mockResolvedValue([{ id: ids.unidad, clave: "UN", nombre: "Unidad", simbolo: "u", principal: true, descripcion: undefined }]),
    consultarAtributosAplicables: vi.fn().mockResolvedValue([
      { id: ids.atributo, definicionAtributoId: ids.definicion, clave: "PESO", nombre: "Peso", tipoDato: "NUMERO", aplicabilidad: "REQUIRED", orden: 1, descripcion: undefined, unidadId: ids.unidad, unidad: { id: ids.unidad, clave: "UN", nombre: "Unidad", simbolo: "u" }, participaIdentidad: false },
      { id: fakeId<"atributosRecurso">("a2"), definicionAtributoId: fakeId<"definicionesAtributo">("d2"), clave: "ACTIVO", nombre: "Activo", tipoDato: "BOOLEANO", aplicabilidad: "OPTIONAL", orden: 2, descripcion: undefined, unidadId: undefined, unidad: null, participaIdentidad: false },
    ]),
    consultarOpcionesPermitidas: vi.fn().mockResolvedValue([{ id: ids.opcion, definicionAtributoId: ids.definicion, clave: "ROJO", nombre: "Rojo", descripcion: undefined }]),
    crearRecurso: vi.fn().mockResolvedValue({ identificadorTecnico: "EQ-1", revision: 1, activo: true }),
  };
}

function ui(selects: Array<string | undefined>, inputs: Array<string | undefined>, confirms: boolean[] = [true]): ResourceWizardUi {
  return {
    select: vi.fn().mockImplementation(async () => selects.shift()),
    input: vi.fn().mockImplementation(async () => inputs.shift()),
    confirm: vi.fn().mockImplementation(async () => confirms.shift() ?? true),
    notify: vi.fn(),
  };
}

const path = ["EQ — Equipo", "BO — Bomba", "CE — Centrífuga", "UN — Unidad"];

describe("create resource wizard", () => {
  it("collects exact option clave and branded id, then mutates after confirmation", async () => {
    const data = source();
    const optionAttribute = vi.mocked(data.consultarAtributosAplicables).mockResolvedValueOnce([
      { id: ids.atributo, definicionAtributoId: ids.definicion, clave: "COLOR", nombre: "Color", tipoDato: "OPCION", aplicabilidad: "REQUIRED", orden: 1, descripcion: undefined, unidadId: undefined, unidad: null, participaIdentidad: false },
    ]);
    void optionAttribute;
    const result = await runCreateResourceWizard(ui([...path, "ROJO — Rojo"], ["Bomba 1", "Descripción"]), data);
    expect(result.kind).toBe("created");
    expect(data.consultarOpcionesPermitidas).toHaveBeenCalledWith({ definicionAtributoId: ids.definicion });
    expect(data.crearRecurso).toHaveBeenCalledWith(expect.objectContaining({ claseRecursoId: ids.clase, familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo, unidadId: ids.unidad, valores: [{ atributoRecursoId: ids.atributo, valor: "ROJO", opcionAtributoId: ids.opcion }] }));
  });

  it("retries invalid numbers and skips an optional boolean", async () => {
    const data = source();
    const view = ui([...path], ["Bomba", "", "no", "12.5"], [false, true]);
    const result = await runCreateResourceWizard(view, data);
    expect(result.kind).toBe("created");
    expect(data.crearRecurso).toHaveBeenCalledWith(expect.objectContaining({ valores: [{ atributoRecursoId: ids.atributo, valor: 12.5 }] }));
    expect(view.notify).toHaveBeenCalledWith("Número inválido", "warning");
  });

  it("cancels required capture without mutation", async () => {
    const data = source();
    const result = await runCreateResourceWizard(ui([...path], ["Bomba", "", undefined]), data);
    expect(result.kind).toBe("cancelled");
    expect(data.crearRecurso).not.toHaveBeenCalled();
  });

  it("returns cancelled when confirmation is declined", async () => {
    const data = source();
    const result = await runCreateResourceWizard(ui([...path], ["Bomba", "", "1"], [true, false]), data);
    expect(result.kind).toBe("cancelled");
    expect(data.crearRecurso).not.toHaveBeenCalled();
  });

  it("reports empty catalog, option/query failures, and mutation failure", async () => {
    const empty = source();
    vi.mocked(empty.consultarClases).mockResolvedValue([]);
    expect((await runCreateResourceWizard(ui([], []), empty)).kind).toBe("failed");

    const optionFailure = source();
    vi.mocked(optionFailure.consultarAtributosAplicables).mockResolvedValue([{ id: ids.atributo, definicionAtributoId: ids.definicion, clave: "COLOR", nombre: "Color", tipoDato: "OPCION", aplicabilidad: "REQUIRED", orden: 1, descripcion: undefined, unidadId: undefined, unidad: null, participaIdentidad: false }]);
    vi.mocked(optionFailure.consultarOpcionesPermitidas).mockRejectedValue(new Error("consulta"));
    expect((await runCreateResourceWizard(ui([...path], ["Bomba", ""]), optionFailure)).kind).toBe("failed");

    const mutationFailure = source();
    vi.mocked(mutationFailure.crearRecurso).mockRejectedValue(new Error("duplicado"));
    const failed = await runCreateResourceWizard(ui([...path, "Sí"], ["Bomba", "", "1"]), mutationFailure);
    expect(failed.kind).toBe("failed");
  });

  it("captures text and booleans while omitting optional and conditional attributes", async () => {
    const data = source();
    vi.mocked(data.consultarAtributosAplicables).mockResolvedValueOnce([
      { id: ids.atributo, definicionAtributoId: ids.definicion, clave: "DESC", nombre: "Detalle", tipoDato: "TEXTO", aplicabilidad: "REQUIRED", orden: 1, descripcion: undefined, unidadId: undefined, unidad: null, participaIdentidad: false },
      { id: fakeId<"atributosRecurso">("a2"), definicionAtributoId: ids.definicion, clave: "ACTIVO", nombre: "Activo", tipoDato: "BOOLEANO", aplicabilidad: "REQUIRED", orden: 2, descripcion: undefined, unidadId: undefined, unidad: null, participaIdentidad: false },
      { id: fakeId<"atributosRecurso">("a3"), definicionAtributoId: ids.definicion, clave: "OPC", nombre: "Opcional", tipoDato: "TEXTO", aplicabilidad: "OPTIONAL", orden: 3, descripcion: undefined, unidadId: undefined, unidad: null, participaIdentidad: false },
      { id: fakeId<"atributosRecurso">("a4"), definicionAtributoId: ids.definicion, clave: "COND", nombre: "Condicional", tipoDato: "TEXTO", aplicabilidad: "CONDITIONAL", orden: 4, descripcion: undefined, unidadId: undefined, unidad: null, participaIdentidad: false },
    ]);
    const view = ui([...path, "Sí"], ["Bomba", "Descripción", "detalle capturado"], [false, false, true]);
    const result = await runCreateResourceWizard(view, data);
    expect(result.kind).toBe("created");
    expect(data.crearRecurso).toHaveBeenCalledWith(expect.objectContaining({ valores: [
      { atributoRecursoId: ids.atributo, valor: "detalle capturado" },
      { atributoRecursoId: fakeId<"atributosRecurso">("a2"), valor: true },
    ] }));
    expect(data.consultarFamiliasDeClase).toHaveBeenCalledWith({ claseRecursoId: ids.clase });
    expect(data.consultarTiposDeFamilia).toHaveBeenCalledWith({ familiaRecursoId: ids.familia });
    expect(data.consultarUnidadesValidas).toHaveBeenCalledWith({ familiaRecursoId: ids.familia, tipoRecursoId: ids.tipo });
  });

  it("cancels at every wizard step without mutating", async () => {
    const cases: Array<{ name: string; selects: Array<string | undefined>; inputs: Array<string | undefined>; attributes?: Parameters<ResourceCreationDataSource["consultarAtributosAplicables"]>[0] extends never ? never : undefined }> = [
      { name: "class", selects: [undefined], inputs: [] },
      { name: "family", selects: [path[0], undefined], inputs: [] },
      { name: "type", selects: [path[0], path[1], undefined], inputs: [] },
      { name: "unit", selects: [path[0], path[1], path[2], undefined], inputs: [] },
      { name: "name", selects: [...path], inputs: [undefined] },
      { name: "description", selects: [...path], inputs: ["Bomba", undefined] },
    ];
    for (const testCase of cases) {
      const data = source();
      const result = await runCreateResourceWizard(ui(testCase.selects, testCase.inputs), data);
      expect(result.kind, testCase.name).toBe("cancelled");
      expect(data.crearRecurso, testCase.name).not.toHaveBeenCalled();
    }

    for (const tipoDato of ["OPCION", "BOOLEANO", "NUMERO"] as const) {
      const data = source();
      vi.mocked(data.consultarAtributosAplicables).mockResolvedValueOnce([{
        id: ids.atributo, definicionAtributoId: ids.definicion, clave: "VALOR", nombre: "Valor",
        tipoDato, aplicabilidad: "REQUIRED", orden: 1, descripcion: undefined, unidadId: undefined,
        unidad: null, participaIdentidad: false,
      }]);
      const inputs = tipoDato === "NUMERO" ? ["Bomba", ""] : ["Bomba", ""];
      const result = await runCreateResourceWizard(ui([...path, ...(tipoDato === "OPCION" ? [undefined] : tipoDato === "BOOLEANO" ? [undefined] : [])], inputs), data);
      expect(result.kind, tipoDato).toBe("cancelled");
      expect(data.crearRecurso, tipoDato).not.toHaveBeenCalled();
    }
  });
});
