import SwiftUI

/// خرطوشة رقم الصفحة: زخرفة متجهية (Art/page-cartouche.svg) بنسب المرجع، والرقم نص فوقها.
struct PageCartouche: View {
    let text: String
    var height: CGFloat = 30

    private static let base = SVGPathParser.path(PageCartoucheArt.base)
    private static let ivory = SVGPathParser.path(PageCartoucheArt.ivory)
    private static let gold = SVGPathParser.path(PageCartoucheArt.gold)

    var body: some View {
        let w = height * PageCartoucheArt.size.width / PageCartoucheArt.size.height
        let s = height / PageCartoucheArt.size.height
        ZStack {
            Canvas { ctx, _ in
                let t = CGAffineTransform(scaleX: s, y: s)
                ctx.fill(Self.base.applying(t), with: .color(Sunnah.Colors.mushafSage), style: FillStyle(eoFill: true))
                ctx.fill(Self.ivory.applying(t), with: .color(Sunnah.Colors.mushafIvory), style: FillStyle(eoFill: true))
                ctx.fill(Self.gold.applying(t), with: .color(Sunnah.Colors.mushafGold), style: FillStyle(eoFill: true))
            }
            Text(text)
                .font(.system(size: height * 0.44, weight: .bold)).monospacedDigit()
                .foregroundStyle(Sunnah.Colors.mushafInk)
        }
        .frame(width: w, height: height)
    }
}
