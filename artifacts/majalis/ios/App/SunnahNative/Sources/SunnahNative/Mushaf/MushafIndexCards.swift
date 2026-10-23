import SwiftUI

/// شارة مزخرفة (مربعان متداخلان بزاوية 45°) يوضع فيها رقم السورة أو الجزء.
struct MushafOrnamentBadge: View {
    let number: Int
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8, style: .continuous).fill(Sunnah.Colors.primarySoft)
            RoundedRectangle(cornerRadius: 8, style: .continuous).fill(Sunnah.Colors.primarySoft)
                .rotationEffect(.degrees(45))
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(Sunnah.Colors.goldDeco, lineWidth: 1).rotationEffect(.degrees(45)).padding(4)
            Text(number.arabicDigits)
                .font(AppearancePrefs.ui(.bold, 15, .subheadline))
                .foregroundStyle(Sunnah.Colors.primaryStrong)
                .minimumScaleFactor(0.6).lineLimit(1)
        }
        .frame(width: 48, height: 48)
        .accessibilityHidden(true)
    }
}

/// بطاقة سورة: شارة الرقم، الاسم، مكية/مدنية بأيقونة، عدد الآيات والصفحة.
struct MushafSurahCard: View {
    let surah: MushafSurah
    let action: () -> Void
    private var makki: Bool { surah.place == "makkah" }
    var body: some View {
        Button(action: action) {
            HStack(spacing: Sunnah.Spacing.s3) {
                MushafOrnamentBadge(number: surah.id)
                VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                    Text(surah.name).font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                    HStack(spacing: Sunnah.Spacing.s2) {
                        Label(makki ? "مكية" : "مدنية", systemImage: makki ? "moon" : "building.columns")
                        Text("·")
                        Text(ArabicCount.label(surah.ayahs, one: "آية واحدة", two: "آيتان", few: "آيات", many: "آية", genitive: "آية"))
                    }
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                }
                Spacer(minLength: Sunnah.Spacing.s2)
                Text("ص \(surah.firstPage.arabicDigits)")
                    .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primaryStrong)
                    .padding(.horizontal, Sunnah.Spacing.s3).frame(minHeight: 32)
                    .background(Capsule().fill(Sunnah.Colors.primarySoft))
            }
            .padding(Sunnah.Spacing.s3)
            .frame(minHeight: Sunnah.Spacing.touch + Sunnah.Spacing.s4)
            .background(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).fill(Sunnah.Colors.surface))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("سورة \(surah.name)، \(makki ? "مكية" : "مدنية")، \(ArabicCount.label(surah.ayahs, one: "آية واحدة", two: "آيتان", few: "آيات", many: "آية", genitive: "آية"))، صفحة \(surah.firstPage.arabicDigits)")
        .accessibilityAddTraits(.isButton)
        .accessibilityIdentifier("mushaf.index.surah.\(surah.id)")
    }
}

/// بطاقة جزء: رقم الجزء، أحزابه، وأرباعه الثمانية كرقائق تنقل إلى صفحة كل ربع.
struct MushafJuzCard: View {
    let juz: Int
    let page: Int
    let quarterPages: [Int]
    let open: (Int) -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: Sunnah.Spacing.s3) {
            Button { open(page) } label: {
                HStack(spacing: Sunnah.Spacing.s3) {
                    MushafOrnamentBadge(number: juz)
                    VStack(alignment: .leading, spacing: Sunnah.Spacing.s1) {
                        Text("الجزء \(juz.arabicDigits)").font(Sunnah.Typography.cardTitle).foregroundStyle(Sunnah.Colors.textPrimary)
                        Text("الحزبان \((juz * 2 - 1).arabicDigits) و\((juz * 2).arabicDigits)")
                            .font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.textSecondary)
                    }
                    Spacer(minLength: Sunnah.Spacing.s2)
                    Text("ص \(page.arabicDigits)").font(Sunnah.Typography.secondary).foregroundStyle(Sunnah.Colors.primaryStrong)
                }
                .frame(minHeight: Sunnah.Spacing.touch).contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("mushaf.index.juz.\(juz)")
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Sunnah.Spacing.s2), count: 4), spacing: Sunnah.Spacing.s2) {
                ForEach(Array(quarterPages.enumerated()), id: \.offset) { k, p in
                    Button { open(p) } label: {
                        VStack(spacing: 2) {
                            Text(k % 4 == 0 ? "حزب" : ["", "ربع", "نصف", "ثلاثة أرباع"][k % 4]).font(AppearancePrefs.ui(.regular, 11, .caption2))
                            Text("ص \(p.arabicDigits)").font(Sunnah.Typography.tag)
                        }
                        .foregroundStyle(k % 4 == 0 ? Sunnah.Colors.primaryStrong : Sunnah.Colors.textSecondary)
                        .frame(maxWidth: .infinity, minHeight: Sunnah.Spacing.touch)
                        .background(RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(k % 4 == 0 ? Sunnah.Colors.primarySoft : Sunnah.Colors.surface2))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("\(k % 4 == 0 ? "الحزب" : "الربع") صفحة \(p.arabicDigits)")
                }
            }
        }
        .padding(Sunnah.Spacing.s3)
        .background(RoundedRectangle(cornerRadius: Sunnah.Radius.card, style: .continuous).fill(Sunnah.Colors.surface))
    }
}

/// حقل بحث فوري في السور (بالاسم أو الرقم).
struct MushafIndexSearchField: View {
    @Binding var text: String
    var body: some View {
        HStack(spacing: Sunnah.Spacing.s2) {
            Image(systemName: "magnifyingglass").foregroundStyle(Sunnah.Colors.textSecondary)
            TextField("ابحث باسم السورة أو رقمها", text: $text)
                .textInputAutocapitalization(.never).autocorrectionDisabled()
                .accessibilityIdentifier("mushaf.index.search")
            if !text.isEmpty {
                Button { text = "" } label: { Image(systemName: "xmark.circle.fill").foregroundStyle(Sunnah.Colors.textSecondary) }
                    .buttonStyle(.plain).accessibilityLabel("مسح البحث")
            }
        }
        .padding(.horizontal, Sunnah.Spacing.s3).frame(minHeight: Sunnah.Spacing.touch)
        .background(Capsule().fill(Sunnah.Colors.surface2))
    }
}
