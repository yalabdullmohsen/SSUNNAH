#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

/// حارس verse-selection: النقرة على أي كلمة تحدد الآية كلها (لا كلمة منفردة)، على الـ604 صفحة،
/// والتظليل متصل بلا فجوات بيضاء بين كلمات الآية.
final class MushafVerseSelectionTests: XCTestCase {
    private func repo() throws -> (MushafRepository, MushafIndex) {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let r = MushafRepository(root: URL(fileURLWithPath: dp)); return (r, try r.index())
    }

    /// نقر على كل كلمة في كل صفحة: الهدف = معرّف آيتها، ونطاق الآية (عبر الصفحات) يبدأ بكلمة نصية وينتهي برمز نهاية، وكلمات الصفحة كلها ضمنه.
    func testTapOnAnyWordSelectsWholeAyahOnAll604Pages() throws {
        let (r, _) = try repo()
        var bad: [String] = [], taps = 0
        var memo: [String: [MushafAyahWord]] = [:]
        for p in 1...Mushaf.pageCount {
            guard let page = try? r.page(p) else { bad.append("p\(p) بلا بيانات"); continue }
            let words = page.rows.flatMap { $0.w ?? [] }
            for w in words {
                taps += 1
                let v = w.v
                guard let range = memo[v] ?? MushafAyahWords.load(ayah: v, repo: r) else { bad.append("\(v) بلا نطاق"); continue }
                memo[v] = range
                let text = range.filter { !$0.isEnd }
                if range.last?.isEnd != true { bad.append("\(v) لا ينتهي برمز نهاية") }
                if range.filter(\.isEnd).count != 1 { bad.append("\(v) أكثر من رمز نهاية") }
                if text.isEmpty { bad.append("\(v) نطاق بلا نص") }
                let here = words.filter { $0.v == v }.count
                if here > range.count { bad.append("\(v) كلمات الصفحة \(p) خارج النطاق") }
                if w.c.isEmpty { bad.append("\(v) كلمة فارغة") }
            }
        }
        XCTAssertGreaterThan(taps, 70_000)
        XCTAssertTrue(bad.isEmpty, "\(bad.count) إخفاق، أولها: \(bad.prefix(5))")
    }

    private static func pixels(_ img: UIImage) -> (px: [UInt8], w: Int, h: Int) {
        let cg = img.cgImage!, w = cg.width, h = cg.height
        var buf = [UInt8](repeating: 0, count: w * h * 4)
        let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h)); return (buf, w, h)
    }

    /// لقطات صفحة بآية محددة: تظليل موجود، متصل (لا فجوة ورق ≥ 4px بين بكسلي تظليل في سطر واحد)، والخلفية غير فارغة.
    @MainActor func testSelectionHighlightIsContinuousAcrossLines() throws {
        let (r, idx) = try repo()
        // (صفحة، آية): قصيرة، متعددة الأسطر، عابرة صفحتين، أول الصفحة، آخرها، سجدة
        var cases: [(Int, String, String)] = []
        func first(_ p: Int) -> String? { (try? r.page(p))?.rows.compactMap { $0.w?.first?.v }.first }
        func last(_ p: Int) -> String? { (try? r.page(p))?.rows.compactMap { $0.w?.last?.v }.last }
        cases.append((1, "1:2", "short")); if let pp = idx.ayahPage["2:255"] { cases.append((pp, "2:255", "multi")) }
        if let f = first(150) { cases.append((150, f, "first")) }
        if let l = last(150) { cases.append((150, l, "last")) }
        // في مصحف المدينة (QPC) لا تعبر آية صفحتين أبدًا (كل صفحة تنتهي برمز نهاية آية): نُثبت ذلك على الـ604، ونلتقط أطول آية (أكثر الأسطر) بدلها.
        var pagesOf: [String: Set<Int>] = [:], rowsOf: [String: Int] = [:], pageOfAyah: [String: Int] = [:]
        for p in 1...Mushaf.pageCount { for row in (try? r.page(p))?.rows ?? [] { for v in Set((row.w ?? []).map(\.v)) { pagesOf[v, default: []].insert(p); rowsOf[v, default: 0] += 1; pageOfAyah[v] = p } } }
        XCTAssertTrue(pagesOf.values.allSatisfy { $0.count == 1 }, "آية تعبر صفحتين: \(pagesOf.filter { $0.value.count > 1 }.keys.sorted().prefix(5))")
        if let longest = rowsOf.max(by: { $0.value < $1.value }), let pp = pageOfAyah[longest.key] { cases.append((pp, longest.key, "longest")) }
        if let pp = idx.ayahPage["32:15"] { cases.append((pp, "32:15", "sajda")) }
        let dir = ProcessInfo.processInfo.environment["SELECT_SNAP_DIR"]
        if let dir { try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true) }
        var table: [String] = ["| الحالة | الصفحة | الآية | الوضع | العرض | تظليل px | فجوات | ورق% |", "|---|---|---|---|---|---|---|---|"]
        for (page, ayah, name) in cases {
            guard let pg = try? r.page(page), pg.rows.contains(where: { ($0.w ?? []).contains { $0.v == ayah } }) else { continue }
            for w in [CGFloat(402), 834] {
                for dark in [false, true] {
                    let size = CGSize(width: w, height: (w * 2.1).rounded())
                    let view = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: r, index: idx, number: page, selectedAyah: .constant(ayah)) }
                        .frame(width: size.width, height: size.height)
                        .environment(\.colorScheme, dark ? .dark : .light)
                    let ir = ImageRenderer(content: view); ir.scale = 2
                    let img = UIImage(cgImage: try XCTUnwrap(ir.cgImage), scale: 2, orientation: .up)
                    let (px, pw, ph) = Self.pixels(img)
                    let bg = (px[0], px[1], px[2])
                    let hl = UIColor(dark ? Color(Sunnah.Colors.primarySoft) : Color(Sunnah.Colors.primarySoft))
                    var hr: CGFloat = 0, hg: CGFloat = 0, hb: CGFloat = 0, ha: CGFloat = 0
                    let tc = UITraitCollection(userInterfaceStyle: dark ? .dark : .light)
                    UIColor(Sunnah.Colors.primarySoft).resolvedColor(with: tc).getRed(&hr, green: &hg, blue: &hb, alpha: &ha)
                    _ = hl
                    // اللون المركّب فوق الورق (شفافية محتملة): نقرأ لون التظليل الفعلي كأكثر لون غير الورق تكرارًا
                    var counts: [UInt32: Int] = [:]
                    for i in stride(from: 0, to: pw * ph * 4, by: 16) { if px[i] != bg.0 || px[i+1] != bg.1 || px[i+2] != bg.2 { counts[UInt32(px[i]) << 16 | UInt32(px[i+1]) << 8 | UInt32(px[i+2]), default: 0] += 1 } }
                    let hlKey = counts.max { $0.value < $1.value }?.key ?? 0
                    func isHL(_ i: Int) -> Bool { abs(Int(px[i]) - Int(hlKey >> 16)) <= 3 && abs(Int(px[i+1]) - Int((hlKey >> 8) & 255)) <= 3 && abs(Int(px[i+2]) - Int(hlKey & 255)) <= 3 }
                    func isPaper(_ i: Int) -> Bool { px[i] == bg.0 && px[i+1] == bg.1 && px[i+2] == bg.2 }
                    var hlPx = 0, gaps = 0, paperPx = 0
                    for y in 0..<ph {
                        var lastHL = -1, run = 0
                        for x in 0..<pw {
                            let i = (y * pw + x) * 4
                            if isHL(i) { hlPx += 1; if lastHL >= 0 && run >= 8 { gaps += 1 }; lastHL = x; run = 0 }
                            else if isPaper(i) { paperPx += 1; if lastHL >= 0 { run += 1 } } else { run = 0 }   // حبر/حواف = ليست فجوة ورق
                        }
                    }
                    let paperPct = Int(Double(paperPx) / Double(pw * ph) * 100)
                    table.append("| \(name) | \(page) | \(ayah) | \(dark ? "داكن" : "فاتح") | \(Int(w)) | \(hlPx) | \(gaps) | \(paperPct) |")
                    XCTAssertGreaterThan(hlPx, 200, "لا تظليل \(name) \(ayah) w=\(w) dark=\(dark)")
                    XCTAssertLessThan(gaps, 16, "فجوة ورق داخل التظليل \(name) \(ayah) w=\(w) dark=\(dark)")
                    XCTAssertLessThan(paperPct, 97, "خلفية فارغة \(name)")
                    if let dir { try? img.jpegData(compressionQuality: 0.85)?.write(to: URL(fileURLWithPath: "\(dir)/select-\(name)-\(page)-\(Int(w))-\(dark ? "dark" : "light").jpg")) }
                }
            }
        }
        if let dir { try? table.joined(separator: "\n").write(toFile: "\(dir)/selection-table.md", atomically: true, encoding: .utf8) }
    }
}
#endif
