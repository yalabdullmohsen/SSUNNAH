/**
 * Discover — دليل المؤسسات الإسلامية
 * نفس تجربة المشاهد: Featured + chips + بطاقات؛ بلا خريطة رئيسية.
 */
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { EMPTY } from "@/lib/ui-copy";
import { arabicMatchAny } from "@/lib/arabic-search";
import { ShareButtons } from "@/components/ContentActions";
import { SectionQuiz } from "@/components/ui/SectionQuiz";
import { AppPage, PageHeaderV2, EmptyStateV2 } from "@/components/design-system";
import { SectionTitle, SupportingText } from "@/components/design-system/text";
import { FieldLabel } from "@/components/design-system/FormFields";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBottomSheet, FilterToggle } from "@/components/layout/FilterBottomSheet";
import { InstitutionDiscoverCard } from "@/components/institutions/InstitutionDiscoverCard";
import {
  INSTITUTIONS,
  INSTITUTION_COUNTRIES,
  getFeaturedInstitutions,
  type Institution,
} from "@/data/institutions-catalog";
import "@/styles/islamic-landmarks.css";
import "@/styles/components/directory-media.css";
import "@/styles/pages/institutions.css";

/** استبعاد أي إدخال مرتبط بمنتج المجمع/القرارات المحذوف */
const PUBLIC_INSTITUTIONS = INSTITUTIONS.filter(
  (i) =>
    !/fiqh-council|fiqh_council|fiqh-decision/i.test(i.id) &&
    !/مجمع الفقه|المجمع الفقهي|قرارات فقهية/.test(`${i.name} ${i.description}`),
);

const TYPE_FILTERS: { key: Institution["type"] | "الكل"; label: string }[] = [
  { key: "الكل", label: "الكل" },
  { key: "mosque", label: "المساجد" },
  { key: "university", label: "الجامعات" },
  { key: "center", label: "المراكز" },
  { key: "library", label: "المكتبات" },
];

export default function InstitutionsPage() {
  const [activeType, setActiveType] = useState<Institution["type"] | "الكل">("الكل");
  const [activeCountry, setActiveCountry] = useState<string>("الكل");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const featured = useMemo(() => getFeaturedInstitutions(), []);

  useEffect(() => {
    applyPageSeo({
      path: "/institutions",
      title: "المؤسسات الإسلامية | سُنّة",
      description:
        "دليل المؤسسات الإسلامية والمراكز الشرعية، مساجد ومعاهد وجامعات وهيئات إسلامية.",
      keywords: [
        "مؤسسات إسلامية",
        "مراكز إسلامية",
        "معاهد شرعية",
        "جامعات إسلامية",
        "هيئات دينية",
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "المؤسسات الإسلامية الكبرى",
          description: "دليل المساجد والمعاهد والجامعات والهيئات الإسلامية حول العالم.",
          numberOfItems: PUBLIC_INSTITUTIONS.length,
          itemListElement: PUBLIC_INSTITUTIONS.slice(0, 20).map((inst, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${inst.name} — ${inst.city}`,
            url: `https://www.ssunnah.com/institutions#${inst.id}`,
          })),
        },
      ],
    });
  }, []);

  const filtered = useMemo(() => {
    return PUBLIC_INSTITUTIONS.filter((inst) => {
      if (activeType !== "الكل" && inst.type !== activeType) return false;
      if (activeCountry !== "الكل" && inst.country !== activeCountry) return false;
      if (search.trim()) {
        return arabicMatchAny(
          [inst.name, inst.city, inst.country, inst.description],
          search,
        );
      }
      return true;
    });
  }, [activeType, activeCountry, search]);

  const activeFilterCount = [
    activeType !== "الكل",
    activeCountry !== "الكل",
  ].filter(Boolean).length;

  return (
    <AppPage
        themeId="history"
        sectionRoute="/institutions"
        title="دليل المؤسسات الإسلامية"
        subtitle="فهرس بأبرز المساجد والجامعات والمراكز البحثية والمكتبات الإسلامية في العالم."
        eyebrow="الدليل الإسلامي"
        breadcrumb={[
          { label: "الرئيسية", href: "/" },
          { label: "الدليل الإسلامي", href: "/islamic-directory" },
          { label: "المؤسسات" },
        ]}
      >
        <div className="ilm-discover inst-discover" data-testid="inst-discover" dir="rtl">
          <PageHeaderV2
            eyebrow="استكشاف"
            title="ابدأ الاستكشاف"
            description="بطاقات حديثة ومؤسسات مميزة — بنفس تجربة المساجد والمشاهد."
          />

          {featured.length > 0 ? (
            <section className="ilm-featured" aria-labelledby="inst-featured-title">
              <div className="ilm-section__head">
                <SectionTitle id="inst-featured-title" className="ilm-section__title">
                  مؤسسات مميزة
                </SectionTitle>
                <SupportingText className="ilm-section__sub">
                  أبرز المؤسسات التي يبدأ بها الاستكشاف
                </SupportingText>
              </div>
              <div className="ilm-featured__track">
                {featured.map((inst) => (
                  <InstitutionDiscoverCard
                    key={`featured-${inst.id}`}
                    institution={inst}
                    variant="featured"
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="ilm-discover__controls" aria-label="تصفية وبحث">
            <div className="ilm-search-wrap">
              <Search size={16} className="ilm-search__icon" aria-hidden />
              <input
                type="search"
                className="ilm-search"
                placeholder="ابحث باسم المؤسسة أو البلد أو المدينة…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="البحث في المؤسسات الإسلامية"
              />
            </div>

            <div className="ilm-chips" role="tablist" aria-label="تصفية حسب نوع المؤسسة">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={activeType === f.key}
                  className={`ilm-chip${activeType === f.key ? " ilm-chip--active" : ""}`}
                  onClick={() => setActiveType(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="ilm-toolbar">
              <p className="ilm-count" aria-live="polite">
                {filtered.length === PUBLIC_INSTITUTIONS.length
                  ? `${filtered.length} مؤسسة`
                  : `${filtered.length} من أصل ${PUBLIC_INSTITUTIONS.length}`}
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
            title="تصفية المؤسسات"
          >
            <div className="ilm-sheet-filters">
              <div className="ilm-sheet-field">
                <FieldLabel>الدولة</FieldLabel>
                <Select value={activeCountry} onValueChange={setActiveCountry}>
                  <SelectTrigger className="ilm-select min-h-11 text-base" aria-label="فلترة حسب الدولة">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country === "الكل" ? "كل الدول" : country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ilm-sheet-field">
                <FieldLabel>النوع</FieldLabel>
                <Select
                  value={activeType}
                  onValueChange={(v) => setActiveType(v as Institution["type"] | "الكل")}
                >
                  <SelectTrigger className="ilm-select min-h-11 text-base" aria-label="فلترة حسب النوع">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_FILTERS.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
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

          <section className="ilm-catalog" aria-labelledby="inst-catalog-title">
            <SectionTitle id="inst-catalog-title" className="ilm-section__title">
              جميع المؤسسات
            </SectionTitle>
            {filtered.length === 0 ? (
              <EmptyStateV2
                title={EMPTY.search}
                description="جرّب مسح التصفية أو تغيير كلمة البحث."
                ctaLabel="مسح التصفية"
                onCtaClick={() => {
                  setSearch("");
                  setActiveType("الكل");
                  setActiveCountry("الكل");
                }}
              />
            ) : (
              <div className="ilm-grid">
                {filtered.map((inst) => (
                  <InstitutionDiscoverCard key={inst.id} institution={inst} />
                ))}
              </div>
            )}
          </section>

          <p className="inst-disclaimer">
            * هذا الدليل مرجعي تعريفي. للتحقق من المعلومات يُرجى مراجعة المواقع الرسمية لكل مؤسسة.
          </p>

          <div className="ilm-share-wrap">
            <ShareButtons
              title="المؤسسات الإسلامية — سُنّة"
              url="https://www.ssunnah.com/institutions"
            />
          </div>
          <div className="inst-quiz-wrap">
            <SectionQuiz
              sectionId="islamic-history"
              title="اختبر معلوماتك حول المؤسسات والمعالم"
              count={4}
            />
          </div>
        </div>
      </AppPage>
  );
}
