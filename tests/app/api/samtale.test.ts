import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { MAKS_ERFARINGER_SPORSMAL } from "@/kjerne/regler";
import type { Erfaring, SamtaleForesporsel } from "@/kjerne/skjema";

vi.mock("server-only", () => ({}));

// Ekte modus testes med en falsk modell (eller den ekte velgeren uten nøkkel),
// demo med lagrede svar i en midlertidig mappe. Ingen nettverk.
type Kall = { system: string; melding: string; antallSvar: number; signal?: AbortSignal };
let falskModell: { kall: (f: Kall) => Promise<unknown> } | undefined;
vi.mock("@/server/modell/velg", async (original) => {
  const ekte = await original<typeof import("@/server/modell/velg")>();
  return {
    velgModell: (...args: Parameters<typeof ekte.velgModell>) =>
      falskModell ?? ekte.velgModell(...args),
  };
});

let rot: string;
let demo: string;
let rute: typeof import("@/app/api/samtale/route");
let ModellFeil: typeof import("@/server/modell/grensesnitt").ModellFeil;

const PROMPT = "Systemprompt for test";

beforeAll(async () => {
  rot = mkdtempSync(path.join(tmpdir(), "samtale-rute-"));
  demo = path.join(rot, "fixtures", "testsett-a", "demo");
  mkdirSync(demo, { recursive: true });
  mkdirSync(path.join(rot, "prompts"));
  writeFileSync(path.join(rot, "prompts", "samtale.md"), PROMPT);
  vi.spyOn(process, "cwd").mockReturnValue(rot);
  vi.resetModules();
  rute = await import("@/app/api/samtale/route");
  ({ ModellFeil } = await import("@/server/modell/grensesnitt"));
});

let konsoll: ReturnType<typeof vi.spyOn>[];
beforeEach(() => {
  konsoll = (["log", "info", "warn", "error", "debug"] as const).map((m) =>
    vi.spyOn(console, m).mockImplementation(() => {}),
  );
});

afterEach(() => {
  // AD-12: ruten logger aldri.
  for (const spion of konsoll) expect(spion).not.toHaveBeenCalled();
  for (const spion of konsoll) spion.mockRestore();
  falskModell = undefined;
  vi.unstubAllEnvs();
});

afterAll(() => {
  vi.restoreAllMocks();
  rmSync(rot, { recursive: true, force: true });
});

function foresporsel(overstyr: Partial<SamtaleForesporsel> = {}): SamtaleForesporsel {
  return { modus: "ekte", versjon: 0, logg: [], erfaringer: [], slettedeErfaringer: [], ...overstyr };
}

function post(body: unknown, init: RequestInit = {}): Request {
  return new Request("http://127.0.0.1/api/samtale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}

function svarer(svar: unknown) {
  const kall: Kall[] = [];
  falskModell = {
    kall: async (f) => {
      kall.push(f);
      return svar;
    },
  };
  return kall;
}

async function forventFeil(svar: Response, status: number, kode: string) {
  expect(svar.status).toBe(status);
  expect(svar.headers.get("cache-control")).toBe("no-store");
  expect((await svar.json()).feil.kode).toBe(kode);
}

const sporsmal = { tekst: "Hva gjorde du der?", gjelder: null };
const medSvar = foresporsel({
  logg: [
    { type: "sporsmal", id: "A1", tekst: "Hei?", gjelder: null },
    { type: "svar", id: "S1", tekst: "Jeg jobbet på kafé." },
  ],
});

const fanget = (id: string): Erfaring => {
  const felt = { tekst: "t", kilder: ["S1"], rettetAvStudent: false };
  return { id, tittel: id, tittelRettetAvStudent: false, rolle: felt, handling: felt, resultat: felt };
};

describe("POST /api/samtale", () => {
  it("kjører i Node og caches aldri (AD-2)", () => {
    expect(rute.runtime).toBe("nodejs");
    expect(rute.dynamic).toBe("force-dynamic");
  });

  it("ekte: sender prompt, logg, aktive erfaringer, maksNadd og request.signal til modellen", async () => {
    const kall = svarer({ sporsmal, endringer: [{ type: "opprett", ny: "n1", tittel: "Kafé" }] });
    const kontroller = new AbortController();
    const f = { ...medSvar, erfaringer: [fanget("E1"), fanget("E2")], slettedeErfaringer: ["E2"] };
    const svar = await rute.POST(post(f, { signal: kontroller.signal }));

    expect(svar.status).toBe(200);
    expect(svar.headers.get("cache-control")).toBe("no-store");
    expect(await svar.json()).toEqual({
      sporsmal,
      endringer: [{ type: "opprett", ny: "n1", tittel: "Kafé" }],
    });
    expect(kall).toHaveLength(1);
    expect(kall[0].system).toBe(PROMPT);
    expect(kall[0].antallSvar).toBe(1);
    expect(JSON.parse(kall[0].melding)).toEqual({
      logg: medSvar.logg,
      erfaringer: [fanget("E1")],
      maksNadd: false,
    });
    expect(kall[0].signal).toBeInstanceOf(AbortSignal);
    kontroller.abort();
    expect(kall[0].signal?.aborted).toBe(true);
  });

  it("demo: åpningsspørsmål fra lagrede svar uten prompt", async () => {
    writeFileSync(
      path.join(demo, "samtale.json"),
      JSON.stringify([
        { sporsmal: { tekst: "Åpning", gjelder: null }, endringer: [] },
        { sporsmal: { tekst: "Etter S1", gjelder: null }, endringer: [] },
      ]),
    );
    const apning = await rute.POST(post(foresporsel({ modus: "demo" })));
    expect(apning.status).toBe(200);
    expect(await apning.json()).toEqual({ sporsmal: { tekst: "Åpning", gjelder: null }, endringer: [] });

    const neste = await rute.POST(post({ ...medSvar, modus: "demo" }));
    expect((await neste.json()).sporsmal.tekst).toBe("Etter S1");
  });

  it("demo uten demodata gir ugyldig_svar", async () => {
    rmSync(path.join(demo, "samtale.json"), { force: true });
    await forventFeil(await rute.POST(post(foresporsel({ modus: "demo" }))), 502, "ugyldig_svar");
  });

  it("demo laster ingen prompt", async () => {
    const kall = svarer({ sporsmal, endringer: [] });
    await rute.POST(post(foresporsel({ modus: "demo" })));
    expect(kall[0].system).toBe("");
  });

  it.each(["modell_feil", "ugyldig_svar"] as const)("ModellFeil(%s) gir feilsvaret", async (kode) => {
    falskModell = {
      kall: async () => {
        throw new ModellFeil(kode);
      },
    };
    await forventFeil(
      await rute.POST(post(medSvar)),
      kode === "modell_feil" ? 503 : 502,
      kode,
    );
  });

  it.each([
    ["tekst over MAKS_TEKST_TEGN", { sporsmal: { tekst: "x".repeat(5001), gjelder: null }, endringer: [] }],
    ["feil form", { sporsmal: "hemmelig" }],
  ])("modellsvar med %s gir ugyldig_svar", async (_navn, modellsvar) => {
    svarer(modellsvar);
    const svar = await rute.POST(post(medSvar));
    expect(svar.status).toBe(502);
    expect(JSON.stringify(await svar.json())).not.toContain("hemmelig");
  });

  it.each([
    ["ikke JSON", "{ikke json"],
    ["tom kropp", ""],
    ["feil modus", { ...foresporsel(), modus: "test" }],
    ["svar over grensen", foresporsel({ logg: [{ type: "svar", id: "S1", tekst: "x".repeat(5001) }] })],
    ["ugyldig ID", foresporsel({ logg: [{ type: "svar", id: "X1", tekst: "x" }] })],
  ])("%s gir ugyldig_foresporsel, og modellen kalles ikke", async (_navn, body) => {
    const kall = svarer({ sporsmal, endringer: [] });
    await forventFeil(await rute.POST(post(body)), 400, "ugyldig_foresporsel");
    expect(kall).toHaveLength(0);
  });

  it("ekte uten nøkkel gir mangler_nokkel", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    await forventFeil(await rute.POST(post(medSvar)), 400, "mangler_nokkel");
  });

  it("maks nådd: opprett fjernes, og spørsmålet viser grensen", async () => {
    svarer({
      sporsmal: { tekst: "Fortell om noe nytt!", gjelder: { ny: "n1" } },
      endringer: [
        { type: "opprett", ny: "n1", tittel: "Niende" },
        { type: "settTekst", erfaring: { ny: "n1" }, felt: "rolle", tekst: "x" },
        { type: "settTekst", erfaring: "E1", felt: "rolle", tekst: "y" },
      ],
    });
    const erfaringer = Array.from({ length: 8 }, (_, i) => fanget(`E${i + 1}`));
    const svar = await rute.POST(post({ ...medSvar, erfaringer }));
    expect(await svar.json()).toEqual({
      sporsmal: { tekst: MAKS_ERFARINGER_SPORSMAL, gjelder: null },
      endringer: [{ type: "settTekst", erfaring: "E1", felt: "rolle", tekst: "y" }],
    });
  });

  it("slettede erfaringer teller ikke mot grensen", async () => {
    const modellsvar = {
      sporsmal: { tekst: "Fortell om noe nytt!", gjelder: { ny: "n1" } },
      endringer: [{ type: "opprett", ny: "n1", tittel: "Ny" }],
    };
    const kall = svarer(modellsvar);
    const erfaringer = Array.from({ length: 8 }, (_, i) => fanget(`E${i + 1}`));
    const svar = await rute.POST(post({ ...medSvar, erfaringer, slettedeErfaringer: ["E8"] }));
    expect(JSON.parse(kall[0].melding).maksNadd).toBe(false);
    expect(await svar.json()).toEqual(modellsvar);
  });
});
