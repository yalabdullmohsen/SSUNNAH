import { useEffect, useRef, useState, useCallback } from "react";
import { NavigationBar, IconButton } from "@/design-system";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { PROPHETS_LINEAGE, type LineageNode } from "@/lib/prophets-lineage";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { truncateAtWord } from "@/lib/utils";
import "@/styles/pages/prophet-stories.css";

// ── ثوابت التخطيط ──────────────────────────────────────────────────────────
const NODE_W  = 110;
const NODE_H  = 52;
const H_GAP   = 50;   // الفجوة الأفقية بين الأعمدة
const V_GAP   = 28;   // الفجوة الرأسية بين الإخوة
const EMERALD = "var(--mj-brand)";
const ANCESTOR_CLR = "var(--mj-muted)";

// ── حساب تخطيط الشجرة ─────────────────────────────────────────────────────

interface PlacedNode {
  node: LineageNode;
  x: number;
  y: number;
  parentId: string | null;
}

function layoutTree(
  node: LineageNode,
  depth: number,
  yStart: number,
  placed: PlacedNode[],
  parentId: string | null
): number {
  const children = node.children ?? [];
  let totalH = 0;

  if (children.length === 0) {
    const y = yStart;
    placed.push({ node, x: depth * (NODE_W + H_GAP), y, parentId });
    return NODE_H;
  }

  let childY = yStart;
  for (const child of children) {
    const used = layoutTree(child, depth + 1, childY, placed, node.id);
    totalH += used + V_GAP;
    childY += used + V_GAP;
  }
  totalH -= V_GAP;

  const firstChild = placed.find(p => p.parentId === node.id && p.node.id === children[0].id);
  const lastChild  = placed.find(p => p.parentId === node.id && p.node.id === children[children.length - 1].id);
  const midY = firstChild && lastChild
    ? (firstChild.y + lastChild.y) / 2
    : yStart;

  placed.push({ node, x: depth * (NODE_W + H_GAP), y: midY, parentId });
  return totalH;
}

// ── مكوّن العقدة ────────────────────────────────────────────────────────────

function NodeBox({ placed, onClick }: {
  placed: PlacedNode;
  onClick: (id: string) => void;
}) {
  const { node, x, y } = placed;
  const isAnc   = node.isAncestor;
  const isUlul  = node.isUlulAzm;
  const isLast  = node.id === "muhammad";
  const fill    = isLast ? EMERALD : isAnc ? ANCESTOR_CLR : "#FFFFFF";
  const stroke  = isUlul ? "#D97706" : isAnc ? "#5C5C56" : EMERALD;
  const textClr = (isLast || isAnc) ? "#FFFFFF" : "#1F2937";
  const sw      = isUlul ? 2.5 : 1.5;
  const rx      = isLast ? 12 : 8;

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor: node.slug ? "pointer" : "default" }}
      onClick={() => node.slug && onClick(node.id)}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && node.slug) onClick(node.id); }}
      role="button"
      tabIndex={node.slug ? 0 : -1}
      aria-label={node.name}
    >
      <rect
        width={NODE_W} height={NODE_H} rx={rx}
        fill={fill} stroke={stroke} strokeWidth={sw}
        filter={isUlul ? "url(#glow)" : undefined}
      />
      {isUlul && (
        <rect
          x={2} y={2} width={NODE_W - 4} height={NODE_H - 4}
          rx={rx - 2} fill="none" stroke="#F59E0B" strokeWidth={0.8} opacity={0.5}
        />
      )}
      <text
        x={NODE_W / 2} y={NODE_H / 2 - 6}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={isAnc ? 10 : 13} fontWeight={700}
        style={{ fontFamily: "var(--font-ui)" }}
        fill={textClr}
      >
        {node.name}
      </text>
      {node.era && !isAnc && (
        <text
          x={NODE_W / 2} y={NODE_H / 2 + 11}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={8.5} style={{ fontFamily: "var(--font-ui)" }}
          fill={isLast ? "rgba(255,255,255,0.8)" : "#5C5C56"}
        >
          {truncateAtWord(node.era, 20)}
        </text>
      )}
      {isAnc && (
        <text
          x={NODE_W / 2} y={NODE_H / 2 + 10}
          textAnchor="middle" fontSize={8}
          fill="rgba(255,255,255,0.6)" style={{ fontFamily: "var(--font-ui)" }}
        >
          ···
        </text>
      )}
    </g>
  );
}

// ── الصفحة الرئيسية ─────────────────────────────────────────────────────────

export default function ProphetsFamilyTreePage() {
  useEffect(() => {
    applyPageSeo({
      path: "/prophets/tree",
      title: "شجرة أنساب الأنبياء | سُنّة",
      description: "رسم بياني تفاعلي لنسب الأنبياء الـ25 المذكورين في القرآن الكريم من آدم إلى محمد ﷺ.",
      keywords: ["أنبياء", "شجرة نسب", "سيرة", "تاريخ إسلامي"],
      jsonLd: [{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "شجرة أنساب الأنبياء",
        description: "رسم بياني تفاعلي لنسب الأنبياء الـ25 المذكورين في القرآن الكريم.",
        url: "https://www.ssunnah.com/prophets/tree",
        inLanguage: "ar",
        publisher: { "@type": "Organization", name: "سُنّة", url: "https://www.ssunnah.com" },
      }],
    });
  }, []);

  // ── حساب المواقع ──────────────────────────────────────────────────────────
  const placed: PlacedNode[] = [];
  layoutTree(PROPHETS_LINEAGE, 0, 0, placed, null);

  const minX = Math.min(...placed.map(p => p.x));
  const maxX = Math.max(...placed.map(p => p.x)) + NODE_W;
  const minY = Math.min(...placed.map(p => p.y));
  const maxY = Math.max(...placed.map(p => p.y)) + NODE_H;
  const svgW = maxX - minX + 80;
  const svgH = maxY - minY + 80;

  // ── تحكم Zoom/Pan ──────────────────────────────────────────────────────────
  // القيمة الافتراضية 0.75 لا تلائم الجوال: عقد الشجرة تبدأ من إحداثيات x
  // بعيدة (500px+) في نظام الإحداثيات الأصلي، فتظل خارج نافذة عرض 375px
  // تمامًا ما لم يُحسب تكبير/تحريك ابتدائي يناسب عرض الحاوية الفعلي.
  const containerRef    = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);
  const [pan, setPan]   = useState({ x: 40, y: 40 });
  const isDragging      = useRef(false);
  const dragStart       = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    const w = containerRef.current?.clientWidth;
    if (!w) return;
    const fitScale = Math.min(0.75, Math.max(0.3, w / svgW));
    setScale(fitScale);
    setPan({ x: 20, y: 20 });
  }, []);

  const [selected, setSelected] = useState<string | null>(null);

  const zoom = useCallback((dir: 1 | -1) => {
    setScale(s => Math.min(2, Math.max(0.3, s + dir * 0.15)));
  }, []);

  const reset = useCallback(() => { setScale(0.75); setPan({ x: 40, y: 40 }); }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current  = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = () => { isDragging.current = false; };

  // لمس (Touch)
  const touchStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, px: pan.x, py: pan.y };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setPan({
      x: touchStart.current.px + (t.clientX - touchStart.current.x),
      y: touchStart.current.py + (t.clientY - touchStart.current.y),
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 1 : -1);
  };

  // العقدة المختارة
  const selectedNode = placed.find(p => p.node.id === selected)?.node;

  return (
    <div className="sn-screen">
    <NavigationBar title="شجرة أنساب الأنبياء" large={false} />
    <div dir="rtl" className="pft-page">
      {/* Header */}
      <header className="pft-header">
        <Link href="/prophets" className="pft-header__back">
          ← الأنبياء
        </Link>
        <div className="pft-header__mid">
          <h1 className="pft-hero__title pft-header__title">شجرة أنساب الأنبياء</h1>
          <p className="pft-header__lead">
            ٢٥ نبياً مذكورًا بالاسم في القرآن، من آدم إلى محمد ﷺ — اسحب للتنقل، اضغط على نبي للتفاصيل
          </p>
        </div>
        <div className="pft-header__tools">
          {[
            { icon: <ZoomIn size={16}/>, fn: () => zoom(1),  title: "تكبير" },
            { icon: <ZoomOut size={16}/>, fn: () => zoom(-1), title: "تصغير" },
            { icon: <RotateCcw size={16}/>, fn: reset,         title: "إعادة تعيين" },
          ].map(({ icon, fn, title }) => (
            <IconButton key={title} type="button" onClick={fn} label={title} className="pft-tool-btn">{icon}</IconButton>
          ))}
        </div>
      </header>

      {/* أسطورة الألوان — swatches ديناميكية تبقى عبر CSS variables */}
      <div className="pft-legend">
        {[
          { color: EMERALD, label: "خاتم الأنبياء ﷺ" },
          { color: "var(--mj-warning)", label: "أولو العزم", border: true },
          { color: "var(--mj-muted)", label: "حلقة وصل" },
          { color: "var(--mj-surface)", label: "سائر الأنبياء", border2: true },
        ].map(({ color, label, border, border2 }) => (
          <div key={label} className="pft-legend__item">
            <div
              className="pft-legend__swatch"
              style={{
                background: color,
                border: border
                  ? "2px solid var(--mj-warning)"
                  : border2
                    ? "1.5px solid var(--mj-brand)"
                    : "none",
              }}
            />
            <span className="pft-legend__label">{label}</span>
          </div>
        ))}
      </div>

      {/* Canvas. لوحة سحب/تحريك (pan) بالماوس واللمس فقط — نفس القيد المعماري
          الموثَّق سابقًا لـ MindMapCanvas: التحريك بالسحب مفهوم مرتبط بمؤشر/لمس
          جوهريًا، لا مكافئ مباشر له بلوحة المفاتيح. التكبير/التصغير (الوظيفة
          الأهم فعليًا) له بديل كامل بلوحة المفاتيح عبر زرّي "تكبير"/"تصغير"
          الظاهرين (button حقيقي)، فلا حظر فعلي للوصول للمحتوى. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={containerRef}
        style={{
          overflow: "hidden", cursor: "grab", userSelect: "none",
          height: "calc(100svh - 130px)",
          position: "relative",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
        onWheel={onWheel}
      >
        <svg
          width={svgW * scale + 80}
          height={svgH * scale + 80}
          style={{
            transform: `translate(${pan.x}px,${pan.y}px)`,
            display: "block",
            // يُلغي قاعدة svg{max-width:100%;height:auto} العامة (index.css)
            // المخصَّصة لأيقونات/رسوم عادية؛ هذه لوحة قماشية قابلة للسحب
            // بأبعادها الحقيقية بالبكسل تتحكم بها منطق pan/scale في JS، فتقييدها
            // بعرض الحاوية يُفسد حساب pan/scale ويُخفي الشجرة عن الجوال بالكامل.
            maxWidth: "none",
            // position:absolute + top/left:0 يُخرج SVG من تدفق dir="rtl" الموروث
            // من الحاوية الأب — بلا هذا، يُحاذي المتصفح الصندوق العريض (1300px+)
            // لحافة الحاوية اليمنى تلقائيًا فيدفع محتواه (المرتَّب بإحداثيات x
            // تصاعدية من الصفر) بالكامل خارج نافذة العرض على الجوال (375px)،
            // فتظهر الشجرة فارغة تمامًا رغم أن pan/scale صحيحان حسابيًا.
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g transform={`scale(${scale})`}>
            {/* خطوط التوصيل */}
            {placed.map((p) => {
              if (!p.parentId) return null;
              const parent = placed.find(pl => pl.node.id === p.parentId);
              if (!parent) return null;

              const x1 = parent.x + NODE_W;
              const y1 = parent.y + NODE_H / 2;
              const x2 = p.x;
              const y2 = p.y + NODE_H / 2;
              const mx = (x1 + x2) / 2;
              const isDash = p.node.generationsGap && p.node.generationsGap > 0;

              return (
                <path
                  key={`${p.parentId}-${p.node.id}`}
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={isDash ? "#9CA3AF" : "var(--mj-brand)"}
                  strokeWidth={isDash ? 1 : 1.5}
                  strokeDasharray={isDash ? "5,4" : undefined}
                  opacity={0.6}
                />
              );
            })}

            {/* العقد */}
            {placed.map((p) => (
              <NodeBox
                key={p.node.id}
                placed={p}
                onClick={(id) => setSelected(s => s === id ? null : id)}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* بطاقة التفاصيل */}
      {selectedNode && !selectedNode.isAncestor && (
        <div className="pft-detail">
          <div className="pft-detail__head">
            <h2 className="pft-detail__title">
              {selectedNode.name}
              {selectedNode.isUlulAzm && (
                <span className="pft-detail__badge">أولو العزم</span>
              )}
            </h2>
            <IconButton type="button" onClick={() => setSelected(null)} label="إغلاق" className="pft-detail__close">×</IconButton>
          </div>
          {selectedNode.era && (
            <p className="pft-detail__row">
              <strong>الحقبة: </strong>{selectedNode.era}
            </p>
          )}
          {selectedNode.people && (
            <p className="pft-detail__row">
              <strong>القوم أو المكان: </strong>{selectedNode.people}
            </p>
          )}
          {selectedNode.linkNote && (
            <p className="pft-detail__note">{selectedNode.linkNote}</p>
          )}
          {selectedNode.slug && selectedNode.id !== "muhammad" && (
            <Link href={`/prophets/${selectedNode.slug}`} className="pft-detail__link">
              تفاصيل {selectedNode.name}
            </Link>
          )}
        </div>
      )}
    </div>
    </div>
  );
}
