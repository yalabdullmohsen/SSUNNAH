import { useEffect, useMemo, useState } from "react";
import { Button, Notice, PageHero, Picker, Sheet, StatGrid, StatTile } from "@/design-system";
import { formatNumber } from "@/lib/format";
import { applyPageSeo } from "@/lib/seo";
import { ShareButtons } from "@/components/ContentActions";
import { SectionQuiz } from "@/components/ui/SectionQuiz";
import { RelatedKnowledge } from "@/components/RelatedKnowledge";
import { useQiblaCompass } from "@/hooks/useQiblaCompass";
import {
  angularDistance,
  distanceToKaabaKm,
  qiblaBearing,
} from "@/lib/qibla-math";
import {
  formatCoordPair,
  QIBLA_CITIES,
  readSavedGeoLocation,
  writeSavedGeoLocation,
} from "@/lib/qibla-location";
import "@/styles/pages/qibla.css";

function QiblaCompass({
  bearing,
  heading,
  aligned,
}: {
  bearing: number;
  heading: number | null;
  aligned: boolean;
}) {
  const headDeg = heading ?? 0;
  const diskRot = -headDeg;
  const arrowRot = bearing - headDeg;

  const ticks = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => {
        const a = (i * 5 * Math.PI) / 180;
        const major = i % 18 === 0;
        const med = i % 6 === 0 && !major;
        const r1 = major ? 79 : med ? 83 : 85;
        return {
          x1: 100 + r1 * Math.sin(a),
          y1: 100 - r1 * Math.cos(a),
          x2: 100 + 88 * Math.sin(a),
          y2: 100 - 88 * Math.cos(a),
          major,
          med,
        };
      }),
    [],
  );

  return (
    <div className={`qibla-dial${aligned ? " qibla-dial--aligned" : ""}`}>
      <svg
        viewBox="0 0 200 200"
        className="qibla-svg"
        aria-label={`بوصلة القبلة، الزاوية ${Math.round(bearing)} درجة`}
      >
        <defs>
          <radialGradient id="qibla-face" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="var(--qibla-face-hi, #ECFDF5)" />
            <stop offset="100%" stopColor="var(--qibla-face-lo, #F0FDF4)" />
          </radialGradient>
          <filter id="qibla-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="100"
          cy="100"
          r="97"
          fill="url(#qibla-face)"
          stroke={aligned ? "rgba(22,163,74,0.55)" : "rgba(22,163,74,0.18)"}
          strokeWidth={aligned ? 2.5 : 1.5}
        />

        <line
          x1="100"
          y1="100"
          x2={100 + 86 * Math.sin((arrowRot * Math.PI) / 180)}
          y2={100 - 86 * Math.cos((arrowRot * Math.PI) / 180)}
          stroke="rgba(22,163,74,0.12)"
          strokeWidth="1"
        />

        <g transform={`rotate(${diskRot} 100 100)`}>
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={
                t.major
                  ? "rgba(24,54,42,0.45)"
                  : t.med
                    ? "rgba(24,54,42,0.25)"
                    : "rgba(24,54,42,0.12)"
              }
              strokeWidth={t.major ? "1.5" : "0.75"}
            />
          ))}
          <text x="100" y="11" textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--majalis-danger, #9B1C1C)">
            ش
          </text>
          <text x="100" y="196" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(24,54,42,0.55)">
            ج
          </text>
          <text x="191" y="104" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(24,54,42,0.55)">
            ق
          </text>
          <text x="9" y="104" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(24,54,42,0.55)">
            غ
          </text>
        </g>

        <g transform={`rotate(${arrowRot} 100 100)`} filter={aligned ? "url(#qibla-glow)" : undefined}>
          <polygon
            points="100,18 96,78 100,88 104,78"
            fill={aligned ? "var(--majalis-emerald, var(--mj-brand-deep))" : "#22C55E"}
            opacity={aligned ? 1 : 0.9}
          />
          <polygon
            points="100,182 96,122 100,112 104,122"
            fill="var(--majalis-emerald-muted, rgba(23,61,53,0.18))"
          />
          <polygon points="100,6 93,20 107,20" fill="var(--majalis-emerald, var(--mj-brand-deep))" opacity="0.85" />
          <circle cx="100" cy="100" r="7" fill={aligned ? "var(--majalis-emerald, var(--mj-brand-deep))" : "#22C55E"} />
          <circle cx="100" cy="100" r="3" fill="#fff" />
        </g>

        {aligned && (
          <circle cx="100" cy="100" r="95" fill="none" stroke="#16A34A" strokeWidth="3" opacity="0.4">
            <animate attributeName="opacity" values="0.35;0.75;0.35" dur="1.4s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}

export default function QiblaPage() {
  const [initialGeo] = useState(() =>
    typeof window !== "undefined" ? readSavedGeoLocation() : null,
  );
  const [bearing, setBearing] = useState<number | null>(() =>
    initialGeo ? qiblaBearing(initialGeo.lat, initialGeo.lon) : null,
  );
  const [dist, setDist] = useState<number | null>(() =>
    initialGeo ? distanceToKaabaKm(initialGeo.lat, initialGeo.lon) : null,
  );
  const [coordsLabel, setCoordsLabel] = useState(() =>
    initialGeo ? formatCoordPair(initialGeo.lat, initialGeo.lon) : "",
  );
  const [placeLabel, setPlaceLabel] = useState(() => initialGeo?.label ?? "");
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState<boolean>(
    () => !initialGeo && typeof navigator !== "undefined" && !navigator.geolocation,
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    initialGeo?.label && QIBLA_CITIES.some((c) => c.name === initialGeo.label)
      ? initialGeo.label
      : QIBLA_CITIES[0].name,
  );
  const [calibDismissed, setCalibDismissed] = useState(false);

  const {
    heading,
    accuracy,
    needsCalibration,
    permission,
    requestPermission,
    aligned,
  } = useQiblaCompass(bearing);

  useEffect(() => {
    applyPageSeo({
      path: "/qibla",
      title: "اتجاه القبلة | سُنّة",
      description:
        "حدد اتجاه القبلة من موقعك الحالي بدقة، بوصلة رقمية تعتمد على GPS للمسلمين في كل مكان.",
      keywords: ["اتجاه القبلة", "قبلة", "بوصلة إسلامية", "اتجاه مكة", "صلاة"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "اتجاه القبلة",
          url: "https://www.ssunnah.com/qibla",
          about: { "@type": "Thing", name: "بوصلة القبلة للمسلمين" },
        },
      ],
    });
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      if (!initialGeo) {
        setError("المتصفح لا يدعم تحديد الموقع التلقائي.");
        setManualMode(true);
      }
      return;
    }
    // لا تطلب GPS عند فتح الصفحة — استخدم موقعًا محفوظًا أو الوضع اليدوي حتى ينقر المستخدم
    if (!initialGeo) {
      setManualMode(true);
    }
  }, [initialGeo]);

  function requestDeviceLocation() {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع التلقائي.");
      setManualMode(true);
      return;
    }
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setBearing(qiblaBearing(lat, lon));
        setDist(distanceToKaabaKm(lat, lon));
        setCoordsLabel(formatCoordPair(lat, lon));
        setPlaceLabel("موقعك الحالي");
        writeSavedGeoLocation({ lat, lon, label: "موقعك الحالي", source: "gps" });
        setError("");
        setManualMode(false);
      },
      () => {
        setError("لم يُمنح إذن تحديد الموقع. اختر مدينتك يدوياً:");
        setManualMode(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
    );
  }

  function applyManualCity(cityName: string) {
    const city = QIBLA_CITIES.find((c) => c.name === cityName);
    if (!city) return;
    setBearing(qiblaBearing(city.lat, city.lon));
    setDist(distanceToKaabaKm(city.lat, city.lon));
    setCoordsLabel(formatCoordPair(city.lat, city.lon));
    setPlaceLabel(city.name);
    writeSavedGeoLocation({
      lat: city.lat,
      lon: city.lon,
      label: city.name,
      source: "city",
    });
    setError("");
  }

  const delta =
    bearing != null && heading != null ? angularDistance(bearing, heading) : null;

  const showCalib = needsCalibration && !calibDismissed;

  const deg = (v: number, digits = 0) => `${formatNumber(v, { maximumFractionDigits: digits, minimumFractionDigits: digits })}°`;

  return (
    <div className="sn-screen" data-testid="qibla-screen">
      <div className="sn-container sn-container--below-bar sn-stack sn-stack--lg">
        <PageHero tag="الأدوات" title="اتجاه القبلة" description="وجّه الجهاز حتى يشير السهم إلى الكعبة المشرفة." />

        {manualMode && (
          <section className="sn-stack" aria-label="اختيار المدينة يدويًا">
            {error ? <Notice tone="danger">{error}</Notice> : null}
            <Picker
              label="اختر مدينتك"
              value={selectedCity}
              onChange={setSelectedCity}
              options={QIBLA_CITIES.map((c) => ({ value: c.name, label: c.name }))}
            />
            <Button variant="primary" block onClick={() => applyManualCity(selectedCity)}>احسب القبلة</Button>
            {typeof navigator !== "undefined" && navigator.geolocation ? (
              <Button variant="secondary" block icon="location" onClick={() => requestDeviceLocation()}>استخدم موقعي</Button>
            ) : null}
          </section>
        )}

        {!manualMode && bearing == null && (
          <section className="sn-stack">
            <Notice>حدد موقعك لحساب اتجاه القبلة.</Notice>
            <Button variant="secondary" block onClick={() => requestDeviceLocation()}>استخدم موقعي</Button>
          </section>
        )}

        {bearing != null && (
          <>
            <QiblaCompass bearing={bearing} heading={heading} aligned={aligned} />

            {aligned && <Notice tone="success">✓ أنت متجه نحو القبلة</Notice>}

            <StatGrid>
              <StatTile label="الاتجاه من الشمال" value={deg(Math.round(bearing))} />
              {dist != null && <StatTile label="المسافة إلى الكعبة" value={`${formatNumber(Math.round(dist))}\u00A0كم`} />}
              {delta != null && <StatTile label="الانحراف" value={deg(delta, 1)} />}
            </StatGrid>

            {(placeLabel || coordsLabel) && (
              <p className="sn-t-secondary">
                {[placeLabel, coordsLabel, accuracy != null ? `دقة البوصلة ≈ ${deg(Math.round(accuracy))}` : ""].filter(Boolean).join(" · ")}
              </p>
            )}

            {permission === "needed" && (
              <Button variant="secondary" block onClick={() => void requestPermission()}>تفعيل مستشعر الاتجاه</Button>
            )}

            {heading == null && permission !== "needed" && (
              <p className="sn-t-secondary">على الجوال: وجّه الهاتف في الاتجاه الذي يشير فيه السهم.</p>
            )}
          </>
        )}

        <Sheet open={showCalib} onClose={() => setCalibDismissed(true)} title="معايرة البوصلة">
          <div className="sn-stack">
            <p>دقة المستشعر منخفضة. حرّك الهاتف على شكل الرقم «٨» في الهواء عدة مرات بعيدًا عن المعادن والمغناطيس، ثم أعد المحاولة.</p>
            <Button variant="secondary" block onClick={() => setCalibDismissed(true)}>حسنًا</Button>
          </div>
        </Sheet>

        <RelatedKnowledge kind="fatwa" query="القبلة والصلاة" title="معرفة ذات صلة بالقبلة" limit={6} />
        <ShareButtons title="اتجاه القبلة — سُنّة" url="https://www.ssunnah.com/qibla" />
        <SectionQuiz sectionId="fiqh" title="اختبر معلوماتك في أحكام القبلة والصلاة" count={4} />
      </div>
    </div>
  );
}
