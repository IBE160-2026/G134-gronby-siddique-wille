/**
 * Fremdriftsmåleren (UX-DR7, EXPERIENCE.md Component Patterns): teksten og
 * antall fylte segmenter for et antall fangede erfaringer. Terskelen er
 * `MAAL_ERFARINGER` fra `regler.ts`.
 */

import { MAAL_ERFARINGER } from "./regler";

/** Negative tall gir 0, og desimaltall rundes ned. */
function normaliser(antall: number): number {
  return Number.isFinite(antall) ? Math.max(0, Math.floor(antall)) : 0;
}

/**
 * «N av 3 erfaringer fanget» til og med målet, deretter «N erfaringer fanget».
 * Samme tekst vises og kunngjøres (NFR5).
 */
export function fremdriftTekst(antall: number): string {
  const n = normaliser(antall);
  return n > MAAL_ERFARINGER
    ? `${n} erfaringer fanget`
    : `${n} av ${MAAL_ERFARINGER} erfaringer fanget`;
}

/** Antall fylte segmenter av `MAAL_ERFARINGER`. Måleren er full ved N ≥ målet. */
export function fylteSegmenter(antall: number): number {
  return Math.min(normaliser(antall), MAAL_ERFARINGER);
}
