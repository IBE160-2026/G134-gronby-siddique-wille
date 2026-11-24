"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Chatboble } from "./chatboble";
import type { Melding } from "./melding";
import { Skriveindikator } from "./skriveindikator";

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
 * Loggen er sin egen rullecontainer og en `aria-live="polite"`-region.
 */
export function Chatlogg({ meldinger, venter, className }: ChatloggProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stodNederst = useRef(true);

  function oppdaterPosisjon() {
    const el = ref.current;
    if (!el) return;
    stodNederst.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= NEDERST_TOLERANSE;
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

  // Én live-region for hele loggen (EXPERIENCE.md). Studentens egen melding
  // leses derfor også opp; endelig løsning avgjøres i story 1.15.
  // tabIndex: rullecontaineren må kunne få fokus for å rulles med tastatur (Safari).
  return (
    <div
      ref={ref}
      role="log"
      aria-live="polite"
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
  );
}
