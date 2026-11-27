import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IKKE_STARTET, INGEN_KRAV, LESER_ANNONSEN } from "@/kjerne/kravliste";
import { tomOkt, type Okt } from "@/kjerne/okt";
import { MIN_ANNONSE_TEGN } from "@/kjerne/regler";
import { Kravflate } from "@/klient/krav/kravflate";
import { oktReducer, type Handling } from "@/klient/okt/reducer";

// Render-tester i node-miljøet (som oppsummeringsflate.test.tsx). Økten og
// ruteren er mocket; klikk testes ikke her.
let okt: Okt = tomOkt();
vi.mock("@/klient/okt/kontekst", () => ({
  useOkt: () => okt,
  useOktDispatch: () => vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const ANNONSE = "Vi søker en medarbeider. ".repeat(Math.ceil(MIN_ANNONSE_TEGN / 20));
const KRAV = ["Samarbeid", "Erfaring med Excel", "Kundeservice"];

const kjor = (fra: Okt, ...handlinger: Handling[]) => handlinger.reduce(oktReducer, fra);

function oktMedKrav(krav: string[] = KRAV): Okt {
  const start = kjor(
    tomOkt(),
    { type: "startOkt", modus: "ekte" },
    { type: "settAnnonse", tekst: ANNONSE },
  );
  return kjor(start, {
    type: "settKrav",
    versjon: start.versjon,
    krav: krav.map((tekst) => ({ tekst })),
  });
}

const vis = () => renderToString(<Kravflate />);

function knapper(html: string): string[] {
  return [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map((t) =>
    t[1].replace(/<[^>]+>/g, ""),
  );
}
function knapp(html: string, tekst: string): string {
  const treff = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].find(
    (t) => t[1].replace(/<[^>]+>/g, "") === tekst,
  );
  if (!treff) throw new Error(`Fant ikke knappen «${tekst}»`);
  return treff[0];
}
const erPrimar = (k: string) => /\sbg-primary\s/.test(k);
const punkter = (html: string) =>
  [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((t) => t[1]);

describe("Kravflate (FR-4, UX-DR10)", () => {
  beforeEach(() => {
    okt = tomOkt();
  });

  it("med krav: nummerert, skrivebeskyttet liste i øktens rekkefølge", () => {
    okt = oktMedKrav();
    const html = vis();
    expect(html).toMatch(/<ol\b/);
    expect(punkter(html)).toEqual(KRAV);
    expect(html).not.toMatch(/<(input|textarea)\b/);
    expect(html).not.toContain("contenteditable");
  });

  it("med krav: «Bygg bevistabell» er primær og «Tilbake» er med", () => {
    okt = oktMedKrav();
    const html = vis();
    expect(knapper(html)).toEqual(["Tilbake", "Bygg bevistabell"]);
    expect(erPrimar(knapp(html, "Bygg bevistabell"))).toBe(true);
    expect(erPrimar(knapp(html, "Tilbake"))).toBe(false);
  });

  it("tom kravliste: rolig forklaring og bare «Tilbake»", () => {
    okt = oktMedKrav([]);
    const html = vis();
    expect(html).toContain(INGEN_KRAV);
    expect(html).not.toMatch(/<ol\b/);
    expect(knapper(html)).toEqual(["Tilbake"]);
    expect(erPrimar(knapp(html, "Tilbake"))).toBe(true);
  });

  it("krav null med gyldig annonse: venter med «Leser annonsen …» i statusregionen", () => {
    okt = kjor(tomOkt(), { type: "settAnnonse", tekst: ANNONSE });
    const html = vis();
    expect(html).toMatch(new RegExp(`role="status"[^>]*>${LESER_ANNONSEN}<`));
    expect(html).not.toMatch(/<ol\b/);
    expect(knapper(html)).toEqual(["Tilbake"]);
  });

  it("krav null uten annonse: ikke startet, forklaring og «Tilbake»", () => {
    const html = vis();
    expect(html).toContain(IKKE_STARTET);
    expect(html).not.toContain(LESER_ANNONSEN);
    expect(knapper(html)).toEqual(["Tilbake"]);
  });

  it("ny «Finn krav» med endret annonse: gamle krav og bevistabell er borte (AD-14)", () => {
    const medTabell: Okt = { ...oktMedKrav(), bevistabell: [] };
    okt = kjor(medTabell, { type: "settAnnonse", tekst: `${ANNONSE} Endret.` });
    expect(okt.krav).toBeNull();
    expect(okt.bevistabell).toBeNull();
    const html = vis();
    for (const k of KRAV) expect(html).not.toContain(k);
    expect(html).toContain(LESER_ANNONSEN);
  });

  it("«Finn krav» med samme annonse: listen står urørt", () => {
    const medKrav = oktMedKrav();
    okt = kjor(medKrav, { type: "settAnnonse", tekst: ANNONSE });
    expect(okt).toBe(medKrav);
    expect(punkter(vis())).toEqual(KRAV);
  });
});
