import XCTest
import CoreText
@testable import SunnahNative

/// حارس توزيع الكلمات على الأسطر (طوارئ 2026-10-20، ص27): خط QPC V2 مصمَّم بحيث يتساوى عرض أسطر الصفحة الكاملة،
/// فسطر أعرض من وسيط أسطر صفحته بأكثر من `maxOverflow` (عرض CTLine بالتقنين يتفاوت حتى 8٪ في البيانات السليمة) يعني كلمة في غير سطرها — فيصغر خط الصفحة كلها وتتسع فراغاتها.
/// (ص27 قبل التصحيح: السطر 14 = +11.7٪). صفحتا الفاتحة وأول البقرة (1، 2) تخطيطهما خاص فتُستثنيان. دون `MUSHAF_DATA` يُتخطّى.
final class MushafLineWidthGuardTests: XCTestCase {
    static let maxOverflow: CGFloat = 0.09

    func testNoLineOverflowsItsPageOnAll604Pages() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: dp))
        var bad: [String] = []
        for n in 3...Mushaf.pageCount {
            let page = try repo.page(n), fam = try repo.ensureFont(page: n)
            let font = CTFontCreateWithName(fam as CFString, 100, nil)
            let widths: [CGFloat] = page.rows.filter { $0.k == "l" }.map { r in
                let s = (r.w ?? []).map(\.c).joined()
                let a = NSAttributedString(string: s, attributes: [NSAttributedString.Key(kCTFontAttributeName as String): font])
                return CGFloat(CTLineGetTypographicBounds(CTLineCreateWithAttributedString(a), nil, nil, nil))
            }
            guard widths.count >= 3 else { continue }
            let med = widths.sorted()[widths.count / 2]
            for (i, w) in widths.enumerated() where w > med * (1 + Self.maxOverflow) {
                bad.append("ص\(n) س\(i + 1): \(Int((w / med - 1) * 100))٪")
            }
        }
        XCTAssertTrue(bad.isEmpty, "أسطر أعرض من صفحتها (كلمة في غير سطرها): \(bad)")
    }
}
