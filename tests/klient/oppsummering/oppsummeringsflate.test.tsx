import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { Oppsummeringsflate } from "@/klient/oppsummering/oppsummeringsflate";

import { erfaring, fangede, felt, sporsmal, svar, tomErfaring } from "../../kjerne/hjelpere";

// Render-tester i node-miljøet (som samtalehandlinger.test.tsx). Økten og
// ruteren er mocket; klikk og blur testes ikke her.
let okt: Okt = tomOkt();
vi.mock("@/klient/okt/kontekst", () => ({ useOkt: () => okt, useOktDispatch: () => vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const lagOkt = (erfaringer: Okt["erfaringer"]): Okt => ({
  ...tomOkt(),
  modus: "ekte",
  logg: [sporsmal("A1"), svar("S1")],
  erfaringer,
});

function knapp(html: string, tekst: string): string | undefined {
  return html.match(new RegExp(`<button[^>]*>${tekst}</button>`))?.[0];
}
/** Knappen må finnes; ellers ville en manglende knapp telt som «aktiv». */
function deaktivert(k: string | undefined): boolean {
  expect(k, "knappen finnes").toBeDefined();
  return /<button(\s[^>]*)?\sdisabled(=""|\s|>)/.test(k ?? "");
}
/** Primær (`default`) eller `outline` ut fra shadcn-klassene. */
function variant(k: string | undefined): "default" | "outline" {
  expect(k, "knappen finnes").toBeDefined();
  return /\sbg-primary\s/.test(k ?? "") ? "default" : "outline";
}
const antallKort = (html: string) => html.match(/<article/g)?.length ?? 0;

const NOTIS = "Du kan fortsette samtalen eller gå videre med det du har.";
const TOM = "Vi har ikke fått nok til å fange en erfaring ennå.";

describe("Oppsummeringsflate (FR-3)", () => {
  beforeEach(() => {
    okt = tomOkt();
  });

  it("≥3 fangede: alle kort, redigerbare felt med etikett, ingen notis", () => {
    okt = lagOkt(fangede(3));
    const html = renderToString(<Oppsummeringsflate />);
    expect(antallKort(html)).toBe(3);
    for (const id of ["E1", "E2", "E3"]) {
      for (const f of ["tittel", "rolle", "handling", "resultat"]) {
        expect(html).toContain(`<label for="${id}-${f}"`);
        expect(html).toContain(`id="${id}-${f}"`);
      }
      // Tittelen er ett linjefelt, R-H-R-feltene er flerlinjet.
      expect(html).toMatch(new RegExp(`<input[^>]*id="${id}-tittel"`));
      for (const f of ["rolle", "handling", "resultat"]) {
        expect(html).toMatch(new RegExp(`<textarea[^>]*id="${id}-${f}"`));
      }
    }
    expect(html).not.toContain(NOTIS);
    expect(html).not.toContain(TOM);
    expect(deaktivert(knapp(html, "Gå videre"))).toBe(false);
    expect(deaktivert(knapp(html, "Fortsett samtalen"))).toBe(false);
  });

  it("viser bare fangede erfaringer", () => {
    okt = lagOkt([...fangede(3), tomErfaring("E4"), erfaring("E5", { rolle: felt("t", ["S9"]) })]);
    const html = renderToString(<Oppsummeringsflate />);
    expect(antallKort(html)).toBe(3);
    expect(html).not.toContain('id="E4-tittel"');
    expect(html).not.toContain('id="E5-tittel"');
  });

  it("feltene viser lagret tekst, og rettede felt merkes «Rettet av deg»", () => {
    okt = lagOkt([
      erfaring("E1", { rolle: felt("Skiftleder på helg", ["S1"], true) }),
      ...fangede(3).slice(1),
    ]);
    const html = renderToString(<Oppsummeringsflate />);
    expect(html).toContain("Skiftleder på helg");
    expect(html.match(/Rettet av deg/g)?.length).toBe(1);
    // Koblet til feltet, så skjermleseren leser det når feltet får fokus.
    const tekstfelt = (id: string) => html.match(new RegExp(`<textarea[^>]*id="${id}"[^>]*>`))?.[0];
    expect(tekstfelt("E1-rolle")).toContain('aria-describedby="E1-rolle-rettet"');
    expect(html).toContain('<span id="E1-rolle-rettet"');
    expect(tekstfelt("E1-handling")).not.toContain("aria-describedby");
  });

  it("slett-knappen har tittelen i det tilgjengelige navnet", () => {
    okt = lagOkt(fangede(3));
    const html = renderToString(<Oppsummeringsflate />);
    expect(html).toContain('aria-label="Slett erfaringen «Erfaring E1»"');
  });

  it("tom tittel gir et navn som ikke er tomt", () => {
    okt = lagOkt([erfaring("E1", { tittel: "  " }), ...fangede(3).slice(1)]);
    const html = renderToString(<Oppsummeringsflate />);
    expect(html).toContain('aria-label="Erfaring uten tittel"');
    expect(html).toContain('aria-label="Slett erfaringen «Erfaring uten tittel»"');
  });

  it("≥3 fangede: «Gå videre» er primær og «Fortsett samtalen» outline", () => {
    okt = lagOkt(fangede(3));
    const html = renderToString(<Oppsummeringsflate />);
    expect(variant(knapp(html, "Gå videre"))).toBe("default");
    expect(variant(knapp(html, "Fortsett samtalen"))).toBe("outline");
  });

  it("1 fanget: notis i entall, begge valg aktive", () => {
    okt = lagOkt(fangede(1));
    const html = renderToString(<Oppsummeringsflate />);
    expect(html).toContain(`Du har fanget 1 erfaring. ${NOTIS}`);
    // Notisen er fast innhold (polite), ikke et varsel som avbryter.
    expect(html).toMatch(/<div data-slot="alert" role="status"/);
    expect(html).not.toContain('role="alert"');
    // Like tydelige valg ved 1–2 fangede.
    expect(variant(knapp(html, "Gå videre"))).toBe("default");
    expect(variant(knapp(html, "Fortsett samtalen"))).toBe("default");
    expect(deaktivert(knapp(html, "Gå videre"))).toBe(false);
  });

  it("2 fangede: notis i flertall, begge valg aktive", () => {
    okt = lagOkt(fangede(2));
    const html = renderToString(<Oppsummeringsflate />);
    expect(html).toContain(`Du har fanget 2 erfaringer. ${NOTIS}`);
    expect(antallKort(html)).toBe(2);
    expect(deaktivert(knapp(html, "Gå videre"))).toBe(false);
  });

  it("0 fangede: tom tilstand, bare «Fortsett samtalen» er aktiv", () => {
    okt = lagOkt([tomErfaring("E1")]);
    const html = renderToString(<Oppsummeringsflate />);
    expect(html).toContain(TOM);
    expect(html).not.toContain(NOTIS);
    expect(antallKort(html)).toBe(0);
    expect(deaktivert(knapp(html, "Fortsett samtalen"))).toBe(false);
    expect(deaktivert(knapp(html, "Gå videre"))).toBe(true);
    expect(variant(knapp(html, "Fortsett samtalen"))).toBe("default");
  });

  it("har en tom statusregion for kunngjøring av sletting", () => {
    okt = lagOkt(fangede(3));
    expect(renderToString(<Oppsummeringsflate />)).toMatch(
      /<p role="status" class="sr-only"><span><\/span><\/p>/,
    );
  });
});
