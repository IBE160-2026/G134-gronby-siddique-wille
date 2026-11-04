---
type: review
lens: reconcile (spine ↔ input)
target: ../ARCHITECTURE-SPINE.md
inputs:
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md
  - docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/addendum.md
  - docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md
  - fixtures/testsett-a/README.md, student.json, fasit.json
date: 2026-11-04
---

# Gjennomgang: spine mot kildene (reconcile)

**Dom:** Spinen dekker kjernen godt (sitatverifisering, tilstandsløs server, demo bak modellgrensesnittet, ID-prefiks), men har én intern selvmotsigelse om rettelser som også bryter med EXPERIENCE.md. I tillegg mangler flere stille krav som går på tvers av enheter: om personvernløftet holder, hvordan nullstilling håndterer kall som er underveis, hvordan erfaringer slås sammen per tur, og hvilke regler som styrer om man kan gå videre. Disse bør lukkes før bygging.

Alvorlighetsgrad: **critical** = bygget blir feil eller selvmotsigende · **high** = enhetene vil sannsynligvis passe dårlig sammen · **medium** = uavklart og verdt en regel eller kjernefunksjon · **low** = presisering.

---

## A. Motsigelser

### A-1 [critical] Rettelser kan siteres (AD-5), men rettet tekst skal aldri siteres (AD-8, EXPERIENCE)

- AD-5: en `rettelse` inneholder «hele den nye felteksten», R-ID-en legges til `svarIder`, og «Bare `svar` og `rettelse` kan siteres».
- AD-8: «`felt.tekst` (som kan være rettet) … siteres aldri. Sitater hentes bare via `svarIder` fra loggen.»
- EXPERIENCE, Bevissitat: «hentes alltid fra samtaleloggen, også når erfaringen er rettet på Oppsummering». Erfaringskort: rettet tekst «endrer aldri bevissitatene».

Når en R-oppføring både inneholder den rettede teksten og kan siteres, kan et bevissitat være rettet tekst. Det motsier AD-8 og UX. AD-5 er merket `[ADOPTED]` selv om Å-2 står åpent. I tillegg sier fasit-README at enhver svar-ID utenfor `bevis` eller `tillatt_i_tillegg` er en feilkobling, så et R-sitat vil telle som en SM-C1-feil i evalueringen.
**Forslag:** Velg én modell. Enten (a) kan `rettelse`-oppføringer **ikke** siteres, men bare brukes til koblingen, og R-ID-en legges i et eget felt (ikke `svarIder`). Eller (b) behold dem som sitérbare, men oppdater AD-8, EXPERIENCE og fasit-reglene. Sett AD-5 til `[PROPOSED]` til Å-2 er lukket.

### A-2 [medium] `beforeunload` fra «første studentsvar» gjelder ikke tydelig i demomodus

AD-3 aktiverer varselet ved første studentsvar. I demo skriver studenten ingenting, men trykker «Neste». EXPERIENCE gir varselet uten noen slik betingelse. Det er ikke en direkte motsigelse, men det må sies om et avspilt demosvar også teller som studentsvar.

### A-3 [low] Demo-fallet for K5 er bare «synlig» i README og serverloggen

AD-11 sier at det falske sitatet «synlig gjør K5 til hull». Men AD-6 fjerner det i stillhet, så i grensesnittet ser sensor bare et vanlig hull. Det kan ikke skilles fra at modellen aldri foreslo noe. Dette er greit, men formuleringen bør si at sensor ser beviset i serverloggen (AD-12-formatet) og i README, ikke i UI.

---

## B. Stille krav som ikke landet i spinen

### B-1 [high] Personvernløftet: «kryptert» og «ingenting lagres»

- PRD §5: «Kommunikasjon er kryptert». Addendum: «Kryptert kommunikasjon (TLS) mellom klient og API».
- PRD §5 og addendum: «Studenten informeres om dette før økten starter». EXPERIENCE sin tekst er «Ingenting lagres når du lukker fanen.»

Spinen kjører `next dev -H 127.0.0.1` over HTTP og sier ingenting om kryptering. Den sier heller ingenting om at svarene sendes til en tredjepart (Anthropic), som har sine egne regler for å oppbevare API-data. Spinen må slå fast (1) at «kryptert» betyr HTTPS fra server til Anthropic, og at loopback i nettleseren er utenfor (eller begrunne hvorfor). Den må også si (2) hva personvernlinjen kan love med sannhet, og at teksten på Start skal stemme med AD-2 og AD-12 *og* med Anthropics retningslinjer for API-data. Linjen er en kontrakt mellom tekst og arkitektur. I dag eier ingen den.
**Forslag:** Legg til et AD for personvernløftet: hvilke data som går hvor, hvilken TLS-strekning som gjelder, og at teksten på Start ikke kan love mer enn arkitekturen holder. Sjekk Anthropics gjeldende retningslinjer for oppbevaring av data før teksten låses.

### B-2 [high] Nullstilling uten vern mot kall som er underveis

EXPERIENCE: «Gå tilbake og endre» nullstiller alle senere steg, og «Ny økt» tømmer alt. Stegindikatoren lar studenten gå tilbake mens et `/api/krav`- eller `/api/bevis`-kall venter. AD-4 legger nullstillingen i reduceren, men et sent svar vil da fylle en bevistabell bygd på gammel annonse eller gamle erfaringer, eller en økt som allerede er tømt.
**Forslag:** Gi hver forespørsel en generasjon eller versjon av økten, og la reduceren forkaste svar med utdatert generasjon. Hvis det er enklere: lås navigasjonen mens et kall pågår (EXPERIENCE låser bare chatinputen).

### B-3 [high] Hvordan erfaringer slås sammen per samtaletur er ikke definert

Erfaringskort dukker opp «så snart en erfaring er nevnt», så `/api/samtale` må returnere oppdateringer av erfaringene på hver tur. Ruten er tilstandsløs, og E-ID-er «tildeles av kjernen i API-ruten». Spinen sier ikke:
- hvilke eksisterende erfaringer klienten sender med, og hvordan modellen skiller «ny erfaring» fra «oppdatering av E2»
- hva som skjer med felt studenten har rettet på Oppsummering når hen velger «Fortsett samtalen» og modellen foreslår ny tekst (overskrives rettelsen?)
- hvordan et **slettet** erfaringskort holdes slettet (svarene står fortsatt i loggen, så modellen vil gjenskape det på neste tur)
- om E-ID-er kan gjenbrukes etter sletting (bevis peker på `erfaringId`)

**Forslag:** Legg til en sammenslåingsregel i kjernen (`slaSammenErfaringer`). Den bør sende med eksisterende erfaringer og en liste over slettede ID-er, og la rettede felt vinne over modellforslag. E-ID-er skal aldri gjenbrukes.

### B-4 [medium] Regler for å gå videre mangler i kjernen

Disse avgjør om studenten kan gå videre. Etter paradigmet bør de være kjernefunksjoner, men ingen er nevnt:
- **«Ferdig» er deaktivert til minst ett oppfølgingsspørsmål er stilt** (FR-1, EXPERIENCE). Det er også uklart om åpningsspørsmålet teller som «oppfølgingsspørsmål».
- **≥3 fangede → tilby «Gå videre til oppsummering»**, og overgangen skjer aldri automatisk (FR-3).
- **0 fangede → bare «Fortsett samtalen»**, og ≥1 fanget kreves for å gå videre (EXPERIENCE).
- **Annonsen må ha ≥200 tegn** før «Finn krav» blir aktiv. Grensen bør være én konstant som både klienten (knappen) og `/api/krav` (`ugyldig_foresporsel`) bruker. Demoannonsen må også oppfylle den (annonse-a.md har ca. 1460 tegn og gjør det).
- **Kravuttrekk uten treff** er et gyldig, tomt svar og ikke `ugyldig_svar`. Det sender studenten tilbake til Annonse.

**Forslag:** Legg til `kjerne/regler.ts` (eller lignende) med disse predikatene, og knytt dem til FR-1 og FR-3 i kartet.

### B-5 [medium] Hvilke erfaringer går videre til kobling?

FR-3 sier at Oppsummering viser «fangede» erfaringer. Men med «Ferdig» etter færre enn 3 kan det finnes erfaringer som bare er delvis fanget. Spinen sier ikke om delvise erfaringer vises på Oppsummering, sendes til `/api/bevis` eller tas med i eksporten. Det påvirker hva koblingen kan bruke, og det påvirker fasiten.

### B-6 [medium] Hva eksporten inneholder, og hvordan sporbarhet vises i ren tekst

EXPERIENCE: eksporten inneholder krav, så bevis eller «Ikke dekket ennå» med refleksjonsforslag, og deretter oppsummeringen av erfaringene. Bevissitatet «skal alltid ha en sporbar henvisning», også i Eksport. Anti-mønster: ingen ferdig søknadstekst, bare krav, bevis i studentens ord og hull. Spinen sier bare at `eksport.ts` bruker `felt.tekst`. Mangler:
- rekkefølgen på seksjonene og at det bare brukes verifiserte sitater
- hva «sporbar henvisning» er i ren tekst (svar-ID? spørsmålet svaret hørte til?)
- at slettede erfaringer ikke kommer med, og at rettede titler brukes
- «Last ned .txt» lages på klienten (Blob) og bryter ikke AD-2

### B-7 [medium] Tilgjengelighet som krever tilstand og stabile ID-er

- «Vis i samtalen» skal rulle til, markere og **flytte fokus** til et bestemt svar. Det krever at hver loggoppføring har en stabil DOM-ID avledet av `svarId`. Dette er en kontrakt mellom Bevistabell og visningen av samtaleloggen, og spinen sier det ikke.
- **Fokus går tilbake** til lenken som åpnet `Sheet`. Klienten må vite hvilket element som åpnet panelet (lokal UI-tilstand er greit etter AD-4, men det bør sies).
- Chatloggen er `aria-live="polite"`, og fremdriften kunngjøres når antallet fangede endrer seg. Antallet må komme fra `erFanget()` (AD-7), ikke fra en egen telling i komponenten.
- R-H-R-popoveren viser «utdraget fra studentens svar». AD-6 binder popoveren, men felt har bare `svarIder` og ingen `sitat`. Spinen må si om popoveren viser hele svaret eller et verifisert utdrag, og hva «verifisert `svarId`» i AD-7 betyr for felt (at ID-en finnes og er et studentsvar?).

### B-8 [medium] Detaljer i demoflyten

- **Hvordan DemoModell velger svar:** ruten er tilstandsløs, så DemoModell må finne riktig lagret svar ut fra forespørselen (for eksempel antall svar i loggen). Det er ikke sagt.
- **Slutten av demoskriptet:** EXPERIENCE sier at «Neste» blir til «Gå videre til oppsummering» når skriptet er ferdig. Klienten må vite lengden på manuset (fra `/api/demo/manus`).
- **Forhåndsutfylt annonse:** hvis sensor endrer annonsen i demo, returnerer DemoModell likevel lagrede krav. Spinen bør si om annonsefeltet er låst i demo, eller at lagrede svar ikke avhenger av innholdet.
- **«Ferdig» tidlig i demo:** lagrede bevis peker på S8–S10, som ikke finnes ennå. AD-5 forkaster ukjente ID-er, så det blir hull. Det er riktig oppførsel, men verdt å si.
- **S13 i student.json** («Det stemmer. Ferdig.») svarer på en oppsummering i chatten, som appen har som eget steg. Demomanuset bør trolig stoppe ved S12.
- **Åpningsspørsmålet:** er det statisk (fra klient eller manus) eller et modellkall? Det påvirker A1 og første kall.

### B-9 [medium] ID-formatet må passe med testsett A

- Testsett A nummererer **bare studentsvar** (S1–S13). Hvert svar har spørsmålet sitt innebygd, og det finnes ingen A-ID-er. AD-5 sier at `S`/`A`/`R` tildeles «fortløpende». Det må stå **eksplisitt at hvert prefiks har sin egen teller**. Med én felles teller (A1, S2, A3 …) blir `S8` i fasiten feil oppføring.
- Felt i fixturen bruker `kilder`, mens spinen bruker `svarIder`. Det trengs én navngitt mapping, eller samme navn i begge.
- Fasiten har én `erfaring` per krav, mens spinen tillater flere bevis fra flere erfaringer («+N bevis til»). Evalueringen må tåle det.

### B-10 [low] Tonekrav som får følger for arkitekturen

- Standardteksten kjernen setter inn for refleksjonsforslag (AD-7) må følge tonen i UX: du-form, «Tenk på: har du noen gang …?», ingen sjargong (STAR, kompetanse, ATS) og ingen ferdige formuleringer for studenten. Den bør ligge sammen med UI-tekstene og ikke skrives fritt i kjernen.
- Erfaringstitler «foreslås av systemet, men er hentet fra studentens ord». Det finnes ingen regel eller sjekk for det. Tittelen er modelltekst som vises ved siden av sitater. Det bør sies om den sjekkes eller bare styres av prompten.
- Overskriften for «Ingen krav dekket» og teksten «Ikke dekket ennå» kommer fra utledet status (AD-7). Bare klienten gjør dette, men statusen må komme fra kjernen og ikke fra modellen.

### B-11 [low] AD-12 og feilobjekter fra Zod og SDK

Når et modellsvar ikke passer skjemaet, kan feilmeldingene fra Zod inneholde verdiene som ble avvist, altså modelltekst som siterer studenten. Hvis ruten logger hele feilobjektet, brytes AD-12. Spinen bør si at bare stien og koden til feilen logges.

### B-12 [low] Tittelredigering og rettelser

EXPERIENCE lar studenten redigere **tittelen** inline. AD-5 tillater bare `felt` ∈ `rolle | handling | resultat`. Det bør sies om en tittelendring er en rettelse, og om den utløser nullstilling (B-2).

---

## C. Sjekket og i orden

- Ingen lagring i nettleseren, og omlasting fører til Start (AD-2) stemmer med PRD §6.2 og EXPERIENCE.
- Ordrett sitat og «Vis i samtalen» (AD-6, FR-6) stemmer med FR-5, SM-5 og SM-C1. Spinen går lenger enn fixtures («mulig utvidelse»), og det er bra.
- Begge moduser med nøkkel og bare demo uten nøkkel, samt `harDemodata`, stemmer med State Patterns og Flyt 2.
- K5 som hull er i tråd med fasiten. Det falske sitatet i demodataene tester AD-6, mens fellen i fasiten (`forbudte_bevis`) fortsatt testes av evalueringen (AD-6 sier dette selv).
- Feiltoasten med «Prøv igjen», der input beholdes, stemmer med EXPERIENCE.
- Promptene ligger i repoet, `.env.example` og fixtures er skilt fra ekte data, i tråd med repohygienen i addendum.
