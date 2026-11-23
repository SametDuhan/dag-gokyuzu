import { getDil } from './i18n.js';
export const TZ = 'Europe/Istanbul';
export const saatYaz = (d) => new Intl.DateTimeFormat(getDil() === 'tr' ? 'tr-TR' : 'en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ }).format(d);
const YON_TR = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'], YON_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
export const yonYaz = (az) => (getDil() === 'tr' ? YON_TR : YON_EN)[Math.round(az / 45) % 8];
export const sureYaz = (sn) => `${Math.floor(sn / 60)} dk`.replace('dk', getDil() === 'tr' ? 'dk' : 'min');
export const temizAd = (ad) => ad.replace(/\s+\(.*\)$/, '').replace(/\s+/g, ' ').trim() === '' ? ad : ad.replace(/\s*\[.*\]$/, '').trim();
