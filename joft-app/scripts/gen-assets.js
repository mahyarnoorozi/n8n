/**
 * تولید آیکن‌ها و اسپلش اپ «جفت» بدون نیاز به کتابخانهٔ گرافیکی.
 * یک قلب سفید روی پس‌زمینهٔ قرمز برند (#EE1844) — لوگوی کسب‌وکار.
 * خروجی: assets/icon.png, adaptive-icon.png, splash.png, favicon.png
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RED = [0xee, 0x18, 0x44];
const WHITE = [0xff, 0xff, 0xff];

// --- CRC32 ---
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// آیا نقطه داخل شکل قلب است؟ مختصات نرمال‌شده x,y در حدود [-1.4,1.4]
function inHeart(x, y) {
  const a = x * x + y * y - 1;
  return a * a * a - x * x * y * y * y <= 0;
}

function makePng(size, { bg, transparent }) {
  const bytesPerPixel = 4; // RGBA
  const raw = Buffer.alloc((size * bytesPerPixel + 1) * size);
  const scale = size * 0.38;
  for (let j = 0; j < size; j++) {
    const rowStart = j * (size * bytesPerPixel + 1);
    raw[rowStart] = 0; // filter type 0
    for (let i = 0; i < size; i++) {
      const x = (i - size / 2) / scale;
      const y = (size / 2 - j) / scale + 0.18;
      const heart = inHeart(x, y);
      const o = rowStart + 1 + i * bytesPerPixel;
      if (heart) {
        raw[o] = WHITE[0];
        raw[o + 1] = WHITE[1];
        raw[o + 2] = WHITE[2];
        raw[o + 3] = 255;
      } else if (transparent) {
        raw[o] = raw[o + 1] = raw[o + 2] = 0;
        raw[o + 3] = 0;
      } else {
        raw[o] = bg[0];
        raw[o + 1] = bg[1];
        raw[o + 2] = bg[2];
        raw[o + 3] = 255;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(outDir, { recursive: true });

const write = (name, buf) => {
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log('✓', name, `(${buf.length} bytes)`);
};

write('icon.png', makePng(1024, { bg: RED, transparent: false }));
write('adaptive-icon.png', makePng(1024, { bg: RED, transparent: true }));
write('splash.png', makePng(512, { bg: RED, transparent: true }));
write('favicon.png', makePng(64, { bg: RED, transparent: false }));
console.log('تمام شد. آیکن‌ها در پوشهٔ assets ساخته شدند.');
