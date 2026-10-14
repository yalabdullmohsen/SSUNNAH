import SwiftUI

/// نص سطري Markdown: **غامق** وروابط داخلية `majlisilm://مسار` تُفتح بـopenRoute، والخارجية بالمتصفح.
struct AccountRichText: View {
    @Environment(\.openRoute) private var openRoute
    let markdown: String
    var font: Font = Sunnah.Typography.body
    var color: Color = Sunnah.Colors.textPrimary

    init(_ markdown: String, font: Font = Sunnah.Typography.body, color: Color = Sunnah.Colors.textPrimary) {
        self.markdown = markdown; self.font = font; self.color = color
    }

    var body: some View {
        Text(Self.attributed(markdown))
            .font(font).foregroundStyle(color).tint(Sunnah.Colors.primary)
            .lineSpacing(Sunnah.Spacing.s1)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
            .environment(\.openURL, OpenURLAction { url in
                guard url.scheme == AppHosts.scheme, let path = Route.path(from: url) else { return .systemAction }
                openRoute(path)
                return .handled
            })
    }

    static func attributed(_ markdown: String) -> AttributedString {
        let options = AttributedString.MarkdownParsingOptions(interpretedSyntax: .inlineOnlyPreservingWhitespace)
        return (try? AttributedString(markdown: markdown, options: options)) ?? AttributedString(markdown)
    }
}

/// رأس شاشة: سطر تمهيدي صغير + عنوان + وصف اختياري.
struct AccountHeader: View {
    let eyebrow: String?
    let title: String
    var subtitle: String?
    /// العنوان الكبير يعرضه شريط التنقل أصلًا؛ لا يُكرَّر هنا إلا إن اختلف عنه (مثل «أهلاً، الاسم»).
    var showsTitle = false

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            if let eyebrow, !eyebrow.isEmpty {
                Text(eyebrow).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary)
            }
            if showsTitle {
                Text(title).font(Sunnah.Typography.pageTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    .accessibilityAddTraits(.isHeader)
            }
            if let subtitle, !subtitle.isEmpty {
                Text(subtitle).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// قسم معنون داخل بطاقة.
struct AccountSectionCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
                Text(title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                content()
            }
        }
    }
}

/// قائمة نقطية أو مرقّمة بنص Markdown.
struct AccountListBlock: View {
    let items: [String]
    let numbered: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                HStack(alignment: .firstTextBaseline, spacing: Sunnah.Spacing.s2) {
                    Text(numbered ? "\(index + 1)." : "•").font(Sunnah.Typography.body)
                        .foregroundStyle(Sunnah.Colors.primary).accessibilityHidden(true)
                    AccountRichText(item)
                }
            }
        }
    }
}

/// صفحة قانونية كاملة (حول التطبيق، الخصوصية، سياسة الفتوى…) — الأقسام كما في الويب.
struct AccountLegalDocumentView<Footer: View>: View {
    let document: AccountLegalDocument
    let sharePath: String?
    @ViewBuilder var footer: () -> Footer

    init(_ document: AccountLegalDocument, sharePath: String?, @ViewBuilder footer: @escaping () -> Footer) {
        self.document = document; self.sharePath = sharePath; self.footer = footer
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                AccountHeader(eyebrow: document.eyebrow, title: document.title,
                              subtitle: document.updatedAt.map { "آخر تحديث: " + $0 })
                ForEach(document.sections) { section in
                    AccountSectionCard(title: section.title) {
                        ForEach(Array(section.blocks.enumerated()), id: \.offset) { _, block in
                            AccountLegalBlockView(block: block)
                        }
                    }
                }
                footer()
                AccountShareRow(title: document.title + " — سُنّة", path: sharePath)
            }
            .padding(Sunnah.Spacing.pageX)
        }
        .background(Sunnah.Colors.bg)
        .navigationTitle(document.title)
    }
}

extension AccountLegalDocumentView where Footer == EmptyView {
    init(_ document: AccountLegalDocument, sharePath: String?) { self.init(document, sharePath: sharePath) { EmptyView() } }
}

struct AccountLegalBlockView: View {
    let block: AccountLegalBlock

    var body: some View {
        switch block {
        case .paragraph(let text): AccountRichText(text)
        case .bullets(let items): AccountListBlock(items: items, numbered: false)
        case .numbered(let items): AccountListBlock(items: items, numbered: true)
        case .appVersion: AccountRichText(AccountAppVersion.current.text)
        }
    }
}

/// رقم الإصدار من Info.plist (مقابل version.json في الويب).
struct AccountAppVersion: Equatable {
    let short: String?
    let build: String?

    static var current: AccountAppVersion {
        let info = Bundle.main.infoDictionary
        return AccountAppVersion(short: info?["CFBundleShortVersionString"] as? String, build: info?["CFBundleVersion"] as? String)
    }

    var text: String {
        guard let short, !short.isEmpty else { return "الإصدار الحالي غير متاح في هذه النسخة." }
        if let build, !build.isEmpty, build != short { return "الإصدار الحالي: **\(short)** (\(build))." }
        return "الإصدار الحالي: **\(short)**."
    }
}

/// زر مشاركة رابط الصفحة على ssunnah.com (مقابل ShareButtons في الويب).
struct AccountShareRow: View {
    let title: String
    let path: String?

    var body: some View {
        if let path, let url = URL(string: AccountTexts.siteURL + path) {
            ShareLink(item: url, subject: Text(title)) {
                Label("مشاركة", systemImage: "square.and.arrow.up")
                    .font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                    .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.buttonHeight)
                    .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
            }
            .buttonStyle(.plain)
        }
    }
}

/// بلاطة إحصاء: قيمة كبيرة + وصف + سطر ثانوي.
struct AccountStatTile: View {
    let value: String
    let label: String
    var sub: String?

    var body: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                Text(value).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.primary)
                    .minimumScaleFactor(0.7).lineLimit(1)
                Text(label).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                if let sub, !sub.isEmpty {
                    Text(sub).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .accessibilityElement(children: .combine)
    }
}

/// شبكة بلاطات تتكيّف مع العرض.
struct AccountTileGrid<Item: Identifiable, Tile: View>: View {
    let items: [Item]
    @ViewBuilder let tile: (Item) -> Tile

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: Sunnah.Spacing.cardMinWidth), spacing: Sunnah.Spacing.s3)],
                  alignment: .leading, spacing: Sunnah.Spacing.s3) {
            ForEach(items) { tile($0) }
        }
    }
}

/// صف رابط داخلي (مسار ويب يحوّله الموجّه إلى شاشته).
struct AccountLinkRow: View {
    @Environment(\.openRoute) private var openRoute
    let title: String
    var subtitle: String?
    let path: String

    var body: some View {
        Button { openRoute(path) } label: { SunnahListRow(title: title, subtitle: subtitle) }
            .buttonStyle(.plain)
    }
}

/// شريط رقائق تصفية أفقي.
struct AccountChipBar: View {
    let options: [String]
    @Binding var selection: String

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Sunnah.Spacing.s2) {
                ForEach(options, id: \.self) { option in
                    Button { selection = option } label: { SunnahChip(option, selected: option == selection) }
                        .buttonStyle(.plain)
                        .frame(minHeight: Sunnah.Spacing.touch)
                        .accessibilityAddTraits(option == selection ? .isSelected : [])
                }
            }
        }
    }
}

/// حقل بحث بسيط بالرموز.
struct AccountSearchField: View {
    let placeholder: String
    @Binding var text: String

    var body: some View {
        HStack(spacing: Sunnah.Spacing.s2) {
            Image(systemName: "magnifyingglass").foregroundStyle(Sunnah.Colors.textSecondary).accessibilityHidden(true)
            TextField(placeholder, text: $text)
                .font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textPrimary)
                .autocorrectionDisabled()
            if !text.isEmpty {
                Button { text = "" } label: { Image(systemName: "xmark.circle.fill") }
                    .foregroundStyle(Sunnah.Colors.textSecondary).accessibilityLabel("مسح البحث")
            }
        }
        .padding(.horizontal, Sunnah.Spacing.s3)
        .frame(minHeight: Sunnah.Spacing.buttonHeight)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.small).stroke(Sunnah.Colors.surface2, lineWidth: Sunnah.Spacing.hairline))
    }
}

/// شريط تقدم أفقي بنسبة 0…1.
struct AccountProgressBar: View {
    let fraction: Double

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Sunnah.Colors.surface2)
                Capsule().fill(Sunnah.Colors.primary).frame(width: geo.size.width * max(0, min(1, fraction)))
            }
        }
        .frame(height: Sunnah.Spacing.progress)
        .accessibilityHidden(true)
    }
}

/// حالة تحميل عامة لمصدر بعيد/محزوم مع إعادة المحاولة.
enum AccountLoadPhase<Value> {
    case loading
    case failed
    case ready(Value)
}
