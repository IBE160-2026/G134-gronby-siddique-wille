/**
 * Sitatverifisering (AD-6, FR-5, SM-C1).
 *
 * Modellen foreslår et sitat, men kjernen avgjør om det er studentens egne
 * ord. Et sitat godtas bare hvis det er en delstreng av en `svar`-oppføring i
 * loggen, etter normalisering. Resultatet er posisjonene i den *originale*
 * teksten (`start`/`slutt`), og sitatet som vises og eksporteres klippes alltid
 * ut av loggen med dem, aldri fra modellens egen streng.
 *
 * Alt her er rene funksjoner uten modellkall, så sjekken er lik i begge moduser
 * og kan testes deterministisk.
 */

import type { LoggOppforing } from "./skjema";

/** Posisjoner i originalteksten. `slutt` er eksklusiv, som i `String.slice`. */
export type SitatTreff = { svarId: string; start: number; slutt: number };

/** Normalisert tekst, med original posisjon for hver UTF-16-enhet i den. */
type Normalisert = { tekst: string; start: number[]; slutt: number[] };

// Ett tegn med tilhørende sammensatte tegn (aksenter o.l.), eller tegn som
// står alene først i teksten. Hvert segment NFC-normaliseres for seg, så vi
// vet hvor i originalen hver normaliserte enhet kommer fra.
const SEGMENT = /\P{M}\p{M}*|\p{M}+/gu;
const MELLOMROM = /^\s$/u;

function normaliserMedKart(original: string): Normalisert {
  let tekst = "";
  const start: number[] = [];
  const slutt: number[] = [];
  let ventendeMellomrom: { start: number; slutt: number } | null = null;

  for (const treff of original.matchAll(SEGMENT)) {
    const segment = treff[0];
    const fra = treff.index;
    const til = fra + segment.length;

    if (MELLOMROM.test(segment)) {
      // Mellomrom først i teksten trimmes bort.
      if (tekst === "") continue;
      if (ventendeMellomrom) ventendeMellomrom.slutt = til;
      else ventendeMellomrom = { start: fra, slutt: til };
      continue;
    }

    if (ventendeMellomrom) {
      tekst += " ";
      start.push(ventendeMellomrom.start);
      slutt.push(ventendeMellomrom.slutt);
      ventendeMellomrom = null;
    }

    const nfc = segment.normalize("NFC");
    for (let i = 0; i < nfc.length; i++) {
      tekst += nfc[i];
      start.push(fra);
      slutt.push(til);
    }
  }
  // Mellomrom helt til slutt blir aldri skrevet ut, og er dermed trimmet.
  return { tekst, start, slutt };
}

/**
 * Unicode NFC, alle mellomromsløp (også NBSP og linjeskift) slås sammen til ett
 * mellomrom, og teksten trimmes. Store og små bokstaver skilles.
 */
export function normaliser(tekst: string): string {
  return normaliserMedKart(tekst).tekst;
}

/**
 * Finner sitatet i en tekst og gir posisjonene i originalteksten, eller `null`
 * hvis det ikke er en ordrett delstreng etter normalisering. Første forekomst
 * brukes hvis sitatet står flere steder.
 */
function finnSitat(original: string, sitat: string): { start: number; slutt: number } | null {
  const soek = normaliser(sitat);
  if (soek === "") return null;

  const norm = normaliserMedKart(original);
  const indeks = norm.tekst.indexOf(soek);
  if (indeks === -1) return null;

  return {
    start: norm.start[indeks],
    slutt: norm.slutt[indeks + soek.length - 1],
  };
}

/**
 * Godtar et foreslått sitat bare hvis det er en delstreng av `svar`-oppføringen
 * `svarId`, og gir da `{ svarId, start, slutt }` i originalteksten. Ellers
 * `null`, og beviset skal forkastes.
 *
 * Bare `svar` kan siteres (AD-5). Spørsmål og rettelser avvises selv om ID-en
 * finnes i loggen, og det samme gjelder en ukjent `svarId`. Om `erfaringId` er
 * ukjent eller `svarId` ikke er blant erfaringens `kilder`, avgjøres i
 * bevisruten (story 3.1).
 */
export function verifiserSitat(
  logg: readonly LoggOppforing[],
  svarId: string,
  sitat: string,
): SitatTreff | null {
  const oppforing = logg.find((o) => o.type === "svar" && o.id === svarId);
  if (!oppforing) return null;

  const treff = finnSitat(oppforing.tekst, sitat);
  return treff ? { svarId, ...treff } : null;
}

/**
 * Klipper sitatet ut av loggen med `start`/`slutt`, aldri fra modellens streng.
 * Gir `null` hvis `svarId` ikke er en `svar`-oppføring eller utsnittet er
 * ugyldig, slik at UI og eksport aldri viser noe som ikke kan spores.
 */
export function hentSitat(
  logg: readonly LoggOppforing[],
  bevis: SitatTreff,
): string | null {
  const oppforing = logg.find((o) => o.type === "svar" && o.id === bevis.svarId);
  if (!oppforing) return null;

  const { start, slutt } = bevis;
  if (!Number.isInteger(start) || !Number.isInteger(slutt)) return null;
  if (start < 0 || slutt <= start || slutt > oppforing.tekst.length) return null;

  return oppforing.tekst.slice(start, slutt);
}
