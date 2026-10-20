#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// حارس علامة نهاية الآية (كالمطبوع — قرار المالك 2026-10-20، مرجعه ص27 مقيسًا بالبكسل: ×1.24 من غليف QPC الطبيعي، بلون المصحف الأخضر):
/// (1) حجم الزخرفة من خط النص: ارتفاع [minHeightOfFont, maxHeightOfFont] وعرض [minWidthOfFont, maxWidthOfFont]،
/// (2) كل علامة تتفكك إلى محيط + إطار + أرقام (لا رقم يُرسم بلون الإطار)، (3) تباين الرقم على الحشوة ≥ minContrast فاتحًا وداكنًا،
/// (4) لا سطر يبدأ بعلامة نهاية آية على الـ604 صفحة، ولا تضيع كلمة عند النقل.
/// `ENDMARK_SNAP_DIR` + `ENDMARK_TAG` (before/after) لقطات الصفحات. دون `MUSHAF_DATA` يُتخطّى.
final class MushafEndMarkGuardTests: XCTestCase {
    static let pages = [1, 2, 19, 33, 293, 446]
    static let minHeightOfFont: CGFloat = 1.18
    static let maxHeightOfFont: CGFloat = 1.30
    static let minWidthOfFont: CGFloat = 0.89
    static let maxWidthOfFont: CGFloat = 0.99
    static let minContrast: CGFloat = 4.5

    private func lum(_ c: UIColor, _ style: UIUserInterfaceStyle) -> CGFloat {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        c.resolvedColor(with: UITraitCollection(userInterfaceStyle: style)).getRed(&r, green: &g, blue: &b, alpha: &a)
        func f(_ v: CGFloat) -> CGFloat { v <= 0.03928 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4) }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }

    private func repo() throws -> MushafRepository {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        return MushafRepository(root: URL(fileURLWithPath: dp))
    }

    @MainActor func testEndMarkMatchesPrintedSizeAndLayers() throws {
        let repo = try repo()
        let probe: CGFloat = 100, glyph = probe * MushafPageView.endMarkScale
        var checked = 0
        for n in Self.pages {
            let page = try repo.page(n), fam = try repo.ensureFont(page: n)
            for w in page.rows.flatMap({ $0.w ?? [] }) where w.isAyahEnd {
                let art = try XCTUnwrap(MushafEndMarkArt.parts(glyph: w.c, family: fam, size: glyph), "تعذّر تفكيك \(w.v)")
                let box = art.silhouette.boundingBoxOfPath
                let h = box.height / probe, wd = box.width * MushafPageView.endMarkSquash / probe
                XCTAssert((Self.minHeightOfFont...Self.maxHeightOfFont).contains(h), "ارتفاع زخرفة \(w.v) = \(h) من خط النص")
                XCTAssert((Self.minWidthOfFont...Self.maxWidthOfFont).contains(wd), "عرض زخرفة \(w.v) = \(wd) من خط النص")
                XCTAssertFalse(art.digits.isEmpty, "\(w.v) بلا أرقام مفصولة عن الإطار")
                let digits = art.digits.boundingBoxOfPath
                XCTAssert(box.contains(digits), "أرقام \(w.v) خارج الزخرفة")
                checked += 1
            }
        }
        XCTAssertGreaterThanOrEqual(checked, 50, "عيّنة الآيات أقل من المتوقع")
        for style in [UIUserInterfaceStyle.light, .dark] {
            let l1 = lum(UIColor(Sunnah.Colors.mushafEndDigits), style), l2 = lum(UIColor(Sunnah.Colors.mushafEndFill), style)
            XCTAssertGreaterThanOrEqual((max(l1, l2) + 0.05) / (min(l1, l2) + 0.05), Self.minContrast, "تباين رقم الآية \(style.rawValue)")
        }
    }

    func testNoLineStartsWithAyahEndOnAll604Pages() throws {
        let repo = try repo()
        var bad: [String] = []
        for n in 1...Mushaf.pageCount {
            let page = try repo.page(n)
            let lines = page.rows.filter { $0.k == "l" }
            for (i, r) in lines.enumerated() where i > 0 && r.w?.first?.isAyahEnd == true { bad.append("ص\(n) س\(i + 1)") }
        }
        XCTAssertTrue(bad.isEmpty, "أسطر تبدأ بعلامة نهاية: \(bad.prefix(20))")
    }

    func testEndMarkMoveKeepsWordsAndOrder() {
        let mk = { (c: String, e: Int?) in MushafWord(c: c, v: "2:212", e: e) }
        let page = MushafPage(page: 33, opening: false, rows: [
            MushafRow(k: "l", w: [mk("a", nil), mk("b", nil)]),
            MushafRow(k: "l", w: [mk("#", 1), mk("c", nil)]),
        ])
        let fixed = page.endMarksAttachedToLineEnds()
        XCTAssertEqual(fixed.rows[0].w?.map(\.c), ["a", "b", "#"])
        XCTAssertEqual(fixed.rows[1].w?.map(\.c), ["c"])
        XCTAssertEqual(fixed.rows.flatMap { $0.w ?? [] }.map(\.c), page.rows.flatMap { $0.w ?? [] }.map(\.c))
    }

    /// لقطات قبل/بعد للصفحات المرجعية (لا فحص بكسلي؛ الحجم والطبقات مفحوصة أعلاه من مسار الغليف).
    @MainActor func testEndMarkSnapshots() throws {
        let env = ProcessInfo.processInfo.environment
        guard let dir = env["ENDMARK_SNAP_DIR"], let tag = env["ENDMARK_TAG"] else { throw XCTSkip("ENDMARK_SNAP_DIR/ENDMARK_TAG غير محددين") }
        let repo = try repo(), idx = try repo.index()
        let size = CGSize(width: Double(env["ENDMARK_W"] ?? "") ?? 402, height: Double(env["ENDMARK_H"] ?? "") ?? 874)
        let pages = (env["ENDMARK_PAGES"] ?? "").split(separator: ",").compactMap { Int($0) }.nonEmpty ?? Self.pages
        let d = "\(dir)/\(tag)"; try? FileManager.default.createDirectory(atPath: d, withIntermediateDirectories: true)
        for style in [UIUserInterfaceStyle.light, .dark] {
            for n in pages {
                let view = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil)) }
                    .frame(width: size.width, height: size.height).environment(\.colorScheme, style == .dark ? .dark : .light)
                let ir = ImageRenderer(content: view); ir.scale = 3
                let cg = try XCTUnwrap(ir.cgImage)
                try UIImage(cgImage: cg, scale: 3, orientation: .up).pngData()?.write(to: URL(fileURLWithPath: "\(d)/page-\(n)-\(style == .dark ? "dark" : "light").png"))
            }
        }
    }
}

private extension Array { var nonEmpty: [Element]? { isEmpty ? nil : self } }
#endif
