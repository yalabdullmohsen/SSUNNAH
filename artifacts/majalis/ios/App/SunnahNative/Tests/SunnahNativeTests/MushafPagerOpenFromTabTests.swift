#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// عطل RC3 (104): فتح المصحف من التبويب كان يُظهر لحظةً 604 صفحة مصغّرة في شبكة لأن حجم عنصر FlowLayout يبقى 50×50 الافتراضي قبل أول layout صالح.
/// الاختبار يفتح المصحف عبر المسار الحقيقي (RootTabView + AppRouter + الشريط العائم) على عدة أحجام ويأخذ عيّنات كل إطار:
/// لا عنصر قبل حدود صالحة، وكل خلية ظاهرة بحجم الشاشة بالضبط، وعدد الخلايا الظاهرة ≤ 3، وبعد الاستقرار عنصر واحد فقط.
final class MushafPagerOpenFromTabTests: XCTestCase {
    static let sizes: [CGSize] = [CGSize(width: 375, height: 667), CGSize(width: 402, height: 874), CGSize(width: 440, height: 956), CGSize(width: 834, height: 1194), CGSize(width: 1032, height: 1376)]

    private static func pager(in v: UIView) -> MushafPagerCollectionView? {
        if let c = v as? MushafPagerCollectionView { return c }
        for s in v.subviews { if let c = pager(in: s) { return c } }
        return nil
    }

    func testLayoutNeverProducesItemsWithoutValidBounds() {
        XCTAssertFalse(MushafPager<EmptyView>.isValidSize(.zero))
        XCTAssertFalse(MushafPager<EmptyView>.isValidSize(CGSize(width: 0, height: 800)))
        XCTAssertFalse(MushafPager<EmptyView>.isValidSize(CGSize(width: -1, height: 800)))
        XCTAssertFalse(MushafPager<EmptyView>.isValidSize(CGSize(width: CGFloat.infinity, height: 800)))
        XCTAssertTrue(MushafPager<EmptyView>.isValidSize(CGSize(width: 402, height: 874)))
        let cv = MushafPagerCollectionView(frame: .zero, collectionViewLayout: MushafPagerLayout())
        XCTAssertEqual(cv.collectionViewLayout.layoutAttributesForElements(in: CGRect(x: 0, y: 0, width: 5000, height: 5000))?.count, 0, "عناصر بحدود صفرية")
        XCTAssertEqual(cv.collectionViewLayout.collectionViewContentSize, .zero)
    }

    @MainActor func testOpeningMushafFromTabShowsOneFullSizePageAtEveryFrame() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: dp)), idx = try repo.index()
        for size in Self.sizes {
            for start in [1, 150, 604] {   // الفتح من الرئيسية/الفهرس/البحث/المتابعة كلها تصل لنفس القارئ بصفحة بدء مختلفة
                let router = AppRouter()
                let store = MushafStore()
                let root = RootTabView(router: router) { route in
                    route.path.hasPrefix("/mushaf")
                        ? AnyView(MushafReaderView(repo: repo, index: idx, search: nil, store: store, startPage: start))
                        : AnyView(Color.clear)
                }
                let host = UIHostingController(rootView: root)
                let win = (UIApplication.shared.connectedScenes.first as? UIWindowScene).map { UIWindow(windowScene: $0) } ?? UIWindow()
                win.frame = CGRect(origin: .zero, size: size); win.rootViewController = host; win.makeKeyAndVisible()
                host.view.frame = win.bounds; host.view.layoutIfNeeded()
                router.open(path: "/mushaf")          // الفتح من التبويب كما في الجهاز
                var worst = 0, bad: [String] = []
                let t0 = Date(), deadline = t0.addingTimeInterval(2.0)
                while Date() < deadline {
                    RunLoop.current.run(until: Date().addingTimeInterval(0.016))
                    guard let cv = Self.pager(in: host.view) else { continue }
                    let cells = cv.visibleCells
                    worst = max(worst, cells.count)
                    if !MushafPager<EmptyView>.isValidSize(cv.bounds.size) { if !cells.isEmpty { bad.append("خلايا بحدود غير صالحة") }; continue }
                    for c in cells where abs(c.bounds.width - cv.bounds.width) > 0.5 || abs(c.bounds.height - cv.bounds.height) > 0.5 {
                        bad.append("خلية \(Int(c.bounds.width))×\(Int(c.bounds.height)) ≠ \(Int(cv.bounds.width))×\(Int(cv.bounds.height))")
                    }
                }
                let cv = try XCTUnwrap(Self.pager(in: host.view), "المُقلِّب لم يظهر w=\(size.width)")
                XCTAssertTrue(bad.isEmpty, "حجم خاطئ أثناء الفتح w=\(size.width) start=\(start): \(Set(bad))")
                XCTAssertLessThanOrEqual(worst, MushafPager<EmptyView>.maxVisiblePages, "أكثر من \(MushafPager<EmptyView>.maxVisiblePages) صفحات معًا w=\(size.width) start=\(start)")
                XCTAssertEqual(cv.visibleCells.count, 1, "بعد الاستقرار يجب أن يظهر عنصر واحد فقط w=\(size.width) start=\(start)")
                XCTAssertEqual(cv.visibleCells.first.flatMap { cv.indexPath(for: $0)?.item }, start - 1, "الصفحة الحالية غير صفحة البدء w=\(size.width)")
                XCTAssertEqual(cv.numberOfItems(inSection: 0), Mushaf.pageCount)
                win.isHidden = true
            }
        }
    }

    /// القلب السريع: من 604 إلى 1 (قفزة كاملة) ثم عودة، بلا فراغ (صفر خلايا) ولا أكثر من 3 خلايا في أي إطار، وتستقر خلية واحدة بحجم الشاشة.
    @MainActor func testFastFlipFrom604To1KeepsPageAndNeverBlank() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: dp)), idx = try repo.index()
        for size in [CGSize(width: 402, height: 874), CGSize(width: 834, height: 1194)] {
            let router = AppRouter(), store = MushafStore()
            let root = RootTabView(router: router) { route in
                route.path.hasPrefix("/mushaf") ? AnyView(MushafReaderView(repo: repo, index: idx, search: nil, store: store, startPage: 604)) : AnyView(Color.clear)
            }
            let host = UIHostingController(rootView: root)
            let win = (UIApplication.shared.connectedScenes.first as? UIWindowScene).map { UIWindow(windowScene: $0) } ?? UIWindow()
            win.frame = CGRect(origin: .zero, size: size); win.rootViewController = host; win.makeKeyAndVisible()
            host.view.frame = win.bounds; host.view.layoutIfNeeded()
            router.open(path: "/mushaf")
            RunLoop.current.run(until: Date().addingTimeInterval(1.2))
            let cv = try XCTUnwrap(Self.pager(in: host.view))
            var worst = 0, blanks = 0
            for target in [0, 603, 0, 300, 0] {
                cv.scrollToItem(at: IndexPath(item: target, section: 0), at: .centeredHorizontally, animated: false)
                let end = Date().addingTimeInterval(0.8)
                while Date() < end {
                    RunLoop.current.run(until: Date().addingTimeInterval(0.016))
                    worst = max(worst, cv.visibleCells.count)
                    if cv.visibleCells.isEmpty { blanks += 1 }
                }
                XCTAssertEqual(cv.visibleCells.count, 1, "بعد القفز إلى \(target + 1) w=\(size.width)")
                XCTAssertEqual(cv.visibleCells.first.flatMap { cv.indexPath(for: $0)?.item }, target, "القفز لم يصل w=\(size.width)")
            }
            XCTAssertLessThanOrEqual(worst, MushafPager<EmptyView>.maxVisiblePages)
            XCTAssertEqual(blanks, 0, "إطارات فارغة أثناء القلب السريع w=\(size.width)")
            win.isHidden = true
        }
    }
}
#endif
