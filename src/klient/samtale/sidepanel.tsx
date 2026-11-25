import type { Erfaring, LoggOppforing } from "@/kjerne/okt";
import { Erfaringskort } from "./erfaringskort";

type Props = {
  erfaringer: Erfaring[];
  logg: LoggOppforing[];
};

/**
 * Sidepanel (EXPERIENCE.md State Patterns: «Samtalen starter»). Viser ett
 * erfaringskort per erfaring, eller plassholdertekst når ingen er opprettet.
 */
export function Sidepanel({ erfaringer, logg }: Props) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto py-6">
      {erfaringer.length === 0 ? (
        <p className="text-sm text-muted-foreground">Erfaringene dine dukker opp her.</p>
      ) : (
        erfaringer.map((e) => <Erfaringskort key={e.id} erfaring={e} logg={logg} />)
      )}
    </div>
  );
}
