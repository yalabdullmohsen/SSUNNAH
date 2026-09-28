/**
 * اختبارات إساءة استخدام لمسارات الكتابة العامة / التكلفة.
 * node artifacts/majalis/lib/__tests__/api-security-abuse.test.mjs
 */
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { dispatchApiRequest } from "../api-dispatch.mjs";

function mockRes() {
  const res = new EventEmitter();
  res.statusCode = 200;
  res.headers = {};
  res.headersSent = false;
  res.writableEnded = false;
  res.setHeader = (k, v) => {
    res.headers[k.toLowerCase()] = v;
  };
  res.getHeader = (k) => res.headers[String(k).toLowerCase()];
  res.end = (body) => {
    res.writableEnded = true;
    res.headersSent = true;
    res.body = body;
  };
  return res;
}

function mockReq({ method = "POST", url = "/api/submissions", headers = {}, body }) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = {
    "content-type": "application/json",
    origin: "https://ssunnah.app",
    ...headers,
  };
  if (body !== undefined) {
    req.body = body;
  }
  return req;
}

async function call(opts) {
  const req = mockReq(opts);
  const res = mockRes();
  await dispatchApiRequest(req, res);
  let json = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch {
    json = null;
  }
  return { status: res.statusCode, json, headers: res.headers };
}

// Origin غير مسموح
{
  const r = await call({
    url: "/api/submissions",
    headers: { origin: "https://evil.example" },
    body: { type: "درس", title: "عنوان كافٍ", content: "محتوى كافٍ" },
  });
  assert.equal(r.status, 403);
}

// حقول انتحال على push
{
  const r = await call({
    url: "/api/push/subscribe",
    body: {
      endpoint: "https://fcm.googleapis.com/fcm/send/x",
      keys: { p256dh: "a".repeat(20), auth: "b".repeat(20) },
      userId: "attacker",
    },
  });
  assert.equal(r.status, 400);
}

// test-anthropic في production
{
  const prev = process.env.NODE_ENV;
  const prevV = process.env.VERCEL_ENV;
  process.env.NODE_ENV = "production";
  process.env.VERCEL_ENV = "production";
  const r = await call({ url: "/api/test-anthropic", method: "GET", body: undefined });
  assert.equal(r.status, 404);
  process.env.NODE_ENV = prev;
  process.env.VERCEL_ENV = prevV;
}

// AI kill switch
{
  process.env.AI_EMERGENCY_KILL_SWITCH = "1";
  const r = await call({
    url: "/api/assistant",
    body: { message: "ما حكم الصلاة؟" },
  });
  assert.ok(r.status === 503 || r.json?.code === "ai_disabled");
  delete process.env.AI_EMERGENCY_KILL_SWITCH;
}

// cost override headers/body
{
  const r = await call({
    url: "/api/assistant",
    body: { message: "سؤال", model: "claude-opus-evil", max_tokens: 999999 },
  });
  assert.equal(r.status, 400);
  assert.equal(r.json?.code, "cost_override_forbidden");
}

// method غير مدعوم → 405 + Allow
{
  const r = await call({ url: "/api/submissions", method: "PUT", body: {} });
  assert.equal(r.status, 405);
}

// مسار غير مصنّف مستحيل عبر الجدول — 404 لمسار مجهول
{
  const r = await call({ url: "/api/totally-unknown-route-xyz", method: "GET" });
  assert.equal(r.status, 404);
}

// content-type خاطئ
{
  const r = await call({
    url: "/api/submissions",
    headers: { "content-type": "text/html" },
    body: { type: "درس", title: "عنوان كافٍ", content: "محتوى كافٍ" },
  });
  assert.equal(r.status, 415);
}

console.log("api-security-abuse.test.mjs: ok");
