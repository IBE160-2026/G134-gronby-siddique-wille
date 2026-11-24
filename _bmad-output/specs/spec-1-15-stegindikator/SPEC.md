---
id: SPEC-1-15-stegindikator
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - ../../implementation-artifacts/epic-1-context.md
  - ../spec-1-7-samtale-ui/SPEC.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.15: Stegindikator-skall og tilgjengelighet for samtaleflaten

## Why

Studenten skal alltid se hvilket steg i den lineære flyten som er aktivt, og kunne gå tilbake, og verktøyet skal fungere med tastatur og skjermleser (UX-DR15, UX-DR21, NFR5: WCAG 2.2 AA). Story 1.7 lot ett tilgjengelighetsspørsmål stå åpent: hele chatloggen var én live-region, så studentens egen melding ble lest opp. Øktreduceren og rutene (story 1.3–1.5, 1.8) lages parallelt, så skallet må kunne bygges og prøves nå og kobles på senere uten å endres.

## Capabilities

- **CAP-1** Stegindikator
  - **intent:** Alle fem steg (Samtale → Oppsummering → Annonse → Krav → Bevistabell) vises nummerert med tilstanden aktivt, fullført eller kommende. Fullførte steg kan klikkes for å gå tilbake, kommende kan ikke.
  - **success:** Aktivt steg har `covered`-fyll, halvfet tekst og `aria-current="step"`. Fullført steg er en knapp i `primary`-tekst, understreket, som kaller `onVelg(steg)`. Kommende steg har `muted-foreground`-tekst og er verken knapp eller fokuserbart. Tilstanden står også som tekst for skjermleser.
- **CAP-2** Toppfelt-skall
  - **intent:** Alle flater etter Start har et toppfelt med «Erfaringsgruven» til venstre, stegindikatoren og «Ny økt» til høyre, over flatens innhold.
  - **success:** `<header>` med logo, `<nav aria-label="Steg">` og shadcn `Button variant="outline"` «Ny økt» som kaller `onNyOkt`. Innholdet ligger i `<main>`, og DOM-rekkefølgen er lik den visuelle rekkefølgen.
- **CAP-3** Kunngjøring av nye assistentsvar
  - **intent:** Et nytt assistentsvar og skriveindikatoren leses opp av skjermleseren i en `aria-live="polite"`-region, uten at studentens egen melding leses opp på nytt.
  - **success:** Når en assistentmelding legges til, kommer teksten (med «Erfaringsgruven:») i live-regionen. Når en studentmelding legges til, endres regionen ikke. Meldinger som finnes ved første visning, kunngjøres ikke.
- **CAP-4** Tastaturnavigering på Samtale-flaten
  - **intent:** Alle handlinger på Samtale-flaten nås med `Tab` i leserekkefølge, med fokusring arvet fra shadcn.
  - **success:** `Tab` går fullførte steg → «Ny økt» → chatloggen → skrivefeltet → Send, og hver har synlig fokusring. Ingen handling krever mus. Fokus faller ikke til `<body>` når et fullført steg klikkes og blir aktivt.

## Constraints

- Komponentene importerer ingenting fra `klient/okt`, `kjerne` eller `server`. Data og hendelser kommer som props, så 1.3, 1.8 og 1.14 kan koble dem til uten å endre dem.
- `Stegindikator` tar `aktivt: Steg`, `fullforte: readonly Steg[]` og `onVelg(steg)`. Reduceren avgjør hvilke steg som er fullført. Et steg som er både aktivt og fullført, vises som aktivt. Komponenten vet ikke om steg er ruter eller tilstand.
- `Steg` og rekkefølgen (`STEG`: id og navn) ligger i `src/klient/skall/steg.ts`, med id-ene `samtale | oppsummering | annonse | krav | bevistabell`. Reduceren kan importere typen eller mappe sin egen.
- Listen er `<nav aria-label="Steg"><ol>`. Fullført steg er en `<button>`, ikke en lenke, fordi å gå tilbake er en endring i økten. Aktivt og kommende steg er `<span>`. Det finnes ingen fri navigasjon og ingen sidemeny (EXPERIENCE.md).
- Skjermlesertekst per steg: aktivt via `aria-current="step"`, fullført «(fullført)», kommende «(kommende)». Aktivt og fullført skilles også visuelt med fyll og understreking, ikke bare med farge (WCAG 1.4.1).
- Når et fullført steg klikkes og blir aktivt, forsvinner knappen. Fokus flyttes da til det aktive steget (`tabIndex={-1}`). Valget tømmes etter hver render, så et valg forelderen ikke fulgte opp, ikke tar fokus senere.
- `Appskall` gir `<header>` og `<main>` uten egen beholder. Forelderen er en `flex flex-col`-beholder, med fast høyde når flaten ruller internt. Skallet ligger i en felles layout over stegbyttene. Ellers remountes det, og fokus etter stegvalg går tapt.
- Stil fra DESIGN.md `step-indicator`: aktivt `bg-covered text-covered-foreground font-semibold`, fullført `text-primary underline`, kommende `text-muted-foreground`, piller med `rounded-full`. Toppfeltet har `border-bottom` som i mockupen.
- «Ny økt» kaller bare `onNyOkt`. Bekreftelsen i `Dialog` hører til story 1.14.
- Live-region (avgjør spørsmålet fra 1.7): `Chatlogg` har en egen skjult `aria-live="polite"`-region som viser skriveindikatoren eller assistentmeldingene som er nye siden forrige render. Den tømmes når `venter` blir sann, så et feilet kall ikke leser opp forrige svar igjen, og den endres ikke når en studentmelding legges til. Meldinger som finnes ved mount, kunngjøres ikke, så forelderen mounter `Chatlogg` før åpningsspørsmålet kommer. Rullelisten selv er ikke live (`role="region"`, `aria-label="Samtale"`). `role="log"` er live i seg selv og brukes derfor ikke. Kunngjøringen rendres med `key` lik meldings-ID, så to like tekster etter hverandre også leses opp.
- Fokusringer arves fra shadcn (`focus-visible:ring-3 ring-ring/50`) og endres ikke. At `--ring` har for lav kontrast, er et åpent punkt som gruppen bestemmer (deferred-work.md, 1.16).
- `lang="nb"` står allerede på `<html>` i `src/app/layout.tsx` og skal bli der.

## Non-goals

- Kobling til reducer, Context og ruter (story 1.3 og 1.8).
- Dialogen for «Ny økt» og `beforeunload` (1.14). Demobanner (1.13).
- Sidepanel, erfaringskort og fremdriftsmåler (1.9, 1.11). Responsivt oppsett (1.17).
- Fokus til markert svar i «Vis i samtalen» (UX-DR21), som hører til bevistabellen.
- Endring av `--ring` og overskrifter på flatene.
- Automatiske tester, siden Vitest kommer i en senere story.

## Success signal

- `npm run build` og `npm run lint` går uten feil. På `/utvikling/samtale` vises Samtale-flaten i skallet. Med `?steg=krav` er tre steg fullført og klikkbare, Krav er aktivt og Bevistabell er kommende. Med bare tastatur når studenten alle handlinger i rekkefølge med synlig fokusring. Et nytt assistentsvar havner i live-regionen, og studentens melding gjør det ikke.

## Assumptions

- Utviklingssiden `/utvikling/samtale` viser Samtale-flaten i skallet. Steg-tilstanden velges med `?steg=<id>`, og alle tidligere steg er da fullført. Klikk på et fullført steg gjør det aktivt. «Ny økt» viser bare at handlingen ble kalt.
