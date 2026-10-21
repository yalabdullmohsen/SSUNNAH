#!/usr/bin/env python3
"""مواضع البايت لكل آية في ملفات «المختصر الصوتي» (لتنزيل مقطع الآية وحدها بطلب HTTP Range بدل الملف كاملًا).

يقرأ رؤوس إطارات MP3 بالتتابع (بلا فك ترميز): كل إطار Layer III = 1152 عيّنة (MPEG1) أو 576 (MPEG2/2.5)،
فزمن بداية كل إطار دقيق، ويُعطى لكل توقيت في MukhtasarIndex+Data.swift بايتُ أول إطار يبدأ عنده أو قبله.
إطار Xing/Info الأول (بلا صوت) لا يُحسب في الزمن، كما يفعل ffmpeg الذي وُلّدت منه التوقيتات.

الاستعمال: python3 byte_offsets.py <مجلد ملفات NNN.mp3> <MukhtasarIndex+Data.swift> > MukhtasarIndex+Bytes.swift
"""
import re
import sys
from pathlib import Path

BITRATES = {  # (version_bits, layer_bits) لـ Layer III فقط
    "mpeg1": [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
    "mpeg2": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
}
RATES = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def frames(data: bytes):
    """(بايت البداية، زمن البداية بالثواني) لكل إطار صوتي."""
    i = 0
    if data[:3] == b"ID3":
        size = (data[6] & 0x7F) << 21 | (data[7] & 0x7F) << 14 | (data[8] & 0x7F) << 7 | (data[9] & 0x7F)
        i = 10 + size + (10 if data[5] & 0x10 else 0)
    t = 0.0
    first = True
    n = len(data)
    while i + 4 <= n:
        b1, b2, b3 = data[i + 1], data[i + 2], data[i + 3]
        if data[i] != 0xFF or (b1 & 0xE0) != 0xE0:
            i += 1
            continue
        ver = (b1 >> 3) & 3          # 3=MPEG1، 2=MPEG2، 0=MPEG2.5
        layer = (b1 >> 1) & 3        # 1=Layer III
        br_i, sr_i, pad = (b2 >> 4) & 0xF, (b2 >> 2) & 3, (b2 >> 1) & 1
        if ver == 1 or layer != 1 or br_i in (0, 15) or sr_i == 3:
            i += 1
            continue
        br = BITRATES["mpeg1" if ver == 3 else "mpeg2"][br_i] * 1000
        sr = RATES[ver][sr_i]
        spf = 1152 if ver == 3 else 576
        length = (144 if ver == 3 else 72) * br // sr + pad
        if length < 4:
            i += 1
            continue
        if first:
            first = False
            side = (32 if (b3 >> 6) != 3 else 17) if ver == 3 else ((17 if (b3 >> 6) != 3 else 9))
            tag = data[i + 4 + side:i + 8 + side]
            if tag in (b"Xing", b"Info"):
                i += length
                continue
        yield i, t
        t += spf / sr
        i += length


def parse_index(swift: str):
    out = {}
    for m in re.finditer(r"(\d+): Entry\(start: ([\d.]+), ayahs: \[([^\]]*)\]\)", swift):
        out[int(m.group(1))] = (float(m.group(2)), [float(x) for x in m.group(3).split(",") if x.strip()])
    return out


def offset_at(fr, t):
    """بايت آخر إطار يبدأ عند t أو قبله (بحث ثنائي)."""
    lo, hi = 0, len(fr) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if fr[mid][1] <= t + 1e-6:
            lo = mid
        else:
            hi = mid - 1
    return fr[lo][0], fr[lo][1]


def main():
    folder, data_swift = Path(sys.argv[1]), Path(sys.argv[2]).read_text(encoding="utf-8")
    index = parse_index(data_swift)
    lines = []
    for s in sorted(index):
        start, ayahs = index[s]
        raw = (folder / f"{s:03d}.mp3").read_bytes()
        fr = list(frames(raw))
        if not fr:
            raise SystemExit(f"لا إطارات في {s:03d}.mp3")
        offs, times = [], []
        for t in [start] + ayahs:
            b, ft = offset_at(fr, t)
            offs.append(b)
            times.append(round(t - ft, 3))
        lines.append(f"        {s}: Bytes(size: {len(raw)}, start: {offs[0]}, startLead: {times[0]}, "
                     f"ayahs: [{', '.join(map(str, offs[1:]))}], leads: [{', '.join(map(str, times[1:]))}]),")
    print("// مولَّد — لا تحرّره يدويًا: python3 scripts/mukhtasar-index/byte_offsets.py <audio> MukhtasarIndex+Data.swift")
    print("// مواضع البايت (بداية إطار MP3) لكل توقيت في MukhtasarIndex+Data.swift، و«lead» = التوقيت ناقص بداية ذلك الإطار (ثوانٍ).")
    print("extension MukhtasarIndex {")
    print("    struct Bytes: Sendable { let size: Int; let start: Int; let startLead: Double; let ayahs: [Int]; let leads: [Double] }")
    print("    static let generatedBytes: [Int: Bytes] = [")
    print("\n".join(lines))
    print("    ]")
    print("}")


if __name__ == "__main__":
    main()
