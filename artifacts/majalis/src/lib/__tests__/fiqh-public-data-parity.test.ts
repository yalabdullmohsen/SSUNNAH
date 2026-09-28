/**
 * تطابق content/fiqh ↔ public/data/fiqh بعد publish — بلا تغيير نص.
 * التشغيل: node --import tsx src/lib/__tests__/fiqh-public-data-parity.test.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const contentBooks = resolve(root, "content/fiqh/books.json");
const contentAliases = resolve(root, "content/fiqh/book-aliases.json");
const publicDir = resolve(root, "public/data/fiqh");

assert.ok(existsSync(contentBooks), "SSOT content/fiqh/books.json");
const pub = spawnSync(process.execPath, [resolve(root, "scripts/publish-fiqh-public-data.mjs")], {
  cwd: root,
  encoding: "utf8",
});
assert.equal(pub.status, 0, `publish-fiqh failed: ${pub.stderr || pub.stdout}`);

const cBooks = readFileSync(contentBooks);
const pBooks = readFileSync(resolve(publicDir, "books.json"));
const cAliases = readFileSync(contentAliases);
const pAliases = readFileSync(resolve(publicDir, "book-aliases.json"));

assert.equal(
  createHash("sha256").update(cBooks).digest("hex"),
  createHash("sha256").update(pBooks).digest("hex"),
  "books.json checksum parity",
);
assert.equal(
  createHash("sha256").update(cAliases).digest("hex"),
  createHash("sha256").update(pAliases).digest("hex"),
  "book-aliases.json checksum parity",
);

const manifest = JSON.parse(readFileSync(resolve(publicDir, "manifest.json"), "utf8")) as {
  version: number;
  checksum: string;
  files: Array<{ bookCount?: number }>;
};
assert.equal(manifest.version, 1);
assert.match(manifest.checksum, /^sha256:[a-f0-9]{64}$/);
const booksJson = JSON.parse(cBooks.toString("utf8")) as { books: unknown[] };
assert.equal(manifest.files[0]?.bookCount, booksJson.books.length);

const src = readFileSync(resolve(root, "src/lib/fiqh-books.ts"), "utf8");
assert.doesNotMatch(src, /import\s+\w+\s+from\s+["'][^"']*books\.json["']/, "no static JSON import in fiqh-books");
assert.match(src, /ensureFiqhCatalogLoaded/, "async catalog loader present");
assert.match(src, /\/data\/fiqh/, "loads from public data path");

console.log("fiqh-public-data-parity: ok", {
  books: booksJson.books.length,
  checksum: manifest.checksum.slice(0, 18) + "…",
});
