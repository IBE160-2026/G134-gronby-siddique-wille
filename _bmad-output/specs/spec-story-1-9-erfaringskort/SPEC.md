---
id: SPEC-story-1-9-erfaringskort
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
sources:
  - ../../../docs/epics.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.9: Erfaringskort, R-H-R-brikker og «fanget»-logikk

## Why

Studenten ser ingen visuell fremgang mens hun forteller om erfaringene sine. Uten erfaringskortene i sidepanelet er samtaleflaten én mørk chat-kolonne uten tilbakemelding på hva systemet har plukket opp. Denne storyen gir samtaleflaten et levende sidepanel — erfaringene materialiseres som kort med R-H-R-brikker i det de nevnes — og kjernen et klart begrep om hva «fanget» betyr.

## Capabilities

- **CAP-1**
  - **intent:** Kjernen kan avgjøre om en erfaring er fanget uten nettverkskall eller tilstandsmutasjon.
  - **success:** `erFanget(erfaring)` i `src/kjerne/fanget.ts` returnerer `true` bare når alle tre felt (rolle, handling, resultat) har ikke-tom tekst (`trim() !== ""`) og minst én kilde (`kilder.length > 0`). Vitest-tester i `tests/kjerne/fanget.test.ts` bekrefter alle kombinasjoner.

- **CAP-2**
  - **intent:** Reduceren kan anvende en liste med `Endring[]` fra `/api/samtale` på øktens erfaringer i ett atomisk steg.
  - **success:** Handlingen `brukEndringer` lagt til i `src/klient/okt/reducer.ts`. To-pass: pass 1 samler alle `opprett`-endrers midlertidige ref (`{ ny: "n1" }`) og tildeler E-ID via `nesteId`; pass 2 anvender `settTekst` (kun felt der `rettetAvStudent: false`) og `leggTilKilde`. Handlingen har versjonsjekk identisk med `leggTilSporsmal`. Endringer med erfaringId i `slettedeErfaringer` ignoreres stille.

- **CAP-3**
  - **intent:** Samtale-flaten viser ett erfaringskort per erfaring i sidepanelet.
  - **success:** `Erfaringskort`-komponenten i `src/klient/samtale/erfaringskort.tsx` viser tittel og tre `RHRBrikke`-komponenter. Sidepanelet (`src/klient/samtale/sidepanel.tsx`) holder kortene og viser plassholder-tekst «Erfaringene dine dukker opp her.» når det er tomt. Utviklingssiden `/utvikling/samtale` oppdateres med hardkodet eksempeldata (én erfaring delvis fylt, én fanget) for å verifisere visuelt.

- **CAP-4**
  - **intent:** Studenten kan inspisere R-H-R-feltenes innhold ved å klikke eller `Enter` på en brikke.
  - **success:** `RHRBrikke`-komponenten i `src/klient/samtale/rhrbrikke.tsx` har tre visuelle tilstander: tom (muted, stiplet kant), fylt (covered-bakgrunn, hake), og puls ved overgang tom→fylt (600 ms `animate-pulse`). Klikk eller `Enter` åpner en shadcn `Popover` med brikkenavnet, R-H-R-feltteksten og kursiv-sitat-blokker for hver kildetekst fra loggen. Tom brikke kan fremdeles klikkes, men Popover-innholdet viser «Ikke fylt ennå».

## Constraints

- `src/kjerne/regler.ts` endres ikke; Thea jobber der i story 1.10 og 3.2 parallelt.
- `brukEndringer` overskrives aldri felt med `rettetAvStudent: true` (AD-13).
- `erFanget()` er en ren funksjon: ingen I/O, ingen import av `klient`-kode (AD-7).
- `brukEndringer`-handling forkastes dersom `handling.versjon !== okt.versjon` (AD-14).
- Erfaringskort og RHRBrikke bruker bare `useOkt()` for lesing; aldri `useOktDispatch()` fra disse komponentene (dispatch er sidepanelets ansvar).
- Popover installeres via shadcn CLI (`npx shadcn@latest add popover`), ikke bygges manuelt.
- Sidepanelet i `/utvikling/samtale` er kun utviklingsside med hardkodet data; det kobles ikke mot den ekte reduceren i denne storyen.

## Non-goals

- API-kall mot `/api/samtale` og dispatch av `brukEndringer` fra nettverkssvar (story 1.8).
- Fremdriftsmåler og «Gå videre til oppsummering»-knapp (story 1.11).
- Responsivt oppsett for `md`/`<md` skjermstørrelser (story 1.17).
- Sletting av erfaringskort (story 1.12).
- `kanTrykkeFerdig()`, `kanGaVidere()`, `erLukket()` (story 1.10/1.11).

## Success signal

`npm test` kjører `tests/kjerne/fanget.test.ts` uten feil og uten API-nøkkel. `/utvikling/samtale` viser sidepanel med ett delvis og ett fullstendig kort, og klikk på en fylt brikke åpner Popover med kildetekst.

## Assumptions

- shadcn `Popover` har ikke breaking changes i den installerte shadcn-versjonen (4.23.0).
- `tw-animate-css` som allerede er importert i `globals.css` leverer `animate-pulse` via Tailwind-klassen.

## Review Findings

### Defer

- [x] [Review][Defer] `RHRBrikke` og `Erfaringskort` mangler Vitest-tester [`src/klient/samtale/rhrbrikke.tsx`, `src/klient/samtale/erfaringskort.tsx`] — deferred: spec-suksesssignalet krever bare `fanget.test.ts`; UI-komponentene verifiseres visuelt via `/utvikling/samtale`.

### Rejected

- `false` — `erFanget()` ikke brukt i produksjonskode: eksplisitt non-goal (story 1.8 kobler mot API).
- `false` — Komponenter bruker props i stedet for `useOkt()`: constraints ånd er oppfylt (bare lesing, ingen dispatch); props er arkitektonisk bedre for dev-preview.
- `low` — Liste-semantikk (`<ul>`/`<li>`) mangler i `Sidepanel`: strukturell endring utenfor scope; nav-sannsynlighet lav.
- `low` — Redundant `max-w-72` i `PopoverContent`-kallet: rent kosmetisk, ingen funksjonell effekt.
- `low` — Tomt `endringer`-array lager nytt tilstandsobjekt: identisk med `leggTilSporsmal`-mønsteret.
- `low` — Dupliserte `ny`-refs i samme batch kan orphane erfaringer: modellens ansvar, ingen brukersti.
- `false` — `max-w-chat-max` fjernet fra chat-kolonne: bevisst for to-kolonners oppsett; `flex-1` tar over breddekontrollen.
