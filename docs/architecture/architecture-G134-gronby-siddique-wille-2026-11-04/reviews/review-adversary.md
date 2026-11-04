---
review-of: ARCHITECTURE-SPINE.md (Erfaringsgruven, 2026-11-04)
lens: adversary — to enheter som hver følger alle AD-er til punkt og prikke, men bygger inkompatibelt
date: 2026-11-04
verdict: Ikke klar for parallell utvikling. Paradigmet og grensene er gode, men datakontrakten mellom samtale-ruten og reduceren er uspesifisert. Det gir minst fire par som bygger inkompatibelt uten å bryte noen AD.
---

# Adversarial gjennomgang: arkitektur-spine

Metode: For hvert tema konstruerer jeg to historier (A og B), bygget av ulike studenter med AI-hjelp. Begge følger alle AD-er ordrett, men kan ikke settes sammen. Hvert par er et hull med forslag til ny eller strammere AD.

Alvorlighet: **Kritisk** = gir feil data eller bryter SM-C1/SM-5 stille. **Høy** = integrasjonen feiler eller gir synlig feil. **Middels** = UI og eksport blir ulike, eller noe må gjøres om. **Lav** = uklarhet som koster tid.

---

## H-1 · Kritisk · `/api/samtale`: hele lista byttes ut, eller patch? Hvem eier `felt.tekst` og `tittel`?

**Hva spinen sier:** AD-4 sier at all endring går gjennom reduceren. AD-5 sier at E-ID-er tildeles i ruten. AD-8 sier at `felt.tekst` «kan være rettet». Spinen sier ikke hvilken form ruten returnerer erfaringsoppdateringer i, eller hva som skjer med rettet tekst når samtalen fortsetter.

**Par:**
- *Historie A (samtale-ruten):* Ruten returnerer `erfaringer: Erfaring[]`, altså hele den nye lista slik modellen ser den. Reduceren har handlingen `SAMTALE_SVAR_MOTTATT`, som erstatter `okt.erfaringer`. Det er enkelt og følger AD-4.
- *Historie B (Oppsummering):* Tittel og R-H-R kan redigeres inline. Kortet kan slettes med handlingen `ERFARING_SLETTET`. «Fortsett samtalen» tar studenten tilbake til Samtale. Det følger AD-4, AD-5 og AD-8.
- *Kollisjon:* Studenten retter «Resultat» for E3, sletter E2 og trykker «Fortsett samtalen». Neste modellsvar returnerer hele lista. Rettelsen blir overskrevet av modellens tekst, og E2 kommer tilbake, fordi modellen ser E2 i loggen. R-oppføringen ligger fortsatt i loggen og i `svarIder` (AD-5), men `felt.tekst` er ikke lenger den rettede teksten. AD-8 garanterte at koblingen bruker rettet tekst, og nå bruker den modellens tekst.
- *Variant med tittel:* UX sier at tittelen «foreslås av systemet». Modellen kan foreslå en ny tittel ved hver tur. Én implementasjon lar siste forslag vinne, en annen låser tittelen etter første forslag. Begge følger spinen. Testsett A (`tittel` i `student.json`) er dessuten skrevet som et sammendrag, ikke «hentet fra studentens ord».

**Fiks: ny AD-13 «Erfaringsoppdateringer er patcher, og studentens rettelse vinner»:**
- `/api/samtale` returnerer `erfaringsendringer: Array<{ ref: ErfaringId | NyRef, tittel?: string, felt?: { navn: 'rolle'|'handling'|'resultat', tekst?: string, nyeKilder: Kilde[] } }>`, aldri hele lista.
- Reduceren bruker kjernefunksjonen `brukEndringer(okt, endringer)`. Felt og tittel med `rettetAvStudent: true` får aldri ny tekst fra modellen, bare nye kilder.
- Slettede erfaringer ligger i `okt.slettedeErfaringer: ErfaringId[]`, sendes med til ruten, og endringer mot dem forkastes i kjernen.
- Tittel settes av modellen bare ved opprettelse. Etter det endrer bare studenten den.

---

## H-2 · Kritisk · Tilstandsløs ruten tildeler E-ID-er: gjenbruk og kollisjon

**Hva spinen sier:** AD-5 sier at E- og K-ID-er tildeles av kjernen i API-ruten. AD-2 sier at ruten ikke husker noe. Spinen sier ikke hva ruten skal regne neste nummer ut fra.

**Par:**
- *Historie A (`kjerne/ider.ts`):* `nesteId('E', erfaringer) = 'E' + (erfaringer.length + 1)`. Det er rent og tilstandsløst.
- *Historie B (`kjerne/ider.ts`, en annen student):* `nesteId = max(nummer) + 1` over erfaringene klienten sendte.
- *Kollisjon 1 (A):* Med E1, E2 og E3 sletter studenten E2. Neste nye erfaring får `E3`, altså to kort med samme ID. Reducer-oppslag og React-`key` går i stykker.
- *Kollisjon 2 (B):* Studenten sletter E3, som er den siste, og fortsetter. Neste nye erfaring får `E3` igjen. AD-5 sier at sletting *ikke* fjerner loggoppføringer, så `rettelse`-oppføringer med `erfaringId: 'E3'` fra det gamle kortet hører nå til det nye. «Vis i samtalen» og eventuell gruppering i Sheet viser feil kort.
- *Kollisjon 3:* Modellen har ingen måte å si «ny erfaring» på uten å finne på en ID, noe AD-5 forbyr. Én implementasjon lar modellen sende `id: null`, en annen `ny: true`, en tredje en midlertidig nøkkel `"ny-1"`. Med to nye erfaringer i samme tur og `null` kan ikke ruten skille dem.
- *K-ID-er:* Når studenten limer inn ny annonse, blir kravene K1… igjen. Et `/api/bevis`-svar som var underveis fra forrige annonse, refererer til K1–K5 og passerer ID-sjekken i AD-5. Se H-6.

**Fiks: stram inn AD-5:**
- Alle ID-er, også E og K, tildeles av **reduceren** fra tellere i økten (`okt.tellere = { A, S, R, E, K }`) som bare kan øke og aldri gjenbrukes, heller ikke etter sletting.
- Modellen og ruten bruker midlertidige referanser (`{ ny: 'n1' }`) for nye erfaringer. Reduceren bytter dem ut med varige ID-er.
- Hvis ruten skal tildele ID-er, sender klienten `nesteE`, og ruten returnerer ny `nesteE`. Uansett skal spinen si **én** kilde og `max+1` over *alle ID-er brukt i økten*, ikke over de som finnes nå.

---

## H-3 · Kritisk · `rettelse` kan siteres, men teksten i den er ofte modellens

**Hva spinen sier:** AD-5 sier at bare `svar` og `rettelse` kan siteres, og at en rettelse inneholder «hele den nye felteksten». AD-8 sier at `felt.tekst` aldri siteres. `felt.tekst` er i utgangspunktet modellens sammendrag (se `student.json`: «Står i kassa i travle perioder …»).

**Par:**
- *Historie A (Oppsummering):* Mia retter ett ord i et felt som modellen formulerte. Det lages `R1` med hele feltteksten, slik AD-5 krever.
- *Historie B (`/api/bevis`):* Modellen siterer «informerer kunder bakerst i køen om ventetiden» fra `R1`. `verifiserSitat` godtar sitatet, fordi det er en ordrett delstreng av en oppføring som kan siteres.
- *Kollisjon:* Bevistabellen viser modellens sammendrag under overskriften «Dette er dine egne ord fra samtalen». SM-C1 og løftet i UX brytes, selv om begge historiene fulgte AD-5, AD-6 og AD-8. AD-8 stopper bare sitering av `felt.tekst`, ikke av den samme teksten når den ligger i loggen.
- *Tilleggshull:* Hver blur lager en ny R-oppføring (UX: «lagres når feltet forlates»), slik at fem redigeringer gir R1–R5 i `svarIder`. Hvis studenten tømmer feltet, lages en R-oppføring med tom tekst, og `erFanget()` regner feltet fortsatt som fylt, fordi det har `svarIder`. `tittel` har ingen R-vei, så det er uklart om tittelrettelser logges.

**Fiks: endre AD-5 og AD-8, avhengig av hvordan Å-2 avgjøres:**
- Enten: `rettelse` **kan ikke siteres**. Den er bare en kilde til `felt.tekst` og et sporingsspor. Det er enklest og gjør AD-8 sann.
- Eller: R-oppføringen inneholder bare tekst studenten selv har skrevet (diffen eller teksten etter fullstendig omskriving), og UI merker sitatet som «Rettet på oppsummeringen», ikke «fra samtalen».
- I tillegg: én R-oppføring per felt per besøk på Oppsummering (eller ingen ny oppføring når teksten er uendret), tomt felt fjerner feltet fra `erFanget()`, og tittel logges ikke.

---

## H-4 · Høy · Formen på feltkilder: `svarIder: string[]`, `kilder` (fixture) eller `{svarId, sitat}` (popover)

**Hva spinen sier:** I ER-diagrammet går `FELT` til `svarIder`. AD-7 sier at feltet trenger «minst én *verifisert* `svarId`». AD-6 binder «R-H-R-popover». UX sier at popoveren viser «utdraget fra studentens svar».

**Par:**
- *Historie A (skjema):* `Felt = { tekst, svarIder: string[] }`. «Verifisert» betyr at ID-en finnes i loggen.
- *Historie B (R-H-R-brikke):* Popoveren trenger et *utdrag*. Studenten utvider til `Felt.kilder: {svarId, sitat}[]` og kjører `verifiserSitat` i samtale-ruten, fordi AD-6 binder popoveren.
- *Kollisjon:* To former for samme felt. `tests/kjerne` leser `student.json`, som bruker `kilder: string[]`, et tredje navn. Ingen AD sier at fixturen skal tilpasses skjemaet eller omvendt, og AD-11 sier at demodata ligger *ved siden av* fasiten. Fixturen har heller ingen `A`-oppføringer (spørsmål ligger som `sporsmal` på hver S), så logg-skjemaet i AD-5 passer ikke med testsett A uten en adapter. Spinen sier ikke hvem som eier den.

**Fiks: stram inn AD-7 og AD-9:**
- Definer `Kilde = { svarId, sitat }` én gang. «Verifisert svarId» betyr en `Kilde` godkjent av `verifiserSitat`, og samtale-ruten kjører AD-6 på feltkilder akkurat som bevis-ruten.
- Popoveren viser `Kilde.sitat`, utledet fra loggen etter H-5.
- Legg til regelen: `kjerne/fixtures.ts` er den eneste adapteren fra testsett A til `Okt`, og testene importerer den.

---

## H-5 · Høy · «Tolererer forskjeller i mellomrom»: tre lovlige tolkninger, og hvilken tekst vises?

**Hva spinen sier:** AD-6 sier «tegn for tegn, men tolererer forskjeller i mellomrom og linjeskift».

**Par:**
- *Historie A (`kjerne/sitat.ts`):* Gjør alle `\s+` om til ett mellomrom i begge strenger og trimmer. Returnerer `true`.
- *Historie B (en annen versjon eller testforfatter):* Fjerner *alt* mellomrom. Da godtas «jegtok» mot «jeg tok», og det godtas også «kassa,ogjeg» der modellen har slått sammen to setninger med et mellomrom som ikke stod der. Ingen av dem håndterer NBSP (` `) fra innlimt tekst eller NFC/NFD-forskjeller i æøå. A godtar også modellens typografiske anførselstegn eller `…` som om de var ordrette.
- *Kollisjon med visning:* Når sammenligningen er tolerant, er sitatet modellen sendte *ikke* nødvendigvis lik teksten i loggen. Komponent A viser `bevis.sitat` (modellens streng). Komponent B, «Vis i samtalen», må markere teksten i loggen, men har ingen posisjon og må søke på nytt med sin egen toleranse. Markeringen feiler da eller treffer feil forekomst, for eksempel når samme frase står to ganger i S3.

**Fiks: stram inn AD-6:**
- Definer normaliseringen: `normaliser(s) = s.normalize('NFC').replace(/[\s ]+/g, ' ').trim()`. Ingen annen toleranse, verken for tegnsetting eller anførselstegn. Minimumslengde på sitatet (for eksempel 3 ord) hindrer trivielle treff.
- `verifiserSitat` returnerer `{ svarId, start, slutt } | null`, altså posisjoner i loggteksten. Ruten sender **posisjonene** og loggens egen delstreng videre, aldri modellens streng.
- Bevissitat, popover, «Vis i samtalen» og eksport viser alle `logg[svarId].tekst.slice(start, slutt)`.

---

## H-6 · Høy · Nullstilling: hva regnes som en endring, hva nullstilles, og hva skjer med svar som er underveis?

**Hva spinen sier:** AD-4 sier at nullstilling skjer i reduceren via en kjernefunksjon. UX sier «alle senere steg» nullstilles.

**Par:**
- *Historie A (`kjerne/nullstill.ts`):* Bokstavelig etter UX: endres en erfaring, tømmes Annonse, Krav og Bevistabell, også annonseteksten.
- *Historie B:* Etter dataavhengighet: en endret erfaring tømmer bare `bevis`. Kravene avhenger bare av annonsen og beholdes, siden et nytt kall i ekte modus kan gi andre krav.
- *Kollisjon:* Begge følger AD-4. Brukeropplevelsen og antall modellkall er ulike, og A får studenten til å lime inn annonsen på nytt etter å ha rettet ett ord.
- *Uklare utløsere:* Nullstiller et nytt `svar` i Samtale (etter «Fortsett samtalen» når bevistabellen allerede er bygget) senere steg? Gjør en endret tittel det? Spinen svarer ikke.
- *Rute mot reducer:* Studenten trykker «Bygg bevistabell», går tilbake via stegindikatoren mens kallet pågår, og retter et felt. Reduceren nullstiller. Så kommer `/api/bevis`-svaret, og `BEVIS_MOTTATT` skriver en bevistabell bygget på den gamle teksten inn i en økt som nettopp ble nullstilt. Ruten er tilstandsløs og «vet» ingenting. Reduceren har ingen regel for å forkaste svar som kommer for sent. Det samme skjer med K-ID-ene i H-2.

**Fiks: stram inn AD-4:**
- `nullstill(okt, endring: 'logg' | 'erfaringer' | 'annonse')` med en fast tabell: `logg`/`erfaringer` gir `bevis = null`, og `annonse` gir `krav = null, bevis = null`. Annonseteksten tømmes aldri, og tittelendringer nullstiller ingenting.
- Hver økt har `okt.versjon`, som øker ved hver nullstilling. Alle kall tar med versjonen, svaret returnerer den, og reduceren forkaster svar med eldre versjon.

---

## H-7 · Høy · DemoModell: hvordan velges lagret svar i en tilstandsløs server, og hva skjer når studenten går tilbake?

**Hva spinen sier:** AD-10 sier at DemoModell spiller av lagrede svar, og at klienten henter neste studentinput fra `/api/demo/manus`. AD-11 sier at svarene ligger i `fixtures/testsett-a/demo/` (mappen finnes ikke ennå).

**Par:**
- *Historie A (klient, demo):* Holder `manusIndeks` i komponentens lokale tilstand («utkast i inputfelt»-kategorien i AD-4) og øker den ved «Neste».
- *Historie B (`server/modell/demo.ts`):* Serveren er tilstandsløs, så svaret velges med `antall oppføringer i logg`. Den teller både `sporsmal` og `svar`, eller bare `svar`, og kanskje `rettelse`.
- *Kollisjon 1:* Hvis B teller alle oppføringer, og studenten retter på Oppsummering (ny R) og trykker «Fortsett samtalen», hopper DemoModell over et svar, eller gir et svar som hører til en annen tur enn manuset A sendte.
- *Kollisjon 2:* A mister `manusIndeks` når Samtale-komponenten avmonteres (navigering til Oppsummering og tilbake) og starter fra S1 igjen, mens B fortsetter fra S5.
- *Kollisjon 3:* De lagrede samtalesvarene inneholder erfaringsendringer. Har de ferdige E-ID-er («E2»), kolliderer det med H-2 hvis studenten har slettet et kort i demo. Lagrede `/api/bevis`-svar refererer til E1–E3 og S-ID-er. Har studenten slettet E2, forkaster ruten (riktig etter AD-5) K2-bevisene, og demoen viser noe annet enn README lover sensor (AD-11).
- *Kollisjon 4:* Lagrede bevis-svar er knyttet til *testannonse A*. Spinen sier ikke om Annonse-feltet er låst i demo. Limer sensor inn noe annet, kommer kravene fra A uansett.

**Fiks: ny eller strammere AD-10:**
- DemoModell velger svar **bare** ut fra `n = logg.filter(o => o.type === 'svar').length` (`samtale-<n>.json`). Krav og bevis har ett svar hver.
- `manusIndeks` ligger i reduceren (`okt.demo.indeks`) og er lik `n`.
- I demo er Annonse-feltet låst til testannonse A. Oppsummering i demo tillater retting (det viser AD-8), men ikke sletting, ellers dokumenterer README hva som skjer.
- Lagrede samtalesvar bruker de samme midlertidige referansene som H-2, ikke ferdige E-ID-er.

---

## H-8 · Middels · Bevis med `erfaringId` og `svarId` som ikke hører sammen

**Hva spinen sier:** I ER-diagrammet hører `BEVIS` til én `ERFARING` og én `LOGG_OPPFORING`. AD-6 sjekker bare at sitatet er en delstreng.

**Par:** Kravraden i A viser «navnet på erfaringen» fra `bevis.erfaringId`. Eksporten i B grupperer etter hvilken erfaring som har `svarId` i sine `svarIder`. Modellen returnerer `{ erfaringId: 'E1', svarId: 'S12' }`. Det godkjennes, fordi S12 finnes og sitatet er ordrett. A viser «Butikkjobb» og B viser ingen erfaring. Det samme skjer når bevis peker på S-ID-er fra en slettet erfaring, siden hele loggen sendes med.

**Fiks: stram inn AD-6:** Ruten godtar bare bevis der `svarId ∈ erfaring.felt[*].kilder` for en erfaring som ikke er slettet. Erfaringsnavnet i UI og eksport hentes alltid fra `bevis.erfaringId`.

---

## H-9 · Middels · «Vis i samtalen» for R-oppføringer og markering

**Hva spinen sier:** AD-5 sier at R-oppføringer ligger i loggen. Å-2 sier at Sheet får en del som heter «Rettet på oppsummeringen». Rekkefølgen er ikke avgjort.

**Par:** Sheet A viser loggen kronologisk, slik at R1 havner mellom S7 og S8 hvis studenten fortsatte samtalen etter rettingen. Sheet B viser S/A-oppføringene og deretter en egen R-del. Kravraden, som eier lenken, sender `scrollTo('S3')`. A bruker DOM-id `logg-S3`, B bruker `data-svar-id`. Ingen AD bestemmer oppslagsnøkkelen.

**Fiks: legg til i AD-5:** Hver loggoppføring rendres med `id={`logg-${oppforing.id}`}`. Sheet tar `{ svarId, start, slutt }` fra H-5 som eneste input. Rekkefølgen er avgjort i Å-2, og den må være avgjort før historiene om Oppsummering og Sheet starter.

---

## H-10 · Lav/Middels · Hvem eier eksportformatet?

**Hva spinen sier:** I kartet står `kjerne/eksport.ts` for FR-8. Spinen sier ikke hva den tar inn og returnerer, eller om forhåndsvisning, «Kopier» og «.txt» skal bruke den.

**Par:** Eksportdialogen i A bygger forhåndsvisningen som JSX, kopierer med `innerText` og laster ned med `eksport.ts`. B endrer `eksport.ts` til å ta med alle bevis, mens A viser ett bevis og «+N». Kopiert tekst og nedlastet fil blir ulike. Det er også uklart om oppsummeringen bruker `tittel` og om den viser den rettede teksten (AD-8 sier ja for tekst, men ikke for tittel).

**Fiks: legg til i AD-8:** `lagEksport(okt): string` i kjernen er den eneste produsenten. Dialogen viser strengen ordrett i `<pre>`, og «Kopier» og «.txt» bruker den samme strengen. Formatet (alle bevis, rekkefølge, merkelapper «Dekket»/«Ikke dekket ennå», tittel og rettet `felt.tekst`) bestemmes én gang i en snapshot-test mot testsett A.

---

## Det som holder

- Avhengighetsretningen (kjerne ← app/klient/server) og at modellen foreslår mens kjernen bestemmer, er sterke og kan sjekkes med en lint-regel.
- AD-6, der verifiseringen ligger i ruten i begge moduser, og AD-10, der demo ligger bak samme grensesnitt, lukker den farligste avviksveien.
- AD-7, med standardtekst når refleksjonsforslag mangler, og AD-12, med logging bare av ID-er, er presise nok til å teste.

## Prioritert

1. H-1 og H-2 sammen: én AD for erfaringsendringer som patch + ID-tellere i reduceren.
2. H-3: avgjør Å-2 og om rettelser kan siteres, før Oppsummering og bevis bygges.
3. H-5 og H-4: `verifiserSitat` returnerer posisjoner, og `Kilde` får én form.
4. H-6 og H-7: nullstillingstabell, `okt.versjon` og indeksering av demo.
