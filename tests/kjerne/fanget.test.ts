import { describe, expect, it } from "vitest";

import { antallFangede, erFanget } from "@/kjerne/fanget";

import { erfaring, felt, svar, tomErfaring } from "./hjelpere";

const logg = [svar("S1")];

describe("erFanget (AD-7)", () => {
  it("sann når alle tre felt har tekst og en gyldig kilde", () => {
    expect(erFanget(erfaring("E1"), logg)).toBe(true);
  });

  it.each(["rolle", "handling", "resultat"] as const)("usann når %s mangler tekst", (navn) => {
    expect(erFanget(erfaring("E1", { [navn]: felt("   ", ["S1"]) }), logg)).toBe(false);
  });

  it.each(["rolle", "handling", "resultat"] as const)("usann når %s mangler kilde", (navn) => {
    expect(erFanget(erfaring("E1", { [navn]: felt("tekst") }), logg)).toBe(false);
  });

  it("en kilde som ikke er et svar i loggen, er ikke gyldig", () => {
    const e = erfaring("E1", { resultat: felt("tekst", ["S9"]) });
    expect(erFanget(e, logg)).toBe(false);
    expect(erFanget(e, [...logg, svar("S9")])).toBe(true);
  });

  it("usann når ingen felt er fylt (story 1.9)", () => {
    expect(erFanget(tomErfaring("E1"), logg)).toBe(false);
  });

  it("én gyldig kilde blant ugyldige holder", () => {
    expect(erFanget(erfaring("E1", { rolle: felt("t", ["S7", "S1"]) }), logg)).toBe(true);
  });
});

describe("antallFangede", () => {
  it("teller bare fangede", () => {
    expect(
      antallFangede({ erfaringer: [erfaring("E1"), tomErfaring("E2"), erfaring("E3")], logg }),
    ).toBe(2);
    expect(antallFangede({ erfaringer: [], logg: [] })).toBe(0);
  });
});
