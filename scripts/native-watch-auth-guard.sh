#!/usr/bin/env bash
# مراجعة App Store: إذن الإشعارات في الساعة لا يُطلب عند بدء التشغيل؛ بعد لمسة المستخدم فقط (PrayerHomeView → WatchNotifications.enable).
W="$(cd "$(dirname "$0")/.." && pwd)/ios-native/SunnahWatch"
bad=$(grep -rn 'requestAuthorization' "$W" --include='*.swift' | grep -v 'App/WatchNotifications.swift' || true)
[ -z "$bad" ] || { echo "❌ requestAuthorization خارج WatchNotifications:"; echo "$bad"; exit 1; }
grep -qE 'WatchNotifications\.(enable|requestAuthorization)' "$W/App/SunnahWatchApp.swift" && { echo "❌ طلب إذن في بدء تشغيل الساعة (SunnahWatchApp)"; exit 1; }
grep -qE 'requestAuthorization' "$W/App/SunnahWatchApp.swift" && { echo "❌ requestAuthorization في SunnahWatchApp"; exit 1; }
grep -q 'guard isEnabled' "$W/App/WatchNotifications.swift" || { echo "❌ reschedule بلا حارس isEnabled"; exit 1; }
echo "✓ إذن إشعارات الساعة سياقي"
