# DAG illüstrasyonu (SVG) üretici → araclar/parcalar/sahne.html . Çalıştır: python3 araclar/sahne_uret.py
import random, math
r = random.Random(1223)
O = '#060b22'  # çizgi film dış çizgi rengi

# --- yıldızlar ---
yildiz = ''
for i in range(110):
    x, y = r.uniform(0, 1200), r.uniform(0, 400)
    yy = y ** 1.0
    rad = r.choice([0.6, 0.8, 1.0, 1.2, 1.6])
    renk = r.choice(['#f2f5ff', '#f2f5ff', '#bcd3ff', '#ffe2b0'])
    cls = f' class="parilti d{r.randint(1,3)}"' if i % 6 == 0 else ''
    yildiz += f'<circle{cls} cx="{x:.0f}" cy="{yy:.0f}" r="{rad}" fill="{renk}" opacity="{r.uniform(.35,.9):.2f}"/>'
isilti = ''
for (x, y, w, c, d) in [(150, 90, 22, '#f2f5ff', 1), (310, 170, 12, '#bcd3ff', 2), (470, 60, 18, '#f4c56a', 3), (760, 100, 13, '#f2f5ff', 1), (1110, 220, 20, '#f2f5ff', 2), (60, 230, 14, '#f4c56a', 3), (880, 60, 11, '#bcd3ff', 2), (250, 40, 10, '#f2f5ff', 3)]:
    isilti += f'<use href="#isilti" class="parilti d{d}" x="{x}" y="{y}" width="{w}" height="{w}" color="{c}"/>'

# --- kar tanecikleri ---
kar = ''
for i in range(34):
    x, rad = r.uniform(80, 1120), r.choice([1.2, 1.6, 2.0, 2.6])
    kar += f'<circle class="kar" cx="{x:.0f}" cy="-10" r="{rad}" style="animation-delay:-{r.uniform(0,16):.1f}s;animation-duration:{r.uniform(9,17):.1f}s"/>'

# --- kubbe dilimleri ---
dilim = ''
for dx in (-46, -24, 24, 46):
    dilim += f'<path d="M{600+dx},276 Q{600+dx*0.86:.0f},238 {600+dx*0.16:.0f},209" fill="none" stroke="#a9b8de" stroke-width="1.6" opacity=".8"/>'

# --- zirve karı (tırtıklı) ---
kar_ust = 'M452,398'
x = 452
while x < 748:
    kar_ust += f' q9,-11 18,0'
    x += 18
kar_ust += ' L748,402 L452,402Z'

# --- solar paneller ---
panel = ''
for i in range(3):
    x0 = 318 + i * 38
    panel += f'<line x1="{x0+6}" y1="398" x2="{x0+6}" y2="404" stroke="{O}" stroke-width="3"/><line x1="{x0+28}" y1="392" x2="{x0+28}" y2="400" stroke="{O}" stroke-width="3"/><polygon points="{x0},386 {x0+30},378 {x0+34},394 {x0+4},400" fill="#1d3f9c" stroke="{O}" stroke-width="2.5" stroke-linejoin="round"/><line x1="{x0+15}" y1="382" x2="{x0+19}" y2="397" stroke="#6f90d2" stroke-width="1.2"/>'

yol = 'M340,640 C420,600 300,560 470,528 C560,508 430,470 540,436 C590,420 600,412 600,398'

svg = f'''<svg id="sahne" viewBox="0 0 1200 575" role="img" aria-labelledby="sahneBaslik">
  <title id="sahneBaslik" data-i="sahne.baslik">Karlı Karakayatepe zirvesinde, kubbesi açık DAG gözlemevi: çizgi film tarzı illüstrasyon</title>
  <defs>
    <linearGradient id="gokG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02040a"/><stop offset=".45" stop-color="#071433"/><stop offset=".8" stop-color="#12306c"/><stop offset="1" stop-color="#1c4a86"/></linearGradient>
    <radialGradient id="ufukG" cx="50%" cy="72%" r="60%"><stop offset="0" stop-color="#4f86e8" stop-opacity=".5"/><stop offset="1" stop-color="#4f86e8" stop-opacity="0"/></radialGradient>
    <radialGradient id="ayG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f6efd9" stop-opacity=".42"/><stop offset="1" stop-color="#f6efd9" stop-opacity="0"/></radialGradient>
    <linearGradient id="uzakG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a3a82"/><stop offset="1" stop-color="#244f9c"/></linearGradient>
    <linearGradient id="ortaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#112a66"/><stop offset="1" stop-color="#0c1d4c"/></linearGradient>
    <linearGradient id="tepeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a3b8f"/><stop offset=".5" stop-color="#0f2560"/><stop offset="1" stop-color="#091540"/></linearGradient>
    <linearGradient id="silindirG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#aebde0"/><stop offset=".28" stop-color="#ffffff"/><stop offset=".7" stop-color="#d3dcf3"/><stop offset="1" stop-color="#8d9fcd"/></linearGradient>
    <linearGradient id="kubbeG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#e7edfc"/><stop offset="1" stop-color="#a5b5de"/></linearGradient>
    <linearGradient id="koniG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".28"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="yarikG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#f4a85a"/></linearGradient>
    <radialGradient id="lambaG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd98a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="yolG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a418a"/><stop offset="1" stop-color="#16245a"/></linearGradient>
    <filter id="bulanik" x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="sis" x="-10%" y="-100%" width="120%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>
    <clipPath id="kubbeKes"><path d="M532,276 A68,68 0 0 1 668,276 Z"/></clipPath>
    <symbol id="isilti" viewBox="-10 -10 20 20"><path d="M0,-10 L2.2,-2.2 L10,0 L2.2,2.2 L0,10 L-2.2,2.2 L-10,0 L-2.2,-2.2Z" fill="currentColor"/></symbol>
  </defs>

  <rect width="1200" height="640" fill="url(#gokG)"/>
  <rect width="1200" height="640" fill="url(#ufukG)"/>
  <ellipse cx="520" cy="190" rx="560" ry="30" transform="rotate(-14 520 190)" fill="#8fa7ff" opacity=".13" filter="url(#bulanik)"/>
  <ellipse cx="560" cy="215" rx="420" ry="12" transform="rotate(-14 560 215)" fill="#c2d0ff" opacity=".12" filter="url(#bulanik)"/>
  <g>{yildiz}</g>
  <g>{isilti}</g>
  <circle cx="1010" cy="132" r="130" fill="url(#ayG)"/>
  <circle cx="1010" cy="132" r="48" fill="#f6efd9" stroke="{O}" stroke-width="3.5"/>
  <g fill="#e1d6b2"><circle cx="994" cy="118" r="10"/><circle cx="1026" cy="148" r="7"/><circle cx="1012" cy="108" r="4.5"/><circle cx="992" cy="148" r="5.5"/><circle cx="1032" cy="122" r="3.5"/></g>
  <path d="M966,150 A48,48 0 0 0 1020,178 A56,56 0 0 1 966,150Z" fill="#d9ccA2" opacity=".55"/>

  <!-- uzak dağlar -->
  <path d="M0,470 L70,400 L150,440 L240,350 L330,430 L420,380 L500,452 L610,372 L700,440 L800,340 L900,430 L990,372 L1080,440 L1200,392 L1200,640 L0,640Z" fill="url(#uzakG)"/>
  <path d="M0,470 L70,400 L150,440 L240,350 L330,430 L420,380 L500,452 L610,372 L700,440 L800,340 L900,430 L990,372 L1080,440 L1200,392" fill="none" stroke="#5f8be0" stroke-width="2.2" stroke-linejoin="round" opacity=".7"/>
  <g stroke="{O}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M240,350 L218,384 L232,375 L243,390 L254,377 L270,388Z" fill="#eaf1ff"/><path d="M240,350 L254,377 L243,390 L248,372Z" fill="#b7c8f0" stroke="none"/>
    <path d="M800,340 L774,380 L789,370 L801,386 L814,371 L830,383Z" fill="#eaf1ff"/><path d="M800,340 L814,371 L801,386 L808,366Z" fill="#b7c8f0" stroke="none"/>
    <path d="M610,372 L592,398 L603,391 L611,402 L620,392 L632,399Z" fill="#eaf1ff"/>
    <path d="M990,372 L972,398 L983,391 L991,402 L1000,392 L1012,399Z" fill="#eaf1ff"/>
    <path d="M420,380 L404,404 L414,397 L421,407 L429,398 L440,405Z" fill="#eaf1ff"/>
  </g>
  <ellipse cx="600" cy="470" rx="620" ry="22" fill="#9bb8ff" opacity=".16" filter="url(#sis)"/>

  <!-- orta dağlar -->
  <path d="M0,522 L90,480 L190,507 L300,448 L400,494 L470,472 L600,504 L730,472 L800,494 L900,446 L1010,507 L1110,478 L1200,518 L1200,640 L0,640Z" fill="url(#ortaG)"/>
  <path d="M0,522 L90,480 L190,507 L300,448 L400,494 L470,472 L600,504 L730,472 L800,494 L900,446 L1010,507 L1110,478 L1200,518" fill="none" stroke="#3a62c4" stroke-width="2.4" stroke-linejoin="round" opacity=".8"/>
  <g stroke="{O}" stroke-width="2.2" stroke-linejoin="round"><path d="M300,448 L282,478 L294,470 L303,482 L312,471 L326,478Z" fill="#eaf1ff"/><path d="M900,446 L882,476 L894,468 L903,480 L912,469 L926,476Z" fill="#eaf1ff"/></g>

  <!-- ana tepe -->
  <path d="M0,566 L140,524 L260,486 L380,442 L452,402 L470,396 L730,396 L748,402 L820,442 L940,486 L1060,524 L1200,562 L1200,640 L0,640Z" fill="url(#tepeG)"/>
  <path d="M0,566 L140,524 L260,486 L380,442 L452,402" fill="none" stroke="#4d7be6" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M748,402 L820,442 L940,486 L1060,524 L1200,562" fill="none" stroke="#2f56b8" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="{O}" stroke-width="2.4" stroke-linejoin="round">
    <path d="{kar_ust}" fill="#f1f6ff"/>
  </g>

  <!-- yol -->
  <path d="{yol}" fill="none" stroke="#6a8be6" stroke-width="30" stroke-linecap="round" opacity=".55"/>
  <path id="yol" d="{yol}" fill="none" stroke="url(#yolG)" stroke-width="25" stroke-linecap="round"/>
  <path d="{yol}" fill="none" stroke="#f4c56a" stroke-width="2.4" stroke-dasharray="11 12" stroke-linecap="round" opacity=".7"/>
  <g>
    <g stroke="{O}" stroke-width="2" stroke-linejoin="round">
      <polygon points="14,-2 62,-12 62,12 14,4" fill="#fff6d2" opacity=".42" stroke="none"/>
      <rect x="-12" y="-6" width="26" height="12" rx="4" fill="#d94b5b"/><rect x="-4" y="-8" width="12" height="6" rx="2" fill="#a9c8ff"/>
    </g>
    <circle cx="13" cy="-3" r="2.4" fill="#fff6d2"/><circle cx="13" cy="3" r="2.4" fill="#fff6d2"/>
    <animateMotion dur="22s" repeatCount="indefinite" rotate="auto" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#yol"/></animateMotion>
  </g>

  <!-- yan yapılar -->
  <g stroke="{O}" stroke-width="3.5" stroke-linejoin="round">
    <rect x="428" y="356" width="86" height="38" fill="#dbe3f6"/><rect x="422" y="349" width="98" height="9" rx="2" fill="#a9b8de"/>
    <path d="M458,349 A17,17 0 0 1 492,349 Z" fill="#f7f9ff"/>
    <rect x="440" y="366" width="14" height="14" rx="2" fill="#ffd27a"/><rect x="484" y="366" width="14" height="14" rx="2" fill="#ffd27a"/>
    <rect x="742" y="366" width="52" height="28" fill="#cdd7f1"/><rect x="736" y="360" width="64" height="8" rx="2" fill="#a2b2da"/>
    <rect x="806" y="362" width="38" height="32" rx="6" fill="#dfe6f8"/><line x1="806" y1="374" x2="844" y2="374"/><line x1="806" y1="384" x2="844" y2="384"/>
    <line x1="716" y1="394" x2="716" y2="296"/><line x1="704" y1="316" x2="728" y2="316"/><line x1="708" y1="336" x2="724" y2="336"/>
    <ellipse cx="716" cy="326" rx="22" ry="9" transform="rotate(-24 716 326)" fill="#eaf0ff"/>
  </g>
  {panel}
  <circle class="yanip" cx="716" cy="292" r="5" fill="#ff6b6b" stroke="{O}" stroke-width="2.5"/>

  <!-- ışık konisi -->
  <polygon points="590,214 610,214 740,20 460,20" fill="url(#koniG)" filter="url(#bulanik)"/>

  <!-- DAG ana bina -->
  <g stroke="{O}" stroke-width="4" stroke-linejoin="round">
    <rect x="520" y="330" width="160" height="64" rx="4" fill="url(#silindirG)"/>
    <rect x="540" y="284" width="120" height="50" rx="3" fill="url(#silindirG)"/>
    <rect x="530" y="274" width="140" height="14" rx="5" fill="#dfe6f8"/>
    <rect x="574" y="392" width="52" height="8" rx="2" fill="#9fb0d8"/>
  </g>
  <g stroke="#8fa1cf" stroke-width="1.6" opacity=".9"><line x1="522" y1="346" x2="678" y2="346"/><line x1="522" y1="362" x2="678" y2="362"/><line x1="522" y1="378" x2="678" y2="378"/></g>
  <g fill="#7f93c6" opacity=".7"><rect x="556" y="296" width="6" height="26" rx="2"/><rect x="578" y="296" width="6" height="26" rx="2"/><rect x="616" y="296" width="6" height="26" rx="2"/><rect x="638" y="296" width="6" height="26" rx="2"/></g>
  <path d="M532,276 A68,68 0 0 1 668,276 Z" fill="url(#kubbeG)"/>
  {dilim}
  <g clip-path="url(#kubbeKes)">
    <rect x="636" y="200" width="46" height="84" fill="#5f73aa" opacity=".4"/>
    <path d="M588,196 L614,196 L630,282 L572,282 Z" fill="#0a1236"/>
    <rect x="572" y="196" width="58" height="90" fill="url(#yarikG)" opacity=".5" class="yarik"/>
    <g transform="translate(603 258) rotate(-34)" stroke="{O}" stroke-width="3" stroke-linejoin="round"><g class="boru">
      <rect x="-10" y="-50" width="20" height="84" rx="3" fill="#9db6e8"/>
      <line x1="-10" y1="-30" x2="10" y2="-12" stroke-width="1.8"/><line x1="10" y1="-30" x2="-10" y2="-12" stroke-width="1.8"/>
      <rect x="-14" y="-56" width="28" height="10" rx="2" fill="#6f90d2"/><rect x="-13" y="26" width="26" height="10" rx="2" fill="#6f90d2"/>
      <circle cx="0" cy="-62" r="3.5" fill="#cfe0ff"/>
    </g></g>
  </g>
  <path d="M544,258 A62,62 0 0 1 574,222" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity=".85"/>
  <path d="M532,276 A68,68 0 0 1 668,276 Z" fill="none" stroke="{O}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M588,196 L614,196 L630,276" fill="none" stroke="{O}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#kubbeKes)"/>
  <g stroke="{O}" stroke-width="3" stroke-linejoin="round">
    <path d="M534,372 v-16 a9,9 0 0 1 18,0 v16z" fill="#ffd27a"/><path d="M558,372 v-16 a9,9 0 0 1 18,0 v16z" fill="#ffd27a"/>
    <path d="M624,372 v-16 a9,9 0 0 1 18,0 v16z" fill="#ffd27a"/><path d="M648,372 v-16 a9,9 0 0 1 18,0 v16z" fill="#ffd27a"/>
    <path d="M586,394 v-30 a14,14 0 0 1 28,0 v30z" fill="#1b2c63"/>
  </g>
  <circle cx="608" cy="378" r="2" fill="#f4c56a"/>

  <!-- lambalar -->
  <g>
    <ellipse cx="506" cy="396" rx="40" ry="9" fill="#ffd98a" opacity=".25"/><ellipse cx="694" cy="396" rx="40" ry="9" fill="#ffd98a" opacity=".25"/>
    <circle cx="506" cy="352" r="30" fill="url(#lambaG)"/><circle cx="694" cy="352" r="30" fill="url(#lambaG)"/>
    <g stroke="{O}" stroke-width="3" stroke-linecap="round"><line x1="506" y1="394" x2="506" y2="356"/><line x1="694" y1="394" x2="694" y2="356"/></g>
    <circle cx="506" cy="353" r="5" fill="#fff0b8" stroke="{O}" stroke-width="2.5"/><circle cx="694" cy="353" r="5" fill="#fff0b8" stroke="{O}" stroke-width="2.5"/>
  </g>

  <!-- ön plan -->
  <g stroke="{O}" stroke-width="3" stroke-linejoin="round">
    <path d="M0,640 L0,540 L60,552 L130,580 L200,616 L240,640Z" fill="#040a1c"/>
    <path d="M1200,640 L1200,530 L1130,548 L1050,580 L980,616 L940,640Z" fill="#040a1c"/>
    <path d="M26,640 L50,612 L96,608 L124,640Z" fill="#0b1738"/><path d="M1076,640 L1100,614 L1146,610 L1176,640Z" fill="#0b1738"/>
  </g>
  <g fill="#eef4ff" stroke="{O}" stroke-width="2.2" stroke-linejoin="round">
    <path d="M60,552 q12,-9 26,-2 q12,-8 22,3 q-10,10 -28,8 q-16,3 -20,-9z"/><path d="M1130,548 q12,-9 26,-2 q12,-8 22,3 q-10,10 -28,8 q-16,3 -20,-9z"/>
    <path d="M50,612 q12,-8 24,-2 q10,-6 20,2 q-8,9 -22,7 q-14,2 -22,-7z"/><path d="M1100,614 q12,-8 24,-2 q10,-6 20,2 q-8,9 -22,7 q-14,2 -22,-7z"/>
  </g>
  <g fill="#ffffff">{kar}</g>
</svg>'''
open('araclar/parcalar/sahne.html', 'w').write(svg)
print(len(svg))
