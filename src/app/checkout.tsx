import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { C, fmt, rp, short } from '../theme';
import { Btn, Card, Check, CircleIcon, Divider, Footer, Grow, Header, Icon, KV, Radio, Row, T } from '../ui';
import { ProductLabel, ProductPhoto, QtyField } from '../ui/parts';
import { BRANDS, CBD_DISCOUNT, dayAfter, IMG, NET_DAYS, orderCN, PRODUCTS } from '../data';
import { useStore } from '../store';
import { useOverlay } from '../ui/overlay';
import { ModalBody, ModalFooter, ModalHeader } from '../ui/Modal';

function Steps() {
  const dot = (n: string, st: 'done' | 'now' | '') => (
    <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: st === 'done' ? C.okBrand : st === 'now' ? C.info : C.bgMed }}>
      {st === 'done' ? <Icon name="check" size={12} color="#fff" /> : <T v="c2b" c={st === 'now' ? '#fff' : C.text}>{n}</T>}
    </View>
  );
  return (
    <Row style={{ paddingHorizontal: 16, paddingBottom: 12 }} gap={6}>
      <Row gap={4}>{dot('1', 'done')}<T v="c1">Keranjang</T></Row>
      <View style={{ flex: 1, height: 2, backgroundColor: C.okBrand }} />
      <Row gap={4}>{dot('2', 'now')}<T v="lbl" c={C.info}>Checkout</T></Row>
      <View style={{ flex: 1, height: 2, backgroundColor: C.bgMed }} />
      <Row gap={4}>{dot('3', '')}<T v="c1" c={C.textMed}>Tagihan</T></Row>
    </Row>
  );
}

/** 🅑 dropdown option sheet: title + plain list items with dividers */
function NetSheet({ value, onPick }: { value?: number; onPick: (d: number) => void }) {
  return (
    <View>
      <ModalHeader title="Pilih jangka waktu" keepAlive />
      <View style={{ paddingBottom: 8 }}>
        {NET_DAYS.map((d, i) => (
          <React.Fragment key={d}>
            {i > 0 && <View style={{ height: 1, marginHorizontal: 8, backgroundColor: '#c8cbcd' }} />}
            <Pressable onPress={() => onPick(d)} style={({ pressed }) => [{ paddingHorizontal: 16, paddingVertical: 16 }, pressed && { backgroundColor: C.bgLow }]}>
              <T v="b1" c={value === d ? C.info : C.text}>Net - {d} hari</T>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

/** 🅑 checkbox with label */
const Box = ({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) => (
  <Pressable onPress={() => set(!on)} style={{ flexDirection: 'row', gap: 4, paddingVertical: 4, alignItems: 'flex-start' }}>
    <Check on={on} /><T v="b2" c={C.textMed} style={{ flex: 1, paddingVertical: 2 }}>{label}</T>
  </Pressable>
);

/** 🅑 modal "Ketentuan kirim pesanan" (Figma 760:30258) */
function TermsSheet({ close, onSend }: { close: () => void; onSend: (skip: boolean) => void }) {
  const [agree, setAgree] = useState(true);
  const [skip, setSkip] = useState(true);
  const rules = [
    'Setelah mengirim daftar produk yang ingin dipesan, Anda akan menerima quotation resmi dari Blibli dalam 1-2 hari.',
    'Anda dapat menyetujui/menolak quotation berdasarkan harga, jumlah, maupun varian produk yang tersedia.',
    'Jika Anda menyetujui quotation yang diberikan, Blibli akan segera memprosesnya sebagai pesanan resmi (PO).',
  ];
  return (
    <View>
      <ModalHeader title="Ketentuan kirim pesanan" onClose={close} />
      <ModalBody style={{ paddingTop: 8, paddingBottom: 16 }}>
        {rules.map((r, i) => <Row key={i} gap={8} style={{ alignItems: 'flex-start' }}><T v="b1" c={C.textMed} style={{ width: 16 }}>{i + 1}.</T><T v="b1" c={C.textMed} style={{ flex: 1 }}>{r}</T></Row>)}
      </ModalBody>
      {/* body "addition" slot: checkboxes */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}>
        <Box on={agree} set={setAgree} label="Saya telah membaca, memahami, dan menyetujui ketentuan di atas." />
        <Box on={skip} set={setSkip} label="Jangan tampilkan lagi untuk pesanan berikutnya." />
      </View>
      <ModalFooter><Btn title="Kirim" full disabled={!agree} onPress={() => onSend(skip)} /></ModalFooter>
    </View>
  );
}

export default function Checkout() {
  const { S, sub, orig, units, cnAmt, total, usable, setTerm, setQty, submitOrder, setSkipTerms } = useStore();
  const { toast, openSheet, closeSheet, sheetOpen } = useOverlay();
  const [dd, setDd] = useState(false);
  /* 🅑 dropdown (mobile): options open in a bottom sheet "Pilih jangka waktu" — Net days only, CBD is its own payment option */
  const pickNet = () => {
    setDd(true);
    openSheet(<NetSheet value={S.term === 'net' ? S.netDays : undefined} onPick={d => closeSheet(() => { setTerm('net', d); setDd(false); })} />);
  };
  const send = () => { const o = submitOrder(); router.replace({ pathname: '/diajukan', params: { id: o.id } }); };
  const ajukan = () => S.skipTerms ? send() : openSheet(<TermsSheet close={() => closeSheet()} onSend={skip => closeSheet(() => { if (skip) setSkipTerms(true); send(); })} />);
  const sel = usable.filter(c => S.cnSel[c.k]);
  const save = orig - sub + cnAmt + (S.term === 'cbd' ? CBD_DISCOUNT : 0);
  if (!S.cart.length) return <View style={{ flex: 1, backgroundColor: C.bgLow }}><Header title="Checkout" /><T v="b2" c={C.textMed} center style={{ marginTop: 40 }}>Daftar pesanan kosong.</T></View>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Header title="Checkout"><Steps /></Header>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card>
          <Row gap={12}><CircleIcon><Icon name="pin" color={C.info} /></CircleIcon><Grow><T v="s2">{BRANDS[S.brand].store} · ITC Kuningan</T><T v="c1" c={C.textMed}>Gedung Sarana Jaya, Jl. Budi Kemuliaan No.1, Gambir, Jakarta Pusat</T></Grow><T v="lbl" c={C.info}>Ubah</T></Row>
          <Divider style={{ marginVertical: 12 }} />
          <Row gap={12}><CircleIcon><Icon name="chat" color={C.info} /></CircleIcon><Grow><T v="s2">Sales: Budi Santoso</T><T v="c1" c={C.textMed}>Menyetujui ±2 jam kerja</T></Grow><Btn title="Chat" size="sm" kind="sec" onPress={() => toast('Chat sales belum tersedia di demo ini')} /></Row>
        </Card>
        <Card style={{ gap: 12 }}>
          <T v="s2">{S.cart.length} produk, {units} item</T>
          {S.cart.map(c => {
            const p = PRODUCTS[c.id];
            return (
              <Row key={c.id} gap={12}>
                <ProductPhoto src={p.img} />
                <Grow><T v="b2" numberOfLines={2}>{p.n}</T><T v="s2">{rp(p.p)}</T>{p.o && <Row gap={4}><ProductLabel kind="disc" label={p.d!} /><T v="c1" style={{ textDecorationLine: 'line-through' }}>{rp(p.o)}</T></Row>}</Grow>
                <QtyField qty={c.qty} onChange={q => setQty(c.id, q)} />
              </Row>
            );
          })}
        </Card>
        {/* Figma credit-note-voucher: confetti backdrop, ticket-shaped amount, entry row */}
        <Card style={{ gap: 12, overflow: 'hidden' }}>
          <Image source={IMG.cnConfetti} pointerEvents="none" resizeMode="stretch" style={{ position: 'absolute', top: 0, left: '-26.6%', width: '153.2%', aspectRatio: 5 }} />
          <Row gap={8}>
            <T v="s2" style={{ flex: 1 }}>Credit note & voucher</T>
            {cnAmt > 0 && <View style={{ backgroundColor: '#d6f7da', borderLeftWidth: 1, borderRightWidth: 1, borderStyle: 'dashed', borderColor: '#b2efb9', paddingHorizontal: 8, paddingVertical: 1, borderRadius: 2 }}><T v="c1" c={C.ok}>−{rp(cnAmt)}</T></View>}
          </Row>
          <Pressable onPress={() => router.push('/credit-note')} style={{ padding: 12, borderRadius: 8, backgroundColor: C.infoLow, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Grow style={{ gap: 2 }}>
              <Row gap={4}><Icon name="voucher" size={20} color={C.info} /><T v="s2" c={C.info}>{sel.length ? `${sel.length} credit note dipakai` : 'Pilih credit note'}</T></Row>
              <T v="c1" c={C.textMed}>Cek credit note dan voucher lainnya</T>
            </Grow>
            <Icon name="chev" size={16} color={C.info} />
          </Pressable>
        </Card>
        <Card style={{ gap: 8 }}>
          <T v="s2" style={{ marginBottom: 4 }}>Syarat pembayaran</T>
          {(['cbd', 'net'] as const).map((k, i) => {
            const on = S.term === k;
            return (
              <Pressable key={k} onPress={() => setTerm(k)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: i ? 12 : 0 }}>
                <Grow style={{ gap: 4 }}>
                  <Row gap={4}><T v="s2">{k === 'cbd' ? 'Cash Before Delivery (CBD)' : 'Net'}</T>
                    <Pressable hitSlop={8} onPress={() => toast(k === 'cbd' ? 'CBD: bayar sebelum pesanan diproses, dapat diskon Rp500rb.' : 'Net: bayar setelah pesanan sampai, sesuai jumlah hari yang dipilih.')}><Icon name="infoLine" size={16} color={C.icon} /></Pressable></Row>
                  {k === 'cbd' ? (<>
                    <T v="c1" c={C.textMed}>Bayar di muka</T>
                    <Row gap={4}><Icon name="discount" size={14} color={C.info} /><T v="c1" c={C.info}>Diskon {short(CBD_DISCOUNT)} kalau bayar di muka</T></Row>
                  </>) : (<>
                    {/* 🅑 dropdown field (radius 16) */}
                    <Pressable onPress={pickNet} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: C.bgMed }}>
                      <T v="b2" c={C.textMed}>Net {S.netDays} hari</T>
                      <View style={{ transform: [{ rotate: dd && sheetOpen ? '180deg' : '0deg' }] }}><Icon name="chevD" size={16} color={C.textMed} /></View>
                    </Pressable>
                    <T v="c1" c={C.textMed}>Jatuh tempo {dayAfter(S.netDays)}</T>
                  </>)}
                </Grow>
                {on ? <Icon name="circleCheck" size={22} color={C.info} /> : <Radio />}
              </Pressable>
            );
          })}
          {S.term === 'net' && total > 40000000 && <T v="c1" c={C.danger}>Total melebihi limit tempo. Sales akan menyesuaikan atau pilih CBD.</T>}
        </Card>
        <Card style={{ gap: 8 }}>
          <T v="s2" style={{ marginBottom: 4 }}>Ringkasan pembayaran</T>
          <KV k={`Total harga (${units} item)`} v={rp(orig)} />
          {orig > sub && <KV k="Promo produk" v={'−' + rp(orig - sub)} vc={C.ok} />}
          {S.term === 'cbd' && <KV k="Diskon CBD" v={'−' + rp(CBD_DISCOUNT)} vc={C.ok} />}
          <KV k="Credit note" v={'−' + rp(cnAmt)} vc={C.ok} />
          <KV k="Ongkos kirim" v="Gratis" vc={C.ok} />
          <Divider style={{ marginVertical: 4 }} />
          <KV k="Total bayar" v={rp(total)} bold />
        </Card>
      </ScrollView>
      <View>
        <Row style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.infoLow }}>
          <Icon name="voucher" size={16} color={C.info} />
          <T v="c1" c={C.textMed} style={{ flex: 1 }}>Bisa dapat credit note <T v="lbl">{short(orderCN(S.cart))} + {fmt(Math.round(total / 100000))}</T> poin</T>
        </Row>
        <Footer style={{ paddingTop: 12 }}>
          <Grow><T v="s1">{rp(total)}</T><T v="c1" c={C.ok}>Hemat {rp(save)}</T></Grow>
          <Btn title="Ajukan pesanan" onPress={ajukan} />
        </Footer>
      </View>
    </View>
  );
}
