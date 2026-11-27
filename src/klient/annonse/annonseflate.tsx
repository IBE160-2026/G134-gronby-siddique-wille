"use client";

import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { annonsetilstand } from "@/kjerne/annonse";

import { ETIKETT, FINN_KRAV, FOR_LANG, OVERSKRIFT, PLASSHOLDER, forKort } from "./tekster";

type AnnonseflateProps = {
  /** Utkastet. Forelderen eier det. */
  verdi: string;
  onEndre: (verdi: string) => void;
  /** Kalles bare når «Finn krav» er aktiv. */
  onFinnKrav: () => void;
  /** Sann etter et trykk, så et dobbeltklikk ikke sender to ganger. */
  sender?: boolean;
};

/**
 * Annonse (EXPERIENCE.md Annonsefelt): stor `Textarea` og «Finn krav», som er
 * aktiv fra `MIN_ANNONSE_TEGN` til `MAKS_ANNONSE_TEGN` tegn (AD-16). Ren
 * visning: forelderen eier teksten og gjør selve overgangen.
 */
export function Annonseflate({ verdi, onEndre, onFinnKrav, sender = false }: AnnonseflateProps) {
  const hjelpId = useId();
  const tilstand = annonsetilstand(verdi);
  const kanSende = tilstand === "ok" && !sender;

  const hjelp =
    tilstand === "for-lang"
      ? FOR_LANG
      : tilstand === "for-kort" && verdi.trim().length > 0
        ? forKort(verdi.trim().length)
        : null;

  return (
    <div className="mx-auto flex w-full max-w-column-max flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="type-display-sm">{OVERSKRIFT}</h1>
      <form
        className="flex flex-1 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (kanSende) onFinnKrav();
        }}
      >
        <Textarea
          value={verdi}
          onChange={(e) => onEndre(e.target.value)}
          aria-label={ETIKETT}
          aria-describedby={hjelp ? hjelpId : undefined}
          aria-invalid={tilstand === "for-lang" || undefined}
          placeholder={PLASSHOLDER}
          className="min-h-72 flex-1 resize-y bg-card"
        />
        {/* Alltid i DOM-en, så meldingen kunngjøres når den dukker opp. */}
        <p id={hjelpId} aria-live="polite" className="min-h-6 text-muted-foreground">
          {hjelp}
        </p>
        <div>
          <Button type="submit" size="lg" focusableWhenDisabled disabled={!kanSende}>
            {FINN_KRAV}
          </Button>
        </div>
      </form>
    </div>
  );
}
