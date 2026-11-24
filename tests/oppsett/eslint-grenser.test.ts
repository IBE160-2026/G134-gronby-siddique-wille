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
    "react",
  ])("src/kjerne kan ikke importere %s", async (modul) => {
    expect(await begrensedeImporter(`import "${modul}";\n`, "src/kjerne/sjekk.ts")).toBe(1);
  });

  it("src/klient kan ikke importere @/server", async () => {
    expect(
      await begrensedeImporter(`import "@/server/modell";\n`, "src/klient/okt/sjekk.ts"),
    ).toBe(1);
  });

  it("src/kjerne kan importere ./okt", async () => {
    expect(await begrensedeImporter(`import "./okt";\n`, "src/kjerne/sjekk.ts")).toBe(0);
  });
});
