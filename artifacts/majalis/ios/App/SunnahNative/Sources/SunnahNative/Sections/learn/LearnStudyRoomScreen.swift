import SwiftUI

/// منطق مؤقّت غرفة المذاكرة (عمل ثم راحة) — مطابق لـPRESETS في src/views/StudyRoomPage.tsx، ومستقل عن الواجهة ليُختبر.
/// يُحسب المتبقي من وقت النهاية لا من عدّ النبضات، فلا ينحرف إن عُلّق التطبيق في الخلفية.
struct LearnStudyTimer: Equatable {
    struct Preset: Equatable, Identifiable {
        let work: Int; let rest: Int
        var id: Int { work }
        var label: String { "\(work) / \(rest)" }
    }
    enum Phase: Equatable { case idle, work, rest }

    static let presets = [Preset(work: 25, rest: 5), Preset(work: 45, rest: 10), Preset(work: 60, rest: 15)]

    var preset: Preset = LearnStudyTimer.presets[0]
    private(set) var phase: Phase = .idle
    private(set) var endsAt: Date?
    private(set) var pausedRemaining: TimeInterval?
    /// دورات العمل المكتملة في هذه الجلسة.
    private(set) var completedWork = 0

    init() {}

    var phaseDuration: TimeInterval { TimeInterval((phase == .rest ? preset.rest : preset.work) * 60) }
    var isRunning: Bool { endsAt != nil }

    func remaining(at now: Date) -> TimeInterval {
        if let endsAt { return max(0, endsAt.timeIntervalSince(now)) }
        return pausedRemaining ?? phaseDuration
    }

    mutating func start(at now: Date) {
        if phase == .idle { phase = .work }
        endsAt = now.addingTimeInterval(pausedRemaining ?? phaseDuration)
        pausedRemaining = nil
    }

    mutating func pause(at now: Date) {
        guard isRunning else { return }
        pausedRemaining = remaining(at: now)
        endsAt = nil
    }

    mutating func reset() { phase = .idle; endsAt = nil; pausedRemaining = nil }

    /// عند انتهاء المرحلة: العمل ينتقل للراحة (ويُحتسب)، والراحة تعود للعمل؛ تبدأ التالية فورًا.
    mutating func advanceIfDue(at now: Date) {
        guard let endsAt, now >= endsAt else { return }
        if phase == .work { completedWork += 1; phase = .rest } else { phase = .work }
        self.endsAt = endsAt.addingTimeInterval(phaseDuration)
    }
}

/// /study-room — مؤقّت مذاكرة محلي. سجلّ الجلسات في الويب يُحفظ في Supabase للمسجَّل؛ هنا يُعدّ محليًا لمركز التقدّم.
struct LearnStudyRoomScreen: View {
    var store = LearnLocalStore()
    @State private var timer = LearnStudyTimer()

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            let left = Int(timer.remaining(at: context.date).rounded(.up))
            ScrollView {
                VStack(spacing: Sunnah.Spacing.s5) {
                    HStack(spacing: Sunnah.Spacing.s2) {
                        ForEach(LearnStudyTimer.presets) { p in
                            Button { timer.preset = p; timer.reset() } label: { SunnahChip(p.label, selected: timer.preset == p) }
                                .buttonStyle(.plain)
                                .disabled(timer.phase != .idle)
                                .accessibilityLabel("\(p.work) دقيقة عمل و\(p.rest) راحة")
                        }
                    }
                    Text(phaseTitle).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(String(format: "%02d:%02d", left / 60, left % 60))
                        .font(Sunnah.Typography.pageTitle).monospacedDigit()
                        .foregroundStyle(Sunnah.Colors.textPrimary)
                        .accessibilityLabel("المتبقي \(left / 60) دقيقة و\(left % 60) ثانية")
                    Text("دورات مكتملة: \(timer.completedWork)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    if timer.isRunning {
                        SunnahButton("إيقاف مؤقت") { timer.pause(at: Date()) }
                    } else {
                        SunnahButton(timer.phase == .idle ? "ابدأ" : "استئناف") { timer.start(at: Date()) }
                    }
                    if timer.phase != .idle { SunnahButton("إنهاء", style: .secondary) { timer.reset() } }
                }
                .frame(maxWidth: .infinity)
                .padding(Sunnah.Spacing.pageX)
            }
            .onChange(of: context.date) { now in timer.advanceIfDue(at: now) }
        }
        .onChange(of: timer.completedWork) { n in
            if n > 0 { store.save((store.load(Int.self, .studyCycles) ?? 0) + 1, .studyCycles) }
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("غرفة المذاكرة")
    }

    private var phaseTitle: String {
        switch timer.phase {
        case .idle: return "اختر المدة ثم ابدأ"
        case .work: return "وقت المذاكرة"
        case .rest: return "استراحة"
        }
    }
}
