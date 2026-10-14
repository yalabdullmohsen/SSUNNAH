#!/usr/bin/env python3
"""يولّد IntroLogoData.swift من design/icons/*.svg (مضلّعات M/L/Z فقط، viewBox 200)."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
files = {"primary": "AppIcon-Primary-Zellij-White", "starDish": "AppIcon-StarDish-Green", "zellijDark": "AppIcon-Zellij-Dark"}
out = ["// مولَّد بـ ios-native/scripts/gen-intro-shapes.py — لا تعدّله يدويًا.", "import CoreGraphics", "", "enum IntroLogoData {", "    struct Layer { let color: UInt32; let polys: [[CGPoint]] }", ""]
for key, name in files.items():
    svg = (root / "design/icons" / f"{name}.svg").read_text()
    layers = []
    for m in re.finditer(r'<path d="([^"]+)" fill="#([0-9A-Fa-f]{6})"', svg):
        d, col = m.group(1), m.group(2)
        polys = []
        for sub in re.split(r'(?=M)', d):
            nums = re.findall(r'-?\d+\.?\d*', sub)
            pts = [(float(nums[i]), float(nums[i+1])) for i in range(0, len(nums) - 1, 2)]
            if pts: polys.append(pts)
        layers.append((col, polys))
    layers = layers[1:]  # الأول هو الخلفية
    out.append(f"    static let {key}: [Layer] = [")
    for col, polys in layers:
        ps = ", ".join("[" + ", ".join(f"CGPoint(x: {x:g}, y: {y:g})" for x, y in p) + "]" for p in polys)
        out.append(f"        Layer(color: 0x{col.upper()}, polys: [{ps}]),")
    out.append("    ]")
    out.append("")
out.append("}")
dst = root / "artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Intro/IntroLogoData.swift"
dst.parent.mkdir(parents=True, exist_ok=True)
dst.write_text("\n".join(out) + "\n")
