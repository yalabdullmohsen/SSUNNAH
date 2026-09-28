/**
 * ينشر content/fiqh → public/data/fiqh مع checksum (لا يغيّر النص).
 * node artifacts/majalis/scripts/publish-fiqh-public-data.mjs
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/data/fiqh");
mkdirSync(outDir, { recursive: true });
for (const f of ["books.json", "book-aliases.json"]) {
  const src = resolve(root, "content/fiqh", f);
  if (!existsSync(src)) throw new Error("missing " + src);
  copyFileSync(src, resolve(outDir, f));
}
const booksRaw = readFileSync(resolve(outDir, "books.json"));
const aliasesRaw = readFileSync(resolve(outDir, "book-aliases.json"));
const books = JSON.parse(booksRaw.toString("utf8"));
const aliases = JSON.parse(aliasesRaw.toString("utf8"));
const checksum = createHash("sha256").update(booksRaw).digest("hex");
const manifest = {
  version: 1,
  contentType: "fiqh.books",
  checksum: `sha256:${checksum}`,
  files: [
    { file: "books.json", bytes: booksRaw.length, bookCount: (books.books || []).length },
    { file: "book-aliases.json", bytes: aliasesRaw.length, aliasCount: (aliases.aliases || []).length },
  ],
  generatedAt: new Date().toISOString(),
  offlineEligible: true,
};
writeFileSync(resolve(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("publish-fiqh-public-data: ok", manifest.checksum, "books=", manifest.files[0].bookCount);
