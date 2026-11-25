import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Brand, cashbackOf, dayAfter, CBD_DISCOUNT, CN, CN_START, INV_START, Inv, lineP, lookupImei, POIN_START, MISSIONS, MISSION_START, MissionKey, OrderLine, orderTotal, poinOf, PRODUCTS, Reward, REWARDS } from './data';
import { toastBus } from './ui/overlay';
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
const initial = (): State => ({
  cart: [], cnSel: { aks: true }, term: 'cbd', cns: CN_START.map(c => ({ ...c })), orders: [RFQ1151, RFQ1150, RFQ1144], invPaid: {}, poin: POIN_START, redeemed: [], scans: [],
  missions: { ...MISSION_START }, missionsDone: ['aks'], payCtx: null, va: 'BCA', homeFocus: { n: 0 }, pendingPopup: false, invSel: {},
  // The demo opens right after Misi Aksesori credited its CN, so the user hasn't seen that amount yet.
  cnSeen: sumCN(CN_START) - (CN_START.find(c => c.k === 'aks')?.amt ?? 0), cnAdded: null, brand: 'samsung', netDays: 30, skipTerms: false,
});

const pad = (n: number) => String(n).padStart(4, '0');

/* #RFQ/1150 — 3× S25 Ultra at the price on 15 Nov (Rp18.799.000, turun Rp300rb on 16 Nov), CBD.
 * 56.397.000 − Diskon CBD 500.000 = Rp55.897.000 · potensi credit note 3 × Rp350rb = Rp1.050.000 */
/* #RFQ/1151 — 10× A56 (Figma 3 "Menunggu persetujuan"), Net 30: 10 × 5.199.000 = Rp51.990.000 */
const RFQ1151: Order = { id: '#RFQ/1151', inv: 'INV/0065/2026', items: [{ id: 'a56', qty: 10 }], sub: 51990000, total: 51990000, term: 'net', netDays: 30, cnUsed: [], status: 'wait', date: '16 Nov' };
/* #RFQ/1144 — 3× Tab S10 FE, CBD, paid 14 Nov → Diproses: 20.997.000 − 500.000 = Rp20.497.000 */
const RFQ1144: Order = {
  id: '#RFQ/1144', inv: 'INV/0061/2026', items: [{ id: 'tab', qty: 3 }], sub: 20997000, total: 20497000, term: 'cbd', cnUsed: [], status: 'paid', date: '13 Nov', paidDay: '14 Nov',
  steps: [['Pesanan dalam pengemasan', '15 Nov 2026, 09.00 WIB'], ['Pembayaran diterima', '14 Nov 2026, 15.10 WIB'], ['Pesanan disetujui', '14 Nov 2026, 10.30 WIB'], ['Pengajuan pesanan diproses', '13 Nov 2026, 16.45 WIB']],
};
const RFQ1150: Order = (() => {
  const items: OrderLine[] = [{ id: 'ultra', qty: 3, p: 18799000 }];
  return { id: '#RFQ/1150', inv: 'INV/0063/2026', items, sub: 56397000, total: orderTotal({ items, term: 'cbd' }), term: 'cbd', cnUsed: [], status: 'approved', date: '15 Nov', approvedAt: '08.10' };
})();

function useStoreValue() {
  const [S, set] = useState<State>(initial);
  const toast = (m: string) => toastBus.toast(m);
  const timers = useRef<any[]>([]);
  const up = useCallback((f: (s: State) => Partial<State>) => set(s => ({ ...s, ...f(s) })), []);

  /* ---- cart ---- */
  const sub = S.cart.reduce((a, c) => a + PRODUCTS[c.id].p * c.qty, 0);
  const orig = S.cart.reduce((a, c) => a + (PRODUCTS[c.id].o ?? PRODUCTS[c.id].p) * c.qty, 0);
  const units = S.cart.reduce((a, c) => a + c.qty, 0);
  const usable = S.cns.filter(c => c.st === 'use');
  const cnAmt = usable.filter(c => S.cnSel[c.k]).reduce((a, c) => a + c.amt, 0);
  const cnApplied = Math.min(cnAmt, sub);
  const total = Math.max(0, sub - cnApplied - (S.term === 'cbd' && sub > 0 ? CBD_DISCOUNT : 0));
  const cnTotal = sumCN(S.cns);
  const cnReady = usable.reduce((a, c) => a + c.amt, 0);

  const addToCart = (id: string, qty: number) => up(s => {
    const ex = s.cart.find(c => c.id === id);
    return { cart: ex ? s.cart.map(c => (c.id === id ? { ...c, qty: c.qty + qty } : c)) : [...s.cart, { id, qty }] };
  });
  const setQty = (id: string, qty: number) => up(s => ({ cart: qty <= 0 ? s.cart.filter(c => c.id !== id) : s.cart.map(c => (c.id === id ? { ...c, qty } : c)) }));
  const clearCart = () => up(() => ({ cart: [] }));
  const toggleCN = (k: string) => up(s => ({ cnSel: { ...s.cnSel, [k]: !s.cnSel[k] } }));
  const setTerm = (term: 'cbd' | 'net', netDays?: number) => up(s => ({ term, netDays: netDays ?? s.netDays }));
  const setSkipTerms = (skipTerms: boolean) => up(() => ({ skipTerms }));

  /* ---- orders ---- */
  const submitOrder = (): Order => {
    const n = S.orders.length;
    const used = usable.filter(c => S.cnSel[c.k]).map(c => c.k);
    const o: Order = { id: '#RFQ/' + (1162 + n), inv: `INV/${pad(71 + n)}/2026`, items: S.cart, sub, total, term: S.term, netDays: S.term === 'net' ? S.netDays : undefined, cnUsed: used, status: 'wait', date: '16 Nov' };
    up(s => ({ orders: [o, ...s.orders], cart: [], cnSel: {}, cns: s.cns.map(c => (used.includes(c.k) ? { ...c, st: 'used', usedBy: o.id, usedAt: '16 Nov 2026' } : c)) }));
    const t = setTimeout(() => {
      up(s => ({ orders: s.orders.map(x => (x.id === o.id ? { ...x, status: 'approved', approvedAt: '09.43' } : x)) }));
      toast(`Pesanan ${o.id} disetujui Sales Budi. Silakan bayar.`);
    }, 4500);
    timers.current.push(t);
    return o;
  };

  /* ---- invoices ---- */
  const invoices = useMemo((): (Inv & { order?: Order })[] => {
    const fromOrders = S.orders.filter(o => o.status !== 'wait').map(o => ({
      id: o.inv, rfq: o.id, amt: o.total, term: o.term === 'cbd' ? 'CBD' : `Net ${o.netDays ?? 30}`,
      due: (o.status === 'paid' ? `Dibayar ${o.paidDay ?? '16 Nov'} · ` : o.term === 'cbd' ? 'Jatuh tempo 17 Nov · ' : `Jatuh tempo ${dayAfter(o.netDays ?? 30)} · `) + (o.term === 'cbd' ? 'CBD' : `Net ${o.netDays ?? 30}`),
      st: o.status === 'paid' ? 'paid' : 'due', badge: ['yellow', 'Menunggu pembayaran'], fresh: o.status === 'approved', order: o,
    } as Inv & { order: Order }));
    const base = INV_START.map(x => (S.invPaid[x.id] ? { ...x, st: 'paid' as const, due: x.due.replace(/Jatuh tempo \d+ Nov/, 'Dibayar 16 Nov').replace(' · denda 0,1%/hari', '') } : { ...x }));
    const o = { over: 0, due: 1, paid: 2 };
    return [...fromOrders, ...base].sort((a, b) => o[a.st] - o[b.st]);
  }, [S.orders, S.invPaid]);
  const unpaid = invoices.filter(i => i.st !== 'paid');
  /** credit limit is used by unpaid Net-term invoices */
  const limitUsed = unpaid.filter(i => i.term.startsWith('Net')).reduce((a, i) => a + i.amt, 0);

  const payInvoices = (ids: string[]) => {
    const L = invoices.filter(i => ids.includes(i.id));
    const ref = L.length === 1 ? `${L[0].id} · Pesanan ${L[0].rfq}` : `${L.length} invoice (${L.map(x => x.id.slice(4, 8)).join(', ')})`;
    up(() => ({ payCtx: { ids, amt: L.reduce((a, x) => a + x.amt, 0), ref } }));
  };
  const toggleInvSel = (id: string) => up(s => ({ invSel: { ...s.invSel, [id]: s.invSel[id] === false } }));

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
    const newCNs: CN[] = achieved.map(k => ({ k: 'm-' + k, icon: 'trophy0', t: `${MISSIONS[k].t.replace('Misi ', 'Misi ')} · Nov`, c: `CN-2026-${1117 + achieved.indexOf(k)}`, amt: MISSIONS[k].reward, st: 'use', exp: '31 Des 2026', got: '16 Nov 2026' }));
    const top = (Object.keys(mAdd) as MissionKey[]).sort((a, b) => mAdd[b] - mAdd[a])[0];
    up(s => ({
      invPaid: { ...s.invPaid, ...Object.fromEntries(ctx.ids.map(i => [i, true])) },
      orders: s.orders.map(o => (ctx.ids.includes(o.inv) ? { ...o, status: 'paid' } : o)),
      poin: s.poin + pts, missions: nextM, missionsDone: [...s.missionsDone, ...achieved], cns: [...newCNs, ...s.cns],
    }));
    achieved.forEach((k, i) => setTimeout(() => toast(`${MISSIONS[k].t} tercapai! Credit note ${rp(MISSIONS[k].reward)} masuk.`), 3000 + i * 3000));
    return { pts, achieved, mission: mAdd[top] > 0 ? { k: top, pct: Math.round((mAdd[top] / MISSIONS[top].tg) * 100) } : null };
  };

  /* ---- credit note claim ---- */

  /* ---- poin ---- */
  const redeem = (k: string) => {
    const r = REWARDS.find(x => x.k === k)!;
    up(s => ({ poin: s.poin - r.c, redeemed: [r, ...s.redeemed] }));
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
    up(s => ({ scans: [scan, ...s.scans], poin: s.poin + (scan.st === 'ok' ? scan.pts : 0) }));
    if (scan.st === 'pending') {
      // serial numbers are matched to an IMEI in the background, then verified
      const t = setTimeout(() => {
        up(s => ({ scans: s.scans.map(x => (x.imei === imei ? { ...x, st: 'ok' } : x)), poin: s.poin + scan.pts }));
        toastBus.toast(`No. Seri ${imei.slice(-4)} terverifikasi · +${scan.pts} poin`, { tone: 'ok' });
      }, 8000);
      timers.current.push(t);
    }
    return { kind: scan.st, scan };
  };

  const focusHome = (msg?: string) => up(s => ({ homeFocus: { n: s.homeFocus.n + 1, msg } }));
  const setPopup = (pendingPopup: boolean) => up(() => ({ pendingPopup }));
  const setVA = (va: string) => up(() => ({ va }));
  const setBrand = (brand: Brand) => up(() => ({ brand }));
  const seeCN = (total: number) => up(s => ({
    cnSeen: total,
    cnAdded: total > s.cnSeen ? total - s.cnSeen : total < s.cnSeen ? null : s.cnAdded,
  }));
  const reset = () => { timers.current.forEach(clearTimeout); timers.current = []; set(initial()); };

  return {
    S, sub, orig, units, usable, cnAmt: cnApplied, total, cnTotal, cnReady, invoices, unpaid, limitUsed,
    addToCart, setQty, clearCart, toggleCN, setTerm, setSkipTerms, submitOrder, payInvoices, toggleInvSel, completePayment, redeem, submitScan,
    focusHome, setPopup, setVA, setBrand, seeCN, reset,
  };
}

type Store = ReturnType<typeof useStoreValue>;
const StoreCtx = createContext<Store>(null as any);
export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useStoreValue();
  return <StoreCtx.Provider value={v}>{children}</StoreCtx.Provider>;
}
export const useStore = () => useContext(StoreCtx);
