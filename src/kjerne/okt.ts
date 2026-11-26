/**
 * Øktens form, startverdi og ID-tildeling (AD-4, AD-5, AD-14).
 *
 * Typene ligger i kjernen fordi kjernefunksjoner (`nullstill`, senere
 * `brukEndringer`, `erFanget`) tar `Okt` som input og ikke kan importere
 * `klient`. Typene som går over nettet avledes fra skjemaene i `skjema.ts`
 * (AD-13), så kontrakt og tilstand ikke kan gli fra hverandre.
 */

import type {
  BevistabellRad,
  Erfaring,
  IdPrefiks,
  Krav,
  LoggOppforing,
  Modus,
} from "./skjema";

export type {
  Bevis,
  BevistabellRad,
  Erfaring,
  Felt,
  FeltNavn,
  IdPrefiks,
  Krav,
  LoggOppforing,
  Modus,
} from "./skjema";

/** Én teller per prefiks. Øker bare, settes aldri ned innen en økt. */
export type Tellere = Record<IdPrefiks, number>;

export type Okt = {
  /** `null` før studenten har startet en økt på Start. */
  modus: Modus | null;
  /** Øker ved hver nullstilling og ved «Ny økt» (AD-14). */
  versjon: number;
  tellere: Tellere;
  logg: LoggOppforing[];
  /** Aktive erfaringer. Slettede ligger bare som ID i `slettedeErfaringer`. */
  erfaringer: Erfaring[];
  slettedeErfaringer: string[];
  annonse: string;
  /** `null` = ikke trukket ut ennå. En tom liste er et gyldig resultat. */
  krav: Krav[] | null;
  /** `null` = ikke koblet ennå. */
  bevistabell: BevistabellRad[] | null;
};

export function tomOkt(versjon = 0): Okt {
  return {
    modus: null,
    versjon,
    tellere: { A: 0, S: 0, R: 0, E: 0, K: 0 },
    logg: [],
    erfaringer: [],
    slettedeErfaringer: [],
    annonse: "",
    krav: null,
    bevistabell: null,
  };
}

/** Gir neste ID for prefikset og nye tellere. Endrer ikke `tellere`. */
export function nesteId(
  tellere: Tellere,
  prefiks: IdPrefiks,
): { id: string; tellere: Tellere } {
  const neste = tellere[prefiks] + 1;
  return { id: `${prefiks}${neste}`, tellere: { ...tellere, [prefiks]: neste } };
}
