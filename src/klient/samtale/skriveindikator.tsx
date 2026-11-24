/**
 * Vises nederst i chatloggen mens modellkallet pågår (EXPERIENCE.md: Venter på modellen).
 * Statisk tekst uten animasjon. Ligger i loggens live-region, så den kunngjøres.
 */
export function Skriveindikator() {
  return (
    <p className="self-start text-sm text-muted-foreground">
      Erfaringsgruven skriver{" "}…
    </p>
  );
}
