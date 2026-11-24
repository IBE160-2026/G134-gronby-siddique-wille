# Review Findings: story 1.7

Kodegjennomgang (`bmad-code-review`) 2026-11-24 av `story-1-16-merkevaretema...story-1-7-samtale-ui` (863abaa..cb2d5de). Fire lag: Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor. Gruppert ga det 17 funn: 1 decision, 6 patch, 1 defer og 9 avvist. Acceptance Auditor fant at CAP-1–CAP-4 er oppfylt, med ett brudd på en constraint (fokus etter klikk på Send). Victoria valgte å godta én live-region (decision) og å ta med alle patchene. Patchene er verifisert i Chrome.

- [x] [Review][Decision] Studentens egen melding leses opp igjen — hele loggen er `role="log"`/`aria-live="polite"`, så en skjermleserbruker hører «Du: …» med det hen nettopp skrev, før «Erfaringsgruven skriver …». EXPERIENCE.md sier at loggen er live-region «slik at nye assistentmeldinger leses opp». Valg: (a) godta, som de fleste chatter gjør, eller (b) en egen skjult live-region som bare kunngjør assistentmeldinger og indikatoren. **Løst (Victoria):** (a) godtas nå som bevisst valg; story 1.15, som har akseptkriteriet om at nye assistentsvar leses opp, avgjør den endelige løsningen. Ført i deferred-work.md.
- [x] [Review][Patch] Klikk på Send gir tap av fokus: knappen får fokus og blir deretter `disabled`, så fokus faller til `body` (bryter constraint om at fokus blir stående) [src/klient/samtale/chatinput.tsx:37]. `send()` flytter fokus tilbake til feltet; verifisert: fokus i «Ditt svar» etter klikk.
- [x] [Review][Patch] Loggen holder seg ikke nederst når skrivefeltet vokser eller vinduet endrer størrelse; ingen scroll-hendelse, så siste melding glir under kanten [src/klient/samtale/chatlogg.tsx:36]. ResizeObserver holder loggen nederst; verifisert: 0px fra bunnen etter vekst til 6 linjer.
- [x] [Review][Patch] Loggen kan ikke rulles med tastatur i Safari, fordi rullecontaineren ikke kan få fokus (WCAG 2.1.1, axe `scrollable-region-focusable`) [src/klient/samtale/chatlogg.tsx:43]. `tabIndex={0}` med shadcn-fokusring; verifisert: Home ruller til toppen.
- [x] [Review][Patch] Feltet starter på 64px (shadcn `min-h-16`, ca. 2,5 linjer), og `rows={1}` virker ikke; mockupen har 48px [src/klient/samtale/chatinput.tsx:69]. `min-h-12`; verifisert: 48px.
- [x] [Review][Patch] Utviklingssiden tømmer utkastet ved sending, ikke når svaret er tatt imot, stikk i strid med kontrakten for forelderen; den låste tilstanden vises derfor alltid med tomt felt [src/app/utvikling/samtale/forhandsvisning.tsx:38]. Tømmes nå i svaret; verifisert: teksten står låst under venting.
- [x] [Review][Patch] `last_updated: 11-24-2026 22:00` i sprint-status er et oppdiktet tidspunkt (klokka var 21:3x) [_bmad-output/implementation-artifacts/sprint-status.yaml]. Satt til faktisk tidspunkt da story 1.7 ble done.
- [x] [Review][Defer] Ingen automatiske tester for Chatinput (Enter/Shift+Enter, IME, trim, låst), autoscroll i Chatlogg eller 404-vakten på utviklingssiden [src/klient/samtale/] — deferred: repoet har ingen testkjører, og specen har tester som ikke-mål. Legges til senest med story 1.8, og utviklingssiden fjernes da.

**Rejected:**
- `6lh` i `max-height` mangler reserve — low: `lh` støttes av Chrome 109+, Safari 16.4+ og Firefox 120+, så også nettleserne som trenger JS-reserven for `field-sizing`.
- JS-reserven måler ikke på nytt når bredden endres — low: gjelder bare nettlesere uten `field-sizing` og vindusendring midt i et langt svar; rettelsen krever en ResizeObserver.
- Like `id` gir duplikat-nøkler — false: reduceren tildeler unike ID-er fra tellere som aldri gjenbrukes (AD-5).
- Tom boble ved tom tekst — false: tomme svar sendes aldri (Chatinput), og modellsvar valideres med Zod før de når loggen.
- Ugyldige tegn i `logg-<id>` — false: ID-ene er `A1`, `S1` osv. (AD-5).
- Ingen «Nye meldinger ↓»-knapp når studenten har rullet opp — false: ikke i spec eller EXPERIENCE.md; regelen er bare å ikke rulle.
- `textarea.tsx` importerer `cn` fra `"cn"` — false: ordrett CLI-utdata (`shadcn view textarea`); `@/lib/utils` re-eksporterer samme pakke.
- Send-knappen er 36px, under 44px — false: WCAG 2.2 AA (2.5.8) krever 24px.
- `onSend` får trimmet tekst; Textarea får `bg-card` ut over `rounded-sm`/`type-chat-body` — false: trimmingen er dokumentert og fjerner bare ytre mellomrom; `bg-card` følger mockupen og er `className`, ikke en ny variant.
