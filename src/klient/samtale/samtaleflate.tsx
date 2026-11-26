"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { erLoggFull, kanTrykkeFerdig } from "@/kjerne/regler";
import type { SamtaleForesporsel } from "@/kjerne/skjema";
import { useOkt, useOktDispatch } from "@/klient/okt/kontekst";

import { lagForesporsel, sendSamtale, tilMeldinger, type SendtSvar } from "./api";
import { Chatinput } from "./chatinput";
import { Chatlogg } from "./chatlogg";
import { Samtalehandlinger } from "./samtalehandlinger";

/** Én feiltoast om gangen; et nytt forsøk fjerner den forrige. */
const FEIL_TOAST = "samtale-feil";

/**
 * Samtale-flaten (FR-1). Henter åpningsspørsmålet når loggen er tom, sender
 * studentens svar og fletter hele samtalesvaret inn med én handling
 * (`mottaSamtaleSvar`). Studentsvaret havner i loggen først når svaret er tatt
 * imot, så et feilet kall etterlater ingenting. Utkastet tømmes bare ved suksess.
 *
 * Forutsetter en startet økt (`Flytskall` sender ellers til Start).
 */
export function Samtaleflate() {
  const okt = useOkt();
  const dispatch = useOktDispatch();
  const [utkast, setUtkast] = useState("");
  const [venter, setVenter] = useState(false);
  // Synkrone vakter: state oppdateres ikke før neste render.
  const pagaar = useRef(false);
  const apnet = useRef(false);
  // Kallet som pågår, og om flaten er borte (unmount).
  const kontroller = useRef<AbortController | null>(null);
  const borte = useRef(false);
  const avbryt = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Ved unmount: avbryt kallet (serveren får `request.signal`) og fjern
  // feiltoasten, så «Prøv igjen» fra en gammel flate ikke sender noe. Utsatt
  // én tick: StrictMode monterer straks på nytt med de samme refene, og da
  // skal åpningskallet fortsette, ikke sendes to ganger.
  useEffect(() => {
    clearTimeout(avbryt.current);
    return () => {
      avbryt.current = setTimeout(() => {
        borte.current = true;
        kontroller.current?.abort();
        toast.dismiss(FEIL_TOAST);
      }, 0);
    };
  }, []);

  const meldinger = useMemo(() => tilMeldinger(okt.logg), [okt.logg]);
  const harSporsmal = kanTrykkeFerdig(okt);
  const loggFull = erLoggFull(okt);

  /** Sender forespørselen. Ved feil vises en toast der «Prøv igjen» sender den samme. */
  const kjor = useCallback(
    (foresporsel: SamtaleForesporsel, svar: SendtSvar | null) => {
      const forsok = async () => {
        if (pagaar.current || borte.current) return;
        pagaar.current = true;
        toast.dismiss(FEIL_TOAST);
        setVenter(true);
        const k = new AbortController();
        kontroller.current = k;
        // Reduceren forkaster svaret hvis økten har endret seg i mellomtiden.
        const resultat = await sendSamtale(foresporsel, svar, dispatch, { signal: k.signal });
        if (!resultat.ok && resultat.kode === "avbrutt") return;
        kontroller.current = null;
        pagaar.current = false;
        setVenter(false);

        if (resultat.ok) {
          // Tøm bare hvis utkastet fortsatt er svaret som ble sendt.
          if (svar) setUtkast((u) => (u.trim() === svar.tekst ? "" : u));
          return;
        }
        toast.error("Noe gikk galt. Prøv igjen.", {
          id: FEIL_TOAST,
          // Står til studenten velger: åpningsspørsmålet har ingen annen vei videre.
          duration: Infinity,
          dismissible: false,
          action: { label: "Prøv igjen", onClick: () => void forsok() },
        });
      };
      void forsok();
    },
    [dispatch],
  );

  // Åpningsspørsmålet hentes én gang, også når StrictMode kjører effekten to
  // ganger. Reduceren forkaster det i tillegg hvis loggen ikke lenger er tom.
  // Chatlogg er allerede mountet, så spørsmålet blir lest opp.
  useEffect(() => {
    if (okt.modus === null || okt.logg.length > 0 || apnet.current) return;
    apnet.current = true;
    kjor(lagForesporsel(okt).foresporsel, null);
  }, [okt, kjor]);

  function send(tekst: string) {
    if (!harSporsmal || loggFull) return;
    const { foresporsel, svar } = lagForesporsel(okt, tekst);
    kjor(foresporsel, svar);
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-chat-max flex-1 flex-col gap-5 px-6 py-6">
      <Chatlogg meldinger={meldinger} venter={venter} className="min-h-0 flex-1" />
      {loggFull && (
        <p className="text-sm text-muted-foreground">
          Samtalen er så lang som den kan bli. Trykk «Ferdig» for å gå videre.
        </p>
      )}
      <Chatinput
        verdi={utkast}
        onEndre={(verdi) => {
          setUtkast(verdi);
          // Endret utkast: «Prøv igjen» ville sendt den gamle teksten. Send
          // sender det nye. (Før første spørsmål er feltet låst.)
          toast.dismiss(FEIL_TOAST);
        }}
        onSend={send}
        // Låst mens modellen svarer, før første spørsmål og når loggen er full.
        venter={venter || !harSporsmal || loggFull}
      />
      <Samtalehandlinger venter={venter} />
    </div>
  );
}
