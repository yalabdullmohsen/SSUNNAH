import SwiftUI

/// زر «سُنّة»: ارتفاع 52، زوايا 16، ظل خفيف، اهتزاز لمسي (بديل أزرار iOS الرسمية).
public struct SunnahButton: View {
    public enum Style { case primary, secondary, outline, gold }
    let title: String; let style: Style; let action: () -> Void
    public init(_ title: String, style: Style = .primary, action: @escaping () -> Void) {
        self.title = title; self.style = style; self.action = action
    }
    public var body: some View {
        Button {
            Sunnah.Haptics.select(); action()
        } label: {
            Text(title).frame(maxWidth: .infinity)
        }
        .buttonStyle(SunnahButtonStyle(style))
    }
}

public struct SunnahButtonStyle: ButtonStyle {
    let style: SunnahButton.Style
    public init(_ style: SunnahButton.Style = .primary) { self.style = style }
    public func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: Sunnah.Radius.small, style: .continuous)
        configuration.label
            .font(Sunnah.Typography.cardTitle)
            .frame(minHeight: Sunnah.Spacing.buttonHeight)
            .padding(.horizontal, Sunnah.Spacing.s5)
            .foregroundStyle(foreground)
            .background(background, in: shape)
            .overlay { if style == .outline { shape.stroke(Sunnah.Colors.primary, lineWidth: 1.5) } }
            .shadow(color: style == .primary ? Sunnah.Colors.primary.opacity(0.25) : .clear, radius: 8, y: 6)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .contentShape(shape)
    }
    private var foreground: Color {
        switch style {
        case .primary: return Sunnah.Colors.textOnPrimary
        case .gold: return Sunnah.Colors.gold
        default: return Sunnah.Colors.primary
        }
    }
    private var background: Color {
        switch style {
        case .primary: return Sunnah.Colors.primary
        case .secondary: return Sunnah.Colors.primarySoft
        case .outline: return Sunnah.Colors.surface
        case .gold: return Sunnah.Colors.surface2
        }
    }
}

/// زر دائري عائم 56.
public struct SunnahFAB: View {
    let systemImage: String; let label: String; let action: () -> Void
    public init(systemImage: String, label: String, action: @escaping () -> Void) {
        self.systemImage = systemImage; self.label = label; self.action = action
    }
    public var body: some View {
        Button { Sunnah.Haptics.select(); action() } label: {
            Image(systemName: systemImage).font(.system(size: 20, weight: .bold))
                .frame(width: 56, height: 56)
                .foregroundStyle(Sunnah.Colors.textOnPrimary)
                .background(Sunnah.Colors.primary, in: Circle())
                .shadow(color: Sunnah.Colors.primary.opacity(0.3), radius: 10, y: 8)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
    }
}

/// مبدّل أقسام (بديل Segmented): خلفية بيج والمختار أبيض.
public struct SunnahSegmented<ID: Hashable>: View {
    let items: [(id: ID, title: String)]
    @Binding var selection: ID
    public init(_ items: [(id: ID, title: String)], selection: Binding<ID>) {
        self.items = items; self._selection = selection
    }
    public var body: some View {
        HStack(spacing: 4) {
            ForEach(items, id: \.id) { item in
                let on = item.id == selection
                Button {
                    Sunnah.Haptics.select(); sunnahAnimate { selection = item.id }
                } label: {
                    Text(item.title).font(Sunnah.Typography.tag.weight(.heavy)).frame(maxWidth: .infinity, minHeight: 42)
                        .foregroundStyle(on ? Sunnah.Colors.primary : Sunnah.Colors.textSecondary)
                        .background(on ? Sunnah.Colors.surface : .clear, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .shadow(color: on ? .black.opacity(0.08) : .clear, radius: 4, y: 2)
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(on ? .isSelected : [])
            }
        }
        .padding(4)
        .background(Sunnah.Colors.beige, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

/// مفتاح أخضر 56×32.
public struct SunnahToggleStyle: ToggleStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View {
        HStack {
            configuration.label
            Spacer(minLength: Sunnah.Spacing.s3)
            Button {
                Sunnah.Haptics.select(); sunnahAnimate { configuration.isOn.toggle() }
            } label: {
                ZStack(alignment: configuration.isOn ? .trailing : .leading) {
                    Capsule().fill(configuration.isOn ? Sunnah.Colors.primary : Sunnah.Colors.switchOff).frame(width: 56, height: 32)
                    Circle().fill(.white).frame(width: 26, height: 26).padding(3)
                }
                .environment(\.layoutDirection, .leftToRight)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(configuration.isOn ? "مفعّل" : "معطّل")
        }
    }
}
