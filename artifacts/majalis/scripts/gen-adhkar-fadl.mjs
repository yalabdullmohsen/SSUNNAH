#!/usr/bin/env node
// يولّد src/data/adhkar-fadl.json وملف Swift المقابل من نصوص الصحيحين المضمّنة في المستودع (public/data/hadith).
// لا يُكتب أي لفظ بيدٍ: كل «فضل» مقطع حرفي من الرواية بين بدايته ونهايته؛ والتطبيع الوحيد = حذف علامات الاتجاه ونقاط الطبعة وتوحيد ترتيب علامات التشكيل (NFC، مكافئ قانونيًا).
// الاستعمال: node scripts/gen-adhkar-fadl.mjs  (--check للتحقق من عدم الانجراف دون كتابة)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsonOut = join(root, 'src/data/adhkar-fadl.json');
const swiftOut = join(root, 'ios/App/SunnahPrayer/Sources/SunnahPrayer/AdhkarFadl.swift');

export const clean = (s) => s.normalize('NFC').replace(/‏/g, '').replace(/(^|\s)\.(?=\s|$)/g, ' ').replace(/\.(?=\s)/g, '').replace(/\s+/g, ' ').trim();

const SPECS = [
  ['bukhari', 6405, 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'مَنْ قَالَ سُبْحَانَ', 'مِثْلَ زَبَدِ الْبَحْرِ'],
  ['bukhari', 6406, 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', 'كَلِمَتَانِ', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ'],
  ['bukhari', 6307, 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', 'وَاللَّهِ إِنِّي', 'سَبْعِينَ مَرَّةً'],
  ['bukhari', 6407, 'لَا إِلَهَ إِلَّا اللَّهُ', 'مَثَلُ الَّذِي', 'الْحَىِّ وَالْمَيِّتِ'],
  ['muslim', 912, 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', 'مَنْ صَلَّى', 'عَشْرًا'],
  ['muslim', 6847, 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ', 'لأَنْ أَقُولَ', 'عَلَيْهِ الشَّمْسُ'],
  ['muslim', 6859, 'أَسْتَغْفِرُ اللَّهَ', 'يَا أَيُّهَا النَّاسُ', 'مِائَةَ مَرَّةٍ'],
  ['muslim', 6932, 'الْحَمْدُ لِلَّهِ', 'إِنَّ اللَّهَ لَيَرْضَى', 'فَيَحْمَدَهُ عَلَيْهَا', true],
  ['muslim', 6926, 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'إِنَّ أَحَبَّ الْكَلاَمِ', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ'],
  ['muslim', 6925, 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'مَا اصْطَفَى', 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ'],
  ['muslim', 6843, 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 'مَنْ قَالَ حِينَ يُصْبِحُ', 'أَوْ زَادَ عَلَيْهِ'],
  ['muslim', 5601, 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ', 'أَحَبُّ الْكَلاَمِ', 'بَدَأْتَ'],
];
const LABEL = { bukhari: 'صحيح البخاري', muslim: 'صحيح مسلم' };

const data = {};
for (const c of ['bukhari', 'muslim']) {
  data[c] = new Map(JSON.parse(readFileSync(join(root, `public/data/hadith/${c}.json`), 'utf8')).hadiths.map((h) => [h.n, clean(h.t)]));
}

const items = SPECS.map(([c, n, dhikr, from, to, last], i) => {
  const t = data[c].get(n);
  if (!t) throw new Error(`${c}#${n} غير موجود`);
  const s = t.indexOf(clean(from));
  const e = last ? t.lastIndexOf(clean(to)) : t.indexOf(clean(to), s);
  if (s < 0 || e < 0 || e < s) throw new Error(`تعذّر تحديد المقطع في ${c}#${n}`);
  const fadl = t.slice(s, e + clean(to).length);
  return {
    id: `fadl-${String(i + 1).padStart(2, '0')}`,
    dhikr,
    fadl,
    source: c === 'bukhari' ? `${LABEL[c]} (${n})` : `${LABEL[c]} — رقم ${n} في بيانات المستودع`,
    grade: 'صحيح',
    repoFile: `public/data/hadith/${c}.json`,
    repoN: n,
  };
});

const json = JSON.stringify({ version: 1, prefix: 'قال ﷺ: ', items }, null, 2) + '\n';
const q = (s) => JSON.stringify(s);
const swift = `// مُولَّد من src/data/adhkar-fadl.json بـ scripts/gen-adhkar-fadl.mjs — لا يُعدَّل يدويًا.
// العنوان = الذكر، النص = «قال ﷺ: …» حرفيًا بلا مصدر ولا راوٍ (المصدر في البيانات فقط).

public struct AdhkarFadlPair: Equatable, Sendable {
    public let id: String
    public let dhikr: String
    public let body: String
}

public enum AdhkarFadl {
    public static let pairs: [AdhkarFadlPair] = [
${items.map((it) => `        .init(id: ${q(it.id)}, dhikr: ${q(it.dhikr)}, body: ${q('قال ﷺ: ' + it.fadl)}),`).join('\n')}
    ]

    /// اختيار حتمي يدور على الأزواج: نفس اليوم والخانة ⇒ نفس الزوج.
    public static func pair(dayIndex: Int, slot: Int) -> AdhkarFadlPair {
        let n = pairs.count
        return pairs[(((dayIndex * 3 + slot) % n) + n) % n]
    }
}
`;
if (process.argv.includes('--check')) {
  const same = readFileSync(jsonOut, 'utf8') === json && readFileSync(swiftOut, 'utf8') === swift;
  if (!same) { console.error('adhkar-fadl: انجراف — شغّل node scripts/gen-adhkar-fadl.mjs'); process.exit(1); }
  console.log('adhkar-fadl: لا انجراف');
} else {
  writeFileSync(jsonOut, json); writeFileSync(swiftOut, swift);
  for (const it of items) console.log(it.id, [...it.fadl].filter((ch) => !/[ً-ْٰ]/.test(ch)).length, '/', ('قال ﷺ: ' + it.fadl).length, it.fadl.slice(0, 50));
}
