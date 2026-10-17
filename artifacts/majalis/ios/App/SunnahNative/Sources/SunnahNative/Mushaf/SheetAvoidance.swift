import CoreGraphics

/// قاعدة «لا تُغطّي بطاقة أي عنصر محدد»: دالة نقية تحسب كيف تتجنّب الصفحةُ البطاقةَ السفلية.
/// الإحداثيات بالنقاط في فضاء الصفحة (قبل أي تحويل).
public enum SheetAvoidance {
    public struct Plan: Equatable {
        /// إزاحة عمودية للصفحة (سالبة = للأعلى).
        public var dy: CGFloat = 0
        /// تصغير بمرساة الأعلى (1 = بلا تصغير).
        public var scale: CGFloat = 1
        /// البطاقة في الأعلى بدل الأسفل.
        public var sheetOnTop = false
        public static let none = Plan()
    }

    public static let margin: CGFloat = 8
    public static let topInsetRatio: CGFloat = 0.07
    public static let minScale: CGFloat = 0.5

    /// ‏`ayahMinY/MaxY`: مستطيل الآية كله (كل أسطرها). `sheetHeight`: الارتفاع الفعلي للبطاقة بما فيه الحافة الآمنة.
    public static func plan(pageHeight h: CGFloat, ayahMinY: CGFloat, ayahMaxY: CGFloat, sheetHeight: CGFloat) -> Plan {
        guard h > 0, sheetHeight > 0, ayahMaxY > ayahMinY else { return .none }
        let limit = h - sheetHeight - margin
        if ayahMaxY <= limit { return .none }
        let topInset = h * topInsetRatio
        let need = ayahMaxY - limit
        if ayahMinY - need >= topInset { return Plan(dy: -need) }
        // الآية في النصف السفلي وتتسع المنطقة تحت بطاقة علوية: نقل البطاقة للأعلى بلا تحريك الصفحة.
        if ayahMinY >= h / 2, ayahMinY >= topInset + sheetHeight + margin { return Plan(sheetOnTop: true) }
        // التصغير بمرساة الأعلى يضرب الإحداثيات كلها: يلزم maxY·s ≤ limit.
        let s = max(minScale, min(1, limit / ayahMaxY))
        return Plan(scale: s)
    }

    /// مستطيل الآية على الصفحة من أسطرها: `rowIndices` فهارس الأسطر المعروضة التي فيها كلمات الآية.
    public static func ayahSpan(rowIndices: [Int], top: CGFloat, rowHeight: CGFloat) -> (minY: CGFloat, maxY: CGFloat)? {
        guard let first = rowIndices.min(), let last = rowIndices.max() else { return nil }
        return (top + CGFloat(first) * rowHeight, top + CGFloat(last + 1) * rowHeight)
    }

    /// المستطيل بعد تطبيق الخطة (للتحقق من عدم التقاطع مع البطاقة).
    public static func visibleSpan(_ span: (minY: CGFloat, maxY: CGFloat), plan: Plan) -> (minY: CGFloat, maxY: CGFloat) {
        (span.minY * plan.scale + plan.dy, span.maxY * plan.scale + plan.dy)
    }
}
