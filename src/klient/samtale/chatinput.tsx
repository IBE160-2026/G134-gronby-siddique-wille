"use client";

import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAKS_TEKST_TEGN } from "@/kjerne/regler";
import { cn } from "@/lib/utils";

type ChatinputProps = {
  /** Utkastet. Forelderen eier det og tømmer det først når svaret er tatt imot. */
  verdi: string;
  onEndre: (verdi: string) => void;
  /** Kalles med trimmet, ikke-tom tekst. Kalles aldri mens `venter` er sann. */
  onSend: (tekst: string) => void;
  /** Sann mens assistenten svarer: feltet er låst og kan ikke sendes. */
  venter: boolean;
  className?: string;
};

/**
 * Chatinput (EXPERIENCE.md Component Patterns): `Textarea` som vokser opp til
 * 6 linjer. `Enter` sender og `Shift+Enter` gir ny linje. Låst mens assistenten svarer.
 */
export function Chatinput({ verdi, onEndre, onSend, venter, className }: ChatinputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const kanSende = !venter && verdi.trim() !== "";

  // Reserve for nettlesere uten `field-sizing: content`: mål høyden selv.
  // `max-h` i klassen under stopper veksten ved 6 linjer i begge tilfeller.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || CSS.supports("field-sizing", "content")) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, [verdi]);

  function send() {
    if (!kanSende) return;
    onSend(verdi.trim());
    // Ved klikk har Send-knappen fokus, og den blir straks deaktivert. Flytt
    // fokus tilbake, så det ikke faller til <body> mens assistenten svarer.
    ref.current?.focus();
  }

  function vedTast(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey) return;
    // Ikke send midt i en IME-komposisjon (aksenter, tegnvalg).
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    send();
  }

  return (
    <form
      className={cn("flex items-end gap-2.5", className)}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <Textarea
        ref={ref}
        value={verdi}
        onChange={(e) => onEndre(e.target.value)}
        onKeyDown={vedTast}
        // Samme grense som forespørselsskjemaet, så et svar aldri gir ugyldig_foresporsel.
        maxLength={MAKS_TEKST_TEGN}
        readOnly={venter}
        aria-disabled={venter || undefined}
        aria-label="Ditt svar"
        placeholder="Skriv svaret ditt …"
        rows={1}
        // shadcn-standarden er text-base md:text-sm; begge overstyres så
        // chat-body (16px / 1.6) gjelder på alle bredder. 6lh = 6 linjer,
        // pluss py-2 (1rem) og kantlinjen (2px). min-h-12 (48px, som i
        // mockupen) erstatter shadcn sin min-h-16, så feltet starter på én linje.
        className="type-chat-body min-h-12 max-h-[calc(6lh+1rem+2px)] resize-none rounded-sm bg-card text-base/[1.6] md:text-base/[1.6] aria-disabled:cursor-not-allowed aria-disabled:opacity-70"
      />
      <Button type="submit" size="lg" disabled={!kanSende}>
        Send
      </Button>
    </form>
  );
}
