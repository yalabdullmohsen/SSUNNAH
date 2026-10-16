import SwiftUI

/// حالة الطيّ خلال الجلسة فقط (لا تُحفظ على القرص): مفتاح القسم ← مفتوح؟
@MainActor enum SunnahSectionStore { static var open: [String: Bool] = [:] }

/// قسم قابل للطيّ والفتح: ترويسة بسهم يدور + محتوى. الحركة تتوقف مع «تقليل الحركة» (تبديل فوري)، وVoiceOver يقرأ «مطوي/مفتوح».
/// لا يُستعمل لأي نص شرعي (آية/حديث/أثر ومصدره): القالب يقرر ذلك في `SunnahMarkdown.sections`.
public struct SunnahCollapsibleSection<Content: View>: View {
    let id: String; let title: String; let content: Content
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var expanded: Bool

    public init(id: String, title: String, startsCollapsed: Bool, @ViewBuilder content: () -> Content) {
        self.id = id; self.title = title; self.content = content()
        _expanded = State(initialValue: SunnahSectionStore.open[id] ?? !startsCollapsed)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Button {
                SunnahHaptic.light()
                withAnimation(reduceMotion ? nil : SunnahMotion.standard) { expanded.toggle() }
                SunnahSectionStore.open[id] = expanded
            } label: {
                HStack(spacing: Sunnah.Spacing.s3) {
                    Text(SunnahMarkdown.inline(title))
                        .font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Image(systemName: "chevron.down").font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Sunnah.Colors.primary)
                        .rotationEffect(.degrees(expanded ? 180 : 0))
                        .accessibilityHidden(true)
                }
                .frame(minHeight: 44).contentShape(Rectangle())
            }
            .sunnahPressable()
            .accessibilityElement(children: .combine)
            .accessibilityAddTraits(.isHeader)
            .accessibilityValue(expanded ? "مفتوح" : "مطوي")
            .accessibilityHint(expanded ? "اضغط لطيّ القسم" : "اضغط لفتح القسم")
            if expanded {
                content.transition(reduceMotion ? .identity : .opacity)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
