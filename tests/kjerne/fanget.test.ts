import { describe, expect, it } from "vitest";

import { erFanget } from "@/kjerne/fanget";
import type { Erfaring } from "@/kjerne/okt";

const felt = (tekst: string, kilder: string[] = [], rettetAvStudent = false) => ({
  tekst,
  kilder,
  rettetAvStudent,
});

const lagErfaring = (
  r: string, rkilder: string[],
  h: string, hkilder: string[],
  res: string, reskilder: string[],
): Erfaring => ({
  id: "E1",
  tittel: "Testerfaring",
  tittelRettetAvStudent: false,
  rolle: felt(r, rkilder),
  handling: felt(h, hkilder),
  resultat: felt(res, reskilder),
});

describe("erFanget", () => {
  it("returnerer true når alle tre felt har tekst og minst én kilde", () => {
    expect(erFanget(lagErfaring("Rolle", ["S1"], "Handling", ["S2"], "Resultat", ["S3"]))).toBe(true);
  });

  it("returnerer true med samme kilde for alle felt", () => {
    expect(erFanget(lagErfaring("Rolle", ["S1"], "Handling", ["S1"], "Resultat", ["S1"]))).toBe(true);
  });

  it("returnerer false når rolle-tekst er tom", () => {
    expect(erFanget(lagErfaring("", [], "Handling", ["S2"], "Resultat", ["S3"]))).toBe(false);
  });

  it("returnerer false når handling-tekst er tom", () => {
    expect(erFanget(lagErfaring("Rolle", ["S1"], "", [], "Resultat", ["S3"]))).toBe(false);
  });

  it("returnerer false når resultat-tekst er tom", () => {
    expect(erFanget(lagErfaring("Rolle", ["S1"], "Handling", ["S2"], "", []))).toBe(false);
  });

  it("returnerer false når tekst finnes men kilde mangler for rolle", () => {
    expect(erFanget(lagErfaring("Rolle", [], "Handling", ["S2"], "Resultat", ["S3"]))).toBe(false);
  });

  it("returnerer false når tekst finnes men kilde mangler for handling", () => {
    expect(erFanget(lagErfaring("Rolle", ["S1"], "Handling", [], "Resultat", ["S3"]))).toBe(false);
  });

  it("returnerer false når tekst finnes men kilde mangler for resultat", () => {
    expect(erFanget(lagErfaring("Rolle", ["S1"], "Handling", ["S2"], "Resultat", []))).toBe(false);
  });

  it("returnerer false for tekst med bare mellomrom (trim)", () => {
    expect(erFanget(lagErfaring("  ", ["S1"], "Handling", ["S2"], "Resultat", ["S3"]))).toBe(false);
    expect(erFanget(lagErfaring("Rolle", ["S1"], "\t", ["S2"], "Resultat", ["S3"]))).toBe(false);
  });

  it("returnerer false når ingen felt er fylt", () => {
    expect(erFanget(lagErfaring("", [], "", [], "", []))).toBe(false);
  });
});
