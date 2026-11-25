import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, rp, short } from '../../theme';
import { Btn, Card, Header, Icon, Row, T } from '../../ui';
import { NAV_SPACE } from '../../ui/parts';
import { useStore } from '../../store';
import { allOrders, dueIn, OrderView, shortDate, STATUS_LABEL } from '../../orders';
import { dayAfter, PRODUCTS } from '../../data';
import { openFin } from '../../nav';
import { useOverlay } from '../../ui/overlay';

/* Figma order-card v2 · tracker: green done dots + line, blue current dot with ring, grey upcoming */
function Tracker({ steps }: { steps: ('done' | 'now' | '')[] }) {
  const L = ['Disetujui', 'Bayar', 'Proses', 'Kirim', 'Selesai'];
  return (
    <Row gap={0} style={{ alignItems: 'flex-start' }}>
      {L.map((l, i) => {
        const s = steps[i];
        const lineOn = s === 'done' || s === 'now';
        return (
          <View key={l} style={{ flex: 1, alignItems: 'center', gap: 6, zIndex: 10 - i }}>
            {i > 0 && <View style={{ position: 'absolute', top: 7, left: '-50%', right: '50%', height: 2, backgroundColor: lineOn ? C.okBrand : C.bgMed }} />}
            <View style={{ height: 16, justifyContent: 'center' }}>
              {s === 'now' ? <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: C.infoMed, borderWidth: 3, borderColor: C.infoLow }} />
                : <View style={{ width: s === 'done' ? 10 : 8, height: s === 'done' ? 10 : 8, borderRadius: 5, backgroundColor: s === 'done' ? C.okBrand : C.bgMed }} />}
            </View>
            <T v={s === 'now' ? 'lbl' : 'c1'} c={s === 'now' ? C.info : C.textMed}>{l}</T>
          </View>
        );
      })}
    </Row>
  );
}

type Tone = 'orange' | 'blue' | 'tosca' | 'green' | 'gray';
const STATUS: Record<Tone, [string, string]> = { orange: ['#fed2a5', '#dc5300'], blue: [C.infoBorder, C.info], tosca: [C.toscaBorder, C.tosca], green: ['#b2efb9', C.ok], gray: ['#c8cbcd', C.textMed] };
const NOTE: Record<'warn' | 'info' | 'ok' | 'gray' | 'danger', [string, string]> = { warn: ['#fff8e0', '#bc6e06'], info: [C.infoBg, C.info], ok: ['#d6f7da', C.okBrand], gray: [C.bgMed, C.textMed], danger: [C.dangerLow, C.danger] };

function OrderCard({ o, steps, note, noteTone, actions }: {
  o: OrderView; steps: ('done' | 'now' | '')[]; note: string; noteTone: keyof typeof NOTE;
  actions: { t: string; pri?: boolean; on: () => void }[];
}) {
  const [status, tone] = STATUS_LABEL[o.status];
  return (
    <Card style={{ gap: 12 }} onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.slug } })}>
      <View style={{ gap: 4 }}>
        <Row>
          <T v="s1" style={{ flex: 1 }}>{o.id}</T>
          <View style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: STATUS[tone][0], justifyContent: 'center' }}><T v="lbl" c={STATUS[tone][1]}>{status}</T></View>
        </Row>
        <T v="c1" c={C.textMed}>{shortDate(o.date)} · {o.items.length} produk · {o.units} unit</T>
      </View>
      {o.status !== 'expired' && <Tracker steps={steps} />}
      <Row gap={8} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: NOTE[noteTone][0] }}>
        <Icon name="info" size={16} color={NOTE[noteTone][1]} /><T v="lbl" style={{ flex: 1 }}>{note}</T>
      </Row>
      <Row gap={8}>
        <T v="s2" style={{ flex: 1 }}>{rp(o.total)}</T>
        {actions.map(a => <Btn key={a.t} title={a.t} size="sm" kind={a.pri ? 'pri' : 'sec'} onPress={a.on} />)}
      </Row>
    </Card>
  );
}

/** Card content per status — shared wording with Detail pesanan */
function OrderItem({ o }: { o: OrderView }) {
  const { payInvoices, addToCart } = useStore();
  const { toast } = useOverlay();
  const pay = (inv: string) => { payInvoices([inv]); router.push('/bayar'); };
  const again = (x: OrderView) => { x.items.forEach(l => addToCart(l.id, l.qty)); router.push('/keranjang'); };
  {
    const inv = o.invoice;
    switch (o.status) {
      case 'wait': return <OrderCard key={o.id} o={o} steps={['now', '', '', '', '']} noteTone="info" note="Sales Budi cek stok & harga · ±2 jam" actions={[{ t: 'Chat sales', on: () => toast('Chat sales belum tersedia di demo ini') }]} />;
      case 'approved': return <OrderCard key={o.id} o={o} steps={['done', 'now', '', '', '']} noteTone="warn" note={`Bayar sebelum ${o.term === 'cbd' ? '17 Nov 2026, 23.59 WIB' : `${dayAfter(o.netDays ?? 30)} 2026`}`}
        actions={[{ t: 'Tagihan', on: () => openFin('inv') }, { t: 'Bayar', pri: true, on: () => pay(o.inv!) }]} />;
      case 'paid': return <OrderCard key={o.id} o={o} steps={['done', 'done', 'now', '', '']} noteTone="info" note="Pembayaran diterima. Pesanan sedang dikemas gudang." actions={[{ t: 'Tagihan', on: () => openFin('inv') }]} />;
      case 'ship': return <OrderCard key={o.id} o={o} steps={['done', 'done', 'done', 'now', '']} noteTone="info" note={`Tiba besok, ${o.arrive} · GDN Logistics`}
        actions={[{ t: 'Lacak', on: () => toast(`GDN Logistics · tiba besok, ${o.arrive}`) }, { t: 'Diterima', pri: true, on: () => toast(`Pesanan ${o.id} ditandai diterima`) }]} />;
      case 'expired': return <OrderCard key={o.id} o={o} steps={[]} noteTone="gray" note="Kedaluwarsa · pembayaran CBD lewat batas 7 Nov, 23.59 WIB" actions={[{ t: 'Pesan lagi', pri: true, on: () => again(o) }]} />;
      default: {
        if (inv && inv.st !== 'paid')
          return <OrderCard key={o.id} o={o} steps={['done', 'done', 'done', 'done', 'done']} noteTone={inv.st === 'over' ? 'danger' : 'warn'}
            note={inv.st === 'over' ? `Tagihan ${inv.id} lewat jatuh tempo 4 hari` : `Tagihan ${inv.id} jatuh tempo ${dueIn(inv.due)}`}
            actions={[{ t: 'Beli lagi', on: () => again(o) }, { t: 'Bayar', pri: true, on: () => pay(inv.id) }]} />;
        const left = o.units - (o.scanned ?? 0);
        return <OrderCard key={o.id} o={o} steps={['done', 'done', 'done', 'done', 'done']} noteTone="ok"
          note={`${o.scanned ?? 0} dari ${o.units} IMEI scan${left ? ` · scan ${left} lagi, dapat ${short(UNSCANNED_CN(o, left))}` : ''}`}
          actions={[...(left ? [{ t: 'Scan IMEI', on: () => router.navigate('/scan') }] : []), { t: 'Beli lagi', pri: true, on: () => again(o) }]} />;
      }
    }
  }
}
/** credit note of the last `left` units of an order (the unscanned ones) */
const UNSCANNED_CN = (o: OrderView, left: number) => o.items.flatMap(l => Array.from({ length: l.qty }, () => PRODUCTS[l.id].cn)).slice(-left).reduce((a, v) => a + v, 0);

const CHIP_OF: Record<string, OrderView['status'][]> = { all: ['wait', 'approved', 'paid', 'ship', 'done', 'expired'], act: ['wait', 'approved'], proc: ['paid'], ship: ['ship'], done: ['done', 'expired'] };

export default function Pesanan() {
  const ins = useSafeAreaInsets();
  const { S, invoices } = useStore();
  const list = allOrders(S.orders, S.cns, invoices);
  const [chip, setChip] = useState('all');
  const count = (k: string) => list.filter(o => CHIP_OF[k].includes(o.status)).length;
  const chips: [string, string][] = [['all', 'Semua'], ['act', `Perlu tindakan (${count('act')})`], ['proc', 'Diproses'], ['ship', 'Dikirim'], ['done', 'Selesai']];
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title="Pesanan" noBack />
      <ScrollView contentContainerStyle={{ paddingBottom: NAV_SPACE + ins.bottom }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 16 }}>
          {chips.map(([k, l]) => (
            <Pressable key={k} onPress={() => setChip(k)} style={{ height: 32, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center', backgroundColor: chip === k ? C.infoMed : C.bgMed }}>
              <T v="b2" c={chip === k ? '#fff' : C.info}>{l}</T>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <Row gap={6}><Icon name="time" size={14} color={C.textMed} /><T v="c1" c={C.textMed}>Real-time · diperbarui 08.20</T></Row>
          {list.filter(o => CHIP_OF[chip].includes(o.status)).map(o => <OrderItem key={o.id} o={o} />)}
        </View>
      </ScrollView>
    </View>
  );
}
