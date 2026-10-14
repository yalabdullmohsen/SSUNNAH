import XCTest
@testable import SunnahNative

@MainActor
final class AppIconModelTests: XCTestCase {
    final class Fake: AppIconSwitching {
        var currentAlternateName: String?; var supportsAlternateIcons = true; var fail = false; var calls: [String?] = []
        func setAlternateIconName(_ name: String?) async throws {
            struct E: Error {}
            if fail { throw E() }
            calls.append(name); currentAlternateName = name
        }
    }
    private func defaults() -> UserDefaults { let d = UserDefaults(suiteName: "appicon.\(UUID())")!; return d }

    func testDefaultsToPrimaryAndMapsNames() {
        XCTAssertEqual(AppIconModel(switcher: Fake(), defaults: defaults()).selected, .primary)
        XCTAssertNil(AppIconChoice.primary.alternateName)
        XCTAssertEqual(AppIconChoice.allCases.compactMap(\.alternateName), ["AppIcon-StarDish", "AppIcon-ZellijDark"])
    }

    func testOpensWithSystemCurrentIcon() {
        let f = Fake(); f.currentAlternateName = "AppIcon-ZellijDark"
        XCTAssertEqual(AppIconModel(switcher: f, defaults: defaults()).selected, .zellijDark)
    }

    func testChooseSwitchesAndPersists() async {
        let f = Fake(), d = defaults(), m = AppIconModel(switcher: f, defaults: d)
        await m.choose(.starDish)
        XCTAssertEqual(m.selected, .starDish); XCTAssertEqual(f.calls, ["AppIcon-StarDish"])
        XCTAssertEqual(d.string(forKey: AppIconModel.storageKey), "starDish")
        await m.choose(.primary)
        XCTAssertEqual(f.calls.last!, nil); XCTAssertEqual(m.selected, .primary)
    }

    func testFailureKeepsSelectionAndReportsError() async {
        let f = Fake(); f.fail = true
        let m = AppIconModel(switcher: f, defaults: defaults())
        await m.choose(.zellijDark)
        XCTAssertEqual(m.selected, .primary); XCTAssertNotNil(m.errorMessage)
    }

    func testUnsupportedDeviceReportsError() async {
        let f = Fake(); f.supportsAlternateIcons = false
        let m = AppIconModel(switcher: f, defaults: defaults())
        await m.choose(.starDish)
        XCTAssertEqual(m.selected, .primary); XCTAssertTrue(f.calls.isEmpty); XCTAssertNotNil(m.errorMessage)
    }
}
