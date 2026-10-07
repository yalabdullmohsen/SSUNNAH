/** مولّدات ملفات صوتية اصطناعية صغيرة بترويسات صحيحة (بلا صوت حقيقي) لاختبار قارئ المدة على الخادم. */
const u32 = (n: number) => { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b; };
const u32le = (n: number) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; };
const u16le = (n: number) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };

export function wav(seconds: number, rate = 8000): Buffer {
  const data = Buffer.alloc(Math.round(seconds * rate), 0x80); // PCM 8-bit mono
  return Buffer.concat([
    Buffer.from("RIFF"), u32le(36 + data.length), Buffer.from("WAVE"),
    Buffer.from("fmt "), u32le(16), u16le(1), u16le(1), u32le(rate), u32le(rate), u16le(1), u16le(8),
    Buffer.from("data"), u32le(data.length), data,
  ]);
}

function oggPage(type: number, granule: bigint, seq: number, payload: Buffer): Buffer {
  const segs: number[] = [];
  let left = payload.length;
  while (left >= 255) { segs.push(255); left -= 255; }
  segs.push(left);
  const g = Buffer.alloc(8); g.writeBigUInt64LE(granule);
  return Buffer.concat([Buffer.from("OggS"), Buffer.from([0, type]), g, u32le(1), u32le(seq), u32le(0), Buffer.from([segs.length, ...segs]), payload]);
}

export function oggOpus(seconds: number): Buffer {
  const head = Buffer.concat([Buffer.from("OpusHead"), Buffer.from([1, 1]), u16le(312), u32le(48000), u16le(0), Buffer.from([0])]);
  return Buffer.concat([
    oggPage(2, 0n, 0, head),
    oggPage(0, 0n, 1, Buffer.alloc(900, 7)),
    oggPage(4, BigInt(Math.round(seconds * 48000) + 312), 2, Buffer.alloc(20, 7)),
  ]);
}

const ebml = (idBytes: number[], payload: Buffer) => Buffer.concat([Buffer.from(idBytes), Buffer.from([0x80 | payload.length]), payload]);

/** WebM بأسلوب MediaRecorder: Segment/Cluster بحجم مجهول، بلا Duration في Info. */
export function webm(seconds: number): Buffer {
  const parts: Buffer[] = [ebml([0x1a, 0x45, 0xdf, 0xa3], Buffer.alloc(8, 0))];
  parts.push(Buffer.from([0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
  parts.push(ebml([0x15, 0x49, 0xa9, 0x66], ebml([0x2a, 0xd7, 0xb1], Buffer.from([0x0f, 0x42, 0x40]))));
  const totalMs = Math.round(seconds * 1000);
  for (let start = 0; start < totalMs; start += 10_000) {
    parts.push(Buffer.from([0x1f, 0x43, 0xb6, 0x75, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
    parts.push(Buffer.from([0xe7, 0x84]), u32(start));
    for (let t = start; t < Math.min(totalMs, start + 10_000); t += 500) {
      const last = totalMs - 20;
      const at = Math.min(t, last);
      const rel = Buffer.alloc(2); rel.writeInt16BE(at - start);
      parts.push(ebml([0xa3], Buffer.concat([Buffer.from([0x81]), rel, Buffer.from([0x80]), Buffer.alloc(40, 3)])));
    }
    if (start + 10_000 >= totalMs) {
      const rel = Buffer.alloc(2); rel.writeInt16BE(totalMs - 20 - start);
      parts.push(ebml([0xa3], Buffer.concat([Buffer.from([0x81]), rel, Buffer.from([0x80]), Buffer.alloc(40, 3)])));
    }
  }
  return Buffer.concat(parts);
}

const box = (type: string, ...bodies: Buffer[]) => {
  const body = Buffer.concat(bodies);
  return Buffer.concat([u32(8 + body.length), Buffer.from(type), body]);
};

/** fMP4 كما يُنتجه Safari: mvhd/mdhd بمدة 0، والمدة الفعلية في trun. */
export function fmp4(seconds: number): Buffer {
  const mvhd = box("mvhd", Buffer.alloc(4), u32(0), u32(0), u32(1000), u32(0), Buffer.alloc(80));
  const tkhd = box("tkhd", Buffer.alloc(4), u32(0), u32(0), u32(1), u32(0), u32(0), Buffer.alloc(60));
  const mdhd = box("mdhd", Buffer.alloc(4), u32(0), u32(0), u32(48000), u32(0), Buffer.alloc(4));
  const trak = box("trak", tkhd, box("mdia", mdhd));
  const trex = box("trex", Buffer.alloc(4), u32(1), u32(1), u32(0), u32(0), u32(0));
  const moov = box("moov", mvhd, trak, box("mvex", trex));
  const tfhd = box("tfhd", u32(0x000008), u32(1), u32(48000)); // default_sample_duration = 1s
  const trun = box("trun", u32(0), u32(Math.round(seconds)));
  const moof = box("moof", box("mfhd", Buffer.alloc(8)), box("traf", tfhd, trun));
  return Buffer.concat([box("ftyp", Buffer.from("isom"), u32(0), Buffer.from("isom")), moov, moof, box("mdat", Buffer.alloc(1000, 5))]);
}
