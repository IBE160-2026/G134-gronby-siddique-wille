import { z } from "zod";

import {
  MAKS_ANNONSE_TEGN,
  MAKS_LISTE,
  MAKS_LOGG_OPPFORINGER,
  MAKS_TEKST_TEGN,
} from "./regler";

/**
 * Hele API-kontrakten (AD-9, AD-13). Dette er den eneste filen i `src/` som
 * importerer `zod`; resten importerer skjemaer og typer herfra.
 *
 * - Forespørselsskjemaene har grensene fra `regler.ts` og ID-er med prefiks.
 *   Et grensebrudd gir `ugyldig_foresporsel`.
 * - Modellskjemaene (`…ModellSvar`) har ingen regex eller lengdegrenser, slik
 *   at `output_config.format` kan avledes fra dem (story 1.5). Ukjente ID-er
 *   forkastes i kjernen (AD-5), ikke her.
 * - Svarene ekkoer ikke `versjon`; klienten sammenligner med versjonen den
 *   sendte (AD-14).
 */

// ---------------------------------------------------------------------------
// Byggesteiner
// ---------------------------------------------------------------------------

const tekst = z.string().max(MAKS_TEKST_TEGN);
const liste = <T extends z.ZodType>(element: T) => z.array(element).max(MAKS_LISTE);
/** Prefiks per ID-type: sporsmal, svar, rettelse, erfaring, krav. */
export type IdPrefiks = "A" | "S" | "R" | "E" | "K";

/** Øvre grense for en ID-streng, så en ID ikke kan omgå tekstgrensene. */
const MAKS_ID_TEGN = 10;

const idMedPrefiks = (prefiks: IdPrefiks) =>
  z.string().max(MAKS_ID_TEGN).regex(new RegExp(`^${prefiks}[1-9]\\d*$`));

export const SporsmalId = idMedPrefiks("A");
export const SvarId = idMedPrefiks("S");
export const RettelseId = idMedPrefiks("R");
export const ErfaringId = idMedPrefiks("E");
export const KravId = idMedPrefiks("K");

export const Modus = z.enum(["ekte", "demo"]);
export type Modus = z.infer<typeof Modus>;

export const FeltNavn = z.enum(["rolle", "handling", "resultat"]);
export type FeltNavn = z.infer<typeof FeltNavn>;

/** Ett R-H-R-felt (AD-13). `kilder` er `svar`-ID-er (`S…`). */
export const Felt = z.object({
  tekst,
  kilder: liste(SvarId),
  rettetAvStudent: z.boolean(),
});
export type Felt = z.infer<typeof Felt>;

export const Erfaring = z.object({
  id: ErfaringId,
  tittel: tekst,
  tittelRettetAvStudent: z.boolean(),
  rolle: Felt,
  handling: Felt,
  resultat: Felt,
});
export type Erfaring = z.infer<typeof Erfaring>;

/**
 * Loggen kan bare utvides (AD-5). Bare `svar` kan siteres; `rettelse`
 * registrerer en endring fra Oppsummering og brukes aldri som sitat.
 */
export const LoggOppforing = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sporsmal"),
    id: SporsmalId,
    tekst,
    /** Erfaringen spørsmålet gjelder, eller `null` (ny erfaring/overgang). */
    gjelder: ErfaringId.nullable(),
  }),
  z.object({ type: z.literal("svar"), id: SvarId, tekst }),
  z.object({
    type: z.literal("rettelse"),
    id: RettelseId,
    erfaringId: ErfaringId,
    felt: z.union([FeltNavn, z.literal("tittel")]),
    /** Hele den nye teksten. */
    tekst,
  }),
]);
export type LoggOppforing = z.infer<typeof LoggOppforing>;

export const Krav = z.object({ id: KravId, tekst });
export type Krav = z.infer<typeof Krav>;

/** Et verifisert bevis (AD-6): sitatet klippes ut av loggen med `start`/`slutt`. */
export const Bevis = z.object({
  erfaringId: ErfaringId,
  svarId: SvarId,
  start: z.number().int().nonnegative(),
  slutt: z.number().int().nonnegative(),
});
export type Bevis = z.infer<typeof Bevis>;

export const BevistabellRad = z.object({
  kravId: KravId,
  bevis: z.array(Bevis),
  refleksjonsforslag: z.string(),
});
export type BevistabellRad = z.infer<typeof BevistabellRad>;

const versjon = z.number().int().nonnegative();
const logg = z.array(LoggOppforing).max(MAKS_LOGG_OPPFORINGER);

// ---------------------------------------------------------------------------
// Feilsvar (AD-12): `melding` er fast tekst per kode, aldri mottatte verdier.
// ---------------------------------------------------------------------------

export const FEILKODER = {
  modell_feil: { status: 503, melding: "Modellen svarte ikke. Prøv igjen." },
  ugyldig_svar: { status: 502, melding: "Modellen ga et svar som ikke kunne brukes. Prøv igjen." },
  mangler_nokkel: { status: 400, melding: "Ingen API-nøkkel funnet." },
  ugyldig_foresporsel: { status: 400, melding: "Forespørselen er ugyldig." },
} as const satisfies Record<string, { status: number; melding: string }>;

export const FeilKode = z.enum(
  Object.keys(FEILKODER) as [keyof typeof FEILKODER, ...(keyof typeof FEILKODER)[]],
);
export type FeilKode = z.infer<typeof FeilKode>;

export const FeilSvar = z.object({
  feil: z.object({ kode: FeilKode, melding: z.string() }),
});
export type FeilSvar = z.infer<typeof FeilSvar>;

// ---------------------------------------------------------------------------
// GET /api/status
// ---------------------------------------------------------------------------

export const StatusSvar = z.object({
  harNokkel: z.boolean(),
  harDemodata: z.boolean(),
});
export type StatusSvar = z.infer<typeof StatusSvar>;

// ---------------------------------------------------------------------------
// POST /api/samtale
// ---------------------------------------------------------------------------

export const SamtaleForesporsel = z.object({
  modus: Modus,
  versjon,
  logg,
  erfaringer: liste(Erfaring),
  slettedeErfaringer: liste(ErfaringId),
});
export type SamtaleForesporsel = z.infer<typeof SamtaleForesporsel>;

/** Midlertidig referanse til en erfaring som opprettes i samme svar (`{ ny: "n1" }`). */
const NyRef = z.object({ ny: z.string() });
const ErfaringRef = z.union([z.string(), NyRef]);

export const Endring = z.discriminatedUnion("type", [
  z.object({ type: z.literal("opprett"), ny: z.string(), tittel: z.string() }),
  z.object({
    type: z.literal("leggTilKilde"),
    erfaring: ErfaringRef,
    felt: FeltNavn,
    svarId: z.string(),
  }),
  z.object({
    type: z.literal("settTekst"),
    erfaring: ErfaringRef,
    felt: FeltNavn,
    tekst: z.string(),
  }),
]);
export type Endring = z.infer<typeof Endring>;

export const SamtaleModellSvar = z.object({
  sporsmal: z.object({
    tekst: z.string(),
    gjelder: ErfaringRef.nullable(),
  }),
  endringer: z.array(Endring),
});
export type SamtaleModellSvar = z.infer<typeof SamtaleModellSvar>;

export const SamtaleSvar = SamtaleModellSvar;
export type SamtaleSvar = SamtaleModellSvar;

// ---------------------------------------------------------------------------
// POST /api/krav
// ---------------------------------------------------------------------------

export const KravForesporsel = z.object({
  modus: Modus,
  versjon,
  annonse: z.string().max(MAKS_ANNONSE_TEGN),
});
export type KravForesporsel = z.infer<typeof KravForesporsel>;

/** Reduceren tildeler `K`-ID-ene (`settKrav`). */
export const KravModellSvar = z.object({
  krav: z.array(z.object({ tekst: z.string() })),
});
export type KravModellSvar = z.infer<typeof KravModellSvar>;

export const KravSvar = KravModellSvar;
export type KravSvar = KravModellSvar;

// ---------------------------------------------------------------------------
// POST /api/bevis
// ---------------------------------------------------------------------------

export const BevisForesporsel = z.object({
  modus: Modus,
  versjon,
  krav: liste(Krav),
  erfaringer: liste(Erfaring),
  logg,
});
export type BevisForesporsel = z.infer<typeof BevisForesporsel>;

export const BevisModellSvar = z.object({
  bevis: z.array(
    z.object({
      kravId: z.string(),
      erfaringId: z.string(),
      svarId: z.string(),
      sitat: z.string(),
    }),
  ),
  refleksjonsforslag: z.array(z.object({ kravId: z.string(), tekst: z.string() })),
});
export type BevisModellSvar = z.infer<typeof BevisModellSvar>;

export const BevisSvar = z.object({
  bevistabell: z.array(BevistabellRad),
});
export type BevisSvar = z.infer<typeof BevisSvar>;

// ---------------------------------------------------------------------------
// GET /api/demo/manus
// ---------------------------------------------------------------------------

export const DemoManusSvar = z.object({
  svar: z.array(z.string()),
});
export type DemoManusSvar = z.infer<typeof DemoManusSvar>;
