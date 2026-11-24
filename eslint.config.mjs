import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Modulgrenser: kjerne importerer aldri app/klient/server/components.
  // Regex fanger både alias (`@/klient/...`) og relative stier (`../klient/...`).
  {
    files: ["src/kjerne/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(@/|(\\.\\.?/)+)(app|klient|server|components)(/|$)",
              message:
                "src/kjerne er rene funksjoner og kan ikke importere app, klient, server eller components.",
            },
            {
              regex: "^(react|react-dom|next|server-only)(/|$)",
              message:
                "src/kjerne er rene funksjoner og kan ikke importere React, Next.js eller server-only.",
            },
          ],
        },
      ],
    },
  },
  // Modulgrenser: klient importerer aldri server.
  {
    files: ["src/klient/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(@/|(\\.\\.?/)+)server(/|$)",
              message: "src/klient kan ikke importere fra src/server.",
            },
          ],
        },
      ],
    },
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
