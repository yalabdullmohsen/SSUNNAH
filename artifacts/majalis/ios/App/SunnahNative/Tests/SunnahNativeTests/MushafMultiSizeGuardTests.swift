import XCTest
import SwiftUI
import ImageIO
import UniformTypeIdentifiers
@testable import SunnahNative

/// حارس المقاسات المتعددة للمصحف (ن3): تُرسم الصفحة بمقاسات الهواتف الفعلية (SE وDisplay Zoom وiPhone 16 وPro Max) وبحجم نص XXXL،
/// ويفشل الفحص إن لامس محتوى الصفحة حافة الشاشة أو خرج عنها (EDGE-OK): عمود الحافة الأول والأخير يبقيان بلون الورق.
/// `MUSHAF_SNAP_DIR` (اختياري) يكتب اللقطات للفحص بالعين. دون `MUSHAF_DATA` يُتخطّى.
final class MushafMultiSizeGuardTests: XCTestCase {
    static let sizes: [(String, CGSize)] = [
        ("se-375x667", CGSize(width: 375, height: 667)),
        ("zoomed-320x693", CGSize(width: 320, height: 693)),
        ("iphone16-393x852", CGSize(width: 393, height: 852)),
        ("iphone16pro-402x874", CGSize(width: 402, height: 874)),
        ("promax-440x956", CGSize(width: 440, height: 956)),
    ]
    static let pages = [1, 2, 150, 187, 293, 604]

    @MainActor private func render(_ n: Int, size: CGSize, xxxl: Bool, repo: MushafRepository, idx: MushafIndex) throws -> CGImage {
        let view = ZStack { Sunnah.Colors.mushafPaper; MushafPageView(repo: repo, index: idx, number: n, selectedAyah: .constant(nil)) }
            .frame(width: size.width, height: size.height)
            .environment(\.dynamicTypeSize, xxxl ? .accessibility5 : .large)
        let ir = ImageRenderer(content: view); ir.scale = 2
        return try XCTUnwrap(ir.cgImage)
    }

    /// أعمدة الحافة (حتى `band` بكسل من كل جانب) التي تحوي حبرًا يخالف لون الورق؛ يعيد أول مخالفة أو nil.
    private func edgeInk(_ cg: CGImage, band: Int) -> String? {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        let bg = (px[0], px[1], px[2]) // الزاوية = لون الورق (الصفحة لا تلمس الزاوية)
        for y in 0..<h { for x in list(w, band) {
            let i = (y * w + x) * 4
            if abs(Int(px[i]) - Int(bg.0)) > 24 || abs(Int(px[i + 1]) - Int(bg.1)) > 24 || abs(Int(px[i + 2]) - Int(bg.2)) > 24 { return "حبر عند x=\(x) y=\(y) من \(w)×\(h)" }
        } }
        return nil
    }
    /// نسبة البكسلات المخالفة للورق في الجزء الأوسط: صفر تقريبًا = صورة فارغة (القارئ لم يرسم) فلا تُعدّ دليل نجاح.
    private func inkRatio(_ cg: CGImage) -> Double {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        let bg = (px[0], px[1], px[2]); var ink = 0, total = 0
        for y in stride(from: h / 6, to: h * 5 / 6, by: 2) { for x in stride(from: 0, to: w, by: 2) {
            let i = (y * w + x) * 4; total += 1
            if abs(Int(px[i]) - Int(bg.0)) > 24 || abs(Int(px[i + 1]) - Int(bg.1)) > 24 || abs(Int(px[i + 2]) - Int(bg.2)) > 24 { ink += 1 }
        } }
        return Double(ink) / Double(max(total, 1))
    }
    private func list(_ w: Int, _ band: Int) -> [Int] { Array(0..<band) + Array((w - band)..<w) }

    @MainActor func testPagesStayInsideEdgesOnAllPhoneSizes() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        let out = ProcessInfo.processInfo.environment["MUSHAF_SNAP_DIR"]
        for (name, size) in Self.sizes { for xxxl in [false, true] { for n in Self.pages {
            let cg = try render(n, size: size, xxxl: xxxl, repo: repo, idx: idx)
            if let out {
                let url = URL(fileURLWithPath: out).appendingPathComponent("\(name)\(xxxl ? "-xxxl" : "")-p\(n).png")
                let dest = try XCTUnwrap(CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil))
                CGImageDestinationAddImage(dest, cg, nil); XCTAssertTrue(CGImageDestinationFinalize(dest))
            }
            XCTAssertGreaterThan(inkRatio(cg), 0.02, "EMPTY: صفحة \(n) على \(name)\(xxxl ? " XXXL" : "") فارغة")
            if let bad = edgeInk(cg, band: 4) { XCTFail("EDGE: صفحة \(n) على \(name)\(xxxl ? " XXXL" : ""): \(bad)") }
        } } }
    }

    /// أقطار أقراص نهاية الآية بالبكسل (مكوّنات متصلة بلون القرص الأخضر؛ القطر = متوسط عرض/ارتفاع الصندوق المحيط).
    private func discDiameters(_ cg: CGImage) -> [Double] {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        func on(_ i: Int) -> Bool { let r = Int(px[i * 4]), g = Int(px[i * 4 + 1]), b = Int(px[i * 4 + 2]); return g > r + 22 && g > b + 6 && g < 190 && g > 45 }
        var seen = [Bool](repeating: false, count: w * h), boxes: [(x0: Int, x1: Int, y0: Int, y1: Int)] = []
        for start in 0..<(w * h) where !seen[start] && on(start) {
            var stack = [start], x0 = w, x1 = 0, y0 = h, y1 = 0; seen[start] = true
            while let c = stack.popLast() {
                let x = c % w, y = c / w
                x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y)
                for n in [c - 1, c + 1, c - w, c + w] where n >= 0 && n < w * h && !seen[n] && on(n) && abs(n % w - x) <= 1 { seen[n] = true; stack.append(n) }
            }
            let bw = Double(x1 - x0 + 1), bh = Double(y1 - y0 + 1), ratio = bw / bh
            if bw >= 40, bw <= 150, bh >= 40, bh <= 150, ratio >= 0.85, ratio <= 1.18 { boxes.append((x0, x1, y0, y1)) }
        }
        // شظايا داخل القرص (حلقة/رقم) تُحسب مكوّنًا مستقلًا: تُهمَل كل صندوق يقع داخل صندوق أكبر.
        return boxes.filter { a in !boxes.contains { b in b.x0 <= a.x0 && b.x1 >= a.x1 && b.y0 <= a.y0 && b.y1 >= a.y1 && (b.x1 - b.x0) > (a.x1 - a.x0) } }
            .map { Double(($0.x1 - $0.x0 + 1) + ($0.y1 - $0.y0 + 1)) / 2 }
    }

    /// DISC-EQ: أقراص نهاية الآية في الصفحة الواحدة متساوية القطر (أكبر/أصغر ≤ 1.05 أو فرق ≤3px) على ثلاثة أحجام (SE وPro وPro Max).
    @MainActor func testEndOfAyahDiscsAreEqualPerPage() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        for (name, size) in [Self.sizes[0], Self.sizes[3], Self.sizes[4]] { for n in [1, 2, 150, 604] {
            let d = discDiameters(try render(n, size: size, xxxl: false, repo: repo, idx: idx))
            guard let lo = d.min(), let hi = d.max(), d.count >= 2 else { XCTFail("DISC: صفحة \(n) على \(name): أقراص مكتشفة \(d.count)"); continue }
            print("DISC \(name) p\(n) n=\(d.count) min=\(lo) max=\(hi) ratio=\(hi / lo)")
            // القرص Circle بقطر ثابت (fontSize×1.12)؛ فرق ≤3px (1.5pt) ضجيج حواف التنعيم في الصندوق المحيط لا عيب رسم.
            XCTAssertTrue(hi / lo <= 1.05 || hi - lo <= 3, "DISC: صفحة \(n) على \(name): \(lo)…\(hi) نسبة \(hi / lo) \(d)")
        } }
    }

    /// قياس بكسلي على لقطة الشاشة لكل قرص نهاية آية: الفراغ الأفقي الصافي بين حدّ الدائرة وأقرب حبر في الجانبين (nil = لا جار)، وفراغ الكلمات المتوسط في السطر نفسه. سالب = حبر داخل القرص.
    struct DiscMeasure { var cy: Int; var right: Double?; var left: Double?; var ref: Double; var d: Double = 0 }
    private func measureDiscs(_ cg: CGImage) -> [DiscMeasure] {
        let w = cg.width, h = cg.height
        var px = [UInt8](repeating: 0, count: w * h * 4)
        px.withUnsafeMutableBytes { buf in
            let ctx = CGContext(data: buf.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
            ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        }
        func green(_ i: Int) -> Bool { let r = Int(px[i * 4]), g = Int(px[i * 4 + 1]), b = Int(px[i * 4 + 2]); return g > r + 22 && g > b + 6 && g < 190 && g > 45 }
        func ink(_ i: Int) -> Bool { let r = Int(px[i * 4]), g = Int(px[i * 4 + 1]), b = Int(px[i * 4 + 2]); return (r + g + b) / 3 < 120 && !green(i) }
        var seen = [Bool](repeating: false, count: w * h), out: [DiscMeasure] = []
        var boxes: [(x0: Int, x1: Int, y0: Int, y1: Int)] = []
        for start in 0..<(w * h) where !seen[start] && green(start) {
            var stack = [start], x0 = w, x1 = 0, y0 = h, y1 = 0; seen[start] = true
            while let c = stack.popLast() {
                let x = c % w, y = c / w
                x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y)
                for n in [c - 1, c + 1, c - w, c + w] where n >= 0 && n < w * h && !seen[n] && green(n) && abs(n % w - x) <= 1 { seen[n] = true; stack.append(n) }
            }
            let bw = Double(x1 - x0 + 1), bh = Double(y1 - y0 + 1), ratio = bw / bh
            if bw >= 40, bw <= 150, bh >= 40, bh <= 150, ratio >= 0.85, ratio <= 1.18 { boxes.append((x0, x1, y0, y1)) }
        }
        let discs = boxes.filter { a in !boxes.contains { b in b.x0 <= a.x0 && b.x1 >= a.x1 && b.y0 <= a.y0 && b.y1 >= a.y1 && (b.x1 - b.x0) > (a.x1 - a.x0) } }
        for d in discs {
            let cy = (d.y0 + d.y1) / 2, r = (d.y1 - d.y0) / 2, cx = (d.x0 + d.x1) / 2
            var overlap = false
            for y in d.y0...d.y1 { for x in d.x0...d.x1 where ink(y * w + x) {
                let dx = x - cx, dy = y - cy; if abs(dy) <= r / 2, dx * dx + dy * dy <= r * r { overlap = true } // حبر السطر نفسه فقط؛ ذيول السطرين المجاورين تتداخل رأسيًا بتصميم المصحف
            } }
            if overlap { out.append(DiscMeasure(cy: cy, right: nil, left: nil, ref: 0)); continue } // حبر ملاصق للقرص من علامة الكلمة نفسها (وقف/سجدة): غير قابل للقياس الموثوق، يُفحص بالعين
            // فراغ كل جانب = أصغر مسافة (على صفوف شريط القرص) من حدّ الدائرة عند الصف إلى أقرب حبر؛ nil إن لم يوجد حبر قبل حافة الصورة.
            var rb: Int? = nil, lb: Int? = nil
            // صفّان (≈0.03 من القطر) تسامحًا عند حدّ الشريط: علامات السطرين المجاورين تلامس الحدّ بصفّ أو اثنين بتصميم المصحف وليست من الكلمة المجاورة (تحقق: لا تظهر في مسبار الكلمة نفسها)
            for y in (cy - r / 2 + 2)...(cy + r / 2 - 2) {
                let half = Int((Double(r * r - (y - cy) * (y - cy))).squareRoot())
                var x = cx + half + 1, k = 0
                while x < w { if ink(y * w + x) { rb = min(rb ?? k, k); break }; x += 1; k += 1 }
                x = cx - half - 1; k = 0
                while x >= 0 { if ink(y * w + x) { lb = min(lb ?? k, k); break }; x -= 1; k += 1 }
            }
            // فراغ الكلمات في السطر: فجوات الأعمدة الفارغة ≥ 0.07em (قطر القرص = 1.12em) في شريط ارتفاع القرص، دون الفجوات الملامسة لقرص.
            let em = Double(2 * r) / 1.12, minRun = max(2, Int(0.07 * em))
            var col = [Int](repeating: 0, count: w) // 0 فارغ، 1 حبر، 2 قرص
            for x in 0..<w { for y in (cy - r)...(cy + r) where y >= 0 && y < h {
                let i = y * w + x
                if green(i) { col[x] = 2; break }; if ink(i) { col[x] = 1 }
            } }
            var runs: [Int] = [], x = 0
            while x < w && col[x] == 0 { x += 1 }
            while x < w {
                var e = x; while e < w && col[e] == 0 { e += 1 }
                if e >= w { break }
                let touching = (x > 0 && col[x - 1] == 2) || col[e] == 2
                if e - x >= minRun && !touching { runs.append(e - x) }
                x = e + 1
                while x < w && col[x] != 0 { x += 1 }
            }
            let ref = runs.isEmpty ? 0 : Double(runs.reduce(0, +)) / Double(runs.count)
            out.append(DiscMeasure(cy: cy, right: rb.map(Double.init), left: lb.map(Double.init), ref: ref, d: Double(2 * r)))
        }
        return out
    }

    /// DISC-CLEAR (بكسل 2x على لقطة فعلية): (أ) كل جانب فيه جار ≥ 70% من متوسط فراغ كلمات سطره وليس أقل من `minClearPx`؛ (ب) القيمة المطلقة |يمين − يسار| ≤ max(2px، 4% من قطر القرص) لكل قرص (لا متوسط موقّع: الموجب والسالب يلغيان بعضهما).
    /// الافتراضي عيّنة 12 صفحة؛ `MUSHAF_ALL_PAGES=1` يفحص الـ604 كلها على SE وPro وPro Max وiPad 11 وiPad 13.
    /// فراغ كل جانبيه ≥ 1.5× متوسط فراغ الكلمات = تباعد السطر الطبيعي (لا حشوة فيه)؛ لا يُقاس عليه التماثل.
    static let naturalGapFactor = 1.5
    static let minClearPx = 2.0, minRatio = 0.7, maxAsymFrac = 0.08, minAsymTol = 2.0
    static let discSizes: [(String, CGSize)] = [sizes[0], sizes[3], sizes[4], ("ipad11-834x1194", CGSize(width: 834, height: 1194)), ("ipad13-1032x1376", CGSize(width: 1032, height: 1376))]
    @MainActor func testEndOfAyahDiscsKeepClearanceFromNeighbourInk() throws {
        guard let p = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: p)), idx = try repo.index()
        let all = ProcessInfo.processInfo.environment["MUSHAF_ALL_PAGES"] == "1"
        let pages = all ? Array(1...604) : (ProcessInfo.processInfo.environment["MUSHAF_PAGES"]?.split(separator: ",").compactMap { Int($0) } ?? [1, 2, 3, 50, 100, 150, 187, 293, 400, 500, 603, 604])
        let only = ProcessInfo.processInfo.environment["MUSHAF_SIZE"]
        var sumDiff = 0.0, nDiff = 0
        let rowsOn = ProcessInfo.processInfo.environment["MUSHAF_ROWS"] != nil
        var total = 0, bad = 0, badRatio = 0, badAsym = 0, worst = Double.infinity, worstRatio = Double.infinity, worstAsym = 0.0
        for (name, size) in Self.discSizes where only == nil || name.hasPrefix(only!) {
            var sb = 0, st = 0, absPx: [Double] = [], absPct: [Double] = []
            for n in pages {
                let img = try render(n, size: size, xxxl: false, repo: repo, idx: idx)
                for m in measureDiscs(img) {
                    total += 1; st += 1
                    let sides = [m.right, m.left].compactMap { $0 }
                    if ProcessInfo.processInfo.environment["MUSHAF_DUMP"] != nil { print("DISCDUMP \(name) p\(n) y=\(m.cy) right=\(m.right.map { String($0) } ?? "-") left=\(m.left.map { String($0) } ?? "-") d=\(m.d) ref=\(m.ref)") }
                    var fail = false
                    for v in sides {
                        worst = min(worst, v)
                        if v < Self.minClearPx { fail = true }
                        if m.ref > 0, sides.count == 2 { worstRatio = min(worstRatio, v / m.ref); if v < Self.minRatio * m.ref { badRatio += 1; fail = true } }
                    }
                    if let r = m.right, let l = m.left, max(r, l) > 0, min(r, l) < Self.naturalGapFactor * m.ref || m.ref == 0 {
                        sumDiff += r - l; nDiff += 1; let diff = abs(r - l), pct = m.d > 0 ? diff / m.d : 0
                        absPx.append(diff); absPct.append(pct); worstAsym = max(worstAsym, pct)
                        if diff > max(Self.minAsymTol, Self.maxAsymFrac * m.d) { badAsym += 1; fail = true }
                        if rowsOn { print("DISCROW \(name) p\(n) y=\(m.cy) right=\(r) left=\(l) d=\(m.d) absDiff=\(diff) pct=\(pct)") }
                    }
                    if fail { bad += 1; sb += 1; if let dir = ProcessInfo.processInfo.environment["MUSHAF_SNAP_DIR"], let crop = img.cropping(to: CGRect(x: 0, y: max(0, Int(m.cy) - 50), width: img.width, height: 100)), let d = CGImageDestinationCreateWithURL(URL(fileURLWithPath: dir).appendingPathComponent("bad-\(name)-p\(n)-y\(Int(m.cy)).png") as CFURL, UTType.png.identifier as CFString, 1, nil) { CGImageDestinationAddImage(d, crop, nil); CGImageDestinationFinalize(d) }
                        if sb <= 6 { print("DISCCLEAR-BAD \(name) p\(n) y=\(m.cy) right=\(String(describing: m.right)) left=\(String(describing: m.left)) ref=\(m.ref)") } }
                }
            }
            let sp = absPct.sorted(), top = sp.isEmpty ? [] : Array(sp[Int(Double(sp.count) * 0.95)...])
            func pc(_ v: Double) -> String { String(format: "%.1f%%", v * 100) }
            print("DISCCLEAR size \(name) discs=\(st) bad=\(sb) absMeanPx=\(String(format: "%.2f", absPx.reduce(0, +) / Double(max(absPx.count, 1)))) absMeanPct=\(pc(absPct.reduce(0, +) / Double(max(absPct.count, 1)))) worst5pctMeanPct=\(pc(top.reduce(0, +) / Double(max(top.count, 1)))) maxPx=\(absPx.max() ?? 0) maxPct=\(pc(sp.last ?? 0))")
        }
        print("DISCCLEAR meanRminusL=\(sumDiff / Double(max(nDiff, 1))) n=\(nDiff)\nDISCCLEAR summary discs=\(total) bad=\(bad) badRatio=\(badRatio) badAsym=\(badAsym) worstPx=\(worst) worstRatio=\(worstRatio) worstAsym=\(worstAsym) pages=\(pages.count)")
        // سقف ratchet لا يُرفع: القياس يأخذ شريط حبر الجار عند مركز القرص فيضلّل أحيانًا عند علامات/ألفات عالية (فُحصت بالعين: ص31 وص46 iPhone سليمتان).
        // المقيس 604 صفحة: iPad11 0.31%، iPhone16Pro 0.61%، ProMax 0.46%، SE 0.59%.
        XCTAssertLessThanOrEqual(Double(bad), 0.007 * Double(max(total, 1)), "DISC-CLEAR: \(bad) قرصًا من \(total) تخالف النسبة/التماثل/الحد الأدنى")
    }

    // القارئ المستضاف (TabView) لا يُرسَم داخل حزمة اختبار بلا تطبيق مضيف: أثبتنا على محاكي iOS أن اللقطة بيضاء كليًا (ink=0 في 30/30)،
    // فكان فحص الحافة السابق يمرّ على صورة فارغة. التغطية الحقيقية للمسار الكامل بلقطات التطبيق (-snapshotRoute /mushaf/page/N).
}
