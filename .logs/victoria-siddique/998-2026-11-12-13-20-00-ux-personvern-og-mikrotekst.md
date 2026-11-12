# UX: personvern og fast mikrotekst

## 2026-11-12 kl. 13:20 — Victoria Siddique

### Oppgave
Følge opp lærerens tilbakemelding på PRD-en (`tilbakemelding-prd.md`, punkt 4.4) og de åpne UX-punktene fra arkitekturen: skrive personvernteksten og avkrysningen på Start, ordlyden for overgangsspørsmålet og standard-refleksjonsforslaget, og rette «statisk refleksjonsforslag» så det stemmer med arkitekturen (AD-7).

### Plan
- Lese `tilbakemelding-prd.md`, `docs/epics.md` og arkitekturens AD-7, AD-16 og AD-17.
- Oppdatere [EXPERIENCE.md](../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md) med en ny tabell «Fast mikrotekst», og rette Start, Kravrad (hull) og UJ-1.
- Rette én linje i PRD FR-7.
- Endringene er laget med Claude og lastet opp via GitHub-nettsiden.

### Resultat
- `EXPERIENCE.md` (`updated: 2026-11-12`):
  - Ny seksjon «Fast mikrotekst» med personverntekst, avkrysning, `OVERGANGSSPORSMAL` og `STANDARD_REFLEKSJON`.
  - Personvernteksten følger AD-17 (kryptert til Anthropic, sletting innen 30 dager, flaggede samtaler opptil 2 år) og ber studenten unngå personnummer og helseopplysninger, som læreren foreslo.
  - «Start ny økt» er deaktivert til studenten har krysset av. Demomodus krever ingen avkrysning.
  - Fjernet «Ingenting lagres når du lukker fanen», som lovet mer enn arkitekturen holder.
  - Kravrad (hull): refleksjonsforslaget lages av modellen, med standardtekst som reserve.
  - «Åpne punkter for UX» oppdatert: FR-3, UJ-1 og Å.s. 5 er løst i PRD-en.
- PRD FR-7: konsekvensen om refleksjonsforslaget er presisert etter AD-7.

### Åpne punkter
- PRD-en trenger et eget krav for personvernteksten og avkrysningen (lærerens forslag til FR-11).
- PRD §9 Å.s. 3 og §10 sier fortsatt «statisk refleksjonsforslag». Rettes når §9 og §10 ryddes etter lærerens tilbakemelding.
- `docs/epics.md` FR-7 sier «statisk refleksjonsforslag», og Story 1.6 mangler avkrysningen og ordlyden fra «Fast mikrotekst».
