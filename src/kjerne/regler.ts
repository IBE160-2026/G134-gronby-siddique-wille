/**
 * Terskelregler (AD-15, AD-16): de øvre grensene som forespørselsskjemaene i
 * `skjema.ts` håndhever, og reglene for samtalen. Både UI og ruter bruker dem.
 */

import { antallFangede } from "./fanget";
import type { Erfaring, LoggOppforing } from "./skjema";

/** Maks tegn i stillingsannonsen (epics.md, story 2.1). */
export const MAKS_ANNONSE_TEGN = 6000;

/** Maks tegn i én tekst (svar, spørsmål, felt, tittel, krav). */
export const MAKS_TEKST_TEGN = 5000;

/** Maks antall oppføringer i loggen. */
export const MAKS_LOGG_OPPFORINGER = 300;

/** Maks antall elementer i øvrige lister (erfaringer, kilder, krav, …). */
export const MAKS_LISTE = 50;

/** Maks tegn i én ID (`S123`), så en ID ikke kan omgå tekstgrensene. */
export const MAKS_ID_TEGN = 10;

/** Minst så mange tegn i annonsen før «Finn krav» blir aktiv. */
export const MIN_ANNONSE_TEGN = 200;

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

/** Så mange fangede erfaringer før «Gå videre til oppsummering» tilbys. */
export const MAAL_ERFARINGER = 3;

/** Maks antall oppfølgingsspørsmål per erfaring (PRD FR-2). */
export const MAKS_OPPFOLGING_PER_ERFARING = 3;

/**
 * Fast spørsmål som erstatter et spørsmål om en lukket erfaring. Sier ikke at
 * erfaringen er fanget, fordi den kan mangle et felt. Ordlyden eies av UX
 * (EXPERIENCE.md).
 */
export const OVERGANGSSPORSMAL =
  "Fint, da går vi videre. Fortell gjerne om noe annet du har gjort: en annen jobb, frivillig arbeid eller et prosjekt på studiet.";

/**
 * Refleksjonsforslag for et hull når modellen ikke gir noe (AD-7). Ordlyden
 * eies av UX (EXPERIENCE.md).
 */
export const STANDARD_REFLEKSJON =
  "Tenk på: har du gjort noe lignende i en jobb, på studiet eller i fritiden, selv om du ikke tenkte på det som erfaring da?";

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

/**
 * Sann når minst `MAAL_ERFARINGER` erfaringer er fanget (AD-7). Da tilbys
 * «Gå videre til oppsummering», aldri automatisk.
 */
export function kanGaVidere(tilstand: Samtaletilstand): boolean {
  return antallFangede(tilstand) >= MAAL_ERFARINGER;
}

/**
 * Sann når erfaringen har fått `MAKS_OPPFOLGING_PER_ERFARING`
 * oppfølgingsspørsmål: `sporsmal` med `gjelder` lik ID-en. Spørsmål med
 * `gjelder: null` teller ikke. En lukket erfaring får ingen nye spørsmål, men
 * kan fortsatt fylles og regnes som fanget bare etter `erFanget()`.
 */
export function erLukket(
  { logg }: Pick<Samtaletilstand, "logg">,
  erfaringId: string,
): boolean {
  let antall = 0;
  for (const o of logg) {
    if (o.type === "sporsmal" && o.gjelder === erfaringId) antall++;
  }
  return antall >= MAKS_OPPFOLGING_PER_ERFARING;
}
