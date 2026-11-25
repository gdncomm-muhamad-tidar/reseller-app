/* Magic floating button (testing / demo only): drag it anywhere, tap it to jump straight into a flow.
 * The flow list opens in the 🅑 BLUE 3.0 modal. Rendered once in the root layout, above every screen. */
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { C } from '../theme';
import { Icon, Row, T } from './index';
import { useOverlay } from './overlay';
import { ModalBody, ModalHeader } from './Modal';
import { useStore } from '../store';
import { goTab, openFin } from '../nav';

type Flow = [label: string, sub: string | null, run: () => void];

function FlowSheet({ close }: { close: (then?: () => void) => void }) {
  const st = useStore();
  const fillCart = () => {
    if (st.S.cart.length) return;
    st.addToCart('ultra', 2); st.addToCart('a56', 1); st.addToCart('buds', 1);
  };
  const go = (fn: () => void) => () => close(fn);
  // Opening tap → the browser (esp. devtools touch emulation) fires a follow-up mouse click at the same
  // spot, which would land on whichever option has just slid under the cursor. Ignore presses until the
  // sheet has settled; until then the cursor only hovers.
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 500); return () => clearTimeout(t); }, []);
  const groups: [string, Flow[]][] = [
    ['Misi & notifikasi', [
      ['Notifikasi misi tercapai', 'Lock screen → ketuk notifikasi', () => router.replace('/')],
      ['Pop up misi tercapai', 'Beranda + modal "Misi berhasil diselesaikan"', () => { st.setPopup(true); goTab('/home'); }],
      ['Halaman Misi', null, () => router.push('/misi')],
      ['Detail misi', 'Misi Loyalty Smartphone', () => router.push({ pathname: '/misi/[id]', params: { id: 'smart' } })],
      ['Poin', null, () => router.push('/poin')],
    ]],
    ['Belanja', [
      ['Beranda', null, () => goTab('/home')],
      ['Katalog', null, () => goTab('/katalog')],
      ['Daftar pesanan (keranjang)', 'Isi contoh: 2× S25 Ultra, A56, Buds3 Pro', () => { fillCart(); router.push('/keranjang'); }],
      ['Checkout', 'Keranjang otomatis terisi bila kosong', () => { fillCart(); router.push('/checkout'); }],
      ['Ketentuan kirim pesanan', 'Checkout → tekan "Ajukan pesanan"', () => { fillCart(); st.setSkipTerms(false); router.push('/checkout'); }],
      ['Pesanan diajukan', 'Halaman konfirmasi', () => router.push('/diajukan')],
    ]],
    ['Pesanan', [
      ['Riwayat pesanan', null, () => goTab('/pesanan')],
      ['Detail · Menunggu persetujuan', '#RFQ/1151', () => router.push({ pathname: '/order/[id]', params: { id: 'RFQ-1151' } })],
      ['Detail · Menunggu pembayaran', '#RFQ/1150', () => router.push({ pathname: '/order/[id]', params: { id: 'RFQ-1150' } })],
      ['Detail · Diproses', '#RFQ/1144', () => router.push({ pathname: '/order/[id]', params: { id: 'RFQ-1144' } })],
      ['Detail · Dikirim', '#RFQ/1138', () => router.push({ pathname: '/order/[id]', params: { id: 'RFQ-1138' } })],
      ['Detail · Selesai', '#RFQ/1102', () => router.push({ pathname: '/order/[id]', params: { id: 'RFQ-1102' } })],
      ['Detail · Kedaluwarsa', '#RFQ/1129', () => router.push({ pathname: '/order/[id]', params: { id: 'RFQ-1129' } })],
    ]],
    ['Pembayaran & finansial', [
      ['Pilih metode pembayaran', 'INV/0063/2026 · #RFQ/1150', () => { st.payInvoices(['INV/0063/2026']); router.push('/bayar'); }],
      ['Virtual account → Pembayaran berhasil', 'Tekan "Cek status" di halaman VA', () => { st.payInvoices(['INV/0063/2026']); st.setVA('BCA'); router.push('/va'); }],
      ['Finansial · Ringkasan', null, () => openFin('ring')],
      ['Finansial · Tagihan', null, () => openFin('inv')],
      ['Finansial · Credit note', null, () => openFin('cn')],
      ['Riwayat credit note', null, () => router.push('/cn-riwayat')],
    ]],
    ['Lainnya', [
      ['Scan IMEI', null, () => goTab('/scan')],
      ['Reset demo', 'Kembalikan semua data ke awal', () => { st.reset(); router.replace('/'); }],
    ]],
  ];
  return (
    <View>
      <ModalHeader title="Pintasan flow demo" onClose={() => close()} />
      <ModalBody style={{ gap: 16, paddingBottom: 16 }}>
        <View pointerEvents={ready ? 'auto' : 'none'} style={{ gap: 16 }}>
        {groups.map(([g, items]) => (
          <View key={g} style={{ gap: 4 }}>
            <T v="lbl" c={C.textMed}>{g.toUpperCase()}</T>
            <View style={{ borderRadius: 12, borderWidth: 1, borderColor: C.borderLow, overflow: 'hidden' }}>
              {items.map(([l, sub, run], i) => (
                <Pressable key={l} onPress={go(run)} style={({ pressed, hovered }: any) => [{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }, hovered && { backgroundColor: C.bgLow }, pressed && { backgroundColor: C.borderLow }]}>
                  <View style={{ flex: 1, gap: 2 }}><T v="b2">{l}</T>{sub && <T v="c1" c={C.textMed}>{sub}</T>}</View>
                  <Icon name="chev" size={16} color={C.icon} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        </View>
      </ModalBody>
    </View>
  );
}

const SIZE = 44, M = 8;

/** Edge-docked magic button: always snaps to the left or right edge (whichever is nearer).
 *  Drag it past the edge — or long-press it — to tuck it half away (collapse); tap a tucked button to bring it back. */
export function MagicFab() {
  const { openSheet, closeSheet, sheetOpen } = useOverlay();
  const { height } = Dimensions.get('window');
  const [pos] = useState(() => new Animated.ValueXY({ x: M, y: height - 260 }));
  const [tucked, setTucked] = useState(false);
  // drag state lives in the responder's closure (no refs read during render)
  const [pan] = useState(() => {
    let side: 'left' | 'right' = 'left', collapsed = false, sx = M, sy = height - 260, moved = false;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const xFor = () => {
      const W = Dimensions.get('window').width;
      return side === 'left' ? (collapsed ? -SIZE / 2 : M) : (collapsed ? W - SIZE / 2 : W - SIZE - M);
    };
    const settle = () => {
      sx = xFor();
      setTucked(collapsed);
      Animated.spring(pos, { toValue: { x: sx, y: sy }, useNativeDriver: false, friction: 7, tension: 60 }).start();
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        moved = false;
        hold = setTimeout(() => { if (!moved) { collapsed = !collapsed; settle(); moved = true; } }, 550); // long-press: tuck / untuck
      },
      onPanResponderMove: (_, g) => {
        if (Math.abs(g.dx) + Math.abs(g.dy) > 4) { moved = true; clearTimeout(hold); }
        pos.setValue({ x: sx + g.dx, y: sy + g.dy });
      },
      onPanResponderRelease: (_, g) => {
        clearTimeout(hold);
        const { width: W, height: H } = Dimensions.get('window');
        if (!moved) {
          if (collapsed) { collapsed = false; settle(); } // tap a tucked button → expand
          else openSheet(<FlowSheet close={closeSheet} />);
          return;
        }
        const x = sx + g.dx;
        sy = Math.min(Math.max(40, sy + g.dy), H - 60);
        side = x + SIZE / 2 < W / 2 ? 'left' : 'right';
        // dragged past the edge → tuck half of it away
        collapsed = side === 'left' ? x < M - 14 : x > W - SIZE - M + 14;
        settle();
      },
      onPanResponderTerminate: () => { clearTimeout(hold); settle(); },
    });
  });
  if (sheetOpen) return null;
  return (
    <Animated.View {...pan.panHandlers} accessibilityLabel={tucked ? 'Tampilkan pintasan flow demo' : 'Pintasan flow demo'}
      style={{ position: 'absolute', left: 0, top: 0, zIndex: 999, transform: pos.getTranslateTransform(), width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: 'rgba(25,34,42,0.25)', alignItems: 'center', justifyContent: 'center', opacity: tucked ? 0.8 : 1, userSelect: 'none', cursor: 'grab' } as any}>
      <Row gap={0}>
        <Svg width={22} height={22} viewBox="0 0 14 14"><Path d="M7 0L8.48492 5.51508L14 7L8.48492 8.48492L7 14L5.51508 8.48492L0 7L5.51508 5.51508L7 0Z" fill="#FFCD00" stroke="rgba(25,34,42,0.35)" strokeWidth={0.6} /></Svg>
      </Row>
    </Animated.View>
  );
}
