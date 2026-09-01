import type { ExtensionUIDialogOptions } from "@earendil-works/pi-coding-agent";
import { parseResourceValue } from "./createResourceForm";
import type {
  AllowedOptions,
  ApplicableAttributes,
  Classes,
  CreateResourceArgs,
  CreatedResource,
  Families,
  ResourceCreationDataSource,
  Types,
  ValidUnits,
} from "./types";

export interface ResourceWizardUi {
  select(title: string, options: string[]): Promise<string | undefined>;
  input(title: string, placeholder?: string): Promise<string | undefined>;
  confirm(title: string, message: string, opts?: ExtensionUIDialogOptions): Promise<boolean>;
  notify(message: string, level?: "info" | "warning" | "error"): void;
}

export interface CreateResourceWizardResult {
  kind: "created" | "cancelled" | "failed";
  resource?: CreatedResource;
}

type CatalogItem = { id: unknown; clave: string; nombre: string };
type Attribute = ApplicableAttributes[number];
type Option = AllowedOptions[number];
type CapturedValue = CreateResourceArgs["valores"][number];
type CaptureResult =
  | { kind: "captured"; value: CapturedValue; display: string }
  | { kind: "omitted" }
  | { kind: "cancelled" };

function selectionLabel(item: CatalogItem): string {
  return `${item.clave} — ${item.nombre}`;
}

function humanName(item: CatalogItem): string {
  return item.nombre;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo consultar el catálogo.";
}

async function choose<T extends CatalogItem>(ui: ResourceWizardUi, title: string, items: T[]): Promise<T | undefined> {
  const selected = await ui.select(title, items.map(selectionLabel));
  return selected === undefined ? undefined : items.find((item) => selectionLabel(item) === selected);
}

function notifyEmpty(ui: ResourceWizardUi, what: string): void {
  ui.notify(`No hay ${what} disponibles en el catálogo.`, "warning");
}

async function requiredText(ui: ResourceWizardUi, title: string, placeholder: string): Promise<string | undefined> {
  while (true) {
    const value = await ui.input(title, placeholder);
    if (value === undefined) return undefined;
    if (value.trim()) return value.trim();
    ui.notify("Este campo es obligatorio.", "warning");
  }
}

async function captureAttribute(
  ui: ResourceWizardUi,
  source: ResourceCreationDataSource,
  attribute: Attribute,
): Promise<CaptureResult> {
  const canOmit = attribute.aplicabilidad === "OPTIONAL" || attribute.aplicabilidad === "CONDITIONAL";
  if (canOmit) {
    const capture = await ui.confirm(
      "Atributo opcional",
      `¿Quieres capturar «${attribute.nombre}»?`,
    );
    if (!capture) return { kind: "omitted" };
  }

  if (attribute.tipoDato === "OPCION") {
    let options: AllowedOptions;
    try {
      options = await source.consultarOpcionesPermitidas({ definicionAtributoId: attribute.definicionAtributoId });
    } catch (error) {
      ui.notify(`No se pudieron cargar las opciones de ${attribute.nombre}: ${errorMessage(error)}`, "error");
      throw error;
    }
    if (options.length === 0) {
      notifyEmpty(ui, `opciones para ${attribute.nombre}`);
      throw new Error("Opciones vacías");
    }
    const option = await choose(ui, attribute.nombre, options);
    if (!option) return { kind: "cancelled" };
    return {
      kind: "captured",
      value: { atributoRecursoId: attribute.id, valor: option.clave, opcionAtributoId: option.id },
      display: `${attribute.nombre}: ${option.nombre}`,
    };
  }

  if (attribute.tipoDato === "BOOLEANO") {
    const selected = await ui.select(attribute.nombre, ["Sí", "No"]);
    if (selected === undefined) return { kind: "cancelled" };
    const value = selected === "Sí";
    return { kind: "captured", value: { atributoRecursoId: attribute.id, valor: value }, display: `${attribute.nombre}: ${value ? "Sí" : "No"}` };
  }

  while (true) {
    const raw = await ui.input(attribute.nombre, attribute.tipoDato === "NUMERO" ? "Introduce un número" : "Introduce un valor");
    if (raw === undefined) return { kind: "cancelled" };
    try {
      const value = parseResourceValue(attribute.tipoDato, raw);
      const unit = attribute.unidad?.simbolo || attribute.unidad?.nombre;
      return {
        kind: "captured",
        value: { atributoRecursoId: attribute.id, valor: value },
        display: `${attribute.nombre}: ${String(value)}${unit ? ` ${unit}` : ""}`,
      };
    } catch (error) {
      ui.notify(errorMessage(error), "warning");
    }
  }
}

function summary(
  args: CreateResourceArgs,
  hierarchy: string[],
  unitName: string,
  attributeDisplays: string[],
): string {
  return [
    `Jerarquía: ${hierarchy.join(" / ")}`,
    `Nombre: ${args.nombre}`,
    `Unidad: ${unitName}`,
    args.descripcion ? `Descripción: ${args.descripcion}` : undefined,
    attributeDisplays.length ? `Valores: ${attributeDisplays.join(", ")}` : "Valores: ninguno",
  ].filter(Boolean).join("\n");
}

export async function runCreateResourceWizard(ui: ResourceWizardUi, source: ResourceCreationDataSource): Promise<CreateResourceWizardResult> {
  let classes: Classes;
  try {
    classes = await source.consultarClases();
  } catch (error) {
    ui.notify(`No se pudieron cargar las clases: ${errorMessage(error)}`, "error");
    return { kind: "failed" };
  }
  if (!classes.length) {
    notifyEmpty(ui, "clases");
    return { kind: "failed" };
  }
  const selectedClass = await choose(ui, "Selecciona una clase", classes);
  if (!selectedClass) return { kind: "cancelled" };

  let families: Families;
  try {
    families = await source.consultarFamiliasDeClase({ claseRecursoId: selectedClass.id });
  } catch (error) {
    ui.notify(`No se pudieron cargar las familias: ${errorMessage(error)}`, "error");
    return { kind: "failed" };
  }
  if (!families.length) {
    notifyEmpty(ui, "familias");
    return { kind: "failed" };
  }
  const selectedFamily = await choose(ui, "Selecciona una familia", families);
  if (!selectedFamily) return { kind: "cancelled" };

  let types: Types;
  try {
    types = await source.consultarTiposDeFamilia({ familiaRecursoId: selectedFamily.id });
  } catch (error) {
    ui.notify(`No se pudieron cargar los tipos: ${errorMessage(error)}`, "error");
    return { kind: "failed" };
  }
  if (!types.length) {
    notifyEmpty(ui, "tipos");
    return { kind: "failed" };
  }
  const selectedType = await choose(ui, "Selecciona un tipo", types);
  if (!selectedType) return { kind: "cancelled" };

  let units: ValidUnits;
  try {
    units = await source.consultarUnidadesValidas({ familiaRecursoId: selectedFamily.id, tipoRecursoId: selectedType.id });
  } catch (error) {
    ui.notify(`No se pudieron cargar las unidades: ${errorMessage(error)}`, "error");
    return { kind: "failed" };
  }
  if (!units.length) {
    notifyEmpty(ui, "unidades válidas");
    return { kind: "failed" };
  }
  const selectedUnit = await choose(ui, "Selecciona una unidad", units);
  if (!selectedUnit) return { kind: "cancelled" };

  const nombre = await requiredText(ui, "Nombre del recurso", "Nombre obligatorio");
  if (nombre === undefined) return { kind: "cancelled" };
  const descripcionRaw = await ui.input("Descripción (opcional)", "Puedes dejarla vacía");
  if (descripcionRaw === undefined) return { kind: "cancelled" };

  let attributes: ApplicableAttributes;
  try {
    attributes = (await source.consultarAtributosAplicables({ familiaRecursoId: selectedFamily.id, tipoRecursoId: selectedType.id }))
      .slice()
      .sort((a, b) => a.orden - b.orden);
  } catch (error) {
    ui.notify(`No se pudieron cargar los atributos: ${errorMessage(error)}`, "error");
    return { kind: "failed" };
  }

  const valores: CreateResourceArgs["valores"] = [];
  const attributeDisplays: string[] = [];
  for (const attribute of attributes) {
    try {
      const captured = await captureAttribute(ui, source, attribute);
      if (captured.kind === "cancelled") return { kind: "cancelled" };
      if (captured.kind === "captured") {
        valores.push(captured.value);
        attributeDisplays.push(captured.display);
      }
    } catch {
      return { kind: "failed" };
    }
  }

  const args = {
    claseRecursoId: selectedClass.id,
    familiaRecursoId: selectedFamily.id,
    tipoRecursoId: selectedType.id,
    unidadId: selectedUnit.id,
    nombre,
    ...(descripcionRaw.trim() ? { descripcion: descripcionRaw.trim() } : {}),
    valores,
  } satisfies CreateResourceArgs;

  const confirmed = await ui.confirm(
    "Confirmar recurso",
    summary(args, [humanName(selectedClass), humanName(selectedFamily), humanName(selectedType)], selectedUnit.simbolo || humanName(selectedUnit), attributeDisplays),
  );
  if (!confirmed) return { kind: "cancelled" };

  try {
    const resource = await source.crearRecurso(args);
    ui.notify(`Recurso creado: ${resource.identificadorTecnico} · revisión ${resource.revision} · ${resource.activo ? "activo" : "inactivo"}`, "info");
    return { kind: "created", resource };
  } catch (error) {
    ui.notify(`No se pudo crear el recurso: ${errorMessage(error)}`, "error");
    return { kind: "failed" };
  }
}
