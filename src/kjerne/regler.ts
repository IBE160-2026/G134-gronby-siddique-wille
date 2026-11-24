/**
 * Terskelregler (AD-15). Foreløpig bare de øvre grensene som
 * forespørselsskjemaene i `skjema.ts` håndhever; resten kommer i story 1.10.
 */

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
