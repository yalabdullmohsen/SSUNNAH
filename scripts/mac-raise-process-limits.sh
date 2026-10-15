#!/usr/bin/env bash
# يطبع حدود العمليات الحالية ويقترح قيمًا؛ و--install يكتب LaunchDaemon دائمًا بعد تأكيد صريح.
# استعمال: bash scripts/mac-raise-process-limits.sh            (عرض واقتراح فقط، بلا sudo)
#          sudo bash scripts/mac-raise-process-limits.sh --install   (يطلب كتابة «نعم»)
# السبب: استنفاد maxprocperuid (1333 افتراضيًا) يُفشل fork ويُسقط المحاكيات وxcodebuild.
set -uo pipefail
MAXPROC_NEW="${MAXPROC_NEW:-8192}"; PERUID_NEW="${PERUID_NEW:-6144}"
PLIST=/Library/LaunchDaemons/com.sunnah.raise-process-limits.plist
cur() { echo "kern.maxproc            = $(sysctl -n kern.maxproc)"
        echo "kern.maxprocperuid      = $(sysctl -n kern.maxprocperuid)"
        echo "launchctl limit maxproc = $(launchctl limit maxproc | tr -s ' \t' ' ')"
        echo "ulimit -u (هذه الصدفة)  = $(ulimit -u)"
        echo "عمليات المستخدم الحالية = $(ps -u "$(id -u "${SUDO_USER:-$USER}")" -o pid= | wc -l | tr -d ' ')"; }
echo "— الحدود الحالية —"; cur
echo "— المقترح —"
echo "kern.maxproc=$MAXPROC_NEW  kern.maxprocperuid=$PERUID_NEW  launchctl limit maxproc $PERUID_NEW $MAXPROC_NEW"
[ "${1:-}" = "--install" ] || { echo "للتثبيت الدائم: sudo bash $0 --install"; exit 0; }
[ "$(id -u)" = 0 ] || { echo "يلزم sudo" >&2; exit 1; }
echo "سيُكتب $PLIST ويُحمَّل الآن، ويُعاد تطبيقه عند كل إقلاع. اكتب «نعم» للمتابعة:"
read -r ans; [ "$ans" = "نعم" ] || { echo "أُلغي"; exit 1; }
cat > "$PLIST" <<P
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>com.sunnah.raise-process-limits</string>
<key>ProgramArguments</key><array><string>/bin/sh</string><string>-c</string>
<string>/usr/sbin/sysctl -w kern.maxproc=$MAXPROC_NEW; /usr/sbin/sysctl -w kern.maxprocperuid=$PERUID_NEW; /bin/launchctl limit maxproc $PERUID_NEW $MAXPROC_NEW</string></array>
<key>RunAtLoad</key><true/>
</dict></plist>
P
chown root:wheel "$PLIST"; chmod 644 "$PLIST"
launchctl bootout system "$PLIST" 2>/dev/null; launchctl bootstrap system "$PLIST" && echo "حُمِّل." || echo "فشل التحميل — أعد التشغيل أو شغّل الأوامر يدويًا" >&2
echo "— بعد التطبيق —"; cur
echo "ملاحظة: الصدفات/التطبيقات المفتوحة قبل التطبيق تحتفظ بالحد القديم؛ أعد فتحها (أو سجّل خروجًا ودخولًا)."
