/* بذور المسارات المعتمدة على .remote: تُحزم في Data ليعمل أول تشغيل بلا إنترنت (RemoteSeeds.swift يقرؤها عند الفشل بلا كاش).
   accounts/feed تُنسخ بايتًا بايتًا من public/data؛ auto-content من لقطة مُلتزَمة؛ /api/updates من لقطة مُلتزَمة (جدول platform_updates غير موجود في Supabase). */
import fs from "node:fs";

export default function ({ put, appRoot, data }) {
  for (const rel of ["sources/accounts.json", "lessons/feed.json"]) {
    const p = `${data}/${rel}`;
    if (fs.existsSync(p)) put(rel, fs.readFileSync(p));
  }
  const ac = `${appRoot}/content/native/remote-seeds/feed-snapshot.json`;
  if (fs.existsSync(ac)) put("seed/auto-content.json", fs.readFileSync(ac));
  const up = `${appRoot}/content/native/remote-seeds/updates-snapshot.json`;
  put("seed/platform-updates.json", fs.existsSync(up) ? fs.readFileSync(up) : "[]");
}
