import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { StatusSvar } from "@/kjerne/skjema";
import { Startflate } from "@/klient/start/startflate";
import {
  AVKRYSNING,
  DISPLAY,
  FORKLARING,
  MANGLER_DEMODATA,
  MANGLER_NOKKEL,
  PERSONVERNTEKST,
} from "@/klient/start/tekster";

function vis(status: StatusSvar | null, avkrysset = false): string {
  return renderToString(
    <Startflate status={status} avkrysset={avkrysset} onAvkrysset={() => {}} onStart={() => {}} />,
  );
}

/** Taggen til knappen med teksten `tekst`. */
function knapp(html: string, tekst: string): string {
  const treff = [...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].find(
    (t) => t[1].replace(/<[^>]+>/g, "") === tekst,
  );
  if (!treff) throw new Error(`Fant ikke knappen «${tekst}»`);
  return treff[0].slice(0, treff[0].indexOf(">") + 1);
}

const erDeaktivert = (tag: string) => /\sdisabled(=""|\s|>)/.test(tag);

describe("tekstene på Start", () => {
  it("er ordrett fra EXPERIENCE.md", () => {
    expect(DISPLAY).toBe("Du har sannsynligvis mer erfaring enn du tror.");
    expect(PERSONVERNTEKST).toBe(
      "Svarene dine sendes kryptert til språkmodellen Claude hos Anthropic, som stiller spørsmålene og finner bevisene. Erfaringsgruven lagrer ingenting, og økten forsvinner når du lukker fanen. Anthropic sletter dataene innen 30 dager, men samtaler som flagges for brudd på bruksvilkårene kan lagres i opptil 2 år. Ikke skriv personnummer, helseopplysninger eller annet du ikke vil dele.",
    );
    expect(AVKRYSNING).toBe("Jeg har lest dette og vil starte.");
    expect(MANGLER_NOKKEL).toBe("Ingen API-nøkkel funnet. Se README, eller prøv demomodus.");
    expect(MANGLER_DEMODATA).toBe("Demodata mangler. Se README.");
  });

  it("forklaringen er én setning", () => {
    expect(FORKLARING.match(/[.!?](\s|$)/g)).toHaveLength(1);
  });
});

describe("Startflate", () => {
  const begge = { harNokkel: true, harDemodata: true };

  it("viser overskriften som eneste h1, forklaringen, personvernteksten og avkrysningen", () => {
    const html = vis(begge);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<h1 class="[^"]*type-display[^"]*">Du har sannsynligvis mer erfaring enn du tror\.<\/h1>/);
    expect(html).toContain(FORKLARING);
    expect(html).toContain(PERSONVERNTEKST);
    expect(html).toContain(`<span id="start-avkrysning-tekst">${AVKRYSNING}</span>`);
  });

  it("kobler avkrysningen til etiketten og personvernteksten", () => {
    const html = vis(begge);
    const boks = html.match(/<[^>]*role="checkbox"[^>]*>/)?.[0] ?? "";
    expect(boks).toContain('aria-labelledby="start-avkrysning-tekst"');
    expect(boks).toContain('aria-describedby="start-personvern"');
    expect(boks).toContain('aria-checked="false"');
    expect(html).toMatch(/<label\b[\s\S]*role="checkbox"[\s\S]*<\/label>/);
  });

  it("deaktiverer «Start ny økt» uten avkrysning, selv med nøkkel", () => {
    const html = vis(begge, false);
    expect(erDeaktivert(knapp(html, "Start ny økt"))).toBe(true);
    expect(erDeaktivert(knapp(html, "Prøv demomodus"))).toBe(false);
  });

  it("aktiverer «Start ny økt» med avkrysning og nøkkel", () => {
    const html = vis(begge, true);
    expect(erDeaktivert(knapp(html, "Start ny økt"))).toBe(false);
    expect(html).not.toContain(MANGLER_NOKKEL);
    expect(html).not.toContain(MANGLER_DEMODATA);
  });

  it("forklarer manglende nøkkel og kobler meldingen til knappen", () => {
    const html = vis({ harNokkel: false, harDemodata: true }, true);
    const start = knapp(html, "Start ny økt");
    expect(erDeaktivert(start)).toBe(true);
    expect(start).toContain('aria-describedby="start-mangler-nokkel"');
    expect(html).toContain(`<p id="start-mangler-nokkel">${MANGLER_NOKKEL}</p>`);
    expect(erDeaktivert(knapp(html, "Prøv demomodus"))).toBe(false);
  });

  it("deaktiverer demomodus og forklarer når demodata mangler", () => {
    const html = vis({ harNokkel: true, harDemodata: false });
    const demo = knapp(html, "Prøv demomodus");
    expect(erDeaktivert(demo)).toBe(true);
    expect(demo).toContain('aria-describedby="start-mangler-demodata"');
    expect(html).toContain(`<p id="start-mangler-demodata">${MANGLER_DEMODATA}</p>`);
  });

  it("deaktiverer begge knappene og viser ingen melding mens status lastes", () => {
    const html = vis(null, true);
    expect(erDeaktivert(knapp(html, "Start ny økt"))).toBe(true);
    expect(erDeaktivert(knapp(html, "Prøv demomodus"))).toBe(true);
    expect(html).not.toContain(MANGLER_NOKKEL);
    expect(html).not.toContain(MANGLER_DEMODATA);
    expect(html).toContain('aria-live="polite"');
  });

  it("deaktiverer begge knappene etter et trykk", () => {
    const html = renderToString(
      <Startflate status={begge} avkrysset onAvkrysset={() => {}} starter onStart={() => {}} />,
    );
    expect(erDeaktivert(knapp(html, "Start ny økt"))).toBe(true);
    expect(erDeaktivert(knapp(html, "Prøv demomodus"))).toBe(true);
  });
});

describe("personvern i koden for Start", () => {
  it("bruker ikke nettleserlagring eller cookies", () => {
    const filer = [
      path.join("src", "app", "page.tsx"),
      ...readdirSync(path.join("src", "klient", "start")).map((f) =>
        path.join("src", "klient", "start", f),
      ),
    ];
    for (const fil of filer) {
      expect(readFileSync(fil, "utf8"), fil).not.toMatch(
        /localStorage|sessionStorage|indexedDB|document\.cookie/,
      );
    }
  });
});
