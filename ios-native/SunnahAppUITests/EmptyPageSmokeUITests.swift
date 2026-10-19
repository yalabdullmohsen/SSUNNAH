import XCTest

/// دخان: يمرّ على كل تبويب، ثم على كل عنصر في «الأقسام»، يفتح كل وجهة ويتحقق أن محتواها غير فارغ
/// (يكشف صفحات بعنوان فقط مثل «البحث في القرآن» و«اللغة والمكتبة والبحث»)، ثم يعود.
final class EmptyPageSmokeUITests: XCTestCase {
    private var app: XCUIApplication!
    private static let tabs = ["الرئيسية", "المصحف", "الصلاة", "الأقسام", "المزيد"]
    private static let minBodyElements = 3

    override func setUpWithError() throws {
        continueAfterFailure = true
        app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(ar)", "-AppleLocale", "ar_SA", "-strictOpenRoute"]
        app.launch()
        XCTAssertTrue(app.buttons["home.card.prayer"].waitForExistence(timeout: 30), "الرئيسية لم تظهر")
    }

    private var back: XCUIElement { app.navigationBars.buttons.element(boundBy: 0) }

    /// عناصر محتوى فعلية: نصوص/أزرار/صور خارج شريط التنقل وشريط التبويبات.
    private func bodyCount() -> Int {
        let nav = app.navigationBars.firstMatch
        let navFrame = nav.exists ? nav.frame : .zero
        let tabs = Set(Self.tabs)
        var n = 0
        for q in [app.staticTexts, app.buttons, app.images, app.cells] as [XCUIElementQuery] {
            for el in q.allElementsBoundByIndex.prefix(60) where el.exists && el.frame.height > 0 {
                if navFrame != .zero, navFrame.contains(el.frame) { continue }
                if tabs.contains(el.label) { continue }
                n += 1
            }
        }
        return n
    }

    private func assertNotEmpty(_ what: String, file: StaticString = #filePath, line: UInt = #line) {
        let deadline = Date().addingTimeInterval(8)
        while bodyCount() < Self.minBodyElements && Date() < deadline { usleep(400_000) }
        let n = bodyCount()
        XCTAssertGreaterThanOrEqual(n, Self.minBodyElements, "\(what): الصفحة فارغة (\(n) عنصر محتوى)", file: file, line: line)
        for bad in ["تعذّر فتح", "قيد التوثيق", "قيد الإعداد"] where app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", bad)).count > 0 {
            XCTFail("\(what): \(bad)", file: file, line: line)
        }
    }

    func testEveryTabIsNotEmpty() {
        for t in Self.tabs {
            let b = app.buttons[t].firstMatch
            guard b.waitForExistence(timeout: 10) else { XCTFail("التبويب \(t) غير موجود"); continue }
            b.tap()
            assertNotEmpty("تبويب \(t)")
            tapFirstItem("تبويب \(t)")
        }
    }

    /// ينقر أول صف/زر قابل للنقر في المحتوى، يتحقق أن الوجهة غير فارغة، ثم يعود إن فُتحت شاشة أعمق.
    private func tapFirstItem(_ what: String) {
        let cands = app.cells.count > 0 ? app.cells : app.scrollViews.buttons
        for i in 0..<min(cands.count, 5) {
            let c = cands.element(boundBy: i)
            guard c.exists, c.isHittable else { continue }
            c.tap()
            if back.waitForExistence(timeout: 4) {
                assertNotEmpty("أول عنصر في \(what)")
                back.tap()
                return
            }
        }
    }

    func testEverySectionDestinationIsNotEmpty() {
        app.buttons["الأقسام"].firstMatch.tap()
        let items = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'sections.item.'"))
        XCTAssertTrue(items.firstMatch.waitForExistence(timeout: 15), "صفحة الأقسام فارغة")
        var visited = Set<String>(), idle = 0
        while idle < 3 {
            var progressed = false
            for el in items.allElementsBoundByIndex where el.exists {
                let id = el.identifier
                guard !visited.contains(id), el.isHittable else { continue }
                visited.insert(id); progressed = true
                el.tap()
                if back.waitForExistence(timeout: 10) {
                    assertNotEmpty(id)
                    tapFirstItem(id)
                    if back.exists { back.tap() }
                } else { XCTFail("\(id): لم تُفتح شاشة") }
                _ = items.firstMatch.waitForExistence(timeout: 10)
                break
            }
            if !progressed { app.windows.firstMatch.swipeUp(velocity: .slow); idle += 1 } else { idle = 0 }
        }
        XCTAssertGreaterThanOrEqual(visited.count, 15, "عناصر الأقسام أقل من المتوقع")
    }
}
