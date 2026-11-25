/* Credit note movements (masuk · dipakai untuk pesanan · dipakai bayar tagihan · hangus), newest first.
 * Shared by Finansial › Riwayat credit note and the full Riwayat credit note page. */
import type { IconName } from './icons';
import type { CN } from './data';

export type CnEvent = { k: string; date: string; title: string; sub: string; amt: number; tone: 'in' | 'out' | 'off'; icon: IconName; order?: string; inv?: string };

const SRC: Record<CN['icon'], IconName> = { scan: 'scan', medal: 'gift', receipt: 'receipt', trophy0: 'mission' };
const MON: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, Mei: 5, Jun: 6, Jul: 7, Agu: 8, Sep: 9, Okt: 10, Nov: 11, Des: 12 };
const key = (d: string) => { const [day, m, y] = d.split(' '); return (+(y ?? 2026)) * 10000 + (MON[m] ?? 0) * 100 + +day; };

export function cnEvents(cns: CN[]): CnEvent[] {
  const ev: CnEvent[] = [];
  cns.forEach(c => {
    ev.push({ k: c.k + 'in', date: c.got, title: `Masuk · ${c.t}`, sub: `${c.c} · ${c.got}`, amt: c.amt, tone: 'in', icon: SRC[c.icon] });
    if (c.st === 'used' && c.usedAt && c.usedBy) {
      ev.push(c.usedFor === 'inv'
        ? { k: c.k + 'out', date: c.usedAt, title: `Dipakai bayar tagihan ${c.usedBy}`, sub: `${c.c} · ${c.usedAt}`, amt: -c.amt, tone: 'out', icon: 'receipt', inv: c.usedBy }
        : { k: c.k + 'out', date: c.usedAt, title: `Dipakai pesanan ${c.usedBy}`, sub: `${c.c} · ${c.usedAt}`, amt: -c.amt, tone: 'out', icon: 'box', order: c.usedBy });
    }
    if (c.st === 'expired' && c.exp) ev.push({ k: c.k + 'off', date: c.exp, title: `Hangus · ${c.t}`, sub: `${c.c} · ${c.exp}`, amt: -c.amt, tone: 'off', icon: 'time' });
  });
  return ev.sort((a, b) => key(b.date) - key(a.date));
}
