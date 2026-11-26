import { describe, expect, it, vi } from "vitest";

import { FEILKODER, FeilKode, FeilSvar } from "@/kjerne/skjema";

vi.mock("server-only", () => ({}));

const { feilsvar } = await import("@/server/feil");

describe("feilsvar", () => {
  it.each(FeilKode.options)("%s gir status og fast melding fra FEILKODER", async (kode) => {
    const svar = feilsvar(kode);
    expect(svar.status).toBe(FEILKODER[kode].status);
    expect(svar.headers.get("Cache-Control")).toBe("no-store");
    expect(svar.headers.get("Content-Type")).toMatch(/application\/json/);
    const body = FeilSvar.parse(await svar.json());
    expect(body).toEqual({ feil: { kode, melding: FEILKODER[kode].melding } });
  });

  it.each([
    ["mangler_nokkel", 400],
    ["modell_feil", 503],
    ["ugyldig_svar", 502],
  ] as const)("%s → %i", (kode, status) => {
    expect(feilsvar(kode).status).toBe(status);
  });
});
