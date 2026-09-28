/**
 * تعريفات lazy حسب المجال — تُستورد من AppRoutes فقط.
 * لا تستورد corpora عملاقة هنا.
 */
import { lazyWithRetry } from "@/lib/lazy-with-retry";

const lazy = lazyWithRetry;

export const NotFound = lazy(() => import("@/views/not-found"));

export const CalendarPage = lazy(() => import("@/views/CalendarPage"));

export const ScholarProfilePage = lazy(() => import("@/pages/scholars/ScholarProfilePage"));

export const ScientificAnnouncementDetailPage = lazy(() => import("@/views/ScientificAnnouncementDetailPage"));

export const MiraclesPage = lazy(() => import("@/views/MiraclesPage"));

export const PropheticMedicinePage = lazy(() => import("@/views/PropheticMedicinePage"));

export const TawhidPage = lazy(() => import("@/views/TawhidPage"));

export const TawhidTopicPage = lazy(() => import("@/views/TawhidTopicPage"));

export const DiscoverIslamPage = lazy(() => import("@/views/DiscoverIslamPage"));

export const DiscoverIslamQuestionsPage = lazy(() => import("@/views/DiscoverIslamQuestionsPage"));

export const DiscoverIslamQuestionDetailPage = lazy(() => import("@/views/DiscoverIslamQuestionDetailPage"));

export const DiscoverIslamDoubtsPage = lazy(() => import("@/views/DiscoverIslamDoubtsPage"));

export const DiscoverIslamDoubtDetailPage = lazy(() => import("@/views/DiscoverIslamDoubtDetailPage"));

export const DiscoverIslamArticleDetailPage = lazy(() => import("@/views/DiscoverIslamArticleDetailPage"));

export const HowToBecomeMuslimPage = lazy(() => import("@/views/HowToBecomeMuslimPage"));

export const NewMuslimPathPage = lazy(() => import("@/views/NewMuslimPathPage"));

export const NewMuslimDayDetailPage = lazy(() => import("@/views/NewMuslimDayDetailPage"));

export const DiscoverIslamContactPage = lazy(() => import("@/views/DiscoverIslamContactPage"));

export const KnowledgeSectionPage = lazy(() => import("@/views/KnowledgeSectionPage"));

export const SubmitContentPage = lazy(() => import("@/views/SubmitContentPage"));

export const TranscribePage = lazy(() => import("@/views/TranscribePage"));

export const AssistantGate = lazy(() => import("@/pages/assistant/AssistantGate"));

export const CardsPage = lazy(() => import("@/views/CardsPage"));

export const OccasionsPage = lazy(() => import("@/views/OccasionsPage"));

export const SujoodSahwPage = lazy(() => import("@/views/SujoodSahwPage"));

export const AmradQalbiyyaPage = lazy(() => import("@/views/AmradQalbiyyaPage"));

export const DurusImaniyyaPage = lazy(() => import("@/views/DurusImaniyyaPage"));

export const DurusMutanawwiaPage = lazy(() => import("@/views/DurusMutanawwiaPage"));

export const ImanTopicsPage = lazy(() => import("@/views/ImanTopicsPage"));

export const TazkiyaTopicsPage = lazy(() => import("@/views/TazkiyaTopicsPage"));

export const TarikhIslamiPage = lazy(() => import("@/views/TarikhIslamiPage"));

export const UsraMujtamaPage = lazy(() => import("@/views/UsraMujtamaPage"));

export const FikrWaqiaPage = lazy(() => import("@/views/FikrWaqiaPage"));

export const MawsuaatPage = lazy(() => import("@/views/MawsuaatPage"));

export const ArabicLanguagePage = lazy(() => import("@/views/ArabicLanguagePage"));

export const DalailNubuwwahPage = lazy(() => import("@/views/DalailNubuwwahPage"));

export const SeerahPage = lazy(() => import("@/views/SeerahPage"));

export const UpdatesPage = lazy(() => import("@/views/UpdatesPage"));

export const KnowledgeGraphPage = lazy(() => import("@/views/KnowledgeGraphPage"));

export const MindMapPage = lazy(() => import("@/views/MindMapPage"));

export const IslamicLandmarksPage = lazy(() => import("@/views/IslamicLandmarksPage"));

export const IslamicLandmarkDetailPage = lazy(() => import("@/views/IslamicLandmarkDetailPage"));

export const IslamicLandmarksMapExplorerPage = lazy(
  () => import("@/views/IslamicLandmarksMapExplorerPage"),
);

export const MutashabihatPage = lazy(() => import("@/views/MutashabihatPage"));

export const TarikhIslamiDetailPage = lazy(() => import("@/views/TarikhIslamiDetailPage"));

export const AsmaaHusnaPage = lazy(() => import("@/views/AsmaaHusnaPage"));

export const AkhlaqPage = lazy(() => import("@/views/AkhlaqPage"));

export const ArkanIslamPage = lazy(() => import("@/views/ArkanIslamPage"));

export const ArkanImanPage = lazy(() => import("@/views/ArkanImanPage"));

export const IslamicSectsPage = lazy(() => import("@/views/IslamicSectsPage"));

export const IslamicSectsDetailPage = lazy(() => import("@/views/IslamicSectsDetailPage"));

export const ShimaelPage = lazy(() => import("@/views/ShimaelPage"));

export const IslamStatsPage = lazy(() => import("@/views/IslamStatsPage"));

export const AdabTalabIlmPage = lazy(() => import("@/views/AdabTalabIlmPage"));

export const JannaNaarPage = lazy(() => import("@/views/JannaNaarPage"));

export const AlamatSaahPage = lazy(() => import("@/views/AlamatSaahPage"));

export const MalaikaPage = lazy(() => import("@/views/MalaikaPage"));

export const WasayaNabawiyyaPage = lazy(() => import("@/views/WasayaNabawiyyaPage"));

export const RaqaiqPage = lazy(() => import("@/views/RaqaiqPage"));

export const SunanYawmiyyaPage = lazy(() => import("@/views/SunanYawmiyyaPage"));

export const HikamSalafPage = lazy(() => import("@/views/HikamSalafPage"));

export const SawmPage = lazy(() => import("@/views/SawmPage"));

export const TaharaPage = lazy(() => import("@/views/TaharaPage"));

export const FadailAamalPage = lazy(() => import("@/views/FadailAamalPage"));

export const SahabahPage = lazy(() => import("@/views/SahabahPage"));

export const TawbaPage = lazy(() => import("@/views/TawbaPage"));

export const SinsAndRightsPage = lazy(() => import("@/views/SinsAndRightsPage"));

export const SinsAndRightsDetailPage = lazy(() => import("@/views/SinsAndRightsDetailPage"));

export const TazkiyaHubPage = lazy(() => import("@/pages/tazkiya/TazkiyaHubPage"));

export const AmrBilMarufPage = lazy(() => import("@/views/AmrBilMarufPage"));

export const IslamicDirectoryHubPage = lazy(() => import("@/views/IslamicDirectoryHubPage"));

export const RibaPage = lazy(() => import("@/views/RibaPage"));

export const UdhiyaPage = lazy(() => import("@/views/UdhiyaPage"));

export const RuqyaPage = lazy(() => import("@/views/RuqyaPage"));

export const JumuahPage = lazy(() => import("@/views/JumuahPage"));

export const WaqfPage = lazy(() => import("@/views/WaqfPage"));

export const SadaqaPage = lazy(() => import("@/views/SadaqaPage"));

export const UploadPage = lazy(() => import("@/views/UploadPage"));

export const MySubmissionsPage = lazy(() => import("@/views/MySubmissionsPage"));

export const UserStatsPage = lazy(() => import("@/views/UserStatsPage"));

export const CarModePage = lazy(() => import("@/views/CarModePage"));

export const MosqueModePage = lazy(() => import("@/views/MosqueModePage"));

export const StudyRoomPage = lazy(() => import("@/views/StudyRoomPage"));

export const FamilyModePage = lazy(() => import("@/views/FamilyModePage"));

export const VaultPage = lazy(() => import("@/views/VaultPage"));

export const ResearcherProfilePage = lazy(() => import("@/views/ResearcherProfilePage"));

export const InstitutionsPage = lazy(() => import("@/views/InstitutionsPage"));

export const AuthCallbackPage = lazy(() => import("@/views/AuthCallbackPage"));

export const UpdatePasswordPage = lazy(() => import("@/views/UpdatePasswordPage"));

export const ProphetStoriesPage = lazy(() => import("@/views/ProphetStoriesPage"));

export const NationsPage = lazy(() => import("@/views/NationsPage"));

export const NationDetailPage = lazy(() => import("@/views/NationDetailPage"));

export const ProphetsFamilyTreePage = lazy(() => import("@/views/ProphetsFamilyTreePage"));

export const IslamicStoriesPage = lazy(() => import("@/views/IslamicStoriesPage"));

export const CitationPublicPage = lazy(() => import("@/views/CitationPublicPage"));

export const ResearchAssistantPage = lazy(() => import("@/views/ResearchAssistantPage"));

export const UniversitiesPage = lazy(() => import("@/views/UniversitiesPage"));

export const UniversityDetailPage = lazy(() => import("@/views/UniversityDetailPage"));

export const UniversitiesComparePage = lazy(() => import("@/views/UniversitiesComparePage"));

export const AcademicResearchPage = lazy(() => import("@/views/AcademicResearchPage"));
export const ResearchDetailPage = lazy(() => import("@/views/ResearchDetailPage"));
export const ResearchSubmitPage = lazy(() => import("@/views/ResearchSubmitPage"));
