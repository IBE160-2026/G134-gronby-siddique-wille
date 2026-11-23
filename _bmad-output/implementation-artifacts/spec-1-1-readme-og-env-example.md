---
title: 'Story 1.1: README og .env.example for lokal kjøring'
type: 'chore'
created: '2026-11-23'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** README-en i reporoten sier at kjøreoppskriften «kommer når appen er bygget», og det finnes ingen `.env.example`. En sensor eller tester kan derfor ikke sette opp prosjektet lokalt ut fra dokumentasjonen.

**Approach:** Erstatt «Kjøre appen» i README med oppskriften fra arkitektur-spinen: installer Node 26 LTS, kjør `npm install`, kopier `.env.example` til `.env.local` (valgfritt) og kjør `npm run dev`, med en grunnleggende forklaring av demomodus uten API-nøkkel. Legg til `.env.example` i reporoten med `ANTHROPIC_API_KEY` og en kort kommentar. `.env.local` er allerede gitignored via `.env.*`.

</frozen-after-approval>

## Implementation Notes

- `README.md`: «Kjøre appen» erstattes. Appen åpnes på `http://127.0.0.1:3000` (dev-script `next dev -H 127.0.0.1`, story 1.2). Demomodus beskrives på et grunnleggende nivå. Detaljer om K5-fellen kommer i Epic 5 (AD-11). «Status» oppdateres til at byggingen er i gang.
- `.env.example`: `ANTHROPIC_API_KEY=` med kommentar om at bare serveren (`src/server/`) leser den (AD-1), og at den kan stå tom i demomodus.
- `.gitignore`: ingen endring. `.env.*` dekker `.env.local`, og `!.env.example` holder eksempelfila med.

## Review Triage Log

Blind Hunter, 14 funn:

1. `npm install`/`npm run dev` virker ikke før `package.json` finnes — low. Avvist: story 1.2 legger til `package.json` i samme økt og pushes sammen med 1.1.
2. Demomodus-delen blander nåtid og «bygges senere» — medium. Patch: skrevet om til fremtid, med beskjed om at demomodus ikke er bygget ennå.
3. Hvor nøkkelen hentes og at API-bruk koster penger — low. Patch: lenke til Anthropic Console og merknad om kostnad. Hvordan modus velges i UI-et — low. Avvist: UI-et finnes ikke ennå, og det dekkes i Epic 5.
4. Personvern mangler 30 dager / 2 år (AD-17) — medium. Patch: lagt til med kilde.
5. Omstart etter endring av `.env.local` — low. Patch.
6. Windows-kommando for kopiering — low. Patch: `copy` for cmd.
7. Fast port 3000 og `localhost` mot `127.0.0.1` — low. Patch: «adressen terminalen viser» og advarsel mot `localhost`.
8. Ingen versjon å sammenligne med for Node — low. Patch: 26.13.0 eller nyere 26.x.
9. Mangler klonesteg — low. Patch: «Klon repoet, gå inn i mappen».
10. «ekte modell» mot «ekte modus» — low. Patch: «ekte modus» overalt.
11. Feilsøking for `mangler_nokkel` / ugyldig nøkkel — low. Utsatt (deferred-work.md): feilmodellen bygges i story 1.4/1.5.
12. «(Epic 1)» i Status blir utdatert, og Arbeidsfordeling mangler byggefasen — low. Avvist: Status oppdateres fortløpende, og arbeidsfordelingen er utenfor denne storyen.
13. Modellnavn hardkodet i `.env.example` — low. Patch: fjernet.
14. `.env.example` sier ikke hvor nøkkelen hentes eller at den ikke skal ha anførselstegn — low. Patch.

### Review Findings

Kodegjennomgangen 2026-11-23 dekket story 1.1 og 1.2 samlet. Funnene står i [spec-1-2-prosjektgrunnlag-nextjs-shadcn.md](spec-1-2-prosjektgrunnlag-nextjs-shadcn.md#review-findings), merket «(1.1)» for denne storyen.
