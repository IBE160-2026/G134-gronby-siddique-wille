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
  summary: Story 1.8 må legge samtalesvaret (spørsmål + endringer + nye erfaringer) inn som én versjonert handling, ikke som løse `opprettErfaring`-dispatcher. Forespørsler må sendes med versjonen etter rettelse eller sletting.
  evidence: `opprettErfaring` har ingen `versjon`; i dag finnes ingen asynkron kaller.
- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-oktreducer-context-og-versjonering.md`
  summary: Legg til en DOM-test (jsdom/happy-dom) som viser at en dispatch gjennom `OktProvider` oppdaterer `useOkt()`.
  evidence: `renderToString` kan ikke rendre på nytt etter en dispatch; en provider koblet til feil reducer ville bestått dagens tester.
