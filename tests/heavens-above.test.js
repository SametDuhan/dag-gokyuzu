// Sitenin geçiş bulucusu (45 sn adım + hassaslaştırma), Heavens-Above'un DAG için verdiği geçişlerle karşılaştırılır.
// Veri: dogrulama/heavens-above-2026-11-23.json; TLE: dogrulama/tle-2026-11-23.txt (karşılaştırma günü sabitlendi).
// Ayrıntılı tablo: node araclar/heavens-above-kiyas.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as sat from 'satellite.js';
import { DAG } from '../src/gozlemevi.js';
import { gozlemciKur, gecisleriBul } from '../src/gecis.js';
import { tleAyikla } from '../src/tle.js';

const oku = (yol) => readFileSync(new URL('../' + yol, import.meta.url), 'utf8');
const ha = JSON.parse(oku('dogrulama/heavens-above-2026-11-23.json'));
const tle = tleAyikla(oku('dogrulama/tle-2026-11-23.txt')).kayitlar;
const gozlemci = gozlemciKur(DAG);

// HA'nın "en yüksek nokta"sı başlangıç ya da bitişle aynı değilse gerçek zirvedir.
const zirveler = [];
for (const [no, u] of Object.entries(ha.uydular)) {
  const satrec = sat.twoline2satrec(...(({ s1, s2 }) => [s1, s2])(tle.find((k) => k.s1.slice(2, 7).trim() === no)));
  for (const [tarih, B, Z, S] of u.gecisler) if (Z[0] !== B[0] && Z[0] !== S[0]) zirveler.push({ ad: u.ad, satrec, an: new Date(`${tarih}T${Z[0]}Z`), alt: Z[1] });
}

test('Heavens-Above: 21 zirvenin hepsi bulunuyor; yükseklik ±1°, zaman ±16 sn', () => {
  assert.equal(zirveler.length, 21);
  for (const z of zirveler) {
    const p = gecisleriBul(z.satrec, new Date(z.an - 30 * 60e3), new Date(z.an.getTime() + 30 * 60e3), gozlemci, { adimSn: 45, minYukseklik: 0 })
      .find((g) => g.dogus <= z.an && g.batis >= z.an);
    assert.ok(p, `${z.ad} ${z.an.toISOString()}: geçiş bulunamadı`);
    const dt = Math.abs(p.zirveZaman - z.an) / 1000;
    assert.ok(Math.abs(p.zirveYukseklik - z.alt) <= 1, `${z.ad} ${z.an.toISOString()}: yükseklik ${p.zirveYukseklik.toFixed(1)} / ${z.alt}`);
    assert.ok(dt <= 16, `${z.ad} ${z.an.toISOString()}: ${dt} sn`);
    // ISS'in TLE dönemi HA'nınkiyle aynı gün: fark yalnız yuvarlama ve yöntemden gelir.
    if (z.ad.startsWith('ISS')) assert.ok(dt <= 2, `ISS ${z.an.toISOString()}: ${dt} sn`);
  }
});

test('Hassaslaştırma: 45 sn adımla bulunan zirve, 1 sn adımla bulunanla 1 sn içinde', () => {
  for (const z of zirveler.slice(0, 8)) {
    const [kaba] = gecisleriBul(z.satrec, new Date(z.an - 20 * 60e3), new Date(z.an.getTime() + 20 * 60e3), gozlemci, { adimSn: 45, minYukseklik: 0 }).filter((g) => g.dogus <= z.an && g.batis >= z.an);
    const [ince] = gecisleriBul(z.satrec, new Date(z.an - 20 * 60e3), new Date(z.an.getTime() + 20 * 60e3), gozlemci, { adimSn: 1, minYukseklik: 0 }).filter((g) => g.dogus <= z.an && g.batis >= z.an);
    assert.ok(Math.abs(kaba.zirveZaman - ince.zirveZaman) <= 1000);
    assert.ok(Math.abs(kaba.dogus - ince.dogus) <= 1000 && Math.abs(kaba.batis - ince.batis) <= 1000);
  }
});
