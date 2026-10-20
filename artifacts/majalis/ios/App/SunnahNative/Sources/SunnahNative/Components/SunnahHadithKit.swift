import SwiftUI

/// درجة الحديث وألوانها: صحيح أخضر فاتح، ضعيف أحمر فاتح، موضوع برتقالي فاتح (تباين الحبر ≥ 4.5 في الوضعين).
enum HadithGrade: String, CaseIterable {
    case sahih, daif, mawdu

    init(authenticityClass: String) { self = HadithGrade(rawValue: authenticityClass) ?? .sahih }

    var label: String {
        switch self { case .sahih: return "صحيح"; case .daif: return "ضعيف"; case .mawdu: return "موضوع" }
    }
    var symbol: String {
        switch self { case .sahih: return "checkmark.seal.fill"; case .daif: return "exclamationmark.triangle.fill"; case .mawdu: return "xmark.octagon.fill" }
    }
    var background: Color {
        switch self { case .sahih: return Sunnah.Colors.gradeSahihBg; case .daif: return Sunnah.Colors.gradeDaifBg; case .mawdu: return Sunnah.Colors.gradeMawduBg }
    }
    var ink: Color {
        switch self { case .sahih: return Sunnah.Colors.gradeSahihInk; case .daif: return Sunnah.Colors.gradeDaifInk; case .mawdu: return Sunnah.Colors.gradeMawduInk }
    }
}

/// شارة الدرجة: كبسولة بلون الدرجة.
struct HadithGradeBadge: View {
    let grade: HadithGrade
    var text: String? = nil
    var body: some View {
        Label(text ?? grade.label, systemImage: grade.symbol)
            .font(Sunnah.Typography.tag).foregroundStyle(grade.ink)
            .padding(.horizontal, Sunnah.Spacing.s3).padding(.vertical, 5)
            .background(grade.background, in: Capsule())
            .overlay(Capsule().stroke(grade.ink.opacity(0.25), lineWidth: 1))
            .accessibilityElement(children: .combine)
    }
}

/// شارة معلومة صغيرة (الراوي/المصدر/المحدّث).
struct HadithMetaChip: View {
    let symbol: String; let text: String
    var body: some View {
        Label(text.arabicDigits, systemImage: symbol)
            .font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textPrimary)
            .multilineTextAlignment(.leading)
            .padding(.horizontal, Sunnah.Spacing.s3).padding(.vertical, 6)
            .background(Sunnah.Colors.surface2, in: Capsule())
            .accessibilityElement(children: .combine)
    }
}

/// تخطيط يلفّ الشارات على أسطر متتالية بلا فراغات.
struct HadithFlow: Layout {
    var spacing: CGFloat = Sunnah.Spacing.s2
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(width: proposal.width ?? .infinity, subviews: subviews).size
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        for (i, f) in arrange(width: bounds.width, subviews: subviews).frames.enumerated() {
            subviews[i].place(at: CGPoint(x: bounds.minX + f.minX, y: bounds.minY + f.minY), proposal: ProposedViewSize(f.size))
        }
    }
    private func arrange(width: CGFloat, subviews: Subviews) -> (frames: [CGRect], size: CGSize) {
        var frames: [CGRect] = []; var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0, maxW: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.init(width: width, height: nil))
            if x > 0 && x + s.width > width { x = 0; y += rowH + spacing; rowH = 0 }
            frames.append(CGRect(origin: CGPoint(x: x, y: y), size: s))
            x += s.width + spacing; rowH = max(rowH, s.height); maxW = max(maxW, x - spacing)
        }
        return (frames, CGSize(width: maxW, height: y + rowH))
    }
}

extension View {
    /// صف حديث ملوّن بدرجته (بديل `sunnahStackRow` للقوائم التي تعرض أحاديث).
    func hadithGradeRow(_ grade: HadithGrade) -> some View {
        self.frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 14).padding(.vertical, 12)
            .background(grade.background, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(grade.ink.opacity(0.18), lineWidth: 1))
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.vertical, 5)
    }
}

/// محتوى صف حديث: شارة الدرجة + العنوان + سطر ثانوي.
struct HadithRowLabel: View {
    let grade: HadithGrade; let title: String; let subtitle: String?; var badgeText: String? = nil
    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
            HadithGradeBadge(grade: grade, text: badgeText)
            Text(title).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                .multilineTextAlignment(.leading)
            if let subtitle, !subtitle.isEmpty {
                Text(subtitle.arabicDigits).font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    .multilineTextAlignment(.leading)
            }
        }
    }
}

/// بطاقة كبيرة في صفحة المحور: أيقونة الدرجة + اسمها + عدد الأحاديث.
struct HadithHubCard: View {
    let grade: HadithGrade; let title: String; let count: Int
    var body: some View {
        HStack(spacing: Sunnah.Spacing.s4) {
            Image(systemName: grade.symbol).font(.system(size: 26, weight: .semibold)).foregroundStyle(grade.ink)
                .frame(width: 56, height: 56)
                .background(Sunnah.Colors.surface.opacity(0.7), in: Circle())
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(Sunnah.Typography.sectionTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                Text("\(count.arabicDigits) حديث").font(Sunnah.Typography.secondary).foregroundStyle(grade.ink)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.forward").font(.system(size: 14, weight: .bold)).foregroundStyle(grade.ink).accessibilityHidden(true)
        }
        .padding(Sunnah.Spacing.s5)
        .frame(maxWidth: .infinity, minHeight: 112, alignment: .leading)
        .background(grade.background, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 28, style: .continuous).stroke(grade.ink.opacity(0.2), lineWidth: 1))
        .accessibilityElement(children: .combine)
    }
}

/// صفحة الحديث المشتركة: النص بخط Amiri في بطاقة مركزية، ثم شارات الراوي والمصدر والدرجة، ثم الفائدة، بلا فراغات.
struct HadithDetailLayout<Top: View, Actions: View>: View {
    let grade: HadithGrade
    let text: String
    var narrator: String?
    var source: String?
    var gradeText: String?
    var muhaddith: String?
    var chapter: String?
    var explanation: String?
    let key: String
    let footerTitle: String; let footerID: String; let footerSection: String; let footerSource: String?
    @ViewBuilder var top: () -> Top
    @ViewBuilder var actions: () -> Actions

    var body: some View {
        ScrollView {
            VStack(spacing: Sunnah.Spacing.s3) {
                top()
                VStack(spacing: Sunnah.Spacing.s3) {
                    HadithGradeBadge(grade: grade, text: gradeText)
                    SunnahArabicText(text, style: .amiri)
                        .foregroundStyle(Sunnah.Colors.textPrimary).multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .padding(Sunnah.Spacing.s5)
                .frame(maxWidth: .infinity)
                .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 28, style: .continuous).stroke(grade.ink.opacity(0.25), lineWidth: 1))
                .sunnahElevation()

                HadithFlow {
                    if let narrator, !narrator.isEmpty { HadithMetaChip(symbol: "person.fill", text: narrator) }
                    if let source, !source.isEmpty { HadithMetaChip(symbol: "book.closed.fill", text: source) }
                    if let muhaddith, !muhaddith.isEmpty { HadithMetaChip(symbol: "checkmark.shield.fill", text: "المحدّث: \(muhaddith)") }
                    if let chapter, !chapter.isEmpty { HadithMetaChip(symbol: "list.bullet", text: chapter) }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                if let explanation, !explanation.isEmpty {
                    SunnahCard {
                        VStack(alignment: .leading, spacing: Sunnah.Spacing.s2) {
                            Label("الفائدة", systemImage: "lightbulb.fill").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.primary)
                            SunnahSectionedMarkdown(explanation, key: key, style: .body).foregroundStyle(Sunnah.Colors.textPrimary)
                        }
                    }
                }
                actions()
                SunnahContentFooter(title: footerTitle, id: footerID, section: footerSection, source: footerSource, inset: false, sensitive: true)
            }
            .padding(.horizontal, Sunnah.Spacing.pageX).padding(.top, Sunnah.Spacing.s3)
        }
        .sunnahReadableWidth().background(Sunnah.Colors.bg)
    }
}
