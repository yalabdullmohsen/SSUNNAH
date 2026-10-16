#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// حارس التقليب: حركة = صفحة واحدة، RTL (الصفحة 1 يمينًا)، بلا نصف صفحة؛ 604 صفحة × كل أحجام الأجهزة.
final class MushafPagerTests: XCTestCase {
    static let widths: [CGFloat] = [375, 402, 440, 834, 1032]
    let count = Mushaf.pageCount

    func testOffsetRoundTripOnAllPagesAndSizes() {
        for w in Self.widths {
            for n in 1...count {
                let x = MushafPager<EmptyView>.offsetX(page: n, width: w, count: count)
                XCTAssertEqual(x.truncatingRemainder(dividingBy: w), 0, "الإزاحة ليست مضاعف عرض (نصف صفحة) w=\(w) n=\(n)")
                XCTAssertEqual(MushafPager<EmptyView>.page(atOffsetX: x, width: w, count: count), n, "w=\(w) n=\(n)")
            }
        }
    }

    func testPageOneIsRightmostAndLastIsLeftmost() {
        XCTAssertEqual(MushafPager<EmptyView>.offsetX(page: 1, width: 402, count: count), CGFloat(count - 1) * 402)
        XCTAssertEqual(MushafPager<EmptyView>.offsetX(page: count, width: 402, count: count), 0)
    }

    /// أي سحب/سرعة من أي صفحة: الهدف ضمن ±1 ومضاعف عرض، والاتجاه صحيح (RTL: سحب لليسار = الصفحة التالية).
    func testOneGestureMovesAtMostOnePageWithRightDirection() {
        let velocities: [CGFloat] = [-8, -2, -0.5, -0.1, 0, 0.1, 0.5, 2, 8]
        let drags: [CGFloat] = [-1.4, -0.8, -0.4, -0.2, 0, 0.2, 0.4, 0.8, 1.4]   // كسر من العرض
        for w in Self.widths {
            for start in 1...count {
                let base = MushafPager<EmptyView>.offsetX(page: start, width: w, count: count)
                for v in velocities {
                    for d in drags {
                        let t = MushafPager<EmptyView>.targetPage(start: start, offsetX: base + d * w, velocityX: v, width: w, count: count)
                        XCTAssertLessThanOrEqual(abs(t - start), 1, "قفزة >1: w=\(w) start=\(start) v=\(v) d=\(d)")
                        XCTAssertTrue((1...self.count).contains(t))
                        if abs(v) > 0.2 && !((start == 1 && v > 0) || (start == self.count && v < 0)) { XCTAssertEqual(t, start + (v > 0 ? -1 : 1), "اتجاه خاطئ w=\(w) start=\(start) v=\(v)") }
                    }
                }
            }
        }
    }

    func testSlowShortDragSnapsBack() {
        let w: CGFloat = 402, start = 300
        let base = MushafPager<EmptyView>.offsetX(page: start, width: w, count: count)
        XCTAssertEqual(MushafPager<EmptyView>.targetPage(start: start, offsetX: base + 0.2 * w, velocityX: 0, width: w, count: count), start)
        XCTAssertEqual(MushafPager<EmptyView>.targetPage(start: start, offsetX: base + 0.5 * w, velocityX: 0, width: w, count: count), start - 1)
        XCTAssertEqual(MushafPager<EmptyView>.targetPage(start: start, offsetX: base - 0.5 * w, velocityX: 0, width: w, count: count), start + 1)
    }

    /// العرض الفعلي: UICollectionView واحد بـ604 عنصرًا، RTL، والقفز إلى الصفحة يضع الإزاحة على حد صفحة تمامًا (لا نصف صفحة) على كل الأحجام.
    @MainActor func testRealCollectionViewIsRTLWith604ItemsAndSnapsToPageBoundary() throws {
        for w in Self.widths {
            let size = CGSize(width: w, height: w * 2.1)
            var page = 1
            let binding = Binding(get: { page }, set: { page = $0 })
            let host = UIHostingController(rootView: MushafPager(current: binding, count: count, renderKey: AnyHashable(0)) { n in Text("\(n)") })
            let win = UIWindow(frame: CGRect(origin: .zero, size: size)); win.rootViewController = host; win.makeKeyAndVisible()
            host.view.frame = win.bounds; host.view.layoutIfNeeded()
            let cv = try XCTUnwrap(Self.collectionView(in: host.view), "UICollectionView غير موجود w=\(w)")
            XCTAssertEqual(cv.semanticContentAttribute, .forceRightToLeft)
            XCTAssertEqual(cv.numberOfItems(inSection: 0), count)
            for target in [1, 150, 2, 300, 603, 400, 604] {   // بلا تجاور: تمرير الصفحة المجاورة متحرّك ولا يكتمل في نافذة اختبار
                page = target
                host.rootView = MushafPager(current: binding, count: count, renderKey: AnyHashable(target)) { n in Text("\(n)") }
                host.view.layoutIfNeeded(); cv.layoutIfNeeded(); for _ in 0..<40 where MushafPager<EmptyView>.page(atOffsetX: cv.contentOffset.x, width: w, count: count) != target || cv.contentOffset.x.truncatingRemainder(dividingBy: w) != 0 { RunLoop.current.run(until: Date().addingTimeInterval(0.1)) }   // انتقال الصفحة المجاورة متحرّك: انتظر استقراره حتى 4ث
                XCTAssertEqual(cv.contentOffset.x.truncatingRemainder(dividingBy: w), 0, "نصف صفحة w=\(w) صفحة \(target)")
                XCTAssertEqual(MushafPager<EmptyView>.page(atOffsetX: cv.contentOffset.x, width: w, count: count), target, "w=\(w)")
            }
            win.isHidden = true
        }
    }

    private static func collectionView(in v: UIView) -> UICollectionView? {
        if let c = v as? UICollectionView { return c }
        for s in v.subviews { if let c = collectionView(in: s) { return c } }
        return nil
    }
}
#endif
