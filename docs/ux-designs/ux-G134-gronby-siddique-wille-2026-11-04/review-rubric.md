# Spine Pair Review — Erfaringsgruven

## Overall verdict
Spine-paret er stramt, i riktig form og godt forankret i PRD-en. UJ-1 og FR-1–FR-9 er dekket, alle fargetokens har hex, og shadcn-arven er tydelig avgrenset. Det finnes ingen kritiske funn. To beslutninger med høy innvirkning gjenstår før arkitektur og story-dev kan hente ut kontrakten uten å gjette. Den ene er hvordan redigering på Oppsummering forholder seg til ordrette, sporbare sitater (FR-5/FR-6). Den andre er at markøren for dekkede krav er definert motstridende, og at frontmatter-varianten nesten ikke er synlig (1,17:1). Resten er mediumhull i tilstander og komponentspesifikasjon.

## 1. Flow coverage — strong
Sjekket: PRD-ens sources inneholder én brukerreise (UJ-1) og FR-1–FR-9. UJ-1 har en Key Flow med navngitt protagonist (Mia, kveld, bærbar), nummererte steg 1–9, markert klimaks (steg 7) som speiler PRD-klimakset ordrett, edge case («Ferdig» før tre) og feilsti (kravuttrekk feiler). FR-9 har en egen flyt (Flyt 2, sensor) med klimaks. Alle FR-er er referert inline i flytene. PRD §5 (informer om personvern før start) er dekket i steg 1. Mia er bevart som syntetisert protagonist.

### Findings
- **low** Flyt 2 (demomodus) har ingen feilsti, for eksempel at lagrede eksempelsvar mangler eller at demoskriptet er ferdig avspilt og «Neste» ikke har mer å vise (EXPERIENCE.md § Key Flows, Flyt 2). *Fix:* Legg til én «Feil:»-linje og hva «Neste» gjør når skriptet er slutt (deaktivert, eller går til Oppsummering).

## 2. Token completeness — adequate
Sjekket: Alle frontmatter-tokens (15 farger, 4 typografiroller, 4 radier, 3 spacing-tokens, 11 komponenter) og alle `{path}`-referanser i prosa og komponenter. Alle referanser finnes (`{spacing.content-max|chat-max|side-panel}`, `{rounded.sm|md|lg|full}`, `{typography.chat-body|quote}`, alle `{colors.*}`). Alle farger har hex. Mørk modus er bevisst utenfor v1 og er derfor ikke et funn. Kontrastmålene er oppgitt for fem kombinasjoner, og alle består når de regnes ut: fg/bg 14,9:1, primary 7,6:1, covered 6,5:1, gap 5,7:1, muted-fg/bg 5,6:1.

### Findings
- **high** Markøren for dekkede krav er definert på to måter. Colors sier at dyp grønn (`primary`) brukes til «markøren for dekkede krav». Frontmatter `requirement-row-covered.marker` er `{colors.covered}` (#E3F0EA), og prosaen i Components sier «grønn markør (`{colors.covered}`)». `covered` på hvitt kort gir 1,17:1, så markøren blir nesten usynlig i klimaksvisningen. Downstream-kode speiler frontmatter (DESIGN.md linje 92 mot 119 og 175). *Fix:* Sett `marker: '{colors.primary}'` (7,6:1 mot kort), eller definer markøren som en `covered`-pille med `covered-foreground`-tekst «Dekket». Velg én og la frontmatter, Colors og Components si det samme.
- **medium** Sans-serif-fonten er tvetydig: «arves fra shadcn (Inter/Geist Sans)». shadcn låser ikke en font, så implementøren må gjette (DESIGN.md linje 29). *Fix:* Velg én og legg den inn som `typography.body.fontFamily`, eller skriv «Geist Sans (Next.js-default)».
- **medium** Bredden for én kolonne, «maks 880px», er en råverdi i prosa, mens de andre layoutmålene er tokens (DESIGN.md § Layout & Spacing, linje 150). *Fix:* Legg til `spacing.column-max: 880px` og referer `{spacing.column-max}`.
- **low** `typography.quote.fontStyle: italic` er ikke blant egenskapene spec-en tillater (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing). Dette kan gi feil i en DESIGN.md-linter (DESIGN.md linje 46; design-md-spec.md § Frontmatter tokens). *Fix:* Behold det og noter avviket, eller flytt «kursiv» til prosa og komponenttoken (`evidence-quote.fontStyle`).
- **low** Kontrasttabellen mangler `muted-foreground` på `muted`, som brukes av tom R-H-R-brikke og Demobanner (5,0:1, består). Den sier heller ingenting om ikke-tekstkontrast. `gap-border` mot `gap` er 1,57:1, studentboblen (`muted` uten kant) mot `background` er 1,11:1, og tom brikke mot kort er omtrent 1,1:1 (DESIGN.md § Colors). *Fix:* Legg til raden og én setning om at grensene ikke bærer mening alene, fordi teksten «Dekket» / «Ikke dekket ennå» gjør det.
- **low** Den stiplede kanten på tom R-H-R-brikke har ingen farge eller token (`rha-chip` har ingen `border`) (DESIGN.md linje 80–85 og 173). *Fix:* Legg til `border-empty: '{colors.border}'` eller `'{colors.gap-border}'`.
- **low** «24–32px mellom seksjoner» er et spenn og ikke en regel (DESIGN.md linje 151). *Fix:* Velg én Tailwind-verdi (f.eks. `space-y-8`), eller to verdier med kontekst.

## 3. Component coverage — adequate
Sjekket: Komponentnavn i begge spines. DESIGN.Components har 11 rader og 11 frontmatter-nøkler. EXPERIENCE.Component Patterns har 15 rader. Begge filene dekker Chatboble, Erfaringskort, R-H-R-brikke, Fremdriftsmåler, Kravrad (dekket/hull), Bevissitat og Demobanner. Chatinput, Annonsefelt og Eksportdialog er arvede shadcn-komponenter (`Textarea`, `Dialog`) og trenger ingen visuell rad. «Vis i samtalen» og «Markert svar i samtalelogg» dekker hverandre.

### Findings
- **medium** Stegindikatoren vises på alle flater etter Start og har atferdsregler, men mangler visuell spesifikasjon. shadcn har ingen stepper, så komponenten må lages fra bunnen (EXPERIENCE.md linje 71; mangler i DESIGN.md § Components). *Fix:* Legg til en rad og en `step-indicator`-token: tilstandene aktiv, fullført og kommende, farger (f.eks. `primary` for aktiv, `covered` for fullført) og om stegene er klikkbare.
- **medium** R-H-R-brikken viser studentens utdrag bare i en `Tooltip`. Det fungerer ikke med berøring, og brikken er ikke fokuserbar, så tastaturbrukere når ikke innholdet. Det bryter med forbudet mot hover-only (EXPERIENCE.md linje 60 og 98). *Fix:* Gjør brikken fokuserbar med tooltip på fokus, eller vis utdraget i en `Popover` ved klikk.
- **low** Flere elementer mangler visuell spesifikasjon: Skriveindikator (EXPERIENCE linje 57 og 79), Kravliste (linje 64), utfoldingen «+N bevis til» (linje 65), notisen øverst på Oppsummering (linje 81), selve sidepanelet med tom-tekst (linje 78) og hvordan lenken «Vis i samtalen» er stylet, gitt at Do's and Don'ts forbyr grønt på lenker i brødtekst. *Fix:* Angi arvet shadcn-komponent per element (f.eks. `Collapsible`, `Alert`, `Button variant="link"`), eller legg til en kort rad.

## 4. State coverage — adequate
Sjekket per flate: Start (første møte, manglende API-nøkkel, demomodus), Samtale (start/tom, venter, delvis erfaring, API-feil, demomodus), Oppsummering (< 3, 0), Annonse (min. 200 tegn via Component Patterns), Krav (lasting, ingen treff, feil), Bevistabell (lasting, ingen dekket, feil), Sheet, Eksport, global (ny økt, lukke fanen). Fokus er dekket under Accessibility Floor. Offline er dekket av modell-/API-feil, fordi appen er lokal.

### Findings
- **high** Det er ikke bestemt hva redigering på Oppsummering betyr for bevis. Studenten kan redigere tittel og R-H-R-tekst inline (EXPERIENCE linje 59, Flyt 1 steg 5), mens bevissitatet skal være «ordrett utdrag av studentens samtalesvar» og «aldri omformuleres» (linje 67, FR-5/FR-6, SM-C1). Det er uklart om bevistabellen bygges fra den redigerte teksten eller fra transkripsjonen. Det er også uklart hva «Vis i samtalen» markerer når erfaringen er rettet. Dette påvirker datamodellen og sporbarhetsløftet direkte. *Fix:* Bestem og skriv ned regelen. Ett alternativ: sitater hentes alltid fra transkripsjonen, og redigert tekst brukes bare til kobling og eksport av oppsummeringen. Et annet: redigert tekst merkes som «rettet av deg» i bevistabellen og eksporten.
- **medium** Tilbakenavigasjon er tillatt («Studenten kan gå tilbake», stegindikatoren er klikkbar), men det står ikke hva som skjer med senere tilstand. Eksempler: retter erfaring etter at bevistabellen er bygget, eller limer inn ny annonse etter at kravene er trukket ut (EXPERIENCE linje 20 og 71). *Fix:* Legg til en rad i State Patterns: endring i et tidligere steg nullstiller senere steg, eventuelt med bekreftelse, eller senere steg merkes «utdatert» og krever ny kjøring.
- **medium** Fremdriftsmåleren har tre segmenter og teksten «N av 3», men studenten kan fortsette etter 3 (FR-3). Visningen for N > 3 er ikke definert (DESIGN linje 174, EXPERIENCE linje 61). *Fix:* Angi visningen, f.eks. at måleren er full og teksten blir «4 erfaringer fanget».
- **low** Eksport mangler tilstand for når kopiering feiler, for eksempel at Clipboard API nektes eller ikke er tilgjengelig (EXPERIENCE linje 69). *Fix:* Toast «Kunne ikke kopiere. Marker teksten og kopier selv.», og forhåndsvisningen kan markeres.
- **low** «Ny økt» krever bekreftelse, men har ingen plassering i IA eller Component Patterns (EXPERIENCE linje 33 og 88). *Fix:* Angi hvor knappen står (f.eks. til høyre i toppfeltet ved stegindikatoren).

## 5. Visual reference coverage — adequate (venter på mockups)
Sjekket: `imports/` er tom. `mockups/` finnes ikke ennå, fordi HTML-mockups for Samtale og Bevistabell lages parallelt. Det er bare notert her og ikke registrert som funn. `wireframes/` finnes ikke. Ingen av spinene viser til visuelle filer, og ingen av dem sier at spine vinner ved konflikt. Det er konsistent med at filene ikke finnes ennå.

### Findings
- **low** Når mockupene er levert, må de lenkes inline. *Fix:* Lenk `mockups/samtale.html` (eller tilsvarende) under EXPERIENCE § Information Architecture og DESIGN § Layout & Spacing, og `mockups/bevistabell.html` ved Kravrad-komponentene. Skriv hva hver mockup illustrerer, og legg inn «Spine vinner ved konflikt» én gang.

## 6. Bloat & overspecification — strong
Begge filene er korte og bruker tabeller der det passer. DESIGN-prosaen har en redaksjonell stemme som er knyttet til beslutninger (sitat i serif som sporbarhetsløfte, sandtone for hull). EXPERIENCE gjentar ikke personas eller FR-er, men refererer til dem. Det eneste overspesifiserte er råverdiene som er nevnt under kategori 2 (880px, 24–32px). Ingen ytterligere funn.

## 7. Inheritance discipline — adequate
Sjekket: Begge `sources`-stiene finnes. UJ-1-tittelen er ordrett lik PRD-en. Ordlisten er brukt ordrett og listet i Foundation. Feilnummereringen av FR-er i PRD UJ-1 er flagget til PM. Token-referansene i EXPERIENCE (`display`, `display-sm`, `ring`, `Skeleton`, `Sheet`) peker til tokens i DESIGN eller til arvede shadcn-tokens. Komponentnavnene er konsistente mellom filene.

### Findings
- **medium** FR-3 er tolket stikk motsatt uten at det er flagget. PRD-en sier «Samtalen avsluttes når minst tre erfaringer er fanget … ELLER et aktivt "Ferdig"-valg». UX lar samtalen fortsette etter 3 og viser i stedet «Gå videre til oppsummering» (EXPERIENCE linje 61). Interaction Primitives oppgir dessuten FR-3 som grunnlag for «Ikke tillatt: automatisk avslutning av samtalen» (linje 98). Tolkningen er rimelig, men den er en avvikende beslutning og ikke arv, og den finnes ikke i `.memlog.md`. *Fix:* Legg til et `[NOTE FOR PM]` under «Åpne punkter for UX» som forklarer at UX tolker «avsluttes» som «tilbyr avslutning». Rett henvisningen i linje 98 til «(UX-beslutning, jf. FR-3)».
- **low** «Toast (destructive)» bruker shadcn/Radix-terminologi, mens DESIGN angir `Toast` som sonner, som bruker `toast.error()` (EXPERIENCE linje 85, DESIGN linje 163). *Fix:* Skriv «`toast.error` (sonner)», eller definer at «destructive» betyr dette.

## 8. Shape fit — strong
DESIGN.md følger den kanoniske rekkefølgen: Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts. EXPERIENCE.md har alle de påkrevde standardseksjonene (Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows). Inspiration & Anti-patterns finnes, og avvisningene er forankret i PRD §1 og §6. Responsive & Platform finnes med breakpoints. Den egne seksjonen «Åpne punkter for UX» har en funksjon fordi den bærer PM-flagget. Ingen funn.

## Mechanical notes
- Overskriftsstilen i Key Flows er ulik: «### UJ-1. Mia …» og «### Flyt 2: Sensor …». I teksten omtales UJ-1-flyten også bare som «Flyt 1» implisitt. Velg én stil.
- Komponentnøklene i frontmatter er på engelsk (`rha-chip`, `requirement-row-gap`, `transcript-highlight`), mens radene i prosaen er på norsk («R-H-R-brikke», «Kravrad (hull)», «Markert svar i samtalelogg»). Koblingen er entydig, men står ikke noe sted. En kolonne «Token» i Components-tabellen ville gjøre uttrekket mekanisk.
- I EXPERIENCE nevnes `display` i State Patterns uten `{typography.display}`-syntaks. Det er akseptabelt, men ikke konsistent med DESIGN.
- Frontmatter er komplett i begge filene (name, status, created, updated, sources, og `design:` i EXPERIENCE). DESIGN har også `status`, `created` og `sources` utover spec-en, noe som er greit.
- Ingen Mermaid-diagrammer, så det er ingen syntaks å sjekke.
- Kontrastberegning (WCAG relativ luminans): alle fem målene i tabellen består, med lavest muted-fg/bg 5,59:1.
