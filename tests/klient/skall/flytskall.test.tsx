import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { Flytskall } from "@/klient/skall/flytskall";

// Stegindikatoren slik Flytskall kobler den: steg før det aktive er fullført
// og klikkbare (story 1.12). Økten og ruteren er mocket.
let sti = "/oppsummering";
const okt: Okt = { ...tomOkt(), modus: "ekte" };
vi.mock("@/klient/okt/kontekst", () => ({ useOkt: () => okt, useOktDispatch: () => vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => sti,
}));

/** Stegnavnene som er knapper (fullført og klikkbare). */
function klikkbare(html: string): string[] {
  const nav = html.match(/<nav aria-label="Steg"[\s\S]*?<\/nav>/)?.[0] ?? "";
  return [...nav.matchAll(/<button[^>]*>(?:<span[^>]*>\d+<\/span>\s*)?([^<]+)/g)].map((m) =>
    m[1].replace(/^\d+\s*/, "").trim(),
  );
}

describe("Flytskall: fullførte steg", () => {
  it("på Oppsummering er Samtale fullført og klikkbar, senere steg er ikke", () => {
    sti = "/oppsummering";
    const html = renderToString(<Flytskall>innhold</Flytskall>);
    expect(klikkbare(html)).toEqual(["Samtale"]);
    expect(html).toContain('aria-current="step"');
  });

  it("på Samtale er ingen steg klikkbare", () => {
    sti = "/samtale";
    expect(klikkbare(renderToString(<Flytskall>innhold</Flytskall>))).toEqual([]);
  });
});
