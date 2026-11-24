---
id: SPEC-1-7-samtale-ui
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - ../../implementation-artifacts/epic-1-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.7: Samtale-UI: chatboble, chatinput og skriveindikator

## Why

Visjon og krav: samtalen skal kjennes som en prat med en rolig veileder, ikke som et skjema (UX-DR3, UX-DR4). Studenten trenger tydelige bobler for seg selv og assistenten, et felt som er lett å skrive i, og et tydelig tegn på at assistenten svarer. Øktreduceren og API-et (story 1.3–1.5) lages parallelt av en annen i gruppen, så komponentene må kunne bygges og prøves nå og kobles på senere uten å endres.

## Capabilities

- **CAP-1** Chatbobler
  - **intent:** En melding vises som boble. Assistentens er venstrejustert med `card`-bakgrunn og kant, studentens er høyrejustert med `muted`-bakgrunn og ingen kant. Begge har `rounded-lg` og `chat-body`-typografi.
  - **success:** Assistentboblen har `bg-card`, 1px `border` og `self-start`. Studentboblen har `bg-muted`, ingen kant og `self-end`. Begge har `rounded-lg` (14px), `type-chat-body` og maks 80 % bredde, og linjeskift i teksten bevares.
- **CAP-2** Chatlogg
  - **intent:** Meldingene vises i rekkefølge med nyeste nederst, i en `aria-live="polite"`-region som ruller automatisk bare når studenten allerede står nederst.
  - **success:** En ny melding ruller loggen ned når den sto nederst, og lar posisjonen stå når studenten har rullet opp. Hver melding har `id="logg-<id>"`.
- **CAP-3** Chatinput
  - **intent:** Studenten skriver i en `Textarea`. `Enter` sender, `Shift+Enter` gir ny linje, og feltet vokser opp til 6 linjer og ruller deretter.
  - **success:** `Enter` kaller `onSend` med teksten uten å sette inn linjeskift, `Shift+Enter` setter inn linjeskift, tom tekst eller bare mellomrom sendes ikke, og høyden stopper ved 6 linjer.
- **CAP-4** Låst under modellkall, med skriveindikator
  - **intent:** Mens et modellkall pågår (`venter`), er chatinput låst og «Erfaringsgruven skriver …» vises i muted-tekst nederst i loggen.
  - **success:** Med `venter=true` kan feltet ikke endres eller sendes (verken med `Enter` eller Send-knappen), og indikatoren vises. Med `venter=false` er den borte.

## Constraints

- Komponentene importerer ingenting fra `klient/okt`, `kjerne` eller API-rutene. Data og hendelser kommer som props (`meldinger`, `venter`, `verdi`, `onEndre`, `onSend`), så story 1.3/1.8 kan koble dem til reduceren uten å endre dem.
- Meldingsformen er en lokal visningstype `{ id, rolle: "assistent" | "student", tekst }`. Adapteren fra loggoppføringer (`sporsmal` → assistent, `svar` → student, `rettelse` vises ikke) lages når reduceren finnes.
- Chatinput er kontrollert (`verdi`/`onEndre`). Forelderen eier utkastet og tømmer det først når svaret er tatt imot, så teksten kan bevares ved API-feil.
- Låst betyr `readOnly` og `aria-disabled` på feltet og `disabled` på Send-knappen, ikke `disabled` på feltet, så fokus blir stående mens assistenten svarer. Etter sending flyttes fokus tilbake til feltet, også når studenten klikket Send.
- shadcn `Textarea` legges til med shadcn-CLI og brukes uendret. Merkevaren gis via `className`: `rounded-sm` (DESIGN.md: `rounded.sm` på input) og `type-chat-body`.
- Feltet starter på 48px (`min-h-12`, som i mockupen). Vekst til 6 linjer bruker `field-sizing: content` (fra shadcn) og `max-height` = 6 × linjehøyde + padding, med en JS-reserve som måler `scrollHeight` når `CSS.supports("field-sizing", "content")` er usann.
- `Enter` sender ikke mens en IME-komposisjon pågår (`isComposing` / `keyCode 229`).
- Meldingstekst rendres som ren tekst: ingen HTML, ingen markdown, ingen `dangerouslySetInnerHTML`.
- Hver boble har en skjult avsender for skjermleser («Erfaringsgruven:» / «Du:»), fordi plassering og farge alene ikke sier hvem som snakker (WCAG 1.3.1).
- Skriveindikatoren ligger inne i loggregionen, så skjermleser kunngjør den. Statisk tekst, ingen animasjon.
- Hele loggen er én live-region, så også studentens egen melding leses opp. Det er et bevisst valg nå. Story 1.15 avgjør den endelige løsningen.
- Loggen holdes nederst også når den krymper uten scroll-hendelse (skrivefeltet vokser, vinduet endres), og den kan få fokus (`tabIndex={0}`), så den kan rulles med tastatur.
- Send-knappen er shadcn `Button` (primær) med teksten «Send». Plassholder «Skriv svaret ditt …», `aria-label` «Ditt svar».

## Non-goals

- Kobling til reducer/Context og `/api/samtale` (story 1.3 og 1.8).
- Feiltoast og «Prøv igjen», demomodus med «Neste» (story 1.13).
- Sidepanel, erfaringskort, fremdriftsmåler, «Ferdig», stegindikator og sideoppsett (story 1.9, 1.11, 1.15).
- Responsivt oppsett (story 1.17).
- Markdown eller formatering i boblene.
- Automatiske tester, siden Vitest kommer i en senere story.

## Success signal

- `npm run build` og `npm run lint` går uten feil. På `/utvikling/samtale` i dev-serveren vises eksempelsamtalen fra mockupen med riktige bobler. `Enter` sender, `Shift+Enter` gir ny linje, feltet stopper ved 6 linjer, og under simulert venting er feltet låst og «Erfaringsgruven skriver …» vises.

## Assumptions

- Utviklingssiden `/utvikling/samtale` viser komponentene med eksempelsamtalen fra mockupen og simulert venting, så de kan prøves før 1.8. Den gir 404 i produksjonsbygg og fjernes når samtaleruten finnes.
- Chatloggen er sin egen rullecontainer (`overflow-y-auto`). Sideoppsettet rundt hører til 1.15/1.17.
