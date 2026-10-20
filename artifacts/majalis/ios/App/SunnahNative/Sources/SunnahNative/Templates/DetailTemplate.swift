import SwiftUI

/// قالب 2 (v5) — تفاصيل عنصر: ترويسة خضراء منقوشة (وسم ذهبي + عنوان + وصف) ثم بطاقة نص بيضاء متداخلة معها (مرجع LessonDetail).
/// النص القصير (حديث/فائدة): بطاقة مركزية تملأ الشاشة، بنقش وفاصل ذهبي ونص موسَّط، فلا تبقى مساحة فارغة.
public struct DetailTemplate: View {
    let item: ContentItem
    public init(item: ContentItem) { self.item = item }

    private var body_: String { item.body?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "" }
    /// نص قصير بلا عناوين/قوائم: يُعرض موسَّطًا في بطاقة واحدة.
    private var isShort: Bool { !body_.isEmpty && body_.count <= 360 && !body_.contains("\n#") && !body_.hasPrefix("#") }
    /// الوصف مكرَّر داخل النص (يُدمج المصدر في الاثنين): نُخفيه من الترويسة.
    private var subtitle: String? {
        guard let s = item.subtitle?.trimmingCharacters(in: .whitespacesAndNewlines), !s.isEmpty else { return nil }
        return body_.contains(s) ? nil : s
    }

    public var body: some View {
        GeometryReader { geo in
            ScrollView {
                VStack(spacing: 0) {
                    DetailHero(title: item.title, subtitle: subtitle, tags: item.tags, centered: true, fillHeight: isShort ? geo.size.height * 0.34 : nil)
                    if !body_.isEmpty {
                        if isShort { shortCard } else { longCard }
                    }
                    SunnahContentFooter(title: item.title, id: item.id, section: item.reportSection).sunnahReadableWidth()
                }
                .frame(minHeight: geo.size.height, alignment: .top)
            }
        }
        .background(Sunnah.Colors.bg).bodyTitledNavigation()
    }

    private var longCard: some View {
        SunnahSectionedMarkdown(body_, key: item.id, style: .body)
            .frame(maxWidth: .infinity, alignment: .leading).padding(Sunnah.Spacing.s4)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, -28).padding(.bottom, Sunnah.Spacing.s5)
            .sunnahReadableWidth()
    }

    private var shortCard: some View {
        VStack(spacing: Sunnah.Spacing.s5) {
            SunnahMotif(size: 64, opacity: 0.9)
            SunnahMarkdownText(body_, style: .hadith)
                .multilineTextAlignment(.center)
            HStack(spacing: Sunnah.Spacing.s3) {
                Rectangle().fill(Sunnah.Colors.goldDeco.opacity(0.5)).frame(height: 1)
                Rectangle().fill(Sunnah.Colors.goldDeco).frame(width: 6, height: 6).rotationEffect(.degrees(45))
                Rectangle().fill(Sunnah.Colors.goldDeco.opacity(0.5)).frame(height: 1)
            }
            .frame(maxWidth: 160).accessibilityHidden(true)
        }
        .padding(.horizontal, Sunnah.Spacing.s5).padding(.vertical, Sunnah.Spacing.s7 + 20)
        .frame(maxWidth: .infinity)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: 1))
        .sunnahElevation()
        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, Sunnah.Spacing.s5)
        .sunnahReadableWidth()
        .frame(maxHeight: .infinity, alignment: .center)
    }
}

/// ترويسة تفاصيل v5: خلفية خضراء منقوشة، وسم ذهبي، عنوان أبيض، وصف؛ تمتد تحت شريط التنقل.
struct DetailHero: View {
    let title: String; var subtitle: String? = nil; var tags: [String] = []; var centered = false; var fillHeight: CGFloat? = nil
    var body: some View {
        VStack(alignment: centered ? .center : .leading, spacing: Sunnah.Spacing.s2) {
            if let t = tags.first { Text(t.arabicDigits).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.goldDeco) }
            Text(title.arabicDigits).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.onHero).accessibilityAddTraits(.isHeader)
            if let s = subtitle, !s.isEmpty { Text(s.arabicDigits).font(Sunnah.Typography.secondary).foregroundStyle(Color.white.opacity(0.82)) }
            if tags.count > 1 { HStack(spacing: Sunnah.Spacing.s2) { ForEach(tags.dropFirst(), id: \.self) { SunnahChip($0) } } }
        }
        .multilineTextAlignment(centered ? .center : .leading)
        .frame(maxWidth: .infinity, alignment: centered ? .center : .leading)
        .frame(height: fillHeight, alignment: .center)
        .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, Sunnah.Spacing.s5).padding(.bottom, 44)
        .heroNavigationBar()
        .background { ZStack { Sunnah.Colors.primaryStrong; SunnahStarPattern().opacity(0.9) }.clipShape(UnevenRoundedRectangle(bottomLeadingRadius: Sunnah.Radius.hero, bottomTrailingRadius: Sunnah.Radius.hero, style: .continuous)).padding(.top, -600).ignoresSafeArea(edges: .top) }
    }
}
