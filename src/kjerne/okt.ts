/**
 * Øktens form, startverdi og ID-tildeling (AD-4, AD-5, AD-14).
 *
 * Typene ligger i kjernen fordi kjernefunksjoner (`nullstill`, senere
 * `brukEndringer`, `erFanget`) tar `Okt` som input og ikke kan importere
 * `klient`. Story 1.4 kan erstatte de delene som går over nettet med
 * `z.infer` fra skjemaene.
 */

export type Modus = "ekte" | "demo";

/** Prefiks per ID-type: sporsmal, svar, rettelse, erfaring, krav. */
export type IdPrefiks = "A" | "S" | "R" | "E" | "K";

/** Én teller per prefiks. Øker bare, settes aldri ned innen en økt. */
export type Tellere = Record<IdPrefiks, number>;

export type FeltNavn = "rolle" | "handling" | "resultat";

/** Ett R-H-R-felt (AD-13). `kilder` er `svar`-ID-er (`S…`). */
export type Felt = {
  tekst: string;
  kilder: string[];
  rettetAvStudent: boolean;
};

export type Erfaring = {
  id: string;
  tittel: string;
  tittelRettetAvStudent: boolean;
  rolle: Felt;
  handling: Felt;
  resultat: Felt;
};

/**
 * Loggen kan bare utvides (AD-5). Bare `svar` kan siteres; `rettelse`
 * registrerer en endring fra Oppsummering og brukes aldri som sitat.
 */
export type LoggOppforing =
  | {
      type: "sporsmal";
      id: string;
      tekst: string;
      /** Erfaringen spørsmålet gjelder, eller `null` (ny erfaring/overgang). */
      gjelder: string | null;
    }
  | { type: "svar"; id: string; tekst: string }
  | {
      type: "rettelse";
      id: string;
      erfaringId: string;
      felt: FeltNavn | "tittel";
      /** Hele den nye teksten. */
      tekst: string;
    };

export type Krav = { id: string; tekst: string };

/** Et verifisert bevis (AD-6): sitatet klippes ut av loggen med `start`/`slutt`. */
export type Bevis = {
  erfaringId: string;
  svarId: string;
  start: number;
  slutt: number;
};

export type BevistabellRad = {
  kravId: string;
  bevis: Bevis[];
  refleksjonsforslag: string;
};

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
