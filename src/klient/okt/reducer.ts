import { nullstill, type NullstillArsak } from "@/kjerne/nullstill";
import {
  nesteId,
  tomOkt,
  type Erfaring,
  type FeltNavn,
  type Krav,
  type Modus,
  type Okt,
} from "@/kjerne/okt";

/**
 * Alle endringer av økten (AD-4). Handlinger som bærer et serversvar har
 * `versjon` (den økten forespørselen ble sendt fra) og forkastes hvis
 * versjonen er utdatert (AD-14).
 */
export type Handling =
  | { type: "startOkt"; modus: Modus }
  | { type: "leggTilSporsmal"; versjon: number; tekst: string; gjelder: string | null }
  | { type: "leggTilSvar"; tekst: string }
  | {
      type: "leggTilRettelse";
      erfaringId: string;
      felt: FeltNavn | "tittel";
      tekst: string;
    }
  | { type: "opprettErfaring"; tittel: string }
  | { type: "slettErfaring"; erfaringId: string }
  | { type: "settAnnonse"; tekst: string }
  | { type: "settKrav"; versjon: number; krav: Omit<Krav, "id">[] }
  | { type: "nullstill"; arsak: NullstillArsak }
  | { type: "nyOkt" };

const tomtFelt = () => ({ tekst: "", kilder: [], rettetAvStudent: false });

/**
 * Ren reducer: muterer aldri `okt` og gjør ingen I/O. En handling som ikke
 * kan brukes, gir samme tilstandsobjekt tilbake.
 */
export function oktReducer(okt: Okt, handling: Handling): Okt {
  switch (handling.type) {
    case "startOkt": {
      if (okt.modus !== null) return okt;
      return { ...okt, modus: handling.modus };
    }

    case "leggTilSporsmal": {
      if (handling.versjon !== okt.versjon) return okt;
      const { id, tellere } = nesteId(okt.tellere, "A");
      // Ukjente eller slettede erfaringer forkastes (AD-5).
      const gjelder =
        handling.gjelder !== null && okt.erfaringer.some((e) => e.id === handling.gjelder)
          ? handling.gjelder
          : null;
      return {
        ...okt,
        tellere,
        logg: [...okt.logg, { type: "sporsmal", id, tekst: handling.tekst, gjelder }],
      };
    }

    case "leggTilSvar": {
      const { id, tellere } = nesteId(okt.tellere, "S");
      return {
        ...okt,
        tellere,
        logg: [...okt.logg, { type: "svar", id, tekst: handling.tekst }],
      };
    }

    case "leggTilRettelse": {
      const erfaring = okt.erfaringer.find((e) => e.id === handling.erfaringId);
      if (!erfaring) return okt;
      const naa =
        handling.felt === "tittel" ? erfaring.tittel : erfaring[handling.felt].tekst;
      // Rettelse bare når teksten faktisk endres (AD-5).
      if (naa === handling.tekst) return okt;

      const { id, tellere } = nesteId(okt.tellere, "R");
      const rettet: Erfaring =
        handling.felt === "tittel"
          ? { ...erfaring, tittel: handling.tekst, tittelRettetAvStudent: true }
          : {
              ...erfaring,
              [handling.felt]: {
                ...erfaring[handling.felt],
                tekst: handling.tekst,
                rettetAvStudent: true,
              },
            };
      // En endret erfaring tømmer bevistabellen (AD-14).
      return nullstill(
        {
          ...okt,
          tellere,
          logg: [
            ...okt.logg,
            {
              type: "rettelse",
              id,
              erfaringId: erfaring.id,
              felt: handling.felt,
              tekst: handling.tekst,
            },
          ],
          erfaringer: okt.erfaringer.map((e) => (e.id === erfaring.id ? rettet : e)),
        },
        "erfaringEndret",
      );
    }

    case "opprettErfaring": {
      const { id, tellere } = nesteId(okt.tellere, "E");
      const erfaring: Erfaring = {
        id,
        tittel: handling.tittel,
        tittelRettetAvStudent: false,
        rolle: tomtFelt(),
        handling: tomtFelt(),
        resultat: tomtFelt(),
      };
      return { ...okt, tellere, erfaringer: [...okt.erfaringer, erfaring] };
    }

    case "slettErfaring": {
      if (!okt.erfaringer.some((e) => e.id === handling.erfaringId)) return okt;
      return nullstill(
        {
          ...okt,
          erfaringer: okt.erfaringer.filter((e) => e.id !== handling.erfaringId),
          slettedeErfaringer: [...okt.slettedeErfaringer, handling.erfaringId],
        },
        "erfaringEndret",
      );
    }

    case "settAnnonse": {
      if (handling.tekst === okt.annonse) return okt;
      // En endret annonse tømmer krav og bevistabell og øker versjonen (AD-14).
      return { ...nullstill(okt, "annonseEndret"), annonse: handling.tekst };
    }

    case "settKrav": {
      if (handling.versjon !== okt.versjon) return okt;
      // Krav settes én gang per versjon. Et dobbelt svar (f.eks. dobbeltklikk)
      // forkastes, så K-ID-ene og en bevistabell underveis ikke blir utdatert.
      // Ny uttrekking krever nullstilling (`annonseEndret`), som setter krav til null.
      if (okt.krav !== null) return okt;
      let tellere = okt.tellere;
      const krav = handling.krav.map((k) => {
        const neste = nesteId(tellere, "K");
        tellere = neste.tellere;
        return { ...k, id: neste.id };
      });
      return { ...okt, tellere, krav, bevistabell: null };
    }

    case "nullstill":
      return nullstill(okt, handling.arsak);

    case "nyOkt":
      return tomOkt(okt.versjon + 1);

    default: {
      const ukjent: never = handling;
      void ukjent;
      return okt;
    }
  }
}
