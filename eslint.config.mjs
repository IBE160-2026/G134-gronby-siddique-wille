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

const SKJEMA = "src/kjerne/skjema.ts";

const forbud = (patterns) => ({
  "no-restricted-imports": ["error", { patterns }],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/kjerne/**"],
    ignores: [SKJEMA],
    rules: forbud([...kjerneGrenser, zodForbud]),
  },
  {
    files: [SKJEMA],
    rules: forbud(kjerneGrenser),
  },
  {
    files: ["src/klient/**"],
    rules: forbud([klientGrense, zodForbud]),
  },
  {
    files: ["src/**"],
    ignores: ["src/kjerne/**", "src/klient/**"],
    rules: forbud([zodForbud]),
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
