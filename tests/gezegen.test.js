// Kendi gezegen konumu hesabımız (src/gezegen.js), bağımsız bir efemeris kütüphanesiyle (astronomy-engine, yalnız geliştirme bağımlılığı) karşılaştırılır.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from 'astronomy-engine';
import * as sat from 'satellite.js';
import { gezegenKonumu, parlaklik, GEZEGENLER } from '../src/gezegen.js';
import { DAG } from '../src/gozlemevi.js';
import { gozlemciKur } from '../src/gecis.js';
import { govdeGorunum } from '../src/gece.js';

const AD = { merkur: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptun: 'Neptune' };
const gozlemci = gozlemciKur(DAG);
const obs = new A.Observer(DAG.enlemDerece, DAG.boylamDerece, DAG.rakimKm * 1000);
const tarihler = ['2026-12-01T18:00Z', '2026-12-20T00:00Z', '2027-02-10T21:00Z', '2027-06-15T03:00Z', '2025-03-03T12:00Z'].map((s) => new Date(s));
const aciFarki = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

test('Gezegenlerin yükseklik ve azimutu (kırılmasız) astronomy-engine ile 0.1° içinde', () => {
  for (const ad of GEZEGENLER) for (const t of tarihler) {
    const biz = govdeGorunum(gezegenKonumu(ad, t).eci, t, gozlemci);
    // refraksiyon kapalı: astronomy-engine ufkun altında kırılmayı uydurma bir değerle düzeltiyor
    const eq = A.Equator(AD[ad], t, obs, true, true), hz = A.Horizon(t, obs, eq.ra, eq.dec, null);
    assert.ok(Math.abs(biz.yukseklik - hz.altitude) < 0.1, `${ad} ${t.toISOString()} yükseklik ${biz.yukseklik.toFixed(3)} / ${hz.altitude.toFixed(3)}`);
    assert.ok(aciFarki(biz.azimut, hz.azimuth) < 0.1 / Math.max(0.2, Math.cos(hz.altitude * Math.PI / 180)), `${ad} ${t.toISOString()} azimut ${biz.azimut.toFixed(3)} / ${hz.azimuth.toFixed(3)}`);
  }
});

test('Parlaklık: iç gezegenler, Mars ve Jüpiter 0.3 kadir içinde; Satürn halka yüzünden 1 kadir içinde', () => {
  for (const ad of GEZEGENLER) for (const t of tarihler) {
    const ref = A.Illumination(AD[ad], t).mag, biz = parlaklik(ad, gezegenKonumu(ad, t));
    const tol = ad === 'saturn' ? 1 : 0.3;
    assert.ok(Math.abs(biz - ref) < tol, `${ad} ${t.toISOString()} ${biz.toFixed(2)} / ${ref.toFixed(2)}`);
  }
});
