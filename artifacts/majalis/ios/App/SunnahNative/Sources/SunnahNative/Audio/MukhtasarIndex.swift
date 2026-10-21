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

    /// نطاق البايت لمقطع الآية (مجموعتها) داخل ملف السورة — لتنزيله وحده بطلب HTTP Range (ثوانٍ بدل ملف السورة كاملًا: البقرة مئات الميغابايت).
    /// `lo..<hi` بايتات تبدأ بإطار MP3 كامل؛ `lead` = بداية الآية داخل المقطع (ثوانٍ)، و`length` = مدتها (nil = حتى نهاية الملف).
    public struct Segment: Sendable, Equatable { public let lo: Int; public let hi: Int; public let size: Int; public let lead: Double; public let length: Double? }

    public static func segment(surah: Int, ayah: Int) -> Segment? {
        guard let e = generated[surah], let b = generatedBytes[surah], ayah >= 1, ayah <= e.ayahs.count,
              b.ayahs.count == e.ayahs.count else { return nil }
        let t = e.ayahs
        var lo = ayah - 1, hi = ayah - 1
        while lo > 0, t[lo] - t[lo - 1] < groupGap { lo -= 1 }
        while hi + 1 < t.count, t[hi + 1] - t[hi] < groupGap { hi += 1 }
        let next = hi + 1 < t.count ? hi + 1 : nil
        // حتى بداية إطار الآية التالية + هامش إطارين (لا يُقصّ آخر التفسير)، والتوقف الدقيق بالمدة.
        let end = next.map { min(b.ayahs[$0] + 2_000, b.size) } ?? b.size
        return Segment(lo: b.ayahs[lo], hi: end, size: b.size, lead: b.leads[lo],
                       length: next.map { max(t[$0] - t[lo] - 0.15, 0.5) })
    }
}

