import { describe, expect, it } from "vitest";

import { harGittSvar } from "@/kjerne/hargittsvar";
import { tomOkt } from "@/kjerne/okt";

describe("harGittSvar", () => {
  it("returnerer false for tom logg", () => {
    expect(harGittSvar(tomOkt())).toBe(false);
  });

  it("returnerer false når loggen bare inneholder spørsmål", () => {
    const okt = {
      ...tomOkt(),
      logg: [{ type: "sporsmal" as const, id: "A1", tekst: "Hei?", gjelder: null }],
    };
    expect(harGittSvar(okt)).toBe(false);
  });

  it("returnerer true når loggen inneholder minst ett svar", () => {
    const okt = {
      ...tomOkt(),
      logg: [{ type: "svar" as const, id: "S1", tekst: "Hei!" }],
    };
    expect(harGittSvar(okt)).toBe(true);
  });

  it("returnerer true med blanding av spørsmål og svar", () => {
    const okt = {
      ...tomOkt(),
      logg: [
        { type: "sporsmal" as const, id: "A1", tekst: "Hei?", gjelder: null },
        { type: "svar" as const, id: "S1", tekst: "Hei!" },
      ],
    };
    expect(harGittSvar(okt)).toBe(true);
  });

  it("returnerer false når loggen bare inneholder rettelse", () => {
    const okt = {
      ...tomOkt(),
      logg: [{ type: "rettelse" as const, id: "R1", tekst: "Rettet", erfaringId: "E1", felt: "rolle" as const }],
    };
    expect(harGittSvar(okt)).toBe(false);
  });
});
