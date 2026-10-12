#!/usr/bin/env bash
# حارس الإعدادات: Info.plist لا يحمل عنوانًا مؤقتًا أو مغايرًا، والافتراضيات في Swift هي الصحيحة.
set -euo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"
P="$R/ios-native/SunnahApp/Info.plist"
S="$R/artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Data/RemoteTransport.swift"
URL="https://ngmvmlulzacrlicuagyp.supabase.co"
pb() { /usr/libexec/PlistBuddy -c "Print :$1" "$P" 2>/dev/null || echo ""; }
if grep -q "offline\.invalid" "$P"; then echo "Info.plist: عنوان مؤقت (offline.invalid)"; exit 1; fi
v="$(pb SUPABASE_URL)"; [ -z "$v" ] || [ "$v" = "$URL" ] || { echo "Info.plist: SUPABASE_URL تغيّر"; exit 1; }
v="$(pb VERCEL_API_BASE_URL)"; [ -z "$v" ] || [ "$v" = "https://www.ssunnah.com" ] || { echo "Info.plist: VERCEL_API_BASE_URL تغيّر"; exit 1; }
v="$(pb SUPABASE_ANON_KEY)"; [ -z "$v" ] || [[ "$v" == eyJ*.*.* ]] || { echo "Info.plist: SUPABASE_ANON_KEY غير صالح"; exit 1; }
grep -qF "defaultSupabaseURL = URL(string: \"$URL\")" "$S" || { echo "RemoteTransport: عنوان Supabase الافتراضي تغيّر"; exit 1; }
grep -Eq 'defaultAnonKey = "eyJ[^"]+\.[^"]+\.[^"]+"' "$S" || { echo "RemoteTransport: المفتاح الافتراضي غائب"; exit 1; }
echo "plist guard OK"
