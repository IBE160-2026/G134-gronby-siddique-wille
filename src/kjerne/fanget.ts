import type { Erfaring, FeltNavn, LoggOppforing } from "./skjema";

const FELT = ["rolle", "handling", "resultat"] as const satisfies readonly FeltNavn[];

/**
 * En erfaring er fanget når rolle, handling og resultat hver har ikke-tom
 * tekst og minst én gyldig kilde: en ID som peker på en eksisterende
 * `svar`-oppføring i loggen (AD-7).
 */
export function erFanget(erfaring: Erfaring, logg: readonly LoggOppforing[]): boolean {
  const svarIder = new Set(logg.filter((o) => o.type === "svar").map((o) => o.id));
  return FELT.every((navn) => {
    const felt = erfaring[navn];
    return felt.tekst.trim() !== "" && felt.kilder.some((k) => svarIder.has(k));
  });
}

/** Antall fangede blant de aktive erfaringene. */
export function antallFangede({
  erfaringer,
  logg,
}: {
  erfaringer: readonly Erfaring[];
  logg: readonly LoggOppforing[];
}): number {
  return erfaringer.filter((e) => erFanget(e, logg)).length;
}
