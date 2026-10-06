/** مساعد اختبارات: index.html بعد حقن font-system.css مكان العلامة (كما يفعل inlineFontSystemPlugin). */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expandFontSystem } from "../../../scripts/inline-font-system.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

export function renderedIndexHtml(): string {
  return expandFontSystem(readFileSync(resolve(root, "index.html"), "utf8")) as string;
}

export function fontSystemCss(): string {
  return (
    readFileSync(resolve(root, "src/styles/font-system.css"), "utf8") +
    readFileSync(resolve(root, "src/styles/font-faces-deferred.css"), "utf8")
  );
}
