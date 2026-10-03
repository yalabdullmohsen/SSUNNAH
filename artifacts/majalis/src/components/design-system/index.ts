/**
 * نظام مكوّنات واجهة سُنّة — بطاقات وأزرار ونص دلالي.
 * SectionCard / LessonCard / FloatingBack موجودة مسبقًا وتُعاد تصديرها هنا.
 */
export { AppCard, type AppCardProps } from "./AppCard";
export {
  InteractiveCard,
  StatusCard,
  InsetSurface,
  ElevatedSurface,
  type InteractiveCardProps,
  type StatusCardProps,
} from "./SurfacePrimitives";
export { SunnahCardV2, type SunnahCardV2Props } from "./SunnahCardV2";
export { PageHeaderV2, type PageHeaderV2Props } from "./PageHeaderV2";
export { EmptyStateV2, type EmptyStateV2Props } from "./EmptyStateV2";
export { NoResultsState, type NoResultsStateProps } from "./NoResultsState";
export { LoadingStateV2, type LoadingStateV2Props } from "./LoadingStateV2";
export { ErrorStateV2, type ErrorStateV2Props } from "./ErrorStateV2";
export { OfflineStateV2, type OfflineStateV2Props } from "./OfflineStateV2";
export { StaleDataIndicator, type StaleDataIndicatorProps } from "./StaleDataIndicator";
export { PermissionDeniedState, type PermissionDeniedStateProps } from "./PermissionDeniedState";
export { RateLimitedState, type RateLimitedStateProps } from "./RateLimitedState";
export { PageContainer, type PageContainerProps, type PageContainerWidth } from "./PageContainer";
export {
  NavigationCardV2,
  ContentCardV2,
  ContinueCardV2,
  EvidenceBlockV2,
  WarningBlockV2,
  SummaryBlockV2,
  CS2_CARD_TYPES,
  type Cs2CardTypeName,
} from "./CardSystemV2";
export {
  SF2_SURFACE,
  SF2_TEXT,
  SF2_ACTION,
  SF2_GOLD,
  SF2_GOLD_POLICY,
  SF2_STATUS,
  SF2_RADIUS,
  SF2_CONTRAST_NOTES,
} from "@/lib/sunnah-foundation-v2";
export { FeatureCard, type FeatureCardProps } from "./FeatureCard";
/** نظام البطاقات الرسمي — الأنواع العشرة فقط */
export {
  HeroCard,
  CourseCard,
  QuranCard,
  ReferenceCard,
  ActionCard,
  CS_CARD_TYPES,
  type HeroCardProps,
  type CourseCardProps,
  type ActionCardProps,
  type CsCardTypeName,
} from "./CardSystem";
export {
  RelatedContentCard,
  RelatedContentStack,
  type RelatedContentCardProps,
} from "@/components/content/RelatedContentCard";
export { HadithCard } from "@/components/hadith/HadithCard";
export {
  CompactNavigationCard,
  ContentRow,
  DetailSection,
  QuoteSurface,
  StatusNotice,
  type CompactNavigationCardProps,
  type ContentRowProps,
  type DetailSectionProps,
  type QuoteSurfaceProps,
  type StatusNoticeProps,
} from "./IdentitySurfaces";
export { ContentCard, type ContentCardProps } from "./ContentCard";
export { ActionButton, type ActionButtonProps } from "./ActionButton";
export { PrimaryButton, SecondaryButton, IconButton, LinkButton, ToggleButton } from "./Buttons";
export {
  SimpleList,
  InteractiveList,
  NavigationList,
  ResultList,
} from "./ListSystem";
export { ConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";
export {
  ContentTabs,
  PageTabs,
  type ContentTabItem,
} from "./TabSystem";
export {
  SearchInput as SearchSystemInput,
  SearchResultCard,
  isBlockedSearchHref,
  type SearchResultItem,
} from "./SearchSystem";
export {
  FilterChip,
  SegmentedFilter,
  FilterBar,
  FilterSheet,
  ActiveFilters,
  FilterResetButton,
  UnifiedFilterBar,
  UnifiedPrimaryFilters,
} from "./FilterSystem";
export {
  LoadingStateV2 as AppLoadingState,
  EmptyStateV2 as AppEmptyState,
  NoResultsState as AppNoResultsState,
  ErrorStateV2 as AppErrorState,
  OfflineStateV2 as AppOfflineState,
  StaleDataIndicator as AppStaleState,
  PermissionDeniedState as AppPermissionDeniedState,
  RateLimitedState as AppRateLimitedState,
} from "./StateSystem";
export {
  PageTitle,
  SubtitleText,
  MetaText,
} from "./TypographySystem";
export { SettingsList, type SettingsListRow } from "./SettingsList";
export {
  FormLabel,
  FieldLabel,
  FieldDescription,
  FieldError,
  FormActions,
  FormPrimaryButton,
  FormSecondaryButton,
  SearchInput,
  type FormLabelProps,
  type FieldDescriptionProps,
  type FieldErrorProps,
  type FormActionsProps,
  type FormPrimaryButtonProps,
  type FormSecondaryButtonProps,
  type SearchInputProps,
} from "./FormFields";

export {
  SsText,
  ScreenTitle,
  SectionTitle,
  CardTitle,
  BodyText,
  ScriptureText,
  ExplanationText,
  SupportingText,
  LabelText,
  LabelText as SsLabel,
  Caption,
  type SsTextProps,
  type SsTextTone,
} from "./text";

export { SectionCard } from "@/components/sections/SectionCard";
export { FeaturedSectionCard } from "@/components/sections/FeaturedSectionCard";
/** بطاقة شبكة الأقسام — سطح عبر سلطة البطاقات (AppCard / cs-card) */
export { SectionEntryCard, HubCard as SectionHubCard, HubCard as NavigationCard } from "@/components/ui/HubCard";
export type { SectionEntryCardProps, SectionEntryVariant } from "@/components/ui/HubCard";
export { UnifiedLessonCard as LessonCard } from "@/components/lessons/UnifiedLessonCard";
export { FloatingBackButton, AppBackButton } from "@/components/FloatingBackButton";
export { LazyRouteFallback as RouteFallback, LazyRouteFallback } from "@/components/LazyRouteFallback";
export { EmptyState, Empty as NoticeEmpty } from "@/components/ui-common";
export { TopicPage as AppPage, SectionTemplatePage } from "@/components/topic/TopicPage";
export { SectionHero } from "@/components/topic/SectionHero";
export {
  ScreenShell,
  GridScreen,
  ListScreen,
  ReaderScreen,
  ScriptureScreen,
  PlayerScreen,
  DetailScreen,
  DashboardScreen,
  UtilityScreen,
  type ScreenShellProps,
  type ScreenShellStatus,
} from "./screens";

export {
  SS_SCREEN_PATTERNS,
  SS_SCREEN_PATTERN_META,
  SS_SCREEN_ROUTE_PATTERN,
  isSsScreenPattern,
  type SsScreenPattern,
  type SsScreenDensity,
  type SsScreenColumns,
} from "@/lib/ssunnah-screen-patterns";

export {
  GeometricMotif,
  GeometricDivider,
  IconMedallion,
  HeaderOrnament,
  type GeometricMotifProps,
  type GeometricDividerProps,
  type IconMedallionProps,
  type HeaderOrnamentProps,
} from "./geometry";

/** رؤوس موحّدة — CompactSectionHeader هو SectionHeader في SVL PR-3 */
export {
  CompactSectionHeader,
  SectionIntroHeader,
  SectionHeader,
  type CompactSectionStat,
} from "@/components/ui/CompactSectionHeader";
export {
  SvlSectionHeader,
  type SvlSectionHeaderProps,
} from "./headers/SvlSectionHeader";

export {
  ContentSection,
  DefinitionBox,
  EvidenceBox,
  SourceBox,
  RelatedLinksBox,
  FAQBox,
  QuotePanel,
  ContentDetailReadingShell,
} from "@/components/content/ContentReading";

export {
  TopicCard,
  InternalLinkCard,
  ReadingCard,
} from "@/components/ui/InternalCards";

export {
  SS_TYPE,
  SS_COLOR,
  SS_SPACE,
  SS_RADIUS,
  SS_TEXT_ROLES,
  type SsTextRole,
} from "@/lib/ssunnah-theme";