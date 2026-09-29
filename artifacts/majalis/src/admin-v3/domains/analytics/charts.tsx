/** Lightweight SVG charts — no chart library dependency. */

type Point = { x: number; y: number; label?: string };

function scaleSeries(values: number[], width: number, height: number, pad = 8): Point[] {
  if (!values.length) return [];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  return values.map((v, i) => ({
    x: pad + (i * (width - pad * 2)) / Math.max(values.length - 1, 1),
    y: height - pad - ((v - min) / span) * (height - pad * 2),
  }));
}

export function NoDataChart({ title }: { title?: string }) {
  return (
    <div className="av3-an-chart av3-an-chart--empty" role="img" aria-label={title || "لا بيانات"}>
      <p className="av3-an-nodata">NO DATA AVAILABLE</p>
    </div>
  );
}

export function LineChart({
  title,
  values,
  labels,
}: {
  title: string;
  values: number[];
  labels?: string[];
}) {
  if (!values.length) return <NoDataChart title={title} />;
  const w = 320;
  const h = 120;
  const pts = scaleSeries(values, w, h);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <figure className="av3-an-chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="120" role="img" aria-label={title}>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="av3-an-chart__stroke" />
      </svg>
      {labels?.length ? (
        <p className="av3-an-chart__hint">
          {labels[0]} → {labels[labels.length - 1]}
        </p>
      ) : null}
    </figure>
  );
}

export function AreaChart({ title, values }: { title: string; values: number[] }) {
  if (!values.length) return <NoDataChart title={title} />;
  const w = 320;
  const h = 120;
  const pts = scaleSeries(values, w, h);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1]!.x.toFixed(1)},${h - 8} L${pts[0]!.x.toFixed(1)},${h - 8} Z`;
  return (
    <figure className="av3-an-chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="120" role="img" aria-label={title}>
        <path d={area} className="av3-an-chart__fill" />
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2" className="av3-an-chart__stroke" />
      </svg>
    </figure>
  );
}

export function BarChart({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  if (!items.length) return <NoDataChart title={title} />;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <figure className="av3-an-chart">
      <figcaption>{title}</figcaption>
      <ul className="av3-an-bars">
        {items.slice(0, 12).map((item) => (
          <li key={item.label}>
            <span className="av3-an-bars__label">{item.label}</span>
            <span className="av3-an-bars__track">
              <span className="av3-an-bars__fill" style={{ width: `${(item.count / max) * 100}%` }} />
            </span>
            <span className="av3-an-bars__count">{item.count}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function PieChart({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  if (!items.length) return <NoDataChart title={title} />;
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  const r = 46;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <figure className="av3-an-chart av3-an-pie">
      <figcaption>{title}</figcaption>
      <svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label={title}>
        <g transform="translate(60,60) rotate(-90)">
          {items.map((item, idx) => {
            const len = (item.count / total) * c;
            const el = (
              <circle
                key={item.label}
                className={`av3-an-pie__seg--${idx % 5}`}
                r={r}
                cx={0}
                cy={0}
                fill="none"
                strokeWidth="14"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <ul className="av3-an-pie__legend">
        {items.map((item, idx) => (
          <li key={item.label}>
            <span className={`av3-an-pie__swatch--${idx % 5}`} />
            {item.label}: {item.count}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function HeatmapPlaceholder() {
  return (
    <div className="av3-an-chart av3-an-chart--empty">
      <p className="av3-an-nodata">NO DATA AVAILABLE</p>
      <p className="av3-muted">خريطة حرارية — بلا بيانات دول/إحداثيات</p>
    </div>
  );
}
