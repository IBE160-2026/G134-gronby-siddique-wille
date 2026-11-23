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
