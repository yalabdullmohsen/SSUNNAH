import XCTest

/// قياس الإقلاع: XCTApplicationLaunchMetric (حتى تستجيب الواجهة) + زمن ظهور الرئيسية الفعلي.
/// كل تكرار عملية جديدة (كاش النظام دافئ). التشغيل بنسخة Release: `-configuration Release`.
final class LaunchPerfUITests: XCTestCase {
    private func options() -> XCTMeasureOptions { let o = XCTMeasureOptions(); o.iterationCount = 8; return o }

    func testLaunchUntilResponsive() {
        measure(metrics: [XCTApplicationLaunchMetric(waitUntilResponsive: true)], options: options()) {
            let app = XCUIApplication()
            app.launchArguments += ["-AppleLanguages", "(ar)", "-AppleLocale", "ar_SA"]
            app.launch()
        }
    }

    func testLaunchUntilHomeVisible() {
        measure(metrics: [XCTClockMetric()], options: options()) {
            let app = XCUIApplication()
            app.launchArguments += ["-AppleLanguages", "(ar)", "-AppleLocale", "ar_SA"]
            app.launch()
            XCTAssertTrue(app.buttons["home.card.prayer"].waitForExistence(timeout: 30))
            app.terminate()
        }
    }
}
