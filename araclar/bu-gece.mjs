import * as sat from 'satellite.js';
import { DAG } from '../src/gozlemevi.js';
import { gozlemciKur, gecisleriBul } from '../src/gecis.js';
const s = sat.twoline2satrec('1 25544U 98067A   26326.55861648  .00009004  00000+0  16808-3 0  9990','2 25544  51.6321 236.3579 0007404  53.9088 306.2585 15.49552037596306');
const b = new Date('2026-11-23T12:00:00Z');
for (const p of gecisleriBul(s, b, new Date(b.getTime()+86400e3), gozlemciKur(DAG)))
  console.log(new Date(p.zirveZaman.getTime()+3*3600e3).toISOString().slice(11,16),'TSİ zirve',p.zirveYukseklik.toFixed(0)+'°',p.dogusAzimut.toFixed(0)+'→'+p.batisAzimut.toFixed(0),'kolay:',p.gozleKolay);
