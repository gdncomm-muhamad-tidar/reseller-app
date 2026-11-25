import React, { useEffect } from 'react';
import { Animated, Image, ImageSourcePropType, Platform, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, LinearGradient as SvgLinear, Path, RadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAnim } from './useAnim';
import { useStore } from '../store';
import { C, R, rp, shadow } from '../theme';
import { BANK_LOGO, BANKS, IMG, Product, TAG_LABEL, TierKey, TIER_TINT } from '../data';
import { Art, Icon, Row, T } from './index';
import { IconName } from './Icon';

/* ---------- Liquid-glass floating bottom nav ---------- */
const NAV: [string, IconName, string][] = [['home', 'home', 'Beranda'], ['katalog', 'grid', 'Katalog'], ['scan', 'scan', 'Scan IMEI'], ['pesanan', 'box', 'Pesanan'], ['finansial', 'wallet', 'Finansial']];
export function NavBar({ state, navigation }: { state: { index: number; routes: { name: string; key: string }[] }; navigation: any }) {
  const ins = useSafeAreaInsets();
  const active = state.routes[state.index]?.name;
  const inner = (
    <Row gap={0} style={{ flex: 1, padding: 4 }}>
      {NAV.map(([name, ic, label]) => {
        const on = active === name;
        const press = () => { if (!on) router.navigate(('/' + name) as any); };
        if (name === 'scan')
          return (
            <Pressable key={name} onPress={press} style={st.navBtn}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.infoMed, alignItems: 'center', justifyContent: 'center' }}><Icon name="scanNav" size={18} color="#fff" /></View>
              <T v="c2b" c={C.info}>{label}</T>
            </Pressable>
          );
        return (
          <Pressable key={name} onPress={press} style={[st.navBtn, on && { backgroundColor: C.infoLow }]}>
            <Icon name={ic} size={24} color={on ? C.info : C.textMed} />
            <T v={on ? 'c2b' : 'c2'} c={on ? C.info : C.text}>{label}</T>
          </Pressable>
        );
      })}
    </Row>
  );
  return (
    <View style={[st.nav, { bottom: 12 + Math.max(0, ins.bottom - 8) }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden' }]} />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { borderRadius: 32, backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.94)' }]} />
      {inner}
    </View>
  );
}
export const NAV_SPACE = 100;

/* ---------- Product label (Figma product-label · 🅑 badge extra-small) ---------- */
const LABEL_STYLE = {
  promo: { bg: C.bg, bd: '#b2efb9', fg: '#1c832a' },
  down: { bg: C.bg, bd: '#b2efb9', fg: '#1c832a' },
  pre: { bg: C.bg, bd: '#c8cbcd', fg: C.textMed },
  pop: { bg: C.bg, bd: '#ffbee5', fg: '#ff0f9d' },
  disc: { bg: '#ffe6e6', bd: '#fff', fg: '#d33534' },
} as const;
export function ProductLabel({ kind, label }: { kind: keyof typeof LABEL_STYLE; label: string }) {
  const s = LABEL_STYLE[kind];
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, height: 14, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: s.bd, backgroundColor: s.bg }}>
      {kind === 'down' && <Icon name="trendDown" size={12} color={s.fg} />}
      <T v="c2" c={s.fg}>{label}</T>
    </View>
  );
}
export const productTag = (p: Product) => (p.tag ? <ProductLabel kind={p.tag} label={TAG_LABEL[p.tag]} /> : null);

/* ---------- Product card (Figma product-card: 144 wide, 120 photo, CTA on the photo) ---------- */
/** "Tambah" on product cards: adds 1 unit to the cart (the floating cart bar appears) */
export function AddBtn({ id, style }: { id: string; style?: any }) {
  const { addToCart } = useStore();
  return (
    <Pressable accessibilityLabel="Tambah" hitSlop={6} onPress={() => addToCart(id, 1)} style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.92 }] }]}>
      <Icon name="plus" size={18} color={C.info} />
    </Pressable>
  );
}

/** Figma sticky_footer › floating navigation (344:20623): "Total / N produk" + inverted "Cek" → Daftar pesanan.
 *  Sits above the floating bottom nav while the cart has items. */
export function CartBar() {
  const { units } = useStore();
  const ins = useSafeAreaInsets();
  const a = useAnim(units > 0 ? 1 : 0);
  useEffect(() => { Animated.spring(a, { toValue: units > 0 ? 1 : 0, useNativeDriver: true, friction: 8 }).start(); }, [units > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!units) return null;
  return (
    <Animated.View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: 12 + Math.max(0, ins.bottom - 8) + 64 + 8, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
      <Pressable onPress={() => router.push('/keranjang')} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: C.info, ...shadow.default }}>
        <View style={{ flex: 1 }}><T v="b2" c="#fff">Total</T><T v="s2" c="#fff">{units} produk</T></View>
        <View style={{ height: 36, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: '#fff', backgroundColor: 'rgba(25,34,42,0.3)', alignItems: 'center', justifyContent: 'center' }}><T v="s2" c="#fff">Cek</T></View>
      </Pressable>
    </Animated.View>
  );
}

export function ProductCard({ p, pulseKey, width = 144, tag = true, drop, note }: { p: Product; pulseKey?: number; width?: number | `${number}%`; tag?: boolean; drop?: string; note?: string }) {
  const pulse = useAnim(0);
  useEffect(() => {
    if (!pulseKey) return;
    pulse.setValue(0);
    Animated.sequence([0, 1, 2].map(() => Animated.sequence([Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: false }), Animated.timing(pulse, { toValue: 0, duration: 450, useNativeDriver: false })]))).start();
  }, [pulseKey, pulse]);
  const bc = pulse.interpolate({ inputRange: [0, 1], outputRange: ['rgba(0,114,255,0)', 'rgba(0,114,255,0.9)'] });
  return (
    <Animated.View style={{ width: typeof width === 'number' ? width + 4 : width, margin: -2, borderRadius: R.ms + 2, borderWidth: 2, borderColor: bc }}>
      <Pressable onPress={() => router.push({ pathname: '/produk/[id]', params: { id: p.id } })} style={({ pressed }) => [{ flex: 1, backgroundColor: C.bg, borderRadius: R.ms, overflow: 'hidden' }, pressed && { opacity: 0.85 }]}>
        <View style={{ height: 120, backgroundColor: '#fff' }}>
          <Image source={p.img} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </View>
        <AddBtn id={p.id} style={st.add} />
        <View style={{ paddingTop: 10, paddingHorizontal: 12, paddingBottom: 12, gap: 4 }}>
          {drop ? <ProductLabel kind="down" label={drop} /> : tag && productTag(p)}
          <T v="c1" c={C.text} numberOfLines={2} style={{ height: 32 }}>{p.n}</T>
          <T v="s2" numberOfLines={1}>{rp(p.p)}</T>
          {!note && !!p.o && (
            <Row gap={4}><T v="c1" c={C.textMed} style={{ textDecorationLine: 'line-through' }} numberOfLines={1}>{rp(p.o)}</T><ProductLabel kind="disc" label={p.d!} /></Row>
          )}
          <T v="c1" c={!note && p.meta.includes('credit note') ? C.ok : C.textMed}>{note ?? p.meta}</T>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ---------- Tier medal (3D asset, tinted per tier) ---------- */
export function Medal({ tier, size = 40, ring }: { tier: TierKey; size?: number; ring?: boolean }) {
  const img = <Image source={IMG.medal} style={{ width: size * 0.72, height: size * 0.72, opacity: tier === 'gold' ? 1 : 0.95 }} resizeMode="contain" />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: TIER_TINT[tier], alignItems: 'center', justifyContent: 'center', borderWidth: ring ? 2 : 0, borderColor: '#fff' }}>
      {img}
    </View>
  );
}

/* ---------- 🅑 input-number.field (small, secondary): − qty + ---------- */
export function QtyField({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  return (
    <Row gap={4} style={{ width: 112, height: 36, borderWidth: 1, borderColor: '#c8cbcd', borderRadius: 8, backgroundColor: C.bg }}>
      <Pressable onPress={() => onChange(qty - 1)} accessibilityLabel="Kurangi" style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}><Icon name="minus" size={18} color={C.info} /></Pressable>
      <T v="s2" style={{ flex: 1, textAlign: 'center' }}>{qty}</T>
      <Pressable onPress={() => onChange(qty + 1)} accessibilityLabel="Tambah" style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={18} color={C.info} /></Pressable>
    </Row>
  );
}

/* ---------- 3D illustration, Figma "Ⓐ mi.* · background=true" ----------
 * 36 frame; the .Ⓐ background tile sits at inset 9.38% (radius 9.75, #e1f1ff → #f3f9ff);
 * the illustration's source image is drawn ~1.5× the frame (Figma insets ≈ −25%), centred. */
export function MiImage({ src, size = 36, scale = 1.5, bg = true }: { src: ImageSourcePropType; size?: number; scale?: number; bg?: boolean }) {
  const k = size / 36, img = size * scale;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {bg && <LinearGradient colors={['#e1f1ff', '#f3f9ff']} style={{ position: 'absolute', width: 29.25 * k, height: 29.25 * k, borderRadius: 9.75 * k }} />}
      <Image source={src} style={{ position: 'absolute', width: img, height: img }} resizeMode="contain" />
    </View>
  );
}

/* ---------- Trophy with check (Figma "Ⓐ mi.trophy": cup + check badge, transparent) ---------- */
/** Figma product-photo (cart/checkout): white bg + photo + scrim layer (renders ≈5% black → #F2F2F2) */
export function ProductPhoto({ src, size = 48 }: { src: ImageSourcePropType; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
      <Image source={src} style={{ width: size, height: size }} resizeMode="contain" />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.05)' }} />
    </View>
  );
}

/** Figma Ⓐ mi.device: phone render + screen glare (40px) */
export function MiDevice({ size = 40 }: { size?: number }) {
  const k = size / 40;
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image source={IMG.phone} style={{ position: 'absolute', left: -9.67 * k, top: -8.67 * k, width: 57 * k, height: 57 * k }} />
      <Svg width={15.1 * k} height={27.9 * k} viewBox="0 0 18.1331 33.4341" preserveAspectRatio="none" style={{ position: 'absolute', left: 12.14 * k, top: 7 * k }}>
        <Defs><SvgLinear id="glare" x1="9.41" y1="-1.57" x2="9.41" y2="31.26" gradientUnits="userSpaceOnUse"><Stop stopColor="#fff" /><Stop offset={1} stopColor="#fff" stopOpacity={0} /></SvgLinear></Defs>
        <Path d="M0 20.1994L16.0134 0L18.1331 13.6444L2.22656 33.4341L0 20.1994Z" fill="url(#glare)" />
      </Svg>
    </View>
  );
}

/** Figma "sparkle": 4-point star, #EBBF4F */
export function Sparkle({ size, x, y, color = '#EBBF4F' }: { size: number; x: number; y: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" style={{ position: 'absolute', left: x, top: y }}>
      <Path d="M7 0L8.48492 5.51508L14 7L8.48492 8.48492L7 14L5.51508 8.48492L0 7L5.51508 5.51508L7 0Z" fill={color} />
    </Svg>
  );
}

export function Trophy({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Image source={IMG.trophy0} style={{ position: 'absolute', left: 0, top: size * 0.023, width: size, height: size }} />
      <Image source={IMG.trophyCheck} style={{ position: 'absolute', left: size * 0.4844, top: size * 0.5, width: size * 0.5, height: size * 0.5 }} />
    </View>
  );
}

/* ---------- Quarter streak months (Figma quarter-streak / months) ---------- */
const MONTH_STYLE = {
  done: { bg: C.bgLow, head: C.bgMed, ink: C.text },
  now: { bg: C.infoLow, head: C.info, ink: '#fff' },
  next: { bg: C.bgLow, head: C.bgMed, ink: C.text },
  gift: { bg: '#fff8e0', head: '#feedb1', ink: C.text },
} as const;
export function Months({ nowBorder = C.infoBg, nowPct = 70 }: { nowBorder?: string; nowPct?: number } = {}) {
  const M: [string, keyof typeof MONTH_STYLE][] = [['Okt', 'done'], ['Nov', 'now'], ['Des', 'next'], ['Bonus', 'gift']];
  return (
    <Row gap={8} style={{ alignItems: 'stretch' }}>
      {M.map(([m, s]) => (
        <View key={m} style={{ flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: MONTH_STYLE[s].bg, borderWidth: s === 'now' ? 1.5 : 0, borderColor: nowBorder }}>
          <View style={{ paddingVertical: 4, alignItems: 'center', backgroundColor: MONTH_STYLE[s].head }}>
            <T v="c1" c={MONTH_STYLE[s].ink}>{m}</T>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 }}>
            {s === 'done' && <><View style={{ width: 28, height: 28, borderRadius: 16, backgroundColor: C.okBrand, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={16} color="#fff" /></View><T v="c1" c={C.ok}>Tercapai</T></>}
            {s === 'now' && <><T v="s2">{nowPct}%</T><T v="c1" c={C.textMed}>Berjalan</T></>}
            {s === 'next' && <><Image source={IMG.monthNext} style={{ width: 28, height: 28 }} /><T v="c1" c={C.textMed}>1 Des</T></>}
            {s === 'gift' && <><Icon name="gift" size={28} color="#BC6E06" /><T v="c1">CN Rp2,5jt</T></>}
          </View>
        </View>
      ))}
    </Row>
  );
}

/* ---------- Tier icon (Figma btds_ic_tier_icon) ---------- */
export function TierIcon({ tier, size = 40 }: { tier: TierKey; size?: number }) {
  const name = tier === 'gold' ? 'tier-gold' : tier === 'platinum' ? 'tier-platinum' : tier === 'infinite' ? 'tier-infinite' : 'tier-classic';
  return <Art name={name} width={size} />;
}

/* ---------- Navy header (Figma "mission/header") ----------
 * Base btrd-low #1258C9 with a #000208 layer at 75% masked by a top→bottom alpha ramp;
 * a linear alpha ramp over a flat colour is a linear colour ramp, so the whole stack is
 * this 2-stop gradient. Decorations (glow + supergraphic) go on top via <NavyGlow />. */
export const NAVY_BG = ['#1258c9', '#05183a'] as const;
export function NavyGlow() {
  return (
    <>
      <Glow color="#0072FF" cx={40} cy={30} rx={130} ry={110} opacity={0.55} />
      <View pointerEvents="none" style={{ position: 'absolute', top: -90, right: -100 }}><Art name="supergraphic" width={260} /></View>
    </>
  );
}

/* ---------- Soft glow (Figma "glow/*") ----------
 * Figma draws these as an ellipse with a 40px Gaussian blur. SVG filters aren't reliable on
 * iOS/Android/web, so this is the same ellipse as a radial gradient: pass the Figma ellipse
 * (centre, rx, ry, colour, layer opacity) and the blur; it fades out ~2σ past the edge.
 * cx is measured from the left, or from the right edge when `right` is set. */
export function Glow({ color, cx, cy, rx, ry = rx, blur = 40, opacity = 1, right }: { color: string; cx: number; cy: number; rx: number; ry?: number; blur?: number; opacity?: number; right?: boolean }) {
  const RX = rx + blur * 2, RY = ry + blur * 2, core = Math.max(0, rx - blur) / RX;
  const id = `glow-${color.replace('#', '')}-${cx}-${cy}`;
  return (
    <Svg pointerEvents="none" width={RX * 2} height={RY * 2} style={{ position: 'absolute', top: cy - RY, ...(right ? { right: cx - RX } : { left: cx - RX }) }}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset={core} stopColor={color} stopOpacity={opacity} />
          <Stop offset={1} stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={RX} cy={RY} rx={RX} ry={RY} fill={`url(#${id})`} />
    </Svg>
  );
}

export const glass = { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', borderRadius: 16 } as const;

const st = StyleSheet.create({
  nav: { position: 'absolute', left: 12, right: 12, height: 64, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)', ...shadow.med, shadowOpacity: 0.12 },
  navBtn: { flex: 1, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', gap: 2 },
  add: { position: 'absolute', right: 8, top: 76, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: C.infoMed, alignItems: 'center', justifyContent: 'center' },
});

/* ---------- Bank logo chip ---------- */
export function BankLogo({ b }: { b: string }) {
  const logo = BANK_LOGO[b];
  if (!logo) {
    const c = BANKS.find(x => x[0] === b)?.[1] ?? C.info;
    return <View style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}><T v="c2b" c="#fff">{b.slice(0, 4)}</T></View>;
  }
  const [left, top, width, height] = logo.box;
  return (
    <View style={{ width: 34, height: 34, overflow: 'hidden' }}>
      <Image source={logo.src} resizeMode={logo.fit} style={{ position: 'absolute', left, top, width, height }} />
    </View>
  );
}

