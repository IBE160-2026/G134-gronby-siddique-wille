import { describe, expect, it } from "vitest";

import { fremdriftTekst, fylteSegmenter } from "@/kjerne/fremdrift";
import { MAAL_ERFARINGER } from "@/kjerne/regler";

describe("fremdriftTekst (UX-DR7)", () => {
  it.each([
    [0, "0 av 3 erfaringer fanget"],
    [1, "1 av 3 erfaringer fanget"],
    [2, "2 av 3 erfaringer fanget"],
    [3, "3 av 3 erfaringer fanget"],
    [4, "4 erfaringer fanget"],
    [8, "8 erfaringer fanget"],
  ])("%i fangede gir «%s»", (antall, tekst) => {
    expect(fremdriftTekst(antall)).toBe(tekst);
  });

  it("negative og ikke-endelige tall gir 0, desimaltall rundes ned", () => {
    expect(fremdriftTekst(-1)).toBe("0 av 3 erfaringer fanget");
    expect(fremdriftTekst(Number.NaN)).toBe("0 av 3 erfaringer fanget");
    expect(fremdriftTekst(Number.POSITIVE_INFINITY)).toBe("0 av 3 erfaringer fanget");
    expect(fremdriftTekst(2.9)).toBe("2 av 3 erfaringer fanget");
  });
});

describe("fylteSegmenter", () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 3],
    [8, 3],
  ])("%i fangede fyller %i segmenter", (antall, fylte) => {
    expect(fylteSegmenter(antall)).toBe(fylte);
  });

  it("er full ved målet", () => {
    expect(fylteSegmenter(MAAL_ERFARINGER)).toBe(MAAL_ERFARINGER);
  });

  it("negative og ikke-endelige tall gir 0, desimaltall rundes ned", () => {
    expect(fylteSegmenter(-2)).toBe(0);
    expect(fylteSegmenter(Number.NaN)).toBe(0);
    expect(fylteSegmenter(Number.POSITIVE_INFINITY)).toBe(0);
    expect(fylteSegmenter(2.9)).toBe(2);
  });
});
