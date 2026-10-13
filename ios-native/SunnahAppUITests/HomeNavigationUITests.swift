import XCTest

/// ينقر كل بلاطة وبطاقة في الرئيسية وكل عنصر في «كل الأقسام»، ويتحقق أن الشاشة فُتحت فعلًا
/// (زر رجوع، لا «تعذّر فتح»/«قيد التوثيق») ثم يعود. يلتقط عطل «النقر لا يفتح شيئًا» الذي لا تكشفه لقطات -snapshotRoute.
final class HomeNavigationUITests: XCTestCase {
    private var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = true
        app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(ar)", "-AppleLocale", "ar_SA", "-strictOpenRoute"]
        app.launch()
        XCTAssertTrue(homeMarker.waitForExistence(timeout: 30), "الرئيسية لم تظهر")
    }

    private var homeMarker: XCUIElement { app.buttons["home.card.prayer"] }
    private var back: XCUIElement { app.navigationBars.buttons.element(boundBy: 0) }

    private static let tiles = ["/quran-hub", "/hadith", "/lessons", "/fiqh", "/tawhid", "/seerah", "/native/adhkar",
                                "/qibla", "/calendar", "/prayer-times", "/stats", "/sections"]
    private static let cards = ["prayer", "wird", "ayah", "hadith"]

    /// عناصر LazyVGrid/List لا توجد في الشجرة قبل التمرير: نمرّر للأسفل ثم للأعلى حتى تظهر قابلة للنقر.
    private func scrollTo(_ el: XCUIElement, in container: XCUIElement? = nil) {
        let c: XCUIElement = container ?? app.windows.firstMatch
        for dir in 0..<2 {
            var n = 0
            while !(el.exists && el.isHittable) && n < 30 { dir == 0 ? c.swipeUp() : c.swipeDown(); n += 1 }
            if el.exists && el.isHittable { return }
        }
    }

    private func isError() -> String? {
        for bad in ["تعذّر فتح", "قيد التوثيق", "قيد الإعداد"] where app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", bad)).count > 0 { return bad }
        return nil
    }

    /// ينقر العنصر، يتحقق من فتح شاشة سليمة، يعود. يعيد false عند الفشل.
    @discardableResult
    private func openAndReturn(_ id: String, expectHome: Bool, container: XCUIElement? = nil, file: StaticString = #filePath, line: UInt = #line) -> Bool {
        let target = app.buttons[id].firstMatch
        scrollTo(target, in: container)
        guard target.exists, target.isHittable else { XCTFail("\(id): غير موجود exists=\(target.exists) hittable=\(target.isHittable) frame=\(target.frame) win=\(app.windows.firstMatch.frame)", file: file, line: line); return false }
        target.tap()
        guard back.waitForExistence(timeout: 10) else { XCTFail("\(id): لم تُفتح شاشة (لا زر رجوع)", file: file, line: line); return false }
        if let bad = isError() { XCTFail("\(id): \(bad)", file: file, line: line); back.tap(); return false }
        back.tap()
        if expectHome { XCTAssertTrue(homeMarker.waitForExistence(timeout: 10), "\(id): لا عودة للرئيسية", file: file, line: line) }
        return true
    }

    func testEveryTileOpens() { Self.tiles.forEach { openAndReturn("home.tile.\($0)", expectHome: true) } }

    func testEveryCardOpens() { Self.cards.forEach { openAndReturn("home.card.\($0)", expectHome: true) } }

    func testToolbarButtonsOpen() {
        for label in ["البحث"] {
            app.buttons[label].tap()
            XCTAssertTrue(back.waitForExistence(timeout: 10), "\(label) لم يفتح")
            back.tap()
        }
        app.buttons["الحساب"].tap()
        app.buttons["الإعدادات"].tap()
        XCTAssertTrue(back.waitForExistence(timeout: 10), "الإعدادات لم تفتح")
    }

    /// كل عنصر في صفحة «كل الأقسام»: يُجمع بالتمرير ثم يُنقر واحدًا واحدًا.
    func testEverySectionsPageItemOpens() {
        let sectionsTile = app.buttons["home.tile./sections"]
        scrollTo(sectionsTile)
        sectionsTile.tap()
        XCTAssertTrue(back.waitForExistence(timeout: 10), "صفحة الأقسام لم تُفتح")
        let list = app.windows.firstMatch
        var ids: [String] = []
        var stable = 0
        while stable < 2 {
            let before = ids.count
            let found = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'sections.item.'")).allElementsBoundByIndex.map(\.identifier)
            for i in found where !ids.contains(i) { ids.append(i) }
            stable = ids.count == before ? stable + 1 : 0
            list.swipeUp()
        }
        XCTAssertGreaterThanOrEqual(ids.count, 15, "عناصر صفحة الأقسام أقل من المتوقع")
        var passed = 0
        for id in ids {
            if openAndReturn(id, expectHome: false, container: list) { passed += 1 }
        }
        print("SECTIONS_PAGE_PASSED \(passed)/\(ids.count)")
    }

    // MARK: - روابط داخلية من كل نوع شاشة

    private var navTitle: String {
        let bar = app.navigationBars.firstMatch
        return bar.exists ? "\(bar.identifier)|\(back.exists ? back.label : "")|\(app.navigationBars.count)" : "none|\(app.staticTexts.count)"
    }

    /// ينقر أول رابط/صف في محتوى الشاشة الحالية ويتأكد أنه فتح شاشة أعمق (تغيّر شريط التنقل) بلا خطأ، ثم يعود.
    private func tapFirstInnerLink(_ what: String, file: StaticString = #filePath, line: UInt = #line) {
        let before = navTitle
        let cells = app.cells.firstMatch.waitForExistence(timeout: 10) ? app.cells : app.scrollViews.buttons
        for i in 0..<min(cells.count, 5) {
            let c = cells.element(boundBy: i)
            guard c.exists, c.isHittable else { continue }
            c.tap()
            let deadline = Date().addingTimeInterval(4)
            while navTitle == before && Date() < deadline { usleep(300_000) }
            if navTitle != before {
                if let bad = isError() { XCTFail("\(what): \(bad)", file: file, line: line) }
                back.tap()
                return
            }
        }
        XCTFail("\(what): لم يفتح أي رابط داخلي من أول 5 عناصر", file: file, line: line)
    }

    private func openTile(_ route: String) {
        let t = app.buttons["home.tile.\(route)"]
        scrollTo(t); t.tap()
        XCTAssertTrue(back.waitForExistence(timeout: 10), "\(route) لم يفتح")
    }

    func testInnerLinksFromEveryScreenKind() {
        // قوائم وتفاصيل من أقسام مختلفة
        for route in ["/hadith", "/lessons", "/fiqh", "/tawhid", "/seerah", "/native/adhkar"] {
            openTile(route)
            tapFirstInnerLink("داخلي من \(route)")
            back.tap()
            XCTAssertTrue(homeMarker.waitForExistence(timeout: 10), "\(route): لا عودة")
        }
    }

    func testSearchResultOpens() {
        app.buttons["البحث"].tap()
        XCTAssertTrue(back.waitForExistence(timeout: 10))
        let field = app.searchFields.firstMatch.exists ? app.searchFields.firstMatch : app.textFields.firstMatch
        XCTAssertTrue(field.waitForExistence(timeout: 10), "حقل البحث غير موجود")
        field.tap(); field.typeText("الصلاة")
        tapFirstInnerLink("نتيجة بحث")
    }

    func testMawarithToolOpensFromSearch() {
        app.buttons["البحث"].tap()
        let field = app.searchFields.firstMatch.exists ? app.searchFields.firstMatch : app.textFields.firstMatch
        XCTAssertTrue(field.waitForExistence(timeout: 10), "حقل البحث غير موجود")
        field.tap(); field.typeText("المواريث")
        tapFirstInnerLink("أداة المواريث")
    }
}
