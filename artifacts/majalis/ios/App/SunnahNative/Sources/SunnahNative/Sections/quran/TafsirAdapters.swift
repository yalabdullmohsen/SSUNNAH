import Foundation

enum TafsirAdapters {
    /// التفاسير المحزومة بترتيب السجل.
    static func available(_ registry: TafsirRegistry) -> [TafsirEntry] {
        registry.tafsirs.filter { TafsirData.bundledIds.contains($0.id) }
    }

    /// صفوف الآيات بترتيب الآية؛ آية بلا تفسير في المصدر تبقى بلا نص (فجوة موثّقة) ولا يُختلق لها شيء.
    static func rows(quran: TafsirQuranFile, tafsir: TafsirSurahFile) -> [TafsirAyahRow] {
        quran.ayahs.sorted { $0.numberInSurah < $1.numberInSurah }.map {
            TafsirAyahRow(number: $0.numberInSurah,
                          ayah: $0.text.replacingOccurrences(of: "\u{FEFF}", with: ""),
                          tafsir: tafsir.ayahs[String($0.numberInSurah)])
        }
    }

    /// سطر النسبة المعروض فوق التفسير: «الكتاب — المؤلف».
    static func attribution(_ t: TafsirEntry) -> String { "\(t.name) — \(t.author)" }
}
