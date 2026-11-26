# Epic 1 Context: Samtale og erfaringsfangst (+ prosjektgrunnlag)

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Studenten skal kunne starte en anonym økt uten innlogging, bli intervjuet med åpne oppfølgingsspørsmål til erfaringer er fanget med rolle, handling og resultat, og deretter rette dem på en oppsummering før kravuttrekket. Samtidig legger epicen grunnmuren som Epic 2–5 bygger videre på uten å endre den: Next.js/shadcn-oppsett, øktreducer med Context, Zod-skjemaer for hele API-kontrakten, modelladapter (ekte + demo), terskelregler, feilmodell, merkevaretema, personverntekst på Start og en tidlig README/`.env.example`, slik at sensor kan kjøre appen fra første dag.

## Stories

- Story 1.1: README og .env.example for lokal kjøring
- Story 1.2: Prosjektgrunnlag med Next.js, shadcn og dev-server
- Story 1.3: Øktreducer, Context og versjonering
- Story 1.4: API-kontrakt, Zod-skjema og statusrute
- Story 1.5: Modelladapter-grensesnitt og konfigurasjon
- Story 1.6: Startside med personvernstekst og øktstart
- Story 1.7: Samtale-UI: chatboble, chatinput og skriveindikator
- Story 1.8: Samtalerute som stiller og mottar oppfølgingsspørsmål
- Story 1.9: Erfaringskort, R-H-R-brikker og "fanget"-logikk
- Story 1.10: Terskelregler for oppfølgingsspørsmål
- Story 1.11: Fremdriftsmåler og "Ferdig"-knapp
- Story 1.12: Oppsummeringsside med retting av erfaringer
- Story 1.13: Demomodus for samtalen
- Story 1.14: beforeunload-varsel og "Ny økt" med bekreftelse
- Story 1.15: Stegindikator-skall og tilgjengelighet for samtaleflaten
- Story 1.16: Merkevaretema og kontrastverifisering
- Story 1.17: Responsivt oppsett for hovedflatene

## Requirements & Constraints

- Anonym økt, ingen konto. Minst ett spørsmål må være stilt før «Ferdig» blir aktiv.
- En erfaring er **fanget** bare når rolle, handling og resultat alle har ikke-tom tekst og minst én gyldig kilde (en eksisterende `svar`-oppføring). Maks tre oppfølgingsspørsmål per erfaring; deretter går samtalen videre, og erfaringen er ikke fanget hvis felt mangler.
- Ved ≥3 fangede tilbys «Gå videre til oppsummering» – aldri automatisk overgang. «Ferdig» går alltid til Oppsummering. Med 0 fangede kan studenten ikke gå videre til kravuttrekk.
- Personvern: ingenting lagres etter økten; ingen `localStorage`/`sessionStorage`/IndexedDB/cookies med øktinnhold. Personvernteksten skal si at svar sendes kryptert til Anthropic, at Anthropic sletter API-data innen 30 dager og at flaggede samtaler kan lagres opptil 2 år – ikke mer. «Start ny økt» krever avkrysning («Jeg har lest dette og vil starte») og API-nøkkel; demomodus krever ingen avkrysning.
- Kostnad: lav kostnad per økt (<10 øre); faste `max_tokens`/timeout/`maxRetries`.
- Kun lokal kjøring via `next dev -H 127.0.0.1`; ingen hosting, database eller CI.
- Tilgjengelighet WCAG 2.2 AA: chatloggen har en `aria-live="polite"`-region som leser opp nye assistentmeldinger og skriveindikatoren – studentens egen melding leses ikke opp på nytt. Fremdrift kunngjøres som tekst, alt nås med tastatur, `lang="nb"`, kun lyst tema.
- Persondata (svar-, sitat-, annonsetekst) skal aldri havne i logger eller feilsvar – bare ID-er, feilkoder og Zod-stier.

## Technical Decisions

- **Stack:** Next.js 16 (App Router, Cache Components av), React 19, TypeScript 5, Tailwind 4, shadcn CLI 4, `@anthropic-ai/sdk` 1.5, Zod 4, Vitest 5, Node 26 LTS, modell `claude-haiku-5-5`. Repo-roten har filer fra før: kjør `create-next-app --src-dir` i midlertidig mappe, flytt inn, så `shadcn init`.
- **Funksjonell kjerne / tynt skall:** alt som avgjør noe er rene funksjoner i `src/kjerne/` (`skjema.ts`, `regler.ts`, `fanget.ts`, `endringer.ts`, `nullstill.ts`, …). `kjerne` importerer aldri `app`/`klient`/`server`; `klient` importerer aldri `server`; alle `server/`-moduler importerer `server-only`. Bare `src/server/` leser `ANTHROPIC_API_KEY`; API-ruter har `runtime = 'nodejs'` og caches aldri.
- **Klienttilstand:** hele økten i én `useReducer` + Context i `src/klient/okt/`, endring kun via navngitte handlinger i én reducer-fil. Komponenter holder bare UI-tilstand (utkast, åpne paneler).
- **Logg og ID-er:** append-only logg med `sporsmal` (`A…`), `svar` (`S…`), `rettelse` (`R…`). Reduceren tildeler alle ID-er (`A`, `S`, `R`, `E`, `K`) fra tellere i `okt.tellere` som aldri gjenbrukes. Bare `svar` kan siteres; rettelser brukes til kobling/eksport, aldri som sitat. Sletting av kort fjerner ikke loggoppføringer.
- **Samtalekontrakt:** `POST /api/samtale` → `{ sporsmal: { tekst, gjelder }, endringer[] }`. `gjelder` er `erfaringId`, `{ ny }` eller `null`. Endringer: `opprett` (`ny`, `tittel`), `leggTilKilde`, `settTekst`. Nye erfaringer får midlertidige refs (`{ ny: "n1" }`) som reduceren løser til `E`-ID; ukjente ID-er forkastes. `brukEndringer()` ignorerer slettede erfaringer og overskriver aldri felt merket `rettetAvStudent`. Feltform: `{ tekst, kilder: svarId[], rettetAvStudent }`.
- **API-kontrakt:** alle forespørsler/svar/modellsvar er Zod-skjemaer definert én gang i `src/kjerne/skjema.ts` (også for `/api/krav`, `/api/bevis`, `/api/demo/manus`). Modellen kalles med `client.messages.parse` og `output_config.format` avledet fra skjemaet. Ingen strømming. `GET /api/status` → `{ harNokkel, harDemodata }`.
- **Feilmodell:** `{ feil: { kode, melding } }` – `modell_feil` (503: 429/529/timeout/nettverk), `ugyldig_svar` (502), `mangler_nokkel` (400), `ugyldig_foresporsel` (400: grensebrudd). Ruter prøver aldri på nytt; klienten bare ved «Prøv igjen». Ved feil skal loggen ikke få halve oppføringer.
- **Modelladapter:** `src/server/modell/` med ett grensesnitt, `AnthropicModell` og `DemoModell`, valgt per forespørsel via `modus: "ekte" | "demo"`. Alle ekte kall går gjennom `anthropic.ts`; modell-ID, `max_tokens` per steg, timeout og `maxRetries` i `config.ts`. Ingen `temperature`/`top_p`/`top_k`. `DemoModell` velger lagret svar fra steg + antall `svar` i loggen; klienten bruker samme telling, ingen egen indeks. Demodata i `fixtures/testsett-a/demo/`, adskilt fra `fasit.json`.
- **Terskelregler** i `kjerne/regler.ts`, brukt av både UI og ruter: `MAAL_ERFARINGER = 3`, `MAKS_OPPFOLGING_PER_ERFARING = 3`, `MAKS_ERFARINGER = 8`, `MIN_ANNONSE_TEGN = 200`, `OVERGANGSSPORSMAL`, `STANDARD_REFLEKSJON`, øvre grenser, `kanTrykkeFerdig()`, `kanGaVidere()`, `erLukket()`. Gjelder modellens spørsmål en lukket erfaring, bytter ruten det ut med `OVERGANGSSPORSMAL` (`gjelder: null`) før svaret sendes.
- **Versjonering/nullstilling:** `okt.versjon` øker ved nullstilling og «Ny økt»; svar med eldre versjon forkastes. `nullstill()` i kjernen avgjør hva som tømmes (endret erfaring/fortsatt samtale tømmer bevistabellen).
- **Konvensjoner:** fagbegreper på norsk uten æøå i koden (`okt`, `erfaring`, `svarId`, …), teknisk på engelsk, UI-tekst på norsk med æøå. Prompter i `prompts/samtale.md` osv., ingen prompttekst i koden. Loggoppføringer rendres med `id="logg-<svarId>"`. `ANTHROPIC_API_KEY` i gitignored `.env.local`; `.env.example` committes. Kjernetester i `tests/kjerne/` (Vitest, uten nøkkel).

## UX & Interaction Patterns

- Lineær flyt Start → Samtale → Oppsummering → Annonse → Krav → Bevistabell; stegindikator med aktiv/fullført (klikkbar)/kommende og «Ny økt» til høyre. Ingen sidemeny, ingen modaler oppå modaler.
- Start: `display` «Du har sannsynligvis mer erfaring enn du tror.», én forklarende setning, fast personverntekst (ordrett fra UX-spinen), avkrysning, «Start ny økt» og «Prøv demomodus». Uten nøkkel: «Ingen API-nøkkel funnet. Se README, eller prøv demomodus.» Uten demodata: «Demodata mangler. Se README.» og demo deaktivert.
- Samtale (≥lg): chat (maks 720px) + sidepanel (360px). Assistentboble venstre (`card` + kant), studentboble høyre (`muted`), `chat-body`-typografi; autoscroll bare hvis studenten står nederst. Chatinput: `Textarea` opptil 6 linjer, `Enter` sender, `Shift+Enter` ny linje, låst under modellkall med «Erfaringsgruven skriver …». Tomt sidepanel: «Erfaringene dine dukker opp her.»
- Erfaringskort med tittel + tre R-H-R-brikker (tom/fylt/oppdatert med puls); brikken er en knapp som åpner `Popover` med svarutdrag ved klikk eller `Enter`. På Oppsummering: inline-redigering (lagres ved blur, `rettelse` bare ved faktisk endring) og sletting.
- Fremdriftsmåler: «N av 3 erfaringer fanget», full og «N erfaringer fanget» ved >3, kunngjøres ved endring.
- Oppsummering med <3: `Alert`-notis «Du har fanget N erfaringer. Du kan fortsette samtalen eller gå videre med det du har.» Med 0: «Vi har ikke fått nok til å fange en erfaring ennå.», bare «Fortsett samtalen» aktiv.
- Feil: `toast.error` (sonner) «Noe gikk galt. Prøv igjen.» med «Prøv igjen»; input bevares. «Ny økt» bekreftes i `Dialog` «Alt i denne økten forsvinner.»; `beforeunload` aktivt fra første svar.
- Demomodus: ikke-lukkbart banner «Demomodus – eksempelsvar, ingen API-nøkkel» på alle flater; studenten trykker «Neste» i stedet for å skrive.
- Tone: du-form, varm, nysgjerrig, ingen fagsjargong (ikke «STAR», «kompetanse»), ingen poeng/prosent.
- Tema: overstyr shadcn-tokens med bakgrunn `#FBF8F3`, primær `#1F5E4A`, `covered`/`gap`-tilstander og varme nøytraler; Inter for brødtekst, Source Serif 4 for `display`/`display-sm`/`quote`/`chat-body` (også chatboblene); mykere `rounded` (6/10/14px/full); layoutmål `content-max`, `chat-max`, `column-max`, `section-gap`, `side-panel`. Kontrast verifiseres (foreground/background ≥7:1, øvrige par ≥4.5:1). Grønt bare for funnet/dekket/fremdrift.
- Responsivt: `md` gir sammenleggbar stripe («2 av 3 · Vis erfaringer»), `<md` én kolonne med erfaringer i `Sheet` nedenfra.

## Cross-Story Dependencies

- 1.2 (prosjektoppsett) må komme før all annen kode; 1.16 (tema) bygger på shadcn-oppsettet fra 1.2.
- 1.3 (reducer/tellere/versjon), 1.4 (skjema, feilkoder, `/api/status`) og 1.5 (modelladapter) er fundament for 1.6–1.14; 1.6 bruker `/api/status` for nøkkel- og demodatasjekk.
- 1.8 (`/api/samtale`) forutsetter 1.4/1.5; 1.9, 1.10 og 1.11 bygger på endringene og reglene derfra; 1.12 forutsetter fangede erfaringer og `rettelse`-støtte i reduceren.
- 1.13 krever demodata i `fixtures/testsett-a/demo/`; Epic 5 utvider README (1.1) og fullfører demoflyten.
- Epic 2–4 gjenbruker reducer, skjema, modelladapter, feilmodell, regler og stegindikator uten å endre kontrakten; rettet felttekst fra 1.12 brukes i kobling (Epic 3) og eksport (Epic 4).
