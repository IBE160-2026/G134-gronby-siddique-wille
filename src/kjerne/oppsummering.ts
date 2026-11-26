/**
 * Regler for Oppsummering (FR-3, AD-8, EXPERIENCE.md State Patterns).
 */

import { antallFangede, erFanget } from "./fanget";
import { MAAL_ERFARINGER } from "./regler";
import type { Erfaring, LoggOppforing } from "./skjema";

type Samtaletilstand = {
  erfaringer: readonly Erfaring[];
  logg: readonly LoggOppforing[];
};

/** Mellomrom, tabulatorer og linjeskift slått sammen til ett mellomrom. */
const likeOrd = (tekst: string) => tekst.trim().replace(/\s+/g, " ");

/**
 * Teksten som skal lagres når studenten forlater et felt, eller `null` når
 * ingenting skal lagres: tom tekst (feltet får tilbake forrige tekst) eller
 * ingen faktisk endring utover mellomrom og linjeskift. Den lagrede teksten
 * er trimmet, men linjeskift inne i teksten beholdes.
 */
export function rettetTekst(gammel: string, ny: string): string | null {
  const trimmet = ny.trim();
  if (trimmet === "" || likeOrd(trimmet) === likeOrd(gammel)) return null;
  return trimmet;
}

/** Navnet på en erfaring i etiketter og kunngjøringer; tom tittel får en reserve. */
export function visningsnavn(tittel: string): string {
  return tittel.trim() || "Erfaring uten tittel";
}

/** De fangede erfaringene, i øktens rekkefølge. */
export function fangedeErfaringer(tilstand: Samtaletilstand): Erfaring[] {
  return tilstand.erfaringer.filter((e) => erFanget(e, tilstand.logg));
}

/**
 * «Gå videre» fra Oppsummering til kravuttrekket krever minst én fanget
 * erfaring (EXPERIENCE.md: «Ferdig» med 0 fangede). Ikke det samme som
 * `kanGaVidere()` i `regler.ts` (≥ `MAAL_ERFARINGER`), som avgjør når
 * Samtale *tilbyr* overgangen.
 */
export function kanGaTilKravuttrekk(tilstand: Samtaletilstand): boolean {
  return antallFangede(tilstand) >= 1;
}

export type Oppsummeringsnotis =
  | { type: "tom"; tekst: string }
  | { type: "notis"; tekst: string }
  | null;

/** Teksten i tom tilstand, ordrett fra EXPERIENCE.md. */
export const TOM_OPPSUMMERING = "Vi har ikke fått nok til å fange en erfaring ennå.";

/**
 * Tom tilstand ved 0 fangede, notis ved 1–2 og ingenting ved minst
 * `MAAL_ERFARINGER`. Ordlyden er fra EXPERIENCE.md, med entall ved 1.
 */
export function oppsummeringsnotis(antall: number): Oppsummeringsnotis {
  if (antall <= 0) return { type: "tom", tekst: TOM_OPPSUMMERING };
  if (antall >= MAAL_ERFARINGER) return null;
  const erfaringer = antall === 1 ? "erfaring" : "erfaringer";
  return {
    type: "notis",
    tekst: `Du har fanget ${antall} ${erfaringer}. Du kan fortsette samtalen eller gå videre med det du har.`,
  };
}
