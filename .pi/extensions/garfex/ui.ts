import type { KeybindingsManager, Theme } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { stateAfterLoad, type Resource, type ResourceDataSource, type ResourceDetail, type ResourceQuery, type ViewState } from "./types";

export { stateAfterLoad } from "./types";

export type ResourceKeybinding =
  | "tui.select.up" | "tui.select.down" | "tui.select.confirm" | "tui.select.cancel";
type Tui = { requestRender(): void };
type Keybindings = Pick<KeybindingsManager, "matches" | "getKeys">;

function formatKey(key: string): string {
  return key.split("+").map((part) => part.length === 1 ? part.toUpperCase() : part[0]!.toUpperCase() + part.slice(1)).join("+").replace("Enter", "Enter");
}

export class ResourceBrowser {
  private state: ViewState;
  private listState?: Extract<ViewState, { kind: "list" }>;
  private cachedWidth?: number;
  private cachedLines?: string[];
  private detailAttempt = 0;
  private readonly source: ResourceDataSource;

  constructor(
    query: ResourceQuery,
    source: ResourceDataSource,
    private readonly theme: Theme,
    private readonly tui: Tui,
    private readonly keybindings: Keybindings,
    private readonly done: () => void,
  ) {
    this.source = source;
    this.state = { kind: "loading", query: query.kind === "search" ? query.text : "" };
    void this.fetch(query);
  }

  private key(name: ResourceKeybinding): string {
    const keys = this.keybindings.getKeys(name);
    return keys.length > 0 ? keys.map(formatKey).join("/") : name;
  }
  private hint(name: ResourceKeybinding, label: string): string { return `${this.key(name)} ${label}`; }

  private async fetch(query: ResourceQuery): Promise<void> {
    this.state = { kind: "loading", query: query.kind === "search" ? query.text : "" };
    this.invalidate(); this.tui.requestRender();
    try {
      const resources = query.kind === "list" ? await this.source.list() : await this.source.search(query.text);
      this.state = stateAfterLoad(query, resources);
    }
    catch (error) { this.state = { kind: "error", query: query.kind === "search" ? query.text : "", message: error instanceof Error ? error.message : "No se pudo conectar con Convex." }; }
    this.invalidate(); this.tui.requestRender();
  }

  private async fetchDetail(resource: Resource): Promise<void> {
    const attempt = ++this.detailAttempt;
    try {
      const detail = await this.source.getDetail(resource._id);
      if (attempt !== this.detailAttempt) return;
      this.state = detail ? { kind: "detail", resource: detail } : { kind: "detail-missing", resource };
    } catch (error) {
      if (attempt !== this.detailAttempt) return;
      this.state = { kind: "detail-error", resource, message: error instanceof Error ? error.message : "No se pudo cargar el detalle." };
    }
    this.invalidate(); this.tui.requestRender();
  }

  private backToList(): void {
    this.detailAttempt++;
    if (this.listState) {
      this.state = this.listState;
      this.invalidate(); this.tui.requestRender();
    } else this.done();
  }

  handleInput(data: string): void {
    if (this.keybindings.matches(data, "tui.select.cancel")) {
      if (this.state.kind === "detail" || this.state.kind === "detail-loading" || this.state.kind === "detail-missing" || this.state.kind === "detail-error") this.backToList();
      else this.done();
      return;
    }
    if (this.state.kind === "error" && this.keybindings.matches(data, "tui.select.confirm")) {
      void this.fetch(this.state.query ? { kind: "search", text: this.state.query } : { kind: "list" }); return;
    }
    if (this.state.kind === "detail-error" && this.keybindings.matches(data, "tui.select.confirm")) {
      this.state = { kind: "detail-loading", resource: this.state.resource };
      this.invalidate(); this.tui.requestRender(); void this.fetchDetail(this.state.resource); return;
    }
    if (this.state.kind !== "list") return;
    if (this.keybindings.matches(data, "tui.select.up")) this.state.selected = Math.max(0, this.state.selected - 1);
    else if (this.keybindings.matches(data, "tui.select.down")) this.state.selected = Math.min(this.state.resources.length - 1, this.state.selected + 1);
    else if (this.keybindings.matches(data, "tui.select.confirm")) {
      const resource = this.state.resources[this.state.selected]!;
      this.listState = this.state;
      this.state = { kind: "detail-loading", resource };
      void this.fetchDetail(resource);
    } else return;
    this.invalidate(); this.tui.requestRender();
  }

  render(width: number): string[] {
    if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;
    const w = Math.max(1, width); const state = this.state;
    const lines = [truncateToWidth(this.theme.fg("accent", this.theme.bold(" Catálogo de Recursos ")), w), "", ...this.renderBody(w), "", truncateToWidth(this.help(state.kind), w)];
    this.cachedWidth = width; this.cachedLines = lines; return lines;
  }

  private help(kind: ViewState["kind"]): string {
    if (kind === "list") return this.hint("tui.select.up", "navegar") + " · " + this.hint("tui.select.down", "navegar") + " · " + this.hint("tui.select.confirm", "detalle") + " · " + this.hint("tui.select.cancel", "cerrar");
    if (kind === "detail" || kind === "detail-loading" || kind === "detail-missing") return this.hint("tui.select.cancel", "volver");
    if (kind === "detail-error") return this.hint("tui.select.confirm", "reintentar") + " · " + this.hint("tui.select.cancel", "volver");
    if (kind === "error") return this.hint("tui.select.confirm", "reintentar") + " · " + this.hint("tui.select.cancel", "cerrar");
    return this.hint("tui.select.cancel", "cerrar");
  }

  private renderBody(width: number): string[] {
    const state = this.state;
    if (state.kind === "loading") return [truncateToWidth(this.theme.fg("muted", "Cargando recursos…"), width)];
    if (state.kind === "empty") return [truncateToWidth(this.theme.fg("muted", state.query ? `Sin resultados para “${state.query}”.` : "No hay recursos activos."), width)];
    if (state.kind === "error") return [truncateToWidth(this.theme.fg("error", `Error: ${state.message}`), width)];
    if (state.kind === "detail-loading") return [truncateToWidth(this.theme.fg("muted", "Cargando detalle…"), width)];
    if (state.kind === "detail-missing") return [truncateToWidth(this.theme.fg("muted", "No se encontró el detalle del recurso."), width)];
    if (state.kind === "detail-error") return [truncateToWidth(this.theme.fg("error", `Error: ${state.message}`), width)];
    if (state.kind === "detail") return this.renderDetail(state.resource, width);
    return state.resources.map((r, index) => truncateToWidth(`${index === state.selected ? this.theme.fg("accent", "> ") : "  "}${r.nombre}`, width));
  }

  private renderDetail(r: ResourceDetail, width: number): string[] {
    const lines = [this.theme.fg("accent", r.nombre), this.theme.fg("muted", r.descripcion || "Sin descripción."), "", `Identificador: ${r.identificadorTecnico}`, `Estado: ${r.activo ? "Activo" : "Inactivo"}`, `Revisión: ${r.revision}`, `Clase: ${r.clase.nombre}`, `Familia: ${r.familia.nombre}`, `Tipo: ${r.tipo.nombre}`, `Unidad: ${r.unidad.nombre}${r.unidad.simbolo ? ` (${r.unidad.simbolo})` : ""}`, ""];
    for (const atributo of r.atributos) {
      const value = atributo.opcion?.nombre ?? (atributo.valor === null ? "Sin valor" : String(atributo.valor));
      lines.push(`${atributo.nombre}: ${value}${atributo.unidad?.simbolo ? ` ${atributo.unidad.simbolo}` : ""}`);
    }
    return lines.map((line) => truncateToWidth(this.theme.fg("text", line), width));
  }

  invalidate(): void { this.cachedWidth = undefined; this.cachedLines = undefined; }
}
