import { describe, expect, it } from "vitest";
import { entityKinds, entityReferenceValidator } from "./validators";

describe("catalog administration validators", () => {
  it("recognizes allowed values as canonical entity references", () => {
    expect(entityKinds).toContain("valoresPermitidosAtributo");
    expect((entityReferenceValidator as { members?: unknown[] }).members).toEqual(expect.arrayContaining([
      expect.objectContaining({ fields: expect.objectContaining({ kind: expect.objectContaining({ value: "valoresPermitidosAtributo" }) }) }),
    ]));
  });
});
