---
id: SPEC-story-1-14-ny-okt
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
sources:
  - ../../../docs/epics.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.14: beforeunload-varsel og «Ny økt» med bekreftelse

## Why

Studenten har ingen sikkerhetsnett mot å miste øktinnholdet ved uhell. Et reload, fanelukking eller en feilklikk på «Ny økt» tømmer alt uten varsel. Denne storyen lukker begge hullene: nettleserens `beforeunload`-mekanisme fanger utilsiktet sideavgang, og en bekreftelsesdialog beskytter mot utilsiktet «Ny økt» (AD-3).

## Capabilities

- **CAP-1**
  - **intent:** Nettleseren advarer studenten når hun prøver å forlate siden mens økten har data.
  - **success:** Når `okt.logg` inneholder minst én `svar`-oppføring, er en `beforeunload`-lytter aktiv som setter `event.returnValue = ""`; lytteren fjernes automatisk når loggen tømmes (f.eks. etter «Ny økt»). Avgjørelsen om aktivering delegeres til den rene funksjonen `harGittSvar(okt: Okt): boolean` i `src/kjerne/hargittsvar.ts`. Vitest-tester i `tests/kjerne/` dekker sant/usant.

- **CAP-2**
  - **intent:** Studenten kan starte en ny økt uten å miste data ved et feilklikk.
  - **success:** Klikk på «Ny økt» i `Appskall` åpner en shadcn `AlertDialog` med overskriften «Ny økt» og brødteksten «Alt i denne økten forsvinner.» Dialogen har to knapper: «Avbryt» (lukker dialogen, ingen tilstandsendring) og «Start ny økt» (dispatcher `{ type: "nyOkt" }` og navigerer til `/`). `Esc` avbryter. Fokus settes til dialogen ved åpning og tilbake til «Ny økt»-knappen ved lukking. Dialogen er en egen komponent `NyOktDialog` i `src/klient/skall/`, og den og `useBeforeUnload` kobles inn i `src/klient/skall/flytskall.tsx`.

## Constraints

- Ingen `localStorage`, `sessionStorage` eller informasjonskapsler med øktinnhold (AD-2).
- `beforeunload`-lytteren registreres og fjernes bare via `useEffect` — ingen polling eller global state utenfor React.
- Ingen modaler oppå modaler (EXPERIENCE.md): `NyOktDialog` åpnes ikke hvis en annen dialog allerede er åpen; forelderen har ansvaret for å ikke kalle `onNyOkt` i den tilstanden.
- Fokushandtering følger NFR5: Tab-navigering holder seg inne i dialogen mens den er åpen (`focus trap` arves fra shadcn `Dialog`), Esc lukker, fokus returnerer til «Ny økt»-knappen.
- `harGittSvar()` er en ren funksjon i `src/kjerne/` uten I/O eller import av klientkode (AD-7).
- `src/kjerne/regler.ts` endres ikke.
- `AlertDialog` installeres via shadcn CLI (`npx shadcn@latest add alert-dialog`), ikke bygges manuelt.

## Non-goals

- Angre / undo etter at «Ny økt» er bekreftet.
- Navigasjonsinterception for SPA-navigasjon mellom steg — `beforeunload` gjelder bare faktisk sideavgang (reload/fanelukking).
- Personvernbekreftelse på Start (story 1.6).
- Eksportdialog og «Vis i samtalen»-Sheet (story 1.13 / 1.21).
- Tilpasning av nettleserens eget `beforeunload`-varselvindu — teksten kontrolleres av nettleseren, ikke appen.

## Success signal

`npm test` passerer uten feil og uten API-nøkkel. I nettleseren: etter å ha skrevet ett svar vises nettleserens standardvarsel ved reload. Klikk «Ny økt» → dialog åpnes; Esc lukker; «Start ny økt» tømmer tilstanden og navigerer til Start; Tab-fokus forblir i dialogen mens den er åpen.

## Assumptions

- `tomOkt(okt.versjon + 1)` i den eksisterende `nyOkt`-handlingen er tilstrekkelig til å tømme all tilstand inkl. `logg` — `beforeunload`-lytteren deaktiveres dermed automatisk etter dispatch.

## Review Findings

- [x] [Review][Patch] `useBeforeUnload` setter ikke `event.returnValue = ""` — bryter CAP-1 success criterion eksplisitt [`src/klient/okt/usebeforeunload.ts:17`]
- [x] [Review][Patch] Dev-sidetekst nevner ikke story 1.14 [`src/app/utvikling/samtale/forhandsvisning.tsx:88`] — utgått: forhåndsvisningen ble fjernet i story 1.8; dialogen og `useBeforeUnload` er nå koblet inn i `src/klient/skall/flytskall.tsx`
- [x] [Review][Patch] JSDoc på `onBekreft` lover «etter dialogen er lukket» men kalles synkront [`src/klient/skall/nyoktdialog.tsx:17`]
- [x] [Review][Defer] Ingen automatisk test for `useBeforeUnload`-lytteren [`src/klient/okt/usebeforeunload.ts`] — deferred: krever renderHook + jsdom + vi.spyOn(window, 'addEventListener'), et mønster som ikke finnes i testsuiten ennå
- [x] [Review][Defer] Fokusbann uten AlertDialogTrigger — maybe-false [`src/klient/skall/nyoktdialog.tsx`] — deferred: bekreft at base-ui bruker document.activeElement ved åpningstidspunkt til fokusbann når dialogen åpnes programmatisk (ikke via Trigger-wrapper)

### Avvist

- **false** — AlertDialogAction mangler destructive-variant: AlertDialogDescription sier «Alt i denne økten forsvinner.» — konsekvensen er kommunisert, ingen dårlig utfall.
- **false** — `harGittSvar`-tester dekker ikke alle typer: `LoggOppforing` er en lukket union med nøyaktig 3 typer (`sporsmal`, `svar`, `rettelse`), alle tre er dekket.
- **low/avvist** — Dobbeltklikk gir dobbel `nyOkt`-dispatch: usannsynlig å treffe i bruk, og fix legger til ref + betingelse (mer enn én linjerettelse).
- **løst** — `useBeforeUnload` ikke koblet til produksjons-samtalevisning: koblet inn i `src/klient/skall/flytskall.tsx` sammen med `NyOktDialog` etter at story 1.8 la til `(flyt)`-rutene.
