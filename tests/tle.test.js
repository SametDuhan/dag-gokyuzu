import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { saglamaToplami, tleAyikla } from '../src/tle.js';

const L1 = '1 25544U 98067A   26326.55861648  .00009004  00000+0  16808-3 0  9990';
const L2 = '2 25544  51.6321 236.3579 0007404  53.9088 306.2585 15.49552037596306';

test('TLE: sağlama toplamı gerçek ISS satırlarında tutar', () => {
  assert.equal(saglamaToplami(L1), 0);
  assert.equal(saglamaToplami(L2), 6);
});

test('TLE: bozuk kayıt atlanır, sonraki kayıt yine okunur', () => {
  const bozuk = L1.slice(0, 20) + '9' + L1.slice(21); // sağlama toplamını bozar
  const { kayitlar, atlanan } = tleAyikla(`BOZUK\n${bozuk}\n${L2}\nISS (ZARYA)\n${L1}\n${L2}\n`);
  assert.equal(kayitlar.length, 1);
  assert.equal(kayitlar[0].ad, 'ISS (ZARYA)');
  assert.ok(atlanan > 0);
});

test('TLE: depodaki örnek dosyanın tüm kayıtları geçerli', () => {
  const metin = readFileSync(new URL('../data/tle-gorunur.txt', import.meta.url), 'utf8');
  const { kayitlar, atlanan } = tleAyikla(metin);
  assert.ok(kayitlar.length >= 50);
  assert.equal(atlanan, 0);
});
