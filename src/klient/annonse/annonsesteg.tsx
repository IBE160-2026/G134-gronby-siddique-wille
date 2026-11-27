"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useOkt, useOktDispatch } from "@/klient/okt/kontekst";

import { Annonseflate } from "./annonseflate";

/**
 * Kobler Annonse til økten (AD-4). Utkastet lever lokalt mens studenten
 * skriver, så `versjon` ikke øker for hvert tegn. Først ved «Finn krav»
 * lagres teksten i økten (`settAnnonse`), som tømmer krav og bevistabell når
 * annonsen er endret (AD-14). Kravflaten (story 2.2/2.3) sender kallet med
 * `lagKravForesporsel(okt)`.
 */
export function Annonsesteg() {
  const okt = useOkt();
  const dispatch = useOktDispatch();
  const router = useRouter();
  const [utkast, setUtkast] = useState(okt.annonse);
  const [sender, setSender] = useState(false);

  function finnKrav() {
    setSender(true);
    dispatch({ type: "settAnnonse", tekst: utkast });
    router.push("/krav");
  }

  return <Annonseflate verdi={utkast} onEndre={setUtkast} onFinnKrav={finnKrav} sender={sender} />;
}
