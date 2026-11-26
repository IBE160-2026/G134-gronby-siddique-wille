/**
 * Terskelregler (AD-15, AD-16): de øvre grensene som forespørselsskjemaene i
 * `skjema.ts` håndhever, og reglene for samtalen. Oppfølgingsgrensen kommer i
 * story 1.10.
 */

import { antallFangede } from "./fanget";
import type { Erfaring, LoggOppforing } from "./skjema";

/** Maks tegn i stillingsannonsen. */
export const MAKS_ANNONSE_TEGN = 20000;

/** Maks tegn i én tekst (svar, spørsmål, felt, tittel, krav). */
export const MAKS_TEKST_TEGN = 5000;

/** Maks antall oppføringer i loggen. */
export const MAKS_LOGG_OPPFORINGER = 300;

/** Maks antall elementer i øvrige lister (erfaringer, kilder, krav, …). */
export const MAKS_LISTE = 50;

/** Maks tegn i én ID (`S123`), så en ID ikke kan omgå tekstgrensene. */
export const MAKS_ID_TEGN = 10;

// ---------------------------------------------------------------------------
// Samtalen (AD-16)
// ---------------------------------------------------------------------------

/** Maks antall fangede erfaringer. Ved grensen opprettes ingen nye. */
export const MAKS_ERFARINGER = 8;

/**
 * Fast spørsmål som erstatter et spørsmål om en ny erfaring når grensen er
 * nådd. Foreløpig ordlyd; UX eier den.
 */
export const MAKS_ERFARINGER_SPORSMAL = `Nå har vi fanget ${MAKS_ERFARINGER} erfaringer, og flere enn det tar vi ikke med denne gangen. Er det noe mer du vil fortelle om en av dem? Ellers kan du trykke «Ferdig».`;

type Samtaletilstand = {
  erfaringer: readonly Erfaring[];
  logg: readonly LoggOppforing[];
};

/** «Ferdig» er aktiv når systemet har stilt minst ett spørsmål. */
export function kanTrykkeFerdig({ logg }: Pick<Samtaletilstand, "logg">): boolean {
  return logg.some((o) => o.type === "sporsmal");
}

/** Sann når antallet fangede erfaringer har nådd `MAKS_ERFARINGER`. */
export function erMaksNadd(tilstand: Samtaletilstand): boolean {
  return antallFangede(tilstand) >= MAKS_ERFARINGER;
}

/**
 * Sann når loggen ikke har plass til ett svar til og spørsmålet som følger,
 * uten å gå over `MAKS_LOGG_OPPFORINGER`. Da låses chatinput.
 */
export function erLoggFull({ logg }: Pick<Samtaletilstand, "logg">): boolean {
  return logg.length + 2 > MAKS_LOGG_OPPFORINGER;
}
