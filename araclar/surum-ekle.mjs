// Yayın klasöründeki (varsayılan _site) yerel JS/CSS adreslerine ?v=<sürüm> ekler. GitHub Pages dosyaları
// 10 dk önbellekte tuttuğu için, yeni yayından sonra tarayıcı eski modüllerle yeni HTML'i karıştırmasın diye.
// Kullanım: node araclar/surum-ekle.mjs _site <sürüm>   (Actions'ta sürüm = commit kimliği)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [kok = '_site', surum] = process.argv.slice(2);
if (!surum || !/^[\w.-]+$/.test(surum)) { console.error('sürüm gerekli: node araclar/surum-ekle.mjs _site <sürüm>'); process.exit(1); }
const q = `?v=${surum}`;

// import ... from './x.js'  |  import './x.js'  |  import('./x.js')  →  './x.js?v=...'
const JS_IMPORT = /((?:\bfrom|\bimport)\s*\(?\s*)(['"])(\.{1,2}\/[^'"?]+\.js)\2/g;
// HTML: src="js/..js", href="css/..css", importmap içindeki "./vendor/...js"
const HTML_ADRES = /((?:src|href)=")((?:js|css)\/[^"?]+\.(?:js|css))"/g;
const IMPORTMAP = /("satellite\.js":\s*")(\.\/vendor\/[^"?]+\.js)"/g;

let n = 0;
const yaz = (yol, eski, yeni) => { if (yeni !== eski) { writeFileSync(yol, yeni); n++; } };
for (const klasor of ['js', 'src']) {
  for (const ad of readdirSync(join(kok, klasor)).filter((x) => x.endsWith('.js'))) {
    const yol = join(kok, klasor, ad), m = readFileSync(yol, 'utf8');
    yaz(yol, m, m.replace(JS_IMPORT, (_, on, t, adres) => `${on}${t}${adres}${q}${t}`));
  }
}
for (const ad of readdirSync(kok).filter((x) => x.endsWith('.html'))) {
  const yol = join(kok, ad), m = readFileSync(yol, 'utf8');
  yaz(yol, m, m.replace(HTML_ADRES, (_, on, adres) => `${on}${adres}${q}"`).replace(IMPORTMAP, (_, on, adres) => `${on}${adres}${q}"`));
}
console.log(`${n} dosyaya sürüm eklendi (${q})`);
