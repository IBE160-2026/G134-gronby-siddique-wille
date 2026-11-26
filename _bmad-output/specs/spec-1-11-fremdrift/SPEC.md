---
id: SPEC-1-11-fremdrift
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - ../../implementation-artifacts/epic-1-context.md
  - ../spec-1-10-terskelregler/SPEC.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.11: Fremdriftsmåler og «Ferdig»-knapp

## Why

Studenten skal se hvor mange erfaringer som er fanget, og ha en tydelig vei videre til Oppsummering. Verktøyet tilbyr overgangen ved 3 fangede erfaringer, men gjør den aldri automatisk (FR-3, UX-DR7, UX-DR8). Fremdriften skal også kunngjøres for skjermleser (NFR5, WCAG 2.2 AA). Story 1.10 har laget reglene (`kanGaVidere()`, `kanTrykkeFerdig()`, `MAAL_ERFARINGER`), og 1.8 har en «Ferdig»-knapp som ikke gjør noe ennå. Oppsummering (1.12) og sidepanelet (1.9, PR #7) lages parallelt.

## Capabilities

- **CAP-1** Fremdriftstekst
  - **intent:** En ren funksjon gir teksten og antall fylte segmenter for et gitt antall fangede erfaringer.
  - **success:** `fremdriftTekst(n)` i `src/kjerne/fremdrift.ts` gir «0 av 3 erfaringer fanget», «1 av 3 …», «2 av 3 …», «3 av 3 …» og «N erfaringer fanget» for N > 3. `fylteSegmenter(n)` er `min(n, 3)`. Negative tall gir 0, og desimaltall rundes ned. Vitest-tester dekker 0, 1, 2, 3, 4 og 8.
- **CAP-2** Fremdriftsmåler
  - **intent:** Samtaleflaten viser tre segmenter og teksten, er full ved N ≥ 3 og kunngjør ny verdi som tekst når antallet endres.
  - **success:** Segmentene er `aria-hidden`. Teksten står i et `role="status"`-element (polite), som er mountet fra start, så første visning ikke leses opp, men en endring gjør det. Ved N ≥ 3 er alle tre segmentene fylt.
- **CAP-3** «Gå videre til oppsummering»
  - **intent:** Når `kanGaVidere()` er sann, tilbys en knapp til Oppsummering. Overgangen skjer bare når studenten trykker.
  - **success:** Knappen finnes ikke ved N < 3 og finnes ved N ≥ 3. Klikk gir `router.push("/oppsummering")`. Uten klikk skjer ingen navigasjon.
- **CAP-4** «Ferdig»
  - **intent:** «Ferdig» er alltid synlig, aktiv når `kanTrykkeFerdig()` er sann, og sender til Oppsummering uansett antall fangede.
  - **success:** Knappen er deaktivert før første spørsmål og aktiv etterpå. Klikk gir `router.push("/oppsummering")` med 0, 1–2 og ≥ 3 fangede.

## Constraints

- Antallet regnes med `antallFangede()` fra `src/kjerne/fanget.ts`. Terskelen og «Ferdig» bruker `kanGaVidere()`, `MAAL_ERFARINGER` og `kanTrykkeFerdig()` fra `src/kjerne/regler.ts`. `regler.ts` endres ikke, den importeres bare.
- `samtaleflate.tsx` endres bare ved montering: den gamle «Ferdig»-blokken fra 1.8 erstattes av `<Samtalehandlinger />`, som én hunk. PR #7 (1.9) endrer samme fil.
- Logikk og UI ligger i nye filer: `src/kjerne/fremdrift.ts` (ren), `src/klient/samtale/fremdriftsmaler.tsx` (presentasjon, tar `antall`) og `src/klient/samtale/samtalehandlinger.tsx` (leser `useOkt()`, navigerer).
- Navigasjon med `useRouter` fra `next/navigation` til `/${steg}` med `Steg`-id-en `oppsummering` fra `src/klient/skall/steg.ts`, samme mønster som `Flytskall`. Siden selv bygges ikke (1.12), så ruten gir 404 inntil da.
- Komponentene dispatcher ingenting og bruker ikke localStorage, sessionStorage eller cookies.
- Alt nås med tastatur: begge handlingene er shadcn `Button`, og fokusringen arves. DOM-rekkefølgen er chatinput → måler → «Gå videre til oppsummering» → «Ferdig».
- Stil fra DESIGN.md `progress-meter`: spor `bg-muted`, fyll `bg-primary`, `rounded-full`. Grønt brukes bare for fremdrift. «Gå videre til oppsummering» er `Button` (primær), og «Ferdig» er `variant="outline"` som før.
- Kode-identifikatorer er uten æøå, og UI-teksten er på norsk med æøå.

## Non-goals

- Oppsummering-siden og notisene for 0 og 1–2 fangede (1.12).
- Å markere Samtale som fullført i stegindikatoren (1.12).
- Å flytte måleren til sidepanelet eller til `md`-stripen «2 av 3 · Vis erfaringer» (1.9, 1.17).
- Demomodusens «Neste» → «Gå videre til oppsummering» (1.13).
- DOM-tester for komponentene, fordi repoet ikke har jsdom-oppsett.

## Success signal

- `npm test`, `npm run lint` og `npm run build` går uten feil, og `tests/kjerne/fremdrift.test.ts` dekker CAP-1. På `/samtale` viser måleren «0 av 3 erfaringer fanget» ved start. «Ferdig» blir aktiv etter åpningsspørsmålet og sender til `/oppsummering`. «Gå videre til oppsummering» dukker opp først ved 3 fangede.

## Assumptions

- Måleren står i en rad under chatinput (måler til venstre, knapper til høyre), ikke i sidepanelet som i mockupen, fordi sidepanelet ligger i PR #7. Den kan flyttes når 1.9 er merget.
- epics.md AC 1 sier «full ved N>3», men UX-DR7 og EXPERIENCE.md («Måleren viser 3 av 3») gir full måler ved N ≥ 3. Spec-en følger N ≥ 3, og teksten «N erfaringer fanget» brukes først ved N > 3.
