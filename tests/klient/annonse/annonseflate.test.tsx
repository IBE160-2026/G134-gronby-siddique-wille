import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MAKS_ANNONSE_TEGN, MIN_ANNONSE_TEGN } from "@/kjerne/regler";
import { Annonseflate } from "@/klient/annonse/annonseflate";
import { FINN_KRAV, FOR_LANG, PLASSHOLDER } from "@/klient/annonse/tekster";

function vis(verdi: string, sender = false): string {
  return renderToString(
    <Annonseflate verdi={verdi} onEndre={() => {}} onFinnKrav={() => {}} sender={sender} />,
  );
}

function knapp(html: string, tekst: string): string {
  const treff = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].find(
    (t) => t[1].replace(/<[^>]+>/g, "") === tekst,
  );
  if (!treff) throw new Error(`Fant ikke knappen «${tekst}»`);
  return treff[0].slice(0, treff[0].indexOf(">") + 1);
}

// Knappen har `focusableWhenDisabled`, så deaktivert vises som `aria-disabled`.
const erDeaktivert = (tag: string) =>
  /\sdisabled(=""|\s|>)/.test(tag) || tag.includes('aria-disabled="true"');

describe("Annonseflate", () => {
  it("plassholderen er ordrett fra EXPERIENCE.md", () => {
    expect(PLASSHOLDER).toBe("Lim inn teksten fra stillingsannonsen");
    expect(vis("")).toContain(`placeholder="${PLASSHOLDER}"`);
  });

  it("«Finn krav» er deaktivert i et tomt felt", () => {
    expect(erDeaktivert(knapp(vis(""), FINN_KRAV))).toBe(true);
  });

  it("«Finn krav» er deaktivert under MIN_ANNONSE_TEGN og aktiv fra grensen", () => {
    expect(erDeaktivert(knapp(vis("a".repeat(MIN_ANNONSE_TEGN - 1)), FINN_KRAV))).toBe(true);
    expect(erDeaktivert(knapp(vis("a".repeat(MIN_ANNONSE_TEGN)), FINN_KRAV))).toBe(false);
  });

  it("«Finn krav» er aktiv på MAKS_ANNONSE_TEGN og deaktivert over, med melding om grensen", () => {
    const pa = vis("a".repeat(MAKS_ANNONSE_TEGN));
    expect(erDeaktivert(knapp(pa, FINN_KRAV))).toBe(false);
    expect(pa).not.toContain(FOR_LANG);

    const over = vis("a".repeat(MAKS_ANNONSE_TEGN + 1));
    expect(erDeaktivert(knapp(over, FINN_KRAV))).toBe(true);
    expect(over).toContain("Annonsen er for lang. Maks 6000 tegn.");
  });

  it("«Finn krav» er deaktivert etter et trykk, så et dobbeltklikk ikke sender to ganger", () => {
    const tekst = "a".repeat(MIN_ANNONSE_TEGN);
    expect(erDeaktivert(knapp(vis(tekst, true), FINN_KRAV))).toBe(true);
  });

  it("meldingsområdet er alltid i DOM-en og kunngjøres (aria-live)", () => {
    expect(vis("")).toContain('aria-live="polite"');
  });

  it("viser hvor mange tegn som gjenstår mens feltet er for kort", () => {
    expect(vis("hei")).toContain(`Minst ${MIN_ANNONSE_TEGN} tegn`);
  });
});
