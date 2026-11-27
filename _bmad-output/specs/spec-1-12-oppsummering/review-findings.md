# Review Findings: story 1.12

Kodegjennomgang (`bmad-code-review`) 2026-11-26 av `story-1-11-fremdrift...story-1-12-oppsummering`. Fire lag: Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor. Gruppert ga det 25 funn: 15 patch, 5 defer, 4 avvist og 1 løst i specen. Acceptance Auditor fant at CAP-1–CAP-5 og alle constraints er oppfylt. Victoria ba om at alle funn ble rettet uten spørsmål. Patchene er tatt med, og `npm test` (384), `npm run lint` og `npm run build` er grønne. Endringene er sjekket på nytt i Chrome.

Victorias sjekkpunkter:
- Rettelse bare ved faktisk endring: ja. Også endringer i mellomrom inne i teksten ignoreres nå (patch 9).
- `rettetAvStudent` kan aldri siteres (AD-8): oppsummeringskoden rører aldri `kilder`, og bare `svar`-ID-er er gyldige kilder (`erFanget`).
- 0 og <3 fangede: riktig, og nå også testet for knappvarianter.
- Sletting med tastatur: ja, med kunngjøring og fokus på h1 (nå med synlig fokusring).
- Lagring i nettleseren: ingen bruk av localStorage, sessionStorage, cookies eller IndexedDB i `src/`.
- Tester av ren logikk: `oppsummering.test.ts`, `redigering.test.ts` og `steg.test.ts`.

- [x] [Review][Patch] Det fantes ingen test av at `Flytskall` viser Samtale som fullført og klikkbar på Oppsummering [src/klient/skall/flytskall.tsx]. Ny `tests/klient/skall/flytskall.test.tsx` (renderToString). Den feiler når `stegFor(aktivt)` byttes med `[]` (sjekket ved mutasjon).
- [x] [Review][Patch] Tastelogikken (`Esc` angrer, `Enter` lagrer tittelen) lå i komponenten og var ikke testet [src/klient/oppsummering/redigerbartfelt.tsx]. Den er flyttet til den rene `tastValg()` i `redigering.ts` med tester.
- [x] [Review][Patch] `deaktivert(knapp(...))` ga `false` når knappen ikke fantes, så en forsvunnet knapp ble regnet som aktiv [tests/klient/oppsummering/oppsummeringsflate.test.tsx]. Testen krever nå at knappen finnes.
- [x] [Review][Patch] To slettinger med samme tittel ga samme tekst i statusregionen, så den andre ble ikke lest opp [src/klient/oppsummering/oppsummeringsflate.tsx]. Kunngjøringen rendres nå med en teller i `key`.
- [x] [Review][Patch] Tom tittel ga tomt navn på kortet og «Slett erfaringen «»» [src/klient/oppsummering/oppsummeringskort.tsx]. `visningsnavn()` i kjernen gir «Erfaring uten tittel».
- [x] [Review][Patch] `Esc` midt i en IME-komposisjon kastet hele utkastet [src/klient/oppsummering/redigerbartfelt.tsx]. `tastValg` ignorerer taster under komposisjon.
- [x] [Review][Patch] Tittelen var en `<textarea>` som ble annonsert som flerlinjet felt, og `\r` ved liming ble ikke fjernet [src/klient/oppsummering/redigerbartfelt.tsx]. Tittelen er nå `<input type="text">`.
- [x] [Review][Patch] Testen som leser EXPERIENCE.md, var avhengig av arbeidsmappen [tests/kjerne/oppsummering.test.ts]. Stien finnes nå fra `import.meta.url`.
- [x] [Review][Patch] Endringer i mellomrom inne i teksten («Skift leder» → «Skift  leder») ga en rettelse, selv om specen sier at endringer bare i mellomrom ikke skal gi det [src/kjerne/oppsummering.ts]. `rettetTekst` sammenligner nå med mellomrom og linjeskift slått sammen. Den lagrede teksten beholder linjeskiftene.
- [x] [Review][Patch] Overskriften som får fokus etter sletting, hadde `outline-none` og ingen synlig fokusring [src/klient/oppsummering/oppsummeringsflate.tsx]. Den har nå shadcn-ringen ved `focus-visible`.
- [x] [Review][Patch] Notisen hadde shadcn-standarden `role="alert"` (assertive). Ved 3 → 2 fangede avbrøt den kunngjøringen av slettingen [src/klient/oppsummering/oppsummeringsflate.tsx]. Notisen har nå `role="status"`.
- [x] [Review][Patch] «Rettet av deg» var ikke koblet til feltet, så skjermleseren sa det ikke ved fokus [src/klient/oppsummering/redigerbartfelt.tsx]. Koblingen er laget med `aria-describedby`.
- [x] [Review][Patch] R-H-R-feltene var avhengige av `field-sizing: content` og kunne ikke endre størrelse (`resize-none`) [src/klient/oppsummering/redigerbartfelt.tsx]. De har nå målt høyde som reserve (som i Chatinput), `rows={2}` og `resize-y`.
- [x] [Review][Patch] Knappvariantene fra EXPERIENCE.md (like tydelige ved 1–2, «Gå videre» primær ved ≥ 3 og «Fortsett samtalen» primær ved 0) var ikke testet [tests/klient/oppsummering/oppsummeringsflate.test.tsx]. Testene er lagt til.
- [x] [Review][Patch] Siden hadde ingen egen tittel (WCAG 2.4.2) [src/app/(flyt)/oppsummering/page.tsx]. Tittelen er nå `metadata.title` «Oppsummering – Erfaringsgruven».
- [x] [Review][Defer] Det er ingen DOM-tester av at blur sender `leggTilRettelse` med riktig `erfaringId`, `felt` og trimmet tekst, eller av at sletting flytter fokus [src/klient/oppsummering/] — deferred: krever jsdom eller testing-library, som repoet ikke har (ikke-mål i specen). Atferden er sjekket i Chrome to ganger.
- [x] [Review][Defer] «Gå videre» sender til `/annonse`, som gir 404 til story 2.1 [src/klient/oppsummering/oppsummeringsflate.tsx] — deferred: bestemt med vilje (siden lages i 2.1). 1.12 bør merges sammen med eller før 2.1.
- [x] [Review][Defer] Retting og sletting nullstiller krav og bevistabell (AD-14) uten advarsel. En student som kommer tilbake fra Krav eller Bevistabell, kan miste arbeid med ett klikk [src/klient/okt/reducer.ts] — deferred: krav og bevistabell finnes ikke før Epic 2. UX tar stilling til advarsel eller angre da.
- [x] [Review][Defer] ARCHITECTURE-SPINE beskriver ikke `kanGaTilKravuttrekk` (≥ 1) ved siden av `kanGaVidere` (≥ 3) [docs/architecture/] — deferred: arkitekturdokumentet eies av gruppen. Punktene fra 1.10 og 1.11 i deferred-work.md er oppdatert med status.
- [x] [Review][Defer] Samtale-siden har heller ingen egen tittel (WCAG 2.4.2) [src/app/(flyt)/samtale/page.tsx] — deferred: fantes fra før og er utenfor 1.12.

**Rejected:**
- Et utkast kan overskrives når lagret tekst endres et annet sted — false: på Oppsummering endres `verdi` bare når feltet selv lagrer. Det finnes ingen annen skriver mens siden er åpen.
- `stegFor` viser Samtale som fullført også når studenten åpner `/oppsummering` direkte — low: knappen fører bare tilbake til Samtale, og flyten er lineær. En vakt krever ny tilstand i økten.
- Notisen står ikke «øverst» — false: den er det første innholdet etter overskriften og ingressen.
- `kanGaTilKravuttrekk(okt)` regner fangede på nytt — low: begge bruker `erFanget`, kan ikke bli uenige, og koster ingenting merkbart.

**Løst i specen:**
- At `Enter` lagrer tittelen, sto ikke i SPEC.md. Beslutningen er ført i memlog, og SPEC.md er gjengitt på nytt fra den (CAP-2).
