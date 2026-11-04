---
type: review
lens: rubric (good-spine checklist)
target: ../ARCHITECTURE-SPINE.md
date: 2026-11-04
verdict: pass with fixes
---

# Rubric review: ARCHITECTURE-SPINE.md (Erfaringsgruven)

**Verdict: pass with fixes.** The spine is lean, well-structured, and nails the hard
invariants (stateless server, append-only log, verbatim quote verification, core-derived
status, demo behind the model interface). The main gap is the operational envelope for
the model provider: timeouts, retries, error mapping and cost limits are not decided,
deferred or listed as open. Two smaller divergence points come from the stateless-server
rule (E/K ID allocation, demo playback position).

## Checklist

| # | Criterion | Result | Notes |
|---|---|---|---|
| 1 | Fixes the real divergence points for epics/stories, misses none | Partial | Core points are covered (AD-2, 4, 5, 6, 7, 9, 10). Missed: model call timeout/retry ownership (F1), stateless E/K ID allocation (F2), demo playback index (F3), what "verifisert svarId" means for R-H-R fields (F4). |
| 2 | Each AD's Rule is enforceable and prevents its stated divergence | Mostly | AD-1, 2, 5, 6, 9, 11, 12 are concrete and testable. AD-7's "verifisert `svarId`" is undefined for fields (F4). AD-1 "never reads the key" could be enforced mechanically with `import 'server-only'` (F7). |
| 3 | Nothing under "Utsatt" lets two units diverge | Pass | Hosting/CI/rate limiting (local only), fasit matching (test-only), prompt content (schema and location are fixed), out-of-scope features, client component structure (single owner). None split ownership. |
| 4 | Named tech verified current | Pass | Checked today against registry.npmjs.org: next 16.4.5, react 19.3.1, @anthropic-ai/sdk 1.5.0, zod 4.6.7, vitest 5.1.0, tailwindcss 4.3.4, shadcn 4.23.0 are all `latest`. Node v26.13.0 is the current "Lithium" LTS (nodejs.org/dist/index.json, 2026-10-28). `claude-haiku-5-5` is listed on the Anthropic models overview. "TypeScript: følger create-next-app" is acceptable. |
| 5 | Covers spec capabilities FR-1..FR-9 | Pass | Every FR is in the "Kart" table with an owner location and governing ADs. FR-1's "minst ett oppfølgingsspørsmål før avslutt" and FR-3's "≥3 fanget → tilbud, aldri automatisk" rest on `erFanget()` plus UI. That is adequate at this altitude. |
| 6 | Every owned dimension decided/deferred/open, incl. operational envelope | **Gap** | Deployment and environments are decided (local only, 127.0.0.1, `.env.local`, Node 26). Provider strategy is decided (one provider, demo adapter, config in one file). **Operations are not covered:** request timeout, retry policy (SDK default vs. client "Prøv igjen"), mapping of 429/529/timeouts to error codes and HTTP status, `max_tokens` values, and any per-session cost or turn cap (PRD §5 "dimensjonert for lav kostnad"). See F1 and F5. |
| 7 | Mermaid diagrams valid | Pass | Flowchart: quoted subgraph titles, `[( … <br/> … )]` cylinder labels and `-->|label|` edges are valid syntax. erDiagram: all cardinalities (`||--o{`, `||--o|`, `||--|{`, `}o--o{`, `}o--||`) and quoted labels are valid. No reserved-word clashes. |
| 8 | Not bloated with rationale | Pass | Rationale lives in `.memlog.md`. The spine keeps only the one-line Prevents and Rule per AD. AD-6's "Begrensning" note is load-bearing because it states a scope limit, so it is not bloat. |

## Findings

### F1 — HIGH — Model-call operations envelope is undecided
Nothing says who retries (the SDK's built-in retries, the route, or only the user's "Prøv
igjen"). Nothing sets the request timeout, how 429/overloaded/timeout map to `modell_feil`
and to HTTP status, or what the client does while waiting (no streaming, so latency is
user-visible). Three students building `/api/samtale`, `/api/krav` and `/api/bevis` will
choose differently.
**Fix:** add an AD (or extend the error-convention row): "All model calls go through
`src/server/modell/anthropic.ts` with timeout X s and `maxRetries` N set in `config.ts`.
Routes never retry. Timeout, 429, 5xx and overloaded all map to `modell_feil` (HTTP 502/503).
The client retries only when the user clicks 'Prøv igjen'." Deciding the numbers can be
moved to "Utsatt" if needed, but the ownership rule must be fixed now.

### F2 — MEDIUM-HIGH — E/K ID allocation conflicts with a stateless server
AD-5 says E and K IDs are "tildelt av kjernen i API-ruten", but AD-2 says the route
remembers nothing. The rule doesn't say how the next ID is derived, or whether IDs of
deleted erfaring cards are reused. Two implementations could both emit `E1` or renumber
after a deletion, which breaks `svarIder`/bevis references.
**Fix:** add to AD-5: "`nesteId(prefix, okt)` in `kjerne/ider.ts` = max existing number in
the submitted state (including deleted cards, tracked by the client) + 1; IDs are never
reused or renumbered."

### F3 — MEDIUM — Demo playback position is unspecified
`DemoModell` replays stored responses on a stateless server, and `/api/demo/manus` feeds
student answers. Nothing fixes how either one knows "which turn" it is on. If one counts
`S` entries and the other counts requests, they drift. Rettelser (R-entries) or a "Ferdig"
pressed early can also desynchronise the replay.
**Fix:** state in AD-10: "The demo turn index = the number of `svar` entries in the
submitted log; demo replies are keyed by that index in `fixtures/testsett-a/demo/`; edits
on Oppsummering in demo mode are allowed but do not change the recorded `/api/bevis` reply."

### F4 — MEDIUM — "Verifisert svarId" for R-H-R fields is undefined
AD-7's `erFanget()` requires "minst én verifisert `svarId`" per field, but AD-6 only defines
verification for `{svarId, sitat}` bevis. Fields carry `svarIder` and no quote. One builder
may check only that the ID exists, another may require a quote.
**Fix:** define it in AD-5 or AD-7: "A field `svarId` is verified when it refers to an
existing `svar`/`rettelse` entry in the submitted log (unknown IDs are dropped by the
route)." If the popover excerpt needs a quote, require `verifiserSitat` for it too.

### F5 — MEDIUM — No cost guardrail
PRD §5 requires low cost per session, and the addendum estimates ~15 calls per session. But
the whole log is resent every turn (AD-2), and nothing caps conversation length,
`max_tokens`, or announcement length. `config.ts` names the location but not the values.
**Fix:** put concrete `max_tokens` per step and a max announcement and log size (rejected
as `ugyldig_foresporsel`) in `config.ts` via the spine, or list "kostnadsgrenser" explicitly
as an open question with an owner.

### F6 — LOW — Open question Å-1 can invalidate AD-1 wholesale
If IBE160 mandates a stack, every AD that names Next.js, App Router routes or `useReducer`
changes.
**Fix:** give Å-1 a deadline before epic breakdown, and note in the spine which ADs are
stack-independent (AD-2, 5, 6, 7, 8, 11, 12).

### F7 — LOW — Make AD-1 and route runtime mechanically enforceable
**Fix:** require `import 'server-only'` at the top of `src/server/modell/*`, and
`export const runtime = 'nodejs'` in API routes. Routes read `prompts/*.md` from disk and
use the SDK, so they cannot run on the Edge runtime.

### F8 — LOW — Step-reset mapping is not pinned
AD-4 puts the reset of later steps in the reducer via a core function, but doesn't say which
change resets which steps. EXPERIENCE.md presumably defines it.
**Fix:** reference the exact EXPERIENCE.md section, or add a one-line table (Samtale/
Oppsummering change → clear annonse, krav, bevis; Annonse change → clear krav, bevis;
and so on).

## What is strong
- The functional core / thin shell split, with "modellen foreslår, kjernen bestemmer", is
  the right spine for AI-assisted builders.
- AD-6 runs in both modes and before data leaves the server. Together with the AD-11 K5
  trap, this makes SM-C1 demonstrable.
- One Zod schema file shared by route, client and tests (AD-9) removes the most common
  shape drift.
- The privacy envelope (AD-2, AD-3, AD-12, binding to 127.0.0.1) is consistent and testable.
