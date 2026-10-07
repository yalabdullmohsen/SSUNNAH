/**
 * فك أرشيف النموذج (TasmeeZip في Swift) على أرشيف حقيقي بلا ضغط، ورفض zip-slip.
 * يجمّع الشيفرة الفعلية بـswiftc (macOS فقط؛ يُتخطّى بلا swiftc).
 * تشغيل: node scripts/test-tasmee-zip-swift.mjs
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (spawnSync("swiftc", ["--version"], { stdio: "ignore" }).status !== 0 || spawnSync("zip", ["-v"], { stdio: "ignore" }).status !== 0) {
  console.log("test-tasmee-zip-swift: skipped (no swiftc/zip)");
  process.exit(0);
}
const dir = mkdtempSync(join(tmpdir(), "tasmee-zip-"));
const src = join(dir, "src");
mkdirSync(join(src, "AudioEncoder.mlmodelc/weights"), { recursive: true });
writeFileSync(join(src, "AudioEncoder.mlmodelc/weights/weight.bin"), Buffer.alloc(3_000_000, 7));
writeFileSync(join(src, "tokenizer.json"), '{"ok":true}');
execFileSync("zip", ["-0", "-r", "-X", "-q", join(dir, "ok.zip"), "."], { cwd: src });
// أرشيف خبيث: مسار ../ (يُبنى بـpython لأن zip يرفض كتابته)
execFileSync("python3", ["-c", `import zipfile;z=zipfile.ZipFile(r"${join(dir, "evil.zip")}","w",zipfile.ZIP_STORED);z.writestr("../escape.txt","x");z.close()`]);
// أرشيف مضغوط (deflate): يجب أن يُرفض (العقد: zip -0)
execFileSync("python3", ["-c", `import zipfile;z=zipfile.ZipFile(r"${join(dir, "deflated.zip")}","w",zipfile.ZIP_DEFLATED);z.writestr("a.txt","a"*1000);z.close()`]);

const main = join(dir, "main.swift");
writeFileSync(main, `import Foundation
func fail(_ m: String) -> Never { print("FAIL: \\(m)"); exit(1) }
let d = URL(fileURLWithPath: "${dir}")
let out = d.appendingPathComponent("out")
try FileManager.default.createDirectory(at: out, withIntermediateDirectories: true)
try TasmeeZip.extract(d.appendingPathComponent("ok.zip"), to: out)
let w = try Data(contentsOf: out.appendingPathComponent("AudioEncoder.mlmodelc/weights/weight.bin"))
if w.count != 3_000_000 || w.contains(where: { $0 != 7 }) { fail("weight.bin") }
if try String(contentsOf: out.appendingPathComponent("tokenizer.json"), encoding: .utf8) != "{\\"ok\\":true}" { fail("tokenizer") }
for name in ["evil.zip", "deflated.zip"] {
    do { try TasmeeZip.extract(d.appendingPathComponent(name), to: out); fail("\\(name) قُبل") } catch is TasmeeModelError {}
}
if FileManager.default.fileExists(atPath: d.appendingPathComponent("escape.txt").path) { fail("zip-slip كتب خارج الوجهة") }
print("ok")
`);
const bin = join(dir, "t");
execFileSync("swiftc", [join(root, "ios/App/App/Tasmee/TasmeeModelStore.swift"), main, "-o", bin], { stdio: "inherit" });
const res = spawnSync(bin, { encoding: "utf8" });
if (res.status !== 0 || !/ok/.test(res.stdout)) {
  console.error(res.stdout, res.stderr);
  process.exit(1);
}
console.log("test-tasmee-zip-swift: ok");
