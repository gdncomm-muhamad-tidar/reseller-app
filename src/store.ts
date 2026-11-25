import { computed, reactive } from 'vue';
import { Brand, cashbackOf, dayAfter, CBD_DISCOUNT, CN, CN_START, INV_START, Inv, lineP, lookupImei, POIN_START, MISSIONS, MISSION_START, MissionKey, OrderLine, orderTotal, poinOf, PRODUCTS, Reward, REWARDS } from './data';
import { toast } from './composables/overlay';
import { rp } from './theme';

export type CartItem = { id: string; qty: number };
export type Order = { id: string; inv: string; items: OrderLine[]; sub: number; total: number; term: 'cbd' | 'net'; netDays?: number; cnUsed: string[]; status: 'wait' | 'approved' | 'paid'; date: string; approvedAt?: string;
  /** seeded orders: own timeline (newest first) and payment day */
  steps?: [string, string][]; paidDay?: string };
export type ScanSt = 'pending' | 'ok' | 'fail';
export type Scan = { imei: string; product: string; productId?: string; st: ScanSt; pts: number; cashback: number; at: number; reason?: string };
export type ScanResult = { kind: 'dup' | 'unregistered' } | { kind: ScanSt; scan: Scan };
export type PayCtx = { ids: string[]; amt: number; ref: string };

type State = {
  cart: CartItem[];
  cnSel: Record<string, boolean>;
  term: 'cbd' | 'net';
  cns: CN[];
  orders: Order[];
  invPaid: Record<string, boolean>;
  poin: number;
  redeemed: Reward[];
  scans: Scan[];
  missions: Record<MissionKey, number>;
  missionsDone: MissionKey[];
  payCtx: PayCtx | null;
  va: string;
  homeFocus: { n: number; msg?: string };
  pendingPopup: boolean;
  invSel: Record<string, boolean>;
  /** Credit note total the user last saw on Beranda (drives the number-flow nudge). */
  cnSeen: number;
  /** Amount of the latest increase, shown as "+Rp… telah ditambahkan". */
  cnAdded: number | null;
  /** dealer brand access chosen in "Pilih brand" */
  brand: Brand;
  netDays: number;
  /** "Jangan tampilkan lagi" on Ketentuan kirim pesanan */
  skipTerms: boolean;
};
const sumCN = (cns: CN[]) => cns.filter(c => c.st === 'use').reduce((a, c) => a + c.amt, 0);
const pad = (n: number) => String(n).padStart(4, '0');

/* #RFQ/1151 — 10× A56, Net 30: 10 × 5.199.000 = Rp51.990.000 */
const RFQ1151: Order = { id: '#RFQ/1151', inv: 'INV/0065/2026', items: [{ id: 'a56', qty: 10 }], sub: 51990000, total: 51990000, term: 'net', netDays: 30, cnUsed: [], status: 'wait', date: '16 Nov' };
/* #RFQ/1144 — 3× Tab S10 FE, CBD, paid 14 Nov → Diproses: 20.997.000 − 500.000 = Rp20.497.000 */
const RFQ1144: Order = {
  id: '#RFQ/1144', inv: 'INV/0061/2026', items: [{ id: 'tab', qty: 3 }], sub: 20997000, total: 20497000, term: 'cbd', cnUsed: [], status: 'paid', date: '13 Nov', paidDay: '14 Nov',
  steps: [['Pesanan dalam pengemasan', '15 Nov 2026, 09.00 WIB'], ['Pembayaran diterima', '14 Nov 2026, 15.10 WIB'], ['Pesanan disetujui', '14 Nov 2026, 10.30 WIB'], ['Pengajuan pesanan diproses', '13 Nov 2026, 16.45 WIB']],
};
/* #RFQ/1150 — 3× S25 Ultra at Rp18.799.000, CBD. */
const RFQ1150: Order = (() => {
  const items: OrderLine[] = [{ id: 'ultra', qty: 3, p: 18799000 }];
  return { id: '#RFQ/1150', inv: 'INV/0063/2026', items, sub: 56397000, total: orderTotal({ items, term: 'cbd' }), term: 'cbd', cnUsed: [], status: 'approved', date: '15 Nov', approvedAt: '08.10' };
})();

const initial = (): State => ({
  cart: [], cnSel: { aks: true }, term: 'cbd', cns: CN_START.map(c => ({ ...c })), orders: [RFQ1151, RFQ1150, RFQ1144], invPaid: {}, poin: POIN_START, redeemed: [], scans: [],
  missions: { ...MISSION_START }, missionsDone: ['aks'], payCtx: null, va: 'BCA', homeFocus: { n: 0 }, pendingPopup: false, invSel: {},
  // The demo opens right after Misi Aksesori credited its CN, so the user hasn't seen that amount yet.
  cnSeen: sumCN(CN_START) - (CN_START.find(c => c.k === 'aks')?.amt ?? 0), cnAdded: null, brand: 'samsung', netDays: 30, skipTerms: false,
});

const S = reactive<State>(initial());
let timers: ReturnType<typeof setTimeout>[] = [];
const later = (f: () => void, ms: number) => { timers.push(setTimeout(f, ms)); };

/* ---- derived ---- */
const sub = computed(() => S.cart.reduce((a, c) => a + PRODUCTS[c.id].p * c.qty, 0));
const orig = computed(() => S.cart.reduce((a, c) => a + (PRODUCTS[c.id].o ?? PRODUCTS[c.id].p) * c.qty, 0));
const units = computed(() => S.cart.reduce((a, c) => a + c.qty, 0));
const usable = computed(() => S.cns.filter(c => c.st === 'use'));
const cnAmt = computed(() => Math.min(usable.value.filter(c => S.cnSel[c.k]).reduce((a, c) => a + c.amt, 0), sub.value));
const total = computed(() => Math.max(0, sub.value - cnAmt.value - (S.term === 'cbd' && sub.value > 0 ? CBD_DISCOUNT : 0)));
const cnTotal = computed(() => sumCN(S.cns));
const cnReady = computed(() => usable.value.reduce((a, c) => a + c.amt, 0));

const invoices = computed((): (Inv & { order?: Order })[] => {
  const fromOrders = S.orders.filter(o => o.status !== 'wait').map(o => ({
    id: o.inv, rfq: o.id, amt: o.total, term: o.term === 'cbd' ? 'CBD' : `Net ${o.netDays ?? 30}`,
    due: (o.status === 'paid' ? `Dibayar ${o.paidDay ?? '16 Nov'} · ` : o.term === 'cbd' ? 'Jatuh tempo 17 Nov · ' : `Jatuh tempo ${dayAfter(o.netDays ?? 30)} · `) + (o.term === 'cbd' ? 'CBD' : `Net ${o.netDays ?? 30}`),
    st: o.status === 'paid' ? 'paid' : 'due', badge: ['yellow', 'Menunggu pembayaran'], fresh: o.status === 'approved', order: o,
  } as Inv & { order: Order }));
  const base = INV_START.map(x => (S.invPaid[x.id] ? { ...x, st: 'paid' as const, due: x.due.replace(/Jatuh tempo \d+ Nov/, 'Dibayar 16 Nov').replace(' · denda 0,1%/hari', '') } : { ...x }));
  const o = { over: 0, due: 1, paid: 2 };
  return [...fromOrders, ...base].sort((a, b) => o[a.st] - o[b.st]);
});
const unpaid = computed(() => invoices.value.filter(i => i.st !== 'paid'));
/** credit limit is used by unpaid Net-term invoices */
const limitUsed = computed(() => unpaid.value.filter(i => i.term.startsWith('Net')).reduce((a, i) => a + i.amt, 0));

/* ---- cart ---- */
const addToCart = (id: string, qty: number) => {
  const ex = S.cart.find(c => c.id === id);
  if (ex) ex.qty += qty; else S.cart.push({ id, qty });
};
const setQty = (id: string, qty: number) => {
  if (qty <= 0) S.cart = S.cart.filter(c => c.id !== id);
  else { const ex = S.cart.find(c => c.id === id); if (ex) ex.qty = qty; }
};
const clearCart = () => { S.cart = []; };
const toggleCN = (k: string) => { S.cnSel[k] = !S.cnSel[k]; };
const setTerm = (term: 'cbd' | 'net', netDays?: number) => { S.term = term; if (netDays != null) S.netDays = netDays; };
const setSkipTerms = (v: boolean) => { S.skipTerms = v; };

/* ---- orders ---- */
const submitOrder = (): Order => {
  const n = S.orders.length;
  const used = usable.value.filter(c => S.cnSel[c.k]).map(c => c.k);
  const o: Order = { id: '#RFQ/' + (1162 + n), inv: `INV/${pad(71 + n)}/2026`, items: S.cart.map(c => ({ ...c })), sub: sub.value, total: total.value, term: S.term, netDays: S.term === 'net' ? S.netDays : undefined, cnUsed: used, status: 'wait', date: '16 Nov' };
  S.orders.unshift(o);
  S.cart = [];
  S.cnSel = {};
  S.cns = S.cns.map(c => (used.includes(c.k) ? { ...c, st: 'used', usedBy: o.id, usedAt: '16 Nov 2026' } : c));
  later(() => {
    const x = S.orders.find(v => v.id === o.id);
    if (x) { x.status = 'approved'; x.approvedAt = '09.43'; }
    toast(`Pesanan ${o.id} disetujui Sales Budi. Silakan bayar.`);
  }, 4500);
  return o;
};

/* ---- invoices ---- */
const payInvoices = (ids: string[]) => {
  const L = invoices.value.filter(i => ids.includes(i.id));
  const ref = L.length === 1 ? `${L[0].id} · Pesanan ${L[0].rfq}` : `${L.length} invoice (${L.map(x => x.id.slice(4, 8)).join(', ')})`;
  S.payCtx = { ids, amt: L.reduce((a, x) => a + x.amt, 0), ref };
};
const toggleInvSel = (id: string) => { S.invSel[id] = S.invSel[id] === false; };

/** mark paid; returns earned poin + newly achieved missions */
const completePayment = () => {
  const ctx = S.payCtx;
  if (!ctx) return { pts: 0, achieved: [] as MissionKey[], mission: null as null | { k: MissionKey; pct: number } };
  const pts = Math.round(ctx.amt / 100000);
  const paidOrders = S.orders.filter(o => ctx.ids.includes(o.inv));
  const mAdd: Record<MissionKey, number> = { smart: 0, tab: 0, aks: 0 };
  paidOrders.forEach(o => o.items.forEach(it => { mAdd[PRODUCTS[it.id].cat] += (lineP(it) * it.qty) / 1e6; }));
  const nextM = { ...S.missions };
  (Object.keys(mAdd) as MissionKey[]).forEach(k => (nextM[k] = Math.round((nextM[k] + mAdd[k]) * 10) / 10));
  const achieved = (Object.keys(MISSIONS) as MissionKey[]).filter(k => !S.missionsDone.includes(k) && nextM[k] >= MISSIONS[k].tg);
  const newCNs: CN[] = achieved.map(k => ({ k: 'm-' + k, icon: 'trophy0', t: `${MISSIONS[k].t} · Nov`, c: `CN-2026-${1117 + achieved.indexOf(k)}`, amt: MISSIONS[k].reward, st: 'use', exp: '31 Des 2026', got: '16 Nov 2026' }));
  const top = (Object.keys(mAdd) as MissionKey[]).sort((a, b) => mAdd[b] - mAdd[a])[0];
  ctx.ids.forEach(i => { S.invPaid[i] = true; });
  S.orders.forEach(o => { if (ctx.ids.includes(o.inv)) o.status = 'paid'; });
  S.poin += pts;
  S.missions = nextM;
  S.missionsDone = [...S.missionsDone, ...achieved];
  S.cns = [...newCNs, ...S.cns];
  achieved.forEach((k, i) => later(() => toast(`${MISSIONS[k].t} tercapai! Credit note ${rp(MISSIONS[k].reward)} masuk.`), 3000 + i * 3000));
  return { pts, achieved, mission: mAdd[top] > 0 ? { k: top, pct: Math.round((mAdd[top] / MISSIONS[top].tg) * 100) } : null };
};

/* ---- poin ---- */
const redeem = (k: string) => {
  const r = REWARDS.find(x => x.k === k)!;
  S.poin -= r.c;
  S.redeemed.unshift(r);
};

/* ---- scan IMEI (hybrid validation, see lookupImei) ---- */
const submitScan = (raw: string): ScanResult => {
  const imei = raw.toUpperCase();
  if (S.scans.some(s => s.imei === imei)) return { kind: 'dup' };
  const r = lookupImei(imei);
  if (r.kind === 'unregistered') return { kind: 'unregistered' };
  const id = r.productId;
  const scan: Scan = {
    imei, productId: id, product: id ? PRODUCTS[id].n : 'Produk penjualan', st: r.kind, at: Date.now(),
    pts: id && r.kind !== 'fail' ? poinOf(id) : 0, cashback: id && r.kind !== 'fail' ? cashbackOf(id) : 0,
    reason: r.kind === 'fail' ? r.reason : undefined,
  };
  S.scans.unshift(scan);
  if (scan.st === 'ok') S.poin += scan.pts;
  if (scan.st === 'pending') {
    // serial numbers are matched to an IMEI in the background, then verified
    later(() => {
      const x = S.scans.find(v => v.imei === imei);
      if (x) x.st = 'ok';
      S.poin += scan.pts;
      toast(`No. Seri ${imei.slice(-4)} terverifikasi · +${scan.pts} poin`, { tone: 'ok' });
    }, 8000);
  }
  return { kind: scan.st, scan: S.scans[0] };
};

const focusHome = (msg?: string) => { S.homeFocus = { n: S.homeFocus.n + 1, msg }; };
const setPopup = (v: boolean) => { S.pendingPopup = v; };
const setVA = (va: string) => { S.va = va; };
const setBrand = (b: Brand) => { S.brand = b; };
const seeCN = (t: number) => {
  S.cnAdded = t > S.cnSeen ? t - S.cnSeen : t < S.cnSeen ? null : S.cnAdded;
  S.cnSeen = t;
};
const reset = () => { timers.forEach(clearTimeout); timers = []; Object.assign(S, initial()); };

const store = {
  S, sub, orig, units, usable, cnAmt, total, cnTotal, cnReady, invoices, unpaid, limitUsed,
  addToCart, setQty, clearCart, toggleCN, setTerm, setSkipTerms, submitOrder, payInvoices, toggleInvSel, completePayment, redeem, submitScan,
  focusHome, setPopup, setVA, setBrand, seeCN, reset,
};
/** Singleton store. Computed refs (sub, total, invoices …) are unwrapped with `.value`. */
export const useStore = () => store;
