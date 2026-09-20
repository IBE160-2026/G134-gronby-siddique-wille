# Product Brief: Bevisbanken

## Executive Summary

For studenter som skal søke sin første relevante jobb lager vi Bevisbanken: et verktøy som hjelper dem å oppdage det de allerede har gjort, og som viser, krav for krav, hvilke av deres egne erfaringer som beviser at de passer til en stillingsannonse.

I dag tror mange studenter at de «ikke har noe å skrive». De undervurderer studentjobben, frivillig arbeid, gruppeprosjektene og utvekslingen, eller de ber en chatbot skrive søknaden og får et generisk brev som ikke bygger på noe konkret. Bevisbanken gjør det motsatte av en tekstgenerator. Den intervjuer studenten og finner aldri på noe. Alt som brukes kan spores tilbake til studentens egne svar.

Hvorfor nå: språkmodeller gjør det praktisk mulig å føre en naturlig oppfølgingssamtale og å koble erfaringer mot krav i en annonse. Samtidig antar vi at når mange bruker de samme verktøyene til å skrive søknader, blir konkrete og egne eksempler det som skiller en søker fra en annen.

## The Problem

Studenter og nyutdannede skal konkurrere om stillinger som krever «erfaring», og de kjenner sjelden sin egen erfaring godt nok til å beskrive den. Slik løser de det i dag:

- De skriver CV-en ut fra det som «høres ut som jobberfaring», og utelater ting som faktisk viser ansvar, samarbeid eller resultater.
- De dropper stillinger fordi de tror de ikke oppfyller kravene, selv om de har relevante erfaringer de ikke har satt ord på.
- De ber en generell chatbot om å skrive søknaden. Resultatet blir ofte generelt, og studenten lærer ikke hva hen faktisk har å tilby.

Kostnaden er søknader uten konkrete eksempler, ubrukte erfaringer og usikkerhet foran hver søknad.

*Merk: Dette er antagelser vi bygger på. De må testes i samtaler med studenter før vi kan kalle dem funn.*

[En student har jobbet deltid i butikk i tre år, ledet en gruppeoppgave og vært på utveksling, men skriver «ingen relevant erfaring» i søknaden. Erfaringen finnes, men studenten har ikke ord for den.]

## The Solution

Bevisbanken tar studenten gjennom fire steg.

1. **Samtalen.** Studenten forteller om det hen har gjort: jobber, frivillig arbeid, studieprosjekter, utveksling. Verktøyet stiller oppfølgingsspørsmål («Hva var din rolle? Hva ble resultatet?») til erfaringene er konkrete nok til å bruke.
2. **Annonsen.** Studenten limer inn en stillingsannonse, og verktøyet trekker ut hva arbeidsgiveren faktisk krever.
3. **Bevistabellen.** For hvert krav ser studenten hvilken av sine egne erfaringer som dokumenterer det, sammen med en kort bevishistorie i studentens egne ord. Krav uten bevis markeres tydelig som hull, med forslag til hva studenten kan reflektere over eller bygge opp.
4. **Bevisbanken.** Resultatet kan tas med videre og brukes i CV, søknad og intervju.

Regelen bak alt er at verktøyet aldri finner på noe. Alt det bruker må kunne knyttes til noe studenten selv har sagt.

## What Makes This Different

| Alternativ i dag | Hvorfor studenter bruker det | Hva Bevisbanken gjør annerledes |
|---|---|---|
| Skrive selv, med CV-mal | Gratis og full kontroll | Hjelper studenten å se egne erfaringer og koble dem til kravene |
| Generell chatbot («skriv søknaden min») | Raskt | Finner ikke på noe, og studenten lærer hva hen faktisk kan |
| Karriereveileder eller medstudent | Personlig og trygt | Tilgjengelig når som helst, og forbereder samtalen |
| Ikke søke | Ingen risiko | Viser at flere krav er dekket enn studenten trodde |

Vi har ingen teknisk «moat». En godt instruert chatbot kan gjøre mye av det samme, men de færreste vet hvordan de skal be om det. Fordelen er arbeidsflyten: den tvinger frem konkrete eksempler, holder alt sporbart til studentens egne svar og gjør hullene synlige.

## Who This Serves

**Primærbruker:** studenten som er i siste del av studiet og skal søke første relevante jobb eller internship. Studenten har ofte mer erfaring enn hen tror, men mangler språk og oversikt til å vise den. Suksess er å gå fra «jeg har ingenting å skrive» til en liste med konkrete bevis for hvert krav hen faktisk dekker, og å vite hva hen mangler.

**Sekundær:** karriereveiledere ved studiesteder, som kan bruke resultatet som utgangspunkt for samtaler med studenter.

## Success Criteria

Målene under er utgangspunkt vi tester i brukertester med studenter, og ikke løfter.

| Signal | Mål | Slik måler vi |
|---|---|---|
| Brukerutbytte | Studenter opplever økt trygghet: minst ett poeng høyere på en skala fra 1 til 5 etter bruk | Kort spørsmål før og etter |
| Dekning | De fleste av kravene studenten faktisk oppfyller får minst ett konkret bevis | Gjennomgang av bevistabellen sammen med brukeren |
| Kvalitet og tillit | Ingen påstander i bevistabellen som ikke kan spores til brukerens egne svar | Stikkprøver i brukertestene |
| Bruk | Studenter fullfører hele forløpet (samtale, annonse, bevistabell) i én økt | Antall fullførte forløp |

## Scope

**IN for v1**

1. Samtale der verktøyet intervjuer studenten om erfaringer.
2. Innliming av stillingsannonse og uttrekk av krav.
3. Bevistabell som kobler krav til studentens erfaringer, med tydelige hull.
4. Mulighet til å ta med resultatet som ren tekst.
5. Ingen lagring utover økten. Verktøyet lagrer ikke CV eller personopplysninger, og det bør stå tydelig for brukeren.

**OUT for v1**

1. Ferdigskrevne søknadsbrev.
2. CV-maler og layout.
3. Optimalisering mot ATS-systemer (rekrutteringssystemer som sorterer søknader automatisk).
4. Brukerkontoer og varig lagring.
5. Kobling til jobbsider og innsending av søknader.
6. Intervjutrening og dashboard for karriereveiledere.

## Vision

På sikt blir Bevisbanken en personlig karrierebank som vokser gjennom hele studiet. Studenten legger til erfaringer underveis, i stedet for å lete etter dem i panikk når en annonse dukker opp. Når en annonse kommer, ligger beviset allerede klart.

Om to til tre år kan verktøyet brukes av karrieresentre og studiesteder som del av veiledningen. Det bygger på det samme grunnprinsippet som i første versjon: KI skal hjelpe mennesker å se og dokumentere det de faktisk kan, ikke dikte opp noe de ikke har gjort.
