import SwiftUI

/// مسار SVG مبسّط (M/L/C/Z مطلقة فقط، كما يولّده تتبّع الأصل) إلى SwiftUI Path.
enum SVGPathParser {
    static func path(_ d: String) -> Path {
        var p = Path()
        var nums: [CGFloat] = []
        var cmd: Character = "M"
        func flush() {
            switch cmd {
            case "M" where nums.count >= 2: p.move(to: CGPoint(x: nums[0], y: nums[1]))
            case "L" where nums.count >= 2: p.addLine(to: CGPoint(x: nums[0], y: nums[1]))
            case "C" where nums.count >= 6:
                p.addCurve(to: CGPoint(x: nums[4], y: nums[5]), control1: CGPoint(x: nums[0], y: nums[1]), control2: CGPoint(x: nums[2], y: nums[3]))
            case "Z": p.closeSubpath()
            default: break
            }
            nums.removeAll(keepingCapacity: true)
        }
        var cur = ""
        for ch in d {
            if "MLCZ".contains(ch) {
                if !cur.isEmpty { nums.append(CGFloat(Double(cur) ?? 0)); cur = "" }
                flush(); cmd = ch
                if ch == "Z" { flush() }
            } else if ch == " " {
                if !cur.isEmpty { nums.append(CGFloat(Double(cur) ?? 0)); cur = "" }
            } else { cur.append(ch) }
        }
        if !cur.isEmpty { nums.append(CGFloat(Double(cur) ?? 0)) }
        flush()
        return p
    }
}

/// لافتة اسم السورة: إطار متجهي (Art/surah-banner.svg بعد محو الاسم)؛ الألوان من الرموز، والاسم بخط أسماء السور (QPC) فوق الإطار.
struct SurahBanner: View {
    let surah: Int
    let name: String
    let repo: MushafRepository?

    private static let ivory = SVGPathParser.path(SurahBannerArt.ivory)
    private static let green = SVGPathParser.path(SurahBannerArt.green)
    private static let gold = SVGPathParser.path(SurahBannerArt.gold)

    var body: some View {
        GeometryReader { g in
            let s = g.size.width / SurahBannerArt.size.width
            let h = SurahBannerArt.size.height * s
            ZStack {
                Canvas { ctx, _ in
                    let t = CGAffineTransform(scaleX: s, y: s)
                    ctx.fill(Path(CGRect(origin: .zero, size: CGSize(width: g.size.width, height: h))), with: .color(Sunnah.Colors.mushafSage))
                    ctx.fill(Self.ivory.applying(t), with: .color(Sunnah.Colors.mushafIvory), style: FillStyle(eoFill: true))
                    ctx.fill(Self.green.applying(t), with: .color(Sunnah.Colors.mushafAccent), style: FillStyle(eoFill: true))
                    ctx.fill(Self.gold.applying(t), with: .color(Sunnah.Colors.mushafGold), style: FillStyle(eoFill: true))
                }
                nameView(height: h)
            }
            .frame(width: g.size.width, height: h)
            .position(x: g.size.width / 2, y: g.size.height / 2)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("سورة \(name)")
    }

    @ViewBuilder
    private func nameView(height h: CGFloat) -> some View {
        if let family = try? repo?.ensureSurahNameFont() {
            Text(Mushaf.surahNameGlyph(surah) + "\u{E000}")
                .font(.custom(family, fixedSize: h * 0.62))
                .foregroundStyle(Sunnah.Colors.mushafInk)
        } else {
            Text("سورة \(name)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.mushafInk)
        }
    }
}
