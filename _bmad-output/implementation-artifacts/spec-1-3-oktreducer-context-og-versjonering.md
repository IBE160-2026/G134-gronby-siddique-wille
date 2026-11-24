---
title: 'Story 1.3: Øktreducer, Context og versjonering'
type: 'feature'
created: '2026-11-24'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'd9c8f1faaf35800c5d3daf200fa20d8b51f96e10'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Det finnes ingen klienttilstand ennå. Uten én eier av økten vil storyene 1.6–1.14 og Epic 2–4 lage egne kopier av øktdata, egne ID-er og egen håndtering av sene svar (AD-4, AD-5, AD-14).

**Approach:** Én `useReducer` med Context i `src/klient/okt/`, der all endring skjer gjennom navngitte handlinger i én reducer-fil. Øktens typer, startverdi, ID-tildeling og `nullstill()` er rene funksjoner i `src/kjerne/`. Vitest innføres for å teste kjernen og reduceren.

## Boundaries & Constraints

**Always:**
- Bare reduceren tildeler ID-er (`A`, `S`, `R`, `E`, `K`), fra `okt.tellere`. Tellerne øker bare og settes aldri ned innen en økt, heller ikke etter sletting.
- Loggen kan bare utvides. Å slette en erfaring flytter ID-en til `okt.slettedeErfaringer` og fjerner ingen loggoppføringer.
- `okt.versjon` øker med 1 ved hver nullstilling og ved «Ny økt». Handlinger som bærer et serversvar har `versjon`, og reduceren ignorerer dem når `versjon !== okt.versjon`.
- Reduceren er ren: ingen mutasjon av forrige tilstand, ingen I/O. En handling som ikke kan brukes, gir samme tilstandsobjekt tilbake.
- `kjerne` importerer aldri `app`/`klient`/`server`; `klient` importerer aldri `server`. Håndheves med `no-restricted-imports` i ESLint.
- Fagnavn på norsk uten æøå; versjoner fra stack-tabellen (Vitest 5.1.0, vite 8.3.5).

**Never:**
- Ingen `localStorage`/`sessionStorage`/IndexedDB/cookies (AD-2).
- Ingen Zod-skjema, API-ruter, `brukEndringer()`, `erFanget()` eller regler – det er story 1.4, 1.8, 1.9 og 1.10. Ingen UI utover at provideren monteres.
- Ingen komponent holder egne kopier av øktdata.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Første oppføringer | tom økt, `leggTilSporsmal`, `leggTilSvar`, `opprettErfaring` | ID-ene `A1`, `S1`, `E1`; tellerne `A:1, S:1, E:1` | N/A |
| Sletting gjenbruker ikke | `E1`, `E2` finnes, `E2` slettes, ny erfaring | ny får `E3`; loggen uendret; `E2` i `slettedeErfaringer` | N/A |
| Rettelse på slettet/ukjent erfaring | `leggTilRettelse` med `erfaringId` som er slettet eller ukjent | samme tilstand tilbake, ingen `R`-ID brukt | ignoreres |
| Krav fra riktig versjon | `settKrav { versjon: okt.versjon, krav: [2 stk] }` | krav `K1`, `K2` | N/A |
| Sent svar | `settKrav` med eldre `versjon` | samme tilstand tilbake | forkastes |
| Nullstilling | `nullstill { arsak: 'annonseEndret' }` | krav og bevistabell tømmes, annonsetekst beholdes, `versjon + 1` | N/A |
| Ny økt | `nyOkt` etter en økt med innhold | tom økt, tellere på 0, `versjon` = forrige + 1 | N/A |

</frozen-after-approval>

## Code Map

- `src/kjerne/.gitkeep`, `src/klient/okt/.gitkeep` -- tomme mapper fra 1.2; erstattes av ekte filer.
- `src/app/layout.tsx` -- rotlayout (server-komponent, `lang="nb"`). Provideren pakkes rundt `{children}` her, så økten overlever navigasjon mellom sidene.
- `eslint.config.mjs` -- flat config med `defineConfig`; regler for modulgrenser legges til som egne `files`-blokker.
- `package.json` -- ingen `test`-script, ingen Vitest. `dev`/`start` har `-H 127.0.0.1`.
- `tsconfig.json` -- alias `@/*` → `./src/*`; Vitest trenger samme alias.
- `deferred-work.md` -- to punkter er utsatt hit: modulgrenser i ESLint og en test av `-H 127.0.0.1` når Vitest kommer. `server-only` hører til 1.5.
- Origin-grenen `story-1-7-samtale-ui` har `src/klient/samtale/melding.ts` (`{ id, rolle, tekst }`), som skal lages fra loggen senere. Loggformen her må kunne mappes dit: `sporsmal` → assistent, `svar` → student.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- legg til `vitest` 5.1.0 og `vite` 8.3.5 (eksakt) som devDependencies og `"test": "vitest run"` -- stack-tabellen
- [x] `vitest.config.ts` -- miljø `node`, alias `@` → `src`, `include: ['tests/**/*.test.ts']`
- [x] `src/kjerne/okt.ts` -- typer (`Okt`, `IdPrefiks`, `Tellere`, `LoggOppforing`, `Felt`, `FeltNavn`, `Erfaring`, `Krav`, `Bevis`, `BevistabellRad`, `Modus`), `tomOkt(versjon = 0)` og `nesteId(tellere, prefiks)` → `{ id, tellere }` -- kjernen må kunne bruke øktformen uten å importere `klient`
- [x] `src/kjerne/nullstill.ts` -- `nullstill(okt, arsak)` med `arsak: 'erfaringEndret' | 'samtaleFortsatt' | 'annonseEndret'`: tømmer bevistabell (og krav ved annonse), beholder annonsetekst, øker `versjon` -- AD-14
- [x] `src/klient/okt/reducer.ts` -- `Handling`-union og `oktReducer` med `startOkt`, `leggTilSporsmal`, `leggTilSvar`, `leggTilRettelse`, `opprettErfaring`, `slettErfaring`, `settAnnonse`, `settKrav`, `nullstill`, `nyOkt` -- AD-4/AD-5
- [x] `src/klient/okt/kontekst.tsx` -- `"use client"`; `OktProvider`, `useOkt()`, `useOktDispatch()`; hooks kaster med tydelig melding utenfor provideren
- [x] `src/app/layout.tsx` -- pakk `{children}` i `OktProvider`
- [x] `eslint.config.mjs` -- `no-restricted-imports`: `src/kjerne/**` kan ikke importere `@/app`, `@/klient`, `@/server`, `@/components`; `src/klient/**` kan ikke importere `@/server`
- [x] `tests/kjerne/okt.test.ts`, `tests/kjerne/nullstill.test.ts`, `tests/klient/okt/reducer.test.ts` -- dekker hele I/O-matrisen og at forrige tilstand ikke muteres
- [x] `tests/oppsett/package.test.ts` -- `dev` og `start` inneholder `-H 127.0.0.1` (utsatt fra 1.2)
- [x] slett `.gitkeep` i `src/kjerne` og `src/klient/okt`

**Acceptance Criteria:**
- Given `src/klient/okt/`, when en handling dispatches, then endringen skjer gjennom en navngitt handling i `reducer.ts`, og komponenter leser økten bare via `useOkt()`.
- Given en ny oppføring opprettes, when reduceren tildeler ID, then den får neste ID for riktig prefiks fra `okt.tellere`, uten gjenbruk.
- Given en fil i `src/kjerne/` som importerer fra `@/klient`, when `npm run lint` kjøres, then lint feiler.

## Implementation Notes

- `settAnnonse` med ny tekst kjører `nullstill(okt, 'annonseEndret')` før teksten settes (krav/bevistabell tømmes, `versjon + 1`), slik at AD-14 ikke avhenger av at UI husker en egen `nullstill`. Samme tekst gir samme tilstand.
- `leggTilSporsmal` bærer serversvar og har derfor `versjon`. `gjelder` som ikke peker på en aktiv erfaring (ukjent eller slettet) lagres som `null`. `{ ny }`-oppløsning hører til `brukEndringer()` (1.8).
- `leggTilRettelse` støtter `felt: FeltNavn | 'tittel'`, oppdaterer feltteksten og setter `rettetAvStudent`/`tittelRettetAvStudent`. Lik tekst gir samme tilstand (ingen `R`-ID).
- `startOkt` setter `modus` bare når den er `null`; «Ny økt» gir `modus: null` igjen.
- `krav`/`bevistabell` er `null` til de er hentet, så en tom kravliste kan skilles fra «ikke hentet».
- Modulgrensene i ESLint bruker `regex` i `no-restricted-imports`, så både `@/…` og relative stier fanges.
- Vite skriver en advarsel om at `vitest.config.ts` lastes som CommonJS (`configLoader: 'native'`). Den er ufarlig; filnavnet følger spec-en.

- Etter review: `leggTilRettelse` og `slettErfaring` kjører `nullstill(…, 'erfaringEndret')` når de faktisk endrer noe, og `settKrav` tømmer bevistabellen. Dermed øker `versjon` ved rettelse og sletting, og svar som er underveis forkastes. Story 1.8 og 1.12 må sende forespørsler med versjonen *etter* slike handlinger. `leggTilSvar` øker ikke versjonen; «fortsett samtalen» dispatcher `nullstill` med `samtaleFortsatt` eksplisitt.
- Tester av modulgrensene (`tests/oppsett/eslint-grenser.test.ts`) og av provider/hooks (`tests/klient/okt/kontekst.test.tsx`, `renderToString` i node-miljø) er lagt til.

## Spec Change Log

## Review Triage Log

Lag: Blind Hunter (BH, 11 funn), Edge Case Hunter (EC, 7 funn, ingen brudd på spec-påstander), Verification Gap (VG, 3 hull). Første kjøring fikk en tom diff-fil; alle lag kjørte på nytt mot riktig diff.

| Funn | Verdikt | Rute | Bevis |
|---|---|---|---|
| BH1 / BH2 / EC2 Endret eller slettet erfaring tømmer ikke bevistabellen | medium | patch | AD-14: endret erfaring tømmer bevistabellen. `leggTilRettelse`/`slettErfaring` lot den stå, mens `settAnnonse` nullstiller selv. Begge kjører nå `nullstill(…, 'erfaringEndret')` når endringen faktisk skjer. `leggTilSvar` holdes utenfor: en versjonsøkning per svar ville forkastet spørsmålet som er underveis, så `samtaleFortsatt` forblir en eksplisitt handling. |
| BH3 / EC1 `settKrav` to ganger gir nye K-ID-er, men beholder bevistabellen | low | patch | Dobbeltklikk på «Finn krav» gir to svar med samme versjon. Rettelsen er direkte: `bevistabell: null` i samme retur. |
| BH4 Én versjon for alle forespørsler; øker også når ingenting tømmes | false | avvist | AD-14 binder én `okt.versjon` som øker ved hver nullstilling. At en rettelse forkaster et krav-svar som er underveis, er tilsiktet. |
| BH5 / EC3 `leggTilSvar`/`opprettErfaring` mangler `versjon` | false | avvist | `leggTilSvar` dispatches synkront fra input og kan ikke komme sent. `opprettErfaring` har ingen asynkron kaller ennå; samtalesvaret i 1.8 trenger en samlet, versjonert handling. |
| BH6 Mangler handlinger for bevistabell og feltfylling | false | avvist | Frossen Never-blokk: `brukEndringer()` og bevis hører til 1.8 og Epic 3. |
| BH7a / EC5 `kjerne` kan importere `react`/`next`/`server-only` | low | patch | Bryter «rene funksjoner». Rettelsen er et ekstra mønster i samme regel. |
| BH7b `./klient` inne i `kjerne` blokkeres; EC6 relative stier i undermapper | low | avvist | Krever en undermappe i `kjerne` med navnet `klient`/`server`, noe som er usannsynlig. Rettelsen krever en ny ESLint-plugin. |
| EC5b Dynamisk `import()` omgår grensen | low | avvist | Usannsynlig i vanlig bruk. Rettelsen er en ekstra regel (`no-restricted-syntax`). |
| BH7c `src/lib` er ikke dekket | false | avvist | Spinens modulgrenser gjelder `kjerne`, `klient` og `server`, ikke `lib`. |
| BH7d / VG1 Grensereglene er bare sjekket manuelt | medium | patch | AC krever at lint feiler. Ny test med ESLint `lintText`. |
| BH8 / EC7 / VG2 Provider og hooks er utestet, og `include` tar ikke med `.tsx` | low | patch | VG foreslo defer, men rettelsen er liten: utvide `include` og legge til én test med `renderToString`. |
| BH9 / VG3 Manglende reducer-tester (`kilder` beholdes ved rettelse, `startOkt` etter `nyOkt`, nullstill-årsaker, nyere versjon) | low | patch | Bare tester legges til. |
| BH10 `vite` er direkte devDependency | false | avvist | Stack-tabellen låser vite 8.3.5 som peer, og specen ber om det. |
| BH11 Tom tekst godtas | low | avvist | Chatinput (1.7) sender ikke tom tekst. AD-5 forbyr ikke tom tekst, og en vakt ville vært ekstra logikk. |
| EC4 Handlinger før `startOkt` | low | avvist | Ingen UI dispatcher før Start. En vakt ville vært ekstra logikk. |

## Design Notes

Typene ligger i `kjerne/okt.ts`, ikke i `klient/okt/`, fordi senere kjernefunksjoner (`brukEndringer`, `erFanget`, `nullstill`) tar `Okt` som input og ikke kan importere `klient`. Når story 1.4 lager Zod-skjemaene, kan typene for de delene som går over nettet avledes med `z.infer` og erstatte de håndskrevne.

«Ny økt» setter tellerne tilbake til 0: hele økten forsvinner, og sene svar stoppes av `versjon`, så ingen gammel ID kan blandes inn. En ny økt starter derfor på `A1`/`S1`, som testsett A.

`Erfaring` har `tittel`, `tittelRettetAvStudent` og `rolle`/`handling`/`resultat` som `Felt` (`{ tekst, kilder, rettetAvStudent }`, AD-13).

## Verification

**Commands:**
- `npm test` -- expected: alle tester grønne
- `npm run lint` -- expected: ingen feil
- `npm run build` -- expected: bygger uten feil
- midlertidig `import "@/klient/okt/reducer"` i en `src/kjerne`-fil, `npm run lint` -- expected: feil fra `no-restricted-imports`; fjern importen etterpå
