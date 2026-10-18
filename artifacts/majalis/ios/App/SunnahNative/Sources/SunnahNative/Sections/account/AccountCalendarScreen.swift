import SwiftUI

/// /calendar — تقويم الدروس: عرض شهري وأسبوعي ويومي، والتاريخ الهجري، وتصدير ICS لدروس الشهر.
struct AccountCalendarScreen: View {
    private enum Mode: String, CaseIterable { case month = "شهري", week = "أسبوعي", day = "يومي" }

    @Environment(\.contentLoader) private var loader
    @Environment(\.openRoute) private var openRoute
    @State private var phase: AccountLoadPhase<[AccountCalendarEvent]> = .loading
    @State private var mode: Mode = .month
    @State private var cursor = Date()
    @State private var selected = Date()
    @State private var openEvent: AccountCalendarEvent?

    private let calendar = AccountCalendarMath.gregorian

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: "المناسبات والدروس", title: "تقويم الدروس", subtitle: "عرض شهري وأسبوعي ويومي للدروس والدورات.")
                toolbar
                switch phase {
                case .loading: LoadingStateView()
                case .failed: ErrorStateView { Task { await load() } }
                case .ready(let events):
                    switch mode {
                    case .month: monthView(events)
                    case .week: weekView(events)
                    case .day: dayList(AccountCalendarMath.events(on: selected, in: events, calendar: calendar), date: selected)
                    }
                }
                AccountShareRow(title: "تقويم الدروس — سُنّة", path: "/calendar")
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .sunnahNavTitle("تقويم الدروس")
        .task { await load() }
        .sheet(item: $openEvent) { event in eventSheet(event) }
    }

    // MARK: شريط الأدوات

    private var toolbar: some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            HStack(spacing: Sunnah.Spacing.s2) {
                navButton("chevron.backward", label: "الشهر السابق") { shiftMonth(-1) }
                VStack(spacing: Sunnah.Spacing.s1) {
                    Text(AccountCalendarMath.monthTitle(cursor)).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(AccountCalendarMath.hijriMonthYear(cursor)).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                .frame(maxWidth: .infinity)
                navButton("chevron.forward", label: "الشهر التالي") { shiftMonth(1) }
            }
            HStack(spacing: Sunnah.Spacing.s2) {
                Picker("طريقة العرض", selection: $mode) {
                    ForEach(Mode.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                if !calendar.isDate(cursor, equalTo: Date(), toGranularity: .month) {
                    Button("اليوم") { cursor = Date(); selected = Date() }
                        .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary)
                        .frame(minHeight: Sunnah.Spacing.touch)
                        .accessibilityLabel("انتقل لليوم")
                }
                if case .ready(let events) = phase, let file = icsFile(events) {
                    ShareLink(item: file) {
                        Label("ICS", systemImage: "square.and.arrow.down").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary)
                            .frame(minHeight: Sunnah.Spacing.touch)
                    }
                    .accessibilityLabel("تحميل دروس الشهر كملف تقويم")
                }
            }
        }
    }

    private func navButton(_ icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                .frame(width: Sunnah.Spacing.touch, height: Sunnah.Spacing.touch)
                .background(Sunnah.Colors.primarySoft, in: Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
    }

    private func shiftMonth(_ delta: Int) {
        if let d = calendar.date(byAdding: .month, value: delta, to: cursor) { cursor = d }
    }

    // MARK: العروض

    private func monthView(_ events: [AccountCalendarEvent]) -> some View {
        let days = AccountCalendarMath.monthGrid(for: cursor, calendar: calendar)
        let monthHasEvents = days.contains { calendar.isDate($0, equalTo: cursor, toGranularity: .month) && !AccountCalendarMath.events(on: $0, in: events, calendar: calendar).isEmpty }
        return VStack(spacing: Sunnah.Spacing.s2) {
            if !monthHasEvents {
                SunnahMessageState(symbol: "calendar", title: "لا دروس في هذا الشهر")
            }
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s1), count: 7), spacing: Sunnah.Spacing.s1) {
                ForEach(AccountCalendarMath.weekdayLabels, id: \.self) { label in
                    Text(String(label.dropFirst(2).prefix(2))).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                        .accessibilityLabel(label)
                }
                ForEach(days, id: \.self) { day in
                    let count = AccountCalendarMath.events(on: day, in: events, calendar: calendar).count
                    let inMonth = calendar.isDate(day, equalTo: cursor, toGranularity: .month)
                    Button { selected = day; mode = .day } label: {
                        VStack(spacing: Sunnah.Spacing.s1) {
                            Text("\(calendar.component(.day, from: day))").font(Sunnah.Typography.secondary)
                                .foregroundStyle(inMonth ? Sunnah.Colors.textPrimary : Sunnah.Colors.textSecondary)
                            Circle().fill(count > 0 ? Sunnah.Colors.primary : Color.clear)
                                .frame(width: Sunnah.Spacing.s2, height: Sunnah.Spacing.s2)
                        }
                        .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch)
                        .background(calendar.isDateInToday(day) ? Sunnah.Colors.primarySoft : Sunnah.Colors.surface,
                                    in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                        .opacity(inMonth ? 1 : 0.5)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("\(calendar.component(.day, from: day))، \(count) درس")
                }
            }
        }
    }

    private func weekView(_ events: [AccountCalendarEvent]) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            ForEach(AccountCalendarMath.weekDays(around: selected, calendar: calendar), id: \.self) { day in
                dayList(AccountCalendarMath.events(on: day, in: events, calendar: calendar), date: day)
            }
        }
    }

    private func dayList(_ events: [AccountCalendarEvent], date: Date) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            Text(date.formatted(.dateTime.weekday(.wide).day().month(.wide).locale(Locale(identifier: "ar-u-nu-arab"))))
                .font(Sunnah.Typography.cardTitle)
                .foregroundStyle(calendar.isDateInToday(date) ? Sunnah.Colors.primary : Sunnah.Colors.textPrimary)
            if events.isEmpty {
                SunnahMessageState(symbol: "calendar", title: "لا دروس في هذا اليوم")
            }
            ForEach(events) { event in
                Button { openEvent = event } label: {
                    SunnahCard { SunnahListRow(title: event.title, subtitle: [event.sheikh, event.mosque, event.displayTime].filter { !$0.isEmpty }.joined(separator: " · ")) }
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func eventSheet(_ event: AccountCalendarEvent) -> some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Text(event.title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            ForEach([("الشيخ", event.sheikh), ("المكان", event.mosque), ("اليوم", event.day), ("الوقت", event.displayTime)], id: \.0) { key, value in
                HStack(alignment: .firstTextBaseline) {
                    Text(key).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(value).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary).lineLimit(key == "الوقت" ? 1 : nil).minimumScaleFactor(0.8)
                }
            }
            if let d = event.description, !d.isEmpty {
                Text(d).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            SunnahButton("التفاصيل") { openEvent = nil; openRoute(event.path) }
            SunnahButton("إغلاق", style: .secondary) { openEvent = nil }
        }
        .padding(Sunnah.Spacing.s6)
        .presentationDetents([.medium, .large])
    }

    // MARK: البيانات

    private func icsFile(_ events: [AccountCalendarEvent]) -> URL? {
        guard let month = calendar.dateInterval(of: .month, for: cursor) else { return nil }
        var items: [(date: Date, event: AccountCalendarEvent)] = []
        var d = month.start
        while d < month.end {
            items += AccountCalendarMath.events(on: d, in: events, calendar: calendar).map { (date: d, event: $0) }
            guard let next = calendar.date(byAdding: .day, value: 1, to: d) else { break }
            d = next
        }
        let text = AccountCalendarMath.ics(items, monthLabel: AccountCalendarMath.monthTitle(cursor), calendar: calendar)
        let p = calendar.dateComponents([.year, .month], from: cursor)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(String(format: "majalis-%04d-%02d.ics", p.year ?? 0, p.month ?? 0))
        return (try? Data(text.utf8).write(to: url, options: .atomic)) != nil ? url : nil
    }

    @MainActor private func load() async {
        phase = .loading
        do {
            let lessons = try await loader.load([AccountLesson].self, from: AccountEndpoints.lessons)
            phase = .ready(AccountLessonFilter.active(lessons).map(AccountCalendarEvent.init(lesson:)))
        } catch {
            phase = .failed
        }
    }
}
