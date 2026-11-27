---
id: SPEC-1-12-oppsummering
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - ../../implementation-artifacts/epic-1-context.md
  - ../spec-1-11-fremdrift/SPEC.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.12: Oppsummeringsside med retting av erfaringer

## Why

Studenten skal se erfaringene systemet har fanget, og kunne rette dem før kravuttrekket (FR-3). Rettet tekst brukes til kobling og eksport, men sitatene kommer alltid fra samtaleloggen, slik at bevisene forblir sporbare (AD-8). Har studenten trykket «Ferdig» med færre enn 3 fangede erfaringer, skal hen få vite det og kunne velge selv. Med 0 fangede kan hen ikke gå videre. «Ferdig» og «Gå videre til oppsummering» fra 1.11 sender allerede hit.

## Capabilities

- **CAP-1** Oversikt
  - **intent:** Oppsummering viser alle fangede erfaringer med tittel og rolle, handling og resultat.
  - **success:** Med ≥ 3 fangede vises hver fangede erfaring (`erFanget`) som et eget kort i øktens rekkefølge. Delvis fangede vises ikke.
- **CAP-2** Inline retting
  - **intent:** Studenten kan redigere tittel og R-H-R-tekst direkte, og endringen lagres når feltet forlates.
  - **success:**
    - Blur med tekst som faktisk er endret, gir én `leggTilRettelse`, som lager en `R…`-oppføring og setter `rettetAvStudent`.
    - Blur uten endring, eller med bare mellomrom og linjeskift endret, gir ingen dispatch.
    - Tom tekst lagres ikke, og feltet får tilbake forrige tekst. `Esc` angrer utkastet, og `Enter` lagrer tittelen.
    - Kildene (svar-ID-er) endres ikke, så rettet tekst blir aldri et sitat (AD-8).
- **CAP-3** Sletting
  - **intent:** Studenten kan slette en erfaring.
  - **success:** «Slett» har erfaringens tittel i det tilgjengelige navnet og gir `slettErfaring`. Kortet forsvinner, slettingen kunngjøres i en statusregion, og fokus flyttes til overskriften.
- **CAP-4** Notis og tom tilstand
  - **intent:** Med færre enn 3 fangede får studenten vite det. Med 0 fangede forklarer siden hvorfor studenten ikke kan gå videre.
  - **success:**
    - 1 fanget: `Alert` «Du har fanget 1 erfaring. Du kan fortsette samtalen eller gå videre med det du har.»
    - 2 fangede: samme tekst med «2 erfaringer».
    - 0 fangede: tom tilstand «Vi har ikke fått nok til å fange en erfaring ennå.» med en forklaring.
    - ≥ 3 fangede: ingen notis.
- **CAP-5** Valg videre
  - **intent:** «Fortsett samtalen» går tilbake til Samtale, og «Gå videre» går til Annonse når minst én erfaring er fanget.
  - **success:** Med 0 fangede er bare «Fortsett samtalen» aktiv. Med ≥ 1 er begge aktive. Klikk gir `router.push("/samtale")` eller `router.push("/annonse")`.

## Constraints

- Ren logikk ligger i `src/kjerne/oppsummering.ts` med Vitest-tester:
  - `rettetTekst(gammel, ny)` trimmer teksten og gir `null` når den er tom eller uendret.
  - `fangedeErfaringer()` gir de fangede erfaringene.
  - `kanGaTilKravuttrekk()` er sann når minst én erfaring er fanget.
  - `oppsummeringsnotis(antall)` gir notisen eller tom tilstand.
- `src/kjerne/regler.ts` endres ikke, den importeres bare.
- Økten endres bare med reducerens `leggTilRettelse` og `slettErfaring`. Det lages ingen nye handlinger.
- Ruten er `src/app/(flyt)/oppsummering/page.tsx` i `Flytskall`. Navigasjonen bruker `useRouter` til `/${steg}` med `Steg`-id-ene `samtale` og `annonse` fra `src/klient/skall/steg.ts`. **Annonse-siden kommer i story 2.1**, så `/annonse` gir 404 til da.
- `samtaleflate.tsx` røres ikke.
- Ingen localStorage, sessionStorage eller cookies.
- WCAG 2.2 AA:
  - Alle felt har synlig etikett: Tittel, Rolle, Handling og Resultat.
  - Alt nås med tastatur, og fokusringen arves fra shadcn.
- Stil:
  - Én kolonne, sentrert, `max-w-column-max`. Overskriften har `type-display-sm`.
  - Kortene følger DESIGN.md `experience-card`. Notisen er shadcn `Alert` i standardvarianten.
  - Feltene har `maxLength` lik `MAKS_TEKST_TEGN`.
- Kode-identifikatorer er uten æøå, og UI-teksten er på norsk med æøå.

## Non-goals

- Annonse-siden (2.1), kobling og eksport (Epic 2 og 3).
- Retting av delvis fangede erfaringer.
- Angre etter sletting, og bekreftelsesdialog.
- `samtaleFortsatt`-nullstilling når studenten går tilbake til samtalen, fordi det ikke finnes noen bevistabell ennå.
- DOM-tester med klikk og blur. Hva som vises, testes med `renderToString`.

## Success signal

- `npm test`, `npm run lint` og `npm run build` går uten feil, og `tests/kjerne/oppsummering.test.ts` dekker kjernefunksjonene.
- På `/oppsummering`:
  - Med 3 fangede vises tre redigerbare kort uten notis.
  - Retting av ett felt og deretter blur gir én `R`-oppføring og «Rettet av deg». En ny blur uten endring gir ingenting.
  - Med 2 fangede vises notisen. Med 0 vises tom tilstand, og «Gå videre» er deaktivert.
  - Stegindikatoren viser Samtale som fullført og klikkbar.

## Assumptions

- Notisen og tom tilstand avgjøres av antall fangede, ikke av om studenten kom via «Ferdig» eller «Gå videre».
- Avvik fra epics.md er rettet:
  - AC 3 gir «Du har fanget N erfaringer» også for N = 0, men AC 4 og EXPERIENCE.md gir en egen tom tilstand. Notisen gjelder derfor 1–2.
  - N = 1 gir «1 erfaring», fordi «1 erfaringer» er ugrammatisk.
- «Gå videre» fra Oppsummering krever ≥ 1 fanget (EXPERIENCE.md), ikke `kanGaVidere()` (≥ 3), som gjelder å tilby overgangen fra Samtale.
- Feltene er alltid redigerbare tekstfelt med synlig kant. Det finnes ingen egen redigeringsmodus, og et klikk i feltet starter redigeringen.
- Ved 1–2 fangede er begge valgene like tydelige (EXPERIENCE.md), og begge er standardknapper. Ved ≥ 3 er «Gå videre» primær. Ved 0 er «Fortsett samtalen» primær.
- Sletting skjer uten bekreftelse. Den kunngjøres, og fokus flyttes.
- Stegindikatoren viser steg før det aktive som fullført (lineær flyt). En ren hjelper i `steg.ts` brukes av `Flytskall`.
