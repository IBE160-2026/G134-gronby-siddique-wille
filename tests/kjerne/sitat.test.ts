import { describe, expect, it } from "vitest";

import { hentSitat, normaliser, verifiserSitat } from "@/kjerne/sitat";
import type { LoggOppforing } from "@/kjerne/skjema";

import testsettA from "../../fixtures/testsett-a/student.json";

/** Loggen til Mia i testsett A: spørsmål A…, svar S… med samme nummer. */
const miaLogg: LoggOppforing[] = testsettA.samtale.flatMap((tur, i) => [
  { type: "sporsmal" as const, id: `A${i + 1}`, tekst: tur.sporsmal, gjelder: null },
  { type: "svar" as const, id: tur.id, tekst: tur.svar },
]);

function loggMed(tekst: string): LoggOppforing[] {
  return [{ type: "svar", id: "S1", tekst }];
}

describe("normaliser", () => {
  it("slår sammen mellomrom, NBSP og linjeskift, og trimmer", () => {
    expect(normaliser("  Jeg   holdt\n\ntalen \t ")).toBe("Jeg holdt talen");
  });

  it("gjør tegn med aksent om til NFC", () => {
    expect(normaliser("café")).toBe("café");
  });

  it("skiller store og små bokstaver", () => {
    expect(normaliser("Jeg")).not.toBe(normaliser("jeg"));
  });

  it("gir tom streng for bare mellomrom", () => {
    expect(normaliser(" \n  ")).toBe("");
  });
});

describe("verifiserSitat", () => {
  it("godtar et ordrett sitat og gir posisjonene i originalteksten", () => {
    const logg = loggMed("Jeg ledet gruppa og leverte før fristen.");
    const treff = verifiserSitat(logg, "S1", "leverte før fristen");
    expect(treff).toEqual({ svarId: "S1", start: 20, slutt: 39 });
    expect(logg[0].tekst.slice(treff!.start, treff!.slutt)).toBe("leverte før fristen");
  });

  it("godtar hele svaret som sitat", () => {
    const tekst = "Jeg ledet gruppa.";
    expect(verifiserSitat(loggMed(tekst), "S1", tekst)).toEqual({
      svarId: "S1",
      start: 0,
      slutt: tekst.length,
    });
  });

  it("forkaster et sitat som ikke er ordrett", () => {
    const logg = loggMed("Jeg ledet gruppa og leverte før fristen.");
    expect(verifiserSitat(logg, "S1", "Jeg ledde gruppen og leverte i tide")).toBeNull();
    expect(verifiserSitat(logg, "S1", "leverte før fristen, og alt gikk bra")).toBeNull();
  });

  it("skiller store og små bokstaver", () => {
    expect(verifiserSitat(loggMed("Jeg ledet gruppa."), "S1", "jeg ledet")).toBeNull();
  });

  it("forkaster tomt sitat og sitat med bare mellomrom", () => {
    const logg = loggMed("Jeg ledet gruppa.");
    expect(verifiserSitat(logg, "S1", "")).toBeNull();
    expect(verifiserSitat(logg, "S1", "  \n ")).toBeNull();
  });

  it("tåler ulik mellomromsbruk, og posisjonene dekker originalens mellomrom", () => {
    const original = "Jeg ledet  gruppa\nog leverte.";
    const treff = verifiserSitat(loggMed(original), "S1", " ledet gruppa og ");
    expect(treff).not.toBeNull();
    expect(original.slice(treff!.start, treff!.slutt)).toBe("ledet  gruppa\nog");
  });

  it("tåler at aksenttegn er skrevet på ulik måte", () => {
    const original = "Vi solgte café-kaffe hver dag.";
    const treff = verifiserSitat(loggMed(original), "S1", "café-kaffe");
    expect(treff).not.toBeNull();
    expect(original.slice(treff!.start, treff!.slutt)).toBe("café-kaffe");
  });

  it("bruker første forekomst når sitatet står flere steder", () => {
    const treff = verifiserSitat(loggMed("ja, ja, ja"), "S1", "ja");
    expect(treff).toEqual({ svarId: "S1", start: 0, slutt: 2 });
  });

  it("forkaster ukjent svarId", () => {
    expect(verifiserSitat(loggMed("Jeg ledet gruppa."), "S9", "Jeg ledet")).toBeNull();
  });

  it("siterer aldri spørsmål eller rettelser, selv om ID-en finnes og teksten stemmer", () => {
    const logg: LoggOppforing[] = [
      { type: "sporsmal", id: "A1", tekst: "Hva gjorde du i gruppa?", gjelder: null },
      { type: "svar", id: "S1", tekst: "Jeg ledet gruppa." },
      { type: "rettelse", id: "R1", erfaringId: "E1", felt: "handling", tekst: "Ledet en gruppe på fem" },
    ];
    expect(verifiserSitat(logg, "A1", "Hva gjorde du")).toBeNull();
    expect(verifiserSitat(logg, "R1", "Ledet en gruppe")).toBeNull();
    expect(verifiserSitat(logg, "S1", "Ledet en gruppe")).toBeNull();
  });

  it("muterer ikke loggen", () => {
    const logg = loggMed("Jeg  ledet\ngruppa.");
    const kopi = structuredClone(logg);
    verifiserSitat(logg, "S1", "ledet gruppa");
    expect(logg).toEqual(kopi);
  });
});

describe("hentSitat", () => {
  it("klipper sitatet ut av loggen med start og slutt, ikke fra modellens streng", () => {
    const logg = loggMed("Jeg ledet gruppa og leverte.");
    const modellensStreng = "ledet gruppa";
    const treff = verifiserSitat(logg, "S1", modellensStreng)!;
    const sitat = hentSitat(logg, treff);
    expect(sitat).toBe("ledet gruppa");
    expect(sitat).not.toBe(modellensStreng);
  });

  it("gir null for ukjent svarId, ikke-svar og ugyldig utsnitt", () => {
    const logg: LoggOppforing[] = [
      { type: "sporsmal", id: "A1", tekst: "Hva gjorde du?", gjelder: null },
      { type: "svar", id: "S1", tekst: "Jeg ledet gruppa." },
    ];
    expect(hentSitat(logg, { svarId: "S9", start: 0, slutt: 3 })).toBeNull();
    expect(hentSitat(logg, { svarId: "A1", start: 0, slutt: 3 })).toBeNull();
    expect(hentSitat(logg, { svarId: "S1", start: 5, slutt: 5 })).toBeNull();
    expect(hentSitat(logg, { svarId: "S1", start: -1, slutt: 3 })).toBeNull();
    expect(hentSitat(logg, { svarId: "S1", start: 0, slutt: 999 })).toBeNull();
  });
});

describe("testsett A", () => {
  it("godtar ordrette utdrag av Mias egne svar for alle svar", () => {
    for (const tur of testsettA.samtale) {
      const utdrag = tur.svar.split(" ").slice(2, 7).join(" ");
      const treff = verifiserSitat(miaLogg, tur.id, utdrag);
      expect(treff, `${tur.id}: «${utdrag}»`).not.toBeNull();
      expect(hentSitat(miaLogg, treff!)).toBe(utdrag);
    }
  });

  it("forkaster et sitat som er flyttet til feil svar", () => {
    const s3 = testsettA.samtale.find((t) => t.id === "S3")!;
    const utdrag = s3.svar.split(" ").slice(0, 6).join(" ");
    expect(verifiserSitat(miaLogg, "S3", utdrag)).not.toBeNull();
    expect(verifiserSitat(miaLogg, "S2", utdrag)).toBeNull();
  });

  it("forkaster et oppdiktet sitat som høres troverdig ut", () => {
    expect(
      verifiserSitat(miaLogg, "S3", "Jeg leder et team på tolv personer og har budsjettansvar"),
    ).toBeNull();
  });
});
