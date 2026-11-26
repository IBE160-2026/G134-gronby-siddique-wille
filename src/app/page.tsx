"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Modus, StatusSvar } from "@/kjerne/skjema";
import { useOkt, useOktDispatch } from "@/klient/okt/kontekst";
import { Startflate } from "@/klient/start/startflate";
import { hentStartstatus, starthandlinger } from "@/klient/start/startvalg";

/** Start (story 1.6). Avkrysningen lever bare i komponenttilstand (AD-2). */
export default function Start() {
  const okt = useOkt();
  const dispatch = useOktDispatch();
  const router = useRouter();
  const [status, setStatus] = useState<StatusSvar | null>(null);
  const [avkrysset, setAvkrysset] = useState(false);
  const [starter, setStarter] = useState(false);

  useEffect(() => {
    const avbryt = new AbortController();
    hentStartstatus(fetch, avbryt.signal).then((svar) => {
      if (!avbryt.signal.aborted) setStatus(svar);
    });
    return () => avbryt.abort();
  }, []);

  function start(modus: Modus) {
    setStarter(true);
    for (const handling of starthandlinger(okt.modus, modus)) dispatch(handling);
    router.push("/samtale");
  }

  return (
    <Startflate
      status={status}
      avkrysset={avkrysset}
      onAvkrysset={setAvkrysset}
      starter={starter}
      onStart={start}
    />
  );
}
