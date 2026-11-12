---
name: Erfaringsgruven
status: final
created: 2026-11-04
updated: 2026-11-12
sources:
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/addendum.md
design: DESIGN.md
---

# Erfaringsgruven: Experience Spine

## Foundation

Lokal webapp som kjøres i nettleseren via en lokal dev-server (PRD §5). Den er **laget for desktop først**. På mobil skal den fungere, men er ikke optimalisert i v1. UI-systemet er **shadcn/ui + Tailwind**: komponentene arves, og denne filen beskriver bare den atferden som kommer i tillegg. `DESIGN.md` er referansen for visuell identitet. Hver økt er anonym og for én bruker. Det finnes ingen innlogging, og ingenting lagres etter at økten er over (PRD §5, §6.2). Begrepene følger PRD-ens ordliste (§3) ordrett: *økt, samtale, erfaring, stillingsannonse, krav, kravuttrekk, bevis, bevistabell, hull, demomodus*.

## Information Architecture

Flyten er lineær, med en stegindikator øverst: **Samtale → Oppsummering → Annonse → Krav → Bevistabell**. Studenten kan gå tilbake til tidligere steg. Det finnes ingen fri navigasjon og ingen sidemeny.

| Flate | Nås fra | Formål | FR |
|---|---|---|---|
| Start | Åpne appen | Kort forklaring, personvernteksten med avkrysning (se Fast mikrotekst), «Start ny økt» og «Prøv demomodus» | FR-1, FR-9, §5 |
| Samtale | Start | Chat med åpne oppfølgingsspørsmål. Sidepanelet viser erfaringskortene med R-H-R og fremdrift mot 3. Knappen «Ferdig» | FR-1, FR-2, FR-3 |
| Oppsummering | Samtale (≥3 erfaringer eller «Ferdig») | Alle fangede erfaringer, som kan rettes. Valg: «Fortsett samtalen» eller «Gå videre» | FR-3 |
| Annonse | Oppsummering | Lim inn tekst fra én stillingsannonse | FR-4 |
| Krav | Annonse | Viser kravlisten fra kravuttrekket før bevistabellen bygges | FR-4 |
| Bevistabell | Krav | Krav for krav: dekket med bevissitat og «Vis i samtalen», eller hull med refleksjonsforslag. Eksport | FR-5–FR-8 |
| «Vis i samtalen» (`Sheet`) | Bevistabell, per bevis | Hele samtaleloggen, rullet til og med markering av svaret beviset bygger på | FR-6 |
| Eksport (`Dialog`) | Bevistabell | Forhåndsvisning av ren tekst og «Kopier» | FR-8 |

Visuelle referanser: [`mockups/samtale.html`](mockups/samtale.html) (Samtale med sidepanel, UJ-1 steg 2–3) og [`mockups/bevistabell.html`](mockups/bevistabell.html) (Bevistabell og «Vis i samtalen» åpen, UJ-1 steg 7–8). Ved konflikt mellom mockups og spines gjelder spines. Oppsummering, Annonse, Krav, Start og Eksport har ingen mockup og bygges fra tabellene i spinen alene.

Det er ingen modaler oppå modaler. «Ny økt» fra et hvilket som helst steg tømmer all tilstand, etter bekreftelse.

## Voice and Tone

Microcopy. Merkevarestemmen er beskrevet i `DESIGN.md` under Brand & Style. Tonen er **du-form, varm og nysgjerrig**, som en interessert veileder. Spørsmålene er korte, og det brukes ingen fagsjargong (ikke «STAR», «kompetanse» eller «ATS»).

| Gjør | Ikke gjør |
|---|---|
| «Fortell om noe du har gjort de siste årene: jobb, frivillig, studier, hva som helst.» | «Vennligst oppgi din arbeidserfaring.» |
| «Hva gjorde *du* konkret da det ble travelt?» | «Beskriv handlingen (H) i STAR-format.» |
| «Hvordan gikk det til slutt?» | «Oppgi målbart resultat.» |
| «Dette kravet har vi ikke funnet noe på ennå.» | «Mangler erfaring.» / «Ikke kvalifisert.» |
| «Tenk på: har du noen gang …?» (refleksjonsforslag) | Å skrive formuleringer for studenten |
| «Dette er dine egne ord fra samtalen.» | «AI-generert bevis.» |
| Kort og ærlig personverntekst i hverdagsspråk (se Fast mikrotekst) | Juridisk personverntekst, eller å love mer enn arkitekturen holder (AD-17) |

Systemet omformulerer aldri studentens ord inne i et sitat (PRD FR-5, SM-C1).

### Fast mikrotekst

Disse tekstene er faste og brukes ordrett. De tre siste står som konstanter i `kjerne/regler.ts` eller i Start-komponenten (arkitektur AD-7, AD-16, AD-17).

| Hvor | Tekst |
|---|---|
| Start, personverntekst | «Svarene dine sendes kryptert til språkmodellen Claude hos Anthropic, som stiller spørsmålene og finner bevisene. Erfaringsgruven lagrer ingenting, og økten forsvinner når du lukker fanen. Anthropic sletter dataene innen 30 dager, men samtaler som flagges for brudd på bruksvilkårene kan lagres i opptil 2 år. Ikke skriv personnummer, helseopplysninger eller annet du ikke vil dele.» |
| Start, avkrysning | «Jeg har lest dette og vil starte.» «Start ny økt» er deaktivert til boksen er krysset av. Demomodus krever ingen avkrysning, fordi ingenting sendes til Anthropic. |
| Samtale, overgangsspørsmål (`OVERGANGSSPORSMAL`) | «Fint, da går vi videre. Fortell gjerne om noe annet du har gjort: en annen jobb, frivillig arbeid eller et prosjekt på studiet.» Brukes når en erfaring har fått tre oppfølgingsspørsmål (AD-16). Teksten sier ikke at erfaringen er fanget, fordi den kan mangle et felt. |
| Bevistabell, standard refleksjonsforslag (`STANDARD_REFLEKSJON`) | «Tenk på: har du gjort noe lignende i en jobb, på studiet eller i fritiden, selv om du ikke tenkte på det som erfaring da?» Brukes bare når modellen ikke gir noe forslag (AD-7). |

## Component Patterns

Atferd. Den visuelle spesifikasjonen står i `DESIGN.md` under Components.

| Komponent | Brukes på | Atferdsregler |
|---|---|---|
| Chatboble (assistent / student) | Samtale | Nye meldinger legges nederst, og visningen ruller automatisk bare hvis studenten allerede står nederst. Assistentens svar vises med en skriveindikator mens modellkallet pågår. |
| Chatinput | Samtale | `Textarea` som vokser opp til 6 linjer. `Enter` sender og `Shift+Enter` gir ny linje. Den er låst mens assistenten svarer. |
| Erfaringskort | Samtale (sidepanel), Oppsummering | Dukker opp i sidepanelet så snart en erfaring er nevnt. Tittelen foreslås av systemet, men er hentet fra studentens ord. På Oppsummering kan tittel og R-H-R-tekst redigeres inline (klikk for å redigere, lagres når feltet forlates). Et kort kan slettes. Rettet tekst brukes til koblingen mot krav og i oppsummeringen i eksporten, men endrer aldri bevissitatene (se Bevissitat). |
| R-H-R-brikke | Erfaringskort | Tre tilstander per brikke: tom, fylt (hake) eller oppdatert (kort puls når feltet blir fylt). En erfaring regnes som fanget først når alle tre er fylt (FR-2). Brikken er en knapp. Klikk eller `Enter` åpner en `Popover` med utdraget fra studentens svar (ikke bare hover). |
| Fremdriftsmåler | Samtale | «N av 3 erfaringer fanget». Når N når 3, vises «Gå videre til oppsummering». Ved mer enn 3: «N erfaringer fanget», og måleren er full. Samtalen avsluttes ikke automatisk, og studenten kan fortsette (UX-beslutning, jf. FR-3, se [NOTE FOR PM] nederst). |
| «Ferdig»-knapp | Samtale | Alltid synlig, men deaktivert til minst ett oppfølgingsspørsmål er stilt (FR-1). Med færre enn 3 fangede erfaringer går den til Oppsummering med en melding om det (se State Patterns). |
| Annonsefelt | Annonse | Stor `Textarea` med plassholderen «Lim inn teksten fra stillingsannonsen». «Finn krav» er aktiv når feltet har minst 200 tegn. |
| Kravliste | Krav | Nummerert, skrivebeskyttet liste med kravene. «Bygg bevistabell» går videre, og «Tilbake» lar studenten lime inn på nytt. Krav kan ikke redigeres i v1. |
| Kravrad (dekket) | Bevistabell | Viser kravet, navnet på erfaringen eller erfaringene som dekker det, ett bevissitat og «Vis i samtalen». Har kravet flere bevis, vises «+N bevis til», som kan foldes ut. |
| Kravrad (hull) | Bevistabell | Viser kravet, merket «Ikke dekket ennå» og ett refleksjonsforslag (FR-7, PRD Å.s. 3). Forslaget lages av modellen, med `STANDARD_REFLEKSJON` som reserve (AD-7). Systemet stiller ingen ekstra spørsmål, og ingen handling er påkrevd. |
| Bevissitat | Bevistabell, Eksport | Kort, ordrett utdrag av studentens samtalesvar. Det hentes alltid fra samtaleloggen, også når erfaringen er rettet på Oppsummering. Det skal aldri omformuleres. Det skal alltid ha en sporbar henvisning (FR-6, SM-5). |
| «Vis i samtalen» | Bevistabell | Åpner `Sheet` fra høyre med hele samtaleloggen. Visningen ruller til svaret beviset bygger på, og svaret markeres. `Esc` lukker, og fokus går tilbake til lenken. |
| Eksportdialog | Bevistabell | Viser en forhåndsvisning av ren tekst: krav, bevis eller «Ikke dekket ennå» med refleksjonsforslag, og deretter oppsummeringen av erfaringene. «Kopier» bekreftes med en `Toast`: «Kopiert. Lim inn hvor du vil.» «Last ned .txt» er et valg nummer to. |
| Demobanner | Alle flater i demomodus | Er alltid synlig og kan ikke lukkes. |
| Stegindikator | Alle flater etter Start | Viser steget studenten er på, og fullførte steg kan klikkes for å gå tilbake. Kommende steg er ikke klikkbare. Knappen «Ny økt» står til høyre i toppfeltet. |

## State Patterns

| Tilstand | Flate | Behandling |
|---|---|---|
| Første møte | Start | `display`: «Du har sannsynligvis mer erfaring enn du tror.» Én setning om hvordan det fungerer, personvernteksten, avkrysningsboksen og to knapper. «Start ny økt» er deaktivert til boksen er krysset av. |
| Samtalen starter | Samtale | Assistenten åpner med ett åpent spørsmål. Sidepanelet viser tomt: «Erfaringene dine dukker opp her.» |
| Venter på modellen | Samtale, Krav, Bevistabell | Skriveindikator i chatten. `Skeleton`-rader i kravlisten og bevistabellen med teksten «Leser annonsen …» / «Kobler krav til erfaringene dine …». |
| Delvis erfaring | Samtale | Kortet viser fylte og tomme brikker, og assistenten følger opp det som mangler. |
| «Ferdig» med < 3 fangede | Oppsummering | Notis øverst: «Du har fanget N erfaringer. Du kan fortsette samtalen eller gå videre med det du har.» Begge valgene er like tydelige (PRD UJ-1, edge case). |
| «Ferdig» med 0 fangede | Oppsummering | «Vi har ikke fått nok til å fange en erfaring ennå.» Bare «Fortsett samtalen» er aktiv, fordi det kreves minst 1 fanget erfaring for å gå videre. |
| Kravuttrekk uten treff | Krav | «Vi fant ingen tydelige krav i teksten. Sjekk at du limte inn hele annonsen.» Studenten sendes tilbake til Annonse. |
| Ingen krav dekket | Bevistabell | Alle rader er hull. Overskriften blir: «Ingen av kravene er dekket ennå. Her er noe å tenke på.» Ingen negativ tone. |
| Modell-/API-feil | Alle steg med kall | `toast.error` (sonner): «Noe gikk galt. Prøv igjen.» med knappen «Prøv igjen». Det studenten har skrevet, bevares. |
| Manglende API-nøkkel | Start | «Start ny økt» er deaktivert, med forklaringen «Ingen API-nøkkel funnet. Se README, eller prøv demomodus.» |
| Demomodus | Alle | Demobanner. Samtalen spilles av med lagrede eksempelsvar, og studenten trykker «Neste» i stedet for å skrive. |
| Gå tilbake og endre | Alle steg | Endrer studenten noe i et tidligere steg (en erfaring, annonsen), nullstilles alle senere steg. De bygges på nytt når studenten går videre igjen. Ingen bekreftelse er nødvendig, fordi samtalen og erfaringene beholdes. |
| Kopiering feiler | Eksport | `toast.error` (sonner): «Kunne ikke kopiere. Marker teksten og kopier selv.» Forhåndsvisningen markeres, og «Last ned .txt» står fortsatt som alternativ. |
| Lukke fanen / ny økt | Alle | «Ny økt» krever bekreftelse i en `Dialog`: «Alt i denne økten forsvinner.» Lukkes fanen, gir nettleseren sitt eget `beforeunload`-varsel. |

## Interaction Primitives

Mus og tastatur er likeverdige. Det er ingen egne hurtigtaster utover:

- `Enter` sender en chatmelding og `Shift+Enter` gir ny linje.
- `Esc` lukker `Sheet` og `Dialog`.
- `Tab` følger leserekkefølgen.

**Ikke tillatt:** automatisk avslutning av samtalen (UX-beslutning, jf. FR-3), tidsavbrudd i økten, dra-og-slipp, uendelig rulling og handlinger som bare vises ved hover.

## Accessibility Floor

Atferd. Visuell kontrast er beskrevet i `DESIGN.md` under Colors.

- WCAG 2.2 AA.
- Chatloggen er en `aria-live="polite"`-region, slik at nye assistentmeldinger leses opp.
- Fremdriften kunngjøres når den endres: «2 av 3 erfaringer fanget.»
- Dekket og hull skilles med tekst («Dekket» / «Ikke dekket ennå»), ikke bare med farge.
- Bevissitater er merket som sitat (`<blockquote>` eller `<q>`) og leses opp som «Ditt svar: …».
- «Vis i samtalen» flytter fokus til det markerte svaret i `Sheet`. Når den lukkes, går fokus tilbake.
- Alle handlinger kan nås med tastatur, og fokusringer arves fra shadcn (`ring`).
- `lang="nb"` på dokumentet.
- Bare lyst tema i v1. Mørk modus er utenfor omfang.

## Responsive & Platform

| Breakpoint | Atferd |
|---|---|
| `≥ lg` (1024px+) | Samtalen vises med chat og sidepanel side om side. Primærflaten. |
| `md` (768–1023px) | Sidepanelet blir en sammenleggbar stripe over chatten: «2 av 3 · Vis erfaringer». |
| `< md` | Én kolonne. Erfaringene åpnes i en `Sheet` nedenfra. Bevistabellen stables. Fungerer, men er ikke optimalisert (v1). |

## Inspiration & Anti-patterns

- **Avvist: søknadsgeneratorer** (PRD §1, §6). Det finnes ingen knapp som «Skriv søknad», og verktøyet lager ingen ferdig tekst. Eksporten inneholder bare krav, bevis i studentens ord og hull.
- **Avvist: poeng og score for match** (f.eks. «72 % match»). Det ville flytte fokus fra *bevis* til *karakter* og stride mot målet om trygghet (SM-1). Fremdriften telles bare i fangede erfaringer.
- **Avvist: rød feilmarkering av hull.** Hull er et refleksjonspunkt (FR-7).
- **Avvist: skjemaveiviser.** Samtalen er en chat og ikke et skjema med felter (gruppens valg).

## Key Flows

### UJ-1. Mia oppdager at butikkjobben hennes faktisk er relevant

Mia går siste året på bachelor, har jobbet deltid i butikk i tre år og har nesten latt være å søke. Hun bruker den bærbare datamaskinen sin en kveld.

1. Mia åpner Erfaringsgruven. Start: «Du har sannsynligvis mer erfaring enn du tror.» Hun leser personvernteksten, krysser av for «Jeg har lest dette og vil starte» og trykker **Start ny økt** (FR-1).
2. Assistenten spør: «Fortell om noe du har gjort de siste årene.» Hun nevner butikkjobben i en bisetning. Et kort, «Butikkjobb», dukker opp i sidepanelet med tre tomme brikker.
3. Assistenten følger opp: «Hva gjorde *du* konkret da det ble travelt?» Brikkene Rolle og Handling fylles. Etter «Hvordan gikk det?» fylles Resultat, og måleren viser «1 av 3» (FR-2).
4. På samme måte fanges gruppeoppgaven og utvekslingen. Måleren viser «3 av 3», og «Gå videre til oppsummering» dukker opp (FR-3).
5. På Oppsummering retter hun ett ord i resultatet for utvekslingen og trykker **Gå videre**.
6. Hun limer inn stillingsannonsen og trykker **Finn krav**. Kravlisten viser seks krav (FR-4). Hun trykker **Bygg bevistabell**.
7. **Klimaks:** Raden for «Erfaring med kundekontakt under tidspress» er markert *Dekket*, med kortet «Butikkjobb» og hennes egne ord i serif-kursiv: «Vi var to på kassa i julehandelen, og jeg tok køen mens …». Hun trykker **Vis i samtalen**, og samtaleloggen glir inn med akkurat det svaret markert. Det er hennes egne ord, og ikke noe systemet har funnet på (FR-5, FR-6).
8. Ett krav, «Erfaring med Excel», er markert *Ikke dekket ennå*, med forslaget: «Tenk på: har du brukt regneark i studier eller jobb, for eksempel til budsjett eller vaktlister?» (FR-7).
9. Hun trykker **Eksporter**, ser forhåndsvisningen av ren tekst og trykker **Kopier**. Toast: «Kopiert. Lim inn hvor du vil.» (FR-8).

**Edge case (PRD UJ-1):** Mia trykker **Ferdig** etter to erfaringer. Oppsummeringen viser begge, med notisen «Du har fanget 2 erfaringer. Du kan fortsette samtalen eller gå videre med det du har.» Hun velger å gå videre.

**Feil:** Kravuttrekket feiler. Toast: «Noe gikk galt. Prøv igjen.» Annonseteksten står fortsatt i feltet.

### Flyt 2: Sensor kjører demomodus (FR-9)

Sensor har klonet repoet, fulgt README og har ingen API-nøkkel.

1. Startsiden viser at «Start ny økt» er deaktivert («Ingen API-nøkkel funnet»). Sensor trykker **Prøv demomodus**.
2. Demobanneret vises. Samtalen spilles av trinnvis med lagrede eksempelsvar når sensor trykker **Neste**, og sidepanelet fylles som i en ekte økt.
3. En forhåndsutfylt testannonse vises i Annonse. Sensor trykker **Finn krav** og deretter **Bygg bevistabell**.
4. **Klimaks:** Bevistabellen vises med dekkede krav, sitater og hull. Sensor trykker **Vis i samtalen** på et bevis og ser at sporbarheten virker, uten å ha skaffet en nøkkel.
5. Eksporten fungerer som i en vanlig økt. Når demoskriptet er ferdig avspilt, blir «Neste» til «Gå videre til oppsummering».

**Feil:** Mangler de lagrede eksempelsvarene, vises «Demodata mangler. Se README.» på Start, og «Prøv demomodus» er deaktivert.

## Åpne punkter for UX

- Løst: PRD FR-3 og FR-numrene i UJ-1 er rettet etter denne spinen, og PRD Å.s. 5 er besvart (sitat inline og «Vis i samtalen»).
- Personvernteksten og avkrysningen på Start følger lærerens tilbakemelding på PRD-en (punkt 4.4). PRD-en skal få et eget krav for dette.
