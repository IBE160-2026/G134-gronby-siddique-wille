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
