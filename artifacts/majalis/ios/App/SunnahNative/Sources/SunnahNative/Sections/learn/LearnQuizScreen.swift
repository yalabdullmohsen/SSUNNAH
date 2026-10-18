import SwiftUI

/// /quiz — أبواب الأسئلة المصدَّرة (الحيّة الموثّقة فقط) ثم أسئلة الباب.
/// الأسئلة في الملفات مفتوحة بلا خيارات، فتُعرض بطريقة الويب: إظهار الجواب ثم «عرفتها/لم أعرفها».
struct LearnQuizScreen: View {
    var body: some View {
        LearnLoadHost(LearnSources.quizManifest) { (manifest: LearnQuizManifest) in
            LearnList(items: manifest.chunks.filter { $0.count > 0 }, emptyTitle: "لا أسئلة موثّقة بعد") { chunk in
                SunnahNavigationLink {
                    LearnLoadHost(LearnSources.quizChunk(chunk)) { (questions: [LearnOpenQuestion]) in
                        LearnOpenQuizRunner(questions: questions)
                    }
                    .sunnahNavTitle(chunk.title)
                } label: {
                    SunnahListRow(title: chunk.title, subtitle: "\(chunk.count) سؤالًا")
                }
            }
        }
        .sunnahNavTitle("تحدي الأسئلة")
    }
}

/// حالة جولة الأسئلة المفتوحة — منفصلة عن الواجهة لتُختبر.
struct LearnOpenQuizState: Equatable {
    let count: Int
    private(set) var index = 0
    private(set) var revealed = false
    private(set) var known = 0

    init(count: Int) { self.count = count }

    var finished: Bool { index >= count }

    mutating func reveal() { if !finished { revealed = true } }

    /// يسجّل تقييم السائل لنفسه وينتقل للسؤال التالي.
    mutating func grade(knewIt: Bool) {
        guard revealed, !finished else { return }
        if knewIt { known += 1 }
        index += 1
        revealed = false
    }

    mutating func restart() { index = 0; revealed = false; known = 0 }
}

struct LearnOpenQuizRunner: View {
    let questions: [LearnOpenQuestion]
    @State private var state: LearnOpenQuizState

    init(questions: [LearnOpenQuestion]) {
        self.questions = questions
        _state = State(initialValue: LearnOpenQuizState(count: questions.count))
    }

    var body: some View {
        if questions.isEmpty { EmptyStateView(title: "لا أسئلة في هذا الباب") } else {
            ScrollView {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    if state.finished {
                        Text("عرفت \(state.known) من \(state.count)".arabicDigits).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        SunnahButton("إعادة الأسئلة") { state.restart() }
                    } else {
                        let q = questions[state.index]
                        Text("\(state.index + 1) / \(state.count)".arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        Text(q.question).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        if state.revealed {
                            SunnahCard {
                                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                    Text(q.answer).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                                    if let e = q.explanation { Text(e).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                                    if let r = q.reference { Text("المرجع: " + r).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary) }
                                }
                            }
                            SunnahActionRow {
                                SunnahButton("عرفتها") { state.grade(knewIt: true) }
                                SunnahButton("لم أعرفها", style: .secondary) { state.grade(knewIt: false) }
                            }
                        } else {
                            SunnahButton("إظهار الجواب") { state.reveal() }
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Sunnah.Spacing.pageX)
            }
            .background(Sunnah.Colors.bg)
        }
    }
}
