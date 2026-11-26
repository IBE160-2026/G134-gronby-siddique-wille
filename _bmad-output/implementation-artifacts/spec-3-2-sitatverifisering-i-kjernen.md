# Story 3.2: Sitatverifisering i kjernen

## 2026-11-26 kl. 19:59, Thea Wille (utført av Claude på Theas vegne)

### Oppgave
Bygge story 3.2 fra `docs/epics.md` etter AD-6: `verifiserSitat()` i kjernen godtar et foreslått sitat bare hvis det er en ordrett delstreng av en `svar`-oppføring, og gir `{ svarId, start, slutt }` i originalteksten. Sitatet som vises og eksporteres klippes alltid ut av loggen med `start`/`slutt`.

### Beslutninger
- **Ny fil `src/kjerne/sitat.ts`**, rene funksjoner uten modellkall (samme sjekk i ekte modus og demomodus). Ingen nye avhengigheter, og ingen import av `zod` utenfor `skjema.ts`.
- **Signatur:** `verifiserSitat(logg, svarId, sitat)` gir `{ svarId, start, slutt } | null`. Bare `svar`-oppføringer kan siteres (AD-5). `slutt` er eksklusiv, som i `String.slice`.
- **Normalisering** (`normaliser()`): Unicode NFC, alle mellomromsløp (også NBSP og linjeskift) blir ett mellomrom, teksten trimmes, store og små bokstaver skilles.
- **Posisjoner i originalen:** teksten deles i segmenter (ett tegn med sammensatte tegn). Hvert segment NFC-normaliseres for seg, og det føres et kart fra normalisert posisjon til originalposisjon. Slik treffer `start`/`slutt` riktig selv når originalen har dobbelt mellomrom, NBSP, linjeskift eller aksenttegn skrevet på to måter.
- **`hentSitat(logg, bevis)`** klipper teksten ut av loggen (AC 3) og gir `null` for ukjent `svarId`, oppføringer som ikke er `svar`, og ugyldige utsnitt.
- **Utenfor denne storyen:** kontroll av at `erfaringId` finnes og at `svarId` er blant erfaringens `kilder` hører til bevisruten (story 3.1, dens AC nummer 2).
- **Første forekomst** brukes hvis sitatet står flere steder i svaret.

### Resultat
- `src/kjerne/sitat.ts` med `normaliser`, `verifiserSitat` og `hentSitat`.
- `tests/kjerne/sitat.test.ts`: 20 tester, inkludert Mias svar fra testsett A (ordrette utdrag godtas, flyttet sitat til feil svar forkastes, oppdiktet sitat forkastes).
- Verifisert: alle 163 tester består, `eslint` er uten feil, og en bevisst feil i koden (ignorerer store og små bokstaver) får én test til å feile. `tsc` melder bare `LayoutProps`/`PageProps` i eksisterende filer, som Next lager først ved bygging.
- Ikke kjørt: `npm run build` (krever nett til Google Fonts og ble ikke kjørt i dette miljøet) og selve nettleseren. Koden her er ren kjerne uten UI.

### Kjent begrensning
NFC brukes per segment. For skrift der tegn settes sammen på tvers av segmenter (for eksempel koreansk Hangul) kan posisjonene avvike. Det er ikke relevant for norsk tekst.
