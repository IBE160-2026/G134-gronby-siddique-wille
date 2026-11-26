import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Modulgrenser. En senere konfigurasjonsblokk erstatter `no-restricted-imports`
// fra en tidligere, så hver fil skal treffes av nøyaktig én av blokkene under.
// Regex fanger både alias (`@/klient/...`) og relative stier (`../klient/...`).

// zod importeres bare i src/kjerne/skjema.ts (AD-13).
const zodForbud = {
  regex: "^zod(/|$)",
  message:
    "zod importeres bare i src/kjerne/skjema.ts. Importer skjemaer og typer derfra.",
};

// Kjerne importerer aldri app/klient/server/components eller I/O.
const kjerneGrenser = [
  {
    regex: "^(@/|(\\.\\.?/)+(src/)?)(app|klient|server|components)(/|$)",
    message:
      "src/kjerne er rene funksjoner og kan ikke importere app, klient, server eller components.",
  },
  {
    regex: "^(react|react-dom|next|server-only|fs|path|child_process)(/|$)|^node:",
    message:
      "src/kjerne er rene funksjoner og kan ikke importere React, Next.js, server-only eller Node-moduler for I/O.",
  },
];

// Klient importerer aldri server.
const klientGrense = {
  regex: "^(@/|(\\.\\.?/)+(src/)?)server(/|$)",
  message: "src/klient kan ikke importere fra src/server.",
};

// @anthropic-ai/sdk importeres bare i src/server/modell/anthropic.ts (AD-15).
const sdkForbud = {
  regex: "^@anthropic-ai/sdk(/|$)",
  message:
    "@anthropic-ai/sdk importeres bare i src/server/modell/anthropic.ts. Bruk Modell fra src/server/modell.",
};

const SKJEMA = "src/kjerne/skjema.ts";
const ANTHROPIC = "src/server/modell/anthropic.ts";

const forbud = (patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/kjerne/**"],
    ignores: [SKJEMA],
    rules: forbud([...kjerneGrenser, zodForbud, sdkForbud]),
  },
  {
    files: [SKJEMA],
    rules: forbud([...kjerneGrenser, sdkForbud]),
  },
  {
    files: ["src/klient/**"],
    rules: forbud([klientGrense, zodForbud, sdkForbud]),
  },
  {
    files: ["src/**"],
    ignores: ["src/kjerne/**", "src/klient/**", ANTHROPIC],
    rules: forbud([zodForbud, sdkForbud]),
  },
  {
    files: [ANTHROPIC],
    rules: forbud([zodForbud]),
  },
  // Utenfor src (tester, skript, konfigurasjon).
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    ignores: ["src/**"],
    rules: forbud([sdkForbud]),
  },
  // Gjentar standard-ignoreringene fra eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
