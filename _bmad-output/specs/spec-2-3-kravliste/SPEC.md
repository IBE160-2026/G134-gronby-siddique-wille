---
id: SPEC-2-3-kravliste
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - ../../implementation-artifacts/epic-1-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 2.3: Kravliste-side

## Why

Studenten skal se kravene som er funnet i annonsen før bevistabellen bygges, slik at hen kan sjekke at annonsen ble lest riktig (FR-4, UX-DR10). «Finn krav» på Annonse (2.1) sender allerede til `/krav`, men siden mangler. Kravene settes i økten av story 2.2 (`/api/krav` og `settKrav`), så siden viser bare det som ligger i `okt.krav`.

## Capabilities

- **CAP-1** Kravliste
  - **intent:** Når kravuttrekket er ferdig, vises kravene som en nummerert, skrivebeskyttet liste.
  - **success:** Hvert krav i `okt.krav` vises én gang, i øktens rekkefølge, i en `<ol>`. Det finnes ingen redigerbare felt.
- **CAP-2** Navigasjon
  - **intent:** «Bygg bevistabell» går videre, og «Tilbake» går til Annonse.
  - **success:**
    - «Bygg bevistabell» vises bare når listen har krav, og gir `router.push("/bevistabell")`.
    - «Tilbake» vises i alle tilstander og gir `router.push("/annonse")`.
    - Begge er knapper som nås med tastatur.
- **CAP-3** Tom liste
  - **intent:** En tom kravliste er et gyldig resultat (AD-9) og forklares rolig.
  - **success:** `krav = []` viser «Vi fant ingen tydelige krav i teksten. Sjekk at du limte inn hele annonsen.» og bare «Tilbake». Ingen liste og ingen «Bygg bevistabell».
- **CAP-4** Før kravene finnes
  - **intent:** Siden viser hva som skjer når `okt.krav` er `null`.
  - **success:**
    - Gyldig annonse: venter-tilstand med `Skeleton`-rader og «Leser annonsen …» i en statusregion.
    - Tom eller ugyldig annonse (f.eks. rett til `/krav`): forklaring på at kravene ikke er funnet ennå, og «Tilbake».
- **CAP-5** Ny uttrekking tømmer den gamle listen (AD-14)
  - **intent:** Endrer studenten annonsen og trykker «Finn krav» igjen, vises ikke de gamle kravene.
  - **success:** En test kjører reducerens `settAnnonse` med endret tekst på en økt med krav og bevistabell, og rendrer siden. Den viser venter-tilstand uten de gamle kravene, og `bevistabell` er `null`. Med samme tekst står listen urørt.

## Constraints

- Ren logikk ligger i `src/kjerne/kravliste.ts` med Vitest-tester: `kravlistetilstand(okt)` gir `ikke-startet`, `venter`, `tom` eller `liste`, og bruker `annonsetilstand()` fra `src/kjerne/annonse.ts`.
- Siden leser bare `okt.krav` og `okt.annonse`. Den kaller ikke `/api/krav` (story 2.2) og dispatcher ingen handlinger. Nullstillingen (AD-14) ligger i reducerens `settAnnonse` og dupliseres ikke.
- Ruten er `src/app/(flyt)/krav/page.tsx` i `Flytskall`, med `metadata.title` «Krav – Erfaringsgruven». Navigasjonen bruker `useRouter` til `/${steg}` med `Steg`-id-ene `annonse` og `bevistabell`. **Bevistabell-siden kommer i Epic 3**, så `/bevistabell` gir 404 til da.
- `src/kjerne/regler.ts` og `samtaleflate.tsx` røres ikke.
- Ingen localStorage, sessionStorage eller cookies med øktinnhold.
- WCAG 2.2 AA:
  - Én `h1`, og listen er en semantisk `<ol>`.
  - Venter-tilstanden kunngjøres i `role="status"`.
  - Alt nås med tastatur, og fokusringen arves fra shadcn. `Skeleton`-animasjonen kjører bare med `motion-safe`.
- Stil:
  - Én kolonne, sentrert, `max-w-column-max`. Overskriften har `type-display-sm`.
  - Kravlisten ligger i et kort (DESIGN.md: «nummerert liste i `Card`»).
- Kode-identifikatorer er uten æøå, og UI-teksten er på norsk med æøå.

## Non-goals

- Kallet til `/api/krav` og feiltilstanden med Toast (2.2).
- Bevistabell-siden (Epic 3).
- Redigering av krav (UX-DR10: ingen redigering i v1).
- Demomodus for kravuttrekk (2.4).
- DOM-tester med klikk. Hva som vises, testes med `renderToString`.

## Success signal

- `npm test`, `npm run lint` og `npm run build` går uten feil, og `tests/kjerne/kravliste.test.ts` dekker alle fire tilstandene.
- På `/krav`:
  - Med seks krav vises en nummerert liste med seks punkter, «Bygg bevistabell» (primær) og «Tilbake».
  - Med `krav = []` vises den rolige forklaringen og bare «Tilbake».
  - Etter at annonsen er endret og «Finn krav» trykket på nytt, er de gamle kravene borte.
  - Stegindikatoren viser Samtale, Oppsummering og Annonse som fullført og klikkbar.

## Assumptions

- Avvik rettet: EXPERIENCE.md sier at studenten «sendes tilbake til Annonse» ved tom liste. Siden viser i stedet forklaringen og «Tilbake» som primærknapp, uten automatisk omdirigering, slik at teksten rekker å bli lest.
- `okt` har ingen forespørselsstatus. `krav = null` skilles derfor i venter (gyldig annonse) og ikke-startet (tom eller ugyldig annonse) ut fra `annonsetilstand`.
- Story 2.2 sender `/api/krav` og dispatcher `settKrav` mens studenten står på `/krav`. Uten 2.2 blir venter-tilstanden stående.
- Prosjektet har ingen shadcn `Card` eller `Skeleton`. Kortet og radene lages med Tailwind-klasser som på Oppsummering.
- Ikke-startet-tilstanden har ingen ordlyd i EXPERIENCE.md. Siden bruker «Vi har ikke funnet krav ennå. Lim inn stillingsannonsen og trykk «Finn krav».», som UX kan endre.
- Med krav er «Bygg bevistabell» primær og «Tilbake» outline. Ellers er «Tilbake» eneste og primære knapp.
