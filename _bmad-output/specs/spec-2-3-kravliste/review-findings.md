# Review Findings: story 2.3

Kodegjennomgang (`bmad-code-review`) 2026-11-27 av `main...story-2-3-kravliste`. Fire lag: Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor. Gruppert ga det 13 funn: 7 patch, 3 defer og 3 avvist. Acceptance Auditor fant at CAP-1–CAP-5, begge AC-ene i epics.md og alle constraints er oppfylt. Victoria ba om at alle funn ble rettet uten spørsmål. Patchene er tatt med, og `npm test`, `npm run lint` og `npm run build` er grønne.

Victorias sjekkpunkter:
- `okt.krav` null, tom liste og liste: fire tilstander i `kravlistetilstand()` (null deles i venter og ikke-startet ut fra annonsen), alle testet i kjernen og i rendringen.
- Nummerert, skrivebeskyttet liste: `<ol class="list-decimal">`, uten input, textarea eller contenteditable (testet).
- Navigasjon: «Tilbake» gir `/annonse` i alle tilstander og «Bygg bevistabell» gir `/bevistabell` (nå testet med klikk, og testen feiler når målene byttes).
- Lagring i nettleseren: ingen bruk av localStorage, sessionStorage, cookies eller IndexedDB i diffen.
- Tastatur og skjermleser: bare native knapper, én `h1`, statusregion som nå også kunngjør resultatet, skjelettrader `aria-hidden` og animert bare med `motion-safe`.
- Tester av ren logikk: `tests/kjerne/kravliste.test.ts` dekker alle fire tilstander, grensene for annonsen og kunngjøringen.

- [x] [Review][Patch] Statusregionen ble tømt når kravene kom, så skjermleseren fikk aldri vite at kravene var lastet eller at ingen ble funnet [src/klient/krav/kravflate.tsx]. Ny ren `kravkunngjoring()` i kjernen: «Fant N krav.» og «Fant ingen krav.» (sr-only), «Leser annonsen …» synlig mens den venter.
- [x] [Review][Patch] Navigasjonsmålene for «Tilbake» og «Bygg bevistabell» var ikke testet (CAP-2) [tests/klient/krav/kravflate.test.tsx]. Felles `push`-mock og klikk uten DOM: `Kravflate` bruker bare mockede kroker og kalles som funksjon. Sjekket med mutasjon.
- [x] [Review][Patch] Skjelettradene (`aria-hidden`, `motion-safe:animate-pulse`) var ikke testet [tests/klient/krav/kravflate.test.tsx].
- [x] [Review][Patch] Tester mangler for annonse med bare mellomrom eller som er lang nok bare med mellomrom i endene, og suksess-signalet sier seks krav mens testen brukte tre [tests/kjerne/kravliste.test.ts, tests/klient/krav/kravflate.test.tsx]. Lagt til, og testen bruker seks krav.
- [x] [Review][Patch] `stegFor("krav")` var ikke testet [tests/klient/skall/steg.test.ts]. Lagt til.
- [x] [Review][Patch] `erPrimar` krevde mellomrom på begge sider av `bg-primary` [tests/klient/krav/kravflate.test.tsx]. Matcher nå klassen som eget ord i `class`.
- [x] [Review][Patch] `IKKE_STARTET` manglet merknad om at ordlyden ikke er fra EXPERIENCE.md, `Kravtilstand` dupliserte felt fra `Okt`, og kommentaren i `annonsesteg.tsx` sa at Kravflaten sender `/api/krav` [src/kjerne/kravliste.ts, src/klient/annonse/annonsesteg.tsx]. Merknad lagt til, `Pick<Okt, "annonse" | "krav">`, og kommentaren sier nå at kallet kommer i 2.2.
- [x] [Review][Defer] Venter-tilstanden («Leser annonsen …») står for alltid når ingen forespørsel faktisk pågår: før 2.2 er merget, når uttrekket feiler, når studenten prøver «Finn krav» igjen med samme tekst (`settAnnonse` gir samme økt), eller ved Frem i nettleseren [src/kjerne/kravliste.ts] — deferred: medium. Økten har ingen forespørselsstatus; 2.2 må legge til feiltilstand eller forespørselsstatus og en vei til nytt forsøk. «Tilbake» er alltid tilgjengelig.
- [x] [Review][Defer] Krav med tom tekst eller bare mellomrom gir tomme listepunkter, og en liste med bare tomme krav regnes som `liste` [src/kjerne/skjema.ts] — deferred: `KravModellSvar` tillater `z.string()` uten minimum. Valideringen hører hjemme i 2.2 (skjema eller rute), ikke i visningen.
- [x] [Review][Defer] EXPERIENCE.md beskriver fortsatt at studenten «sendes tilbake til Annonse» ved tom liste, og har ikke teksten for ikke-startet [docs/ux-designs/.../EXPERIENCE.md] — deferred: endrer UX-dokumentet; gruppen bekrefter avviket i specen.
- Avvist (false): «Bygg bevistabell» gir 404. Bestemt med vilje i specen; siden kommer i Epic 3.
- Avvist (low): returnere en diskriminert union fra `kravlistetilstand` i stedet for `okt.krav?.map`. Ingen feil kan oppstå, og endringen gir mer kode.
- Avvist (process): sesjonslogg mangler i diffen. Ikke en kodefeil; loggen skrives ved slutten av økten.
