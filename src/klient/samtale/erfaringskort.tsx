import type { Erfaring, LoggOppforing } from "@/kjerne/okt";
import { RHRBrikke } from "./rhrbrikke";

type Props = {
  erfaring: Erfaring;
  /** Samtaleloggen, sendes videre til R-H-R-brikkene for kildeoppslag. */
  logg: LoggOppforing[];
};

/**
 * Erfaringskort (UX-DR5, DESIGN.md experience-card). Viser tittel og de tre
 * R-H-R-brikkene som speiler feltenes tilstand. Sidepanelet viser ett kort per
 * erfaring så snart den er opprettet.
 */
export function Erfaringskort({ erfaring, logg }: Props) {
  return (
    <article className="rounded-md border border-border bg-card p-4">
      <h3 className="mb-3 truncate text-sm font-medium">{erfaring.tittel}</h3>
      <div className="flex flex-wrap gap-1.5">
        <RHRBrikke felt={erfaring.rolle} feltNavn="rolle" logg={logg} />
        <RHRBrikke felt={erfaring.handling} feltNavn="handling" logg={logg} />
        <RHRBrikke felt={erfaring.resultat} feltNavn="resultat" logg={logg} />
      </div>
    </article>
  );
}
