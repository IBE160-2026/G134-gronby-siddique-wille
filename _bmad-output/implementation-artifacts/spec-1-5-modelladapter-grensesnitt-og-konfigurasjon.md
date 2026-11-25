---
title: 'Story 1.5: Modelladapter-grensesnitt og konfigurasjon'
type: 'feature'
created: '2026-11-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '88dcf22e6c621b8230e11f598a48556ff7d2c491'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Det finnes ingen vei til modellen. Uten ett grensesnitt vil samtale-, krav- og bevisrutene (1.8, 2.2, 3.1) kalle Anthropic hver på sin måte, med egne grenser, egne nye forsøk og egen feilhåndtering. Da er kostnaden ukontrollert og demomodus en egen vei (AD-10, AD-15).

**Approach:** `src/server/modell/` får ett grensesnitt `Modell` med `AnthropicModell` (eneste bruker av SDK-en, i `anthropic.ts`) og `DemoModell`. Modell-ID, `max_tokens` per steg, timeout og `maxRetries` står i `config.ts`. `velgModell(modus)` velger adapter per forespørsel. Alle feil blir en `ModellFeil` med en kode fra `FEILKODER`, og `feilsvar(kode)` lager HTTP-svaret.

## Boundaries & Constraints

**Always:**
- Kallet bruker `client.messages.parse` med `output_config.format = zodOutputFormat(<steg>ModellSvar)` fra `@anthropic-ai/sdk/helpers/zod`. Ingen `temperature`, `top_p`, `top_k` og ingen strømming.
- `@anthropic-ai/sdk` importeres bare i `src/server/modell/anthropic.ts`. Håndheves med `no-restricted-imports`.
- Feilkoder: 429, 529, andre 5xx, timeout og nettverksfeil → `modell_feil`. Ugyldig eller manglende strukturert svar → `ugyldig_svar`. `"ekte"` uten nøkkel (tom etter trimming) → `mangler_nokkel`, før noe kall. Ruten prøver aldri på nytt; bare SDK-ens `maxRetries` fra `config.ts`.
- Feilmeldinger fra SDK-en kan inneholde modelltekst. De kastes, logges aldri og havner aldri i svar (AD-12). SDK-ens logging slås av (`logLevel: "off"`).
- Alle nye filer i `src/server/` importerer `server-only`. `@anthropic-ai/sdk` 1.5.0, eksakt.

**Never:**
- Ingen ruter, ingen promptfiler eller promptlasting, ingen demodatafiler (1.8, 1.13, 2.2, 3.1). Kalleren gir `system` og `melding`.
- Ingen egne nye forsøk, ingen `temperature`/`top_p`/`top_k`, ingen nøkkel i logg eller svar.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ekte, gyldig svar | nøkkel satt, API svarer gyldig JSON | `SamtaleModellSvar`-objekt; forespørselen har `model`, `max_tokens` for steget, ingen sampling-felt | N/A |
| Ekte uten nøkkel | `modus: "ekte"`, nøkkel mangler/blank | `ModellFeil("mangler_nokkel")`; `feilsvar` → 400 | ingen nettverkskall |
| Overbelastet/ratebegrenset | API svarer 429 eller 529 | `ModellFeil("modell_feil")`; `feilsvar` → 503; nøyaktig `maxRetries + 1` HTTP-kall | ruten prøver ikke igjen |
| Timeout/nettverk | `APIConnectionTimeoutError` / `APIConnectionError` | `ModellFeil("modell_feil")` | N/A |
| Ugyldig modellsvar | tekst som ikke er JSON, eller feil form, eller ingen tekstblokk | `ModellFeil("ugyldig_svar")` → 502 | SDK-meldingen forkastes |
| Demo, samtale | `demo/samtale.json` er en liste, `antallSvar = 2` | element nr. 2, validert mot `SamtaleModellSvar` | N/A |
| Demo mangler/ugyldig | fil mangler, indeks utenfor, feil form | `ModellFeil("ugyldig_svar")` | N/A |

</frozen-after-approval>

## Code Map

- `src/kjerne/skjema.ts` -- `SamtaleModellSvar`, `KravModellSvar`, `BevisModellSvar` (uten grenser, ment for `output_config.format`), `FEILKODER`, `FeilKode`, `FeilSvar`, `Modus`. Endres ikke.
- `src/server/status.ts` -- har nøkkelsjekken inline (`trim().length > 0`) og `demoMappe()`. Nøkkelsjekken flyttes til `src/server/nokkel.ts` og brukes av begge; `demoMappe()` gjenbrukes av `DemoModell`.
- `eslint.config.mjs` -- én `no-restricted-imports`-blokk per fil; senere blokk erstatter regelen. SDK-forbudet flettes inn i alle blokkene, og `anthropic.ts` får en egen blokk uten det.
- `tests/oppsett/eslint-grenser.test.ts`, `tests/oppsett/server-only.test.ts` -- mønstrene for grense- og server-only-tester; server-only-testen dekker nye filer automatisk.
- `tests/server/status.test.ts` -- mønster: `vi.mock("server-only")`, dynamisk import, midlertidig mappe.
- SDK 1.5.0: `zodOutputFormat` importerer `zod/v4` (finnes i zod 4.6.7). `parse` kaster en ren `AnthropicError` når JSON/Zod feiler; `parsed_output` er `null` uten tekstblokk. Feilklasser: `APIConnectionError` ⊃ `APIConnectionTimeoutError`, `RateLimitError` (429), `InternalServerError` ⊃ `OverloadedError` (529). `timeout` er i millisekunder. Klienten tar `fetch` som valg (brukes i tester).
- `src/server/modell/.gitkeep` -- slettes.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- `@anthropic-ai/sdk` 1.5.0 eksakt
- [x] `src/server/nokkel.ts` -- `lesNokkel(env)` → trimmet nøkkel eller `undefined`; `status.ts` bruker den
- [x] `src/server/modell/config.ts` -- `MODELL_ID = "claude-haiku-5-5"`, `MAX_TOKENS` per steg, `TIMEOUT_MS`, `MAX_RETRIES`, `EFFORT` (foreløpige verdier, se Design Notes)
- [x] `src/server/modell/grensesnitt.ts` -- `Steg`, `ModellSvarFor`, `ModellForesporsel`, `Modell`, `ModellFeil`, `MODELLSKJEMA` (steg → modellskjema)
- [x] `src/server/modell/anthropic.ts` -- `AnthropicModell` og `tilModellFeil(error)`
- [x] `src/server/modell/demo.ts` -- `DemoModell({ mappe? })`
- [x] `src/server/modell/velg.ts` -- `velgModell(modus, { env?, demoMappe? })`
- [x] `src/server/feil.ts` -- `feilsvar(kode)` → `Response` med `FeilSvar`, status fra `FEILKODER`, `Cache-Control: no-store`
- [x] `eslint.config.mjs` -- forby `@anthropic-ai/sdk` utenom `anthropic.ts`
- [x] `tests/server/modell/*.test.ts`, `tests/server/feil.test.ts`, `tests/oppsett/eslint-grenser.test.ts` -- hele I/O-matrisen; ekte kall testes med en falsk `fetch` (ingen nøkkel, ingen nettverk)

**Acceptance Criteria:**
- Given `modus: "ekte"` med nøkkel, when steget kaller modellen, then forespørselen går gjennom `anthropic.ts` med `model`, `max_tokens`, timeout og `maxRetries` fra `config.ts`, og body har verken `temperature`, `top_p` eller `top_k`.
- Given `modus: "ekte"` uten `ANTHROPIC_API_KEY`, when kallet gjøres, then resultatet er `mangler_nokkel` (400).
- Given nettverksfeil, timeout eller 429/529, when kallet feiler, then resultatet er `modell_feil` (503), uten nye forsøk utover SDK-ens `maxRetries`.
- Given en fil utenfor `anthropic.ts` som importerer `@anthropic-ai/sdk`, when `npm run lint` kjøres, then lint feiler.

## Implementation Notes

- Demoindeksen er nullbasert: `samtale.json[antallSvar]`, så `antallSvar = 0` gir åpningsspørsmålet. «Element nr. 2» i matrisen er indeks 2.
- `velgModell` kaster aldri. Ved `"ekte"` uten nøkkel får kalleren en `AnthropicModell` som kaster `ModellFeil("mangler_nokkel")` i `kall`, før det lages noen SDK-klient eller sendes noe forespørsel.
- SDK-forbudet i ESLint gjelder også utenfor `src/` (tester og skript). Tester for ekte kall bruker derfor en falsk `fetch` i stedet for SDK-ens feilklasser.

## Spec Change Log

## Review Triage Log

Lag: Blind Hunter (BH, 10 funn), Edge Case Hunter (EC, 8 funn), Verification Gap (VG, 1 hull og 1 annet funn).

| Funn | Verdikt | Rute | Bevis |
|---|---|---|---|
| EC1 / EC7 Et 2xx-svar med ødelagt JSON eller tekst gir en rå `SyntaxError`/`TypeError` ut av `kall` | medium | patch | Bekreftet med en midlertidig test: `{"hemmelig` med `application/json` ga `SyntaxError`. SDK-en pakker ikke inn `response.json()`. Node kan sitere teksten i meldingen. Spec: «Alle feil blir en `ModellFeil`». |
| VG-a Grenen for `RetryableError` kan ikke nås, og kommentaren beskriver den feil | low | patch | I SDK 1.5.0 kaster middleware `RetryableError` for å be om et nytt forsøk (`client.js:560`). Adapteret har ingen middleware. Rettelsen er å slette grenen. |
| VG1 Standardmappen for demo (`velgModell("demo")` uten mappe) er ikke testet | low | patch | Alle testene sender en mappe, så en regresjon i standardverdien ville ikke blitt fanget. Bare en test legges til. |
| BH4 Lekkasjetestene for `modell_feil` sjekker ikke `message`/`cause` | low | patch | Bare en assertion. |
| BH5 `ModellFeil` godtar `ugyldig_foresporsel` | low | patch | En direkte typeinnsnevring. Et adapter skal ikke kunne gi en feil som skylder på forespørselen. |
| BH8 Ingenting sier at kalleren må validere mot rutens `…Svar`-skjema | low | patch | Én doc-linje på `Modell.kall` (AD-9: rutens validering er autoritativ). |
| BH3 Feilmappingen i `tilModellFeil` er ikke testet direkte | false | avvist | `APIError` dekkes av HTTP-, timeout- og nettverkstestene via falsk `fetch`, og `AnthropicError` av testene for ugyldig svar. `RetryableError` fjernes (VG-a). |
| BH1 `stop_reason` sjekkes ikke | false | avvist | Et svar avkortet av `max_tokens` eller `refusal` feiler i `parse` eller gir `parsed_output: null`, og blir `ugyldig_svar` som matrisen krever. |
| EC2 Flere tekstblokker, der en senere blokk ikke kan parses | low | avvist | Strukturert output gir én tekstblokk. Rettelsen er egen parsing. |
| EC3 `ANTHROPIC_BASE_URL` sender nøkkelen til en annen vert | low | avvist | Miljøet styres av studenten selv på egen maskin. Det er en bevisst SDK-funksjon. |
| EC4 `steg` utenfor unionen ved kjøring | false | avvist | `steg` er typet som `Steg`, og rutene sender en literal. Det er ingen brukerinput. |
| EC5 `feilsvar` med ukjent kode | false | avvist | `kode` er typet som `FeilKode`. |
| EC6 / EC8 / BH6 `import()`/`require` omgår SDK-forbudet | low | avvist | Samme vurdering som EC9 i 1.4. Rettelsen er en ny regel (`no-restricted-syntax`). |
| BH2 Ingen `AbortSignal` fra ruten | low | avvist | Kostnaden ved en avbrutt forespørsel er liten (Haiku, `MAX_RETRIES` 1). Rettelsen er et nytt felt i grensesnittet, som 1.8 kan legge til. |
| BH7 Timeout-testen bruker headeren `x-stainless-timeout` | low | avvist | SDK-en er låst til 1.5.0. Testen viser at `TIMEOUT_MS` sendes til klienten. |
| BH9 `demo.ts` importerer `demoMappe` fra `../status` | low | avvist | Ingen sirkel finnes, og ingen konkret skade. |
| BH10 `.env.example`/README er ikke oppdatert, og den eksakte låsingen er ikke forklart | low | avvist | Feilsøkingsdelen i README står allerede i deferred-work (fra 1.1). Den eksakte låsingen står i specen (Always) og følger stack-tabellen. |

## Design Notes

```ts
type Steg = "samtale" | "krav" | "bevis";
type ModellForesporsel<S extends Steg> = { steg: S; system: string; melding: string; antallSvar: number };
interface Modell { kall<S extends Steg>(f: ModellForesporsel<S>): Promise<ModellSvarFor[S]> }
class ModellFeil extends Error { readonly kode: FeilKode }
```

`AnthropicModell` bruker `system`/`melding` og ignorerer `antallSvar`; `DemoModell` bruker bare `steg` + `antallSvar` (AD-10). Demodata: `samtale.json` er en liste indeksert med `antallSvar`; `krav.json` og `bevis.json` er ett objekt hver. Formatet kan endres i 1.13.

Foreløpige verdier (spinen: settes ved første kjøring mot testsett A): `MAX_TOKENS` samtale 2048, krav 4096, bevis 8192; `TIMEOUT_MS` 30 000; `MAX_RETRIES` 1; `EFFORT` `"low"`. Haiku 5.5 tenker adaptivt som standard, og tenkingen teller mot `max_tokens`; lav effort holder kostnaden nede (<10 øre per økt).

Andre API-feil (400/401/403/404) gir også `modell_feil`. Klienten viser uansett samme tekst, og ugyldig nøkkel er ikke det samme som manglende nøkkel. Ukjente feil (ikke fra SDK-en) kastes videre.

`ModellFeil` tar aldri med SDK-ens melding eller `cause`, så modelltekst ikke kan lekke via en logg senere.

## Verification

**Commands:**
- `npm test` -- expected: alle tester grønne
- `npm run lint` -- expected: ingen feil
- `npx tsc --noEmit` -- expected: ingen feil
- `npm run build` -- expected: bygger
