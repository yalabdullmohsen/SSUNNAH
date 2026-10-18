import SwiftUI

// مكوّنات «النموذج ٢» المعتمد (docs/native/design/model2/SPEC.md): تُبنى مرة وتسري على كل الشاشات.
// القيم من Sunnah.* فقط؛ الأرقام عربية-هندية عبر `Sunnah.digits` وبيئة اللغة `ar-u-nu-arab`.

public extension Sunnah {
    /// يحوّل أرقام 0-9 في النص إلى عربية-هندية (٠-٩) للنصوص المركَّبة يدويًا (`String(format:)`، أوقات من JSON…).
    static func digits(_ s: String) -> String {
        let map: [Character: Character] = ["0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤", "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩"]
        return String(s.map { map[$0] ?? $0 })
    }
    static func digits(_ n: Int) -> String { digits(String(n)) }
    /// لغة الواجهة الموحّدة: عربي بأرقام هندية.
    static let locale = Locale(identifier: "ar-u-nu-arab")
}

// MARK: - TopBar

/// الشريط العلوي: زر قائمة دائري 52 (يمين) + كبسولة 52 للبحث والحساب (يسار)؛ أو رجوع + إجراءات في الشاشات الفرعية.
public struct SunnahTopBar<Trailing: View>: View {
    let onMenu: (() -> Void)?; let onBack: (() -> Void)?; let trailing: Trailing
    public init(onMenu: (() -> Void)? = nil, onBack: (() -> Void)? = nil, @ViewBuilder trailing: () -> Trailing) {
        self.onMenu = onMenu; self.onBack = onBack; self.trailing = trailing()
    }
    public var body: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            if let onMenu { SunnahRoundButton(symbol: "line.3.horizontal", label: "القائمة", action: onMenu) }
            if let onBack { SunnahRoundButton(symbol: "chevron.forward", label: "رجوع", action: onBack) }
            Spacer(minLength: 0)
            HStack(spacing: 4) { trailing }
                .padding(.horizontal, 6).frame(height: 52)
                .background(Sunnah.Colors.surface, in: Capsule())
                .overlay(Capsule().stroke(Sunnah.Colors.border, lineWidth: 1))
        }
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}

public struct SunnahRoundButton: View {
    let symbol: String; let label: String; let action: () -> Void
    public init(symbol: String, label: String, action: @escaping () -> Void) { self.symbol = symbol; self.label = label; self.action = action }
    public var body: some View {
        Button { Sunnah.Haptics.select(); action() } label: {
            Image(systemName: symbol).font(.system(size: 19, weight: .semibold))
                .foregroundStyle(Sunnah.Colors.primary)
                .frame(width: 52, height: 52)
                .background(Sunnah.Colors.surface, in: Circle())
                .overlay(Circle().stroke(Sunnah.Colors.border, lineWidth: 1))
        }
        .buttonStyle(.plain).accessibilityLabel(label)
    }
}

/// أيقونة داخل كبسولة الشريط العلوي (44×52 لمسًا).
public struct SunnahTopBarIcon: View {
    let symbol: String; let label: String; let action: () -> Void
    public init(symbol: String, label: String, action: @escaping () -> Void) { self.symbol = symbol; self.label = label; self.action = action }
    public var body: some View {
        Button { Sunnah.Haptics.select(); action() } label: {
            Image(systemName: symbol).font(.system(size: 19, weight: .semibold))
                .foregroundStyle(Sunnah.Colors.primary).frame(width: 46, height: 52).contentShape(Rectangle())
        }
        .buttonStyle(.plain).accessibilityLabel(label)
    }
}

// MARK: - PageTitle

/// عنوان الصفحة الكبير 32 ExtraBold تحت الشريط.
public struct SunnahPageTitle: View {
    let text: String
    public init(_ text: String) { self.text = text }
    public var body: some View {
        Text(text).font(AppearancePrefs.ui(.extraBold, 32, .largeTitle))
            .foregroundStyle(Sunnah.Colors.textPrimary)
            .lineLimit(2).minimumScaleFactor(0.7)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, Sunnah.Spacing.pageX)
            .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - HeroCard

/// زخرفة المثمّن الهندسي بشفافية 10% + نجمة كبيرة باهتة في الزاوية.
struct SunnahOctagonOrnament: View {
    var body: some View {
        ZStack(alignment: .topTrailing) {
            SunnahStarPattern(tile: 54, opacity: 0.10)
            SunnahMotif(size: 170, tint: .white, accent: Sunnah.Colors.heroGold, opacity: 0.10).offset(x: 50, y: -40)
        }
        .allowsHitTesting(false).accessibilityHidden(true)
    }
}

/// البطاقة الخضراء الكبيرة (#24523F): زخرفة + نص أبيض وذهبي. زاوية 28.
public struct SunnahHeroCard<Content: View>: View {
    let content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: 28, style: .continuous)
        content
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background { ZStack { Sunnah.Colors.hero; SunnahOctagonOrnament() }.clipShape(shape) }
            .sunnahElevation()
            .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}

// MARK: - PrayerTimeline

public struct SunnahTimelineItem: Identifiable {
    public let id: String; public let name: String; public let time: String; public let active: Bool
    public init(id: String, name: String, time: String, active: Bool) { self.id = id; self.name = name; self.time = time; self.active = active }
}

/// خط أفقي بخمس نقاط تحت الصلاة القادمة؛ النشطة ذهبية بهالة. الأوقات تُمرَّر منسّقة من محرك المواقيت (لا حساب هنا).
public struct SunnahPrayerTimeline: View {
    let items: [SunnahTimelineItem]
    public init(_ items: [SunnahTimelineItem]) { self.items = items }
    public var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Rectangle().fill(Color.white.opacity(0.25)).frame(height: 2).padding(.horizontal, 14)
                HStack(spacing: 0) {
                    ForEach(items) { it in
                        ZStack {
                            if it.active { Circle().fill(Sunnah.Colors.heroGold.opacity(0.3)).frame(width: 26, height: 26) }
                            Circle().fill(it.active ? Sunnah.Colors.heroGold : Sunnah.Colors.hero).frame(width: 14, height: 14)
                                .overlay(Circle().stroke(it.active ? Sunnah.Colors.heroGold : Color.white.opacity(0.6), lineWidth: 2))
                        }.frame(maxWidth: .infinity)
                    }
                }
            }.frame(height: 26)
            HStack(spacing: 0) {
                ForEach(items) { it in
                    VStack(spacing: 2) {
                        Text(it.name).font(AppearancePrefs.ui(.bold, 12, .caption))
                        Text(Sunnah.digits(it.time)).font(AppearancePrefs.ui(.bold, 12, .caption))
                    }
                    .foregroundStyle(it.active ? Sunnah.Colors.heroGold : Color.white.opacity(0.85))
                    .frame(maxWidth: .infinity)
                    .accessibilityElement(children: .combine)
                    .accessibilityAddTraits(it.active ? .isSelected : [])
                }
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
    }
}

// MARK: - IconTile / Card / Tile

/// مربع الأيقونة 38–40 نعناعي (أو ذهبي فاتح للثانوي).
public struct SunnahIconTile: View {
    public enum Tone { case mint, gold }
    let symbol: String; let tone: Tone; let size: CGFloat
    public init(_ symbol: String, tone: Tone = .mint, size: CGFloat = 40) { self.symbol = symbol; self.tone = tone; self.size = size }
    public var body: some View {
        Image(systemName: symbol).font(.system(size: size * 0.45, weight: .semibold))
            .foregroundStyle(tone == .mint ? Sunnah.Colors.primary : Sunnah.Colors.goldInk)
            .frame(width: size, height: size)
            .background(tone == .mint ? Sunnah.Colors.primarySoft : Sunnah.Colors.goldTile, in: RoundedRectangle(cornerRadius: 13, style: .continuous))
            .accessibilityHidden(true)
    }
}

/// بطاقة النموذج ٢: أبيض، حد 1، زاوية 26؛ رأس (أيقونة + عنوان أخضر) ثم فاصل ثم المحتوى.
public struct SunnahHeaderCard<Content: View>: View {
    let title: String?; let symbol: String?; let content: Content
    public init(title: String? = nil, symbol: String? = nil, @ViewBuilder content: () -> Content) { self.title = title; self.symbol = symbol; self.content = content() }
    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let title {
                HStack(spacing: 10) {
                    if let symbol { Image(systemName: symbol).font(.system(size: 18, weight: .semibold)).foregroundStyle(Sunnah.Colors.primary) }
                    Text(title).font(AppearancePrefs.ui(.extraBold, 17, .headline)).foregroundStyle(Sunnah.Colors.primary)
                    Spacer(minLength: 0)
                }
                .accessibilityElement(children: .combine).accessibilityAddTraits(.isHeader)
                Divider().overlay(Sunnah.Colors.border)
            }
            content
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .sunnahElevation()
        .padding(.horizontal, Sunnah.Spacing.pageX)
    }
}

/// بلاطة قسم (شبكة عمودين): أيقونة + عنوان + وصف.
public struct SunnahTile: View {
    let title: String; let subtitle: String?; let symbol: String; let tone: SunnahIconTile.Tone
    public init(title: String, subtitle: String? = nil, symbol: String, tone: SunnahIconTile.Tone = .mint) {
        self.title = title; self.subtitle = subtitle; self.symbol = symbol; self.tone = tone
    }
    public var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            SunnahIconTile(symbol, tone: tone)
            Text(title).font(AppearancePrefs.ui(.extraBold, 16, .headline)).foregroundStyle(Sunnah.Colors.textPrimary).lineLimit(2)
            if let subtitle { Text(subtitle).font(AppearancePrefs.ui(.bold, 12, .caption)).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(2) }
        }
        .padding(16)
        .frame(maxWidth: .infinity, minHeight: 112, alignment: .topLeading)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .contentShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Settings

/// مجموعة إعدادات: عنوان أخضر + بطاقة بيضاء بصفوف 58 وفواصل داخلية.
public struct SunnahSettingsGroup<Content: View>: View {
    let title: String?; let content: Content
    public init(_ title: String? = nil, @ViewBuilder content: () -> Content) { self.title = title; self.content = content() }
    public var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let title {
                Text(title).font(AppearancePrefs.ui(.extraBold, 15, .subheadline)).foregroundStyle(Sunnah.Colors.primary)
                    .padding(.horizontal, Sunnah.Spacing.pageX + 4).accessibilityAddTraits(.isHeader)
            }
            VStack(spacing: 0) { content }
                .padding(.horizontal, 16)
                .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
                .padding(.horizontal, Sunnah.Spacing.pageX)
        }
    }
}

/// صف إعداد 58: مربع أيقونة + عنوان + (قيمة | مفتاح | سهم). `isLast` يُسقط الفاصل.
public struct SunnahSettingsRow<Accessory: View>: View {
    let title: String; let symbol: String; let tone: SunnahIconTile.Tone; let isLast: Bool; let accessory: Accessory
    public init(_ title: String, symbol: String, tone: SunnahIconTile.Tone = .mint, isLast: Bool = false, @ViewBuilder accessory: () -> Accessory) {
        self.title = title; self.symbol = symbol; self.tone = tone; self.isLast = isLast; self.accessory = accessory()
    }
    public var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                SunnahIconTile(symbol, tone: tone, size: 38)
                Text(title).font(AppearancePrefs.ui(.bold, 15, .body)).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer(minLength: 8)
                accessory
            }
            .frame(minHeight: 58)
            .contentShape(Rectangle())
            if !isLast { Divider().overlay(Sunnah.Colors.border) }
        }
    }
}

public extension SunnahSettingsRow where Accessory == EmptyView {
    init(_ title: String, symbol: String, tone: SunnahIconTile.Tone = .mint, isLast: Bool = false) {
        self.init(title, symbol: symbol, tone: tone, isLast: isLast) { EmptyView() }
    }
}
