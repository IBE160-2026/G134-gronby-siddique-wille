"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  fangedeErfaringer,
  kanGaTilKravuttrekk,
  oppsummeringsnotis,
  visningsnavn,
} from "@/kjerne/oppsummering";
import { useOkt, useOktDispatch } from "@/klient/okt/kontekst";
import type { Steg } from "@/klient/skall/steg";

import { Oppsummeringskort } from "./oppsummeringskort";

const SAMTALE: Steg = "samtale";
/** Annonse-siden kommer i story 2.1. */
const ANNONSE: Steg = "annonse";

/**
 * Oppsummering (FR-3, EXPERIENCE.md): de fangede erfaringene, som kan rettes
 * inline og slettes, en notis ved 1–2 fangede, tom tilstand ved 0, og valgene
 * «Fortsett samtalen» og «Gå videre». Endrer økten bare med
 * `leggTilRettelse` og `slettErfaring`.
 */
export function Oppsummeringsflate() {
  const okt = useOkt();
  const dispatch = useOktDispatch();
  const router = useRouter();
  const overskrift = useRef<HTMLHeadingElement>(null);
  // Teller i `key`, så to like kunngjøringer etter hverandre også leses opp.
  const [kunngjoring, setKunngjoring] = useState({ tekst: "", nr: 0 });

  const fangede = fangedeErfaringer(okt);
  const notis = oppsummeringsnotis(fangede.length);
  const kanVidere = kanGaTilKravuttrekk(okt);
  // Like tydelige valg ved 1–2 fangede (EXPERIENCE.md State Patterns).
  const fortsettVariant = fangede.length === 0 || notis?.type === "notis" ? "default" : "outline";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-column-max flex-col gap-section-gap px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1
            ref={overskrift}
            tabIndex={-1}
            className="type-display-sm rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Oppsummering
          </h1>
          {fangede.length > 0 && (
            <p className="text-muted-foreground">
              Se over erfaringene og rett det som ikke stemmer. Endringene lagres når du går ut av
              feltet.
            </p>
          )}
        </div>

        {notis?.type === "notis" && (
          // Fast innhold, ikke et varsel: `status` (polite) i stedet for
          // shadcn-standarden `alert`, så den ikke avbryter kunngjøringen av
          // en sletting når notisen dukker opp (3 → 2 fangede).
          <Alert role="status">
            <AlertDescription className="text-foreground">{notis.tekst}</AlertDescription>
          </Alert>
        )}

        {notis?.type === "tom" ? (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-5">
            <p className="font-medium">{notis.tekst}</p>
            <p className="text-sm text-muted-foreground">
              En erfaring er fanget når du har fortalt hva rollen din var, hva du gjorde og hva det
              førte til. Fortsett samtalen, så spør Erfaringsgruven deg videre.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {fangede.map((erfaring) => (
              <li key={erfaring.id}>
                <Oppsummeringskort
                  erfaring={erfaring}
                  onRett={(felt, tekst) =>
                    dispatch({ type: "leggTilRettelse", erfaringId: erfaring.id, felt, tekst })
                  }
                  onSlett={() => {
                    dispatch({ type: "slettErfaring", erfaringId: erfaring.id });
                    setKunngjoring((k) => ({
                      tekst: `Erfaringen «${visningsnavn(erfaring.tittel)}» er slettet.`,
                      nr: k.nr + 1,
                    }));
                    // Knappen forsvinner med kortet; fokus skal ikke falle til <body>.
                    overskrift.current?.focus();
                  }}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap justify-end gap-2.5">
          <Button size="lg" variant={fortsettVariant} onClick={() => router.push(`/${SAMTALE}`)}>
            Fortsett samtalen
          </Button>
          <Button
            size="lg"
            variant={kanVidere ? "default" : "outline"}
            disabled={!kanVidere}
            onClick={() => router.push(`/${ANNONSE}`)}
          >
            Gå videre
          </Button>
        </div>

        <p role="status" className="sr-only">
          <span key={kunngjoring.nr}>{kunngjoring.tekst}</span>
        </p>
      </div>
    </div>
  );
}
