# PR W4 — Widget Center Form Authority and Product Polish

TASK_CLASSIFICATION: SHARED_PLATFORM_WITH_IOS_PRODUCT_UI

WEB_IMPACT: Widget Center controls use Form Authority; honest platform copy

IOS_APPLICATION_IMPACT: same WebView surface; no WidgetKit claim from Web

APP_STORE_PRODUCT_IMPACT: none (Build 55 unchanged)

SHARED_PLATFORM_IMPACT: Form Authority + platform messaging

## Required outputs

WIDGET_CENTER_FORM_AUTHORITY_PASS

RAW_WIDGET_CENTER_INTERACTIONS_ZERO

WIDGET_CENTER_PRODUCT_POLISH_PASS

NO_MISLEADING_PLATFORM_COPY

## Controls

- Button → `@/components/ui/button`
- Select → `@/components/ui/select`
- Input → `@/components/ui/input` with `min-h-11 text-base` (≥16px)
- Search → design-system `SearchInput`
- Toggle → `SettingsToggleRow`
- No raw `<input>` / `<select>` / `<button>` in Widget Center source

## Platform copy

- Web does not render WidgetKit.
- Native widgets require a future iOS App Store update.
- In-app previews are not live Home Screen / Lock Screen data.
