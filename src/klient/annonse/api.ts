import type { Okt } from "@/kjerne/okt";
import type { KravForesporsel } from "@/kjerne/skjema";

/**
 * Bygger forespørselen til `POST /api/krav` uten å endre økten (AD-13).
 * `versjon` følger med, så et svar som kommer etter at annonsen er endret,
 * kan forkastes (AD-14). Selve kallet gjøres av kravflaten (story 2.2/2.3).
 */
export function lagKravForesporsel(okt: Okt): KravForesporsel {
  if (okt.modus === null) throw new Error("Økten er ikke startet.");
  return { modus: okt.modus, versjon: okt.versjon, annonse: okt.annonse };
}
