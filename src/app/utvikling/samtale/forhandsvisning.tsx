"use client";

import { useEffect, useRef, useState } from "react";
import { Chatinput } from "@/klient/samtale/chatinput";
import { Chatlogg } from "@/klient/samtale/chatlogg";
import type { Melding } from "@/klient/samtale/melding";
import { Appskall } from "@/klient/skall/appskall";
import { STEG, type Steg } from "@/klient/skall/steg";

// Eksempelsamtalen fra mockups/samtale.html. Simulert, ingen modellkall.
const START: Melding[] = [
  { id: "A1", rolle: "assistent", tekst: "Hei! Fortell om noe du har gjort de siste årene: jobb, frivillig, studier, hva som helst." },
  { id: "S1", rolle: "student", tekst: "Hm, jeg har egentlig bare jobbet i butikk ved siden av studiene. Og så var jeg på utveksling i Lyon." },
  { id: "A2", rolle: "assistent", tekst: "Butikkjobben høres interessant ut. Hva var rollen din der?" },
  { id: "S2", rolle: "student", tekst: "Deltid som butikkmedarbeider i tre år. Mest kasse og kundeservice." },
  { id: "A3", rolle: "assistent", tekst: "Hva gjorde du konkret da det ble travelt?" },
  { id: "S3", rolle: "student", tekst: "I julehandelen var vi ofte to på kassa. Da tok jeg køen og ropte inn en kollega fra lageret når det ble over fem i kø, og så tok jeg klagene selv så den andre kunne fortsette." },
  { id: "A4", rolle: "assistent", tekst: "Hvordan gikk det til slutt?" },
];

const SVAR = [
  "Det høres ut som du tok ansvar. Hva skjedde med køen etter det?",
  "Fint, da går vi videre. Fortell gjerne om noe annet du har gjort: en annen jobb, frivillig arbeid eller et prosjekt på studiet.",
];

const VENTETID_MS = 1500;

/** Stegene før `lengst` er fullført, som om studenten har vært der. */
function fullfortFor(lengst: Steg): Steg[] {
  const slutt = STEG.findIndex((s) => s.id === lengst);
  return STEG.slice(0, slutt).map((s) => s.id);
}

export function Forhandsvisning({ lengst }: { lengst: Steg }) {
  // Å gå tilbake uten å endre noe beholder senere steg (EXPERIENCE.md), så
  // `lengst` og stegene før det forblir fullført når studenten velger et av dem.
  const [aktivt, setAktivt] = useState<Steg>(lengst);
  const [nyOktTrykket, setNyOktTrykket] = useState(false);
  const [meldinger, setMeldinger] = useState<Melding[]>(START);
  const [utkast, setUtkast] = useState("");
  const [venter, setVenter] = useState(false);
  const tellere = useRef({ A: 4, S: 3 });
  const tidtaker = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(tidtaker.current), []);

  function send(tekst: string) {
    const t = tellere.current;
    t.S += 1;
    setMeldinger((m) => [...m, { id: `S${t.S}`, rolle: "student", tekst }]);
    setVenter(true);
    tidtaker.current = setTimeout(() => {
      t.A += 1;
      const svar = SVAR[(t.A - 5) % SVAR.length];
      setMeldinger((m) => [...m, { id: `A${t.A}`, rolle: "assistent", tekst: svar }]);
      // Utkastet tømmes først når svaret er tatt imot (kontrakten i Chatinput),
      // så teksten ville blitt stående ved en feil.
      setUtkast("");
      setVenter(false);
    }, VENTETID_MS);
  }

  const fullforte = [...fullfortFor(lengst), lengst];

  return (
    <div className="flex h-dvh flex-col">
      <Appskall
        aktivt={aktivt}
        fullforte={fullforte}
        onVelgSteg={setAktivt}
        onNyOkt={() => setNyOktTrykket(true)}
        className="mx-auto w-full max-w-chat-max gap-5 px-6 py-6"
      >
        <p className="text-sm text-muted-foreground">
          Utviklingsside for story 1.7 og 1.15. Svarene er simulert, og flaten er
          alltid Samtale. Velg steg med <code>?steg=krav</code>.
          {nyOktTrykket && " «Ny økt» ble trykket (dialogen kommer i story 1.14)."}
        </p>
        <Chatlogg meldinger={meldinger} venter={venter} className="min-h-0 flex-1" />
        <Chatinput verdi={utkast} onEndre={setUtkast} onSend={send} venter={venter} />
      </Appskall>
    </div>
  );
}
