import XCTest
import Foundation
@testable import SunnahNative

#if os(macOS)
/// قياس أداء مسار بيانات المصحف (ن3). يطبع أرقامًا بالميلي ثانية ولا يفشل إلا عند تجاوز الميزانيات المعلنة.
/// البيئة: `MUSHAF_DATA`. النتائج تُدوَّن في docs/native/perf/mushaf.md.
final class MushafPerfTests: XCTestCase {
    private func rss() -> Double {
        var info = mach_task_basic_info(); var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size / MemoryLayout<natural_t>.size)
        let kr = withUnsafeMutablePointer(to: &info) { $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) { task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count) } }
        return kr == KERN_SUCCESS ? Double(info.resident_size) / 1_048_576 : 0
    }
    private func ms(_ f: () throws -> Void) rethrows -> Double {
        let t = DispatchTime.now().uptimeNanoseconds; try f(); return Double(DispatchTime.now().uptimeNanoseconds - t) / 1e6
    }
    /// ما تفعله MushafPageView عند أول عرض: خط + صفحة + تخطيط.
    private func openPage(_ repo: MushafRepository, _ n: Int) throws {
        let family = try repo.ensureFont(page: n), page = try repo.page(n)
        let m = MushafPageLayout.metrics(for: page, height: 874)
        _ = MushafMetrics.layout(rows: m.rows, family: family, width: 402 * 0.94, maxFont: CGFloat(m.rowHeight) * 0.8)
    }

    func testBaseline() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let root = URL(fileURLWithPath: p)
        let repo = MushafRepository(root: root)
        let cold = try ms { _ = try repo.index(); try openPage(repo, 301) }
        let warm = try ms { try openPage(repo, 301) }
        let m0 = rss()
        var per: [Double] = []
        for n in 100..<150 { per.append(try ms { try openPage(repo, n) }) }
        per.sort()
        let m1 = rss()
        let fontOnly = try ms { for n in 200..<210 { try repo.ensureFont(page: n) } } / 10
        let layoutOnly: Double = try {
            let page = try repo.page(301), m = MushafPageLayout.metrics(for: page, height: 874), f = Mushaf.fontFamily(page: 301)
            return ms { for _ in 0..<20 { _ = MushafMetrics.layout(rows: m.rows, family: f, width: 378, maxFont: 40) } } / 20
        }()
        print("MUSHAF_PERF cold_open_ms=\(cold) warm_open_ms=\(warm) flip50_mean_ms=\(per.reduce(0, +) / 50) flip50_p95_ms=\(per[47]) flip50_max_ms=\(per[49]) rss_before_mb=\(m0) rss_after50_mb=\(m1) font_register_ms=\(fontOnly) layout_ms=\(layoutOnly)")
    }

    /// بعد #3201: ما يبقى على الخيط الرئيسي عند التقليب = بحث في الكاش (الخط/الصفحة/التخطيط جُهّزت بالتحميل المسبق ±2 في الخلفية).
    /// يحاكي قارئًا يقلّب كل ~120ms؛ «إطار ضائع» = كلفة رئيسية > 16.7ms (ميزانية 60Hz).
    func testAfterCache() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), size = CGSize(width: 402, height: 874)
        func openCached(_ n: Int) throws {
            let family = try repo.ensureFont(page: n), page = try repo.page(n)
            _ = repo.pageLayout(page, family: family, size: size)
        }
        let cold = try ms { _ = try repo.index(); try openCached(301) }
        let warm = try ms { try openCached(301) }
        let m0 = rss()
        var per: [Double] = []
        repo.prefetch(around: 100, size: size)
        for n in 101..<151 {
            Thread.sleep(forTimeInterval: 0.12)
            per.append(try ms { try openCached(n) })
            repo.prefetch(around: n, size: size)
        }
        let dropped = per.filter { $0 > 16.7 }.count
        per.sort()
        let m1 = rss()
        print("MUSHAF_PERF_AFTER cold_open_ms=\(cold) warm_open_ms=\(warm) flip50_mean_ms=\(per.reduce(0, +) / 50) flip50_p95_ms=\(per[47]) flip50_max_ms=\(per[49]) over_16_7ms=\(dropped) rss_before_mb=\(m0) rss_after50_mb=\(m1) cached_pages=\(repo.cachedPageCount)")
    }
}
#endif
