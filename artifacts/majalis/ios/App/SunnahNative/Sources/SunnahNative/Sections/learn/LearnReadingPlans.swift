import SwiftUI

// MARK: - النموذج

/// خطة قراءة كتاب (مقابل book_reading_plans في الويب) محفوظة محليًا.
struct LearnReadingPlan: Codable, Identifiable, Equatable, Sendable {
    enum Status: String, Codable, Sendable { case active, paused, completed, cancelled }
    struct Entry: Codable, Equatable, Sendable { var date: Date; var page: Int }

    var id = UUID()
    var bookTitle: String
    var totalPages: Int
    var startDate: Date
    var endDate: Date
    /// أيام القراءة بترقيم Calendar.weekday (1 الأحد ... 7 السبت).
    var readingDays: Set<Int>
    var dailyMinutes: Int
    var status: Status = .active
    var currentPage = 0
    var log: [Entry] = []

    struct Weekday: Identifiable, Sendable { let id: Int; let label: String }
    static let weekdays = [Weekday(id: 7, label: "السبت"), Weekday(id: 1, label: "الأحد"), Weekday(id: 2, label: "الاثنين"), Weekday(id: 3, label: "الثلاثاء"),
                           Weekday(id: 4, label: "الأربعاء"), Weekday(id: 5, label: "الخميس"), Weekday(id: 6, label: "الجمعة")]

    var progress: Double { totalPages > 0 ? min(1, Double(currentPage) / Double(totalPages)) : 0 }
    var remainingPages: Int { max(0, totalPages - currentPage) }

    /// عدد أيام القراءة بين يومين (شاملًا).
    func readingDayCount(from a: Date, to b: Date, calendar: Calendar = .current) -> Int {
        var day = calendar.startOfDay(for: a); let end = calendar.startOfDay(for: b)
        var n = 0
        while day <= end {
            if readingDays.contains(calendar.component(.weekday, from: day)) { n += 1 }
            guard let next = calendar.date(byAdding: .day, value: 1, to: day) else { break }
            day = next
        }
        return n
    }

    /// الصفحة المتوقعة اليوم إن وُزّعت الصفحات بالتساوي على أيام القراءة.
    func expectedPage(at now: Date, calendar: Calendar = .current) -> Int {
        let total = readingDayCount(from: startDate, to: endDate, calendar: calendar)
        guard total > 0 else { return totalPages }
        let done = now < startDate ? 0 : readingDayCount(from: startDate, to: min(now, endDate), calendar: calendar)
        return Int((Double(totalPages) * Double(done) / Double(total)).rounded())
    }

    /// صفحات مطلوبة في كل يوم قراءة متبقٍ للّحاق بالموعد.
    func pagesPerRemainingDay(at now: Date, calendar: Calendar = .current) -> Int? {
        guard remainingPages > 0 else { return nil }
        let left = readingDayCount(from: max(now, startDate), to: endDate, calendar: calendar)
        return left > 0 ? Int((Double(remainingPages) / Double(left)).rounded(.up)) : nil
    }

    enum Pace: Equatable { case ahead, onTrack, behind }
    func pace(at now: Date, calendar: Calendar = .current) -> Pace {
        let expected = expectedPage(at: now, calendar: calendar)
        if currentPage > expected { return .ahead }
        return currentPage < expected ? .behind : .onTrack
    }

    var statusLabel: String {
        switch status {
        case .active: return "جارية"
        case .paused: return "متوقفة"
        case .completed: return "مكتملة"
        case .cancelled: return "ملغاة"
        }
    }

    mutating func logPage(_ page: Int, at now: Date) {
        currentPage = min(max(0, page), totalPages)
        log.append(Entry(date: now, page: currentPage))
        if currentPage >= totalPages { status = .completed }
    }
}

// MARK: - الشاشات

/// /reading-plans — خطط قراءة الكتب: إنشاء، تسجيل الصفحة، إيقاف/استئناف/إلغاء. محلية على الجهاز.
struct LearnReadingPlansScreen: View {
    var store = LearnLocalStore()
    @State private var plans: [LearnReadingPlan] = []
    @State private var creating = false

    var body: some View {
        Group {
            if plans.isEmpty {
                VStack(spacing: Sunnah.Spacing.s4) {
                    EmptyStateView(title: "لا خطط قراءة بعد")
                    SunnahButton("خطة جديدة") { creating = true }.padding(.horizontal, Sunnah.Spacing.pageX)
                }
                .frame(maxHeight: .infinity, alignment: .top)
            } else {
                List {
                    ForEach($plans) { $plan in
                        LearnReadingPlanCard(plan: $plan) { save() }
                            .sunnahRowChrome()
                    }
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .background(Sunnah.Colors.bg)
        .toolbar { ToolbarItem(placement: .primaryAction) { Button("خطة جديدة") { creating = true } } }
        .sheet(isPresented: $creating) {
            NavigationStack {
                LearnNewPlanForm { plan in plans.insert(plan, at: 0); save(); creating = false }
                    .toolbar { ToolbarItem(placement: .cancellationAction) { Button("إلغاء") { creating = false } } }
            }
        }
        .onAppear { plans = store.load([LearnReadingPlan].self, .readingPlans) ?? [] }
        .navigationTitle("خطط القراءة")
    }

    private func save() { store.save(plans, .readingPlans) }
}

struct LearnReadingPlanCard: View {
    @Binding var plan: LearnReadingPlan
    let onChange: () -> Void
    @State private var pageText = ""

    var body: some View {
        let now = Date()
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            HStack {
                Text(plan.bookTitle).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer()
                SunnahChip(plan.statusLabel)
            }
            ProgressView(value: plan.progress).tint(Sunnah.Colors.primary)
            Text("\(plan.currentPage) من \(plan.totalPages) صفحة · \(Int(plan.progress * 100))٪")
                .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            if plan.status == .active {
                switch plan.pace(at: now) {
                case .behind:
                    if let p = plan.pagesPerRemainingDay(at: now) {
                        Text("متأخر عن الخطة: اقرأ \(p) صفحة في كل يوم قراءة متبقٍ").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.danger)
                    }
                case .ahead:
                    Text("متقدّم على الخطة").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primary)
                case .onTrack:
                    EmptyView()
                }
                HStack(spacing: Sunnah.Spacing.s2) {
                    TextField("الصفحة التي بلغتها", text: $pageText).textFieldStyle(.roundedBorder)
                        #if os(iOS)
                        .keyboardType(.numberPad)
                        #endif
                    Button("تسجيل") {
                        guard let p = Int(pageText) else { return }
                        plan.logPage(p, at: Date()); pageText = ""; onChange()
                    }
                    .disabled(Int(pageText) == nil)
                }
            }
            HStack(spacing: Sunnah.Spacing.s4) {
                if plan.status == .active { Button("إيقاف مؤقت") { plan.status = .paused; onChange() } }
                if plan.status == .paused { Button("استئناف") { plan.status = .active; onChange() } }
                if plan.status == .active || plan.status == .paused {
                    Button("إلغاء الخطة", role: .destructive) { plan.status = .cancelled; onChange() }
                }
            }
            .font(Sunnah.Typography.secondary)
            .buttonStyle(.borderless)
        }
        .padding(.vertical, Sunnah.Spacing.s2)
    }
}

struct LearnNewPlanForm: View {
    let onCreate: (LearnReadingPlan) -> Void
    @State private var title = ""
    @State private var pages = 300
    @State private var minutes = 30
    @State private var start = Date()
    @State private var end = Calendar.current.date(byAdding: .day, value: 30, to: Date()) ?? Date()
    @State private var days: Set<Int> = Set(LearnReadingPlan.weekdays.map(\.id))

    var body: some View {
        Form {
            Section("الكتاب") {
                TextField("عنوان الكتاب", text: $title)
                Stepper("عدد الصفحات: \(pages)", value: $pages, in: 1...5000, step: 10)
                Stepper("دقائق يوميًا: \(minutes)", value: $minutes, in: 5...240, step: 5)
            }
            Section("المدة") {
                DatePicker("البداية", selection: $start, displayedComponents: .date)
                DatePicker("النهاية", selection: $end, in: start..., displayedComponents: .date)
            }
            Section("أيام القراءة") {
                ForEach(LearnReadingPlan.weekdays) { d in
                    Toggle(d.label, isOn: Binding(get: { days.contains(d.id) }, set: { on in if on { days.insert(d.id) } else { days.remove(d.id) } }))
                }
            }
            Section {
                let plan = draft
                if let p = plan.pagesPerRemainingDay(at: start) {
                    Text("نحو \(p) صفحة في كل يوم قراءة").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                Button("إنشاء الخطة") { onCreate(plan) }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty || days.isEmpty)
            }
        }
        .navigationTitle("خطة جديدة")
    }

    private var draft: LearnReadingPlan {
        LearnReadingPlan(bookTitle: title.trimmingCharacters(in: .whitespaces), totalPages: pages, startDate: start, endDate: end, readingDays: days, dailyMinutes: minutes)
    }
}
