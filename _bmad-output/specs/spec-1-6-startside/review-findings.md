# Review Findings: story 1.6

Kodegjennomgang (`bmad-code-review`) 2026-11-26 av `main...story-1-6-startside` (0ed95bf), med fire lag: Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor.

- **Resultat:** 17 funn etter gruppering, fordelt på 0 decision, 7 patch, 3 defer og 7 avvist.
- **Acceptance Auditor:** fant ingen brudd på AC-ene eller spec-constraints.
- **Triage:** Victoria ba om å triagere uten å spørre og om å rette alle patchene.
- **Verifisering:** patchene er verifisert med Vitest (181 tester), lint, build og Chrome.

- [x] [Review][Patch] «Ny, tom økt» holdt ikke når økten var uten modus men hadde innhold (f.eks. annonse), fordi `nyOkt` bare ble sendt når `modus` var satt; `okt.modus` ble dessuten lest fra render-closure [src/klient/start/startvalg.ts:57]. `starthandlinger(modus)` sender nå alltid `nyOkt` før `startOkt`; `page.tsx` trenger ikke lenger `useOkt`. Test for økt uten modus med innhold.
- [x] [Review][Patch] Deaktiverte knapper falt ut av tabulatorrekkefølgen, så `aria-describedby`-forklaringen («Ingen API-nøkkel funnet …») aldri ble lest opp via fokus [src/klient/start/startflate.tsx:69]. `focusableWhenDisabled` på begge knappene (gir `aria-disabled`); verifisert i Chrome: Tab når begge knappene, forklaringen er koblet, `Enter` gjør ingenting.
- [x] [Review][Patch] Avkrysningen hadde `aria-describedby` til hele personvernteksten, som dermed ble lest to ganger rett etter hverandre [src/klient/start/startflate.tsx:56]. Fjernet.
- [x] [Review][Patch] `aria-label="Personvern"` var hardkodet, i strid med at tekstene står i `tekster.ts` [src/klient/start/startflate.tsx:50]. Flyttet til `PERSONVERN_SEKSJON`.
- [x] [Review][Patch] Klikkhendelsene i Startflate var aldri kjørt av en test; bytte av `"ekte"`/`"demo"` eller invertert avkrysning ville passert [tests/klient/start/startflate.test.tsx]. Startflate kalles som funksjon, og `onClick`/`onCheckedChange` kjøres med `vi.fn()`.
- [x] [Review][Patch] CAP-1 («ingen annen tekst lover noe om lagring eller sletting») hadde ingen test [tests/klient/start/startflate.test.tsx]. Test som fjerner personvernteksten og sjekker at resten ikke nevner lagring, sletting, kryptering eller Anthropic.
- [x] [Review][Patch] Lagringstesten var avhengig av `cwd`, krasjet på undermapper og hoppet over `checkbox.tsx` [tests/klient/start/startflate.test.tsx]. Stier fra `import.meta.dirname`, rekursiv `readdir` med bare filer, og `checkbox.tsx` er med.
- [x] [Review][Defer] Start tømmer en påbegynt økt uten bekreftelse når studenten går tilbake (f.eks. nettleserens tilbake-knapp) og trykker en startknapp [src/app/page.tsx:27] — deferred: EXPERIENCE.md krever bekreftelse i `Dialog` for «Ny økt», som er story 1.14; den bør også dekke Start.
- [x] [Review][Defer] Koblingen i `page.tsx` (dispatch av alle `starthandlinger` og `router.push("/samtale")`) har ingen automatisk test [src/app/page.tsx:27] — deferred: krever DOM-miljø (jsdom), som er et ikke-mål i spec-en og et åpent punkt fra 1.3.
- [x] [Review][Defer] Når både nøkkel og demodata mangler, sier «… eller prøv demomodus.» noe som er deaktivert rett ved siden av [src/klient/start/startflate.tsx] — deferred: teksten er fast mikrotekst i EXPERIENCE.md; UX (Victoria) avgjør om det trengs en egen tekst for dette tilfellet.

**Rejected:**
- Feilet `/api/status` vises som manglende nøkkel og demodata — low: siden og ruten kommer fra samme lokale server, og `hentStatus` fanger sine egne feil, så det skjer nesten bare hvis serveren stoppes mellom sidelasting og kall; en egen feiltilstand med ny tekst og «Prøv igjen» gir flere grener og ny mikrotekst.
- Dobbeltklikk kan starte to ganger før `starter` er satt — false: klikk er diskrete hendelser i React 19, og oppdateringen flushes før neste klikk behandles; knappen er da deaktivert. Gjentatt `nyOkt`+`startOkt` gir uansett samme tomme økt.
- `checkbox.tsx` importerer `cn` fra `"cn"` — false: ordrett CLI-utdata, som `textarea.tsx`; `@/lib/utils` re-eksporterer samme pakke.
- `sources: []` i SPEC mangler epics.md — avvist: rettingen er å endre spec-en under gjennomgang.
- Knappene blir stående deaktivert hvis `router.push` ikke forlater Start — low: Next faller tilbake til full navigering når klientnavigering feiler, og en ny lasting nullstiller tilstanden; en vakt mot dette gir ekstra grener.
- `Startflate` har prop-en `starter`, som spec-en ikke nevner — avvist: harmløs, testet vakt mot dobbeltklikk; visningen er fortsatt ren, og rettingen ville vært å endre spec-en.
- Personvernteksten står i et kort spec-en ikke beskriver — false: ikke i strid med noen constraint; Start har ingen mockup, og kortet holder seg innenfor én kolonne.
