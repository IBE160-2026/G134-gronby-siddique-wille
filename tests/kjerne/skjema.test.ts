import { describe, expect, it } from "vitest";

import {
  MAKS_ANNONSE_TEGN,
  MAKS_LISTE,
  MAKS_LOGG_OPPFORINGER,
  MAKS_TEKST_TEGN,
} from "@/kjerne/regler";
import {
  BevisForesporsel,
  BevisModellSvar,
  BevisSvar,
  DemoManusSvar,
  FEILKODER,
  FeilSvar,
  KravForesporsel,
  KravModellSvar,
  KravSvar,
  SamtaleModellSvar,
  SamtaleForesporsel,
  SamtaleSvar,
  StatusSvar,
  type FeilKode,
} from "@/kjerne/skjema";

const tomtFelt = { tekst: "", kilder: [], rettetAvStudent: false };
const erfaring = {
  id: "E1",
  tittel: "Kasse",
  tittelRettetAvStudent: false,
  rolle: { tekst: "Kasserer", kilder: ["S1"], rettetAvStudent: false },
  handling: tomtFelt,
  resultat: tomtFelt,
};
const logg = [
  { type: "sporsmal", id: "A1", tekst: "Hva gjorde du?", gjelder: null },
  { type: "svar", id: "S1", tekst: "Jeg jobbet i kassa." },
  { type: "rettelse", id: "R1", erfaringId: "E1", felt: "tittel", tekst: "Kassa" },
];
const samtale = { modus: "ekte", versjon: 0, logg, erfaringer: [erfaring], slettedeErfaringer: [] };

describe("FEILKODER (AD-12)", () => {
  it.each([
    ["modell_feil", 503],
    ["ugyldig_svar", 502],
    ["mangler_nokkel", 400],
    ["ugyldig_foresporsel", 400],
  ] as const)("%s gir status %i og et gyldig FeilSvar", (kode: FeilKode, status) => {
    expect(FEILKODER[kode].status).toBe(status);
    const svar = { feil: { kode, melding: FEILKODER[kode].melding } };
    expect(FeilSvar.parse(svar)).toEqual(svar);
  });

  it("har ikke andre koder", () => {
    expect(Object.keys(FEILKODER).sort()).toEqual(
      ["mangler_nokkel", "modell_feil", "ugyldig_foresporsel", "ugyldig_svar"],
    );
  });

  it("avviser ukjent kode", () => {
    expect(FeilSvar.safeParse({ feil: { kode: "noe_annet", melding: "x" } }).success).toBe(false);
  });
});

describe("StatusSvar", () => {
  it("parser { harNokkel, harDemodata }", () => {
    expect(StatusSvar.parse({ harNokkel: true, harDemodata: false })).toEqual({
      harNokkel: true,
      harDemodata: false,
    });
  });
});

describe("SamtaleForesporsel", () => {
  it("parser en gyldig forespørsel", () => {
    expect(SamtaleForesporsel.safeParse(samtale).success).toBe(true);
  });

  it.each([
    ["ukjent modus", { ...samtale, modus: "test" }, ["modus"]],
    ["negativ versjon", { ...samtale, versjon: -1 }, ["versjon"]],
    [
      "erfarings-ID uten prefiks",
      { ...samtale, slettedeErfaringer: ["1"] },
      ["slettedeErfaringer", 0],
    ],
    [
      "kilde som ikke er svar-ID",
      { ...samtale, erfaringer: [{ ...erfaring, rolle: { ...erfaring.rolle, kilder: ["A1"] } }] },
      ["erfaringer", 0, "rolle", "kilder", 0],
    ],
    [
      "for lang svartekst",
      { ...samtale, logg: [{ type: "svar", id: "S1", tekst: "x".repeat(MAKS_TEKST_TEGN + 1) }] },
      ["logg", 0, "tekst"],
    ],
    [
      "for lang logg",
      {
        ...samtale,
        logg: Array.from({ length: MAKS_LOGG_OPPFORINGER + 1 }, (_, i) => ({
          type: "svar",
          id: `S${i + 1}`,
          tekst: "ja",
        })),
      },
      ["logg"],
    ],
    [
      "sporsmal med gjelder uten E-prefiks",
      { ...samtale, logg: [{ type: "sporsmal", id: "A1", tekst: "?", gjelder: "1" }] },
      ["logg", 0, "gjelder"],
    ],
    [
      "rettelse med ukjent felt",
      { ...samtale, logg: [{ ...logg[2], felt: "navn" }] },
      ["logg", 0, "felt"],
    ],
    [
      "rettelse med ugyldig erfaringId",
      { ...samtale, logg: [{ ...logg[2], erfaringId: "K1" }] },
      ["logg", 0, "erfaringId"],
    ],
    [
      "erfaringstittel over MAKS_TEKST_TEGN",
      { ...samtale, erfaringer: [{ ...erfaring, tittel: "x".repeat(MAKS_TEKST_TEGN + 1) }] },
      ["erfaringer", 0, "tittel"],
    ],
    [
      "slettedeErfaringer over MAKS_LISTE",
      {
        ...samtale,
        slettedeErfaringer: Array.from({ length: MAKS_LISTE + 1 }, (_, i) => `E${i + 1}`),
      },
      ["slettedeErfaringer"],
    ],
    ["versjon som ikke er heltall", { ...samtale, versjon: 1.5 }, ["versjon"]],
    [
      "for mange erfaringer",
      { ...samtale, erfaringer: Array.from({ length: MAKS_LISTE + 1 }, () => erfaring) },
      ["erfaringer"],
    ],
  ])("avviser %s med Zod-sti", (_navn, input, sti) => {
    const resultat = SamtaleForesporsel.safeParse(input);
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(sti);
  });
});

describe("SamtaleSvar", () => {
  it("parser spørsmål om ny erfaring med endringer", () => {
    const svar = {
      sporsmal: { tekst: "Hva var rollen din?", gjelder: { ny: "n1" } },
      endringer: [
        { type: "opprett", ny: "n1", tittel: "Kasse" },
        { type: "leggTilKilde", erfaring: { ny: "n1" }, felt: "handling", svarId: "S1" },
        { type: "settTekst", erfaring: "E1", felt: "resultat", tekst: "Færre feil" },
      ],
    };
    expect(SamtaleSvar.parse(svar)).toEqual(svar);
  });

  it.each([null, "E1"])("tar imot gjelder = %s", (gjelder) => {
    expect(
      SamtaleSvar.safeParse({ sporsmal: { tekst: "?", gjelder }, endringer: [] }).success,
    ).toBe(true);
  });

  it("avviser ukjent endringstype", () => {
    const resultat = SamtaleSvar.safeParse({
      sporsmal: { tekst: "?", gjelder: null },
      endringer: [{ type: "slett", erfaring: "E1" }],
    });
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(["endringer", 0, "type"]);
  });
});

describe("KravForesporsel og KravSvar", () => {
  const krav = { modus: "demo", versjon: 2, annonse: "Vi søker en student." };

  it("parser en gyldig forespørsel", () => {
    expect(KravForesporsel.safeParse(krav).success).toBe(true);
  });

  it("avviser annonse over MAKS_ANNONSE_TEGN med Zod-sti", () => {
    const resultat = KravForesporsel.safeParse({
      ...krav,
      annonse: "x".repeat(MAKS_ANNONSE_TEGN + 1),
    });
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(["annonse"]);
  });

  it("tar imot annonse på nøyaktig MAKS_ANNONSE_TEGN", () => {
    expect(
      KravForesporsel.safeParse({ ...krav, annonse: "x".repeat(MAKS_ANNONSE_TEGN) }).success,
    ).toBe(true);
  });

  it("krav-svaret har bare tekst; reduceren tildeler K-ID", () => {
    expect(KravSvar.parse({ krav: [{ tekst: "Samarbeid", id: "K9" }] })).toEqual({
      krav: [{ tekst: "Samarbeid" }],
    });
  });
});

describe("ruteskjemaene har grensene, modellskjemaene ikke", () => {
  const lang = "x".repeat(MAKS_TEKST_TEGN + 1);
  const sporsmal = { tekst: "?", gjelder: null };
  const opprett = (i: number) => ({ type: "opprett", ny: `n${i}`, tittel: "t" });

  it.each([
    [
      "for lang spørsmålstekst",
      SamtaleModellSvar,
      SamtaleSvar,
      { sporsmal: { tekst: lang, gjelder: null }, endringer: [] },
      ["sporsmal", "tekst"],
    ],
    [
      "for lang tekst i settTekst",
      SamtaleModellSvar,
      SamtaleSvar,
      {
        sporsmal,
        endringer: [{ type: "settTekst", erfaring: "E1", felt: "rolle", tekst: lang }],
      },
      ["endringer", 0, "tekst"],
    ],
    [
      "for mange endringer",
      SamtaleModellSvar,
      SamtaleSvar,
      { sporsmal, endringer: Array.from({ length: MAKS_LISTE + 1 }, (_, i) => opprett(i)) },
      ["endringer"],
    ],
    [
      "for mange krav",
      KravModellSvar,
      KravSvar,
      { krav: Array.from({ length: MAKS_LISTE + 1 }, () => ({ tekst: "k" })) },
      ["krav"],
    ],
    ["for lang kravtekst", KravModellSvar, KravSvar, { krav: [{ tekst: lang }] }, ["krav", 0, "tekst"]],
  ] as const)("%s: modellsvar godtas, rutesvar avvises", (_navn, modell, rute, input, sti) => {
    expect(modell.safeParse(input).success).toBe(true);
    const resultat = rute.safeParse(input);
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(sti);
  });

  const rad = { kravId: "K1", bevis: [], refleksjonsforslag: "" };

  it.each([
    ["for lang refleksjon", { bevistabell: [{ ...rad, refleksjonsforslag: lang }] }, ["bevistabell", 0, "refleksjonsforslag"]],
    [
      "for mange bevis i en rad",
      {
        bevistabell: [
          {
            ...rad,
            bevis: Array.from({ length: MAKS_LISTE + 1 }, () => ({
              erfaringId: "E1",
              svarId: "S1",
              start: 0,
              slutt: 1,
            })),
          },
        ],
      },
      ["bevistabell", 0, "bevis"],
    ],
    ["for mange rader", { bevistabell: Array.from({ length: MAKS_LISTE + 1 }, () => rad) }, ["bevistabell"]],
  ])("BevisSvar avviser %s", (_navn, input, sti) => {
    const resultat = BevisSvar.safeParse(input);
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(sti);
  });

  it("BevisModellSvar godtar lang refleksjon og mange bevis", () => {
    expect(
      BevisModellSvar.safeParse({
        bevis: Array.from({ length: MAKS_LISTE + 1 }, () => ({
          kravId: "K1",
          erfaringId: "E1",
          svarId: "S1",
          sitat: lang,
        })),
        refleksjonsforslag: [{ kravId: "K1", tekst: lang }],
      }).success,
    ).toBe(true);
  });

  it.each([
    ["for langt svar", { svar: [lang] }, ["svar", 0]],
    ["for mange svar", { svar: Array.from({ length: MAKS_LOGG_OPPFORINGER + 1 }, () => "ja") }, ["svar"]],
  ])("DemoManusSvar avviser %s", (_navn, input, sti) => {
    const resultat = DemoManusSvar.safeParse(input);
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(sti);
  });

  it.each([SamtaleModellSvar, SamtaleSvar])("avviser settTekst med felt \"tittel\"", (skjema) => {
    const resultat = skjema.safeParse({
      sporsmal,
      endringer: [{ type: "settTekst", erfaring: "E1", felt: "tittel", tekst: "t" }],
    });
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(["endringer", 0, "felt"]);
  });
});

describe("ID-grenser", () => {
  const medSvarId = (id: string) => ({
    ...samtale,
    logg: [{ type: "svar", id, tekst: "ja" }],
  });

  it.each(["S0", "S01", "S" + "1".repeat(10), "s1", "A1"])("avviser svar-ID %s", (id) => {
    const resultat = SamtaleForesporsel.safeParse(medSvarId(id));
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(["logg", 0, "id"]);
  });

  it.each(["S1", "S10", "S" + "9".repeat(9)])("tar imot svar-ID %s", (id) => {
    expect(SamtaleForesporsel.safeParse(medSvarId(id)).success).toBe(true);
  });

  it("tar imot tekst på nøyaktig MAKS_TEKST_TEGN", () => {
    expect(
      SamtaleForesporsel.safeParse({
        ...samtale,
        logg: [{ type: "svar", id: "S1", tekst: "x".repeat(MAKS_TEKST_TEGN) }],
      }).success,
    ).toBe(true);
  });
});

describe("modellskjemaene har ingen ID-regex eller lengdegrenser", () => {
  const lang = "x".repeat(MAKS_TEKST_TEGN + 1);

  it("SamtaleModellSvar tar imot ukjente ID-er og lang tekst", () => {
    expect(
      SamtaleModellSvar.safeParse({
        sporsmal: { tekst: lang, gjelder: "E0" },
        endringer: [
          { type: "opprett", ny: "x", tittel: lang },
          { type: "leggTilKilde", erfaring: "x", felt: "rolle", svarId: "E0" },
          { type: "settTekst", erfaring: "E0", felt: "resultat", tekst: lang },
        ],
      }).success,
    ).toBe(true);
  });

  it("KravModellSvar tar imot lang tekst", () => {
    expect(KravModellSvar.safeParse({ krav: [{ tekst: lang }] }).success).toBe(true);
  });

  it("BevisModellSvar tar imot ukjente ID-er og lang tekst", () => {
    expect(
      BevisModellSvar.safeParse({
        bevis: [{ kravId: "x", erfaringId: "E0", svarId: "S01", sitat: lang }],
        refleksjonsforslag: [{ kravId: "K0", tekst: lang }],
      }).success,
    ).toBe(true);
  });
});

describe("bevis", () => {
  const bevis = {
    modus: "ekte",
    versjon: 1,
    krav: [{ id: "K1", tekst: "Samarbeid" }],
    erfaringer: [erfaring],
    logg,
  };

  it("parser en gyldig forespørsel", () => {
    expect(BevisForesporsel.safeParse(bevis).success).toBe(true);
  });

  it.each([
    [
      "krav over MAKS_LISTE",
      {
        ...bevis,
        krav: Array.from({ length: MAKS_LISTE + 1 }, (_, i) => ({ id: `K${i + 1}`, tekst: "k" })),
      },
      ["krav"],
    ],
    ["krav-ID uten prefiks", { ...bevis, krav: [{ id: "1", tekst: "k" }] }, ["krav", 0, "id"]],
    [
      "kravtekst over MAKS_TEKST_TEGN",
      { ...bevis, krav: [{ id: "K1", tekst: "x".repeat(MAKS_TEKST_TEGN + 1) }] },
      ["krav", 0, "tekst"],
    ],
  ])("avviser %s med Zod-sti", (_navn, input, sti) => {
    const resultat = BevisForesporsel.safeParse(input);
    expect(resultat.success).toBe(false);
    expect(resultat.error?.issues[0]?.path).toEqual(sti);
  });

  it("modellsvaret har sitat og refleksjonsforslag", () => {
    const svar = {
      bevis: [{ kravId: "K1", erfaringId: "E1", svarId: "S1", sitat: "jobbet i kassa" }],
      refleksjonsforslag: [{ kravId: "K2", tekst: "Tenk på …" }],
    };
    expect(BevisModellSvar.parse(svar)).toEqual(svar);
  });

  it("rutesvaret er en bevistabell", () => {
    const svar = {
      bevistabell: [
        {
          kravId: "K1",
          bevis: [{ erfaringId: "E1", svarId: "S1", start: 4, slutt: 18 }],
          refleksjonsforslag: "",
        },
      ],
    };
    expect(BevisSvar.parse(svar)).toEqual(svar);
  });
});

describe("DemoManusSvar", () => {
  it("parser en liste med svar", () => {
    expect(DemoManusSvar.parse({ svar: ["a", "b"] })).toEqual({ svar: ["a", "b"] });
  });
});
