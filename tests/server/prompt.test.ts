import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { lesPrompt, promptMappe } = await import("@/server/prompt");

let rot: string;

beforeEach(async () => {
  rot = await mkdtemp(path.join(tmpdir(), "prompt-"));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(rot, { recursive: true, force: true });
});

describe("lesPrompt", () => {
  it("leser prompts/<navn>.md under cwd", async () => {
    vi.spyOn(process, "cwd").mockReturnValue(rot);
    expect(promptMappe()).toBe(path.join(rot, "prompts"));
    await writeFile(path.join(rot, "samtale.md"), "Systemtekst");
    expect(await lesPrompt("samtale", rot)).toBe("Systemtekst");
  });

  it("uten mappe leses promptMappe() under process.cwd()", async () => {
    await mkdir(path.join(rot, "prompts"));
    await writeFile(path.join(rot, "prompts", "samtale.md"), "Fra cwd");
    vi.spyOn(process, "cwd").mockReturnValue(rot);
    expect(await lesPrompt("samtale")).toBe("Fra cwd");
  });

  it("manglende eller tom fil gir en feil uten innhold", async () => {
    await expect(lesPrompt("samtale", rot)).rejects.toThrow(/samtale/);
    await writeFile(path.join(rot, "samtale.md"), "  \n");
    await expect(lesPrompt("samtale", rot)).rejects.toThrow(/tom/);
  });

  it("prompts/samtale.md i repoet: du-form, ett spørsmål om gangen, bare kjente ID-er", async () => {
    const tekst = await lesPrompt("samtale");
    expect(tekst).toMatch(/«du»/);
    expect(tekst).toMatch(/ett åpent spørsmål om gangen/);
    expect(tekst).toMatch(/Bruk bare ID-er du har fått/);
    expect(tekst).toMatch(/maksNadd/);
  });
});
