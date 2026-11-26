import { describe, expect, it } from "vitest";

import { tastValg } from "@/klient/oppsummering/redigering";

const enLinje = { enLinje: true, komponerer: false };
const flerlinje = { enLinje: false, komponerer: false };

describe("tastValg (inline-redigering på Oppsummering)", () => {
  it("Esc angrer i begge felttyper", () => {
    expect(tastValg("Escape", enLinje)).toBe("angre");
    expect(tastValg("Escape", flerlinje)).toBe("angre");
  });

  it("Enter lagrer i tittelfeltet, men gir ny linje i R-H-R-feltene", () => {
    expect(tastValg("Enter", enLinje)).toBe("lagre");
    expect(tastValg("Enter", flerlinje)).toBeNull();
  });

  it("gjør ingenting midt i en IME-komposisjon", () => {
    expect(tastValg("Escape", { enLinje: true, komponerer: true })).toBeNull();
    expect(tastValg("Enter", { enLinje: true, komponerer: true })).toBeNull();
  });

  it("andre taster gjør ingenting", () => {
    expect(tastValg("a", enLinje)).toBeNull();
    expect(tastValg("Tab", flerlinje)).toBeNull();
  });
});
