#!/usr/bin/env node
// يولّد رموز Swift من design-system.css (مصدر الحقيقة الوحيد). --check يفشل إن اختلف الملف المولَّد.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
const CSS = "artifacts/majalis/src/design-system/design-system.css";
const OUT = "ios-native/Sources/Design/Tokens.generated.swift";
const css = readFileSync(CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const light = new Map(), dark = new Map();
for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const sel = m[1].trim();
  const isDark = /data-theme="dark"|html\.dark/.test(sel) && !/prefers-color-scheme/.test(sel);
  const isRoot = sel === ":root";
  if (!isDark && !isRoot) continue;
  for (const d of m[2].matchAll(/--(sn-[\w-]+)\s*:\s*([^;]+);/g)) (isDark ? dark : light).set(d[1], d[2].trim());
}
const camel = (n) => n.replace(/^sn-/, "").replace(/-(\w)/g, (_, c) => c.toUpperCase());
const hex = (v) => { const m = v.match(/^#([0-9a-f]{3,8})$/i); if (!m) return null; let h = m[1]; if (h.length <= 4) h = [...h].map((c) => c + c).join(""); return h.length === 6 ? h.toUpperCase() + "FF" : h.toUpperCase(); };
const rgba = (v) => { const m = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/); if (!m) return null; const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return [m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, "0")).join("").toUpperCase() + Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase(); };
const color = (v) => hex(v) ?? rgba(v);
const num = (v) => { const m = v.match(/^(-?[\d.]+)(rem|px)?$/); return m ? (m[2] === "rem" ? +m[1] * 16 : +m[1]) : null; };
const colors = [], metrics = [], skipped = [];
for (const [k, v] of light) {
  const c = color(v);
  if (c) { const d = dark.has(k) ? color(dark.get(k)) : null; colors.push([camel(k), c, d ?? c]); continue; }
  const n = num(v);
  if (n !== null) { metrics.push([camel(k), n]); continue; }
  skipped.push(k);
}
const lit = (h) => `0x${h}`;
const out = `// هذا الملف مولَّد من design-system.css — لا تعدّله يدويًا (node scripts/generate-swift-tokens.mjs).
import SwiftUI
import UIKit

public extension Color {
    init(light: UInt32, dark: UInt32) {
        self.init(UIColor { $0.userInterfaceStyle == .dark ? UIColor(rgba: dark) : UIColor(rgba: light) })
    }
}

extension UIColor {
    convenience init(rgba: UInt32) {
        self.init(red: CGFloat((rgba >> 24) & 0xFF) / 255, green: CGFloat((rgba >> 16) & 0xFF) / 255,
                  blue: CGFloat((rgba >> 8) & 0xFF) / 255, alpha: CGFloat(rgba & 0xFF) / 255)
    }
}

public enum DSColor {
${colors.map(([n, l, d]) => `    public static let ${n} = Color(light: ${lit(l)}, dark: ${lit(d)})`).join("\n")}
}

public enum DSMetric {
${metrics.map(([n, v]) => `    public static let ${n}: CGFloat = ${v}`).join("\n")}
}
// رموز غير رقمية/لونية لم تُولَّد (${skipped.length}): ${skipped.join(", ")}
`;
if (process.argv.includes("--check")) {
  if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== out) { console.error("✗ Tokens.generated.swift قديم — شغّل node scripts/generate-swift-tokens.mjs"); process.exit(1); }
  console.log("✓ Tokens.generated.swift مطابق"); process.exit(0);
}
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out);
console.log(`ألوان ${colors.length} · مقاييس ${metrics.length} · متخطّى ${skipped.length}`);
