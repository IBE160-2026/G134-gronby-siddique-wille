import { describe, expect, it } from "vitest";

import { nullstill } from "@/kjerne/nullstill";
import { tomOkt, type Okt } from "@/kjerne/okt";

function oktMedInnhold(): Okt {
  return {
    ...tomOkt(3),
    annonse: "Vi søker en utvikler …",
    krav: [{ id: "K1", tekst: "Samarbeid" }],
    bevistabell: [{ kravId: "K1", bevis: [], refleksjonsforslag: "Tenk på …" }],
  };
}

describe("nullstill", () => {
  it("annonseEndret tømmer krav og bevistabell, beholder annonsen og øker versjon", () => {
    const okt = oktMedInnhold();
    const ny = nullstill(okt, "annonseEndret");
    expect(ny.krav).toBeNull();
    expect(ny.bevistabell).toBeNull();
    expect(ny.annonse).toBe(okt.annonse);
    expect(ny.versjon).toBe(4);
  });

  it.each(["erfaringEndret", "samtaleFortsatt"] as const)(
    "%s tømmer bare bevistabellen og øker versjon",
    (arsak) => {
      const okt = oktMedInnhold();
      const ny = nullstill(okt, arsak);
      expect(ny.bevistabell).toBeNull();
      expect(ny.krav).toBe(okt.krav);
      expect(ny.annonse).toBe(okt.annonse);
      expect(ny.versjon).toBe(4);
    },
  );

  it("muterer ikke forrige økt", () => {
    const okt = oktMedInnhold();
    const kopi = structuredClone(okt);
    const ny = nullstill(okt, "annonseEndret");
    expect(ny).not.toBe(okt);
    expect(okt).toEqual(kopi);
  });
});
