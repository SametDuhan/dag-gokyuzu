import test from 'node:test';
import assert from 'node:assert/strict';
import { DAG } from '../src/gozlemevi.js';
import { saatDurumu, iklimOzeti, ESIKLER } from '../src/iklim.js';
import { gunesYuksekligiYer } from '../src/gunes.js';

test('gunesYuksekligiYer: 21 Haziran yerel öğle ~73.6°, gece yarısı negatif', () => {
  const ogle = new Date(Date.UTC(2026, 5, 21, 12) - (DAG.boylamDerece / 15) * 3600e3);
  assert.ok(Math.abs(gunesYuksekligiYer(ogle, DAG.enlemDerece, DAG.boylamDerece) - 73.6) < 1.5);
  assert.ok(gunesYuksekligiYer(new Date(ogle.getTime() + 12 * 3600e3), DAG.enlemDerece, DAG.boylamDerece) < -20);
});

test('saatDurumu: gündüz uygun değil; açık gece uygun; bulutlu gece uygun değil; eksik veri null', () => {
  const gece = new Date('2026-01-10T22:00:00Z'), gunduz = new Date('2026-06-21T09:00:00Z');
  const iyi = { bulut: 5, ruzgar: 10, ruzgarEs: 15, nem: 40, yagis: 0 };
  assert.deepEqual(saatDurumu(gunduz, iyi, ESIKLER, DAG), { gece: false, uygun: false });
  assert.equal(saatDurumu(gece, iyi, ESIKLER, DAG).uygun, true);
  assert.equal(saatDurumu(gece, { ...iyi, bulut: 80 }, ESIKLER, DAG).uygun, false);
  assert.equal(saatDurumu(gece, { ...iyi, bulut: null }, ESIKLER, DAG).uygun, null);
});

test('iklimOzeti: sentetik dosyada sayımlar doğru', () => {
  const time = ['2026-01-10T21:00', '2026-01-10T22:00', '2026-06-21T09:00'];
  const d = { hourly: { time, cloud_cover: [0, 90, 0], wind_speed_10m: [5, 5, 5], wind_gusts_10m: [8, 8, 8],
    relative_humidity_2m: [30, 30, 30], precipitation: [0, 0, 0] } };
  const o = iklimOzeti([d], DAG);
  assert.equal(o.aylik[0].geceSaat, 2); assert.equal(o.aylik[0].uygunSaat, 1);
  assert.equal(o.aylik[5].geceSaat, 0); // gündüz sayılmaz
  assert.equal(o.aySaat[0][0].gece, 1); // 21:00Z = 00:00 yerel (UTC+3)
});
