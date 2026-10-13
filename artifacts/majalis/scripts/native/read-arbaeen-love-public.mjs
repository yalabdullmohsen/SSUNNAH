/* قراءة واحدة بصفة زائر: المفتاح العام من /api/public-config (كما يفعل المتصفح) + SELECT فقط على الجدول نفسه والاستعلام نفسه الذي يستعمله الموقع (fetchPublishedArbaeenLove). لا مفتاح سري ولا كتابة. */
import fs from "node:fs";
import path from "node:path";
const site = "https://www.ssunnah.com";
const cfg = await (await fetch(`${site}/api/public-config`)).json();
if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) throw new Error("public-config بلا مفتاح عام");
const cols = "id,order_number,title,hadith_text,source,hadith_number,grade,verified_by,review_status,editor_notes";
const res = await fetch(`${cfg.supabaseUrl}/rest/v1/arbaeen_love_of_allah?select=${cols}&review_status=eq.published&order=order_number.asc`, {
  headers: { apikey: cfg.supabaseAnonKey, Authorization: `Bearer ${cfg.supabaseAnonKey}` },
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const rows = await res.json();
const out = path.join(import.meta.dirname, "snapshots/arbaeen-love-of-allah.site-public-read.json");
fs.writeFileSync(out, JSON.stringify(rows, null, 1) + "\n");
console.log("rows", rows.length);
