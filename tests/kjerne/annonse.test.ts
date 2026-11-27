import { describe, expect, it } from "vitest";

import { annonsetilstand } from "@/kjerne/annonse";
import { MAKS_ANNONSE_TEGN, MIN_ANNONSE_TEGN } from "@/kjerne/regler";

const tegn = (n: number) => "a".repeat(n);

describe("annonsetilstand", () => {
  it("MAKS_ANNONSE_TEGN er 6000 (epics.md, story 2.1)", () => {
    expect(MAKS_ANNONSE_TEGN).toBe(6000);
    expect(MIN_ANNONSE_TEGN).toBe(200);
  });

  it("tom tekst er for kort", () => {
    expect(annonsetilstand("")).toBe("for-kort");
  });

  it("ett tegn under grensen er for kort, nøyaktig på grensen er ok", () => {
    expect(annonsetilstand(tegn(MIN_ANNONSE_TEGN - 1))).toBe("for-kort");
    expect(annonsetilstand(tegn(MIN_ANNONSE_TEGN))).toBe("ok");
  });

  it("mellomrom og linjeskift i endene teller ikke mot minstegrensen", () => {
    expect(annonsetilstand(`  \n${tegn(MIN_ANNONSE_TEGN - 1)}\n  `)).toBe("for-kort");
    expect(annonsetilstand(`  \n${tegn(MIN_ANNONSE_TEGN)}\n  `)).toBe("ok");
  });

  it("bare mellomrom er for kort selv når de er mange", () => {
    expect(annonsetilstand(" ".repeat(MIN_ANNONSE_TEGN + 50))).toBe("for-kort");
  });

  it("nøyaktig på maksgrensen er ok, ett tegn over er for lang", () => {
    expect(annonsetilstand(tegn(MAKS_ANNONSE_TEGN))).toBe("ok");
    expect(annonsetilstand(tegn(MAKS_ANNONSE_TEGN + 1))).toBe("for-lang");
  });

  it("maksgrensen regnes på hele teksten, også mellomrom i endene", () => {
    // Skjemaet (`KravForesporsel`) kontrollerer hele strengen, så «Finn krav»
    // må være deaktivert her. Ellers ville serveren avvise forespørselen.
    expect(annonsetilstand(`${tegn(MAKS_ANNONSE_TEGN)} `)).toBe("for-lang");
  });
});
