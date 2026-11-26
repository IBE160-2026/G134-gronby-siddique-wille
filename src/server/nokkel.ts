import "server-only";

/**
 * API-nøkkelen, trimmet, eller `undefined` hvis den mangler eller er blank.
 * Bare `src/server/` leser `ANTHROPIC_API_KEY`; nøkkelen havner aldri i logg
 * eller svar.
 */
export function lesNokkel(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const nokkel = (env.ANTHROPIC_API_KEY ?? "").trim();
  return nokkel.length > 0 ? nokkel : undefined;
}
