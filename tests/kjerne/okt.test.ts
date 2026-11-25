import { describe, expect, it } from "vitest";

import { nesteId, tomOkt } from "@/kjerne/okt";

describe("tomOkt", () => {
  it("starter tom med tellere på 0 og versjon 0", () => {
    const okt = tomOkt();
    expect(okt.versjon).toBe(0);
    expect(okt.tellere).toEqual({ A: 0, S: 0, R: 0, E: 0, K: 0 });
    expect(okt.logg).toEqual([]);
    expect(okt.erfaringer).toEqual([]);
    expect(okt.slettedeErfaringer).toEqual([]);
    expect(okt.annonse).toBe("");
    expect(okt.krav).toBeNull();
    expect(okt.bevistabell).toBeNull();
    expect(okt.modus).toBeNull();
  });

  it("tar imot startversjon", () => {
    expect(tomOkt(4).versjon).toBe(4);
  });

  it("gir nye objekter hver gang", () => {
    const a = tomOkt();
    const b = tomOkt();
    expect(a).not.toBe(b);
    expect(a.tellere).not.toBe(b.tellere);
  });
});

describe("nesteId", () => {
  it("gir neste ID for prefikset og øker bare den telleren", () => {
    const tellere = { A: 2, S: 0, R: 0, E: 5, K: 0 };
    const resultat = nesteId(tellere, "E");
    expect(resultat.id).toBe("E6");
    expect(resultat.tellere).toEqual({ A: 2, S: 0, R: 0, E: 6, K: 0 });
  });

  it("muterer ikke tellerne den får", () => {
    const tellere = Object.freeze({ A: 0, S: 0, R: 0, E: 0, K: 0 });
    const resultat = nesteId(tellere, "A");
    expect(resultat.id).toBe("A1");
    expect(tellere.A).toBe(0);
  });
});
