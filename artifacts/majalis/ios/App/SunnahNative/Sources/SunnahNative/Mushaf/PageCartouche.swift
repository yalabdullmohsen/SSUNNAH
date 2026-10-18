import SwiftUI

/// خرطوشة رقم الصفحة: زخرفة هندسية أصلية مرسومة برمجيًا (سداسي مدبَّب الطرفين بثلاث طبقات: مريمية/عاج/إطار ذهبي)، والرقم نص فوقها.
struct PageCartouche: View {
    let text: String
    var height: CGFloat = 30

    private static let aspect: CGFloat = 171.0 / 73.0

    private static func hexagon(in r: CGRect) -> Path {
        let tip = r.height * 0.5
        var p = Path()
        p.move(to: CGPoint(x: r.minX + tip, y: r.minY))
        p.addLine(to: CGPoint(x: r.maxX - tip, y: r.minY))
        p.addLine(to: CGPoint(x: r.maxX, y: r.midY))
        p.addLine(to: CGPoint(x: r.maxX - tip, y: r.maxY))
        p.addLine(to: CGPoint(x: r.minX + tip, y: r.maxY))
        p.addLine(to: CGPoint(x: r.minX, y: r.midY))
        p.closeSubpath()
        return p
    }

    var body: some View {
        let w = height * Self.aspect
        ZStack {
            Canvas { ctx, size in
                let u = size.height / 73
                let full = CGRect(origin: .zero, size: size)
                ctx.fill(Self.hexagon(in: full), with: .color(Sunnah.Colors.mushafSage))
                ctx.fill(Self.hexagon(in: full.insetBy(dx: 6 * u, dy: 6 * u)), with: .color(Sunnah.Colors.mushafIvory))
                ctx.stroke(Self.hexagon(in: full.insetBy(dx: 11 * u, dy: 11 * u)), with: .color(Sunnah.Colors.mushafGold),
                           style: StrokeStyle(lineWidth: 2 * u, lineJoin: .round))
                for x in [CGFloat(8), size.width / u - 8] {
                    let c = CGRect(x: x * u - 3.5 * u, y: size.height / 2 - 3.5 * u, width: 7 * u, height: 7 * u)
                    ctx.fill(Path(ellipseIn: c), with: .color(Sunnah.Colors.mushafGold))
                }
            }
            Text(text)
                .font(.system(size: height * 0.44, weight: .bold)).monospacedDigit()
                .foregroundStyle(Sunnah.Colors.mushafInk)
        }
        .frame(width: w, height: height)
    }
}
