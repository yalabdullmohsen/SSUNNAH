/**
 * جلسة صوت المصحف — تُحمَّل عند أول تفاعل تلاوة فقط (Stage 6).
 * تُبقي محرّك الصوت خارج مسار الرسم الأول.
 */

import type { PlayerState } from "@/core/audio/AudioEngine";

export type MushafAudioSession = {
  audio: ReturnType<typeof import("@/core/audio/AudioEngine").getAudioEngine>;
  recitation: ReturnType<
    typeof import("@/lib/quran/quranRecitationService").getQuranRecitationService
  >;
  QuranRecitationService: typeof import("@/lib/quran/quranRecitationService").QuranRecitationService;
  unlockAudioOnUserGesture: typeof import("@/lib/quran/quranRecitationService").unlockAudioOnUserGesture;
};

let session: MushafAudioSession | null = null;
let loading: Promise<MushafAudioSession> | null = null;

export function isMushafAudioSessionReady(): boolean {
  return session != null;
}

export function getMushafAudioSessionOrNull(): MushafAudioSession | null {
  return session;
}

export async function ensureMushafAudioSession(): Promise<MushafAudioSession> {
  if (session) return session;
  if (!loading) {
    loading = Promise.all([
      import("@/core/audio/AudioEngine"),
      import("@/lib/quran/quranRecitationService"),
    ]).then(([ae, qr]) => {
      session = {
        audio: ae.getAudioEngine(),
        recitation: qr.getQuranRecitationService(),
        QuranRecitationService: qr.QuranRecitationService,
        unlockAudioOnUserGesture: qr.unlockAudioOnUserGesture,
      };
      return session;
    });
  }
  return loading;
}

export type { PlayerState };
