import Foundation

/// نوع الظهور: كامل / مبسّط (تقليل الحركة) / لا شيء.
public enum IntroStyle: Equatable, Sendable { case none, full, simplified }

/// منطق الظهور والتوقيت (نقي ومختبَر). المقدّمة تظهر مع الإقلاع البارد فقط.
public enum IntroPolicy {
    public static let assembleEnd: TimeInterval = 0.55
    public static let shimmerEnd: TimeInterval = 0.85
    public static let approachEnd: TimeInterval = 1.45
    public static let totalEnd: TimeInterval = 1.6
    public static let maxHold: TimeInterval = 3.0

    public static func style(isColdLaunch: Bool, reduceMotion: Bool) -> IntroStyle {
        guard isColdLaunch else { return .none }
        return reduceMotion ? .simplified : .full
    }

    /// مدة الانتظار الإضافية بعد 1.6ث حتى جاهزية البيانات (0 إن كانت جاهزة، وبحدّ أقصى 3ث إجمالًا).
    public static func extraHold(readyAt: TimeInterval?) -> TimeInterval {
        let cap = maxHold - totalEnd
        guard let readyAt else { return cap }
        return min(max(0, readyAt - totalEnd), cap)
    }

    @MainActor private static var consumed = false
    /// أول استدعاء في عمر العملية = إقلاع بارد؛ العودة من الخلفية لا تعيد بناء الجذر فلا تُعيد المقدّمة.
    @MainActor public static func consumeColdLaunch() -> Bool {
        defer { consumed = true }
        return !consumed
    }
}
