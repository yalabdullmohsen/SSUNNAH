import XCTest
import SwiftUI
@testable import SunnahNative

#if canImport(UIKit)
import UIKit
/// اختبارات أداء XCTest: بناء الشاشة + أول تخطيط داخل UIHostingController لأثقل مسارات القوالب.
/// تُسجَّل خطوط الأساس بـ Xcode (Set Baseline)؛ بدونها تطبع القياس ولا تفشل.
@MainActor
final class RoutePerfTests: XCTestCase {
    static let heavyPaths = ["/madhahib/hanbali", "/fiqh/topics/islamic-finance", "/islamic-landmarks/l1", "/nations/aad", "/tarikh-islami/x",
                             "/knowledge-graph", "/study-room", "/flashcards", "/reading-plans", "/progress"]

    private func resolve(_ p: String) -> AnyView? {
        FiqhSection.resolve(path: p) ?? SirahSection.resolve(path: p) ?? LearnSection.resolve(path: p)
    }

    private func layout(_ view: AnyView) {
        let host = UIHostingController(rootView: view)
        host.view.frame = CGRect(x: 0, y: 0, width: 402, height: 874)
        host.view.setNeedsLayout(); host.view.layoutIfNeeded()
    }

    func testFirstLayoutOfHeavyRoutes() {
        let views: [(String, AnyView)] = Self.heavyPaths.compactMap { p in
            resolve(p).map { (p, $0) }
        }
        XCTAssertEqual(views.count, Self.heavyPaths.count, "كل المسارات يجب أن تُحَل")
        measure(metrics: [XCTClockMetric(), XCTMemoryMetric()], options: { let o = XCTMeasureOptions(); o.iterationCount = 5; return o }()) {
            for (_, v) in views { layout(v) }
        }
    }

    func testRouteResolutionCost() {
        measure(metrics: [XCTClockMetric()]) {
            for p in Self.heavyPaths { _ = resolve(p) }
        }
    }
}
#endif
