#if os(iOS)
import XCTest
import SwiftUI
import UIKit
@testable import SunnahNative

private struct WordXKey: PreferenceKey {
    static var defaultValue: [Int: CGRect] = [:]
    static func reduce(value: inout [Int: CGRect], nextValue: () -> [Int: CGRect]) { value.merge(nextValue()) { $1 } }
}

/// نسخة بالمنطق القديم (البدء من maxX) لاختبار الطفرة: يجب أن يلتقط الحارس عكسها.
private struct ReversedFlow: Layout {
    var spacing: CGFloat
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize { CGSize(width: proposal.width ?? 300, height: subviews.map { $0.sizeThatFits(.unspecified).height }.max() ?? 0) }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.maxX
        for s in subviews { let sz = s.sizeThatFits(.unspecified); x -= sz.width; s.place(at: CGPoint(x: x, y: bounds.minY), anchor: .topLeading, proposal: ProposedViewSize(sz)); x -= spacing }
    }
}

/// حارس ترتيب كلمات الآية المعروض (ورقة التحديد وكل شاشة تستعمل MushafWordFlow): بترتيب الآية الفعلي، أول كلمة في أقصى اليمين
/// وتنتهي بقرص النهاية في أقصى اليسار من السطر، والأسطر من الأعلى للأسفل، لكل أحجام الورقة فاتحًا وداكنًا في RTL.
final class MushafWordOrderTests: XCTestCase {
    /// يرسم الكلمات (بخط صفحاتها الفعلي) داخل بنية الورقة نفسها ويعيد إطار كل كلمة.
    @MainActor private func frames(words: [MushafAyahWord], width: CGFloat, dark: Bool, reversed: Bool = false) -> [CGRect] {
        var got: [Int: CGRect] = [:]
        let fs: CGFloat = 22
        let cells = ForEach(Array(words.enumerated()), id: \.offset) { i, w in
            Text(w.c).lineLimit(1).fixedSize().font(.custom(Mushaf.fontFamily(page: w.page), fixedSize: fs))
                .background(GeometryReader { g in Color.clear.preference(key: WordXKey.self, value: [i: g.frame(in: .named("c"))]) })
        }
        let flow: AnyView = reversed ? AnyView(ReversedFlow(spacing: 4) { cells }) : AnyView(MushafWordFlow(spacing: fs * MushafMetrics.naturalGapEm, lineSpacing: fs * 0.55) { cells })
        let root = ScrollView { VStack(alignment: .leading, spacing: 6) { flow }.frame(maxWidth: .infinity, alignment: .leading) }
            .frame(maxHeight: 230).fixedSize(horizontal: false, vertical: true)
            .coordinateSpace(name: "c").environment(\.layoutDirection, .rightToLeft).environment(\.colorScheme, dark ? .dark : .light)
            .onPreferenceChange(WordXKey.self) { got = $0 }.frame(width: width, height: 400)
        let host = UIHostingController(rootView: root)
        let win = UIWindow(frame: CGRect(x: 0, y: 0, width: width, height: 400)); win.overrideUserInterfaceStyle = dark ? .dark : .light
        win.rootViewController = host; win.makeKeyAndVisible()
        host.view.layoutIfNeeded(); RunLoop.current.run(until: Date().addingTimeInterval(0.3)); host.view.layoutIfNeeded()
        win.isHidden = true
        return words.indices.compactMap { got[$0] }
    }

    /// صحيح إن كان الترتيب المعروض = ترتيب الآية: داخل السطر x يتناقص (اليمين أولًا)، وبين الأسطر y يتزايد، وأول كلمة في السطر الأول هي الأيمن.
    private func orderIsCorrect(_ f: [CGRect]) -> Bool {
        guard f.count > 1 else { return true }
        for i in 1..<f.count {
            let a = f[i - 1], b = f[i]
            let sameLine = abs(a.midY - b.midY) < a.height * 0.5
            if sameLine { if b.midX >= a.midX { return false } } else if b.midY <= a.midY { return false }
        }
        return true
    }

    @MainActor func testDisplayedWordOrderMatchesAyahOnAllSheetSizes() throws {
        guard let dp = ProcessInfo.processInfo.environment["MUSHAF_DATA"] else { throw XCTSkip("MUSHAF_DATA غير محدد") }
        let repo = MushafRepository(root: URL(fileURLWithPath: dp)), idx = try repo.index()
        var rowsOf: [String: Int] = [:]
        for p in 1...Mushaf.pageCount { for row in (try? repo.page(p))?.rows ?? [] { for v in Set((row.w ?? []).map(\.v)) { rowsOf[v, default: 0] += 1 } } }
        let longest = try XCTUnwrap(rowsOf.max { $0.value < $1.value }?.key)
        _ = idx
        for ayah in ["1:2", "2:255", longest] {   // قصيرة، متوسطة، كاملة (أطول آية)
            let words = try XCTUnwrap(MushafAyahWords.load(ayah: ayah, repo: repo), ayah)
            for p in Set(words.map(\.page)) { _ = try? repo.ensureFont(page: p) }
            for width in [CGFloat](arrayLiteral: 370, 370, 802) {   // iPhone وiPad (عرض الورقة بعد الهوامش)
                for dark in [false, true] {
                    let f = frames(words: words, width: width, dark: dark)
                    XCTAssertEqual(f.count, words.count, "كلمات مفقودة \(ayah) w=\(width)")
                    XCTAssertTrue(orderIsCorrect(f), "ترتيب الكلمات المعروض معكوس \(ayah) w=\(width) dark=\(dark)")
                    let line1 = f.filter { abs($0.midY - f[0].midY) < f[0].height * 0.5 }   // السطر الأول: الكلمة الأولى أقصى اليمين
                    XCTAssertEqual(line1.map(\.midX).max(), f[0].midX, "أول كلمة ليست أقصى يمين السطر الأول \(ayah) w=\(width) dark=\(dark)")
                }
            }
            // طفرة: المنطق القديم (maxX) يجب أن يفشل الحارس نفسه
            let bad = frames(words: words, width: 370, dark: false, reversed: true)
            XCTAssertFalse(orderIsCorrect(bad), "الحارس لا يلتقط عكس الترتيب \(ayah)")
        }
    }
}
#endif
