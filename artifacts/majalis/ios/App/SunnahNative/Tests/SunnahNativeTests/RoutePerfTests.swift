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

#if canImport(UIKit)
/// ميزانيات صلبة تفشل عند التراجع. القياس الأساسي على المحاكي (n4-sim، Debug): أول تخطيط ≈27ms لـ10 مسارات مجتمعة
/// (≈3ms/مسار)؛ الميزانيتان أدناه هدف المالك (مسار <150ms، تعليق الخيط الرئيسي <100ms) وهما أوسع بكثير من القياس،
/// فالتسامح الفعلي واسع عمدًا لأن المحاكي/CI متذبذب؛ ويُشدَّد لاحقًا بقياس Release على جهاز.
@MainActor
final class RouteBudgetTests: XCTestCase {
    static let routeBudgetMs = 150.0
    static let hangBudgetMs = 100.0

    func testEachHeavyRouteFirstLayoutWithinBudget() {
        var worst = 0.0
        // أول استضافة SwiftUI في العملية تكلّف ≈210ms (تهيئة النظام) وليست كلفة مسار؛ نسخّنها خارج القياس.
        let warm = UIHostingController(rootView: Text("")); warm.view.frame = CGRect(x: 0, y: 0, width: 402, height: 874); warm.view.layoutIfNeeded()
        for p in RoutePerfTests.heavyPaths {
            guard let v = FiqhSection.resolve(path: p) ?? SirahSection.resolve(path: p) ?? LearnSection.resolve(path: p) else { XCTFail("لا يُحَل: \(p)"); continue }
            let t = DispatchTime.now().uptimeNanoseconds
            let host = UIHostingController(rootView: v)
            host.view.frame = CGRect(x: 0, y: 0, width: 402, height: 874)
            host.view.setNeedsLayout(); host.view.layoutIfNeeded()
            let ms = Double(DispatchTime.now().uptimeNanoseconds - t) / 1e6
            worst = max(worst, ms)
            XCTAssertLessThan(ms, Self.routeBudgetMs, "\(p) تجاوز ميزانية المسار")
        }
        // أطول عمل متصل على الخيط الرئيسي = أسوأ مسار مفرد؛ يجب ألا يبلغ حدّ التعليق.
        XCTAssertLessThan(worst, Self.hangBudgetMs, "تعليق محتمل على الخيط الرئيسي")
    }
}
#endif
