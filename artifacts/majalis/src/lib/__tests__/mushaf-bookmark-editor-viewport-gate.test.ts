/**
 * بوابة محرر فاصل/علامة المصحف — viewport + iOS keyboard + portal.
 * Run: node --import tsx src/lib/__tests__/mushaf-bookmark-editor-viewport-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const shell = read("src/features/mushaf-bookmarks/MushafBookmarkEditorShell.tsx");
const composer = read("src/features/mushaf-bookmarks/MushafBookmarkComposer.tsx");
const sheet = read("src/features/mushaf-bookmarks/MushafPageBookmarkSheet.tsx");
const css = read("src/styles/reader-bookmarks.css");
const hook = read("src/hooks/useInputSheetViewport.ts");
const metrics = read("src/hooks/input-sheet-viewport-metrics.ts");
const layout = read("src/features/mushaf-reader/useStableMushafLayout.ts");
const reader = read("src/features/mushaf-reader/NewMushafReader.tsx");
const rootCause = readRepo("docs/remediation/MUSHAF_BOOKMARK_EDITOR_LAYOUT_ROOT_CAUSE.md");
const deviceMatrix = readRepo("docs/qa/MUSHAF_BOOKMARK_EDITOR_DEVICE_MATRIX.md");

console.log("=== Portal + shell ===");
assert.match(shell, /createPortal/);
assert.match(shell, /document\.body/);
assert.match(shell, /MushafBookmarkEditorShell/);
assert.match(shell, /useInputSheetViewport/);
assert.match(shell, /lockDocumentScrollForSheet/);
assert.match(shell, /blurActiveTextField/);
assert.match(shell, /ensureFieldVisibleInSheet/);
assert.match(shell, /footerRef/);
assert.match(shell, /Escape/);
assert.match(shell, /popstate/);
assert.match(composer, /MushafBookmarkEditorShell/);
assert.match(sheet, /MushafBookmarkEditorShell/);
assert.match(composer, /testId="mushaf-bookmark-composer"/);
assert.match(sheet, /testId="mushaf-page-bookmark-sheet"/);
assert.match(shell, /data-testid=\{testId\}/);
assert.match(composer, /إلغاء/);
assert.match(sheet, /إلغاء|رجوع/);

console.log("=== CSS viewport + sticky footer + 16px inputs (no iOS zoom) ===");
assert.match(css, /\.rb-editor-shell\b/);
assert.match(css, /--rb-vv-height/);
assert.match(css, /100dvh|100svh/);
/* لا اعتماد على وحدة vh ثابتة في خصائص الغلاف (تجنّب ذكر الرمز كاملًا هنا لأجل بوابة ios-edge) */
const bannedVh = new RegExp(
  String.raw`(?:block-size|height|max-block-size|min-height)\s*:\s*[^;\n]*\b100` + "vh" + String.raw`\b`,
);
assert.doesNotMatch(css, bannedVh);
assert.match(css, /var\(--inset-(top|bottom|left|right)/);
assert.doesNotMatch(css, /env\(\s*safe-area-inset-/);
assert.match(css, /max-inline-size/);
assert.match(css, /font-size:\s*16px/);
assert.match(css, /\.rb-editor-shell__footer[\s\S]*position:\s*sticky/);
assert.match(css, /\.rb-editor-shell__footer[\s\S]*background:\s*inherit/);
assert.match(css, /\.rb-editor-shell__panel[\s\S]*max-block-size:\s*100%/);
assert.match(css, /\.rb-editor-shell__panel[\s\S]*grid-template-rows:\s*auto minmax\(0,\s*1fr\) auto/);
assert.match(css, /overflow-x:\s*clip/);
assert.doesNotMatch(css, /transform:\s*scale\(/);
assert.doesNotMatch(css, /user-scalable\s*=\s*no/);
/* لا تعتمد اللوحة على absolute داخل .nm-root */
assert.doesNotMatch(css, /\.rb-composer\s*\{[^}]*position:\s*absolute/s);
assert.doesNotMatch(css, /\.rb-page-sheet\s*\{[^}]*position:\s*absolute/s);

console.log("=== Metrics: pure VV measure + fixtures ===");
assert.match(metrics, /measureInputSheetViewport/);
assert.match(metrics, /BOOKMARK_EDITOR_VIEWPORT_FIXTURES/);
assert.match(metrics, /375/);
assert.match(metrics, /390/);
assert.match(metrics, /844/);
assert.match(metrics, /430/);
assert.match(metrics, /932/);
assert.match(metrics, /restingInnerHeight/);
assert.match(metrics, /overlayMode/);
assert.doesNotMatch(metrics, /innerHeight\s*\|\|\s*100|100\s*\*\s*window/);

console.log("=== Hook: VV + Capacitor bind, inline geometry, cleanup ===");
assert.match(hook, /visualViewport/);
assert.match(hook, /measureInputSheetViewport/);
assert.match(hook, /--rb-vv-height/);
assert.match(hook, /--rb-keyboard-inset/);
assert.match(hook, /el\.style\.top/);
assert.match(hook, /el\.style\.height/);
assert.match(hook, /addEventListener\("resize"/);
assert.match(hook, /addEventListener\("scroll"/);
assert.match(hook, /keyboardWillShow|keyboardDidShow/);
assert.match(hook, /removeEventListener/);
assert.match(hook, /removeProperty\("top"\)/);
assert.match(hook, /removeProperty\("height"\)/);
assert.match(hook, /ensureFieldVisibleInSheet/);
assert.match(hook, /scrollIntoView/);
assert.match(hook, /MUSHAF_BOOKMARK_EDITOR_OPEN_ATTR/);
assert.doesNotMatch(hook, /\buseState\b/);
assert.doesNotMatch(hook, /\bsetOffset\b|\bsetKeyboard\b/);

console.log("=== Freeze mushaf geometry while editor open ===");
assert.match(layout, /MUSHAF_BOOKMARK_EDITOR_OPEN_ATTR/);
assert.match(layout, /hasAttribute\(MUSHAF_BOOKMARK_EDITOR_OPEN_ATTR\)/);
assert.match(reader, /\.rb-editor-shell/);
assert.match(reader, /\.rb-page-sheet/);

console.log("=== Docs ===");
assert.match(rootCause, /Confirmed causes|السبب|C1/);
assert.match(rootCause, /0\.75rem|16px|iOS/);
assert.match(deviceMatrix, /DEVICE_REQUIRED/);
assert.match(deviceMatrix, /iPhone/);

console.log("=== No Quran / mapping mutation in editor files ===");
assert.doesNotMatch(composer, /pageMapping|PAGE_MAP|qpc-v2-pages/);
assert.doesNotMatch(sheet, /pageMapping|PAGE_MAP|qpc-v2-pages/);
assert.doesNotMatch(shell, /pageMapping|PAGE_MAP/);

console.log("mushaf-bookmark-editor-viewport-gate.test.ts: ok");
