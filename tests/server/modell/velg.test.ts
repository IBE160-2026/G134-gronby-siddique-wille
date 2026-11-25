import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { velgModell } = await import("@/server/modell/velg");
const { AnthropicModell } = await import("@/server/modell/anthropic");
const { DemoModell } = await import("@/server/modell/demo");
const { ModellFeil } = await import("@/server/modell/grensesnitt");

const foresporsel = { steg: "samtale" as const, system: "s", melding: "m", antallSvar: 0 };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("velgModell", () => {
  it("ekte gir AnthropicModell", () => {
    expect(velgModell("ekte", { env: { ANTHROPIC_API_KEY: "sk-ant-test" } })).toBeInstanceOf(
      AnthropicModell,
    );
  });

  it.each([undefined, "", "  \n"])(
    "ekte med nøkkel %j gir mangler_nokkel uten nettverkskall",
    async (nokkel) => {
      const fetch = vi.spyOn(globalThis, "fetch");
      const modell = velgModell("ekte", { env: { ANTHROPIC_API_KEY: nokkel } });
      const feil = await modell.kall(foresporsel).catch((e: unknown) => e);
      expect(feil).toBeInstanceOf(ModellFeil);
      expect((feil as InstanceType<typeof ModellFeil>).kode).toBe("mangler_nokkel");
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("demo gir DemoModell som leser fra demoMappe, uten nøkkel", async () => {
    const rot = await mkdtemp(path.join(tmpdir(), "velg-"));
    try {
      const svar = { sporsmal: { tekst: "Hei", gjelder: null }, endringer: [] };
      await writeFile(path.join(rot, "samtale.json"), JSON.stringify([svar]));
      const modell = velgModell("demo", { env: {}, demoMappe: rot });
      expect(modell).toBeInstanceOf(DemoModell);
      expect(await modell.kall(foresporsel)).toEqual(svar);
    } finally {
      await rm(rot, { recursive: true, force: true });
    }
  });

  it("demo uten demoMappe leser fixtures/testsett-a/demo under process.cwd()", async () => {
    const rot = await mkdtemp(path.join(tmpdir(), "velg-cwd-"));
    try {
      const demo = path.join(rot, "fixtures", "testsett-a", "demo");
      await mkdir(demo, { recursive: true });
      const forste = { sporsmal: { tekst: "Første", gjelder: null }, endringer: [] };
      const andre = { sporsmal: { tekst: "Andre", gjelder: null }, endringer: [] };
      await writeFile(path.join(demo, "samtale.json"), JSON.stringify([forste, andre]));
      vi.spyOn(process, "cwd").mockReturnValue(rot);
      const modell = velgModell("demo", { env: {} });
      expect(await modell.kall({ ...foresporsel, antallSvar: 0 })).toEqual(forste);
    } finally {
      await rm(rot, { recursive: true, force: true });
    }
  });
});
