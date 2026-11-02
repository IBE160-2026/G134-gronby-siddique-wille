# Planning-artifacts peker til docs/

## 2026-11-02 kl. 21:26 — Thea Wille

### Oppgave
Brukeren ba om `/bmad-help` for å få status og neste steg i BMad-flyten. Brukeren rettet deretter en feilaktig påstand om at "Claude Haiku 5.5" ikke finnes (den finnes: `claude-haiku-5-5`, utgitt 7. oktober 2026, $0,10/$0,50 per million tokens for prompter opp til 100 000 tokens) og ba om at modellnavn/pris i product brief ikke skulle endres. Brukeren ba videre om å rette mappestrukturen slik at `planning_artifacts` peker til `docs/` i stedet for den tomme `_bmad-output/planning-artifacts/`, og at innstillingen skal ligge i en fil som gjelder for hele gruppen (ikke bare lokalt).

### Plan
- Les `_bmad/_config/bmad-help.csv`, kjør `resolve_config.py` for å se merget config, og undersøk `_bmad-output/`, `docs/` og `.logs/` for å finne status.
- Avklar forskjellen mellom `_bmad/config.toml` (installer-styrt, overskrives), `_bmad/config.user.toml` (personlig, git-ignorert) og `_bmad/custom/config.toml` (team-override, committet, aldri rørt av installeren).
- Legg `planning_artifacts = "{project-root}/docs"` under `[modules.bmm]` i `_bmad/custom/config.toml`.
- Verifiser med `resolve_config.py` at overridet faktisk slår igjennom i merget config.
- Committ kun denne ene filendringen.

### Resultat
- `_bmad/custom/config.toml` fikk et nytt `[modules.bmm]`-avsnitt med `planning_artifacts = "{project-root}/docs"`, med kommentar om hvorfor.
- Verifisert: merget config viser nå `planning_artifacts: "{project-root}/docs"`, mens `implementation_artifacts` fortsatt peker til `_bmad-output/implementation-artifacts` (uendret).
- Committet i `0fcb762` ("Pek planning_artifacts til docs/ i team-config").
- Product brief (`docs/product-brief.md`) ble **ikke** endret — modellnavn og priser står som brukeren bekreftet dem.

### Åpne punkter
- PRD (`bmad-prd`) er neste påkrevde skill i BMad-flyten — ikke startet.
- Brukerens opplysning om "Claude Haiku 5.5" (modell-ID `claude-haiku-5-5`, lansert 7. oktober 2026, $0,10/$0,50 per million tokens for prompter opp til 100 000 tokens) er nyere enn assistentens kunnskapsgrense og ikke verifisert mot en ekstern kilde i denne økten. Brukeren har bedt om at den ikke endres, så den står slik i briefen — men verdt å dobbeltsjekke mot Anthropics prisside før PRD/arkitektur bygger videre på kostnadsanslaget.
- Overveid, men ikke gjort: UX-dokumentasjon (`bmad-ux`) og prosjektkontekst (`bmad-project-context`) ble foreslått som valgfrie neste steg, men ingen av dem er startet.
