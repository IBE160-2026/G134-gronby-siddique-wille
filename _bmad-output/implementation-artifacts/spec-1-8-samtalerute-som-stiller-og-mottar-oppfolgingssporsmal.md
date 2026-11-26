---
title: 'Story 1.8: Samtalerute som stiller og mottar oppfølgingsspørsmål'
type: 'feature'
created: '2026-11-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'c35eda216e7945d283c1cf2c352e8e7cb2287277'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Chatkomponentene (1.7), reduceren (1.3), kontrakten (1.4) og modelladapteret (1.5) finnes, men ingenting kobler dem sammen. Studenten kan ikke bli intervjuet (FR-1).

**Approach:** `POST /api/samtale` validerer forespørselen, laster `prompts/samtale.md`, kaller `velgModell(modus)` og validerer modellsvaret mot `SamtaleSvar` før det sendes. Klienten får en Samtale-flate på `/samtale` som henter åpningsspørsmålet, sender svar og fletter hele samtalesvaret inn i økten med én versjonert handling. Feil gir en toast med «Prøv igjen», og loggen får ingen halve oppføringer.

## Boundaries & Constraints

**Always:**
- Ruten: `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `Cache-Control: no-store`. Ugyldig JSON eller skjemabrudd → `ugyldig_foresporsel`. `ModellFeil` → `feilsvar(kode)`. Modellsvar som bryter `SamtaleSvar` → `ugyldig_svar`. Ruten prøver aldri på nytt og logger aldri tekst (AD-12).
- `request.signal` sendes til modellkallet (nytt valgfritt `signal` i `ModellForesporsel`).
- Promptteksten står bare i `prompts/samtale.md` og lastes av `src/server/prompt.ts`. Demo laster ingen prompt.
- Studentsvaret legges i loggen først når svaret fra ruten er tatt imot: én handling `mottaSamtaleSvar` legger inn `svar` (hvis noen), endringene (via `brukEndringer()`) og `sporsmal`, i den rekkefølgen. Handlingen forkastes ved annen `versjon` eller når forventet `svarId` ikke lenger er neste `S`-ID.
- `brukEndringer()` (AD-13): løser `{ ny }` til nye `E`-ID-er (også `sporsmal.gjelder`), forkaster ukjente/slettede erfaringer, `svarId` som ikke er en `svar`-oppføring, og overskriver aldri felt med `rettetAvStudent`. Tittelen settes bare ved `opprett`.
- Grensen `MAKS_ERFARINGER = 8` fangede: ruten fjerner `opprett` og endringer på `{ ny }`, og erstatter et spørsmål om en ny erfaring med fast tekst fra `regler.ts` som nevner grensen. `brukEndringer()` ignorerer også `opprett` ved grensen.
- Klienten holder seg innenfor grensene: chatinput `maxLength = MAKS_TEKST_TEGN`; full logg låser input med en forklaring.

**Beslutninger (Rikke, 2026-11-25):**
- Hele storyen bygges samlet; specen er over 1600 tokens med vilje.
- «Ferdig» vises og er aktiv etter `kanTrykkeFerdig()`, men gjør ingenting før 1.11 kobler den til Oppsummering.
- «Ny økt» i skallet gjør ingenting før dialogen i 1.14.

**Never:**
- Ingen erfaringskort, fremdriftsmåler, terskel for oppfølgingsspørsmål eller lukkede erfaringer (1.9–1.11), ingen demodata (1.13), ingen Start-side med personvern (1.6), ingen dialog for «Ny økt» (1.14).
- Ingen strømming, ingen lagring i nettleseren, ingen løse `leggTilSvar`/`opprettErfaring`-dispatcher for samtalesvaret.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Åpningsspørsmål | tom logg | 200 `{ sporsmal, endringer }`; reduceren legger til `A1` | N/A |
| Svar | logg + nytt `svar` `S1` | `S1` og `A2` i loggen, endringer flettet inn | N/A |
| Modellfeil | 429/timeout | 503 `modell_feil`; toast «Noe gikk galt. Prøv igjen.»; utkastet står; loggen uendret | «Prøv igjen» sender samme forespørsel |
| Ugyldig modellsvar | tekst over `MAKS_TEKST_TEGN` | 502 `ugyldig_svar` | som over |
| Ugyldig forespørsel | ikke JSON / bryter skjema | 400 `ugyldig_foresporsel`, modellen kalles ikke | N/A |
| Uten nøkkel | `modus: "ekte"`, ingen nøkkel | 400 `mangler_nokkel` | N/A |
| Utdatert svar | versjon endret mens kallet pågikk | handlingen forkastes | N/A |
| Maks nådd | 8 fangede, modellen foreslår `opprett` | `opprett` fjernet; spørsmålet viser grensen, `gjelder: null` | N/A |
| `{ ny }` i `gjelder` | `opprett n1` + `gjelder: { ny: "n1" }` | `sporsmal.gjelder` = ny `E`-ID | ukjent `ny` → `null` |

</frozen-after-approval>

## Code Map

- `src/kjerne/skjema.ts` -- `SamtaleForesporsel`, `SamtaleSvar`, `SamtaleModellSvar`, `Endring`. Endres ikke.
- `src/kjerne/regler.ts` -- grensene. Får `MAKS_ERFARINGER`, `kanTrykkeFerdig()`, `MAKS_ERFARINGER_SPORSMAL` (foreløpig ordlyd, UX eier den).
- `src/kjerne/okt.ts` -- `Okt`, `nesteId()`. Gjenbrukes.
- `src/klient/okt/reducer.ts` -- `leggTilSporsmal`/`leggTilSvar` finnes (behold). Ny handling `mottaSamtaleSvar`. Følg mønsteret for versjonssjekk i `settKrav`.
- `src/server/modell/{grensesnitt,anthropic,velg}.ts`, `src/server/feil.ts`, `src/server/nokkel.ts` -- gjenbrukes; `anthropic.ts` kombinerer `signal` med `AbortSignal.timeout(FRIST_MS)` via `AbortSignal.any`.
- `src/server/status.ts` -- mønster for `process.cwd()`-sti (prompten leses fra `<cwd>/prompts/`).
- `src/klient/samtale/{chatlogg,chatinput,melding}.tsx|ts` -- Chatlogg må mountes før åpningsspørsmålet; `Melding` lages av en adapter fra loggen (`sporsmal` → assistent, `svar` → student). Chatinput eier ikke utkastet.
- `src/klient/skall/appskall.tsx` -- skal ligge i en felles layout over stegene (CAP-4).
- `src/app/utvikling/samtale/` -- slettes (issues.md).
- `tests/app/api/status.test.ts`, `tests/server/modell/demo.test.ts` -- mønster: `vi.mock("server-only")`, temp-`cwd`, demo-filer i temp-mappe.
- `eslint.config.mjs` -- klient kan ikke importere server eller zod; skjemaer importeres fra `@/kjerne/skjema`.
- Vitest kjører i `node` uten DOM-bibliotek; klientlogikk testes som rene funksjoner.

## Tasks & Acceptance

**Execution:**
- [x] `src/kjerne/fanget.ts` -- `erFanget(erfaring, logg)` (AD-7) og `antallFangede()` -- grensen telles i fangede
- [x] `src/kjerne/regler.ts` -- `MAKS_ERFARINGER`, `MAKS_ERFARINGER_SPORSMAL`, `kanTrykkeFerdig(okt)`, `erMaksNadd(okt)`
- [x] `src/kjerne/endringer.ts` -- `brukEndringer(okt, endringer)` → `{ okt, nyRefs }`, og `begrensSamtaleSvar(svar, okt)` for ruten
- [x] `src/klient/okt/reducer.ts` -- `mottaSamtaleSvar { versjon, svar: { id, tekst } | null, sporsmal, endringer }`
- [x] `src/server/prompt.ts` + `prompts/samtale.md` -- `lesPrompt("samtale")`; prompt i du-form, uten fagsjargong, ett åpent spørsmål om gangen, bare kjente ID-er
- [x] `src/server/modell/{grensesnitt,anthropic}.ts` -- valgfritt `signal`
- [x] `src/app/api/samtale/route.ts` -- ruten som beskrevet; `melding` = JSON med logg, aktive erfaringer og `maksNadd`
- [x] `src/klient/samtale/api.ts` -- `lagForesporsel(okt, svar?)`, `hentSporsmal()` som validerer mot `SamtaleSvar`/`FeilSvar`, `tilMeldinger(logg)`
- [x] `src/klient/samtale/samtaleflate.tsx` -- Chatlogg + Chatinput + toast + «Ferdig» (etter svar på spørsmål 1)
- [x] `src/app/(flyt)/layout.tsx`, `src/app/(flyt)/samtale/page.tsx`, `src/klient/skall/flytskall.tsx` -- felles skall; `/samtale` uten startet økt → `/`
- [x] `src/app/page.tsx` -- midlertidig knapp «Start samtalen» (`startOkt("ekte")` → `/samtale`) til 1.6 erstatter siden
- [x] `src/components/ui/sonner.tsx`, `src/app/layout.tsx`, `package.json` -- `sonner` 2.0.8 eksakt, lyst tema, `Toaster` i rotlayouten
- [x] `src/app/utvikling/samtale/` -- slett
- [x] `tests/kjerne/{fanget,endringer,regler}.test.ts`, `tests/klient/okt/reducer.test.ts`, `tests/klient/samtale/api.test.ts`, `tests/app/api/samtale.test.ts`, `tests/server/prompt.test.ts` -- hele matrisen; ruten testes i demo med temp-filer og i ekte med falsk modell/uten nøkkel

**Acceptance Criteria:**
- Given en ny, tom økt, when Samtale åpnes, then åpningsspørsmålet hentes én gang (også i StrictMode) og vises i chatloggen.
- Given et svar, when det sendes, then input er låst med skriveindikator til svaret kommer, og utkastet tømmes først ved suksess.
- Given systemet har stilt minst ett spørsmål, then `kanTrykkeFerdig()` er sann.
- Given en fil i `src/klient/`, when den importerer fra `src/server/`, then lint feiler (uendret grense).

## Implementation Notes

- `brukEndringer()` legger fortsatt til kilder på felt med `rettetAvStudent`; bare teksten er beskyttet (AD-13: «tekst eller tittel»).
- Ved grensen erstattes ethvert spørsmål som ikke gjelder en aktiv erfaring (`{ ny }`, `null`, ukjent ID) med `MAKS_ERFARINGER_SPORSMAL`.
- Ny hjelper `erLoggFull()` i `regler.ts`: input låses når ett svar og neste spørsmål ville gått over `MAKS_LOGG_OPPFORINGER`.
- Feiltoasten står til den lukkes (`duration: Infinity`), fordi «Prøv igjen» er eneste vei videre hvis åpningsspørsmålet feiler. Alle feilkoder gir samme tekst.
- Mangler `prompts/samtale.md`, kaster ruten og Next gir 500. Feilmeldingen har bare promptnavnet.
- `mottaSamtaleSvar` øker ikke `versjon`; «Fortsett samtalen» må selv dispatche `nullstill('samtaleFortsatt')` (åpent punkt fra 1.3).
- «Ferdig» er alltid synlig og deaktivert til første spørsmål (rettet i verifiseringen; subagenten skjulte den).
- Matriseraden «Modellfeil»: ruten og `hentSporsmal` er testet. At toasten vises og at utkastet står, er ikke automatisk testet, fordi Vitest kjører uten DOM (DOM-tester er allerede utsatt fra 1.7).

## Spec Change Log

## Review Triage Log

Lag: Blind Hunter (BH, 16 funn), Edge Case Hunter (EC, 13 funn), Verification Gap (VG, 3 hull og 3 andre funn).

| Funn | Verdikt | Rute | Bevis |
|---|---|---|---|
| BH5 / EC10 / EC7 / EC8 Ingen opprydding ved unmount: kallet avbrytes ikke, toasten lever videre, og «Prøv igjen» fra en gammel instans sender en utdatert forespørsel | low | patch | `hentSporsmal` tar `signal`, men flaten sender ingen. Etter tilbake-knappen og ny Start kan to instanser ha kall i gang. Rettelsen er en `AbortController` og `toast.dismiss` i cleanup, og ingen toast når kallet er avbrutt. |
| BH3 Feiltoasten kan sveipes bort, og da står studenten fast uten åpningsspørsmål | medium | patch | `apnet` nullstilles aldri, og input er låst til første spørsmål. Sonner lar toasten sveipes bort også med `duration: Infinity`. Rettelsen er `dismissible: false`. |
| BH9 Prompten sier ikke at `logg`/`erfaringer` er data, ikke instruksjoner | low | patch | Studentens svar går rett inn i meldingen. Rettelsen er én setning i `prompts/samtale.md`; modellsvaret valideres uansett. |
| BH11 Prompttesten leser aldri standardmappen `promptMappe()` | low | patch | Testen sender mappen eksplisitt. Rettelsen er én test uten `mappe`. |
| VG1 / BH12 Flyten send → motta i `Samtaleflate` har ingen test | medium | patch | Bekreftet av VG: ingen test importerer flaten, og Vitest har ingen DOM. Rettelsen er å flytte kjernen i `forsok` til en ren funksjon i `api.ts` og teste den med falsk `fetch` og ekte reducer. |
| VG2 Grensetesten i ruten har ingen slettet erfaring | low | patch | Ruten filtrerer slettede, men ingen test viser det ved grensen. Rettelsen er én test. |
| VG3 `Flytskall` (omdirigering til `/`) og den midlertidige Start-knappen har ingen test | low | defer | Bekreftet av VG. Trenger DOM-tester eller en ren hjelper; Start erstattes i 1.6. |
| BH1 / EC6 / EC11 / VGo2 Utkastet tømmes selv om reduceren forkaster svaret | low | avvist | Reduceren forkaster bare ved endret `versjon` eller S-ID, og input er låst mens kallet pågår. Ingen vanlig vei endrer økten da. Rettelsen krever ny tilstand for å lese reducerens beslutning. |
| BH2 «Prøv igjen» sender den gamle forespørselen | low | avvist | Samme forutsetning som BH1: økten endres ikke mens toasten står. Gamle instanser dekkes av patchen BH5. |
| BH4 / EC9 Alle feilkoder gir samme toast med «Prøv igjen», også `mangler_nokkel` | low | avvist | Specen og UX krever én tekst. Nøkkelsjekken på Start hører til 1.6. |
| BH6 / EC3 / EC4 Grensespørsmålet treffer ikke når den 8. fanges i samme svar | low | avvist | Reduceren forkaster `opprett` og setter `gjelder: null`; neste tur fanges grensen. Rettelsen krever at ruten kjører `brukEndringer` på en konstruert økt. |
| BH7 / EC1 Manglende prompt gir 500 og ikke `FeilSvar` | false | avvist | Prompten er committet. Å feile høyt på en feilkonfigurasjon er riktig, og meldingen har bare promptnavnet. |
| BH8 «Ferdig» gjør ingenting når loggen er full | low | avvist | Beslutning fra Rikke; full logg er 150 svar. |
| BH10 Prompten nevner ikke lengdegrensene | low | avvist | Tallene ville bli en ny kilde ved siden av `regler.ts`, og 2048 `max_tokens` gjør 5000 tegn lite sannsynlig. |
| BH13 / EC2 Hele kroppen leses før validering | low | avvist | Serveren kjører bare på 127.0.0.1 (AD-2). |
| BH14 Reduceren håndhever ikke `MAKS_LOGG_OPPFORINGER` | low | avvist | Flaten er eneste kaller og stopper ved `erLoggFull`. |
| BH15 Tømmingen forutsetter trimmet tekst | false | avvist | `Chatinput` kaller `onSend` med `verdi.trim()` (kontrakten i JSDoc). |
| BH16 Demo kan ikke nås fra UI | false | avvist | Demo er utenfor intent (1.6/1.13). |
| EC5 `settTekst` med tom tekst kan tømme et felt | low | avvist | Modellen har ingen grunn til det, og rettelsen er en ny vakt. |
| EC12 «Ferdig» er aktiv før første svar | false | avvist | AC og AD-16: aktiv når minst ett spørsmål er stilt. |
| EC13 Åpningsspørsmålet kan hentes to ganger ved remount | low | avvist | Reduceren forkaster det andre. Avbrudd ved unmount (BH5) stopper det første kallet. |
| VGo1 `apnet` nullstilles ikke ved «Ny økt» | low | avvist | «Ny økt» gjør ingenting før 1.14; står som åpent punkt for 1.14. |
| VGo3 `onVelgSteg` går til ruter som ikke finnes | false | avvist | `fullforte` er tom, så ingen stegknapper vises. |

## Design Notes

Forespørselen bygges uten å endre økten: `logg = [...okt.logg, { type: "svar", id: nesteId(okt.tellere, "S").id, tekst }]`. Den samme ID-en sendes med i `mottaSamtaleSvar`, og reduceren sjekker at den fortsatt er neste `S`-ID. Da får ID-en som modellen ser i `leggTilKilde`, samme verdi i loggen, og et feilet kall etterlater ingenting.

Åpningsspørsmålet (`svar: null`) forkastes hvis loggen ikke er tom, så et dobbelt kall i StrictMode ikke gir to `A`-oppføringer.

`DemoModell` får `antallSvar` = antall `svar` i forespørselens logg. Demodata kommer i 1.13, så demo gir `ugyldig_svar` til da.

## Verification

**Commands:**
- `npm test` -- expected: alle tester grønne
- `npm run lint` -- expected: ingen feil
- `npx tsc --noEmit` -- expected: ingen feil
- `npm run build` -- expected: bygger

**Manual checks (if no CLI):**
- `npm run dev` med nøkkel: «Start samtalen» → åpningsspørsmål → svar → nytt spørsmål; uten nettverk → toast og utkastet står.

### Review Findings

Kodegjennomgang 2026-11-25 av story 1.8 (`c35eda2..761f73b`, uten `package-lock.json`). Lag:
- Blind Hunter: 13 funn
- Edge Case Hunter: 5 funn
- Verification Gap: 2 hull og 1 annet funn
- Acceptance Auditor: ingen AC brutt, 7 funn

28 rå funn: 6 patcher (8 funn), 1 utsatt (3 funn), 17 avvist.

- [x] [Review][Patch] Ingen test viser at `FRIST_MS` fortsatt gjelder når kalleren sender et levende signal; ruten sender alltid `request.signal`, så en regresjon til `signal ?? frist` ville fjernet fristen i produksjon (VG1). Mutasjonen er sjekket: testen feiler. [tests/server/modell/anthropic.test.ts]
- [x] [Review][Patch] Studenten endrer utkastet mens feiltoasten står, og «Prøv igjen» sender den gamle teksten (EC2). Toasten fjernes nå når utkastet endres. [src/klient/samtale/samtaleflate.tsx]
- [x] [Review][Patch] Sonner kunngjør den engelske standardetiketten «Notifications» i en `nb`-app (BH5). `containerAriaLabel="Varsler"`. [src/components/ui/sonner.tsx]
- [x] [Review][Patch] Ingen reducertest for grensen gjennom `mottaSamtaleSvar`, og ingen test av at handlingen ikke endrer `versjon` (BH12). [tests/klient/okt/reducer.test.ts]
- [x] [Review][Patch] `afterEach` i rutetesten rydder ikke spioner og stubber når konsollsjekken feiler (EC5). [tests/app/api/samtale.test.ts]
- [x] [Review][Patch] deferred-work.md: 1.8-oppføringen lå under «Lukket av story 1.4», og punktene 1.8 løser (fra 1.3, 1.4 og 1.15) sto som åpne (AA3/BH1/BH2). [_bmad-output/implementation-artifacts/deferred-work.md]
- [x] [Review][Defer] `Samtaleflate` har ingen komponenttester (send-vakten, tømming av utkast, «Prøv igjen», avbrudd ved unmount) (VG2/AA6/BH13) [src/klient/samtale/samtaleflate.tsx] — deferred: repoet har ingen DOM-tester ennå; `sendSamtale` er testet som ren funksjon.

**Rejected:**
- «Ferdig» er alltid synlig, mens beslutningen sier «vises og er aktiv etter» (AA1) — false: EXPERIENCE.md sier «Alltid synlig, men deaktivert til minst ett oppfølgingsspørsmål er stilt», og valget Rikke tok sa det samme.
- Oppgavelisten sier «etter svar på spørsmål 1» (AA2) — rettelsen er å endre specen. Koden følger AC3.
- Specen står på `done` mens sprint-status står på `review` (AA4/BH4) — false: bmad-build setter `review`, og denne gjennomgangen avslutter med `done`.
- epic-1-context.md er endret i diffen (AA5) — false: bmad-build bygde den på nytt fordi DESIGN.md og EXPERIENCE.md var nyere.
- «Trykk Ferdig» ved full logg, men knappen gjør ingenting (AA7) — low: beslutning fra Rikke, og full logg er 150 svar.
- Punktet i Victorias issues.md om `/utvikling/samtale` er ikke krysset av (BH3) — low: det er Victorias fil; hun får beskjed via sesjonsloggen.
- Verifiseringsresultatene står ikke i specen (BH4) — low: resultatene står i sesjonsloggen.
- Låst input har ingen tilgjengelig forklaring (BH6) — low: før første spørsmål kunngjøres skriveindikatoren eller feiltoasten; full logg er sjelden. Rettelsen er nye ARIA-koblinger.
- `maxLength` kutter innlimt tekst uten beskjed (BH7) — low: 5000 tegn i ett svar er usannsynlig.
- Prompten er strengere enn `brukEndringer` for felt med `rettetAvStudent` (BH8) — false: en strengere prompt gir ingen skade, og tittelen settes bare ved `opprett`.
- Ingen test av manglende prompt i ruten (BH9) — low: å feile høyt ved feilkonfigurasjon er riktig (som i bmad-build).
- Prompttestene har misvisende navn og leser den ekte prompten (BH10) — low: testen av den ekte prompten er bevisst; standardmappen er testet.
- `hentSporsmal` gir `nettverk` ved avbrudd, og resultattypene kan gli fra hverandre (BH11) — low: `sendSamtale` er eneste kaller og skiller dem.
- Åpningsspørsmålet forkastes hvis `versjon` endres underveis (EC1) — low: ingen handling som endrer `versjon`, kan nås på Samtale før første spørsmål. «Ny økt» (1.14) må nullstille `apnet`.
- `mottaSamtaleSvar` på en økt som ikke er startet (EC3) — low: `Flytskall` viser ikke flaten uten startet økt.
- Reduceren håndhever ikke `MAKS_LOGG_OPPFORINGER` (EC4) — low: samme vurdering som BH14 i bmad-build.
- Signalet i rutetesten avhenger av undici (VGo1) — low: det virker i Node 26, og avbrudd → `modell_feil` er testet i adapteret.
