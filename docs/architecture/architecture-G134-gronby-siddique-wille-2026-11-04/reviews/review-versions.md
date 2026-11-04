---
type: review
lens: versions / reality-check (were technology claims verified against the web, the project, or the live starter?)
target: ../ARCHITECTURE-SPINE.md
date: 2026-11-04
verdict: pass with fixes
---

# Versions review: ARCHITECTURE-SPINE.md (Erfaringsgruven)

**Verdict: pass with fixes.** Every version in the Stack table matches today's `latest` on npm and nodejs.org, and `claude-haiku-5-5` is a valid, current model. The problems are in what the spine *assumes about how those versions behave*. Those assumptions look like they come from older training data:
- `temperature` was removed from the API version that SDK 1.x sends.
- The live `create-next-app` and `shadcn` defaults don't produce the `src/` layout the spine describes.
- `create-next-app` won't scaffold into this repo root.
- The generated `dev` script doesn't bind to 127.0.0.1.

## Method

npm and node are not installed locally, so everything was checked remotely on 2026-11-04:

- `curl https://registry.npmjs.org/<pkg>/latest` for every package. I also downloaded and inspected the published tarballs of `create-next-app`, `next`, `shadcn`, `@anthropic-ai/sdk` and `vitest` (CLI flags, template defaults, type definitions, peer deps, CHANGELOG).
- `https://nodejs.org/dist/index.json` and `nodejs/Release` `schedule.json`.
- Official docs:
  - nextjs.org/docs/app/getting-started/installation
  - ui.shadcn.com/docs/installation/next
  - platform.claude.com models overview, structured-outputs and API versioning
- The existing repo itself: root listing and `.gitignore`.

## Stack table: version check

| Spine | Claimed | Live (2026-11-04) | Result |
|---|---|---|---|
| Node.js LTS | 26.13.0 | v26.13.0, released 2026-10-28, `lts: "Lithium"`. Node 26 entered LTS 2026-10-28. Node 24 entered maintenance 2026-10-20 | ✅ correct |
| Next.js | 16.4.5 | 16.4.5, `engines.node >=20.9.0` | ✅ |
| React | 19.3.1 | 19.3.1 (Next peer `^19.0.0`) | ✅ |
| TypeScript | "følger create-next-app" | create-next-app 16.4.5 writes `typescript: "^5"`, but npm `latest` is **7.0.2**. Next docs: minimum 5.1 | ⚠ see F5 |
| Tailwind CSS | 4.3.4 | 4.3.4. create-next-app writes `tailwindcss: "^4"` + `@tailwindcss/postcss` | ✅ |
| shadcn CLI | 4.23.0 | 4.23.0, `engines.node >=20.18.1` | ✅ version. ⚠ init template, see F2 |
| @anthropic-ai/sdk | 1.5.0 | 1.5.0 (published 2026-11-04, today). Peer `zod: ^3.25.0 \|\| ^4.0.0` | ✅ version. ❌ temperature, see F1 |
| Zod | 4.6.7 | 4.6.7. SDK helper imports `zod/v4`, which Zod 4 exports | ✅ |
| Vitest | 5.1.0 | 5.1.0, `engines.node ^22.12 \|\| ^24 \|\| >=26`. **Non-optional peer `vite ^6.4 \|\| ^7 \|\| ^8`** (vite latest 8.3.5) | ✅, minor note in F5 |
| Model | claude-haiku-5-5 | Listed on the platform.claude.com models overview as the current Haiku. It's in the SDK `Model` union and retires no sooner than 2027-10-07 | ✅ |

The spine's sentence "Versjonene er sjekket mot npm og nodejs.org 4. november 2026" holds for the numbers. It does not cover the behaviour of those versions, which is where the findings below come from.

## Specific questions

1. **Next.js 16 on Node 26.** `next@16.4.5` declares `engines.node >=20.9.0`, and the Next docs give 20.9 as the minimum. Neither the docs nor the package mention Node 26 explicitly, so there is no official test-matrix confirmation. Engines allow it, and Vitest 5 explicitly lists `>=26`. **Fits. Explicit support is inferred, not stated.**
2. **`next dev -H 127.0.0.1`.** Confirmed in `next/dist/bin`: `-H, --hostname <hostname>` with default `0.0.0.0`. Both `-H` and `--hostname` work. The default really is all interfaces, so the flag is necessary. But create-next-app writes `"dev": "next dev"` (see F3).
3. **create-next-app defaults** (from the 16.4.5 tarball and the Next docs). The "recommended defaults" answer gives TypeScript ✅, ESLint, Tailwind ✅, App Router ✅, **`srcDir: false`** ❌, **Cache Components on** (writes `cacheComponents: true` into `next.config`), AGENTS.md on, Turbopack, alias `@/*`. The template `gitignore` contains **`.env*`**, which ignores `.env.local` ✅ but also ignores `.env.example` ❌. The repo's existing `.gitignore` already has `!.env.example`, so this only bites if the template's gitignore replaces the repo's.
4. **shadcn v4 + Next 16 + Tailwind 4.** The CLI detects `next-app`, validates Tailwind v4, and is template-driven. The docs' "CLI path" is `shadcn@latest init -t next`, which **creates a new Next app from shadcn's own `next` template**. That template's files target `app/page.tsx`, with no `src/`. For an existing create-next-app project, plain `shadcn init` is the documented path. The docs don't state Next 16 or Tailwind 4 compatibility in words, but the CLI's v4 detection code is present.
5. **Anthropic structured JSON.** Structured outputs are GA, and `claude-haiku-5-5` is in the supported-models list. No beta header is needed. The SDK 1.5.0 way to do it:
   ```ts
   import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
   const res = await client.messages.parse({
     model, max_tokens, system, messages,
     output_config: { format: zodOutputFormat(Skjema) },
   });
   res.parsed_output // typed, validated against the original Zod schema
   ```
   The old top-level `output_format` is deprecated. There's no need for the tool-use trick. The SDK strips constraints the API rejects (`minLength`, `maximum`, `minItems > 1`, recursion, …) from the wire schema and re-validates locally.
6. **Zod 4 with the SDK.** Supported: peer `^3.25 || ^4`, and `helpers/zod` imports `zod/v4`. ✅
7. **Vitest 5 with Next.** It fits for `tests/kjerne/`, which is pure TypeScript with no React plugin needed. Vitest 5 needs `vite` installed as a peer. npm ≥7 auto-installs it, but declare it explicitly. If tests import via the `@/*` alias, the Vitest config must resolve tsconfig paths. Not verified for Vite 8 (native `resolve.tsconfigPaths` vs the `vite-tsconfig-paths` plugin).

## Findings

### F1 — HIGH — `temperature` in `config.ts` will make every real model call fail with 400
The "Modellkonfigurasjon" row puts temperature in `src/server/modell/config.ts`. SDK 1.0.0 (2026-10-21) switched to API version `2026-10-21`. The official versioning page says: "The `temperature`, `top_p`, and `top_k` request parameters are removed. A request that sends any of them returns a 400 error on every model." In SDK 1.5.0, `MessageCreateParamsBase` has no `temperature` field.
**Fix:** drop temperature from the convention row. Make the row "Modell-ID, `max_tokens` og eventuelt `output_config.effort`". If the group wants more deterministic output, steer it through the prompt and `effort` (Haiku 5.5 default is `medium`), not sampling parameters.

### F2 — MEDIUM — The live starters don't produce the spine's `src/` layout, and create-next-app refuses this repo root
- **Layout.** The spine's tree is built on `src/app`, `src/kjerne`, … create-next-app 16.4.5 defaults to `srcDir: false`, and `shadcn init -t next` (the "init-mal `next`" in the Stack table) scaffolds shadcn's own Next template with `app/` at the root.
- **Repo root.** `create-next-app`'s `isFolderEmpty` only allows `.git`, `.gitignore`, `docs`, `LICENSE`, `.claude` and a few similar names. This repo root already has `README.md`, `CLAUDE.md`, `_bmad/` and `fixtures/`, so scaffolding into `.` aborts with "contains files that could conflict".

**Fix:** add a one-line scaffold recipe to the spine, for example:
1. `npx create-next-app@16.4.5 tmp-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*"` in a temporary folder.
2. Move the result into the root. Keep the repo's own `.gitignore`, `README.md` and `CLAUDE.md`, and decide whether to keep `AGENTS.md`.
3. Run `npx shadcn@4.23.0 init` (not `-t next`) in the root.

Change the Stack row from "init-mal `next`" accordingly.

### F3 — MEDIUM — `npm run dev` won't bind to 127.0.0.1 unless the script is changed
`next dev` defaults to `0.0.0.0` (confirmed in the CLI source). create-next-app writes `"dev": "next dev"`. The sensor README says `npm run dev`, so the localhost guarantee (PRD §5) only holds if `package.json` is edited.
**Fix:** state in the Dev-server row that `package.json` must have `"dev": "next dev -H 127.0.0.1"`. Optionally add a test or lint check that asserts it.

### F4 — LOW — Cache Components is on by default and not mentioned
The recommended create-next-app defaults now write `cacheComponents: true`. With Cache Components, a `GET` route handler that touches no dynamic API can be prerendered. `GET /api/status` reads only `process.env` (`harNokkel`), so under `next build`/`next start` it could freeze the build-time answer. This is harmless in `next dev`, which is all v1 uses. Not verified empirically.
**Fix:** either decide "Cache Components av" (answer No / remove the flag), or require `await connection()` (or equivalent) in `/api/status` and `/api/demo/manus`.

### F5 — LOW — "TypeScript følger create-next-app" silently means 5.x while `latest` is 7.0.2, and some peers are implicit
create-next-app pins `typescript: "^5"`, `@types/node: "^20"`. Someone running `npm i -D typescript@latest` would jump to TS 7, and I found no confirmation that Next 16.4 supports it. Vitest 5 has a non-optional `vite` peer. `@types/node ^20` lags Node 26.
**Fix:** write "TypeScript 5.x (create-next-app pinner `^5`; ikke oppgrader til 7 uten å sjekke Next)". Add `vite` (8.x) explicitly to devDependencies next to Vitest. Optionally bump `@types/node` to match Node 26.

### F6 — LOW — Structured-output mechanism is unnamed
AD-9 says "Modellen bes om strukturert JSON etter skjemaet" but doesn't fix *how*. One route builder could pick `output_config.format`, another tool-use, another a prompt plus `JSON.parse`.
**Fix:** add to AD-9: "via `client.messages.parse` + `zodOutputFormat()` fra `@anthropic-ai/sdk/helpers/zod`". Also note that Zod constraints the API doesn't support (lengths, ranges, `.refine`) are enforced locally, not by the model. The route's own Zod validation (already in AD-9) stays the authority.

## Unverifiable / inferred

- Next.js 16 on Node 26: allowed by `engines`, but there is no explicit statement in the docs.
- TypeScript 7 with Next 16.4: no confirmation found either way. Hence the advice to stay on 5.x.
- Cache Components behaviour for an env-only `GET` route handler (F4): inferred from the documented prerendering model, not tested.
- Vitest 5 / Vite 8 tsconfig-path resolution: not checked.
- The temperature removal was read on the official versioning page and in the SDK types and CHANGELOG. It was not tested with a live API call, since there is no key in this environment.
