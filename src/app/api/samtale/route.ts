import { begrensOppfolging, begrensSamtaleSvar } from "@/kjerne/endringer";
import { erLukket, erMaksNadd } from "@/kjerne/regler";
import { SamtaleForesporsel, SamtaleSvar } from "@/kjerne/skjema";
import { feilsvar } from "@/server/feil";
import { ModellFeil } from "@/server/modell/grensesnitt";
import { velgModell } from "@/server/modell/velg";
import { lesPrompt } from "@/server/prompt";

// Kjøres alltid på forespørsel og caches aldri (AD-2).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stiller neste spørsmål i samtalen (FR-1, AD-13). Ruten husker ingenting,
 * prøver aldri på nytt og logger aldri tekst (AD-12, AD-15).
 *
 * 1. Forespørselen valideres mot `SamtaleForesporsel` → ellers `ugyldig_foresporsel`.
 * 2. Modellen kalles med prompten fra `prompts/samtale.md` (ikke i demo).
 * 3. Svaret valideres mot `SamtaleSvar` → ellers `ugyldig_svar`.
 * 4. Grensen for fangede erfaringer håndheves (`begrensSamtaleSvar`).
 * 5. Grensen for oppfølgingsspørsmål håndheves (`begrensOppfolging`).
 */
export async function POST(request: Request): Promise<Response> {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return feilsvar("ugyldig_foresporsel");
  }
  const tolket = SamtaleForesporsel.safeParse(data);
  if (!tolket.success) return feilsvar("ugyldig_foresporsel");
  const foresporsel = tolket.data;

  const slettede = new Set(foresporsel.slettedeErfaringer);
  const tilstand = {
    logg: foresporsel.logg,
    erfaringer: foresporsel.erfaringer.filter((e) => !slettede.has(e.id)),
  };
  const maksNadd = erMaksNadd(tilstand);
  const lukkede = tilstand.erfaringer.filter((e) => erLukket(tilstand, e.id)).map((e) => e.id);

  let modellSvar: unknown;
  try {
    // Demo bruker lagrede svar og laster ingen prompt (AD-10).
    const system = foresporsel.modus === "demo" ? "" : await lesPrompt("samtale");
    modellSvar = await velgModell(foresporsel.modus).kall({
      steg: "samtale",
      system,
      melding: JSON.stringify({ ...tilstand, maksNadd, lukkede }),
      antallSvar: foresporsel.logg.filter((o) => o.type === "svar").length,
      signal: request.signal,
    });
  } catch (error) {
    if (error instanceof ModellFeil) return feilsvar(error.kode);
    throw error;
  }

  const svar = SamtaleSvar.safeParse(modellSvar);
  if (!svar.success) return feilsvar("ugyldig_svar");

  const begrenset = begrensOppfolging(begrensSamtaleSvar(svar.data, tilstand), tilstand);
  return Response.json(begrenset, {
    headers: { "Cache-Control": "no-store" },
  });
}
