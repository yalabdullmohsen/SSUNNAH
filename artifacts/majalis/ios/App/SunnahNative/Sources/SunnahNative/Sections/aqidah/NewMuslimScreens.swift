import SwiftUI

// MARK: مسار المسلم الجديد — /discover-islam/new-muslim و /:day

/// مفتاح التقدّم المحلي (أيام مكتملة مفصولة بفواصل). المزامنة مع new_muslim_progress للمسجَّل تُطلب في requests/aqidah.md.
let aqidahNewMuslimProgressKey = "aqidah.newMuslim.completed"

public struct AqidahNewMuslimPathScreen: ScreenTemplate {
    public static let id = "discover-islam.new-muslim"
    public static let title = "مسار الثلاثين يومًا"
    public static let source = AqidahContent.source("discover-islam-new-muslim")

    let days: [NewMuslimDay]
    @AppStorage(aqidahNewMuslimProgressKey) private var progressRaw = ""
    public init(content: [NewMuslimDay]) { days = AqidahContent.accepted(content) }

    public var body: some View {
        let done = AqidahContent.decodeProgress(progressRaw)
        if days.isEmpty { EmptyStateView() } else {
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    Text("لا سباق ولا حساب للتأخر — أكمل بالسرعة التي تناسبك، وارجع إلى أي يوم متى شئت.")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    ProgressView(value: Double(days.filter { done.contains($0.dayNumber) }.count), total: Double(days.count))
                        .tint(Sunnah.Colors.primary)
                        .accessibilityLabel("التقدّم في المسار")
                    AqidahLinkList(items: days,
                                   title: { "اليوم \($0.dayNumber): \($0.title)" },
                                   subtitle: { done.contains($0.dayNumber) ? "مكتمل" : nil },
                                   path: { "/discover-islam/new-muslim/\($0.dayNumber)" })
                }
                .padding(Sunnah.Spacing.pageX)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}

struct AqidahNewMuslimDayView: View {
    let day: NewMuslimDay
    @AppStorage(aqidahNewMuslimProgressKey) private var progressRaw = ""

    var body: some View {
        let done = AqidahContent.decodeProgress(progressRaw).contains(day.dayNumber)
        AqidahPage(title: "اليوم \(day.dayNumber)", hero: day.title) {
            AqidahParagraphs(text: day.contentAr)
            SunnahButton(done ? "مكتمل ✓" : "أكملت هذا اليوم", style: done ? .secondary : .primary) {
                var set = AqidahContent.decodeProgress(progressRaw)
                if done { set.remove(day.dayNumber) } else { set.insert(day.dayNumber) }
                progressRaw = AqidahContent.encodeProgress(set)
            }
        }
    }
}
