import XCTest

/// يمنع عودة تواريخ هجرية/ميلادية ثابتة إلى بيانات المعرض (مصدر خطأ «١٢ ربيع الأول ١٤٤٧»).
final class FixturesHaveNoStaticDatesTests: XCTestCase {
    private func fixturesSource() throws -> String {
        let url = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .appendingPathComponent("PrayerWidget/SunnahWidgetPreviewFixtures.swift")
        return try String(contentsOf: url, encoding: .utf8)
    }

    func testNoHardcodedYearsOrMonthNames() throws {
        let src = try fixturesSource()
        let patterns = [
            #"[0-9٠-٩]{4}"#,                                   // سنة بأي رقم (لاتيني/هندي)
            #"hijri(Day|Month|Year)\s*:\s*[0-9]"#,              // حقول هجرية بقيم حرفية
            #"(محرم|صفر|ربيع|جمادى|رجب|شعبان|رمضان|شوال|ذو القعدة|ذو الحجة)\s+[0-9٠-٩]"#,
            #"(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)"#,
            #"upcomingEventDays\s*:\s*[0-9]"#,
        ]
        for p in patterns {
            let re = try NSRegularExpression(pattern: p)
            let hits = re.matches(in: src, range: NSRange(src.startIndex..., in: src))
            let found = hits.compactMap { Range($0.range, in: src).map { String(src[$0]) } }
            XCTAssertTrue(found.isEmpty, "تاريخ ثابت في الـFixtures: \(found)")
        }
    }
}
