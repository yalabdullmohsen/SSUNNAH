import SwiftUI

/// صفحة مصحف واحدة: 15 سطرًا بخط QPC الخاص بالصفحة. اللمس على كلمة يحدّد آيتها.
public struct MushafPageView: View {
    let repo: MushafRepository
    let index: MushafIndex
    let number: Int
    @Binding var selectedAyah: String?
    @State private var page: MushafPage?
    @State private var family: String?
    @State private var failed = false

    public init(repo: MushafRepository, index: MushafIndex, number: Int, selectedAyah: Binding<String?>) {
        self.repo = repo; self.index = index; self.number = number; _selectedAyah = selectedAyah
        if let family = try? repo.ensureFont(page: number), let page = try? repo.page(number) {
            _page = State(initialValue: page); _family = State(initialValue: family)
        }
    }

    public var body: some View {
        GeometryReader { geo in
            if let page, let family {
                content(page, family: family, size: geo.size)
            } else if failed {
                StateMessage(text: "تعذّر تحميل الصفحة \(number)")
            } else {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .task(id: number) {
            guard page == nil else { return }
            do { family = try repo.ensureFont(page: number); page = try repo.page(number) } catch { failed = true }
        }
    }

    @ViewBuilder
    private func content(_ page: MushafPage, family: String, size: CGSize) -> some View {
        let inset: CGFloat = Sunnah.Spacing.s4
        let width = size.width - inset * 2
        let rows = page.opening ? page.rows.filter { $0.k != "x" } : page.rows
        let slots = page.opening ? CGFloat(15) : CGFloat(max(15, rows.count))
        let rowH = size.height / slots
        let layout = MushafMetrics.layout(rows: rows, family: family, width: width, maxFont: rowH * 0.8)
        VStack(spacing: 0) {
            ForEach(Array(rows.enumerated()), id: \.offset) { i, row in
                rowView(row, layout: layout, family: family, index: i, width: width).frame(height: rowH)
            }
        }
        .frame(maxHeight: .infinity, alignment: page.opening ? .center : .top)
        .padding(.horizontal, inset)
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private func rowView(_ row: MushafRow, layout: MushafMetrics.Layout, family: String, index i: Int, width: CGFloat) -> some View {
        switch row.k {
        case "h":
            let name = self.index.surahs.first { $0.id == row.s }?.name ?? ""
            Text("سورة \(name)")
                .font(Sunnah.Typography.cardTitle)
                .foregroundStyle(Sunnah.Colors.primary)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Sunnah.Colors.primarySoft, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small))
                .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.small).stroke(Sunnah.Colors.goldDeco, lineWidth: 1))
                .padding(.vertical, 2)
        case "b":
            Text("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")
                .font(Sunnah.Typography.cardTitle)
                .foregroundStyle(Sunnah.Colors.textPrimary)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case "l":
            let words = row.w ?? []
            let gap = layout.gaps[i] ?? layout.fontSize * MushafMetrics.naturalGapEm
            HStack(spacing: gap) {
                ForEach(Array(words.enumerated()), id: \.offset) { _, w in
                    Text(w.c)
                        .lineLimit(1)
                        .fixedSize()
                    .font(.custom(family, fixedSize: layout.fontSize))
                        .foregroundStyle(Sunnah.Colors.textPrimary)
                        .padding(.vertical, 1)
                        .background(selectedAyah == w.v ? Sunnah.Colors.primarySoft : .clear)
                        .onTapGesture { selectedAyah = selectedAyah == w.v ? nil : w.v }
                        .accessibilityLabel(w.isAyahEnd ? "آية \(w.v)" : "")
                }
            }
            .frame(maxWidth: layout.gaps[i] == nil ? nil : width)
            .frame(maxWidth: .infinity)
        default:
            Color.clear
        }
    }
}

struct StateMessage: View {
    let text: String
    var body: some View {
        Text(text).font(Sunnah.Typography.body).foregroundStyle(Sunnah.Colors.textSecondary)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

/// القارئ: تمرير الصفحات، شريط علوي (سورة/جزء/صفحة)، فهرس وبحث وعلامات، ومتابعة آخر موضع.
public struct MushafReaderView: View {
    let repo: MushafRepository
    let index: MushafIndex
    let search: MushafSearch?
    @ObservedObject var store: MushafStore
    @State private var current: Int
    @State private var selected: String?
    @State private var showIndex = false

    public init(repo: MushafRepository, index: MushafIndex, search: MushafSearch?, store: MushafStore, startPage: Int? = nil) {
        self.repo = repo; self.index = index; self.search = search; self.store = store
        _current = State(initialValue: Mushaf.clamp(startPage ?? store.lastPage))
    }

    public var body: some View {
        VStack(spacing: 0) {
            header
            TabView(selection: $current) {
                ForEach(1...Mushaf.pageCount, id: \.self) { n in
                    Group {
                        if abs(n - current) <= 1 { MushafPageView(repo: repo, index: index, number: n, selectedAyah: $selected) }
                        else { Color.clear }
                    }.tag(n)
                }
            }
            #if os(iOS)
            .tabViewStyle(.page(indexDisplayMode: .never))
            #endif
            .environment(\.layoutDirection, .rightToLeft)
        }
        .background(Sunnah.Colors.bg)
        .overlay(alignment: .bottom) { if let sel = selected { selectionSheet(sel) } }
        .sheet(isPresented: $showIndex) {
            MushafIndexView(index: index, search: search, store: store) { page in current = page; showIndex = false }
        }
        .onChange(of: current) { p in selected = nil; store.visit(page: p) }
        .task { store.visit(page: current) }
        .environment(\.layoutDirection, .rightToLeft)
    }

    private var header: some View {
        HStack {
            Button { showIndex = true } label: { Image(systemName: "list.bullet") }.accessibilityLabel("الفهرس والبحث")
            Spacer()
            VStack(spacing: 0) {
                Text(index.surah(onPage: current)?.name ?? "").font(Sunnah.Typography.cardTitle)
                Text("الجزء \(index.juz(onPage: current)) · صفحة \(current)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
            }
            Spacer()
            Button {
                let ayah = selected ?? firstAyah(on: current)
                if let ayah { store.toggleBookmark(ayah: ayah, page: current) }
            } label: { Image(systemName: isMarked ? "bookmark.fill" : "bookmark") }.accessibilityLabel("علامة")
        }
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.vertical, Sunnah.Spacing.s2)
        .foregroundStyle(Sunnah.Colors.primary)
    }

    private func selectionSheet(_ ayah: String) -> some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            Text("آية \(ayah)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            Spacer()
            SunnahButton(isMarked ? "إزالة العلامة" : "علامة", style: .secondary) { store.toggleBookmark(ayah: ayah, page: current) }
            SunnahButton("إغلاق", style: .outline) { selected = nil }
        }
        .padding(Sunnah.Spacing.s4)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.6), lineWidth: 1))
        .shadow(color: .black.opacity(0.12), radius: 16, y: 6)
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.bottom, Sunnah.Spacing.s3)
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .accessibilityIdentifier("mushaf.selection")
    }

    private var isMarked: Bool { (selected ?? firstAyah(on: current)).map(store.isBookmarked) ?? false }

    private func firstAyah(on page: Int) -> String? {
        (try? repo.page(page))?.rows.compactMap { $0.w?.first?.v }.first
    }
}

/// الفهرس: السور، الأجزاء، العلامات، والبحث في نص القرآن.
public struct MushafIndexView: View {
    enum Tab: String, CaseIterable { case surahs = "السور", juz = "الأجزاء", marks = "العلامات", search = "بحث" }
    let index: MushafIndex
    let search: MushafSearch?
    @ObservedObject var store: MushafStore
    let open: (Int) -> Void
    @State private var tab: Tab = .surahs
    @State private var query = ""

    public init(index: MushafIndex, search: MushafSearch?, store: MushafStore, open: @escaping (Int) -> Void) {
        self.index = index; self.search = search; self.store = store; self.open = open
    }

    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s2) {
            SunnahSegmented(Tab.allCases.map { ($0, $0.rawValue) }, selection: $tab)
                .padding(.horizontal, Sunnah.Spacing.s4).padding(.top, Sunnah.Spacing.s4)
            switch tab {
            case .surahs:
                List(index.surahs) { s in
                    Button { open(s.firstPage) } label: {
                        HStack { Text("\(s.id). \(s.name)"); Spacer(); Text("صفحة \(s.firstPage)").foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                    .sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            case .juz:
                List(Array(index.juzStart.enumerated()), id: \.offset) { i, p in
                    Button { open(p) } label: { HStack { Text("الجزء \(i + 1)"); Spacer(); Text("صفحة \(p)").foregroundStyle(Sunnah.Colors.textSecondary) } }
                    .sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            case .marks:
                if store.bookmarks.isEmpty { StateMessage(text: "لا علامات بعد") }
                else {
                    List(store.bookmarks) { b in
                        Button { open(b.page) } label: { HStack { Text("آية \(b.ayah)"); Spacer(); Text("صفحة \(b.page)").foregroundStyle(Sunnah.Colors.textSecondary) } }
                        .sunnahRowChrome()
                    }
                    .listStyle(.plain).scrollContentBackground(.hidden)
                }
            case .search:
                TextField("ابحث في القرآن", text: $query).font(Sunnah.Typography.body)
                    .padding(Sunnah.Spacing.s3).background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card))
                    .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card).stroke(Sunnah.Colors.surface2, lineWidth: 1))
                    .padding(.horizontal, Sunnah.Spacing.s4)
                let hits = search?.search(query) ?? []
                List(hits) { h in
                    Button { open(h.page) } label: {
                        VStack(alignment: .leading) { Text(h.text).lineLimit(2); Text("آية \(h.ayah) · صفحة \(h.page)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary) }
                    }
                    .sunnahRowChrome()
                }
                .listStyle(.plain).scrollContentBackground(.hidden)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahMotifCorner(size: 220, alignment: .bottomLeading, opacity: 0.06)
        .background(Sunnah.Colors.bg)
    }
}
