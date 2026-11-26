import "server-only";

import type { Modus } from "@/kjerne/skjema";

import { lesNokkel } from "../nokkel";
import { AnthropicModell } from "./anthropic";
import { DemoModell } from "./demo";
import type { Modell } from "./grensesnitt";

/**
 * Velger adapter per forespørsel (AD-10). Uten nøkkel gir `"ekte"` en modell
 * som kaster `ModellFeil("mangler_nokkel")` ved kall, før noe nettverkskall.
 */
export function velgModell(
  modus: Modus,
  {
    env = process.env,
    demoMappe,
  }: { env?: Record<string, string | undefined>; demoMappe?: string } = {},
): Modell {
  if (modus === "demo") return new DemoModell({ mappe: demoMappe });
  return new AnthropicModell({ apiKey: lesNokkel(env) });
}
