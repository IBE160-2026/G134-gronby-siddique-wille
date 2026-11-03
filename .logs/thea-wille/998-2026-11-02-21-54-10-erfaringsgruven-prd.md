# Erfaringsgruven PRD

## 2026-11-02 kl. 21:54 — Thea Wille

### Oppgave
Opprette PRD for Erfaringsgruven med `bmad-prd`-skillen, basert på eksisterende `docs/product-brief.md` og tilbakemeldingene i `docs/tilbakemelding-product-brief.md`. Brukeren ville lese utkastet selv før status settes til `final`.

### Plan
- Aktivering av `bmad-prd`: løste `workflow`-customization og config (planning_artifacts → `docs/`, run-mappe-mønster `prd-{project_name}-{date}`).
- Create-intent: bandt arbeidsmappe `docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/`, initierte `prd.md` + `.memlog.md`.
- Discovery: brain dump (kilder bekreftet av bruker), to parallelle subagenter — én som ekstraherte brief+tilbakemelding, én som gjorde markedsresearch (sammenlignbare verktøy) — innsats-kalibrering (skoleprosjekt/MVP), arbeidsmåte (Fast path), konsoliderte spørsmål om plattform og brukermodell.
- Skrev fullt PRD-utkast + `addendum.md` for tekniske detaljer (modell, kostnad, personvern-implementasjon, repo-hygiene, fremtidsvisjon).
- Ingen Reviewer Gate / Finalize kjørt ennå — brukeren leser selv først.

### Resultat
- `docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md` — fullt PRD-utkast (status: `draft`), §0–10: visjon, målgruppe, 1 brukerreise (Mia), ordliste, 9 funksjonskrav (FR-1–FR-9) langs samtale → kravuttrekk → bevistabell → eksport + demomodus, tverrgående krav (personvern/kostnad/plattform/testbarhet), ikke-mål, MVP-omfang, 7 suksessmetrikker + 1 mot-metrikk, 5 åpne spørsmål, 5 `[ASSUMPTION]`-tagger indeksert.
- `docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/addendum.md` — modellvalg (Claude Haiku 5.5, bekreftet av bruker mot Anthropics prisside) og kostnadsanslag, personvern-implementasjon, behov for faste testsett/fixtures, repo-/prosesshygiene fra tilbakemeldingen, fremtidsvisjon (karrierebank).
- `docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/.memlog.md` — full beslutningslogg for økten (16 oppføringer).
- Ingen commit av PRD-filene gjort i denne økten (ligger ukommittert i `docs/prds/`) — brukeren leser selv først, status forblir `draft`.
- Lukket to punkter i `issues.md`: modellnavn "Claude Haiku 5.5" er nå bekreftet av bruker mot Anthropics prisside, og PRD-skillen er kjørt (utkast finnes, men ikke finalisert).

### Åpne punkter
- PRD-status er fortsatt `draft` — brukeren leser utkastet selv; `status: final` skal **ikke** settes før bruker ber om det.
- 5 åpne spørsmål i PRD §9 gjenstår å avklare med gruppen: (1) antall oppfølgingsspørsmål per erfaring, (2) én vs. flere stillingsannonser per økt, (3) statisk refleksjonsforslag vs. aktivt oppfølgingsspørsmål ved hull, (4) definisjon av faste testsett/fixtures for kravuttrekk, (5) om sporbarhet (FR-6) skal være synlig i UI eller holder i datamodellen. *(Løst 2026-11-03, se seksjonen under — kun punkt 4 er fortsatt åpent.)*
- Reviewer Gate (bmad-prd Finalize) er ikke kjørt — gjøres når bruker er klar for finalisering.
- Resten av gruppen (2 andre medlemmer) har ikke sett PRD-en ennå.

## 2026-11-03 kl. 18:09 — Thea Wille

### Oppgave
Gruppen har bekreftet svar på fire av de fem åpne spørsmålene fra forrige økt. Oppdater `prd.md` tilsvarende: fjern `[ASSUMPTION]`-tagger for FR-2, FR-4, FR-6, FR-7; legg til i FR-2 at samtalen stiller maks tre oppfølgingsspørsmål per erfaring; lukk åpne spørsmål 1, 2, 3, 5 med svarene; la spørsmål 4 stå åpent, tildelt Rikke; oppdater antagelsesindeksen (§10).

### Plan
- Målrettede `Edit`-operasjoner i `prd.md`, kun de nevnte stedene (FR-2, FR-4, FR-6, FR-7, §9, §10, `updated`-dato) — ingen andre deler av dokumentet rørt, som bedt.
- Loggførte beslutningene i `.memlog.md` for PRD-arbeidsmappen (entries 17–18).

### Resultat
- `docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md` oppdatert (`updated: 2026-11-03`):
  - FR-2: ny konsekvens "maks tre oppfølgingsspørsmål per erfaring", `[ASSUMPTION]`-tag fjernet.
  - FR-4, FR-6: `[ASSUMPTION]`-tagger fjernet, kravtekst ellers uendret.
  - FR-7: `[ASSUMPTION]`-bullet fjernet.
  - §9 Åpne spørsmål: 1, 2, 3, 5 markert **[Lukket]** med svar; 4 markert **[Åpent — ansvarlig: Rikke]**.
  - §10 Antagelsesindeks: redusert til kun §2.3 UJ-1 (Mia er en syntetisert protagonist) — eneste gjenstående antagelse i dokumentet.
- Ikke committet ennå i denne økten (PRD-filene ligger ukommittert, som tidligere — bruker leser selv og avgjør når).

### Åpne punkter
- Åpent spørsmål 4 (faste testsett/fixtures for kravuttrekk) — ansvarlig: Rikke.
- PRD-status fortsatt `draft`; Reviewer Gate/Finalize ikke kjørt.
- Resten av gruppen har fortsatt ikke sett PRD-en.
