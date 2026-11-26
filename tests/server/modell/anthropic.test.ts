import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { AnthropicModell, tilModellFeil } = await import("@/server/modell/anthropic");
const { MAX_RETRIES, MAX_TOKENS, MODELL_ID, TIMEOUT_MS, EFFORT, FRIST_MS } = await import(
  "@/server/modell/config"
);
const { ModellFeil } = await import("@/server/modell/grensesnitt");

// Ekte kall testes med en falsk `fetch`: ingen nøkkel, ingen nettverk.

type Kall = { url: string; init: RequestInit };

function falskFetch(svar: () => Response | Promise<Response>) {
  const kall: Kall[] = [];
  const fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    kall.push({ url: String(url), init: init ?? {} });
    return svar();
  });
  return { fetch: fetch as unknown as typeof globalThis.fetch, kall };
}

function melding(innhold: unknown[]): Response {
  return Response.json({
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: MODELL_ID,
    content: innhold,
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 1, output_tokens: 1 },
  });
}

const tekst = (t: string) => melding([{ type: "text", text: t }]);

const gyldigSamtale = {
  sporsmal: { tekst: "Hva gjorde du der?", gjelder: null },
  endringer: [{ type: "opprett", ny: "n1", tittel: "Kafé" }],
};

const foresporsel = {
  steg: "samtale" as const,
  system: "systemtekst",
  melding: "brukermelding",
  antallSvar: 0,
};

function body(k: Kall): Record<string, unknown> {
  return JSON.parse(String(k.init.body)) as Record<string, unknown>;
}

async function fangFeil(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (error) {
    return error;
  }
  throw new Error("forventet feil");
}

function forventModellFeil(feil: unknown, kode: string) {
  expect(feil).toBeInstanceOf(ModellFeil);
  const modellFeil = feil as InstanceType<typeof ModellFeil>;
  expect(modellFeil.kode).toBe(kode);
  expect(modellFeil.message).toBe(kode);
  expect(modellFeil.cause).toBeUndefined();
  expect(String(modellFeil)).not.toContain("hemmelig");
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("AnthropicModell", () => {
  it("gyldig svar gir modellsvaret, og forespørselen følger config.ts", async () => {
    const { fetch, kall } = falskFetch(() => tekst(JSON.stringify(gyldigSamtale)));
    const modell = new AnthropicModell({ apiKey: "sk-ant-test", fetch });

    expect(await modell.kall(foresporsel)).toEqual(gyldigSamtale);
    expect(kall).toHaveLength(1);

    const b = body(kall[0]);
    expect(b.model).toBe(MODELL_ID);
    expect(b.max_tokens).toBe(MAX_TOKENS.samtale);
    expect(b.system).toBe("systemtekst");
    expect(b.messages).toEqual([{ role: "user", content: "brukermelding" }]);
    expect(b).not.toHaveProperty("temperature");
    expect(b).not.toHaveProperty("top_p");
    expect(b).not.toHaveProperty("top_k");
    expect(b.stream).toBeFalsy();
    const outputConfig = b.output_config as { effort: string; format: { type: string } };
    expect(outputConfig.effort).toBe(EFFORT);
    expect(outputConfig.format.type).toBe("json_schema");

    const headere = new Headers(kall[0].init.headers);
    expect(headere.get("x-stainless-timeout")).toBe(String(TIMEOUT_MS / 1000));
  });

  it.each(["krav", "bevis"] as const)("max_tokens for %s kommer fra config.ts", async (steg) => {
    const svar =
      steg === "krav" ? { krav: [] } : { bevis: [], refleksjonsforslag: [] };
    const { fetch, kall } = falskFetch(() => tekst(JSON.stringify(svar)));
    const modell = new AnthropicModell({ apiKey: "sk-ant-test", fetch });
    expect(await modell.kall({ ...foresporsel, steg })).toEqual(svar);
    expect(body(kall[0]).max_tokens).toBe(MAX_TOKENS[steg]);
  });

  it.each([undefined, "", "   "])("nøkkel %j gir mangler_nokkel uten nettverkskall", async (apiKey) => {
    const { fetch } = falskFetch(() => tekst("{}"));
    const feil = await fangFeil(new AnthropicModell({ apiKey, fetch }).kall(foresporsel));
    expect(feil).toBeInstanceOf(ModellFeil);
    expect((feil as InstanceType<typeof ModellFeil>).kode).toBe("mangler_nokkel");
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([429, 529, 500, 503])(
    "%i gir modell_feil etter nøyaktig maxRetries + 1 kall",
    async (status) => {
      const { fetch, kall } = falskFetch(() =>
        Response.json(
          { type: "error", error: { type: "overloaded_error", message: "hemmelig modelltekst" } },
          { status, headers: { "retry-after-ms": "0" } },
        ),
      );
      const feil = await fangFeil(
        new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel),
      );
      forventModellFeil(feil, "modell_feil");
      expect(kall).toHaveLength(MAX_RETRIES + 1);
    },
  );

  it.each([400, 401, 403, 404])("%i gir modell_feil uten nye forsøk", async (status) => {
    const { fetch, kall } = falskFetch(() =>
      Response.json({ type: "error", error: { type: "x", message: "m" } }, { status }),
    );
    const feil = await fangFeil(
      new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel),
    );
    expect((feil as InstanceType<typeof ModellFeil>).kode).toBe("modell_feil");
    expect(kall).toHaveLength(1);
  });

  it("timeout gir modell_feil", async () => {
    const { fetch, kall } = falskFetch(() => {
      throw new DOMException("The operation was aborted.", "AbortError");
    });
    const feil = await fangFeil(
      new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel),
    );
    forventModellFeil(feil, "modell_feil");
    expect(kall).toHaveLength(MAX_RETRIES + 1);
  });

  it("nettverksfeil gir modell_feil", async () => {
    const { fetch, kall } = falskFetch(() => {
      throw new TypeError("fetch failed");
    });
    const feil = await fangFeil(
      new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel),
    );
    forventModellFeil(feil, "modell_feil");
    expect(kall).toHaveLength(MAX_RETRIES + 1);
  });

  it("2xx med ødelagt JSON-body gir modell_feil uten bodyteksten", async () => {
    const { fetch } = falskFetch(
      () =>
        new Response('{"hemmelig modelltekst', {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    const feil = await fangFeil(
      new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel),
    );
    forventModellFeil(feil, "modell_feil");
  });

  it.each([
    ["tekst som ikke er JSON", () => tekst("hemmelig modelltekst, ikke JSON")],
    ["feil form", () => tekst(JSON.stringify({ hemmelig: "modelltekst" }))],
    ["ingen tekstblokk", () => melding([])],
  ])("%s gir ugyldig_svar uten SDK-meldingen", async (_navn, svar) => {
    const { fetch } = falskFetch(svar);
    const feil = await fangFeil(
      new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel),
    );
    expect(feil).toBeInstanceOf(ModellFeil);
    const modellFeil = feil as InstanceType<typeof ModellFeil>;
    expect(modellFeil.kode).toBe("ugyldig_svar");
    expect(modellFeil.message).toBe("ugyldig_svar");
    expect(modellFeil.cause).toBeUndefined();
    expect(JSON.stringify(modellFeil)).not.toContain("hemmelig");
  });

  it("samlet frist: avbrudd via AbortSignal.timeout(FRIST_MS) gir modell_feil", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(AbortSignal.abort());
    const { fetch } = falskFetch(() => tekst(JSON.stringify(gyldigSamtale)));
    const feil = await fangFeil(
      new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel),
    );
    expect(timeout).toHaveBeenCalledWith(FRIST_MS);
    forventModellFeil(feil, "modell_feil");
  });

  it("SDK-en logger ingenting, heller ikke ved feil", async () => {
    // Med `ANTHROPIC_LOG=debug` ville SDK-en logget uten `logLevel: "off"`.
    vi.stubEnv("ANTHROPIC_LOG", "debug");
    const spioner = (["log", "info", "warn", "error", "debug"] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    const { fetch } = falskFetch(() =>
      Response.json(
        { type: "error", error: { type: "api_error", message: "hemmelig" } },
        { status: 500, headers: { "retry-after-ms": "0" } },
      ),
    );
    await fangFeil(new AnthropicModell({ apiKey: "sk-ant-test", fetch }).kall(foresporsel));
    for (const spion of spioner) expect(spion).not.toHaveBeenCalled();
  });
});

describe("tilModellFeil", () => {
  it("ukjente feil gir modell_feil uten meldingen", () => {
    const feil = tilModellFeil(new RangeError("hemmelig modelltekst"));
    expect(feil).toBeInstanceOf(ModellFeil);
    expect(feil.kode).toBe("modell_feil");
    expect(feil.message).toBe("modell_feil");
    expect(feil.cause).toBeUndefined();
  });

  it("ModellFeil returneres uendret", () => {
    const feil = new ModellFeil("ugyldig_svar");
    expect(tilModellFeil(feil)).toBe(feil);
  });
});
