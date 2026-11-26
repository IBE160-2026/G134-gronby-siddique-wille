import type { Erfaring, Felt, LoggOppforing } from "@/kjerne/skjema";

/** Et felt med tekst og kilder. */
export const felt = (tekst: string, kilder: string[] = [], rettetAvStudent = false): Felt => ({
  tekst,
  kilder,
  rettetAvStudent,
});

/** En fanget erfaring når `S1` finnes i loggen. */
export function erfaring(id: string, overstyr: Partial<Erfaring> = {}): Erfaring {
  return {
    id,
    tittel: `Erfaring ${id}`,
    tittelRettetAvStudent: false,
    rolle: felt("rolle", ["S1"]),
    handling: felt("handling", ["S1"]),
    resultat: felt("resultat", ["S1"]),
    ...overstyr,
  };
}

export const tomErfaring = (id: string): Erfaring =>
  erfaring(id, { rolle: felt(""), handling: felt(""), resultat: felt("") });

export const svar = (id: string, tekst = "svar"): LoggOppforing => ({ type: "svar", id, tekst });

export const sporsmal = (id: string, gjelder: string | null = null): LoggOppforing => ({
  type: "sporsmal",
  id,
  tekst: "spørsmål",
  gjelder,
});

/** `antall` fangede erfaringer `E1…`. */
export const fangede = (antall: number): Erfaring[] =>
  Array.from({ length: antall }, (_, i) => erfaring(`E${i + 1}`));
