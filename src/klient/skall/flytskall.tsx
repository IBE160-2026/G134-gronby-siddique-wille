"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { useOkt, useOktDispatch } from "@/klient/okt/kontekst";
import { useBeforeUnload } from "@/klient/okt/usebeforeunload";

import { Appskall } from "./appskall";
import { NyOktDialog } from "./nyoktdialog";
import { erSteg, stegFor, type Steg } from "./steg";

/**
 * Felles skall for stegene etter Start. Ligger i `(flyt)/layout.tsx`, så
 * `Appskall` står mountet over stegbyttene og fokus ikke går tapt (CAP-4).
 * Uten startet økt sendes studenten til Start (AD-2).
 */
export function Flytskall({ children }: { children: ReactNode }) {
  const okt = useOkt();
  const dispatch = useOktDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const startet = okt.modus !== null;
  const [dialogApen, setDialogApen] = useState(false);
  useBeforeUnload();

  useEffect(() => {
    if (!startet) router.replace("/");
  }, [startet, router]);

  if (!startet) return null;

  const segment = pathname.split("/")[1];
  const aktivt: Steg = erSteg(segment) ? segment : "samtale";

  function nyOkt() {
    dispatch({ type: "nyOkt" });
    router.push("/");
  }

  return (
    <div className="flex h-dvh flex-col">
      <Appskall
        aktivt={aktivt}
        fullforte={stegFor(aktivt)}
        onVelgSteg={(steg) => router.push(`/${steg}`)}
        onNyOkt={() => setDialogApen(true)}
      >
        {children}
      </Appskall>
      <NyOktDialog open={dialogApen} onOpenChange={setDialogApen} onBekreft={nyOkt} />
    </div>
  );
}
