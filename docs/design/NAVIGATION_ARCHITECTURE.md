# Navigation Architecture (Wave 2)

## Canonical destinations (product)

Bottom (locked order): مركز القرآن · الدروس · الرئيسية · الصلاة · الأقسام  
Source: `navFor("bottom")` ← `config/navigation.ts` ← section registry.

## Drawer groups (implemented)

| Group | Typical destinations |
|---|---|
| القرآن والتلاوة | المصحف · مركز القرآن · التفسير · علوم القرآن · اختصار متابعة القراءة |
| التعلم | الدروس · التقدّم · الأسئلة |
| العلوم الشرعية | العقيدة · الحديث · الفقه · السيرة · التاريخ |
| العبادة والأدوات | الصلاة · الأذكار · القبلة · التسبيح |
| المعرفة | الفوائد · الإعجاز · اكتشف الإسلام · المعجم · الأقسام |
| الحساب | من سجل `ACCOUNT_DRAWER` |

Groups are **collapsible** (`DrawerFromRegistry` + `aria-expanded`). Default open: group matching the active path, else القرآن والتلاوة.

## Single route source

| Surface | API |
|---|---|
| Bottom / drawer / home cards | `navFor(surface)` |
| Drawer grouping | `SIDEBAR_NAV_GROUPS` (`sidebar-nav.ts`) |
| Canonical href helper | `buildCanonicalPublicHref(idOrPath)` |
| Section metadata | `sections.registry.ts` |

Do not invent parallel nav arrays for product destinations.

## Floating controls

- Legacy circular top FAB: `FLOATING_BACK_DISABLED` in `FloatingBackButton.tsx`.
- Unified back host: bottom-edge, clearance via `--global-back-*`.
- ScrollToTop: hidden until `scrollY > 720`, modal-aware, reduced-motion, safe-area attributes.

## Safe areas

Bottom nav and FABs use `--inset-bottom` / `--bottom-nav-height`. Content clearance remains on `#main-content` / page shells.
