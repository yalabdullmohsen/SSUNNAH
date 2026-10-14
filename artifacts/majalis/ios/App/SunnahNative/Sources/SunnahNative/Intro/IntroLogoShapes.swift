import SwiftUI

/// قطعة واحدة من الشعار (مضلّع) داخل مربع 200×200.
struct IntroPolyShape: Shape {
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

enum IntroTheme: Equatable {
    case primary, starDish, zellijDark

    /// يتبع أيقونة التطبيق المختارة (مستقل عن حزمة منتقي الأيقونة)؛ الأساسية تتبع وضع النظام.
    static func current(alternateIconName: String?, dark: Bool) -> IntroTheme {
        switch alternateIconName {
        case "AppIcon-StarDish": return .starDish
        case "AppIcon-ZellijDark": return .zellijDark
        default: return dark ? .zellijDark : .primary
        }
    }

    var layers: [IntroLogoData.Layer] {
        switch self {
        case .primary: return IntroLogoData.primary
        case .starDish: return IntroLogoData.starDish
        case .zellijDark: return IntroLogoData.zellijDark
        }
    }

    var background: Color {
        switch self {
        case .primary: return Color(hex: 0xF7F4EC)   // مطابق لـLaunchBackground
        case .starDish: return Color(hex: 0x1F5C46)
        case .zellijDark: return Color(hex: 0x0F1A15)
        }
    }

    var shimmer: Color { Color(hex: 0xD9C089) }
}

extension Color {
    init(hex: UInt32) {
        self.init(.sRGB, red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255, opacity: 1)
    }
}

/// دور القطعة في التركيب.
enum IntroPieceRole: Equatable {
    case core            // النجمة المركزية (أو نجوم StarDish): تكبر وتدور
    case tile(angle: Double)  // معيّن/مربع: ينزلق من الخارج على زاويته
    case gold            // نجمة ذهبية صغيرة: تظهر لاحقًا بدوران خفيف
}

struct IntroPiece: Identifiable {
    let id: Int
    let points: [CGPoint]
    let color: Color
    let role: IntroPieceRole
    let order: Int   // ترتيب التتابع داخل دوره
}

enum IntroPieces {
    static func build(_ theme: IntroTheme) -> [IntroPiece] {
        var out: [IntroPiece] = []
        var id = 0
        for (li, layer) in theme.layers.enumerated() {
            var tileOrder = 0
            for poly in layer.polys {
                let cx = poly.map(\.x).reduce(0, +) / Double(poly.count)
                let cy = poly.map(\.y).reduce(0, +) / Double(poly.count)
                let d = hypot(cx - 100, cy - 100)
                let role: IntroPieceRole
                if d < 5 { role = .core }
                else if poly.count == 4 { role = .tile(angle: atan2(cy - 100, cx - 100)) }
                else { role = .gold }
                let order = role == .core ? li : tileOrder
                if case .tile = role { tileOrder += 1 } else if role == .gold { tileOrder += 1 }
                out.append(IntroPiece(id: id, points: poly, color: Color(hex: layer.color), role: role, order: order))
                id += 1
            }
        }
        return out
    }
}
