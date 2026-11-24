import type { Okt } from "./okt";

export type NullstillArsak = "erfaringEndret" | "samtaleFortsatt" | "annonseEndret";

/**
 * Tømmer det som avhenger av endringen (AD-14) og øker `versjon`, slik at
 * svar som er sendt fra en eldre versjon forkastes.
 *
 * - Endret erfaring eller fortsatt samtale: bevistabellen tømmes.
 * - Endret annonse: krav og bevistabell tømmes.
 * - Annonseteksten beholdes alltid; den tømmes bare ved «Ny økt».
 */
export function nullstill(okt: Okt, arsak: NullstillArsak): Okt {
  return {
    ...okt,
    versjon: okt.versjon + 1,
    bevistabell: null,
    krav: arsak === "annonseEndret" ? null : okt.krav,
  };
}
