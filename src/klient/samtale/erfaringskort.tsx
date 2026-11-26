"use client";

import { erFanget } from "@/kjerne/fanget";
import type { Erfaring } from "@/kjerne/okt";
import { useOkt } from "@/klient/okt/kontekst";
import { cn } from "@/lib/utils";

import { RHRBrikke } from "./rhrbrikke";

type Props = {
  erfaring: Erfaring;
};

/**
 * Erfaringskort (UX-DR5, DESIGN.md experience-card). Viser tittel og de tre
 * R-H-R-brikkene som speiler feltenes tilstand. Fanget-tilstanden (AD-7)
 * regnes ut fra øktens logg, så en kilde må være et faktisk svar. Leser bare
 * fra økten; dispatch skjer aldri herfra.
 */
export function Erfaringskort({ erfaring }: Props) {
  const { logg } = useOkt();
  const fanget = erFanget(erfaring, logg);

  return (
    <article
      className={cn(
        "rounded-md border bg-card p-4",
        fanget ? "border-covered" : "border-border",
      )}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="truncate text-sm font-medium">{erfaring.tittel}</h3>
        {fanget && (
          <span className="shrink-0 text-xs font-medium text-covered-foreground">Fanget</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <RHRBrikke felt={erfaring.rolle} feltNavn="rolle" />
        <RHRBrikke felt={erfaring.handling} feltNavn="handling" />
        <RHRBrikke felt={erfaring.resultat} feltNavn="resultat" />
      </div>
    </article>
  );
}
