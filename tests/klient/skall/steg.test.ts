import { describe, expect, it } from "vitest";

import { stegFor } from "@/klient/skall/steg";

describe("stegFor (lineær flyt)", () => {
  it("ingen steg før Samtale", () => {
    expect(stegFor("samtale")).toEqual([]);
  });

  it("Samtale er fullført på Oppsummering", () => {
    expect(stegFor("oppsummering")).toEqual(["samtale"]);
  });

  it("alle før Bevistabell er fullført", () => {
    expect(stegFor("krav")).toEqual(["samtale", "oppsummering", "annonse"]);
    expect(stegFor("bevistabell")).toEqual(["samtale", "oppsummering", "annonse", "krav"]);
  });
});
