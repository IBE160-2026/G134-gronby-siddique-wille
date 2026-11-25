import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { demoMappe } from "../status";
import {
  MODELLSKJEMA,
  ModellFeil,
  type Modell,
  type ModellForesporsel,
  type ModellSvarFor,
  type Steg,
} from "./grensesnitt";

/**
 * Lagrede svar for demomodus (AD-10). Bruker bare `steg` og `antallSvar`;
 * `system` og `melding` ignoreres.
 *
 * - `samtale.json` er en liste; svaret er elementet med indeks `antallSvar`.
 * - `krav.json` og `bevis.json` er ett objekt hver.
 *
 * Mangler filen, er indeksen utenfor eller har svaret feil form, kastes
 * `ModellFeil("ugyldig_svar")`. Formatet kan endres i story 1.13.
 */
export class DemoModell implements Modell {
  private readonly mappe: string;

  constructor({ mappe = demoMappe() }: { mappe?: string } = {}) {
    this.mappe = mappe;
  }

  async kall<S extends Steg>({ steg, antallSvar }: ModellForesporsel<S>): Promise<ModellSvarFor[S]> {
    const data = await lesJson(path.join(this.mappe, `${steg}.json`));

    let kandidat: unknown = data;
    if (steg === "samtale") {
      if (!Array.isArray(data) || !Number.isInteger(antallSvar) || antallSvar < 0) {
        throw new ModellFeil("ugyldig_svar");
      }
      if (antallSvar >= data.length) throw new ModellFeil("ugyldig_svar");
      kandidat = data[antallSvar];
    }

    const resultat = MODELLSKJEMA[steg].safeParse(kandidat);
    if (!resultat.success) throw new ModellFeil("ugyldig_svar");
    return resultat.data as ModellSvarFor[S];
  }
}

async function lesJson(fil: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(fil, "utf8"));
  } catch {
    // Filen mangler, kan ikke leses eller er ikke gyldig JSON.
    throw new ModellFeil("ugyldig_svar");
  }
}
