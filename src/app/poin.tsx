import React, { useState } from 'react';
import { Animated, Image, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, fmt } from '../theme';
import { Badge, Btn, Card, CircleIcon, Grow, KV, Row, T } from '../ui';
import { Glow, MiDevice, Sparkle } from '../ui/parts';
import { FloatingHeader, HEADER_H, ParallaxBg, useScrollHeader } from '../ui/ScrollHeader';
import { useOverlay } from '../ui/overlay';
import { ModalBody, ModalFooter, ModalHeader } from '../ui/Modal';
import { useStore } from '../store';
import { IMG, POIN_NOV, POIN_START, Reward, REWARDS } from '../data';
import { goTab } from '../nav';

// Figma "Header / point": alert high 0% → med 38.7% → low 77.3% → neutral-background-low 116% (beyond the frame;
// at 100% the ramp is ≈ #FBF1CC)
const GOLD = ['#FFCD00', '#FEDD6C', '#FEEDB1', '#FBF1CC'] as const;
const GOLD_LOC = [0, 0.387, 0.773, 1] as const;
/** stat tile glass on gold: alert-high 10% + white stroke 22% */
const goldGlass = { backgroundColor: 'rgba(255,205,0,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', borderRadius: 12 } as const;
const GOLD_INK = '#614500'; // brand btrg-high, text on gold

function RedeemSheet({ r, onConfirm, close }: { r: Reward; onConfirm: () => void; close: () => void }) {
  const { S } = useStore();
  return (
    <View>
      <ModalHeader onClose={close} />
      <ModalBody style={{ gap: 12, alignItems: 'center' }}>
      <Image source={r.img} style={{ width: 88, height: 88 }} resizeMode="contain" />
      <T v="t2" center>Tukar {fmt(r.c)} poin?</T>
      <T v="b2" c={C.textMed} center>{r.t}{r.cat === 'cash' ? ' masuk ke saldo Finansial, bisa dicairkan ke BCA •••• 4417.' : r.cat === 'voucher' ? ' langsung bisa dipakai di checkout.' : ' dikirim bersama pesanan berikutnya.'}</T>
      <View style={{ alignSelf: 'stretch', backgroundColor: C.bgLow, borderRadius: 12, padding: 12, gap: 8 }}>
        <KV k="Poin sekarang" v={fmt(S.poin)} /><KV k="Sisa setelah tukar" v={fmt(S.poin - r.c)} />
      </View>
      </ModalBody>
      <ModalFooter>
        <Btn title="Tukar sekarang" full onPress={onConfirm} />
        <Btn title="Batal" kind="ter" full onPress={close} />
      </ModalFooter>
    </View>
  );
}

export default function Poin() {
  const ins = useSafeAreaInsets();
  const h = useScrollHeader();
  const { S, redeem } = useStore();
  const { openSheet, closeSheet, toast } = useOverlay();
  const [tab, setTab] = useState('tukar');
  const list = REWARDS;
  const can = list.filter(r => S.poin >= r.c), near = list.filter(r => S.poin < r.c);
  const verified = S.scans.filter(s => s.st === 'ok');

  const Tile = ({ r }: { r: Reward }) => {
    const ok = S.poin >= r.c;
    return (
      <Card style={{ width: '48%', padding: 0, overflow: 'hidden', borderRadius: 12 }}>
        <View style={{ height: 104, alignItems: 'center', justifyContent: 'center', backgroundColor: r.photo ? '#fff' : C.infoLow }}>
          <Image source={r.img} style={{ width: r.photo ? 96 : 64, height: r.photo ? 96 : 64 }} resizeMode="contain" />
        </View>
        <View style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 8, flex: 1 }}>
          <T v="lbl">{r.t}</T>
          {/* 🅑 badge tertiary orange */}
          <View style={{ alignSelf: 'flex-start', height: 16, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: '#fed2a5', backgroundColor: C.bg, justifyContent: 'center' }}><T v="lbl" c="#dc5300">{fmt(r.c)} poin</T></View>
          <View style={{ flex: 1 }} />
          {ok ? <Btn title="Tukar" size="sm" full onPress={() => openSheet(<RedeemSheet r={r} close={() => closeSheet()} onConfirm={() => { redeem(r.k); closeSheet(); setTab('hadiah'); toast(`${r.t} berhasil ditukar`); }} />)} />
            : <T v="c1" c={C.warn}>Kurang {fmt(r.c - S.poin)} poin</T>}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      <Animated.ScrollView onScroll={h.onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 32 + ins.bottom }}>
        {/* Figma "5f · Poin — Opsi C | Copy improved": gold header with parallax; header turns white past it */}
        <View onLayout={e => h.setThreshold(e.nativeEvent.layout.height - 16 - ins.top - HEADER_H)} style={{ paddingTop: ins.top + HEADER_H, paddingBottom: 24, overflow: 'hidden' }}>
          <ParallaxBg scrollY={h.scrollY}>
            <LinearGradient colors={GOLD} locations={GOLD_LOC} style={{ flex: 1 }} />
            <Glow color="#ffffff" cx={30} cy={60} rx={120} />
            <Glow color="#EBBF4F" cx={20} cy={230} rx={110} right />
          </ParallaxBg>
          {/* poin-hero: 3D coin + sparkles, balance, expiry */}
          <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
            <View style={{ width: 120, height: 88 }}>
              <Image source={IMG.point} style={{ position: 'absolute', left: 4, top: -12, width: 100, height: 100 }} />
              <Sparkle size={14} x={4} y={10} color="#fff" /><Sparkle size={18} x={104} y={2} color="#fff" /><Sparkle size={10} x={110} y={56} color="#fff" /><Sparkle size={8} x={0} y={60} color="#fff" />
            </View>
            <Row gap={8} style={{ alignItems: 'baseline' }}>
              <T v="h1" style={{ fontSize: 32, lineHeight: 38 }}>{fmt(S.poin)}</T><T v="s2">poin</T>
            </Row>
            <T v="c1" c={GOLD_INK} center>2.000 poin hangus 31 Des 2026</T>
          </View>
          <Row style={{ padding: 16 }}>
            {[[<View key="s" style={{ width: 40, height: 40, overflow: 'hidden' }}><Image source={IMG.scan} style={{ position: 'absolute', left: -7.6, top: -7.6, width: 53.7, height: 53.7 }} /></View>, `+${fmt(POIN_NOV.reduce((a, r) => a + r[2], 0) + S.poin - POIN_START + S.redeemed.reduce((a, r) => a + r.c, 0))}`, 'poin bulan ini'], [<MiDevice key="d" />, `${5 + verified.length} IMEI`, 'diverifikasi'], [<Image key="t" source={IMG.trophy0} style={{ width: 40, height: 40 }} />, `${REWARDS.filter(r => S.poin >= r.c).length} hadiah`, 'bisa ditukar']].map(([icon, a, b], i) => (
              <View key={i} style={[goldGlass, { flex: 1, alignItems: 'center', padding: 8, gap: 8 }]}>
                {icon}<T v="s2">{a as string}</T><T v="c1" style={{ opacity: 0.75 }}>{b as string}</T>
              </View>
            ))}
          </Row>
        </View>
        <View style={{ marginTop: -16, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: C.bgLow, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, gap: 16 }}>
          <Card style={{ gap: 12 }}>
            <Row gap={12}>
              <Image source={IMG.shopping} style={{ width: 64, height: 64 }} />
              <Grow style={{ gap: 2 }}><T v="s2">Verifikasi IMEI, dapat poin</T><T v="c1" c={C.textMed}>Scan IMEI unit terjual dan tukar poinnya dengan produk menarik! Poin masuk 1 – 3 hari kerja setelah diverifikasi.</T></Grow>
            </Row>
            <Btn title="Scan IMEI" size="sm" full onPress={() => goTab('/scan')} />
          </Card>
          {/* finansial/tabs (tab.primary.scrollable in a white rounded card) */}
          <View style={{ flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, overflow: 'hidden' }}>
            {[['tukar', 'Tukar poin'], ['hadiah', 'Hadiah saya'], ['riw', 'Riwayat']].map(([k, l]) => (
              <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <T v="b2" c={tab === k ? C.info : C.textMed}>{l}</T>
                {tab === k && <View style={{ position: 'absolute', left: 8, right: 8, bottom: 0, height: 2, borderRadius: 2, backgroundColor: C.info }} />}
              </Pressable>
            ))}
          </View>
          {tab === 'tukar' && (<>
            {can.length > 0 && <><T v="s2">Bisa ditukar sekarang</T><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>{can.map(r => <Tile key={r.k} r={r} />)}</View></>}
            {near.length > 0 && <><T v="s2">Sedikit lagi</T><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>{near.map(r => <Tile key={r.k} r={r} />)}</View></>}
          </>)}
          {tab === 'hadiah' && [...S.redeemed.map(r => [r.img, r.t, 'Ditukar 16 Nov · diproses 1–3 hari kerja', 'blue', 'Diproses'] as const), [IMG.medal, 'Voucher belanja Rp100.000', 'Ditukar 2 Okt · dipakai #RFQ/1102', 'green', 'Terpakai'] as const].map(([img, t, s, b, l], i) => (
            <Card key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CircleIcon><Image source={img} style={{ width: 28, height: 28 }} resizeMode="contain" /></CircleIcon>
              <Grow><T v="s2">{t}</T><T v="c1" c={C.textMed}>{s}</T></Grow><Badge label={l} t={b} />
            </Card>
          ))}
          {tab === 'riw' && (
            <Card style={{ paddingVertical: 0 }}>
              {[...S.redeemed.map(r => ['Tukar ' + r.t, '16 Nov', '−' + fmt(r.c)]), ...verified.map(s => [`Scan IMEI · ${s.product}`, '16 Nov', '+' + s.pts]), ...POIN_NOV.map(([t, d, v]) => [t, d, '+' + fmt(v)]), ['Tukar voucher belanja Rp100.000', '2 Okt', '−2.000']].map((r, i) => (
                <Row key={i} style={{ paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }}>
                  <Grow><T v="s2">{r[0]}</T><T v="c1" c={C.textMed}>{r[1]}</T></Grow>
                  <T v="s2" c={r[2].startsWith('+') ? C.ok : C.text}>{r[2]} poin</T>
                </Row>
              ))}
            </Card>
          )}
        </View>
      </Animated.ScrollView>
      <FloatingHeader title="Poin" tone="dark" scrollY={h.scrollY} threshold={h.threshold} solid={h.solid} heroColor={GOLD[0]} />
    </View>
  );
}
