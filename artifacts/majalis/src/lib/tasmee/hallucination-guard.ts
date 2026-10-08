/**
 * فلتر الكلمات الوهمية (hallucination): Whisper على ضوضاء ثابتة (مكيّف، شارع، ضجيج وردي) يكرّر خرجًا واحدًا حرفيًا في كل نافذة
 * (قيس: «وَالْمُؤْمِنِينَ» ×128). الفلتر يمنع الكشف بمثل هذا الخرج حتى لو كانت الكلمة المكررة هي التالية المتوقعة.
 *
 * القاعدة: لا يُستعمل للكشف إلا نص **جديد** (يختلف عن نص النافذة السابقة). النص المكرر حرفيًا لا يحمل معلومة جديدة
 * (في التلاوة الحقيقية تتغيّر النافذة مع كل كلمة)، وتكراره 3 نوافذ متتالية فأكثر = وهم يُتجاهل حتى يتغيّر الخرج.
 * أول نافذة في الحلقة (بعد صمت ≥ EPISODE_GAP_MS) تُحفظ ولا تُستعمل حتى تأتي نافذة مختلفة، فلا يكشف خرج وهمي من أول نافذة؛
 * الثمن: تأخير نحو نبضة واحدة (0.5ث) لأول كلمة بعد كل صمت طويل فقط.
 */

/** صمت (بلا فك) أطول من هذا يبدأ «حلقة» جديدة. */
export const HALLUCINATION_EPISODE_GAP_MS = 2500;
/** عدد النوافذ المتتالية المتطابقة حرفيًا الذي يُعدّ وهمًا. */
export const HALLUCINATION_REPEAT_LIMIT = 3;

export type GateDecision = "use" | "warmup" | "repeat" | "hallucination";

export class HallucinationGuard {
  private last: string | null = null;
  private lastAtMs = -Infinity;
  private same = 0;

  /** يُحكم على النافذة الواردة: هل يُسمح بالكشف بها؟ */
  decide(text: string, atMs: number): GateDecision {
    const norm = text.trim().replace(/\s+/g, " ");
    const newEpisode = this.last === null || atMs - this.lastAtMs > HALLUCINATION_EPISODE_GAP_MS;
    this.lastAtMs = atMs;
    if (newEpisode) {
      this.last = norm;
      this.same = 1;
      return "warmup";
    }
    if (norm === this.last) {
      this.same += 1;
      return this.same >= HALLUCINATION_REPEAT_LIMIT ? "hallucination" : "repeat";
    }
    this.last = norm;
    this.same = 1;
    return "use";
  }

  reset(): void {
    this.last = null;
    this.same = 0;
    this.lastAtMs = -Infinity;
  }
}
