/**
 * Inline CSS @import graph for gates. Vite does the same at bundle time.
 * Feature files must not import foundation. No cycles allowed.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const IMPORT_RE = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g;

export type CssGraph = {
  text: string;
  files: string[];
  circular: string[];
};

export function readCssGraph(absPath: string): CssGraph {
  const files: string[] = [];
  const circular: string[] = [];
  const seen = new Set<string>();

  const walk = (path: string): string => {
    if (seen.has(path)) {
      circular.push(path);
      return `/* CIRCULAR ${path} */\n`;
    }
    seen.add(path);
    files.push(path);
    const text = readFileSync(path, "utf8");
    return text.replace(IMPORT_RE, (_full, spec: string) => {
      const child = resolve(dirname(path), spec);
      return `/* >>> ${spec} */\n${walk(child)}/* <<< ${spec} */\n`;
    });
  };

  return { text: walk(absPath), files, circular };
}
