"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { STEG, type Steg } from "./steg";

type StegindikatorProps = {
  /** Steget studenten er på. Vises som aktivt også om det står i `fullforte`. */
  aktivt: Steg;
  /** Steg studenten kan gå tilbake til. Reduceren avgjør hvilke det er. */
  fullforte: readonly Steg[];
  /** Kalles når studenten velger et fullført steg. */
  onVelg: (steg: Steg) => void;
  className?: string;
};

const PILLE = "inline-flex items-center rounded-full px-2.5 py-1";

/**
 * Stegindikator (DESIGN.md Components, EXPERIENCE.md Component Patterns).
 * Aktivt steg: `covered`-fyll, halvfet. Fullført: `primary`-tekst, understreket
 * og klikkbart. Kommende: `muted-foreground`, ikke klikkbart og ikke fokuserbart.
 */
export function Stegindikator({ aktivt, fullforte, onVelg, className }: StegindikatorProps) {
  const aktivtRef = useRef<HTMLSpanElement>(null);
  const valgt = useRef<Steg | null>(null);

  // Knappen studenten trykket på, blir til det aktive steget og forsvinner.
  // Flytt fokus til det aktive steget, så det ikke faller til <body>. Bare når
  // nettopp det valgte steget ble aktivt, så andre stegbytter ikke tar fokus.
  useLayoutEffect(() => {
    const forrige = valgt.current;
    valgt.current = null;
    if (forrige === aktivt) aktivtRef.current?.focus();
  }, [aktivt]);

  return (
    <nav aria-label="Steg" className={className}>
      <ol className="flex flex-wrap gap-1.5 text-sm">
        {STEG.map((steg, i) => {
          const navn = `${i + 1} ${steg.navn}`;
          if (steg.id === aktivt) {
            return (
              <li key={steg.id}>
                <span
                  ref={aktivtRef}
                  aria-current="step"
                  tabIndex={-1}
                  className={cn(
                    PILLE,
                    "bg-covered font-semibold text-covered-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                >
                  {navn}
                </span>
              </li>
            );
          }
          if (fullforte.includes(steg.id)) {
            return (
              <li key={steg.id}>
                <button
                  type="button"
                  onClick={() => {
                    valgt.current = steg.id;
                    onVelg(steg.id);
                  }}
                  className={cn(
                    PILLE,
                    "text-primary underline underline-offset-4 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                >
                  {navn}
                  <span className="sr-only"> (fullført)</span>
                </button>
              </li>
            );
          }
          return (
            <li key={steg.id}>
              <span className={cn(PILLE, "text-muted-foreground")}>
                {navn}
                <span className="sr-only"> (kommende)</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
