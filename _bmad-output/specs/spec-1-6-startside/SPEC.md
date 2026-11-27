---
id: SPEC-1-6-startside
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - ../../implementation-artifacts/epic-1-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability – consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.6: Startside med personvernstekst og øktstart

## Why

Krav (FR-1, FR-10, NFR1, AD-17): før studenten skriver noe, skal hen forstå hva som skjer med svarene, og bekrefte det. Start er det første møtet med appen (EXPERIENCE: «Første møte»), og sensor uten API-nøkkel må kunne gå rett til demomodus. Start-siden i PR #8 (story 1.8) er midlertidig. Denne storyen erstatter den og beholder kontrakten mot Samtale.

## Capabilities

- **CAP-1** Innhold på Start
  - **intent:** Start viser `display`-teksten «Du har sannsynligvis mer erfaring enn du tror.», én forklarende setning og personvernteksten ordrett fra EXPERIENCE.md (Fast mikrotekst).
  - **success:** Tekstene rendres ordrett. Overskriften er sidens eneste `h1`, og ingen annen tekst på siden lover noe om lagring eller sletting.
- **CAP-2** Avkrysning
  - **intent:** En avkrysningsboks merket «Jeg har lest dette og vil starte.» kan brukes med mus og tastatur.
  - **success:** Etiketten er koblet til boksen. Klikk på teksten og `Space` krysser av, og avkrysningen styrer bare «Start ny økt».
- **CAP-3** Start ny økt
  - **intent:** «Start ny økt» er aktiv bare når boksen er krysset av og `GET /api/status` gir `harNokkel: true`. Trykk gir en ny, tom økt i modus `ekte` og sender studenten til `/samtale`.
  - **success:** Den rene funksjonen gir deaktivert for alle kombinasjoner unntatt avkrysset + nøkkel. Trykk dispatcher `startOkt` med `modus: "ekte"` og kaller `router.push("/samtale")`.
- **CAP-4** Prøv demomodus
  - **intent:** «Prøv demomodus» er aktiv når `harDemodata: true`, uavhengig av avkrysningen. Trykk gir en ny, tom økt i modus `demo` og sender studenten til `/samtale`.
  - **success:** Den rene funksjonen gir aktiv demo uten avkrysning når `harDemodata` er sann, og deaktivert ellers.
- **CAP-5** Statusmeldinger
  - **intent:** Uten nøkkel vises «Ingen API-nøkkel funnet. Se README, eller prøv demomodus.». Uten demodata vises «Demodata mangler. Se README.».
  - **success:** Meldingene vises bare i disse tilfellene og er koblet til sin knapp med `aria-describedby`.

## Constraints

- Status hentes fra `GET /api/status` (story 1.4) og valideres med `StatusSvar` fra `kjerne/skjema`. Klienten importerer ikke `server` og ikke `zod` direkte (eslint-grensene).
- Kontrakten mot 1.8 beholdes: `dispatch({ type: "startOkt", modus })` og `router.push("/samtale")`.
- `nyOkt` dispatches alltid før `startOkt`. `startOkt` ignoreres når modus er satt, og en økt uten modus kan likevel ha innhold, men AC krever en ny, tom økt. Versjonen øker, så svar på forespørsler fra en eldre økt forkastes.
- Mens status lastes, er begge knappene deaktivert, og ingen statusmelding vises. Feiler kallet eller er svaret ugyldig, behandles det som `harNokkel: false` og `harDemodata: false`, så ingen knapp lover noe serveren ikke kan levere.
- Tekstene står som konstanter i `src/klient/start/tekster.ts`. `src/kjerne/regler.ts` røres ikke.
- Ingen `localStorage`, `sessionStorage`, IndexedDB eller cookies. Avkrysningen lever bare i komponenttilstand.
- WCAG 2.2 AA: én `h1`, etikett koblet til avkrysningen, statusmeldinger koblet med `aria-describedby` og kunngjort i en `aria-live`-region, alt kan nås med tastatur, fokusringen kommer fra shadcn, og DOM-rekkefølgen er lik leserekkefølgen. Deaktiverte knapper kan få fokus (`focusableWhenDisabled`), så forklaringen leses opp.
- Visuelt: én kolonne, sentrert, maks `column-max`. Overskriften har `type-display`. «Start ny økt» er primærknapp, «Prøv demomodus» er `outline`. Start har ingen stegindikator, fordi skallet gjelder flatene etter Start.
- Avkrysningen er shadcn `Checkbox`, lagt til med shadcn-CLI og brukt uendret. Kan CLI-en ikke hentes, brukes native `<input type="checkbox">`.
- Visningen `Startflate` er ren (props: status, avkrysset og hendelser). `src/app/page.tsx` henter status, eier avkrysningen og dispatcher.

## Non-goals

- Stegindikator og skall på Start.
- Demobanner og demoflyt etter start (story 1.13).
- «Ny økt»-dialog (story 1.14).
- Responsivt oppsett utover én kolonne (story 1.17).
- Endringer i README.
- DOM-test av dispatch gjennom `OktProvider` (krever jsdom og står som åpent punkt).

## Success signal

- `npm test`, `npm run lint` og `npm run build` er grønne. Vitest dekker deaktiveringstabellen for alle kombinasjoner av lasting, nøkkel, demodata og avkrysning, statusparsing handlingsrekkefølgen (`nyOkt` før `startOkt`) og knappenes hendelser, og en `renderToString`-test viser tekstene ordrett. I dev-serveren kan Start brukes med bare tastatur.

## Assumptions

- `/samtale` finnes først når 1.8 (PR #8) er merget. Før det gir navigeringen 404, og det godtas.
- Forklarende setning: «Du svarer på noen åpne spørsmål om det du har gjort, og Erfaringsgruven kobler svarene dine til kravene i en stillingsannonse.»
