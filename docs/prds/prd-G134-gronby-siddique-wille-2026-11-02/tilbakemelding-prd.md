# Tilbakemelding på PRD

| | |
|---|---|
| **Gruppe** | G134 – G134-gronby-siddique-wille |
| **PRD vurdert** | `docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md` (status `final`, sist endret 2026-11-05, commit e3a4c5b) |
| **Dato** | 2026-11-12 |
| **Type** | Formativ tilbakemelding, ikke karakter |

## 1. Samlet inntrykk

Dette er en PRD med egen tese og eierskap: «verktøyet finner ikke på noe, alt bevis kan spores til studentens egne svar». Tesen går igjen i FR-ene, ikke-målene og målepunktene, og de fleste FR-ene har testbare konsekvenser. Risikoen ligger i KI-kjernen: det er ikke avgjort hvordan «fanget», «korrekt» og «dekker» skal avgjøres i en test, og PRD-en sier lite om hva som skjer når språkmodellen eller inndata svikter.

## 2. Dette fungerer godt

- **Tydelig tese som styrer innholdet.** §1: «alt som brukes som bevis kan spores tilbake til studentens egne svar». Dette følges opp i FR-5 («ingen tillagt eller oppdiktet innhold»), FR-6 (synlig sporbarhet) og motmetrikken SM-C1. Dette er en PRD, ikke en funksjonsliste.
- **Testbarhet er tenkt inn.** De fleste FR-ene har «Konsekvenser (testbare)», og testsett A (fiktiv student, annonse og fasit) er knyttet til FR-4–FR-7 og SM-4–SM-6. Skillet mellom automatiske og manuelle tester er markert, og §5 «Testbarhet» gjør testsettet til et krav.
- **Ærlig scope og tatte beslutninger.** FR-2 («maks tre oppfølgingsspørsmål per erfaring»), «én annonse per økt» og «statisk refleksjonsforslag» er avgjort og begrunnet. Ikke-mål (§6) og utenfor-omfang (§7.2) er konkrete, og omfanget (9 FR) er realistisk for tre personer.

## 3. Oversikt per dimensjon

| Dimensjon | Vurdering | Kort begrunnelse |
|---|---|---|
| Beslutningsklarhet – er valg og avveininger synlige? | god | Alle fem åpne spørsmål er besvart med datert beslutning. Avveiningene står der, men som overstrykninger i stedet for ryddige beslutninger. |
| Substans – er innholdet fortjent, eller «pynt»? | god | Ingen pynte-personas eller boilerplate. Markedspåstanden i §1 mangler kilde, og personvernkravet i §5 er generelt formulert. |
| Strategisk sammenheng – har PRD-en en tese som funksjonene tjener? | sterk | Tese, FR-er, mål og motmetrikk henger sammen. |
| Testbarhet – vet man når hvert FR er ferdig? | god | Konkrete konsekvenser med tall, men sentrale KI-vurderinger («fanget», «korrekt», «dekker») har ikke et testbart kriterium. |
| Scope og avgrensning – er utelatelser eksplisitte? | god | Ikke-mål er tydelige. Feiltilfeller (API-feil, tom annonse, null erfaringer) er ikke nevnt verken som krav eller utenfor omfang. |
| Brukbarhet for neste fase – kan UX, arkitektur og stories hente fra den? | god | Stabile FR-/SM-ID-er og en konkret UJ. Noen brutte henvisninger og glossar-avvik (kap. 5). |
| Formtilpasning – passer PRD-formen produktet? | sterk | Én hovedreise med protagonist, FR-er gruppert per funksjon og lett rigor på det som ikke trengs. |

## 4. Viktigste forbedringer

### 4.1 Gjør de KI-avhengige kriteriene mekanisk testbare
- **Alvorlighet:** høy
- **Hvor:** FR-2 «rolle, handling og resultat alle er til stede», FR-4 «alle definerte krav ... korrekt», FR-5 «ingen tillagt eller oppdiktet innhold»
- **Problem og hvorfor det betyr noe:** Hvem avgjør at «resultat er til stede» eller at et innhold er «oppdiktet»? Hvis svaret er «språkmodellen vurderer selv», blir testene ikke-deterministiske og koster API-kall. PRD-en sier heller ikke om automatiske tester kjører mot ekte modell eller mot mock. Uten dette kan ikke stories for test og modul-grense skrives presist.
- **Forslag:** Velg kontrollerbare regler. Eksempel, FR-5: *«Konsekvenser: Hvert bevis inneholder et sitat som finnes ordrett som delstreng i et av studentens samtalesvar (streng-sammenligning, ingen modellkall i testen). Et bevis uten slikt sitat vises ikke i bevistabellen.»* Legg til: *«Automatiske tester kjører mot en mock av språkmodellen med lagrede svar fra testsett A; én manuell test mot ekte modell dokumenteres.»* Det gir også FR-9 og testene samme mock.

### 4.2 Beskriv hva som skjer når KI eller inndata svikter
- **Alvorlighet:** høy
- **Hvor:** §4 som helhet; FR-1, FR-4 og FR-3
- **Problem og hvorfor det betyr noe:** Ingen FR dekker API-feil/tidsavbrudd, en annonse som ikke inneholder krav, for lang tekst, eller en økt der ingen erfaring blir «fanget» (FR-3 tillater «Ferdig» når som helst). Dette er stedene der KI-apper faktisk går i stykker, og arkitekt og testere må gjette hvis det ikke står her.
- **Forslag:** Nytt FR-10 «Håndter feil og tomme resultater». Eksempel: *«Hvis modellkallet feiler, vises en feilmelding og studenten kan prøve igjen uten å miste samtalen. Hvis kravuttrekket gir 0 krav, vises «Fant ingen krav i teksten» og studenten kan lime inn ny tekst. Hvis 0 erfaringer er fanget ved «Ferdig», går økten ikke videre til kravuttrekk.»*

### 4.3 Gjør suksessmålene målbare
- **Alvorlighet:** medium
- **Hvor:** §8 SM-1 «mål +1 poeng», SM-3 «≥7/10», SM-C1 «ved stikkprøve»
- **Problem og hvorfor det betyr noe:** Det står ikke hvem som testes, hvordan, eller hvor stor stikkprøven er. SM-2 er dessuten samme tall og samme krav som FR-5 («≥80 %»), så to steder kan komme ut av takt. SM-C1 motvirker bare SM-2, mens SM-3 («fullfører») kan presses opp ved at samtalen avsluttes for tidlig.
- **Forslag:** *«SM-1: 5 medstudenter utenfor gruppen svarer på spørsmålet før og etter én økt; mål gjennomsnitt +1.»* *«SM-C1: kontroller alle bevis i bevistabellen for testsett A og tre økter med fri tekst; mål 0 uten sporbart sitat.»* Fjern ≥80 %-tallet fra den ene av SM-2/FR-5 og henvis til den andre.

### 4.4 Gjør personvern og kostnad til krav, ikke bare rammer
- **Alvorlighet:** medium
- **Hvor:** §5 «Studenten informeres om dette før økten starter», «dimensjonert for lav kostnad per økt»
- **Problem og hvorfor det betyr noe:** Informasjonen før start har ingen FR og ingen test. Kostnaden (<10 øre, ~15 kall i addendumet) forutsetter en øvre grense, men antall erfaringer og annonselengde er ikke begrenset. Studentens tekst sendes til en ekstern språkmodell; det bør stå hva studenten faktisk får vite.
- **Forslag:** *«FR-11: Før første spørsmål vises en tekst som sier at svarene sendes til en ekstern språkmodell, at ingenting lagres etter økten, og at studenten bør unngå personnummer og helseopplysninger. Studenten må bekrefte for å starte.»* Legg til en grense, f.eks. *«Annonser over 6000 tegn avvises med melding; samtalen avsluttes etter 8 fangede erfaringer.»*

### 4.5 Underbygg eller dempe markedspåstanden i visjonen
- **Alvorlighet:** lav
- **Hvor:** §1 «Markedssøk gjort under dette PRD-arbeidet fant ingen sammenlignbart produkt»
- **Problem og hvorfor det betyr noe:** Påstanden er sterk, men har ingen kilde og kan ikke etterprøves. Det er en typisk KI-formulering som lett blir feil, og den bærer ingen krav.
- **Forslag:** Legg inn 2–3 konkrete verktøy dere faktisk har sjekket med dato, eller skriv: *«Vi har ikke funnet et verktøy som kombinerer disse tre tingene (sjekket 2026-11-02: X, Y, Z).»*

## 5. Mekaniske funn

- **Brutte henvisninger:** §0 sier antagelser er «indeksert i §9», men indeksen er §10 (§9 er Åpne spørsmål). §2.2, Ordliste («Økt») og §5 viser til «§6.2» for «ingen lagring», men det står i §7.2 (§6 er Ikke-mål).
- **Glossar-avvik:** «oppsummering» brukes både om oppsummeringen av fangede erfaringer (FR-3) og om eksporten (FR-8 «bevistabellen og oppsummeringen»). «Samtalesvar», «fanget», «refleksjonsforslag» og knappen «Ferdig» brukes som faste begreper, men står ikke i Ordlisten.
- **Opprydding:** §9 har null åpne spørsmål (alle overstrøket), og §10 har fire overstrøkne antagelser. FR-3 og FR-6 inneholder redaksjonelle «(Justert ...)»-setninger. Flytt historikken til en endringslogg eller git-historikken, og la §9/§10 vise det som faktisk er åpent.
- **Motsigelse mellom filer:** addendum («Selve testsettene (fixtures) er ikke definert ennå») sier noe annet enn PRD §9 spm. 4 (testsett A finnes i `fixtures/testsett-a/`). Åpent spørsmål 4 nevner dessuten et gruppemedlem ved fornavn i et offentlig repo; vurder å bruke rolle i stedet.
- **ID-er:** FR-1–FR-9, SM-1–SM-7 og SM-C1 er sammenhengende, og SM-ene viser til FR-er som finnes. Ingen ubesvarte `[ASSUMPTION]` i teksten; kun `[NOTE FOR PM]` i §7.2. FR-5–FR-9 mangler «Realiserer UJ-1» (står bare på funksjonsnivå), og FR-9 (demomodus for sensor) har ingen reise.

## 6. Før dere går videre

**Må avklares før UX, arkitektur og epics:**
1. Skal automatiske tester kjøre mot mock eller ekte modell, og hvordan avgjøres «fanget», «korrekt» og «dekker» (4.1)?
2. Feilhåndtering og tomme tilstander: hva skal UX vise når modellen feiler, annonsen er tom, eller ingen erfaring er fanget (4.2)?
3. Rett opp henvisningene og glossaret (kap. 5), slik at stories kan sitere begreper entydig.

**Kan vente:** SM-målemetode og utvalg (4.3), personvern-/kostnadsgrenser i detalj (4.4), kilde til markedspåstanden (4.5), en eksempelrad i bevistabellen (fra briefen-tilbakemeldingen), og «karrierebanken» (§7.2).

**Oppfølging av tilbakemelding på product brief: ja.** Funksjonelle, testbare kriterier (SM-4–SM-7), modell/kostnad (addendum), demomodus (FR-9), når samtalen er ferdig (FR-3), synlig sporbarhet (FR-6), testsett A og `.env`/mock-hygiene er alle fulgt opp. Det gjenstår å gjøre mock til et eksplisitt testkrav (4.1).

## 7. Refleksjonsspørsmål

1. Påstanden om «markedssøk» i §1 kom trolig fra KI. Hvordan sjekket dere den, og hva ville dere gjort hvis den ikke stemte?
2. FR-2 sier at en erfaring er «fanget» når rolle, handling og resultat er til stede. Prøv å skrive tre svar fra en student som er grensetilfeller. Hvordan ville dere, uten å spørre en språkmodell, avgjort om testen skal bestå?

_Vurdert mot kvalitetsrubrikken i bmad-prd. Dette er veiledning, ikke sensur._
