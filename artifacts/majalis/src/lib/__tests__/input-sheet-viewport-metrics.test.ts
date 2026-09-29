/**
 * مقاييس VisualViewport لمحرر فاصل/علامة المصحف — fixtures إلزامية.
 * Run: node --import tsx src/lib/__tests__/input-sheet-viewport-metrics.test.ts
 */
import assert from "node:assert/strict";
import {
  BOOKMARK_EDITOR_VIEWPORT_FIXTURES,
  MIN_SHEET_HEIGHT_ABOVE_KEYBOARD,
  assertSheetFitsVisibleViewport,
  measureInputSheetViewport,
} from "@/hooks/input-sheet-viewport-metrics";

console.log("=== Fixtures inventory ===");
assert.equal(BOOKMARK_EDITOR_VIEWPORT_FIXTURES.length, 3);
assert.deepEqual(
  BOOKMARK_EDITOR_VIEWPORT_FIXTURES.map((f) => [f.width, f.height]),
  [
    [375, 667],
    [390, 844],
    [430, 932],
  ],
);

console.log("=== VV shrink (Safari / resize visual) ===");
for (const fix of BOOKMARK_EDITOR_VIEWPORT_FIXTURES) {
  const visibleH = fix.height - fix.keyboard;
  const metrics = measureInputSheetViewport({
    innerHeight: fix.height,
    visualViewport: { height: visibleH, offsetTop: 0 },
    capacitorKeyboardHeight: 0,
    restingInnerHeight: fix.height,
  });
  assert.equal(metrics.overlayMode, false, `${fix.name}: not overlay when VV shrinks`);
  assert.equal(metrics.height, visibleH, `${fix.name}: height = VV`);
  assert.equal(metrics.offsetTop, 0, `${fix.name}: offsetTop`);
  assert.equal(metrics.keyboardInset, fix.keyboard, `${fix.name}: keyboard inset = gap`);
  assert.ok(
    assertSheetFitsVisibleViewport(metrics, 0, visibleH),
    `${fix.name}: sheet inside VV`,
  );
  assert.ok(metrics.height >= MIN_SHEET_HEIGHT_ABOVE_KEYBOARD, `${fix.name}: min height`);
}

console.log("=== VV shrink with offsetTop (iOS scroll) ===");
{
  const fix = BOOKMARK_EDITOR_VIEWPORT_FIXTURES[1];
  const visibleH = fix.height - fix.keyboard;
  const offsetTop = 40;
  const metrics = measureInputSheetViewport({
    innerHeight: fix.height,
    visualViewport: { height: visibleH, offsetTop },
    restingInnerHeight: fix.height,
  });
  assert.equal(metrics.offsetTop, offsetTop);
  assert.equal(metrics.height, visibleH);
  assert.ok(
    assertSheetFitsVisibleViewport(metrics, offsetTop, offsetTop + visibleH),
    "sheet tracks VV scroll offset",
  );
}

console.log("=== Overlay (Capacitor keyboard, VV does not shrink) ===");
for (const fix of BOOKMARK_EDITOR_VIEWPORT_FIXTURES) {
  const metrics = measureInputSheetViewport({
    innerHeight: fix.height,
    visualViewport: { height: fix.height, offsetTop: 0 },
    capacitorKeyboardHeight: fix.keyboard,
    restingInnerHeight: fix.height,
  });
  assert.equal(metrics.overlayMode, true, `${fix.name}: overlay`);
  assert.equal(metrics.height, fix.height - fix.keyboard, `${fix.name}: height above kb`);
  assert.equal(metrics.offsetTop, 0);
  assert.equal(metrics.keyboardInset, fix.keyboard);
  assert.ok(
    assertSheetFitsVisibleViewport(metrics, 0, fix.height - fix.keyboard),
    `${fix.name}: overlay sheet fits`,
  );
}

console.log("=== resize=body (innerHeight already reduced — no double subtract) ===");
for (const fix of BOOKMARK_EDITOR_VIEWPORT_FIXTURES) {
  const resized = fix.height - fix.keyboard;
  const metrics = measureInputSheetViewport({
    innerHeight: resized,
    visualViewport: { height: resized, offsetTop: 0 },
    capacitorKeyboardHeight: fix.keyboard,
    restingInnerHeight: fix.height,
  });
  assert.equal(metrics.overlayMode, false, `${fix.name}: not overlay after body resize`);
  assert.equal(metrics.height, resized, `${fix.name}: use resized innerHeight`);
  assert.ok(metrics.height > fix.keyboard, `${fix.name}: not double-subtracted`);
}

console.log("=== No keyboard / full viewport ===");
{
  const fix = BOOKMARK_EDITOR_VIEWPORT_FIXTURES[0];
  const metrics = measureInputSheetViewport({
    innerHeight: fix.height,
    visualViewport: { height: fix.height, offsetTop: 0 },
    capacitorKeyboardHeight: 0,
    restingInnerHeight: fix.height,
  });
  assert.equal(metrics.overlayMode, false);
  assert.equal(metrics.height, fix.height);
  assert.equal(metrics.keyboardInset, 0);
}

console.log("=== Fallback without visualViewport ===");
{
  const fix = BOOKMARK_EDITOR_VIEWPORT_FIXTURES[2];
  const metrics = measureInputSheetViewport({
    innerHeight: fix.height,
    visualViewport: null,
    capacitorKeyboardHeight: fix.keyboard,
    restingInnerHeight: fix.height,
  });
  assert.equal(metrics.overlayMode, true);
  assert.equal(metrics.height, fix.height - fix.keyboard);
}

console.log("input-sheet-viewport-metrics.test.ts: ok");
