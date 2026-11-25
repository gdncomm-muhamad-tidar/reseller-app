/* Detail pesanan — structure from the reference "current order history detail" (Figma 733:28367),
 * restyled with the app's BLUE components. One screen covers every status:
 * menunggu persetujuan · menunggu pembayaran (CBD) · diproses · dikirim · selesai · kedaluwarsa. */
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { C, rp, short } from '../../theme';
import { Btn, Card, Divider, Footer, Header, Icon, Row, T } from '../../ui';
import { ProductLabel, ProductPhoto } from '../../ui/parts';
import { useOverlay } from '../../ui/overlay';
import { useStore } from '../../store';
import { dayAfter, lineP, PRODUCTS } from '../../data';
import { allOrders, dueIn, OrderView, STATUS_LABEL } from '../../orders';
import { openFin } from '../../nav';

type BannerTone = 'info' | 'warn' | 'danger' | 'ok' | 'gray';
const BANNER: Record<BannerTone, [string, string, string]> = {
  info: [C.infoBg, C.infoBorder, C.info], warn: ['#fff8e0', '#fedd6c', '#bc6e06'], danger: [C.dangerLow, C.dangerBorder, C.danger],
  ok: [C.okLow, C.okBorder, C.okBrand], gray: [C.bgMed, '#e1e3e4', C.textMed],
};
const TAG: Record<'orange' | 'blue' | 'tosca' | 'green' | 'gray', [string, string]> = {
  orange: ['#fde2c2', '#dc5300'], blue: [C.infoLow, C.info], tosca: ['#e0f7f7', C.tosca], green: [C.okLow, C.ok], gray: [C.bgMed, C.textMed],
};

/** 🅑 badge, medium, secondary */
const Tag = ({ label, tone }: { label: string; tone: keyof typeof TAG }) => (
  <View style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, backgroundColor: TAG[tone][0], justifyContent: 'center' }}><T v="lbl" c={TAG[tone][1]}>{label}</T></View>
);

function Banner({ tone, text }: { tone: BannerTone; text: string }) {
  const [bg, bd, fg] = BANNER[tone];
  return (
    <Row gap={8} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: bd, backgroundColor: bg, alignItems: 'flex-start' }}>
      <Icon name={tone === 'warn' || tone === 'danger' ? 'alertFill' : 'info'} size={18} color={fg} />
      <T v="c1" c={C.textMed} style={{ flex: 1 }}>{text}</T>
    </Row>
  );
}

/** status-specific banner on top (reference: quotation deadline / CBD reminder) */
function topBanner(o: OrderView): [BannerTone, string] | null {
  const inv = o.invoice;
  switch (o.status) {
    case 'wait': return ['info', 'Sales Budi sedang cek stok & harga. Biasanya selesai ±2 jam, Anda akan dapat notifikasi.'];
    case 'approved': return o.term === 'cbd'
      ? ['warn', 'Bayar sebelum 17 Nov 2026, 23.59 WIB agar pesanan mulai diproses. Lewat batas ini, pesanan kedaluwarsa.']
      : ['info', `Pesanan disetujui. Tagihan Net ${o.netDays ?? 30} jatuh tempo ${dayAfter(o.netDays ?? 30)} 2026.`];
    case 'paid': return ['info', 'Pembayaran diterima. Pesanan sedang dikemas gudang dan dikirim 1–2 hari kerja.'];
    case 'ship': return ['info', `Dikirim dengan GDN Logistics, tiba besok ${o.arrive}. Tagihan Net 30 terbit setelah pesanan sampai.`];
    case 'expired': return ['gray', 'Pesanan kedaluwarsa karena pembayaran CBD melewati batas 7 Nov 2026, 23.59 WIB.'];
    default:
      if (inv?.st === 'over') return ['danger', `Tagihan ${inv.id} lewat jatuh tempo 4 hari. Denda 0,1% per hari, segera bayar.`];
      if (inv && inv.st !== 'paid') return ['warn', `Tagihan ${inv.id} jatuh tempo ${dueIn(inv.due)} (${inv.due.match(/\d+ (Nov|Des)/)?.[0]} 2026).`];
      return null;
  }
}

function InfoRow({ k, v, copy, right }: { k: string; v: string; copy?: boolean; right?: React.ReactNode }) {
  const { toast } = useOverlay();
  return (
    <Row gap={8}>
      <T v="c1" c={C.textMed} style={{ flex: 1 }}>{k}</T>
      <T v="c1" style={{ flexShrink: 1, textAlign: 'right' }} numberOfLines={1}>{v}</T>
      {copy && <Pressable hitSlop={8} onPress={async () => { try { await Clipboard.setStringAsync(v); } catch {} toast(`${k} disalin`); }}><Icon name="copy" size={16} color={C.info} /></Pressable>}
      {right}
    </Row>
  );
}

function StatusCard({ o }: { o: OrderView }) {
  const [open, setOpen] = useState(true);
  const [label, tone] = STATUS_LABEL[o.status];
  const steps = o.steps;
  return (
    <Card style={{ gap: 12, padding: 12, borderWidth: 1, borderColor: C.borderLow }}>
      <Pressable onPress={() => setOpen(!open)}>
        <Row gap={8}>
          <T v="s2" style={{ flex: 1 }}>Status pesanan</T>
          <Tag label={label} tone={tone} />
          <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}><Icon name="chevD" size={20} color={C.text} /></View>
        </Row>
      </Pressable>
      {open && (<>
        <Divider />
        <View>
          {o.next && (
            <Row gap={12} style={{ alignItems: 'stretch' }}>
              <View style={{ alignItems: 'center', width: 16 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 3, backgroundColor: C.bgMed }} />
                <View style={{ flex: 1, width: 1, backgroundColor: C.border }} />
              </View>
              <T v="b2" c={C.textLow} style={{ flex: 1, paddingBottom: 16 }}>{o.next}</T>
            </Row>
          )}
          {steps.map(([t, time], i) => {
            const first = i === 0, expired = first && o.status === 'expired';
            return (
              <Row key={t} gap={12} style={{ alignItems: 'stretch' }}>
                <View style={{ alignItems: 'center', width: 16 }}>
                  {expired ? <View style={{ width: 16, height: 16, borderRadius: 8, marginTop: 1, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={10} color="#fff" /></View>
                    : <View style={{ width: 16, height: 16, borderRadius: 8, marginTop: 1, backgroundColor: C.okBrand, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={10} color="#fff" /></View>}
                  {i < steps.length - 1 && <View style={{ flex: 1, width: 1, backgroundColor: C.border }} />}
                </View>
                <View style={{ flex: 1, gap: 2, paddingBottom: i < steps.length - 1 ? 16 : 0 }}>
                  <T v="b2">{t}</T>
                  <T v="c1" c={C.textMed}>{time}</T>
                </View>
              </Row>
            );
          })}
        </View>
      </>)}
    </Card>
  );
}

function ProductRow({ id, qty, p }: { id: string; qty: number; p: number }) {
  const prod = PRODUCTS[id];
  const strike = prod.o && p === prod.p ? prod.o : undefined;
  return (
    <View style={{ borderWidth: 1, borderColor: C.borderLow, borderRadius: 8, overflow: 'hidden' }}>
      <Row gap={12} style={{ padding: 12, alignItems: 'flex-start' }}>
        <ProductPhoto src={prod.img} />
        <View style={{ flex: 1, gap: 2 }}>
          <T v="c2" c={C.textMed}>{prod.mta}</T>
          <T v="b2">{prod.n}</T>
        </View>
        <T v="c1">{qty} unit</T>
      </Row>
      <View style={{ backgroundColor: C.bgLow, paddingHorizontal: 12, paddingVertical: 8, gap: 4 }}>
        <Row gap={6}>
          <T v="c1" style={{ flex: 1 }}>Harga satuan</T>
          {strike && <T v="c1" c={C.textMed} style={{ textDecorationLine: 'line-through' }}>{rp(strike)}</T>}
          <T v="lbl">{rp(p)}</T>
          {strike && <ProductLabel kind="disc" label={prod.d!} />}
        </Row>
        <Row><T v="c1" style={{ flex: 1 }}>Total harga</T><T v="lbl">{rp(p * qty)}</T></Row>
      </View>
    </View>
  );
}

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { S, invoices, payInvoices, addToCart } = useStore();
  const { toast } = useOverlay();
  const o = allOrders(S.orders, S.cns, invoices).find(x => x.slug === id);
  const [all, setAll] = useState(false);
  if (!o) return <View style={{ flex: 1, backgroundColor: C.bgLow }}><Header title="Detail pesanan" /><T v="b2" center style={{ marginTop: 24 }}>Pesanan tidak ditemukan.</T></View>;

  const inv = o.invoice;
  const paid = o.status === 'paid' || inv?.st === 'paid' || (o.term === 'cbd' && (o.status === 'ship' || o.status === 'done'));
  const banner = topBanner(o);
  const pay = (i: string) => { payInvoices([i]); router.push('/bayar'); };
  const again = () => { o.items.forEach(l => addToCart(l.id, l.qty)); router.push('/keranjang'); };
  const left = o.status === 'done' ? o.units - (o.scanned ?? 0) : 0;
  const shown = all ? o.items : o.items.slice(0, 3);

  const actions: { t: string; pri?: boolean; on: () => void }[] =
    o.status === 'wait' ? [{ t: 'Chat sales', pri: true, on: () => toast('Chat sales belum tersedia di demo ini') }]
    : o.status === 'approved' ? [{ t: 'Lihat tagihan', on: () => openFin('inv') }, { t: 'Bayar', pri: true, on: () => pay(o.inv!) }]
    : o.status === 'paid' ? [{ t: 'Lihat tagihan', pri: true, on: () => openFin('inv') }]
    : o.status === 'ship' ? [{ t: 'Lacak', on: () => toast(`GDN Logistics · tiba besok, ${o.arrive}`) }, { t: 'Pesanan diterima', pri: true, on: () => toast(`Pesanan ${o.id} ditandai diterima`) }]
    : o.status === 'expired' ? [{ t: 'Pesan lagi', pri: true, on: again }]
    : inv && inv.st !== 'paid' ? [{ t: 'Beli lagi', on: again }, { t: 'Bayar tagihan', pri: true, on: () => pay(inv.id) }]
    : [...(left ? [{ t: 'Scan IMEI', on: () => router.navigate('/scan') }] : []), { t: 'Beli lagi', pri: true, on: again }];

  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title="Detail pesanan" />
      <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 24 }}>
        {/* order info + status */}
        <View style={{ backgroundColor: C.bg, padding: 16, gap: 12 }}>
          {banner && <Banner tone={banner[0]} text={banner[1]} />}
          <View style={{ gap: 8 }}>
            <InfoRow k="Nomor pesanan" v={o.id} copy />
            {o.so && <InfoRow k="Nomor sales order" v={o.so} copy />}
            {inv && <InfoRow k="Nomor tagihan" v={inv.id} copy />}
            <InfoRow k="Tanggal dibuat" v={o.date} />
            <InfoRow k="Dibuat oleh" v="Leonni · Raja Ponsel" />
            <InfoRow k="Syarat pembayaran" v={o.term === 'cbd' ? 'CBD (bayar di muka)' : `Net ${o.netDays ?? 30} hari`}
              right={o.status === 'wait' || o.status === 'expired' ? undefined : <Tag label={paid ? 'Lunas' : 'Belum bayar'} tone={paid ? 'green' : 'gray'} />} />
            <InfoRow k="Nama sales" v="Budi Santoso" />
          </View>
          <StatusCard o={o} />
        </View>

        {/* address */}
        <View style={{ backgroundColor: C.bg, padding: 16, gap: 12 }}>
          <T v="s1">Alamat pengiriman</T>
          <Row gap={8}><Icon name="pin" size={18} color={C.info} /><T v="s2">Raja Ponsel · ITC Kuningan</T></Row>
          <View style={{ gap: 4 }}>
            <T v="b2">Leonni  |  08332100392</T>
            <T v="b2" c={C.textMed}>Gedung Sarana Jaya, Jl. Budi Kemuliaan No.1, RT.2/RW.3, Gambir, Kecamatan Gambir, Kota Jakarta Pusat, DKI Jakarta 10110</T>
          </View>
        </View>

        {/* products */}
        <View style={{ backgroundColor: C.bg, padding: 16, gap: 12 }}>
          <Row><T v="s1" style={{ flex: 1 }}>Daftar produk</T><T v="c1" c={C.textMed}>{o.items.length} produk · {o.units} unit</T></Row>
          {o.status === 'wait' && <Banner tone="info" text="Jumlah dan harga produk, total pesanan, dan syarat pembayaran mungkin berubah setelah dicek sales. Mohon cek lagi." />}
          {shown.map(l => <ProductRow key={l.id} id={l.id} qty={l.qty} p={lineP(l)} />)}
          {o.items.length > 3 && <Pressable onPress={() => setAll(!all)} style={{ alignSelf: 'center' }}><T v="lbl" c={C.info}>{all ? 'Lihat lebih sedikit' : 'Lihat semua'}</T></Pressable>}
          {left > 0 && <Banner tone="ok" text={`${o.scanned} dari ${o.units} IMEI sudah discan. Scan ${left} unit lagi untuk dapat credit note ${short(o.items.flatMap(l => Array.from({ length: l.qty }, () => PRODUCTS[l.id].cn)).slice(-left).reduce((a, v) => a + v, 0))}.`} />}
        </View>

        {/* payment */}
        <View style={{ backgroundColor: C.bg, padding: 16, gap: 12 }}>
          <T v="s1">Pembayaran</T>
          <View style={{ backgroundColor: C.bgLow, borderRadius: 8, padding: 12, gap: 8 }}>
            <Row><T v="c1" style={{ flex: 1 }}>Total harga ({o.units} unit)</T><T v="c1">{rp(o.sub)}</T></Row>
            {o.cbd > 0 && <Row><T v="c1" style={{ flex: 1 }}>Diskon CBD</T><T v="c1" c={C.ok}>−{rp(o.cbd)}</T></Row>}
            {o.cn > 0 && <Row><T v="c1" style={{ flex: 1 }}>Credit note</T><T v="c1" c={C.ok}>−{rp(o.cn)}</T></Row>}
            <Row><T v="c1" style={{ flex: 1 }}>Ongkos kirim</T><T v="c1" c={C.ok}>Gratis</T></Row>
            <Divider />
            <Row><T v="s2" style={{ flex: 1 }}>Total pembayaran</T><T v="s1">{rp(o.total)}</T></Row>
          </View>
          {o.status !== 'expired' && <T v="c1" c={C.textMed}>Potensi credit note dari scan IMEI: {short(o.cnPotential)} ({o.units} unit)</T>}
        </View>
      </ScrollView>
      <Footer>
        {actions.map(a => <Btn key={a.t} title={a.t} kind={a.pri ? 'pri' : 'sec'} style={{ flex: 1 }} onPress={a.on} />)}
      </Footer>
    </View>
  );
}
