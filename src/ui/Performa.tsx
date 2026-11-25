import React, { ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { C, short } from '../theme';
import { Card, Grow, Icon, Radio, Row, T } from './index';
import { useOverlay } from './overlay';
import { ModalBody, ModalHeader } from './Modal';
import { useStore } from '../store';
import { SalesChart } from './SalesChart';
import { SALES, SALES_KPI, SALES_RANGES, SalesRange } from '../data';

/* Figma home/performa: headline, line chart (hover/tap = month detail), KPI tiles; range is selectable */
export function Performa({ title }: { title?: ReactNode }) {
  const { cnReady } = useStore();
  const { openSheet, closeSheet } = useOverlay();
  const [range, setRange] = useState<SalesRange>(3);
  const kpi = SALES_KPI[range];
  const cnShort = short(cnReady);
  const tiles: [string, string, number][] = [['Pesanan', kpi.orders[0], kpi.orders[1]], ['CN tersedia', cnShort, kpi.cnPct]];
  const pickRange = () => openSheet(
    <View>
      <ModalHeader title="Rentang waktu" onClose={() => closeSheet()} />
      <ModalBody style={{ paddingBottom: 16 }}>
      {SALES_RANGES.map((r, i) => (
        <Pressable key={r} onPress={() => closeSheet(() => setRange(r))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: C.borderLow }}>
          <Grow><T v="s2">{r} bulan terakhir</T><T v="c1" c={C.textMed}>{SALES[SALES.length - r].l.replace(' 2026', '')} – November 2026</T></Grow>
          <Radio on={r === range} />
        </Pressable>
      ))}
      </ModalBody>
    </View>,
  );
  return (
    <View style={{ gap: 12 }}>
      {title}
      <Card style={{ gap: 12 }}>
      <Row gap={6} style={{ alignItems: 'flex-end' }}>
        <Row gap={6} style={{ flex: 1, alignItems: 'flex-end' }}>
          <T v="t1">Rp{SALES[SALES.length - 1].v}jt</T>
          <Row gap={1} style={{ paddingBottom: 3 }}><Icon name="trendUp" size={16} color={C.ok} /><T v="c1" c={C.ok}>{Math.round((SALES[SALES.length - 1].v / SALES[SALES.length - 2].v - 1) * 100)}% dari Oktober</T></Row>
        </Row>
        <Pressable onPress={pickRange} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Rentang ${range} bulan, ubah`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 2 }}>
          <T v="lbl" c={C.info}>{range} bulan</T><Icon name="chevD" size={16} color={C.info} />
        </Pressable>
      </Row>
      <SalesChart key={range} data={SALES.slice(-range)} />
      <Row gap={8} style={{ alignItems: 'stretch' }}>
        {tiles.map(([l, v, pct]) => (
          <View key={l} style={{ flex: 1, minWidth: 0, backgroundColor: C.bgLow, borderRadius: 8, padding: 8, gap: 4 }}>
            <T v="c1" c={C.textMed} numberOfLines={1}>{l}</T>
            <T v="s2" numberOfLines={1}>{v}</T>
            <Row gap={1}><Icon name="arrowUp" size={16} color={C.ok} /><T v="lbl" c={C.ok}>{pct}%</T></Row>
          </View>
        ))}
      </Row>
      </Card>
    </View>
  );
}

