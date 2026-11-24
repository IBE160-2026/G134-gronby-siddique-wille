---
title: 'Story 1.4: API-kontrakt, Zod-skjema og statusrute'
type: 'feature'
created: '2026-11-24'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'b5c86799cb5b745e3a4beb627f496d37c97b5e3f'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Det finnes ingen API-kontrakt. Uten ett sted for skjemaene vil storyene 1.6–1.13 og Epic 2–4 lage egne former for forespørsler, svar, modellsvar og feil, og Start-siden (1.6, 5.4) har ingen måte å vite om nøkkel og demodata finnes (AD-9).

**Approach:** Alle Zod-skjemaer for hele kontrakten (`/api/samtale`, `/api/krav`, `/api/bevis`, `/api/status`, `/api/demo/manus`, feilsvar) defineres én gang i `src/kjerne/skjema.ts`, og typene som går over nettet i `kjerne/okt.ts` avledes derfra. `GET /api/status` bygges som tynt skall over `src/server/status.ts`.

## Boundaries & Constraints

**Always:**
- `zod` importeres bare i `src/kjerne/skjema.ts`; resten av `src/` importerer skjemaer og typer derfra. Håndheves med `no-restricted-imports`.
- Feilsvar er `{ feil: { kode, melding } }` med `modell_feil` → 503, `ugyldig_svar` → 502, `mangler_nokkel` → 400, `ugyldig_foresporsel` → 400. `melding` er fast tekst per kode, aldri mottatte verdier (AD-12).
- Bare `src/server/` leser `ANTHROPIC_API_KEY`. Alle filer i `src/server/` importerer `server-only`.
- Ruten har `runtime = 'nodejs'` og `dynamic = 'force-dynamic'` og caches aldri (AD-2).
- Versjoner: `zod` 4.6.7 og `server-only` 0.0.1, eksakt.

**Never:**
- Ingen andre ruter, ingen modelladapter, `config.ts`, `brukEndringer()`, `verifiserSitat()` eller terskelfunksjoner (1.5, 1.8, 1.10, Epic 3). Ingen UI.
- Ingen demodatafiler – de kommer i 1.13/2.4/3.6.
- Nøkkelen eller deler av den havner aldri i svar eller logg.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Nøkkel satt, ingen demo | `ANTHROPIC_API_KEY=sk-…`, ingen `fixtures/testsett-a/demo/` | `200 { harNokkel: true, harDemodata: false }` | N/A |
| Tom nøkkel | `ANTHROPIC_API_KEY=` eller bare mellomrom | `harNokkel: false` | N/A |
| Demodata finnes | mappen har minst én `.json`-fil | `harDemodata: true` | N/A |
| Tom demomappe | mappen finnes, ingen `.json` | `harDemodata: false` | N/A |
| Gyldig samtalesvar | `{ sporsmal: { tekst, gjelder: { ny: "n1" } }, endringer: [opprett n1] }` | parses | N/A |
| Grensebrudd | forespørsel med annonse over `MAKS_ANNONSE_TEGN` | parse feiler med Zod-sti | ruten (senere) svarer `ugyldig_foresporsel` |

</frozen-after-approval>

## Code Map

- `src/kjerne/okt.ts` -- håndskrevne typer `Modus`, `FeltNavn`, `Felt`, `Erfaring`, `LoggOppforing`, `Krav`, `Bevis`, `BevistabellRad`. Erstattes av `z.infer`-typer fra skjemaet med samme navn og form; `Okt`, `Tellere`, `IdPrefiks`, `tomOkt`, `nesteId` beholdes. Reducer og tester bruker typene og skal ikke trenge endring.
- `src/klient/okt/reducer.ts` -- `settKrav` tar `Omit<Krav, "id">[]`, så krav-svaret er `{ krav: { tekst }[] }`; reduceren tildeler `K`-ID.
- `eslint.config.mjs` -- blokkene for `src/kjerne/**` og `src/klient/**` definerer `no-restricted-imports`. En senere blokk *erstatter* regelen, så zod-mønsteret må flettes inn i begge blokkene og i en ny blokk for resten av `src/**` (unntatt `skjema.ts`).
- `tests/oppsett/eslint-grenser.test.ts` -- mønster for å teste lint-regler med `lintText`.
- `src/server/modell/.gitkeep` -- beholdes (1.5).
- `fixtures/testsett-a/` -- finnes; `demo/` finnes ikke ennå.
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` -- route handlers caches ikke som standard; `dynamic` er gyldig når Cache Components er av.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- `zod` 4.6.7 og `server-only` 0.0.1 som dependencies (eksakt)
- [x] `src/kjerne/regler.ts` -- bare øvre grenser foreløpig: `MAKS_ANNONSE_TEGN = 20000`, `MAKS_TEKST_TEGN = 5000`, `MAKS_LOGG_OPPFORINGER = 300`, `MAKS_LISTE = 50` -- AD-15; resten av reglene er 1.10
- [x] `src/kjerne/skjema.ts` -- byggesteiner (ID-er med prefiks, `Felt`, `Erfaring`, `LoggOppforing`, `Krav`, `Bevis`, `BevistabellRad`), `FEILKODER` (kode → status og fast melding), `FeilSvar`, `StatusSvar`, forespørsel/svar/modellsvar for samtale, krav og bevis, `DemoManusSvar` -- AD-9, AD-13
- [x] `src/kjerne/okt.ts` -- avled typene som går over nettet fra skjemaet
- [x] `src/server/status.ts` -- `import "server-only"`; `hentStatus({ env?, demoMappe? })` → `StatusSvar`
- [x] `src/app/api/status/route.ts` -- `GET` returnerer `hentStatus()` som JSON
- [x] `eslint.config.mjs` -- forby `zod` i `src/**` utenom `src/kjerne/skjema.ts`
- [x] `tests/kjerne/skjema.test.ts`, `tests/server/status.test.ts`, `tests/app/api/status.test.ts` -- hele I/O-matrisen; ruten testes med `vi.mock("server-only")` og `vi.stubEnv`
- [x] `tests/oppsett/eslint-grenser.test.ts`, `tests/oppsett/server-only.test.ts` -- zod-forbudet; at hver fil i `src/server/` importerer `server-only`

**Acceptance Criteria:**
- Given en fil i `src/klient/` eller `src/app/` som importerer `zod`, when `npm run lint` kjøres, then lint feiler.
- Given `FEILKODER`, when en kode slås opp, then status og `FeilSvar`-formen stemmer med AC i epics (503/502/400/400).
- Given `GET /api/status`, when ruten kalles, then den svarer `{ harNokkel, harDemodata }` etter om nøkkelen er satt og om demo-fixtures finnes.

## Implementation Notes

- `Endring` har diskriminatoren `type` (`opprett` | `leggTilKilde` | `settTekst`), slik `LoggOppforing` har. `settTekst.erfaring` tar `ErfaringId` eller `{ ny }`.
- Feilmeldingene i `FEILKODER` er fast norsk tekst per kode. Klienten viser uansett «Noe gikk galt. Prøv igjen.»
- Statusruten svarer i tillegg med `Cache-Control: no-store`.
- ESLint: hver fil i `src/` treffes av nøyaktig én `no-restricted-imports`-blokk. Mønstrene er navngitte konstanter: kjerne (unntatt `skjema.ts`), `skjema.ts`, klient og resten av `src/`.
- `tests/oppsett/server-only.test.ts` sjekker også at ingen fil utenfor `src/server/` nevner `ANTHROPIC_API_KEY`.
- Etter review: `IdPrefiks` defineres i `skjema.ts` og re-eksporteres fra `okt.ts`. ID-er har en lengdegrense. `gjelder` gjenbruker `ErfaringRef`. Rutetesten bruker en midlertidig `process.cwd()` og avhenger ikke av repoets fixtures.

## Review Triage Log

Lag: Blind Hunter (BH, 11 funn), Edge Case Hunter (EC, 12 funn), Verification Gap (VG, 3 hull og 2 andre funn).

| Funn | Verdikt | Rute | Bevis |
|---|---|---|---|
| EC8 / BH4 / VG1 / VG-a / EC11 Rutetesten leser de ekte fixtures og forventer `harDemodata: false`, og `true` gjennom standardmappen er utestet | medium | patch | Testen brekker når 1.13 legger inn demodata, og en skrivefeil i `DEMO_MAPPE` ville ikke blitt fanget. Testen bruker nå en midlertidig `cwd` og dekker både `false` og `true`. |
| VG2 / BH7 `BevisForesporsel`-avvisninger og ID-/tekstgrenser er ikke testet | low | patch | Bare tester legges til. |
| VG3 Ingen test viser at modellskjemaene er uten grenser | low | patch | Bare test. Ellers kunne en senere endring gjort ukjente ID-er til `ugyldig_svar` i stedet for at kjernen forkaster dem (AD-5). |
| EC1 / BH3 ID-er uten lengdegrense; prefiksene er definert to steder | low | patch | En direkte rettelse: `.max()` og én definisjon av `IdPrefiks`. |
| BH9b `gjelder` gjentar `ErfaringRef` | low | patch | Direkte gjenbruk. |
| EC2 / BH1 `Bevis` godtar `slutt < start` | low | avvist | `BevisSvar` lages av serveren fra `verifiserSitat()` (Epic 3). Rettelsen er en ny vakt (`refine`). |
| EC3 Like ID-er eller overlapp mellom erfaringer og slettede | low | avvist | Klienten sender sin egen reducer-tilstand, som tildeler unike ID-er. Rettelsen er en `superRefine`-vakt. |
| EC4 Tom annonse godtas | low | avvist | `MIN_ANNONSE_TEGN = 200` er story 2.1/1.10, og specen tar bare med øvre grenser. |
| EC5 `max` teller UTF-16-enheter | low | avvist | Grensene er sjenerøse, så forskjellen merkes ikke i praksis. |
| EC6 `.json` som symlenke telles ikke | low | avvist | Fixtures committes som vanlige filer. |
| EC7 / BH5a `fixtures/` følger ikke med i standalone-bygg | false | avvist | Appen kjøres bare lokalt fra reporoten (`next dev`/`next start`), uten hosting (spinen, Kjøremiljø). |
| EC9 / EC12 Dynamisk `import("zod")`/`require` omgår forbudet | low | avvist | Usannsynlig i vanlig bruk. Rettelsen er en ny regel (`no-restricted-syntax`), samme vurdering som i 1.3. |
| EC10 / BH10c Nøkkelen kan leses med et sammensatt navn | low | avvist | Krever bevisst omgåelse. Rettelsen er en ny ESLint-regel. |
| BH2 `FeilSvar.melding` er en fri streng; ingen `feilsvar()`-hjelper | low | avvist | Rutene bygger feilsvar fra `FEILKODER`, og den første feilende ruten kommer i 1.5/1.8. En hjelper ville vært ny offentlig flate. |
| BH5b `Dirent.isFile()` med symlenker | low | avvist | Samme som EC6. |
| BH6 Ruten parser ikke svaret med `StatusSvar` | false | avvist | `hentStatus()` er typet `Promise<StatusSvar>` og returnerer bare to boolske verdier. |
| BH8 Ingen test av at typene i `okt.ts` er de samme som i skjemaet | false | avvist | `okt.ts` re-eksporterer typene direkte, så de er identiske. `tsc` sjekker reduceren mot dem. |
| BH9a Objektene er ikke `strict`; ingen grense for total størrelse | low | avvist | Ukjente felt fjernes og skader ikke. Listegrensene begrenser størrelsen, og serveren kjører bare lokalt. |
| BH10 server-only-testen er tekstbasert; `src/lib` kan importere server | low | avvist | En konvensjonssjekk etter hensikten. Grensen for `lib` er utenfor spinens modulgrenser (samme som BH7c i 1.3). |
| BH11 Invarianten «én blokk per fil» i ESLint er ikke testet | low | avvist | Grensetestene dekker alle mappene i `src/`. En full konfigurasjonstest ville vært ekstra kompleksitet. |
| VG-b server-only-testen er ikke en atferdstest | low | avvist | Den er ment som konvensjonssjekk. |

## Design Notes

Kontrakten (feltnavn som i AD-13 og `kjerne/okt.ts`):

```ts
SamtaleForesporsel = { modus, versjon, logg, erfaringer, slettedeErfaringer }
SamtaleSvar = SamtaleModellSvar = { sporsmal: { tekst, gjelder: ErfaringId | { ny } | null }, endringer: Endring[] }
Endring = opprett { ny, tittel } | leggTilKilde { erfaring: ErfaringId | { ny }, felt, svarId } | settTekst { erfaring, felt, tekst }
KravForesporsel = { modus, versjon, annonse };  KravSvar = KravModellSvar = { krav: { tekst }[] }
BevisForesporsel = { modus, versjon, krav, erfaringer, logg }
BevisModellSvar = { bevis: { kravId, erfaringId, svarId, sitat }[], refleksjonsforslag: { kravId, tekst }[] }
BevisSvar = { bevistabell: BevistabellRad[] };  DemoManusSvar = { svar: string[] }
```

`versjon` sendes med i forespørselen (AD-14); klienten sammenligner med versjonen den sendte, så svarene ekkoer den ikke. Grensene ligger i forespørselsskjemaene. Modellskjemaene har ingen regex eller lengdegrenser, slik at 1.5 kan avlede `output_config.format` fra dem; ukjente ID-er forkastes i kjernen (AD-5).

`harDemodata` = demomappen finnes og har minst én `.json`. 1.13/5.1 kan stramme inn til en liste over påkrevde filer.

## Verification

**Commands:**
- `npm test` -- expected: alle tester grønne
- `npm run lint` -- expected: ingen feil
- `npm run build` -- expected: bygger, `/api/status` er dynamisk (ƒ)
- `npm run dev` + `curl -s http://127.0.0.1:3000/api/status` -- expected: `{"harNokkel":…,"harDemodata":false}`
