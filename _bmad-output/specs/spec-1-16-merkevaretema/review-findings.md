# Review Findings: story 1.16

Kodegjennomgang (`bmad-code-review`) 2026-11-24 av 7f86411..237b0a4 mot d9c8f1f (uten `_bmad-output/` og `package-lock.json`). Fire lag: Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor. Gruppert ga det 13 funn: 5 patch, 2 defer og 6 avvist. Acceptance Auditor fant ingen brudd på akseptkriteriene. Victoria valgte å ta med alle patchene.

- [x] [Review][Patch] Kontrastsjekken hoppet over `main()` og avsluttet med 0 når den ble kjørt via en symlinket sti (`argv[1]` mot realpath) [scripts/kontrast.mjs:98]. Scriptet kjører nå alltid; verifisert via symlink.
- [x] [Review][Patch] Ingenting kjørte kontrastsjekken automatisk [package.json]. Har nå `"prebuild": "npm run kontrast"`.
- [x] [Review][Patch] Sjekken leste bare `:root` og fanget ikke opp feil `--color-*`-kobling i `@theme inline` [scripts/kontrast.mjs]. Den feiler nå hvis `--color-<navn>` ≠ `var(--<navn>)`; verifisert med `--color-gap-foreground: var(--gap-border)` → exit 1.
- [x] [Review][Patch] `--radius: 14px` gjorde `rounded-xl` og oppover ca. 20–36px [src/app/globals.css]. Nå er `--radius-lg: 14px` satt direkte, og `--radius` er tilbake til shadcn-standarden.
- [x] [Review][Patch] Flere tekstpar fra DESIGN.md ble ikke sjekket [scripts/kontrast.mjs]. Lagt til `card-foreground`/`card`, `foreground`/`muted`, `muted-foreground`/`card`, `primary`/`background` og `primary`/`card`.
- [x] [Review][Defer] Fokusringen har 2,44:1 (1,50:1 med `/50`) mot bakgrunnen, mens WCAG 1.4.11 krever 3:1 [src/app/globals.css:`--ring`] — deferred: problemet fantes før (2,58:1 mot hvitt), og `ring` arves fra shadcn etter specen; gruppen bestemmer.
- [x] [Review][Defer] `chat-body` i serif var uenig med DESIGN.md-tokenet og mockupen [DESIGN.md] — deferred: tokenet har fått `fontFamily: 'Source Serif 4'` (Victoria). Mockupen endres ikke, fordi spines vinner ved konflikt; ført som bevisst avvik.

**Rejected:**
- `.dark\:`-selektorer i bygd CSS — false: de ender på `:not(*)` og kan aldri slå inn; ingen `prefers-color-scheme: dark`. Den eneste rettelsen ville vært å endre specen.
- `rounded-md` på alle knappevarianter, ikke bare primær — false: DESIGN.md «Shapes» gir `{rounded.md}` på knapper generelt.
- `in-data-[slot=button-group]:rounded-lg` gir 14px — low: ingen knappegruppe finnes; shadcn-standarden beholdes.
- Parseren tåler ikke `}` i kommentarer eller flere `:root` — low: lite sannsynlig. Kommentarer fjernes nå før lesing, og flere blokker ville krevd mer logikk.
- Flyttallsgrense ved nøyaktig 4,5:1 — low: ingen par ligger nær grensen.
- Fargeverdiene sammenlignes ikke mot DESIGN.md — low: ville krevd YAML-parsing; verdiene er sjekket i gjennomgangen.
- Ingen automatisk test av at mørk modus er slått av — low: verifisert manuelt i bygd CSS; Vitest kommer senere.
