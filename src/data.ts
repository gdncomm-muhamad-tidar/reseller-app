import { ImageSourcePropType } from 'react-native';
import type { BadgeTone } from './ui';

export const IMG = {
  a36: require('../assets/img/a36.jpg'),
  tab: require('../assets/img/tab.jpg'),
  watch: require('../assets/img/watch.jpg'),
  s25fe: require('../assets/img/s25fe.jpg'),
  buds: require('../assets/img/buds.jpg'),
  ultra: require('../assets/img/ultra.jpg'),
  ip16pro: require('../assets/img/ip16pro.jpg'), airpods: require('../assets/img/airpods.jpg'), ipadair: require('../assets/img/ipadair.jpg'),
  ip16: require('../assets/img/ip16.jpg'), ip17: require('../assets/img/ip17.png'), ip17pm: require('../assets/img/ip17pm.jpg'),
  watch11: require('../assets/img/watch11.jpg'), ipair: require('../assets/img/ipair.png'), ip17pro: require('../assets/img/ip17pro.png'),
  catIphone: require('../assets/img/cat-iphone.png'), catIpad: require('../assets/img/cat-ipad.png'), catWatch: require('../assets/img/cat-watch.png'),
  catMac: require('../assets/img/cat-mac.png'), catAirpod: require('../assets/img/cat-airpod.png'), catAks: require('../assets/img/cat-aksesori.png'),
  a56: require('../assets/img/a56.jpg'),
  flip7: require('../assets/img/flip7.jpg'),
  trophy0: require('../assets/img/trophy0.png'),
  trophyCheck: require('../assets/img/trophy-check.png'),
  point: require('../assets/img/point.png'),
  medal: require('../assets/img/medal.png'),
  mission: require('../assets/img/mission.png'),
  shopping: require('../assets/img/shopping.png'),
  phone: require('../assets/img/phone.png'),
  money: require('../assets/img/money.png'),
  scan: require('../assets/img/scan.png'),
  device: require('../assets/img/device.png'),
  store: require('../assets/img/store.png'),
  monthNext: require('../assets/img/month-next.png'),
  cnConfetti: require('../assets/img/cn-confetti.png'),
  routinePayments: require('../assets/img/routine-payments.png'),
  warning: require('../assets/img/warning.png'),
  docPaper: require('../assets/img/doc-paper.png'),
};

// Payment method logos from Figma ("Payment method logo", 34×34 frame).
// box = [left, top, width, height] inside the frame, as placed in the design.
export const BANK_LOGO: Record<string, { src: ImageSourcePropType; box: [number, number, number, number]; fit: 'contain' | 'cover' | 'stretch' }> = {
  BCA: { src: require('../assets/img/bank/bca.png'), box: [0.85, 11.9, 32.3, 10.56], fit: 'stretch' },
  Mandiri: { src: require('../assets/img/bank/mandiri.png'), box: [0.85, 11.9, 32.3, 10.56], fit: 'contain' },
  BNI: { src: require('../assets/img/bank/bni.png'), box: [0, 11.79, 33.69, 10.43], fit: 'stretch' },
  BRI: { src: require('../assets/img/bank/bri.png'), box: [4, 3, 27, 27], fit: 'contain' },
  Permata: { src: require('../assets/img/bank/permata.png'), box: [4, 3, 27, 27], fit: 'contain' },
  'CIMB Niaga': { src: require('../assets/img/bank/cimb.png'), box: [4, 3, 27, 27], fit: 'cover' },
};

export type MissionKey = 'smart' | 'tab' | 'aks';
/** Figma product-label (tertiary badge): Promo dealer · Pre-order · Populer */
export type ProductTag = 'promo' | 'pre' | 'pop';
export const TAG_LABEL: Record<ProductTag, string> = { promo: 'Promo dealer', pre: 'Pre-order', pop: 'Populer' };
export type Product = {
  id: string; n: string; p: number; o?: number; d?: string; tag?: ProductTag; img: ImageSourcePropType;
  meta: string; cat: MissionKey; mta: string; variants: string[]; colors: string[]; desc: string; stock: string;
  /** stock is internal only — never shown to dealers */
  /** credit note per unit after the buyer's IMEI is scanned (program: Rp100rb–350rb per unit) */
  cn: number;
  /** katalog category (per brand) */
  kat?: string;
  brand?: 'apple';
};
export const PRODUCTS: Record<string, Product> = {
  a36: { id: 'a36', n: 'Galaxy A36 5G 8/256GB', p: 4399000, o: 4799000, d: '−8%', tag: 'promo', img: IMG.a36, meta: '+Rp100rb credit note', cat: 'smart', mta: 'MTA-A36-0821', variants: ['8/256GB', '8/128GB'], colors: ['Awesome Black', 'Lavender', 'White'], desc: 'Layar Super AMOLED 6,7", Snapdragon 6 Gen 3, baterai 5.000 mAh dengan 45W Super Fast Charging, dan Galaxy AI. Garansi resmi SEIN.', stock: 'Stok gudang Jakarta: 240 unit', cn: 100000, kat: 'smart' },
  tab: { id: 'tab', n: 'Galaxy Tab S10 FE 5G 128GB', p: 6999000, o: 7999000, d: '−13%', tag: 'promo', img: IMG.tab, meta: '+Rp150rb credit note', cat: 'tab', mta: 'MTA-TABS10FE-0412', variants: ['8/128GB', '12/256GB'], colors: ['Gray', 'Silver', 'Blue'], desc: 'Layar 10,9" 90Hz, S Pen di dalam kotak, IP68, dan Galaxy AI untuk catatan dan ringkasan. Garansi resmi SEIN.', stock: 'Stok gudang Jakarta: 85 unit', cn: 150000, kat: 'tab' },
  watch: { id: 'watch', n: 'Galaxy Watch8 44mm', p: 5499000, tag: 'pre', img: IMG.watch, meta: '+Rp100rb credit note', cat: 'tab', mta: 'MTA-WATCH8-44', variants: ['44mm', '40mm'], colors: ['Graphite', 'Silver'], desc: 'Pre-order, dikirim mulai 25 Nov. Pengukuran antioksidan, coaching lari, dan baterai hingga 40 jam.', stock: 'Pre-order · kirim mulai 25 Nov', cn: 100000, kat: 'watch' },
  s25fe: { id: 's25fe', n: 'Galaxy S25 FE 8/256GB', p: 9999000, img: IMG.s25fe, meta: '142 dealer beli', cat: 'smart', mta: 'MTA-S25FE-256', variants: ['8/256GB', '8/512GB'], colors: ['Navy', 'Icyblue', 'White'], desc: 'Kamera 50MP dengan ProVisual Engine, Exynos 2400, baterai 4.900 mAh, dan 7 tahun update OS.', stock: 'Stok gudang Jakarta: 120 unit', cn: 250000, kat: 'smart' },
  buds: { id: 'buds', n: 'Galaxy Buds3 Pro', p: 3199000, o: 3499000, d: '−9%', tag: 'pop', img: IMG.buds, meta: '96 dealer beli', cat: 'aks', mta: 'MTA-BUDS3PRO', variants: ['Standar'], colors: ['Silver', 'White'], desc: 'ANC adaptif, audio 24-bit Hi-Fi, dan desain blade dengan lampu. Masuk hitungan Misi Aksesori.', stock: 'Stok gudang Jakarta: 310 unit', cn: 100000, kat: 'buds' },
  ultra: { id: 'ultra', n: 'Galaxy S25 Ultra 256GB', p: 18499000, img: IMG.ultra, meta: '+Rp350rb credit note', cat: 'smart', mta: 'MTA-S25U-256', variants: ['12/256GB', '12/512GB'], colors: ['Titanium Black', 'Titanium Silverblue'], desc: 'S Pen, kamera 200MP, Snapdragon 8 Elite for Galaxy, dan Galaxy AI. Garansi resmi SEIN.', stock: 'Indent · 3–5 hari kerja', cn: 350000, kat: 'smart' },
  a56: { id: 'a56', n: 'Galaxy A56 5G 256GB', p: 5199000, o: 5299000, d: '−2%', img: IMG.a56, meta: '+Rp100rb credit note', cat: 'smart', mta: 'MTA-A56-256', variants: ['8/256GB'], colors: ['Awesome Pink', 'Awesome Graphite', 'Awesome Lightgray'], desc: 'Layar Super AMOLED 6,7", Exynos 1580, baterai 5.000 mAh dengan 45W Super Fast Charging, dan Galaxy AI. Garansi resmi SEIN.', stock: 'Stok gudang Jakarta: 180 unit', cn: 100000, kat: 'smart' },
  flip7: { id: 'flip7', n: 'Galaxy Z Flip7 256GB', p: 16999000, img: IMG.flip7, meta: '74 dealer beli', cat: 'smart', mta: 'MTA-ZFLIP7-256', variants: ['12/256GB', '12/512GB'], colors: ['Coralred', 'Blue Shadow', 'Jetblack'], desc: 'Layar FlexWindow 4,1" tepi-ke-tepi, Exynos 2500, dan Galaxy AI. Garansi resmi SEIN.', stock: 'Stok gudang Jakarta: 60 unit', cn: 300000, kat: 'smart' },
};
/* Apple dealer catalogue (Figma 1b Homepage — Dealer Apple). desc/variants/stock/cn of the "dealer beli" items are demo values. */
const AP = (id: string, n: string, p: number, kat: string, cat: MissionKey, cn: number, extra: Partial<Product> = {}): Product => ({
  id, n, p, kat, cat, cn, brand: 'apple', img: IMG[id as keyof typeof IMG], meta: cn ? `+Rp${cn / 1000}rb credit note` : '', mta: `MTA-${id.toUpperCase()}`,
  variants: ['256GB'], colors: ['Natural', 'Black', 'White'], desc: 'Garansi resmi iBox/Digimap. Unit baru, segel.', stock: 'Stok gudang Jakarta tersedia', ...extra,
});
Object.assign(PRODUCTS, {
  ip16pro: AP('ip16pro', 'iPhone 16 Pro 256GB', 19999000, 'iphone', 'smart', 350000, { meta: '+Rp350rb credit note' }),
  airpods: AP('airpods', 'AirPods Pro 2 USB-C', 3349000, 'airpod', 'aks', 100000, { variants: ['Standar'], colors: ['White'] }),
  ipadair: AP('ipadair', 'iPad Air M3 11" 128GB', 9499000, 'ipad', 'tab', 150000, { variants: ['128GB', '256GB'] }),
  ip16: AP('ip16', 'iPhone 16 128GB Black', 13799000, 'iphone', 'smart', 300000, { o: 14999000, d: '−8%', tag: 'promo', variants: ['128GB'] }),
  ip17: AP('ip17', 'iPhone 17 256GB', 16499000, 'iphone', 'smart', 350000, { tag: 'pre', stock: 'Pre-order · kirim mulai 28 Nov' }),
  ip17pm: AP('ip17pm', 'iPhone 17 Pro Max 256GB', 23999000, 'iphone', 'smart', 350000, { meta: '128 dealer beli', variants: ['256GB', '512GB'] }),
  watch11: AP('watch11', 'Apple Watch Series 11', 6999000, 'watch', 'tab', 150000, { o: 7499000, d: '−7%', tag: 'promo', variants: ['42mm', '46mm'] }),
  ipair: AP('ipair', 'iPhone Air 256GB', 19999000, 'iphone', 'smart', 300000, { meta: '102 dealer beli' }),
  ip17pro: AP('ip17pro', 'iPhone 17 Pro 256GB', 21999000, 'iphone', 'smart', 350000, { meta: '88 dealer beli', variants: ['256GB', '512GB'] }),
});

// Figma 1a Homepage: section/pilihan-toko, section/trending, section/beli-lagi
export const RECO = ['a36', 'watch', 'buds', 'tab'];
export const TRENDING: { id: string; noTag?: boolean }[] = [{ id: 's25fe' }, { id: 'buds', noTag: true }, { id: 'flip7' }, { id: 'tab' }];
export const REBUY: { id: string; drop?: string; note: string }[] = [
  { id: 'ultra', drop: 'Turun Rp300rb', note: 'Terakhir beli Rp18.799.000' },
  { id: 'a56', note: '2 unit · 17 Okt' },
  { id: 'flip7', note: '2 unit · 15 Sep' },
];

export const MISSIONS: Record<MissionKey, { lvl: TierKey; L: string; t: string; tg: number; pct: string; reward: number; cat: string; streak?: boolean }> = {
  smart: { lvl: 'gold', L: 'Gold', t: 'Misi Loyalty Smartphone', tg: 300, pct: '0,5%', reward: 1500000, cat: 'smartphone Samsung', streak: true },
  tab: { lvl: 'classic', L: 'Classic', t: 'Misi Tablet & Wearable', tg: 50, pct: '0,25%', reward: 125000, cat: 'tablet & wearable Samsung' },
  aks: { lvl: 'classic', L: 'Classic', t: 'Misi Aksesori', tg: 50, pct: '0,25%', reward: 130000, cat: 'aksesori Samsung' },
};
export const MISSION_START: Record<MissionKey, number> = { smart: 210, tab: 45, aks: 52 };
/** Stage bonus (poin) per mission: reach 25% → 250 poin, 50% → 500 poin */
/** Bonus kuartal: target Misi Smartphone 3 bulan beruntun → bonus credit note */
export const QUARTER_BONUS = 2500000;
export const STAGE_POIN: [number, number][] = [[25, 250], [50, 500]];
export const stagePoin = (k: MissionKey, v: number) => STAGE_POIN.filter(([p]) => v >= (MISSIONS[k].tg * p) / 100).reduce((a, [, pt]) => a + pt, 0);
/** Spend per mission in Oktober (Rp juta) — Okt Misi Smartphone tercapai (quarter streak 1) */
export const MISSION_OKT: Record<MissionKey, number> = { smart: 305, tab: 51, aks: 47 };

export type TierKey = 'classic' | 'gold' | 'platinum' | 'infinite';
export const TIERS: [TierKey, string, string, string, string][] = [
  ['classic', 'Classic', 'Rp50jt/bln', '0,25%', ''],
  ['gold', 'Gold', 'Rp300jt/bln', '0,5%', 'poin 1,2×'],
  ['platinum', 'Platinum', 'Rp500jt/bln', '0,8%', 'poin 1,5× · prioritas stok'],
  ['infinite', 'Infinite Pro', 'Rp1M/bln', '1%', 'poin 2× · prioritas stok · sales khusus'],
];
export const TIER_TINT: Record<TierKey, string> = { classic: '#cbd6ec', gold: '#ebbf4f', platinum: '#d9dde3', infinite: '#c7b8f5' };

/** Credit note states: tersedia · terpakai · hangus (no claim flow) */
export type CNState = 'use' | 'used' | 'expired';
export type CN = { exp?: string; k: string; icon: 'trophy0' | 'scan' | 'medal' | 'receipt'; t: string; c: string; amt: number; st: CNState; usedBy?: string; usedAt?: string; got: string;
  /** what the credit note paid for: an order (potongan pesanan) or a tagihan (bayar invoice) */
  usedFor?: 'order' | 'inv' };
/* Credit notes on 16 Nov 2026 (demo "today").
 * Tersedia: 130.000 + 1.500.000 + 350.000 = Rp1.980.000 (= "Credit note Anda") */
export const CN_START: CN[] = [
  { k: 'aks', icon: 'trophy0', t: 'Misi Aksesori · Nov', c: 'CN-2026-1116', amt: 130000, st: 'use', exp: '31 Des 2026', got: '16 Nov 2026' },
  { k: 'imeiSep', icon: 'scan', t: 'Cashback scan IMEI · Sep', c: 'CN-2026-0912', amt: 1500000, st: 'use', exp: '30 Nov 2026', got: '1 Okt 2026' },
  { k: 'ret1', icon: 'receipt', t: 'Retur #RFQ/1042', c: 'CN-2026-0855', amt: 350000, st: 'use', exp: '31 Des 2026', got: '2 Nov 2026' },
  { k: 'ret2', icon: 'receipt', t: 'Retur #RFQ/1088', c: 'CN-2026-0951', amt: 200000, st: 'used', usedBy: '#RFQ/1102', usedAt: '25 Okt 2026', got: '20 Okt 2026' },
  { k: 'gold', icon: 'medal', t: 'Bonus tier Gold · Q3', c: 'CN-2026-0987', amt: 1300000, st: 'used', usedBy: '#RFQ/1109', usedAt: '10 Okt 2026', got: '5 Okt 2026' },
  // dipakai bayar tagihan: INV/0058 Rp21.295.000 = credit note Rp500.000 + transfer Rp20.795.000
  { k: 'imeiJul', icon: 'scan', t: 'Cashback scan IMEI · Jul', c: 'CN-2026-0788', amt: 500000, st: 'used', usedBy: 'INV/0058/2026', usedFor: 'inv', usedAt: '26 Okt 2026', got: '1 Agu 2026' },
  { k: 'imei', icon: 'scan', t: 'Cashback scan IMEI · Agu', c: 'CN-2026-0871', amt: 1000000, st: 'expired', exp: '31 Okt 2026', got: '1 Sep 2026' },
];

export type Inv = { id: string; rfq: string; amt: number; term: string; due: string; st: 'over' | 'due' | 'paid'; badge?: [BadgeTone, string, boolean?]; fresh?: boolean };
/* Invoices of past orders (see HISTORY). Today = Senin, 16 Nov 2026.
 * INV/0063 (#RFQ/1150, CBD) is derived from the live order in the store. */
export const INV_START: Inv[] = [
  { id: 'INV/0059/2026', rfq: '#RFQ/1109', amt: 21897000, term: 'Net 30', due: 'Jatuh tempo 12 Nov · Net 30 · denda 0,1% per hari', st: 'over', badge: ['red', 'Lewat 4 hari', true] },
  { id: 'INV/0062/2026', rfq: '#RFQ/1121', amt: 10398000, term: 'Net 30', due: 'Jatuh tempo 19 Nov · Net 30', st: 'due', badge: ['red', 'Jatuh tempo dalam 3 hari'] },
  { id: 'INV/0058/2026', rfq: '#RFQ/1102', amt: 21295000, term: 'CBD', due: 'Dibayar 26 Okt · CBD · credit note Rp500.000', st: 'paid' },
];
export const CREDIT_LIMIT = 100000000;
/** Poin earned in November before the demo (Σ = 3.000): scans (#RFQ/1102 3× A36 @150, #RFQ/1121 2× A56 @150) + stage bonuses of the 3 missions */
export const POIN_NOV: [string, string, number][] = [
  ['Scan IMEI · 3 unit Galaxy A36', '14 Nov', 450],
  ['Bonus tahapan 50% · Misi Smartphone', '12 Nov', 500],
  ['Bonus tahapan 50% · Misi Aksesori', '10 Nov', 500],
  ['Bonus tahapan 50% · Misi Tablet & Wearable', '9 Nov', 500],
  ['Scan IMEI · 2 unit Galaxy A56', '8 Nov', 300],
  ['Bonus tahapan 25% · Misi Smartphone', '6 Nov', 250],
  ['Bonus tahapan 25% · Misi Aksesori', '4 Nov', 250],
  ['Bonus tahapan 25% · Misi Tablet & Wearable', '3 Nov', 250],
];
export const POIN_START = 12450;
export const TODAY = 16; // 16 Nov 2026
/** "16 Des" = today + n days (n ≤ 44) */
export const dayAfter = (n: number) => { const d = TODAY + n; return d <= 30 ? `${d} Nov` : `${d - 30} Des`; };
export const NET_DAYS = [1, 7, 10, 14, 21, 30];
/** "dalam 3 hari" / "besok" / "hari ini" / "lewat 4 hari" from a due string like "Jatuh tempo 19 Nov" or "17 Des" */
export function dueIn(due: string) {
  const m = due.match(/(\d+) (Nov|Des)/);
  if (!m) return '';
  const d = +m[1] + (m[2] === 'Des' ? 30 : 0) - TODAY;
  return d < 0 ? `lewat ${-d} hari` : d === 0 ? 'hari ini' : d === 1 ? 'besok' : `dalam ${d} hari`;
}

/* ---------- Order history (static, before the live demo) ----------
 * Unit price p is the price at order time. Totals = Σ p×qty − Diskon CBD (CBD only) − credit note used (CN_START.usedBy). */
export type OrderLine = { id: string; qty: number; p?: number };
export type HistStatus = 'ship' | 'done' | 'expired';
export type HistOrder = {
  id: string; inv?: string; term: 'cbd' | 'net'; status: HistStatus; date: string; items: OrderLine[];
  so?: string; steps: [string, string][]; // timeline, newest first: [label, time]
  scanned?: number; arrive?: string;
};
export const HISTORY: HistOrder[] = [
  { id: '#RFQ/1138', term: 'net', status: 'ship', date: '12 Nov 2026, 10.15 WIB', so: 'SO/2026/1138', arrive: '17 Nov', items: [{ id: 'a36', qty: 2 }, { id: 's25fe', qty: 4 }],
    steps: [['Pesanan dalam pengiriman', '15 Nov 2026, 14.30 WIB'], ['Pesanan dalam pengemasan', '13 Nov 2026, 09.10 WIB'], ['Pesanan disetujui', '12 Nov 2026, 13.05 WIB'], ['Pengajuan pesanan diproses', '12 Nov 2026, 10.15 WIB']] },
  { id: '#RFQ/1129', term: 'cbd', status: 'expired', date: '6 Nov 2026, 16.40 WIB', items: [{ id: 'flip7', qty: 2 }],
    steps: [['Pesanan kedaluwarsa', '8 Nov 2026, 00.00 WIB'], ['Pesanan disetujui', '6 Nov 2026, 18.20 WIB'], ['Pengajuan pesanan diproses', '6 Nov 2026, 16.40 WIB']] },
  { id: '#RFQ/1121', inv: 'INV/0062/2026', term: 'net', status: 'done', date: '17 Okt 2026, 11.20 WIB', so: 'SO/2026/1121', scanned: 2, items: [{ id: 'a56', qty: 2 }],
    steps: [['Pesanan selesai', '20 Okt 2026, 15.00 WIB'], ['Pesanan sampai', '20 Okt 2026, 14.12 WIB'], ['Pesanan dalam pengiriman', '19 Okt 2026, 08.30 WIB'], ['Pesanan dalam pengemasan', '18 Okt 2026, 09.00 WIB'], ['Pesanan disetujui', '17 Okt 2026, 13.40 WIB'], ['Pengajuan pesanan diproses', '17 Okt 2026, 11.20 WIB']] },
  { id: '#RFQ/1109', inv: 'INV/0059/2026', term: 'net', status: 'done', date: '10 Okt 2026, 09.30 WIB', so: 'SO/2026/1109', scanned: 3, items: [{ id: 's25fe', qty: 2 }, { id: 'buds', qty: 1 }],
    steps: [['Pesanan selesai', '13 Okt 2026, 16.00 WIB'], ['Pesanan sampai', '13 Okt 2026, 11.45 WIB'], ['Pesanan dalam pengiriman', '12 Okt 2026, 08.15 WIB'], ['Pesanan dalam pengemasan', '11 Okt 2026, 09.30 WIB'], ['Pesanan disetujui', '10 Okt 2026, 12.10 WIB'], ['Pengajuan pesanan diproses', '10 Okt 2026, 09.30 WIB']] },
  { id: '#RFQ/1102', inv: 'INV/0058/2026', term: 'cbd', status: 'done', date: '25 Okt 2026, 10.05 WIB', so: 'SO/2026/1102', scanned: 3, items: [{ id: 'a36', qty: 5 }],
    steps: [['Pesanan selesai', '29 Okt 2026, 17.20 WIB'], ['Pesanan sampai', '29 Okt 2026, 13.05 WIB'], ['Pesanan dalam pengiriman', '27 Okt 2026, 08.40 WIB'], ['Pesanan dalam pengemasan', '26 Okt 2026, 13.00 WIB'], ['Pembayaran diterima', '26 Okt 2026, 11.32 WIB'], ['Pesanan disetujui', '25 Okt 2026, 14.30 WIB'], ['Pengajuan pesanan diproses', '25 Okt 2026, 10.05 WIB']] },
];
export const lineP = (l: OrderLine) => l.p ?? PRODUCTS[l.id].p;
export const orderSub = (items: OrderLine[]) => items.reduce((a, l) => a + lineP(l) * l.qty, 0);
export const orderTotal = (o: { items: OrderLine[]; term: 'cbd' | 'net' }) => orderSub(o.items) - (o.term === 'cbd' ? CBD_DISCOUNT : 0);
export const orderCN = (items: OrderLine[]) => items.reduce((a, l) => a + PRODUCTS[l.id].cn * l.qty, 0);
/** IMEI not yet scanned on finished orders → potential credit note */
export const UNSCANNED = HISTORY.filter(o => o.status === 'done').flatMap(o => {
  let skip = o.scanned ?? 0;
  return o.items.flatMap(l => Array.from({ length: l.qty }, () => l.id)).filter(() => skip-- <= 0);
});

export type Reward = { k: string; img: ImageSourcePropType; t: string; c: number; cat: 'cash' | 'voucher' | 'device'; photo?: boolean };
export const REWARDS: Reward[] = [
  { k: 'cash5', img: IMG.money, t: 'Saldo tunai Rp500.000', c: 10000, cat: 'cash' },
  { k: 'vch', img: IMG.medal, t: 'Voucher belanja Rp100.000', c: 2000, cat: 'voucher' },
  { k: 'cash1', img: IMG.money, t: 'Saldo tunai Rp1.000.000', c: 19000, cat: 'cash' },
  { k: 'buds', img: IMG.buds, t: 'Galaxy Buds3 Pro', c: 45000, cat: 'device', photo: true },
];

/* ---------- IMEI / serial lookup (demo stand-in for the BE hybrid validation) ----------
 * Old flow (OMG Distribution · Scan Process – Hybrid validation):
 *  - not in data            → "No. IMEI/No. Seri tidak terdaftar." (stay on input page)
 *  - registered & criteria  → Terverifikasi tab (+ cashback & poin)
 *  - registered, criteria ✗ → Gagal tab (may change later; user re-checks)
 *  - serial number          → Menunggu tab until the serial is matched to an IMEI
 */
export const IMEI_RULES = { min: 10, max: 50 };
export type ImeiLookup =
  | { kind: 'unregistered' }
  | { kind: 'ok' | 'pending'; productId: string }
  | { kind: 'fail'; productId?: string; reason: string };

const IMEI_DEMO: Record<string, ImeiLookup> = {
  '356789104512345': { kind: 'ok', productId: 'a36' },
  '356789104598765': { kind: 'ok', productId: 'ultra' },
  '352723092208967': { kind: 'fail', reason: 'Unit bukan pembelian dari GDN' },
  '351234567890123': { kind: 'fail', productId: 's25fe', reason: 'Pembeli pertama sudah tercatat di dealer lain' },
};
const SCANNABLE = ['a36', 's25fe', 'ultra', 'tab', 'watch', 'buds'];

export function lookupImei(code: string): ImeiLookup {
  const c = code.toUpperCase();
  if (IMEI_DEMO[c]) return IMEI_DEMO[c];
  const pick = () => SCANNABLE[[...c].reduce((a, ch) => a + ch.charCodeAt(0), 0) % SCANNABLE.length];
  if (/^35\d{13}$/.test(c)) return { kind: 'ok', productId: pick() }; // Samsung IMEI (TAC 35…)
  if (/^R[0-9A-Z]{10}$/.test(c)) return { kind: 'pending', productId: pick() }; // Samsung serial no.
  return { kind: 'unregistered' };
}

export const cashbackOf = (id: string) => PRODUCTS[id]?.cn ?? 0;
export const poinOf = (id: string) => (id === 'ultra' ? 350 : id === 's25fe' ? 250 : 150);

/* ---------- Performa belanja (home) ----------
 * Monthly purchase value in Rp juta, Des 2025 – Nov 2026 (Nov = berjalan).
 * Level is reviewed on the last 3 full months: Agu 300 · Sep 320 · Okt 340 → rata-rata Rp320jt (Gold ≥ 300).
 * Nov (berjalan) = paid mission spend 307 (210+45+52) + #RFQ/1138 48,8 + #RFQ/1150 56,4 ≈ 412. */
export type SalesPt = { s: string; l: string; v: number };
export const SALES: SalesPt[] = [
  { s: 'Des', l: 'Desember 2025', v: 210 }, { s: 'Jan', l: 'Januari 2026', v: 195 }, { s: 'Feb', l: 'Februari 2026', v: 220 },
  { s: 'Mar', l: 'Maret 2026', v: 240 }, { s: 'Apr', l: 'April 2026', v: 230 }, { s: 'Mei', l: 'Mei 2026', v: 250 },
  { s: 'Jun', l: 'Juni 2026', v: 265 }, { s: 'Jul', l: 'Juli 2026', v: 280 }, { s: 'Agu', l: 'Agustus 2026', v: 300 },
  { s: 'Sep', l: 'September 2026', v: 320 }, { s: 'Okt', l: 'Oktober 2026', v: 340 }, { s: 'Nov', l: 'November 2026 (berjalan)', v: 412 },
];
export const SALES_RANGES = [3, 6, 12] as const;
export type SalesRange = (typeof SALES_RANGES)[number];
/** KPI tiles per range: [label, value, % vs previous period] */
export const SALES_KPI: Record<SalesRange, { orders: [string, number]; units: [string, number]; cnPct: number }> = {
  3: { orders: ['12', 20], units: ['48', 12], cnPct: 33 },
  6: { orders: ['23', 15], units: ['91', 9], cnPct: 18 },
  12: { orders: ['41', 11], units: ['170', 8], cnPct: 26 },
};

export const BANKS: [string, string][] = [['BCA', '#005eb8'], ['Mandiri', '#003d79'], ['BNI', '#f15a23'], ['BRI', '#00529c'], ['Permata', '#00993f'], ['CIMB Niaga', '#7a001a']];
export const CBD_DISCOUNT = 500000;


/* ---------- Brand access (Pilih brand) ---------- */
export type Brand = 'samsung' | 'apple';
export type BrandCfg = {
  name: string; store: string; reco: string[]; trending: { id: string; noTag?: boolean }[];
  rebuy: { id: string; drop?: string; note: string }[]; cats: [string, string, ImageSourcePropType][];
};
export const BRANDS: Record<Brand, BrandCfg> = {
  samsung: {
    name: 'Samsung', store: 'Raja Ponsel', reco: RECO, trending: TRENDING, rebuy: REBUY,
    cats: [['smart', 'Smartphone', IMG.s25fe], ['tab', 'Tablet', IMG.tab], ['watch', 'Watch', IMG.watch], ['buds', 'Audio', IMG.buds]],
  },
  apple: {
    name: 'Apple', store: 'Hello Store', reco: ['ip16', 'ip17', 'ip17pm', 'watch11'],
    trending: [{ id: 'ip17pm' }, { id: 'ipair' }, { id: 'ip17pro' }],
    rebuy: [{ id: 'ip16pro', drop: 'Harga turun Rp500rb', note: 'Terakhir beli Rp20.499.000' }, { id: 'airpods', note: '10 unit · 20 Sep' }, { id: 'ipadair', note: '4 unit · 1 Okt' }],
    cats: [['iphone', 'iPhone', IMG.catIphone], ['ipad', 'iPad', IMG.catIpad], ['watch', 'Watch', IMG.catWatch], ['mac', 'Mac', IMG.catMac], ['airpod', 'AirPod', IMG.catAirpod], ['aks', 'Aksesori', IMG.catAks]],
  },
};
