import XCTest
import SwiftUI
import UniformTypeIdentifiers
@testable import SunnahNative

final class TasmeeGuideTests: XCTestCase {
    func testFourIntroCardsWithUniqueIds() {
        XCTAssertEqual(TasmeeGuide.introCards.count, 4)
        XCTAssertEqual(Set(TasmeeGuide.introCards.map(\.id)).count, 4)
    }
    func testGuideCoversEveryModeExactlyOnce() {
        for m in TasmeeMode.allCases {
            XCTAssertEqual(TasmeeGuide.sections.filter { $0.title == m.title }.count, 1, "\(m)")
        }
    }
    func testIntroSeenPersistsOnce() {
        let d = UserDefaults(suiteName: "tasmee.guide.test.\(UUID().uuidString)")!
        XCTAssertFalse(TasmeeGuide.introSeen(d))
        TasmeeGuide.markIntroSeen(d)
        XCTAssertTrue(TasmeeGuide.introSeen(d))
    }

    @MainActor private func write(_ view: some View, _ name: String, width: CGFloat, height: CGFloat, dark: Bool, out: String) throws {
        let v = view.frame(width: width, height: height).background(dark ? Color.black : Color.white)
            .environment(\.colorScheme, dark ? .dark : .light).environment(\.layoutDirection, .rightToLeft)
        let ir = ImageRenderer(content: v); ir.scale = 2
        let cg = try XCTUnwrap(ir.cgImage)
        let url = URL(fileURLWithPath: out).appendingPathComponent("\(name)-\(dark ? "dark" : "light").png")
        let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
        CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
    }

    @MainActor func testGuideSnapshots() throws {
        guard let out = ProcessInfo.processInfo.environment["TASMEE_GUIDE_SNAP_DIR"] else { throw XCTSkip("TASMEE_GUIDE_SNAP_DIR غير محدد") }
        let d = UserDefaults(suiteName: "tasmee.guide.snap")!; d.removePersistentDomain(forName: "tasmee.guide.snap")
        for dark in [false, true] {
            try write(TasmeeGuideView().content, "guide", width: 402, height: 1100, dark: dark, out: out)
            try write(TasmeeModeSheet(defaults: d) { _ in }.content, "mode-sheet", width: 402, height: 900, dark: dark, out: out)
            for i in 0..<4 { try write(TasmeeIntroCardsView {}.snapshot(page: i), "intro\(i + 1)", width: 402, height: 480, dark: dark, out: out) }
        }
        try write(TasmeeGuideView().content, "guide-se", width: 375, height: 1250, dark: false, out: out)
        try write(TasmeeModeSheet(defaults: d) { _ in }.content, "mode-sheet-se", width: 375, height: 1000, dark: false, out: out)
    }
}
