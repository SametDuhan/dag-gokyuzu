import test from 'node:test';
import assert from 'node:assert/strict';
import * as sat from 'satellite.js';
import { DAG } from '../src/gozlemevi.js';
import { gozlemciKur, anlikGorunum, gecisleriBul } from '../src/gecis.js';
import { gunesECI, gunesYuksekligi } from '../src/gunes.js';

const L1 = '1 25544U 98067A   26326.55861648  .00009004  00000+0  16808-3 0  9990';
const L2 = '2 25544  51.6321 236.3579 0007404  53.9088 306.2585 15.49552037596306';
const satrec = sat.twoline2satrec(L1, L2);
const gozlemci = gozlemciKur(DAG);

test('Güneş: 2026 Eylül ekinoksu civarı deklinasyon ~0°, Haziran gündönümünde ~+23.4°', () => {
  const dek = (d) => { const g = gunesECI(d); return Math.asin(g.z / Math.hypot(g.x, g.y, g.z)) * 180 / Math.PI; };
  assert.ok(Math.abs(dek(new Date('2026-09-23T00:00:00Z'))) < 0.6);
  assert.ok(Math.abs(dek(new Date('2026-06-21T12:00:00Z')) - 23.44) < 0.1);
});

test('Güneş yüksekliği: DAG\'da 21 Haziran öğle ~73.6° (90-39.78+23.44)', () => {
  // Yerel öğle ≈ UTC 12:00 - boylam/15 saat
  const t = new Date(Date.UTC(2026, 5, 21, 12, 0) - (41.233 / 15) * 3600e3 + 0 * 0);
  const obsEcf = sat.geodeticToEcf(gozlemci), gm = sat.gstime(t);
  const eci = { x: obsEcf.x * Math.cos(gm) - obsEcf.y * Math.sin(gm), y: obsEcf.x * Math.sin(gm) + obsEcf.y * Math.cos(gm), z: obsEcf.z };
  const y = gunesYuksekligi(eci, gunesECI(t));
  assert.ok(Math.abs(y - 73.6) < 1.5, `bulunan ${y}`);
});

test('ISS 24 saatte DAG üzerinden en az bir geçiş verir, değerler makul', () => {
  const bas = new Date('2026-11-23T00:00:00Z');
  const g = gecisleriBul(satrec, bas, new Date(bas.getTime() + 86400e3), gozlemci);
  assert.ok(g.length >= 1);
  for (const p of g) {
    assert.ok(p.zirveYukseklik >= 10 && p.zirveYukseklik <= 90);
    assert.ok(p.sureSn > 60 && p.sureSn < 700);
  }
});

test('anlikGorunum geçerli aralıkta sayı döndürür', () => {
  const g = anlikGorunum(satrec, new Date('2026-11-23T12:00:00Z'), gozlemci);
  assert.ok(g.azimut >= 0 && g.azimut < 360 && g.menzil > 300);
});
