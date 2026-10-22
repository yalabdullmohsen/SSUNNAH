import SwiftUI

/// يعرض صفحة قراءة الفقه: رأس، تبويبات (إن تعددت)، بطاقات الكتل، ثم روابط مجمّعة. nil = عنصر غير موجود.
struct FiqhReadingView: View {
    @Environment(\.openRoute) private var openRoute
    @State private var tabIndex = 0
    let reading: FiqhReading?

    var body: some View {
        Group {
            if let reading {
                if reading.isEmpty { EmptyStateView() } else { content(reading) }
            } else {
                EmptyStateView(title: "غير موجود")
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .heroNavigationBar()
        .heroTitledNavigation(reading?.title ?? "")   // العنوان في الـHero وحدها
    }

    private func content(_ reading: FiqhReading) -> some View {
        ScrollView {
            VStack(spacing: 0) {
            DetailHero(title: reading.title, subtitle: reading.subtitle)
            LazyVStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                if reading.tabs.count > 1 { tabBar(reading.tabs) }
                if let tab = currentTab(reading) {
                    ForEach(tab.blocks) { FiqhBlockCard(block: $0) }
                }
                ForEach(Array(groups(reading.links).enumerated()), id: \.offset) { _, group in
                    if let title = group.title {
                        Text(title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                            .padding(.top, Sunnah.Spacing.s2).accessibilityAddTraits(.isHeader)
                    }
                    if group.title != nil && group.title != "الأبواب" && group.links.count <= 24 {
                        // محور بلاط: كتب الفقه والمباحث المساندة بنقرة واحدة (الأبواب الطويلة تبقى صفوفًا).
                        LazyVGrid(columns: [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)], spacing: 14) {
                            ForEach(Array(group.links.enumerated()), id: \.element.id) { i, link in
                                Button { Sunnah.Haptics.select(); openRoute(link.route) } label: {
                                    SunnahTile(title: link.title.arabicDigits, subtitle: link.subtitle?.arabicDigits,
                                               symbol: FiqhBookStyle.symbol(for: link.title), tone: i % 2 == 0 ? .mint : .gold)
                                }
                                .buttonStyle(.plain).sunnahPressable()
                                .accessibilityIdentifier("fiqh.tile.\(link.route)")
                            }
                        }
                    } else {
                        ForEach(group.links) { link in
                            Button { openRoute(link.route) } label: {
                                SunnahCard { SunnahListRow(title: link.title, subtitle: link.subtitle) }
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Sunnah.Spacing.pageX)
            SunnahContentFooter(title: reading.title, id: reading.title, section: "الفقه", sensitive: true)
            }
        }
    }

    private func currentTab(_ reading: FiqhReading) -> FiqhReading.Tab? {
        reading.tabs.indices.contains(tabIndex) ? reading.tabs[tabIndex] : reading.tabs.first
    }

    private func tabBar(_ tabs: [FiqhReading.Tab]) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Sunnah.Spacing.s2) {
                ForEach(Array(tabs.enumerated()), id: \.element.id) { i, tab in
                    Button { tabIndex = i } label: {
                        SunnahChip(tab.label, selected: i == tabIndex).frame(minHeight: Sunnah.Spacing.touch)
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(i == tabIndex ? .isSelected : [])
                }
            }
        }
    }

    /// يجمع الروابط المتتالية ذات العنوان نفسه.
    private func groups(_ links: [FiqhReading.Link]) -> [(title: String?, links: [FiqhReading.Link])] {
        var out: [(title: String?, links: [FiqhReading.Link])] = []
        for link in links {
            if let last = out.last, last.title == link.group {
                out[out.count - 1].links.append(link)
            } else {
                out.append((title: link.group, links: [link]))
            }
        }
        return out
    }
}

/// بطاقة كتلة: عنوان، فقرات، نقاط، نص منقول مميَّز، ومرجع.
struct FiqhBlockCard: View {
    let block: FiqhReading.Block

    var body: some View {
        SunnahCard {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                if let title = block.title {
                    Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                }
                ForEach(Array(block.paragraphs.enumerated()), id: \.offset) { _, p in
                    SunnahArabicText(p, style: .body).foregroundStyle(Sunnah.Colors.textPrimary)
                }
                ForEach(Array(block.bullets.enumerated()), id: \.offset) { _, b in
                    HStack(alignment: .firstTextBaseline, spacing: Sunnah.Spacing.s2) {
                        Text("•").font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.primary).accessibilityHidden(true)
                        SunnahArabicText(b, style: .body).foregroundStyle(Sunnah.Colors.textPrimary)
                    }
                }
                if let q = block.quote {
                    SunnahArabicText(q, style: .body).foregroundStyle(Sunnah.Colors.primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(Sunnah.Spacing.s3)
                        .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                }
                if let r = block.reference {
                    Text(r).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
            }
            .textSelection(.enabled)
        }
    }
}

/// يحمّل قيمة بأي طريقة (ملف أو أكثر) ثم يعرضها؛ حالات التحميل/الخطأ من مكوّنات الحزمة.
struct FiqhLoadHost<Value, Content: View>: View {
    @Environment(\.contentLoader) private var loader
    @State private var phase: Phase = .loading
    let load: (ContentLoader) async throws -> Value
    @ViewBuilder let content: (Value) -> Content

    private enum Phase { case loading, failed, ready(Value) }

    var body: some View {
        Group {
            switch phase {
            case .loading: LoadingStateView()
            case .failed: ErrorStateView { Task { await reload() } }
            case .ready(let value): content(value)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Sunnah.Colors.bg)
        .heroNavigationBar()
        .task { await reload() }
    }

    private func reload() async {
        phase = .loading
        do { phase = .ready(try await load(loader)) } catch { phase = .failed }
    }
}

/// أيقونة كل كتاب فقهي في محور البلاط (بحسب كلمة في عنوانه)، فلا تتشابه البلاطات.
enum FiqhBookStyle {
    static let symbols: [(String, String)] = [
        ("الطهارة", "drop"), ("الصلاة", "building.columns"), ("الزكاة", "banknote"), ("الصيام", "moon.stars"),
        ("الحج", "map"), ("الاعتكاف", "house"), ("الجنائز", "leaf"), ("البيوع", "cart"), ("المعاملات", "cart"),
        ("النكاح", "person.2"), ("الأسرة", "person.2"), ("الطلاق", "person.2.slash"), ("المواريث", "chart.pie"),
        ("الفرائض", "chart.pie"), ("الأيمان", "hand.raised"), ("النذور", "hand.raised"), ("الأطعمة", "fork.knife"),
        ("الذبائح", "fork.knife"), ("اللباس", "tshirt"), ("الزينة", "tshirt"), ("القضاء", "building.columns"),
        ("الحدود", "building.columns"), ("الجنايات", "building.columns"), ("الأضحية", "calendar"), ("الآداب", "heart.text.square"),
        ("القواعد", "list.bullet.rectangle"), ("الأصول", "list.bullet.rectangle"), ("المصطلحات", "character.book.closed"),
    ]
    static func symbol(for title: String) -> String {
        symbols.first { title.contains($0.0) }?.1 ?? "book.closed"
    }
}
