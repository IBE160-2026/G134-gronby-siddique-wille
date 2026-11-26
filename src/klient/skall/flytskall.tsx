"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useOkt } from "@/klient/okt/kontekst";

import { Appskall } from "./appskall";
import { erSteg, type Steg } from "./steg";

/** Ingen steg er fullført før Oppsummering finnes (story 1.11/1.12). */
const INGEN_FULLFORTE: readonly Steg[] = [];

/**
 * Felles skall for stegene etter Start. Ligger i `(flyt)/layout.tsx`, så
 * `Appskall` står mountet over stegbyttene og fokus ikke går tapt (CAP-4).
 * Uten startet økt sendes studenten til Start (AD-2).
 */
export function Flytskall({ children }: { children: ReactNode }) {
  const okt = useOkt();
  const router = useRouter();
  const pathname = usePathname();
  const startet = okt.modus !== null;

  useEffect(() => {
    if (!startet) router.replace("/");
  }, [startet, router]);

  if (!startet) return null;

  const segment = pathname.split("/")[1];
  const aktivt: Steg = erSteg(segment) ? segment : "samtale";

  return (
    <div className="flex h-dvh flex-col">
      <Appskall
        aktivt={aktivt}
        fullforte={INGEN_FULLFORTE}
        onVelgSteg={(steg) => router.push(`/${steg}`)}
        // Bekreftelsesdialogen kommer i story 1.14.
        onNyOkt={() => {}}
      >
        {children}
      </Appskall>
    </div>
  );
}
