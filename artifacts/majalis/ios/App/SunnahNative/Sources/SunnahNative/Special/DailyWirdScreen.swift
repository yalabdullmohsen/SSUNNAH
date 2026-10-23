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
    /// آخر يوم احتُسب في السلسلة. اختياري لتبقى البيانات المحفوظة قبله قابلة للقراءة.
    var streakDay: String?

    /// السلسلة تتغير مرة واحدة في اليوم عند أول إكمال للهدف: تزيد إن اكتمل هدف الأمس، وإلا تبدأ من 1.
    /// الحكم من سجل الأمس لا من `lastDate`، فإكمال الهدف على دفعات في اليوم نفسه يُحتسب كذلك.
    mutating func add(_ n: Int, today: String, yesterday: String) {
        let prev = lastDate == today ? completedToday : 0
        let next = prev + n
        if next >= pagesPerDay, prev < pagesPerDay, streakDay != today {
            streak = (weeklyLogs[yesterday] ?? 0) >= pagesPerDay ? streak + 1 : 1
            streakDay = today
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
    // الصفر العربي «٠» يُرسم نقطة تشبه رمز القائمة في الخط فيُعرض «0» اللاتيني ليُقرأ رقمًا
    private func ar(_ n: Int) -> String { n == 0 ? "0" : n.formatted(.number.grouping(.never).locale(Locale(identifier: "ar@numbers=arab"))) }

    var body: some View {
        let done = state.todayCount(today)
        let goal = max(state.pagesPerDay, 1)
        ScrollView {
            VStack(spacing: 14) {
                SunnahProgressCard("وردك اليوم", symbol: "book.pages") {
                    HStack(spacing: 20) {
                        SunnahProgressRing(value: Double(done) / Double(goal), lineWidth: 11, size: 128) {
                            VStack(spacing: 2) {
                                Text(done == 0 ? "لم تبدأ" : ar(done)).font(done == 0 ? AppearancePrefs.ui(.extraBold, 22, .title3) : .system(size: 38, weight: .heavy, design: .rounded))
                                    .foregroundStyle(Sunnah.Colors.textPrimary).minimumScaleFactor(0.6).lineLimit(1)
                                Text("من \(ar(state.pagesPerDay)) صفحة").font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary)
                            }
                        }
                        VStack(alignment: .leading, spacing: 10) {
                            Text(done >= goal ? "أكملت وردك لهذا اليوم" : "\(ar(max(0, goal - done))) صفحة متبقية")
                                .font(AppearancePrefs.ui(.extraBold, 15, .body)).foregroundStyle(Sunnah.Colors.primary)
                            HStack(spacing: Sunnah.Spacing.s2) {
                                ForEach([1, 2, 5], id: \.self) { n in
                                    Button("+\(ar(n))") { mutate { $0.add(n, today: today, yesterday: key(1)) } }
                                        .buttonStyle(.borderedProminent).tint(Sunnah.Colors.primary).frame(minHeight: 44)
                                        .disabled(done >= goal).accessibilityLabel("أضف \(ar(n)) صفحة")
                                }
                            }
                            if done > 0 { Button("إعادة ضبط اليوم", role: .destructive) { mutate { $0.resetToday(today: today) } }.frame(minHeight: 44) }
                        }
                    }
                    Divider().overlay(Sunnah.Colors.border)
                    HStack {
                        SunnahStatCell("\(ar(state.weekly(today: today, last7: (0..<7).map(key)))) صفحة", "هذا الأسبوع")
                        SunnahStatCell("\(ar(state.monthlyTotal)) صفحة", "هذا الشهر")
                        SunnahStatCell("\(ar(state.totalPagesEver)) صفحة", "المجموع")
                    }
                }
                SunnahProgressCard("المداومة", symbol: "flame", tone: .gold) {
                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("\(ar(state.streak)) يوم متواصل").font(AppearancePrefs.ui(.extraBold, 20, .title3)).foregroundStyle(Sunnah.Colors.textPrimary)
                            if !WirdState.streakMessage(state.streak).isEmpty { Text(WirdState.streakMessage(state.streak)).font(AppearancePrefs.ui(.bold, 13, .footnote)).foregroundStyle(Sunnah.Colors.textSecondary) }
                        }
                        Spacer(minLength: 0)
                    }
                }
                SunnahProgressCard("تقدم الختمة", symbol: "checkmark.seal") {
                    HStack(spacing: 20) {
                        SunnahProgressRing(value: Double(state.pagesInKhatma) / Double(WirdState.quranPages), lineWidth: 11, size: 112) {
                            Text(ar(state.pagesInKhatma)).font(.system(size: 30, weight: .heavy, design: .rounded)).foregroundStyle(Sunnah.Colors.textPrimary)
                                .minimumScaleFactor(0.6).lineLimit(1)
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            Text("صفحة من \(ar(WirdState.quranPages))").font(AppearancePrefs.ui(.bold, 14, .subheadline)).foregroundStyle(Sunnah.Colors.textSecondary)
                            Text(state.khatmas > 0 ? "\(ar(state.khatmas)) ختمة مكتملة" : "لم تكتمل ختمة بعد").font(AppearancePrefs.ui(.extraBold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                            if let d = state.daysToKhatma { Text("الختمة بعد نحو \(ar(d)) يوم").font(AppearancePrefs.ui(.bold, 13, .footnote)).foregroundStyle(Sunnah.Colors.primary) }
                        }
                    }
                }
                SunnahProgressCard("الهدف اليومي", symbol: "target", tone: .gold) {
                    Stepper(value: Binding(get: { state.pagesPerDay }, set: { v in mutate { $0.pagesPerDay = v } }), in: 1...30) {
                        Text("\(ar(state.pagesPerDay)) صفحة في اليوم").font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                    }.frame(minHeight: 44)
                }
            }
            .padding(.vertical, Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("الورد اليومي")
        .onAppear { if let d = raw.data(using: .utf8), let s = try? JSONDecoder().decode(WirdState.self, from: d) { state = s } }
    }

    private func mutate(_ f: (inout WirdState) -> Void) {
        f(&state)
        if let d = try? JSONEncoder().encode(state), let s = String(data: d, encoding: .utf8) { raw = s }
    }
}
