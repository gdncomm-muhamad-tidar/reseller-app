import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { C, F } from '../theme';
import { T } from './index';
import type { SalesPt } from '../data';

/*
 * "Performa belanja" line chart (Figma home/performa · chart/line-3-bulan), sized to its
 * container. Hover (web) or touch-and-drag (phone) picks the nearest month and shows a
 * tooltip with that month's value and the change vs the month before; letting go of the
 * hover returns to the default label on the latest month.
 */

const H = 132, TOP = 10, BOTTOM = 100, X0 = 44, LBL = 30, GRID = 36;

export function SalesChart({ data }: { data: SalesPt[] }) {
  const [w, setW] = useState(296);
  const [sel, setSel] = useState<number | null>(null);
  const last = data.length - 1;
  const X1 = w - 16;
  const vals = data.map(d => d.v);
  const lo = Math.floor((Math.min(...vals) - 20) / 100) * 100;
  const hi = Math.ceil((Math.max(...vals) + 20) / 100) * 100;
  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 100) ticks.push(t);
  const y = (v: number) => BOTTOM - ((v - lo) / (hi - lo)) * (BOTTOM - TOP);
  const step = last ? (X1 - X0) / last : 0;
  const x = (i: number) => (last ? X0 + i * step : (X0 + X1) / 2);
  const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)} ${y(d.v)}`).join(' ');
  const area = `${line} L${x(last)} ${BOTTOM} L${x(0)} ${BOTTOM} Z`;
  const labelEvery = data.length > 6 ? 2 : 1;

  const prev = useRef<number | null>(null);
  const pick = (px: number) => {
    const k = Math.max(0, Math.min(last, Math.round((px - X0) / (step || 1))));
    if (k !== prev.current && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    prev.current = k;
    setSel(k);
  };
  const clear = () => { prev.current = null; setSel(null); };

  const i = sel ?? last;
  const d = data[i];
  const delta = i > 0 ? Math.round(((d.v - data[i - 1].v) / data[i - 1].v) * 100) : null;
  const TW = 128;
  const tipLeft = Math.max(0, Math.min(w - TW, x(i) - TW / 2));
  const tipTop = y(d.v) - 70 < -8 ? y(d.v) + 14 : y(d.v) - 70;

  return (
    <View style={{ height: H }} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={H}>
        {ticks.map(t => (
          <React.Fragment key={t}>
            <Line x1={GRID} x2={X1 + 8} y1={y(t)} y2={y(t)} stroke={C.borderLow} />
            <SvgText x={LBL} y={y(t) + 4} fontSize={12} fontFamily={F.medium} fill={C.textMed} textAnchor="end">{`${t}jt`}</SvgText>
          </React.Fragment>
        ))}
        <Path d={area} fill={C.infoLow} opacity={0.8} />
        <Line x1={GRID} x2={X1 + 8} y1={y(avg)} y2={y(avg)} stroke={C.textMed} strokeDasharray="4 4" />
        <SvgText x={X1 + 4} y={y(avg) + 14} fontSize={12} fontFamily={F.medium} fill={C.textMed} textAnchor="end">{`Rata-rata Rp${avg}jt`}</SvgText>
        {sel !== null && <Line x1={x(i)} x2={x(i)} y1={TOP - 4} y2={BOTTOM} stroke={C.info} strokeDasharray="3 3" opacity={0.6} />}
        <Path d={line} fill="none" stroke={C.info} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((p, k) => (k === i
          ? <Circle key={k} cx={x(k)} cy={y(p.v)} r={6} fill={C.info} stroke="#fff" strokeWidth={2} />
          : <Circle key={k} cx={x(k)} cy={y(p.v)} r={4} fill="#fff" stroke={C.info} strokeWidth={2} />))}
        {sel === null && <SvgText x={x(last) - 4} y={y(data[last].v) - 10} fontSize={12} fontFamily={F.medium} fill={C.text} textAnchor="end">{`Rp${data[last].v}jt`}</SvgText>}
        {data.map((p, k) => ((last - k) % labelEvery === 0 || k === i) && (
          <SvgText key={p.s} x={x(k)} y={124} fontSize={12} fontFamily={k === i ? F.demi : F.medium} fill={k === i ? C.text : C.textMed} textAnchor="middle">{p.s}</SvgText>
        ))}
      </Svg>

      {sel !== null && (
        <View pointerEvents="none" style={[st.tip, { left: tipLeft, top: tipTop, width: TW }]}>
          <T v="c2" c="rgba(255,255,255,0.7)">{d.l}</T>
          <T v="s2" c="#fff">Rp{d.v}jt</T>
          {delta !== null && <T v="c2" c={delta >= 0 ? '#7ee08f' : '#ff9c9c'}>{delta >= 0 ? '↗' : '↘'} {Math.abs(delta)}% dari {data[i - 1].s}</T>}
        </View>
      )}

      {/* touch / hover target */}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
        onResponderGrant={e => pick(e.nativeEvent.locationX)}
        onResponderMove={e => pick(e.nativeEvent.locationX)}
        onResponderTerminationRequest={() => true}
        onResponderTerminate={clear}
        {...(Platform.OS === 'web' ? { onPointerMove: (e: any) => pick(e.nativeEvent.offsetX), onPointerLeave: clear } : {})}
      />
    </View>
  );
}

const st = StyleSheet.create({
  tip: { position: 'absolute', backgroundColor: '#19222a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 1 },
});
