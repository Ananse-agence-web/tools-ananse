// Dessine l'icône de l'appli (petite araignée sur disque doré) en PNG, sans dépendance.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const bloc = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const t = Buffer.from(type); const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, c]); };

function dessiner(taille) {
  const s = taille / 64, px = Buffer.alloc((taille * 4 + 1) * taille);
  const seg = (x, y, [ax, ay, bx, by]) => { const dx = bx - ax, dy = by - ay; const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - ax - t * dx, y - ay - t * dy); };
  const pattes = [[20, 27, 9, 20], [9, 20, 5, 26], [18, 34, 6, 32], [6, 32, 4, 39], [21, 42, 13, 48], [13, 48, 12, 55], [44, 27, 55, 20], [55, 20, 59, 26], [46, 34, 58, 32], [58, 32, 60, 39], [43, 42, 51, 48], [51, 48, 52, 55]];
  for (let j = 0; j < taille; j++) {
    px[j * (taille * 4 + 1)] = 0;
    for (let i = 0; i < taille; i++) {
      const x = (i + .5) / s, y = (j + .5) / s;
      let c = [242, 179, 61];
      if (pattes.some((p) => seg(x, y, p) < 2.1) || Math.hypot(x - 32, y - 35) < 15) c = [35, 31, 28];
      for (const ex of [27, 37]) { const r = Math.hypot(x - ex, y - 31); if (r < 4.2) c = r < 2 && Math.hypot(x - ex - .6, y - 31.6) < 2 ? [35, 31, 28] : [255, 255, 255]; }
      const o = j * (taille * 4 + 1) + 1 + i * 4;
      px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(taille, 0); ihdr.writeUInt32BE(taille, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloc("IHDR", ihdr), bloc("IDAT", deflateSync(px)), bloc("IEND", Buffer.alloc(0))]);
}
for (const t of [192, 512]) writeFileSync(`static/icons/icone-${t}.png`, dessiner(t));
console.log("icônes ok");
