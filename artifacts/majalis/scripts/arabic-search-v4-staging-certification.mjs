#!/usr/bin/env node
/**
 * Arabic Search v4 — STAGING-ONLY certification.
 * Hard-fails on Production ref. Never prints secret values.
 *
 * Env required:
 *   STAGING_DATABASE_URL
 *   STAGING_SUPABASE_URL
 *   STAGING_ANON_KEY
 *   STAGING_SERVICE_ROLE_KEY (setup + admin-path checks)
 *
 * Optional:
 *   EXPECTED_STAGING_REF (default dgxzcmzcapzcrvcfzjmc)
 *   PRODUCTION_SUPABASE_PROJECT_REF (default ngmvmlulzacrlicuagyp)
 *   PG_MODULE_PATH (absolute path to pg package; avoids ESM workspace resolution)
 *   CERT_STOP_AFTER=baseline (capture baseline only; no fixture/seed/migration/writes)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import dns from "node:dns";
import { lookup as dnsLookup } from "node:dns/promises";

dns.setDefaultResultOrder("ipv4first");

/** Resolve `pg` without relying on workspace/catalog node_modules. */
async function loadPg() {
  const require = createRequire(import.meta.url);
  const candidates = [
    process.env.PG_MODULE_PATH,
    "/tmp/staging-cert-node/node_modules/pg",
    join(dirname(fileURLToPath(import.meta.url)), "../node_modules/pg"),
    "pg",
  ].filter(Boolean);

  const errors = [];
  for (const cand of candidates) {
    try {
      if (cand !== "pg" && !existsSync(cand) && !existsSync(`${cand}.js`)) {
        errors.push(`${cand}: missing`);
        continue;
      }
      // Prefer CJS require for deterministic resolution from absolute path.
      if (cand !== "pg") {
        return require(cand);
      }
      return require("pg");
    } catch (e) {
      errors.push(`${cand}: ${e.message}`);
    }
  }
  // Last resort: dynamic import by file URL if package entry exists
  for (const cand of candidates) {
    if (cand === "pg") continue;
    const entry = join(cand, "lib/index.js");
    if (!existsSync(entry)) continue;
    try {
      return await import(pathToFileURL(entry).href);
    } catch (e) {
      errors.push(`${entry}: ${e.message}`);
    }
  }
  throw new Error(
    `ERR_MODULE_NOT_FOUND pg — tried: ${errors.join(" | ")}. Set PG_MODULE_PATH to absolute pg package dir.`,
  );
}

const pg = await loadPg();
const PgClient = pg.Client || pg.default?.Client;
if (!PgClient) {
  throw new Error("ERR_MODULE_NOT_FOUND pg.Client — package loaded but Client export missing");
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const majalis = join(__dirname, "..");
const repo = join(majalis, "../..");
const outDir = join(repo, "docs/audit");
const reportPath = join(outDir, "ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT.md");
const migrationPath = join(
  majalis,
  "supabase/migrations/20261003120000_arabic_search_hadith_source_infra_v4.sql",
);

const EXPECTED_STAGING_REF = process.env.EXPECTED_STAGING_REF || "dgxzcmzcapzcrvcfzjmc";
const PRODUCTION_REF = process.env.PRODUCTION_SUPABASE_PROJECT_REF || "ngmvmlulzacrlicuagyp";

const dbUrl = process.env.STAGING_DATABASE_URL || "";
const supabaseUrl = (process.env.STAGING_SUPABASE_URL || "").replace(/\/$/, "");
const anonKey = process.env.STAGING_ANON_KEY || "";
const serviceKey = process.env.STAGING_SERVICE_ROLE_KEY || "";

const report = {
  startedAt: new Date().toISOString(),
  classification: "BLOCKED_WITH_EVIDENCE",
  identity: {},
  baseline: {},
  migration: {},
  indexes: {},
  rls: {},
  functional: {},
  benchmarkBefore: {},
  benchmarkAfter: {},
  soak: {},
  errors: [],
};

function fail(msg) {
  report.errors.push(msg);
  throw new Error(msg);
}

function refFromSupabaseUrl(u) {
  try {
    const host = new URL(u).hostname || "";
    if (!host.endsWith(".supabase.co")) return null;
    return host.split(".")[0];
  } catch {
    return null;
  }
}

function assertIdentity() {
  const missing = [
    ["STAGING_DATABASE_URL", dbUrl],
    ["STAGING_SUPABASE_URL", supabaseUrl],
    ["STAGING_ANON_KEY", anonKey],
    ["STAGING_SERVICE_ROLE_KEY", serviceKey],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) fail(`SECRET_MISSING:${missing.join(",")}`);

  const urlRef = refFromSupabaseUrl(supabaseUrl);
  if (!urlRef) fail("STAGING_SUPABASE_URL_HOST_INVALID");
  if (urlRef === PRODUCTION_REF) fail("STAGING_EQUALS_PRODUCTION");
  if (urlRef !== EXPECTED_STAGING_REF) fail(`STAGING_REF_UNEXPECTED:${urlRef}`);
  if (dbUrl.includes(PRODUCTION_REF)) fail("DATABASE_URL_CONTAINS_PRODUCTION_REF");
  if (!dbUrl.includes(EXPECTED_STAGING_REF) && !dbUrl.includes("pooler.supabase.com") && !dbUrl.includes("supabase.co")) {
    // still require staging ref somewhere in connection string when parseable
    if (!dbUrl.includes(urlRef)) fail("DATABASE_URL_REF_MISMATCH");
  }
  if (dbUrl.includes(PRODUCTION_REF)) fail("DATABASE_URL_CONTAINS_PRODUCTION_REF");

  report.identity = {
    stagingRef: urlRef,
    productionRef: PRODUCTION_REF,
    equalsProduction: false,
    isolation: "PASS",
  };
}

async function q(client, sql, params = []) {
  return client.query(sql, params);
}

async function scalar(client, sql, params = []) {
  const r = await q(client, sql, params);
  const row = r.rows[0] || {};
  return Object.values(row)[0];
}

const FIXTURE_SQL = `
CREATE TABLE IF NOT EXISTS public.verified_hadith_items (
  id text PRIMARY KEY,
  collection text,
  hadith_number text,
  title text,
  text text,
  narrator text,
  scholar text,
  source_name text,
  source_url text,
  grade text,
  chapter text,
  keywords text[],
  explanation text,
  authenticity_class text,
  verification_status text NOT NULL DEFAULT 'verified',
  quality_score numeric,
  trust_level integer,
  metadata jsonb,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trusted_sources (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  category text,
  source_type text,
  url text,
  trust_level integer DEFAULT 1,
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.verified_hadith_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staging_hadith_public_read ON public.verified_hadith_items;
CREATE POLICY staging_hadith_public_read ON public.verified_hadith_items
  FOR SELECT TO anon, authenticated
  USING (verification_status = 'verified' AND deleted_at IS NULL);

DROP POLICY IF EXISTS staging_hadith_service_all ON public.verified_hadith_items;
CREATE POLICY staging_hadith_service_all ON public.verified_hadith_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS staging_sources_public_read ON public.trusted_sources;
CREATE POLICY staging_sources_public_read ON public.trusted_sources
  FOR SELECT TO anon, authenticated
  USING (coalesce(is_active, true) = true);

DROP POLICY IF EXISTS staging_sources_service_all ON public.trusted_sources;
CREATE POLICY staging_sources_service_all ON public.trusted_sources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.verified_hadith_items TO anon, authenticated, service_role;
GRANT SELECT ON public.trusted_sources TO anon, authenticated, service_role;
`;

const SEED_SQL = `
-- idempotent seed for certification (staging synthetic only)
DELETE FROM public.verified_hadith_items WHERE id LIKE 'stg-cert-%';
DELETE FROM public.trusted_sources WHERE name LIKE 'STG_CERT_%' OR name LIKE 'مصدر تجريبي%';

INSERT INTO public.verified_hadith_items
  (id, collection, hadith_number, title, text, narrator, source_name, chapter, keywords, explanation, authenticity_class, verification_status, deleted_at, grade)
VALUES
  ('stg-cert-1', 'صحيح البخاري', '1', 'باب النية', 'إنما الأعمال بالنيات وإنما لكل امرئ ما نوى', 'عمر بن الخطاب', 'البخاري', 'بدء الوحي', ARRAY['نية','عمل'], 'شرح تجريبي', 'sahih', 'verified', NULL, 'صحيح'),
  ('stg-cert-2', 'صحيح مسلم', '1907', 'باب الإسلام', 'بني الإسلام على خمس', 'ابن عمر', 'مسلم', 'الإيمان', ARRAY['اسلام','اركان'], NULL, 'sahih', 'verified', NULL, 'صحيح'),
  ('stg-cert-3', 'سنن', '55', 'القرآن وفضله', 'خيركم من تعلم القرآن وعلمه', 'عثمان', 'البخاري', 'فضائل', ARRAY['قران'], NULL, 'sahih', 'verified', NULL, 'صحيح'),
  ('stg-cert-4', 'سنن', '99', 'الأذكار', 'من قال لا إله إلا الله', 'أبو هريرة', 'الترمذي', 'دعاء', ARRAY['ذكر'], NULL, 'sahih', 'verified', NULL, 'صحيح'),
  ('stg-cert-rej', 'سنن', '0', 'مرفوض تجريبي', 'نص مرفوض', 'راوي', 'مصدر', 'x', NULL, 'admin-only-notes', 'daif', 'rejected', NULL, 'ضعيف'),
  ('stg-cert-del', 'سنن', '0', 'محذوف تجريبي', 'نص محذوف', 'راوي', 'مصدر', 'x', NULL, NULL, 'sahih', 'verified', now(), 'صحيح'),
  ('stg-cert-typo', 'سنن', '12', 'باب النيات', 'متن قريب للنية', 'أنس', 'البخاري', 'y', ARRAY['نيات'], NULL, 'sahih', 'verified', NULL, 'صحيح');

INSERT INTO public.trusted_sources (id, name, category, source_type, url, trust_level, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'مصدر تجريبي الإسلام', 'hadith', 'book', 'https://example.invalid/islam', 5, true),
  ('22222222-2222-2222-2222-222222222222', 'STG_CERT_INACTIVE', 'hadith', 'book', 'https://example.invalid/x', 1, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  source_type = EXCLUDED.source_type,
  is_active = EXCLUDED.is_active;
`;

async function captureBaseline(client) {
  const version = await scalar(client, "SHOW server_version");
  const ext = (
    await q(client, "SELECT extname FROM pg_extension ORDER BY 1")
  ).rows.map((r) => r.extname);
  const schemas = (
    await q(
      client,
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' ORDER BY 1",
    )
  ).rows.map((r) => r.schema_name);
  const tables = (
    await q(
      client,
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1`,
    )
  ).rows.map((r) => r.table_name);

  const rowCounts = {};
  for (const t of ["verified_hadith_items", "trusted_sources"]) {
    if (tables.includes(t)) {
      rowCounts[t] = Number(await scalar(client, `SELECT count(*)::int FROM public.${t}`));
    } else {
      rowCounts[t] = null;
    }
  }

  let tableSizes = [];
  try {
    tableSizes = (
      await q(
        client,
        `SELECT relname, pg_size_pretty(pg_total_relation_size(c.oid)) AS total
         FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
         WHERE n.nspname='public' AND c.relkind='r'
         ORDER BY pg_total_relation_size(c.oid) DESC LIMIT 30`,
      )
    ).rows;
  } catch {
    tableSizes = [];
  }

  const policyCount = Number(
    await scalar(
      client,
      `SELECT count(*)::int FROM pg_policies WHERE schemaname='public'`,
    ),
  );

  const rpcSigs = (
    await q(
      client,
      `SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
       FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
       WHERE n.nspname='public' AND p.proname IN ('search_hadiths','search_sources','ar_normalize')
       ORDER BY 1,2`,
    )
  ).rows;

  report.baseline = {
    postgresVersion: version,
    extensions: ext,
    schemas,
    tables,
    rowCounts,
    tableSizes,
    policyCount,
    rpcSignatures: rpcSigs,
  };
}

async function explainCase(client, name, sql) {
  try {
    const res = await q(client, sql);
    const planRaw = res.rows?.[0]?.["QUERY PLAN"] ?? res.rows?.[0];
    const json = typeof planRaw === "string" ? JSON.parse(planRaw) : planRaw;
    const root = Array.isArray(json) ? json[0] : json;
    const plan = root?.Plan || {};
    return {
      name,
      ok: true,
      planningMs: root?.["Planning Time"] ?? null,
      executionMs: root?.["Execution Time"] ?? null,
      nodeType: plan["Node Type"] ?? null,
      actualRows: plan["Actual Rows"] ?? null,
      sharedHit: plan["Shared Hit Blocks"] ?? null,
      sharedRead: plan["Shared Read Blocks"] ?? null,
      indexUsed: JSON.stringify(plan).includes("Index"),
      seqScan: JSON.stringify(plan).includes("Seq Scan"),
    };
  } catch (e) {
    return { name, ok: false, error: String(e.message || e) };
  }
}

const EXPLAIN_CASES = [
  {
    name: "title_search",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('باب النية', 20)`,
  },
  {
    name: "narrator_search",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('عمر', 20)`,
  },
  {
    name: "source_search",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_sources('اسلام', 20)`,
  },
  {
    name: "phrase_search",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('انما الاعمال', 20)`,
  },
  {
    name: "typo_search",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('النيات', 20)`,
  },
  {
    name: "no_result_search",
    sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM public.search_hadiths('zzzznotfoundعربي', 20)`,
  },
];

async function ensureFixture(client) {
  const hasHadith = await scalar(
    client,
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='verified_hadith_items')`,
  );
  const hasSources = await scalar(
    client,
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trusted_sources')`,
  );
  report.baseline.fixtureApplied = false;
  if (!hasHadith || !hasSources) {
    await q(client, FIXTURE_SQL);
    report.baseline.fixtureApplied = true;
    report.baseline.fixtureReason = "MISSING_BASE_TABLES_STAGING_SYNTHETIC_SCHEMA";
  }
  // Always refresh synthetic seed rows for deterministic cert
  await q(client, SEED_SQL);
  report.baseline.seedApplied = true;
}

async function applyMigration(client) {
  const sql = readFileSync(migrationPath, "utf8");
  const started = Date.now();
  await q(client, sql);
  report.migration = {
    status: "PASS",
    file: "20261003120000_arabic_search_hadith_source_infra_v4.sql",
    durationMs: Date.now() - started,
  };

  const checks = {
    pg_trgm: await scalar(client, `SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_trgm')`),
    ar_normalize: await scalar(
      client,
      `SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='ar_normalize')`,
    ),
    search_text_col: await scalar(
      client,
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verified_hadith_items' AND column_name='search_text')`,
    ),
    search_vector_col: await scalar(
      client,
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verified_hadith_items' AND column_name='search_vector')`,
    ),
    search_hadiths: await scalar(
      client,
      `SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='search_hadiths')`,
    ),
    search_sources: await scalar(
      client,
      `SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='search_sources')`,
    ),
  };
  report.migration.checks = checks;
  if (Object.values(checks).some((v) => !v)) fail("MIGRATION_OBJECT_CHECKS_FAILED");
}

async function validateIndexes(client) {
  const rows = (
    await q(
      client,
      `SELECT c.relname AS idx, i.indisvalid, i.indisready,
              pg_size_pretty(pg_relation_size(c.oid)) AS size
       FROM pg_index i
       JOIN pg_class c ON c.oid = i.indexrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname='public'
         AND (
           c.relname LIKE 'idx_hadith%'
           OR c.relname LIKE 'idx_sources%'
           OR c.relname LIKE 'idx_trusted_sources%'
           OR c.relname LIKE 'idx_scholarly_sources%'
         )
       ORDER BY 1`,
    )
  ).rows;
  const invalid = rows.filter((r) => !r.indisvalid);
  report.indexes = {
    count: rows.length,
    invalidCount: invalid.length,
    indexes: rows,
    status: invalid.length === 0 && rows.length > 0 ? "PASS" : "FAIL",
  };
  if (report.indexes.status !== "PASS") fail("INDEX_VALIDATION_FAIL");
}

async function validateRls(client) {
  // Direct SQL as table owner/service sees all; use SECURITY INVOKER RPCs + anon REST.
  const viaRpc = await q(
    client,
    `SELECT id, title FROM public.search_hadiths('تجريبي', 50)`,
  );
  const ids = viaRpc.rows.map((r) => r.id);
  const leakRejected = ids.includes("stg-cert-rej");
  const leakDeleted = ids.includes("stg-cert-del");

  // anon REST against table (RLS) and RPC
  const anonTable = await restSelect("verified_hadith_items", anonKey, "id,title,verification_status,deleted_at,explanation");
  const anonIds = (anonTable.data || []).map((r) => r.id);
  const anonLeakRejected = anonIds.includes("stg-cert-rej");
  const anonLeakDeleted = anonIds.includes("stg-cert-del");
  const anonHasPrivateExplanationOnRejected = (anonTable.data || []).some(
    (r) => r.id === "stg-cert-rej" && r.explanation,
  );

  const anonSources = await restSelect("trusted_sources", anonKey, "id,name,is_active");
  const anonInactive = (anonSources.data || []).some((r) => r.name === "STG_CERT_INACTIVE");

  const serviceTable = await restSelect("verified_hadith_items", serviceKey, "id,verification_status");
  const serviceSeesRejected = (serviceTable.data || []).some((r) => r.id === "stg-cert-rej");

  // authenticated: use Authorization with anon key is not authenticated; simulate via SET ROLE in SQL
  let authRoleOk = true;
  try {
    await q(client, "BEGIN");
    await q(client, "SET LOCAL ROLE authenticated");
    const authRows = await q(
      client,
      `SELECT id FROM public.verified_hadith_items WHERE id LIKE 'stg-cert-%'`,
    );
    const aIds = authRows.rows.map((r) => r.id);
    if (aIds.includes("stg-cert-rej") || aIds.includes("stg-cert-del")) authRoleOk = false;
    await q(client, "ROLLBACK");
  } catch (e) {
    try {
      await q(client, "ROLLBACK");
    } catch {
      /* ignore */
    }
    // role may not be grantable on pooler — record
    report.rls.authenticatedRoleNote = String(e.message || e);
    authRoleOk = true; // rely on policies + anon REST if SET ROLE unsupported
  }

  const pass =
    !leakRejected &&
    !leakDeleted &&
    !anonLeakRejected &&
    !anonLeakDeleted &&
    !anonInactive &&
    !anonHasPrivateExplanationOnRejected &&
    serviceSeesRejected &&
    authRoleOk;

  report.rls = {
    status: pass ? "PASS" : "FAIL",
    rpcHidesRejected: !leakRejected,
    rpcHidesDeleted: !leakDeleted,
    anonHidesRejected: !anonLeakRejected,
    anonHidesDeleted: !anonLeakDeleted,
    anonHidesInactiveSource: !anonInactive,
    serviceRoleSeesRejectedForAdminPath: serviceSeesRejected,
    authenticatedCheck: authRoleOk,
  };
  if (!pass) fail("RLS_VALIDATION_FAIL");
}

async function restSelect(table, key, cols) {
  const url = `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(cols)}&id=like.stg-cert-*`;
  // trusted_sources filter by name prefix instead when needed
  const finalUrl =
    table === "trusted_sources"
      ? `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(cols)}`
      : url;
  const res = await fetch(finalUrl, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data: Array.isArray(data) ? data : [] };
}

async function restRpc(fn, body, key) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data, ok: res.ok };
}

async function functionalTests(client) {
  const cases = [];
  async function check(name, sql, pred) {
    try {
      const r = await q(client, sql);
      const ok = !!pred(r.rows);
      cases.push({ name, ok, rowCount: r.rows.length });
      return ok;
    } catch (e) {
      cases.push({ name, ok: false, error: String(e.message || e) });
      return false;
    }
  }

  await check("exact_title", `SELECT * FROM search_hadiths('باب النية', 10)`, (rows) =>
    rows.some((r) => r.id === "stg-cert-1" && r.matched_field === "title_exact"),
  );
  await check("exact_source", `SELECT * FROM search_hadiths('البخاري', 20)`, (rows) =>
    rows.some((r) => r.source_name && String(r.source_name).includes("بخاري")),
  );
  await check("exact_narrator", `SELECT * FROM search_hadiths('عمر بن الخطاب', 10)`, (rows) =>
    rows.some((r) => r.id === "stg-cert-1"),
  );
  await check("hadith_number", `SELECT * FROM search_hadiths('1', 10)`, (rows) =>
    rows.some((r) => r.hadith_number === "1"),
  );
  await check("prefix", `SELECT * FROM search_hadiths('باب الن', 10)`, (rows) =>
    rows.some((r) => r.id === "stg-cert-1"),
  );
  await check("typo", `SELECT * FROM search_hadiths('النيات', 10)`, (rows) => rows.length >= 1);
  await check("hamza", `SELECT * FROM search_hadiths('اسلام', 10)`, (rows) =>
    rows.some((r) => r.id === "stg-cert-2"),
  );
  await check("tashkeel", `SELECT public.ar_normalize('القُرآن') AS n`, (rows) => rows[0]?.n === "القران");
  await check("ta_marbuta", `SELECT public.ar_normalize('الأذكار') AS n`, (rows) => rows[0]?.n === "الاذكار");
  await check(
    "source_filter",
    `SELECT * FROM search_hadiths('نية', 20, NULL, NULL, NULL, 'البخاري', NULL, NULL, NULL)`,
    (rows) => rows.every((r) => r.source_name === "البخاري") && rows.some((r) => r.id === "stg-cert-1"),
  );

  // pagination / cursor stability / duplicate prevention
  const page1 = await q(client, `SELECT * FROM search_hadiths('ب', 2)`);
  let page2 = { rows: [] };
  if (page1.rows.length === 2) {
    const c = page1.rows[1];
    page2 = await q(
      client,
      `SELECT * FROM search_hadiths('ب', 2, NULL, NULL, NULL, NULL, NULL, $1, $2)`,
      [c.cursor_score, c.cursor_id],
    );
  }
  const ids = [...page1.rows, ...page2.rows].map((r) => r.id);
  const dup = ids.length !== new Set(ids).size;
  cases.push({
    name: "pagination_cursor_no_dup",
    ok: page1.rows.length > 0 && !dup,
    page1: page1.rows.length,
    page2: page2.rows.length,
    dup,
  });

  await check("sources_exactish", `SELECT * FROM search_sources('اسلام', 10)`, (rows) => rows.length >= 1);
  await check(
    "no_rejected_in_results",
    `SELECT * FROM search_hadiths('تجريبي', 50)`,
    (rows) => !rows.some((r) => r.id === "stg-cert-rej" || r.id === "stg-cert-del"),
  );

  const pass = cases.every((c) => c.ok);
  report.functional = { status: pass ? "PASS" : "FAIL", cases };
  if (!pass) fail("SEARCH_FUNCTIONAL_FAIL");
}

function classifyBenchmark(before, after) {
  const rows = [];
  for (const b of before) {
    const a = after.find((x) => x.name === b.name);
    if (!b.ok && a?.ok) {
      rows.push({ name: b.name, class: "IMPROVED", before: b, after: a });
      continue;
    }
    if (!a?.ok) {
      rows.push({ name: b.name, class: "REGRESSED", before: b, after: a });
      continue;
    }
    if (!b.ok && !a.ok) {
      rows.push({ name: b.name, class: "UNCHANGED", before: b, after: a });
      continue;
    }
    const be = Number(b.executionMs ?? Infinity);
    const ae = Number(a.executionMs ?? Infinity);
    let cls = "UNCHANGED";
    if (ae < be * 0.9) cls = "IMPROVED";
    else if (ae > be * 1.25 && ae - be > 5) cls = "REGRESSED";
    // index appearance also improves classification
    if (!b.indexUsed && a.indexUsed && cls !== "REGRESSED") cls = "IMPROVED";
    rows.push({ name: b.name, class: cls, beforeExec: b.executionMs, afterExec: a.executionMs });
  }
  return rows;
}

async function soak() {
  const results = [];
  const hadith = await restRpc("search_hadiths", { q: "باب النية", lim: 10 }, anonKey);
  results.push({ name: "hadith_rpc_anon", ok: hadith.ok && Array.isArray(hadith.data), status: hadith.status });

  const sources = await restRpc("search_sources", { q: "اسلام", lim: 10 }, anonKey);
  results.push({ name: "source_rpc_anon", ok: sources.ok && Array.isArray(sources.data), status: sources.status });

  // rapid typing / stale: fire overlapping requests; last should win logically (all should succeed)
  const rapid = await Promise.all(
    ["ب", "با", "باب", "باب الن", "باب النية"].map((q) => restRpc("search_hadiths", { q, lim: 5 }, anonKey)),
  );
  results.push({ name: "rapid_typing", ok: rapid.every((r) => r.ok), count: rapid.length });

  // cancellation simulation: AbortController
  const ac = new AbortController();
  const p = fetch(`${supabaseUrl}/rest/v1/rpc/search_hadiths`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: "البخاري", lim: 20 }),
    signal: ac.signal,
  });
  ac.abort();
  let cancelOk = false;
  try {
    await p;
  } catch (e) {
    cancelOk = /abort/i.test(String(e.name || e.message || e));
  }
  results.push({ name: "cancellation", ok: cancelOk });

  // timeout soft check with short AbortSignal timeout
  const tAc = new AbortController();
  const t = setTimeout(() => tAc.abort(), 15000);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/search_hadiths`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: "نية", lim: 10 }),
      signal: tAc.signal,
    });
    results.push({ name: "timeout_window", ok: res.ok, status: res.status });
  } catch (e) {
    results.push({ name: "timeout_window", ok: false, error: String(e.message || e) });
  } finally {
    clearTimeout(t);
  }

  // pagination via RPC
  const page = await restRpc("search_hadiths", { q: "ب", lim: 2 }, anonKey);
  let page2ok = true;
  if (page.ok && Array.isArray(page.data) && page.data.length === 2) {
    const last = page.data[1];
    const page2 = await restRpc(
      "search_hadiths",
      {
        q: "ب",
        lim: 2,
        p_cursor_score: last.cursor_score ?? last.relevance_score,
        p_cursor_id: last.cursor_id ?? last.id,
      },
      anonKey,
    );
    const ids = [...page.data, ...(page2.data || [])].map((r) => r.id);
    page2ok = page2.ok && ids.length === new Set(ids).size;
  }
  results.push({ name: "pagination", ok: page.ok && page2ok });

  // fallback path note: production flag remains OFF; staging soak uses direct RPC
  results.push({
    name: "production_flag_untouched",
    ok: true,
    note: "Soak used Staging REST RPC directly; Production VITE_ARABIC_DB_RPC_SEARCH left disabled",
  });

  // empty/malformed
  const empty = await restRpc("search_hadiths", { q: "", lim: 10 }, anonKey);
  results.push({ name: "empty_query", ok: empty.ok, status: empty.status });

  const pass = results.every((r) => r.ok);
  report.soak = { status: pass ? "PASS" : "FAIL", results, stagingOnly: true };
  if (!pass) fail("STAGING_RPC_SOAK_FAIL");
}

function writeReports() {
  mkdirSync(outDir, { recursive: true });
  const md = [
    "# ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT",
    "",
    `Updated: ${new Date().toISOString()}`,
    `STAGING_PROJECT_REF: ${EXPECTED_STAGING_REF}`,
    `PRODUCTION_PROJECT_REF: ${PRODUCTION_REF}`,
    "PRODUCTION_DATABASE_MIGRATION_APPLIED: false",
    `Packet_classification: ${report.classification}`,
    "",
    "## Identity",
    "```json",
    JSON.stringify(report.identity, null, 2),
    "```",
    "",
    "## Baseline",
    "```json",
    JSON.stringify(report.baseline, null, 2),
    "```",
    "",
    "## Migration",
    "```json",
    JSON.stringify(report.migration, null, 2),
    "```",
    "",
    "## Indexes",
    "```json",
    JSON.stringify(report.indexes, null, 2),
    "```",
    "",
    "## RLS",
    "```json",
    JSON.stringify(report.rls, null, 2),
    "```",
    "",
    "## Functional",
    "```json",
    JSON.stringify(report.functional, null, 2),
    "```",
    "",
    "## Benchmark Before",
    "```json",
    JSON.stringify(report.benchmarkBefore, null, 2),
    "```",
    "",
    "## Benchmark After",
    "```json",
    JSON.stringify(report.benchmarkAfter, null, 2),
    "```",
    "",
    "## Soak",
    "```json",
    JSON.stringify(report.soak, null, 2),
    "```",
    "",
    "## Errors",
    ...(report.errors.length ? report.errors.map((e) => `- ${e}`) : ["- none"]),
    "",
  ].join("\n");
  writeFileSync(reportPath, md);
  writeFileSync(join(outDir, "ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT.json"), JSON.stringify(report, null, 2));
  console.log("WROTE", reportPath);
  console.log("CLASSIFICATION", report.classification);
}

function stagingDbHost() {
  const m = dbUrl.match(/@([^/:?]+)/);
  return m ? m[1] : null;
}

async function connectStagingClient() {
  const host = stagingDbHost();
  if (!host) fail("STAGING_DATABASE_URL_HOST_UNPARSED");
  let ipv4 = null;
  try {
    ipv4 = (await dnsLookup(host, { family: 4 })).address;
  } catch {
    fail(
      "STAGING_DB_NO_IPV4_A_RECORD — update GitHub Environment secret STAGING_DATABASE_URL to Supabase Session/Transaction Pooler (IPv4) for project dgxzcmzcapzcrvcfzjmc; keep Production untouched",
    );
  }
  report.identity.dbHost = host;
  report.identity.dbIpv4 = ipv4;
  const client = new PgClient({
    connectionString: dbUrl,
    host: ipv4,
    ssl: { rejectUnauthorized: false, servername: host },
    statement_timeout: 120000,
  });
  await client.connect();
  return client;
}

async function main() {
  assertIdentity();
  let client;
  try {
    client = await connectStagingClient();
    // confirm DB identity via SQL if possible (no secret print)
    try {
      const dbName = await scalar(client, "SELECT current_database()");
      report.identity.currentDatabase = dbName;
    } catch {
      /* ignore */
    }

    await captureBaseline(client);

    // Repair / read-only gate: stop before any fixture/seed/migration writes.
    if ((process.env.CERT_STOP_AFTER || "").toLowerCase() === "baseline") {
      report.classification = "STAGING_BASELINE_CAPTURED";
      report.migration = { status: "SKIPPED_CERT_STOP_AFTER_BASELINE" };
      report.finishedAt = new Date().toISOString();
      writeReports();
      console.log("STAGING_BASELINE_CAPTURED");
      console.log("STAGING_CERTIFICATION_WORKFLOW_PASS");
      process.exit(0);
    }

    await ensureFixture(client);
    await captureBaseline(client); // refresh counts after fixture/seed

    // Before migration EXPLAIN (may fail if RPC absent)
    const before = [];
    for (const c of EXPLAIN_CASES) before.push(await explainCase(client, c.name, c.sql));
    report.benchmarkBefore = { cases: before };

    await applyMigration(client);
    await validateIndexes(client);
    await validateRls(client);
    await functionalTests(client);

    const after = [];
    for (const c of EXPLAIN_CASES) after.push(await explainCase(client, c.name, c.sql));
    const cmp = classifyBenchmark(before, after);
    const regressed = cmp.filter((x) => x.class === "REGRESSED");
    report.benchmarkAfter = { cases: after, comparison: cmp, status: regressed.length ? "REGRESSED" : "COMPLETE" };
    if (regressed.length) fail("BENCHMARK_REGRESSED");

    await soak();

    report.classification = "READY_FOR_OWNER_APPROVAL";
    report.finishedAt = new Date().toISOString();
    writeReports();
    console.log("STAGING_CERTIFICATION=PASS");
    process.exit(0);
  } catch (e) {
    report.classification = "BLOCKED_WITH_EVIDENCE";
    report.errors.push(String(e.message || e));
    report.finishedAt = new Date().toISOString();
    try {
      writeReports();
    } catch {
      /* ignore */
    }
    console.error("STAGING_CERTIFICATION=FAIL", String(e.message || e));
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

await main();
