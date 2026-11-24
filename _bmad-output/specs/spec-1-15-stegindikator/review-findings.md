# Review Findings: story 1.15 (2026-11-24)

Diff `b13e484..86a173e`, modus `full`. Lag: Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor. Ingen lag feilet.

### Review Findings

- [x] [Review][Patch] Kunngjøringen beregnes fra siste melding i stedet for det som ble lagt til [src/klient/samtale/chatlogg.tsx:36] — medium. Tre utfall med samme rotårsak (`meldinger.at(-1)`):
  - Går `venter` til sann mens siste melding er assistentens, og kallet så feiler, rendres det forrige svaret med ny `key` og leses opp igjen. Kommentaren i koden lover det motsatte.
  - Legges flere assistentmeldinger til i én oppdatering, leses bare den siste.
  - Legges en studentmelding til uten `venter`, tømmes regionen. CAP-3 sier at den ikke skal endres.

  Rettelse: kunngjør assistentmeldinger som er nye siden forrige render, tøm kunngjøringen når `venter` blir sann, og la en studentmelding stå urørt. (edge-case-hunter+blind-hunter+acceptance-auditor)
- [x] [Review][Patch] Fokusflyttingen etter stegvalg avhenger av en ref som bare tømmes når `aktivt` endres [src/klient/skall/stegindikator.tsx:31] — medium.
  - Endrer ikke forelderen `aktivt` med en gang, blir `valgt` stående og kan ta fokus ved et senere stegbytte.
  - Remountes skallet ved stegbytte (hvis 1.8 gjør stegene til ruter med skallet i hver side), går fokus til `<body>`.

  Rettelse: tøm `valgt` etter hver render, og skriv i JSDoc at skallet må ligge fast over stegene (felles layout). Følges opp i 1.8 (deferred-work). (verification-gap+edge-case-hunter+blind-hunter+acceptance-auditor)
- [x] [Review][Patch] Appskall har en uskrevet kontrakt om oppsett og klientgrense [src/klient/skall/appskall.tsx:24] — low. `<main className="min-h-0 flex-1">` virker bare i en `flex flex-col`-forelder med høyde, og komponenten tar funksjonsprops uten `"use client"`. Rettelse: `"use client"` og JSDoc om forelderen. (blind-hunter)
- [x] [Review][Patch] Meldinger som finnes ved første visning kunngjøres ikke, men regelen står ikke i props-kontrakten [src/klient/samtale/chatlogg.tsx:20] — low. Mountes Chatlogg med åpningsspørsmålet allerede i listen, leses det ikke opp. Rettelse: JSDoc om at forelderen mounter Chatlogg før første spørsmål kommer. (blind-hunter)
- [x] [Review][Patch] Utviklingssiden beholder gammelt `aktivt` når `?steg` endres uten remount [src/app/utvikling/samtale/page.tsx:14] — low. Rettelse: `key={lengst}`. (edge-case-hunter+blind-hunter)
- [x] [Review][Defer] Ingen automatiske tester for reglene i live-regionen og for stegindikatoren [src/klient/samtale/chatlogg.tsx, src/klient/skall/stegindikator.tsx] — deferred: det finnes ingen testkjører, og tester er ikke-mål. Tilfellene er ført i deferred-work.md, så de skrives sammen med Vitest. (verification-gap+blind-hunter)

### Rejected

- `false`: En ny økt med samme ID (`A1`) kunngjøres ikke hvis Chatlogg står mountet (edge-case-hunter). «Ny økt» går tilbake til Start (avkrysning før første spørsmål, FR-10), så Chatlogg unmountes.
- `false`: Det finnes ikke noe bevis for at build og lint går uten feil (acceptance-auditor). Begge ble kjørt i økten: `npm run build` og `npm run lint` gikk uten feil, og `/utvikling/samtale` gir 404 i `next start`.
- `false`: Aktivt steg mangler tilstandstekst for skjermleser (blind-hunter). Constrainten i specen sier at aktivt steg uttrykkes med `aria-current="step"`, og det leses opp som «gjeldende steg» i VoiceOver, NVDA og JAWS.
- `low`: `role="log"` er byttet med `role="region"` (blind-hunter). `role="log"` er live i seg selv, og `aria-live="off"` som overstyring behandles ulikt av skjermlesere. Det var nettopp den dobbeltlesingen valget skulle fjerne.
- `low`: Utviklingssiden regner også `lengst` som fullført (acceptance-auditor). Det er bevisst (å gå tilbake uten endring beholder senere steg, EXPERIENCE.md) og står kommentert i koden. Det gjelder bare utviklingssiden.
- `low`: Stegknappene kopierer ringklassene fra shadcn i stedet for å bruke `Button` (acceptance-auditor). Ringen bruker den samme `ring`-tokenen, så en endring av `--ring` slår også inn her. `Button` ville ført med høyde og padding som bryter med pillene.
- `low`: Fullført steg har `hover:bg-muted` (acceptance-auditor). Det strider ikke mot DESIGN.md og hjelper musbrukere.
- `low`: Diffen endrer EXPERIENCE.md, som er en companion (acceptance-auditor). Victoria ba om at live-region-spørsmålet skulle avgjøres. Endringen er ført i memlogen og i deferred-work.md.
