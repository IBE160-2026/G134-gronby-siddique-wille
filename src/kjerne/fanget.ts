import type { Erfaring } from "./okt";

/**
 * Avgjør om en erfaring er fanget (AD-7): alle tre felt har ikke-tom tekst
 * og minst én kilde. Ren funksjon — ingen I/O, ingen nettverkskall.
 */
export function erFanget(erfaring: Erfaring): boolean {
  return [erfaring.rolle, erfaring.handling, erfaring.resultat].every(
    (felt) => felt.tekst.trim() !== "" && felt.kilder.length > 0,
  );
}
