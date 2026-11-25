/* One view of every order (live ones from the store + static history) for Pesanan and Detail pesanan.
 * Status flow follows the reference "current order history detail" (Figma 733:28367):
 * Pengajuan diproses → disetujui → (CBD) pembayaran diterima → dikemas → dikirim → sampai → selesai · or kedaluwarsa. */
import { CBD_DISCOUNT, CN, CN_START, dueIn, HISTORY, HistOrder, Inv, OrderLine, orderCN, orderSub } from './data';
import type { Order } from './store';

export type OrderStatus = 'wait' | 'approved' | 'paid' | 'ship' | 'done' | 'expired';
export type OrderView = {
  id: string; slug: string; inv?: string; term: 'cbd' | 'net'; status: OrderStatus; date: string; items: OrderLine[];
  netDays?: number; units: number; sub: number; cbd: number; cn: number; total: number; so?: string;
  steps: [string, string][]; next?: string; scanned?: number; arrive?: string; invoice?: Inv; cnPotential: number;
};

export const slugOf = (id: string) => id.replace('#', '').replace('/', '-');

const NEXT: Record<OrderStatus, string | undefined> = {
  wait: 'Pesanan disetujui', approved: 'Pembayaran diterima', paid: 'Pesanan dalam pengiriman', ship: 'Pesanan sampai', done: undefined, expired: undefined,
};

function live(o: Order, cns: CN[], invoices: Inv[]): OrderView {
  const sub = orderSub(o.items), cbd = o.term === 'cbd' ? CBD_DISCOUNT : 0;
  const cn = cns.filter(c => o.cnUsed.includes(c.k)).reduce((a, c) => a + c.amt, 0);
  const day = `${o.date} 2026`;
  const steps: [string, string][] = [['Pengajuan pesanan diproses', `${day}, ${o.id === '#RFQ/1150' ? '16.25' : '08.20'} WIB`]];
  if (o.status !== 'wait') steps.unshift(['Pesanan disetujui', `16 Nov 2026, ${o.approvedAt ?? '08.10'} WIB`]);
  if (o.status === 'paid') steps.unshift(['Pesanan dalam pengemasan', '16 Nov 2026, 10.05 WIB'], ['Pembayaran diterima', '16 Nov 2026, 09.50 WIB']);
  if (o.steps) steps.splice(0, steps.length, ...o.steps);
  return {
    id: o.id, slug: slugOf(o.id), inv: o.status === 'wait' ? undefined : o.inv, term: o.term, netDays: o.netDays, status: o.status, date: day, items: o.items,
    units: o.items.reduce((a, l) => a + l.qty, 0), sub, cbd, cn, total: o.total, steps, next: NEXT[o.status],
    so: o.status === 'paid' ? `SO/2026/${o.id.slice(-4)}` : undefined, invoice: invoices.find(i => i.id === o.inv), cnPotential: orderCN(o.items),
  };
}

function hist(h: HistOrder, invoices: Inv[]): OrderView {
  const sub = orderSub(h.items), cbd = h.term === 'cbd' ? CBD_DISCOUNT : 0;
  const cn = CN_START.filter(c => c.usedBy === h.id).reduce((a, c) => a + c.amt, 0);
  return {
    id: h.id, slug: slugOf(h.id), inv: h.inv, term: h.term, status: h.status, date: h.date, items: h.items,
    units: h.items.reduce((a, l) => a + l.qty, 0), sub, cbd, cn, total: sub - cbd - cn, so: h.so, steps: h.steps, next: NEXT[h.status],
    scanned: h.scanned, arrive: h.arrive, invoice: invoices.find(i => i.id === h.inv), cnPotential: orderCN(h.items),
  };
}

export function allOrders(orders: Order[], cns: CN[], invoices: Inv[]): OrderView[] {
  return [...orders.map(o => live(o, cns, invoices)), ...HISTORY.map(h => hist(h, invoices))];
}

/** Badge on the order card / status card */
export const STATUS_LABEL: Record<OrderStatus, [string, 'orange' | 'blue' | 'tosca' | 'green' | 'gray']> = {
  wait: ['Menunggu persetujuan', 'blue'], approved: ['Menunggu pembayaran', 'orange'], paid: ['Diproses', 'blue'],
  ship: ['Dikirim', 'tosca'], done: ['Selesai', 'green'], expired: ['Kedaluwarsa', 'gray'],
};

/** Short date "12 Nov" from "12 Nov 2026, 10.15 WIB" */
export const shortDate = (d: string) => d.split(' ').slice(0, 2).join(' ').replace(',', '');

export { dueIn };
