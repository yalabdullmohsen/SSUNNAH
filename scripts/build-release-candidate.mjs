#!/usr/bin/env node
/**
 * بناء Release Candidate محلي — بلا نشر / بلا توقيع / بلا رفع متجر.
 * Usage: PORT=24216 BASE_PATH=/ node scripts/build-release-candidate.mjs
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const majalis = join(root, "artifacts/majalis");
const outDir = join(root, "reports/release-candidate");

function sh(cmd, args, cwd = root) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: process.env.PORT || "24216",
      BASE_PATH: process.env.BASE_PATH || "/",
    },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim();
const short = commit.slice(0, 12);
const branch = spawnSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).stdout.trim();
const pnpmV = spawnSync("pnpm", ["-v"], { cwd: root, encoding: "utf8" }).stdout.trim();

console.log("build-release-candidate");
console.log({ commit: short, branch, note: "no deploy / no signing" });

sh("pnpm", ["run", "verify:preflight"]);
sh("pnpm", ["--filter", "@workspace/majalis", "run", "build"]);

mkdirSync(outDir, { recursive: true });

const dist = join(majalis, "dist");
if (!existsSync(dist)) {
  console.error("dist missing after build");
  process.exit(1);
}

const checksums = {};
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (st.size <= 50_000_000) {
      const rel = relative(dist, p).replace(/\\/g, "/");
      checksums[rel] = {
        bytes: st.size,
        sha256: createHash("sha256").update(readFileSync(p)).digest("hex"),
      };
    }
  }
}
walk(dist);

let version = {};
try {
  version = JSON.parse(readFileSync(join(dist, "version.json"), "utf8"));
} catch {
  version = {};
}

const manifest = {
  kind: "sunnah-release-candidate",
  generatedAt: new Date().toISOString(),
  commit,
  branch,
  channel: "rc-local",
  environment: "production-web-build",
  appVersion: version.version || "1.0.0",
  buildId: version.commit || short,
  node: process.version,
  pnpm: pnpmV,
  capacitorAppId: "com.yousef.majlisilm",
  notes: [
    "Unsigned / unpublished artifact metadata only",
    "No IPA/AAB generated",
    "Store status remains HOLD until OWNER_ACTION + DEVICE_REQUIRED close",
  ],
  fileCount: Object.keys(checksums).length,
};

writeFileSync(join(outDir, "build-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(join(outDir, "checksums.json"), JSON.stringify(checksums, null, 2) + "\n");
console.log("wrote", join(outDir, "build-manifest.json"));
console.log("wrote", join(outDir, "checksums.json"), `(${manifest.fileCount} files)`);
console.log("DONE — no deploy");
