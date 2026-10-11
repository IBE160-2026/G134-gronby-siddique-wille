# Product Brief: Erfaringsgruven

## Executive Summary

For studenter som skal søke sin første relevante jobb lager vi Erfaringsgruven. Verktøyet hjelper dem å oppdage det de allerede har gjort, og viser krav for krav hvilke av deres egne erfaringer som beviser at de passer til en stillingsannonse.

Vi antar at mange studenter tror de «ikke har noe å skrive». Studentjobben, det frivillige arbeidet, gruppeprosjektene og utvekslingen blir undervurdert, eller studenten ber en chatbot skrive søknaden og får et generisk brev uten konkret innhold. Erfaringsgruven er ikke en tekstgenerator. Den intervjuer studenten og finner ikke på noe. Alt som brukes kan spores tilbake til studentens egne svar.

Hvorfor nå: språkmodeller gjør det mulig å føre en naturlig oppfølgingssamtale og å koble erfaringer mot kravene i en annonse. Når flere bruker de samme verktøyene til å skrive søknader, antar vi at konkrete og egne eksempler blir det som skiller søkere fra hverandre.

## The Problem

Studenter og nyutdannede skal konkurrere om stillinger som krever «erfaring», og de kjenner sjelden sin egen erfaring godt nok til å beskrive den. Slik løser de det i dag:

- De skriver CV-en ut fra det som «høres ut som jobberfaring», og utelater ting som faktisk viser ansvar, samarbeid eller resultater.
- De dropper stillinger fordi de tror de ikke oppfyller kravene, selv om de har relevante erfaringer de ikke har satt ord på.
- De ber en generell chatbot om å skrive søknaden. Resultatet blir ofte generelt, og studenten lærer ikke hva hen faktisk har å tilby.

Kostnaden er søknader uten konkrete eksempler, ubrukte erfaringer og usikkerhet foran hver søknad. Dette er antagelser vi bygger på og må teste i samtaler med studenter.

**Et typisk scenario:** En student har jobbet deltid i butikk i tre år, ledet en gruppeoppgave og vært på utveksling, men skriver «ingen relevant erfaring» i søknaden. Erfaringen finnes, men studenten har ikke ord for den.

## The Solution

Erfaringsgruven tar studenten gjennom fire steg.

1. **Samtalen.** Studenten forteller om det hen har gjort: jobber, frivillig arbeid, studieprosjekter, utveksling. Verktøyet stiller oppfølgingsspørsmål («Hva var din rolle? Hva ble resultatet?») til erfaringene er konkrete nok til å bruke.
2. **Annonsen.** Studenten limer inn en stillingsannonse, og verktøyet trekker ut hva arbeidsgiveren faktisk krever.
3. **Bevistabellen.** For hvert krav ser studenten hvilken av sine egne erfaringer som dokumenterer det, sammen med en kort bevishistorie i studentens egne ord. Krav uten bevis markeres tydelig som hull, med forslag til hva studenten kan reflektere over eller bygge opp.
4. **Resultatet.** Det kan tas med videre og brukes i CV, søknad og intervju. Siden første versjon ikke lagrer noe, tar studenten med seg resultatet som tekst og oppbevarer det selv.
   
**Når er samtalen ferdig?** Samtalen avsluttes når studenten har beskrevet minst tre erfaringer med rolle, handling og resultat, eller når studenten selv velger «Ferdig». Verktøyet oppsummerer erfaringene og lar studenten rette før neste steg.

**Eksempel på bevistabellen:**

| Krav fra annonsen | Bevis | Fra samtalen |
|---|---|---|
| Erfaring med kundekontakt | Tre år deltid i butikk med ansvar for reklamasjoner | «Jeg tok meg av klagene når sjefen ikke var der» |
| Kjennskap til Excel | **Hull** | Forslag: tenk over om du har brukt regneark i studiet eller jobben |

Regelen bak alt er at verktøyet aldri finner på noe. Alt det bruker må kunne knyttes til noe studenten selv har sagt.

## What Makes This Different

| Alternativ i dag | Hvorfor studenter bruker det | Hva Erfaringsgruven gjør annerledes |
|---|---|---|
| Skrive selv, med CV-mal | Gratis og full kontroll | Hjelper studenten å se egne erfaringer og koble dem til kravene |
| Generell chatbot («skriv søknaden min») | Raskt | Finner ikke på noe, og studenten lærer hva hen faktisk kan |
| Karriereveileder eller medstudent | Personlig og trygt | Tilgjengelig når som helst, og forbereder samtalen |
| Ikke søke | Ingen risiko | Viser at flere krav er dekket enn studenten trodde |

Vi har ingen teknisk «moat». En godt instruert chatbot kan gjøre mye av det samme, og vi antar at få vet hvordan de skal be om det. Fordelen er arbeidsflyten: den tvinger frem konkrete eksempler, holder alt sporbart til studentens egne svar og gjør hullene synlige.

## Who This Serves

**Primærbruker:** studenten som er i siste del av studiet og skal søke første relevante jobb eller internship. Studenten har ofte mer erfaring enn hen tror, men mangler språk og oversikt til å vise den. Suksess er å gå fra «jeg har ingenting å skrive» til en liste med konkrete bevis for hvert krav hen faktisk dekker, og å vite hva hen mangler.

**Sekundær:** karriereveiledere ved studiesteder, som kan bruke resultatet som utgangspunkt for samtaler med studenter.

## Success Criteria

Målene under er utgangspunkt som vi tester i brukertester med studenter.

| Signal | Mål | Slik måler vi |
|---|---|---|
| Brukerutbytte | Studenter opplever økt trygghet: minst ett poeng høyere på en skala fra 1 til 5 etter bruk | Kort spørsmål før og etter |
| Dekning | Minst 80 % av kravene studenten faktisk oppfyller får minst ett konkret bevis | Gjennomgang av bevistabellen sammen med brukeren |
| Kvalitet og tillit | Ingen påstander i bevistabellen som ikke kan spores til brukerens egne svar | Stikkprøver i brukertestene |
| Bruk | Minst 7 av 10 testbrukere fullfører hele forløpet (samtale, annonse, bevistabell) i én økt | Antall fullførte forløp |

Kriteriene under kan testes automatisk eller som dokumenterte manuelle tester.

| Kriterium | Mål | Slik tester vi |
|---|---|---|
| Kravuttrekk | For testannonse A trekker verktøyet ut alle fem kravene vi har definert på forhånd | Automatisk test med mock-svar |
| Sporbarhet | Hvert bevis i tabellen viser til minst ett svar fra samtalen | Automatisk test |
| Hull | Et krav uten bevis vises som hull, med forslag | Automatisk test med fast testsett |
| Eksport | Resultatet kan kopieres som ren tekst | Dokumentert manuell test |
| Demomodus | Hele flyten kan kjøres uten API-nøkkel | Manuell test etter README |

## Scope

**IN for v1**

1. Samtale der verktøyet intervjuer studenten om erfaringer.
2. Innliming av stillingsannonse (norsk eller engelsk) og uttrekk av krav.
3. Bevistabell som kobler krav til studentens erfaringer, med tydelige hull.
4. Mulighet til å ta med resultatet som ren tekst.
5. Personvern og sikkerhet: all kommunikasjon mellom brukeren og tjenesten krypteres, og verktøyet lagrer ingen CV-er eller personopplysninger etter at økten er avsluttet. Teksten sendes til en språkmodell for å bli behandlet i økten, og brukeren får beskjed om dette før start. Vi velger leverandør og innstillinger slik at teksten ikke brukes til å trene modellen.
6. Demomodus: appen kan kjøres med lagrede eksempelsvar uten API-nøkkel, slik at sensor og testere kan prøve hele flyten uten konto.

**Hvis tid i v1**

1. Studenten kan redigere bevisene i bevistabellen.

**OUT for v1**

1. Ferdigskrevne søknadsbrev.
2. CV-maler og layout.
3. Optimalisering mot ATS-systemer (rekrutteringssystemer som sorterer søknader automatisk).
4. Brukerkontoer og varig lagring. Hvis vi senere innfører lagring, skal dataene krypteres og kunne slettes av brukeren.
5. Kobling til jobbsider og innsending av søknader.
6. Intervjutrening og dashboard for karriereveiledere.


## Språkmodell, kostnad og kjøring

Appen bruker Claude Haiku 5.5 fra Anthropic via API. Vi valgte den fordi den er blant de billigste modellene på markedet, håndterer norsk godt og er rask nok til en samtale. Anthropic bruker ikke data fra API-et til å trene modellene sine, noe som passer med personvernkravet vårt i scope.

En økt bruker omtrent 15 kall til modellen: rundt 12 i samtalen, ett for å trekke ut krav fra annonsen og ett eller to for å lage bevistabellen. Med prisen på 0,10 dollar per million tokens inn og 0,50 dollar ut anslår vi kostnaden til under 10 øre per økt. Hele semesterets utvikling og testing bør dermed koste under 100 kroner.

Prisene er hentet 11. oktober 2026 og kan ha endret seg.

Kilder:
- [Anthropic: Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Anthropic: Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms)

## Vision

På sikt blir Erfaringsgruven en personlig karrierebank som vokser gjennom hele studiet. Studenten legger til erfaringer underveis, i stedet for å lete etter dem i panikk når en annonse dukker opp. Når annonsen kommer, ligger beviset allerede klart.

Om to til tre år kan verktøyet brukes av karrieresentre og studiesteder som del av veiledningen. Grunnprinsippet er det samme som i første versjon: KI skal hjelpe mennesker å se og dokumentere det de faktisk kan, ikke dikte opp noe de ikke har gjort.
