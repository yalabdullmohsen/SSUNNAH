import SwiftUI
import os
#if os(macOS)
import AppKit
#endif

/// صفحة مصحف واحدة: 15 سطرًا بخط QPC الخاص بالصفحة. اللمس على كلمة يحدّد آيتها.
public struct MushafPageView: View {
    let repo: MushafRepository
    let index: MushafIndex
    let number: Int
    @Binding var selectedAyah: String?
    var onLongPress: ((String) -> Void)? = nil
    /// الإيماءات وتسميات إمكانية الوصول على الصفحة الحالية فقط: على الجارتين تكلّف عقد إيماءات لكل كلمة (≈450 عقدة) تُبطئ التقليب.
    var interactive = true
    /// آية ← ألوان علاماتها، وألوان علامات الصفحة (أثر بصري خفيف).
    var markColors: [String: [MushafMarkColor]] = [:]
    var pageMarks: [MushafMarkColor] = []
    @State private var page: MushafPage?
    @State private var family: String?
    @State private var failed = false
    /// حجم غليف نهاية الآية نسبةً إلى خط النص: الحجم الطبيعي في خط QPC (كالمطبوع ومرجع المالك ص27 — قياس 2026-10-20:
    /// عرض السطر = مجموع عروض الغلايف بلا فراغ مضاف، والزخرفة ≈0.80em عرضًا بخط الصفحة نفسه).
    static let endMarkScale: CGFloat = 1.0
    /// ضغط أفقي للزخرفة حول مركز حبرها ليطابق تناسب المطبوع (العرض/الارتفاع ≈0.77).
    static let endMarkSquash: CGFloat = 1.0
    /// عرض الزخرفة المرئي بوحدة em من حجم غليف النهاية (حبر 0.80em × الضغط) — يحسب منه التخطيط الفراغ حولها.
    static let ayahDiscEm: CGFloat = 0.80
    /// إزاحة القرص للأسفل (em) ليتمركز مع حبر الحلقة داخل الخط لا مع صندوق النص.
    static let ayahDiscDropEm: CGFloat = 0.07
    /// شفافية تظليل الآية بلون علامتها (خفيف لا يغطي الحبر).
    static let markTintOpacity: Double = 0.18

    public init(repo: MushafRepository, index: MushafIndex, number: Int, selectedAyah: Binding<String?>, onLongPress: ((String) -> Void)? = nil, interactive: Bool = true, markColors: [String: [MushafMarkColor]] = [:], pageMarks: [MushafMarkColor] = []) {
        self.repo = repo; self.index = index; self.number = number; _selectedAyah = selectedAyah; self.onLongPress = onLongPress; self.interactive = interactive; self.markColors = markColors; self.pageMarks = pageMarks
        if let family = try? repo.ensureFont(page: number), let page = try? repo.page(number) {
            _page = State(initialValue: page); _family = State(initialValue: family)
        }
    }

    public var body: some View {
        GeometryReader { geo in
            if let page, let family {
                content(page, family: family, size: geo.size)
            } else if failed {
                StateMessage(text: "تعذّر تحميل الصفحة \(number)").screenState(.error)
            } else {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity).screenState(.loading)
            }
        }
        .ignoresSafeArea()
        .task(id: number) {
            guard page == nil else { return }
            do { family = try repo.ensureFont(page: number); page = try repo.page(number); Logger(subsystem: "com.yousef.majlisilm", category: "mushaf-perf").notice("MUSHAF_PERF page_ready \(number)") } catch { failed = true }
        }
    }

    @ViewBuilder
    private func content(_ page: MushafPage, family: String, size: CGSize) -> some View {
        // التوزيع من بيانات تخطيط QPC (أنواع الأسطر) عبر MushafPageLayout؛ الهامش الجانبي ≈3% من العرض (هندسة المرجع 402×874).
        let _ = repo.noteRenderSize(size)
        let pl = repo.pageLayout(page, family: family, size: size)
        let inset = pl.inset, width = pl.width, m = pl.m, layout = pl.layout
        let rows = m.rows, rowH = CGFloat(m.rowHeight)
        VStack(spacing: 0) {
            ForEach(Array(rows.enumerated()), id: \.offset) { i, row in
                rowView(row, layout: layout, family: family, index: i, width: width).frame(height: rowH)
            }
        }
        .frame(height: rowH * CGFloat(rows.count))
        .padding(.horizontal, inset)
        .padding(.top, CGFloat(m.top))
        .frame(maxHeight: .infinity, alignment: .top)
        .overlay(alignment: .leading) { if !pageMarks.isEmpty { MushafPageEdge(colors: pageMarks).frame(height: rowH * CGFloat(rows.count) * 0.9).padding(.top, CGFloat(m.top)).padding(.leading, 2) } }
        .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder
    private func rowView(_ row: MushafRow, layout: MushafMetrics.Layout, family: String, index i: Int, width: CGFloat) -> some View {
        switch row.k {
        case "h":
            let name = self.index.surahs.first { $0.id == row.s }?.name ?? ""
            SurahBanner(surah: row.s ?? 0, name: name, repo: repo).padding(.vertical, 1)
        case "b":
            BasmalaView(repo: repo, fontSize: MushafMetrics.basmalaFontSize(width: width))
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case "l":
            let words = row.w ?? []
            let gap = layout.gaps[i] ?? layout.fontSize * MushafMetrics.naturalGapEm
            // تظليل متصل: شريط واحد لكل مقطع متتالٍ من كلمات الآية المحددة (حواف ناعمة عند الطرفين فقط، يمتد نصف الفجوة فلا فراغ بين الكلمات).
            let runs: [[(k: Int, w: MushafWord)]] = words.enumerated().reduce(into: []) { acc, e in
                if let last = acc.last?.last, last.w.v == e.element.v { acc[acc.count - 1].append((e.offset, e.element)) } else { acc.append([(e.offset, e.element)]) }
            }
            HStack(spacing: gap) {
                ForEach(Array(runs.enumerated()), id: \.offset) { _, run in
                    HStack(spacing: gap) {
                        ForEach(run, id: \.k) { item in
                            let k = item.k, w = item.w
                            Group {
                                if w.isAyahEnd { MushafEndMark(glyph: w.c, family: family, fontSize: layout.fontSize, diameter: layout.discs[i]?[k]) }
                                else { Text(w.c).lineLimit(1).fixedSize().font(.custom(family, fixedSize: layout.fontSize)).foregroundStyle(Sunnah.Colors.mushafText).mushafInkWeight(layout.fontSize) }
                            }
                                .padding(.leading, w.isAyahEnd ? layout.endPads[i]?[k]?.lead ?? 0 : 0)
                                .padding(.trailing, w.isAyahEnd ? layout.endPads[i]?[k]?.trail ?? 0 : 0)
                                .padding(.vertical, 1)
                                .contentShape(Rectangle())
                                // قرار المالك: التحديد بالضغط المطوّل فقط؛ النقرة العادية تمرّ للصفحة (إظهار/إخفاء الأدوات، وإلغاء تحديد قائم).
                                .gesture(
                                    LongPressGesture(minimumDuration: 0.4).onEnded { _ in selectedAyah = w.v; onLongPress?(w.v) },
                                    including: interactive ? .all : .none)
                                .accessibilityLabel(w.isAyahEnd ? "آية \(w.v.arabicDigits)" : "")
                        }
                    }
                    .background {
                        // التحديد أولًا؛ وإلا تظليل خفيف بلون علامة الآية (أول ألوانها) على كامل الآية.
                        if let v = run.first?.w.v, selectedAyah == v {
                            MushafSoftBand(roundRight: true, roundLeft: true, radius: layout.fontSize * 0.28).fill(Sunnah.Colors.primarySoft)
                                .padding(.horizontal, -gap / 2)
                        } else if let v = run.first?.w.v, let c = markColors[v]?.first {
                            MushafSoftBand(roundRight: true, roundLeft: true, radius: layout.fontSize * 0.28).fill(c.color.opacity(MushafPageView.markTintOpacity))
                                .padding(.horizontal, -gap / 2)
                        }
                    }
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
    /// «تفسير» في بطاقة الآية: اختيار مكتوب/صوتي. الصوتي يشغّل تفسير الآية المحددة وحدها (المختصر) في مشغّل مصغّر فوق المصحف.
    @State private var tafsirPicker = false
    @ObservedObject private var mukhtasar = MukhtasarPlayer.shared
    @ObservedObject private var mukhtasarDownloads = MukhtasarDownloader.shared
    @StateObject private var chromeHide = ChromeAutoHide()
    @Environment(\.accessibilityVoiceOverEnabled) private var voiceOver
    @State private var sheetHeight: CGFloat = 0
    @State private var ayahPicker = false
    @State private var pagePicker = false
    @State private var hifzPicker = false
    @StateObject private var hifz = HifzProgressStore()
    /// البحث داخل الصفحة: النص ونتائجه (أعلى 60) وتمدّد لوحة «المزيد»؛ الحقل في الشريط والنتائج لوحة فوق الصفحة.
    @State private var query = ""
    @State private var hits: [MushafSearchHit] = []
    @State private var hitsExpanded = false
    @State private var searchTask: Task<Void, Never>?
    @State private var openSearch: Bool
    @FocusState private var searchFocused: Bool
    @State private var pageSize = CGSize(width: 402, height: 874)
    @Environment(\.openRoute) private var openRoute

    public init(repo: MushafRepository, index: MushafIndex, search: MushafSearch?, store: MushafStore, startPage: Int? = nil, initialSelection: String? = nil, startSearching: Bool = false) {
        _openSearch = State(initialValue: startSearching)
        self.repo = repo; self.index = index; self.search = search; self.store = store
        _current = State(initialValue: Mushaf.clamp(startPage ?? store.lastPage))
        _selected = State(initialValue: initialSelection)
    }

    public var body: some View {
        GeometryReader { geo in
            let h = geo.size.height, w = MushafPageLayout.canvasWidth(container: geo.size)
            let plan = avoidancePlan(height: h)
            ZStack(alignment: .top) {
                Color.clear.onAppear { pageSize = CGSize(width: w, height: h) }.onChange(of: h) { _ in pageSize = CGSize(width: w, height: h) }
                Sunnah.Colors.mushafPaper
                Group {
                #if os(iOS)
                MushafPager(current: $current, count: Mushaf.pageCount, renderKey: AnyHashable("\(selected ?? "")|\(current)|\(marksKey)")) { n in
                    MushafPageView(repo: repo, index: index, number: n, selectedAyah: $selected, onLongPress: { _ in Sunnah.Haptics.select() }, interactive: n == current, markColors: store.ayahColors(onPage: n), pageMarks: store.colors(ofPage: n))
                }
                #else
                TabView(selection: $current) {
                    ForEach(Mushaf.pagerWindow(around: current), id: \.self) { n in
                        Group {
                            if Mushaf.rendersPage(n, current: current) { MushafPageView(repo: repo, index: index, number: n, selectedAyah: $selected, onLongPress: { _ in Sunnah.Haptics.select() }, interactive: n == current) }
                            else { Color.clear }
                        }.tag(n)
                    }
                }
                #if os(iOS)
                .tabViewStyle(.page(indexDisplayMode: .never))
                #endif
                #endif
                }
                .environment(\.layoutDirection, .rightToLeft)
                // الارتفاع ثابت = h: ignoresSafeArea هنا كان يمدّ المقلِّب بمقدار الإزاحة (909.67 بدل 874) فتُحسب الأسطر على ارتفاع غير الذي بُنيت عليه SheetAvoidance.
                .frame(width: w, height: h)
                .clipped()
                pageHeader.padding(.horizontal, w * 0.032).position(x: w / 2, y: h * MushafPageLayout.headerCenter)
                    .opacity(chromeHide.visible ? 0 : 1)   // الشريط يغطّي سطر الرأس: لا نص تحت الأزرار
                    .animation(Sunnah.Motion.reduced ? nil : .easeInOut(duration: 0.25), value: chromeHide.visible)
                pageCartouche.padding(.horizontal, w * 0.04).position(x: w / 2, y: h * MushafPageLayout.footerCenter)
            }
            .frame(width: w, height: h)
            // القائمة السفلية لا تقطع نص الصفحة: تُصغَّر الصفحة كاملة (تحويل بصري بلا تغيير التخطيط) لتبقى فوق القائمة.
            // القاعدة: لا يتقاطع مستطيل الآية المحددة (كل أسطرها) مع البطاقة؛ تُزاح الصفحة أو تُنقل البطاقة للأعلى أو تُصغَّر عند الضرورة (SheetAvoidance).
            .scaleEffect(plan.scale, anchor: .top)
            .offset(y: plan.dy)
            .animation(Sunnah.Motion.reduced ? nil : .easeInOut(duration: 0.28), value: selected)
            .animation(Sunnah.Motion.reduced ? nil : .easeInOut(duration: 0.28), value: sheetHeight)
            .contentShape(Rectangle())
            
            .onTapGesture { if searchFocused { searchFocused = false } else if selected != nil { selected = nil } else { chromeHide.toggle() } }
            .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged { _ in chromeHide.touch() })
        }
        .ignoresSafeArea()
        .background(Sunnah.Colors.mushafPaper.ignoresSafeArea())
        // الصفحة المُزاحة للأعلى تنزلق تحت شريط الحالة بدل أن تتقاطع حروفها مع الساعة والبطارية.
        .overlay(alignment: .top) { if avoidancePlan(height: pageSize.height).dy < 0 { Sunnah.Colors.mushafPaper.frame(height: Self.topSafeInset).ignoresSafeArea(edges: .top) } }
        .overlay(alignment: .top) {
            // أدوات المصحف (إغلاق، بحث، فهرس، علامة) مخفية افتراضيًا؛ تظهر بنقرة على الصفحة وتختفي بنقرة ثانية أو تلقائيًا.
            VStack(spacing: Sunnah.Spacing.s2) {
                chrome
                if searchFocused { searchPanel }
            }
            .padding(.horizontal, 12).padding(.top, Self.chromeTop)
            .ignoresSafeArea(edges: .top)
            // أي لمس على الأدوات يعيد عدّ الإخفاء (والشريط ثابت أثناء التركيز على حقل البحث).
            .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged { _ in chromeHide.touch() })
            .opacity(chromeHide.visible ? 1 : 0)
            .allowsHitTesting(chromeHide.visible)
            .accessibilityHidden(!chromeHide.visible)
            .animation(Sunnah.Motion.reduced ? nil : .easeInOut(duration: 0.25), value: chromeHide.visible)
        }
        .overlay(alignment: .top) {
            if pagePicker {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                    Text("علامة على الصفحة \(Self.arabicDigits(current))").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    MushafMarkPicker(active: store.colors(ofPage: current)) { store.toggleMark($0, ayah: nil, page: current) }
                    HifzStatePicker(store: hifz, page: current)
                }
                .padding(Sunnah.Spacing.s3)
                .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.6), lineWidth: 1))
                .shadow(color: .black.opacity(0.12), radius: 12, y: 4)
                .padding(.horizontal, Sunnah.Spacing.s4).padding(.top, Self.chromeBottom + 6)
                .ignoresSafeArea(edges: .top)
                .transition(.opacity)
            }
        }
        .immersiveReader(revealed: false)
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
        .overlay(alignment: avoidancePlan(height: pageSize.height).sheetOnTop ? .top : .bottom) { if let sel = selected { selectionSheet(sel) } }
        .onChange(of: selected) { sel in
            if sel == nil { sheetHeight = 0 }
            updatePin()
        }
        .onChange(of: voiceOver) { chromeHide.alwaysVisible = $0 }
        .onAppear { chromeHide.alwaysVisible = voiceOver; updatePin() }
        .onDisappear { chromeHide.cancel(); if tafsirAyahPlaying != nil { mukhtasar.stop() } }
        // أعلى الصفحة فوق سطر اسم السورة/الجزء (لا يغطي آخر سطر من الآيات ولا رقم الصفحة).
        .overlay(alignment: .top) { if selected == nil { ayahTafsirPlayer } }
        .fullScreenCover(isPresented: $showIndex) {
            MushafIndexView(index: index, store: store, close: { showIndex = false }) { page in current = page; showIndex = false }
        }
        .onChange(of: searchFocused) { _ in updatePin() }
        .onChange(of: query) { q in chromeHide.touch(); runSearch(q) }
        .onChange(of: selected) { _ in ayahPicker = false; hifzPicker = false; tafsirPicker = false }
        .onChange(of: pagePicker) { _ in updatePin() }
        .onChange(of: current) { p in selected = nil; pagePicker = false; store.visit(page: p); repo.prefetch(around: p, size: pageSize) }
        .task {
            store.visit(page: current); repo.prefetch(around: current, size: pageSize)
            if openSearch { openSearch = false; chromeHide.pin(true); try? await Task.sleep(nanoseconds: 400_000_000); searchFocused = true }
            #if DEBUG
            if let q = UserDefaults.standard.string(forKey: "snapshotSearchQuery"), !q.isEmpty { chromeHide.pin(true); query = q; try? await Task.sleep(nanoseconds: 300_000_000); searchFocused = true }
            // لقطات التدقيق فقط: `-snapshotSelectAyah 37:130` يحدّد الآية كأن المستخدم لمسها (يُظهر التظليل وبطاقة الآية).
            if let a = UserDefaults.standard.string(forKey: "snapshotSelectAyah"), !a.isEmpty { selected = a }
            // `-snapshotShowChrome 1` يُظهر سطر الأدوات ثابتًا (لقطة وضع الأدوات).
            if UserDefaults.standard.bool(forKey: "snapshotShowChrome") { chromeHide.pin(true) }   // updatePin لا يلغيه: يُعاد ضبطه عند أي تغيّر حالة
            // `-snapshotMarkPicker 1` يفتح اختيار اللون في بطاقة الآية؛ `-snapshotSeedMarks 1` يزرع علامات ملوّنة في الصفحة الحالية؛ `-snapshotShowMarks 1` يفتح «علاماتي».
            if UserDefaults.standard.bool(forKey: "snapshotMarkPicker") { Task { try? await Task.sleep(nanoseconds: 500_000_000); ayahPicker = true } }
            hifz.migrateIfNeeded(marks: store.bookmarks, index: index)
            if UserDefaults.standard.bool(forKey: "snapshotHifzPicker") { Task { try? await Task.sleep(nanoseconds: 500_000_000); hifzPicker = true } }
            if UserDefaults.standard.bool(forKey: "snapshotPageMarkPicker") { chromeHide.pin(true); Task { try? await Task.sleep(nanoseconds: 500_000_000); pagePicker = true } }
            if UserDefaults.standard.bool(forKey: "snapshotSeedMarks"), store.bookmarks.isEmpty, let a = firstAyah(on: current) {
                store.toggleMark(.hifz, ayah: a, page: current); store.toggleMark(.tadabbur, ayah: a, page: current)
                store.toggleMark(.review, ayah: nil, page: current); store.toggleMark(.wird, ayah: nil, page: current)
                store.toggleMark(.general, ayah: "2:255", page: 42); store.toggleMark(.wird, ayah: "36:1", page: 440)
            }
            if UserDefaults.standard.bool(forKey: "snapshotShowMarks") { showIndex = true }
            #endif
            #if (DEBUG || MUSHAF_PROBE) && canImport(UIKit)
            MushafFlipProbe.runIfRequested(start: current) { current = $0 }
            #endif
        }
        .environment(\.layoutDirection, .rightToLeft)
    }

    /// سطر الرأس كما في المرجع: «الجزء N» يمينًا واسم السورة (عند أول الصفحة) يسارًا؛ اللمس يُظهر/يُخفي أدوات القارئ.
    private var pageHeader: some View {
        HStack {
            Text("الجزء \(Self.arabicDigits(index.juz(onPage: current)))")
            Spacer()
            Text(topSurahName(on: current))
        }
        .font(Sunnah.Typography.secondary)
        .foregroundStyle(Sunnah.Colors.mushafAccent)
        .contentShape(Rectangle())
        .onTapGesture { sunnahAnimate { chromeHide.toggle() } }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isButton)
        .accessibilityHint("يُظهر أدوات القارئ")
        .accessibilityIdentifier("mushaf.header")
    }

    /// سطر الأدوات: إغلاق، حقل «ابحث في القرآن» الكبير (بحث داخل الصفحة)، فهرس، علامة؛ أهداف اللمس ≥44.
    private var chrome: some View {
        HStack(spacing: Sunnah.Spacing.s2) {
            MushafToolButton(symbol: "xmark", label: "إغلاق المصحف", id: "mushaf.close") { openRoute("/") }
            MushafSearchField(query: $query, focused: $searchFocused) { submitSearch() }
            MushafToolButton(symbol: "list.bullet", label: "الفهرس والعلامات", id: "mushaf.index") { searchFocused = false; showIndex = true }
            MushafToolButton(symbol: store.colors(ofPage: current).isEmpty ? "bookmark" : "bookmark.fill", label: "علامة على الصفحة", id: "mushaf.pageMark") { sunnahAnimate { pagePicker.toggle() } }
        }
        .padding(.vertical, 3)
        .background(Sunnah.Colors.mushafPaper.opacity(0.96), in: RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous))   // الصفحة المُزاحة لا تمرّ تحت الأزرار
        .dynamicTypeSize(...DynamicTypeSize.xxxLarge)   // شريط بارتفاع ثابت: أكبر من ذلك يقتطع الحقل ويتداخل
    }

    private var searchPanel: some View {
        MushafSearchPanel(index: index, repo: repo, query: query, hits: hits, jump: MushafSearch.jump(query, index: index),
                          maxHeight: max(pageSize.height * 0.62 - Self.chromeBottom, 220), expanded: $hitsExpanded,
                          pick: { goTo(page: $0.page, ayah: $0.ayah) },
                          go: { goTo(page: $0.page, ayah: $0.ayah) })
            .transition(.opacity)
    }

    /// الشريط ثابت ما دام الحقل مركَّزًا أو بطاقة آية أو منتقي علامة مفتوحًا؛ وإلا يبدأ العدّ.
    private func updatePin() { chromeHide.pin(selected != nil || searchFocused || pagePicker) }

    private func runSearch(_ q: String) {
        searchTask?.cancel(); hitsExpanded = false
        guard let search, q.trimmingCharacters(in: .whitespaces).count >= 2 else { hits = []; return }
        searchTask = Task {
            try? await Task.sleep(nanoseconds: 60_000_000)
            guard !Task.isCancelled else { return }
            let r = await Task.detached(priority: .userInitiated) { search.search(q, limit: 60) }.value
            if !Task.isCancelled { hits = r }
        }
    }

    /// إدخال/بحث: القفزة المباشرة إن وُجدت وإلا أول نتيجة.
    private func submitSearch() {
        if let j = MushafSearch.jump(query, index: index) { goTo(page: j.page, ayah: j.ayah) }
        else if let h = hits.first { goTo(page: h.page, ayah: h.ayah) }
    }

    /// ينقل للصفحة ويظلّل الآية ويغلق اللوحة. onChange(current) يمسح التحديد فيُضبط في الدورة التالية.
    private func goTo(page: Int, ayah: String?) {
        searchFocused = false
        current = Mushaf.clamp(page)
        DispatchQueue.main.async { selected = ayah }
    }

    /// خرطوشة رقم الصفحة أسفل يمين الصفحة (خارج شبكة الأسطر فلا يتغيّر مقاس الخط ولا توزيع الكلمات).
    private var pageCartouche: some View {
        HStack {
            PageCartouche(text: Self.arabicDigits(current))
                .accessibilityLabel("صفحة \(current.arabicDigits)")
                .accessibilityIdentifier("mushaf.pageNumber")
            Spacer()
            Text("الحزب \(Self.arabicDigits(hizb(on: current)))")
                .font(Sunnah.Typography.secondary)
                .foregroundStyle(Sunnah.Colors.mushafAccent)
                .accessibilityIdentifier("mushaf.hizb")
        }
    }

    static func arabicDigits(_ n: Int) -> String {
        ArabicNumerals.string(n)
    }

    /// السورة الجارية في أعلى الصفحة (آية أول سطر)، لا آخر سورة تبدأ فيها.
    /// الحزب الجاري = حزب أول آية في الصفحة (أرباع Tanzil)؛ احتياطًا من فهرس الأجزاء إن تعذّرت الآية.
    private func hizb(on page: Int) -> Int {
        firstAyah(on: page).flatMap(HizbQuarters.hizb(ayahID:)) ?? 1
    }

    private func topSurahName(on page: Int) -> String {
        if let v = firstAyah(on: page), let id = Int(v.split(separator: ":").first ?? ""),
           let s = index.surahs.first(where: { $0.id == id }) { return s.name }
        return index.surah(onPage: page)?.name ?? ""
    }

    /// الخطة الحالية لتجنّب البطاقة: مستطيل الآية من أسطر الصفحة الجارية وارتفاع البطاقة الفعلي مع الحافة الآمنة.
    private func avoidancePlan(height h: CGFloat) -> SheetAvoidance.Plan {
        guard let sel = selected, sheetHeight > 0, let page = try? repo.page(current) else { return .none }
        let m = MushafPageLayout.metrics(for: page, height: Double(h))
        let idx = m.rows.enumerated().compactMap { i, r in r.w?.contains { $0.v == sel } == true ? i : nil }
        guard let span = SheetAvoidance.ayahSpan(rowIndices: idx, top: CGFloat(m.top), rowHeight: CGFloat(m.rowHeight)) else { return .none }
        return SheetAvoidance.plan(pageHeight: h, ayahMinY: span.minY, ayahMaxY: span.maxY, sheetHeight: sheetHeight + Self.bottomSafeInset, barBottom: chromeHide.visible ? Self.chromeBottom : 0)
    }

    /// أعلى الشريط (من حافة الشاشة) وأسفله: ارتفاعه 46 (الحقل) + 6 هامشًا.
    static var chromeTop: CGFloat { max(topSafeInset - 3, 40) - 13 }
    static var chromeBottom: CGFloat { chromeTop + 52 }

    static var topSafeInset: CGFloat {
        #if os(iOS)
        let w = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap(\.windows).first { $0.isKeyWindow }
        return w?.safeAreaInsets.top ?? 0
        #else
        return 0
        #endif
    }

    static var bottomSafeInset: CGFloat {
        #if os(iOS)
        let w = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.flatMap(\.windows).first { $0.isKeyWindow }
        return w?.safeAreaInsets.bottom ?? 0
        #else
        return 0
        #endif
    }

    private func reference(_ ayah: String) -> String { MushafShare.reference(ayah, index: index) }

    /// النص العثماني الحرفي من البيانات؛ nil يعطّل النسخ والمشاركة بدل نسخ نص ناقص.
    private func shareText(_ ayah: String) -> String? { MushafShare.text(ayah: ayah, index: index, search: search) }

    private func copy(_ text: String) {
        #if os(iOS)
        UIPasteboard.general.string = text
        #else
        NSPasteboard.general.clearContents(); NSPasteboard.general.setString(text, forType: .string)
        #endif
    }

    private func selectionSheet(_ ayah: String) -> some View {
        VStack(spacing: Sunnah.Spacing.s3) {
            HStack(spacing: Sunnah.Spacing.s3) {
                Text(reference(ayah).arabicDigits).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Spacer()
                SunnahButton("إغلاق", style: .outline) { selected = nil }
            }
            // الآية كاملة بخط المصحف (تمتد على سطور/صفحتين) داخل تمرير محدود الارتفاع فلا تطول القائمة بلا حد.
            ScrollView {
                MushafAyahText(ayah: ayah, repo: repo, size: 22, collapseAbove: .max, paper: false, plainText: shareText(ayah))
            }
            .frame(maxHeight: min(pageSize.height * 0.28, 230))
            .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: Sunnah.Spacing.s3) {
                if let text = shareText(ayah) {
                    Button { copy(text) } label: { Label("نسخ", systemImage: "doc.on.doc") }.accessibilityIdentifier("mushaf.sheet.copy")
                    ShareLink(item: text) { Label("مشاركة", systemImage: "square.and.arrow.up") }.accessibilityIdentifier("mushaf.sheet.share")
                    #if os(iOS)
                    if let img = MushafAyahShareCard.image(text: text, reference: reference(ayah)) {
                        ShareLink(item: img, preview: SharePreview(reference(ayah), image: img)) { Label("صورة", systemImage: "photo") }
                            .accessibilityIdentifier("mushaf.sheet.shareImage")
                    }
                    #endif
                }
                Button { sunnahAnimate { ayahPicker = false; hifzPicker = false; tafsirPicker.toggle() } } label: { Label("تفسير", systemImage: "text.book.closed") }.accessibilityIdentifier("mushaf.sheet.tafsir")
                Button { openRoute("/quran/offline-player") } label: { Label("استماع", systemImage: "headphones") }.accessibilityIdentifier("mushaf.sheet.reciters")
                Button { sunnahAnimate { ayahPicker.toggle() } } label: { Label("علامة", systemImage: store.colors(ofAyah: ayah).isEmpty ? "bookmark" : "bookmark.fill") }.accessibilityIdentifier("mushaf.sheet.mark")
                Button { sunnahAnimate { hifzPicker.toggle() } } label: { Label("حفظ", systemImage: hifz.progress.state(current) == .none ? "checkmark.circle" : "checkmark.circle.fill") }.accessibilityIdentifier("mushaf.sheet.hifz")
            }
            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.mushafInk)
            .dynamicTypeSize(...DynamicTypeSize.xxxLarge)   // صف أزرار بأيقونة فوق الاسم: AX يقتطع الأسماء إلى «م…»
            .labelStyle(MushafSheetActionLabelStyle())   // أيقونة فوق الاسم: لا التفاف حرفيًّا ولا اقتطاع على الشاشات الضيقة
            if ayahPicker {
                MushafMarkPicker(active: store.colors(ofAyah: ayah)) { store.toggleMark($0, ayah: ayah, page: current) }
            }
            if hifzPicker { HifzStatePicker(store: hifz, page: current) }
            if tafsirPicker { tafsirChoice(ayah) }
        }
        .padding(Sunnah.Spacing.s4)
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.6), lineWidth: 1))
        .shadow(color: .black.opacity(0.12), radius: 16, y: 6)
        .padding(.horizontal, Sunnah.Spacing.s4).padding(.bottom, Sunnah.Spacing.s3)
        .background(GeometryReader { g in Color.clear.preference(key: MushafSheetHeightKey.self, value: g.size.height) })
        .onPreferenceChange(MushafSheetHeightKey.self) { sheetHeight = $0 + Sunnah.Spacing.s3 }
        .transition(.move(edge: avoidancePlan(height: pageSize.height).sheetOnTop ? .top : .bottom).combined(with: .opacity))
    }

    private func ayahParts(_ ayah: String) -> (surah: Int, ayah: Int)? {
        let p = ayah.split(separator: ":")
        guard p.count == 2, let s = Int(p[0]), let a = Int(p[1]) else { return nil }
        return (s, a)
    }

    /// خيارا التفسير: مكتوب (شاشة التفاسير) أو صوتي (المختصر لهذه الآية فقط، بلا قائمة سور ولا شاشة تنزيل).
    private func tafsirChoice(_ ayah: String) -> some View {
        SunnahActionRow {
            SunnahButton("تفسير مكتوب", style: .outline) { openRoute("/tafsir/\(ayah)") }
                .accessibilityIdentifier("mushaf.sheet.tafsir.text")
            if let p = ayahParts(ayah), MukhtasarIndex.hasAyahs(p.surah) {
                SunnahButton("تفسير صوتي") { selected = nil; mukhtasar.play(p.surah, ayah: p.ayah) }
                    .accessibilityIdentifier("mushaf.sheet.tafsir.audio")
            }
        }
        .frame(maxWidth: .infinity)
        .transition(.opacity)
    }

    /// الآية التي يجري تفسيرها صوتيًا (أو تُجهَّز)، إن وُجدت.
    private var tafsirAyahPlaying: (Int, Int)? {
        if let p = mukhtasar.preparing { return (p.surah, p.ayah) }
        if let s = mukhtasar.surah, let a = mukhtasar.ayah { return (s, a) }
        return nil
    }

    private func surahName(_ s: Int) -> String { index.surahs.first { $0.id == s }?.name ?? s.arabicDigits }

    /// مشغّل مصغّر لتفسير الآية فوق المصحف: العنوان، تشغيل/إيقاف مؤقت، إنهاء؛ وحالة التجهيز (تنزيل ملف السورة مرة واحدة).
    @ViewBuilder private var ayahTafsirPlayer: some View {
        let dl = mukhtasarDownloads
        if let p = tafsirAyahPlaying {
            HStack(spacing: Sunnah.Spacing.s3) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("تفسير الآية \(p.1.arabicDigits) · \(surahName(p.0))")
                        .font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        .lineLimit(1).minimumScaleFactor(0.8)
                    Group {
                        if mukhtasar.preparing != nil {
                            Text(dl.active == p.0 ? "تجهيز التفسير… \(Int(dl.progress * 100).arabicDigits)٪" : "تجهيز التفسير…")
                        } else if mukhtasar.failedSurah == p.0 {
                            Text("تعذّر التجهيز — تحقّق من الاتصال")
                        } else {
                            Text(MukhtasarAudio.title)
                        }
                    }
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary).lineLimit(1)
                }
                Spacer(minLength: 0)
                if mukhtasar.preparing != nil {
                    ProgressView()
                } else {
                    Button { mukhtasar.toggle() } label: {
                        Image(systemName: mukhtasar.playing ? "pause.fill" : "play.fill").font(.title3).frame(width: 44, height: 44)
                    }
                    .accessibilityLabel(mukhtasar.playing ? "إيقاف مؤقت" : "تشغيل").accessibilityIdentifier("mushaf.tafsirAudio.toggle")
                }
                Button { mukhtasar.stop() } label: { Image(systemName: "xmark").font(.body.weight(.semibold)).frame(width: 44, height: 44) }
                    .accessibilityLabel("إنهاء التفسير").accessibilityIdentifier("mushaf.tafsirAudio.close")
            }
            .foregroundStyle(Sunnah.Colors.mushafInk)
            .padding(.horizontal, Sunnah.Spacing.s4).padding(.vertical, Sunnah.Spacing.s2)
            .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.hero, style: .continuous).stroke(Sunnah.Colors.goldDeco.opacity(0.6), lineWidth: 1))
            .shadow(color: .black.opacity(0.12), radius: 12, y: 4)
            .padding(.horizontal, Sunnah.Spacing.s4).padding(.top, Sunnah.Spacing.s1)
            .transition(.move(edge: .top).combined(with: .opacity))
            .accessibilityElement(children: .contain)
        }
    }

    /// يتغيّر مع أي علامة فتُعاد رسم الصفحات المجاورة.
    private var marksKey: String { store.bookmarks.map(\.id).joined(separator: ",") }

    private func firstAyah(on page: Int) -> String? {
        (try? repo.page(page))?.rows.compactMap { $0.w?.first?.v }.first
    }
}

/// الفهرس (صفحة كاملة): السور، الأجزاء، العلامات. البحث صار داخل صفحة المصحف نفسها. صفوف ≥44 بلا List.
public struct MushafIndexView: View {
    enum Tab: String, CaseIterable { case surahs = "السور", juz = "الأجزاء", marks = "علاماتي" }
    let index: MushafIndex
    @ObservedObject var store: MushafStore
    let close: () -> Void
    let open: (Int) -> Void
    @State private var tab: Tab = .surahs

    public init(index: MushafIndex, store: MushafStore, close: @escaping () -> Void, open: @escaping (Int) -> Void) {
        self.index = index; self.store = store; self.close = close; self.open = open
        #if DEBUG
        if UserDefaults.standard.bool(forKey: "snapshotShowMarks") { _tab = State(initialValue: .marks) }
        #endif
    }

    private func row(_ title: String, _ trailing: String, _ id: String, _ page: Int) -> some View {
        Button { open(page) } label: {
            HStack { Text(title); Spacer(); Text(trailing).foregroundStyle(Sunnah.Colors.textSecondary) }
                .padding(.horizontal, Sunnah.Spacing.s4)
                .frame(minHeight: Sunnah.Spacing.touch)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier(id)
    }

    public var body: some View {
        VStack(spacing: Sunnah.Spacing.s2) {
            HStack(spacing: Sunnah.Spacing.s2) {
                SunnahSegmented(Tab.allCases.map { ($0, $0.rawValue) }, selection: $tab)
                    .dynamicTypeSize(...DynamicTypeSize.xxxLarge)
                MushafToolButton(symbol: "xmark", label: "إغلاق الفهرس", id: "mushaf.index.close", action: close)
            }
            .padding(.horizontal, Sunnah.Spacing.s4).padding(.top, Sunnah.Spacing.s4)
            switch tab {
            case .surahs:
                ScrollView { LazyVStack(spacing: 0) {
                    ForEach(index.surahs) { s in row("\(s.id.arabicDigits). \(s.name)", "صفحة \(s.firstPage.arabicDigits)", "mushaf.index.surah.\(s.id)", s.firstPage) }
                } }
            case .juz:
                ScrollView { LazyVStack(spacing: 0) {
                    ForEach(Array(index.juzStart.enumerated()), id: \.offset) { i, p in row("الجزء \((i + 1).arabicDigits)", "صفحة \(p.arabicDigits)", "mushaf.index.juz.\(i + 1)", p) }
                } }
            case .marks:
                MushafMarksScreen(store: store, open: open)
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .sunnahMotifCorner(size: 220, alignment: .bottomLeading, opacity: 0.06)
        .background(Sunnah.Colors.bg)
    }
}

private struct MushafSheetHeightKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = max(value, nextValue()) }
}

/// شريط تظليل بحواف ناعمة عند طرفي المقطع فقط (الأطراف الملتصقة بكلمة محددة مجاورة تبقى مستقيمة فيتصل التظليل).
private struct MushafSoftBand: Shape {
    var roundRight: Bool, roundLeft: Bool, radius: CGFloat
    func path(in r: CGRect) -> Path {
        let k = min(radius, r.height / 2, r.width / 2)
        let tr = roundRight ? k : 0, br = roundRight ? k : 0, tl = roundLeft ? k : 0, bl = roundLeft ? k : 0
        var p = Path()
        p.move(to: CGPoint(x: r.minX + tl, y: r.minY))
        p.addLine(to: CGPoint(x: r.maxX - tr, y: r.minY))
        if tr > 0 { p.addArc(center: CGPoint(x: r.maxX - tr, y: r.minY + tr), radius: tr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false) }
        p.addLine(to: CGPoint(x: r.maxX, y: r.maxY - br))
        if br > 0 { p.addArc(center: CGPoint(x: r.maxX - br, y: r.maxY - br), radius: br, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false) }
        p.addLine(to: CGPoint(x: r.minX + bl, y: r.maxY))
        if bl > 0 { p.addArc(center: CGPoint(x: r.minX + bl, y: r.maxY - bl), radius: bl, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false) }
        p.addLine(to: CGPoint(x: r.minX, y: r.minY + tl))
        if tl > 0 { p.addArc(center: CGPoint(x: r.minX + tl, y: r.minY + tl), radius: tl, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false) }
        p.closeSubpath()
        return p
    }
}

/// أزرار بطاقة الآية: أيقونة فوق الاسم بعرض متساوٍ، فتتسع الخمسة على أضيق جوال.
private struct MushafSheetActionLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        VStack(spacing: 4) {
            configuration.icon
            configuration.title.lineLimit(1).minimumScaleFactor(0.6)
        }
        .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch)
        .contentShape(Rectangle())
    }
}
