import type { LucideIcon } from "lucide-react";
import {
  Bell, BellOff, BookHeart, BookMarked, BookOpen, BookOpenText, Bookmark, Calendar, CalendarPlus, Check,
  ChevronLeft, CircleDot, CircleHelp, Clock, Compass, Download, Ellipsis, Fingerprint, Footprints,
  GraduationCap, Hand, Headphones, Heart, House, Info, Landmark, Languages, Lightbulb, LogIn, MapPin,
  Moon, Palette, Play, RefreshCw, Scale, ScrollText, Search, Settings, Share2, Shield, ShieldCheck,
  Sparkles, Star, Sun, TriangleAlert, User, Users, WifiOff, X,
} from "lucide-react";

/**
 * مجموعة أيقونات واحدة (lucide بأسلوب SF Symbols: خط 1.75، أحجام 20/24) — أيقونة صحيحة لكل مفهوم.
 * لا تُستورد أيقونات مباشرة من lucide خارج هذا الملف في الشاشات المبنية على النظام.
 */
export const DS_ICONS = {
  home: House,
  quran: BookOpen,
  tafsir: BookOpenText,
  tilawa: Headphones,
  lessons: GraduationCap,
  hadith: ScrollText,
  adhkar: Sparkles,
  prayer: Moon,
  qibla: Compass,
  tasbih: Fingerprint,
  seerah: Footprints,
  fiqh: Scale,
  aqidah: ShieldCheck,
  stories: BookHeart,
  more: Ellipsis,
  search: Search,
  user: User,
  login: LogIn,
  settings: Settings,
  bell: Bell,
  bellOff: BellOff,
  calendar: Calendar,
  calendarAdd: CalendarPlus,
  location: MapPin,
  clock: Clock,
  share: Share2,
  bookmark: Bookmark,
  bookmarkFilled: BookMarked,
  heart: Heart,
  play: Play,
  download: Download,
  chevron: ChevronLeft,
  close: X,
  check: Check,
  info: Info,
  help: CircleHelp,
  warning: TriangleAlert,
  offline: WifiOff,
  refresh: RefreshCw,
  lightbulb: Lightbulb,
  hand: Hand,
  star: Star,
  mosque: Landmark,
  users: Users,
  language: Languages,
  appearance: Palette,
  sun: Sun,
  shield: Shield,
  beads: CircleDot,
} as const satisfies Record<string, LucideIcon>;

export type DsIconName = keyof typeof DS_ICONS;

type IconProps = {
  name: DsIconName;
  size?: 20 | 24;
  className?: string;
  /** تسمية VoiceOver؛ بدونها تُخفى الأيقونة عن قارئ الشاشة (زخرفية) */
  label?: string;
};

export function Icon({ name, size = 24, className, label }: IconProps) {
  const Cmp = DS_ICONS[name];
  return (
    <Cmp
      width={size}
      height={size}
      strokeWidth={1.75}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}
