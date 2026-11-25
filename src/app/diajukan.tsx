import React, { useEffect } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import Svg, { ClipPath, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useAnim } from '../ui/useAnim';
import { C, rp } from '../theme';
import { Btn, Row, T } from '../ui';
import { IMG } from '../data';
import { useStore } from '../store';
import { goTab } from '../nav';

/** Ⓐ spot.document-paper (Figma 770:30336, 150×100): tile background + document + check badge.
 *  The check spins once (360°) as it pops in. */
function DocSpot({ spin }: { spin: Animated.Value }) {
  return (
    <View style={{ width: 150, height: 100, overflow: 'hidden' }}>
      <Svg width={150} height={75} viewBox="0 0 150 75" style={{ position: 'absolute', left: 0, bottom: 12.5 }}>
        <Defs>
          <LinearGradient id="docbg" x1="75" y1="0" x2="75" y2="75" gradientUnits="userSpaceOnUse"><Stop stopColor="#E1F1FF" /><Stop offset={1} stopColor="#F3F9FF" /></LinearGradient>
          <ClipPath id="docclip"><Rect width={150} height={75} rx={14.2857} /></ClipPath>
        </Defs>
        <Rect width={150} height={75} rx={14.2857} fill="url(#docbg)" />
        <Path clipPath="url(#docclip)" d="M0 45.4423C0 45.4423 24.0119 37.5 74.7036 37.5C125.395 37.5 150 45.4423 150 45.4423V75.4464H0V45.4423Z" fill="#E1F1FF" />
      </Svg>
      <Image source={IMG.docPaper} style={{ position: 'absolute', left: 14.19, top: -15.37, width: 112.27, height: 112.27 }} />
      <Animated.View style={{ position: 'absolute', left: 70.27, top: 42.86, width: 53.57, height: 53.57, alignItems: 'center', justifyContent: 'center',
        opacity: spin.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
        transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }, { scale: spin.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.4, 1.08, 1] }) }] }}>
        <Image source={IMG.trophyCheck} style={{ width: 46, height: 46 }} />
      </Animated.View>
    </View>
  );
}

export default function Diajukan() {
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { S } = useStore();
  const o = S.orders.find(x => x.id === id) ?? S.orders[0];
  const pop = useAnim(0);
  const spin = useAnim(0);
  useEffect(() => {
    Animated.timing(pop, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(spin, { toValue: 1, duration: 800, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); // once
  }, [pop, spin]);
  const units = o ? o.items.reduce((t, c) => t + c.qty, 0) : 0;
  return (
    <View style={{ flex: 1, backgroundColor: C.bgLow, paddingTop: ins.top + 40, paddingBottom: ins.bottom + 16, paddingHorizontal: 16, alignItems: 'center', gap: 24 }}>
      {/* Figma "confirmation" */}
      <Animated.View style={{ opacity: pop, transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <DocSpot spin={spin} />
      </Animated.View>
      <View style={{ gap: 8, paddingHorizontal: 16 }}>
        <T v="t1" center>Pesanan diajukan</T>
        <T v="b2" c={C.textMed} center>Sales akan cek stok & harga produk dalam 2 hari kerja. Setelah disetujui, Anda dapat melakukan pembayaran.</T>
      </View>
      {o && (
        <View style={{ alignSelf: 'stretch', backgroundColor: C.bg, borderRadius: 8, borderWidth: 1, borderColor: '#e1e3e4', padding: 16, gap: 4 }}>
          {([['No. pesanan', o.id], ['Status', null], [`Total (${units} unit)`, rp(o.total)], ['Pembayaran', o.term === 'cbd' ? 'CBD' : `Net ${o.netDays ?? 30}`]] as const).map(([k, v]) => (
            <Row key={k} style={{ paddingVertical: 4 }}>
              <T v="b2" c={C.textMed} style={{ flex: 1 }}>{k}</T>
              {v === null
                ? <View style={{ height: 16, paddingHorizontal: 4, borderRadius: 4, backgroundColor: C.infoLow, justifyContent: 'center' }}><T v="lbl" c={C.info}>Diproses sales admin</T></View>
                : <T v="b2">{v}</T>}
            </Row>
          ))}
        </View>
      )}
      <View style={{ flex: 1 }} />
      <View style={{ alignSelf: 'stretch', gap: 8 }}>
        <Btn title="Buat pesanan lain" full onPress={() => goTab('/katalog')} />
        <Btn title="Cek status pesanan" kind="ter" full onPress={() => goTab('/pesanan')} />
      </View>
    </View>
  );
}
