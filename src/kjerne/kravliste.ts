/**
 * Regler for Krav-flaten (FR-4, UX-DR10, AD-9, EXPERIENCE.md Kravliste).
 */

import { annonsetilstand } from "./annonse";
import type { Okt } from "./okt";

type Kravtilstand = Pick<Okt, "annonse" | "krav">;

/**
 * - `liste`: kravuttrekket er ferdig og fant krav.
 * - `tom`: kravuttrekket er ferdig uten krav, et gyldig resultat (AD-9).
 * - `venter`: ingen krav ennå, men annonsen er gyldig, så uttrekket er sendt
 *   fra Annonse (story 2.2 setter kravene med `settKrav`).
 * - `ikke-startet`: ingen krav og ingen gyldig annonse, f.eks. rett til `/krav`.
 *
 * Økten har ingen forespørselsstatus, så `venter` og `ikke-startet` skilles
 * ut fra annonsen. Nullstillingen ved endret annonse (AD-14) skjer i
 * reducerens `settAnnonse`, som setter `krav` til `null`.
 */
export type Kravlistetilstand = "ikke-startet" | "venter" | "tom" | "liste";

export function kravlistetilstand(okt: Kravtilstand): Kravlistetilstand {
  if (okt.krav === null) {
    return annonsetilstand(okt.annonse) === "ok" ? "venter" : "ikke-startet";
  }
  return okt.krav.length === 0 ? "tom" : "liste";
}

/** Teksten ved tom kravliste, ordrett fra EXPERIENCE.md. */
export const INGEN_KRAV =
  "Vi fant ingen tydelige krav i teksten. Sjekk at du limte inn hele annonsen.";

/** Teksten mens kravuttrekket pågår, ordrett fra EXPERIENCE.md. */
export const LESER_ANNONSEN = "Leser annonsen …";

/**
 * Teksten når kravuttrekket ikke er startet. Ikke fra EXPERIENCE.md, men
 * foreløpig ordlyd fra story 2.3 som UX kan endre.
 */
export const IKKE_STARTET =
  "Vi har ikke funnet krav ennå. Lim inn stillingsannonsen og trykk «Finn krav».";

/**
 * Det statusregionen på Krav kunngjør (WCAG 4.1.3): at uttrekket pågår, og
 * deretter resultatet, så skjermleseren også får vite når kravene er kommet
 * eller at ingen ble funnet. «krav» er likt i entall og flertall.
 */
export function kravkunngjoring(tilstand: Kravlistetilstand, antall: number): string {
  switch (tilstand) {
    case "venter":
      return LESER_ANNONSEN;
    case "liste":
      return `Fant ${antall} krav.`;
    case "tom":
      return "Fant ingen krav.";
    case "ikke-startet":
      return "";
  }
}
