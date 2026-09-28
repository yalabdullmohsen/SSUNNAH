/**
 * Node-only sync reader for fiqh SSOT / public mirror.
 * Vite ي stubّه في المتصفح — لا يستورد في entry graph مباشرة من صفحات.
 */
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

export function readFiqhJsonSync(relPath: string): unknown | null {
  const candidates = [
    resolve(process.cwd(), relPath),
    resolve(process.cwd(), "artifacts/majalis", relPath),
    resolve(process.cwd(), "public/data/fiqh", basename(relPath)),
    resolve(process.cwd(), "artifacts/majalis/public/data/fiqh", basename(relPath)),
  ];
  for (const file of candidates) {
    try {
      return JSON.parse(readFileSync(file, "utf8")) as unknown;
    } catch {
      /* next */
    }
  }
  return null;
}
