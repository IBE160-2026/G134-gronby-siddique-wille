import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

import type { StatusSvar } from "@/kjerne/skjema";

/** Demodata for testsett A (AD-9), adskilt fra `fasit.json`. Regnes ut ved kall. */
export function demoMappe(): string {
  return path.join(process.cwd(), "fixtures", "testsett-a", "demo");
}

/**
 * Om API-nøkkelen er satt og om demodata finnes (AD-9). Returnerer bare
 * boolske verdier; nøkkelen eller deler av den havner aldri i svaret.
 *
 * `harDemodata` = mappen finnes og har minst én `.json`-fil.
 */
export async function hentStatus({
  env = process.env,
  demoMappe: mappe = demoMappe(),
}: {
  env?: Record<string, string | undefined>;
  demoMappe?: string;
} = {}): Promise<StatusSvar> {
  const harNokkel = (env.ANTHROPIC_API_KEY ?? "").trim().length > 0;
  return { harNokkel, harDemodata: await harJsonFil(mappe) };
}

async function harJsonFil(mappe: string): Promise<boolean> {
  try {
    const filer = await readdir(mappe, { withFileTypes: true });
    return filer.some((f) => f.isFile() && f.name.toLowerCase().endsWith(".json"));
  } catch {
    // Mappen finnes ikke eller kan ikke leses.
    return false;
  }
}
