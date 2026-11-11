---
status: draft
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/addendum.md
  - docs/architecture/architecture-G134-gronby-siddique-wille-2026-11-04/ARCHITECTURE-SPINE.md
  - docs/architecture/architecture-G134-gronby-siddique-wille-2026-11-04/arkitektur-begrunnelse.md
  - docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
---

# Erfaringsgruven - Epic Breakdown

## Overview

Dette dokumentet dekomponerer kravene fra PRD-en, UX-spinen (DESIGN.md + EXPERIENCE.md) og arkitektur-spinen for Erfaringsgruven til implementerbare stories.

## Requirements Inventory

### Functional Requirements

FR-1: Student kan starte en ny, anonym økt og bli stilt åpne oppfølgingsspørsmål om egne erfaringer, uten innlogging eller kontoopprettelse. Systemet stiller minst ett oppfølgingsspørsmål før samtalen kan avsluttes.

FR-2: Systemet følger opp en nevnt erfaring med spørsmål til den er beskrevet med rolle, handling og resultat. En erfaring regnes som "fanget" først når rolle, handling og resultat alle er til stede. Maks tre oppfølgingsspørsmål per erfaring; mangler feltene fortsatt etter det, går samtalen videre og erfaringen regnes ikke som fanget.

FR-3: Når minst tre erfaringer er fanget, tilbyr systemet studenten å gå videre til oppsummeringen (aldri automatisk); studenten kan også når som helst velge "Ferdig". Oppsummeringen viser alle fangede erfaringer og lar studenten rette dem før kravuttrekket starter.

FR-4: Student kan lime inn fritekst fra én stillingsannonse per økt, og systemet trekker ut listen av krav fra teksten. For testannonse A trekkes alle definerte krav ut korrekt. Kravlisten vises til studenten før bevistabellen bygges.

FR-5: For hvert krav viser systemet hvilken(e) erfaring(er) som dekker det, med en kort bevishistorie bygget av studentens egne ord fra samtalen — ingen tillagt eller oppdiktet innhold. For testsett A dekkes ≥80 % av kravene som faktisk har en matchende erfaring.

FR-6: Hvert bevis i bevistabellen lenker til eller siterer det konkrete samtalesvaret det bygger på, synlig for studenten i grensesnittet (ordrett sitat + lenken "Vis i samtalen"), ikke bare i datamodellen.

FR-7: Et krav uten dekkende erfaring markeres som et hull, med et statisk refleksjonsforslag til studenten, nøytral markering, ingen aktiv oppfølging.

FR-8: Student kan kopiere/eksportere bevistabellen og oppsummeringen som ren tekst. Eksportert tekst inneholder alle krav, tilhørende bevis (eller hull-markering), og er lesbar uten verktøyet.

FR-9: Systemet kan startes i en demomodus som kjører hele flyten (samtale → kravuttrekk → bevistabell → eksport) med forhåndslagrede eksempelsvar, uten API-nøkkel.

### NonFunctional Requirements

NFR1: Personvern — kommunikasjon er kryptert (TLS). Ingen CV- eller personopplysninger lagres etter at økten er over. Studenten informeres om personvernmodellen før økten starter, med ordlyd som ikke lover mer enn arkitekturen holder (jf. AD-17: Anthropic sletter API-data innen 30 dager, flaggede samtaler kan lagres i opptil 2 år).

NFR2: Kostnad — verktøyet bruker en ekstern språkmodell (Claude Haiku 5.5) via API; v1 er dimensjonert for lav kostnad per økt (estimert <10 øre per økt, <100 kr for hele semesterets utvikling og testing) innenfor et skoleprosjekt-budsjett.

NFR3: Plattform — lokal webapp, kjøres i nettleser via en lokal dev-server (`next dev -H 127.0.0.1`), ingen installasjon utover prosjektets oppsett, ingen hosting/database/CI i v1.

NFR4: Testbarhet — et fast testsett (fiktiv student + testannonse A, med forventede krav/bevis/hull i `fixtures/testsett-a/`) må finnes og dokumenteres, slik at FR-4, FR-5, FR-6 og FR-7 kan verifiseres automatisk (kjernetester uten nøkkel, valgfrie evalueringstester mot ekte modell).

NFR5: Tilgjengelighet — WCAG 2.2 AA. Chatloggen er en `aria-live="polite"`-region. Fremdrift kunngjøres ved endring. Dekket/hull skilles med tekst, ikke bare farge. Bevissitater er merket som sitat (`<blockquote>`/`<q>`). Alle handlinger kan nås med tastatur. `lang="nb"` på dokumentet. Bare lyst tema i v1.

### Additional Requirements

- **Starter-oppsett (påvirker Epic 1 Story 1):** Repo-roten har allerede filer, så `create-next-app` med `--src-dir` kjøres i en midlertidig mappe og flyttes inn, deretter `shadcn init`. Dev-script settes til `"dev": "next dev -H 127.0.0.1"`.
- **Rammeverk og stack:** Next.js (App Router, Cache Components av), React 19.3.1, TypeScript 5.x, Tailwind CSS 4.3.4, shadcn CLI 4.23.0, @anthropic-ai/sdk 1.5.0, Zod 4.6.7, Vitest 5.1.0 (+ vite 8.3.5 peer), Node.js LTS 26.13.0, Claude Haiku 5.5 som språkmodell (AD-1).
- **Funksjonell kjerne / tynt skall:** Alt som avgjør noe (sitatverifisering, "fanget"-status, dekket/hull, nullstilling, eksportformat) er rene funksjoner i `src/kjerne/`, uten nettverk, tilstand eller I/O.
- **Tilstandsløs server, øktdata kun i fanens minne (AD-2):** Ingen `localStorage`, `sessionStorage`, IndexedDB eller informasjonskapsler med øktinnhold. API-ruter husker ingenting mellom kall. Siden tapes ved omlasting.
- **`beforeunload`-varsel (AD-3):** Aktivt fra første studentsvar til økten tømmes, dekker både ny lasting og lukking.
- **Én eier av klienttilstanden (AD-4):** Hele økten i én `useReducer` med Context (`src/klient/okt/`), all endring gjennom navngitte handlinger i én reducer-fil.
- **Append-only samtalelogg, reduceren tildeler alle ID-er (AD-5):** Loggoppføringer (`sporsmal` A…, `svar` S…, `rettelse` R…) endres/slettes aldri. Bare `svar` kan siteres. Egen teller per ID-prefiks (`A`, `S`, `R`, `E`, `K`) i `okt.tellere`, ID-er gjenbrukes aldri.
- **Sitatverifisering på serveren (AD-6):** `verifiserSitat()` i kjernen godtar sitat bare når det er en delstreng (etter `normaliser()`: NFC, mellomrom slått sammen, trim, case-sensitiv) av en `svar`-oppføring. Kjøres i API-ruten i begge moduser (ekte/demo).
- **Kjernen utleder status, ikke modellen (AD-7):** "Fanget" krever ikke-tom tekst + gyldig kilde for rolle/handling/resultat. "Dekket" krever minst ett bevis som består AD-6. Modellens refleksjonsforslag brukes ved hull, med `STANDARD_REFLEKSJON` som reserve i `kjerne/regler.ts`.
- **Rettelser siteres aldri (AD-8):** `felt.tekst` (kan være rettet) og `rettelse`-oppføringer brukes til kobling/eksport-oppsummering, men siteres aldri. Sitater kommer bare fra `svar`.
- **Én API-kontrakt (AD-9):** `POST /api/samtale`, `POST /api/krav`, `POST /api/bevis`, `GET /api/status`, `GET /api/demo/manus`. Alle forespørsler/svar/strukturerte modellsvar er Zod-skjemaer i `src/kjerne/skjema.ts`, definert én gang. Ingen strømming i v1.
- **Demomodus bak modellgrensesnittet (AD-10):** `src/server/modell/` har ett grensesnitt med `AnthropicModell` og `DemoModell`, valgt via `modus: "ekte" | "demo"` per forespørsel. `"ekte"` uten nøkkel gir `mangler_nokkel`.
- **Demodata adskilt fra fasit (AD-11):** Lagrede modellsvar i `fixtures/testsett-a/demo/`, fasit i `fasit.json`. Demosvarene har ett bevisst falskt sitat for K5 som eneste bevis, slik at AD-6 synlig gjør K5 til hull.
- **Ingen persondata i logger (AD-12):** Logger/feilsvar inneholder bare ID-er, feilkoder og Zod-stier, aldri svar-, sitat- eller annonsetekst.
- **Samtaleruten returnerer endringer (AD-13):** `/api/samtale` returnerer `{ sporsmal, endringer[] }`; reduceren bruker `brukEndringer()`, ignorerer endringer på slettede erfaringer, overskriver aldri `rettetAvStudent`-felter.
- **Nullstilling etter avhengighet, versjonerte forespørsler (AD-14):** `nullstill()` i kjernen bestemmer hva som tømmes (endret erfaring/fortsatt samtale tømmer bevistabell; endret annonse tømmer krav+bevistabell; annonsetekst tømmes bare ved "Ny økt"). `okt.versjon` øker ved nullstilling/"Ny økt"; svar med eldre versjon forkastes.
- **Modellkall: én vei, faste grenser, én feilmodell (AD-15):** Alle kall går gjennom `anthropic.ts`. Timeout, `maxRetries`, `max_tokens` per steg i `config.ts`. Ingen `temperature`/`top_p`/`top_k`. 429/529/timeout/nettverksfeil → `modell_feil` (503); ugyldig strukturert svar → `ugyldig_svar` (502); grensebrudd → `ugyldig_foresporsel` (400).
- **Terskelregler ett sted (AD-16):** `kjerne/regler.ts` eier `MIN_ANNONSE_TEGN = 200`, `MAAL_ERFARINGER = 3`, `MAKS_OPPFOLGING_PER_ERFARING = 3`, `STANDARD_REFLEKSJON`, `kanTrykkeFerdig()`, `kanGaVidere()`, `erLukket()`. Brukes av både UI og ruter.
- **Personvernløfte bundet til arkitekturen (AD-17):** Starteksten skal si at svar sendes kryptert til Anthropic, at Anthropic sletter API-data innen 30 dager, og at flaggede samtaler kan lagres opptil 2 år — ikke mer.
- **Testdeling:** `tests/kjerne/` (Vitest, mot testsett A, uten nøkkel, kjøres alltid); `tests/eval/` (mot ekte modell, valgfri, krever nøkkel, validerer SM-4–SM-6, SM-C1).
- **Hemmeligheter:** `ANTHROPIC_API_KEY` i `.env.local` (gitignored); `.env.example` committet.
- **README for sensor:** installer Node 26 LTS, `npm install`, kopier `.env.example` til `.env.local` (valgfritt), `npm run dev`, forklaring av demomodus og K5-fellen (AD-11).
- **Navnekonvensjon:** Fagbegreper på norsk uten æøå i koden (`okt`, `erfaring`, `krav`, `bevis`, `hull`, `svarId` osv.), alt teknisk på engelsk, UI-tekst på norsk med æøå.
- **Prompter versjonert i git:** `prompts/samtale.md`, `prompts/krav.md`, `prompts/bevis.md`, ingen prompttekst i koden.

### UX Design Requirements

UX-DR1: Design tokens for merkevarelag på shadcn/ui-grunnlag — fargepalett (varm bakgrunn `#FBF8F3`, dyp grønn primær `#1F5E4A`, semantiske tilstander `covered`/`gap`), typografi (Inter for brødtekst, Source Serif 4 for display/quote/chat-body), `rounded`-skala (sm/md/lg/full) og layoutmål (`content-max`, `chat-max`, `column-max`, `section-gap`, `side-panel`) — implementert som Tailwind/shadcn-tema-konfigurasjon.

UX-DR2: Kontrastverifisering (WCAG 2.2 AA) for de spesifiserte fargekombinasjonene: `foreground`/`background` ≥7:1, `primary-foreground`/`primary` ≥4.5:1, `covered-foreground`/`covered` ≥4.5:1, `gap-foreground`/`gap` ≥4.5:1, `muted-foreground`/`background` ≥4.5:1, `muted-foreground`/`muted` ≥4.5:1.

UX-DR3: Komponent — Chatboble assistent/student (venstre/høyre-justert, `card`/`muted`-bakgrunn, skriveindikator mens modellkall pågår, auto-scroll bare hvis studenten allerede står nederst).

UX-DR4: Komponent — Chatinput (`Textarea` som vokser til 6 linjer, `Enter` sender, `Shift+Enter` ny linje, låst mens assistenten svarer).

UX-DR5: Komponent — Erfaringskort i sidepanel/Oppsummering: tittel + tre R-H-R-brikker, inline-redigerbar på Oppsummering (klikk for å redigere, lagres ved blur), kan slettes.

UX-DR6: Komponent — R-H-R-brikke: tre tilstander (tom/fylt/oppdatert med puls), er en knapp som åpner `Popover` med utdrag fra studentens svar ved klikk eller `Enter`.

UX-DR7: Komponent — Fremdriftsmåler: "N av 3 erfaringer fanget", full ved >3, viser "Gå videre til oppsummering" ved N≥3, kunngjøres ved endring (aria).

UX-DR8: Komponent — "Ferdig"-knapp: alltid synlig, deaktivert til minst ett oppfølgingsspørsmål er stilt, ruter til ulike notiser på Oppsummering avhengig av antall fangede erfaringer (0 / 1–2 / ≥3).

UX-DR9: Komponent — Annonsefelt: stor `Textarea`, plassholder "Lim inn teksten fra stillingsannonsen", "Finn krav" aktiv ved ≥200 tegn.

UX-DR10: Komponent — Kravliste: nummerert skrivebeskyttet liste, "Bygg bevistabell" / "Tilbake"-navigasjon, ingen redigering i v1.

UX-DR11: Komponent — Kravrad dekket: hvitt kort, grønn venstrestrek, "Dekket"-merke, erfaringsnavn, bevissitat, "Vis i samtalen"-lenke, "+N bevis til" (`Collapsible`) ved flere bevis.

UX-DR12: Komponent — Kravrad hull: sandtone-flate, stiplet kant, "Ikke dekket ennå"-merke, refleksjonsforslag, ingen varselikoner eller rødt/oransje.

UX-DR13: Komponent — Bevissitat: serif kursiv, grønn venstrestrek, anførselstegn, semantisk `<blockquote>`/`<q>`, leses opp som "Ditt svar: …".

UX-DR14: Komponent — "Vis i samtalen" (`Sheet` fra høyre): viser hele samtaleloggen, ruller til og markerer (`transcript-highlight`) svaret beviset bygger på, `Esc` lukker og returnerer fokus til lenken.

UX-DR15: Komponent — Stegindikator: Samtale→Oppsummering→Annonse→Krav→Bevistabell, aktivt/fullført/kommende-tilstander, fullførte steg klikkbare for å gå tilbake, kommende ikke-klikkbare, "Ny økt"-knapp til høyre.

UX-DR16: Komponent — Eksportdialog: ren-tekst-forhåndsvisning (krav + bevis/hull-markering + oppsummering), "Kopier" med `Toast`-bekreftelse, "Last ned .txt" som sekundærvalg, feilhåndtering ved mislykket kopiering.

UX-DR17: Komponent — Demobanner: smal, alltid synlig stripe på alle flater i demomodus, kan ikke lukkes.

UX-DR18: Tilstandshåndtering for samtlige skjermtilstander i State Patterns-tabellen: første møte, samtalestart (tomt sidepanel), venter på modell (skriveindikator + `Skeleton`-rader med spesifikk tekst), delvis fanget erfaring, "Ferdig" med <3/0 fangede, kravuttrekk uten treff, ingen krav dekket, modell-/API-feil (`toast.error` + "Prøv igjen", input bevares), manglende API-nøkkel (deaktivert "Start ny økt"), demomodus-avspilling, "gå tilbake og endre" (kaskaderende nullstilling), kopieringsfeil, "Ny økt"/lukke fane (bekreftelsesdialog + nettleserens `beforeunload`).

UX-DR19: Mikrotekst og tone (du-form, varm, nysgjerrig, ingen fagsjargong) etter Voice and Tone-tabellen: konkrete spørsmålsformuleringer, hull-tekst som "Ikke dekket ennå" (aldri "mangler erfaring"/"ikke kvalifisert"), ingen poeng/prosent-match, ingen AI-genererings-språk om bevis.

UX-DR20: Responsivt oppsett: `≥lg` chat+sidepanel side om side, `md` sammenleggbar sidepanel-stripe, `<md` én kolonne med erfaringer i `Sheet` nedenfra og stablet bevistabell (funksjonelt, ikke optimalisert i v1).

UX-DR21: Tilgjengelighet utover NFR5: tastaturnavigering for alle handlinger med `ring`-fokusstil arvet fra shadcn, `Tab` følger leserekkefølgen, fokus flyttes til markert svar når "Vis i samtalen" åpnes og tilbake når den lukkes.

UX-DR22: Informasjonsarkitektur: lineær flyt med flatene Start → Samtale → Oppsummering → Annonse → Krav → Bevistabell, ingen fri navigasjon/sidemeny, ingen modaler oppå modaler.

### FR Coverage Map

FR-1: Epic 1 - Start ny anonym økt, åpne oppfølgingsspørsmål
FR-2: Epic 1 - Konkretiser erfaring til rolle/handling/resultat
FR-3: Epic 1 - Avslutt samtale og vis oppsummering
FR-4: Epic 2 - Lim inn og trekk ut krav fra stillingsannonse
FR-5: Epic 3 - Koble krav til erfaring med bevishistorie
FR-6: Epic 3 - Vis sporbarhet (sitat + "Vis i samtalen")
FR-7: Epic 3 - Marker hull med refleksjonsforslag
FR-8: Epic 4 - Eksporter bevistabell og oppsummering som ren tekst
FR-9: Epic 1 (grunnoppsett README/.env.example) + Epic 5 (full demoflyt) - Kjør uten API-nøkkel

NFR1 (Personvern): Epic 1
NFR2 (Kostnad): Epic 1
NFR3 (Plattform): Epic 1
NFR4 (Testbarhet): Epic 2 (SM-4), Epic 3 (SM-5, SM-6, SM-C1), Epic 5 (fullført, tests/eval)
NFR5 (Tilgjengelighet): Epic 1 (grunnlag), gjentas i Epic 2-4 for egne komponenter

## Epic List

### Epic 1: Samtale og erfaringsfangst (+ prosjektgrunnlag)
Studenten kan starte en ny, anonym økt uten innlogging og bli stilt åpne oppfølgingsspørsmål til minst tre erfaringer er fanget med rolle, handling og resultat; studenten kan rette og gå videre til oppsummeringen. Denne epicen etablerer også grunnlaget alle senere epics bygger videre på uten å måtte endre: Next.js/shadcn-oppsett, øktreducer og Context, Zod-skjema for API-kontrakten, modelladapter-grensesnitt (ekte + demo), terskelregler, feilmodell, personvernstekst på Start, og en tidlig README + `.env.example` slik at appen alltid kan kjøres og demoes av sensor fra starten.
**FRs covered:** FR-1, FR-2, FR-3, FR-9 (delvis: grunnleggende README/.env.example)

### Epic 2: Kravuttrekk fra stillingsannonse
Studenten limer inn tekst fra én stillingsannonse og får kravene trukket ut og vist, med egen ekte/demo-støtte for `/api/krav` og automatisk testbarhet mot testsett A.
**FRs covered:** FR-4

### Epic 3: Bevistabell med sporbarhet og hull
For hvert krav viser systemet dekkende erfaring med et verifisert, ordrett sitat og lenken «Vis i samtalen», eller markerer kravet som hull med refleksjonsforslag. Egen ekte/demo-støtte for `/api/bevis`.
**FRs covered:** FR-5, FR-6, FR-7

### Epic 4: Eksport av resultat
Studenten kan kopiere eller laste ned bevistabellen og oppsummeringen som ren tekst, lesbar uten verktøyet.
**FRs covered:** FR-8

### Epic 5: Demomodus for sensor og dokumentasjon
Sensor kan kjøre hele flyten (samtale → kravuttrekk → bevistabell → eksport) med lagrede eksempelsvar uten API-nøkkel. Sluttfører end-til-ende-demoscriptet på toppen av demostøtten bygget route for route i Epic 1-3, utvider README med forklaring av K5-fellen, og legger til valgfrie evalueringstester (`tests/eval/`) mot ekte modell for SM-4-SM-6 og SM-C1.
**FRs covered:** FR-9 (fullført)

---

## Epic 1: Samtale og erfaringsfangst (+ prosjektgrunnlag)

Studenten kan starte en ny, anonym økt uten innlogging og bli stilt åpne oppfølgingsspørsmål til minst tre erfaringer er fanget med rolle, handling og resultat; studenten kan rette og gå videre til oppsummeringen. Epicen etablerer også grunnlaget alle senere epics bygger videre på: Next.js/shadcn-oppsett, øktreducer og Context, Zod-skjema for API-kontrakten, modelladapter-grensesnitt (ekte + demo), terskelregler, feilmodell og personvernstekst på Start.

### Story 1.1: README og .env.example for lokal kjøring

As a sensor/tester,
I want en README med kjøreinstruksjoner og en dokumentert `.env.example`,
So that jeg kan sette opp og kjøre prosjektet lokalt selv før alle funksjoner er bygget.

**Acceptance Criteria:**

**Given** et nyklonet repo
**When** jeg følger README
**Then** den beskriver installasjon av Node 26 LTS, `npm install`, å kopiere `.env.example` til `.env.local` (valgfritt), og `npm run dev`
**And** den forklarer at demomodus kan kjøres uten API-nøkkel (oppdateres med detaljer i Epic 5, men den grunnleggende forklaringen finnes fra denne storyen)

**Given** `.env.example` i reporoten
**When** jeg åpner filen
**Then** den lister `ANTHROPIC_API_KEY` med en kort kommentar om hva variabelen brukes til
**And** filen er committet, mens en eventuell `.env.local` er gitignored

### Story 1.2: Prosjektgrunnlag med Next.js, shadcn og dev-server

As a utvikler i gruppen,
I want et Next.js-prosjekt (App Router) med shadcn/ui og riktig dev-script,
So that vi har ett felles prosjekt å bygge videre på (AD-1).

**Acceptance Criteria:**

**Given** reporoten med eksisterende filer
**When** prosjektet settes opp
**Then** `create-next-app` med `--src-dir` er kjørt i en midlertidig mappe og flyttet inn, og `shadcn init` er kjørt
**And** `package.json` har `"dev": "next dev -H 127.0.0.1"`

**Given** prosjektet er satt opp
**When** jeg kjører `npm run dev`
**Then** appen starter uten feil og viser en tom placeholder-side på `127.0.0.1`
**And** mappestrukturen følger arkitektur-spinen (`src/app`, `src/kjerne`, `src/klient`, `src/server/modell`, `src/components/ui`)

### Story 1.3: Øktreducer, Context og versjonering

As a utvikler i gruppen,
I want hele økten i én `useReducer` med Context og en øktversjon,
So that ingen andre komponenter kan holde egne kopier av øktdata som glir fra hverandre (AD-4, AD-14).

**Acceptance Criteria:**

**Given** `src/klient/okt/` reduceren
**When** en handling dispatches
**Then** endringen skjer gjennom en navngitt handling i reduceren, og alle komponenter som leser økten gjør det via Context
**And** `okt.versjon` finnes og øker ved nullstilling og ved «Ny økt»

**Given** reduceren har tellere per ID-prefiks (`A`, `S`, `R`, `E`, `K`) i `okt.tellere` (AD-5)
**When** en ny oppføring opprettes
**Then** reduceren tildeler neste ledige ID for riktig prefiks, og tellere øker uten gjenbruk, heller ikke etter sletting

### Story 1.4: API-kontrakt, Zod-skjema og statusrute

As a utvikler i gruppen,
I want ett sted for Zod-skjemaene og en `GET /api/status`-rute,
So that klient, ruter og modellsvar alltid har samme form (AD-9).

**Acceptance Criteria:**

**Given** `src/kjerne/skjema.ts`
**When** et API-skjema trengs et sted i koden
**Then** det importeres fra denne filen, ikke defineres på nytt
**And** feilsvarformen `{ feil: { kode, melding } }` med kodene `modell_feil` (503), `ugyldig_svar` (502), `mangler_nokkel` (400) og `ugyldig_foresporsel` (400) er definert i skjemaet

**Given** `GET /api/status`
**When** ruten kalles
**Then** den returnerer `{ harNokkel, harDemodata }` basert på om `ANTHROPIC_API_KEY` er satt og om demo-fixtures finnes

### Story 1.5: Modelladapter-grensesnitt og konfigurasjon

As a utvikler i gruppen,
I want ett grensesnitt for modellkall med `AnthropicModell` og `DemoModell`, og faste grenser,
So that alle kall går samme vei og kostnaden er kontrollert (AD-10, AD-15, NFR2).

**Acceptance Criteria:**

**Given** `src/server/modell/` med `anthropic.ts` og `config.ts`
**When** et steg kaller modellen med `modus: "ekte"`
**Then** kallet går gjennom `anthropic.ts` med `max_tokens`, timeout og `maxRetries` fra `config.ts`, uten `temperature`, `top_p` eller `top_k`

**Given** en modellforespørsel med `modus: "ekte"` uten `ANTHROPIC_API_KEY`
**When** kallet gjøres
**Then** svaret er feilkoden `mangler_nokkel` (400)

**Given** et nettverksfeil, timeout eller 429/529-svar fra Anthropic
**When** kallet feiler
**Then** feilkoden `modell_feil` (503) returneres, og ruten prøver ikke på nytt selv

### Story 1.6: Startside med personvernstekst og øktstart

As a student,
I want en startside som forklarer personvernet og lar meg starte en ny økt,
So that jeg forstår hva som skjer med svarene mine før jeg begynner (FR-1, NFR1, AD-17).

**Acceptance Criteria:**

**Given** jeg åpner appen
**When** Start-siden lastes
**Then** jeg ser `display`-teksten «Du har sannsynligvis mer erfaring enn du tror», en kort forklaring av hvordan det fungerer, og personvernlinjen i tråd med AD-17 (kryptert til Anthropic, sletting innen 30 dager, flaggede samtaler opptil 2 år)
**And** teksten lover ikke mer enn dette

**Given** jeg har en gyldig API-nøkkel konfigurert på serveren
**When** jeg trykker «Start ny økt»
**Then** jeg sendes til Samtale-flaten og en ny, tom økt opprettes

**Given** serveren ikke har en API-nøkkel (`GET /api/status` → `harNokkel: false`, fra Story 1.4)
**When** Start-siden lastes
**Then** «Start ny økt» er deaktivert med forklaringen «Ingen API-nøkkel funnet. Se README, eller prøv demomodus.»

### Story 1.7: Samtale-UI: chatboble, chatinput og skriveindikator

As a student,
I want en chat med tydelige bobler for meg og assistenten, og et felt som er lett å skrive i,
So that samtalen kjennes naturlig, ikke som et skjema (UX-DR3, UX-DR4).

**Acceptance Criteria:**

**Given** Samtale-flaten
**When** en melding vises
**Then** assistentens bobler er venstrejustert (`card`-bakgrunn, kant) og studentens er høyrejustert (`muted`-bakgrunn, ingen kant), i `chat-body`-typografi

**Given** jeg skriver i chatinput
**When** jeg trykker `Enter`
**Then** meldingen sendes; `Shift+Enter` gir ny linje i stedet, og feltet vokser opp til 6 linjer

**Given** et modellkall til samtalen pågår
**When** jeg venter på svar
**Then** chatinput er låst og en skriveindikator («Erfaringsgruven skriver …») vises

### Story 1.8: Samtalerute som stiller og mottar oppfølgingsspørsmål

As a student,
I want å bli stilt et åpent oppfølgingsspørsmål når jeg starter en økt,
So that jeg blir intervjuet om erfaringer jeg selv ikke ville tenkt å nevne (FR-1).

**Acceptance Criteria:**

**Given** en ny, tom økt
**When** jeg starter samtalen
**Then** `POST /api/samtale` returnerer et første, åpent spørsmål uten fagsjargong (UX-DR19)

**Given** jeg har svart på et spørsmål
**When** svaret sendes til `/api/samtale`
**Then** svaret lagres som en `svar`-oppføring (`S…`) i loggen, og et nytt oppfølgingsspørsmål returneres i `{ sporsmal, endringer[] }`-formen (AD-13)

**Given** systemet har stilt minst ett spørsmål
**When** jeg ser på «Ferdig»-knappen
**Then** den er nå aktiv (jf. `kanTrykkeFerdig()`, AD-16)

### Story 1.9: Erfaringskort, R-H-R-brikker og "fanget"-logikk

As a student,
I want å se erfaringene mine dukke opp som kort med rolle/handling/resultat mens jeg forteller,
So that jeg ser fremgangen min konkret (FR-2, UX-DR5, UX-DR6).

**Acceptance Criteria:**

**Given** jeg nevner en ny erfaring i samtalen
**When** modellen foreslår `opprett` med en midlertidig referanse (`{ ny: "n1" }`)
**Then** reduceren tildeler en `E`-ID, og et erfaringskort med tittel og tre tomme R-H-R-brikker vises i sidepanelet

**Given** et erfaringskort med noen felt utfylt
**When** `settTekst`/`leggTilKilde`-endringer mottas fra `/api/samtale`
**Then** `kjerne/fanget.ts` sin `erFanget()` regner erfaringen som fanget først når rolle, handling og resultat alle har ikke-tom tekst og minst én gyldig kilde (AD-7)

**Given** en R-H-R-brikke
**When** jeg klikker den eller trykker `Enter`
**Then** en `Popover` åpner med utdraget fra svaret den bygger på

### Story 1.10: Terskelregler for oppfølgingsspørsmål

As a student,
I want at samtalen går videre til en ny erfaring hvis jeg blir "fastlåst" på én,
So that samtalen aldri stopper opp (FR-2, AD-16).

**Acceptance Criteria:**

**Given** en erfaring har fått `MAKS_OPPFOLGING_PER_ERFARING` (3) oppfølgingsspørsmål
**When** modellen foreslår et nytt spørsmål med `gjelder` lik den erfaringen
**Then** `/api/samtale` bytter spørsmålet ut med `OVERGANGSSPORSMAL` (`gjelder: null`) før svaret forlater serveren (AD-16)

**Given** en erfaring er lukket (`erLukket()` sann) men fortsatt mangler et felt
**When** jeg ser på erfaringen
**Then** den regnes ikke som fanget (AD-7), men spørsmålsgrensen stopper bare nye spørsmål om den, ikke statusberegningen

### Story 1.11: Fremdriftsmåler og "Ferdig"-knapp

As a student,
I want å se hvor mange erfaringer jeg har fanget, og en tydelig vei videre,
So that jeg vet når jeg kan gå til oppsummeringen (FR-3, UX-DR7, UX-DR8).

**Acceptance Criteria:**

**Given** 0, 1, 2 eller ≥3 fangede erfaringer
**When** fremdriftsmåleren vises
**Then** den viser «N av 3 erfaringer fanget», full ved N>3, og kunngjøres via tekst ved endring (aria, NFR5)

**Given** N ≥ 3 fangede erfaringer
**When** fremdriftsmåleren oppdateres
**Then** knappen «Gå videre til oppsummering» vises, uten at overgangen skjer automatisk (FR-3)

**Given** «Ferdig»-knappen er aktiv
**When** jeg trykker den
**Then** jeg sendes til Oppsummering uansett antall fangede erfaringer

### Story 1.12: Oppsummeringsside med retting av erfaringer

As a student,
I want å se og rette erfaringene mine før jeg går videre,
So that jeg kan rydde opp i det systemet har fanget (FR-3, AD-8, AD-13).

**Acceptance Criteria:**

**Given** jeg er på Oppsummering med ≥3 fangede erfaringer
**When** siden lastes
**Then** alle fangede erfaringer vises med tittel og R-H-R-tekst, redigerbare inline

**Given** jeg retter teksten i et felt og forlater det (blur)
**When** endringen lagres
**Then** en `rettelse`-oppføring (`R…`) opprettes bare hvis teksten faktisk endret seg, feltet merkes `rettetAvStudent`, og det rettede feltet brukes videre til kobling og eksport-oppsummering, men kan aldri siteres (AD-8)

**Given** jeg har fanget <3 erfaringer og trykket «Ferdig»
**When** Oppsummering vises
**Then** en notis viser «Du har fanget N erfaringer. Du kan fortsette samtalen eller gå videre med det du har.», med 0 fangede viser bare «Fortsett samtalen» som aktivt valg

### Story 1.13: Demomodus for samtalen

As a sensor,
I want å kunne spille gjennom samtalen med lagrede eksempelsvar,
So that jeg kan prøve starten av flyten uten egen API-nøkkel (FR-9 delvis, AD-10, AD-11).

**Acceptance Criteria:**

**Given** `modus: "demo"` sendes til `/api/samtale`
**When** ruten kaller `DemoModell`
**Then** den velger lagret svar basert på steget og antall `svar`-oppføringer i loggen, uten å kalle Anthropic

**Given** demomodus er aktiv
**When** jeg er på en hvilket som helst flate
**Then** et ikke-lukkbart demobanner vises øverst: «Demomodus – eksempelsvar, ingen API-nøkkel» (UX-DR17)

**Given** jeg er i demomodus på Samtale
**When** jeg skal gå videre
**Then** jeg trykker «Neste» i stedet for å skrive, og annonsen er låst til testannonse A senere i flyten

### Story 1.14: beforeunload-varsel og "Ny økt" med bekreftelse

As a student,
I want å bli varslet før jeg mister økten ved et uhell,
So that jeg ikke taper arbeidet mitt uforvarende (AD-3).

**Acceptance Criteria:**

**Given** jeg har gitt minst ett svar i økten
**When** jeg prøver å laste siden på nytt eller lukke fanen
**Then** nettleserens standard `beforeunload`-varsel vises

**Given** jeg trykker «Ny økt» fra et hvilket som helst steg
**When** jeg bekrefter i dialogen «Alt i denne økten forsvinner»
**Then** all tilstand tømmes og jeg sendes til Start; avbryter jeg, forblir økten uendret

### Story 1.15: Stegindikator-skall og tilgjengelighet for samtaleflaten

As a student,
I want å se hvor jeg er i flyten, og at samtalen fungerer med tastatur og skjermleser,
So that verktøyet er trygt og tilgjengelig å bruke (UX-DR15, NFR5, UX-DR21).

**Acceptance Criteria:**

**Given** en flate etter Start
**When** stegindikatoren vises
**Then** den viser alle steg (Samtale→Oppsummering→Annonse→Krav→Bevistabell) med aktivt/fullført/kommende-tilstand, der fullførte steg er klikkbare og kommende ikke er det

**Given** chatloggen oppdateres med et nytt assistentsvar
**When** meldingen legges til
**Then** regionen er `aria-live="polite"`, og dokumentet har `lang="nb"`

**Given** jeg navigerer med tastatur alene
**When** jeg bruker `Tab` gjennom Samtale-flaten
**Then** alle handlinger kan nås i leserekkefølge, med fokusring arvet fra shadcn

### Story 1.16: Merkevaretema og kontrastverifisering

As a student,
I want at appen bruker Erfaringsgruvens egne farger og typografi i stedet for shadcn-standarden,
So that produktet kjennes rolig og varmt, ikke som et generisk skjema (UX-DR1, UX-DR2).

**Acceptance Criteria:**

**Given** shadcn-prosjektet fra Story 1.2
**When** temaet settes opp
**Then** Tailwind/shadcn-tokens overstyres med paletten i DESIGN.md (bakgrunn `#FBF8F3`, primær `#1F5E4A`, `covered`/`gap`-tilstandene, øvrige varme nøytraler) og typografien (Inter for brødtekst, Source Serif 4 for `display`/`display-sm`/`quote`/`chat-body`), samt `rounded`- og `spacing`-skalaene

**Given** de spesifiserte fargekombinasjonene i DESIGN.md
**When** kontrasten måles
**Then** `foreground`/`background` ≥7:1, `primary-foreground`/`primary` ≥4.5:1, `covered-foreground`/`covered` ≥4.5:1, `gap-foreground`/`gap` ≥4.5:1, og `muted-foreground` mot både `background` og `muted` ≥4.5:1 (WCAG 2.2 AA)

### Story 1.17: Responsivt oppsett for hovedflatene

As a student,
I want at appen fungerer på min skjermstørrelse, uansett om jeg bruker en bærbar eller mobil,
So that jeg ikke er låst til én enhet (UX-DR20).

**Acceptance Criteria:**

**Given** en skjerm `≥1024px` (`lg`)
**When** Samtale-flaten vises
**Then** chat og sidepanel vises side om side, chat maks `{spacing.chat-max}` og sidepanel `{spacing.side-panel}`

**Given** en skjerm `768–1023px` (`md`)
**When** en flate med sidepanel vises
**Then** sidepanelet blir en sammenleggbar stripe over innholdet («2 av 3 · Vis erfaringer»)

**Given** en skjerm `<768px`
**When** en flate med flere kolonner vises
**Then** innholdet vises i én kolonne, erfaringer åpnes i en `Sheet` nedenfra, og bevistabellen stables (funksjonelt, ikke optimalisert i v1)

---

## Epic 2: Kravuttrekk fra stillingsannonse

Studenten limer inn tekst fra én stillingsannonse og får kravene trukket ut og vist, med egen ekte/demo-støtte for `/api/krav` og automatisk testbarhet mot testsett A.

### Story 2.1: Annonsefelt med terskel for "Finn krav"

As a student,
I want å lime inn stillingsannonsen i et stort felt,
So that jeg kan starte kravuttrekket når jeg har limt inn nok tekst (FR-4, UX-DR9).

**Acceptance Criteria:**

**Given** Annonse-flaten
**When** jeg limer inn tekst
**Then** feltet har plassholderen «Lim inn teksten fra stillingsannonsen», og «Finn krav» forblir deaktivert til feltet har minst `MIN_ANNONSE_TEGN` (200) tegn (AD-16)

**Given** jeg trykker «Finn krav» med gyldig lengde
**When** forespørselen sendes
**Then** `okt.versjon` følger med forespørselen (AD-14)

### Story 2.2: Samtalerute for kravuttrekk

As a student,
I want at systemet trekker ut arbeidsgiverens krav fra annonseteksten,
So that jeg vet hva jeg skal matches mot (FR-4).

**Acceptance Criteria:**

**Given** en annonsetekst på minst 200 tegn
**When** `POST /api/krav` kalles med `modus: "ekte"`
**Then** ruten returnerer en liste med krav, validert mot Zod-skjemaet i `src/kjerne/skjema.ts` (AD-9)

**Given** et svar fra serveren kommer etter at studenten har endret annonsen (nyere `okt.versjon`)
**When** reduceren mottar det gamle svaret
**Then** svaret forkastes (AD-14)

**Given** en tom kravliste fra modellen
**When** svaret valideres
**Then** det regnes som et gyldig resultat, ikke en feil (AD-9)

### Story 2.3: Kravliste-side

As a student,
I want å se kravene som er funnet før bevistabellen bygges,
So that jeg kan sjekke at annonsen ble lest riktig (FR-4, UX-DR10).

**Acceptance Criteria:**

**Given** kravuttrekket er ferdig
**When** Krav-flaten vises
**Then** kravene vises som en nummerert, skrivebeskyttet liste, med «Bygg bevistabell» og «Tilbake» til Annonse

**Given** jeg går «Tilbake» og endrer annonseteksten
**When** jeg trykker «Finn krav» igjen
**Then** den gamle kravlisten og en eventuell bevistabell tømmes (AD-14)

### Story 2.4: Demomodus for kravuttrekk

As a sensor,
I want at kravuttrekket også fungerer i demomodus med testannonse A,
So that jeg kan prøve denne delen av flyten uten API-nøkkel (FR-9 delvis, AD-10, AD-11).

**Acceptance Criteria:**

**Given** `modus: "demo"`
**When** jeg kommer til Annonse-flaten
**Then** annonsefeltet er låst til teksten i `fixtures/testsett-a/annonse-a.md`

**Given** demomodus og testannonse A
**When** jeg trykker «Finn krav»
**Then** `DemoModell` returnerer det lagrede svaret for kravuttrekk fra `fixtures/testsett-a/demo/`, uten å kalle Anthropic

### Story 2.5: Kjernetester for kravuttrekk mot testsett A

As a utvikler i gruppen,
I want automatiske tester som sjekker kravuttrekket mot fasiten,
So that SM-4 kan verifiseres uten API-nøkkel (NFR4).

**Acceptance Criteria:**

**Given** `tests/kjerne/` og `fixtures/testsett-a/fasit.json`
**When** testsuiten køres mot det lagrede demosvaret for kravuttrekk
**Then** alle fem kravene K1–K5 matcher fasiten (via `nokkelord`), og ingen linjer fra `ikke_krav` i annonsen dukker opp som krav

**Given** testsuiten
**When** den kjøres med `npm test` (eller tilsvarende)
**Then** den kjører uten å kreve `ANTHROPIC_API_KEY`

### Story 2.6: Feilhåndtering ved kravuttrekk

As a student,
I want en tydelig tilbakemelding hvis kravuttrekket ikke finner noe eller feiler,
So that jeg vet hva jeg skal gjøre videre (UX-DR18).

**Acceptance Criteria:**

**Given** kravuttrekket returnerer en tom liste
**When** Krav-flaten vises
**Then** meldingen «Vi fant ingen tydelige krav i teksten. Sjekk at du limte inn hele annonsen.» vises, og jeg sendes tilbake til Annonse

**Given** modellkallet feiler (503/502)
**When** feilen mottas
**Then** `toast.error`: «Noe gikk galt. Prøv igjen.» vises med knappen «Prøv igjen», og annonseteksten jeg skrev bevares

---

## Epic 3: Bevistabell med sporbarhet og hull

For hvert krav viser systemet dekkende erfaring med et verifisert, ordrett sitat og lenken «Vis i samtalen», eller markerer kravet som hull med refleksjonsforslag. Egen ekte/demo-støtte for `/api/bevis`.

### Story 3.1: Bevisrute som kobler krav til erfaring

As a student,
I want at systemet foreslår hvilken erfaring som dekker hvert krav,
So that jeg ser hvor jeg allerede har bevis (FR-5).

**Acceptance Criteria:**

**Given** fangede erfaringer og en kravliste
**When** `POST /api/bevis` kalles med `modus: "ekte"`
**Then** modellen foreslår `{ kravId, erfaringId, svarId, sitat }` for hvert krav den finner dekning for, og ber om et `refleksjonsforslag` for hvert krav (AD-7)

**Given** et forslag med `erfaringId` som er ukjent eller slettet, eller `svarId` som ikke er blant erfaringens `kilder`
**When** ruten behandler forslaget
**Then** beviset forkastes (AD-6)

### Story 3.2: Sitatverifisering i kjernen

As a student,
I want at ethvert bevis jeg ser er garantert mine egne ord,
So that jeg kan stole på bevistabellen uten å sjekke den selv (FR-5, SM-C1, AD-6).

**Acceptance Criteria:**

**Given** et foreslått sitat og en `svarId`
**When** `verifiserSitat()` i kjernen kjører
**Then** den normaliserer begge tekster (NFC, mellomrom slått sammen inkl. NBSP/linjeskift, trim, case-sensitiv) og godtar sitatet bare hvis det er en delstreng av `svar`-oppføringens tekst, og returnerer `{ svarId, start, slutt }`

**Given** et sitat som ikke er ordrett
**When** sjekken kjører
**Then** beviset forkastes og kravet forblir uten dekning fra det beviset

**Given** et godkjent sitat
**When** det vises eller eksporteres
**Then** teksten klippes alltid ut av loggen med `start`/`slutt`, aldri fra modellens egen streng

### Story 3.3: Kravrad dekket med bevissitat

As a student,
I want å se hvilken erfaring som dekker hvert krav, med et sitat fra mine egne ord,
So that jeg har konkret bevis å vise til (FR-5, FR-6, UX-DR11, UX-DR13).

**Acceptance Criteria:**

**Given** et krav med minst ett godkjent bevis
**When** Bevistabell-flaten vises
**Then** raden viser hvitt kort med grønn venstrestrek, merket «Dekket», erfaringens navn, og bevissitatet i serif-kursiv med grønn venstrestrek, i `<blockquote>`/`<q>`

**Given** et krav med flere bevis
**When** raden vises
**Then** ett sitat vises direkte, og «+N bevis til» vises som en `Collapsible` for resten

### Story 3.4: "Vis i samtalen"

As a student,
I want å kunne se beviset i sin opprinnelige sammenheng i samtalen,
So that sporbarheten er synlig for meg, ikke bare i datamodellen (FR-6, UX-DR14).

**Acceptance Criteria:**

**Given** jeg trykker «Vis i samtalen» på et bevis
**When** `Sheet` åpner fra høyre
**Then** hele samtaleloggen vises, rullet til og med `svar`-oppføringen (`id="logg-<svarId>"`) markert med `covered`-bakgrunn, og fokus flyttes til den

**Given** `Sheet` er åpen
**When** jeg trykker `Esc`
**Then** den lukkes og fokus går tilbake til «Vis i samtalen»-lenken

### Story 3.5: Kravrad hull med refleksjonsforslag

As a student,
I want å se tydelig, men ikke-dømmende, hvilke krav jeg ikke har dekning for ennå,
So that jeg vet hvor jeg kan reflektere videre (FR-7, UX-DR12, AD-7).

**Acceptance Criteria:**

**Given** et krav uten noe godkjent bevis
**When** raden vises
**Then** den har sandtone-flate, stiplet kant, merket «Ikke dekket ennå» og et refleksjonsforslag, uten varselikoner eller rødt/oransje

**Given** modellen ikke ga noe `refleksjonsforslag` for et hull (mangler eller tom tekst)
**When** raden vises
**Then** kjernen setter inn `STANDARD_REFLEKSJON` fra `kjerne/regler.ts`, slik at et hull aldri vises uten forslag (SM-6)

### Story 3.6: Demomodus for bevistabell med K5-fellen

As a sensor,
I want å se at sitatsjekken fungerer også i demomodus,
So that jeg forstår hvordan AD-6 beskytter mot oppdiktede bevis (FR-9 delvis, AD-11).

**Acceptance Criteria:**

**Given** `modus: "demo"` og testannonse A
**When** `/api/bevis` kalles
**Then** `DemoModell` returnerer det lagrede svaret fra `fixtures/testsett-a/demo/`, der K5 har ett bevisst falskt sitat som eneste bevis

**Given** det falske sitatet for K5
**When** `verifiserSitat()` kjører på det
**Then** sitatet avvises, og K5 vises som hull i bevistabellen, synlig for sensor

### Story 3.7: Kjernetester for bevis mot testsett A

As a utvikler i gruppen,
I want automatiske tester som sjekker sporbarhet, hull og forbudte koblinger,
So that SM-5, SM-6 og SM-C1 kan verifiseres uten API-nøkkel (NFR4).

**Acceptance Criteria:**

**Given** `fixtures/testsett-a/fasit.json`
**When** testsuiten kjører mot det lagrede demosvaret for bevis
**Then** K1–K3 viser minst én svar-ID fra `bevis` i fasiten (SM-5), og K4–K5 vises som hull med et ikke-tomt refleksjonsforslag (SM-6)

**Given** fasitens `forbudte_bevis`
**When** testsuiten sjekker bevistabellen
**Then** ingen av disse svar-ID-ene er brukt som bevis for sitt krav (SM-C1)

### Story 3.8: Ventetilstand og "ingen krav dekket"

As a student,
I want tydelig tilbakemelding mens bevistabellen bygges, og en rolig melding hvis ingenting er dekket,
So that jeg ikke tror noe har gått galt (UX-DR18).

**Acceptance Criteria:**

**Given** `/api/bevis` kalles
**When** jeg venter på svar
**Then** `Skeleton`-rader med teksten «Kobler krav til erfaringene dine …» vises i bevistabellen

**Given** alle krav ender som hull
**When** Bevistabell-flaten vises
**Then** overskriften blir «Ingen av kravene er dekket ennå. Her er noe å tenke på.», uten negativ tone

---

## Epic 4: Eksport av resultat

Studenten kan kopiere eller laste ned bevistabellen og oppsummeringen som ren tekst, lesbar uten verktøyet.

### Story 4.1: Eksportfunksjon i kjernen

As a utvikler i gruppen,
I want én funksjon som eier eksportformatet,
So that «Kopier» og «Last ned .txt» alltid viser samme innhold (FR-8, AD-8).

**Acceptance Criteria:**

**Given** en økt med kravliste, bevistabell og fangede erfaringer
**When** `lagEksport(okt)` i `kjerne/eksport.ts` kalles
**Then** den returnerer ren tekst med alle krav, hvert med sitt bevissitat eller «Ikke dekket ennå» + refleksjonsforslag, og deretter oppsummeringen av erfaringene med rettet tekst (ikke bevissitater, jf. AD-8)

**Given** den genererte teksten
**When** jeg leser den uten verktøyet
**Then** den er forståelig som frittstående tekst (ingen ID-er eller systeminterne referanser)

### Story 4.2: Eksportdialog med forhåndsvisning og kopiering

As a student,
I want å se eksporten før jeg tar den med meg, og kopiere den med ett klikk,
So that jeg lett kan lime den inn i søknaden min (FR-8, UX-DR16).

**Acceptance Criteria:**

**Given** jeg trykker «Eksporter» på Bevistabell
**When** `Dialog` åpner
**Then** den viser forhåndsvisningen fra `lagEksport(okt)`

**Given** forhåndsvisningen vises
**When** jeg trykker «Kopier»
**Then** teksten kopieres til utklippstavlen og en `Toast` bekrefter: «Kopiert. Lim inn hvor du vil.»

### Story 4.3: Nedlasting av .txt og feilhåndtering ved kopiering

As a student,
I want et alternativ hvis kopieringen ikke fungerer i nettleseren min,
So that jeg uansett får tatt resultatet med meg (FR-8, UX-DR16, UX-DR18).

**Acceptance Criteria:**

**Given** Eksportdialogen
**When** jeg trykker «Last ned .txt»
**Then** en `.txt`-fil med samme innhold som forhåndsvisningen lastes ned

**Given** «Kopier» feiler (f.eks. blokkert av nettleseren)
**When** feilen oppstår
**Then** `toast.error`: «Kunne ikke kopiere. Marker teksten og kopier selv.» vises, forhåndsvisningen markeres, og «Last ned .txt» står fortsatt som alternativ

---

## Epic 5: Demomodus for sensor og dokumentasjon

Sensor kan kjøre hele flyten (samtale → kravuttrekk → bevistabell → eksport) med lagrede eksempelsvar uten API-nøkkel. Sluttfører end-til-ende-demoscriptet på toppen av demostøtten bygget route for route i Epic 1-3, utvider README med forklaring av K5-fellen, og legger til valgfrie evalueringstester.

### Story 5.1: Sammenhengende demoscript gjennom hele flyten

As a sensor,
I want å kunne spille gjennom samtale, kravuttrekk, bevistabell og eksport i én sammenhengende avspilling,
So that jeg kan prøve hele produktet uten API-nøkkel (FR-9, SM-7).

**Acceptance Criteria:**

**Given** demomodus er valgt på Start («Prøv demomodus»)
**When** jeg trykker «Neste» gjennom samtalen
**Then** sidepanelet fylles med erfaringskort som i en ekte økt, og når demoscriptet for samtalen er ferdig avspilt, blir «Neste» til «Gå videre til oppsummering»

**Given** jeg går videre til Annonse, Krav og Bevistabell i demomodus
**When** hvert steg kalles
**Then** DemoModell-svarene fra Epic 1–3 spilles i riktig rekkefølge uten brudd, og klienten finner neste manussvar fra samme svar-telling som reduceren holder (ingen egen indeks)

**Given** jeg er ferdig med demoflyten
**When** jeg går til Eksport
**Then** «Kopier» og «Last ned .txt» fungerer identisk med en ekte økt

### Story 5.2: README med demomodus- og K5-forklaring for sensor

As a sensor,
I want README til å forklare nøyaktig hva jeg skal se etter i demomodus,
So that jeg forstår at sitatsjekken virker uten å måtte lese koden (FR-9, AD-11).

**Acceptance Criteria:**

**Given** README fra Story 1.1
**When** den utvides
**Then** den beskriver demomodus trinn for trinn, og forklarer at K5 (reiselivsbransjen) med vilje vises som hull fordi det lagrede sitatet ikke er ordrett, slik at sensor kan se sitatsjekken (AD-6) i praksis

**Given** README
**When** sensor leser den
**Then** den dokumenterer hvor testsettet (`fixtures/testsett-a/`) ligger og hva det inneholder

### Story 5.3: Valgfrie evalueringstester mot ekte modell

As a utvikler i gruppen,
I want evalueringstester som kjører mot den ekte modellen,
So that vi kan måle SM-4–SM-6 og SM-C1 med virkelige modellsvar, ikke bare de lagrede demosvarene (NFR4).

**Acceptance Criteria:**

**Given** `tests/eval/` og en gyldig `ANTHROPIC_API_KEY`
**When** evalueringstestene kjøres
**Then** de kaller `/api/krav` og `/api/bevis` med `modus: "ekte"` mot testsett A og rapporterer SM-4 (alle krav funnet), SM-5 (sporbarhet), SM-6 (hull med forslag) og SM-C1 (ingen forbudte bevis brukt)

**Given** `ANTHROPIC_API_KEY` ikke er satt
**When** `tests/kjerne/`-suiten (Vitest) kjøres
**Then** den kjører likevel og er upåvirket, fordi evalueringstestene er en egen, valgfri suite

### Story 5.4: Manglende demodata

As a sensor,
I want en tydelig melding hvis demodataene ikke finnes i mitt miljø,
So that jeg forstår hvorfor demomodus ikke er tilgjengelig (UX-DR18).

**Acceptance Criteria:**

**Given** `GET /api/status` returnerer `harDemodata: false`
**When** Start-siden lastes
**Then** «Prøv demomodus» er deaktivert med meldingen «Demodata mangler. Se README.»
