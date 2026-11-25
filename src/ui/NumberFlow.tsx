import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fmt } from '../theme';
import { useAnim } from './useAnim';

/*
 * Odometer-style number transition (in the spirit of NumberFlow):
 * changed digits spin vertically through the in-between digits — upward when the
 * value grows, downward when it shrinks — while each column eases to its new width.
 * `continuous` (like NumberFlow's continuous plugin): every digit to the right of the
 * highest changed digit also spins one extra full turn, so the change reads as counting.
 * Top/bottom edges fade into `fadeColor`.
 */

const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const STACK = [...'012345678901234567890123456789']; // three turns: change (≤9) + extra turn (10) in one direction

type Style = TextStyle & { lineHeight: number };
type Run = { from: number; to: number; n: number };

export function NumberFlow({ value, prefix = '', style, duration = 1000, continuous = false, fadeColor, onDone }: {
  value: number; prefix?: string; style: Style; duration?: number; continuous?: boolean; fadeColor?: string; onDone?: (from: number, to: number) => void;
}) {
  const lh = style.lineHeight;
  const [w, setW] = useState<number[]>([]);
  const measured = w.length === 10 && w.every(x => x > 0);
  const prev = useRef(value);
  const [run, setRun] = useState<Run>({ from: value, to: value, n: 0 });
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; }, [onDone]);

  useEffect(() => {
    if (value === prev.current) return;
    setRun(r => ({ from: prev.current, to: value, n: r.n + 1 }));
    prev.current = value;
  }, [value]);

  useEffect(() => {
    if (!run.n) return;
    const t = setTimeout(() => done.current?.(run.from, run.to), duration);
    return () => clearTimeout(t);
  }, [run, duration]);

  const to = fmt(run.to), from = fmt(run.from), trend = Math.sign(run.to - run.from);
  // highest position (from the right) whose character changed
  let hi = -1;
  for (let i = 0; i < Math.max(to.length, from.length); i++) if (to[to.length - 1 - i] !== from[from.length - 1 - i]) hi = i;
  const cols: React.ReactNode[] = [];
  for (let i = 0; i < to.length; i++) {
    const t = to[to.length - 1 - i], f = from[from.length - 1 - i];
    if (t < '0' || t > '9') cols.unshift(<Text key={'s' + i} style={style}>{t}</Text>);
    else cols.unshift(
      <Digit key={'d' + i} to={+t} from={f >= '0' && f <= '9' ? +f : null} trend={trend} extra={continuous && trend && i < hi ? 10 : 0}
        n={run.n} lh={lh} w={w} style={style} duration={duration} />,
    );
  }

  return (
    <View accessible accessibilityLabel={prefix + fmt(value)} style={{ flexDirection: 'row', height: lh }}>
      {/* hidden: measure each digit's advance width */}
      <View style={st.measure} pointerEvents="none">
        {STACK.slice(0, 10).map((d, i) => (
          <Text key={i} style={style} onLayout={e => { const x = e.nativeEvent.layout.width; setW(p => { const n = [...p]; n[i] = x; return n; }); }}>{d}</Text>
        ))}
      </View>
      <Text style={style}>{prefix}</Text>
      {measured ? cols : <Text style={style}>{to}</Text>}
      {fadeColor && (
        <>
          <LinearGradient pointerEvents="none" colors={[fadeColor, fadeColor + '00']} style={[st.fade, { top: 0, height: lh * 0.18 }]} />
          <LinearGradient pointerEvents="none" colors={[fadeColor + '00', fadeColor]} style={[st.fade, { bottom: 0, height: lh * 0.18 }]} />
        </>
      )}
    </View>
  );
}

function Digit({ to, from, trend, extra, n, lh, w, style, duration }: { to: number; from: number | null; trend: number; extra: number; n: number; lh: number; w: number[]; style: Style; duration: number }) {
  const maxW = Math.max(...w);
  const pos = useAnim(to);
  const width = useAnim(w[to]);
  const op = useAnim(1);

  useEffect(() => {
    if (!n) { width.setValue(w[to]); return; }
    let s = to, e = to;
    if (from !== null && (from !== to || extra)) {
      if (trend >= 0) { s = from; e = from + ((to - from + 10) % 10) + extra; }
      else { s = from + 20; e = s - ((from - to + 10) % 10) - extra; }
    }
    pos.setValue(s);
    width.setValue(from === null ? 0 : w[from]);
    op.setValue(from === null ? 0 : 1);
    Animated.parallel([
      Animated.timing(pos, { toValue: e, duration, easing: EASE, useNativeDriver: false }),
      Animated.timing(width, { toValue: w[to], duration, easing: EASE, useNativeDriver: false }),
      Animated.timing(op, { toValue: 1, duration: duration * 0.5, useNativeDriver: false }),
    ]).start(({ finished }) => finished && pos.setValue(to));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate once per value change
  }, [n]);

  return (
    <Animated.View style={{ width, height: lh, overflow: 'hidden', opacity: op }}>
      <Animated.View
        style={{
          position: 'absolute', width: maxW,
          left: Animated.multiply(Animated.add(width, -maxW), 0.5),
          transform: [{ translateY: Animated.multiply(pos, -lh) }],
        }}>
        {STACK.map((d, i) => <Text key={i} style={[style, { height: lh, textAlign: 'center' }]}>{d}</Text>)}
      </Animated.View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  measure: { position: 'absolute', opacity: 0, flexDirection: 'row', alignItems: 'flex-start' },
  fade: { position: 'absolute', left: 0, right: 0 },
});
