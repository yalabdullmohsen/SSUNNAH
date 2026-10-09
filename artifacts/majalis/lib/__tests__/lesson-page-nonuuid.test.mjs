// /lessons/:id لا يعيد 503 لأي مدخل غير صالح: عمود id من نوع UUID فمعرّف غير UUID
// كان يرمي 22P02 داخل findLesson فيتحوّل إلى 503. الخادم الوهمي يحاكي PostgREST.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const GOOD = "11111111-2222-4333-8444-555555555555";
const MISSING_UUID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  const send = (code, body) => {
    res.writeHead(code, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (!u.pathname.endsWith("/lessons")) return send(200, []);
  const id = (u.searchParams.get("id") || "").replace(/^eq\./, "");
  if (u.searchParams.has("id") && !UUID_RE.test(id)) {
    return send(400, { code: "22P02", message: `invalid input syntax for type uuid: "${id}"` });
  }
  const asObject = String(req.headers.accept || "").includes("vnd.pgrst.object");
  const row = { id: GOOD, title: "درس", status: "approved" };
  if (id === GOOD) return send(200, asObject ? row : [row]);
  if (!asObject) return send(200, []);
  send(406, { code: "PGRST116", message: "0 rows", details: "The result contains 0 rows" });
});
await new Promise((r) => server.listen(0, r));
process.env.SUPABASE_URL = `http://127.0.0.1:${server.address().port}`;
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

const distDir = fileURLToPath(new URL("../../dist/", import.meta.url));
const distIndex = `${distDir}index.html`;
const hadDist = existsSync(distIndex);
if (!hadDist) {
  mkdirSync(distDir, { recursive: true });
  writeFileSync(distIndex, "<!doctype html><html><head><title>x</title></head><body></body></html>");
}

const { default: handler } = await import("../api-handlers/lesson-page.js");

async function get(id) {
  const res = { statusCode: 0, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } };
  await handler({ method: "GET", url: `/api/lessons/${encodeURIComponent(id)}`, headers: {} }, res);
  return res.statusCode;
}

test("معرّفات غير صالحة لا تعيد 503 أبدًا", async () => {
  for (const id of ["1", "999999999", "nonexistent-slug", "لا-يوجد", "a'b", "x".repeat(300), MISSING_UUID]) {
    assert.equal(await get(id), 404, id);
  }
});

test("UUID صالح موجود → 200", async () => {
  assert.equal(await get(GOOD), 200);
});

test.after(() => {
  server.close();
  if (!hadDist) rmSync(distDir, { recursive: true, force: true });
});
