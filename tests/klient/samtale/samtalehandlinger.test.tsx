import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { Fremdriftsmaler } from "@/klient/samtale/fremdriftsmaler";
import { Samtalehandlinger } from "@/klient/samtale/samtalehandlinger";

import { erfaring, fangede, sporsmal, svar, tomErfaring } from "../../kjerne/hjelpere";

// Render-tester i node-miljøet (som kontekst.test.tsx): ingen klikk, bare hva
// som vises ut fra økten. Økten og ruteren er mocket.
let okt: Okt = tomOkt();
vi.mock("@/klient/okt/kontekst", () => ({ useOkt: () => okt }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function lagOkt(overstyr: Partial<Okt>): Okt {
  return { ...tomOkt(), modus: "ekte", ...overstyr };
}

/** Knappen med gitt tekst, eller `undefined` hvis den ikke finnes. */
function knapp(html: string, tekst: string): string | undefined {
  return html.match(new RegExp(`<button[^>]*>${tekst}</button>`))?.[0];
}

/** Sann når knappen har `disabled`-attributtet (ikke Tailwind-varianten `disabled:`). */
const deaktivert = (knappHtml: string | undefined) =>
  knappHtml !== undefined && /<button(\s[^>]*)?\sdisabled(=""|\s|>)/.test(knappHtml);

const fylte = (html: string) => html.match(/bg-primary/g)?.length ?? 0;

describe("Fremdriftsmaler", () => {
  it.each([
    [0, "0 av 3 erfaringer fanget", 0],
    [2, "2 av 3 erfaringer fanget", 2],
    [3, "3 av 3 erfaringer fanget", 3],
    [4, "4 erfaringer fanget", 3],
  ])("%i fangede: «%s» i role=status, %i fylte segmenter", (antall, tekst, segmenter) => {
    const html = renderToString(<Fremdriftsmaler antall={antall} />);
    expect(html).toContain(`<p role="status"`);
    expect(html).toMatch(new RegExp(`role="status"[^>]*>${tekst}</p>`));
    expect(fylte(html)).toBe(segmenter);
    expect(html).toContain(`aria-hidden="true"`);
  });
});

describe("Samtalehandlinger (FR-3, UX-DR8)", () => {
  beforeEach(() => {
    okt = tomOkt();
  });

  it("«Ferdig» er synlig, men deaktivert før første spørsmål", () => {
    okt = lagOkt({});
    const ferdig = knapp(renderToString(<Samtalehandlinger venter={false} />), "Ferdig");
    expect(ferdig).toBeDefined();
    expect(deaktivert(ferdig)).toBe(true);
  });

  it("«Ferdig» er aktiv etter første spørsmål, også med 0 fangede", () => {
    okt = lagOkt({ logg: [sporsmal("A1")] });
    const html = renderToString(<Samtalehandlinger venter={false} />);
    expect(deaktivert(knapp(html, "Ferdig"))).toBe(false);
    expect(html).toContain("0 av 3 erfaringer fanget");
  });

  it("«Gå videre til oppsummering» finnes ikke med 2 fangede", () => {
    okt = lagOkt({ logg: [sporsmal("A1"), svar("S1")], erfaringer: fangede(2) });
    const html = renderToString(<Samtalehandlinger venter={false} />);
    expect(knapp(html, "Gå videre til oppsummering")).toBeUndefined();
    expect(html).toContain("2 av 3 erfaringer fanget");
  });

  it("«Gå videre til oppsummering» vises med 3 fangede, ved siden av «Ferdig»", () => {
    okt = lagOkt({ logg: [sporsmal("A1"), svar("S1")], erfaringer: fangede(3) });
    const html = renderToString(<Samtalehandlinger venter={false} />);
    expect(deaktivert(knapp(html, "Gå videre til oppsummering"))).toBe(false);
    expect(deaktivert(knapp(html, "Ferdig"))).toBe(false);
    expect(html).toContain("3 av 3 erfaringer fanget");
  });

  it("teller bare fangede erfaringer (antallFangede)", () => {
    okt = lagOkt({
      logg: [sporsmal("A1"), svar("S1")],
      // E3 har tekst, men kilden S9 finnes ikke i loggen; E4 er tom.
      erfaringer: [
        ...fangede(2),
        erfaring("E3", { resultat: { tekst: "t", kilder: ["S9"], rettetAvStudent: false } }),
        tomErfaring("E4"),
      ],
    });
    const html = renderToString(<Samtalehandlinger venter={false} />);
    expect(html).toContain("2 av 3 erfaringer fanget");
    expect(knapp(html, "Gå videre til oppsummering")).toBeUndefined();
  });

  it("begge knappene er låst mens modellen svarer", () => {
    okt = lagOkt({ logg: [sporsmal("A1"), svar("S1")], erfaringer: fangede(3) });
    const html = renderToString(<Samtalehandlinger venter />);
    expect(deaktivert(knapp(html, "Gå videre til oppsummering"))).toBe(true);
    expect(deaktivert(knapp(html, "Ferdig"))).toBe(true);
  });
});
