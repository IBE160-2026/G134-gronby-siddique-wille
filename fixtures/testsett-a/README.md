# Testsett A

Fast testsett for Erfaringsgruven: én fiktiv student (Mia fra UJ-1 i PRD-en), én fiktiv stillingsannonse og en fasit over hva systemet skal finne. Testsettet skal brukes i de automatiske testene for kravuttrekk og bevistabell (PRD §8).

Alt innhold er fiktivt. Brattli Sport, Fjordlys Opplevelser AS, Kari Fjordvik og telefonnummeret finnes ikke. Ikke legg ekte persondata i denne mappen.

## Filer

| Fil | Innhold |
|---|---|
| [student.json](student.json) | Samtalen med Mia (svar S1–S13, hvert med spørsmålet det svarer på) og de tre fangede erfaringene E1–E3 |
| [annonse-a.md](annonse-a.md) | Stillingsannonsen («testannonse A» i PRD-en), med nøyaktig fem krav |
| [fasit.json](fasit.json) | Forventede krav K1–K5, med bevis eller hull for hvert krav |

## Hva testsettet tester

| Metrikk | Hva som sjekkes | Hvordan fasiten brukes |
|---|---|---|
| **SM-4** Kravuttrekk (FR-4) | Kravuttrekket finner alle fem kravene i annonsen, og ingen andre | Hvert uttrukket krav skal matche ett av K1–K5. Linjene i `ikke_krav` (arbeidsoppgaver og «Vi tilbyr») skal ikke komme med som krav. |
| **SM-5** Sporbarhet (FR-6) | Hvert bevis viser til minst ett konkret samtalesvar | For K1–K3 skal bevistabellen vise til minst én svar-ID fra `bevis`. |
| **SM-6** Hull (FR-7) | Krav uten bevis vises som hull med refleksjonsforslag | K4 og K5 skal ha status hull, ingen bevis og et refleksjonsforslag som ikke er tomt. |
| **SM-C1** Ingen oppdiktede koblinger | Bevistabellen kobler ikke krav til svar som ikke dokumenterer dem | Ingen svar-ID fra `forbudte_bevis` skal brukes. K5 er felle: den ligner på Mias erfaring, men er ikke dekket. |

## Slik er fasiten bygget

Hvert krav i [fasit.json](fasit.json) har disse feltene:

- `krav`: kravteksten, ordrett fra annonsen.
- `nokkelord`: hjelpeord for å matche et uttrukket krav mot fasiten. Modellen kan formulere kravet litt annerledes, så testen bør ikke kreve helt lik tekst. Hvordan matchingen gjøres bestemmes når testkoden skrives.
- `status`: `dekket` eller `hull`.
- `erfaring`: hvilken erfaring (E1–E3) som dekker kravet, eller `null` for hull.
- `bevis`: svar-ID-er som er gode bevis. Minst én av dem må brukes for at kravet regnes som dekket.
- `tillatt_i_tillegg`: grensetilfeller som kan stå i tillegg til et bevis uten å regnes som feil, men som ikke er nok alene.
- `forbudte_bevis`: svar-ID-er som ligner på kravet, men ikke dokumenterer det. Brukes et av disse, er det en SM-C1-feil.
- `felle`: `true` for kravet som er laget for å se ut som en match uten å være det.
- `begrunnelse`: hvorfor fasiten er som den er, slik at gruppen kan være uenig og rette den.

En svar-ID som ikke står i `bevis` eller `tillatt_i_tillegg` for et krav, regnes som feil kobling for det kravet. `forbudte_bevis` peker ut de mest fristende feilkoblingene, men listen er ikke uttømmende.

## Oversikt over fasiten

| Krav | Status | Bevis | Merknad |
|---|---|---|---|
| K1 Kundekontakt under tidspress | Dekket (E1) | S3, S4 | Klimakset i UJ-1 |
| K2 Lede eller koordinere en gruppe | Dekket (E2) | S5, S6, S7 | S4 og S9 er grensetilfeller |
| K3 Engelsk muntlig og skriftlig | Dekket (E3) | S8, S9, S10 | |
| K4 Excel med formler og pivottabeller | Hull | | S12 nevner Excel, men sier at hun nesten ikke har brukt det |
| K5 Reiselivsbransjen | Hull (felle) | | Private reiser (S11) og utveksling (S8) er ikke bransjeerfaring |

Tre av fem krav er dekket og to er hull. UJ-1 nevner bare ett hull. Det andre hullet er felle-kravet for SM-C1.

## Hva testsettet ikke dekker

- Selve samtalen (FR-1–FR-3). Svarene i `student.json` er ferdigskrevne og tester ikke om systemet stiller gode oppfølgingsspørsmål. De kan likevel brukes som lagrede svar i demomodus (FR-9).
- Hvilken tekst refleksjonsforslaget har. Testen sjekker bare at det finnes.
- Om sitatet i bevistabellen er ordrett. En mulig utvidelse er å sjekke at sitatet finnes i teksten til svaret det viser til.
