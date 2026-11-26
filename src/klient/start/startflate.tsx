"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Modus, StatusSvar } from "@/kjerne/skjema";
import { knappetilstand } from "./startvalg";
import {
  AVKRYSNING,
  DISPLAY,
  FORKLARING,
  MANGLER_DEMODATA,
  MANGLER_NOKKEL,
  PERSONVERNTEKST,
  PROV_DEMOMODUS,
  START_NY_OKT,
} from "./tekster";

type StartflateProps = {
  /** Svaret fra `GET /api/status`, eller `null` mens det lastes. */
  status: StatusSvar | null;
  avkrysset: boolean;
  onAvkrysset: (avkrysset: boolean) => void;
  /** Sann etter et trykk, så et dobbeltklikk ikke starter to ganger. */
  starter?: boolean;
  onStart: (modus: Modus) => void;
};

const ID = {
  personvern: "start-personvern",
  avkrysningTekst: "start-avkrysning-tekst",
  manglerNokkel: "start-mangler-nokkel",
  manglerDemodata: "start-mangler-demodata",
} as const;

/**
 * Start (EXPERIENCE.md: Første møte). Ren visning: forelderen henter status,
 * eier avkrysningen og starter økten. DOM-rekkefølgen er leserekkefølgen.
 */
export function Startflate({ status, avkrysset, onAvkrysset, starter = false, onStart }: StartflateProps) {
  const k = knappetilstand(status, avkrysset);

  return (
    <main className="mx-auto flex w-full max-w-column-max flex-1 flex-col justify-center gap-8 px-6 py-24">
      <div className="space-y-4">
        <h1 className="type-display">{DISPLAY}</h1>
        <p>{FORKLARING}</p>
      </div>

      <section
        aria-label="Personvern"
        className="space-y-5 rounded-md border border-border bg-card p-6"
      >
        <p id={ID.personvern}>{PERSONVERNTEKST}</p>
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            className="mt-0.5"
            checked={avkrysset}
            onCheckedChange={(verdi) => onAvkrysset(verdi === true)}
            aria-labelledby={ID.avkrysningTekst}
            aria-describedby={ID.personvern}
          />
          <span id={ID.avkrysningTekst}>{AVKRYSNING}</span>
        </label>
      </section>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            disabled={!k.ekteAktiv || starter}
            aria-describedby={k.visManglerNokkel ? ID.manglerNokkel : undefined}
            onClick={() => onStart("ekte")}
          >
            {START_NY_OKT}
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={!k.demoAktiv || starter}
            aria-describedby={k.visManglerDemodata ? ID.manglerDemodata : undefined}
            onClick={() => onStart("demo")}
          >
            {PROV_DEMOMODUS}
          </Button>
        </div>
        {/* Alltid i DOM-en, så meldingene kunngjøres når status kommer. */}
        <div aria-live="polite" className="space-y-1 text-muted-foreground">
          {k.visManglerNokkel && <p id={ID.manglerNokkel}>{MANGLER_NOKKEL}</p>}
          {k.visManglerDemodata && <p id={ID.manglerDemodata}>{MANGLER_DEMODATA}</p>}
        </div>
      </div>
    </main>
  );
}
