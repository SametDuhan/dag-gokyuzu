// Higgsfield videoları gelene kadar yer tutucu video üretir: gündüz → gün batımı → gece → Samanyolu.
// Bağımlılık yok: kareleri saf JS ile çizip ffmpeg'e ham RGB olarak verir.
// Çalıştır: node deneme/yer-tutucu-uret.mjs  →  deneme/kaynak/yer-tutucu.mp4
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const W = 1280, H = 720, KARE = 240, FPS = 30;
const cikti = new URL('kaynak/yer-tutucu.mp4', import.meta.url).pathname;
mkdirSync(new URL('kaynak/', import.meta.url), { recursive: true });

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS),
  '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', cikti], { stdio: ['pipe', 'inherit', 'inherit'] });

// --- yardımcılar
const kis = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const yumusak = (a, b, x) => { const t = kis(a, b, x); return t * t * (3 - 2 * t); };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const karis = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function anahtar(liste, t) { // [[t, değer], ...] arasında yumuşak geçiş
  for (let i = 1; i < liste.length; i++) if (t <= liste[i][0]) {
    const [t0, a] = liste[i - 1], [t1, b] = liste[i];
    return karis(a, b, yumusak(t0, t1, t));
  }
  return liste.at(-1)[1];
}
let tohum = 7;
const rast = () => ((tohum = (tohum * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function gurultu(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// --- sahne anahtarları (t: 0 → 1)
const UST = [[0, hex('#3f7fcf')], [0.22, hex('#4b78c0')], [0.42, hex('#2a3d78')], [0.6, hex('#0b1433')], [0.78, hex('#02040a')]];
const ALT = [[0, hex('#a8d0f0')], [0.22, hex('#f0c99a')], [0.42, hex('#f2884a')], [0.6, hex('#3b3a6a')], [0.78, hex('#0a1330')]];
const DAG_R = [[0, hex('#4f5d4a')], [0.35, hex('#3a3436')], [0.6, hex('#0c0f18')], [0.8, hex('#05070d')]];
const KUBBE = [[0, hex('#dfe4ea')], [0.4, hex('#e9b48c')], [0.62, hex('#2a3040')], [0.8, hex('#151a26')]];

// dünya koordinatı: ufuk y=0.62, x yatayda -0.9..0.9 (yaklaşık)
const sirt = x => 0.62 - 0.17 * Math.exp(-((x - 0.02) ** 2) / 0.06) - 0.04 * Math.sin(x * 7 + 1) - 0.02 * Math.sin(x * 19) - 0.008 * Math.sin(x * 53);
const TEPE_X = 0.02, TEPE_Y = sirt(0.02);
const yildizlar = Array.from({ length: 1400 }, () => ({ x: rast() * 2.4 - 1.2, y: rast() * 0.95 - 0.35, p: rast() ** 3, r: 0.6 + rast() * 0.9 }));

const kare = new Uint8Array(W * H * 3);
const tampon = new Float32Array(W * H * 3);

function ciz(t) {
  // kamera: yavaşça ileri ve sona doğru yukarı (Samanyolu'na) bakış
  const s = 1 + 0.35 * yumusak(0.1, 1, t);
  const cy = 0.45 - 0.33 * yumusak(0.62, 1, t);
  const olcek = H / 0.72;
  const dx = px => (px - W / 2) / (olcek * s), dy = py => cy + (py - H / 2) / (olcek * s);
  const ust = anahtar(UST, t), alt = anahtar(ALT, t), dagR = anahtar(DAG_R, t), kubbeR = anahtar(KUBBE, t);
  const gece = yumusak(0.5, 0.78, t), samanyolu = yumusak(0.68, 0.92, t);
  const gunesY = 0.18 + 0.5 * yumusak(0.05, 0.5, t), gunesR = karis(hex('#fff6d8'), hex('#ff8a3c'), yumusak(0.15, 0.45, t));
  const yarik = yumusak(0.5, 0.62, t); // kubbe yarığı açılıyor

  for (let py = 0; py < H; py++) {
    const wy = dy(py);
    const k = kis(-0.3, 0.62, wy);
    const gok = karis(ust, alt, k ** 1.4);
    for (let px = 0; px < W; px++) {
      const wx = dx(px), i = (py * W + px) * 3;
      let [r, g, b] = gok;
      // güneş parıltısı
      const gd = Math.hypot(wx + 0.28, wy - gunesY);
      const pa = Math.exp(-gd * 9) * 0.6 + (gd < 0.035 ? 1 : 0);
      r += (gunesR[0] - r) * Math.min(1, pa); g += (gunesR[1] - g) * Math.min(1, pa); b += (gunesR[2] - b) * Math.min(1, pa);
      // Samanyolu
      if (samanyolu > 0) {
        const d = (wy + 0.15 + 0.55 * wx) / 1.14;
        const bant = Math.exp(-(d * d) / 0.018);
        if (bant > 0.01) {
          const n = 0.55 * gurultu(wx * 9, wy * 9) + 0.3 * gurultu(wx * 23, wy * 23) + 0.15 * gurultu(wx * 61, wy * 61);
          const toz = Math.exp(-((d + 0.015) ** 2) / 0.0012) * 0.8; // ortadaki karanlık toz şeridi
          const p = samanyolu * bant * Math.max(0, n - 0.25) * (1 - toz) * 120;
          r += p * 0.95; g += p * 0.92; b += p;
        }
      }
      tampon[i] = r; tampon[i + 1] = g; tampon[i + 2] = b;
    }
  }
  // yıldızlar
  if (gece > 0) for (const y of yildizlar) {
    const px = W / 2 + y.x * olcek * s, py = H / 2 + (y.y - cy) * olcek * s;
    const p = gece * (40 + 215 * y.p), rr = y.r * Math.sqrt(s);
    for (let oy = -2; oy <= 2; oy++) for (let ox = -2; ox <= 2; ox++) {
      const X = Math.round(px) + ox, Y = Math.round(py) + oy;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const a = Math.exp(-(ox * ox + oy * oy) / (rr * rr)) * p, i = (Y * W + X) * 3;
      tampon[i] += a; tampon[i + 1] += a * 0.97; tampon[i + 2] += a * 1.05;
    }
  }
  // dağ ve kubbe (en önde)
  for (let py = 0; py < H; py++) {
    const wy = dy(py);
    for (let px = 0; px < W; px++) {
      const wx = dx(px), i = (py * W + px) * 3;
      const kx = wx - TEPE_X, ky = TEPE_Y - 0.012 - wy;
      const kubbede = (kx * kx + (ky - 0.012) ** 2 < 0.028 ** 2 && ky > 0.012) || (Math.abs(kx) < 0.028 && ky >= -0.004 && ky <= 0.012);
      if (kubbede) {
        const yarikta = Math.abs(kx) < 0.006 * yarik && ky > 0.02;
        const c = yarikta ? [6, 8, 14] : kubbeR;
        tampon[i] = c[0]; tampon[i + 1] = c[1]; tampon[i + 2] = c[2];
      } else if (wy > sirt(wx)) {
        const d = Math.min(1, (wy - sirt(wx)) * 6);
        tampon[i] = dagR[0] * (1 - 0.4 * d); tampon[i + 1] = dagR[1] * (1 - 0.4 * d); tampon[i + 2] = dagR[2] * (1 - 0.35 * d);
      }
    }
  }
  for (let i = 0; i < kare.length; i++) kare[i] = Math.max(0, Math.min(255, tampon[i] + (hash(i, t) - 0.5) * 2));
}

for (let f = 0; f < KARE; f++) {
  ciz(f / (KARE - 1));
  if (!ff.stdin.write(kare)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 40 === 0) process.stdout.write(`kare ${f}/${KARE}\n`);
}
ff.stdin.end();
ff.on('close', kod => console.log(kod === 0 ? `Yazıldı: ${cikti}` : `ffmpeg hata kodu ${kod}`));
