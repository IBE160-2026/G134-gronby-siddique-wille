# Erfaringsgruven sprint-planning

## 2026-11-15 kl. 15:30 — Thea Wille

### Oppgave
Kjør `/bmad-sprint-planning` (full sprint-planning): sjekk at planleggingen (product-brief, PRD, arkitektur-spine, UX-spine, epics.md) er klar for implementering, og generer `sprint-status.yaml` fra `docs/epics.md`.

### Plan
- Readiness-gate: inventer `docs/` og vurder om en utvikler kan bygge epics/stories uten å finne på beslutninger som ikke står noe sted. Kryssjekket AD-referanser (epics.md mot `ARCHITECTURE-SPINE.md`) og UX-DR-innhold (epics.md mot `DESIGN.md`/`EXPERIENCE.md`).
- Ved CONCERNS: la bruker velge å gå videre eller fikse først.
- Generer tracking: `uv run .claude/skills/bmad-sprint-planning/scripts/sprint_plan.py generate --epic-file docs/epics.md --status-file _bmad-output/implementation-artifacts/sprint-status.yaml --stories-dir _bmad-output/implementation-artifacts --project "G134-gronby-siddique-wille" --date "11-15-2026 00:00"`.

### Resultat
- **Gate-verdikt: CONCERNS.** Alle AD-1–AD-17-referanser i epics.md finnes i arkitektur-spinen; UX-DR-innholdet i epics.md er tro mot `DESIGN.md`/`EXPERIENCE.md` (UX-DR-numrene er epics.md sin egen traceability-nummerering, ikke identifikatorer som står i UX-dokumentene selv — det er forventet, ikke et funn). To reelle åpne punkter ble funnet:
  1. Avkrysningsboksen på Start («Jeg har lest dette og vil starte», låser «Start ny økt») er spesifisert i `EXPERIENCE.md` (linje 24, 60, 90), men har ingen PRD-FR, og Story 1.6 i `docs/epics.md` har ingen AC som dekker den. `EXPERIENCE.md` linje 179 flagger selv at "PRD-en skal få et eget krav for dette" — aldri lukket.
  2. Arkitektur-spinens åpne spørsmål Å-1 («Krever IBE160 en bestemt stack? Next.js står, men spørsmålet er åpent til kapittel 6 er sjekket») er fortsatt ubesvart og påvirker AD-1, som Epic 1 (og dermed alt videre) bygger på.
  - Bruker valgte å gå videre likevel uten å fikse disse først.
- **Tracking generert:** `_bmad-output/implementation-artifacts/sprint-status.yaml` — 5 epics, 38 stories, alle `backlog` (ny fil, 0 preserved/changed). 2 benign parse-warnings fra scriptet (dokumenttittelen og "## Epic List"-overskriften i epics.md ble flagget som uparsede Epic/Story-lignende linjer, men inneholder ikke reelt epic/story-innhold — ingen innhold gikk tapt; 5 epics × stories stemmer med strukturen i epics.md: 17+6+8+3+4=38).
- Ikke committet: `sprint-status.yaml` ligger i `_bmad-output/` (generert artefakt), ikke rørt av denne loggcommiten.

### Åpne punkter
- PRD trenger en formell FR for avkrysningsboksen på Start-siden, og Story 1.6 i `docs/epics.md` må få en AC som dekker gatingen («Start ny økt» deaktivert til boksen er krysset av).
- Å-1 i arkitektur-spinen (krever IBE160 en bestemt stack?) må besvares — påvirker AD-1 (Next.js) og dermed grunnlaget for Epic 1.
