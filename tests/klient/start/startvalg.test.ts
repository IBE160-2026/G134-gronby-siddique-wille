import { describe, expect, it, vi } from "vitest";

import { tomOkt } from "@/kjerne/okt";
import { oktReducer } from "@/klient/okt/reducer";
import {
  UKJENT_STATUS,
  hentStartstatus,
  knappetilstand,
  starthandlinger,
  tolkStatus,
} from "@/klient/start/startvalg";

describe("knappetilstand", () => {
  it("deaktiverer alt og viser ingen meldinger mens status lastes", () => {
    for (const avkrysset of [false, true]) {
      expect(knappetilstand(null, avkrysset)).toEqual({
        ekteAktiv: false,
        demoAktiv: false,
        visManglerNokkel: false,
        visManglerDemodata: false,
      });
    }
  });

  // Alle kombinasjoner av nøkkel, demodata og avkrysning.
  const tabell = [
    { harNokkel: false, harDemodata: false, avkrysset: false, ekte: false, demo: false },
    { harNokkel: false, harDemodata: false, avkrysset: true, ekte: false, demo: false },
    { harNokkel: false, harDemodata: true, avkrysset: false, ekte: false, demo: true },
    { harNokkel: false, harDemodata: true, avkrysset: true, ekte: false, demo: true },
    { harNokkel: true, harDemodata: false, avkrysset: false, ekte: false, demo: false },
    { harNokkel: true, harDemodata: false, avkrysset: true, ekte: true, demo: false },
    { harNokkel: true, harDemodata: true, avkrysset: false, ekte: false, demo: true },
    { harNokkel: true, harDemodata: true, avkrysset: true, ekte: true, demo: true },
  ];

  it.each(tabell)(
    "nøkkel=$harNokkel demodata=$harDemodata avkrysset=$avkrysset → ekte=$ekte demo=$demo",
    ({ harNokkel, harDemodata, avkrysset, ekte, demo }) => {
      expect(knappetilstand({ harNokkel, harDemodata }, avkrysset)).toEqual({
        ekteAktiv: ekte,
        demoAktiv: demo,
        visManglerNokkel: !harNokkel,
        visManglerDemodata: !harDemodata,
      });
    },
  );
});

describe("tolkStatus", () => {
  it("godtar et gyldig svar", () => {
    expect(tolkStatus({ harNokkel: true, harDemodata: false })).toEqual({
      harNokkel: true,
      harDemodata: false,
    });
  });

  it.each([null, undefined, "ja", {}, { harNokkel: "true", harDemodata: true }, { harNokkel: true }])(
    "gir ukjent status for %j",
    (data) => {
      expect(tolkStatus(data)).toEqual(UKJENT_STATUS);
    },
  );
});

describe("hentStartstatus", () => {
  const svar = (body: unknown, ok = true) =>
    ({ ok, json: async () => body }) as unknown as Response;

  it("henter /api/status uten cache og tolker svaret", async () => {
    const hent = vi.fn(async () => svar({ harNokkel: true, harDemodata: true }));
    await expect(hentStartstatus(hent as unknown as typeof fetch)).resolves.toEqual({
      harNokkel: true,
      harDemodata: true,
    });
    expect(hent).toHaveBeenCalledWith("/api/status", expect.objectContaining({ cache: "no-store" }));
  });

  it("gir ukjent status ved feilstatus", async () => {
    const hent = async () => svar({ harNokkel: true, harDemodata: true }, false);
    await expect(hentStartstatus(hent as unknown as typeof fetch)).resolves.toEqual(UKJENT_STATUS);
  });

  it("gir ukjent status når kallet kaster", async () => {
    const hent = async () => {
      throw new TypeError("nettverksfeil");
    };
    await expect(hentStartstatus(hent as unknown as typeof fetch)).resolves.toEqual(UKJENT_STATUS);
  });

  it("gir ukjent status når svaret ikke er JSON", async () => {
    const hent = async () =>
      ({ ok: true, json: async () => Promise.reject(new SyntaxError("ikke json")) }) as unknown as Response;
    await expect(hentStartstatus(hent as unknown as typeof fetch)).resolves.toEqual(UKJENT_STATUS);
  });
});

describe("starthandlinger", () => {
  it("starter direkte når økten ikke har modus", () => {
    expect(starthandlinger(null, "ekte")).toEqual([{ type: "startOkt", modus: "ekte" }]);
    expect(starthandlinger(null, "demo")).toEqual([{ type: "startOkt", modus: "demo" }]);
  });

  it("nullstiller med nyOkt før startOkt når økten allerede har modus", () => {
    expect(starthandlinger("demo", "ekte")).toEqual([
      { type: "nyOkt" },
      { type: "startOkt", modus: "ekte" },
    ]);
  });

  it("gir en ny, tom økt i valgt modus gjennom reduceren", () => {
    let okt = oktReducer(tomOkt(), { type: "startOkt", modus: "demo" });
    okt = oktReducer(okt, { type: "leggTilSvar", tekst: "Jeg jobbet i butikk." });

    for (const handling of starthandlinger(okt.modus, "ekte")) okt = oktReducer(okt, handling);

    expect(okt.modus).toBe("ekte");
    expect(okt.logg).toEqual([]);
    expect(okt.erfaringer).toEqual([]);
  });
});
