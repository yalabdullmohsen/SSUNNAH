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

    /// نطاق التشغيل: الآية ⇒ [بدايتها، بداية التالية)، وآخر آية حتى نهاية الملف؛ السورة ⇒ من بداية المقاصد.
    public static func range(surah: Int, ayah: Int?) -> (start: Double, end: Double?) {
        guard let e = generated[surah] else { return (introSkip, nil) }
        guard let a = ayah, a >= 1, a <= e.ayahs.count else { return (e.start, nil) }
        let start = e.ayahs[a - 1]
        let end = a < e.ayahs.count ? e.ayahs[a] : nil
        return (start, end.map { max($0 - 0.15, start) })
    }
}
