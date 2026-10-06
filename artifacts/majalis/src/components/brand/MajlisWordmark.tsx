import type { SVGProps } from "react";

/**
 * وردمارك «سُنّة» — نص قصير بخط النصوص (Sunnah Text) بدل مسار SVG للاسم القديم.
 * بلا تحميل خط إضافي وقت التشغيل فوق خط الإقلاع.
 */

export default function MajlisWordmark({ className, width, height, style, ...props }: SVGProps<SVGSVGElement>) {
  const w = width ?? 138;
  const h = height ?? 33;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 138 33"
      width={w}
      height={h}
      role="img"
      aria-label="سُنّة"
      focusable="false"
      className={className}
      style={style}
      {...props}
    >
      <title>سُنّة</title>
      <text
        x="69"
        y="24"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "var(--font-text)", fontSize: 26, fontWeight: 700 }}
      >
        سُنّة
      </text>
    </svg>
  );
}
