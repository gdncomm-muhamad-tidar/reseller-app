import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle, Image, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { C, F, R, TYPE, TypeKey, shadow } from '../theme';
import Svg, { Path } from 'react-native-svg';
import { Art, Icon, IconName } from './Icon';

export { Art, Icon };
export type { IconName };

/* ---------- Text ---------- */
type TP = TextProps & { v?: TypeKey; c?: string; style?: StyleProp<TextStyle>; children?: ReactNode; center?: boolean };
export function T({ v = 'b2', c = C.text, style, center, ...rest }: TP) {
  return <Text {...rest} style={[TYPE[v], { color: c }, center && { textAlign: 'center' }, style]} />;
}

/* ---------- Layout ---------- */
export const Row = ({ style, children, gap = 8 }: { style?: StyleProp<ViewStyle>; children?: ReactNode; gap?: number }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>
);
export const Col = ({ style, children, gap = 0 }: { style?: StyleProp<ViewStyle>; children?: ReactNode; gap?: number }) => (
  <View style={[{ gap }, style]}>{children}</View>
);
export const Grow = ({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) => <View style={[{ flex: 1, minWidth: 0 }, style]}>{children}</View>;
export const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => <View style={[{ height: 1, backgroundColor: C.borderLow }, style]} />;
export const Card = ({ children, style, onPress }: { children?: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) =>
  onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85 }]}>{children}</Pressable>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );

/* ---------- Buttons ---------- */
type BtnKind = 'pri' | 'sec' | 'ter';
export function Btn({ title, onPress, kind = 'pri', size = 'l', full, style, disabled, icon, tc }: { title: string; onPress?: () => void; kind?: BtnKind; size?: 'l' | 'sm' | 'xs'; full?: boolean; style?: StyleProp<ViewStyle>; disabled?: boolean; icon?: ReactNode; tc?: string }) {
  const h = size === 'l' ? 48 : size === 'sm' ? 36 : 28;
  const fs = size === 'l' ? 16 : size === 'sm' ? 14 : 12;
  const bg = disabled ? C.bgMed : kind === 'pri' ? C.info : kind === 'sec' ? C.bg : 'transparent';
  const col = tc ?? (disabled ? C.textLow : kind === 'pri' ? C.textInv : C.info);
  return (
    <Pressable
      disabled={disabled}
      onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress?.(); }}
      style={({ pressed }) => [
        { height: h, paddingHorizontal: size === 'l' ? 24 : size === 'sm' ? 16 : 10, borderRadius: R.circle, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
        kind === 'sec' && !disabled && { borderWidth: 1, borderColor: C.info },
        full && { alignSelf: 'stretch' },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
        style,
      ]}>
      {icon}
      <Text numberOfLines={1} style={{ fontFamily: F.demi, fontSize: fs, lineHeight: fs + 4, color: col }}>{title}</Text>
    </Pressable>
  );
}
export const Link = ({ title, onPress, style }: { title: string; onPress?: () => void; style?: StyleProp<TextStyle> }) => (
  <Pressable onPress={onPress} hitSlop={8}><T v="lbl" c={C.info} style={style}>{title}</T></Pressable>
);
export function IconBtn({ name, onPress, color = C.text, size = 24, badge }: { name: IconName; onPress?: () => void; color?: string; size?: number; badge?: number }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
      <Icon name={name} size={size} color={color} />
      {!!badge && <View style={s.dot}><T v="c2b" c="#fff">{badge}</T></View>}
    </Pressable>
  );
}

/* ---------- Badge / Chip ---------- */
export type BadgeTone = 'red' | 'green' | 'blue' | 'yellow' | 'tosca' | 'magenta' | 'grey';
const tone: Record<BadgeTone, [string, string, string]> = {
  red: [C.danger, C.dangerBorder, C.dangerLow],
  green: [C.ok, C.okBorder, C.okLow],
  blue: [C.info, C.infoBorder, C.infoLow],
  yellow: [C.warn, C.warnLow, C.warnBg],
  tosca: [C.tosca, C.toscaBorder, '#e0f7f7'],
  magenta: [C.magenta, C.magentaBorder, '#fbe8f6'],
  grey: [C.textMed, C.border, C.bgMed],
};
export function Badge({ label, t = 'blue', fill, md, style }: { label: string; t?: BadgeTone; fill?: boolean; md?: boolean; style?: StyleProp<ViewStyle> }) {
  const [fg, bd, bgc] = tone[t];
  return (
    <View style={[{ alignSelf: 'flex-start', paddingHorizontal: md ? 8 : 6, paddingVertical: md ? 2 : 1, borderRadius: 4, borderWidth: 1, borderColor: fill ? 'transparent' : bd, backgroundColor: fill ? bgc : C.bg }, style]}>
      <T v={md ? 'lbl' : 'c2b'} c={fg}>{label}</T>
    </View>
  );
}
export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && { borderColor: C.info, backgroundColor: C.infoLow }]}>
      <T v="lbl" c={on ? C.info : C.text}>{label}</T>
    </Pressable>
  );
}

/* ---------- Progress / controls ---------- */
export const Prog = ({ pct, color = C.info, style }: { pct: number; color?: string; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ height: 4, borderRadius: 2, backgroundColor: C.bgMed, overflow: 'hidden' }, style]}>
    <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
  </View>
);
export const Radio = ({ on }: { on?: boolean }) => (
  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: on ? C.info : C.border, alignItems: 'center', justifyContent: 'center' }}>
    {on && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.info }} />}
  </View>
);
/** 🅑 checkbox.mark — 18px container, radius 4, info-med fill + white tick (2px padding → 22px hit) */
export const Check = ({ on }: { on?: boolean }) => (
  <View style={{ padding: 2 }}>
    <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: on ? C.infoMed : '#c8cbcd', backgroundColor: on ? C.infoMed : C.bg, alignItems: 'center', justifyContent: 'center' }}>
      {on && <Svg width={18} height={18} viewBox="0 0 18 18" style={{ position: 'absolute', left: -1, top: -1 }}><Path d="M5.25 8.75L8.25 11.75L12.75 6.25" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" /></Svg>}
    </View>
  </View>
);
export const CircleIcon = ({ children, bg = C.infoLow, size = 40 }: { children: ReactNode; bg?: string; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
);
export const Img = ({ src, size, style }: { src: ImageSourcePropType; size: number; style?: any }) => <Image source={src} style={[{ width: size, height: size }, style]} resizeMode="contain" />;

/* ---------- Segmented & underline tabs ---------- */
/** items: [key, label, showRedDot?] — the dot is BLUE badge.notification (dot-red) */
export function Tabs({ items, value, onChange, style }: { items: [string, string, boolean?][]; value: string; onChange: (k: string) => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: C.bg, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: '#c8cbcd' }, style]}>
      {items.map(([k, l, dot]) => (
        <Pressable key={k} onPress={() => onChange(k)} style={{ flex: 1, height: 40, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Row gap={4}>
            <T v="b2" c={value === k ? C.info : C.textMed}>{l}</T>
            {dot && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4646', borderWidth: 1, borderColor: '#fff' }} />}
          </Row>
          {value === k && <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: C.info }} />}
        </Pressable>
      ))}
    </View>
  );
}

/* ---------- White page header ---------- */
export function Header({ title, right, onBack, children, noBack }: { title: string; right?: ReactNode; onBack?: () => void; children?: ReactNode; noBack?: boolean }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: C.bg, paddingTop: ins.top }}>
      <Row style={{ height: 56, paddingHorizontal: 16 }} gap={16}>
        {!noBack && <IconBtn name="back" color={C.icon} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')))} />}
        <T v="t2" style={{ flex: 1 }} numberOfLines={1}>{title}</T>
        {right}
      </Row>
      {children}
    </View>
  );
}

/* ---------- Sticky footer ---------- */
export function Footer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const ins = useSafeAreaInsets();
  return <View style={[s.foot, { paddingBottom: 16 + ins.bottom }, style]}>{children}</View>;
}

export function KV({ k, v, vc, bold }: { k: string; v: string; vc?: string; bold?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <T v="c1" c={C.textMed}>{k}</T>
      <T v={bold ? 's1' : 'c1'} c={vc ?? C.text}>{v}</T>
    </Row>
  );
}

export function Banner({ tone: t = 'info', children, right }: { tone?: 'info' | 'danger' | 'ok' | 'warn'; children: ReactNode; right?: ReactNode }) {
  const map = { info: [C.infoBg, C.infoBorder, C.info, 'info'], danger: [C.dangerLow, C.dangerBorder, C.danger, 'alert'], ok: [C.okLow, C.okBorder, C.ok, 'check'], warn: [C.warnBg, C.warnLow, C.warn, 'time'] } as const;
  const [bg, bd, fg, ic] = map[t];
  return (
    <Row style={{ padding: 12, borderRadius: R.s, backgroundColor: bg, borderWidth: 1, borderColor: bd, alignItems: 'flex-start' }}>
      <Icon name={ic} size={16} color={fg} />
      <View style={{ flex: 1 }}>{typeof children === 'string' ? <T v="c1">{children}</T> : children}</View>
      {right}
    </Row>
  );
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.bg, borderRadius: R.ms, padding: 16 },
  chip: { height: 28, paddingHorizontal: 12, borderRadius: R.circle, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  foot: { backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 16, flexDirection: 'row', alignItems: 'center', gap: 16, ...shadow.default, shadowOffset: { width: 0, height: -2 } },
  dot: { position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  screen: { flex: 1, backgroundColor: C.bgLow },
});
