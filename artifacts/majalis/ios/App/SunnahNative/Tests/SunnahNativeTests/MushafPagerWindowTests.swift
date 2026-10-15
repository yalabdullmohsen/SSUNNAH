import XCTest
@testable import SunnahNative

/// نافذة TabView (±2) لا تكسر التنقل: القفز من الفهرس/البحث، اتجاه RTL، واستعادة آخر صفحة (يعتمد عليها نشر الموضع #3228).
final class MushafPagerWindowTests: XCTestCase {
    func testWindowAtEdgesAndMiddle() {
        XCTAssertEqual(Mushaf.pagerWindow(around: 1), 1...3)
        XCTAssertEqual(Mushaf.pagerWindow(around: 2), 1...4)
        XCTAssertEqual(Mushaf.pagerWindow(around: 300), 298...302)
        XCTAssertEqual(Mushaf.pagerWindow(around: 603), 601...604)
        XCTAssertEqual(Mushaf.pagerWindow(around: 604), 602...604)
        XCTAssertEqual(Mushaf.pagerWindow(around: 0), 1...3)
        XCTAssertEqual(Mushaf.pagerWindow(around: 9999), 602...604)
    }

    /// القفز لأي صفحة (فهرس/بحث): الهدف داخل النافذة والجارتان تُرسمان والباقي عناصر فارغة.
    func testJumpTargetsAreAlwaysRenderedWithNeighbours() {
        for target in [1, 2, 150, 300, 603, 604] {
            let w = Mushaf.pagerWindow(around: target)
            XCTAssertTrue(w.contains(target), "الهدف \(target) خارج النافذة")
            XCTAssertTrue(Mushaf.rendersPage(target, current: target))
            for n in w { XCTAssertEqual(Mushaf.rendersPage(n, current: target), abs(n - target) <= 1) }
            XCTAssertLessThanOrEqual(w.count, 5)
        }
    }

    /// RTL: الصفحة التالية n+1 تلي الحالية في الترتيب التصاعدي (TabView يعكسه بـlayoutDirection)، فتسلسل الوسوم متصل بلا ثقوب.
    func testWindowIsContiguousAscendingForRTLFlip() {
        for c in [1, 3, 300, 602, 604] {
            let pages = Array(Mushaf.pagerWindow(around: c))
            XCTAssertEqual(pages, pages.sorted())
            XCTAssertEqual(pages.last! - pages.first! + 1, pages.count)
            if c < 604 { XCTAssertTrue(pages.contains(c + 1)) }
            if c > 1 { XCTAssertTrue(pages.contains(c - 1)) }
        }
    }

    /// التقليب المتتابع عبر كامل المصحف لا يترك فجوة: كل صفحة تالية كانت مرسومة قبل بلوغها.
    func testSequentialFlipNeverLandsOnBlankPage() {
        for c in 1..<604 {
            XCTAssertTrue(Mushaf.pagerWindow(around: c).contains(c + 1))
            XCTAssertTrue(Mushaf.rendersPage(c + 1, current: c))
        }
    }

    func testRestoreLastPageAfterRelaunchOpensItsWindow() {
        let d = UserDefaults(suiteName: "mushaf-pager-\(UUID())")!
        let st = MushafStore(defaults: d)
        XCTAssertEqual(MushafStore(defaults: d).lastPage, 1)
        for p in [604, 1, 300] { st.visit(page: p); let re = MushafStore(defaults: d); XCTAssertEqual(re.lastPage, p); XCTAssertTrue(Mushaf.pagerWindow(around: re.lastPage).contains(p)) }
    }

    func testIndexSurahJumpTargetsLandInsideWindow() throws {
        let json = """
        {"surahs":[{"id":1,"name":"الفاتحة","ayahs":7,"firstPage":1,"lastPage":1,"place":"makkah","bismillahPre":false},
                   {"id":114,"name":"الناس","ayahs":6,"firstPage":604,"lastPage":604,"place":"makkah","bismillahPre":true}],
         "juzStart":[1,22],"ayahPage":{"1:1":1,"114:1":604}}
        """
        let idx = try JSONDecoder().decode(MushafIndex.self, from: Data(json.utf8))
        for s in idx.surahs { XCTAssertTrue(Mushaf.pagerWindow(around: s.firstPage).contains(s.firstPage)) }
        for (_, page) in idx.ayahPage { XCTAssertTrue(Mushaf.pagerWindow(around: page).contains(page)) }
    }

    /// البحث بالبيانات الحقيقية: نتيجة آية تقفز إلى صفحتها داخل النافذة (يُتخطّى دون MUSHAF_DATA/QURAN).
    func testSearchHitJumpLandsInsideWindow() throws {
        let env = ProcessInfo.processInfo.environment
        guard let d = env["MUSHAF_DATA"], let q = env["MUSHAF_QURAN"] else { throw XCTSkip("MUSHAF_DATA/MUSHAF_QURAN غير محددين") }
        let idx = try MushafRepository(root: URL(fileURLWithPath: d)).index()
        let s = try MushafSearch(surahDirectory: URL(fileURLWithPath: q), ayahPage: idx.ayahPage)
        for hit in s.search("الحمد لله رب العالمين") { XCTAssertTrue(Mushaf.pagerWindow(around: hit.page).contains(hit.page)) }
    }
}
