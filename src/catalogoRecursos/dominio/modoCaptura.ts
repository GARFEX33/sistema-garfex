import type { ModoCaptura, TipoDato } from "./tipos";

export type DefinicionConModoCaptura = Readonly<{
  tipoDato: TipoDato;
  modoCaptura?: ModoCaptura;
}>;

export function resolverModoCaptura({ tipoDato, modoCaptura }: DefinicionConModoCaptura): ModoCaptura {
  return modoCaptura ?? (tipoDato === "OPCION" ? "SELECCION" : "LIBRE");
}
