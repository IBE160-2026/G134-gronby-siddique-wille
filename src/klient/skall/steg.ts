/**
 * Stegene i den lineære flyten etter Start (EXPERIENCE.md Information Architecture).
 *
 * Bevisst uavhengig av øktreduceren (story 1.3): reduceren avgjør hvilket steg
 * som er aktivt og hvilke som er fullført, og kan importere `Steg` eller mappe
 * sin egen form hit.
 */
export const STEG = [
  { id: "samtale", navn: "Samtale" },
  { id: "oppsummering", navn: "Oppsummering" },
  { id: "annonse", navn: "Annonse" },
  { id: "krav", navn: "Krav" },
  { id: "bevistabell", navn: "Bevistabell" },
] as const;

export type Steg = (typeof STEG)[number]["id"];

export function erSteg(verdi: unknown): verdi is Steg {
  return STEG.some((steg) => steg.id === verdi);
}

/**
 * Stegene før `aktivt`. Flyten er lineær, så alt før det aktive steget er
 * fullført og kan velges for å gå tilbake (EXPERIENCE.md).
 */
export function stegFor(aktivt: Steg): Steg[] {
  const i = STEG.findIndex((steg) => steg.id === aktivt);
  return STEG.slice(0, Math.max(i, 0)).map((steg) => steg.id);
}
