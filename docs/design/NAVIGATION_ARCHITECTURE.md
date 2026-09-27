# Navigation Architecture (target)

## Canonical destinations (product)

Bottom: الرئيسية · القرآن · الصلاة · الدروس · الأقسام — confirm against live policy before changing labels.

## Drawer groups (target Wave 2)

- القرآن والتلاوة  
- التعلم  
- العلوم الشرعية  
- العبادة والأدوات  
- المعرفة  

Collapsible; no duplicate destinations unless explicit shortcut.

## Single route source

Must feed: drawer, bottom nav, homepage, search, breadcrumbs, section cards.  
Today: `routes.ts` + assorted nav configs — unify in Wave 2.

## Floating controls

Remove covering side arrows; ScrollToTop only after ≥720px meaningful scroll; safe-area aware.
