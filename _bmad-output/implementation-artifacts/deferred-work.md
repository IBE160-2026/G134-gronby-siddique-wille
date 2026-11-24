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

## Deferred from: code review of spec-1-16-merkevaretema (2026-11-24)

- source_spec: `_bmad-output/specs/spec-1-16-merkevaretema/SPEC.md`
  summary: Fokusringen har for lav kontrast (WCAG 2.2 SC 1.4.11 krever 3:1). Arvet `--ring` (`oklch(0.708 0 0)`) gir 2,44:1 mot `background` og 1,50:1 med `ring-ring/50` i `button.tsx`. Vurder `--ring` fra `primary` og et par `ring`/`background` ≥3:1 i `scripts/kontrast.mjs`.
  evidence: Blind Hunter og Edge Case Hunter. Fantes før story 1.16 (2,58:1 mot hvitt), og specen sier at `ring` arves fra shadcn. Gruppen bør bestemme det, fordi det endrer en arvet shadcn-token.
- source_spec: `_bmad-output/specs/spec-1-16-merkevaretema/SPEC.md`
  summary: Bevisst avvik, ingen handling. Mockupen `mockups/samtale.html` viser chatteksten i Inter, mens `chat-body` er Source Serif 4 i DESIGN.md og i koden.
  evidence: Blind Hunter og Acceptance Auditor. Victoria valgte serif (som i story-AC), og DESIGN.md-tokenet fikk `fontFamily: 'Source Serif 4'` 2026-11-24. Mockupen endres ikke, fordi spines vinner ved konflikt.

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
- source_spec: `_bmad-output/specs/spec-1-15-stegindikator/SPEC.md`
  summary: Fokus etter stegvalg forutsetter at `Appskall` står mountet mens steget byttes. Lager story 1.8 stegene som egne ruter, må skallet ligge i en felles layout og ikke i hver side. Ellers faller fokus til `<body>` etter klikk på et fullført steg (CAP-4).
  evidence: Edge Case Hunter og Acceptance Auditor. Komponenten vet ikke om steg er ruter eller tilstand, så kontrakten står i JSDoc og må følges når 1.8 kobler til.
