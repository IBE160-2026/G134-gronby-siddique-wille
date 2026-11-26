"use client";

import { useOkt } from "@/klient/okt/kontekst";

import { Erfaringskort } from "./erfaringskort";

/**
 * Sidepanel (EXPERIENCE.md State Patterns: «Samtalen starter»). Viser ett
 * erfaringskort per aktiv erfaring i økten, eller plassholdertekst når ingen
 * er opprettet. Oppdateres når reduceren fletter inn endringer fra
 * `/api/samtale` (`mottaSamtaleSvar`).
 */
export function Sidepanel() {
  const { erfaringer } = useOkt();
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto py-6">
      {erfaringer.length === 0 ? (
        <p className="text-sm text-muted-foreground">Erfaringene dine dukker opp her.</p>
      ) : (
        erfaringer.map((e) => <Erfaringskort key={e.id} erfaring={e} />)
      )}
    </div>
  );
}
