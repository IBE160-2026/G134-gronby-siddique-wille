"use client";

import { useEffect } from "react";
import { harGittSvar } from "@/kjerne/harGittSvar";
import { useOkt } from "./kontekst";

/**
 * Registrerer nettleserens beforeunload-varsel så lenge studenten har gitt
 * minst ett svar (AD-3). Lytteren fjernes automatisk når loggen tømmes.
 */
export function useBeforeUnload() {
  const okt = useOkt();
  const aktiv = harGittSvar(okt);

  useEffect(() => {
    if (!aktiv) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [aktiv]);
}
