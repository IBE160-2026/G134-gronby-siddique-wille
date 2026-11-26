import { StatusSvar, type Modus } from "@/kjerne/skjema";
import type { Handling } from "@/klient/okt/reducer";

/** Status brukt når kallet feiler eller svaret er ugyldig: ingen knapp lover noe. */
export const UKJENT_STATUS: StatusSvar = { harNokkel: false, harDemodata: false };

/** Tolker svaret fra `GET /api/status`. Alt som ikke følger skjemaet, gir `UKJENT_STATUS`. */
export function tolkStatus(data: unknown): StatusSvar {
  const tolket = StatusSvar.safeParse(data);
  return tolket.success ? tolket.data : UKJENT_STATUS;
}

/** Henter status. Kaster aldri; nettverksfeil og feilstatus gir `UKJENT_STATUS`. */
export async function hentStartstatus(
  hent: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<StatusSvar> {
  try {
    const svar = await hent("/api/status", { cache: "no-store", signal });
    if (!svar.ok) return UKJENT_STATUS;
    return tolkStatus(await svar.json());
  } catch {
    return UKJENT_STATUS;
  }
}

export type Knappetilstand = {
  ekteAktiv: boolean;
  demoAktiv: boolean;
  visManglerNokkel: boolean;
  visManglerDemodata: boolean;
};

/**
 * Hvilke knapper som er aktive og hvilke meldinger som vises (FR-10, AD-17).
 * `status === null` betyr at status lastes: alt er deaktivert, ingen meldinger.
 * «Start ny økt» krever avkrysning og nøkkel; demomodus krever bare demodata.
 */
export function knappetilstand(status: StatusSvar | null, avkrysset: boolean): Knappetilstand {
  if (status === null) {
    return { ekteAktiv: false, demoAktiv: false, visManglerNokkel: false, visManglerDemodata: false };
  }
  return {
    ekteAktiv: avkrysset && status.harNokkel,
    demoAktiv: status.harDemodata,
    visManglerNokkel: !status.harNokkel,
    visManglerDemodata: !status.harDemodata,
  };
}

/**
 * Handlingene som gir en ny, tom økt i `modus`. `startOkt` ignoreres når økten
 * allerede har en modus, så en påbegynt økt nullstilles først med `nyOkt`.
 */
export function starthandlinger(naavaerendeModus: Modus | null, modus: Modus): Handling[] {
  const start: Handling = { type: "startOkt", modus };
  return naavaerendeModus === null ? [start] : [{ type: "nyOkt" }, start];
}
