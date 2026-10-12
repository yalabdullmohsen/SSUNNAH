import XCTest
@testable import SunnahNative

@MainActor
final class GeneratedScreensTests: XCTestCase {
    func testNonParamRoutesRegister() {
        let registry = TemplateRegistry()
        GeneratedScreens.registerAll(in: registry)
        for id in ["fikr-waqia", "islamic-landmarks", "nations"] {
            XCTAssertNotNil(registry.view(for: id), id)
        }
    }

    func testParamRoutesResolve() {
        for p in ["/islamic-landmarks/5", "/nations/yemen", "/academic-research/3"] {
            XCTAssertNotNil(GeneratedScreens.resolve(path: p), p)
        }
        XCTAssertNil(GeneratedScreens.resolve(path: "/fikr-waqia"))
        XCTAssertNil(GeneratedScreens.resolve(path: "/islamic-landmarks/5/extra"))
    }
}
