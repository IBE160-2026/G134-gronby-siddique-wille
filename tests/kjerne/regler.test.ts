import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAAL_ERFARINGER,
  MAKS_ERFARINGER,
  MAKS_ERFARINGER_SPORSMAL,
  MAKS_LOGG_OPPFORINGER,
  MAKS_OPPFOLGING_PER_ERFARING,
  MAKS_TEKST_TEGN,
  MIN_ANNONSE_TEGN,
  OVERGANGSSPORSMAL,
  STANDARD_REFLEKSJON,
  erLoggFull,
  erLukket,
  erMaksNadd,
  kanGaVidere,
  kanTrykkeFerdig,
} from "@/kjerne/regler";
import { erFanget } from "@/kjerne/fanget";

import { erfaring, fangede, felt, sporsmal, svar, tomErfaring } from "./hjelpere";

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

describe("terskelregler (AD-16)", () => {
  it("terskelverdiene er satt", () => {
    expect(MAAL_ERFARINGER).toBe(3);
    expect(MAKS_OPPFOLGING_PER_ERFARING).toBe(3);
    expect(MIN_ANNONSE_TEGN).toBe(200);
  });

  it("OVERGANGSSPORSMAL og STANDARD_REFLEKSJON er ordrett fra EXPERIENCE.md", () => {
    expect(OVERGANGSSPORSMAL).toBe(
      "Fint, da går vi videre. Fortell gjerne om noe annet du har gjort: en annen jobb, frivillig arbeid eller et prosjekt på studiet.",
    );
    expect(STANDARD_REFLEKSJON).toBe(
      "Tenk på: har du gjort noe lignende i en jobb, på studiet eller i fritiden, selv om du ikke tenkte på det som erfaring da?",
    );
    // UX eier ordlyden: endres EXPERIENCE.md, må konstantene følge med.
    const experience = readFileSync(
      path.join(
        process.cwd(),
        "docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md",
      ),
      "utf8",
    );
    expect(experience).toContain(`«${OVERGANGSSPORSMAL}»`);
    expect(experience).toContain(`«${STANDARD_REFLEKSJON}»`);
    expect(OVERGANGSSPORSMAL.length).toBeLessThanOrEqual(MAKS_TEKST_TEGN);
    expect(STANDARD_REFLEKSJON.length).toBeLessThanOrEqual(MAKS_TEKST_TEGN);
  });

  it("erLukket teller bare spørsmål med gjelder lik erfaringen", () => {
    const om = (n: number, gjelder: string | null = "E1") =>
      Array.from({ length: n }, (_, i) => sporsmal(`A${i + 1}`, gjelder));
    expect(erLukket({ logg: [] }, "E1")).toBe(false);
    expect(erLukket({ logg: om(2) }, "E1")).toBe(false);
    expect(erLukket({ logg: om(3) }, "E1")).toBe(true);
    expect(erLukket({ logg: om(4) }, "E1")).toBe(true);
    // Spørsmål om en ny erfaring (`null`) og om andre erfaringer teller ikke.
    expect(erLukket({ logg: [...om(2), ...om(5, null), ...om(5, "E2")] }, "E1")).toBe(false);
    expect(erLukket({ logg: om(3, "E2") }, "E2")).toBe(true);
    // Svar og rettelser teller ikke.
    expect(erLukket({ logg: [...om(2), svar("S1"), svar("S2")] }, "E1")).toBe(false);
  });

  it("kanGaVidere krever MAAL_ERFARINGER fangede", () => {
    const logg = [svar("S1")];
    expect(kanGaVidere({ erfaringer: [], logg })).toBe(false);
    expect(kanGaVidere({ erfaringer: [...fangede(2), tomErfaring("E3")], logg })).toBe(false);
    expect(kanGaVidere({ erfaringer: fangede(3), logg })).toBe(true);
    expect(kanGaVidere({ erfaringer: fangede(4), logg })).toBe(true);
    expect(kanGaVidere({ erfaringer: fangede(3), logg: [] })).toBe(false);
  });

  it("en lukket erfaring som mangler et felt, er ikke fanget (AD-7)", () => {
    const logg = [
      sporsmal("A1", "E3"),
      svar("S1"),
      sporsmal("A2", "E3"),
      sporsmal("A3", "E3"),
    ];
    const utenResultat = erfaring("E3", { resultat: felt("") });
    expect(erLukket({ logg }, "E3")).toBe(true);
    expect(erFanget(utenResultat, logg)).toBe(false);
    expect(kanGaVidere({ erfaringer: [...fangede(2), utenResultat], logg })).toBe(false);
    // Fylles feltet senere, er erfaringen fanget selv om den er lukket.
    const fylt = erfaring("E3");
    expect(erFanget(fylt, logg)).toBe(true);
    expect(kanGaVidere({ erfaringer: [...fangede(2), fylt], logg })).toBe(true);
  });
});
