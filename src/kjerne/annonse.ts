/**
 * Regler for Annonse (FR-4, AD-16, EXPERIENCE.md Annonsefelt).
 */

import { MAKS_ANNONSE_TEGN, MIN_ANNONSE_TEGN } from "./regler";

/** `ok` er den eneste tilstanden der «Finn krav» er aktiv. */
export type Annonsetilstand = "for-kort" | "ok" | "for-lang";

/**
 * Minst `MIN_ANNONSE_TEGN` tegn utenom mellomrom i endene, og høyst
 * `MAKS_ANNONSE_TEGN` tegn totalt. Maksgrensen regnes på hele teksten, fordi
 * det er den som sendes og som forespørselsskjemaet (`KravForesporsel`)
 * kontrollerer. Teksten er ikke avkortet, så en for lang annonse blir stående
 * i feltet og kan kortes ned av studenten.
 */
export function annonsetilstand(tekst: string): Annonsetilstand {
  if (tekst.length > MAKS_ANNONSE_TEGN) return "for-lang";
  if (tekst.trim().length < MIN_ANNONSE_TEGN) return "for-kort";
  return "ok";
}
