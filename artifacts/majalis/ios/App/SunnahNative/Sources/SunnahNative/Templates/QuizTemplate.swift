import SwiftUI

/// قالب 5 — اختبار: سؤال واحد في كل مرة، تغذية راجعة فورية، نتيجة في النهاية.
public struct QuizTemplate: View {
    let questions: [QuizQuestion]
    public init(questions: [QuizQuestion]) { self.questions = questions }
    public var body: some View {
        if questions.isEmpty { EmptyStateView() } else { QuizRunner(questions: questions).background(Sunnah.Colors.bg) }
    }
}

private struct QuizRunner: View {
    let questions: [QuizQuestion]
    @State private var index = 0
    @State private var picked: Int?
    @State private var score = 0
    @State private var revealed = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                if index >= questions.count {
                    Text("النتيجة: \(score) / \(questions.count)".arabicDigits).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    SunnahButton("إعادة الاختبار") { index = 0; picked = nil; score = 0; revealed = false }
                } else {
                    let q = questions[index]
                    Text("\(index + 1) / \(questions.count)".arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(q.prompt).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    if q.isOpen { openBody(q) } else {
                    ForEach(Array(q.options.enumerated()), id: \.offset) { i, option in
                        Button { choose(i, of: q) } label: {
                            Text(option).font(Sunnah.Typography.body)
                                .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch, alignment: .leading)
                                .padding(.horizontal, Sunnah.Spacing.s4)
                                .foregroundStyle(Sunnah.Colors.textPrimary)
                                .background(fill(i, q), in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                        }
                        .buttonStyle(.plain).disabled(picked != nil)
                    }
                    if picked != nil {
                        if let e = q.explanation { Text(e).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                        SunnahButton("التالي") { index += 1; picked = nil }
                    }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.pageX)
        }
    }

    @ViewBuilder private func openBody(_ q: QuizQuestion) -> some View {
        if revealed {
            Text(q.options.first ?? "").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .padding(Sunnah.Spacing.s4).frame(maxWidth: .infinity, alignment: .leading)
                .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
            if let e = q.explanation { Text(e).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
            SunnahButton("عرفتها") { advance(correct: true) }
            SunnahButton("لم أعرفها") { advance(correct: false) }
        } else {
            SunnahButton("أظهر الجواب") { revealed = true }
        }
    }

    private func advance(correct: Bool) {
        if correct { score += 1 }
        revealed = false; index += 1; picked = nil
    }

    private func choose(_ i: Int, of q: QuizQuestion) {
        picked = i
        if i == q.answerIndex { score += 1 }
    }

    private func fill(_ i: Int, _ q: QuizQuestion) -> Color {
        guard let p = picked else { return Sunnah.Colors.surface }
        if i == q.answerIndex { return Sunnah.Colors.primarySoft }
        return i == p ? Sunnah.Colors.surface2 : Sunnah.Colors.surface
    }
}
