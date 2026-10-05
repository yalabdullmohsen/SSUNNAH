/**
 * LHCI — الصفحات المفتاحية (الدخول، القرآن، الأقسام، البحث) على مقاس الجوال.
 *
 * يعيد استخدام إعدادات lighthouserc.cjs كما هي (PSI Slow 4G، 412×823) — مصدر واحد للإعدادات.
 * لا assertions هنا: المقارنة بخط الأساس المقاس تتم في scripts/lhci-key-pages-gate.mjs
 * (config/lhci-key-pages-baseline.json) — تمنع الأسوأ فقط ولا تُفشل المشاكل القائمة.
 * الصفحة الرئيسية مغطاة سلفًا بوظيفة lhci-home في ci.yml.
 */
const home = require("./lighthouserc.cjs");

const base = (process.env.LHCI_BASE || "http://127.0.0.1:24216").replace(
  /\/$/,
  "",
);
const KEY_PAGES = ["/login", "/quran", "/sections", "/search"];

module.exports = {
  KEY_PAGES,
  ci: {
    collect: {
      ...home.ci.collect,
      url: KEY_PAGES.map((p) => base + p),
      numberOfRuns: 3,
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci-reports/key-pages",
    },
  },
};
