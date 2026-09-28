/**
 * عقد Method Guard لمسار حذف الحساب: 405 للطرق غير المدعومة قبل المصادقة.
 * node --import tsx src/lib/__tests__/account-delete-method-guard.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const dispatchSrc = readFileSync(resolve(root, "lib/api-dispatch.mjs"), "utf8");

assert.match(dispatchSrc, /prefix:\s*"\/api\/account\/delete"/);
assert.match(dispatchSrc, /methods:\s*\[["']POST["'],\s*["']DELETE["'],\s*["']OPTIONS["']\]/);
assert.match(dispatchSrc, /allowGet:\s*false/);

const { matchApiRoute } = await import(resolve(root, "lib/api-dispatch.mjs"));
const { enforceApiSecurity } = await import(resolve(root, "lib/api-security-guard.mjs"));

const route = matchApiRoute("/api/account/delete");
assert.ok(route, "مسار الحذف مسجّل");
assert.deepEqual(route.methods, ["POST", "DELETE", "OPTIONS"]);
assert.equal(route.allowGet, false);

function mockRes() {
  const headers: Record<string, string> = {};
  const res = {
    statusCode: 200,
    headersSent: false,
    writableEnded: false,
    setHeader(k: string, v: string) {
      headers[String(k).toLowerCase()] = String(v);
    },
    getHeader(k: string) {
      return headers[String(k).toLowerCase()];
    },
    end(body?: string) {
      res.writableEnded = true;
      res.headersSent = true;
      res.body = body;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.headersSent = true;
      res.writableEnded = true;
      res.payload = payload;
      return res;
    },
    body: undefined as string | undefined,
    payload: undefined as unknown,
  };
  return res;
}

async function runGate(method: string) {
  const res = mockRes();
  const req = {
    method,
    url: "/api/account/delete",
    headers: {},
  };
  const gate = await enforceApiSecurity(req, res, route);
  return { gate, res, req };
}

{
  const { gate, res } = await runGate("GET");
  assert.equal(gate.ok, false, "GET لا يمرّ للحارس بعد Method Guard");
  assert.equal(res.statusCode, 405, "GET → 405 قبل المصادقة");
  const allow = String(res.getHeader("Allow") || "");
  assert.match(allow, /POST/);
  assert.match(allow, /DELETE/);
  assert.doesNotMatch(allow, /\bGET\b/);
}

{
  const { gate, res } = await runGate("HEAD");
  assert.equal(gate.ok, false);
  assert.equal(res.statusCode, 405, "HEAD → 405");
}

{
  const { gate, res } = await runGate("POST");
  assert.equal(gate.ok, false, "POST بلا جلسة لا يمر");
  assert.equal(res.statusCode, 401, "POST بلا JWT → 401");
}

{
  const { gate, res } = await runGate("DELETE");
  assert.equal(gate.ok, false);
  assert.equal(res.statusCode, 401, "DELETE بلا JWT → 401");
}

{
  const { gate, res } = await runGate("OPTIONS");
  assert.equal(gate.ok, false);
  assert.equal(res.statusCode, 204, "OPTIONS → 204");
}

console.log(
  JSON.stringify({
    proven: [
      "route methods restricted to POST/DELETE/OPTIONS",
      "GET/HEAD → 405 + Allow before auth",
      "POST/DELETE without auth → 401",
      "OPTIONS → 204",
    ],
  }),
);
console.log("account-delete-method-guard: OK");
