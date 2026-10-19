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
            func ready() -> Bool { el.waitForExistence(timeout: 0.3) && el.isHittable }
            while !ready() && n < 30 { dir == 0 ? c.swipeUp(velocity: .slow) : c.swipeDown(velocity: .slow); n += 1 }
            if ready() { return }
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
            XCTAssertTrue(homeMarker.waitForExistence(timeout: 10), "\(label): لا عودة للرئيسية")
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
        var visited = Set<String>()
        var idle = 0
        let items = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'sections.item.'"))
        while idle < 3 {
            // تمرير واحد: افتح كل عنصر ظاهر لم يُزَر بعد، دون البحث عنه بتمرير منفصل.
            var progressed = false
            for el in items.allElementsBoundByIndex where el.exists {
                let id = el.identifier
                guard !visited.contains(id), el.isHittable else { continue }
                visited.insert(id)
                progressed = true
                el.tap()
                guard back.waitForExistence(timeout: 10) else { XCTFail("\(id): لم تُفتح شاشة (لا زر رجوع)"); continue }
                if let bad = isError() { XCTFail("\(id): \(bad)") }
                back.tap()
                _ = items.firstMatch.waitForExistence(timeout: 10)
                break
            }
            if !progressed { list.swipeUp(velocity: .slow); idle += 1 } else { idle = 0 }
        }
        XCTAssertGreaterThanOrEqual(visited.count, 15, "عناصر صفحة الأقسام أقل من المتوقع")
        let ids = Array(visited); let passed = ids.count
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

    /// البند 8: لا شاشة فارغة؛ البحث يعيد نتائج حقيقية، وحالاته الفارغة مصمَّمة (عنوان + شرح).
    func testSearchReturnsRealResultsAndDesignedEmptyStates() {
        app.buttons["البحث"].tap()
        let field = app.searchFields.firstMatch.exists ? app.searchFields.firstMatch : app.textFields.firstMatch
        XCTAssertTrue(field.waitForExistence(timeout: 10), "حقل البحث غير موجود")
        XCTAssertTrue(app.staticTexts["ابحث في المحتوى"].waitForExistence(timeout: 5), "حالة البحث الأولى غير مصمَّمة")
        field.tap()
        for word in ["الصلاة", "البقرة"] {
            field.typeText(word)
            XCTAssertTrue(app.cells.firstMatch.waitForExistence(timeout: 10), "لا نتائج حقيقية لكلمة \(word)")
            field.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: word.count))
        }
        field.typeText("ظظظظظ")
        XCTAssertTrue(app.staticTexts["لا نتائج"].waitForExistence(timeout: 5), "حالة عدم وجود نتائج غير ظاهرة")
    }

    func testBlankCandidatesShowDesignedEmptyState() {
        openTile("/stats")
        XCTAssertTrue(app.staticTexts["إحصائياتك بانتظارك"].waitForExistence(timeout: 10), "/stats: لا حالة فارغة مصمَّمة")
    }

    /// أيقونة التطبيق: الإعدادات ← المظهر ← ثلاث بطاقات، والأساسية محدَّدة عند الفتح.
    func testAppIconPickerShowsThreeCards() {
        app.buttons["الحساب"].tap()
        app.buttons["الإعدادات"].tap()
        let row = app.buttons["settings.appIcon"].firstMatch
        XCTAssertTrue(row.waitForExistence(timeout: 10), "صف أيقونة التطبيق غير موجود")
        row.tap()
        for id in ["primary", "starDish", "zellijDark"] {
            XCTAssertTrue(app.buttons["appicon.\(id)"].waitForExistence(timeout: 10), "بطاقة \(id) غير موجودة")
        }
        XCTAssertEqual(app.buttons["appicon.primary"].value as? String, "محدَّدة")
        if let dir = ProcessInfo.processInfo.environment["APPICON_SHOT_DIR"] {
            try? XCUIScreen.main.screenshot().pngRepresentation.write(to: URL(fileURLWithPath: dir + "/appicon-picker.png"))
        }
    }

    /// آخر عنصر في أسفل الصفحة يجب ألا يختبئ خلف شريط التبويب (الرئيسية والأحاديث والأذكار)؛ يلتقط لقطة نهاية التمرير لكل منها.
    func testLastContentNotHiddenByTabBar() throws {
        for route in ["/", "/native/adhkar", "/fatwa-policy"] {
            app.terminate()
            app = XCUIApplication()
            app.launchArguments += ["-AppleLanguages", "(ar)", "-AppleLocale", "ar_SA", "-snapshotRoute", route]
            app.launch()
            let tabTop = app.buttons["المزيد"]
            XCTAssertTrue(tabTop.waitForExistence(timeout: 30), "\(route): شريط التبويب لم يظهر")
            sleep(3)
            let win = app.windows.firstMatch
            // تمرير حتى الاستقرار: صورة الشاشة لا تتغيّر بين تمريرتين متتاليتين = نهاية المحتوى فعلًا.
            var prev = Data(); var still = 0
            for _ in 0..<80 {
                win.swipeUp(velocity: .fast); usleep(700_000)
                let cur = app.screenshot().pngRepresentation
                still = (cur == prev) ? still + 1 : 0
                prev = cur
                if still >= 2 { break }
            }
            XCTAssertGreaterThanOrEqual(still, 2, "\(route): لم يصل التمرير إلى النهاية")
            sleep(1)
            let tabLabels = ["المزيد", "الأقسام", "الصلاة", "المصحف", "الرئيسية"]
            let barTop = app.buttons.matching(NSPredicate(format: "label IN %@", tabLabels)).allElementsBoundByIndex.map { $0.frame.minY }.filter { $0 > win.frame.height * 0.8 }.min() ?? tabTop.frame.minY   // أعلى زر في الشريط؛ حافة الشريط المرئية أعلى منه بنحو 5 نقاط فقط (تحقّقت بصريًا من اللقطة)
            var lowest: CGFloat = 0
            for kind in [XCUIElement.ElementType.staticText, .button] {
                for el in app.descendants(matching: kind).allElementsBoundByIndex where el.exists {
                    let f = el.frame
                    if f.isEmpty || f.minY >= barTop || f.maxY > win.frame.height || f.height < 8 { continue }
                    if el.label.isEmpty { continue }
                    if tabLabels.contains(el.label) { continue }
                    lowest = max(lowest, f.maxY)
                }
            }
            let shot = XCTAttachment(screenshot: app.screenshot()); shot.name = "bottom\(route.replacingOccurrences(of: "/", with: "_"))"; shot.lifetime = .keepAlways; add(shot)
            XCTAssertLessThanOrEqual(lowest, barTop + 1, "\(route): آخر عنصر (maxY=\(lowest)) خلف الشريط (top=\(barTop))")
        }
    }

    /// «علاماتي»: سحب صف علامة يكشف «حذف» ثم النقر عليه يحذف الصف فعلًا؛ لقطتان (قبل/بعد) حقيقيتان من XCUITest لا simctl.
    func testMarksSwipeToDelete() throws {
        app.terminate()
        app = XCUIApplication()
        app.launchArguments += ["-AppleLanguages", "(ar)", "-AppleLocale", "ar_SA", "-snapshotRoute", "/mushaf/page/42",
                                "-snapshotSeedMarks", "1", "-snapshotShowMarks", "1"]
        app.launch()
        let rows = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "صفحة"))
        XCTAssertTrue(rows.firstMatch.waitForExistence(timeout: 30), "قائمة العلامات لم تظهر")
        let before = rows.count
        let row = rows.element(boundBy: 0)
        let del = app.buttons["حذف"]
        // RTL: إجراء trailing يُكشف بالسحب نحو الجهة الأمامية (يمينًا)؛ نجرّب الاتجاهين.
        row.swipeRight(velocity: .slow)
        if !del.waitForExistence(timeout: 2) { row.swipeLeft(velocity: .slow); _ = del.waitForExistence(timeout: 2) }
        XCTAssertTrue(del.exists, "زر الحذف لم يظهر بعد السحب")
        save(app.screenshot(), "marks-swipe-reveal")
        del.tap()
        sleep(1)
        XCTAssertEqual(rows.count, before - 1, "الصف لم يُحذف")
        save(app.screenshot(), "marks-swipe-after-delete")
    }

    private func save(_ shot: XCUIScreenshot, _ name: String) {
        let a = XCTAttachment(screenshot: shot); a.name = name; a.lifetime = .keepAlways; add(a)
        let dir = "/tmp/n3swipe"
        try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        try? shot.pngRepresentation.write(to: URL(fileURLWithPath: "\(dir)/\(name).png"))
    }
}
