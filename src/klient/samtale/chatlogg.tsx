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

  return (
    <div
      ref={ref}
      role="log"
      aria-live="polite"
      aria-label="Samtale"
      onScroll={oppdaterPosisjon}
      className={cn("flex flex-col gap-3.5 overflow-y-auto", className)}
    >
      {meldinger.map((melding) => (
        <Chatboble key={melding.id} melding={melding} />
      ))}
      {venter && <Skriveindikator />}
    </div>
  );
}
