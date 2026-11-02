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
- 5 åpne spørsmål i PRD §9 gjenstår å avklare med gruppen: (1) antall oppfølgingsspørsmål per erfaring, (2) én vs. flere stillingsannonser per økt, (3) statisk refleksjonsforslag vs. aktivt oppfølgingsspørsmål ved hull, (4) definisjon av faste testsett/fixtures for kravuttrekk, (5) om sporbarhet (FR-6) skal være synlig i UI eller holder i datamodellen.
- Reviewer Gate (bmad-prd Finalize) er ikke kjørt — gjøres når bruker er klar for finalisering.
- Resten av gruppen (2 andre medlemmer) har ikke sett PRD-en ennå.
