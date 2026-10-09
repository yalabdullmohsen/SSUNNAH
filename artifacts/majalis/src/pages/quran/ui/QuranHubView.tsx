import { useEffect, useMemo } from "react";
import { applyPageSeo } from "@/lib/seo";
import { SectionLobby } from "@/components/lobby/SectionLobby";
import { QuranOpenMushafCard } from "@/components/quran/QuranOpenMushafCard";
import { getLobby } from "@/config/section-lobbies";
import { ButtonLink, EmptyState, NavigationBar } from "@/design-system";
import "@/components/sections/section-cards.css";
import "@/styles/pages/quran-hub-v2.css";
import "@/styles/sunnah-identity-home-hub.css";

export default function QuranHubPage() {
  const lobby = useMemo(() => getLobby("quran"), []);
  const hasGroups = (lobby.groups?.length ?? 0) > 0;
  // primary: open-mushaf — بطاقة مخصّصة خفيفة بدل المستطيل الأخضر الضخم
  // empty/error/noResults: NOT_APPLICABLE — لوبي ثابت من السجل (لا fetch قائمة)
  // offline: OfflineBanner العام في App

  useEffect(() => {
    applyPageSeo({
      path: "/quran-hub",
      title: "مركز القرآن الكريم — سُنّة",
      description: "مركز القرآن الكريم: المصحف والتفسير والتلاوة وعلوم القرآن والإحصاءات الموثّقة.",
      keywords: ["القرآن الكريم", "المصحف", "تفسير", "تلاوة"],
    });
  }, []);

  return (
    <div className="sn-screen quran-hub-v2">
    <NavigationBar title="القرآن الكريم" large={false} />
      {hasGroups ? (
        <SectionLobby
          lobbyId="quran"
          title={lobby.title}
          primarySlot={
            <div className="quran-hub-v2__primary">
              {/* بطاقة واحدة للمتابعة: تقرأ علامة القراءة ثم آخر صفحة */}
              <QuranOpenMushafCard />
            </div>
          }
          groups={lobby.groups}
        />
      ) : (
        <EmptyState
          title="مركز القرآن غير متاح مؤقتًا"
          description="تعذّر تجهيز أقسام المركز من السجل المحلي."
          action={<ButtonLink href="/" variant="secondary">الرئيسية</ButtonLink>}
        />
      )}
    </div>
  );
}
