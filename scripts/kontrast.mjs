// Kontrastsjekk for merkevaretemaet (story 1.16, UX-DR2, WCAG 2.2 AA).
// Leser fargetokens fra :root i src/app/globals.css og avslutter med feilkode
// hvis ett av parene er under målet, eller hvis et token mangler sin
// Tailwind-kobling (--color-<navn>: var(--<navn>)) i @theme inline.
// Kjør: npm run kontrast (kjøres også automatisk før npm run build).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CSS_FIL = fileURLToPath(new URL("../src/app/globals.css", import.meta.url));

// [forgrunn, bakgrunn, minste forhold].
const PAR = [
  // Tabellen «Kontrastmål» i DESIGN.md.
  ["foreground", "background", 7],
  ["primary-foreground", "primary", 4.5],
  ["covered-foreground", "covered", 4.5],
  ["gap-foreground", "gap", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "muted", 4.5],
  // Andre tekstpar som komponentene i DESIGN.md bruker.
  ["card-foreground", "card", 4.5], // assistentboble, kort
  ["foreground", "muted", 4.5], // studentboble
  ["muted-foreground", "card", 4.5], // muted tekst på kort
  ["primary", "background", 4.5], // «Vis i samtalen», fullført steg
  ["primary", "card", 4.5], // lenkeknapp på kort
];

function blokk(css, selektor) {
  const m = css.match(new RegExp(`${selektor}\\s*\\{([^}]*)\\}`));
  if (!m) throw new Error(`Fant ingen ${selektor}-blokk i globals.css`);
  return m[1].replace(/\/\*[\s\S]*?\*\//g, "");
}

function lesDeklarasjoner(innhold) {
  const verdier = {};
  for (const [, navn, verdi] of innhold.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    verdier[navn] = verdi.trim();
  }
  return verdier;
}

function luminans(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Kontrastsjekken støtter bare sekssifret hex (#rrggbb), fikk: ${hex}`);
  const kanaler = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const [r, g, b] = kanaler.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function kontrast(a, b) {
  const [lys, mork] = [luminans(a), luminans(b)].sort((x, y) => y - x);
  return (lys + 0.05) / (mork + 0.05);
}

const css = readFileSync(CSS_FIL, "utf8");
const tokens = lesDeklarasjoner(blokk(css, ":root"));
const tema = lesDeklarasjoner(blokk(css, "@theme inline"));
let feil = 0;

for (const navn of new Set(PAR.flat().filter((x) => typeof x === "string"))) {
  if (!(navn in tokens)) throw new Error(`Mangler --${navn} i :root`);
  if (tema[`color-${navn}`] !== `var(--${navn})`) {
    feil++;
    console.log(`FEIL --color-${navn} i @theme inline skal være var(--${navn})`);
  }
}

for (const [fg, bg, mal] of PAR) {
  // Avrund ned til to desimaler, så 4.499 aldri vises som bestått 4.50.
  const forhold = Math.floor(kontrast(tokens[fg], tokens[bg]) * 100) / 100;
  const ok = forhold >= mal;
  if (!ok) feil++;
  console.log(
    `${ok ? "OK  " : "FEIL"} ${fg} på ${bg}: ${forhold.toFixed(2)}:1 (mål ≥ ${mal}:1)`,
  );
}

if (feil > 0) {
  console.error(`\n${feil} feil: temaet oppfyller ikke WCAG 2.2 AA-målene.`);
  process.exit(1);
}
console.log("\nAlle fargepar oppfyller kontrastmålene.");
