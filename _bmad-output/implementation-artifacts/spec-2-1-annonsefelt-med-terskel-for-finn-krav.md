# Spec: Story 2.1, Annonsefelt med terskel for «Finn krav»

Kilde: `docs/epics.md` (Story 2.1), FR-4, UX-DR9, AD-14, AD-16 og EXPERIENCE.md (Annonsefelt).

## Beslutninger

- **`MAKS_ANNONSE_TEGN` er 6000.** Koden hadde 20000 fra story 1.4, men epics.md sier 6000. Thea valgte 6000 (Victoria ba om en avklaring i PR #11). Skjemaet `KravForesporsel` bruker konstanten, så serveren og feltet har samme grense. Testene bruker konstanten og én test låser verdien.
- **Lengderegel i kjernen** (`src/kjerne/annonse.ts`, `annonsetilstand`): minst `MIN_ANNONSE_TEGN` tegn etter trim, høyst `MAKS_ANNONSE_TEGN` på hele teksten. Maksgrensen regnes på hele strengen fordi det er den som sendes og valideres. Over grensen vinner «for lang».
- **Teksten avkortes ikke.** Feltet har ingen `maxLength`, så en for lang annonse som limes inn blir stående, «Finn krav» er deaktivert og meldingen «Annonsen er for lang. Maks 6000 tegn.» vises.
- **Utkastet lever lokalt** i `Annonsesteg`. `settAnnonse` lagrer teksten først ved «Finn krav», fordi reduceren øker `versjon` og tømmer krav og bevistabell ved endret tekst (AD-14). Per tastetrykk ville gitt ny versjon hele tiden.
- **Forespørselen** bygges av `lagKravForesporsel(okt)` (`src/klient/annonse/api.ts`), med `modus`, `versjon` og `annonse`. Selve kallet til `/api/krav` hører til story 2.2/2.3.
- **«Finn krav» sender til `/krav`.** Den siden finnes ikke før story 2.3, så den gir 404 til da. Forventet.

## Ikke med

- Låst annonsefelt og forhåndsutfylt testannonse i demomodus (story 2.4).
- Selve kravuttrekket og kravlisten (2.2, 2.3).

## Filer

- `src/kjerne/regler.ts` (grensen), `src/kjerne/annonse.ts`
- `src/klient/annonse/` (`annonseflate.tsx`, `annonsesteg.tsx`, `api.ts`, `tekster.ts`)
- `src/app/(flyt)/annonse/page.tsx`
- `tests/kjerne/annonse.test.ts`, `tests/klient/annonse/`

## Resultat

377 tester, `eslint` og `tsc` (etter `next typegen`) grønne. Bevisst feil i maksgrensen (`>` til `>=`) fikk to tester til å feile.
