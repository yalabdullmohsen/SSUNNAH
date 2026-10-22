import XCTest
@testable import SunnahNative

/// سجل عناوين المسارات: تغطية كاملة لـ ROUTE_TEMPLATE_MAP، بلا فراغ ولا تكرار، ومطابقة الأنماط بلا التباس.
final class RouteTitlesTests: XCTestCase {
    private func mappedPaths() throws -> [String] {
        var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        while dir.path != "/" {
            let candidate = dir.appendingPathComponent("docs/native/ROUTE_TEMPLATE_MAP.json")
            if FileManager.default.fileExists(atPath: candidate.path) {
                struct Map: Decodable { struct Route: Decodable { let path: String }; let routes: [Route] }
                return try JSONDecoder().decode(Map.self, from: Data(contentsOf: candidate)).routes.map(\.path)
            }
            dir.deleteLastPathComponent()
        }
        XCTFail("ROUTE_TEMPLATE_MAP.json غير موجود في المستودع")
        return []
    }

    /// يستبدل كل مقطع `:param` بقيمة حقيقية الشكل.
    private func concrete(_ pattern: String) -> String {
        pattern.split(separator: "/", omittingEmptySubsequences: false)
            .map { $0.hasPrefix(":") ? "sample-1" : String($0) }.joined(separator: "/")
    }

    func testEveryMappedRouteHasATitle() throws {
        let paths = try mappedPaths()
        XCTAssertFalse(paths.isEmpty)
        for p in paths { XCTAssertNotNil(RouteTitles.title(for: p), "مسار بلا عنوان: \(p)") }
    }

    func testTitlesAreNonEmptyAndUnique() {
        var seen: [String: String] = [:]
        for (path, title) in RouteTitles.table {
            XCTAssertFalse(title.trimmingCharacters(in: .whitespaces).isEmpty, "عنوان فارغ: \(path)")
            if let other = seen[title] { XCTFail("العنوان «\(title)» مكرّر في \(path) و\(other)") }
            seen[title] = path
        }
    }

    func testEveryPatternResolvesToItsOwnTitle() {
        for (pattern, title) in RouteTitles.table where pattern.contains(":") {
            XCTAssertEqual(RouteTitles.title(for: concrete(pattern)), title, "نمط مظلَّل أو ملتبس: \(pattern)")
        }
    }

    func testQueryFragmentSlashAndWhitespaceAreIgnored() {
        XCTAssertEqual(RouteTitles.title(for: "/lessons/abc?ref=home#top"), "تفاصيل الدرس")
        XCTAssertEqual(RouteTitles.title(for: "/lessons/"), "الدروس")
        XCTAssertEqual(RouteTitles.title(for: "lessons"), "الدروس")
        XCTAssertEqual(RouteTitles.title(for: "  /lessons \n"), "الدروس")
        XCTAssertEqual(RouteTitles.title(for: ""), "الرئيسية")
    }

    func testLiteralSiblingBeatsParameter() {
        XCTAssertEqual(RouteTitles.title(for: "/academic-research/submit"), "إرسال بحث")
        XCTAssertEqual(RouteTitles.title(for: "/academic-research/42"), "تفاصيل البحث")
    }

    func testNestedFiqhPatternsPickTheirOwnTitle() {
        XCTAssertEqual(RouteTitles.title(for: "/fiqh/books/b1"), "كتاب فقهي")
        XCTAssertEqual(RouteTitles.title(for: "/fiqh/books/b1/chapters/c2"), "فصل فقهي")
        XCTAssertEqual(RouteTitles.title(for: "/fiqh/books/b1/lessons/l3"), "درس فقهي")
        XCTAssertNil(RouteTitles.title(for: "/fiqh/books/b1/other/x"))
    }

    func testUnknownPathsHaveNoTitle() {
        XCTAssertNil(RouteTitles.title(for: "/no-such-page"))
        XCTAssertNil(RouteTitles.title(for: "/lessons/a/b/c"))
    }

    func testTabRootsAreTitled() {
        for tab in AppTab.allCases { XCTAssertNotNil(RouteTitles.title(for: tab.rootPath), "تبويب بلا عنوان: \(tab)") }
    }

    func testRouteOverload() {
        XCTAssertEqual(RouteTitles.title(for: Route.web(path: "/lessons/x")), "تفاصيل الدرس")
        XCTAssertNil(RouteTitles.title(for: Route.native(id: "lessons")))
    }
}
