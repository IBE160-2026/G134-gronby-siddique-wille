import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const src = fileURLToPath(new URL("../../src/", import.meta.url));

function kildefiler(mappe: string): string[] {
  return readdirSync(mappe, { withFileTypes: true, recursive: true })
    .filter((f) => f.isFile() && /\.(ts|tsx|js|mjs)$/.test(f.name))
    .map((f) => path.join(f.parentPath, f.name));
}

const serverFiler = kildefiler(path.join(src, "server"));

describe("server-only", () => {
  it("src/server har minst én kildefil", () => {
    expect(serverFiler.length).toBeGreaterThan(0);
  });

  it.each(serverFiler.map((f) => [path.relative(src, f), f]))(
    "%s importerer server-only",
    (_navn, fil) => {
      expect(readFileSync(fil, "utf8")).toMatch(/^import ["']server-only["'];?$/m);
    },
  );

  it("bare src/server leser ANTHROPIC_API_KEY", () => {
    const utenfor = kildefiler(src)
      .filter((f) => !f.startsWith(path.join(src, "server") + path.sep))
      .filter((f) => readFileSync(f, "utf8").includes("ANTHROPIC_API_KEY"))
      .map((f) => path.relative(src, f));
    expect(utenfor).toEqual([]);
  });
});
