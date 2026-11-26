import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { hentStatus } = await import("@/server/status");

let rot: string;
let demo: string;

beforeEach(async () => {
  rot = await mkdtemp(path.join(tmpdir(), "status-"));
  demo = path.join(rot, "demo");
});

afterEach(async () => {
  await rm(rot, { recursive: true, force: true });
});

describe("hentStatus", () => {
  it("nøkkel satt, ingen demomappe", async () => {
    expect(
      await hentStatus({ env: { ANTHROPIC_API_KEY: "sk-ant-test" }, demoMappe: demo }),
    ).toEqual({ harNokkel: true, harDemodata: false });
  });

  it.each([undefined, "", "   ", "\t\n"])("nøkkel %j regnes som ikke satt", async (nokkel) => {
    const status = await hentStatus({ env: { ANTHROPIC_API_KEY: nokkel }, demoMappe: demo });
    expect(status.harNokkel).toBe(false);
  });

  it("demodata finnes når mappen har minst én .json-fil", async () => {
    await mkdir(demo);
    await writeFile(path.join(demo, "samtale.json"), "{}");
    expect((await hentStatus({ env: {}, demoMappe: demo })).harDemodata).toBe(true);
  });

  it("tom demomappe gir harDemodata: false", async () => {
    await mkdir(demo);
    expect((await hentStatus({ env: {}, demoMappe: demo })).harDemodata).toBe(false);
  });

  it("demomappe med bare andre filer og undermapper gir harDemodata: false", async () => {
    await mkdir(path.join(demo, "mappe.json"), { recursive: true });
    await writeFile(path.join(demo, "README.md"), "");
    expect((await hentStatus({ env: {}, demoMappe: demo })).harDemodata).toBe(false);
  });

  it("svaret inneholder aldri nøkkelen", async () => {
    const status = await hentStatus({ env: { ANTHROPIC_API_KEY: "sk-hemmelig" }, demoMappe: demo });
    expect(JSON.stringify(status)).not.toContain("hemmelig");
    expect(Object.keys(status).sort()).toEqual(["harDemodata", "harNokkel"]);
  });
});
