// يولّد ios/App/SunnahNative/Tests/SunnahNativeTests/Fixtures/mawarith/golden.json من محرك الموقع الحقيقي
// (src/lib/inheritance) — دون تعديله. التشغيل: node scripts/gen-mawarith-golden.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

const root = resolve(import.meta.dirname, "..");
const out = join(root, "ios/App/SunnahNative/Tests/SunnahNativeTests/Fixtures/mawarith/golden.json");
const tmp = mkdtempSync(join(tmpdir(), "mawarith-"));
execFileSync(join(root, "../../node_modules/.bin/tsc"), [
  "src/lib/inheritance/engine.ts", "src/lib/inheritance/estate.ts", "src/lib/inheritance/presets.ts",
  "--outDir", join(tmp, "js"), "--target", "ES2020", "--module", "commonjs", "--skipLibCheck",
], { cwd: root, stdio: "inherit" });
const body = readFileSync(new URL("./mawarith-golden-cases.cjs.txt", import.meta.url), "utf8");
writeFileSync(join(tmp, "gen.js"), body);
mkdirSync(join(out, ".."), { recursive: true });
execFileSync("node", [join(tmp, "gen.js"), out], { cwd: tmp, stdio: "inherit" });
