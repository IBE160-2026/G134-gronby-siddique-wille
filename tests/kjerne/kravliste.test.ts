import { describe, expect, it } from "vitest";

import { INGEN_KRAV, LESER_ANNONSEN, kravkunngjoring, kravlistetilstand } from "@/kjerne/kravliste";
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

  it("annonse som bare er lang nok med mellomrom i endene gir ikke-startet", () => {
    expect(kravlistetilstand({ annonse: " ".repeat(MIN_ANNONSE_TEGN), krav: null })).toBe(
      "ikke-startet",
    );
    const polstret = `  ${"a".repeat(MIN_ANNONSE_TEGN - 1)}  `;
    expect(kravlistetilstand({ annonse: polstret, krav: null })).toBe("ikke-startet");
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

describe("kravkunngjoring (WCAG 4.1.3)", () => {
  it("venter kunngjør «Leser annonsen …»", () => {
    expect(kravkunngjoring("venter", 0)).toBe(LESER_ANNONSEN);
  });

  it("liste kunngjør antallet, også i entall", () => {
    expect(kravkunngjoring("liste", 6)).toBe("Fant 6 krav.");
    expect(kravkunngjoring("liste", 1)).toBe("Fant 1 krav.");
  });

  it("tom kunngjør at ingen krav ble funnet; ikke-startet kunngjør ingenting", () => {
    expect(kravkunngjoring("tom", 0)).toBe("Fant ingen krav.");
    expect(kravkunngjoring("ikke-startet", 0)).toBe("");
    expect(INGEN_KRAV).toBe(
      "Vi fant ingen tydelige krav i teksten. Sjekk at du limte inn hele annonsen.",
    );
  });
});
