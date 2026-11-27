"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { IKKE_STARTET, INGEN_KRAV, LESER_ANNONSEN, kravlistetilstand } from "@/kjerne/kravliste";
import { useOkt } from "@/klient/okt/kontekst";
import type { Steg } from "@/klient/skall/steg";

const ANNONSE: Steg = "annonse";
/** Bevistabell-siden kommer i Epic 3; til da gir `/bevistabell` 404. */
const BEVISTABELL: Steg = "bevistabell";

const SKJELETTRADER = 4;

/**
 * Krav (FR-4, UX-DR10): kravene fra kravuttrekket som en nummerert,
 * skrivebeskyttet liste, med «Bygg bevistabell» og «Tilbake». Leser bare
 * økten; kallet til `/api/krav` og `settKrav` hører til story 2.2.
 */
export function Kravflate() {
  const okt = useOkt();
  const router = useRouter();
  const tilstand = kravlistetilstand(okt);
  const harKrav = tilstand === "liste";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-column-max flex-col gap-section-gap px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="type-display-sm">Krav</h1>
          {harKrav && (
            <p className="text-muted-foreground">
              Dette er kravene vi fant i annonsen. Sjekk at de stemmer før du bygger bevistabellen.
            </p>
          )}
        </div>

        {/* Alltid i DOM-en, så «Leser annonsen …» kunngjøres når den dukker opp. */}
        <p role="status" className={tilstand === "venter" ? "text-muted-foreground" : "sr-only"}>
          {tilstand === "venter" ? LESER_ANNONSEN : ""}
        </p>

        {tilstand === "venter" && (
          <div
            aria-hidden="true"
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-5"
          >
            {Array.from({ length: SKJELETTRADER }, (_, i) => (
              <div key={i} className="h-5 rounded-sm bg-muted motion-safe:animate-pulse" />
            ))}
          </div>
        )}

        {harKrav && (
          <ol className="flex list-decimal flex-col gap-3 rounded-md border border-border bg-card py-5 pr-5 pl-10">
            {okt.krav?.map((krav) => (
              <li key={krav.id} className="pl-1">
                {krav.tekst}
              </li>
            ))}
          </ol>
        )}

        {(tilstand === "tom" || tilstand === "ikke-startet") && (
          <div className="rounded-md border border-border bg-card p-5">
            <p>{tilstand === "tom" ? INGEN_KRAV : IKKE_STARTET}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2.5">
          <Button
            size="lg"
            variant={harKrav ? "outline" : "default"}
            onClick={() => router.push(`/${ANNONSE}`)}
          >
            Tilbake
          </Button>
          {harKrav && (
            <Button size="lg" onClick={() => router.push(`/${BEVISTABELL}`)}>
              Bygg bevistabell
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
