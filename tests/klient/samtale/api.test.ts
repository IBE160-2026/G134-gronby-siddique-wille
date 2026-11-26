import { describe, expect, it, vi } from "vitest";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { FEILKODER, SamtaleForesporsel } from "@/kjerne/skjema";
import { oktReducer, type Handling } from "@/klient/okt/reducer";
import { hentSporsmal, lagForesporsel, sendSamtale, tilMeldinger } from "@/klient/samtale/api";

function okt(): Okt {
  return {
    ...tomOkt(2),
    modus: "ekte",
    tellere: { A: 1, S: 0, R: 0, E: 0, K: 0 },
    logg: [{ type: "sporsmal", id: "A1", tekst: "Hei?", gjelder: null }],
  };
}

function falskFetch(svar: () => Response | Promise<Response>) {
  return vi.fn(async () => svar()) as unknown as typeof globalThis.fetch;
}

describe("lagForesporsel", () => {
  it("legger svaret til med neste S-ID uten å endre økten", () => {
    const start = okt();
    const kopi = structuredClone(start);
    const { foresporsel, svar } = lagForesporsel(start, "Jeg jobbet på kafé.");
    expect(svar).toEqual({ id: "S1", tekst: "Jeg jobbet på kafé." });
    expect(foresporsel.versjon).toBe(2);
    expect(foresporsel.modus).toBe("ekte");
    expect(foresporsel.logg.at(-1)).toEqual({ type: "svar", id: "S1", tekst: "Jeg jobbet på kafé." });
    expect(start).toEqual(kopi);
    expect(SamtaleForesporsel.safeParse(foresporsel).success).toBe(true);
  });

  it("uten svar: åpningsspørsmålet, loggen uendret", () => {
    const { foresporsel, svar } = lagForesporsel({ ...tomOkt(), modus: "demo" });
    expect(svar).toBeNull();
    expect(foresporsel.logg).toEqual([]);
    expect(foresporsel.modus).toBe("demo");
  });

  it("kaster når økten ikke er startet", () => {
    expect(() => lagForesporsel(tomOkt())).toThrow();
  });
});

describe("hentSporsmal", () => {
  const foresporsel = lagForesporsel(okt(), "Svar").foresporsel;
  const gyldig = { sporsmal: { tekst: "Hva gjorde du?", gjelder: null }, endringer: [] };

  it("sender POST til /api/samtale og gir gyldig svar", async () => {
    const fetch = falskFetch(() => Response.json(gyldig));
    expect(await hentSporsmal(foresporsel, { fetch })).toEqual({ ok: true, svar: gyldig });
    const [url, init] = vi.mocked(fetch).mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/samtale");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual(foresporsel);
  });

  it.each(Object.entries(FEILKODER))("feilsvar %s gir koden", async (kode, { status, melding }) => {
    const fetch = falskFetch(() => Response.json({ feil: { kode, melding } }, { status }));
    expect(await hentSporsmal(foresporsel, { fetch })).toEqual({ ok: false, kode });
  });

  it("nettverksfeil gir nettverk", async () => {
    const fetch = falskFetch(() => {
      throw new TypeError("fetch failed");
    });
    expect(await hentSporsmal(foresporsel, { fetch })).toEqual({ ok: false, kode: "nettverk" });
  });

  it.each([
    ["200 med feil form", () => Response.json({ sporsmal: "feil" })],
    ["200 over grensen", () => Response.json({ ...gyldig, sporsmal: { tekst: "x".repeat(5001), gjelder: null } })],
    ["500 uten JSON", () => new Response("Internal Server Error", { status: 500 })],
    ["500 med ukjent form", () => Response.json({ melding: "x" }, { status: 500 })],
  ])("%s gir ukjent", async (_navn, svar) => {
    expect(await hentSporsmal(foresporsel, { fetch: falskFetch(svar) })).toEqual({
      ok: false,
      kode: "ukjent",
    });
  });
});

describe("tilMeldinger", () => {
  it("sporsmal → assistent, svar → student, rettelse vises ikke", () => {
    expect(
      tilMeldinger([
        { type: "sporsmal", id: "A1", tekst: "Hei?", gjelder: null },
        { type: "svar", id: "S1", tekst: "Hei!" },
        { type: "rettelse", id: "R1", erfaringId: "E1", felt: "rolle", tekst: "x" },
      ]),
    ).toEqual([
      { id: "A1", rolle: "assistent", tekst: "Hei?" },
      { id: "S1", rolle: "student", tekst: "Hei!" },
    ]);
  });
});

describe("sendSamtale med ekte reducer", () => {
  /** Kjører dispatch mot den ekte reduceren og holder på økten. */
  function butikk(start: Okt) {
    const tilstand = { okt: start };
    const dispatch = (h: Handling) => {
      tilstand.okt = oktReducer(tilstand.okt, h);
    };
    return { tilstand, dispatch };
  }

  const neste = { sporsmal: { tekst: "Hva gjorde du der?", gjelder: null }, endringer: [] };

  it("suksess gir loggen [A1, S1, A2] med svaret som ble sendt", async () => {
    const { tilstand, dispatch } = butikk(okt());
    const { foresporsel, svar } = lagForesporsel(tilstand.okt, "Jeg jobbet på kafé.");
    const fetch = falskFetch(() => Response.json(neste));
    expect(await sendSamtale(foresporsel, svar, dispatch, { fetch })).toEqual({ ok: true });
    expect(tilstand.okt.logg).toEqual([
      { type: "sporsmal", id: "A1", tekst: "Hei?", gjelder: null },
      { type: "svar", id: "S1", tekst: "Jeg jobbet på kafé." },
      { type: "sporsmal", id: "A2", tekst: "Hva gjorde du der?", gjelder: null },
    ]);
  });

  it("feil lar økten stå, og et nytt forsøk sender identisk kropp", async () => {
    const start = okt();
    const { tilstand, dispatch } = butikk(start);
    const { foresporsel, svar } = lagForesporsel(start, "Svar");
    let gang = 0;
    const fetch = falskFetch(() =>
      gang++ === 0
        ? Response.json({ feil: { kode: "modell_feil", melding: "m" } }, { status: 503 })
        : Response.json(neste),
    );

    expect(await sendSamtale(foresporsel, svar, dispatch, { fetch })).toEqual({
      ok: false,
      kode: "modell_feil",
    });
    expect(tilstand.okt).toBe(start);

    expect(await sendSamtale(foresporsel, svar, dispatch, { fetch })).toEqual({ ok: true });
    const kropper = vi
      .mocked(fetch)
      .mock.calls.map((k) => String((k as unknown as [string, RequestInit])[1].body));
    expect(kropper).toHaveLength(2);
    expect(kropper[1]).toBe(kropper[0]);
    expect(tilstand.okt.logg.map((o) => o.id)).toEqual(["A1", "S1", "A2"]);
  });

  it("åpningsspørsmål med svar: null gir A1 i tom logg", async () => {
    const { tilstand, dispatch } = butikk({ ...tomOkt(), modus: "ekte" });
    const { foresporsel, svar } = lagForesporsel(tilstand.okt);
    expect(svar).toBeNull();
    const fetch = falskFetch(() => Response.json(neste));
    expect(await sendSamtale(foresporsel, svar, dispatch, { fetch })).toEqual({ ok: true });
    expect(tilstand.okt.logg).toEqual([
      { type: "sporsmal", id: "A1", tekst: "Hva gjorde du der?", gjelder: null },
    ]);
  });

  it("avbrutt kall dispatcher ingenting", async () => {
    const start = okt();
    const { tilstand, dispatch } = butikk(start);
    const { foresporsel, svar } = lagForesporsel(start, "Svar");
    const kontroller = new AbortController();
    const fetch = falskFetch(() => {
      kontroller.abort();
      return Response.json(neste);
    });
    expect(
      await sendSamtale(foresporsel, svar, dispatch, { fetch, signal: kontroller.signal }),
    ).toEqual({ ok: false, kode: "avbrutt" });
    expect(tilstand.okt).toBe(start);
  });
});
