import XCTest

/// حارس: نص الآية يمرّ عبر `QuranAyahText` فقط. أي `Text` أو `SunnahArabicText(.quran)` بخط القرآن
/// خارج القائمة أدناه يفشل. القائمة سقف دين يُنقص ولا يُزاد (ملفات ن3 للمصحف والتفسير والبحث).
final class QuranTextGuardTests: XCTestCase {
    private static let legacyAllowlist: Set<String> = [
        "Sections/quran/MutashabihatScreens.swift",
        "Sections/quran/TafsirScreens+Native.swift",
        "Mushaf/MushafTafsirView.swift",
        "Templates/ExplainerTemplate.swift",
        "Mushaf/MushafAyahShareImage.swift",   // صورة المشاركة تُرسم بخط النظام عمدًا (ImageRenderer)
        "Special/AppearancePrefs.swift",       // معاينة حجم الخط
        "Components/SunnahArabicText.swift", // تعريف النمط نفسه
    ]

    func testNoNewPlainTextWithQuranFont() throws {
        let root = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative")
        let files = try XCTUnwrap(FileManager.default.enumerator(at: root, includingPropertiesForKeys: nil))
        var offenders: [String] = []
        for case let url as URL in files where url.pathExtension == "swift" {
            let rel = url.path.replacingOccurrences(of: root.path + "/", with: "")
            let src = try String(contentsOf: url, encoding: .utf8)
            let hit = src.contains("Typography.quran") || src.contains("style: .quran")
            if hit && !Self.legacyAllowlist.contains(rel) { offenders.append(rel) }
        }
        XCTAssertTrue(offenders.isEmpty, "نص قرآني بـText عادي؛ استخدم QuranAyahText: \(offenders.sorted())")
    }

    func testProphetsPageUsesQuranAyahText() throws {
        let url = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("Sources/SunnahNative/Sections/sirah/ProphetsStories.swift")
        let src = try String(contentsOf: url, encoding: .utf8)
        XCTAssertTrue(src.contains("QuranAyahText("))
        XCTAssertFalse(src.contains("style: .quran"))
    }
}
