import type { Okt } from "./okt";

/** Returnerer true hvis studenten har gitt minst ett svar i økten (AD-3). */
export function harGittSvar(okt: Okt): boolean {
  return okt.logg.some((o) => o.type === "svar");
}
