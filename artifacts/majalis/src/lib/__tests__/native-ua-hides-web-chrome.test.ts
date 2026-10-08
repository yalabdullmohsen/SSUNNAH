/**
 * user-agent فيه SunnahNative/1 → يختفي شريط التبويب السفلي وزر الرجوع العائم؛ وبدونه يبقيان.
 * تشغيل: node --import tsx src/lib/__tests__/native-ua-hides-web-chrome.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import { hasSunnahNativeMarker } from "@/lib/native-platform";

/* استيراد CSS غير مدعوم تحت node → محمّل يحوّله إلى وحدة فارغة قبل تحميل المكوّنات */
register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function load(u,c,n){if(u.endsWith(".css"))return{format:"module",source:"export default {}",shortCircuit:true};return n(u,c)}`,
    ),
);
(globalThis as { React?: unknown }).React = React; /* tsx يترجم JSX الكلاسيكي */
const { BottomNavBar } = await import("@/components/BottomNavBar");
const { GlobalBackControlHost } = await import("@/components/FloatingBackButton");

const WEB_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1";
const NATIVE_UA = `${WEB_UA} SunnahNative/1`;

assert.equal(hasSunnahNativeMarker(NATIVE_UA), true);
assert.equal(hasSunnahNativeMarker(WEB_UA), false);
assert.equal(hasSunnahNativeMarker(""), false);

const setUA = (ua: string) =>
  Object.defineProperty(globalThis, "navigator", { value: { userAgent: ua }, configurable: true });
const render = (el: unknown, path: string) =>
  renderToStaticMarkup(createElement(Router, { ssrPath: path }, el as never));

setUA(WEB_UA);
assert.match(render(createElement(BottomNavBar), "/lessons"), /<nav/, "الشريط يظهر بلا العلامة");
assert.match(render(createElement(GlobalBackControlHost), "/fiqh"), /global-back-control-host/, "زر الرجوع يظهر بلا العلامة");

setUA(NATIVE_UA);
assert.equal(render(createElement(BottomNavBar), "/lessons"), "", "الشريط مخفي مع العلامة");
assert.equal(render(createElement(GlobalBackControlHost), "/fiqh"), "", "زر الرجوع مخفي مع العلامة");

const here = dirname(fileURLToPath(import.meta.url));
assert.match(readFileSync(resolve(here, "../../components/BottomNavBar.tsx"), "utf8"), /hasSunnahNativeMarker\(\)/);

console.log("native-ua-hides-web-chrome.test.ts: ok");
