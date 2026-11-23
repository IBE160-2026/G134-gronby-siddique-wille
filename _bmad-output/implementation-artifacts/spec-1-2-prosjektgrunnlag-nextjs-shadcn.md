---
title: 'Story 1.2: Prosjektgrunnlag med Next.js, shadcn og dev-server'
type: 'chore'
created: '2026-11-23'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'ecde956381f01c7944433e7c52c7c6f584cf0869'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Repoet har bare dokumentasjon, fixtures og BMAD-filer. Det finnes ikke noe Next.js-prosjekt som gruppen kan bygge videre på, og README-oppskriften fra story 1.1 (`npm install`, `npm run dev`) virker derfor ikke ennå.

**Approach:** Kjør `create-next-app` (App Router, TypeScript, Tailwind, ESLint, `--src-dir`, alias `@/*`, npm) i en midlertidig mappe og flytt prosjektfilene inn i reporoten uten å overskrive eksisterende filer. Kjør `shadcn init`, sett dev-scriptet til `next dev -H 127.0.0.1`, lag mappestrukturen fra arkitektur-spinen og bytt startsiden ut med en enkel placeholder.

## Boundaries & Constraints

**Always:**
- Versjoner som i spinens stack-tabell: `next` 16.4.5, `react`/`react-dom` 19.3.1, `tailwindcss` 4.3.4, shadcn CLI 4.23.0, TypeScript 5.x. Låses eksakt (uten `^`) i `package.json` for de fire første.
- Cache Components er av (AD-2): ingen `cacheComponents: true` i `next.config.ts`.
- Mappene `src/app`, `src/kjerne`, `src/klient/okt`, `src/server/modell` og `src/components/ui` finnes og er sporet i git (tomme mapper med `.gitkeep`).
- Eksisterende `README.md`, `.gitignore`, `CLAUDE.md`, `docs/`, `fixtures/`, `_bmad*/`, `.claude/` og `.logs/` beholdes uendret. Eneste unntak er tillegg i `.gitignore` hvis den genererte fila har mønstre som mangler.
- UI-tekst på norsk med æøå (`<html lang="nb">`).

**Never:**
- Ingen kode som leser `ANTHROPIC_API_KEY`, ingen API-ruter, ingen `@anthropic-ai/sdk`, Zod eller Vitest. Det hører til senere stories (1.3–1.5).
- Ingen shadcn-komponenter utover det `init` lager. Ingen tema eller merkevarefarger (story 1.16).
- Ingen `localStorage`/`sessionStorage`/cookies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dev-server | `npm run dev` | Starter på `127.0.0.1:3000` uten feil, `GET /` gir 200 med placeholder | N/A |
| Ikke `localhost`-binding | `curl http://[::1]:3000` | Ingen forbindelse (serveren lytter bare på 127.0.0.1) | N/A |
| Produksjonsbygg | `npm run build` | Bygger uten TypeScript- eller lint-feil | N/A |

</frozen-after-approval>

## Code Map

- `README.md`, `.gitignore` -- finnes, skal ikke overskrives av create-next-app. `.gitignore` dekker allerede `node_modules/`, `.next/`, `next-env.d.ts`, `*.tsbuildinfo` og `.env.*` (med `!.env.example`).
- `.env.example` -- fra story 1.1, skal beholdes.
- `fixtures/testsett-a/` -- urørt.
- Spinens mappestruktur: `src/app/` (sider og `api/`), `src/kjerne/`, `src/klient/okt/`, `src/klient/`, `src/server/modell/`, `src/components/ui/`, `prompts/`, `tests/kjerne/`, `tests/eval/`. Bare `src/`-mappene fra AC opprettes nå. `prompts/` og `tests/` kommer med storyene som fyller dem.

## Tasks & Acceptance

**Execution:**
- [x] midlertidig mappe utenfor repoet (sesjonens scratchpad) -- `npx create-next-app@16.4.5 erfaringsgruven --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install --disable-git --yes` -- AC krever midlertidig mappe fordi reporoten ikke er tom
- [x] reporot -- flytt `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `public/`, `src/` inn; slå sammen `.gitignore`-mønstre som mangler; ikke ta med generert `README.md` eller `.git` -- eksisterende filer har forrang
- [x] `package.json` -- `"name": "erfaringsgruven"`, `"dev": "next dev -H 127.0.0.1"`, eksakte versjoner, `"engines": { "node": ">=26.13.0 <27" }` -- AD-1, stack-tabellen og README fra 1.1
- [x] reporot -- `npm install`, deretter `npx shadcn@4.23.0 init` (standardvalg) -- lager `components.json`, `src/lib/utils.ts` og CSS-variabler i `globals.css`
- [x] `src/app/page.tsx`, `src/app/layout.tsx` -- placeholder: overskrift «Erfaringsgruven» og én linje om at appen er under bygging; `lang="nb"`, tittel «Erfaringsgruven» -- AC: tom placeholder-side
- [x] `src/kjerne/.gitkeep`, `src/klient/okt/.gitkeep`, `src/server/modell/.gitkeep`, `src/components/ui/.gitkeep` -- mappestruktur fra spinen
- [x] `public/` -- fjern standardikonene fra create-next-app som placeholderen ikke bruker

**Acceptance Criteria:**
- Given reporoten med eksisterende filer, when prosjektet er satt opp, then `create-next-app` med `--src-dir` er kjørt i en midlertidig mappe og flyttet inn, og `shadcn init` er kjørt (`components.json` finnes).
- Given prosjektet, when `package.json` leses, then `"dev": "next dev -H 127.0.0.1"`.
- Given prosjektet er satt opp, when `npm run dev` kjøres, then appen starter uten feil og viser placeholder-siden på `127.0.0.1`.
- Given prosjektet, when mappene listes, then `src/app`, `src/kjerne`, `src/klient`, `src/server/modell` og `src/components/ui` finnes og er sporet i git.
- Given eksisterende filer, when oppsettet er ferdig, then `README.md`, `.env.example`, `docs/` og `fixtures/` er uendret.

## Implementation Notes

- create-next-app 16.4.5 genererer ingen `postcss.config.mjs`; Tailwind kobles inn via `@tailwindcss/turbopack`-loaderen i `next.config.ts` (beholdt, låst til 4.3.4).
- Generert `next.config.ts` hadde `cacheComponents: true` og `partialPrefetching: true`; begge fjernet (AD-2).
- Generert `react`/`react-dom` var 19.3.0; satt til 19.3.1. `@types/node` satt til `^26` (Node 26).
- `shadcn init --defaults` (stil `base-nova`) lager også `src/components/ui/button.tsx` og legger til `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `shadcn`, `tw-animate-css`. `cn` er shadcn-ui sin egen pakke (erstatter clsx + tailwind-merge).
- `layout.tsx`: Geist-fonten bruker nå variabelen `--font-sans`, som shadcn-CSS-en forventer. Fontvalg byttes i 1.16.
- `AGENTS.md`: `next dev` lager fila i reporoten ved hver oppstart (`node_modules/next/dist/server/lib/generate-agent-files.js`). Den committes, slik Next.js anbefaler, så arbeidskopien holder seg ren. Den peker kodeagenter til Next 16-dokumentasjonen i `node_modules/next/dist/docs/`.
- I/O-matrisen er verifisert med kommandoer (`curl` mot 127.0.0.1 og `[::1]`, `npm run build`), ikke med automatiske tester, fordi Vitest hører til en senere story.
- `public/` er tom etter at standardikonene er fjernet og spores med `.gitkeep`.

## Spec Change Log

## Review Triage Log

Lag: Blind Hunter (BH, 12 funn), Edge Case Hunter (EC, 5 funn), Verification Gap (ingen hull).

| Funn | Verdikt | Rute | Bevis |
|---|---|---|---|
| BH1 `package-lock.json` mangler i diffen | false | avvist | Fila finnes og committes. Den var bare holdt utenfor diff-fila som ble sendt til gjennomgang. |
| BH2 / EC1 `start` binder til alle grensesnitt | medium | patch | `"start": "next start"` uten `-H`. AD-17 sier at trafikken ikke forlater maskinen. Satt til `next start -H 127.0.0.1`. |
| BH3 Verification dekker ikke `[::1]`, mappesporing og alle urørte mapper | low | avvist | Rettingen er å endre specen. |
| BH4 / EC5 `button.tsx` importerer `cn` direkte, ikke via `@/lib/utils` | low | patch | `components.json` sier `utils: @/lib/utils`. Direkte rettelse av importen. |
| BH4 `.gitkeep` i `components/ui` er overflødig | low | patch | `button.tsx` ligger i mappa. Slettet. |
| BH5 `--font-sans: var(--font-sans)` gir syklus | medium | patch | Bygd CSS har `:root{--font-sans:var(--font-sans)}` på samme `<html>` som next/font-klassen med lik spesifisitet, så Geist kan falle bort. Next/font-variabelen heter nå `--font-geist-sans` og mappes til `--font-sans`. |
| BH6 `globals.css` mangler linjeskift til slutt | low | patch | `od` viser at fila slutter på `}`. |
| BH7 `AGENTS.md` lenkes ikke fra `CLAUDE.md` | medium | defer | Claude Code leser `CLAUDE.md`, ikke `AGENTS.md`. Rettingen endrer agentkontekst-filer. |
| BH8 / EC2 `engines` gir bare advarsel | low | avvist | README oppgir versjonen. `engine-strict` ville blokkere installasjon på maskiner med nyere Node uten at det er avtalt. |
| BH9 Spec-loggen er ufullstendig | low | avvist | Status og logger oppdateres av arbeidsflyten. Rettingen er å endre specen. |
| BH10 Standard `src/app/favicon.ico` beholdt | low | avvist | Byttes med merkevaren i story 1.16. Sjelden merkbart. |
| BH11 Villedende kommentar i `eslint.config.mjs` | low | patch | Lista gjentar bare standardene. Kommentaren er rettet. |
| BH12 / EC4 `shadcn` med `^` i `dependencies` | low | patch | `globals.css` importerer `shadcn/tailwind.css`, og stack-tabellen låser 4.23.0. Låst eksakt. |
| EC3 `tsc --noEmit` feiler uten `next typegen` | false | avvist | Ingen script kjører `tsc` alene. `next build` lager typene først og bygger uten feil. |

## Verification

**Commands:**
- `npm run build` -- expected: bygger uten feil
- `npm run lint` -- expected: ingen feil
- `npm run dev` i bakgrunnen, deretter `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/` -- expected: `200`, og HTML-en inneholder «Erfaringsgruven»
- `git diff --stat HEAD -- README.md .env.example docs fixtures` -- expected: tomt
