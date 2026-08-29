import { visibleWidth } from "@earendil-works/pi-tui";
import { describe, expect, it, vi } from "vitest";
import { getConvexUrl, resourceRequest } from "./convexClient";
import { ResourceBrowser } from "./ui";
import { stateAfterLoad, type Resource } from "./types";

const resource = { _id: "r1", _creationTime: 0, tipoRecursoId: "t1", unidadId: "u1", identificadorTecnico: "R1", nombre: "Bomba visible", activo: true, revision: 1, valores: [] } satisfies Resource;
const keybindings = {
  matches: (data: string, key: string) => ({ up: "up", down: "down", confirm: "enter", cancel: "cancel" } as Record<string, string>)[key.split(".").at(-1)!] === data,
  getKeys: (key: string) => ({ up: ["up"], down: ["down"], confirm: ["enter"], cancel: ["escape"] } as Record<string, string[]>)[key.split(".").at(-1)!],
};
const theme = { fg: (_color: string, text: string) => text, bold: (text: string) => text };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

it("gives GARFEX_CONVEX_URL precedence and reports missing config", () => {
  expect(getConvexUrl({ GARFEX_CONVEX_URL: "garfex", CONVEX_URL: "fallback" })).toBe("garfex");
  expect(getConvexUrl({ CONVEX_URL: "fallback" })).toBe("fallback");
  expect(getConvexUrl({})).toBeUndefined();
});

it("routes list and search queries without side effects", () => {
  expect(resourceRequest({ kind: "list" })).toEqual({ kind: "list", args: { activo: true } });
  expect(resourceRequest({ kind: "search", text: "bomba" })).toEqual({ kind: "search", args: { texto: "bomba", activo: true } });
});

it("represents empty and populated results as distinct view states", () => {
  expect(stateAfterLoad({ kind: "list" }, [])).toEqual({ kind: "empty", query: "" });
  expect(stateAfterLoad({ kind: "search", text: "bomba" }, [resource])).toMatchObject({ kind: "list", query: "bomba", selected: 0 });
});

describe("ResourceBrowser controls and state help", () => {
  it("uses injected keybindings for navigation, detail, back, and close", async () => {
    const tui = { requestRender: vi.fn() }; const done = vi.fn();
    const browser = new ResourceBrowser({ kind: "list" }, async () => [resource], theme, tui, keybindings, done);
    await flush(); browser.handleInput("down"); browser.handleInput("enter");
    expect(browser.render(80).join("\n")).toContain("volver"); browser.handleInput("cancel");
    expect(browser.render(80).join("\n")).toContain("detalle"); browser.handleInput("cancel"); expect(done).toHaveBeenCalledOnce();
  });

  it("retries errors and closes empty states", async () => {
    const tui = { requestRender: vi.fn() }; const done = vi.fn();
    const load = vi.fn().mockRejectedValueOnce(new Error("fallo")).mockResolvedValueOnce([]);
    const browser = new ResourceBrowser({ kind: "search", text: "bomba" }, load, theme, tui, keybindings, done);
    await flush(); expect(browser.render(80).join("\n")).toContain("reintentar"); browser.handleInput("enter"); await flush();
    expect(browser.render(80).join("\n")).toContain("Sin resultados"); browser.handleInput("cancel"); expect(done).toHaveBeenCalledOnce();
  });

  it("truncates long output to the supplied width", async () => {
    const width = 24;
    const browser = new ResourceBrowser({ kind: "search", text: "bomba ".repeat(30) }, async () => [], theme, { requestRender: vi.fn() }, keybindings, vi.fn());
    await flush(); expect(browser.render(width).every((line) => visibleWidth(line) <= width)).toBe(true);
  });
});
