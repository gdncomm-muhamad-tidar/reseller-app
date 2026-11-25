import type { ScrollViewInstance } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useIsFocused } from 'expo-router';
import { C, fmt, rp, shadow, short, TYPE } from '../../theme';
import { Performa } from '../../ui/Performa';
import { NumberFlow } from '../../ui/NumberFlow';
import { useAnim } from '../../ui/useAnim';
import { useWebThemeColor } from '../../ui/useWebChrome';
import { Art, Badge, Btn, Card, CircleIcon, Divider, Grow, Icon, Link, Prog, Radio, Row, T } from '../../ui';
import { CartBar, Glow, NAV_SPACE, ProductCard, Sparkle, TierIcon, Trophy } from '../../ui/parts';
import { useOverlay } from '../../ui/overlay';
import { hapticSuccess } from '../../ui/haptics';
import { SkeletonCN, SkeletonHome } from '../../ui/Skeleton';
import { BannerCarousel } from '../../ui/BannerCarousel';
import { ModalBody, ModalFooter, ModalHeader } from '../../ui/Modal';
import { useStore } from '../../store';
import { Brand, BRANDS, dueIn, IMG, MissionKey, MISSIONS, PRODUCTS, UNSCANNED } from '../../data';
import { openFin, useGoReco } from '../../nav';

/** 🅑 modal (BLUE 3.0) "Misi berhasil diselesaikan" — Figma 748:47613: header close · body · footer CTAs */
function MissionPopup({ onLater, onUse }: { onLater: () => void; onUse: () => void }) {
  const { S } = useStore();
  const tab = S.missions.tab;
  return (
    <View>
      <ModalHeader onClose={onLater} />
      <ModalBody style={{ gap: 12, alignItems: 'center' }}>
        {/* medallion 140×112: glow + Ⓐ mi.trophy 96 + sparkles */}
        <View style={{ width: 140, height: 112 }}>
          <Glow color="#FEEDB1" cx={70} cy={56} rx={70} blur={20} />
          <View style={{ position: 'absolute', left: 22, top: 8 }}><Trophy size={96} /></View>
          <Sparkle size={14} x={6} y={8} /><Sparkle size={18} x={118} y={0} /><Sparkle size={10} x={124} y={70} /><Sparkle size={10} x={2} y={80} />
        </View>
        <View style={{ alignSelf: 'stretch', paddingTop: 16, gap: 12, alignItems: 'center' }}>
          <View style={{ width: 240, gap: 4 }}>
            <T v="s1" center>Misi berhasil diselesaikan</T>
            <T v="c1" c={C.textMed} center>Anda mendapatkan credit note {rp(MISSIONS.aks.reward)}. Jangan lupa pakai di transaksi selanjutnya, ya.</T>
          </View>
          <View style={{ alignSelf: 'stretch', backgroundColor: C.bgLow, borderRadius: 12, padding: 12, gap: 8 }}>
            <T v="c1" c={C.textMed}>Masih ada misi lainnya</T>
            <Row gap={12}>
              <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><Image source={IMG.mission} style={{ width: 56, height: 56 }} /></View>
              <Grow style={{ gap: 2 }}><T v="s2">{MISSIONS.tab.t}</T><T v="c1" c={C.warn}>Tinggal Rp{MISSIONS.tab.tg - tab}jt lagi · bisa dapat CN {rp(MISSIONS.tab.reward)}</T></Grow>
            </Row>
            <Prog pct={(tab / MISSIONS.tab.tg) * 100} color={C.infoMed} />
          </View>
        </View>
      </ModalBody>
      <ModalFooter>
        <Btn title="Pakai credit note" full onPress={onUse} />
        <Btn title="Nanti saja" kind="ter" full onPress={onLater} />
      </ModalFooter>
    </View>
  );
}

/** 🅑 modal "Pilih brand": list with trailing radio, footer button "Lanjut" (enabled — a brand is always selected) */
function BrandSheet({ current, onPick, close }: { current: Brand; onPick: (b: Brand) => void; close: () => void }) {
  const [sel, setSel] = useState<Brand>(current);
  return (
    <View>
      <ModalHeader title="Pilih brand" onClose={close} />
      <ModalBody>
      {(['apple', 'samsung'] as Brand[]).map((b, i) => (
        <Pressable key={b} onPress={() => setSel(b)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }}>
          <T v="b1" style={{ flex: 1 }}>{BRANDS[b].name}</T><Radio on={sel === b} />
        </Pressable>
      ))}
      </ModalBody>
      <ModalFooter><Btn title="Lanjut" full onPress={() => onPick(sel)} /></ModalFooter>
    </View>
  );
}

function NotifSheet({ close }: { close: (then?: () => void) => void }) {
  const items: [any, string, string, () => void][] = [
    [IMG.trophy0, 'Misi Aksesori tercapai', 'Credit note Rp130.000 masuk · baru saja', () => close(() => openFin('cn'))],
    [IMG.money, 'Invoice INV/0062/2026 jatuh tempo 3 hari', 'Rp10.398.000 · Net 30 · 19 Nov', () => close(() => openFin('inv'))],
    [IMG.scan, `${UNSCANNED.length} IMEI belum discan`, 'Scan untuk dapat poin & credit note', () => close(() => router.navigate('/scan'))],
  ];
  return (
    <View>
      <ModalHeader title="Notifikasi" onClose={() => close()} />
      <ModalBody style={{ paddingBottom: 16 }}>
      {items.map(([img, t, s, on], i) => (
        <Pressable key={i} onPress={on} style={{ flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow, alignItems: 'center' }}>
          <CircleIcon bg={C.infoBg}><Image source={img} style={{ width: 28, height: 28 }} /></CircleIcon>
          <Grow><T v="s2">{t}</T><T v="c1" c={C.textMed}>{s}</T></Grow>
          <Icon name="chev" size={16} color={C.icon} />
        </Pressable>
      ))}
      </ModalBody>
    </View>
  );
}

/* Figma home/perlu-tindakan row: title / coloured status line / small button */
function ActionRow({ title, sub, subColor, cta, secondary, last, onPress }: { title: string; sub: string; subColor: string; cta: string; secondary?: boolean; last?: boolean; onPress: () => void }) {
  return (
    <Row gap={12} style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: C.borderLow }}>
      <Grow style={{ gap: 2 }}><T v="s2">{title}</T><T v="c1" c={subColor}>{sub}</T></Grow>
      <Btn title={cta} size="sm" kind={secondary ? 'sec' : 'pri'} onPress={onPress} />
    </Row>
  );
}

const AMOUNT = { ...TYPE.h1, fontSize: 24, lineHeight: 28, color: C.text }; // Figma blu-headline-3

export default function Home() {
  const ins = useSafeAreaInsets();
  const store = useStore();
  const { S, cnTotal, unpaid, reset, setPopup, payInvoices, seeCN, setBrand } = store;
  const brand = BRANDS[S.brand];
  /** skeleton while the interface switches brand (Pilih brand → Lanjut) */
  const [switching, setSwitching] = useState(false);
  const { openSheet, closeSheet, toast, sheetOpen } = useOverlay();
  const focused = useIsFocused();
  useWebThemeColor(C.infoLow);

  // Credit note nudge: when the total has grown since the user last saw it, roll the
  // number up (number flow), then reveal "+Rp… telah ditambahkan". Waits until Beranda
  // is on screen and no sheet (e.g. the "misi tercapai" pop up) is covering it.
  const [shownCN, setShownCN] = useState(S.cnSeen);
  const addedIn = useAnim(S.cnAdded ? 1 : 0);
  useEffect(() => {
    if (!focused || sheetOpen || S.pendingPopup || cnTotal === S.cnSeen) return;
    // Decrease (CN used) or nothing left to animate: just sync, no nudge.
    const silent = cnTotal < S.cnSeen || shownCN === cnTotal;
    const t = setTimeout(() => { setShownCN(cnTotal); if (silent) seeCN(cnTotal); }, silent ? 0 : 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeCN is recreated each render
  }, [focused, sheetOpen, S.pendingPopup, cnTotal, S.cnSeen]);
  const onCNRolled = (from: number, to: number) => {
    if (to <= from) return;
    seeCN(to);
    hapticSuccess(); // "+Rp… telah ditambahkan" appears
    addedIn.setValue(0);
    Animated.timing(addedIn, { toValue: 1, duration: 380, delay: 80, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start();
  };
  const goReco = useGoReco();
  const scroll = useRef<ScrollViewInstance>(null);
  const recoY = useRef(0);
  const [pulse, setPulse] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // pop up "misi tercapai" after opening from the notification
  useEffect(() => {
    if (!S.pendingPopup) return;
    const t = setTimeout(() => {
      setPopup(false);
      hapticSuccess(); // credit note misi masuk
      openSheet(<MissionPopup onLater={() => closeSheet()} onUse={() => closeSheet(() => goReco())} />, { confetti: true, modal: true });
    }, 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only when the notification flag flips
  }, [S.pendingPopup]);

  // "Pakai credit note" → scroll to Produk pilihan
  useEffect(() => {
    if (!S.homeFocus.n) return;
    const t = setTimeout(() => {
      scroll.current?.scrollTo({ y: Math.max(0, recoY.current - 16), animated: true });
      setPulse(p => p + 1);
      toast(S.homeFocus.msg ?? 'Credit note Rp130.000 otomatis dipakai di checkout');
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only on each new focus request
  }, [S.homeFocus.n]);

  const overdue = unpaid.filter(i => i.st === 'over');
  const bill = unpaid.find(i => i.st === 'due');

  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow }}>
      {scrolled && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ins.top, backgroundColor: C.bg, zIndex: 5 }} />}
      <ScrollView ref={scroll} scrollEventThrottle={32} onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 30)} contentContainerStyle={{ paddingBottom: NAV_SPACE + ins.bottom + (store.units ? 64 : 0) }}>
        <LinearGradient colors={[C.infoLow, C.infoBg, C.bgLow]} locations={[0, 0.6, 1]} style={{ paddingTop: ins.top + 8, paddingHorizontal: 16, paddingBottom: 16, overflow: 'hidden' }}>
          {/* Figma header (gradient): glow/infoHigh top-left, glow/infoMed top-right */}
          <Glow color="#0072FF" cx={20} cy={20} rx={110} ry={90} opacity={0.2} />
          <Glow color="#1D8FFF" cx={50} cy={10} rx={120} ry={100} opacity={0.5} right />
          <Row gap={12}>
            <Pressable onLongPress={() => { reset(); router.replace('/'); }} delayLongPress={800}>
              <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                <LinearGradient colors={['#e1f1ff', '#f3f9ff']} style={{ position: 'absolute', width: 29.25, height: 29.25, borderRadius: 9.75 }} />
                <Image source={IMG.store} style={{ width: 36, height: 36 }} />
              </View>
            </Pressable>
            <Pressable style={{ flex: 1, gap: 2 }} onPress={() => openSheet(<BrandSheet current={S.brand} close={() => closeSheet()} onPick={b => closeSheet(() => { if (b === S.brand) return; scroll.current?.scrollTo({ y: 0, animated: false }); setSwitching(true); setBrand(b); setTimeout(() => { setSwitching(false); toast(`Akses belanja ${BRANDS[b].name}`); }, 1100); })} />)}>
              <T v="c1" c={C.textMed}>Selamat pagi,</T><Row gap={4}><T v="s1">{brand.store}</T><Icon name="chevD" size={16} color={C.icon} /></Row>
            </Pressable>
            <Pressable onPress={() => toast('Chat dengan Sales Budi belum tersedia di demo ini')} style={[{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }, shadow.default]}><Icon name="chat" /></Pressable>
            <Pressable onPress={() => openSheet(<NotifSheet close={closeSheet} />)} style={[{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }, shadow.default]}>
              <Icon name="bell" />
              <View style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' }}><T v="c2b" c="#fff">3</T></View>
            </Pressable>
          </Row>
          {switching ? <SkeletonCN /> : (<>
          <View style={{ marginTop: 16, borderRadius: 16, backgroundColor: C.bg, padding: 16 }}>
            <Pressable onPress={() => openFin('cn')}>
            <Row><Icon name="cashIn" color={C.info} /><T v="c1" c={C.textMed} style={{ flex: 1 }}>Credit note Anda</T><Link title="Riwayat" onPress={() => router.push('/cn-riwayat')} /></Row>
            <View style={{ marginTop: 12 }}>
              <NumberFlow value={shownCN} prefix="Rp" style={AMOUNT} duration={2400} continuous fadeColor={C.bg} onDone={onCNRolled} />
            </View>
            {!!S.cnAdded && (
              <Animated.View style={{ marginTop: 6, opacity: addedIn, transform: [{ translateY: addedIn.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }, { scale: addedIn.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }}>
                <Badge label={`+${rp(S.cnAdded)} telah ditambahkan`} t="green" fill md />
              </Animated.View>
            )}
            </Pressable>
            <Divider style={{ marginTop: 12 }} />
            {/* Figma entry-points: [icon + label / value] › | [icon + label / value] › */}
            <Row gap={12} style={{ marginTop: 12 }}>
              <Pressable onPress={() => router.push('/poin')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Grow style={{ gap: 2 }}>
                  <Row gap={4}><Art name="points-blibli" width={18} /><T v="c1" c={C.textMed}>Poin</T></Row>
                  <T v="s1">{fmt(S.poin)}</T>
                </Grow>
                <Icon name="chev" size={16} color={C.icon} />
              </Pressable>
              <View style={{ width: 1, height: 40, backgroundColor: C.borderLow }} />
              <Pressable onPress={() => router.push('/misi')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Grow style={{ gap: 2 }}>
                  <Row gap={4}><Icon name="mission" size={18} color={C.info} /><T v="c1" c={C.textMed}>Misi diikuti</T></Row>
                  <T v="s1">{Object.keys(MISSIONS).length} misi</T>
                </Grow>
                <Icon name="chev" size={16} color={C.icon} />
              </Pressable>
            </Row>
          </View>
          </>)}
        </LinearGradient>

        {switching ? <SkeletonHome /> : (
        <View style={{ gap: 24, paddingTop: 8 }}>
          <BannerCarousel key={S.brand} brand={S.brand} />
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <Row>
              {/* Figma: Ⓐ pi.routine-payments + warning badge, 40×40 */}
              <View style={{ width: 40, height: 40 }}>
                <Image source={IMG.routinePayments} resizeMode="cover" style={{ position: 'absolute', left: 0.25, top: 1.85, width: 39.79, height: 39.79 }} />
                <Image source={IMG.warning} style={{ position: 'absolute', left: 20.22, top: 20, width: 18.33, height: 18.33 }} />
              </View>
              <T v="s1" style={{ flex: 1 }}>Perlu tindakan</T>
              <Link title={`Lihat semua (${unpaid.length})`} onPress={() => openFin('inv')} />
            </Row>
            <Card style={{ padding: 0 }}>
              {overdue.length > 0 && (
                <ActionRow title={`${overdue.length} tagihan jatuh tempo`} sub={`Total ${short(overdue.reduce((t, i) => t + i.amt, 0))} · terlambat 4 hari`} subColor={C.danger}
                  cta="Bayar" onPress={() => { payInvoices(overdue.map(i => i.id)); router.push('/bayar'); }} />
              )}
              {bill && (
                <ActionRow title={`Bayar ${bill.id}`} sub={`${short(bill.amt)} · jatuh tempo ${dueIn(bill.due)}`} subColor={C.warn}
                  cta="Bayar" onPress={() => { payInvoices([bill.id]); router.push('/bayar'); }} />
              )}
              <ActionRow title="Scan IMEI produk yang Anda beli" sub={`Bisa dapat credit note ${short(UNSCANNED.reduce((a, id) => a + PRODUCTS[id].cn, 0))}`} subColor={C.ok} cta="Scan" secondary last onPress={() => router.navigate('/scan')} />
            </Card>
          </View>

          <View style={{ paddingHorizontal: 16 }}>
            <Performa title={<Row gap={8}><T v="s1">Ringkasan belanja Anda</T><T v="b2" c={C.textMed}>•  November 2026</T></Row>} />
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {S.brand === 'apple' ? (<>
              <Row style={{ justifyContent: 'space-between' }}><T v="s1">Misi Anda</T><Link title="Detail" onPress={() => router.push({ pathname: '/misi/[id]', params: { id: 'smart' } })} /></Row>
              <Card style={{ gap: 10 }} onPress={() => router.push({ pathname: '/misi/[id]', params: { id: 'smart' } })}>
                <Row gap={12}><TierIcon tier={MISSIONS.smart.lvl} size={32} /><Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>Tier {MISSIONS.smart.L}</T><T v="s2">{MISSIONS.smart.t}</T></Grow></Row>
                <Row gap={4} style={{ alignItems: 'baseline' }}><T v="c1">Rp{S.missions.smart}jt</T><T v="c1" c={C.textMed} style={{ flex: 1 }}>dari Rp{MISSIONS.smart.tg}jt</T>{S.missions.smart < MISSIONS.smart.tg && <T v="c1" c={C.warn}>Rp{Math.round((MISSIONS.smart.tg - S.missions.smart) * 10) / 10}jt lagi</T>}</Row>
                <Prog pct={(S.missions.smart / MISSIONS.smart.tg) * 100} color={C.infoMed} />
              </Card>
            </>) : (<>
            <Row style={{ justifyContent: 'space-between' }}><T v="s1">Misi Anda ({Object.keys(MISSIONS).length})</T><Link title="Lihat semua" onPress={() => router.push('/misi')} /></Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {(Object.keys(MISSIONS) as MissionKey[]).map(k => {
                const m = MISSIONS[k], v = S.missions[k], done = v >= m.tg;
                return (
                  <Card key={k} style={{ width: 200, gap: 10 }} onPress={() => router.push({ pathname: '/misi/[id]', params: { id: k } })}>
                    <Row gap={12}>
                      <TierIcon tier={m.lvl} size={32} />
                      <Grow style={{ gap: 2 }}><T v="c1" c={C.textMed}>Level {m.L}</T><T v="s2" numberOfLines={1}>{m.t}</T></Grow>
                    </Row>
                    <View style={{ gap: 6 }}>
                      <Row gap={12} style={{ alignItems: 'baseline' }}>
                        <Row gap={4} style={{ flex: 1, minWidth: 0 }}><T v="c1">Rp{v}jt</T><T v="c1" c={C.textMed} numberOfLines={1} style={{ flex: 1 }}>dari Rp{m.tg}jt</T></Row>
                        {!done && <T v="c1" c={C.warn}>Rp{Math.round((m.tg - v) * 10) / 10}jt lagi</T>}
                      </Row>
                      <Prog pct={(v / m.tg) * 100} color={done ? '#22a334' : C.infoMed} />
                    </View>
                  </Card>
                );
              })}
            </ScrollView>
            </>)}
          </View>

          {/* Figma section/beli-lagi */}
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}><T v="s1">Belanja lagi</T><Link title="Riwayat" onPress={() => router.navigate('/pesanan')} /></Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {brand.rebuy.map(r => <ProductCard key={r.id} p={PRODUCTS[r.id]} drop={r.drop} note={r.note} tag={false} />)}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12 }} onLayout={e => (recoY.current = e.nativeEvent.layout.y)}>
            <Row style={{ justifyContent: 'space-between' }}><T v="s1">Produk pilihan untuk Anda</T><Link title="Katalog" onPress={() => router.navigate('/katalog')} /></Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {brand.reco.map((id, i) => <ProductCard key={id} p={PRODUCTS[id]} pulseKey={i === 0 ? pulse : undefined} />)}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}><T v="s1">Laris dibeli dealer lain</T><Link title="Lihat semua" onPress={() => router.navigate('/katalog')} /></Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {brand.trending.map(t => <ProductCard key={t.id} p={PRODUCTS[t.id]} tag={!t.noTag && t.id !== 'tab'} />)}
            </ScrollView>
          </View>
        </View>
        )}
      </ScrollView>
      <CartBar />
    </View>
  );
}
