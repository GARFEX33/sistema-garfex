import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createResourceDataSource } from "./convexClient";
import { ResourceBrowser } from "./ui";
import type { ResourceDataSource, ResourceQuery } from "./types";

const MAIN_MENU = ["Catálogo de Recursos", "Salir"];
const CATALOG_MENU = ["Listar recursos", "Buscar recursos", "Volver"];

async function openBrowser(ctx: ExtensionContext, query: ResourceQuery): Promise<void> {
  let source: ResourceDataSource;
  try {
    source = createResourceDataSource();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Convex no está configurado.";
    source = { list: async () => Promise.reject(new Error(message)), search: async () => Promise.reject(new Error(message)), getDetail: async () => null };
  }

  await ctx.ui.custom<void>((tui, theme, keybindings, done) =>
    new ResourceBrowser(query, source, theme, tui, keybindings, done),
  );
}

async function openCatalog(ctx: ExtensionContext, showBrowser: (query: ResourceQuery) => Promise<void>): Promise<void> {
  while (true) {
    const choice = await ctx.ui.select("Catálogo de Recursos", CATALOG_MENU);
    if (choice === "Listar recursos") await showBrowser({ kind: "list" });
    else if (choice === "Buscar recursos") {
      const entered = await ctx.ui.input("Buscar recursos", "Texto a buscar");
      const text = entered?.trim() ?? "";
      if (text) await showBrowser({ kind: "search", text });
    } else return;
  }
}

export async function runGarfexMenus(
  ctx: ExtensionContext,
  showBrowser: (query: ResourceQuery) => Promise<void> = (query) => openBrowser(ctx, query),
): Promise<void> {
  while (true) {
    const choice = await ctx.ui.select("Sistema GARFEX", MAIN_MENU);
    if (choice === "Catálogo de Recursos") await openCatalog(ctx, showBrowser);
    else return;
  }
}

export default function garfexExtension(pi: ExtensionAPI) {
  pi.registerCommand("garfex", {
    description: "Consultar el catálogo de recursos activos",
    handler: async (_args, ctx) => {
      if (ctx.mode !== "tui") {
        ctx.ui.notify("/garfex requiere modo interactivo", "error");
        return;
      }
      await runGarfexMenus(ctx, (query) => openBrowser(ctx, query));
    },
  });
}
