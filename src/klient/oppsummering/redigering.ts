/**
 * Hva en tast gjør i et redigerbart felt på Oppsummering. Ren funksjon, så
 * reglene kan testes uten DOM.
 *
 * - `Esc` angrer utkastet, men ikke midt i en IME-komposisjon (der avbryter
 *   den bare komposisjonen).
 * - `Enter` lagrer i et énlinjefelt (tittel). I et flerlinjefelt gir den ny linje.
 */
export function tastValg(
  tast: string,
  { enLinje, komponerer }: { enLinje: boolean; komponerer: boolean },
): "angre" | "lagre" | null {
  if (komponerer) return null;
  if (tast === "Escape") return "angre";
  if (tast === "Enter" && enLinje) return "lagre";
  return null;
}
