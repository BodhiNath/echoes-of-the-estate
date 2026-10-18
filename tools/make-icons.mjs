// Rasterizes the app icon to PNG with no dependencies (zlib only).
// Usage: node tools/make-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const BG = [15, 26, 31], RING = [22, 38, 45], BRASS = [201, 168, 92];

function png(w, h, pix) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; pix.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function render(size, maskable) {
  const pix = Buffer.alloc(size * size * 4);
  const s = size / 512;
  const inRect = (x, y, rx, ry, rw, rh) => x >= rx * s && x < (rx + rw) * s && y >= ry * s && y < (ry + rh) * s;
  const inCircle = (x, y, cx, cy, r) => ((x - cx * s) ** 2 + (y - cy * s) ** 2) <= (r * s) ** 2;
  // House polygon: roof triangle + body rect.
  const inHouse = (x, y) => {
    const X = x / s, Y = y / s;
    if (X >= 144 && X < 368 && Y >= 232 && Y < 392) return true;
    if (Y >= 112 && Y < 232) { const half = (Y - 112) * (144 / 120); return Math.abs(X - 256) <= half; }
    return false;
  };
  const corner = maskable ? 0 : 96;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let c = BG, a = 255;
    if (!maskable && corner) {   // rounded corners for the "any" icon
      const r = corner * s; const cx = x < r ? r : x > size - r ? size - r : x; const cy = y < r ? r : y > size - r ? size - r : y;
      if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) a = 0;
    }
    if (inCircle(x, y, 256, 256, 196)) c = RING;
    if (inHouse(x, y)) c = BRASS;
    if (inRect(x, y, 232, 304, 48, 88) || inRect(x, y, 180, 262, 36, 36) || inRect(x, y, 296, 262, 36, 36) || inCircle(x, y, 256, 200, 16)) c = BG;
    const i = (y * size + x) * 4; pix[i] = c[0]; pix[i + 1] = c[1]; pix[i + 2] = c[2]; pix[i + 3] = a;
  }
  return png(size, size, pix);
}

mkdirSync('icons', { recursive: true });
writeFileSync('icons/icon-192.png', render(192, false));
writeFileSync('icons/icon-512.png', render(512, false));
writeFileSync('icons/icon-512-maskable.png', render(512, true));
console.log('icons written');
