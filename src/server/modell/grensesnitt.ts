import "server-only";

import {
  BevisModellSvar,
  KravModellSvar,
  SamtaleModellSvar,
  type FeilKode,
} from "@/kjerne/skjema";

export type Steg = "samtale" | "krav" | "bevis";

/** Modellskjemaet per steg (uten grenser, brukes til `output_config.format`). */
export const MODELLSKJEMA = {
  samtale: SamtaleModellSvar,
  krav: KravModellSvar,
  bevis: BevisModellSvar,
} as const satisfies Record<Steg, unknown>;

export type ModellSvarFor = {
  samtale: SamtaleModellSvar;
  krav: KravModellSvar;
  bevis: BevisModellSvar;
};

/**
 * `AnthropicModell` bruker `system` og `melding` og ignorerer `antallSvar`;
 * `DemoModell` bruker bare `steg` og `antallSvar` (AD-10).
 */
export type ModellForesporsel<S extends Steg> = {
  steg: S;
  system: string;
  melding: string;
  /** Antall `svar`-oppføringer i loggen. */
  antallSvar: number;
  /** Avbryter kallet, f.eks. `request.signal` når klienten går. Gir `modell_feil`. */
  signal?: AbortSignal;
};

export interface Modell {
  /**
   * Svaret er bare validert mot modellskjemaet uten grenser. Kalleren (ruten)
   * må validere mot rutens `…Svar`-skjema fra `skjema.ts` før svaret sendes
   * til klienten (AD-9).
   */
  kall<S extends Steg>(f: ModellForesporsel<S>): Promise<ModellSvarFor[S]>;
}

/** Feilkodene et modellkall kan gi (ikke `ugyldig_foresporsel`). */
export type ModellFeilKode = Extract<FeilKode, "modell_feil" | "ugyldig_svar" | "mangler_nokkel">;

/**
 * Den eneste feilen et modellkall kaster for kjente feil. Meldingen er bare
 * koden: SDK-ens melding og `cause` tas aldri med, så modelltekst ikke kan
 * lekke via logg eller svar (AD-12).
 */
export class ModellFeil extends Error {
  readonly kode: ModellFeilKode;

  constructor(kode: ModellFeilKode) {
    super(kode);
    this.name = "ModellFeil";
    this.kode = kode;
  }
}
