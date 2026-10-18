// Play feature graphic (1024x500): dark coastal gradient, brass house mark, no text.
// Usage: node tools/make-feature.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 1024, H = 500;
const BG = [15, 26, 31], GLOW = [29, 58, 63], BRASS = [201, 168, 92];

function png(w, h, pix) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; pix.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const pix = Buffer.alloc(W * H * 4);
const cx = W / 2, cy = H / 2 + 10, s = 0.62;              // house scale relative to the 512 icon grid
const inHouse = (x, y) => {
  const X = (x - cx) / s + 256, Y = (y - cy) / s + 256;
  if (X >= 144 && X < 368 && Y >= 232 && Y < 392) return true;
  if (Y >= 112 && Y < 232) return Math.abs(X - 256) <= (Y - 112) * (144 / 120);
  return false;
};
const inRect = (x, y, rx, ry, rw, rh) => { const X = (x - cx) / s + 256, Y = (y - cy) / s + 256; return X >= rx && X < rx + rw && Y >= ry && Y < ry + rh; };
const inCircle = (x, y, r0) => ((x - cx) ** 2 + (y - cy) ** 2) <= r0 ** 2;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  // radial glow behind the mark, fading to the base color
  const d = Math.min(1, Math.hypot((x - cx) / 420, (y - cy) / 260));
  let c = [0, 1, 2].map(i => Math.round(GLOW[i] * (1 - d) + BG[i] * d));
  if (inCircle(x, y, 196 * s)) c = [22, 38, 45];
  if (inHouse(x, y)) c = BRASS;
  if (inRect(x, y, 232, 304, 48, 88) || inRect(x, y, 180, 262, 36, 36) || inRect(x, y, 296, 262, 36, 36)) c = BG;
  const i = (y * W + x) * 4; pix[i] = c[0]; pix[i + 1] = c[1]; pix[i + 2] = c[2]; pix[i + 3] = 255;
}
mkdirSync('store', { recursive: true });
writeFileSync('store/feature-graphic-1024x500.png', png(W, H, pix));
console.log('store/feature-graphic-1024x500.png written');
