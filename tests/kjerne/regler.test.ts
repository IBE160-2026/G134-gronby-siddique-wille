import { describe, expect, it } from "vitest";

import {
  MAKS_ERFARINGER,
  MAKS_ERFARINGER_SPORSMAL,
  MAKS_LOGG_OPPFORINGER,
  MAKS_TEKST_TEGN,
  erLoggFull,
  erMaksNadd,
  kanTrykkeFerdig,
} from "@/kjerne/regler";

import { fangede, sporsmal, svar, tomErfaring } from "./hjelpere";

describe("regler for samtalen", () => {
  it("MAKS_ERFARINGER er 8, og spørsmålet nevner grensen", () => {
    expect(MAKS_ERFARINGER).toBe(8);
    expect(MAKS_ERFARINGER_SPORSMAL).toContain(String(MAKS_ERFARINGER));
    expect(MAKS_ERFARINGER_SPORSMAL.length).toBeLessThanOrEqual(MAKS_TEKST_TEGN);
  });

  it("kanTrykkeFerdig er sann når minst ett spørsmål er stilt", () => {
    expect(kanTrykkeFerdig({ logg: [] })).toBe(false);
    expect(kanTrykkeFerdig({ logg: [svar("S1")] })).toBe(false);
    expect(kanTrykkeFerdig({ logg: [sporsmal("A1")] })).toBe(true);
  });

  it("erMaksNadd teller fangede, ikke alle erfaringer", () => {
    const logg = [svar("S1")];
    expect(erMaksNadd({ erfaringer: fangede(7), logg })).toBe(false);
    expect(erMaksNadd({ erfaringer: [...fangede(7), tomErfaring("E8")], logg })).toBe(false);
    expect(erMaksNadd({ erfaringer: fangede(8), logg })).toBe(true);
    // Uten kilden i loggen er ingen fanget.
    expect(erMaksNadd({ erfaringer: fangede(8), logg: [] })).toBe(false);
  });

  it("erLoggFull når ett svar og ett spørsmål til ville gått over grensen", () => {
    const logg = (n: number) => Array.from({ length: n }, (_, i) => svar(`S${i + 1}`));
    expect(erLoggFull({ logg: logg(MAKS_LOGG_OPPFORINGER - 2) })).toBe(false);
    expect(erLoggFull({ logg: logg(MAKS_LOGG_OPPFORINGER - 1) })).toBe(true);
  });
});
