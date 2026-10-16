import SwiftUI

/// عنوان قسم موحّد للقوائم المضغوطة (الدرج…): خط مقروء ولون أخضر بتباين ≥ 4.5:1 فاتحًا وداكنًا، ومسافة ثابتة قبل كل قسم.
public struct SunnahSectionLabel: View {
    let title: String
    public init(_ title: String) { self.title = title }
    public var body: some View {
        Text(title)
            .font(Sunnah.Typography.cardTitle)
            .foregroundStyle(Sunnah.Colors.primary)
            .padding(.horizontal, Sunnah.Spacing.s2)
            .padding(.top, Sunnah.Spacing.s5)
            .padding(.bottom, Sunnah.Spacing.s2)
            .frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityAddTraits(.isHeader)
    }
}

/// بطاقة واحدة للقسم تضم صفوفه بفواصل رفيعة (لا بطاقة لكل عنصر).
public struct SunnahGroupedCard<Item: Identifiable, Row: View>: View {
    let items: [Item]; let row: (Item) -> Row
    public init(_ items: [Item], @ViewBuilder row: @escaping (Item) -> Row) { self.items = items; self.row = row }
    public var body: some View {
        VStack(spacing: 0) {
            ForEach(Array(items.enumerated()), id: \.element.id) { i, item in
                if i > 0 { Divider().overlay(Sunnah.Colors.border).padding(.leading, 52) }
                row(item)
            }
        }
        .background(Sunnah.Colors.surface, in: RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous).stroke(Sunnah.Colors.border, lineWidth: Sunnah.Spacing.hairline))
        .clipShape(RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous))
    }
}

/// صف قائمة مضغوط: ارتفاع ≥ 52pt (ينمو مع Dynamic Type)، أيقونة، عنوان، شيفرون في الجهة المقابلة.
/// المحدَّد (الصفحة الحالية): خلفية خضراء خفيفة وخط أثقل ولون أخضر داكن، لا تعتيم.
public struct SunnahCompactRow: View {
    let title: String; let icon: String; let selected: Bool
    public static let minHeight: CGFloat = 52
    public init(title: String, icon: String, selected: Bool = false) { self.title = title; self.icon = icon; self.selected = selected }
    public var body: some View {
        HStack(spacing: Sunnah.Spacing.s3) {
            Image(systemName: icon).font(.system(size: 18, weight: .semibold)).frame(width: 28)
                .foregroundStyle(Sunnah.Colors.primary)
            Text(title)
                .font(selected ? Sunnah.Typography.cardTitle : Sunnah.Typography.body)
                .fontWeight(selected ? .bold : .regular)
                .foregroundStyle(selected ? Sunnah.Colors.primary : Sunnah.Colors.textPrimary)
            Spacer(minLength: Sunnah.Spacing.s2)
            Image(systemName: "chevron.forward").font(Sunnah.Typography.tag).foregroundStyle(Sunnah.Colors.textSecondary)
        }
        .padding(.horizontal, Sunnah.Spacing.s3)
        .frame(minHeight: Self.minHeight)
        .background(selected ? Sunnah.Colors.primarySoft : Color.clear)
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(selected ? .isSelected : [])
    }
}

/// شكل لوحة جانبية بزوايا مستديرة على الحافة الداخلية فقط (البعيدة عن حافة الشاشة).
public struct SunnahSidePanelShape: Shape {
    public var radius: CGFloat
    public var roundsLeft: Bool
    public init(radius: CGFloat = Sunnah.Radius.hero, roundsLeft: Bool) { self.radius = radius; self.roundsLeft = roundsLeft }
    public func path(in r: CGRect) -> Path {
        var p = Path()
        let k = min(radius, r.width / 2, r.height / 2)
        let tl = roundsLeft ? k : 0, bl = roundsLeft ? k : 0, tr = roundsLeft ? 0 : k, br = roundsLeft ? 0 : k
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
