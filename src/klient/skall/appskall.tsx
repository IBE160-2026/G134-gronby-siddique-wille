import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Steg } from "./steg";
import { Stegindikator } from "./stegindikator";

type AppskallProps = {
  aktivt: Steg;
  fullforte: readonly Steg[];
  onVelgSteg: (steg: Steg) => void;
  /** «Ny økt». Bekreftelsen i `Dialog` hører til forelderen (story 1.14). */
  onNyOkt: () => void;
  children: ReactNode;
  /** Klasser på `<main>`, f.eks. oppsett for flaten. */
  className?: string;
};

/**
 * Skall for alle flater etter Start (EXPERIENCE.md Information Architecture):
 * toppfelt med navnet til venstre, stegindikatoren og «Ny økt» til høyre, og
 * flatens innhold i `<main>`. DOM-rekkefølgen er lik den visuelle, så `Tab`
 * følger leserekkefølgen.
 */
export function Appskall({
  aktivt,
  fullforte,
  onVelgSteg,
  onNyOkt,
  children,
  className,
}: AppskallProps) {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border px-8 py-4">
        <span className="type-display-sm">Erfaringsgruven</span>
        <Stegindikator aktivt={aktivt} fullforte={fullforte} onVelg={onVelgSteg} />
        <Button variant="outline" size="lg" onClick={onNyOkt}>
          Ny økt
        </Button>
      </header>
      <main className={cn("flex min-h-0 flex-1 flex-col", className)}>{children}</main>
    </>
  );
}
