"use client";

import { useState, type KeyboardEvent } from "react";

import { Textarea } from "@/components/ui/textarea";
import { rettetTekst } from "@/kjerne/oppsummering";
import { MAKS_TEKST_TEGN } from "@/kjerne/regler";
import { cn } from "@/lib/utils";

type RedigerbartFeltProps = {
  id: string;
  /** Synlig etikett, f.eks. «Rolle». */
  etikett: string;
  /** Lagret tekst i økten. */
  verdi: string;
  /** Feltet er rettet av studenten (`rettetAvStudent`). */
  rettet: boolean;
  /** Én linje (tittel): `Enter` lagrer i stedet for å gi ny linje. */
  enLinje?: boolean;
  /** Kalles bare med trimmet tekst som faktisk er endret (`rettetTekst`). */
  onLagre: (tekst: string) => void;
  className?: string;
};

/**
 * Inline-redigering på Oppsummering (EXPERIENCE.md Erfaringskort): feltet er
 * alltid et tekstfelt med etikett, og endringen lagres når feltet forlates.
 * Tom tekst lagres ikke, og forrige tekst kommer tilbake. `Esc` angrer
 * utkastet.
 */
export function RedigerbartFelt({
  id,
  etikett,
  verdi,
  rettet,
  enLinje = false,
  onLagre,
  className,
}: RedigerbartFeltProps) {
  const [utkast, setUtkast] = useState(verdi);
  // Hent ny lagret tekst inn i utkastet når økten endrer den (etter lagring).
  const [forrige, setForrige] = useState(verdi);
  if (verdi !== forrige) {
    setForrige(verdi);
    setUtkast(verdi);
  }

  function lagre() {
    const ny = rettetTekst(verdi, utkast);
    if (ny === null) {
      setUtkast(verdi);
      return;
    }
    onLagre(ny);
  }

  function vedTast(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      setUtkast(verdi);
      return;
    }
    if (enLinje && e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      lagre();
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {etikett}
        </label>
        {rettet && <span className="text-xs text-muted-foreground">Rettet av deg</span>}
      </div>
      <Textarea
        id={id}
        value={utkast}
        rows={1}
        maxLength={MAKS_TEKST_TEGN}
        onChange={(e) => setUtkast(enLinje ? e.target.value.replace(/\n/g, " ") : e.target.value)}
        onBlur={lagre}
        onKeyDown={vedTast}
        className={cn("min-h-0 resize-none bg-card", enLinje && "font-medium")}
      />
    </div>
  );
}
