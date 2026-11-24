/** Teksten i skriveindikatoren. Chatlogg kunngjør den samme teksten for skjermleser. */
export const SKRIVER_TEKST = "Erfaringsgruven skriver …";

/**
 * Vises nederst i chatloggen mens modellkallet pågår (EXPERIENCE.md: Venter på modellen).
 * Statisk tekst uten animasjon. Kunngjøres av live-regionen i Chatlogg, ikke herfra.
 */
export function Skriveindikator() {
  return <p className="self-start text-sm text-muted-foreground">{SKRIVER_TEKST}</p>;
}
