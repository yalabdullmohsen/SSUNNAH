import Foundation

/// فهرس توقيتات «المختصر الصوتي» داخل ملف كل سورة (بالثواني):
/// `start` = بداية «مقاصد السورة» بعد الإعلان الافتتاحي، و`ayahs[n-1]` = بداية تلاوة الآية n (يعقبها تفسيرها حتى الآية التالية).
/// البيانات في `MukhtasarIndex+Data.swift` (مولَّدة من الملفات نفسها: تفريغ صوتي ومطابقة نص الآيات، سكربت scripts/mukhtasar-index).
public enum MukhtasarIndex {
    public struct Entry: Sendable { public let start: Double; public let ayahs: [Double] }

    /// مدة الإعلان الافتتاحي الموحّدة (احتياط لسورة بلا فهرس بعد).
    static var introSkip: Double { generatedIntroSkip }

    public static func entry(_ surah: Int) -> Entry? { generated[surah] }
    public static func hasAyahs(_ surah: Int) -> Bool { !(generated[surah]?.ayahs.isEmpty ?? true) }

    /// أقل مدة معقولة بين بدايتي آيتين (تلاوة + تفسير)؛ ما دونها يعني أن الآيات تُليت مجتمعة ثم فُسّرت معًا.
    static let groupGap: Double = 4

    /// نطاق التشغيل: الآية ⇒ [بداية مجموعتها، بداية الآية التالية للمجموعة) — المختصر يجمع أحيانًا آيات متتالية
    /// في تلاوة واحدة يعقبها تفسيرها؛ فتُشغَّل المجموعة كاملة (لا آية مجاورة غيرها). آخر مجموعة حتى نهاية الملف.
    /// السورة ⇒ من بداية المقاصد بعد الإعلان.
    public static func range(surah: Int, ayah: Int?) -> (start: Double, end: Double?) {
        guard let e = generated[surah] else { return (introSkip, nil) }
        guard let a = ayah, a >= 1, a <= e.ayahs.count else { return (e.start, nil) }
        let t = e.ayahs
        var lo = a - 1, hi = a - 1
        while lo > 0, t[lo] - t[lo - 1] < groupGap { lo -= 1 }
        while hi + 1 < t.count, t[hi + 1] - t[hi] < groupGap { hi += 1 }
        let start = t[lo]
        let end = hi + 1 < t.count ? t[hi + 1] : nil
        return (start, end.map { max($0 - 0.15, start) })
    }
}
