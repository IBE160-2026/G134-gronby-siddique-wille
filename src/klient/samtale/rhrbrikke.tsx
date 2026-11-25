"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Felt, FeltNavn, LoggOppforing } from "@/kjerne/okt";

const FELT_ETIKETTER: Record<FeltNavn, string> = {
  rolle: "Rolle",
  handling: "Handling",
  resultat: "Resultat",
};

type Props = {
  felt: Felt;
  feltNavn: FeltNavn;
  /** Samtaleloggen, for å slå opp kildetekstene (bare `svar`-oppføringer siteres). */
  logg: LoggOppforing[];
};

/**
 * R-H-R-brikke (UX-DR6, DESIGN.md rha-chip). Tre tilstander:
 * - tom: muted-bakgrunn, stiplet kant
 * - fylt: covered-bakgrunn, hake
 * - oppdatert: kort animate-pulse ved overgang tom → fylt
 *
 * Klikk eller Enter åpner Popover med felttekst og kildesitater.
 */
export function RHRBrikke({ felt, feltNavn, logg }: Props) {
  const erFylt = felt.tekst.trim() !== "";
  const forrigeErFylt = useRef(erFylt);
  const [pulserer, setPulserer] = useState(false);

  useEffect(() => {
    if (!forrigeErFylt.current && erFylt) {
      setPulserer(true);
      const tid = setTimeout(() => setPulserer(false), 600);
      return () => clearTimeout(tid);
    }
    forrigeErFylt.current = erFylt;
  }, [erFylt]);

  const kildesvarer = logg.filter(
    (o): o is Extract<LoggOppforing, { type: "svar" }> =>
      o.type === "svar" && felt.kilder.includes(o.id),
  );

  const etikett = FELT_ETIKETTER[feltNavn];

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
          erFylt
            ? "bg-covered text-covered-foreground"
            : "border border-dashed border-gap-border bg-muted text-muted-foreground",
          pulserer && "animate-pulse",
        )}
      >
        {erFylt && <span aria-hidden="true">✓</span>}
        {etikett}
        {erFylt && <span className="sr-only"> (fylt)</span>}
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-72">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {etikett}
        </p>
        {erFylt ? (
          <>
            <p className="text-sm">{felt.tekst}</p>
            {kildesvarer.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {kildesvarer.map((svar) => (
                  <blockquote
                    key={svar.id}
                    className="border-l-2 border-quote-mark pl-2 type-quote italic text-xs"
                  >
                    <span className="sr-only">Ditt svar: </span>
                    {svar.tekst}
                  </blockquote>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Ikke fylt ennå.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
