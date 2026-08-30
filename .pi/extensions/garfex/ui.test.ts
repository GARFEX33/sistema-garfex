import { visibleWidth } from "@earendil-works/pi-tui";
import { describe, expect, it, vi } from "vitest";
import { api } from "../../../convex/_generated/api";
import { createResourceDataSource, detailRequest, getConvexUrl, resourceRequest } from "./convexClient";
import garfexExtension, { runGarfexMenus } from "./index";
import { ResourceBrowser } from "./ui";
import { fakeId } from "./testFixtures";
import { stateAfterLoad, type Resource, type ResourceDetail, type ResourceQuery } from "./types";

const resource = { _id: fakeId<"recursos">("r1"), _creationTime: 0, tipoRecursoId: fakeId<"tiposRecurso">("t1"), unidadId: fakeId<"unidades">("u1"), identificadorTecnico: "R1", nombre: "Bomba visible", activo: true, revision: 1, valores: [] } satisfies Resource;
const detail = {
  id: fakeId<"recursos">("r1"), identificadorTecnico: "R1", nombre: "Bomba visible", descripcion: "Descripción enriquecida", activo: true, revision: 3,
  clase: { id: fakeId<"clasesRecurso">("c1"), clave: "EQUIPO", nombre: "Equipo", activo: true, revision: 1 },
  familia: { id: fakeId<"familiasRecurso">("f1"), clave: "BOMBA", nombre: "Bomba", activo: true, revision: 1 },
  tipo: { id: fakeId<"tiposRecurso">("t1"), clave: "CENTRIFUGA", nombre: "Centrífuga", activo: true, revision: 1 },
  unidad: { id: fakeId<"unidades">("u1"), clave: "UN", nombre: "Unidad", simbolo: "u", activo: true, revision: 1 },
  atributos: [
    { id: fakeId<"atributosRecurso">("a1"), clave: "COLOR", nombre: "Color", tipoDato: "OPCION", aplicabilidad: "REQUIRED", participaIdentidad: true, orden: 1, activo: true, valor: "rojo", opcion: { id: fakeId<"opcionesAtributo">("o1"), clave: "ROJO", nombre: "Rojo", activo: true, revision: 1 }, unidad: null },
    { id: fakeId<"atributosRecurso">("a2"), clave: "PESO", nombre: "Peso", tipoDato: "NUMERO", aplicabilidad: "OPTIONAL", participaIdentidad: false, orden: 2, activo: true, valor: 42, opcion: null, unidad: { id: fakeId<"unidades">("u1"), clave: "UN", nombre: "Unidad", simbolo: "u", activo: true, revision: 1 } },
  ],
} satisfies ResourceDetail;

const keybindings = {
  matches: (data: string, key: string) => ({ up: "up", down: "down", confirm: "enter", cancel: "cancel" } as Record<string, string>)[key.split(".").at(-1)!] === data,
  getKeys: (key: string) => ({ up: ["up"], down: ["down"], confirm: ["enter"], cancel: ["escape"] } as Record<string, string[]>)[key.split(".").at(-1)!],
};
const theme = { fg: (_color: string, text: string) => text, bold: (text: string) => text };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const catalogSourceExtras = {
  consultarClases: async () => [], consultarFamiliasDeClase: async () => [], consultarTiposDeFamilia: async () => [],
  consultarUnidadesValidas: async () => [], consultarAtributosAplicables: async () => [], consultarOpcionesPermitidas: async () => [],
  crearRecurso: async () => resource,
};
const sourceFrom = (load: (query: ResourceQuery) => Promise<Resource[]>) => ({
  list: () => load({ kind: "list" }),
  search: (text: string) => load({ kind: "search", text }),
  getDetail: async () => null,
  ...catalogSourceExtras,
});

it("gives GARFEX_CONVEX_URL precedence and reports missing config", () => {
  expect(getConvexUrl({ GARFEX_CONVEX_URL: "garfex", CONVEX_URL: "fallback" })).toBe("garfex");
  expect(getConvexUrl({ CONVEX_URL: "fallback" })).toBe("fallback");
  expect(getConvexUrl({})).toBeUndefined();
});

it("routes list and search queries without side effects", () => {
  expect(resourceRequest({ kind: "list" })).toEqual({ kind: "list", args: { activo: true } });
  expect(resourceRequest({ kind: "search", text: "bomba" })).toEqual({ kind: "search", args: { texto: "bomba", activo: true } });
      expect(detailRequest(fakeId<"recursos">("r1"))).toEqual({ recursoId: fakeId<"recursos">("r1") });
});

it("uses exact generated references for list, search, and detail requests", async () => {
  const query = vi.fn().mockResolvedValue([]);
  const mutation = vi.fn().mockResolvedValue(resource);
  const source = createResourceDataSource({ GARFEX_CONVEX_URL: "https://example" }, () => ({ query, mutation }));
  await source.list(); await source.search("bomba"); await source.getDetail(fakeId<"recursos">("r1"));
  expect(query).toHaveBeenNthCalledWith(1, api.catalogoRecursos.recursos.listarRecursos, { activo: true });
  expect(query).toHaveBeenNthCalledWith(2, api.catalogoRecursos.recursos.buscarRecursos, { texto: "bomba", activo: true });
  expect(query).toHaveBeenNthCalledWith(3, api.catalogoRecursos.recursos.obtenerDetalleRecurso, { recursoId: fakeId<"recursos">("r1") });
});

it("represents empty and populated results as distinct view states", () => {
  expect(stateAfterLoad({ kind: "list" }, [])).toEqual({ kind: "empty", query: "" });
  expect(stateAfterLoad({ kind: "search", text: "bomba" }, [resource])).toMatchObject({ kind: "list", query: "bomba", selected: 0 });
});

describe("GARFEX menu orchestration", () => {
  function menuContext(select: (...args: unknown[]) => Promise<string | undefined>, input = async () => undefined) {
    return { mode: "tui", ui: { select, input, notify: vi.fn() } } as unknown as Parameters<typeof runGarfexMenus>[0];
  }

  it("shows the system menu first and ignores command arguments", async () => {
    const command: { handler?: (argument: string, context: Parameters<typeof runGarfexMenus>[0]) => Promise<void> } = {};
    const select = vi.fn().mockResolvedValueOnce("Salir");
    garfexExtension({ registerCommand: (_name: string, definition: { handler: (argument: string, context: Parameters<typeof runGarfexMenus>[0]) => Promise<void> }) => { command.handler = definition.handler; } } as unknown as Parameters<typeof garfexExtension>[0]);
    const ctx = menuContext(select);
    await command.handler!("cable", ctx);
    expect(select).toHaveBeenNthCalledWith(1, "Sistema GARFEX", ["Catálogo de Recursos", "Salir"]);
  });

  it("sends exact list and trimmed search queries through the seam", async () => {
    const select = vi.fn()
      .mockResolvedValueOnce("Catálogo de Recursos")
      .mockResolvedValueOnce("Listar recursos")
      .mockResolvedValueOnce("Buscar recursos")
      .mockResolvedValueOnce("Volver")
      .mockResolvedValueOnce(undefined);
    const input = vi.fn().mockResolvedValue("  bomba  ");
    const showBrowser = vi.fn().mockResolvedValue(undefined);
    await runGarfexMenus(menuContext(select, input), showBrowser);
    expect(showBrowser).toHaveBeenNthCalledWith(1, { kind: "list" });
    expect(showBrowser).toHaveBeenNthCalledWith(2, { kind: "search", text: "bomba" });
  });

  it("does not open the browser for blank or cancelled searches", async () => {
    const showBrowser = vi.fn().mockResolvedValue(undefined);
    const blankSelect = vi.fn()
      .mockResolvedValueOnce("Catálogo de Recursos")
      .mockResolvedValueOnce("Buscar recursos")
      .mockResolvedValueOnce("Volver")
      .mockResolvedValueOnce(undefined);
    await runGarfexMenus(menuContext(blankSelect, vi.fn().mockResolvedValue("   ")), showBrowser);
    const cancelledSelect = vi.fn()
      .mockResolvedValueOnce("Catálogo de Recursos")
      .mockResolvedValueOnce("Buscar recursos")
      .mockResolvedValueOnce("Volver")
      .mockResolvedValueOnce(undefined);
    await runGarfexMenus(menuContext(cancelledSelect, vi.fn().mockResolvedValue(undefined)), showBrowser);
    expect(showBrowser).not.toHaveBeenCalled();
  });

  it("waits for browser completion before showing the catalog submenu again", async () => {
    let finish!: () => void;
    const browserDone = new Promise<void>((resolve) => { finish = resolve; });
    const select = vi.fn()
      .mockResolvedValueOnce("Catálogo de Recursos")
      .mockResolvedValueOnce("Listar recursos")
      .mockResolvedValueOnce("Volver")
      .mockResolvedValueOnce(undefined);
    const showBrowser = vi.fn().mockReturnValue(browserDone);
    const running = runGarfexMenus(menuContext(select), showBrowser);
    await flush();
    expect(select).toHaveBeenCalledTimes(2);
    finish();
    await running;
    expect(select).toHaveBeenCalledWith("Catálogo de Recursos", ["Listar recursos", "Buscar recursos", "Crear recurso", "Volver"]);
  });

  it("returns from catalog cancel and closes on main cancel", async () => {
    const select = vi.fn().mockResolvedValueOnce("Catálogo de Recursos").mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined);
    await runGarfexMenus(menuContext(select), vi.fn().mockResolvedValue(undefined));
    expect(select).toHaveBeenNthCalledWith(1, "Sistema GARFEX", ["Catálogo de Recursos", "Salir"]);
    expect(select).toHaveBeenNthCalledWith(2, "Catálogo de Recursos", ["Listar recursos", "Buscar recursos", "Crear recurso", "Volver"]);
    expect(select).toHaveBeenCalledTimes(3);
  });
});

describe("ResourceBrowser controls and state help", () => {
  it("uses injected keybindings for navigation, detail, back, and close", async () => {
    const tui = { requestRender: vi.fn() }; const done = vi.fn();
    const browser = new ResourceBrowser({ kind: "list" }, sourceFrom(async () => [resource]), theme, tui, keybindings, done);
    await flush(); browser.handleInput("down"); browser.handleInput("enter");
    expect(browser.render(80).join("\n")).toContain("volver"); browser.handleInput("cancel");
    expect(browser.render(80).join("\n")).toContain("detalle"); browser.handleInput("cancel"); expect(done).toHaveBeenCalledOnce();
  });

  it("retries errors and closes empty states", async () => {
    const tui = { requestRender: vi.fn() }; const done = vi.fn();
    const load = vi.fn().mockRejectedValueOnce(new Error("fallo")).mockResolvedValueOnce([]);
    const browser = new ResourceBrowser({ kind: "search", text: "bomba" }, sourceFrom(load), theme, tui, keybindings, done);
    await flush(); expect(browser.render(80).join("\n")).toContain("reintentar"); browser.handleInput("enter"); await flush();
    expect(browser.render(80).join("\n")).toContain("Sin resultados"); browser.handleInput("cancel"); expect(done).toHaveBeenCalledOnce();
  });

  it("ignores a late detail error after cancel", async () => {
  let reject!: (error: Error) => void;
  const pending = new Promise<never>((_, r) => { reject = r; });
  const browser = new ResourceBrowser({ kind: "list" }, { list: async () => [resource], search: async () => [], getDetail: async () => pending, ...catalogSourceExtras }, theme, { requestRender: vi.fn() }, keybindings, vi.fn());
  await flush(); browser.handleInput("enter"); browser.handleInput("cancel"); reject(new Error("tarde")); await flush();
  expect(browser.render(80).join("\\n")).not.toContain("tarde");
});

it("truncates long output to the supplied width", async () => {
    const width = 24;
    const browser = new ResourceBrowser({ kind: "search", text: "bomba ".repeat(30) }, sourceFrom(async () => []), theme, { requestRender: vi.fn() }, keybindings, vi.fn());
    await flush(); expect(browser.render(width).every((line) => visibleWidth(line) <= width)).toBe(true);
  });

  it("renders enriched detail fields and labels without raw ids", async () => {
    const source = { list: async () => [resource], search: async () => [], getDetail: async () => detail, ...catalogSourceExtras };
    const browser = new ResourceBrowser({ kind: "list" }, source, theme, { requestRender: vi.fn() }, keybindings, vi.fn());
    await flush(); browser.handleInput("enter"); await flush();
    const rendered = browser.render(120).join("\\n");
    expect(rendered).toContain("Equipo"); expect(rendered).toContain("Bomba"); expect(rendered).toContain("Centrífuga");
    expect(rendered).toContain("Unidad (u)"); expect(rendered).toContain("Rojo"); expect(rendered).toContain("42 u");
    expect(rendered).toContain("R1"); expect(rendered).toContain("Revisión: 3"); expect(rendered).toContain("Descripción enriquecida");
    expect(rendered).not.toContain("c1"); expect(rendered).not.toContain("a1");
  });

  it("renders missing and error detail states with back and retry", async () => {
    const tui = { requestRender: vi.fn() }; const done = vi.fn();
    const missing = new ResourceBrowser({ kind: "list" }, { list: async () => [resource], search: async () => [], getDetail: async () => null, ...catalogSourceExtras }, theme, tui, keybindings, done);
    await flush(); missing.handleInput("enter"); await flush(); expect(missing.render(80).join("\\n")).toContain("No se encontró"); missing.handleInput("cancel"); expect(missing.render(80).join("\\n")).toContain("Bomba visible");
    const retry = vi.fn().mockRejectedValueOnce(new Error("fallo")).mockResolvedValueOnce(detail);
    const browser = new ResourceBrowser({ kind: "list" }, { list: async () => [resource], search: async () => [], getDetail: retry, ...catalogSourceExtras }, theme, tui, keybindings, vi.fn());
    await flush(); browser.handleInput("enter"); await flush(); expect(browser.render(80).join("\\n")).toContain("reintentar"); browser.handleInput("enter"); await flush(); expect(browser.render(80).join("\\n")).toContain("Descripción enriquecida");
  });

  it("routes detail loading and ignores a late response after cancel", async () => {
    let resolve!: (value: null) => void;
    const pending = new Promise<null>((r) => { resolve = r; });
    const source = { list: async () => [resource], search: async () => [], getDetail: async () => pending, ...catalogSourceExtras };
    const browser = new ResourceBrowser({ kind: "list" }, source, theme, { requestRender: vi.fn() }, keybindings, vi.fn());
    await flush(); browser.handleInput("enter");
    expect(browser.render(80).join("\n")).toContain("Cargando detalle…");
    browser.handleInput("cancel"); resolve(null); await flush();
    expect(browser.render(80).join("\n")).toContain("Bomba visible");
    expect(browser.render(80).join("\n")).not.toContain("No se encontró");
  });
});
