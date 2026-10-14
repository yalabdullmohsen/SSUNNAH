import XCTest

/// قياس تقطيع تقليب المصحف آليًا (ن3): 50 تقليبة على المحاكي مع XCTHitchMetric وXCTOSSignpostMetric.
/// الهدف: لا خطوة فوق 16.7ms وp95 < 8ms. تُطبع الأرقام في السجل بسطر MUSHAF_HITCH.
final class MushafFlipHitchUITests: XCTestCase {
    func testFlip50Pages() throws {
        let app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(ar)", "-AppleLocale", "ar_SA", "-snapshotRoute", "/mushaf/page/100"]
        let t0 = Date()
        app.launch()
        let page = app.descendants(matching: .any)["mushaf.pageNumber"]
        XCTAssertTrue(page.waitForExistence(timeout: 20), "المصحف لم يُفتح")
        print("MUSHAF_COLD_OPEN_MS=\(Int(Date().timeIntervalSince(t0) * 1000))")
        let opts = XCTMeasureOptions(); opts.iterationCount = 3
        var stepMs: [Double] = []
        var metrics: [XCTMetric] = [XCTOSSignpostMetric.scrollingAndDecelerationMetric]
        if #available(iOS 26.0, *) { metrics.append(XCTHitchMetric(application: app)) }
        measure(metrics: metrics, options: opts) {
            for _ in 0..<50 {
                let t = Date()
                app.swipeRight(velocity: .fast)   // RTL: السحب لليمين = الصفحة التالية
                stepMs.append(Date().timeIntervalSince(t) * 1000)
            }
            for _ in 0..<50 { app.swipeLeft(velocity: .fast) }   // العودة لتكرار القياس
        }
        stepMs.sort()
        let p95 = stepMs[Int(Double(stepMs.count) * 0.95)]
        print("MUSHAF_HITCH swipe_p95_ms=\(p95) swipe_max_ms=\(stepMs.last ?? 0) n=\(stepMs.count)")
    }
}
