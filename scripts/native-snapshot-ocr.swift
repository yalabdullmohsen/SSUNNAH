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
// الخطأ والفراغ لا يُكشفان بالنص: الحالة تأتي من screen.error/screen.empty (انظر native-snapshot.sh)؛ هنا بقايا تسريب داخلي فقط
let bad = ["محتوى مؤقت", "missingBundled"]
if let b = bad.first(where: { all.contains($0) }) { print("ERROR:\(b)"); exit(0) }
// معرّف خام (kebab-case لاتيني مثل adh-morning) ظاهر كنص في أي شاشة = فشل
if let raw = lines.first(where: { $0.range(of: "^[a-z]+(-[a-z]+)+$", options: .regularExpression) != nil }) { print("ERROR:RAW_ID(\(raw))"); exit(0) }
if all.contains(route) { print("PLACEHOLDER"); exit(0) }
// تبويبات فقط: بعد حذف التبويبات والرأس لا يبقى نص
let chrome = Set(["الرئيسية", "القرآن", "الدروس", "الصلاة", "الأقسام", "9:41"])
if lines.filter({ !chrome.contains($0) && $0.count > 1 }).count < 2 {
    // بياض/سواد كلي (لون واحد يغطي ≥ 90% بعد تقريب القنوات) = شاشة لم تُرسم؛ غير ذلك EMPTY (نص قليل)
    let w = 60, h = 130, ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    let px = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4); var hist = [UInt32: Int]()
    for i in 0..<(w * h) { hist[(UInt32(px[i*4] >> 4) << 8) | (UInt32(px[i*4+1] >> 4) << 4) | UInt32(px[i*4+2] >> 4), default: 0] += 1 }
    print((hist.values.max() ?? 0) * 10 >= w * h * 9 ? "WHITE_SCREEN" : "EMPTY"); exit(0)
}
// النص المقطوع (يُفعَّل بـAUDIT_TRUNC=1 في تدقيق أكبر خط): سطر ينتهي بـ«…» = اقتطاع من النظام
if ProcessInfo.processInfo.environment["AUDIT_TRUNC"] == "1", let t = lines.first(where: { $0.hasSuffix("…") || $0.hasSuffix("...") }) { print("TRUNCATED:\(t.prefix(40))"); exit(0) }
print("OK")
