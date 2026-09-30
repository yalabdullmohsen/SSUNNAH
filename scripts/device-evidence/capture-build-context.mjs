#!/usr/bin/env node
/**
 * WAVE13 — capture production version.json + local git tip for device evidence.
 * No PII. No Quran text. Safe to run from CI or owner laptop.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function arg(name, fallback = "") {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const out = resolve(arg("--out", "build-context.json"));
const url = arg("--url", "https://www.ssunnah.com/version.json");
const repoRoot = resolve(arg("--repo-root", process.cwd()));

function git(args) {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const localMain = git(["rev-parse", "origin/main"]) || git(["rev-parse", "HEAD"]);
const localShort = localMain ? localMain.slice(0, 8) : "";
const branch = git(["branch", "--show-current"]);

let production = null;
let fetchError = "";
try {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  production = await res.json();
} catch (e) {
  fetchError = String(e?.message || e);
}

const prodCommit = String(
  production?.commit || production?.shortCommit || production?.commitSha || "",
).slice(0, 8);

const payload = {
  capturedAt: new Date().toISOString(),
  productionUrl: url,
  production,
  productionFetchError: fetchError || null,
  local: {
    repoRoot,
    branch,
    originMain: localMain,
    originMainShort: localShort,
  },
  match:
    Boolean(prodCommit) && Boolean(localShort) && prodCommit === localShort
      ? "MATCH"
      : prodCommit && localShort
        ? "MISMATCH"
        : "UNKNOWN",
  telemetryDefault: "OFF",
  policy: {
    noPII: true,
    noQuranText: true,
    deviceRowsDefault: "DEVICE_REQUIRED",
  },
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`device-evidence: wrote ${out} match=${payload.match}`);
if (payload.match === "MISMATCH") process.exitCode = 2;
