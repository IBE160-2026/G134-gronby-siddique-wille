# Erfaringsgruven

Erfaringsgruven er en web-app som hjelper studenter å se hva de allerede har gjort. Studenten forteller om jobber, frivillig arbeid og prosjekter i en samtale, limer inn en stillingsannonse og får en tabell som viser hvilke av egne erfaringer som dokumenterer hvert krav. Krav uten bevis markeres som hull. Verktøyet finner ikke på noe, og alle bevis kan spores til studentens egne svar.

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng), gruppe G134.

## Medlemmer

- Rikke V. Gronby
- Victoria Y. Siddique
- Thea R. Wille

## Status

Planleggingen er ferdig, og byggingen er i gang (Epic 1). Fremdriften står i [sprint-status.yaml](_bmad-output/implementation-artifacts/sprint-status.yaml).

## Arbeidsfordeling

| Del | Ansvarlig | Status |
|---|---|---|
| BMAD-installasjon, product brief og PRD-utkast | Thea | Ferdig |
| UX | Victoria | Ferdig |
| Arkitektur og testsett | Rikke | Ferdig, godkjent av gruppen 4. november (e-post) |
| Arbeidsfordeling | Alle | Skriftlig bekreftet 3. november (e-post) | 
| Gjennomgang av PRD og antagelser | Alle | Ferdig (5. november) |
| Epics og stories | Alle | Ferdig (final) |

## Planleggingsdokumenter

- [Product brief](docs/product-brief.md)
- [Tilbakemelding på product brief](docs/tilbakemelding-product-brief.md)
- [PRD](docs/prds/prd-G134-gronby-siddique-wille-2026-11-02/prd.md)
- [UX: DESIGN.md](docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/DESIGN.md)
- [EXPERIENCE.md](docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md)
- [Arkitektur-spine](docs/architecture/architecture-G134-gronby-siddique-wille-2026-11-04/ARCHITECTURE-SPINE.md)
- [Arkitektur: valg og begrunnelser](docs/architecture/architecture-G134-gronby-siddique-wille-2026-11-04/arkitektur-begrunnelse.md)
- [Testsett A: fiktiv student, annonse og fasit](fixtures/testsett-a/README.md)


## Kjøre appen

Appen kjører bare lokalt på din egen maskin. Den har ingen innlogging, database eller hosting.

1. Installer [Node.js 26 LTS](https://nodejs.org/), versjon 26.13.0 eller nyere 26.x. Sjekk med `node --version`.
2. Klon repoet, gå inn i mappen og installer avhengighetene:

   ```sh
   git clone https://github.com/IBE160-2026/G134-gronby-siddique-wille.git
   cd G134-gronby-siddique-wille
   npm install
   ```

   Bruker du nvm eller fnm, velger `nvm use` / `fnm use` riktig Node-versjon fra `.nvmrc`.

3. Valgfritt: kopier `.env.example` til `.env.local` og fyll inn din egen API-nøkkel fra [Anthropic Console](https://console.anthropic.com/). Dette trengs bare for ekte modus. Bruk av API-et koster penger og krever betaling satt opp i Console.

   ```sh
   cp .env.example .env.local        # macOS/Linux
   copy .env.example .env.local      # Windows (cmd)
   ```

   `.env.local` er gitignored og skal aldri committes. Start utviklingsserveren på nytt etter at du har endret fila, fordi Next.js leser den bare ved oppstart.
4. Start utviklingsserveren:

   ```sh
   npm run dev
   ```

5. Åpne adressen terminalen viser, vanligvis <http://127.0.0.1:3000>. Serveren lytter bare på `127.0.0.1`, så appen kan ikke nås fra andre maskiner. `localhost` virker vanligvis også, men `127.0.0.1` er sikrest.

Andre kommandoer:

| Kommando | Hva den gjør |
|---|---|
| `npm run lint` | Sjekker koden med ESLint |
| `npm run build` | Lager et produksjonsbygg og sjekker TypeScript |
| `npm start` | Kjører produksjonsbygget på `127.0.0.1` (etter `npm run build`) |

### Demomodus uten API-nøkkel

Appen får en demomodus som bruker lagrede modellsvar for den fiktive studenten i [testsett A](fixtures/testsett-a/README.md) i stedet for å kalle Anthropic. Demomodus skal virke uten API-nøkkel og uten `.env.local`, og blir den enkleste måten å prøve appen på. Demomodus er ikke bygget ennå. Denne delen oppdateres i Epic 5 med hvordan du velger modus og hva demodataene viser.

I ekte modus sendes svarene dine kryptert til Anthropic API. Appen selv lagrer ingenting. Anthropic sletter API-data innen 30 dager, men samtaler som flagges for brudd på bruksvilkårene kan lagres i opptil 2 år ([kilde](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)).
