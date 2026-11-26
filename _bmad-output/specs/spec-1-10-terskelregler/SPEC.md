---
id: SPEC-1-10-terskelregler
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - ../../implementation-artifacts/epic-1-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.10: Terskelregler for oppfølgingsspørsmål

## Why

Gruppen har bestemt at systemet stiller maks tre oppfølgingsspørsmål per erfaring (PRD FR-2, Å.s. 1). En student som ikke har mer å si om en erfaring, skal ikke bli sittende fast i den. Samtalen skal gå videre til en ny erfaring. Modellen kan ikke stoles på å telle, så grensen må håndheves i kjernen og i `/api/samtale` før svaret forlater serveren (AD-16). Samtidig må tersklene som UI og ruter deler (`MAAL_ERFARINGER`, `MIN_ANNONSE_TEGN`, `STANDARD_REFLEKSJON`), ligge ett sted, så 1.11, 2.1 og Epic 3 kan bruke dem uten å endre `regler.ts`.

## Capabilities

- **CAP-1** Terskelkonstanter
  - **intent:** `kjerne/regler.ts` eksporterer `MAAL_ERFARINGER = 3`, `MAKS_OPPFOLGING_PER_ERFARING = 3`, `MIN_ANNONSE_TEGN = 200`, `OVERGANGSSPORSMAL` og `STANDARD_REFLEKSJON`.
  - **success:** Tester bekrefter verdiene, at tekstene er ordrett fra EXPERIENCE.md, og at de er innenfor `MAKS_TEKST_TEGN`.
- **CAP-2** `erLukket()`
  - **intent:** En erfaring er lukket når loggen har `MAKS_OPPFOLGING_PER_ERFARING` `sporsmal` med `gjelder` lik erfaringens ID. Spørsmål med `gjelder: null` eller en annen ID teller ikke.
  - **success:** 2 oppfølgingsspørsmål gir usann, 3 og 4 gir sann. Spørsmål med `null` eller en annen ID endrer ikke tellingen.
- **CAP-3** `kanGaVidere()`
  - **intent:** Sann når antallet fangede erfaringer (AD-7, `antallFangede`) er minst `MAAL_ERFARINGER`.
  - **success:** 2 fangede og 1 ufanget gir usann, 3 fangede gir sann. En lukket erfaring som mangler et felt, teller ikke.
- **CAP-4** Overgang i `/api/samtale`
  - **intent:** Når modellens `sporsmal.gjelder` er en lukket erfaring, byttes spørsmålet ut med `OVERGANGSSPORSMAL` og `gjelder: null` før svaret forlater serveren. Endringene i svaret beholdes.
  - **success:** En rutetest med 3 oppfølgingsspørsmål om `E1` og et modellsvar med `gjelder: "E1"` gir `{ tekst: OVERGANGSSPORSMAL, gjelder: null }` og de samme endringene. Med 2 oppfølgingsspørsmål går modellens spørsmål uendret gjennom.
- **CAP-5** Lukket påvirker ikke status
  - **intent:** `erLukket()` stopper bare nye spørsmål om erfaringen. `erFanget()` og `antallFangede()` er uendret.
  - **success:** En test med en lukket erfaring som mangler `resultat`, gir `erFanget` usann, og endringer fra modellen kan fortsatt fylle feltene.

## Constraints

- Byttet gjøres i en ren kjernefunksjon, `begrensOppfolging(svar, tilstand)` i `kjerne/endringer.ts`, ved siden av `begrensSamtaleSvar`. Ruten kaller den etter `begrensSamtaleSvar`.
- Bare en `gjelder` som er en `E`-ID, sjekkes. `{ ny }` og `null` er nye erfaringer og kan ikke være lukket.
- Er `MAKS_ERFARINGER` nådd samtidig, byttes spørsmålet med `MAKS_ERFARINGER_SPORSMAL` i stedet, fordi overgangen ber om en ny erfaring som da ikke kan opprettes. `gjelder` er `null` i begge tilfeller.
- Ruten sender `lukkede` (`E`-ID-ene til de aktive lukkede erfaringene) til modellen i meldingen (AD-16), og `prompts/samtale.md` får en regel om ikke å spørre mer om dem. Byttet i kjernen er garantien.
- `erLukket(tilstand, erfaringId)` og `kanGaVidere(tilstand)` tar samme tilstandsform som `kanTrykkeFerdig`/`erMaksNadd`, så UI (1.11) og ruter bruker de samme funksjonene.
- Det som finnes i `regler.ts` fra 1.4 og 1.8, endres ikke. Kjernen er rene funksjoner uten I/O og importerer aldri `app`/`klient`/`server`.
- Feilmodellen i ruten er uendret. Persondata havner aldri i logg eller feilsvar. Eksisterende tester beholdes, og forventet melding til modellen utvides med `lukkede: []`.
- Fagbegreper på norsk uten æøå i koden. UI-tekstene er ordrett fra EXPERIENCE.md.

## Non-goals

- Fremdriftsmåler, «Ferdig» og «Gå videre til oppsummering» i UI (story 1.11).
- Bruk av `MIN_ANNONSE_TEGN` i annonsefeltet (story 2.1) og `STANDARD_REFLEKSJON` i bevistabellen (Epic 3).
- Endringer i `src/klient/` eller i reduceren.
- Demodata for samtalen (story 1.13).

## Success signal

- `npm test`, `npm run lint` og `npm run build` er grønne. Rutetesten viser at et fjerde spørsmål om samme erfaring aldri forlater serveren, men byttes med `OVERGANGSSPORSMAL` og `gjelder: null`.

## Assumptions

- `OVERGANGSSPORSMAL` og `STANDARD_REFLEKSJON` er ordrett fra EXPERIENCE.md, siden UX eier ordlyden.
- Spørsmål om en slettet erfaring sjekkes også mot `erLukket()`. Klientens `losGjelder` gjør dem uansett til `null`.

## Open Questions

- ARCHITECTURE-SPINE definerer `kanGaVidere()` som «minst én fanget erfaring». Denne storyen følger Victorias definisjon (≥ `MAAL_ERFARINGER`, som «Gå videre til oppsummering» i FR-3/UX-DR7). Sperren mot kravuttrekk ved 0 fangede (1.12) trenger da en egen regel. Bør arkitekturen oppdateres?
