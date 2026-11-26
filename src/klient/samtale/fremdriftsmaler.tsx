import { fremdriftTekst, fylteSegmenter } from "@/kjerne/fremdrift";
import { MAAL_ERFARINGER } from "@/kjerne/regler";
import { cn } from "@/lib/utils";

type FremdriftsmalerProps = {
  /** Antall fangede erfaringer (`antallFangede()`). */
  antall: number;
  className?: string;
};

/**
 * Fremdriftsmåler (DESIGN.md `progress-meter`, UX-DR7): tre segmenter med
 * spor `muted` og fyll `primary`, full ved N ≥ 3, og teksten under.
 *
 * Teksten er selv en `role="status"`-region (polite). Den er mountet fra
 * start, så første visning leses ikke opp, men hver endring gjør det (NFR5).
 * Segmentene er skjult for skjermleser, fordi teksten sier det samme.
 */
export function Fremdriftsmaler({ antall, className }: FremdriftsmalerProps) {
  const fylte = fylteSegmenter(antall);

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: MAAL_ERFARINGER }, (_, i) => (
          <span
            key={i}
            className={cn("h-2 flex-1 rounded-full", i < fylte ? "bg-primary" : "bg-muted")}
          />
        ))}
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {fremdriftTekst(antall)}
      </p>
    </div>
  );
}
