# الدَّين البصري — الموجتان V1/V2 (المرحلة C)

القياس: `node scripts/visual-system-inventory.mjs` (من `artifacts/majalis`). البوابة: `pnpm run test:visual-debt-v1`.

## قبل / بعد (أثر هذا التغيير وحده)

| المقياس | قبل | بعد | الفرق |
|---|---:|---:|---:|
| hexInCss | 5546 | 5235 | −311 |
| borderRadiusPxDecls | 391 | 336 | −55 |
| zIndexRawDecls | 255 | 246 | −9 |
| important | 4720 | 4715 | −5 |
| boxShadowDecls | 982 | 982 | 0 |
| rgbHslInCss | 1959 | 1959 | 0 |
| inlineColorStyleMatches | 38 | 38 | 0 |

(عمل متزامن آخر أضاف +3 `!important` فصار المقاس العام 4718، ولم يغيّر بقية المقاييس.)

## القاعدة المتّبعة: بلا أي تغيير مرئي

- **لون حرفي ← توكن موجود** فقط إذا كانت قيمته المحسوبة **مطابقة حرفيًا** في كل سياق ثيم تنطبق فيه القاعدة:
  - القواعد العامة (فاتح + داكن): توكن ثابت عبر الثيمين، أي أن **كل** تعريفاته في المستودع (CSS و`index.html`) تعطي القيمة نفسها.
  - القواعد المقيّدة بالداكن من جذر `html` (`html.dark` أو `html[data-theme="dark"]` أو `:root…`): قيمة التوكن في الداكن تساوي الحرف. التعريف الداكن على الجذر بلا طبقة وبخصوصية أعلى من تعريف `:root` الفاتح، ولا يوجد تعريف مخصّص لعنصر بعينه يخالفه.
  - التوافر: التعريف موجود في `:root` لملف متزامن في `main.tsx`، أو في الملف نفسه.
  - النطاق: `--mj-*` و`--sf-*` فقط، إضافة إلى توكنات الملف المحلية.
  - لا استبدال داخل `url()` ولا التعليقات ولا `@property` ولا `@font-face` ولا `::backdrop` ولا `::selection` ولا `::-webkit-scrollbar`. ولا يُستبدل حرف في تعريف متغيّر مخصّص إلا بتوكن كل تعريفاته متزامنة، منعًا للحلقات.
- **نصف القطر** `12/16/20/24/999px` ← `--sf-radius-xs/sm/md/lg/pill`. ويُستبدل الإعلان فقط إذا لم يبقَ فيه أي px.
- **z-index** `0/400/500/10040/10050` ← `--z-base/modal/toast/overlay-drawer/overlay-sheet`، وكلها قيم مطابقة.
- **`!important`**: حُذف التكرار الحرفي الأسبق فقط، أي التصريح نفسه بالمحدِّد نفسه وفي السياق نفسه وفي الملف نفسه، لأن التكرار اللاحق يفوز دائمًا. المواضع: `final-release.css` (3) و`green-surface-system.css` (كتلتان)، إضافة إلى كتلة مكررة في `index-deferred-pages.css` وتعريفين مكررين في `dark-mode-recovery.css`.
- لم يُضف أي توكن جديد. ولم تُمَسّ ملفات الإقلاع المتزامنة ولا ملفات المصحف/القرآن ولا `design-tokens.css`.
- بقيت حرفية القيم التي تثبّتها بوابات قائمة، مثل `--dm-text-primary` و`--dm-accent-gold` و`--text-primary` (dark-design-system) و`.section-lobby__chip.is-active` و`.global-back-btn` و`.ph2__title::after`.

## الملفات (27 ملف CSS)

admin، dark-mode-recovery، dark-mode-surfaces، pages/app-shell-v2، app-state-v2، sunnah-identity-luxury-night، pages/luxury-night-v2، visual-redesign-v2-tokens، pages/knowledge-dashboards-v2، pages/lessons-sections-v2، pages/lessons، islamic-landmarks، mind-map، pages/stories-seerah-v2، dark-design-system، nations، components/sections/section-cards، components/home-brand-title، brand-v4-contrast-fixes، final-release، index-deferred-pages، premium-dark-refine، sunnah-visual-language، visual-layer-contrast-fix، components/lobby/section-lobby، majlisilm-shell، green-surface-system.

## المرشّحون التاليون

- sins-rights و learn-legal-v2 و adhan-settings و worship-history-v2 و profile-hub-v2: فيها نحو 19 hex و44 radius آمنة، وأُجّلت لحدّ 400 سطر حذف.
- `card-system.css`: فيه كتلة مكررة تحمل `!important` ×2، وأُجّل لأن الملف قيد التعديل في مسار آخر.
