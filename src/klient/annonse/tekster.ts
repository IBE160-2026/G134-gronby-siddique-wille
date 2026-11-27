import { MAKS_ANNONSE_TEGN, MIN_ANNONSE_TEGN } from "@/kjerne/regler";

/** Ordlyden på Annonse. Plassholderen er ordrett fra EXPERIENCE.md. */
export const PLASSHOLDER = "Lim inn teksten fra stillingsannonsen";
export const ETIKETT = "Stillingsannonse";
export const OVERSKRIFT = "Lim inn stillingsannonsen";
export const FINN_KRAV = "Finn krav";

export const FOR_LANG = `Annonsen er for lang. Maks ${MAKS_ANNONSE_TEGN} tegn.`;

/** Hjelpetekst mens feltet er for kort. Viser hvor mye som gjenstår. */
export function forKort(antall: number): string {
  return `Minst ${MIN_ANNONSE_TEGN} tegn trengs for å finne krav. Du har ${antall}.`;
}
