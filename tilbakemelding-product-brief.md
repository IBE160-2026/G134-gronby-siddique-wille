# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G134 – G134-gronby-siddique-wille |
| **Product brief** | `product-brief.md` (commit 89409fb) |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

**Det som er bra:**

1. Erfaringsgruven har en tydelig og annerledes vinkling: verktøyet er ikke en tekstgenerator, men intervjuer studenten og bygger en bevistabell der hvert krav i annonsen kobles til studentens egne erfaringer. Regelen «verktøyet finner aldri på noe» er både et godt designprinsipp og noe som kan testes.
2. Avgrensningen er realistisk og bevisst: ingen ferdigskrevne søknadsbrev, ingen kontoer og ingen varig lagring i v1. Scenarioet med studenten som har jobbet i butikk i tre år, men skriver «ingen relevant erfaring», gjør problemet konkret, og dere er ærlige om at problemet bygger på antagelser som må testes.

**De viktigste endringene:**

1. Suksesskriteriene bygger på brukertester med studenter (trygghet før/etter, 7 av 10 fullfører). Det er fint som supplement, men legg til funksjonelle kriterier som kan bli automatiske eller dokumenterte manuelle tester.
2. Appen er helt avhengig av en språkmodell, men briefen sier ikke hvilken, hva den koster, eller hvordan sensor kan kjøre appen uten deres nøkkel. Legg inn en plan for nøkkel, kostnad og demomodus.
3. Beskriv nærmere når samtalen er «ferdig», og hvordan kravuttrekket og koblingen til erfaringer skal se ut. Det er her KI-en gjør jobben, og det trengs for å lage presise stories.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Middels**

**Sammenlignbart med:** 2) AI CV- og søknadsassistent (middels) – samme domene og samme type KI-oppgaver (uttrekk av krav fra en annonse og kobling mot søkerens bakgrunn), men med en samtale i stedet for CV-opplasting og uten innlogging og lagring.

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | Middels | Ingen beregninger, men tydelige regler: hvert bevis må knyttes til et svar fra studenten, og krav uten bevis skal markeres som hull. |
| Datamodell – antall entiteter og relasjoner mellom dem | Lav | Erfaring, krav og kobling mellom dem, i én økt. Ingen varig lagring. |
| Brukere, roller og innlogging | Lav | Ingen kontoer i v1. Et godt valg som gjør appen enklere å kjøre og teste. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | Høy | Tre KI-oppgaver: oppfølgingsspørsmål i samtalen, uttrekk av krav fra annonsen, og kobling krav–erfaring med sporbarhet. Hele kjernen i appen. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | Middels | Språkmodell-API. Ingen andre eksterne tjenester. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | Lav | Hver økt er uavhengig. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | Lav | Annonsen limes inn som tekst, og resultatet tas med som ren tekst. |
| Sikkerhet og personvern | Middels | Studenten forteller om egne erfaringer, som sendes til en språkmodell. Godt håndtert i briefen med informasjon før start og ingen lagring etter økten. |

**Hva vanskelighetsgraden betyr for dere:**

- _Middels:_ Et godt balansert valg. Pass på at kjerneflyten blir ferdig og stabil før dere legger til mer. For dere betyr det: få samtale → annonse → bevistabell til å virke godt og sporbart før dere vurderer utvidelser.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | OK | Fire tydelige steg og fem punkter i v1 er realistisk for en gruppe på tre. Pass på at det blir nok å vise; se forslagene under. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | OK | Fire-stegs-flyten gir en naturlig inndeling i epics. Detaljer om samtalens avslutning og bevistabellens format må avklares i PRD. |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | OK | En webapp med chat og strukturerte LLM-kall er godt dokumentert og passer Claude Code. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | OK | Dere er selv studenter i målgruppen og kan vurdere om oppfølgingsspørsmål og bevis er gode. Sporbarheten gjør det mulig å kontrollere at ingenting er funnet på. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | Risiko | Regelen om sporbarhet er testbar, men det er ikke beskrevet hvordan. Lag faste testsett (fiktiv student + annonse) med forventede krav, bevis og hull, og test at hvert bevis viser til et svar. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | Risiko | Ingen innlogging gjør det enklere, men språkmodellen krever nøkkel. Planlegg oppskrift for egen nøkkel og en demomodus med lagrede svar. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | Risiko | Leverandør skal velges slik at data ikke brukes til trening, men modell, kostnad og mock er ikke beskrevet. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart som beskrevet.**

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. Vis sporbarheten i grensesnittet: la hvert bevis i tabellen lenke til (eller sitere) svaret i samtalen det bygger på. Det gjør prinsippet synlig for brukeren og lett å teste.
2. Vurder én utvidelse hvis kjerneflyten blir ferdig tidlig, f.eks. at studenten kan redigere bevisene og koble flere annonser mot samme erfaringsliste i én økt, eller eksport til PDF. Det gir mer å vise i funksjonalitet og testing.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Klart: et verktøy som intervjuer studenten og viser krav for krav hvilke erfaringer som dokumenterer at hen passer. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | OK | Konkret, med et godt scenario og ærlighet om at det er antagelser som må testes. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | OK | Fire tydelige steg sett fra brukerens side. Legg gjerne til et eksempel på en rad i bevistabellen. |
| What Makes This Different – er vurderingen ærlig og realistisk? | OK | Ærlig om at en godt instruert chatbot kan gjøre mye av det samme, og at fordelen er arbeidsflyten. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | OK | Tydelig primærbruker (student i siste del av studiet som skal søke første relevante jobb) med klart definert suksess. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Juster | Konkrete mål, men alle krever brukertester. Legg til f.eks. «for testsett A trekkes alle fem kravene ut av annonsen», «hvert bevis i tabellen viser til et svar i samtalen», «et krav uten bevis vises som hull», «resultatet kan kopieres som ren tekst». |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | OK | Tydelig IN og OUT med fornuftige avgrensninger. Legg til at en demomodus uten API-nøkkel er med i v1. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | En naturlig utvidelse (karrierebank over tid) som holdes utenfor v1. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | Juster | Briefen er et godt grunnlag. Historikken består så langt av filer lastet opp via GitHub med standardmeldinger («Add files via upload»). Arbeid videre lokalt med Git og beskrivende commit-meldinger, og lagre promptene som styrer intervjuet. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Juster | Tydelig og realistisk kjerneflyt. Vurder én utvidelse for å vise mer funksjonalitet. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | Juster | Sporbarhetsregelen er et godt testgrunnlag. Lag faste testsett og mock-svar for automatiske tester. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | OK | Fire steg gir en naturlig skjermflyt. Skisser særlig bevistabellen og hvordan hull vises. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | OK | Ingen kontoer og ingen lagring gir en enkel arkitektur. Samle LLM-kallene i én modul som kan mockes. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Juster | Planlegg `.env.example`, oppskrift for egen nøkkel og demomodus. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | API-nøkkel i `.env` (ikke committet), fiktive testpersoner og annonser i en egen mappe. Flytt briefen til en mappe for planleggingsdokumenter. |

## 3. Neste steg for gruppen

1. Legg til funksjonelle, testbare suksesskriterier ved siden av brukertestmålene.
2. Velg språkmodell, og beskriv kostnad, demomodus og hvordan sensor kjører appen uten deres nøkkel.
3. Beskriv når samtalen avsluttes og hvordan bevistabellen ser ut, og gå deretter videre til PRD.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
