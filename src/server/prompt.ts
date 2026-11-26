import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

/** Promptene som finnes i `prompts/`. */
export type PromptNavn = "samtale";

/** Mappen med promptene. Regnes ut ved kall, som `demoMappe()` i `status.ts`. */
export function promptMappe(): string {
  return path.join(process.cwd(), "prompts");
}

/**
 * Leser `prompts/<navn>.md`. Promptteksten står bare der, aldri i koden.
 * Mangler filen, kastes en feil som bare inneholder navnet.
 */
export async function lesPrompt(navn: PromptNavn, mappe: string = promptMappe()): Promise<string> {
  let tekst: string;
  try {
    tekst = await readFile(path.join(mappe, `${navn}.md`), "utf8");
  } catch {
    throw new Error(`Prompten «${navn}» kunne ikke leses.`);
  }
  if (tekst.trim() === "") throw new Error(`Prompten «${navn}» er tom.`);
  return tekst;
}
