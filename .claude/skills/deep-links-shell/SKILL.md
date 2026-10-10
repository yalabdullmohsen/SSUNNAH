---
name: deep-links-shell
description: الروابط العميقة (Universal Links) واستقرار غلاف التطبيق على iOS. استخدمها عند تغيير التوجيه أو الروابط أو الإقلاع من إشعار/ودجت.
---

# الروابط العميقة والغلاف

- السكربتات: `scripts/ios-deep-links-certification-matrix.sh` و`scripts/ios-app-shell-stability-matrix.sh` (توثيق صادق: لا تدّعِ دليل جهاز بلا مسار داخل التطبيق).
- كل رابط من الإشعارات والودجات والمشاركة يجب أن يصل لمساره الصحيح في التشغيل البارد والدافئ.
- المسارات القديمة تُحوَّل بـredirects (`reports/legacy-routes-redirects-audit.*`)؛ لا تحذف مسارًا منشورًا دون تحويل.
- الدليل الأصلي يحتاج macOS (Actions `ios-native-macos.yml` أو جهاز)؛ Linux لا يملك المحاكي.
- بعد النشر: `scripts/post-deploy-smoke.ts` على المسارات الحرجة (`reports/critical-routes-http-audit.json`).
