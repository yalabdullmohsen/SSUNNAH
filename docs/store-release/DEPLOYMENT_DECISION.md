# Deployment Decision — docs vs behavior

**Conflict:** `DEPLOYMENT.md` describes production/manual paths; `vercel.json` + workflows + AGENTS describe **main → automatic production**.

## Options

| Option | Behavior | Auto-merge | Rollback | Release approval |
|---|---|---|---|---|
| A | main → automatic production (current machine behavior for majalis) | Fast | Revert commit / redeploy previous | Implicit via merge gates |
| B | main → preview; `production` branch → manual live | Slower | Promote/demote branch | Explicit promote |

**Agent posture:** do **not** change Production Branch without owner approval.  
**Store builds** may proceed from a pinned commit regardless.  
**Status:** **OWNER_ACTION** OWN-08.

## قرار المالك 2026-10-11 — بوابة البناء لفرع native-app
- لا workflow مدفوع (macos) يعمل تلقائيًا: `ios-native-macos.yml` و`ios-sunnah-native.yml` و`ios-testflight-deploy.yml` بـ`workflow_dispatch` فقط (أُزيل `schedule` أيضًا).
- `ios-capacitor-gates.yml` يتخطى فروع native-app/native-section/n2/n3/n4/claude وPRs الموجّهة لـnative-app، ويبقى على main.
- البوابة الوحيدة لـnative-app هي `scripts/native-loop.sh` المحلي؛ تتجاهل الجلسات السحابية فحوص GitHub الفاشلة على فروع الأصلي.
