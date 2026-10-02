/**
 * FINAL_HARDENING — إغلاق P1 + أمن P2 + جودة P2/P3 ذات الصلة.
 * Run: node --import tsx src/lib/__tests__/final-hardening-p1-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { safeHttpHref } from "../sanitize";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

console.log("=== AUTH_SIGNOUT order (already on main) ===");
{
  const api = read("src/lib/supabase.ts");
  const body = api.match(/export async function signOut\(\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const revokeAt = body.indexOf("supabase.auth.signOut");
  const clearAt = body.indexOf("clearAllNativeAuthSessions");
  assert.ok(revokeAt >= 0 && clearAt >= 0 && revokeAt < clearAt);
}

console.log("=== ADMIN_ROLE via Admin API only ===");
{
  const users = read("src/views/admin/UsersSection.tsx");
  assert.match(users, /v3Mutate\(\s*["']users["']/);
  assert.doesNotMatch(users, /adminUpdateUserRole/);
  assert.doesNotMatch(users, /from\(["']profiles["']\)\.update/);
  const supabase = read("src/lib/supabase.ts");
  assert.match(supabase, /adminUpdateUserRole_removed|Admin API \/api\/admin\/v3\/users/);
  assert.doesNotMatch(
    supabase,
    /export async function adminUpdateUserRole[\s\S]{0,200}from\(["']profiles["']\)\.update/,
  );
  const v3 = read("lib/api-handlers/admin/v3.js");
  assert.match(v3, /requireAdminAccess/);
  assert.match(v3, /users\.manage/);
  assert.match(v3, /from\("profiles"\)\.update\(\{ role \}\)/);
}

console.log("=== MUSHAF reduced-motion unlock ===");
{
  const pager = read("src/features/mushaf-reader/useMushafPager.ts");
  assert.match(pager, /finishTrackCommit/);
  assert.match(pager, /prefersReducedMotion\(\)/);
  assert.match(pager, /visualTransitionEnd/);
  assert.match(
    pager,
    /if\s*\(\s*!prefersReducedMotion\(\)\s*\)\s*return/,
  );
}

console.log("=== LA linger timers not cleared by schedule reschedule ===");
{
  const sched = read("src/lib/prayer-alert-scheduler.ts");
  assert.match(sched, /_liveActivityTimers/);
  assert.match(sched, /clearLiveActivityTimers/);
  assert.match(sched, /_liveActivityTimers\.push/);
  const fire = sched.match(
    /async function fireLiveActivityEnter\([\s\S]*?\n\}/,
  )?.[0];
  assert.ok(fire);
  assert.doesNotMatch(fire!, /_timers\.push/);
  assert.match(fire!, /_liveActivityTimers\.push/);
  assert.match(sched, /enter reschedule failed/);
}

console.log("=== P2 SW openWindow URL allowlist ===");
{
  const sw = read("public/sw.js");
  assert.match(sw, /function sanitizeNotificationNavUrl/);
  assert.match(sw, /javascript\|data\|vbscript/);
  assert.match(sw, /u\.origin === self\.location\.origin/);
  assert.doesNotMatch(sw, /clients\.openWindow\(\s*event\.notification\.data/);
  assert.match(sw, /new URL\(c\.url\)\.pathname/);
  assert.doesNotMatch(
    sw,
    /c\.url\.includes\(target\)/,
  );
  assert.match(
    sw,
    /url\.hostname === h \|\| url\.hostname\.endsWith\(`\.\$\{h\}`\)/,
  );
}

console.log("=== P2 OpenAPI key header-only ===");
{
  const auth = read("lib/open-platform/auth.mjs");
  assert.match(auth, /x-api-key/);
  assert.doesNotMatch(auth, /query\.api_key|searchParams.*api_key|req\.query\?\.api_key/);
  assert.match(auth, /never accept api_key in query|Header only/i);
}

console.log("=== P2 safeHttpHref central + CMS sinks ===");
{
  const sanitize = read("src/lib/sanitize.ts");
  assert.match(sanitize, /export function safeHttpHref/);
  assert.equal(safeHttpHref("javascript:alert(1)"), undefined);
  assert.equal(safeHttpHref("data:text/html,x"), undefined);
  assert.equal(safeHttpHref("//evil.example/x"), undefined);
  assert.equal(safeHttpHref("/safe/path"), "/safe/path");
  assert.ok(safeHttpHref("https://example.com/a")?.startsWith("https://"));
  for (const rel of [
    "src/views/ScientificAnnouncementDetailPage.tsx",
    "src/views/UniversityDetailPage.tsx",
    "src/views/UniversitiesComparePage.tsx",
    "src/views/VaultPage.tsx",
    "src/views/UpdatesPage.tsx",
    "src/views/DiscoverIslamQuestionDetailPage.tsx",
    "src/views/DiscoverIslamDoubtDetailPage.tsx",
    "src/views/CitationPublicPage.tsx",
  ]) {
    assert.match(read(rel), /safeHttpHref/);
  }
}

console.log("=== P2 auth getItem LS fallback + clearAll key discovery ===");
{
  const storage = read("src/lib/supabase-auth-storage.ts");
  assert.match(storage, /Keychain miss: fall back to leftover LS session/);
  assert.match(storage, /collectAuthStorageKeys/);
  assert.match(storage, /deriveSupabaseAuthStorageKey/);
  assert.match(storage, /LAST_AUTH_KEY_FLAG/);
  assert.match(storage, /Do not set MIGRATION_FLAG for non-session/);
}

console.log("=== P2 adhan cache blob used via resolvePlayableUrl ===");
{
  const adhan = read("src/lib/adhan-playback.ts");
  assert.match(adhan, /resolvePlayableUrl/);
  assert.match(adhan, /getCachedAdhanUrl/);
  assert.match(adhan, /audio\.src = await resolvePlayableUrl/);
}

console.log("=== P2 prayer enter unhandled + AppState race ===");
{
  const sched = read("src/lib/prayer-alert-scheduler.ts");
  assert.match(sched, /\.catch\(/);
  const app = read("src/App.tsx");
  assert.match(app, /appStateChange/);
  assert.match(app, /cancelled/);
  assert.match(app, /removeAppState/);
}

console.log("=== P2/P3 widget timeline + LA await ActivityKit ===");
{
  const shared = read("ios/App/App/SunnahSharedDataPlugin.swift");
  assert.match(shared, /WidgetCenter\.shared\.reloadAllTimelines/);
  const la = read("ios/App/App/PrayerLiveActivityPlugin.swift");
  assert.match(la, /await activity\.update/);
  assert.match(la, /await activity\.end/);
  const update = la.match(/func updateActivity[\s\S]*?(?=\n {4}@objc|\n {4}\/\/\/|\n#if)/)?.[0] ?? "";
  assert.match(update, /Task\s*\{/);
  assert.match(update, /await activity\.update/);
  assert.match(update, /call\.resolve\(\["updated": true/);
  const end = la.match(/func endActivity[\s\S]*?(?=\n {4}@objc|\n {4}\/\/\/)/)?.[0] ?? "";
  assert.match(end, /await activity\.end/);
  assert.ok(
    end.indexOf("await activity.end") < end.indexOf('call.resolve(["ended": true])'),
  );
}

console.log("=== P3 security UI gate walks admin ===");
{
  const gate = read("src/lib/__tests__/security-ui-hardening-gate.test.ts");
  assert.doesNotMatch(gate, /name === ["']admin["']/);
  assert.match(gate, /Include admin views/);
}

console.log("final-hardening-p1-gate.test.ts: ok");
