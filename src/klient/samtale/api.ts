import { nesteId, type LoggOppforing, type Okt } from "@/kjerne/okt";
import {
  FeilSvar,
  SamtaleSvar,
  type FeilKode,
  type SamtaleForesporsel,
} from "@/kjerne/skjema";

import type { Handling } from "@/klient/okt/reducer";

import type { Melding } from "./melding";

/** Studentsvaret slik det sendes og senere legges i loggen. */
export type SendtSvar = { id: string; tekst: string };

/**
 * Bygger forespørselen uten å endre økten (AD-13). Et nytt svar får ID-en
 * reduceren vil gi det (`nesteId(okt.tellere, "S")`), så ID-en modellen ser,
 * blir den samme i loggen. Uten `svar` gjelder forespørselen åpningsspørsmålet.
 */
export function lagForesporsel(
  okt: Okt,
  svar?: string,
): { foresporsel: SamtaleForesporsel; svar: SendtSvar | null } {
  if (okt.modus === null) throw new Error("Økten er ikke startet.");
  const sendt = svar === undefined ? null : { id: nesteId(okt.tellere, "S").id, tekst: svar };
  return {
    foresporsel: {
      modus: okt.modus,
      versjon: okt.versjon,
      logg: sendt ? [...okt.logg, { type: "svar", ...sendt }] : okt.logg,
      erfaringer: okt.erfaringer,
      slettedeErfaringer: okt.slettedeErfaringer,
    },
    svar: sendt,
  };
}

export type SamtaleResultat =
  | { ok: true; svar: SamtaleSvar }
  /** `nettverk`: kallet nådde ikke fram. `ukjent`: svaret hadde ukjent form. */
  | { ok: false; kode: FeilKode | "nettverk" | "ukjent" };

/**
 * Sender forespørselen til `/api/samtale` og validerer svaret mot
 * `SamtaleSvar` (eller `FeilSvar` ved feil). Kaster aldri og prøver aldri på
 * nytt; det gjør bare «Prøv igjen» (AD-15).
 */
export async function hentSporsmal(
  foresporsel: SamtaleForesporsel,
  { fetch = globalThis.fetch, signal }: { fetch?: typeof globalThis.fetch; signal?: AbortSignal } = {},
): Promise<SamtaleResultat> {
  let respons: Response;
  try {
    respons = await fetch("/api/samtale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(foresporsel),
      cache: "no-store",
      signal,
    });
  } catch {
    return { ok: false, kode: "nettverk" };
  }

  let data: unknown;
  try {
    data = await respons.json();
  } catch {
    return { ok: false, kode: "ukjent" };
  }

  if (respons.ok) {
    const svar = SamtaleSvar.safeParse(data);
    return svar.success ? { ok: true, svar: svar.data } : { ok: false, kode: "ukjent" };
  }
  const feil = FeilSvar.safeParse(data);
  return { ok: false, kode: feil.success ? feil.data.feil.kode : "ukjent" };
}

/**
 * Kjernen i ett samtalekall, uten UI: sender forespørselen og dispatcher ved
 * suksess `mottaSamtaleSvar` med nøyaktig det `svar` som ble sendt. Avbrytes
 * kallet (`signal`), dispatches ingenting og resultatet er `avbrutt`. Ved feil
 * endres ingenting, så et nytt forsøk kan sende den samme forespørselen.
 */
export async function sendSamtale(
  foresporsel: SamtaleForesporsel,
  svar: SendtSvar | null,
  dispatch: (handling: Handling) => void,
  valg: { fetch?: typeof globalThis.fetch; signal?: AbortSignal } = {},
): Promise<{ ok: true } | { ok: false; kode: FeilKode | "nettverk" | "ukjent" | "avbrutt" }> {
  const resultat = await hentSporsmal(foresporsel, valg);
  if (valg.signal?.aborted) return { ok: false, kode: "avbrutt" };
  if (!resultat.ok) return resultat;
  dispatch({ type: "mottaSamtaleSvar", versjon: foresporsel.versjon, svar, ...resultat.svar });
  return { ok: true };
}

/** Loggen som chatmeldinger: `sporsmal` → assistent, `svar` → student, `rettelse` vises ikke. */
export function tilMeldinger(logg: readonly LoggOppforing[]): Melding[] {
  const meldinger: Melding[] = [];
  for (const o of logg) {
    if (o.type === "sporsmal") meldinger.push({ id: o.id, rolle: "assistent", tekst: o.tekst });
    else if (o.type === "svar") meldinger.push({ id: o.id, rolle: "student", tekst: o.tekst });
  }
  return meldinger;
}
