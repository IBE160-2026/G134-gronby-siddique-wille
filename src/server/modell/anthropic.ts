import "server-only";

import Anthropic, { AnthropicError, APIError } from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { EFFORT, FRIST_MS, MAX_RETRIES, MAX_TOKENS, MODELL_ID, TIMEOUT_MS } from "./config";
import {
  MODELLSKJEMA,
  ModellFeil,
  type Modell,
  type ModellForesporsel,
  type ModellSvarFor,
  type Steg,
} from "./grensesnitt";

/**
 * Den eneste filen som importerer `@anthropic-ai/sdk` (AD-15). Ingen
 * `temperature`/`top_p`/`top_k`, ingen strømming, ingen egne nye forsøk.
 */
export class AnthropicModell implements Modell {
  private readonly klient: Anthropic | undefined;

  constructor({ apiKey, fetch }: { apiKey: string | undefined; fetch?: typeof globalThis.fetch }) {
    const nokkel = apiKey?.trim();
    this.klient = nokkel
      ? new Anthropic({
          apiKey: nokkel,
          timeout: TIMEOUT_MS,
          maxRetries: MAX_RETRIES,
          logLevel: "off",
          ...(fetch ? { fetch } : {}),
        })
      : undefined;
  }

  async kall<S extends Steg>({ steg, system, melding }: ModellForesporsel<S>): Promise<ModellSvarFor[S]> {
    if (!this.klient) throw new ModellFeil("mangler_nokkel");

    let svar;
    try {
      svar = await this.klient.messages.parse(
        {
          model: MODELL_ID,
          max_tokens: MAX_TOKENS[steg],
          system,
          messages: [{ role: "user", content: melding }],
          output_config: {
            format: zodOutputFormat(MODELLSKJEMA[steg]),
            effort: EFFORT,
          },
        },
        // Avbrudd gir `APIUserAbortError`, som er en `APIError` → `modell_feil`.
        { signal: AbortSignal.timeout(FRIST_MS) },
      );
    } catch (error) {
      throw tilModellFeil(error);
    }

    // `null` når svaret ikke har noen tekstblokk.
    if (svar.parsed_output == null) throw new ModellFeil("ugyldig_svar");
    return svar.parsed_output as ModellSvarFor[S];
  }
}

/**
 * Oversetter en feil fra modellkallet til `ModellFeil`. Feilmeldingen kan
 * inneholde modelltekst eller svartekst og forkastes alltid.
 *
 * - `ModellFeil` → uendret
 * - `APIError` (alle HTTP-feil, timeout, nettverk) → `modell_feil`
 * - annen `AnthropicError` (JSON- eller Zod-feil i `parse`) → `ugyldig_svar`
 * - alt annet (f.eks. `SyntaxError`/`TypeError` fra et ødelagt 2xx-svar) → `modell_feil`
 */
export function tilModellFeil(error: unknown): ModellFeil {
  if (error instanceof ModellFeil) return error;
  if (error instanceof APIError) return new ModellFeil("modell_feil");
  if (error instanceof AnthropicError) return new ModellFeil("ugyldig_svar");
  return new ModellFeil("modell_feil");
}
