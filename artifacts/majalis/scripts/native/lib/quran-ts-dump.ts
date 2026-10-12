/** يُشغَّل عبر tsx من وحدات التصدير: يطبع JSON لمصادر TS المنشورة في الموقع (بلا تعديل نص). */
import { getAllSurahStories } from "../../../src/lib/surah-stories";
import { getSurahExtendedMeta, isSurahMetaReady } from "../../../src/lib/surah-extended-meta";
import { TAJWEED_HUB_INTRO, TAJWEED_CHAPTERS } from "../../../src/lib/quran-tajweed/chapters";
import { listAllHifzPathsInternal } from "../../../src/lib/memorization-path/catalog";
import { loadQuranStatsCatalog } from "../../../src/lib/quran-stats/catalog";
import { QIRAAT_SECTIONS, QIRAAT_ASHARA, QIRAAT_DIFF_EXAMPLES } from "../../../src/lib/quran-qiraat/catalog";
import { MIRACLES_SEED } from "../../../src/lib/miracles-seed";
import { AHRUF_SECTIONS } from "../../../src/lib/quran-ahruf/content";

const stories = getAllSurahStories().map((s) => {
  const ext = getSurahExtendedMeta(s.number);
  return { ...s, extReady: isSurahMetaReady(ext), extSource: isSurahMetaReady(ext) ? ext.source ?? "" : "" };
});
process.stdout.write(JSON.stringify({
  stories, tajweed: { intro: TAJWEED_HUB_INTRO, chapters: TAJWEED_CHAPTERS },
  hifz: listAllHifzPathsInternal(), stats: loadQuranStatsCatalog(),
  qiraat: { sections: QIRAAT_SECTIONS, ashara: QIRAAT_ASHARA, diffs: QIRAAT_DIFF_EXAMPLES },
  ahruf: AHRUF_SECTIONS, miracles: MIRACLES_SEED,
}));
