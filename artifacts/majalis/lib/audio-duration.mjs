/**
 * فحص النوع الحقيقي للصوت ومدته من الترويسة/بنية الحاويات دون فك ترميز — بلا مكتبات.
 * الصيغ: WAV (PCM) · WebM/Opus (MediaRecorder في Chrome) · Ogg (Opus/Vorbis) · MP4/M4A (AAC، ومجزّأ fMP4 في Safari).
 * يُرجع { format, durationMs } أو null إن لم تُعرَف الصيغة. durationMs = null إن تعذّر حساب مدة موثوقة (تُقدَّر حينها بـestimateDurationMs).
 * WebM بلا عنصر Duration (Chrome) تُحسب مدته من آخر timestamp في الـclusters.
 * النوع يُحدَّد من البايتات السحرية لا من الامتداد ولا من mime المُعلَن.
 */

const MAX_STEPS = 200_000;

export function detectAudioFormat(buf) {
  if (buf.length < 12) return null;
  if (buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WAVE") return "wav";
  if (buf.readUInt32BE(0) === 0x1a45dfa3) return "webm";
  if (buf.toString("latin1", 0, 4) === "OggS") return "ogg";
  if (buf.toString("latin1", 4, 8) === "ftyp") return "mp4";
  return null;
}

/** mime المُعلَن → عائلة الحاوية المتوقعة. */
export function familyOfMime(mime) {
  if (mime === "audio/webm") return "webm";
  if (mime === "audio/ogg") return "ogg";
  if (mime === "audio/mp4" || mime === "audio/x-m4a" || mime === "audio/m4a") return "mp4";
  if (mime === "audio/wav" || mime === "audio/x-wav") return "wav";
  return null;
}

export function probeAudio(buf) {
  const format = detectAudioFormat(buf);
  if (!format) return null;
  let durationMs = null;
  try {
    if (format === "wav") durationMs = wavDuration(buf);
    else if (format === "webm") durationMs = webmDuration(buf);
    else if (format === "ogg") durationMs = oggDuration(buf);
    else durationMs = mp4Duration(buf);
  } catch {
    durationMs = null;
  }
  if (!Number.isFinite(durationMs) || durationMs <= 0) durationMs = null;
  return { format, durationMs };
}

/** معدّل بتات متحفظ (منخفض) لتقدير حدّ أعلى للمدة من الحجم حين تتعذّر قراءتها: Opus/AAC الكلامي ≥ ~24kbps عادةً. */
export const CONSERVATIVE_BITRATE_BPS = 24_000;

export function estimateDurationMs(bytes) {
  return (bytes * 8 * 1000) / CONSERVATIVE_BITRATE_BPS;
}

/* ───────── WAV ───────── */
function wavDuration(buf) {
  let off = 12;
  let byteRate = 0;
  let steps = 0;
  while (off + 8 <= buf.length && steps++ < 64) {
    const id = buf.toString("latin1", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === "fmt ") {
      const tag = buf.readUInt16LE(body);
      if (tag !== 1 && tag !== 3 && tag !== 0xfffe) return null;
      byteRate = buf.readUInt32LE(body + 8);
    } else if (id === "data") {
      const avail = buf.length - body;
      const bytes = size === 0 || size === 0xffffffff || size > avail ? avail : size;
      return byteRate > 0 ? (bytes / byteRate) * 1000 : null;
    }
    off = body + size + (size % 2);
  }
  return null;
}

/* ───────── Ogg (Opus / Vorbis) ───────── */
function oggDuration(buf) {
  const head = buf.subarray(0, Math.min(buf.length, 512));
  const opusAt = head.indexOf("OpusHead");
  const vorbisAt = head.indexOf("\x01vorbis", 0, "latin1");
  let rate;
  let preSkip = 0;
  if (opusAt >= 0) {
    rate = 48000;
    preSkip = buf.readUInt16LE(opusAt + 10);
  } else if (vorbisAt >= 0) {
    rate = buf.readUInt32LE(vorbisAt + 12);
  } else return null;
  // آخر صفحة OggS: granule position = إجمالي العينات
  const last = buf.lastIndexOf("OggS", buf.length - 27, "latin1");
  if (last < 0 || last + 14 > buf.length) return null;
  const granule = buf.readBigUInt64LE(last + 6);
  if (granule === 0xffffffffffffffffn || rate <= 0) return null;
  const samples = Number(granule) - preSkip;
  return samples > 0 ? (samples / rate) * 1000 : null;
}

/* ───────── WebM / Matroska (EBML) ───────── */
const ID = {
  Segment: 0x18538067,
  Info: 0x1549a966,
  TimecodeScale: 0x2ad7b1,
  Duration: 0x4489,
  Cluster: 0x1f43b675,
  Timecode: 0xe7,
  SimpleBlock: 0xa3,
  BlockGroup: 0xa0,
  Block: 0xa1,
  BlockDuration: 0x9b,
};
const ENTER = new Set([ID.Segment, ID.Info, ID.Cluster, ID.BlockGroup]);

function vintLen(first) {
  for (let i = 0; i < 8; i++) if (first & (0x80 >> i)) return i + 1;
  return 0;
}

function readId(buf, off) {
  const n = vintLen(buf[off]);
  if (!n || n > 4 || off + n > buf.length) return null;
  let v = 0;
  for (let i = 0; i < n; i++) v = v * 256 + buf[off + i];
  return { id: v, len: n };
}

/** حجم العنصر؛ unknown=true حين تكون كل البتات 1 (شائع في تدفقات MediaRecorder). */
function readSize(buf, off) {
  const n = vintLen(buf[off]);
  if (!n || off + n > buf.length) return null;
  let v = buf[off] & (0xff >> n);
  let allOnes = v === 0xff >> n;
  for (let i = 1; i < n; i++) {
    v = v * 256 + buf[off + i];
    if (buf[off + i] !== 0xff) allOnes = false;
  }
  return { size: v, len: n, unknown: allOnes };
}

function readUInt(buf, start, len) {
  let v = 0;
  for (let i = 0; i < len; i++) v = v * 256 + buf[start + i];
  return v;
}

function webmDuration(buf) {
  let off = 0;
  let steps = 0;
  let scale = 1_000_000;
  let headerDuration = 0;
  let clusterTc = 0;
  let maxEnd = 0;
  let lastBlockEnd = 0;
  let pendingBlockStart = null;
  let sawBlock = false;
  while (off < buf.length && steps++ < MAX_STEPS) {
    const idr = readId(buf, off);
    if (!idr) return null;
    const szr = readSize(buf, off + idr.len);
    if (!szr) return null;
    const body = off + idr.len + szr.len;
    const end = szr.unknown ? buf.length : Math.min(buf.length, body + szr.size);
    if (ENTER.has(idr.id)) {
      if (idr.id === ID.Cluster) clusterTc = 0;
      if (idr.id === ID.BlockGroup) pendingBlockStart = null;
      off = body;
      continue;
    }
    if (idr.id === ID.TimecodeScale) scale = readUInt(buf, body, Math.min(8, end - body)) || scale;
    else if (idr.id === ID.Duration) {
      const len = end - body;
      if (len === 4) headerDuration = buf.readFloatBE(body);
      else if (len === 8) headerDuration = buf.readDoubleBE(body);
    } else if (idr.id === ID.Timecode) clusterTc = readUInt(buf, body, Math.min(8, end - body));
    else if (idr.id === ID.SimpleBlock || idr.id === ID.Block) {
      const tn = vintLen(buf[body]);
      if (tn && body + tn + 2 <= end) {
        const rel = buf.readInt16BE(body + tn);
        const abs = clusterTc + rel;
        if (abs >= 0) {
          sawBlock = true;
          if (abs > maxEnd) maxEnd = abs;
          pendingBlockStart = abs;
          lastBlockEnd = Math.max(lastBlockEnd, abs);
        }
      }
    } else if (idr.id === ID.BlockDuration && pendingBlockStart !== null) {
      const d = readUInt(buf, body, Math.min(8, end - body));
      lastBlockEnd = Math.max(lastBlockEnd, pendingBlockStart + d);
    }
    off = end;
  }
  // المدة من الكتل الفعلية (الترويسة قابلة للتزوير): آخر كتلة + إطار Opus نموذجي 20ms إن غابت BlockDuration
  if (!sawBlock && !(headerDuration > 0)) return null;
  const nsPerTick = scale;
  const fromBlocks = ((Math.max(lastBlockEnd, maxEnd) * nsPerTick) / 1e6) + (lastBlockEnd > maxEnd ? 0 : 20);
  const fromHeader = (headerDuration * nsPerTick) / 1e6;
  return Math.max(fromBlocks, fromHeader);
}

/* ───────── MP4 / M4A (AAC) ───────── */
function* boxes(buf, start, end) {
  let off = start;
  let steps = 0;
  while (off + 8 <= end && steps++ < MAX_STEPS) {
    let size = buf.readUInt32BE(off);
    const type = buf.toString("latin1", off + 4, off + 8);
    let hdr = 8;
    if (size === 1) {
      if (off + 16 > end) return;
      size = Number(buf.readBigUInt64BE(off + 8));
      hdr = 16;
    } else if (size === 0) size = end - off;
    if (size < hdr || off + size > end) size = Math.min(size, end - off);
    if (size < hdr) return;
    yield { type, body: off + hdr, end: off + size };
    off += size;
  }
}

function find(buf, parent, type) {
  for (const b of boxes(buf, parent.body, parent.end)) if (b.type === type) return b;
  return null;
}

function mp4Duration(buf) {
  const top = { body: 0, end: buf.length };
  const timescaleByTrack = new Map();
  const defaultDurByTrack = new Map();
  const ticksByTrack = new Map();
  let movieSec = 0;
  for (const b of boxes(buf, top.body, top.end)) {
    if (b.type === "moov") {
      for (const c of boxes(buf, b.body, b.end)) {
        if (c.type === "mvhd") {
          const v = buf[c.body];
          const ts = buf.readUInt32BE(c.body + (v === 1 ? 20 : 12));
          const dur = v === 1 ? Number(buf.readBigUInt64BE(c.body + 24)) : buf.readUInt32BE(c.body + 16);
          if (ts > 0) movieSec = Math.max(movieSec, dur / ts);
        } else if (c.type === "trak") {
          const tkhd = find(buf, c, "tkhd");
          const mdia = find(buf, c, "mdia");
          const mdhd = mdia && find(buf, mdia, "mdhd");
          if (tkhd && mdhd) {
            const tv = buf[tkhd.body];
            const trackId = buf.readUInt32BE(tkhd.body + (tv === 1 ? 20 : 12));
            const mv = buf[mdhd.body];
            const ts = buf.readUInt32BE(mdhd.body + (mv === 1 ? 20 : 12));
            const dur = mv === 1 ? Number(buf.readBigUInt64BE(mdhd.body + 24)) : buf.readUInt32BE(mdhd.body + 16);
            timescaleByTrack.set(trackId, ts);
            if (ts > 0) movieSec = Math.max(movieSec, dur / ts);
          }
        } else if (c.type === "mvex") {
          for (const t of boxes(buf, c.body, c.end)) {
            if (t.type === "trex") defaultDurByTrack.set(buf.readUInt32BE(t.body + 4), buf.readUInt32BE(t.body + 12));
          }
        }
      }
    } else if (b.type === "moof") {
      for (const traf of boxes(buf, b.body, b.end)) {
        if (traf.type !== "traf") continue;
        const tfhd = find(buf, traf, "tfhd");
        if (!tfhd) continue;
        const flags = buf.readUInt32BE(tfhd.body) & 0xffffff;
        const trackId = buf.readUInt32BE(tfhd.body + 4);
        let p = tfhd.body + 8;
        if (flags & 0x1) p += 8;
        if (flags & 0x2) p += 4;
        let defDur = defaultDurByTrack.get(trackId) ?? 0;
        if (flags & 0x8) defDur = buf.readUInt32BE(p);
        for (const r of boxes(buf, traf.body, traf.end)) {
          if (r.type !== "trun") continue;
          const tf = buf.readUInt32BE(r.body) & 0xffffff;
          const count = buf.readUInt32BE(r.body + 4);
          let q = r.body + 8;
          if (tf & 0x1) q += 4;
          if (tf & 0x4) q += 4;
          const perSample = (tf & 0x100) !== 0;
          const stride = (perSample ? 4 : 0) + (tf & 0x200 ? 4 : 0) + (tf & 0x400 ? 4 : 0) + (tf & 0x800 ? 4 : 0);
          let ticks = 0;
          if (perSample) {
            for (let i = 0; i < count && q + stride <= r.end; i++, q += stride) ticks += buf.readUInt32BE(q);
          } else ticks = defDur * count;
          ticksByTrack.set(trackId, (ticksByTrack.get(trackId) ?? 0) + ticks);
        }
      }
    }
  }
  let fragSec = 0;
  for (const [track, ticks] of ticksByTrack) {
    const ts = timescaleByTrack.get(track);
    if (ts > 0) fragSec = Math.max(fragSec, ticks / ts);
  }
  // الأكبر من (ترويسة الفيلم/المسار) و(المقاطع الفعلية): الترويسة وحدها قابلة للتزوير
  const sec = Math.max(movieSec, fragSec);
  return sec > 0 ? sec * 1000 : null;
}
