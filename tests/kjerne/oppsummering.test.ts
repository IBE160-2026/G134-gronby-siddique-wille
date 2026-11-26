import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  TOM_OPPSUMMERING,
  fangedeErfaringer,
  kanGaTilKravuttrekk,
  oppsummeringsnotis,
  rettetTekst,
  visningsnavn,
} from "@/kjerne/oppsummering";
import { MAAL_ERFARINGER } from "@/kjerne/regler";

import { erfaring, fangede, felt, svar, tomErfaring } from "./hjelpere";

const logg = [svar("S1")];

describe("rettetTekst (AD-5: rettelse bare ved faktisk endring)", () => {
  it("gir den nye teksten, trimmet, når den er endret", () => {
    expect(rettetTekst("Skiftleder", "  Skiftleder på helg ")).toBe("Skiftleder på helg");
  });

  it("gir null når teksten er uendret", () => {
    expect(rettetTekst("Skiftleder", "Skiftleder")).toBeNull();
  });

  it("gir null når bare mellomrom foran eller bak er endret", () => {
    expect(rettetTekst("Skiftleder", " Skiftleder  ")).toBeNull();
    expect(rettetTekst(" Skiftleder ", "Skiftleder")).toBeNull();
  });

  it("gir null når bare mellomrom eller linjeskift inne i teksten er endret", () => {
    expect(rettetTekst("Skift leder", "Skift  leder")).toBeNull();
    expect(rettetTekst("Skift leder", "Skift\nleder")).toBeNull();
    expect(rettetTekst("Skift\t leder", "Skift leder")).toBeNull();
  });

  it("beholder linjeskift inne i en tekst som faktisk er endret", () => {
    expect(rettetTekst("Skiftleder", "Skiftleder\npå helg")).toBe("Skiftleder\npå helg");
  });

  it("gir null for tom tekst, så forrige tekst står", () => {
    expect(rettetTekst("Skiftleder", "")).toBeNull();
    expect(rettetTekst("Skiftleder", "   \n ")).toBeNull();
  });

  it("skiller mellom store og små bokstaver", () => {
    expect(rettetTekst("skiftleder", "Skiftleder")).toBe("Skiftleder");
  });
});

describe("fangedeErfaringer", () => {
  it("gir bare de fangede, i øktens rekkefølge", () => {
    const erfaringer = [
      erfaring("E1"),
      tomErfaring("E2"),
      erfaring("E3", { resultat: felt("t", ["S9"]) }),
      erfaring("E4"),
    ];
    expect(fangedeErfaringer({ erfaringer, logg }).map((e) => e.id)).toEqual(["E1", "E4"]);
  });

  it("gir tom liste uten erfaringer", () => {
    expect(fangedeErfaringer({ erfaringer: [], logg })).toEqual([]);
  });
});

describe("kanGaTilKravuttrekk", () => {
  it("usann med 0 fangede, også når det finnes delvise", () => {
    expect(kanGaTilKravuttrekk({ erfaringer: [], logg })).toBe(false);
    expect(kanGaTilKravuttrekk({ erfaringer: [tomErfaring("E1")], logg })).toBe(false);
  });

  it.each([1, 2, 3, 5])("sann med %i fangede", (n) => {
    expect(kanGaTilKravuttrekk({ erfaringer: fangede(n), logg })).toBe(true);
  });
});

describe("oppsummeringsnotis (EXPERIENCE.md State Patterns)", () => {
  it("0 fangede gir tom tilstand", () => {
    expect(oppsummeringsnotis(0)).toEqual({
      type: "tom",
      tekst: "Vi har ikke fått nok til å fange en erfaring ennå.",
    });
  });

  it("1 fanget gir notis i entall", () => {
    expect(oppsummeringsnotis(1)).toEqual({
      type: "notis",
      tekst: "Du har fanget 1 erfaring. Du kan fortsette samtalen eller gå videre med det du har.",
    });
  });

  it("2 fangede gir notis i flertall", () => {
    expect(oppsummeringsnotis(2)).toEqual({
      type: "notis",
      tekst: "Du har fanget 2 erfaringer. Du kan fortsette samtalen eller gå videre med det du har.",
    });
  });

  it("ingen notis fra og med MAAL_ERFARINGER", () => {
    expect(oppsummeringsnotis(MAAL_ERFARINGER)).toBeNull();
  });

  it.each([3, 4, 8])("%i fangede gir ingen notis", (n) => {
    expect(oppsummeringsnotis(n)).toBeNull();
  });

  it("tekstene står i EXPERIENCE.md", () => {
    // Uavhengig av arbeidsmappen Vitest kjøres fra.
    const experience = readFileSync(
      fileURLToPath(
        new URL(
          "../../docs/ux-designs/ux-G134-gronby-siddique-wille-2026-11-04/EXPERIENCE.md",
          import.meta.url,
        ),
      ),
      "utf8",
    );
    expect(experience).toContain(`«${TOM_OPPSUMMERING}»`);
    expect(experience).toContain(
      "Du kan fortsette samtalen eller gå videre med det du har.»",
    );
  });
});

describe("visningsnavn", () => {
  it("gir tittelen, trimmet", () => {
    expect(visningsnavn("  Butikkjobb ")).toBe("Butikkjobb");
  });

  it("gir en reserve for tom tittel, så tilgjengelige navn aldri er tomme", () => {
    expect(visningsnavn("")).toBe("Erfaring uten tittel");
    expect(visningsnavn("   ")).toBe("Erfaring uten tittel");
  });
});
