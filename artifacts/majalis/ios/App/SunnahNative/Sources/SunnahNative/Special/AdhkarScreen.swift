import SwiftUI
import SunnahPrayer

/// صف ذكر موثَّق كما في عقد البيانات (`Data/adhkar/verified-adhkar.json`، حقول snake_case) — يُقرأ كما هو.
public struct AdhkarItem: Decodable, Identifiable, Hashable, Sendable {
    public let id: String
    public let categoryId: String
    public let text: String
    public let repeatCount: Int
    public var narrator: String?
    public var sourceName: String?
    public var grade: String?
    public var reference: String?

    enum CodingKeys: String, CodingKey {
        case id, text, narrator, grade, reference
        case categoryId = "category_id"
        case repeatCount = "repeat_count"
        case sourceName = "source_name"
    }
}

/// عنوان تصنيف كما في ADHKAR_CATEGORIES بالموقع (حرفيًا، من `Data/adhkar/categories.json`).
struct AdhkarCategoryTitle: Decodable, Sendable { let id: String; let name: String }

public struct AdhkarCategory: Identifiable, Hashable, Sendable {
    public let id: String
    public let items: [AdhkarItem]
}

/// الأذكار: المجموعات ثم أذكار المجموعة بعدّاد لمس لكل ذكر. الفارغ (لا موثَّق بعد) حالة صريحة.
public struct AdhkarScreen: ScreenTemplate {
    public static let id = "adhkar"
    public static let title = "الأذكار"
    public static let source = ContentSource.bundled(name: "verified-adhkar", subdirectory: "Data/adhkar")

    let categories: [AdhkarCategory]
    @Environment(\.contentLoader) private var loader
    @State private var titles: [String: String] = [:]
    public init(content: [AdhkarItem]) {
        var order: [String] = []
        var grouped: [String: [AdhkarItem]] = [:]
        for item in content {
            if grouped[item.categoryId] == nil { order.append(item.categoryId) }
            grouped[item.categoryId, default: []].append(item)
        }
        categories = order.map { AdhkarCategory(id: $0, items: grouped[$0] ?? []) }
    }

    @State private var selected = ""
    /// موضع كل تصنيف وعدّاته (مرفوعة هنا لأن زر العدّ عائم خارج التمرير).
    @State private var indexBy: [String: Int] = [:]
    @State private var done: [String: Int] = [:]

    public var body: some View {
        if categories.isEmpty {
            EmptyStateView(title: "الأذكار قيد التوثيق")
                .frame(maxWidth: .infinity, maxHeight: .infinity).background(Sunnah.Colors.bg)
        } else {
            Group {
                if let current = categories.first(where: { $0.id == selected }) { detail(current) } else { catalog }
            }
            .environment(\.layoutDirection, .leftToRight)   // محاذاة الزر فعليًا لليمين (يُعاد RTL للمحتوى أدناه)
            .sunnahRootChrome()
            .environment(\.layoutDirection, .rightToLeft)
            .sunnahReadableWidth()
            .task {
                let rows: [AdhkarCategoryTitle]? = try? await loader.load(from: .bundled(name: "categories", subdirectory: "Data/adhkar"))
                titles = Dictionary((rows ?? []).map { ($0.id, $0.name) }, uniquingKeysWith: { a, _ in a })
            }
        }
    }

    /// فهرس الأذكار: بلاطة بأيقونة لكل تصنيف وعدد أذكاره.
    private var catalog: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                SunnahPageTitle("الأذكار")
                SunnahTileGrid(categories.map { c in
                    SunnahTileItem(id: c.id, title: titles[c.id] ?? Self.fallbackTitle,
                                   subtitle: Sunnah.digits("\(c.items.count) ذكرًا"), symbol: Self.symbol(c.id), gold: c.id == "adh-evening" || c.id == "adh-sleep")
                }, idPrefix: "adhkar.cat") { selected = $0.id }
                SunnahContentFooter(title: "أذكار", id: "adhkar", section: "الأذكار", inset: false)
            }
            .padding(.bottom, 96)
            .environment(\.layoutDirection, .rightToLeft)
        }
        .background(Sunnah.Colors.bg)
    }

    private func detail(_ current: AdhkarCategory) -> some View {
        let index = Binding(get: { min(indexBy[current.id, default: 0], current.items.count - 1) }, set: { indexBy[current.id] = $0 })
        return ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Button { selected = "" } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "square.grid.2x2").font(.system(size: 15, weight: .semibold))
                        Text("كل الأذكار").font(AppearancePrefs.ui(.bold, 14, .subheadline))
                    }
                    .foregroundStyle(Sunnah.Colors.primary).frame(minHeight: 44).padding(.horizontal, Sunnah.Spacing.pageX)
                }
                .buttonStyle(.plain).accessibilityIdentifier("adhkar.back")
                SunnahPageTitle(titles[current.id] ?? Self.fallbackTitle)
                AdhkarListView(items: current.items, index: index, done: $done)
                SunnahContentFooter(title: "أذكار", id: "adhkar", section: "الأذكار", inset: false)
            }
            .padding(.bottom, 96 + AdhkarTapCounter.size)
            .environment(\.layoutDirection, .rightToLeft)
        }
        .background(Sunnah.Colors.bg)
        // زر العدّ ثابت أسفل يمين الشاشة (تحت الإبهام): لا يتحرك مع طول الذكر ولا يكبر/يصغر عند الضغط.
        .overlay(alignment: .bottomTrailing) {
            AdhkarTapCounter(item: current.items[index.wrappedValue], done: $done)
                .padding(.trailing, Sunnah.Spacing.pageX)
                // الشريط السفلي عائم فوق المحتوى (لا يُحسب في الـsafe area هنا): يُرفع الزر فوقه وإلا اختفى خلفه (لقطة #3613).
                .padding(.bottom, SunnahTabBar.reservedHeight + Sunnah.Spacing.s3)
                .environment(\.layoutDirection, .rightToLeft)
        }
    }

    /// أيقونة التصنيف بمعرّفه (عرض فقط)؛ المجهول يأخذ أيقونة عامة.
    static func symbol(_ id: String) -> String {
        switch id {
        case "adh-morning": return "sunrise"
        case "adh-evening": return "sunset"
        case "adh-sleep": return "moon.stars"
        case "adh-wakeup": return "sun.max"
        case "adh-after-salah", "adh-salah", "adh-mosque": return "building.columns"
        case "adh-wudu": return "drop"
        case "adh-food": return "fork.knife"
        case "adh-travel", "adh-vehicle": return "car"
        case "adh-clothing": return "tshirt"
        case "adh-home-out": return "house"
        case "adh-rain": return "cloud.rain"
        case "adh-wind": return "wind"
        case "adh-distress": return "heart"
        case "adh-istighfar", "adh-istikharah": return "hands.sparkles"
        case "adh-salawat": return "text.book.closed"
        default: return "book.closed"
        }
    }

    /// لا يُعرض معرّف خام أبدًا؛ التصنيف بلا عنوان في الموقع يظهر بهذا الاسم العام.
    static let fallbackTitle = "أذكار"
}

/// أذكار تصنيف واحد (النموذج ٢): بطاقة خضراء للذكر الحالي ← إعادة/التالي؛ العدّ بزر عائم ثابت (`AdhkarTapCounter`).
/// النص والمصدر والعدد من البيانات كما هي.
struct AdhkarListView: View {
    let items: [AdhkarItem]
    @Binding var index: Int
    @Binding var done: [String: Int]

    private func digits(_ n: Int) -> String { PrayerTimeFormat.arabicDigits(String(n)) }

    var body: some View {
        let item = items[min(index, items.count - 1)]
        VStack(spacing: 14) {
            SunnahHeroCard {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("\(digits(index + 1)) من \(digits(items.count))".arabicDigits).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                        Spacer()
                        Text("التكرار \(digits(item.repeatCount))").font(AppearancePrefs.ui(.extraBold, 12, .caption)).foregroundStyle(Sunnah.Colors.onHeroGold)   // goldInk داكنًا = لون الكبسولة نفسه فيختفي النص
                            .padding(.horizontal, 12).padding(.vertical, 4).background(Sunnah.Colors.heroGold, in: Capsule())
                    }
                    SunnahArabicText(item.text, style: .body).foregroundStyle(.white)
                    if let source = item.sourceName ?? item.reference {
                        Text(source).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.heroGold)
                    }
                }
            }
            .accessibilityIdentifier("adhkar.card")
            HStack(spacing: 14) {
                control("إعادة", "arrow.counterclockwise", filled: false) { done[item.id] = 0 }
                control(index + 1 < items.count ? "التالي" : "من البداية", "chevron.left", filled: true) {
                    index = index + 1 < items.count ? index + 1 : 0
                }
            }
            .padding(.horizontal, Sunnah.Spacing.pageX)
        }
    }

    private func control(_ title: String, _ symbol: String, filled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: symbol).font(.system(size: 14, weight: .bold))
                Text(title).font(AppearancePrefs.ui(.extraBold, 15, .body))
            }
            .foregroundStyle(filled ? Color.white : Sunnah.Colors.primary)
            .frame(maxWidth: .infinity, minHeight: 52)
            .background(filled ? Sunnah.Colors.primary : Sunnah.Colors.surface, in: Capsule())
            .overlay(Capsule().stroke(filled ? Color.clear : Sunnah.Colors.border, lineWidth: 1))
        }
        .buttonStyle(.plain).sunnahPressable()
    }
}

/// زر العدّ العائم: حجم وموضع ثابتان (لا تحريك ولا تكبير عند الضغط، فلا ينتقل الإبهام)؛ لمسة اهتزازية لكل عدّة،
/// وحلقة التقدم تمتلئ داخله. يبقى أسفل يمين الشاشة فوق شريط التبويب.
struct AdhkarTapCounter: View {
    static let size: CGFloat = 112
    let item: AdhkarItem
    @Binding var done: [String: Int]

    private func digits(_ n: Int) -> String { PrayerTimeFormat.arabicDigits(String(n)) }

    var body: some View {
        let taps = done[item.id, default: 0]
        let complete = taps >= item.repeatCount
        Button {
            guard !complete else { return }
            done[item.id] = taps + 1
            if taps + 1 >= item.repeatCount { Sunnah.Haptics.success() } else { Sunnah.Haptics.select() }
        } label: {
            ZStack {
                Circle().fill(Sunnah.Colors.surface)
                Circle().stroke(Sunnah.Colors.primarySoft, lineWidth: 8)
                Circle().trim(from: 0, to: CGFloat(min(taps, item.repeatCount)) / CGFloat(max(item.repeatCount, 1)))
                    .stroke(Sunnah.Colors.primary, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    if complete {
                        Image(systemName: "checkmark").font(.system(size: 34, weight: .heavy)).foregroundStyle(Sunnah.Colors.primary)
                    } else {
                        Text(digits(item.repeatCount - taps)).font(.system(size: 40, weight: .heavy, design: .rounded)).foregroundStyle(Sunnah.Colors.primary)
                            .monospacedDigit().contentTransition(.identity)
                    }
                    Text(complete ? "تمّ" : "اضغط").font(AppearancePrefs.ui(.bold, 11, .caption2)).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            .frame(width: Self.size, height: Self.size)
            .contentShape(Circle())
            .shadow(color: .black.opacity(0.14), radius: 12, y: 4)
        }
        .buttonStyle(AdhkarStillButtonStyle())
        .transaction { $0.animation = nil }
        .accessibilityLabel("العدّاد \(taps) من \(item.repeatCount)").accessibilityIdentifier("adhkar.counter")
    }
}

/// ضغط بلا تغيير حجم: تعتيم خفيف فقط.
private struct AdhkarStillButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.opacity(configuration.isPressed ? 0.85 : 1)
    }
}
