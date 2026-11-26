import { describe, expect, it } from "vitest";

import { begrensOppfolging, begrensSamtaleSvar, brukEndringer, losGjelder } from "@/kjerne/endringer";
import { tomOkt, type Okt } from "@/kjerne/okt";
import { MAKS_ERFARINGER_SPORSMAL, MAKS_LISTE, OVERGANGSSPORSMAL } from "@/kjerne/regler";
import type { Endring, SamtaleSvar } from "@/kjerne/skjema";

import { erfaring, fangede, felt, sporsmal, svar, tomErfaring } from "./hjelpere";

function okt(overstyr: Partial<Okt> = {}): Okt {
  return { ...tomOkt(), modus: "ekte", logg: [sporsmal("A1"), svar("S1")], ...overstyr };
}

describe("brukEndringer (AD-13)", () => {
  it("opprett gir neste E-ID, og { ny } løses i senere endringer", () => {
    const start = okt({ tellere: { A: 1, S: 1, R: 0, E: 2, K: 0 } });
    const endringer: Endring[] = [
      { type: "opprett", ny: "n1", tittel: "Kafé" },
      { type: "settTekst", erfaring: { ny: "n1" }, felt: "rolle", tekst: "Servitør" },
      { type: "leggTilKilde", erfaring: { ny: "n1" }, felt: "rolle", svarId: "S1" },
    ];
    const { okt: ny, nyRefs } = brukEndringer(start, endringer);
    expect(nyRefs.get("n1")).toBe("E3");
    expect(ny.tellere.E).toBe(3);
    expect(ny.erfaringer).toEqual([
      {
        id: "E3",
        tittel: "Kafé",
        tittelRettetAvStudent: false,
        rolle: felt("Servitør", ["S1"]),
        handling: felt(""),
        resultat: felt(""),
      },
    ]);
  });

  it("endrer ikke inputen og gir samme objekt når ingenting brukes", () => {
    const start = okt({ erfaringer: [tomErfaring("E1")] });
    const kopi = structuredClone(start);
    const resultat = brukEndringer(start, [
      { type: "settTekst", erfaring: "E9", felt: "rolle", tekst: "x" },
    ]);
    expect(resultat.okt).toBe(start);
    expect(start).toEqual(kopi);
  });

  it("forkaster ukjente og slettede erfaringer og uløste { ny }", () => {
    const start = okt({ erfaringer: [tomErfaring("E1")], slettedeErfaringer: ["E2"] });
    const { okt: ny } = brukEndringer(start, [
      { type: "settTekst", erfaring: "E2", felt: "rolle", tekst: "slettet" },
      { type: "settTekst", erfaring: "E9", felt: "rolle", tekst: "ukjent" },
      { type: "settTekst", erfaring: { ny: "n7" }, felt: "rolle", tekst: "uløst" },
      { type: "leggTilKilde", erfaring: "E2", felt: "rolle", svarId: "S1" },
    ]);
    expect(ny).toBe(start);
  });

  it("leggTilKilde godtar bare svar-ID-er fra loggen, uten duplikater", () => {
    const start = okt({ erfaringer: [tomErfaring("E1")] });
    const { okt: ny } = brukEndringer(start, [
      { type: "leggTilKilde", erfaring: "E1", felt: "handling", svarId: "A1" },
      { type: "leggTilKilde", erfaring: "E1", felt: "handling", svarId: "S9" },
      { type: "leggTilKilde", erfaring: "E1", felt: "handling", svarId: "S1" },
      { type: "leggTilKilde", erfaring: "E1", felt: "handling", svarId: "S1" },
    ]);
    expect(ny.erfaringer[0].handling.kilder).toEqual(["S1"]);
  });

  it("overskriver aldri tekst med rettetAvStudent, men kan legge til kilde", () => {
    const start = okt({
      logg: [sporsmal("A1"), svar("S1"), svar("S2")],
      erfaringer: [erfaring("E1", { rolle: felt("Min tekst", ["S1"], true) })],
    });
    const { okt: ny } = brukEndringer(start, [
      { type: "settTekst", erfaring: "E1", felt: "rolle", tekst: "Modellens tekst" },
      { type: "leggTilKilde", erfaring: "E1", felt: "rolle", svarId: "S2" },
    ]);
    expect(ny.erfaringer[0].rolle).toEqual(felt("Min tekst", ["S1", "S2"], true));
  });

  it("opprett med en ny som er brukt, ignoreres", () => {
    const { okt: ny, nyRefs } = brukEndringer(okt(), [
      { type: "opprett", ny: "n1", tittel: "Første" },
      { type: "opprett", ny: "n1", tittel: "Andre" },
    ]);
    expect(ny.erfaringer.map((e) => e.tittel)).toEqual(["Første"]);
    expect(nyRefs.get("n1")).toBe("E1");
  });

  it("__proto__ som ny-referanse er en vanlig nøkkel", () => {
    const { okt: ny, nyRefs } = brukEndringer(okt(), [
      { type: "opprett", ny: "__proto__", tittel: "Kafé" },
      { type: "settTekst", erfaring: { ny: "__proto__" }, felt: "rolle", tekst: "x" },
    ]);
    expect(nyRefs.get("__proto__")).toBe("E1");
    expect(ny.erfaringer[0].rolle.tekst).toBe("x");
  });

  it("opprett ignoreres ved MAKS_ERFARINGER fangede", () => {
    const start = okt({ erfaringer: fangede(8), tellere: { A: 1, S: 1, R: 0, E: 8, K: 0 } });
    const { okt: ny, nyRefs } = brukEndringer(start, [
      { type: "opprett", ny: "n1", tittel: "Niende" },
      { type: "settTekst", erfaring: { ny: "n1" }, felt: "rolle", tekst: "x" },
    ]);
    expect(ny).toBe(start);
    expect(nyRefs.size).toBe(0);
  });

  it("opprett ignoreres når en endring i samme svar fanger den åttende", () => {
    const erfaringer = [...fangede(7), erfaring("E8", { resultat: felt("") })];
    const start = okt({ erfaringer, tellere: { A: 1, S: 1, R: 0, E: 8, K: 0 } });
    const { okt: ny } = brukEndringer(start, [
      { type: "settTekst", erfaring: "E8", felt: "resultat", tekst: "Det gikk bra" },
      { type: "leggTilKilde", erfaring: "E8", felt: "resultat", svarId: "S1" },
      { type: "opprett", ny: "n1", tittel: "Niende" },
    ]);
    expect(ny.erfaringer).toHaveLength(8);
    expect(ny.tellere.E).toBe(8);
  });

  it("opprett ignoreres når listen er full (MAKS_LISTE)", () => {
    const erfaringer = Array.from({ length: MAKS_LISTE }, (_, i) => tomErfaring(`E${i + 1}`));
    const start = okt({ erfaringer });
    expect(brukEndringer(start, [{ type: "opprett", ny: "n1", tittel: "x" }]).okt).toBe(start);
  });
});

describe("losGjelder", () => {
  const erfaringer = [tomErfaring("E1")];
  const refs = new Map([["n1", "E1"]]);
  it.each([
    [null, null],
    ["E1", "E1"],
    ["E2", null],
    [{ ny: "n1" }, "E1"],
    [{ ny: "n2" }, null],
  ] as const)("%j → %j", (gjelder, forventet) => {
    expect(losGjelder(gjelder, erfaringer, refs)).toBe(forventet);
  });
});

describe("begrensSamtaleSvar (maks nådd)", () => {
  const svarMed = (gjelder: SamtaleSvar["sporsmal"]["gjelder"]): SamtaleSvar => ({
    sporsmal: { tekst: "Fortell om noe nytt!", gjelder },
    endringer: [
      { type: "opprett", ny: "n1", tittel: "Ny" },
      { type: "settTekst", erfaring: { ny: "n1" }, felt: "rolle", tekst: "x" },
      { type: "settTekst", erfaring: "E1", felt: "rolle", tekst: "y" },
    ],
  });
  const logg = [svar("S1")];

  it("under grensen returneres svaret uendret", () => {
    const s = svarMed({ ny: "n1" });
    expect(begrensSamtaleSvar(s, { erfaringer: fangede(7), logg })).toBe(s);
  });

  it.each([[{ ny: "n1" }], [null], ["E99"]] as const)(
    "gjelder %j: opprett og { ny } fjernes, spørsmålet viser grensen",
    (gjelder) => {
      const resultat = begrensSamtaleSvar(svarMed(gjelder), { erfaringer: fangede(8), logg });
      expect(resultat).toEqual({
        sporsmal: { tekst: MAKS_ERFARINGER_SPORSMAL, gjelder: null },
        endringer: [{ type: "settTekst", erfaring: "E1", felt: "rolle", tekst: "y" }],
      });
    },
  );

  it("et spørsmål om en eksisterende erfaring beholdes", () => {
    const resultat = begrensSamtaleSvar(svarMed("E3"), { erfaringer: fangede(8), logg });
    expect(resultat.sporsmal).toEqual({ tekst: "Fortell om noe nytt!", gjelder: "E3" });
    expect(resultat.endringer).toHaveLength(1);
  });
});

describe("begrensOppfolging (AD-16)", () => {
  const lukketE1 = [sporsmal("A1", "E1"), svar("S1"), sporsmal("A2", "E1"), sporsmal("A3", "E1")];
  const modellsvar = (gjelder: SamtaleSvar["sporsmal"]["gjelder"]): SamtaleSvar => ({
    sporsmal: { tekst: "Hva mer gjorde du?", gjelder },
    endringer: [{ type: "settTekst", erfaring: "E1", felt: "resultat", tekst: "Flere kunder" }],
  });

  it("spørsmål om en lukket erfaring byttes med OVERGANGSSPORSMAL, og endringene beholdes", () => {
    const tilstand = { erfaringer: [tomErfaring("E1")], logg: lukketE1 };
    expect(begrensOppfolging(modellsvar("E1"), tilstand)).toEqual({
      sporsmal: { tekst: OVERGANGSSPORSMAL, gjelder: null },
      endringer: modellsvar("E1").endringer,
    });
  });

  it("under grensen, om andre erfaringer og om nye erfaringer er svaret uendret", () => {
    const tilstand = { erfaringer: [tomErfaring("E1"), tomErfaring("E2")], logg: lukketE1 };
    const toSporsmal = { ...tilstand, logg: lukketE1.slice(0, 3) };
    for (const [svarFra, t] of [
      [modellsvar("E1"), toSporsmal],
      [modellsvar("E2"), tilstand],
      [modellsvar(null), tilstand],
      [modellsvar({ ny: "n1" }), tilstand],
    ] as const) {
      expect(begrensOppfolging(svarFra, t)).toBe(svarFra);
    }
  });

  it("når maks også er nådd, brukes MAKS_ERFARINGER_SPORSMAL", () => {
    const erfaringer = fangede(8);
    const logg = [svar("S1"), sporsmal("A1", "E1"), sporsmal("A2", "E1"), sporsmal("A3", "E1")];
    expect(begrensOppfolging(modellsvar("E1"), { erfaringer, logg }).sporsmal).toEqual({
      tekst: MAKS_ERFARINGER_SPORSMAL,
      gjelder: null,
    });
  });
});
