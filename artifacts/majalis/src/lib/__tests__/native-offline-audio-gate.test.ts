/**
 * بوابة تخزين التلاوات دون اتصال — iOS Application Support + isExcludedFromBackup.
 * Run: node --import tsx src/lib/__tests__/native-offline-audio-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

// الـplugin يفوّض التخزين إلى النواة المشتركة بلا Capacitor (Shared/OfflineAudioStore.swift).
const swift = ["ios/App/App/MajlisOfflineAudioPlugin.swift", "ios/App/Shared/OfflineAudioStore.swift"]
  .map((rel) => readFileSync(resolve(root, rel), "utf8"))
  .join("\n");
assert.match(swift, /isExcludedFromBackup\s*=\s*true/);
assert.match(swift, /applicationSupportDirectory/);
assert.match(swift, /writeSurah/);
assert.match(swift, /getSurahPlaybackUrl/);

const ts = readFileSync(resolve(root, "src/lib/native-offline-audio.ts"), "utf8");
assert.match(ts, /convertFileSrc/);
assert.match(ts, /MajlisOfflineAudio/);

const downloads = readFileSync(resolve(root, "src/lib/quran-audio-downloads.ts"), "utf8");
assert.match(downloads, /getNativeOfflineAudioPlugin/);
assert.match(downloads, /nativeOfflinePlaybackUrl/);

const pbx = readFileSync(resolve(root, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
assert.match(pbx, /MajlisOfflineAudioPlugin\.swift in Sources/);

console.log("native-offline-audio-gate.test.ts: ok");
