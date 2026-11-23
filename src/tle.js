// TLE metnini (3 satırlı: ad, satır 1, satır 2) denetler. Sağlama toplamı tutmayan ya da biçimi bozuk kayıtları ayıklar.

// TLE sağlama toplamı: ilk 68 karakterdeki rakamların toplamı + her '-' için 1, mod 10.
export function saglamaToplami(satir) {
  let t = 0;
  for (const c of satir.slice(0, 68)) { if (c >= '0' && c <= '9') t += c.charCodeAt(0) - 48; else if (c === '-') t += 1; }
  return t % 10;
}

const satirGecerli = (s, no) => s.length >= 69 && s[0] === String(no) && s[1] === ' ' && saglamaToplami(s) === Number(s[68]);

// Dönüş: { kayitlar: [{ad, s1, s2}], atlanan }
export function tleAyikla(metin) {
  const satirlar = metin.split(/\r?\n/).map((s) => s.trimEnd()).filter((s) => s.trim());
  const kayitlar = []; let atlanan = 0;
  for (let i = 0; i + 2 < satirlar.length; ) {
    const [ad, s1, s2] = [satirlar[i], satirlar[i + 1], satirlar[i + 2]];
    if (satirGecerli(s1, 1) && satirGecerli(s2, 2) && s1.slice(2, 7) === s2.slice(2, 7)) {
      kayitlar.push({ ad: ad.trim(), s1, s2 }); i += 3;
    } else { atlanan++; i += 1; } // hizayı yeniden yakalamak için bir satır kay
  }
  return { kayitlar, atlanan };
}

export const tleYaz = (kayitlar) => kayitlar.map((k) => `${k.ad}\n${k.s1}\n${k.s2}\n`).join('');
