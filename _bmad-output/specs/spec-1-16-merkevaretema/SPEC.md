---
id: SPEC-1-16-merkevaretema
companions:
  - ../../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md
  - ../../implementation-artifacts/epic-1-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Story 1.16: Merkevaretema og kontrastverifisering

## Why

Visjon og krav: appen bruker shadcn-standarden (kalde gråtoner, Geist, mørkt tema fra `init`). Studenten skal i stedet møte et rolig og varmt produkt med Erfaringsgruvens egne farger og typografi (UX-DR1), med kontrast som er verifisert mot WCAG 2.2 AA (UX-DR2). Alle senere UI-stories bygger på disse tokenene, så de må være på plass og riktige nå.

## Capabilities

- **CAP-1** Fargetokens
  - **intent:** shadcn-tokens overstyres med paletten i DESIGN.md (`background`, `foreground`, `card`, `muted`, `border`, `primary` med forgrunner), og `covered`, `covered-foreground`, `gap`, `gap-foreground`, `gap-border` og `quote-mark` blir Tailwind-farger.
  - **success:** Bygd CSS gir `bg-background` = `#FBF8F3` og `bg-primary` = `#1F5E4A`, og `bg-covered`, `text-covered-foreground`, `bg-gap`, `text-gap-foreground`, `border-gap-border` og `border-quote-mark` kan brukes.
- **CAP-2** Typografi
  - **intent:** Inter er sans-fonten for brødtekst (15px / 1.5). Source Serif 4 (normal og kursiv) brukes i rollene `display`, `display-sm`, `quote` og `chat-body`, som ferdige utilities med målene fra DESIGN.md.
  - **success:** Siden laster Inter og Source Serif 4 selvhostet, og `type-display`, `type-display-sm`, `type-quote` og `type-chat-body` gir familie, størrelse, vekt, linjehøyde og bokstavavstand som i DESIGN.md.
- **CAP-3** Form og layoutmål
  - **intent:** `rounded`-skalaen (sm 6px, md 10px, lg 14px, full) og layoutmålene (`content-max`, `chat-max`, `column-max`, `section-gap`, `side-panel`) kan brukes som Tailwind-utilities.
  - **success:** `rounded-sm/md/lg` gir 6/10/14px, og `max-w-content-max` (1200px), `max-w-chat-max` (720px), `max-w-column-max` (880px), `gap-section-gap` (32px) og `w-side-panel` (360px) finnes.
- **CAP-4** Bare lyst tema
  - **intent:** Det mørke temaet fra `shadcn init` er borte, og `dark:`-klasser i shadcn-komponenter slår aldri inn, heller ikke når operativsystemet er i mørk modus.
  - **success:** Bygd CSS har ingen `.dark`-regler og ingen `prefers-color-scheme: dark`-regler, og `:root` har `color-scheme: light`.
- **CAP-5** Kontrastverifisering
  - **intent:** Kontrasten i de seks fargeparene fra DESIGN.md, og i tekstparene komponentene bruker, sjekkes automatisk mot verdiene i `globals.css` hver gang appen bygges.
  - **success:** `npm run kontrast` (som også kjøres før `npm run build`) skriver forholdstallet for hvert par og avslutter med feilkode hvis ett par er under målet: `foreground`/`background` ≥7:1, `primary-foreground`/`primary`, `covered-foreground`/`covered`, `gap-foreground`/`gap`, `muted-foreground`/`background` og `muted-foreground`/`muted` ≥4,5:1, og `card-foreground`/`card`, `foreground`/`muted`, `muted-foreground`/`card`, `primary`/`background` og `primary`/`card` ≥4,5:1. Den feiler også hvis en sjekket farge mangler `--color-<navn>: var(--<navn>)` i `@theme inline`.

## Constraints

- Å slette `@custom-variant dark` er ikke nok. Tailwind 4 faller da tilbake til `prefers-color-scheme: dark`, og `dark:`-klassene i shadcn-komponentene slår inn. Varianten må omdefineres til en selector som aldri matcher.
- Tokens som DESIGN.md ikke nevner (`popover`, `input`, `ring`, `destructive`, `secondary`, `accent`, `chart-*`, `sidebar-*`), arves uendret fra shadcn.
- Fonter lastes via `next/font/google`, som selvhoster dem, så nettleseren sender ingen forespørsler til Google (AD-17). Ingen `<link>` til Google Fonts.
- Typografi-utilitiene får ikke `text-*`-navn. `cn`/tailwind-merge tolker ukjente `text-*` som farge og fjerner dem når de slås sammen med `text-<farge>`.
- Serif brukes bare i de fire rollene. `--font-heading` peker til sans, fordi shadcn bruker `font-heading` på titler.
- Kontrastsjekken legger ikke til avhengigheter. Den er et rent Node-script, siden Vitest kommer i en senere story.
- Primærknappen har `rounded-md` (10px), som DESIGN.md sier. Ellers er `button.tsx` uendret.
- `rounded-xl` og større avledes fra shadcn-standarden `--radius`, som er uendret. Bare sm, md og lg settes direkte.

## Non-goals

- Mørk modus, temabytter eller `next-themes`.
- Komponentstiler med merkevarelag (chatbobler, erfaringskort, kravrader, stegindikator, bevissitat med kursiv osv.). De lages i sine egne stories.
- Responsivt oppsett (story 1.17).
- Merkevare-favicon, siden det ikke finnes noen ressurs for det.

## Success signal

- `npm run build`, `npm run lint` og `npm run kontrast` går uten feil. Placeholder-siden vises med varm bakgrunn, overskrift i Source Serif 4 og brødtekst i Inter, også når macOS står i mørk modus.

## Assumptions

- Placeholder-siden tar i bruk `type-display` og `muted-foreground` for å vise temaet. Ingen nye flater lages.
- `type-quote` setter ikke kursiv. Kursiven hører til komponenten `evidence-quote` (story 3.3).
- Kanter og flater med lav kontrast med vilje (`gap-border` mot `gap`, studentboble, tom brikke) er ikke med i kontrastsjekken, slik DESIGN.md sier.
