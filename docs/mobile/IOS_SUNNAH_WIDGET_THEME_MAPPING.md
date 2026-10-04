# Sunnah Widget native theme mapping

CSS variables are not imported into Swift. This table maps the shared Sunnah design authority to `SunnahWidgetTheme`.

| Authority | Native SwiftUI |
|-----------|----------------|
| Emerald identity | `SunnahBrandColors.emerald` / `emeraldDeep` / `emeraldDark` |
| Restrained gold accent | `SunnahBrandColors.gold` |
| Primary Arabic text | `Color.white` |
| Secondary Arabic text | `Color.white.opacity(0.82)` |
| Base surface | `emeraldDark` |
| Raised surface | `Color.white.opacity(0.10)` |
| Focus / selected | emerald 0.45 / gold 0.22 |
| Warning | warm amber fill |
| Error | deep red fill |
| Info | emerald |
| Spacing | 4 / 8 / 12 / 16 |
| Radius | 8 / 12 |
| Icons | 12 / 16 |
| Typography | caption / subheadline / headline / monospaced countdown |

Modes: full color Home Screen gradient, system Light/Dark accessory surfaces, iOS 17 tinted/vibrant via system rendering, StandBy uses the same high-contrast system families, RTL via `layoutDirection = .rightToLeft`.
