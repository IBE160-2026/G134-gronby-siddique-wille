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

## 2026-11-15 kl. 15:22 — Thea Wille

### Oppgave
Fulgte opp `docs/prds/.../tilbakemelding-prd.md` punkt 4.2 (feilhåndtering/tomme tilstander) og 4.4 (grenser for annonselengde/antall erfaringer) ved å legge nye acceptance criteria til tre eksisterende stories i `docs/epics.md`, uten å endre noe annet i dokumentet.

### Plan
- Les `docs/epics.md` og tilbakemeldingens punkt 4.2/4.4.
- Foreslå fire nye Given/When/Then-ACs (vist til bruker for godkjenning før lagring):
  - Story 1.8: modellkall-feil («Noe gikk galt. Prøv igjen.», svar bevares, ingen halv loggoppføring) + maksgrense for antall erfaringer.
  - Story 1.12: tom tilstand ved 0 fangede erfaringer på «Ferdig» (kan ikke gå videre til kravuttrekk).
  - Story 2.1: maksgrense for annonselengde.
- Bruker ba om å flytte de to nye konstantene fra forslått `config.ts` til `kjerne/regler.ts`, i tråd med AD-16 (som allerede eier `MIN_ANNONSE_TEGN`, `MAAL_ERFARINGER`, `MAKS_OPPFOLGING_PER_ERFARING`).

### Resultat
`docs/epics.md` oppdatert med fire nye ACs, eksisterende ACs/stories urørt:
- Story 1.8: la til AC for `/api/samtale`-feil, og AC for `MAKS_ERFARINGER` (8, `kjerne/regler.ts`, AD-16).
- Story 1.12: la til AC for tom tilstand ved 0 fangede erfaringer.
- Story 2.1: la til AC for `MAKS_ANNONSE_TEGN` (6000, `kjerne/regler.ts`, AD-16).
- Verdiene (8 erfaringer, 6000 tegn) er hentet fra tilbakemeldingens eget eksempel i 4.4.
- Ikke committet ennå i denne seksjonen — kun denne loggfila og `issues.md` committes av `sesjonslogg`-skillen; `docs/epics.md`-endringen står ukommittert til bruker ber om commit.

### Åpne punkter
- Ingen nye. `docs/epics.md` har fortsatt `status: draft` (uendret fra forrige økt — se punktet over).
