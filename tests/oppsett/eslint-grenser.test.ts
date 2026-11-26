import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

// Modulgrensene i eslint.config.mjs (AD: kjerne er ren, klient importerer aldri server).
const rot = fileURLToPath(new URL("../../", import.meta.url));
const eslint = new ESLint({ cwd: rot });

async function begrensedeImporter(kilde: string, filePath: string): Promise<number> {
  const [resultat] = await eslint.lintText(kilde, { filePath: `${rot}${filePath}` });
  return resultat.messages.filter((m) => m.ruleId === "no-restricted-imports").length;
}

describe("modulgrenser i ESLint", () => {
  it.each([
    "@/klient/okt/reducer",
    "../klient/okt/reducer",
    "@/server/modell",
    "@/app/layout",
    "@/components/ui/button",
    "../../src/klient/okt/reducer",
    "react",
    "react-dom",
    "next/font/google",
    "server-only",
    "node:fs",
    "fs",
  ])("src/kjerne kan ikke importere %s", async (modul) => {
    expect(await begrensedeImporter(`import "${modul}";\n`, "src/kjerne/sjekk.ts")).toBe(1);
  });

  it.each(["@/server/modell", "../../server/modell", "../../src/server/modell"])(
    "src/klient kan ikke importere %s",
    async (modul) => {
      expect(
        await begrensedeImporter(`import "${modul}";\n`, "src/klient/okt/sjekk.ts"),
      ).toBe(1);
    },
  );

  it.each([
    "src/klient/okt/sjekk.ts",
    "src/app/sjekk.tsx",
    "src/app/api/status/route.ts",
    "src/server/sjekk.ts",
    "src/components/sjekk.tsx",
    "src/lib/sjekk.ts",
    "src/kjerne/okt.ts",
  ])("%s kan ikke importere zod", async (fil) => {
    expect(await begrensedeImporter(`import { z } from "zod";\n`, fil)).toBe(1);
    expect(await begrensedeImporter(`import "zod/mini";\n`, fil)).toBe(1);
  });

  it("src/kjerne/skjema.ts kan importere zod, men har fortsatt kjernegrensene", async () => {
    expect(
      await begrensedeImporter(`import { z } from "zod";\n`, "src/kjerne/skjema.ts"),
    ).toBe(0);
    expect(
      await begrensedeImporter(`import "@/klient/okt/reducer";\n`, "src/kjerne/skjema.ts"),
    ).toBe(1);
    expect(await begrensedeImporter(`import "node:fs";\n`, "src/kjerne/skjema.ts")).toBe(1);
  });

  it("src/klient kan fortsatt ikke importere server", async () => {
    expect(
      await begrensedeImporter(`import "@/server/status";\n`, "src/klient/okt/sjekk.ts"),
    ).toBe(1);
  });

  it("src/kjerne kan importere ./okt", async () => {
    expect(await begrensedeImporter(`import "./okt";\n`, "src/kjerne/sjekk.ts")).toBe(0);
  });

  it.each([
    "src/server/modell/demo.ts",
    "src/server/modell/velg.ts",
    "src/server/status.ts",
    "src/app/api/status/route.ts",
    "src/klient/okt/sjekk.ts",
    "src/kjerne/okt.ts",
    "src/kjerne/skjema.ts",
    "src/lib/sjekk.ts",
    "tests/server/sjekk.test.ts",
    "scripts/sjekk.mjs",
  ])("%s kan ikke importere @anthropic-ai/sdk", async (fil) => {
    expect(await begrensedeImporter(`import Anthropic from "@anthropic-ai/sdk";\n`, fil)).toBe(1);
    expect(
      await begrensedeImporter(`import "@anthropic-ai/sdk/helpers/zod";\n`, fil),
    ).toBe(1);
  });

  it("src/server/modell/anthropic.ts kan importere @anthropic-ai/sdk, men ikke zod", async () => {
    const fil = "src/server/modell/anthropic.ts";
    expect(await begrensedeImporter(`import Anthropic from "@anthropic-ai/sdk";\n`, fil)).toBe(0);
    expect(await begrensedeImporter(`import "@anthropic-ai/sdk/helpers/zod";\n`, fil)).toBe(0);
    expect(await begrensedeImporter(`import { z } from "zod";\n`, fil)).toBe(1);
  });
});
