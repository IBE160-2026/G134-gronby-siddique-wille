import { cn } from "@/lib/utils";
import type { Melding } from "./melding";

/** Skjult avsender, så skjermleser vet hvem som snakker (plassering og farge alene sier ikke det). */
const AVSENDER: Record<Melding["rolle"], string> = {
  assistent: "Erfaringsgruven:",
  student: "Du:",
};

/**
 * Chatboble (DESIGN.md Components). Assistent: venstrejustert, `card` med kant.
 * Student: høyrejustert, `muted` uten kant. Begge `rounded-lg` og `chat-body`.
 */
export function Chatboble({ melding }: { melding: Melding }) {
  const erAssistent = melding.rolle === "assistent";
  return (
    <div
      id={`logg-${melding.id}`}
      data-rolle={melding.rolle}
      className={cn(
        "type-chat-body max-w-[80%] rounded-lg px-4 py-3 break-words whitespace-pre-wrap",
        erAssistent
          ? "self-start border border-border bg-card text-card-foreground"
          : "self-end bg-muted text-foreground",
      )}
    >
      <span className="sr-only">{AVSENDER[melding.rolle]} </span>
      {melding.tekst}
    </div>
  );
}
