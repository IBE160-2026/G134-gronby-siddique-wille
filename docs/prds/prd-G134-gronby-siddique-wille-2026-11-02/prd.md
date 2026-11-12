---
title: Erfaringsgruven
status: final
created: 2026-11-02
updated: 2026-11-05
---

# PRD: Erfaringsgruven

## 0. Dokumentets formål

Dette dokumentet beskriver kravene til Erfaringsgruven for resten av gruppen (G134), og for sensor som skal evaluere prosjektet. Det bygger på `docs/product-brief.md` og tilbakemeldingene i `docs/tilbakemelding-product-brief.md` — det dupliserer ikke disse, men destillerer dem til krav. Funksjoner er gruppert, funksjonelle krav (FR) er globalt nummerert for stabile referanser, og antagelser er tagget inline og indeksert i §9. Tekniske valg (modell, kostnad, repo-hygiene) ligger i `addendum.md`, ikke her.

## 1. Visjon

Erfaringsgruven er et verktøy som hjelper studenter oppdage erfaring de allerede har, og viser — krav for krav mot en konkret stillingsannonse — hvilke av deres egne erfaringer som beviser at de passer til stillingen. Verktøyet intervjuer studenten gjennom en naturlig samtale og finner ikke på noe: alt som brukes som bevis kan spores tilbake til studentens egne svar.

Dette skiller Erfaringsgruven fra vanlige "AI-søknadsgeneratorer", som tar en ferdig CV og generisk inndata og skriver en søknadstekst — ofte gjenkjennelig, generisk, og i verste fall med oppdiktet innhold. Erfaringsgruven skriver ikke søknaden. Den hjelper studenten finne og formulere det hen allerede har, og la det stå i student*ens* egne ord.

Markedssøk gjort under dette PRD-arbeidet fant ingen sammenlignbart produkt som kombinerer samtalebasert uthenting av erfaring, krav-for-krav kobling mot en konkret annonse, *og* full sporbarhet til brukerens egne svar — nærmeste beslektede verktøy (søknadsgeneratorer, STAR-intervjutrenere, karriereveiledning.no) løser enten matching mot en allerede skrevet CV, eller trener til et intervju, ikke begge deler sammen med sporbarhet.

## 2. Målgruppe

### 2.1 Jobs To Be Done

- Som student som skal søke min første relevante jobb, vil jeg forstå hvilken av mine egne erfaringer som faktisk er relevant for en konkret stilling, så jeg slutter å skrive "ingen relevant erfaring" når jeg har mer å vise til enn jeg tror.
- Som student, vil jeg ha konkrete, egne eksempler å bruke i søknad/CV/intervju — ikke en generisk tekst en chatbot har funnet på.
- Som student, vil jeg vite *hvor* jeg mangler dekning for et krav, slik at jeg kan velge å styrke søknaden et annet sted, eller erkjenne at kravet ikke er dekket.

### 2.2 Ikke-brukere (v1)

- Studenter som allerede har en ferdigskrevet, detaljert CV og ber om layout/ATS-optimalisering — det er ikke dette verktøyet gjør.
- Karriereveiledere som trenger et dashboard for å følge opp flere studenter over tid — v1 er en enkeltøkt uten lagring, se §6.2.

### 2.3 Sentrale brukerreiser

**UJ-1. Mia oppdager at butikkjobben hennes faktisk er relevant.**
- **Person + kontekst:** Mia går siste året på bachelor, har jobbet deltid i butikk i tre år, ledet en gruppeoppgave, og vært på utveksling ett semester. Hun har akkurat funnet en stillingsannonse hun egentlig har lyst på, men tenkt «jeg har ikke relevant erfaring» og nesten latt være å søke.
- **Inngangstilstand:** Ingen innlogging. Mia åpner Erfaringsgruven lokalt i nettleseren og starter en ny økt.
- **Forløp:** (1) Erfaringsgruven stiller åpne oppfølgingsspørsmål om ting hun har gjort, ikke bare "skriv CV-en din" — hun nevner butikkjobben uten å tenke på den som "erfaring". (2) Systemet følger opp til rolle, handling og resultat er konkrete (realiserer FR-1–FR-3), til minst tre erfaringer er fanget. (3) Hun limer inn stillingsannonsen (realiserer FR-4). (4) Systemet trekker ut kravene og viser en bevistabell: krav for krav, med hvilken av Mias erfaringer som dekker det, og et kort sitat fra hennes eget svar (realiserer FR-5–FR-7).
- **Klimaks:** Mia ser at "erfaring med kundekontakt under tidspress" — et krav hun var sikker på at hun ikke dekket — faktisk er dekket av butikkjobben, med hennes eget svar som bevis.
- **Avslutning:** Ett krav har ingen dekkende erfaring og vises som et "hull" med et refleksjonsforslag (realiserer FR-7). Mia kopierer bevistabellen som ren tekst (realiserer FR-8) og tar den med inn i søknaden sin.
- **Edge case:** Hvis Mia avslutter samtalen tidlig (velger "Ferdig" før tre erfaringer er fanget), vises oppsummeringen av det hun faktisk har gitt, og hun kan velge å fortsette samtalen eller gå videre med det hun har.

## 3. Ordliste

- **Student** — primærbruker; personen som gjennomfører en økt.
- **Økt** — én sammenhengende, anonym bruk av verktøyet fra samtalestart til resultat tas ut; ingen tilstand lagres etter at økten er over (§6.2).
- **Samtale** — intervjudelen hvor Erfaringsgruven stiller oppfølgingsspørsmål for å få studenten til å beskrive egne erfaringer konkret.
- **Erfaring** — én beskrevet hendelse/periode fra studentens liv (jobb, frivillig arbeid, gruppeprosjekt, utveksling o.l.), konkretisert til rolle, handling og resultat.
- **Stillingsannonse** — teksten studenten limer inn; kilden for kravene.
- **Krav** — ett arbeidsgiverkrav trukket ut fra stillingsannonsen.
- **Kravuttrekk** — prosessen/funksjonen som trekker krav ut av stillingsannonsens tekst.
- **Bevis** — koblingen mellom ett krav og én eller flere erfaringer som dokumenterer det, med en kort bevishistorie i studentens egne ord og en sporbar henvisning til det konkrete samtalesvaret beviset bygger på.
- **Bevistabell** — den krav-for-krav-visningen som viser hvert krav og dets bevis (eller hull).
- **Hull** — et krav uten dekkende erfaring, vist med et refleksjonsforslag.
- **Demomodus** — kjøremodus med lagrede eksempelsvar, uten behov for en egen API-nøkkel.

## 4. Funksjoner

### 4.1 Samtale (intervju)

**Beskrivelse:** Erfaringsgruven stiller studenten åpne oppfølgingsspørsmål for å avdekke erfaringer studenten selv ikke ville tenkt å nevne, og følger opp til hver erfaring er konkret nok til å brukes som bevis. Realiserer UJ-1.

**Funksjonelle krav:**

#### FR-1: Start samtale
Student kan starte en ny, anonym økt og bli stilt åpne oppfølgingsspørsmål om egne erfaringer. Realiserer UJ-1.

**Konsekvenser (testbare):**
- En ny økt starter uten at studenten må logge inn eller opprette konto.
- Systemet stiller minst ett oppfølgingsspørsmål før samtalen kan avsluttes.

#### FR-2: Konkretiser erfaring til rolle, handling, resultat
Systemet følger opp en nevnt erfaring med spørsmål til den er beskrevet med rolle, handling og resultat. Realiserer UJ-1.

**Konsekvenser (testbare):**
- En erfaring regnes som "fanget" først når rolle, handling og resultat alle er til stede i studentens svar.
- Systemet stiller maks tre oppfølgingsspørsmål per erfaring. Mangler rolle, handling eller resultat fortsatt etter det, går samtalen videre, og erfaringen regnes ikke som fanget (gruppebeslutning, se Åpent spørsmål 1).

#### FR-3: Avslutt samtale og vis oppsummering
Når minst tre erfaringer er fanget (FR-2), tilbyr systemet studenten å gå videre til oppsummeringen, men studenten kan fortsette samtalen. Studenten kan også når som helst velge "Ferdig". En oppsummering av fangede erfaringer vises for retting før neste steg. (Justert 2026-11-04 etter UX-spesifikasjonen, se EXPERIENCE.md.)

**Konsekvenser (testbare):**
- Ved ≥3 fangede erfaringer tilbys "Gå videre til oppsummering"; overgangen til oppsummeringen skjer bare ved et aktivt valg fra studenten (gå videre eller "Ferdig"), aldri automatisk.
- Oppsummeringen viser alle fangede erfaringer og lar studenten rette dem før kravuttrekket starter.

### 4.2 Kravuttrekk fra stillingsannonse

**Beskrivelse:** Studenten limer inn tekst fra en konkret stillingsannonse, og systemet trekker ut arbeidsgiverens krav fra teksten. Realiserer UJ-1.

**Funksjonelle krav:**

#### FR-4: Lim inn og trekk ut krav
Student kan lime inn fritekst fra én stillingsannonse per økt, og systemet trekker ut listen av krav fra teksten. Flere annonser i samme økt er en mulig utvidelse, se §7.2 og Åpent spørsmål 2.

**Konsekvenser (testbare):**
- For et fast testsett (testannonse A) trekkes alle definerte krav ut korrekt (automatisk test).
- Kravlisten vises til studenten før bevistabellen bygges.

### 4.3 Bevistabell

**Beskrivelse:** For hvert krav fra kravuttrekket (FR-4) viser systemet hvilken erfaring (FR-2) som dokumenterer det, med en kort bevishistorie i studentens egne ord og en sporbar henvisning til det konkrete samtalesvaret. Krav uten dekkende erfaring markeres som hull. Realiserer UJ-1.

**Funksjonelle krav:**

#### FR-5: Koble krav til erfaring
For hvert krav viser systemet hvilken(e) erfaring(er) som dekker det, med en kort bevishistorie.

**Konsekvenser (testbare):**
- Hver bevishistorie er bygget av studentens egne ord fra samtalen (FR-2) — ingen tillagt eller oppdiktet innhold.
- For et fast testsett dekkes ≥80 % av de kravene som faktisk har en matchende erfaring.

#### FR-6: Vis sporbarhet i grensesnittet
Hvert bevis i bevistabellen lenker til eller siterer det konkrete samtalesvaret det bygger på, synlig for studenten i grensesnittet — ikke bare i datamodellen bak kulissene. Bekreftet av UX-spesifikasjonen (2026-11-04): hvert bevis viser et ordrett sitat fra samtalesvaret med lenken «Vis i samtalen», se EXPERIENCE.md. Åpent spørsmål 5 er lukket.

**Konsekvenser (testbare):**
- For et fast testsett viser hvert bevis til minst ett konkret samtalesvar, verifiserbart automatisk.
- Ved stikkprøve finnes ingen bevis uten sporbar henvisning til et samtalesvar.

#### FR-7: Marker hull med refleksjonsforslag
Et krav uten dekkende erfaring markeres som et hull, med et forslag til studenten om hva hen kan reflektere over eller undersøke videre.

**Konsekvenser (testbare):**
- For et fast testsett vises hvert krav uten match som hull, hver med et refleksjonsforslag (automatisk test).
- Refleksjonsforslaget lages av modellen, med en fast standardtekst som reserve hvis modellen ikke gir noe. Systemet stiller ingen ekstra oppfølgingsspørsmål ved hull i v1, og hullet vises med nøytral markering (gruppebeslutning, se Åpent spørsmål 3).
     
### 4.4 Resultat

**Beskrivelse:** Studenten tar bevistabellen med seg ut av økten som ren tekst, til bruk i søknad, CV eller intervjuforberedelse. Realiserer UJ-1.

**Funksjonelle krav:**

#### FR-8: Eksporter som ren tekst
Student kan kopiere/eksportere bevistabellen og oppsummeringen som ren tekst.

**Konsekvenser (testbare):**
- Eksportert tekst inneholder alle krav, tilhørende bevis (eller hull-markering), og er lesbar uten verktøyet (manuell test, dokumentert).

### 4.5 Demomodus

**Beskrivelse:** Sensor eller andre testere kan kjøre hele flyten med lagrede eksempelsvar, uten å skaffe en egen API-nøkkel.

**Funksjonelle krav:**

#### FR-9: Kjør uten API-nøkkel
Systemet kan startes i en demomodus som kjører hele flyten (samtale → kravuttrekk → bevistabell → eksport) med forhåndslagrede eksempelsvar.

**Konsekvenser (testbare):**
- Demomodus krever ingen API-nøkkel og dokumenteres i README (manuell test, etter README).

## 5. Tverrgående krav og rammer

- **Personvern:** Kommunikasjon er kryptert. Ingen CV- eller personopplysninger lagres etter at økten er over (jf. §6.2, "ingen lagring i v1"). Studenten informeres om dette før økten starter.
- **Kostnad:** Verktøyet bruker en ekstern språkmodell via API; v1 er dimensjonert for lav kostnad per økt innenfor et skoleprosjekt-budsjett. Konkret modellvalg og kostnadstall ligger i `addendum.md`.
- **Plattform:** Lokal webapp — kjøres i nettleser via en lokal dev-server, ingen installasjon utover prosjektets oppsett. Bekreftet med bruker.
- **Testbarhet:** Et fast testsett (fiktiv student + testannonse A, med forventede krav/bevis/hull) må finnes og dokumenteres, slik at FR-4, FR-5, FR-6 og FR-7 kan verifiseres automatisk. Testsett A ligger i `fixtures/testsett-a/` — se Åpent spørsmål 4.

## 6. Eksplisitte ikke-mål

- Erfaringsgruven er **ikke** en tekstgenerator eller søknadsbrev-skriver — den finner ikke på innhold og leverer ikke en ferdig søknadstekst.
- Ikke CV-maler, layout-verktøy eller ATS-optimalisering.
- Ikke integrasjon mot jobbsider eller innsending av søknader.
- Ikke intervjutrening eller et veilederdashboard for karriereveiledere i v1.

## 7. MVP-omfang

### 7.1 I omfang

- Samtalebasert intervju til minst tre erfaringer er fanget med rolle, handling og resultat (FR-1–FR-3).
- Kravuttrekk fra én stillingsannonse per økt (FR-4).
- Bevistabell med synlig sporbarhet og hull-visning (FR-5–FR-7).
- Ren-tekst-eksport av resultatet (FR-8).
- Demomodus uten API-nøkkel (FR-9).
- Kjørbar lokalt som webapp, enkeltbruker-økt, ingen innlogging.

### 7.2 Utenfor omfang for MVP

- Redigering av bevis i bevistabellen etter at den er generert — først hvis tid, se brief.
- Støtte for flere stillingsannonser i samme økt (sammenligning) — mulig utvidelse hvis kjerneflyten blir ferdig tidlig, jf. tilbakemeldingen på product brief.
- Brukerkontoer eller lagring mellom økter.
- Integrasjon mot jobbsider eller innsending av søknader.
- Intervjutrening eller veilederdashboard.
- [NOTE FOR PM] En personlig "karrierebank" som bygges opp gjennom studietiden er nevnt i brief'en som en visjon 2–3 år frem, og er tydelig ikke v1 — men load-bearing nok for gruppens motivasjon at den fortjener en revisit-vurdering senere. Detaljer i `addendum.md`.

## 8. Suksessmetrikker

**Primær (brukertest)**
- **SM-1:** Opplevd trygghet på å søke, målt 1–5 før/etter én økt, mål +1 poeng. Validerer UJ-1, FR-1–FR-3.
- **SM-2:** Andel krav med en faktisk dekkende erfaring som også får minst ett bevis i bevistabellen, mål ≥80 %. Validerer FR-5.
- **SM-3:** Andel testbrukere som fullfører hele forløpet (samtale → eksport) i én økt, mål ≥7/10. Validerer FR-1–FR-8.

**Sekundær (funksjonelt, automatisk/manuelt testbart)**
- **SM-4:** Kravuttrekk finner alle definerte krav for testannonse A (automatisk test). Validerer FR-4.
- **SM-5:** Hvert bevis i bevistabellen for det faste testsettet viser til minst ett konkret samtalesvar (automatisk test). Validerer FR-6.
- **SM-6:** Krav uten bevis for det faste testsettet vises som hull med refleksjonsforslag (automatisk test). Validerer FR-7.
- **SM-7:** Demomodus kjører hele flyten uten API-nøkkel (manuell test, etter README). Validerer FR-9.

**Mot-metrikk (skal ikke optimeres isolert)**
- **SM-C1:** Antall usporbare eller oppdiktede påstander i bevistabellen ved stikkprøve, mål 0. Motvirker SM-2 — forhindrer at kravdekning presses opp ved å godta svake eller uriktige koblinger mellom erfaring og krav.

## 9. Åpne spørsmål

1. ~~Hvor mange oppfølgingsspørsmål per erfaring er "nok" før den regnes som konkret nok til å brukes som bevis (FR-2)?~~ **Besvart av gruppen 2026-11-04:** rolle, handling og resultat må være til stede, med maks tre oppfølgingsspørsmål per erfaring.
2. ~~Skal verktøyet støtte flere stillingsannonser i samme økt (for sammenligning), eller er én annonse per økt riktig modell for v1 (FR-4)?~~ **Besvart av gruppen 2026-11-04:** én annonse per økt i v1. Flere annonser er en mulig utvidelse hvis kjerneflyten blir ferdig tidlig.
3. ~~Når ingen erfaring dekker et krav (FR-7): er et statisk refleksjonsforslag tilstrekkelig for v1, eller bør systemet aktivt stille et ekstra oppfølgingsspørsmål?~~ **Besvart av gruppen 2026-11-04:** statisk refleksjonsforslag med nøytral markering i v1, slik UX-spesifikasjonen er bygd. Et ekstra oppfølgingsspørsmål er en mulig utvidelse.
4. ~~Hvordan skal kravuttrekket og bevis-/hull-logikken testes, og hvor i repoet dokumenteres testsettene?~~ **Besvart 2026-11-04:** Rikke har laget testsett A (fiktiv student, annonse og fasit) i `fixtures/testsett-a/`. Testkoden skrives i implementeringen.
5. ~~Skal sporbarhet mellom bevis og samtalesvar vises direkte i grensesnittet (FR-6), eller er det tilstrekkelig at sporbarheten finnes i datamodellen for v1?~~ **Besvart 2026-11-04 av UX-spesifikasjonen:** synlig i grensesnittet, som ordrett sitat med «Vis i samtalen» (EXPERIENCE.md).

## 10. Antagelsesindeks

- §4.1 FR-2: ~~Antall oppfølgingsspørsmål per erfaring er ikke tallfestet~~ — besvart av gruppen 2026-11-04 (maks tre), ikke lenger en antagelse.
- §4.2 FR-4: ~~v1 støtter én stillingsannonse per økt~~ — bekreftet av gruppen 2026-11-04, ikke lenger en antagelse.
- §4.3 FR-6: ~~Sporbarhet mellom bevis og samtalesvar skal være synlig i selve grensesnittet~~ — bekreftet av UX 2026-11-04, ikke lenger en antagelse.
- §4.3 FR-7: ~~Et statisk refleksjonsforslag anses tilstrekkelig for v1~~ — bekreftet av gruppen 2026-11-04, ikke lenger en antagelse.
- §2.3 UJ-1: "Mia" er en syntetisert, representativ protagonist — ikke en faktisk intervjuet bruker.
