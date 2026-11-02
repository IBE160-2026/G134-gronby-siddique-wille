# Addendum: Erfaringsgruven

Teknisk hvordan og innhold som ikke hører hjemme i selve PRD-en, men som er verdifullt for arkitektur/implementering videre.

## Språkmodell og kostnad

- Modell: Claude Haiku 5.5 via Anthropics API. Bekreftet av bruker mot Anthropics prissetting (11. okt 2026).
- Valgt fordi: lav kostnad, god norsk-håndtering, rask nok for en samtale-flyt.
- Anthropic trener ikke på API-data — relevant for personvernkravet i PRD §5.
- Estimert forbruk: ~15 modellkall per økt (≈12 i samtalen, 1 for kravuttrekk, 1–2 for bevistabellen).
- Estimert kostnad: <10 øre per økt; <100 kr for hele semesterets utvikling og testing.

## Personvern — implementasjonsdetaljer

- Kryptert kommunikasjon (TLS) mellom klient og API.
- Ingen lagring av CV-/personopplysninger i database eller filsystem etter at økten er over — alt holdes i øktens levetid (minne/frontend-tilstand), ikke persistert.
- Studenten skal informeres om personvernmodellen før økten starter (jf. PRD §5).

## Faste testsett for kravuttrekk

- Testannonse A + en fiktiv student-økt må defineres med forventede krav, forventede bevis og forventede hull, som grunnlag for de automatiske testene i PRD §8 (SM-4–SM-6).
- Flere testsett bør legges i en egen fixture-mappe i repoet, ikke blandet med ekte data.
- [NOTE FOR PM] Selve testsettene (fixtures) er ikke definert ennå — dette er et åpent arbeid for implementasjonsfasen, ikke en PRD-beslutning.

## Repo- og prosesshygiene (fra tilbakemelding på product-brief)

- Jobb lokalt med Git og beskrivende commit-meldinger (ikke "Add files via upload") — del av vurderingsgrunnlaget (prosess/KI-styring).
- Lagre promptene som styrer intervjuet i repoet, versjonert sammen med koden.
- `.env` for API-nøkkel skal ikke committes; lag en `.env.example` som viser hvilke variabler som trengs.
- Fiktive testpersoner/annonser i egen mappe, skilt fra ekte brukerdata.
- README skal beskrive hvordan en tester/sensor setter opp egen API-nøkkel, og hvordan demomodus (PRD FR-9) kjøres uten den.

## Visjon utover v1 (ikke PRD-scope)

- Brief'en nevner en visjon om en personlig "karrierebank" som bygges opp gjennom hele studietiden, med mål om bruk ved karrieresentre innen 2–3 år.
- Dette er eksplisitt utenfor MVP-omfanget (PRD §7.2) og krever brukerkontoer/lagring som i dag er et ikke-mål — men er notert her slik at den ikke går tapt hvis gruppen vil bygge videre på prosjektet etter kurset.
