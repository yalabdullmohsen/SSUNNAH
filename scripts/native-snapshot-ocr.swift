// يقرأ نص لقطة بـVision ويطبع كلمات الرفض إن وُجدت (placeholder / خطأ / محتوى مؤقت)؛ يطبع النص كاملًا مع --text
import Vision
import AppKit
let a = CommandLine.arguments
guard a.count >= 3, let img = NSImage(contentsOfFile: a[1])?.cgImage(forProposedRect: nil, context: nil, hints: nil) else { print("UNREADABLE"); exit(0) }
let route = a[2]
let req = VNRecognizeTextRequest(); req.recognitionLanguages = ["ar", "en"]; req.recognitionLevel = .accurate
try? VNImageRequestHandler(cgImage: img).perform([req])
let lines = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }
let all = lines.joined(separator: "\n")
if a.count > 3 { print(all); exit(0) }
let bad = ["تعذّر", "تعذر تحميل", "محتوى مؤقت", "missingBundled", "إعادة المحاولة", "قيد التوثيق", "قيد الإعداد"]
if let b = bad.first(where: { all.contains($0) }) { print("ERROR:\(b)"); exit(0) }
if all.contains(route) { print("PLACEHOLDER"); exit(0) }
// تبويبات فقط: بعد حذف التبويبات والرأس لا يبقى نص
let chrome = Set(["الرئيسية", "القرآن", "الدروس", "الصلاة", "الأقسام", "9:41"])
if lines.filter({ !chrome.contains($0) && $0.count > 1 }).count < 2 { print("EMPTY"); exit(0) }
print("OK")
