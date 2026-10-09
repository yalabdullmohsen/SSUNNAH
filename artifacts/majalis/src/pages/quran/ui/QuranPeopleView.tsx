import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { applyPageSeo } from "@/lib/seo";
import { EMPTY } from "@/lib/ui-copy";
import { SectionTemplatePage } from "@/components/topic/TopicPage";
import { toArabicDigits } from "@/lib/utils";
import {
  loadQuranPeople,
  LISTABLE_PERSON_CATEGORIES,
  PERSON_CATEGORY_LABEL,
  MENTION_TYPE_LABEL,
  QURAN_PEOPLE_PAGE_TITLE,
  type QuranPerson,
  type PersonCategory,
} from "@/features/quran-people";
import "@/styles/pages/quran-hub.css";
import "@/styles/pages/quran-people.css";
import { NavigationBar, FieldLabel } from "@/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortMode = "alpha" | "mentions";

function nameGlyph(nameAr: string): string {
  const ch = Array.from(nameAr.trim())[0];
  return ch || "ذ";
}

export default function QuranPeopleView() {
  const [people, setPeople] = useState<QuranPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<PersonCategory | "all">("all");
  const [mention, setMention] = useState<"all" | "name" | "description">("all");
  const [sort, setSort] = useState<SortMode>("alpha");

  useEffect(() => {
    applyPageSeo({
      title: QURAN_PEOPLE_PAGE_TITLE,
      description: "فهرس المذكورين في القرآن الكريم بأسمائهم الصريحة من غير الأنبياء، مع مواضع الآيات وربط بقصص الأنبياء والأمم.",
      path: "/quran/people",
    });
    let cancelled = false;
    void loadQuranPeople().then((list) => {
      if (!cancelled) {
        setPeople(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = people;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (mention !== "all") list = list.filter((p) => p.mentionType === mention);
    const sorted = [...list];
    if (sort === "mentions") {
      sorted.sort((a, b) => b.occurrences.length - a.occurrences.length || a.nameAr.localeCompare(b.nameAr, "ar"));
    } else {
      sorted.sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
    }
    return sorted;
  }, [people, category, mention, sort]);

  return (
    <div className="sn-screen">
    <NavigationBar title="أعلام القرآن" large={false} />
    <SectionTemplatePage
      route="/quran/people"
      title={QURAN_PEOPLE_PAGE_TITLE}
      subtitle="أسماء صريحة بمواضع الآيات، مع تعريف موجز وعِبَر مرتبطة بالسياق القرآني"
      groupTitle="المذكورون في القرآن الكريم"
    >
    <div className="quran-hub-page qp-people" dir="rtl">
      <div className="qp-people__body">
        <p className="qp-people__intro">
          فهرس للمذكورين في القرآن الكريم بأسمائهم الصريحة من غير الأنبياء، مع مواضع الآيات وروابط للسياق.
          الأنبياء عليهم السلام في قسم مستقل.{" "}
          <Link href="/prophets">قصص الأنبياء</Link>
          {" · "}
          <Link href="/nations">الأمم السابقة</Link>
        </p>

        <div className="qp-people__toolbar">
          <div className="qp-people__filters">
            <div className="qp-people__filter-field">
              <FieldLabel>التصنيف</FieldLabel>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as PersonCategory | "all")}
              >
                <SelectTrigger className="min-h-11 text-base" aria-label="التصنيف">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {LISTABLE_PERSON_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{PERSON_CATEGORY_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="qp-people__filter-field">
              <FieldLabel>نوع الذكر</FieldLabel>
              <Select
                value={mention}
                onValueChange={(v) => setMention(v as typeof mention)}
              >
                <SelectTrigger className="min-h-11 text-base" aria-label="نوع الذكر">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل أنواع الذكر</SelectItem>
                  <SelectItem value="name">{MENTION_TYPE_LABEL.name}</SelectItem>
                  <SelectItem value="description">{MENTION_TYPE_LABEL.description}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="qp-people__filter-field">
              <FieldLabel>الترتيب</FieldLabel>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortMode)}
              >
                <SelectTrigger className="min-h-11 text-base" aria-label="الترتيب">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alpha">أبجدي</SelectItem>
                  <SelectItem value="mentions">الأكثر ذكراً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading && people.length === 0 ? (
          <p className="qp-people__status" role="status" aria-busy="true"></p>
        ) : filtered.length === 0 ? (
          <p className="qp-people__status">{EMPTY.searchShort}</p>
        ) : (
          <>
            <p className="qp-people__meta-count">
              {toArabicDigits(filtered.length)} اسم
            </p>
            <ul className="qp-people__grid" aria-busy={loading}>
              {filtered.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/quran/people/${p.slug}`}
                    className="qp-person-card"
                    data-category={p.category}
                  >
                    <div className="qp-person-card__top">
                      <span className="qp-person-card__glyph" aria-hidden="true">
                        {nameGlyph(p.nameAr)}
                      </span>
                      <div className="qp-person-card__heading">
                        <h2 className="qp-person-card__name">{p.nameAr}</h2>
                        <span className="qp-person-card__badge">
                          {PERSON_CATEGORY_LABEL[p.category]}
                        </span>
                      </div>
                    </div>
                    <p className="qp-person-card__def">{p.definition}</p>
                    <div className="qp-person-card__foot">
                      <span className="qp-person-card__meta">
                        {MENTION_TYPE_LABEL[p.mentionType]} · {toArabicDigits(p.occurrences.length)} موضع
                      </span>
                      <span className="qp-person-card__cta" aria-hidden="true">التفاصيل ←</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
    </SectionTemplatePage>
    </div>
  );
}
