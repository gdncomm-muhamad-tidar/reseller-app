import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnim } from './useAnim';
import { hapticError, hapticLight, hapticSuccess } from './haptics';
import { C, R } from '../theme';
import { Row, T } from './index';

type Ctx = {
  /** Every sheet renders as a 🅑 BLUE 3.0 modal (no drag handle, elevation/default); build content with ui/Modal. */
  openSheet: (node: ReactNode, opts?: { confetti?: boolean; modal?: boolean }) => void;
  closeSheet: (then?: () => void) => void;
  toast: (msg: string, opts?: ToastOpts) => void;
  sheetOpen: boolean;
};
const OverlayCtx = createContext<Ctx>(null as any);
export const useOverlay = () => useContext(OverlayCtx);
/** lets non-UI code (the store) show toasts */
export type ToastOpts = { tone?: 'default' | 'ok' | 'danger'; action?: { label: string; onPress: () => void } };
export const toastBus = { toast: (_m: string, _o?: ToastOpts) => {} };
const TOAST_BG = { default: '#19222a', ok: C.okBrand, danger: C.danger } as const;

const PAL = ['#0072ff', '#ffcd00', '#1f912e', '#ebbf4f', '#1d8fff', '#d33534'];

type Piece = { rect: boolean; size: number[]; color: string; bx: number; by: number; fall: number; drift: number; rot: number; dur: number; v: Animated.Value };
/** called from an event handler (not during render) */
function makePieces(dur = 1000): Piece[] {
  const { width } = Dimensions.get('window');
  return Array.from({ length: 70 }).map((_, i) => {
    const up = Math.random() < 0.85;
    const th = up ? -Math.PI * (0.05 + 0.9 * Math.random()) : Math.PI * (0.1 + 0.8 * Math.random());
    const d = 90 + Math.random() * Math.min(230, width * 0.6);
    return {
      rect: i % 3 === 2, size: i % 3 === 2 ? [6, 12] : i % 3 ? [6, 6] : [9, 9], color: PAL[i % PAL.length],
      bx: Math.cos(th) * d * 1.1, by: Math.sin(th) * d * 1.2, fall: 260 + Math.random() * 360, drift: (Math.random() - 0.5) * 120,
      rot: Math.random() * 540 - 270, dur, v: new Animated.Value(0),
    };
  });
}

function Confetti({ ox, oy, pieces }: { ox: number; oy: number; pieces: Piece[] }) {
  useEffect(() => {
    // 1s flight: burst out with a gentle ease, then drift down and fade (no snap)
    Animated.parallel(pieces.map(p => Animated.timing(p.v, { toValue: 1, duration: p.dur, easing: Easing.out(Easing.quad), useNativeDriver: true }))).start();
  }, [pieces]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: ox - p.size[0] / 2, top: oy - p.size[1] / 2, width: p.size[0], height: p.size[1], borderRadius: p.rect ? 2 : 99, backgroundColor: p.color,
          opacity: p.v.interpolate({ inputRange: [0, 0.06, 0.7, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateX: p.v.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, p.bx, p.bx + p.drift] }) },
            { translateY: p.v.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, p.by, p.by + p.fall * 0.5] }) },
            { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] }) },
            { scale: p.v.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0.3, 1, 1] }) },
          ],
        }} />
      ))}
    </View>
  );
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const ins = useSafeAreaInsets();
  const [node, setNode] = useState<ReactNode>(null);
  const [visible, setVisible] = useState(false);
  const [confetti, setConfetti] = useState<{ pieces: Piece[]; y: number } | null>(null);
  const anim = useAnim(0);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOpts, setToastOpts] = useState<ToastOpts>({});
  const tAnim = useAnim(0);
  const tTimer = useRef<any>(null);
  const wantConfetti = useRef(false);
  const sheetH = useRef(0);

  const openSheet = useCallback((n: ReactNode, opts?: { confetti?: boolean; modal?: boolean }) => {
    setNode(n); setVisible(true); setConfetti(null); wantConfetti.current = !!opts?.confetti;
    anim.setValue(0);
    // the sheet/modal slides up from the bottom first; confetti starts once it has settled
    Animated.timing(anim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
      if (!finished || !wantConfetti.current) return;
      wantConfetti.current = false;
      const { height } = Dimensions.get('window');
      // origin: the trophy (modal header 56 + body top 4 + half of the 112 medallion)
      setConfetti({ pieces: makePieces(1000), y: height - sheetH.current + 116 });
    });
  }, [anim]);
  const closeSheet = useCallback((then?: () => void) => {
    Animated.timing(anim, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setVisible(false); setNode(null); setConfetti(null);
      if (then) setTimeout(then, 30);
    });
  }, [anim]);
  const toast = useCallback((m: string, opts?: ToastOpts) => {
    // every toast gives haptic feedback, by tone
    const tone = opts?.tone ?? (/credit note|berhasil|tercapai|terverifikasi|disetujui|masuk/i.test(m) ? 'ok' : 'default');
    if (tone === 'ok') hapticSuccess(); else if (tone === 'danger') hapticError(); else hapticLight();
    setToastMsg(m); setToastOpts(opts ?? {}); clearTimeout(tTimer.current);
    Animated.timing(tAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    tTimer.current = setTimeout(() => {
      Animated.timing(tAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setToastOpts({}));
    }, opts?.action ? 4200 : 2600);
  }, [tAnim]);
  const toastBody = (
    <Row gap={12}>
      <T v="b2" c="#fff" style={{ flex: 1 }}>{toastMsg}</T>
      {toastOpts.action && (
        <Pressable hitSlop={10} onPress={() => { const a = toastOpts.action!; clearTimeout(tTimer.current); tAnim.setValue(0); setToastOpts({}); a.onPress(); }}>
          <T v="lbl" c="#7cc0ff">{toastOpts.action.label}</T>
        </Pressable>
      )}
    </Row>
  );
  const toastBg = { backgroundColor: TOAST_BG[toastOpts.tone ?? 'default'] };

  useEffect(() => { toastBus.toast = toast; }, [toast]);
  const { height: H, width: W } = Dimensions.get('window');
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [H, 0] });

  return (
    <OverlayCtx.Provider value={{ openSheet, closeSheet, toast, sheetOpen: visible }}>
      {children}
      <Animated.View pointerEvents={toastOpts.action ? 'box-none' : 'none'} style={[st.toast, toastBg, { bottom: 104 + ins.bottom, opacity: tAnim, transform: [{ translateY: tAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
        {toastBody}
      </Animated.View>
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => closeSheet()}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim, opacity: anim }]}>
          <Pressable style={{ flex: 1 }} onPress={() => closeSheet()} />
        </Animated.View>
        <Animated.View
          onLayout={e => { sheetH.current = e.nativeEvent.layout.height; }}
          style={[st.sheet, st.modal, { paddingBottom: ins.bottom, maxHeight: H - 40, transform: [{ translateY: ty }] }]}>
          <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled">{node}</ScrollView>
        </Animated.View>
        {confetti && <Confetti ox={W / 2} oy={confetti.y} pieces={confetti.pieces} />}
        <Animated.View pointerEvents="none" style={[st.toast, toastBg, { bottom: 24 + ins.bottom, opacity: tAnim }]}>
          {toastBody}
        </Animated.View>
      </Modal>
    </OverlayCtx.Provider>
  );
}

const st = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modal: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 3 },
  toast: { position: 'absolute', left: 16, right: 16, backgroundColor: '#19222a', borderRadius: R.s, paddingVertical: 12, paddingHorizontal: 16, zIndex: 50 },
});
