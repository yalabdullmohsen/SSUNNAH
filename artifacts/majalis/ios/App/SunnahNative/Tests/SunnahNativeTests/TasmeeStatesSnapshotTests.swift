import XCTest
import SwiftUI
import UniformTypeIdentifiers
@testable import SunnahNative

/// لقطات حالات واجهة التسميع (تقرير الجلسة؛ الموجة وورقة الأوضاع لا يرسمهما ImageRenderer فتُلتقطان من المحاكي) فاتحة وداكنة؛ تُكتب إلى `TASMEE_SNAP_DIR`.
final class TasmeeStatesSnapshotTests: XCTestCase {
    @MainActor private func write(_ view: some View, _ name: String, dark: Bool, out: String) throws {
        let v = view.frame(width: 402).background(dark ? Color.black : Color.white)
            .environment(\.colorScheme, dark ? .dark : .light).environment(\.layoutDirection, .rightToLeft)
        let ir = ImageRenderer(content: v); ir.scale = 2
        let cg = try XCTUnwrap(ir.cgImage)
        let url = URL(fileURLWithPath: out).appendingPathComponent("\(name)-\(dark ? "dark" : "light").png")
        let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
        CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
    }

    @MainActor func testStatesSnapshots() throws {
        guard let out = ProcessInfo.processInfo.environment["TASMEE_SNAP_DIR"] else { throw XCTSkip("TASMEE_SNAP_DIR غير محدد") }
        let report = TasmeeSessionReport(states: Array(repeating: .correct, count: 40) + Array(repeating: .wrong, count: 4) + Array(repeating: .skipped, count: 3),
                                         partials: 30, unclearHints: 1, extras: 0)
        for dark in [false, true] {
            try write(MushafTasmeeReport(report: report) {}.frame(height: 520), "report", dark: dark, out: out)
        }
    }
}
