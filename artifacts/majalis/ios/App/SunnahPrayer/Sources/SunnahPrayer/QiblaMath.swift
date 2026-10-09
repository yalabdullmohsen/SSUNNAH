import Adhan
import Foundation

/// حساب القبلة — نفس منفذ adhan الذي تعتمده `src/lib/qibla-math.ts` على الويب (`Qibla()`).
public enum QiblaMath {
    /// سماحية المحاذاة بالدرجات — مطابقة لـ`QIBLA_ALIGN_TOLERANCE_DEG`.
    public static let alignTolerance = 2.5
    /// تحذير المعايرة عند تجاوز دقة البوصلة هذا الحد — مطابق لـ`QIBLA_ACCURACY_WARN_DEG`.
    public static let accuracyWarn = 15.0

    /// اتجاه الكعبة بالدرجات مع عقارب الساعة من الشمال الحقيقي.
    public static func bearing(latitude: Double, longitude: Double) -> Double {
        Qibla(coordinates: Coordinates(latitude: latitude, longitude: longitude)).direction
    }

    /// أقصر فرق زاوي موقّع في (−180، 180].
    public static func shortestDelta(from: Double, to: Double) -> Double {
        let d = (to - from + 540).truncatingRemainder(dividingBy: 360) - 180
        return d == -180 ? 180 : d
    }

    public static func isAligned(heading: Double, bearing: Double) -> Bool {
        abs(shortestDelta(from: heading, to: bearing)) <= alignTolerance
    }

    /// تنعيم الاتجاه عبر أقصر قوس كي لا يقفز المؤشر عند عبور 0/360.
    public static func smooth(previous: Double?, next: Double, factor: Double = 0.25) -> Double {
        guard let previous else { return next }
        let v = previous + shortestDelta(from: previous, to: next) * factor
        return (v.truncatingRemainder(dividingBy: 360) + 360).truncatingRemainder(dividingBy: 360)
    }
}
