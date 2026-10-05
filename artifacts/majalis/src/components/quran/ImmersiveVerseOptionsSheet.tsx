/**
 * Flutter `showModalBottomSheet` — Master Prompt options:
 * Audio · Tafsir · Copy · Bookmark — callbacks only (loose coupling).
 */
import { BookOpen, Bookmark, BookmarkCheck, Copy, Pause, Play, X } from "lucide-react";
import { createPortal } from "react-dom";
import { IMMERSIVE_PAPER_BG } from "@/lib/quran-immersive";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";

export type ImmersiveVerseOptionsSheetProps = {
  verseText: string;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  onTafsir: () => void;
  onClose: () => void;
  paperBg?: string;
  /** نسخ الآية */
  onCopy?: () => void;
  /** فاصلة مرجعية */
  onToggleBookmark?: () => void;
  bookmarked?: boolean;
  copyStatus?: string | null;
  playLabelPlaying?: string;
  playLabelIdle?: string;
  tafsirLabel?: string;
  copyLabel?: string;
};

export function ImmersiveVerseOptionsSheet({
  verseText,
  isPlaying,
  onTogglePlayback,
  onTafsir,
  onClose,
  paperBg = IMMERSIVE_PAPER_BG,
  onCopy,
  onToggleBookmark,
  bookmarked = false,
  copyStatus = null,
  playLabelPlaying = "إيقاف",
  playLabelIdle = "استماع",
  tafsirLabel = "تفسير الآية",
  copyLabel = "نسخ الآية",
}: ImmersiveVerseOptionsSheetProps) {
  const sheet = (
    <div className="immersive-verse-sheet-overlay">
      <Button
        type="button"
        variant="ghost"
        className="immersive-verse-sheet-overlay__backdrop"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div
        className="immersive-verse-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="خيارات الآية"
        style={{ backgroundColor: paperBg }}
      >
        <div className="immersive-verse-sheet__handle" aria-hidden="true" />
        <div className="immersive-verse-sheet__head">
          <p className="immersive-verse-sheet__preview">{verseText}</p>
          <IconButton
            type="button"
            className="immersive-verse-sheet__close"
            onClick={onClose}
            label="إغلاق"
          >
            <X size={18} aria-hidden="true" />
          </IconButton>
        </div>
        {copyStatus ? (
          <p className="immersive-verse-sheet__status" role="status">
            {copyStatus}
          </p>
        ) : null}
        <ul className="immersive-verse-sheet__list">
          <li>
            <Button
              type="button"
              variant="ghost"
              className="immersive-verse-sheet__row"
              onClick={onTogglePlayback}
            >
              {isPlaying ? (
                <Pause size={20} aria-hidden="true" />
              ) : (
                <Play size={20} aria-hidden="true" />
              )}
              <span>{isPlaying ? playLabelPlaying : playLabelIdle}</span>
            </Button>
          </li>
          <li>
            <Button
              type="button"
              variant="ghost"
              className="immersive-verse-sheet__row"
              onClick={() => {
                onTafsir();
                onClose();
              }}
            >
              <BookOpen size={20} aria-hidden="true" />
              <span>{tafsirLabel}</span>
            </Button>
          </li>
          {onCopy ? (
            <li>
              <Button type="button" variant="ghost"
              className="immersive-verse-sheet__row" onClick={onCopy}>
                <Copy size={20} aria-hidden="true" />
                <span>{copyLabel}</span>
              </Button>
            </li>
          ) : null}
          {onToggleBookmark ? (
            <li>
              <Button
                type="button"
                variant="ghost"
              className="immersive-verse-sheet__row"
                onClick={onToggleBookmark}
              >
                {bookmarked ? (
                  <BookmarkCheck size={20} aria-hidden="true" />
                ) : (
                  <Bookmark size={20} aria-hidden="true" />
                )}
                <span>{bookmarked ? "إزالة الفاصلة" : "إضافة فاصلة"}</span>
              </Button>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );

  if (typeof document === "undefined") return sheet;
  return createPortal(sheet, document.body);
}

export default ImmersiveVerseOptionsSheet;
