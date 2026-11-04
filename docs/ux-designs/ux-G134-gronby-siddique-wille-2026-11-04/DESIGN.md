---
name: Erfaringsgruven
description: Samtalebasert verktøy som hjelper studenter finne egen erfaring og koble den, krav for krav, til en stillingsannonse. shadcn/ui + Tailwind; denne DESIGN.md beskriver bare merkevarelaget som legges oppå.
status: final
created: 2026-11-04
updated: 2026-11-04
sources:
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/addendum.md
colors:
  # Overstyringer på toppen av shadcn-defaults. Tokens som ikke står her
  # (popover, input, ring, destructive o.l.) arves fra shadcn.
  background: '#FBF8F3'
  foreground: '#1F2421'
  card: '#FFFFFF'
  card-foreground: '#1F2421'
  muted: '#F1ECE3'
  muted-foreground: '#5E6660'
  border: '#E4DDD1'
  primary: '#1F5E4A'
  primary-foreground: '#FFFFFF'
  covered: '#E3F0EA'
  covered-foreground: '#1F5E4A'
  gap: '#F4EEE3'
  gap-foreground: '#6B5B3E'
  gap-border: '#CDBF9F'
  quote-mark: '#1F5E4A'
typography:
  # Brødtekst, label og muted arves fra shadcn sin sans-ramp, satt til Inter.
  body:
    fontFamily: 'Inter'
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  display:
    fontFamily: 'Source Serif 4'
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  display-sm:
    fontFamily: 'Source Serif 4'
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.25'
  quote:
    fontFamily: 'Source Serif 4'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  chat-body:
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  # Mykere enn shadcn-default: stemningen er varm og rolig, ikke «verktøy».
  sm: 6px
  md: 10px
  lg: 14px
  full: 9999px
spacing:
  # Tailwind-skalaen arves. Kun layoutmål legges til.
  content-max: 1200px
  chat-max: 720px
  column-max: 880px
  section-gap: 32px
  side-panel: 360px
components:
  button-primary:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.md}'
  chat-bubble-assistant:
    background: '{colors.card}'
    foreground: '{colors.card-foreground}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
  chat-bubble-student:
    background: '{colors.muted}'
    foreground: '{colors.foreground}'
    radius: '{rounded.lg}'
  experience-card:
    background: '{colors.card}'
    border: '{colors.border}'
    radius: '{rounded.md}'
  rha-chip:
    background: '{colors.muted}'
    foreground: '{colors.muted-foreground}'
    border-empty: '{colors.gap-border}'
    background-filled: '{colors.covered}'
    foreground-filled: '{colors.covered-foreground}'
    radius: '{rounded.full}'
  progress-meter:
    track: '{colors.muted}'
    fill: '{colors.primary}'
    radius: '{rounded.full}'
  requirement-row-covered:
    background: '{colors.card}'
    border: '{colors.border}'
    marker: '{colors.primary}'
    tag-background: '{colors.covered}'
    tag-foreground: '{colors.covered-foreground}'
    radius: '{rounded.md}'
  requirement-row-gap:
    background: '{colors.gap}'
    foreground: '{colors.gap-foreground}'
    border: '{colors.gap-border}'
    radius: '{rounded.md}'
  evidence-quote:
    typography: '{typography.quote}'
    fontStyle: italic
    rule: '{colors.quote-mark}'
  transcript-highlight:
    background: '{colors.covered}'
    foreground: '{colors.covered-foreground}'
  step-indicator:
    active-background: '{colors.covered}'
    active-foreground: '{colors.covered-foreground}'
    done-foreground: '{colors.primary}'
    upcoming-foreground: '{colors.muted-foreground}'
    radius: '{rounded.full}'
  demo-banner:
    background: '{colors.muted}'
    foreground: '{colors.muted-foreground}'
---

## Brand & Style

Erfaringsgruven skal kjennes som å sitte med en rolig, interessert veileder, ikke som å fylle ut et skjema eller bli vurdert. Studenten kommer ofte inn med «jeg har ikke relevant erfaring». Visuelt skal produktet derfor gjøre det motsatte av å stresse: varm papirbakgrunn, mye luft, én dyp grønn aksent som betyr *funnet / dekket*, og en serif i overskrifter og sitater, slik at studentens egne ord leses som noe verdifullt og ikke som systemtekst.

Grunnlaget er shadcn/ui. Denne filen beskriver bare merkevarelaget: varme nøytraler, grønn primærfarge, to semantiske tilstander (dekket og hull), serif for visning og sitat, og mykere hjørner. Alt annet arves.

## Colors

- **Dyp grønn (`#1F5E4A`)** er primærfargen: primærknapper, fremdriftsmåleren og markøren for dekkede krav. Grønt betyr *funnet*.
- **Dekket (`covered`, `#E3F0EA`)** er en lys grønn flate for fylte R-H-R-brikker, «Dekket»-merket, aktivt steg og markert svar i samtaleloggen. Markøren (venstrestreken) på en dekket kravrad er `{colors.primary}`, fordi `covered` mot hvitt kort bare gir 1,17:1 og blir usynlig.
- **Hull (`gap`, `#F4EEE3`, kant `#CDBF9F`, tekst `#6B5B3E`)** er en varm sandtone. Den skal være **nøytral og ikke-dømmende**: et hull er et sted å reflektere videre, ikke en feil. Rødt, oransje og advarselsikoner brukes aldri for hull.
- **Varme nøytraler**: bakgrunn `#FBF8F3`, kort `#FFFFFF`, muted `#F1ECE3`, kant `#E4DDD1`. De erstatter shadcn sine kalde gråtoner.
- `destructive` arves fra shadcn og brukes bare på ekte systemfeil (f.eks. at API-kallet feilet), aldri om studentens innhold.

Kontrastmål (WCAG 2.2 AA), som må verifiseres i implementasjonen:

| Kombinasjon | Mål |
|---|---|
| `foreground` på `background` | ≥ 7:1 |
| `primary-foreground` på `primary` | ≥ 4.5:1 |
| `covered-foreground` på `covered` | ≥ 4.5:1 |
| `gap-foreground` på `gap` | ≥ 4.5:1 |
| `muted-foreground` på `background` | ≥ 4.5:1 |
| `muted-foreground` på `muted` | ≥ 4.5:1 |

Kanter og flater (`gap-border` mot `gap`, studentboble mot bakgrunn, tom R-H-R-brikke) har lav kontrast med vilje. De bærer aldri mening alene, fordi teksten «Dekket», «Ikke dekket ennå» og «Rolle/Handling/Resultat» alltid står der.

Mørk modus er ikke med i v1. Appen har bare lyst tema.

## Typography

Brødtekst, labels og skjemaer bruker `{typography.body}` (Inter, shadcn sin sans-ramp). Serifen **Source Serif 4** brukes bare i tre roller:

- `display` / `display-sm`: overskrift på startsiden, på oppsummeringen og på bevistabellen.
- `quote`: studentens egne ord i bevistabellen, kursiv med grønn venstrestrek. Kursiven ligger på komponenten `evidence-quote`. Det visuelle skillet mellom *studentens ord* og *systemets ord* er selve sporbarhetsløftet.
- `chat-body` (16px / 1.6) gir god lesbarhet i lange samtaler.

## Layout & Spacing

Tailwind-skalaen arves. Bredeste innhold er `{spacing.content-max}`.

- **Samtale:** to kolonner på `lg+`. Chatten (maks `{spacing.chat-max}`) står til venstre og sidepanelet (`{spacing.side-panel}`) til høyre.
- **Oppsummering, annonse, kravliste og bevistabell:** én kolonne, sentrert, maks `{spacing.column-max}`. Bevistabellen er en liste med rader, ikke et regneark.
- Romslig vertikal rytme: `{spacing.section-gap}` (Tailwind `space-y-8`) mellom seksjoner, 12px mellom kravrader.

## Elevation & Depth

Arves fra shadcn. Ingen skygge brukes til å vise hierarki, bare kanter og flater. `Sheet` («Vis i samtalen») bruker shadcn sitt overlay.

## Shapes

Mykere enn shadcn: `{rounded.sm}` på input, `{rounded.md}` på knapper og kort, `{rounded.lg}` på chatbobler og dialoger. `{rounded.full}` brukes bare på R-H-R-brikker, fremdriftsmåleren og statusmerker.

## Components

Disse shadcn-komponentene brukes uendret: `Button` (unntatt primær), `Card`, `Textarea`, `Sheet`, `Dialog`, `Badge`, `Toast` (sonner), `Tooltip`, `Separator`, `Skeleton`.

Komponenter med merkevarelag (vist i [`mockups/samtale.html`](mockups/samtale.html) og [`mockups/bevistabell.html`](mockups/bevistabell.html)):

| Komponent | Visuell spesifikasjon |
|---|---|
| **Button (primær)** | `{colors.primary}`-fyll, `{colors.primary-foreground}`-tekst, `{rounded.md}`. |
| **Chatboble (assistent)** | `{colors.card}`, 1px `{colors.border}`, `{rounded.lg}`, `{typography.chat-body}`. Venstrejustert. |
| **Chatboble (student)** | `{colors.muted}`, ingen kant, `{rounded.lg}`. Høyrejustert. |
| **Erfaringskort** | Kort i sidepanelet: tittel (f.eks. «Butikkjobb») og tre R-H-R-brikker. `{colors.card}`, `{rounded.md}`. |
| **R-H-R-brikke** | Pille for Rolle / Handling / Resultat. Tom: `{colors.muted}` med stiplet kant. Fylt: `{colors.covered}` med hake. |
| **Fremdriftsmåler** | Tre segmenter («0 av 3 erfaringer»). Spor `{colors.muted}`, fyll `{colors.primary}`. Ved mer enn 3 er alle segmentene fylt. |
| **Kravrad (dekket)** | Hvitt kort, 1px `{colors.border}`, 4px venstrestrek i `{colors.primary}` og merket «Dekket» (`{colors.covered}` / `{colors.covered-foreground}`). Inneholder kravtekst, erfaringsnavn, bevissitat og lenken «Vis i samtalen». |
| **Kravrad (hull)** | `{colors.gap}`-flate, 1px stiplet `{colors.gap-border}`, merket «Ikke dekket ennå» og et refleksjonsforslag. Ingen varselikoner. |
| **Bevissitat** | `{typography.quote}`, 3px venstrestrek i `{colors.quote-mark}`, anførselstegn «». |
| **Markert svar i samtalelogg** | Svaret beviset bygger på får bakgrunnen `{colors.covered}` i `Sheet`. |
| **Stegindikator** | Rad med piller øverst. Aktivt steg: `{colors.covered}`-fyll, halvfet. Fullført: `{colors.primary}`-tekst, understreket (klikkbar). Kommende: `{colors.muted-foreground}`. |
| **«Vis i samtalen»-lenke** | shadcn `Button variant="link"` i `{colors.primary}`, halvfet. Det er en handling, ikke en lenke i brødtekst. |
| **Øvrige elementer** | Skriveindikator: muted-tekst «Erfaringsgruven skriver …». Kravliste: nummerert liste i `Card`. «+N bevis til»: shadcn `Collapsible`. Notis på Oppsummering: shadcn `Alert` (standardvariant, ikke destructive). |
| **Demobanner** | Smal stripe øverst, `{colors.muted}`: «Demomodus – eksempelsvar, ingen API-nøkkel». |

## Do's and Don'ts

| Gjør | Ikke gjør |
|---|---|
| Bruk grønt bare for *funnet / dekket / fremdrift* | Bruke grønt dekorativt eller på lenker i brødtekst |
| Vis hull i varm sandtone med refleksjonsforslag | Vise hull i rødt eller oransje eller med ⚠️ |
| Sett studentens ord i serif-kursiv med grønn strek | Blande studentens ord med systemtekst i samme stil |
| Arv shadcn-komponenter uendret | Lage egne varianter av Dialog, Toast eller Textarea |
| Gi mye luft og rolig rytme | Pakke bevistabellen tett som et regneark |
