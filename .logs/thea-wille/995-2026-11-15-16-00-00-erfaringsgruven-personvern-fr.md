# Erfaringsgruven: personvern-FR for avkrysningsboksen

## 2026-11-15 kl. 16:00 — Thea Wille

### Oppgave
Gruppen hadde godkjent at personvernteksten med avkrysning på Start (beskrevet i UX-spinen, `DESIGN.md`/`EXPERIENCE.md`) skal få et eget, formelt krav i PRD-en, og at Story 1.6 i `docs/epics.md` skal få en acceptance criteria som dekker gatingen av «Start ny økt». Dette var ført som åpent punkt etter sprint-planning-økten ([996-...-erfaringsgruven-sprint-planning.md](996-2026-11-15-15-30-00-erfaringsgruven-sprint-planning.md)).

### Plan
- Lese `EXPERIENCE.md`/`DESIGN.md` for eksakt ordlyd på personverntekst og avkrysning.
- Legge til `FR-10` i `prd.md` §4.1, med samme ordlyd som UX, uten å endre eksisterende FR-numre.
- Oppdatere `docs/epics.md`: Requirements Inventory (FR-liste) og FR Coverage Map med FR-10 → Epic 1 / Story 1.6, samt legge til tre nye Given/When/Then-blokker i Story 1.6 som dekker avkrysningsgatingen.
- Vise diff for begge filene til bruker før lagring (ingen plandokument utover denne loggen).

### Resultat
- `docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md`: la til `FR-10: Personvernbekreftelse før samtalestart` i §4.1, ordrett personverntekst fra UX, pluss krav om at «Start ny økt» er deaktivert til avkrysning og at demomodus ikke krever avkrysning.
- `docs/epics.md`: la til FR-10 i Functional Requirements-lista og i FR Coverage Map (peker til Epic 1 / Story 1.6). Story 1.6 fikk tre nye Given/When/Then-blokker: avkrysningsboksens tekst, at «Start ny økt» er deaktivert uten avkrysning, og at den blir aktiv med avkrysning + gyldig API-nøkkel.
- Ingen andre deler av de to filene ble endret (Epic 1-sammendraget og Story 1.6-headerens FR-liste er bevisst urørt).
- Begge filer er ennå ikke committet (brukeren har ikke bedt om commit av selve dokumentendringene).

### Åpne punkter
- Ingen.
