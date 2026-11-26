// Ay ve gece özeti, USNO Astronomical Applications API değerleriyle karşılaştırılır
// (aa.usno.navy.mil/api/rstt/oneday, koordinat 39.783,41.233, tz=3; ve /api/moon/phases; 23 Kasım 2026'da alındı).
import test from 'node:test';
import assert from 'node:assert/strict';
import { DAG_WIKIPEDIA as DAG } from '../src/gozlemevi.js'; // USNO değerleri bu koordinatla alındı
import { gozlemciKur } from '../src/gecis.js';
import { ayEvresi, evreAdi } from '../src/ay.js';
import { ayGorunum, gunesGorunum, UFUK_AY, UFUK_GUNES, geceOzeti, gecePenceresi } from '../src/gece.js';

const g = gozlemciKur(DAG);
const tsi = (s) => new Date(s + ':00+03:00');

// Verilen anın ±dk içinde yüksekliğin eşiği geçtiğini doğrular.
function gecerMi(fn, an, esik, dk) {
  const once = fn(new Date(an.getTime() - dk * 60e3), g).yukseklik - esik;
  const sonra = fn(new Date(an.getTime() + dk * 60e3), g).yukseklik - esik;
  return once * sonra < 0;
}

test('Ay doğuş/batış USNO ile ±3 dk içinde', () => {
  for (const s of ['2026-11-23T05:37', '2026-11-23T15:38', '2026-12-01T12:41', '2026-12-10T08:48', '2026-12-10T17:42', '2027-01-20T05:42', '2027-01-20T14:42'])
    assert.ok(gecerMi(ayGorunum, tsi(s), UFUK_AY, 3), s);
});

test('Gün doğumu/batımı ve sivil alacakaranlık USNO ile ±3 dk içinde', () => {
  for (const s of ['2026-11-23T07:08', '2026-11-23T16:54', '2026-12-10T07:25', '2026-12-10T16:50', '2027-01-20T17:20'])
    assert.ok(gecerMi(gunesGorunum, tsi(s), UFUK_GUNES, 3), s);
  for (const s of ['2026-11-23T06:39', '2026-11-23T17:24', '2027-01-20T17:49'])
    assert.ok(gecerMi(gunesGorunum, tsi(s), -6, 3), s);
});

test('Ay evreleri USNO anlarında: uzanım ±1°, aydınlık kesir', () => {
  const evre = [['2026-11-09T07:02Z', 0, 'yeni'], ['2026-11-17T11:48Z', 90, 'ilkDordun'], ['2026-11-24T14:53Z', 180, 'dolunay'], ['2026-12-01T06:08Z', 270, 'sonDordun']];
  for (const [t, beklenen, ad] of evre) {
    const e = ayEvresi(new Date(t));
    const fark = Math.abs(((e.uzanim - beklenen + 540) % 360) - 180);
    assert.ok(fark < 1, `${t}: uzanım ${e.uzanim}`);
    assert.equal(evreAdi(e.uzanim), ad);
  }
  assert.ok(ayEvresi(new Date('2026-11-24T14:53Z')).aydinlik > 0.99);
  assert.ok(ayEvresi(new Date('2026-11-09T07:02Z')).aydinlik < 0.01);
});

test('Gece penceresi: öğleden önce süren gece, öğleden sonra bu gece', () => {
  assert.equal(gecePenceresi(tsi('2026-11-24T03:00')).bas.toISOString(), '2026-11-23T09:00:00.000Z');
  assert.equal(gecePenceresi(tsi('2026-11-23T11:00')).bas.toISOString(), '2026-11-23T09:00:00.000Z');
  assert.equal(gecePenceresi(tsi('2026-11-23T22:00')).bas.toISOString(), '2026-11-23T09:00:00.000Z');
});

test('Gece özeti: dolunayda Ay\'sız karanlık az, yeni ayda neredeyse tüm karanlık', () => {
  const dolunay = geceOzeti(tsi('2026-11-24T15:00'), g);
  const yeni = geceOzeti(tsi('2026-12-09T15:00'), g);
  assert.ok(dolunay.karanlikDk > 600 && dolunay.karanlikDk < 720, `karanlık ${dolunay.karanlikDk}`);
  assert.ok(dolunay.aysizDk < 30, `dolunay aysız ${dolunay.aysizDk}`);
  assert.ok(yeni.karanlikDk - yeni.aysizDk < 10, `yeni ay: ${yeni.karanlikDk} / ${yeni.aysizDk}`);
  assert.ok(dolunay.olaylar.gunBatimi < dolunay.olaylar.astroBas && dolunay.olaylar.astroBit < dolunay.olaylar.gunDogumu);
});
