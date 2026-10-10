import { useEffect, useState } from "react";
import { Crosshair, MapPin, Search } from "lucide-react";
import {
  ensureWorldCitiesLoaded,
  findNearestWorldCity,
  formatCityLabel,
  listAdminsByCountry,
  listCitiesByCountry,
  listWorldCountries,
  searchWorldCities,
  type WorldCity,
  type WorldCountry,
} from "@/lib/world-cities";
import {
  getActivePrayerLocation,
  setLocationFromGps,
  setLocationFromKuwaitGov,
  setLocationFromWorldCity,
  type PrayerActiveLocation,
} from "@/lib/prayer-location-prefs";
import { KUWAIT_GOVERNORATES, setSelectedGovernorate } from "@/lib/prayer-kuwait-geo";
import { suggestMethodForRegion } from "@/lib/prayer-calc-prefs";
import { EMPTY, STATUS } from "@/lib/ui-copy";

import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ADMIN_ALL = "__all__";

type Props = {
  onChanged: (loc: PrayerActiveLocation) => void;
};

export function PrayerLocationPicker({ onChanged }: Props) {
  const [loc, setLoc] = useState(() => getActivePrayerLocation());
  const [countries, setCountries] = useState<WorldCountry[]>([]);
  const [country, setCountry] = useState(loc.countryCode || "KW");
  const [admins, setAdmins] = useState<string[]>([]);
  const [admin, setAdmin] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<WorldCity[]>([]);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void ensureWorldCitiesLoaded()
      .then(() => listWorldCountries())
      .then((c) => {
        setCountries(c);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !country) return;
    void listAdminsByCountry(country).then(setAdmins);
    void listCitiesByCountry(country).then((cities) => setHits(cities.slice(0, 40)));
  }, [country, ready]);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => {
      void searchWorldCities(query, {
        countryCode: country || undefined,
        adminAr: admin || undefined,
        limit: 40,
      }).then(setHits);
    }, 120);
    return () => window.clearTimeout(t);
  }, [query, country, admin, ready]);

  function applyCity(city: WorldCity) {
    if (city.defaultMethod) suggestMethodForRegion(city.defaultMethod);
    const next = setLocationFromWorldCity(city);
    setLoc(next);
    onChanged(next);
  }

  function applyKuwaitGov(id: string) {
    const gov = KUWAIT_GOVERNORATES.find((g) => g.id === id);
    if (!gov) return;
    setSelectedGovernorate(id);
    const next = setLocationFromKuwaitGov(gov);
    setLoc(next);
    onChanged(next);
  }

  function useGps() {
    if (!navigator.geolocation) {
      setGpsError("المتصفح لا يدعم تحديد الموقع.");
      return;
    }
    setGpsBusy(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void (async () => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const nearest = await findNearestWorldCity(lat, lon);
          const timeZone =
            nearest?.timeZone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            "UTC";
          const label = nearest
            ? `GPS · قرب ${nearest.nameAr}`
            : `GPS · ${lat.toFixed(3)}, ${lon.toFixed(3)}`;
          if (nearest?.defaultMethod) suggestMethodForRegion(nearest.defaultMethod);
          const next = setLocationFromGps({
            lat,
            lon,
            timeZone,
            label,
            countryCode: nearest?.countryCode,
            cityId: nearest?.id,
          });
          setLoc(next);
          onChanged(next);
          setGpsBusy(false);
        })();
      },
      () => {
        setGpsBusy(false);
        setGpsError(STATUS.networkError);
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="pts-loc" dir="rtl">
      <p className="pts-loc__current">
        <MapPin size={14} aria-hidden />
        <span>{loc.label}</span>
        <span className="pts-loc__tz">{loc.timeZone}</span>
      </p>

      <div className="pts-loc__modes">
        <Button
          type="button"
          className="pts-loc__gps"
          onClick={useGps}
          disabled={gpsBusy}
          aria-busy={gpsBusy}
          aria-label={gpsBusy ? "تحديث الموقع" : "استخدم موقعي"} variant="secondary" loading={gpsBusy}>
          <Crosshair size={14} aria-hidden />
          استخدم موقعي
        </Button>
        {gpsError && <p className="pts-loc__err" role="alert">{gpsError}</p>}
      </div>

      <p className="pts-loc__section">اختصارات الكويت</p>
      <div className="pts-gov" role="tablist" aria-label="محافظات الكويت">
        {KUWAIT_GOVERNORATES.map((g) => (
          <Button
            key={g.id}
            type="button"
            role="tab"
            className={`pts-gov__chip${loc.kuwaitGovId === g.id ? " pts-gov__chip--active" : ""}`}
            onClick={() => applyKuwaitGov(g.id)}
            aria-selected={loc.kuwaitGovId === g.id} variant="ghost">
            {g.name}
          </Button>
        ))}
      </div>

      <p className="pts-loc__section">الاختيار اليدوي — دولة / منطقة / مدينة</p>
      <div className="pts-loc__filters">
        <div className="pts-loc__field">
          <FieldLabel>الدولة</FieldLabel>
          <Select
            value={country}
            onValueChange={(v) => {
              setCountry(v);
              setAdmin("");
              setQuery("");
            }}
          >
            <SelectTrigger className="min-h-11 text-base" aria-label="الدولة" dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.nameAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="pts-loc__field">
          <FieldLabel>المنطقة</FieldLabel>
          <Select
            value={admin || ADMIN_ALL}
            onValueChange={(v) => setAdmin(v === ADMIN_ALL ? "" : v)}
          >
            <SelectTrigger className="min-h-11 text-base" aria-label="المنطقة" dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ADMIN_ALL}>الكل</SelectItem>
              {admins.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="pts-loc__search">
        <Search size={14} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مدينة…"
          aria-label="بحث المدن أوفلاين"
          dir="rtl"
        />
      </label>

      <ul className="pts-loc__hits" role="listbox" aria-label="نتائج المدن">
        {hits.map((c) => (
          <li key={c.id}>
            <Button
              type="button"
              className={`pts-loc__hit${loc.cityId === c.id ? " is-active" : ""}`}
              onClick={() => applyCity(c)} variant="ghost">
              <span>{formatCityLabel(c)}</span>
              <span className="pts-loc__hit-meta">{c.timeZone}</span>
            </Button>
          </li>
        ))}
        {ready && hits.length === 0 && (
          <li className="pts-loc__empty">{EMPTY.search}</li>
        )}
      </ul>
    </div>
  );
}
