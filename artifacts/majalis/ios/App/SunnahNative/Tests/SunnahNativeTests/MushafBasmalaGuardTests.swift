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

    /// حجم البسملة واحد في كل سور الـ112 (على عدة عروض): لا يتبع حجم خط الصفحة. الطفرة «حجم الصفحة» (الكود القديم) يجب أن تُنتج أحجامًا متفاوتة فيفشل الحارس عليها.
    func testBasmalaSizeIsIdenticalAcrossAllSurahs() throws {
        let r = try repo()
        for w in [CGFloat(378), 784] {
            var current = Set<Int>(), legacy = Set<Int>()
            var seen = 0
            for n in 1...604 {
                let page = try r.page(n)
                guard page.rows.contains(where: { $0.k == "b" }) else { continue }
                seen += 1
                // الحجم الموحّد ثابت بالتعريف؛ تخطيط الصفحة (الثقيل) يُقاس على كل ثالثة لإثبات أن الطفرة تتفاوت.
                if seen % 3 != 0 { current.insert(Int((MushafMetrics.basmalaFontSize(width: w) * 100).rounded())); continue }
                let family = try r.ensureFont(page: n)
                let m = MushafPageLayout.metrics(for: page, height: 874)
                let fs = MushafMetrics.layout(rows: m.rows, family: family, width: w, maxFont: CGFloat(m.rowHeight) * 0.8).fontSize
                current.insert(Int((MushafMetrics.basmalaFontSize(width: w) * 100).rounded()))
                legacy.insert(Int((fs * 10).rounded()))
            }
            XCTAssertEqual(current.count, 1, "حجم البسملة يتفاوت بين السور w=\(w)")
            XCTAssertGreaterThan(legacy.count, 1, "الطفرة (حجم الصفحة) لم تتفاوت: الاختبار لا يكشف الكود القديم w=\(w)")
        }
    }
}
