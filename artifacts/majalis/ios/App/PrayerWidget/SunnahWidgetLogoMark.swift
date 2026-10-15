import SwiftUI

/// زخرفة شعار التطبيق (نفس زخرفة شاشة الدخولية، نسخة zellijDark الصغيرة) للويدجت.
/// البيانات منسوخة من `SunnahNative/Intro/IntroLogoData.swift` (مولَّدة بـ gen-intro-shapes.py؛ الامتداد لا يستورد الحزمة).
enum WidgetLogoData {
    struct Layer { let color: UInt32; let polys: [[CGPoint]] }

    static let layers: [Layer] = [
        Layer(color: 0x2A6E55, polys: [[CGPoint(x: 100, y: 52), CGPoint(x: 113.01, y: 68.59), CGPoint(x: 133.94, y: 66.06), CGPoint(x: 131.41, y: 86.99), CGPoint(x: 148, y: 100), CGPoint(x: 131.41, y: 113.01), CGPoint(x: 133.94, y: 133.94), CGPoint(x: 113.01, y: 131.41), CGPoint(x: 100, y: 148), CGPoint(x: 86.99, y: 131.41), CGPoint(x: 66.06, y: 133.94), CGPoint(x: 68.59, y: 113.01), CGPoint(x: 52, y: 100), CGPoint(x: 68.59, y: 86.99), CGPoint(x: 66.06, y: 66.06), CGPoint(x: 86.99, y: 68.59)], [CGPoint(x: 188, y: 100), CGPoint(x: 170, y: 118), CGPoint(x: 152, y: 100), CGPoint(x: 170, y: 82)], [CGPoint(x: 162.23, y: 162.23), CGPoint(x: 136.77, y: 162.23), CGPoint(x: 136.77, y: 136.77), CGPoint(x: 162.23, y: 136.77)], [CGPoint(x: 100, y: 188), CGPoint(x: 82, y: 170), CGPoint(x: 100, y: 152), CGPoint(x: 118, y: 170)], [CGPoint(x: 37.77, y: 162.23), CGPoint(x: 37.77, y: 136.77), CGPoint(x: 63.23, y: 136.77), CGPoint(x: 63.23, y: 162.23)], [CGPoint(x: 12, y: 100), CGPoint(x: 30, y: 82), CGPoint(x: 48, y: 100), CGPoint(x: 30, y: 118)], [CGPoint(x: 37.77, y: 37.77), CGPoint(x: 63.23, y: 37.77), CGPoint(x: 63.23, y: 63.23), CGPoint(x: 37.77, y: 63.23)], [CGPoint(x: 100, y: 12), CGPoint(x: 118, y: 30), CGPoint(x: 100, y: 48), CGPoint(x: 82, y: 30)], [CGPoint(x: 162.23, y: 37.77), CGPoint(x: 162.23, y: 63.23), CGPoint(x: 136.77, y: 63.23), CGPoint(x: 136.77, y: 37.77)]]),
        Layer(color: 0xB08D4A, polys: [[CGPoint(x: 157.28, y: 111.73), CGPoint(x: 160.82, y: 120.19), CGPoint(x: 169.28, y: 123.73), CGPoint(x: 160.82, y: 127.26), CGPoint(x: 157.28, y: 135.73), CGPoint(x: 153.74, y: 127.26), CGPoint(x: 145.28, y: 123.73), CGPoint(x: 153.74, y: 120.19)], [CGPoint(x: 132.21, y: 148.8), CGPoint(x: 128.73, y: 157.28), CGPoint(x: 132.21, y: 165.77), CGPoint(x: 123.73, y: 162.28), CGPoint(x: 115.24, y: 165.77), CGPoint(x: 118.73, y: 157.28), CGPoint(x: 115.24, y: 148.8), CGPoint(x: 123.73, y: 152.28)], [CGPoint(x: 88.27, y: 157.28), CGPoint(x: 79.81, y: 160.82), CGPoint(x: 76.27, y: 169.28), CGPoint(x: 72.74, y: 160.82), CGPoint(x: 64.27, y: 157.28), CGPoint(x: 72.74, y: 153.74), CGPoint(x: 76.27, y: 145.28), CGPoint(x: 79.81, y: 153.74)], [CGPoint(x: 51.2, y: 132.21), CGPoint(x: 42.72, y: 128.73), CGPoint(x: 34.23, y: 132.21), CGPoint(x: 37.72, y: 123.73), CGPoint(x: 34.23, y: 115.24), CGPoint(x: 42.72, y: 118.73), CGPoint(x: 51.2, y: 115.24), CGPoint(x: 47.72, y: 123.73)], [CGPoint(x: 42.72, y: 88.27), CGPoint(x: 39.18, y: 79.81), CGPoint(x: 30.72, y: 76.27), CGPoint(x: 39.18, y: 72.74), CGPoint(x: 42.72, y: 64.27), CGPoint(x: 46.26, y: 72.74), CGPoint(x: 54.72, y: 76.27), CGPoint(x: 46.26, y: 79.81)], [CGPoint(x: 67.79, y: 51.2), CGPoint(x: 71.27, y: 42.72), CGPoint(x: 67.79, y: 34.23), CGPoint(x: 76.27, y: 37.72), CGPoint(x: 84.76, y: 34.23), CGPoint(x: 81.27, y: 42.72), CGPoint(x: 84.76, y: 51.2), CGPoint(x: 76.27, y: 47.72)], [CGPoint(x: 111.73, y: 42.72), CGPoint(x: 120.19, y: 39.18), CGPoint(x: 123.73, y: 30.72), CGPoint(x: 127.26, y: 39.18), CGPoint(x: 135.73, y: 42.72), CGPoint(x: 127.26, y: 46.26), CGPoint(x: 123.73, y: 54.72), CGPoint(x: 120.19, y: 46.26)], [CGPoint(x: 148.8, y: 67.79), CGPoint(x: 157.28, y: 71.27), CGPoint(x: 165.77, y: 67.79), CGPoint(x: 162.28, y: 76.27), CGPoint(x: 165.77, y: 84.76), CGPoint(x: 157.28, y: 81.27), CGPoint(x: 148.8, y: 84.76), CGPoint(x: 152.28, y: 76.27)]]),
        Layer(color: 0xE9E1CC, polys: [[CGPoint(x: 100, y: 76), CGPoint(x: 103.83, y: 90.76), CGPoint(x: 116.97, y: 83.03), CGPoint(x: 109.24, y: 96.17), CGPoint(x: 124, y: 100), CGPoint(x: 109.24, y: 103.83), CGPoint(x: 116.97, y: 116.97), CGPoint(x: 103.83, y: 109.24), CGPoint(x: 100, y: 124), CGPoint(x: 96.17, y: 109.24), CGPoint(x: 83.03, y: 116.97), CGPoint(x: 90.76, y: 103.83), CGPoint(x: 76, y: 100), CGPoint(x: 90.76, y: 96.17), CGPoint(x: 83.03, y: 83.03), CGPoint(x: 96.17, y: 90.76)]]),
    ]
}

private struct WidgetLogoShape: Shape {
    let points: [CGPoint]
    func path(in rect: CGRect) -> Path {
        var p = Path()
        let s = min(rect.width, rect.height) / 200
        let o = CGPoint(x: rect.midX - 100 * s, y: rect.midY - 100 * s)
        for (i, pt) in points.enumerated() {
            let q = CGPoint(x: o.x + pt.x * s, y: o.y + pt.y * s)
            i == 0 ? p.move(to: q) : p.addLine(to: q)
        }
        p.closeSubpath()
        return p
    }
}

/// شعار/زخرفة سُنّة صغيرة للويدجت (زخرفية فقط: مخفية عن VoiceOver).
struct SunnahWidgetLogoMark: View {
    var size: CGFloat = 34

    var body: some View {
        ZStack {
            ForEach(Array(WidgetLogoData.layers.enumerated()), id: \.offset) { _, layer in
                ForEach(Array(layer.polys.enumerated()), id: \.offset) { _, pts in
                    WidgetLogoShape(points: pts).fill(Color(.sRGB, red: Double((layer.color >> 16) & 0xFF) / 255, green: Double((layer.color >> 8) & 0xFF) / 255, blue: Double(layer.color & 0xFF) / 255))
                }
            }
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}
