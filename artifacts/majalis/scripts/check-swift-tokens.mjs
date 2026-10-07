#!/usr/bin/env node
/** يتحقق أن قيم SunnahTokens.swift (مسافات/زوايا/ألوان) تطابق design-system.css. */
import { readFileSync } from "node:fs";

const css = readFileSync("src/design-system/design-system.css", "utf8");
const swift = readFileSync("ios/App/App/Design/SunnahTokens.swift", "utf8");
const px = (name) => Number(new RegExp(`--${name}:\\s*(\\d+)px`).exec(css)?.[1]);
const sw = (name) => Number(new RegExp(`${name}(?::\\s*CGFloat)?\\s*=\\s*(\\d+)`).exec(swift)?.[1]);

const pairs = [
  ["sn-s1", "s1"], ["sn-s2", "s2"], ["sn-s3", "s3"], ["sn-s4", "s4"], ["sn-s5", "s5"], ["sn-s6", "s6"], ["sn-s7", "s7"],
  ["sn-page-x", "pageX"], ["sn-touch", "touch"], ["sn-btn-h", "buttonHeight"],
  ["sn-r-sm", "small"], ["sn-r-lg", "card"], ["sn-r-xl", "hero"],
];
const bad = pairs.filter(([c, s]) => px(c) !== sw(s)).map(([c, s]) => `${c}=${px(c)} ≠ ${s}=${sw(s)}`);

const light = css.split(/html\[data-theme="dark"\]/)[0];
const hexLight = (n) => new RegExp(`--${n}:\\s*#([0-9a-fA-F]{6})`).exec(light)?.[1]?.toUpperCase();
for (const [c, s] of [["sn-bg", "bg"], ["sn-primary", "primary"], ["sn-primary-strong", "primaryStrong"], ["sn-text-primary", "textPrimary"]]) {
  const m = new RegExp(`static let ${s} = dynamic\\(light: 0x([0-9A-Fa-f]{6})`).exec(swift)?.[1]?.toUpperCase();
  if (m !== hexLight(c)) bad.push(`لون ${c}: css=${hexLight(c)} swift=${m}`);
}
if (bad.length) { console.error("✗ عدم تطابق الرموز:\n" + bad.join("\n")); process.exit(1); }
console.log("✓ SunnahTokens.swift يطابق design-system.css");
