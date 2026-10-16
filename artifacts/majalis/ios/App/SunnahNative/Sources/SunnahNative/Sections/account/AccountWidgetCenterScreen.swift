import SwiftUI
import SunnahPrayer

/// آية اليوم كما في عقد البيانات (`Data/home/daily-ayah.json`) — مجموعة الموقع نفسها.
struct DailyAyahEntry: Decodable, Sendable, Equatable {
    let id: String
    let text: String
    let surah: String
    let ayahNumber: Int
    let reference: String
    let meaning: String

    /// نفس getDayIndex في الموقع: يوم Asia/Kuwait منذ epoch ثم % الطول.
    static func pick(from pool: [DailyAyahEntry], on date: Date) -> DailyAyahEntry? {
        guard !pool.isEmpty else { return nil }
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: "Asia/Kuwait") ?? .current
        let c = cal.dateComponents([.year, .month, .day], from: date)
        var utc = Calendar(identifier: .gregorian)
        utc.timeZone = TimeZone(identifier: "UTC") ?? .current
        guard let day = utc.date(from: DateComponents(year: c.year, month: c.month, day: c.day)) else { return nil }
        let index = Int(floor(day.timeIntervalSince1970 / 86_400))
        return pool[((index % pool.count) + pool.count) % pool.count]
    }
}

/// مركز الودجت: الصلاة القادمة وآية اليوم والوِرد داخل التطبيق بالبيانات الفعلية.
struct AccountWidgetCenterScreen: View {
    @StateObject private var store = PrayerPreferencesStore()
    @Environment(\.openRoute) private var openRoute
    @State private var phase: Phase = .loading
    @State private var category: WidgetCatalogCategory = .all

    private enum Phase { case loading, ready(DailyAyahEntry), unavailable }

    var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s4) {
                TimelineView(.periodic(from: .now, by: 1)) { ctx in prayerCard(now: ctx.date) }
                ayahCard
                Button { openRoute("/daily-wird") } label: {
                    SunnahCard {
                        HStack {
                            Text("الوِرد اليومي").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            Spacer()
                            Image(systemName: "chevron.forward").foregroundStyle(Sunnah.Colors.textSecondary)
                        }
                        .frame(minHeight: 44)
                    }
                }
                .buttonStyle(.plain)
                catalogSection
                howToAddCard
            }
            .padding(Sunnah.Spacing.s4)
        }
        .background(Sunnah.Colors.bg)
        .environment(\.layoutDirection, .rightToLeft)
        .navigationTitle("مركز الودجت")
        .task { await load() }
    }

    @ViewBuilder
    private func prayerCard(now: Date) -> some View {
        let prefs = store.preferences
        SunnahCard {
            if let next = PrayerCalculator.next(after: now, location: prefs.location, settings: prefs.settings) {
                VStack(spacing: Sunnah.Spacing.s1) {
                    Text("الصلاة القادمة").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(next.prayer.nameAr).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(PrayerTimeFormat.countdown(next.time.timeIntervalSince(now)))
                        .font(Sunnah.Typography.body).monospacedDigit().foregroundStyle(Sunnah.Colors.textPrimary)
                }
                .frame(maxWidth: .infinity)
            } else {
                Text("حدّد موقعك من مواقيت الصلاة لعرض الصلاة القادمة")
                    .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            }
        }
    }

    @ViewBuilder
    private var ayahCard: some View {
        switch phase {
        case .loading:
            LoadingStateView()
        case .unavailable:
            SunnahCard { SunnahMessageState(symbol: "exclamationmark.triangle", title: "تعذّر تحميل آية اليوم") }
        case let .ready(entry):
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Text("آية اليوم").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(entry.text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                    Text(entry.reference).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    Text(entry.meaning).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                }
            }
        }
    }

    private var catalogSection: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Text("ودجاتي").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Sunnah.Spacing.s2) {
                    ForEach(WidgetCatalogCategory.allCases) { c in
                        Button { category = c } label: { SunnahChip(c.title, selected: c == category) }
                            .buttonStyle(.plain)
                            .accessibilityAddTraits(c == category ? .isSelected : [])
                    }
                }
            }
            ForEach(WidgetCatalogItem.all.filter { category == .all || $0.category == category }) { item in
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                        Text(item.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        Text(item.detail).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
                        Text(item.sizes).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .accessibilityElement(children: .combine)
            }
        }
    }

    private var howToAddCard: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text("خصّص وأضف").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Text("اضغط مطولًا على الشاشة الرئيسية، ثم «+»، وابحث عن «سُنّة» واختر الودجت. لتغيير تصميم ودجت الصلاة اضغط عليه مطولًا ثم «تعديل الودجت».")
                    .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private func load() async {
        let source = ContentSource.bundled(name: "daily-ayah", subdirectory: "Data/home")
        do {
            let pool: [DailyAyahEntry] = try await ContentLoader().load(from: source)
            if let entry = DailyAyahEntry.pick(from: pool, on: Date()) { phase = .ready(entry) } else { phase = .unavailable }
        } catch { phase = .unavailable }
    }
}

enum WidgetCatalogCategory: String, CaseIterable, Identifiable {
    case all, prayer, mushaf, adhkar, calendar
    var id: String { rawValue }
    var title: String {
        switch self {
        case .all: "الكل"
        case .prayer: "الصلاة"
        case .mushaf: "المصحف"
        case .adhkar: "الذكر"
        case .calendar: "التاريخ"
        }
    }
}

/// الودجات الفعلية المسجَّلة في الامتداد (الأسماء والأوصاف كما في كتالوج PrayerWidget).
struct WidgetCatalogItem: Identifiable, Equatable {
    let id: String
    let name: String
    let detail: String
    let sizes: String
    let category: WidgetCatalogCategory

    static let all: [WidgetCatalogItem] = [
        .init(id: "prayer", name: "الصلاة القادمة", detail: "عدّ حيّ إلى الصلاة القادمة، ومنذ دخول الوقت.", sizes: "صغير · متوسط · كبير · شاشة القفل", category: .prayer),
        .init(id: "prayer-styled", name: "الصلاة — تصاميم", detail: "ستة تصاميم إضافة إلى الكلاسيكي: خطاطي، السابقة، رقم كبير، السابقة والقادمة، الخمس، مقسوم.", sizes: "صغير · متوسط", category: .prayer),
        .init(id: "prayer-all", name: "مواقيت اليوم", detail: "مواقيت الصلوات كلها في قائمة واحدة.", sizes: "كبير", category: .prayer),
        .init(id: "mushaf", name: "المصحف", detail: "تابع القراءة من آخر موضع وصلتَ إليه.", sizes: "صغير · متوسط", category: .mushaf),
        .init(id: "quran-ayah", name: "آية أو دعاء", detail: "آية أو دعاء قصير يتجدد كل ساعة.", sizes: "صغير · متوسط · كبير · شاشة القفل", category: .mushaf),
        .init(id: "adhkar-time", name: "أذكار الصباح والمساء", detail: "أذكار الصباح أو المساء حسب وقتك.", sizes: "صغير · متوسط · شاشة القفل", category: .adhkar),
        .init(id: "adhkar-hour", name: "ذكر الساعة", detail: "ذكر قصير يتجدد كل ساعة.", sizes: "صغير · متوسط · شاشة القفل", category: .adhkar),
        .init(id: "adhkar-streak", name: "إنجاز اليوم", detail: "سلسلة أذكارك وهدف قرآن اليوم.", sizes: "صغير · متوسط · شاشة القفل", category: .adhkar),
        .init(id: "calendar", name: "التاريخ", detail: "التاريخ الهجري والميلادي واسم اليوم.", sizes: "صغير · متوسط · شاشة القفل", category: .calendar),
        .init(id: "ramadan", name: "رمضان والمناسبات", detail: "الأيام المتبقية لرمضان وأقرب مناسبة.", sizes: "صغير · متوسط · شاشة القفل", category: .calendar),
    ]
}
