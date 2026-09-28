/**
 * Telegram Webhook — receives updates from Telegram Bot API.
 * Production: TELEGRAM_WEBHOOK_SECRET required (fail-closed).
 */
import { sendJson, endEmpty } from "../../api/_http.mjs";
import { addSubscriber, removeSubscriber } from "../../telegram/subscriber-service.mjs";
import { sendMessage } from "../../telegram/bot.mjs";
import { storeRawMessage } from "../../telegram/channel-monitor.mjs";
import { isProductionEnv, safeSecretEqual } from "../../api-security-policy.mjs";

const WELCOME = `🕌 <b>أهلاً بك في سُنّة!</b>

تطبيق العلم الشرعي — دروس وقرآن وعلم نافع.

ستصلك إشعارات الدروس والمحتوى الجديد تلقائياً.

أرسل /stop لإلغاء الاشتراك في أي وقت.`;

const GOODBYE = `تم إلغاء اشتراكك بنجاح.\n\nأرسل /start للاشتراك مجدداً في أي وقت.`;

const HELP = `🕌 <b>سُنّة — تطبيق العلم الشرعي</b>

/start — الاشتراك في الإشعارات
/stop — إلغاء الاشتراك
/help — عرض هذه الرسالة`;

const seenUpdateIds = new Map();
const DEDUPE_TTL_MS = 10 * 60_000;

function rememberUpdate(id) {
  if (id == null) return false;
  const key = String(id);
  const now = Date.now();
  for (const [k, ts] of seenUpdateIds) {
    if (now - ts > DEDUPE_TTL_MS) seenUpdateIds.delete(k);
  }
  if (seenUpdateIds.has(key)) return true;
  seenUpdateIds.set(key, now);
  return false;
}

export default async function handler(req, res) {
  const expectedSecret = String(process.env.TELEGRAM_WEBHOOK_SECRET || "").trim();
  const secretHeader = String(req.headers?.["x-telegram-bot-api-secret-token"] || "").trim();

  if (!expectedSecret) {
    if (isProductionEnv()) {
      sendJson(res, 503, { ok: false });
      return;
    }
  } else if (!safeSecretEqual(secretHeader, expectedSecret)) {
    sendJson(res, 403, { ok: false });
    return;
  }

  if (req.method !== "POST") {
    endEmpty(res, 405);
    return;
  }

  const update = req.body;
  if (rememberUpdate(update?.update_id)) {
    endEmpty(res, 200);
    return;
  }

  const channelPost = update?.channel_post || update?.edited_channel_post;
  if (channelPost) {
    try {
      await storeRawMessage(channelPost);
    } catch (err) {
      console.error("[telegram-webhook] storeRawMessage error:", err?.code || "err");
    }
    endEmpty(res, 200);
    return;
  }

  const msg = update?.message || update?.edited_message;

  if (!msg) {
    endEmpty(res, 200);
    return;
  }

  const chatId = msg.chat?.id;
  const text = String(msg.text || "").trim();
  const username = msg.from?.username || msg.from?.first_name || null;

  if (!chatId) {
    endEmpty(res, 200);
    return;
  }

  try {
    if (text.startsWith("/start")) {
      await addSubscriber(chatId, username);
      await sendMessage(chatId, WELCOME);
    } else if (text.startsWith("/stop")) {
      await removeSubscriber(chatId);
      await sendMessage(chatId, GOODBYE);
    } else if (text.startsWith("/help")) {
      await sendMessage(chatId, HELP);
    } else {
      await sendMessage(chatId, "أرسل /help لعرض الأوامر المتاحة.");
    }
  } catch (err) {
    console.error("[telegram-webhook] command error:", err?.code || "err");
  }

  endEmpty(res, 200);
}
