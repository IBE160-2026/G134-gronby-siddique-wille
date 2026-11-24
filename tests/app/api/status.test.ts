import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// `DEMO_MAPPE` regnes ut fra `process.cwd()` når modulen lastes, så cwd pekes
// til en midlertidig mappe før importen. Da er testene uavhengige av repoet.
const rot = mkdtempSync(path.join(tmpdir(), "status-rute-"));
const demo = path.join(rot, "fixtures", "testsett-a", "demo");
vi.spyOn(process, "cwd").mockReturnValue(rot);

const rute = await import("@/app/api/status/route");

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync(demo, { recursive: true, force: true });
});

afterAll(() => {
  rmSync(rot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("GET /api/status", () => {
  it("kjører i Node og caches aldri (AD-2)", () => {
    expect(rute.runtime).toBe("nodejs");
    expect(rute.dynamic).toBe("force-dynamic");
  });

  it("svarer 200 { harNokkel: true, harDemodata: false } med nøkkel og uten demomappe", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    const svar = await rute.GET();
    expect(svar.status).toBe(200);
    expect(svar.headers.get("cache-control")).toBe("no-store");
    const kropp = await svar.json();
    expect(kropp).toEqual({ harNokkel: true, harDemodata: false });
    expect(JSON.stringify(kropp)).not.toContain("sk-ant");
  });

  it("svarer harDemodata: true når demomappen har en .json-fil", async () => {
    mkdirSync(demo, { recursive: true });
    writeFileSync(path.join(demo, "samtale.json"), "{}");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(await (await rute.GET()).json()).toEqual({ harNokkel: false, harDemodata: true });
  });

  it("svarer harNokkel: false når nøkkelen bare er mellomrom", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "  ");
    expect(await (await rute.GET()).json()).toEqual({ harNokkel: false, harDemodata: false });
  });
});
