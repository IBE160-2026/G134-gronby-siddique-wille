"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Chatboble } from "./chatboble";
import type { Melding } from "./melding";
import { SKRIVER_TEKST, Skriveindikator } from "./skriveindikator";

/** Hvor nær bunnen (px) som regnes som «står nederst». */
const NEDERST_TOLERANSE = 32;

type ChatloggProps = {
  meldinger: readonly Melding[];
  /** Sann mens et modellkall pågår: viser skriveindikatoren nederst. */
  venter: boolean;
  className?: string;
};

/**
 * Samtaleloggen. Nye meldinger legges nederst, og visningen ruller automatisk
 * bare hvis studenten allerede står nederst (EXPERIENCE.md Component Patterns).
 * Loggen er sin egen rullecontainer.
 *
 * Skjermleser: en egen skjult `aria-live="polite"`-region kunngjør bare nye
 * assistentmeldinger og skriveindikatoren (EXPERIENCE.md Accessibility Floor,
 * story 1.15). Studentens egen melding leses ikke opp på nytt, og rullelisten
 * selv er ikke live.
 */
export function Chatlogg({ meldinger, venter, className }: ChatloggProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stodNederst = useRef(true);
  // Meldinger som finnes ved første visning (f.eks. når studenten kommer
  // tilbake til Samtale), kunngjøres ikke.
  const [forsteSisteId] = useState(() => meldinger.at(-1)?.id);
  const siste = meldinger.at(-1);
  const nyttSvar = siste?.rolle === "assistent" && siste.id !== forsteSisteId ? siste : undefined;

  function oppdaterPosisjon() {
    const el = ref.current;
    if (!el) return;
    stodNederst.current = el.scrollHeight - el.scrollTop - el.clientHeight <= NEDERST_TOLERANSE;
  }

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && stodNederst.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [meldinger, venter]);

  // Loggen kan krympe uten scroll-hendelse (chatinput vokser, vinduet endres).
  // Hold den nederst da også, hvis studenten sto der.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (stodNederst.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // tabIndex: rullecontaineren må kunne få fokus for å rulles med tastatur (Safari).
  return (
    <>
      <div
        ref={ref}
        role="region"
        aria-label="Samtale"
        tabIndex={0}
        onScroll={oppdaterPosisjon}
        className={cn(
          "flex flex-col gap-3.5 overflow-y-auto rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        {meldinger.map((melding) => (
          <Chatboble key={melding.id} melding={melding} />
        ))}
        {venter && <Skriveindikator />}
      </div>
      {/* Regionen står alltid i DOM-en, så innhold som settes inn kunngjøres.
        Bare den nyeste meldingen er assistentens når svaret nettopp kom, så et
        feilet kall (venter blir usann uten svar) leser ikke opp forrige svar
        igjen. key = meldings-ID: to like tekster etter hverandre leses begge. */}
      <div aria-live="polite" className="sr-only">
        {venter ? (
          <p key="skriver">{SKRIVER_TEKST}</p>
        ) : (
          nyttSvar && <p key={nyttSvar.id}>Erfaringsgruven: {nyttSvar.tekst}</p>
        )}
      </div>
    </>
  );
}
