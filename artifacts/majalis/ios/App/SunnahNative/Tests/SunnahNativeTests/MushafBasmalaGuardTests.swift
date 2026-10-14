import XCTest
@testable import SunnahNative

/// حارس شرعي: بسملة بدايات السور (أسطر "b" من تخطيط QPC، الـ112 عدا الفاتحة والتوبة) تُعرض نصًّا بخط QPC نفسه كما في الفاتحة.
final class MushafBasmalaGuardTests: XCTestCase {
    private func repo() throws -> MushafRepository {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        return try MushafRepository(root: URL(fileURLWithPath: p))
    }

    /// الفاتحة: البسملة آية 1 نصٌّ قرآني بخط QPC في سطر "l"، ولا سطر "b" في الصفحة.
    func testFatihaBasmalaStaysQuranText() throws {
        let p = try repo().page(1)
        XCTAssertFalse(p.rows.contains { $0.k == "b" })
        let first = try XCTUnwrap(p.rows.first { $0.k == "l" })
        XCTAssertFalse((first.w ?? []).isEmpty)
        XCTAssertEqual(p.rows.first { $0.k == "l" }?.w?.first?.c.isEmpty, false)
    }

    /// التوبة (صفحة 187): لافتة بلا بسملة.
    func testTawbaHasNoBasmala() throws {
        let p = try repo().page(187)
        XCTAssertTrue(p.rows.contains { $0.k == "h" && $0.s == 9 })
        XCTAssertFalse(p.rows.contains { $0.k == "b" })
    }

    /// عبر الصفحات الـ604: 112 سطر "b" بالضبط، كلٌّ منها يلي لافتة سورة غير 1 و9 مباشرة.
    func testBasmalaRowsOnlyAfterBannersOfOtherSurahs() throws {
        let r = try repo()
        var count = 0
        for n in 1...604 {
            let rows = try r.page(n).rows
            for (i, row) in rows.enumerated() where row.k == "b" {
                count += 1
                XCTAssertGreaterThan(i, 0, "صفحة \(n)")
                XCTAssertEqual(rows[i - 1].k, "h", "صفحة \(n)")
                XCTAssertFalse([1, 9].contains(rows[i - 1].s ?? 0), "صفحة \(n)")
                XCTAssertNil(row.w, "سطر البسملة بلا كلمات")
            }
        }
        XCTAssertEqual(count, 112)
    }

    /// جلايفات البسملة هي الكلمات الأربع الأولى من آية الفاتحة 1 بخط الصفحة 1 دون علامة النهاية.
    func testBasmalaGlyphsAreFatihaAyah1Words() throws {
        let r = try repo()
        let b = try XCTUnwrap(BasmalaText.load(r))
        let words = try XCTUnwrap(r.page(1).rows.first { $0.k == "l" }?.w)
        XCTAssertEqual(b.glyphs, words.filter { !$0.isAyahEnd }.map(\.c))
        XCTAssertEqual(b.glyphs.count, 4)
        XCTAssertTrue(words.allSatisfy { $0.v == "1:1" })
    }
}
