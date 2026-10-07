import { chromium } from "@playwright/test";
const [route, w, h] = [process.argv[2], +process.argv[3], +process.argv[4]];
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.addInitScript(() => localStorage.setItem("majalis-onboarding-done", "1"));
await p.addInitScript(() => { if (location.search.includes("ts=2")) document.addEventListener("DOMContentLoaded", () => document.documentElement.style.setProperty("font-size","200%","important")); });
await p.goto("http://localhost:4260" + route); await p.waitForTimeout(4000);
console.log(await p.evaluate(new Function(process.argv[5])));
await b.close();
