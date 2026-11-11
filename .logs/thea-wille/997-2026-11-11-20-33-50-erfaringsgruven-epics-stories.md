# Erfaringsgruven: Epics og stories

## 2026-11-11 kl. 20:33 — Thea Wille

### Oppgave
Kjørte `bmad-create-epics-and-stories`-skillen for å bryte ned PRD-en (`docs/prds/.../prd.md` + `addendum.md`), arkitektur-spinen (`ARCHITECTURE-SPINE.md` + `arkitektur-begrunnelse.md`) og UX-spinen (`DESIGN.md` + `EXPERIENCE.md`) til et komplett `docs/epics.md` med epics, stories og akseptansekriterier, klart for utviklingsfasen.

### Plan
- Steg 1: valider forutsetninger, les alle fem kildedokumentene og `fixtures/testsett-a/`, trekk ut krav (FR, NFR, tilleggskrav fra arkitektur, UX-design-krav) og få dem bekreftet.
- Steg 2: design epic-strukturen (brukerverdi, ikke tekniske lag), få godkjenning og lage FR coverage map.
- Steg 3: lag stories med Given/When/Then-akseptansekriterier for hver epic, én epic i gangen, med godkjenning per epic.
- Steg 4: sluttvalider — FR-dekning, avhengigheter, epic-uavhengighet, UX-DR-dekning — rett opp det som mangler.

### Resultat
`docs/epics.md` er opprettet og fylt ut (status fortsatt `draft` — se Åpne punkter):

- **Krav hentet ut:** 9 FR-er, 5 NFR-er, 21 tilleggskrav fra arkitekturen (AD-1–AD-17 + stack/testdeling/README-krav), 22 UX-design-krav (UX-DR1–UX-DR22).
- **5 epics, 40 stories totalt:**
  1. Samtale og erfaringsfangst (+ prosjektgrunnlag) — 17 stories (FR-1, FR-2, FR-3, FR-9 delvis). Inkluderer en tidlig, liten README/`.env.example`-story (1.1) etter bruker-ønske, og to stories lagt til under sluttvalidering for å tette UX-DR-dekning: 1.16 (design-tokens/kontrastverifisering) og 1.17 (responsivt oppsett).
  2. Kravuttrekk fra stillingsannonse — 6 stories (FR-4, NFR4 delvis).
  3. Bevistabell med sporbarhet og hull — 8 stories (FR-5, FR-6, FR-7, NFR4).
  4. Eksport av resultat — 3 stories (FR-8).
  5. Demomodus for sensor og dokumentasjon — 4 stories (FR-9 fullført, NFR4 fullført).
- **Rettet under sluttvalidering:** en fremover-avhengighet i Epic 1 (Story "Startside" refererte til `/api/status` før den var bygget) — rettet ved å omrokkere stories 1.3–1.6 (reducer → API-kontrakt/status → modelladapter → startside).
- **Bevisst avvik fra standard BMAD-heuristikk:** Epic 1 Story 1 er README/`.env.example`, ikke selve starter-template-oppsettet (som er Story 1.2) — eksplisitt bestilt av bruker, ingen avhengighetsbrudd.

### Åpne punkter
- `docs/epics.md` har `status: draft` — bruker ville gjennomgå dokumentet selv før status settes til `final`. Ingen videre handling før bruker bekrefter.
