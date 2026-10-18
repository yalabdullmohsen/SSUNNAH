import SwiftUI

/// قالب مشترك لأي موضوع علمي/معجزة/مراحل: مراحل متسلسلة + السابق/التالي + مؤشر تقدم + انتقال ناعم (يحترم Reduce Motion)،
/// وتحت كل مرحلة بطاقة الآيات والمصادر. الآيات عبر `QuranAyahText` فقط، والرسوم أصلية متجهية (docs/native/ASSETS_LICENSES.md).
struct ExplainerTemplate: View {
    let data: ExplainerData
    @State private var index = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let repo = MushafRepository(bundle: .main)

    private var stage: ExplainerStageData { data.stages[min(index, data.stages.count - 1)] }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                SunnahGeometricHeader(title: data.title)
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
                    ProgressView(value: Double(index + 1), total: Double(data.stages.count))
                        .tint(Sunnah.Colors.primary)
                        .accessibilityLabel("المرحلة \((index + 1).arabicDigits) من \(data.stages.count.arabicDigits)")
                    stageBody
                        .id(stage.id)
                        .transition(reduceMotion ? .opacity : .asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity), removal: .opacity))
                    SunnahStepper(index: $index, count: data.stages.count, previousTitle: "المرحلة السابقة", nextTitle: "المرحلة التالية")
                    if let note = data.scopeNote { SunnahArabicText(note, style: .reading).foregroundStyle(Sunnah.Colors.textSecondary) }
                }
                .padding(.horizontal, Sunnah.Spacing.pageX)
                .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: index)
            }
        }
        .background(Sunnah.Colors.bg)
        .bodyTitledNavigation()
        .accessibilityIdentifier("explainer")
        #if DEBUG
        .onAppear { let i = UserDefaults.standard.integer(forKey: "snapshotStage"); if i > 0, i < data.stages.count { index = i } }
        #endif
    }

    private var stageBody: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s4) {
            ExplainerArt(stageID: stage.id).frame(height: 180)
            Text("المرحلة \(stage.order.arabicDigits): \(stage.title)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
            SunnahArabicText(stage.body, style: .reading).foregroundStyle(Sunnah.Colors.textPrimary)
            ForEach(Array((stage.views ?? []).enumerated()), id: \.offset) { _, v in
                SunnahCard {
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                        SunnahArabicText(v.text, style: .reading).foregroundStyle(Sunnah.Colors.textPrimary)
                        Text(v.source.display).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
            }
            if let repo {
                ForEach(stage.ayahRef ?? [], id: \.self) { a in
                    if let r = QuranAyahRange(surah: a.surah, from: a.from, to: a.to) {
                        SunnahCard {
                            VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                                QuranAyahText(range: r, repo: repo, paper: false)
                                if let path = SunnahAyahRange.mushafPath(r.label) {
                                    SunnahValueLink(value: Route.web(path: path)) {
                                        Text(SunnahAyahRange.display(r.label)).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.primary).frame(minHeight: 44)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            SunnahCard {
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                    ForEach(Array((stage.sources ?? []).enumerated()), id: \.offset) { _, s in
                        Text(s.display).font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                }
            }
        }
    }
}

/// شاشة الشرح: تحمّل `explainers.json` وتعرض الأول الموثَّق (واحد الآن: «مراحل خلق الإنسان»).
struct ExplainerScreen: View {
    var body: some View {
        SirahLoadedView(source: SirahSection.File.explainers, adapt: { (rows: [ExplainerData]) in rows.compactMap(\.displayable) }) { rows in
            ExplainerPicker(rows: rows)
        }
    }
}

/// أكثر من شرح موثَّق ⇒ شريط اختيار أعلى الشاشة؛ شرح واحد ⇒ القالب مباشرة.
private struct ExplainerPicker: View {
    let rows: [ExplainerData]
    @State private var selection = 0

    var body: some View {
        if rows.isEmpty {
            EmptyStateView(title: SirahSection.pendingTitle)
        } else if rows.count == 1 {
            ExplainerTemplate(data: rows[0])
        } else {
            VStack(spacing: 0) {
                SunnahChipBar(options: rows.indices.map { .init(id: $0, title: rows[$0].title) }, selection: $selection)
                ExplainerTemplate(data: rows[min(selection, rows.count - 1)]).id(selection)
            }
            #if DEBUG
            .onAppear { if let s = UserDefaults.standard.string(forKey: "snapshotExplainer"), let i = Int(s), rows.indices.contains(i) { selection = i } }
            #endif
        }
    }
}
