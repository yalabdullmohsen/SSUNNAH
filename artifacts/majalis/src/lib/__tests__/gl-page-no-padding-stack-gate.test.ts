import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(process.cwd(), "src/styles/pages/glossary.css"), "utf8");
assert.match(
  css,
  /\.topic-page__body > \.gl-page\.mj-page,\s*\.gl-page\.mj-page > \.gl-container\s*\{\s*padding-inline:\s*0;/,
  "glossary.css must zero gl-page/gl-container inline padding inside the topic-page shell",
);
console.log("gl-page-no-padding-stack-gate.test.ts: ok");
