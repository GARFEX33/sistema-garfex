import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createResourceDataSource } from "./convexClient";
import { runCreateResourceWizard } from "./createResourceWizard";
import { ResourceBrowser } from "./ui";
import type { ResourceBrowserDataSource, ResourceCreationDataSource, ResourceQuery } from "./types";

const MAIN_MENU = ["Catálogo de Recursos", "Salir"];
const CATALOG_MENU = ["Listar recursos", "Buscar recursos", "Crear recurso", "Volver"];

type ShowBrowser = (query: ResourceQuery) => Promise<void>;
type CreateResource = () => Promise<void>;

async function openBrowser(ctx: ExtensionContext, query: ResourceQuery): Promise<void> {
  let source: ResourceBrowserDataSource;
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

async function openCreator(ctx: ExtensionContext): Promise<void> {
  let source: ResourceCreationDataSource;
  try {
    source = createResourceDataSource();
  } catch (error) {
    ctx.ui.notify(error instanceof Error ? error.message : "Convex no está configurado.", "error");
    return;
  }
  await runCreateResourceWizard(ctx.ui, source);
}

async function openCatalog(ctx: ExtensionContext, showBrowser: ShowBrowser, createResource: CreateResource): Promise<void> {
  while (true) {
    const choice = await ctx.ui.select("Catálogo de Recursos", CATALOG_MENU);
    if (choice === "Listar recursos") await showBrowser({ kind: "list" });
    else if (choice === "Buscar recursos") {
      const entered = await ctx.ui.input("Buscar recursos", "Texto a buscar");
      const text = entered?.trim() ?? "";
      if (text) await showBrowser({ kind: "search", text });
    } else if (choice === "Crear recurso") await createResource();
    else return;
  }
}

export async function runGarfexMenus(
  ctx: ExtensionContext,
  showBrowser: ShowBrowser = (query) => openBrowser(ctx, query),
  createResource: CreateResource = () => openCreator(ctx),
): Promise<void> {
  while (true) {
    const choice = await ctx.ui.select("Sistema GARFEX", MAIN_MENU);
    if (choice === "Catálogo de Recursos") await openCatalog(ctx, showBrowser, createResource);
    else return;
  }
}

export default function garfexExtension(pi: ExtensionAPI) {
  pi.registerCommand("garfex", {
    description: "Consultar y crear recursos del catálogo activo",
    handler: async (_args, ctx) => {
      if (ctx.mode !== "tui") {
        ctx.ui.notify("/garfex requiere modo interactivo", "error");
        return;
      }
      await runGarfexMenus(ctx, (query) => openBrowser(ctx, query));
    },
  });
}
