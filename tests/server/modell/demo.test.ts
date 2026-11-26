import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { DemoModell } = await import("@/server/modell/demo");
const { ModellFeil } = await import("@/server/modell/grensesnitt");

let rot: string;
let demo: string;

const samtale = (n: number) => ({
  sporsmal: { tekst: `Spørsmål ${n}`, gjelder: null },
  endringer: [],
});

const foresporsel = (antallSvar: number) => ({
  steg: "samtale" as const,
  system: "ignoreres",
  melding: "ignoreres",
  antallSvar,
});

async function skriv(fil: string, innhold: unknown) {
  await writeFile(path.join(demo, fil), typeof innhold === "string" ? innhold : JSON.stringify(innhold));
}

async function kode(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (error) {
    expect(error).toBeInstanceOf(ModellFeil);
    return (error as InstanceType<typeof ModellFeil>).kode;
  }
  throw new Error("forventet feil");
}

beforeEach(async () => {
  rot = await mkdtemp(path.join(tmpdir(), "demo-"));
  demo = path.join(rot, "demo");
  await mkdir(demo);
});

afterEach(async () => {
  await rm(rot, { recursive: true, force: true });
});

describe("DemoModell", () => {
  it("samtale: velger elementet med indeks antallSvar", async () => {
    await skriv("samtale.json", [samtale(0), samtale(1), samtale(2)]);
    const modell = new DemoModell({ mappe: demo });
    expect(await modell.kall(foresporsel(2))).toEqual(samtale(2));
    expect(await modell.kall(foresporsel(0))).toEqual(samtale(0));
  });

  it("krav og bevis: ett objekt hver", async () => {
    await skriv("krav.json", { krav: [{ tekst: "Samarbeid" }] });
    await skriv("bevis.json", { bevis: [], refleksjonsforslag: [] });
    const modell = new DemoModell({ mappe: demo });
    expect(await modell.kall({ ...foresporsel(5), steg: "krav" })).toEqual({
      krav: [{ tekst: "Samarbeid" }],
    });
    expect(await modell.kall({ ...foresporsel(0), steg: "bevis" })).toEqual({
      bevis: [],
      refleksjonsforslag: [],
    });
  });

  it("fil mangler gir ugyldig_svar", async () => {
    expect(await kode(new DemoModell({ mappe: demo }).kall(foresporsel(0)))).toBe("ugyldig_svar");
  });

  it("mappe mangler gir ugyldig_svar", async () => {
    const modell = new DemoModell({ mappe: path.join(rot, "finnes-ikke") });
    expect(await kode(modell.kall(foresporsel(0)))).toBe("ugyldig_svar");
  });

  it.each([2, 3, -1, 0.5])("indeks %d utenfor listen gir ugyldig_svar", async (antallSvar) => {
    await skriv("samtale.json", [samtale(0), samtale(1)]);
    expect(await kode(new DemoModell({ mappe: demo }).kall(foresporsel(antallSvar)))).toBe(
      "ugyldig_svar",
    );
  });

  it.each([
    ["ikke JSON", "{ikke json"],
    ["ikke en liste", samtale(0)],
    ["feil form på elementet", [{ sporsmal: "feil" }]],
  ])("samtale.json %s gir ugyldig_svar", async (_navn, innhold) => {
    await skriv("samtale.json", innhold);
    expect(await kode(new DemoModell({ mappe: demo }).kall(foresporsel(0)))).toBe("ugyldig_svar");
  });

  it("krav.json med feil form gir ugyldig_svar", async () => {
    await skriv("krav.json", [{ krav: [] }]);
    const modell = new DemoModell({ mappe: demo });
    expect(await kode(modell.kall({ ...foresporsel(0), steg: "krav" }))).toBe("ugyldig_svar");
  });
});
