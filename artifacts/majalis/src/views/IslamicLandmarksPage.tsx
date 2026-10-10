/**
 * Discover — المشاهد الإسلامية والمساجد التاريخية
 * الخريطة في مستكشف ملء الشاشة فقط؛ لا عنصر رئيسي على الصفحة.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Maximize2, Search } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { EMPTY } from "@/lib/ui-copy";
import { arabicMatchAny } from "@/lib/arabic-search";
import {
  ISLAMIC_LANDMARKS,
  LANDMARK_COUNTRIES,
  LANDMARK_ERAS,
  LANDMARK_TYPES,
  getFeaturedLandmarks,
  type LandmarkType,
} from "@/lib/islamic-landmarks-data";
import { ShareButtons } from "@/components/ContentActions";
import { AppPage, PageHeaderV2, EmptyStateV2 } from "@/components/design-system";
import { SearchField, FieldLabel } from "@/design-system";
import { SectionTitle, SupportingText } from "@/components/design-system/text";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LandmarkDiscoverCard } from "@/components/landmarks/LandmarkDiscoverCard";
import { FilterBottomSheet, FilterToggle } from "@/components/layout/FilterBottomSheet";
import "@/styles/islamic-landmarks.css";
import "@/styles/components/directory-media.css";

export default function IslamicLandmarksPage() {
  const [activeCountry, setActiveCountry] = useState<string>("الكل");
  const [activeEra, setActiveEra] = useState<string>("الكل");
  const [activeType, setActiveType] = useState<LandmarkType | "الكل">("الكل");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const featured = useMemo(() => getFeaturedLandmarks(), []);

  useEffect(() => {
    applyPageSeo({
      path: "/islamic-landmarks",
      title: "المشاهد الإسلامية والمساجد التاريخية | سُنّة",
      description:
        "استكشف أبرز المشاهد الإسلامية والمساجد التاريخية حول العالم: المسجد الحرام، المسجد النبوي، المسجد الأقصى، الجامع الأزهر، وأكثر من أربعين موقعًا",
      keywords: [
        "مساجد إسلامية",
        "مشاهد إسلامية",
        "المسجد الحرام",
        "المسجد الأقصى",
        "المسجد النبوي",
        "الجامع الأزهر",
        "مساجد العالم",
        "التراث الإسلامي",
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "المشاهد الإسلامية والمساجد التاريخية",
          url: "https://www.ssunnah.com/islamic-landmarks",
          description:
            "مجموعة أبرز المشاهد الإسلامية والمساجد التاريخية حول العالم مع معلومات تاريخية مفصلة.",
        },
      ],
    });
  }, []);

  const filtered = useMemo(() => {
    return ISLAMIC_LANDMARKS.filter((lm) => {
      if (activeCountry !== "الكل" && lm.country !== activeCountry) return false;
      if (activeEra !== "الكل" && lm.era !== activeEra) return false;
      if (activeType !== "الكل" && lm.type !== activeType) return false;
      if (search.trim()) {
        return arabicMatchAny(
          [lm.name, lm.city, lm.country, lm.description, ...lm.tags],
          search,
        );
      }
      return true;
    });
  }, [activeCountry, activeEra, activeType, search]);

  const activeFilterCount = [
    activeCountry !== "الكل",
    activeEra !== "الكل",
    activeType !== "الكل",
  ].filter(Boolean).length;

  return (
    <AppPage
        themeId="history"
        sectionRoute="/islamic-landmarks"
        title="المشاهد الإسلامية والمساجد التاريخية"
        subtitle="استكشف أبرز المساجد والمشاهد الإسلامية التاريخية حول العالم"
        eyebrow="الدليل الإسلامي"
        breadcrumb={[
          { label: "الرئيسية", href: "/" },
          { label: "الدليل الإسلامي", href: "/islamic-directory" },
          { label: "المشاهد الإسلامية" },
        ]}
      >
        <div className="ilm-discover" data-testid="ilm-discover" dir="rtl">
          <PageHeaderV2
            eyebrow="استكشاف"
            title="ابدأ الاستكشاف"
            description="بطاقات حديثة ومواقع مميزة — والخريطة في مستكشف ملء الشاشة عند الحاجة."
            actions={
              <Link
                href="/islamic-landmarks/map"
                className="ilm-cta"
                data-testid="ilm-open-map-explorer"
              >
                <Maximize2 size={15} aria-hidden />
                فتح مستكشف الخريطة
              </Link>
            }
          />

          {/* Featured */}
          {featured.length > 0 ? (
            <section className="ilm-featured" aria-labelledby="ilm-featured-title">
              <div className="ilm-section__head">
                <SectionTitle id="ilm-featured-title" className="ilm-section__title">
                  مواقع مميزة
                </SectionTitle>
                <SupportingText className="ilm-section__sub">
                  أبرز المشاهد التي يبدأ بها الاستكشاف
                </SupportingText>
              </div>
              <div className="ilm-featured__track">
                {featured.map((lm) => (
                  <LandmarkDiscoverCard key={lm.id} landmark={lm} variant="featured" />
                ))}
              </div>
            </section>
          ) : null}

          {/* Search + chips + filters */}
          <section className="ilm-discover__controls" aria-label="تصفية وبحث">
            <div className="ilm-search-wrap">
              <Search size={16} className="ilm-search__icon" aria-hidden />
              <SearchField value={search} onChange={setSearch} placeholder="ابحث عن مسجد أو مدينة..." label="البحث في المشاهد الإسلامية" />
            </div>

            <div className="ilm-chips" role="tablist" aria-label="تصنيفات المواقع">
              <Button
                type="button"
                variant="ghost"
                role="tab"
                aria-selected={activeType === "الكل"}
                className={`ilm-chip${activeType === "الكل" ? " ilm-chip--active" : ""}`}
                onClick={() => setActiveType("الكل")}
              >
                الكل
              </Button>
              {LANDMARK_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="ghost"
                  role="tab"
                  aria-selected={activeType === type}
                  className={`ilm-chip${activeType === type ? " ilm-chip--active" : ""}`}
                  onClick={() => setActiveType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="ilm-toolbar">
              <p className="ilm-count" aria-live="polite">
                {filtered.length === ISLAMIC_LANDMARKS.length
                  ? `${filtered.length} موقعًا`
                  : `${filtered.length} من أصل ${ISLAMIC_LANDMARKS.length}`}
              </p>
              <FilterToggle
                expanded={filtersOpen}
                onClick={() => setFiltersOpen(true)}
                label={
                  activeFilterCount > 0 ? `تصفية (${activeFilterCount})` : "تصفية متقدمة"
                }
              />
            </div>
          </section>

          <FilterBottomSheet
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            title="تصفية المشاهد"
          >
            <div className="ilm-sheet-filters">
              <div className="ilm-sheet-field">
                <FieldLabel>الدولة</FieldLabel>
                <Select value={activeCountry} onValueChange={setActiveCountry}>
                  <SelectTrigger className="ilm-select min-h-11 text-base" aria-label="فلترة حسب الدولة">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANDMARK_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ilm-sheet-field">
                <FieldLabel>الحقبة</FieldLabel>
                <Select value={activeEra} onValueChange={setActiveEra}>
                  <SelectTrigger className="ilm-select min-h-11 text-base" aria-label="فلترة حسب الحقبة">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">كل الحقب</SelectItem>
                    {LANDMARK_ERAS.map((era) => (
                      <SelectItem key={era} value={era}>
                        {era}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ilm-sheet-field">
                <FieldLabel>النوع</FieldLabel>
                <Select
                  value={activeType}
                  onValueChange={(v) => setActiveType(v as LandmarkType | "الكل")}
                >
                  <SelectTrigger className="ilm-select min-h-11 text-base" aria-label="فلترة حسب النوع">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">كل الأنواع</SelectItem>
                    {LANDMARK_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="primary"
                className="ilm-sheet-apply"
                onClick={() => setFiltersOpen(false)}
              >
                عرض النتائج ({filtered.length})
              </Button>
            </div>
          </FilterBottomSheet>

          {/* Catalog grid — لا خريطة هنا */}
          <section className="ilm-catalog" aria-labelledby="ilm-catalog-title">
            <SectionTitle id="ilm-catalog-title" className="ilm-section__title">
              جميع المواقع
            </SectionTitle>
            {filtered.length === 0 ? (
              <EmptyStateV2
                title={EMPTY.search}
                description="جرّب مسح التصفية أو تغيير كلمة البحث."
                ctaLabel="مسح التصفية"
                onCtaClick={() => {
                  setSearch("");
                  setActiveCountry("الكل");
                  setActiveEra("الكل");
                  setActiveType("الكل");
                }}
              />
            ) : (
              <div className="ilm-grid">
                {filtered.map((lm) => (
                  <LandmarkDiscoverCard key={lm.id} landmark={lm} />
                ))}
              </div>
            )}
          </section>

          <div className="ilm-share-wrap">
            <ShareButtons
              title="المواقع الإسلامية التاريخية | سُنّة"
              url="https://www.ssunnah.com/islamic-landmarks"
            />
          </div>
        </div>
      </AppPage>
  );
}
