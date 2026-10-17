import XCTest

/// حارس: نص الآية في أي شاشة منتج يُعرض عبر `MushafAyahText` (خط المصحف QPC نفسه) لا بخط عام.
/// يفشل عند ظهور `Sunnah.Typography.quran` أو `QuranAyahPlainText.text(` أو `SunnahArabicText(... .quran)` خارج `Mushaf/` و`Design/`.
/// قائمة السماح ratchet: المخالفون الحاليون فقط، وتُقلَّص عند تحويل الشاشة إلى المكوّن ولا تُوسَّع.
final class MushafAyahTextGuardTests: XCTestCase {
    /// ملف ← أقصى عدد مخالفات مسموح (سقف لا يُرفع).
    static let allowed: [String: Int] = [
        "Sections/quran/QuranSearchScreen.swift": 1,        // نتائج البحث — تتحول إلى MushafAyahText (ن1)
        "Sections/quran/MutashabihatScreens.swift": 1,      // المتشابهات
        "Sections/quran/TafsirScreens+Native.swift": 1,     // التفسير
        "Mushaf/MushafTafsirView.swift": 1,                 // التفسير داخل المصحف
        "Components/SunnahArabicText.swift": 1,             // تعريف النمط العام `.quran` (لا استعمال)
    ]

    private var sources: URL {
        URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative")
    }

    private func violations(in text: String) -> Int {
        text.split(separator: "\n").filter { line in
            if line.contains("Typography.quran") || line.contains("QuranAyahPlainText.text(") { return true }
            return line.contains("SunnahArabicText(") && line.contains(".quran")
        }.count
    }

    func testAyahTextUsesMushafAyahTextOutsideMushaf() throws {
        let fm = FileManager.default
        let en = try XCTUnwrap(fm.enumerator(at: sources, includingPropertiesForKeys: nil))
        var found: [String: Int] = [:]
        for case let url as URL in en where url.pathExtension == "swift" {
            let rel = String(url.path.dropFirst(sources.path.count + 1))
            if rel.hasPrefix("Design/") || rel.hasPrefix("Widgets/") { continue }
            if rel.hasPrefix("Mushaf/") && rel != "Mushaf/MushafTafsirView.swift" { continue }
            let n = violations(in: (try? String(contentsOf: url, encoding: .utf8)) ?? "")
            if n > 0 { found[rel] = n }
        }
        for (rel, n) in found.sorted(by: { $0.key < $1.key }) {
            XCTAssertLessThanOrEqual(n, Self.allowed[rel] ?? 0,
                "\(rel): \(n) موضع يعرض آية بخط غير MushafAyahText — استعملي MushafAyahText أو وثّقي الاستثناء")
        }
        for (rel, cap) in Self.allowed where (found[rel] ?? 0) < cap {
            XCTFail("\(rel): انخفضت المخالفات إلى \(found[rel] ?? 0) — اخفضي السقف في allowed (ratchet)")
        }
    }
}
