"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { antallFangede } from "@/kjerne/fanget";
import { kanGaVidere, kanTrykkeFerdig } from "@/kjerne/regler";
import { useOkt } from "@/klient/okt/kontekst";
import type { Steg } from "@/klient/skall/steg";

import { Fremdriftsmaler } from "./fremdriftsmaler";

/** Oppsummering er neste steg etter Samtale (siden kommer i story 1.12). */
const OPPSUMMERING: Steg = "oppsummering";

/**
 * Fremdriftsmåleren og veiene videre fra Samtale (FR-3, UX-DR7, UX-DR8).
 *
 * - «Gå videre til oppsummering» vises først når `kanGaVidere()` er sann.
 *   Overgangen skjer bare når studenten trykker, aldri automatisk.
 * - «Ferdig» er alltid synlig, aktiv når `kanTrykkeFerdig()` er sann, og
 *   sender til Oppsummering uansett antall fangede. Oppsummering viser selv
 *   riktig notis for 0, 1–2 og ≥ 3 (story 1.12).
 *
 * Leser bare økten; dispatcher ingenting.
 */
export function Samtalehandlinger() {
  const okt = useOkt();
  const router = useRouter();
  const tilOppsummering = () => router.push(`/${OPPSUMMERING}`);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <Fremdriftsmaler antall={antallFangede(okt)} className="w-48 grow" />
      <div className="flex gap-2.5">
        {kanGaVidere(okt) && (
          <Button size="lg" onClick={tilOppsummering}>
            Gå videre til oppsummering
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          disabled={!kanTrykkeFerdig(okt)}
          onClick={tilOppsummering}
        >
          Ferdig
        </Button>
      </div>
    </div>
  );
}
