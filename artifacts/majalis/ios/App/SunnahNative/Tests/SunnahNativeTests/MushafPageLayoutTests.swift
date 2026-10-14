import XCTest
@testable import SunnahNative

/// توزيع الصفحة من أنواع أسطر QPC. القيم المرجعية مقيسة من صور المرجع (402×874 نقطة، 3x) — مراكز حبر الأسطر:
/// صفحة 1: لافتة الفاتحة 264.3، أول آية 358.2، آخر سطر 637.2؛ صفحة 301: أول سطر 124.2، آخر سطر 776.7؛ صفحة 293: أول سطر 123.5، آخر سطر 782.3.
final class MushafPageLayoutTests: XCTestCase {
    private let H = 874.0
    private func page(_ n: Int) throws -> MushafPage {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        return try MushafRepository(root: URL(fileURLWithPath: p)).page(n)
    }
    private func center(_ n: Int, _ i: Int, _ page: MushafPage) -> Double {
        let m = MushafPageLayout.metrics(for: page, height: H)
        return m.top + m.rowHeight * (Double(i) + 0.5)
    }

    func testOpeningCollapsesBlankRunsOnly() throws {
        let p1 = try page(1), p2 = try page(2)
        XCTAssertEqual(MushafPageLayout.displayRows(p1).map(\.k).joined(), "hxlllllll")
        XCTAssertEqual(MushafPageLayout.displayRows(p2).map(\.k).joined(), "hbxllllll")
        // الأسطر والآيات كما هي: لا حذف ولا إضافة في أسطر الآيات.
        for p in [p1, p2] {
            XCTAssertEqual(MushafPageLayout.displayRows(p).filter { $0.k == "l" }, p.rows.filter { $0.k == "l" })
        }
    }

    func testRegularPagesKeepGridUntouched() throws {
        for n in [293, 301, 3, 604] {
            let p = try page(n)
            XCTAssertEqual(MushafPageLayout.displayRows(p), p.rows)
            XCTAssertEqual(MushafPageLayout.metrics(for: p, height: H).top, MushafPageLayout.areaTop * H, accuracy: 0.001)
        }
    }

    /// صفحة 1: اللافتة تعلو أول آية بسطرين (≈94.0 نقطة في المرجع) وكتلتها مركّزة بين الرأس والذيل.
    func testPage1MatchesReference() throws {
        let p = try page(1), rows = MushafPageLayout.displayRows(p)
        let rowH = MushafPageLayout.metrics(for: p, height: H).rowHeight
        XCTAssertEqual(center(1, 2, p) - center(1, 0, p), 2 * rowH, accuracy: 0.001)
        XCTAssertEqual(center(1, 2, p) - center(1, 0, p), 358.2 - 264.3, accuracy: 3)
        XCTAssertEqual(center(1, rows.count - 1, p) - center(1, 0, p), 637.2 - 264.3, accuracy: 6)
        let mid = (center(1, 0, p) + center(1, rows.count - 1, p)) / 2
        XCTAssertEqual(mid, (MushafPageLayout.headerCenter + MushafPageLayout.footerCenter) / 2 * H, accuracy: 0.001)
    }

    /// صفحتا 293 و301: امتداد الأسطر الـ15 يطابق المرجع (الحبر يختلف عن مركز الخانة بحد أقصى ≈10 نقاط).
    func testRegularPageSpansMatchReference() throws {
        for (n, first, last) in [(301, 124.2, 776.7), (293, 123.5, 782.3)] {
            let p = try page(n)
            XCTAssertEqual(MushafPageLayout.displayRows(p).count, 15)
            XCTAssertEqual(center(n, 0, p), first, accuracy: 12)
            XCTAssertEqual(center(n, 14, p), last, accuracy: 12)
        }
    }

    func testEveryPageFitsAndKeepsAllAyahLines() throws {
        for n in 1...Mushaf.pageCount {
            let p = try page(n), m = MushafPageLayout.metrics(for: p, height: H)
            XCTAssertEqual(m.rows.filter { $0.k == "l" }.count, p.rows.filter { $0.k == "l" }.count, "صفحة \(n)")
            XCTAssertGreaterThanOrEqual(m.top, MushafPageLayout.headerCenter * H, "صفحة \(n)")
            XCTAssertLessThanOrEqual(m.top + m.rowHeight * Double(m.rows.count), MushafPageLayout.footerCenter * H + 1, "صفحة \(n)")
        }
    }
}
