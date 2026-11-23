// Videoları (Higgsfield çıktıları) kaydırmalı giriş için kare dizisine çevirir.
// Çalıştır: node araclar/kareleri-cikar.mjs [--kare 240] [--cikti deneme/kareler] 1.mp4 2.mp4 ...
// Videolar verilen sırayla uç uca eklenir, toplam süre "--kare" kadar eşit aralıklı kareye bölünür.
// Çıktı: <cikti>/masaustu/0001.jpg…, <cikti>/mobil/0001.jpg…, <cikti>/kareler.json
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const arg = process.argv.slice(2);
const al = (ad, vars) => { const i = arg.indexOf(ad); if (i < 0) return vars; const v = arg[i + 1]; arg.splice(i, 2); return v; };
const KARE = Number(al('--kare', 240));
const CIKTI = resolve(al('--cikti', 'deneme/kareler'));
const videolar = arg.map(v => resolve(v));
if (!videolar.length) { console.error('Kullanım: node araclar/kareleri-cikar.mjs [--kare 240] [--cikti klasör] video1.mp4 video2.mp4 ...'); process.exit(1); }

const ff = (...a) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });
const sure = v => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v]).toString());

// Hepsini aynı boyut/kare hızına getirip tek akışta birleştir (concat filtresi farklı çözünürlükleri kabul etmez).
const toplam = videolar.reduce((s, v) => s + sure(v), 0);
const fps = KARE / toplam;
const girdiler = videolar.flatMap(v => ['-i', v]);
const hazirla = videolar.map((_, i) => `[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,fps=30[v${i}]`).join(';');
const birlestir = `${hazirla};${videolar.map((_, i) => `[v${i}]`).join('')}concat=n=${videolar.length}:v=1:a=0,fps=${fps.toFixed(6)}[t]`;

const SETLER = {
  masaustu: 'scale=1600:-2',                       // geniş ekran
  mobil: 'crop=ih*10/16:ih:(iw-ih*10/16)/2:0,scale=720:-2', // ortadan dikey kesit (telefon)
};
const bilgi = { kare: 0, setler: {} };
for (const [ad, suzgec] of Object.entries(SETLER)) {
  const klasor = `${CIKTI}/${ad}`;
  rmSync(klasor, { recursive: true, force: true });
  mkdirSync(klasor, { recursive: true });
  ff(...girdiler, '-filter_complex', `${birlestir};[t]${suzgec}[o]`, '-map', '[o]', '-frames:v', String(KARE), '-q:v', '5', `${klasor}/%04d.jpg`);
  const sayi = readdirSync(klasor).filter(f => f.endsWith('.jpg')).length;
  const [g, y] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', `${klasor}/0001.jpg`]).toString().trim().split(',').map(Number);
  bilgi.kare = bilgi.kare ? Math.min(bilgi.kare, sayi) : sayi;
  bilgi.setler[ad] = { genislik: g, yukseklik: y };
  console.log(`${ad}: ${sayi} kare, ${g}×${y}`);
}
writeFileSync(`${CIKTI}/kareler.json`, JSON.stringify(bilgi, null, 2) + '\n');
console.log(`Yazıldı: ${CIKTI}/kareler.json`);
