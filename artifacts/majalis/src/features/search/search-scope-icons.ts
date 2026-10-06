/**
 * أيقونة واحدة لكل نطاق بحث — مطابقة لأيقونات سجل الأقسام (config/sections.registry.ts)
 * حتى يحمل كل نوع الأيقونة نفسها في كل الشاشات (lucide، خط موحّد).
 */
import {
  BookHeart,
  BookOpen,
  BookOpenCheck,
  BookText,
  FileText,
  Flame,
  GraduationCap,
  HandHeart,
  History,
  Library,
  Lightbulb,
  Mountain,
  Scale,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { SearchScopeId } from "@/features/search/search-scopes";

export const SEARCH_SCOPE_ICONS: Record<Exclude<SearchScopeId, "all">, LucideIcon> = {
  quran: BookOpen,
  tafsir: BookOpenCheck,
  seerah: Mountain,
  history: History,
  prophet: BookHeart,
  fiqh: Scale,
  hadith: ScrollText,
  adhkar: Flame,
  lesson: GraduationCap,
  fawaid: Lightbulb,
  discover: HandHeart,
  knowledge: Library,
  glossary: BookText,
  reference: FileText,
};
