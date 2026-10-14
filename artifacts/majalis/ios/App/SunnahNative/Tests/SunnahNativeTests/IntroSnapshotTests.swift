import XCTest
import SwiftUI
@testable import SunnahNative

#if canImport(AppKit)
import AppKit

/// حارس لقطة للمقدّمة المعتمدة من يوسف (docs/native/intro/APPROVAL.md): بداية الحركة (قطع مبعثرة) ونهاية التركيب (الشعار مكتملًا بالذهب).
/// البصمة شبكة 12×12 من نسبة البكسلات المخالفة للخلفية (0…9)؛ أي تغيير في الشعار أو ألوانه أو وضعيتي الطرفين يكسرها.
@MainActor
final class IntroSnapshotTests: XCTestCase {
    private func signature(theme: IntroTheme, pose: IntroPose) throws -> [Int] {
        let view = IntroView(style: .full, theme: theme, pose: pose, waitUntilReady: {}, onApproach: {}, onFinish: {})
            .frame(width: 240, height: 240)
        let r = ImageRenderer(content: view); r.scale = 1
        let rep = NSBitmapImageRep(cgImage: try XCTUnwrap(r.cgImage))
        let n = 12, cell = rep.pixelsWide / n
        let bg = rep.colorAt(x: 1, y: 1)?.usingColorSpace(.sRGB)
        var out = [Int]()
        for gy in 0..<n { for gx in 0..<n {
            var ink = 0, c = 0
            for y in stride(from: gy * cell, to: (gy + 1) * cell, by: 2) { for x in stride(from: gx * cell, to: (gx + 1) * cell, by: 2) {
                let col = rep.colorAt(x: x, y: y)?.usingColorSpace(.sRGB)
                let d = abs((col?.redComponent ?? 0) - (bg?.redComponent ?? 0)) + abs((col?.greenComponent ?? 0) - (bg?.greenComponent ?? 0)) + abs((col?.blueComponent ?? 0) - (bg?.blueComponent ?? 0))
                if d > 0.08 { ink += 1 }; c += 1
            } }
            out.append(min(9, ink * 10 / max(c, 1)))   // نسبة «الحبر» عن الخلفية، 0…9
        } }
        return out
    }

    private func distance(_ a: [Int], _ b: [Int]) -> Int { zip(a, b).filter { $0 != $1 }.count }

    func testStartAndEndPosesDiffer() throws {
        let start = try signature(theme: .primary, pose: .start)
        let end = try signature(theme: .primary, pose: .assembled)
        XCTAssertGreaterThan(distance(start, end), 0, "بداية الحركة ونهايتها يجب أن تختلفا")
    }

    func testGoldenSignatures() throws {
        for (theme, name) in [(IntroTheme.primary, "primary"), (.starDish, "starDish"), (.zellijDark, "zellijDark")] {
            for (pose, label) in [(IntroPose.start, "start"), (.assembled, "end")] {
                let got = try signature(theme: theme, pose: pose)
                guard let want = Self.golden["\(name).\(label)"] else { XCTFail("لا بصمة معتمدة لـ \(name).\(label)"); continue }
                XCTAssertLessThanOrEqual(distance(got, want.map { Int(String($0))! }), 6, "تغيّرت لقطة المقدّمة \(name).\(label)")
            }
        }
    }

    static let golden: [String: String] = [
        "primary.start": "000000000000000000100000000106701000001921129200000247842000006176681610017186581710000248852000001921129200000206702000000001100000000000000000",
        "primary.end": "000000000000000000100000000117711000001942259200001547844100006276682710017286582710001448854100001942249200000216712000000001100000000000000000",
        "starDish.start": "000000000000000000000000000006600000000934539000000394493000006443435600006544435600000393393000000935539000000006600000000000000000000000000000",
        "starDish.end": "000000000000000000000000000006600000000934539000000394493000006443435600006544435600000393393000000935539000000006600000000000000000000000000000",
        "zellijDark.start": "000000000000000000100000000106701000001921129200000247842000006179981610017189981710000248852000001921129200000206702000000001100000000000000000",
        "zellijDark.end": "000000000000000000100000000117711000001942259200001547844100006279982710017289982710001448854100001942249200000216712000000001100000000000000000",
    ]
}
#endif
