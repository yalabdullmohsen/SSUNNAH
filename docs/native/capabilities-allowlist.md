# قرار المالك — الميكروفون للتسميع (2026-10-22)

قرار المالك: الميكروفون للتسميع فقط، معالجة على الجهاز، لا إرسال ولا حفظ. نُقل `NSMicrophoneUsageDescription` من `forbidden` إلى `usageDescriptions` في `capabilities-allowlist.json`. يُطلب الإذن عند بدء التسميع (`MushafTasmeeController.requestMic`) لا عند فتح التطبيق، ولا يُجمع صوت في App Privacy.
