import XCTest
import SwiftUI
@testable import SunnahNative

#if canImport(AppKit)
import AppKit

/// تفاصيل «الإشارات الكونية» لا تعرض رموز Markdown خامًا (**، -): الفقرات تمرّ بمحلّل SunnahMarkdown.
@MainActor
final class MiracleDocMarkdownTests: XCTestCase {
    private func miracles() throws -> [MiracleItem] {
        var dir = URL(fileURLWithPath: #filePath)
        while dir.path != "/", !FileManager.default.fileExists(atPath: dir.appendingPathComponent("ios-native/Data/quran/miracles.json").path) { dir.deleteLastPathComponent() }
        let url = dir.appendingPathComponent("ios-native/Data/quran/miracles.json")
        guard FileManager.default.fileExists(atPath: url.path) else { throw XCTSkip("ios-native/Data غير مولَّد (prepare-data.sh)") }
        return try JSONDecoder().decode([MiracleItem].self, from: Data(contentsOf: url))
    }

    func testBodiesParseWithoutRawSyntax() throws {
        let items = try miracles()
        XCTAssertFalse(items.isEmpty)
        for m in items {
            for p in m.body.components(separatedBy: "\n\n") where !p.isEmpty {
                for case .paragraph(let t) in SunnahMarkdown.blocks(p) {
                    XCTAssertFalse(String(SunnahMarkdown.inline(t).characters).contains("**"), "Markdown خام في \(m.id)")
                }
            }
        }
    }

    /// لقطة اختيارية للفحص البصري: MIRACLE_PNG=<مسار> MIRACLE_ID=<id>.
    func testRenderDetailSnapshot() throws {
        guard let out = ProcessInfo.processInfo.environment["MIRACLE_PNG"] else { throw XCTSkip("بلا MIRACLE_PNG") }
        let id = ProcessInfo.processInfo.environment["MIRACLE_ID"]
        let m = try XCTUnwrap(try miracles().first { $0.id == id } ?? miracles().first { $0.body.contains("**") })
        let paras = m.body.components(separatedBy: "\n\n").filter { !$0.isEmpty }
        let view = VStack(alignment: .leading, spacing: 12) {
            Text(m.title).font(.title2.bold())
            ForEach(paras, id: \.self) { SunnahMarkdownText($0, style: .body) }   // نفس ما يعرضه QuranDocView
        }
        .padding(16).environment(\.layoutDirection, .rightToLeft).frame(width: 402).background(Color.white)
        let r = ImageRenderer(content: view); r.scale = 2
        let rep = NSBitmapImageRep(cgImage: try XCTUnwrap(r.cgImage))
        try XCTUnwrap(rep.representation(using: .png, properties: [:])).write(to: URL(fileURLWithPath: out))
    }
}
#endif
