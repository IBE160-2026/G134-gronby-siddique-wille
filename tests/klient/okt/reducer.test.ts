import { describe, expect, it } from "vitest";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { oktReducer, type Handling } from "@/klient/okt/reducer";

/** Kjører handlingene i rekkefølge og sjekker at ingen tilstand muteres. */
function kjor(start: Okt, ...handlinger: Handling[]): Okt {
  return handlinger.reduce((okt, handling) => {
    const kopi = structuredClone(okt);
    const ny = oktReducer(deepFreeze(okt), handling);
    expect(okt).toEqual(kopi);
    return ny;
  }, start);
}

function deepFreeze<T>(verdi: T): T {
  if (verdi && typeof verdi === "object" && !Object.isFrozen(verdi)) {
    Object.freeze(verdi);
    for (const v of Object.values(verdi)) deepFreeze(v);
  }
  return verdi;
}

function medToErfaringer(): Okt {
  return kjor(
    tomOkt(),
    { type: "opprettErfaring", tittel: "Kafé" },
    { type: "opprettErfaring", tittel: "Fotball" },
  );
}

describe("oktReducer – ID-er", () => {
  it("første oppføringer får A1, S1, E1", () => {
    const okt = kjor(
      tomOkt(),
      { type: "leggTilSporsmal", versjon: 0, tekst: "Fortell om en jobb.", gjelder: null },
      { type: "leggTilSvar", tekst: "Jeg jobbet på kafé." },
      { type: "opprettErfaring", tittel: "Kafé" },
    );
    expect(okt.logg.map((o) => o.id)).toEqual(["A1", "S1"]);
    expect(okt.logg[0]).toEqual({
      type: "sporsmal",
      id: "A1",
      tekst: "Fortell om en jobb.",
      gjelder: null,
    });
    expect(okt.logg[1]).toEqual({ type: "svar", id: "S1", tekst: "Jeg jobbet på kafé." });
    expect(okt.erfaringer[0]).toEqual({
      id: "E1",
      tittel: "Kafé",
      tittelRettetAvStudent: false,
      rolle: { tekst: "", kilder: [], rettetAvStudent: false },
      handling: { tekst: "", kilder: [], rettetAvStudent: false },
      resultat: { tekst: "", kilder: [], rettetAvStudent: false },
    });
    expect(okt.tellere).toEqual({ A: 1, S: 1, R: 0, E: 1, K: 0 });
  });

  it("sletting gjenbruker ikke ID og fjerner ikke loggoppføringer", () => {
    const forSletting = kjor(medToErfaringer(), { type: "leggTilSvar", tekst: "Hei" });
    const okt = kjor(
      forSletting,
      { type: "slettErfaring", erfaringId: "E2" },
      { type: "opprettErfaring", tittel: "Kor" },
    );
    expect(okt.erfaringer.map((e) => e.id)).toEqual(["E1", "E3"]);
    expect(okt.slettedeErfaringer).toEqual(["E2"]);
    expect(okt.logg).toEqual(forSletting.logg);
    expect(okt.tellere.E).toBe(3);
  });

  it("sletting av ukjent eller allerede slettet erfaring gir samme tilstand", () => {
    const okt = kjor(medToErfaringer(), { type: "slettErfaring", erfaringId: "E2" });
    expect(oktReducer(okt, { type: "slettErfaring", erfaringId: "E2" })).toBe(okt);
    expect(oktReducer(okt, { type: "slettErfaring", erfaringId: "E9" })).toBe(okt);
  });
});

function medBevistabell(okt: Okt): Okt {
  return {
    ...okt,
    krav: [{ id: "K1", tekst: "Samarbeid" }],
    bevistabell: [{ kravId: "K1", bevis: [], refleksjonsforslag: "Tenk på …" }],
  };
}

describe("oktReducer – endret erfaring tømmer bevistabellen", () => {
  it("rettelse tømmer bevistabellen og øker versjon med 1", () => {
    const okt = medBevistabell(medToErfaringer());
    const ny = kjor(okt, {
      type: "leggTilRettelse",
      erfaringId: "E1",
      felt: "handling",
      tekst: "Lærte opp nye",
    });
    expect(ny.bevistabell).toBeNull();
    expect(ny.krav).toBe(okt.krav);
    expect(ny.versjon).toBe(okt.versjon + 1);
  });

  it("slettErfaring tømmer bevistabellen og øker versjon med 1", () => {
    const okt = medBevistabell(medToErfaringer());
    const ny = kjor(okt, { type: "slettErfaring", erfaringId: "E1" });
    expect(ny.bevistabell).toBeNull();
    expect(ny.krav).toBe(okt.krav);
    expect(ny.versjon).toBe(okt.versjon + 1);
  });
});

describe("oktReducer – rettelser", () => {
  it("rettelse beholder feltets kilder", () => {
    const start: Okt = {
      ...tomOkt(),
      tellere: { A: 1, S: 1, R: 0, E: 1, K: 0 },
      logg: [
        { type: "sporsmal", id: "A1", tekst: "Hva gjorde du?", gjelder: null },
        { type: "svar", id: "S1", tekst: "Jeg var skiftleder." },
      ],
      erfaringer: [
        {
          id: "E1",
          tittel: "Kafé",
          tittelRettetAvStudent: false,
          rolle: { tekst: "Skiftleder", kilder: ["S1"], rettetAvStudent: false },
          handling: { tekst: "", kilder: [], rettetAvStudent: false },
          resultat: { tekst: "", kilder: [], rettetAvStudent: false },
        },
      ],
    };
    const okt = kjor(start, {
      type: "leggTilRettelse",
      erfaringId: "E1",
      felt: "rolle",
      tekst: "Skiftleder på helg",
    });
    expect(okt.erfaringer[0].rolle).toEqual({
      tekst: "Skiftleder på helg",
      kilder: ["S1"],
      rettetAvStudent: true,
    });
  });

  it("rettelse lager R-oppføring og merker feltet som rettet", () => {
    const okt = kjor(medToErfaringer(), {
      type: "leggTilRettelse",
      erfaringId: "E1",
      felt: "rolle",
      tekst: "Skiftleder",
    });
    expect(okt.logg.at(-1)).toEqual({
      type: "rettelse",
      id: "R1",
      erfaringId: "E1",
      felt: "rolle",
      tekst: "Skiftleder",
    });
    expect(okt.erfaringer[0].rolle).toEqual({
      tekst: "Skiftleder",
      kilder: [],
      rettetAvStudent: true,
    });
    expect(okt.tellere.R).toBe(1);
  });

  it("rettelse av tittel setter tittelRettetAvStudent", () => {
    const okt = kjor(medToErfaringer(), {
      type: "leggTilRettelse",
      erfaringId: "E2",
      felt: "tittel",
      tekst: "Fotballtrener",
    });
    expect(okt.erfaringer[1].tittel).toBe("Fotballtrener");
    expect(okt.erfaringer[1].tittelRettetAvStudent).toBe(true);
  });

  it("rettelse uten faktisk endring gir samme tilstand", () => {
    const okt = medToErfaringer();
    const handling: Handling = {
      type: "leggTilRettelse",
      erfaringId: "E1",
      felt: "tittel",
      tekst: "Kafé",
    };
    expect(oktReducer(okt, handling)).toBe(okt);
  });

  it.each(["E2", "E9"])("rettelse på slettet/ukjent erfaring (%s) ignoreres", (erfaringId) => {
    const okt = kjor(medToErfaringer(), { type: "slettErfaring", erfaringId: "E2" });
    const ny = oktReducer(okt, {
      type: "leggTilRettelse",
      erfaringId,
      felt: "resultat",
      tekst: "Vant serien",
    });
    expect(ny).toBe(okt);
    expect(ny.tellere.R).toBe(0);
  });
});

describe("oktReducer – versjon og sene svar", () => {
  it("settKrav fra riktig versjon gir K1, K2", () => {
    const okt = kjor(tomOkt(2), {
      type: "settKrav",
      versjon: 2,
      krav: [{ tekst: "Samarbeid" }, { tekst: "Kundeservice" }],
    });
    expect(okt.krav).toEqual([
      { id: "K1", tekst: "Samarbeid" },
      { id: "K2", tekst: "Kundeservice" },
    ]);
    expect(okt.tellere.K).toBe(2);
  });

  it("settKrav med eldre versjon forkastes", () => {
    const okt = tomOkt(2);
    const ny = oktReducer(okt, { type: "settKrav", versjon: 1, krav: [{ tekst: "X" }] });
    expect(ny).toBe(okt);
  });

  it("leggTilSporsmal med eldre versjon forkastes", () => {
    const okt = tomOkt(1);
    const ny = oktReducer(okt, {
      type: "leggTilSporsmal",
      versjon: 0,
      tekst: "Sent",
      gjelder: null,
    });
    expect(ny).toBe(okt);
  });

  it("leggTilSporsmal beholder kjent gjelder og forkaster ukjent/slettet", () => {
    const okt = kjor(
      medToErfaringer(),
      { type: "slettErfaring", erfaringId: "E2" },
      // Slettingen økte versjonen til 1.
      { type: "leggTilSporsmal", versjon: 1, tekst: "Mer om kafé?", gjelder: "E1" },
      { type: "leggTilSporsmal", versjon: 1, tekst: "Og fotball?", gjelder: "E2" },
      { type: "leggTilSporsmal", versjon: 1, tekst: "Noe annet?", gjelder: "E7" },
    );
    expect(okt.logg.map((o) => (o.type === "sporsmal" ? o.gjelder : undefined))).toEqual([
      "E1",
      null,
      null,
    ]);
  });

  it("leggTilSporsmal med nyere versjon enn økten forkastes", () => {
    const okt = tomOkt(1);
    const ny = oktReducer(okt, {
      type: "leggTilSporsmal",
      versjon: 2,
      tekst: "Fra fremtiden",
      gjelder: null,
    });
    expect(ny).toBe(okt);
  });

  it("settKrav tømmer en gammel bevistabell", () => {
    const start: Okt = {
      ...tomOkt(2),
      bevistabell: [{ kravId: "K1", bevis: [], refleksjonsforslag: "Tenk på …" }],
    };
    const okt = kjor(start, { type: "settKrav", versjon: 2, krav: [{ tekst: "A" }] });
    expect(okt.bevistabell).toBeNull();
  });

  it("et dobbelt settKrav på samme versjon forkastes", () => {
    const okt = kjor(tomOkt(2), {
      type: "settKrav",
      versjon: 2,
      krav: [{ tekst: "A" }, { tekst: "B" }],
    });
    const ny = oktReducer(okt, {
      type: "settKrav",
      versjon: 2,
      krav: [{ tekst: "C" }, { tekst: "D" }],
    });
    expect(ny).toBe(okt);
    expect(ny.krav?.map((k) => k.id)).toEqual(["K1", "K2"]);
  });

  it("krav etter nullstilling avvises hvis forespørselen kom fra før", () => {
    const okt = kjor(tomOkt(), { type: "nullstill", arsak: "annonseEndret" });
    expect(oktReducer(okt, { type: "settKrav", versjon: 0, krav: [{ tekst: "X" }] })).toBe(okt);
  });
});

describe("oktReducer – nullstilling og ny økt", () => {
  function oktMedKrav(): Okt {
    return kjor(
      tomOkt(),
      { type: "startOkt", modus: "demo" },
      { type: "leggTilSporsmal", versjon: 0, tekst: "Hei?", gjelder: null },
      { type: "leggTilSvar", tekst: "Hei" },
      { type: "opprettErfaring", tittel: "Kafé" },
      { type: "settAnnonse", tekst: "Vi søker …" },
      { type: "settKrav", versjon: 1, krav: [{ tekst: "Samarbeid" }] },
    );
  }

  it("nullstill annonseEndret tømmer krav og bevistabell, beholder annonsen", () => {
    const okt = medBevistabell(oktMedKrav());
    const ny = kjor(okt, { type: "nullstill", arsak: "annonseEndret" });
    expect(ny.krav).toBeNull();
    expect(ny.bevistabell).toBeNull();
    expect(ny.annonse).toBe("Vi søker …");
    expect(ny.versjon).toBe(okt.versjon + 1);
    expect(ny.tellere).toEqual(okt.tellere);
  });

  it("settAnnonse med ny tekst nullstiller krav og øker versjon", () => {
    const okt = medBevistabell(oktMedKrav());
    const ny = kjor(okt, { type: "settAnnonse", tekst: "Annen annonse" });
    expect(ny.annonse).toBe("Annen annonse");
    expect(ny.krav).toBeNull();
    expect(ny.bevistabell).toBeNull();
    expect(ny.versjon).toBe(okt.versjon + 1);
  });

  it("settAnnonse med samme tekst gir samme tilstand", () => {
    const okt = oktMedKrav();
    expect(oktReducer(okt, { type: "settAnnonse", tekst: "Vi søker …" })).toBe(okt);
  });

  it("nyOkt gir tom økt med tellere på 0 og versjon + 1", () => {
    const okt = oktMedKrav();
    const ny = kjor(okt, { type: "nyOkt" });
    expect(ny).toEqual(tomOkt(okt.versjon + 1));
    const etterpa = kjor(ny, {
      type: "leggTilSporsmal",
      versjon: ny.versjon,
      tekst: "Første",
      gjelder: null,
    });
    expect(etterpa.logg[0].id).toBe("A1");
  });

  it.each(["erfaringEndret", "samtaleFortsatt"] as const)(
    "nullstill %s tømmer bevistabellen, beholder krav og øker versjon",
    (arsak) => {
      const okt = medBevistabell(oktMedKrav());
      const ny = kjor(okt, { type: "nullstill", arsak });
      expect(ny.bevistabell).toBeNull();
      expect(ny.krav).toBe(okt.krav);
      expect(ny.versjon).toBe(okt.versjon + 1);
    },
  );

  it("startOkt virker igjen etter nyOkt", () => {
    const okt = kjor(oktMedKrav(), { type: "nyOkt" }, { type: "startOkt", modus: "ekte" });
    expect(okt.modus).toBe("ekte");
  });

  it("startOkt setter modus bare én gang", () => {
    const okt = kjor(tomOkt(), { type: "startOkt", modus: "ekte" });
    expect(okt.modus).toBe("ekte");
    expect(oktReducer(okt, { type: "startOkt", modus: "demo" })).toBe(okt);
  });
});

describe("oktReducer – mottaSamtaleSvar (story 1.8)", () => {
  const startet = () => kjor(tomOkt(), { type: "startOkt", modus: "ekte" });

  const apning = (versjon = 0): Handling => ({
    type: "mottaSamtaleSvar",
    versjon,
    svar: null,
    sporsmal: { tekst: "Hei! Fortell om noe du har gjort.", gjelder: null },
    endringer: [],
  });

  it("åpningsspørsmålet i tom logg gir A1", () => {
    const okt = kjor(startet(), apning());
    expect(okt.logg).toEqual([
      { type: "sporsmal", id: "A1", tekst: "Hei! Fortell om noe du har gjort.", gjelder: null },
    ]);
    expect(okt.tellere.A).toBe(1);
  });

  it("et dobbelt åpningsspørsmål (StrictMode) forkastes", () => {
    const okt = kjor(startet(), apning());
    expect(oktReducer(okt, apning())).toBe(okt);
  });

  it("svar: S1, endringene og A2 i den rekkefølgen", () => {
    const okt = kjor(startet(), apning(), {
      type: "mottaSamtaleSvar",
      versjon: 0,
      svar: { id: "S1", tekst: "Jeg jobbet på kafé." },
      sporsmal: { tekst: "Hva gjorde du der?", gjelder: { ny: "n1" } },
      endringer: [
        { type: "opprett", ny: "n1", tittel: "Kafé" },
        { type: "settTekst", erfaring: { ny: "n1" }, felt: "rolle", tekst: "Servitør" },
        { type: "leggTilKilde", erfaring: { ny: "n1" }, felt: "rolle", svarId: "S1" },
      ],
    });
    expect(okt.logg.map((o) => o.id)).toEqual(["A1", "S1", "A2"]);
    expect(okt.logg[1]).toEqual({ type: "svar", id: "S1", tekst: "Jeg jobbet på kafé." });
    expect(okt.logg[2]).toEqual({
      type: "sporsmal",
      id: "A2",
      tekst: "Hva gjorde du der?",
      gjelder: "E1",
    });
    expect(okt.erfaringer).toHaveLength(1);
    expect(okt.erfaringer[0].rolle).toEqual({
      tekst: "Servitør",
      kilder: ["S1"],
      rettetAvStudent: false,
    });
    expect(okt.tellere).toEqual({ A: 2, S: 1, R: 0, E: 1, K: 0 });
  });

  it("endrer ikke versjon (nullstilling er opp til «Fortsett samtalen»)", () => {
    const okt = kjor(startet(), apning(), {
      type: "mottaSamtaleSvar",
      versjon: 0,
      svar: { id: "S1", tekst: "Svar" },
      sporsmal: { tekst: "Neste?", gjelder: null },
      endringer: [],
    });
    expect(okt.versjon).toBe(0);
  });

  it("ved MAKS_ERFARINGER fangede: opprett forkastes og gjelder { ny } blir null", () => {
    const felt = { tekst: "t", kilder: ["S1"], rettetAvStudent: false };
    const fangede = Array.from({ length: 8 }, (_, i) => ({
      id: `E${i + 1}`,
      tittel: `E${i + 1}`,
      tittelRettetAvStudent: false,
      rolle: felt,
      handling: felt,
      resultat: felt,
    }));
    const base = kjor(startet(), apning(), {
      type: "mottaSamtaleSvar",
      versjon: 0,
      svar: { id: "S1", tekst: "Svar" },
      sporsmal: { tekst: "Neste?", gjelder: null },
      endringer: [],
    });
    const fylt: Okt = { ...base, erfaringer: fangede, tellere: { ...base.tellere, E: 8 } };
    const okt = kjor(fylt, {
      type: "mottaSamtaleSvar",
      versjon: 0,
      svar: { id: "S2", tekst: "En ny ting" },
      sporsmal: { tekst: "Fortell om den nye?", gjelder: { ny: "n1" } },
      endringer: [{ type: "opprett", ny: "n1", tittel: "Ny" }],
    });
    expect(okt.erfaringer).toHaveLength(8);
    expect(okt.tellere.E).toBe(8);
    expect(okt.logg.at(-1)).toMatchObject({ id: "A3", gjelder: null });
  });

  it("ukjent { ny } og ukjent ID i gjelder blir null", () => {
    const base = kjor(startet(), apning());
    for (const gjelder of [{ ny: "n9" }, "E4"]) {
      const okt = kjor(base, {
        type: "mottaSamtaleSvar",
        versjon: 0,
        svar: { id: "S1", tekst: "Svar" },
        sporsmal: { tekst: "Neste?", gjelder },
        endringer: [],
      });
      expect(okt.logg.at(-1)).toMatchObject({ id: "A2", gjelder: null });
    }
  });

  it("forkastes ved annen versjon", () => {
    const okt = kjor(startet(), apning());
    const svar: Handling = {
      type: "mottaSamtaleSvar",
      versjon: 1,
      svar: { id: "S1", tekst: "Svar" },
      sporsmal: { tekst: "Neste?", gjelder: null },
      endringer: [],
    };
    expect(oktReducer(okt, svar)).toBe(okt);
    expect(oktReducer(tomOkt(1), apning(0))).toEqual(tomOkt(1));
  });

  it("forkastes når svarId ikke lenger er neste S-ID", () => {
    const okt = kjor(startet(), apning(), { type: "leggTilSvar", tekst: "Et annet svar" });
    const utdatert: Handling = {
      type: "mottaSamtaleSvar",
      versjon: 0,
      svar: { id: "S1", tekst: "Svar" },
      sporsmal: { tekst: "Neste?", gjelder: null },
      endringer: [],
    };
    expect(oktReducer(okt, utdatert)).toBe(okt);
  });
});
