import SwiftUI

/// الورد اليومي: تتبّع صفحات يومية وسلسلة وختمة، محليًا فقط (كما صفحة الموقع DailyWirdView). لا نص شرعي ولا بيانات مصحف.
struct WirdState: Codable, Equatable {
    static let quranPages = 604
    var pagesPerDay = 5
    var completedToday = 0
    var lastDate = ""
    var monthlyTotal = 0
    var streak = 0
    var weeklyLogs: [String: Int] = [:]
    var totalPagesEver = 0

    /// نفس منطق الموقع: السلسلة تزيد حين يُكمَل الهدف أول مرة اليوم وأمس مكتمل.
    mutating func add(_ n: Int, today: String, yesterday: String) {
        let prev = lastDate == today ? completedToday : 0
        let next = prev + n
        if next >= pagesPerDay, prev < pagesPerDay {
            if lastDate == yesterday, (weeklyLogs[yesterday] ?? 0) >= pagesPerDay { streak += 1 }
            else if lastDate != today { streak = 1 }
        }
        completedToday = next; lastDate = today
        monthlyTotal += n; totalPagesEver += n
        weeklyLogs[today] = next
    }

    mutating func resetToday(today: String) {
        let diff = lastDate == today ? completedToday : 0
        completedToday = 0
        monthlyTotal = max(0, monthlyTotal - diff)
        totalPagesEver = max(0, totalPagesEver - diff)
        weeklyLogs[today] = 0
    }

    func todayCount(_ today: String) -> Int { lastDate == today ? completedToday : 0 }
    var khatmas: Int { totalPagesEver / Self.quranPages }
    var pagesInKhatma: Int { totalPagesEver % Self.quranPages }
    var daysToKhatma: Int? { pagesPerDay > 0 ? Int((Double(Self.quranPages - pagesInKhatma) / Double(pagesPerDay)).rounded(.up)) : nil }
    func weekly(today: String, last7: [String]) -> Int { last7.reduce(0) { $0 + ($1 == today ? todayCount(today) : (weeklyLogs[$1] ?? 0)) } }

    static func streakMessage(_ s: Int) -> String {
        switch s {
        case 30...: return "ثلاثون يومًا فأكثر من المداومة على القرآن"
        case 14...: return "أسبوعان متواصلان، بارك الله فيك"
        case 7...: return "أسبوع كامل من المداومة، أحسنت"
        case 3...: return "مداومة مباركة، استمر"
        case 1: return "بداية موفقة، داوم عليها"
        default: return ""
        }
    }
}

struct DailyWirdView: View {
    @AppStorage("sunnah.wird.state.v1") private var raw = ""
    @State private var state = WirdState()

    private static let fmt: DateFormatter = {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; f.calendar = Calendar(identifier: .gregorian); f.locale = Locale(identifier: "en_US_POSIX"); return f
    }()
    private func key(_ offset: Int) -> String { Self.fmt.string(from: Calendar.current.date(byAdding: .day, value: -offset, to: Date()) ?? Date()) }
    private var today: String { key(0) }
    private func ar(_ n: Int) -> String { n.formatted(.number.grouping(.never).locale(Locale(identifier: "ar@numbers=arab"))) }

    var body: some View {
        let done = state.todayCount(today)
        let goal = max(state.pagesPerDay, 1)
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s6) {
                card {
                    ring(value: Double(done) / Double(goal), title: ar(done), subtitle: "من \(ar(state.pagesPerDay)) صفحة")
                    HStack(spacing: Sunnah.Spacing.s3) {
                        ForEach([1, 2, 5], id: \.self) { n in
                            Button("+\(ar(n))") { mutate { $0.add(n, today: today, yesterday: key(1)) } }
                                .buttonStyle(.borderedProminent).tint(Sunnah.Colors.primary).frame(minHeight: 44)
                                .disabled(done >= goal).accessibilityLabel("أضف \(ar(n)) صفحة")
                        }
                    }
                    Text(done >= goal ? "أكملت وردك لهذا اليوم" : "\(ar(max(0, goal - done))) صفحة متبقية")
                        .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    if done > 0 { Button("إعادة ضبط اليوم", role: .destructive) { mutate { $0.resetToday(today: today) } }.frame(minHeight: 44) }
                    HStack {
                        stat("هذا الأسبوع", "\(ar(state.weekly(today: today, last7: (0..<7).map(key)))) صفحة")
                        stat("هذا الشهر", "\(ar(state.monthlyTotal)) صفحة")
                        stat("المجموع", "\(ar(state.totalPagesEver)) صفحة")
                    }
                }
                card {
                    Label("\(ar(state.streak)) يوم متواصل", systemImage: "flame").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    if state.streak > 0 { Text(WirdState.streakMessage(state.streak)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                    if let d = state.daysToKhatma { Text("الختمة بعد نحو \(ar(d)) يوم").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                }
                card {
                    Text("تقدم الختمة").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    ring(value: Double(state.pagesInKhatma) / Double(WirdState.quranPages), title: state.khatmas > 0 ? "\(ar(state.khatmas)) ختمة" : "ص \(ar(state.pagesInKhatma))",
                         subtitle: "من \(ar(WirdState.quranPages)) صفحة")
                    stat("ختمات مكتملة", state.khatmas > 0 ? ar(state.khatmas) : "لم تكتمل بعد")
                }
                card {
                    Stepper(value: Binding(get: { state.pagesPerDay }, set: { v in mutate { $0.pagesPerDay = v } }), in: 1...30) {
                        Text("الهدف اليومي: \(ar(state.pagesPerDay)) صفحة").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    }.frame(minHeight: 44)
                }
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("الورد اليومي")
        .onAppear { if let d = raw.data(using: .utf8), let s = try? JSONDecoder().decode(WirdState.self, from: d) { state = s } }
    }

    private func mutate(_ f: (inout WirdState) -> Void) {
        f(&state)
        if let d = try? JSONEncoder().encode(state), let s = String(data: d, encoding: .utf8) { raw = s }
    }

    private func card<C: View>(@ViewBuilder _ c: () -> C) -> some View {
        VStack(spacing: Sunnah.Spacing.s3, content: c).frame(maxWidth: .infinity).padding(Sunnah.Spacing.s4)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 16))
    }

    private func stat(_ t: String, _ v: String) -> some View {
        VStack(spacing: 2) {
            Text(t).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            Text(v).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
        }.frame(maxWidth: .infinity)
    }

    private func ring(value: Double, title: String, subtitle: String) -> some View {
        ZStack {
            Circle().stroke(Sunnah.Colors.primary.opacity(0.15), lineWidth: 9)
            Circle().trim(from: 0, to: min(max(value, 0), 1)).stroke(Sunnah.Colors.primary, style: StrokeStyle(lineWidth: 9, lineCap: .round)).rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text(title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Text(subtitle).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }.frame(width: 148, height: 148)
    }
}
