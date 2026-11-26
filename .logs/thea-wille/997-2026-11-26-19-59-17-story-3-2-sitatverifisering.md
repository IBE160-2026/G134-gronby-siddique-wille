# Story 3.2: Sitatverifisering i kjernen

## 2026-11-26 kl. 19:59, Thea Wille

### Oppgave
Thea ba Claude bygge story 3.2 (sitatverifisering) fra `docs/epics.md` på hennes vegne, med full tilgang til å endre det som trengtes. Storyen er hennes etter fordelingen Victoria foreslo 25. november. Arbeidet ble gjort på branchen `story-3-2-sitatverifisering`, laget fra main etter at 1.3 og 1.4 var merget.

### Plan
- Les Story 3.2, AD-6, AD-5 og AD-7 i arkitekturen, og eksisterende kjerne (`okt.ts`, `skjema.ts`, `regler.ts`).
- Ny fil `src/kjerne/sitat.ts` med `normaliser`, `verifiserSitat` og `hentSitat`. Spec: [spec-3-2-sitatverifisering-i-kjernen.md](../../_bmad-output/implementation-artifacts/spec-3-2-sitatverifisering-i-kjernen.md).
- Tester i `tests/kjerne/sitat.test.ts`, blant annet mot Mias svar i testsett A.
- Ikke vent på 1.5, 1.8 og 1.9, siden 3.2 bare bruker `LoggOppforing` fra skjemaet. Story 1.10 venter til de er merget, fordi `regler.ts` endres i 1.8 (Victoria nevnte dette i reviewen).

### Resultat
- **Kode:** `verifiserSitat(logg, svarId, sitat)` gir `{ svarId, start, slutt }` eller `null`. Normaliseringen følger AD-6 (NFC, mellomrom slått sammen inkl. NBSP og linjeskift, trim, case-sensitiv), og posisjonene gjelder originalteksten. `hentSitat` klipper sitatet ut av loggen og gir `null` for alt som ikke kan spores.
- **Bare `svar` kan siteres.** Spørsmål og rettelser avvises selv om ID-en finnes og teksten stemmer.
- **Verifisert:** 20 nye tester og 163 totalt består. `eslint` er uten feil. En bevisst feil i koden (ignorerer store og små bokstaver) gjorde at testen for dette feilet, så testene fanger den.
- **Ikke verifisert:** `npm run build` ble ikke kjørt (miljøet når ikke Google Fonts), og `tsc` viser bare de kjente `LayoutProps`/`PageProps`-feilene i eksisterende filer som Next lager ved bygging. Ingen formell `bmad-code-review` er kjørt. Koden bør leses av Victoria eller Rikke, siden sitatsjekken er kjernen i produktløftet.
- **Sprint-status:** 3-2 er `review`.
- Arbeidet er utført av Claude på Theas Mac. Testene ble kjørt i en egen kopi, slik at `node_modules` for Linux ikke havnet i Theas mappe.

### Åpne punkter
- Story 3.1 må selv avvise forslag med ukjent eller slettet `erfaringId`, og `svarId` som ikke er blant erfaringens `kilder` (AC nummer 2 der). 3.2 sjekker bare selve sitatet.
- Kjent begrensning: NFC brukes per segment, så skrift som settes sammen på tvers av segmenter (Hangul) kan få avvikende posisjoner. Ikke relevant for norsk tekst.
- Story 1.10 (terskelregler) skal tas etter at #6 og #8 er merget, og etter `git pull`.
