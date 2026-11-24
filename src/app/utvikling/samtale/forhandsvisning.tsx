"use client";

import { useEffect, useRef, useState } from "react";
import { Chatinput } from "@/klient/samtale/chatinput";
import { Chatlogg } from "@/klient/samtale/chatlogg";
import type { Melding } from "@/klient/samtale/melding";

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

export function Forhandsvisning() {
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
    setUtkast("");
    setVenter(true);
    tidtaker.current = setTimeout(() => {
      t.A += 1;
      const svar = SVAR[(t.A - 5) % SVAR.length];
      setMeldinger((m) => [...m, { id: `A${t.A}`, rolle: "assistent", tekst: svar }]);
      setVenter(false);
    }, VENTETID_MS);
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-chat-max flex-col gap-5 px-6 py-6">
      <p className="text-sm text-muted-foreground">
        Utviklingsside for story 1.7. Svarene er simulert.
      </p>
      <Chatlogg meldinger={meldinger} venter={venter} className="min-h-0 flex-1" />
      <Chatinput verdi={utkast} onEndre={setUtkast} onSend={send} venter={venter} />
    </main>
  );
}
