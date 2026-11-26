import "server-only";

import { FEILKODER, type FeilKode, type FeilSvar } from "@/kjerne/skjema";

/**
 * HTTP-svaret for en feilkode (AD-12). Meldingen er den faste teksten fra
 * `FEILKODER`, aldri mottatte verdier eller SDK-meldinger.
 */
export function feilsvar(kode: FeilKode): Response {
  const { status, melding } = FEILKODER[kode];
  const body: FeilSvar = { feil: { kode, melding } };
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
