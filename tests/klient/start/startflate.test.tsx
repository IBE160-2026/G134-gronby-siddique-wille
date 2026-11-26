import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

// Knappene har `focusableWhenDisabled`, så deaktivert vises som `aria-disabled`.
const erDeaktivert = (tag: string) =>
  /\sdisabled(=""|\s|>)/.test(tag) || tag.includes('aria-disabled="true"');

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

  it("kobler avkrysningen til etiketten", () => {
    const html = vis(begge);
    const boks = html.match(/<[^>]*role="checkbox"[^>]*>/)?.[0] ?? "";
    expect(boks).toContain('aria-labelledby="start-avkrysning-tekst"');
    expect(boks).toContain('aria-checked="false"');
    expect(html).toMatch(/<label\b[\s\S]*role="checkbox"[\s\S]*<\/label>/);
  });

  it("nevner lagring og sletting bare i personvernteksten", () => {
    const html = vis({ harNokkel: false, harDemodata: false }, true);
    const tekst = html.replace(PERSONVERNTEKST, "").replace(/<[^>]+>/g, " ");
    expect(tekst).not.toMatch(/lagr|slett|kryptert|dager|år\b|forsvinner|anthropic/i);
  });

  it("holder deaktiverte knapper i tabulatorrekkefølgen, så forklaringen kan leses", () => {
    const html = vis({ harNokkel: false, harDemodata: false });
    for (const navn of ["Start ny økt", "Prøv demomodus"]) {
      const tag = knapp(html, navn);
      expect(tag).toContain('aria-disabled="true"');
      expect(tag).not.toMatch(/tabindex="-1"/);
    }
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

/** Alle elementer i treet `Startflate` returnerer (uten å rendre barnekomponentene). */
function elementer(node: ReactNode): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap(elementer);
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...elementer(node.props.children as ReactNode)];
}

describe("hendelsene i Startflate", () => {
  // Startflate har ingen hooks, så den kan kalles som funksjon.
  function tre(onStart = vi.fn(), onAvkrysset = vi.fn()) {
    const rot = Startflate({
      status: { harNokkel: true, harDemodata: true },
      avkrysset: true,
      onAvkrysset,
      onStart,
    });
    return { alle: elementer(rot), onStart, onAvkrysset };
  }

  const knappMed = (alle: ReturnType<typeof elementer>, tekst: string) => {
    const funnet = alle.find((e) => e.type === Button && e.props.children === tekst);
    if (!funnet) throw new Error(`Fant ikke knappen «${tekst}»`);
    return funnet.props as { onClick: () => void };
  };

  it("«Start ny økt» starter i modus ekte, «Prøv demomodus» i modus demo", () => {
    const { alle, onStart } = tre();
    knappMed(alle, "Start ny økt").onClick();
    expect(onStart).toHaveBeenLastCalledWith("ekte");
    knappMed(alle, "Prøv demomodus").onClick();
    expect(onStart).toHaveBeenLastCalledWith("demo");
  });

  it("avkrysningen sender ny verdi videre", () => {
    const { alle, onAvkrysset } = tre();
    const boks = alle.find((e) => e.type === Checkbox)?.props as {
      onCheckedChange: (verdi: boolean) => void;
    };
    boks.onCheckedChange(true);
    expect(onAvkrysset).toHaveBeenLastCalledWith(true);
    boks.onCheckedChange(false);
    expect(onAvkrysset).toHaveBeenLastCalledWith(false);
  });
});

describe("personvern i koden for Start", () => {
  it("bruker ikke nettleserlagring eller cookies", () => {
    const rot = path.resolve(import.meta.dirname, "..", "..", "..");
    const startmappe = path.join(rot, "src", "klient", "start");
    const filer = [
      path.join(rot, "src", "app", "page.tsx"),
      path.join(rot, "src", "components", "ui", "checkbox.tsx"),
      ...readdirSync(startmappe, { withFileTypes: true, recursive: true })
        .filter((f) => f.isFile())
        .map((f) => path.join(f.parentPath, f.name)),
    ];
    for (const fil of filer) {
      expect(readFileSync(fil, "utf8"), fil).not.toMatch(
        /localStorage|sessionStorage|indexedDB|document\.cookie/,
      );
    }
  });
});
