# Epic 1: prosjektgrunnlag (story 1.1 og 1.2)

## 2026-11-23 kl. 22:10 — Rikke V. Gronby

### Oppgave
Bygge story 1.1 (README og `.env.example` for lokal kjøring) og story 1.2 (Next.js-prosjekt med shadcn og dev-server) fra `docs/epics.md` med `bmad-build`, etter arkitektur-spinen (AD-1 og mappestrukturen). Sprint-status skulle oppdateres underveis, og alt skulle committes og pushes når `npm run dev` virket.

### Plan
- To specs etter hverandre (brukerens valg), med subagenter til epic-kontekst, implementering og gjennomgang (brukerens valg).
- Epic-kontekst: [epic-1-context.md](../../_bmad-output/implementation-artifacts/epic-1-context.md).
- Story 1.1 som oneshot: [spec-1-1-readme-og-env-example.md](../../_bmad-output/implementation-artifacts/spec-1-1-readme-og-env-example.md).
- Story 1.2 som full spec, godkjent av Rikke: [spec-1-2-prosjektgrunnlag-nextjs-shadcn.md](../../_bmad-output/implementation-artifacts/spec-1-2-prosjektgrunnlag-nextjs-shadcn.md).

### Resultat
- **Story 1.1** (ecde956):
  - README har oppskrift for lokal kjøring: Node 26.13.0 eller nyere 26.x, `npm install`, `.env.local` valgfri, og `npm run dev` på `127.0.0.1`.
  - README har også en grunnleggende del om demomodus og personvern i ekte modus (AD-17).
  - `.env.example` har `ANTHROPIC_API_KEY`.
  - Blind Hunter ga 14 funn: 10 rettet, 3 avvist, 1 utsatt.
- **Story 1.2** (237e64d):
  - Next.js 16.4.5, React 19.3.1, Tailwind 4.3.4 og shadcn 4.23.0, alle låst eksakt. Tailwind kobles inn via `@tailwindcss/turbopack`, siden denne create-next-app-versjonen ikke lager PostCSS-config.
  - `dev` og `start` er bundet til 127.0.0.1. Cache Components og `partialPrefetching` er fjernet fra generert config (AD-2).
  - Mappene `src/kjerne`, `src/klient/okt` og `src/server/modell` finnes. shadcn la til `src/components/ui/button.tsx`.
  - Placeholder-side «Erfaringsgruven» med `lang="nb"`.
  - `AGENTS.md`, som `next dev` lager ved hver oppstart, er committet.
  - Tre gjennomgangslag ga 17 funn: 8 rettet. Det viktigste var at `--font-sans` refererte til seg selv, så Geist-fonten kunne forsvinne. 7 funn ble avvist og 2 utsatt.
- **Verifisert:** `npm run build` og `npm run lint` uten feil. `npm run dev` gir 200 på `127.0.0.1:3000`, og `[::1]` får ingen forbindelse. README, `.env.example`, `docs/` og `fixtures/` er uendret i 1.2.
- **Sprint-status:** epic-1 er `in-progress`, og 1-1 og 1-2 er `review` (83df5ac retter tidsstempelet).
- **Utsatt arbeid** står i [deferred-work.md](../../_bmad-output/implementation-artifacts/deferred-work.md).

### Åpne punkter
- Story 1.1 og 1.2 står på `review` i sprint-status og trenger kodegjennomgang (`bmad-code-review`) før de settes til `done`.
- Bestem om `CLAUDE.md` skal importere `AGENTS.md` (`@AGENTS.md`), slik at Next 16-regelen om å lese `node_modules/next/dist/docs/` når Claude Code. Det endrer agentinstruksjonene, så gruppen bør bestemme.
- `npm audit` viser 4 moderate sårbarheter i `minimatch` via shadcn 4.23.0 → `ts-morph` (bare CLI-verktøyet). Oppdater shadcn når en versjon med rettet `ts-morph` finnes.
- README trenger en feilsøkingsdel for `mangler_nokkel` og ugyldig nøkkel når feilmodellen er bygget (story 1.4/1.5).

## 2026-11-23 kl. 22:18 — Rikke V. Gronby

### Oppgave
Kodegjennomgang (`bmad-code-review`) av story 1.1 og 1.2, som sto på `review`. Begge skulle settes til `done` hvis gjennomgangen var grei. I tillegg skulle `@AGENTS.md` legges øverst i `CLAUDE.md`, slik at Claude Code leser Next 16-rådene.

### Plan
- Diff for ecde956 og 237e64d mot e35591f, uten `package-lock.json` og `_bmad-output/` (19 filer).
- Fire gjennomgangslag som subagenter: Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor, mot begge specene og epic-konteksten.
- Rikke valgte å ta med alle patchene.

### Resultat
- 19 rå funn ble til 14 etter gruppering: 6 patch, 3 defer og 5 avvist. Ingen `high` eller `medium`. Acceptance Auditor fant ingen brudd på akseptansekriteriene.
- Edge Case Hunter kjørte uten claims-sjekken, fordi claims-fila ikke ble skrevet etter en feil i git-kommandoen.
- Patcher i cb9acb4:
  - README: `git clone`-kommando, riktig forklaring av `127.0.0.1` og en tabell over `lint`/`build`/`start`.
  - `.env.example` beskriver demomodus som planlagt.
  - Ny `.nvmrc` (26.13.0).
  - Yarn/PnP-mønstre er fjernet fra `.gitignore`.
- `CLAUDE.md` starter nå med `@AGENTS.md` (cb9acb4).
- Funnene står under «Review Findings» i [spec-1-2](../../_bmad-output/implementation-artifacts/spec-1-2-prosjektgrunnlag-nextjs-shadcn.md). Utsatte punkter står i [deferred-work.md](../../_bmad-output/implementation-artifacts/deferred-work.md).
- Verifisert: `npm run lint` og `npm run build` uten feil.
- Sprint-status: 1-1 og 1-2 er `done`. epic-1 står fortsatt som `in-progress`.
- Lukket i `issues.md`: kodegjennomgangen av 1.1/1.2 og `AGENTS.md`-importen.

### Åpne punkter
- Legg til en automatisk test av at `dev`/`start` binder til `-H 127.0.0.1` når Vitest er på plass.
- Fjern det mørke temaet fra `shadcn init` (`.dark`-blokk, `@custom-variant dark`) i story 1.16.
- Håndhev modulgrensene med `no-restricted-imports` og `server-only` når story 1.3–1.5 legger inn kode.
