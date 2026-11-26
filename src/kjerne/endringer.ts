import { nesteId, type Okt } from "./okt";
import {
  MAKS_ERFARINGER_SPORSMAL,
  MAKS_LISTE,
  OVERGANGSSPORSMAL,
  erLukket,
  erMaksNadd,
} from "./regler";
import type { Endring, Erfaring, LoggOppforing, SamtaleSvar } from "./skjema";

/** En referanse til en erfaring i et modellsvar: `E`-ID eller midlertidig `{ ny }`. */
type ErfaringRef = string | { ny: string };

const tomtFelt = () => ({ tekst: "", kilder: [], rettetAvStudent: false });

/**
 * Fletter endringene fra samtaleruten inn i økten (AD-5, AD-13). Endringene
 * brukes i rekkefølge, og en endring som ikke kan brukes, forkastes stille:
 *
 * - `opprett` gir en ny `E`-ID for `ny`. Forkastes når `ny` er brukt før i
 *   samme svar, når grensen for fangede erfaringer er nådd, eller når listen
 *   er full (`MAKS_LISTE`). Tittelen settes bare her.
 * - `leggTilKilde`/`settTekst` på en ukjent, slettet eller uløst erfaring
 *   forkastes. `{ ny }` løses via `opprett` i samme svar.
 * - `leggTilKilde` godtar bare ID-en til en `svar`-oppføring i `okt.logg`.
 * - `settTekst` overskriver aldri et felt med `rettetAvStudent`. Kilder kan
 *   fortsatt legges til, siden det ikke endrer studentens tekst.
 *
 * `nyRefs` kobler hver løste `ny` til `E`-ID-en den fikk.
 */
export function brukEndringer(
  okt: Okt,
  endringer: readonly Endring[],
): { okt: Okt; nyRefs: ReadonlyMap<string, string> } {
  const svarIder = new Set(okt.logg.filter((o) => o.type === "svar").map((o) => o.id));
  const slettede = new Set(okt.slettedeErfaringer);
  const nyRefs = new Map<string, string>();
  let tellere = okt.tellere;
  let erfaringer: Erfaring[] = okt.erfaringer;

  const finn = (ref: ErfaringRef): Erfaring | undefined => {
    const id = typeof ref === "string" ? ref : nyRefs.get(ref.ny);
    if (id === undefined || slettede.has(id)) return undefined;
    return erfaringer.find((e) => e.id === id);
  };

  const erstatt = (ny: Erfaring) => {
    erfaringer = erfaringer.map((e) => (e.id === ny.id ? ny : e));
  };

  for (const endring of endringer) {
    switch (endring.type) {
      case "opprett": {
        if (nyRefs.has(endring.ny)) break;
        if (erfaringer.length >= MAKS_LISTE) break;
        if (erMaksNadd({ erfaringer, logg: okt.logg })) break;
        const neste = nesteId(tellere, "E");
        tellere = neste.tellere;
        nyRefs.set(endring.ny, neste.id);
        erfaringer = [
          ...erfaringer,
          {
            id: neste.id,
            tittel: endring.tittel,
            tittelRettetAvStudent: false,
            rolle: tomtFelt(),
            handling: tomtFelt(),
            resultat: tomtFelt(),
          },
        ];
        break;
      }

      case "leggTilKilde": {
        const erfaring = finn(endring.erfaring);
        if (!erfaring || !svarIder.has(endring.svarId)) break;
        const felt = erfaring[endring.felt];
        if (felt.kilder.includes(endring.svarId) || felt.kilder.length >= MAKS_LISTE) break;
        erstatt({
          ...erfaring,
          [endring.felt]: { ...felt, kilder: [...felt.kilder, endring.svarId] },
        });
        break;
      }

      case "settTekst": {
        const erfaring = finn(endring.erfaring);
        if (!erfaring) break;
        const felt = erfaring[endring.felt];
        if (felt.rettetAvStudent || felt.tekst === endring.tekst) break;
        erstatt({ ...erfaring, [endring.felt]: { ...felt, tekst: endring.tekst } });
        break;
      }

      default: {
        const ukjent: never = endring;
        void ukjent;
      }
    }
  }

  if (erfaringer === okt.erfaringer) return { okt, nyRefs };
  return { okt: { ...okt, tellere, erfaringer }, nyRefs };
}

/**
 * Løser `gjelder` til en aktiv `E`-ID eller `null`. Ukjente, slettede og
 * uløste referanser blir `null` (AD-5).
 */
export function losGjelder(
  gjelder: ErfaringRef | null,
  erfaringer: readonly Erfaring[],
  nyRefs: ReadonlyMap<string, string>,
): string | null {
  if (gjelder === null) return null;
  const id = typeof gjelder === "string" ? gjelder : nyRefs.get(gjelder.ny);
  return id !== undefined && erfaringer.some((e) => e.id === id) ? id : null;
}

/**
 * Håndhever grensen for fangede erfaringer i ruten, før svaret sendes
 * (AD-16). Når grensen er nådd:
 *
 * - `opprett` og endringer på `{ ny }` fjernes.
 * - Et spørsmål som ikke gjelder en av de aktive erfaringene (altså en ny
 *   erfaring, `null` eller en ukjent ID), byttes ut med
 *   `MAKS_ERFARINGER_SPORSMAL` og `gjelder: null`.
 *
 * Under grensen returneres svaret uendret.
 */
export function begrensSamtaleSvar(
  svar: SamtaleSvar,
  tilstand: { erfaringer: readonly Erfaring[]; logg: readonly LoggOppforing[] },
): SamtaleSvar {
  if (!erMaksNadd(tilstand)) return svar;

  const endringer = svar.endringer.filter(
    (e) => e.type !== "opprett" && typeof e.erfaring === "string",
  );
  const gjelder = svar.sporsmal.gjelder;
  const gjelderAktiv =
    typeof gjelder === "string" && tilstand.erfaringer.some((e) => e.id === gjelder);
  const sporsmal = gjelderAktiv
    ? svar.sporsmal
    : { tekst: MAKS_ERFARINGER_SPORSMAL, gjelder: null };
  return { sporsmal, endringer };
}

/**
 * Håndhever grensen for oppfølgingsspørsmål i ruten, før svaret sendes
 * (AD-16). Gjelder spørsmålet en lukket erfaring (`erLukket()`), byttes det ut
 * med `OVERGANGSSPORSMAL` og `gjelder: null`. Er grensen for fangede
 * erfaringer også nådd, brukes `MAKS_ERFARINGER_SPORSMAL`, siden ingen ny
 * erfaring kan opprettes da.
 *
 * Endringene beholdes: grensen stopper bare nye spørsmål, ikke at studentens
 * siste svar fyller felt på erfaringen.
 */
export function begrensOppfolging(
  svar: SamtaleSvar,
  tilstand: { erfaringer: readonly Erfaring[]; logg: readonly LoggOppforing[] },
): SamtaleSvar {
  const gjelder = svar.sporsmal.gjelder;
  if (typeof gjelder !== "string" || !erLukket(tilstand, gjelder)) return svar;
  const tekst = erMaksNadd(tilstand) ? MAKS_ERFARINGER_SPORSMAL : OVERGANGSSPORSMAL;
  return { ...svar, sporsmal: { tekst, gjelder: null } };
}
