"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

import { Textarea } from "@/components/ui/textarea";
import { rettetTekst } from "@/kjerne/oppsummering";
import { MAKS_TEKST_TEGN } from "@/kjerne/regler";
import { cn } from "@/lib/utils";

import { tastValg } from "./redigering";

type RedigerbartFeltProps = {
  id: string;
  /** Synlig etikett, f.eks. «Rolle». */
  etikett: string;
  /** Lagret tekst i økten. */
  verdi: string;
  /** Feltet er rettet av studenten (`rettetAvStudent`). */
  rettet: boolean;
  /** Én linje (tittel): et `<input>`, og `Enter` lagrer. */
  enLinje?: boolean;
  /** Kalles bare med trimmet tekst som faktisk er endret (`rettetTekst`). */
  onLagre: (tekst: string) => void;
  className?: string;
};

/** Samme ramme og fokusring som shadcn `Textarea`, for énlinjefeltet. */
const INPUT_STIL =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-2.5 text-base font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

/**
 * Inline-redigering på Oppsummering (EXPERIENCE.md Erfaringskort): feltet er
 * alltid et tekstfelt med etikett, og endringen lagres når feltet forlates.
 * Tom tekst lagres ikke, og forrige tekst kommer tilbake. `Esc` angrer
 * utkastet. «Rettet av deg» er koblet til feltet med `aria-describedby`.
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

  // Reserve for nettlesere uten `field-sizing: content` (som i Chatinput):
  // mål høyden selv, så lang tekst ikke blir én linje med indre rulling.
  const flerlinje = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = flerlinje.current;
    if (!el || CSS.supports("field-sizing", "content")) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, [utkast]);

  function lagre() {
    const ny = rettetTekst(verdi, utkast);
    if (ny === null) {
      setUtkast(verdi);
      return;
    }
    onLagre(ny);
  }

  function vedTast(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const valg = tastValg(e.key, { enLinje, komponerer: e.nativeEvent.isComposing });
    if (valg === "angre") setUtkast(verdi);
    if (valg === "lagre") {
      e.preventDefault();
      lagre();
    }
  }

  const rettetId = `${id}-rettet`;
  const felles = {
    id,
    value: utkast,
    maxLength: MAKS_TEKST_TEGN,
    onBlur: lagre,
    onKeyDown: vedTast,
    "aria-describedby": rettet ? rettetId : undefined,
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {etikett}
        </label>
        {rettet && (
          <span id={rettetId} className="text-xs text-muted-foreground">
            Rettet av deg
          </span>
        )}
      </div>
      {enLinje ? (
        <input
          {...felles}
          type="text"
          onChange={(e) => setUtkast(e.target.value)}
          className={INPUT_STIL}
        />
      ) : (
        <Textarea
          {...felles}
          ref={flerlinje}
          rows={2}
          onChange={(e) => setUtkast(e.target.value)}
          className="min-h-0 resize-y bg-card"
        />
      )}
    </div>
  );
}
