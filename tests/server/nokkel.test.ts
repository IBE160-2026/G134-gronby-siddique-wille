import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { lesNokkel } = await import("@/server/nokkel");

describe("lesNokkel", () => {
  it("trimmer nøkkelen", () => {
    expect(lesNokkel({ ANTHROPIC_API_KEY: "  sk-ant-test\n" })).toBe("sk-ant-test");
  });

  it.each([undefined, "", "   ", "\t\n"])("%j gir undefined", (nokkel) => {
    expect(lesNokkel({ ANTHROPIC_API_KEY: nokkel })).toBeUndefined();
  });
});
