import SwiftUI

/// البسملة في أول كل سورة (عدا الفاتحة والتوبة): نصٌّ بخط QPC نفسه كما في الفاتحة (الآية 1)، لا رسم.
/// الجلايفات من أول أربع كلمات في الصفحة 1 (خط الصفحة 1)، دون علامة نهاية الآية.
enum BasmalaText {
    private static let lock = NSLock()
    private static var cache: (family: String, glyphs: [String])?

    static func load(_ repo: MushafRepository) -> (family: String, glyphs: [String])? {
        lock.lock(); defer { lock.unlock() }
        if let cache { return cache }
        guard let family = try? repo.ensureFont(page: 1), let page = try? repo.page(1),
              let first = page.rows.first(where: { $0.k == "l" }) else { return nil }
        let glyphs = (first.w ?? []).filter { !$0.isAyahEnd }.map(\.c)
        guard glyphs.count == 4 else { return nil }
        cache = (family, glyphs)
        return cache
    }
}

struct BasmalaView: View {
    let repo: MushafRepository
    let fontSize: CGFloat
    var body: some View {
        if let b = BasmalaText.load(repo) {
            HStack(spacing: fontSize * MushafMetrics.naturalGapEm) {
                ForEach(Array(b.glyphs.enumerated()), id: \.offset) { _, g in
                    Text(g).font(.custom(b.family, fixedSize: fontSize)).lineLimit(1).fixedSize()
                }
            }
            .foregroundStyle(Sunnah.Colors.textPrimary)
            .frame(maxWidth: .infinity)
            .environment(\.layoutDirection, .rightToLeft)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("بسم الله الرحمن الرحيم")
        } else {
            Color.clear
        }
    }
}
