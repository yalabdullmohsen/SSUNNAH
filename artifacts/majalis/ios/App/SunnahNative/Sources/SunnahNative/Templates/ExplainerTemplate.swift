import SwiftUI

/// مرحلة في «الشرح التفاعلي»: عنوان + نص قصير + (اختياري) رسم متجهي أصلي + آية ومصدر.
public struct ExplainerStage: Identifiable {
    public let id: Int; public let title: String; public let text: String
    public var ayahRef: String?; public var ayahText: String?; public var source: String?
    public var art: AnyView?
    public init(id: Int, title: String, text: String, ayahRef: String? = nil, ayahText: String? = nil, source: String? = nil, art: AnyView? = nil) {
        self.id = id; self.title = title; self.text = text; self.ayahRef = ayahRef; self.ayahText = ayahText; self.source = source; self.art = art
    }
}

/// قالب مشترك لأي موضوع علمي/معجزة/مراحل: مراحل متسلسلة + السابق/التالي + مؤشر تقدم + انتقال ناعم (يحترم Reduce Motion)،
/// وتحت كل مرحلة بطاقة الآية والمصدر. الرسوم أصلية متجهية فقط (انظر docs/native/ASSETS_LICENSES.md).
public struct ExplainerTemplate: View {
    let title: String; let stages: [ExplainerStage]
    @State private var index = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    public init(title: String, stages: [ExplainerStage]) { self.title = title; self.stages = stages }

    public var body: some View {
        ScrollView {
            if stages.isEmpty { EmptyStateView() } else {
                let s = stages[min(index, stages.count - 1)]
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    SunnahStepper(index: $index, count: stages.count)
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                        if let art = s.art { art.frame(maxWidth: .infinity).frame(height: 180).accessibilityHidden(true) }
                        Text("المرحلة \(s.id): \(s.title)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        SunnahArabicText(s.text, style: .reading).foregroundStyle(Sunnah.Colors.textPrimary)
                        if let t = s.ayahText {
                            SunnahCard {
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                    SunnahArabicText(t, style: .quran).foregroundStyle(Sunnah.Colors.textPrimary)
                                    if let r = s.ayahRef { Text(SunnahAyahRange.display(r)).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary) }
                                    if let src = s.source { Text(src).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
                                }
                            }
                        }
                    }
                    .id(s.id)
                    .transition(reduceMotion ? .opacity : .asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity), removal: .opacity))
                }
                .padding(Sunnah.Spacing.pageX)
                .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: index)
            }
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle(title)
        .accessibilityIdentifier("explainer")
    }
}
