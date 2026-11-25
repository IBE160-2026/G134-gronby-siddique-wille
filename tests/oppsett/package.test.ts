import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// AD-17: appen kjører bare lokalt og binder til 127.0.0.1.
const pakke = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as { scripts: Record<string, string> };

describe("package.json", () => {
  it.each(["dev", "start"])("%s binder til -H 127.0.0.1", (script) => {
    expect(pakke.scripts[script]).toMatch(/(^|\s)-H 127\.0\.0\.1(\s|$)/);
  });
});
