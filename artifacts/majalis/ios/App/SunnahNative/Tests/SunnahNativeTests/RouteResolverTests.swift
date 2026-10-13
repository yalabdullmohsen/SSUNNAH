import XCTest
@testable import SunnahNative

/// أسبقية الحلّ: الشاشة الخاصة المسجَّلة لا القالب العام؛ وكل مسار في الجرد يُحلّ لشاشة.
@MainActor
final class RouteResolverTests: XCTestCase {
    /// جذر المستودع: أول أب يحوي docs/native.
    private static let root: URL = {
        var u = URL(fileURLWithPath: #filePath)
        while u.path != "/", !FileManager.default.fileExists(atPath: u.appendingPathComponent("docs/native/ROUTE_TEMPLATE_MAP.json").path) { u.deleteLastPathComponent() }
        return u
    }()

    override func setUp() { RouteResolver.registerAll(in: .shared) }

    private func json(_ name: String) throws -> [String: Any] {
        let d = try Data(contentsOf: Self.root.appendingPathComponent("docs/native/\(name)"))
        return try XCTUnwrap(JSONSerialization.jsonObject(with: d) as? [String: Any])
    }

    func testSpecialAliasesWinOverGenericTemplates() {
        for (path, id) in RouteResolver.specialAliases {
            XCTAssertNotNil(TemplateRegistry.shared.view(for: id), "\(id) غير مسجَّل")
            XCTAssertEqual(RouteResolver.trace(path: "/\(path)")?.step, "special:\(id)", "/\(path)")
        }
        XCTAssertEqual(RouteResolver.trace(path: "/")?.step, "special:home")
    }

    func testSpecialIdsAreNotShadowedByGenericSteps() {
        let generic: Set<String> = ["generated", "fiqh", "sirah", "aqidah", "library", "learn"]
        for id in ["prayer", "home", "quran", "quran-hub", "mushaf", "adhkar"] {
            XCTAssertNotNil(TemplateRegistry.shared.view(for: id), id)
            if let step = RouteResolver.trace(path: "/\(id)")?.step { XCTAssertFalse(generic.contains(step), "/\(id) حُلّ عبر \(step)") }
        }
    }

    func testEveryInventoryRouteResolves() throws {
        let routes = try XCTUnwrap(json("ROUTE_TEMPLATE_MAP.json")["routes"] as? [[String: Any]])
        let samples = (try? json("ROUTE_SAMPLES.json")) as? [String: String] ?? [:]
        var missing: [String] = []
        for r in routes {
            guard let p = r["path"] as? String else { continue }
            let eff = p.contains(":") ? samples[p] : p
            guard let path = eff else { continue }   // :param بلا عيّنة موثَّقة: يغطّيها اختبار القسم
            if RouteResolver.resolve(path: path) == nil { missing.append(path) }
        }
        XCTAssertEqual(missing, [], "مسارات بلا شاشة")
    }
}
