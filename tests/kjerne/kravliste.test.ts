import { describe, expect, it } from "vitest";

import { kravlistetilstand } from "@/kjerne/kravliste";
import { MAKS_ANNONSE_TEGN, MIN_ANNONSE_TEGN } from "@/kjerne/regler";

const gyldig = "a".repeat(MIN_ANNONSE_TEGN);

describe("kravlistetilstand (FR-4, AD-9)", () => {
  it("krav null og tom annonse gir ikke-startet", () => {
    expect(kravlistetilstand({ annonse: "", krav: null })).toBe("ikke-startet");
  });

  it("krav null og for kort eller for lang annonse gir ikke-startet", () => {
    expect(
      kravlistetilstand({
        annonse: "a".repeat(MIN_ANNONSE_TEGN - 1),
        krav: null,
      }),
    ).toBe("ikke-startet");
    expect(
      kravlistetilstand({
        annonse: "a".repeat(MAKS_ANNONSE_TEGN + 1),
        krav: null,
      }),
    ).toBe("ikke-startet");
  });

  it("krav null og gyldig annonse gir venter", () => {
    expect(kravlistetilstand({ annonse: gyldig, krav: null })).toBe("venter");
  });

  it("tom kravliste er et gyldig resultat: tom", () => {
    expect(kravlistetilstand({ annonse: gyldig, krav: [] })).toBe("tom");
  });

  it("krav gir liste", () => {
    expect(
      kravlistetilstand({
        annonse: gyldig,
        krav: [{ id: "K1", tekst: "Samarbeid" }],
      }),
    ).toBe("liste");
  });
});
