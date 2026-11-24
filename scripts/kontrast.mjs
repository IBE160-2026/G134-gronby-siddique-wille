// Kontrastsjekk for merkevaretemaet (story 1.16, UX-DR2, WCAG 2.2 AA).
// Leser fargetokens fra :root i src/app/globals.css og avslutter med feilkode
// hvis ett av parene fra DESIGN.md er under målet. Kjør: npm run kontrast
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CSS_FIL = fileURLToPath(new URL("../src/app/globals.css", import.meta.url));

// [forgrunn, bakgrunn, minste forhold] – tabellen «Kontrastmål» i DESIGN.md.
const PAR = [
  ["foreground", "background", 7],
  ["primary-foreground", "primary", 4.5],
  ["covered-foreground", "covered", 4.5],
  ["gap-foreground", "gap", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "muted", 4.5],
];

export function lesTokens(css) {
  const rot = css.match(/:root\s*\{([^}]*)\}/);
  if (!rot) throw new Error("Fant ingen :root-blokk i globals.css");
  const tokens = {};
  for (const [, navn, verdi] of rot[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[navn] = verdi.trim();
  }
  return tokens;
}

function luminans(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Ikke en sekssifret hex-farge: ${hex}`);
  const kanaler = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const [r, g, b] = kanaler.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function kontrast(a, b) {
  const [lys, mork] = [luminans(a), luminans(b)].sort((x, y) => y - x);
  return (lys + 0.05) / (mork + 0.05);
}

function main() {
  const tokens = lesTokens(readFileSync(CSS_FIL, "utf8"));
  let feil = 0;
  for (const [fg, bg, mal] of PAR) {
    for (const navn of [fg, bg]) {
      if (!(navn in tokens)) throw new Error(`Mangler --${navn} i :root`);
    }
    // Avrund ned til to desimaler, så 4.499 aldri vises som bestått 4.50.
    const forhold = Math.floor(kontrast(tokens[fg], tokens[bg]) * 100) / 100;
    const ok = forhold >= mal;
    if (!ok) feil++;
    console.log(
      `${ok ? "OK  " : "FEIL"} ${fg} på ${bg}: ${forhold.toFixed(2)}:1 (mål ≥ ${mal}:1)`,
    );
  }
  if (feil > 0) {
    console.error(`\n${feil} fargepar oppfyller ikke WCAG 2.2 AA-målet.`);
    process.exit(1);
  }
  console.log("\nAlle fargepar oppfyller kontrastmålene.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
