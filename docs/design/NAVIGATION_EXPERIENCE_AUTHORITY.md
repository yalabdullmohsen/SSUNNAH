# NAVIGATION EXPERIENCE / IA — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY** |
| Date | 2026-10-03 |
| Exit | `NAVIGATION_EXPERIENCE_UNIFIED` |
| Related | `NAVIGATION_AUTHORITY_MAP.md` · `config/navigation.ts` · `config/sections.registry` |

Predictable information architecture — one journey language for public product.

## Hierarchy

| Level | Owner | Examples |
|---|---|---|
| App chrome | BottomNavBar · NavBar | الرئيسية · القرآن · الدروس · الصلاة · الأقسام |
| Primary routes | `primaryNav` | `/` `/lessons` `/quran-hub` `/adhkar` `/prayer-times` `/fiqh` `/search` |
| Secondary discovery | `secondaryNav` · sections registry | علماء · حديث · سيرة · أنبياء · أقسام |
| Footer groups | `footerNav` | علوم · قرآن · تعلّم · سياسات |
| In-section tabs | ContentTabs (tab authority) | أقسام الصفحة داخل المسار |
| Admin | admin-v3 nav | SPECIAL_CASE — خارج رحلة المنتج العامة |

## Naming rules

- Route path: kebab-case Arabic product slugs already in registry (`/tarikh-islami`, `/quran-hub`)
- Labels: Arabic product copy from registry — no page-local rename of chrome items
- Sections: one id in `sections.registry` → one href
- Categories: hub pages organize children; do not fork a second category tree in CSS

## Eliminate / avoid

| Anti-pattern | Resolution |
|---|---|
| Duplicate route concepts (two hubs for same intent) | Prefer registry canonical href |
| Competing journeys (drawer vs bottom disagree) | Both consume `navFor` / registry |
| Conflicting active indicators | `get-active-tab` + `nav-active` only |
| Settings vs account split labels | SettingsList / NavigationList |

## Mushaf / Admin

Held as SPECIAL_CASE — do not flatten into public IA.

## Gates

`test:tab-nav-authority`
