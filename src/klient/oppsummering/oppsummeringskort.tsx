"use client";

import { Button } from "@/components/ui/button";
import type { Erfaring, FeltNavn } from "@/kjerne/okt";

import { RedigerbartFelt } from "./redigerbartfelt";

const FELT: readonly { navn: FeltNavn; etikett: string }[] = [
  { navn: "rolle", etikett: "Rolle" },
  { navn: "handling", etikett: "Handling" },
  { navn: "resultat", etikett: "Resultat" },
];

type OppsummeringskortProps = {
  erfaring: Erfaring;
  onRett: (felt: FeltNavn | "tittel", tekst: string) => void;
  onSlett: () => void;
};

/**
 * Erfaringskort på Oppsummering (DESIGN.md `experience-card`): tittel og
 * R-H-R-tekst kan rettes inline, og kortet kan slettes. Kildene vises ikke og
 * endres aldri her, så rettet tekst blir aldri et sitat (AD-8).
 */
export function Oppsummeringskort({ erfaring, onRett, onSlett }: OppsummeringskortProps) {
  return (
    <article
      aria-label={erfaring.tittel}
      className="flex flex-col gap-4 rounded-md border border-border bg-card p-5"
    >
      <div className="flex items-end gap-3">
        <RedigerbartFelt
          id={`${erfaring.id}-tittel`}
          etikett="Tittel"
          verdi={erfaring.tittel}
          rettet={erfaring.tittelRettetAvStudent}
          enLinje
          onLagre={(tekst) => onRett("tittel", tekst)}
          className="flex-1"
        />
        <Button
          variant="ghost"
          aria-label={`Slett erfaringen «${erfaring.tittel}»`}
          onClick={onSlett}
        >
          Slett
        </Button>
      </div>
      {FELT.map(({ navn, etikett }) => (
        <RedigerbartFelt
          key={navn}
          id={`${erfaring.id}-${navn}`}
          etikett={etikett}
          verdi={erfaring[navn].tekst}
          rettet={erfaring[navn].rettetAvStudent}
          onLagre={(tekst) => onRett(navn, tekst)}
        />
      ))}
    </article>
  );
}
