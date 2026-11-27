- source_spec: none
  summary: Story 1.2 – prosjektgrunnlag med Next.js, shadcn og dev-server
  evidence: Delt fra samme bestilling som story 1.1 (README og .env.example) etter brukerens valg om to specs etter hverandre; tas rett etter 1.1 i samme økt.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-readme-og-env-example.md`
  summary: README trenger en kort feilsøkingsdel for ekte modus uten nøkkel (`mangler_nokkel`) og ugyldig nøkkel.
  evidence: Blind Hunter-funn 11. Feilkodene (AD-9/AD-10) bygges i story 1.4/1.5, så teksten kan først skrives da.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-prosjektgrunnlag-nextjs-shadcn.md`
  summary: Vurder å la `CLAUDE.md` importere `AGENTS.md` (`@AGENTS.md`), slik at Next 16-regelen fra `next dev` («les node_modules/next/dist/docs/») når Claude Code.
  evidence: `next dev` skriver `AGENTS.md` i reporoten, men Claude Code leser bare `CLAUDE.md`. Rettingen endrer agentkontekst-filer, så gruppen bør bestemme det.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-prosjektgrunnlag-nextjs-shadcn.md`
  summary: `npm audit` viser 4 moderate sårbarheter i `minimatch` via `shadcn` 4.23.0 → `ts-morph`; følg med på en shadcn-versjon med oppdatert `ts-morph`.
  evidence: Gjelder CLI-verktøyet (appen importerer bare `shadcn/tailwind.css`) og en app som bare kjører lokalt. `npm audit fix --force` ville nedgradert til shadcn 1.0.0, og stack-tabellen låser 4.23.0.

## Deferred from: code review of spec-1-2-prosjektgrunnlag-nextjs-shadcn (2026-11-23)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-prosjektgrunnlag-nextjs-shadcn.md`
  summary: Legg til en automatisk sjekk av at `dev` og `start` i `package.json` binder til `-H 127.0.0.1` (AD-17).
  evidence: Verification Gap: i dag sjekkes det bare manuelt med `curl`; Vitest kommer i en senere story.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-prosjektgrunnlag-nextjs-shadcn.md`
  summary: Fjern det mørke temaet fra `shadcn init` (`.dark`-blokk og `@custom-variant dark` i `globals.css`) i story 1.16.
  evidence: Epic-konteksten sier «kun lyst tema»; blokken har ingen effekt i dag, men kan tolkes som støtte for mørk modus.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-prosjektgrunnlag-nextjs-shadcn.md`
  summary: Håndhev modulgrensene (`kjerne` importerer aldri `app`/`klient`/`server`, `klient` aldri `server`, `server/` importerer `server-only`) med `no-restricted-imports` og pakken `server-only`.
  evidence: Regelen står i epic-konteksten, men verken ESLint eller pakker håndhever den; mappene er tomme, så det er billigst å innføre når story 1.3–1.5 legger inn kode.

## Lukket av story 1.3 (2026-11-24)

- Modulgrensene for `kjerne` og `klient` håndheves nå med `no-restricted-imports` og testes i `tests/oppsett/eslint-grenser.test.ts`. `server-only` for `src/server/` gjenstår til story 1.5.
- `dev`/`start` sin `-H 127.0.0.1` testes i `tests/oppsett/package.test.ts`.

## Deferred from: code review of spec-1-3-oktreducer-context-og-versjonering (2026-11-24)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-oktreducer-context-og-versjonering.md`
  summary: UI-et for «Fortsett samtalen» må dispatche `nullstill('samtaleFortsatt')` eksplisitt, ellers blir bevistabellen stående etter nye svar og erfaringer.
  evidence: Reduceren nullstiller ikke automatisk ved `leggTilSvar`/`opprettErfaring`, fordi en versjonsøkning midt i et samtalesvar ville forkastet spørsmålet.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-oktreducer-context-og-versjonering.md`
  summary: Legg til en DOM-test (jsdom/happy-dom) som viser at en dispatch gjennom `OktProvider` oppdaterer `useOkt()`.
  evidence: `renderToString` kan ikke rendre på nytt etter en dispatch; en provider koblet til feil reducer ville bestått dagens tester.

## Deferred from: code review of spec-1-16-merkevaretema (2026-11-24)

- source_spec: `_bmad-output/specs/spec-1-16-merkevaretema/SPEC.md`
  summary: Fokusringen har for lav kontrast (WCAG 2.2 SC 1.4.11 krever 3:1). Arvet `--ring` (`oklch(0.708 0 0)`) gir 2,44:1 mot `background` og 1,50:1 med `ring-ring/50` i `button.tsx`. Vurder `--ring` fra `primary` og et par `ring`/`background` ≥3:1 i `scripts/kontrast.mjs`.
  evidence: Blind Hunter og Edge Case Hunter. Fantes før story 1.16 (2,58:1 mot hvitt), og specen sier at `ring` arves fra shadcn. Gruppen bør bestemme det, fordi det endrer en arvet shadcn-token.
- source_spec: `_bmad-output/specs/spec-1-16-merkevaretema/SPEC.md`
  summary: Bevisst avvik, ingen handling. Mockupen `mockups/samtale.html` viser chatteksten i Inter, mens `chat-body` er Source Serif 4 i DESIGN.md og i koden.
  evidence: Blind Hunter og Acceptance Auditor. Victoria valgte serif (som i story-AC), og DESIGN.md-tokenet fikk `fontFamily: 'Source Serif 4'` 2026-11-24. Mockupen endres ikke, fordi spines vinner ved konflikt.

## Deferred from: code review of spec-story-1-14-ny-okt (2026-11-26)

- source_spec: `_bmad-output/specs/spec-story-1-14-ny-okt/SPEC.md`
  summary: Ingen automatisk test for `useBeforeUnload`-lytteren (`src/klient/okt/usebeforeunload.ts`).
  evidence: Verification Gap. Krever `renderHook` + jsdom + `vi.spyOn(window, 'addEventListener')`, et mønster som ikke finnes i testsuiten. Uten test kan en som fjerner `window.addEventListener`-kallet sende det til prod uten at noen test slår ut.
- source_spec: `_bmad-output/specs/spec-story-1-14-ny-okt/SPEC.md`
  summary: Bekreft at fokusbann fungerer uten `AlertDialogTrigger` (programmatisk åpning).
  evidence: Acceptance Auditor (maybe-false). CAP-2 krever at fokus returnerer til «Ny økt»-knappen ved lukking. Dialogen åpnes via setState, ikke via `AlertDialogPrimitive.Trigger`. Om base-ui bruker `document.activeElement` ved åpningstidspunkt er udokumentert. Avklar ved å lese base-ui-kilde eller skrive en Playwright-test.

## Deferred from: code review of spec-1-7-samtale-ui (2026-11-24)

- source_spec: `_bmad-output/specs/spec-1-7-samtale-ui/SPEC.md`
  summary: Bevisst valg som story 1.15 avgjør endelig. Hele chatloggen er én `aria-live="polite"`-region, så skjermleseren leser også studentens egen melding («Du: …») rett etter sending. Alternativet er en egen skjult live-region som bare kunngjør assistentmeldinger og skriveindikatoren.
  evidence: Blind Hunter. EXPERIENCE.md sier at regionen finnes «slik at nye assistentmeldinger leses opp», og akseptkriteriet i story 1.15 gjelder nye assistentsvar. Victoria valgte én region nå, og at 1.15 avgjør.
  resolution: Avgjort i story 1.15 (2026-11-24). Chatlogg har en egen skjult `aria-live="polite"`-region som bare kunngjør nye assistentmeldinger og skriveindikatoren. Rullelisten er ikke live. EXPERIENCE.md er oppdatert. Se `_bmad-output/specs/spec-1-15-stegindikator/SPEC.md`.
- source_spec: `_bmad-output/specs/spec-1-7-samtale-ui/SPEC.md`
  summary: Ingen automatiske tester for samtalekomponentene: Chatinput (Enter/Shift+Enter, IME, trim, låst mot dobbel sending), autoscroll i Chatlogg (trenger ekte layout, altså nettlesertest) og 404-vakten på `/utvikling/samtale`. Legg dem til senest med story 1.8, og fjern utviklingssiden da.
  evidence: Verification Gap. Repoet har ingen testkjører, og specen har tester som ikke-mål. Atferden ble verifisert manuelt i Chrome med et midlertidig playwright-core-script.

## Deferred from: code review of spec-1-15-stegindikator (2026-11-24)

- source_spec: `_bmad-output/specs/spec-1-15-stegindikator/SPEC.md`
  summary: Ingen automatiske tester for live-regionen i Chatlogg og for Stegindikator. Live-regionen bør testes for fem ting: den er tom ved første visning, er uendret når en studentmelding legges til, viser `SKRIVER_TEKST` når `venter` er sann, kunngjør et nytt assistentsvar, og tømmes når `venter` blir sann, så et feilet kall ikke leser opp forrige svar igjen. Stegindikatoren bør testes med `aktivt="krav"`: aktivt vinner over fullført, det finnes tre knapper med «(fullført)», og kommende steg kan ikke få fokus. Den bør også sjekke at `onVelg` kalles og at fokus går til det aktive steget. Skriv testene sammen med testene for samtalekomponentene fra 1.7 (Vitest, Testing Library og jsdom).
  evidence: Verification Gap og Blind Hunter. Repoet har ingen testkjører, og tester er ikke-mål i specen. Atferden ble verifisert manuelt i Chrome med et midlertidig playwright-core-script.

## Deferred from: code review of spec-1-4-api-kontrakt-zod-skjema-og-statusrute (2026-11-24)

- Begge punktene er lukket av story 1.8 (se under).

## Deferred from: code review of spec-story-1-9-erfaringskort (2026-11-25)

- source_spec: `_bmad-output/specs/spec-story-1-9-erfaringskort/SPEC.md`
  summary: Ingen automatiske tester for `RHRBrikke` og `Erfaringskort`. CAP-4 sine visuelle tilstander (tom/fylt/puls) og Popover-oppførselen verifiseres bare visuelt via `/utvikling/samtale`.
  evidence: Verification Gap. Spec-suksesssignalet krever bare `fanget.test.ts`; komponenttesting med jsdom og Base UI-popover krever ikke-triviell oppsett.
- source_spec: `_bmad-output/specs/spec-story-1-9-erfaringskort/SPEC.md`
  summary: To `opprett`-endringer med samme `ny`-nøkkel i ett `brukEndringer`-kall vil sidesporet den første E-ID-en — `refKart.set(endring.ny, id)` overskriver og den første erfaringen blir hengende uten referanse i pass 2.
  evidence: Blind Hunter + Edge Case Hunter. API-et (story 1.8) har ansvaret for å generere unike `ny`-nøkler; server-side-garantien er ikke på plass ennå.
- source_spec: `_bmad-output/specs/spec-story-1-9-erfaringskort/SPEC.md`
  summary: `brukEndringer` nullstiller ikke `bevistabell`, så tabellen kan bli foreldet hvis den er satt når erfaringstekst endres. Pre-eksisterende mønster (andre handlinger gjør heller ikke dette).
  evidence: Edge Case Hunter. `BevistabellRad`-typen er ukjent uten story 1.11 som kontekst; den mulige konsekvensen verifiseres der.

## Lukket av story 1.4 (2026-11-24)

- `server-only` håndheves for `src/server/` med `tests/oppsett/server-only.test.ts` (rest fra 1.2/1.3).

## Lukket av story 1.8 (2026-11-25)

- Samtalesvaret legges inn som én versjonert handling (`mottaSamtaleSvar`), og forespørsler sendes med gjeldende `versjon` (rest fra 1.3).
- `sporsmal.gjelder: { ny }` løses til den nye `E`-ID-en med `losGjelder()` (rest fra 1.4).
- Klienten holder seg innenfor grensene i samtalen: `maxLength` på Chatinput, `erLoggFull()` låser input, og `MAKS_ERFARINGER` håndheves i ruten og reduceren (rest fra 1.4; `MAKS_ANNONSE_TEGN` gjelder 2.1).
- `Appskall` ligger i en felles layout (`src/app/(flyt)/layout.tsx` med `Flytskall`), så fokus etter stegvalg ikke går tapt (rest fra 1.15).
- `/utvikling/samtale` er fjernet (del av punktet fra 1.7; testene for samtalekomponentene står fortsatt åpne).

## Deferred from: code review of spec-1-8-samtalerute-som-stiller-og-mottar-oppfolgingssporsmal (2026-11-25)

- source_spec: `_bmad-output/implementation-artifacts/spec-1-8-samtalerute-som-stiller-og-mottar-oppfolgingssporsmal.md`
  summary: `Flytskall` (omdirigering til `/` uten startet økt, aktivt steg fra stien) og den midlertidige Start-knappen i `src/app/page.tsx` har ingen automatiske tester.
  evidence: Verification Gap i bmad-build for 1.8. Ingen test importerer `Flytskall` eller `page.tsx`, og Vitest kjører uten DOM. Dekkes når repoet får DOM-tester, eller ved å flytte avgjørelsen til en ren hjelper. Start-knappen erstattes i 1.6.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-8-samtalerute-som-stiller-og-mottar-oppfolgingssporsmal.md`
  summary: `Samtaleflate` har ingen komponenttester: send-vakten (`!harSporsmal || loggFull`), at utkastet bare tømmes når det fortsatt er teksten som ble sendt, «Prøv igjen» via toasten, at toasten fjernes når utkastet endres, og avbrudd ved unmount (forsinket én tick for StrictMode).
  evidence: Verification Gap og Blind Hunter i bmad-code-review. Ingen test importerer komponenten, og Vitest kjører uten DOM. `sendSamtale` er testet som ren funksjon. Dekkes når repoet får DOM-tester, eller ved å flytte reglene til rene hjelpere i `api.ts`.

## Deferred from: code review of spec-1-10-terskelregler (2026-11-26)

- source_spec: `_bmad-output/specs/spec-1-10-terskelregler/SPEC.md`
  summary: `kanGaVidere()` er ≥ `MAAL_ERFARINGER` (3), men ARCHITECTURE-SPINE og EXPERIENCE.md krever «minst 1 fanget» for å gå videre fra Oppsummering. Velg før 1.11/1.12, for eksempel `kanTilbyOppsummering` (≥ 3) og `kanGaVidere` (≥ 1), og oppdater arkitekturen.
  evidence: Implementert slik Victoria ba om. Funksjonen har ingen kallere ennå. Blind Hunter-funn 1 og 11.
- source_spec: `_bmad-output/specs/spec-1-10-terskelregler/SPEC.md`
  summary: Det faste overgangsspørsmålet kan gjentas tur etter tur når modellen holder seg på en lukket erfaring. Med maks nådd inviterer `MAKS_ERFARINGER_SPORSMAL` til mer om lukkede erfaringer. UX bør gi variasjon eller en egen tekst for maks + lukket.
  evidence: Edge Case Hunter og Blind Hunter. Promptregelen gjør det sjeldnere, men ordlyden eies av UX.
- source_spec: `_bmad-output/specs/spec-1-10-terskelregler/SPEC.md`
  summary: `MIN_ANNONSE_TEGN` må også håndheves i `/api/krav` med `ugyldig_foresporsel`, ikke bare på «Finn krav»-knappen.
  evidence: review-reconcile.md (arkitektur). Ruten kommer i Epic 2.
- source_spec: `_bmad-output/specs/spec-1-10-terskelregler/SPEC.md`
  summary: Demomanuset for samtalen (story 1.13) må holde seg innenfor `MAKS_OPPFOLGING_PER_ERFARING`, ellers byttes spørsmål nummer fire om samme erfaring stille med `OVERGANGSSPORSMAL`.
  evidence: Demo går gjennom `begrensOppfolging` i `/api/samtale`.

## Deferred from: code review of spec-1-11-fremdrift (2026-11-26)

- source_spec: `_bmad-output/specs/spec-1-11-fremdrift/SPEC.md`
  summary: «Ferdig» og «Gå videre til oppsummering» sender til `/oppsummering`, som gir 404 til story 1.12 lager siden. Merge 1.11 til main bare sammen med eller etter 1.12.
  evidence: Edge Case Hunter, Blind Hunter og Verification Gap. Bestemt med vilje i specen (siden bygges i 1.12).
- source_spec: `_bmad-output/specs/spec-1-11-fremdrift/SPEC.md`
  summary: Skjermleseren får ikke vite at «Gå videre til oppsummering» har dukket opp, fordi statusregionen bare leser «3 av 3 erfaringer fanget». UX vurderer en tilleggstekst ved N ≥ 3.
  evidence: Blind Hunter. AC er oppfylt. Tilleggsteksten er mikrotekst som UX eier.
- source_spec: `_bmad-output/specs/spec-1-11-fremdrift/SPEC.md`
  summary: UX-DR8 og EXPERIENCE.md sier at «Ferdig» er deaktivert til minst ett *oppfølgingsspørsmål* er stilt, men `kanTrykkeFerdig()` (1.10) er sann etter åpningsspørsmålet. Gruppen bestemmer ordlyden, eller endrer regelen i regler.ts.
  evidence: Blind Hunter. Story 1.10 AC og Victorias AC for 1.11 sier «minst ett spørsmål».

## Deferred from: code review of spec-1-6-startside (2026-11-26)

- source_spec: `_bmad-output/specs/spec-1-6-startside/SPEC.md`
  summary: Start tømmer en påbegynt økt uten bekreftelse når studenten går tilbake til Start og trykker «Start ny økt» eller «Prøv demomodus».
  evidence: Blind Hunter. `starthandlinger` sender alltid `nyOkt`. EXPERIENCE.md krever bekreftelse i `Dialog` («Alt i denne økten forsvinner.») for «Ny økt»; story 1.14 bør bruke samme bekreftelse på Start når økten har innhold.
- source_spec: `_bmad-output/specs/spec-1-6-startside/SPEC.md`
  summary: DOM-test av `src/app/page.tsx`: klikk dispatcher `nyOkt` og `startOkt` i rekkefølge og kaller `router.push("/samtale")`.
  evidence: Verification Gap. Krever jsdom (eller tilsvarende), som ikke er i prosjektet; samme åpne punkt som DOM-testen av `OktProvider` fra story 1.3. Startflate-hendelsene er dekket uten DOM.
- source_spec: `_bmad-output/specs/spec-1-6-startside/SPEC.md`
  summary: Når både nøkkel og demodata mangler, peker «Ingen API-nøkkel funnet. Se README, eller prøv demomodus.» på en deaktivert knapp.
  evidence: Blind Hunter. Teksten er fast mikrotekst i EXPERIENCE.md, så UX avgjør om tilfellet trenger en egen tekst (f.eks. «Ingen API-nøkkel funnet. Se README.»).
