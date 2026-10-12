#!/usr/bin/env bash
# ضمان قرار المالك: كل الصفحات SwiftUI أصلية. يفشل إن وُجد في ios-native/ (خارج التعليقات):
# WKWebView · SFSafariViewController · WebView · Capacitor · أو فتح رابط الموقع (ssunnah.com / majlisilm.com) لعرض صفحة.
# المسموح: فتح رابط خارجي صريح (مشاركة/سياسة الخصوصية/اتصال) لغير نطاقات الموقع.
cd "$(dirname "$0")/.." || exit 1
BAD=$(find ios-native -name '*.swift' -not -path '*/.build/*' -not -path '*/SunnahApp.xcodeproj/*' -print0 \
  | xargs -0 grep -nE 'WKWebView|SFSafariViewController|WebView|Capacitor|(UIApplication\.shared\.open|openURL|\bLink)\(.*(ssunnah\.com|majlisilm\.com)|(ssunnah\.com|majlisilm\.com).*(UIApplication\.shared\.open|openURL)' \
  | grep -vE '^[^:]+:[0-9]+:[[:space:]]*//' | grep -vE '^[^:]+:[0-9]+:[^"]*///?[^"]*$')
if [ -n "$BAD" ]; then echo "$BAD" | head -20; echo "✗ native-webview-guard: ويب/Capacitor/فتح رابط الموقع في ios-native"; exit 1; fi
echo "✓ native-webview-guard: لا WKWebView ولا SFSafariViewController ولا WebView ولا Capacitor ولا فتح رابط الموقع"
