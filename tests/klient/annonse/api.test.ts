import { describe, expect, it } from "vitest";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { KravForesporsel } from "@/kjerne/skjema";
import { lagKravForesporsel } from "@/klient/annonse/api";
import { oktReducer } from "@/klient/okt/reducer";

const startet = (): Okt => ({ ...tomOkt(), modus: "demo" });

describe("lagKravForesporsel", () => {
  it("tar med modus, versjon og annonse, og består KravForesporsel", () => {
    const okt: Okt = { ...startet(), versjon: 3, annonse: "Vi søker en utvikler." };
    const foresporsel = lagKravForesporsel(okt);
    expect(foresporsel).toEqual({ modus: "demo", versjon: 3, annonse: "Vi søker en utvikler." });
    expect(KravForesporsel.safeParse(foresporsel).success).toBe(true);
  });

  it("følger versjonen etter at en endret annonse er lagret (AD-14)", () => {
    const for_ = startet();
    const etter = oktReducer(for_, { type: "settAnnonse", tekst: "Ny annonse" });
    expect(lagKravForesporsel(etter).versjon).toBe(etter.versjon);
    expect(etter.versjon).toBeGreaterThan(for_.versjon);
  });

  it("endrer ikke økten", () => {
    const okt = { ...startet(), annonse: "x" };
    const kopi = structuredClone(okt);
    lagKravForesporsel(okt);
    expect(okt).toEqual(kopi);
  });

  it("kaster når økten ikke er startet", () => {
    expect(() => lagKravForesporsel(tomOkt())).toThrow("Økten er ikke startet.");
  });
});
