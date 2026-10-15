import Foundation

/// توزيع صفحة المصحف من بيانات تخطيط QPC (15 سطرًا): نوع كل سطر (h اسم سورة، b بسملة، l آيات، x فراغ)
/// يحدد موضعه تلقائيًا؛ لا فجوات يدوية لكل صفحة.
/// - الصفحات العادية: الأسطر كما هي من شبكة 15 سطرًا من أعلى منطقة النص.
/// - صفحتا الافتتاح (1 و2): تُطبع كتلتهما (عنوان السورة [+ بسملة] ← فاصل ← الأسطر) مركّزةً رأسيًا بين سطر الرأس وسطر الذيل؛
///   سلسلة الفراغ (x) في البيانات تُختزل إلى فاصل واحد، وتُسقط الفراغات الطرفية.
public enum MushafPageLayout {
    /// مركز سطر الرأس ومركز خرطوشة الذيل كنسبة من ارتفاع الصفحة (هندسة المرجع 402×874).
    public static let headerCenter: Double = 0.088
    public static let footerCenter: Double = 0.9435
    /// بداية منطقة الأسطر العادية وارتفاعها كنسبة من ارتفاع الصفحة.
    public static let areaTop: Double = 0.102
    public static let areaHeight: Double = 0.811
    public static let slotCount = 15
    /// أعرض نسبة عرض/ارتفاع للصفحة (iPad عمودي 0.75): ما فوقها (الأفقي) تُمركَز الصفحة بهذا العرض بدل التمدّد فيُفصل النص عن اللافتة.
    /// الهواتف (≤0.56) وiPad العمودي لا يتأثران؛ التغيير قياس وتمركز فقط.
    public static let maxAspect: Double = 0.75
    public static func canvasWidth(container: CGSize) -> CGFloat { min(container.width, container.height * CGFloat(maxAspect)) }

    /// الأسطر التي ستُعرض بالترتيب (بعد اختزال الفراغات في صفحتي الافتتاح).
    public static func displayRows(_ page: MushafPage) -> [MushafRow] {
        guard page.opening else { return page.rows }
        var out: [MushafRow] = []
        for r in page.rows {
            if r.k == "x" { if let last = out.last, last.k != "x" { out.append(r) } } else { out.append(r) }
        }
        while out.last?.k == "x" { out.removeLast() }
        return out
    }

    /// ارتفاع السطر الواحد وأعلى الكتلة (بالنقاط) لصفحة ارتفاعها `height`.
    public static func metrics(for page: MushafPage, height: Double) -> (rowHeight: Double, top: Double, rows: [MushafRow]) {
        let rows = displayRows(page)
        let rowH = areaHeight * height / Double(max(slotCount, rows.count))
        let block = rowH * Double(rows.count)
        let top = page.opening ? (headerCenter + footerCenter) / 2 * height - block / 2 : areaTop * height
        return (rowH, top, rows)
    }
}
