/**
 * Quran Engine surface — dashboard + viewer under one Provider + ErrorBoundary.
 * Supports Focus Mode: hides engine nav while the mushaf fills the viewport.
 */
import { useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QuranEngineProvider } from "@/core/quran/QuranEngineContext";
import { QuranProvider } from "@/context/QuranContext";
import { HomeDashboard } from "@/components/HomeDashboard";
import { QuranViewer } from "@/components/QuranViewer";
import { ContentTabs } from "@/components/design-system/TabSystem";
import "@/styles/quran-engine-ui.css";

export default function QuranEnginePage() {
  const [mode, setMode] = useState<"dash" | "viewer">("dash");
  const [surah, setSurah] = useState<number | undefined>(undefined);
  const [focusMode, setFocusMode] = useState(false);

  return (
    <ErrorBoundary>
      <QuranEngineProvider>
        <QuranProvider>
        <main
          className={`qe-page${focusMode ? " qe-page--focus" : ""}`}
          dir="rtl"
          data-focus={focusMode ? "1" : "0"}
        >
          {!focusMode ? (
            <ContentTabs
              className="qe-page__nav"
              ariaLabel="محرك القرآن"
              idPrefix="qe"
              variant="pill"
              value={mode}
              onChange={(id) => {
                if (id === "dash") {
                  setFocusMode(false);
                  setMode("dash");
                  return;
                }
                setMode("viewer");
              }}
              items={[
                { id: "dash", label: "اللوحة" },
                { id: "viewer", label: "المصحف" },
              ]}
            />
          ) : null}
          {mode === "dash" ? (
            <HomeDashboard
              onOpenViewer={(s) => {
                setFocusMode(false);
                setSurah(s);
                setMode("viewer");
              }}
              onContinue={(p) => {
                setFocusMode(false);
                setSurah(p.lastSurah);
                setMode("viewer");
              }}
            />
          ) : (
            <QuranViewer initialSurah={surah} onFocusModeChange={setFocusMode} />
          )}
        </main>
        </QuranProvider>
      </QuranEngineProvider>
    </ErrorBoundary>
  );
}
