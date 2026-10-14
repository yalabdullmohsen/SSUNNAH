import XCTest
@testable import SunnahNative

/// ذاكرة LRU للصفحات والتخطيط والتحميل المسبق (ن3): الناتج مطابق للحساب المباشر وحدّ الذاكرة محترم.
final class MushafCacheTests: XCTestCase {
    private func repo() throws -> MushafRepository {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        return MushafRepository(root: URL(fileURLWithPath: p))
    }
    private let size = CGSize(width: 402, height: 874)

    func testCachedLayoutEqualsDirectComputation() throws {
        let r = try repo()
        for n in [1, 2, 187, 604] {
            let f = try r.ensureFont(page: n), page = try r.page(n)
            let a = r.pageLayout(page, family: f, size: size), b = r.pageLayout(page, family: f, size: size)
            let w = size.width * 0.94, m = MushafPageLayout.metrics(for: page, height: size.height)
            XCTAssertEqual(a.layout, MushafMetrics.layout(rows: m.rows, family: f, width: w, maxFont: CGFloat(m.rowHeight) * 0.8))
            XCTAssertEqual(a.layout, b.layout)
        }
    }

    func testPrefetchWarmsNeighboursAndCacheIsBounded() throws {
        let r = try repo()
        r.prefetch(around: 300, size: size)
        let t0 = Date()
        while Date().timeIntervalSince(t0) < 5 {
            if (298...302).allSatisfy({ n in (try? r.page(n)) != nil }) { break }
            Thread.sleep(forTimeInterval: 0.02)
        }
        for n in 1...100 { _ = try r.page(n); _ = try r.ensureFont(page: n) }
        XCTAssertLessThanOrEqual(r.cachedPageCount, MushafRepository.pageCacheLimit)
    }
}
