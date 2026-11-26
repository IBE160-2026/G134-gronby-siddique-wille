import "server-only";

import type { Steg } from "./grensesnitt";

/**
 * Faste grenser for modellkallene (AD-15). Foreløpige verdier; settes ved
 * første kjøring mot testsett A.
 *
 * Haiku 5.5 tenker adaptivt som standard, og tenkingen teller mot
 * `max_tokens`. Lav effort holder kostnaden nede (<10 øre per økt).
 */
export const MODELL_ID = "claude-haiku-5-5";

export const MAX_TOKENS: Record<Steg, number> = {
  samtale: 2048,
  krav: 4096,
  bevis: 8192,
};

/** Millisekunder per forsøk. */
export const TIMEOUT_MS = 30_000;

/** SDK-ens egne nye forsøk. Rutene prøver aldri på nytt selv. */
export const MAX_RETRIES = 1;

/** Samlet frist per kall: SDK-en venter ukritisk på `retry-after` før nye forsøk. */
export const FRIST_MS = (MAX_RETRIES + 1) * TIMEOUT_MS + 10_000;

export const EFFORT = "low" as const;
